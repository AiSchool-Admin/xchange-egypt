/**
 * Approval Workflow Service
 * خدمة سير الموافقة
 *
 * Handles founder approval workflow:
 * - PENDING: Awaiting founder response
 * - APPROVED: Founder approved all decisions
 * - PARTIALLY_APPROVED: Some decisions approved
 * - REJECTED: Founder rejected
 * - DISCUSSION_REQUESTED: Founder wants to discuss
 *
 * SLAs:
 * - Type 2 (Operational): 4 hours, then auto-execute
 * - Type 1 (Strategic): No auto-execute, hourly reminders
 * - Critical: 15 minutes, phone notification
 */

import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
// import { sendPushNotification } from '../notification.service';
// import { sendEmail } from '../email.service';

interface Decision {
  id: string;
  type: 'TYPE_1_STRATEGIC' | 'TYPE_2_OPERATIONAL';
  title: string;
}

interface ApprovalResponse {
  momId: string;
  status: 'APPROVED' | 'PARTIALLY_APPROVED' | 'REJECTED' | 'DISCUSSION_REQUESTED';
  decisions?: {
    decisionId: string;
    approved: boolean;
    notes?: string;
  }[];
  notes?: string;
}

/**
 * Send approval notification to founder
 */
export const sendApprovalNotification = async (
  momId: string,
  type: 'INITIAL' | 'REMINDER' | 'URGENT' | 'AUTO_EXECUTE_WARNING'
) => {
  const mom = await prisma.meetingMinutes.findUnique({
    where: { id: momId },
    include: { meeting: true },
  });

  if (!mom) {
    logger.error(`[ApprovalWorkflow] MOM not found: ${momId}`);
    return;
  }

  const decisions = (mom.decisions as Decision[]) || [];
  const type1Count = decisions.filter((d) => d.type === 'TYPE_1_STRATEGIC').length;
  const type2Count = decisions.filter((d) => d.type === 'TYPE_2_OPERATIONAL').length;

  let title = '';
  let message = '';

  switch (type) {
    case 'INITIAL':
      title = `📋 ${mom.momNumber} Ready for Review`;
      message = `${mom.meeting?.title} completed. ${decisions.length} decisions await your approval.`;
      break;
    case 'REMINDER':
      title = `🔔 Reminder: ${mom.momNumber} Pending`;
      message = `You have ${type1Count} strategic decisions pending approval.`;
      break;
    case 'URGENT':
      title = `🚨 URGENT: ${mom.momNumber}`;
      message = `Critical strategic decisions require immediate attention.`;
      break;
    case 'AUTO_EXECUTE_WARNING':
      title = `⏰ Auto-Execute in 1 Hour`;
      message = `${type2Count} operational decisions will auto-execute in 1 hour if not reviewed.`;
      break;
  }

  logger.info(`[ApprovalWorkflow] Sending ${type} notification for ${mom.momNumber}`);

  // TODO: Implement actual notification sending
  // await sendPushNotification(founderId, { title, message, data: { momId } });

  // Update reminder count
  await prisma.meetingMinutes.update({
    where: { id: momId },
    data: {
      remindersSent: mom.remindersSent + 1,
      lastReminderAt: new Date(),
    },
  });
};

/**
 * Check for pending approvals and send reminders
 */
export const sendApprovalReminders = async () => {
  logger.info('[ApprovalWorkflow] Checking for pending approvals...');

  // Find MOMs pending approval
  const pendingMOMs = await prisma.meetingMinutes.findMany({
    where: {
      approvalStatus: 'PENDING',
    },
    include: { meeting: true },
  });

  let remindersSent = 0;

  for (const mom of pendingMOMs) {
    const decisions = (mom.decisions as Decision[]) || [];
    const hasStrategic = decisions.some((d) => d.type === 'TYPE_1_STRATEGIC');
    const hasOperational = decisions.some((d) => d.type === 'TYPE_2_OPERATIONAL');

    // Check if we should send reminder for strategic decisions (hourly)
    if (hasStrategic) {
      const hoursSinceCreated = (Date.now() - mom.createdAt.getTime()) / (1000 * 60 * 60);
      const hoursSinceLastReminder = mom.lastReminderAt
        ? (Date.now() - mom.lastReminderAt.getTime()) / (1000 * 60 * 60)
        : 999;

      if (hoursSinceLastReminder >= 1 && mom.remindersSent < 8) {
        await sendApprovalNotification(mom.id, 'REMINDER');
        remindersSent++;
      }

      // Urgent reminder after 4 hours
      if (hoursSinceCreated >= 4 && mom.remindersSent < 3) {
        await sendApprovalNotification(mom.id, 'URGENT');
        remindersSent++;
      }
    }

    // Check for auto-execute warning (1 hour before deadline)
    if (hasOperational && mom.approvalDeadline) {
      const timeUntilDeadline = mom.approvalDeadline.getTime() - Date.now();
      const oneHour = 60 * 60 * 1000;

      if (timeUntilDeadline > 0 && timeUntilDeadline <= oneHour) {
        const alreadyWarned = mom.lastReminderAt
          ? mom.lastReminderAt.getTime() > mom.approvalDeadline.getTime() - oneHour
          : false;

        if (!alreadyWarned) {
          await sendApprovalNotification(mom.id, 'AUTO_EXECUTE_WARNING');
          remindersSent++;
        }
      }
    }
  }

  logger.info(`[ApprovalWorkflow] Sent ${remindersSent} reminders`);
  return remindersSent;
};

/**
 * Auto-execute Type 2 decisions after SLA
 */
export const autoExecuteType2Decisions = async () => {
  logger.info('[ApprovalWorkflow] Checking for auto-executable decisions...');

  const now = new Date();

  // Find MOMs past their approval deadline
  const expiredMOMs = await prisma.meetingMinutes.findMany({
    where: {
      approvalStatus: 'PENDING',
      approvalDeadline: { lt: now },
      autoExecutedAt: null,
    },
  });

  let executed = 0;

  for (const mom of expiredMOMs) {
    const decisions = (mom.decisions as Decision[]) || [];
    const type2Decisions = decisions.filter((d) => d.type === 'TYPE_2_OPERATIONAL');

    if (type2Decisions.length > 0) {
      logger.info(`[ApprovalWorkflow] Auto-executing ${type2Decisions.length} decisions from ${mom.momNumber}`);

      // Mark as auto-executed
      await prisma.meetingMinutes.update({
        where: { id: mom.id },
        data: {
          autoExecutedAt: now,
          approvalNotes: `Auto-executed ${type2Decisions.length} Type 2 decisions after 4-hour SLA.`,
        },
      });

      // TODO: Actually execute the decisions (create action items, update systems, etc.)

      executed += type2Decisions.length;
    }
  }

  logger.info(`[ApprovalWorkflow] Auto-executed ${executed} decisions`);
  return executed;
};

/**
 * Process founder approval response
 */
export const processApprovalResponse = async (response: ApprovalResponse) => {
  logger.info(`[ApprovalWorkflow] Processing approval for ${response.momId}: ${response.status}`);

  const mom = await prisma.meetingMinutes.findUnique({
    where: { id: response.momId },
  });

  if (!mom) {
    throw new Error(`MOM not found: ${response.momId}`);
  }

  // Update MOM status
  await prisma.meetingMinutes.update({
    where: { id: response.momId },
    data: {
      approvalStatus: response.status,
      approvedAt: new Date(),
      // approvedById: founderId, // Would come from auth context
      approvalNotes: response.notes,
    },
  });

  // Handle different responses
  switch (response.status) {
    case 'APPROVED':
      logger.info(`[ApprovalWorkflow] ${mom.momNumber} fully approved`);
      // Execute all decisions
      break;

    case 'PARTIALLY_APPROVED':
      if (response.decisions) {
        const approved = response.decisions.filter((d) => d.approved);
        const rejected = response.decisions.filter((d) => !d.approved);
        logger.info(
          `[ApprovalWorkflow] ${mom.momNumber} partially approved: ${approved.length} yes, ${rejected.length} no`
        );
        // Execute only approved decisions
      }
      break;

    case 'REJECTED':
      logger.info(`[ApprovalWorkflow] ${mom.momNumber} rejected`);
      // Notify board members of rejection
      break;

    case 'DISCUSSION_REQUESTED':
      logger.info(`[ApprovalWorkflow] ${mom.momNumber} discussion requested`);
      // Schedule emergency meeting
      // await scheduleEmergencyMeeting(mom.id, response.notes);
      break;
  }

  return mom;
};

/**
 * Get pending approvals summary
 */
export const getPendingApprovalsSummary = async () => {
  const pending = await prisma.meetingMinutes.findMany({
    where: { approvalStatus: 'PENDING' },
    include: { meeting: true },
    orderBy: { createdAt: 'asc' },
  });

  return pending.map((mom) => {
    const decisions = (mom.decisions as Decision[]) || [];
    const timeRemaining = mom.approvalDeadline
      ? Math.max(0, mom.approvalDeadline.getTime() - Date.now())
      : null;

    return {
      momNumber: mom.momNumber,
      meetingTitle: mom.meeting?.title,
      createdAt: mom.createdAt,
      totalDecisions: decisions.length,
      strategicDecisions: decisions.filter((d) => d.type === 'TYPE_1_STRATEGIC').length,
      operationalDecisions: decisions.filter((d) => d.type === 'TYPE_2_OPERATIONAL').length,
      approvalDeadline: mom.approvalDeadline,
      timeRemaining: timeRemaining
        ? `${Math.floor(timeRemaining / (1000 * 60 * 60))}h ${Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))}m`
        : null,
      willAutoExecute: timeRemaining !== null && timeRemaining > 0,
      remindersSent: mom.remindersSent,
    };
  });
};

export default {
  sendApprovalNotification,
  sendApprovalReminders,
  autoExecuteType2Decisions,
  processApprovalResponse,
  getPendingApprovalsSummary,
};
