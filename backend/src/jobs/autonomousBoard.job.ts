/**
 * Autonomous AI Board Jobs
 * وظائف المجلس الذاتي المجدولة
 *
 * Schedule (Africa/Cairo timezone):
 * - 06:00 AM: Morning Intelligence Generation
 * - 10:00 AM: Strategic Morning Meeting
 * - 11:00 AM: Environment Scan (Sunday & Wednesday only)
 * - 02:00 PM: Operational Afternoon Meeting
 * - 06:00 PM: Daily Closing Report
 * - Every Hour: Approval Reminders
 */

import cron from 'node-cron';
import logger from '../lib/logger';

// Import autonomous board services
import {
  generateMorningIntelligence,
  runAutonomousMeeting,
  runEnvironmentScan,
  generateDailyClosingReport,
  sendApprovalReminders,
  autoExecuteType2Decisions,
} from '../services/autonomous-board';

// Cairo timezone offset (UTC+2)
const CAIRO_TIMEZONE = 'Africa/Cairo';

/**
 * Generate Morning Intelligence Report
 * توليد تقرير الاستخبارات الصباحية
 * Runs at 06:00 Cairo time
 */
export const runMorningIntelligence = async () => {
  try {
    logger.info('[AutonomousBoard] 🌅 Starting Morning Intelligence generation...');
    const report = await generateMorningIntelligence();
    logger.info('[AutonomousBoard] ✅ Morning Intelligence report generated');
    return report;
  } catch (error) {
    logger.error('[AutonomousBoard] ❌ Morning Intelligence error:', error);
    throw error;
  }
};

/**
 * Run Strategic Morning Meeting
 * تشغيل الاجتماع الاستراتيجي الصباحي
 * Runs at 10:00 Cairo time
 */
export const runMorningMeeting = async () => {
  try {
    logger.info('[AutonomousBoard] 🏛️ Starting Strategic Morning Meeting...');
    const meeting = await runAutonomousMeeting('MORNING');
    logger.info('[AutonomousBoard] ✅ Morning Meeting completed');
    return meeting;
  } catch (error) {
    logger.error('[AutonomousBoard] ❌ Morning Meeting error:', error);
    throw error;
  }
};

/**
 * Run Environment Scan
 * تشغيل المسح البيئي الخارجي
 * Runs at 11:00 Cairo time on Sundays and Wednesdays
 */
export const runEnvironmentScanJob = async () => {
  try {
    logger.info('[AutonomousBoard] 🔍 Starting Environment Scan...');
    const scan = await runEnvironmentScan();
    if (scan) {
      logger.info('[AutonomousBoard] ✅ Environment Scan completed');
    } else {
      logger.info('[AutonomousBoard] Environment scan skipped (not Sunday or Wednesday)');
    }
    return scan;
  } catch (error) {
    logger.error('[AutonomousBoard] ❌ Environment Scan error:', error);
    throw error;
  }
};

/**
 * Run Operational Afternoon Meeting
 * تشغيل الاجتماع التشغيلي بعد الظهر
 * Runs at 14:00 Cairo time
 */
export const runAfternoonMeeting = async () => {
  try {
    logger.info('[AutonomousBoard] 🏛️ Starting Operational Afternoon Meeting...');
    const meeting = await runAutonomousMeeting('AFTERNOON');
    logger.info('[AutonomousBoard] ✅ Afternoon Meeting completed');
    return meeting;
  } catch (error) {
    logger.error('[AutonomousBoard] ❌ Afternoon Meeting error:', error);
    throw error;
  }
};

/**
 * Generate Daily Closing Report
 * توليد تقرير الإغلاق اليومي
 * Runs at 18:00 Cairo time
 */
export const runDailyClosingReport = async () => {
  try {
    logger.info('[AutonomousBoard] 📊 Generating Daily Closing Report...');
    const report = await generateDailyClosingReport();
    logger.info('[AutonomousBoard] ✅ Daily Closing Report generated');
    return report;
  } catch (error) {
    logger.error('[AutonomousBoard] ❌ Daily Closing Report error:', error);
    throw error;
  }
};

/**
 * Send Approval Reminders
 * إرسال تذكيرات الموافقة
 * Runs every hour
 */
export const runApprovalReminders = async () => {
  try {
    logger.info('[AutonomousBoard] 🔔 Checking for pending approvals...');
    const reminders = await sendApprovalReminders();
    logger.info('[AutonomousBoard] ✅ Approval reminders sent');
    return reminders;
  } catch (error) {
    logger.error('[AutonomousBoard] ❌ Approval Reminder error:', error);
    throw error;
  }
};

/**
 * Check and auto-execute Type 2 decisions after 4-hour SLA
 * التحقق من القرارات التشغيلية وتنفيذها تلقائياً
 * Runs every 15 minutes
 */
export const runAutoExecuteDecisions = async () => {
  try {
    logger.info('[AutonomousBoard] ⚡ Checking for auto-executable decisions...');
    const executed = await autoExecuteType2Decisions();
    logger.info('[AutonomousBoard] ✅ Auto-execution check completed');
    return executed;
  } catch (error) {
    logger.error('[AutonomousBoard] ❌ Auto-execute error:', error);
    throw error;
  }
};

/**
 * Start all scheduled jobs
 * بدء جميع الوظائف المجدولة
 */
export const startAutonomousBoardJobs = () => {
  logger.info('[AutonomousBoard] 🚀 Starting Autonomous Board scheduled jobs...');

  // 06:00 AM Cairo - Morning Intelligence
  // Note: Cron uses server time, adjust for Cairo timezone
  cron.schedule('0 6 * * *', async () => {
    logger.info('[AutonomousBoard] ⏰ Trigger: Morning Intelligence (06:00)');
    await runMorningIntelligence();
  }, {
    timezone: CAIRO_TIMEZONE
  });

  // 10:00 AM Cairo - Strategic Morning Meeting
  cron.schedule('0 10 * * *', async () => {
    logger.info('[AutonomousBoard] ⏰ Trigger: Morning Meeting (10:00)');
    await runMorningMeeting();
  }, {
    timezone: CAIRO_TIMEZONE
  });

  // 11:00 AM Cairo - Environment Scan (Sunday & Wednesday)
  cron.schedule('0 11 * * 0,3', async () => {
    logger.info('[AutonomousBoard] ⏰ Trigger: Environment Scan (11:00)');
    await runEnvironmentScanJob();
  }, {
    timezone: CAIRO_TIMEZONE
  });

  // 14:00 (2 PM) Cairo - Operational Afternoon Meeting
  cron.schedule('0 14 * * *', async () => {
    logger.info('[AutonomousBoard] ⏰ Trigger: Afternoon Meeting (14:00)');
    await runAfternoonMeeting();
  }, {
    timezone: CAIRO_TIMEZONE
  });

  // 18:00 (6 PM) Cairo - Daily Closing Report
  cron.schedule('0 18 * * *', async () => {
    logger.info('[AutonomousBoard] ⏰ Trigger: Daily Closing Report (18:00)');
    await runDailyClosingReport();
  }, {
    timezone: CAIRO_TIMEZONE
  });

  // Every hour - Approval Reminders
  cron.schedule('0 * * * *', async () => {
    logger.info('[AutonomousBoard] ⏰ Trigger: Approval Reminders (hourly)');
    await runApprovalReminders();
  }, {
    timezone: CAIRO_TIMEZONE
  });

  // Every 15 minutes - Auto-execute Type 2 decisions
  cron.schedule('*/15 * * * *', async () => {
    logger.info('[AutonomousBoard] ⏰ Trigger: Auto-execute check (every 15 min)');
    await runAutoExecuteDecisions();
  }, {
    timezone: CAIRO_TIMEZONE
  });

  logger.info('[AutonomousBoard] ✅ All scheduled jobs started:');
  logger.info('  - 06:00 AM: Morning Intelligence');
  logger.info('  - 10:00 AM: Strategic Meeting');
  logger.info('  - 11:00 AM: Environment Scan (Sun/Wed)');
  logger.info('  - 02:00 PM: Operational Meeting');
  logger.info('  - 06:00 PM: Daily Closing Report');
  logger.info('  - Hourly: Approval Reminders');
  logger.info('  - Every 15 min: Auto-execute decisions');
};

export default {
  startAutonomousBoardJobs,
  runMorningIntelligence,
  runMorningMeeting,
  runEnvironmentScanJob,
  runAfternoonMeeting,
  runDailyClosingReport,
  runApprovalReminders,
  runAutoExecuteDecisions,
};
