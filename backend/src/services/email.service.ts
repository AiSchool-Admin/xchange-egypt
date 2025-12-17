/**
 * Email Service
 *
 * Handles email sending using Nodemailer
 */

import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import nodemailer from 'nodemailer';

// Email transporter (initialized lazily)
let transporter: nodemailer.Transporter | null = null;

/**
 * Get or create email transporter
 */
const getTransporter = (): nodemailer.Transporter | null => {
  if (transporter) return transporter;

  // Check if SMTP credentials are configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('SMTP credentials not configured, emails will be logged to console');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return transporter;
};

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
 * Uses nodemailer if configured, otherwise logs to console
 */
export const sendEmailNow = async (options: EmailOptions): Promise<boolean> => {
  const { to, subject, html, text } = options;

  const emailTransporter = getTransporter();

  // If no transporter or in development without SMTP, log to console
  if (!emailTransporter || process.env.NODE_ENV !== 'production') {
    console.log('=====================================');
    console.log('📧 EMAIL ' + (process.env.NODE_ENV !== 'production' ? '(Development Mode)' : '(SMTP Not Configured)'));
    console.log('=====================================');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('-------------------------------------');
    console.log('HTML Preview:', html.substring(0, 500) + (html.length > 500 ? '...' : ''));
    console.log('=====================================\n');

    // In development, return true to simulate success
    if (process.env.NODE_ENV !== 'production') {
      return true;
    }

    // In production without SMTP config, log warning but don't fail
    console.warn('⚠️ SMTP not configured - email not sent to:', to);
    return false;
  }

  // Production email sending with nodemailer
  try {
    const info = await emailTransporter.sendMail({
      from: process.env.SMTP_FROM || `"Xchange Egypt" <noreply@xchange.eg>`,
      to,
      subject,
      html,
      text: text || undefined,
    });

    console.log(`✅ Email sent successfully to ${to}, messageId: ${info.messageId}`);
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
      AND: [
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } },
          ],
        },
      ],
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
