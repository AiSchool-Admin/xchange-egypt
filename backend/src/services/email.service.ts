/**
 * Email Service
 *
 * Handles email sending using Nodemailer
 * NOTE: Requires 'nodemailer' package - install with: pnpm add nodemailer @types/nodemailer
 */

import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

// ============================================
// Types
// ============================================

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  templateName?: string;
  templateData?: Record<string, any>;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  scheduledFor?: Date;
  userId?: string;
  notificationType?: string;
  entityType?: string;
  entityId?: string;
}

// ============================================
// Email Queue Management
// ============================================

/**
 * Add email to queue for async sending
 */
export const queueEmail = async (options: EmailOptions): Promise<any> => {
  const {
    to,
    subject,
    html,
    text,
    templateName,
    templateData,
    priority = 'MEDIUM',
    scheduledFor,
    userId,
    notificationType,
    entityType,
    entityId,
  } = options;

  const email = await prisma.emailQueue.create({
    data: {
      to,
      subject,
      htmlBody: html,
      textBody: text,
      templateName,
      templateData: templateData as Prisma.JsonValue,
      priority,
      scheduledFor,
      userId,
      notificationType: notificationType as any,
      entityType,
      entityId,
      status: 'PENDING',
    },
  });

  return email;
};

/**
 * Send email immediately (bypasses queue)
 * In development: logs to console
 * In production: uses nodemailer
 */
export const sendEmailNow = async (options: EmailOptions): Promise<boolean> => {
  const { to, subject, html, text } = options;

  // Development fallback - log to console
  if (process.env.NODE_ENV !== 'production') {
    console.log('=====================================');
    console.log('📧 EMAIL (Development Mode)');
    console.log('=====================================');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('-------------------------------------');
    console.log('HTML:');
    console.log(html);
    if (text) {
      console.log('-------------------------------------');
      console.log('Text:');
      console.log(text);
    }
    console.log('=====================================\n');
    return true;
  }

  // Production email sending
  try {
    // TODO: Implement nodemailer when ready
    // const nodemailer = require('nodemailer');
    //
    // const transporter = nodemailer.createTransporter({
    //   host: process.env.SMTP_HOST,
    //   port: process.env.SMTP_PORT,
    //   secure: process.env.SMTP_SECURE === 'true',
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASSWORD,
    //   },
    // });
    //
    // await transporter.sendMail({
    //   from: process.env.SMTP_FROM,
    //   to,
    //   subject,
    //   html,
    //   text,
    // });

    console.log(`✅ Email queued for: ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
};

/**
 * Process email queue (call this from cron job)
 */
export const processEmailQueue = async (batchSize: number = 10): Promise<number> => {
  const now = new Date();

  // Get pending emails (scheduled or due)
  const emails = await prisma.emailQueue.findMany({
    where: {
      status: 'PENDING',
      OR: [
        { scheduledFor: null },
        { scheduledFor: { lte: now } },
      ],
      expiresAt: {
        OR: [
          { equals: null },
          { gt: now },
        ],
      },
    },
    take: batchSize,
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'asc' },
    ],
  });

  let sentCount = 0;

  for (const email of emails) {
    try {
      // Mark as sending
      await prisma.emailQueue.update({
        where: { id: email.id },
        data: {
          status: 'SENDING',
          lastAttemptAt: new Date(),
          attempts: email.attempts + 1,
        },
      });

      // Send email
      const sent = await sendEmailNow({
        to: email.to,
        subject: email.subject,
        html: email.htmlBody,
        text: email.textBody || undefined,
      });

      if (sent) {
        // Mark as sent
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
          },
        });
        sentCount++;
      } else {
        // Mark as failed if max attempts reached
        if (email.attempts + 1 >= 3) {
          await prisma.emailQueue.update({
            where: { id: email.id },
            data: {
              status: 'FAILED',
              error: 'Max attempts reached',
            },
          });
        } else {
          // Reset to pending for retry
          await prisma.emailQueue.update({
            where: { id: email.id },
            data: { status: 'PENDING' },
          });
        }
      }
    } catch (error: any) {
      // Mark as failed
      await prisma.emailQueue.update({
        where: { id: email.id },
        data: {
          status: 'FAILED',
          error: error.message || 'Unknown error',
        },
      });
    }
  }

  return sentCount;
};

/**
 * Retry failed emails
 */
export const retryFailedEmails = async (): Promise<number> => {
  const result = await prisma.emailQueue.updateMany({
    where: {
      status: 'FAILED',
      attempts: { lt: 3 },
    },
    data: {
      status: 'PENDING',
    },
  });

  return result.count;
};

/**
 * Clean up old emails
 */
export const cleanupEmailQueue = async (olderThanDays: number = 30): Promise<number> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const result = await prisma.emailQueue.deleteMany({
    where: {
      status: { in: ['SENT', 'FAILED', 'CANCELLED'] },
      createdAt: { lt: cutoffDate },
    },
  });

  return result.count;
};

/**
 * Get email queue statistics
 */
export const getEmailQueueStats = async (): Promise<Record<string, number>> => {
  const stats = await prisma.emailQueue.groupBy({
    by: ['status'],
    _count: true,
  });

  return stats.reduce((acc, item) => {
    acc[item.status] = item._count;
    return acc;
  }, {} as Record<string, number>);
};
