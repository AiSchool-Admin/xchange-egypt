/**
 * Autonomous AI Board Jobs
 * وظائف المجلس الذاتي المجدولة
 *
 * Schedule (Africa/Cairo timezone):
 * === Core Board Functions ===
 * - 06:00 AM: Morning Intelligence Generation
 * - 10:00 AM: Strategic Morning Meeting
 * - 11:00 AM: Environment Scan (Sunday & Wednesday only)
 * - 02:00 PM: Operational Afternoon Meeting
 * - 06:00 PM: Daily Closing Report
 * - Every Hour: Approval Reminders
 *
 * === Youssef CMO - Marketing ===
 * - 07:00 AM: Daily content package
 * - 09:00 AM Saturday: Weekly marketing report
 * - 10:00 AM Sunday: Competitor analysis
 *
 * === Omar COO - Operations ===
 * - 08:00 AM Monday: Response templates update
 * - 05:00 PM: Daily operations report
 *
 * === Laila CFO - Finance ===
 * - 07:30 AM: Daily financial report
 * - 08:00 AM Friday: Runway calculation
 * - 08:00 AM 1st of month: Monthly financial analysis
 *
 * === Hana CLO - Legal ===
 * - 09:00 AM: License renewal alerts
 * - 11:00 AM Sunday: Regulatory watch
 * - 10:00 AM 1st of month: Monthly compliance report
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
  // Daily Scheduling
  scheduleDailyMeetings,
  scheduleWeeklyMeeting,
  // Youssef CMO
  generateDailyContentPackage,
  generateCompetitorAnalysis,
  generateWeeklyMarketingReport,
  // Omar COO
  generateResponseTemplates,
  generateDailyOperationsReport,
  // Laila CFO
  generateDailyFinancialReport,
  calculateRunway,
  generateMonthlyAnalysis,
  // Hana CLO
  checkLicenseRenewals,
  generateRegulatoryWatch,
  generateComplianceReport,
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

    // Schedule daily meetings after intelligence is ready
    logger.info('[AutonomousBoard] 📅 Scheduling daily meetings...');
    const meetings = await scheduleDailyMeetings();
    logger.info(`[AutonomousBoard] ✅ Scheduled ${meetings.length} meetings for today`);

    return report;
  } catch (error) {
    logger.error('[AutonomousBoard] ❌ Morning Intelligence error:', error);
    throw error;
  }
};

/**
 * Schedule Daily Meetings
 * جدولة الاجتماعات اليومية
 * Can be called manually or as part of morning intelligence
 */
export const runScheduleDailyMeetings = async () => {
  try {
    logger.info('[AutonomousBoard] 📅 Scheduling daily meetings...');
    const meetings = await scheduleDailyMeetings();
    logger.info(`[AutonomousBoard] ✅ Scheduled ${meetings.length} meetings`);
    return meetings;
  } catch (error) {
    logger.error('[AutonomousBoard] ❌ Daily scheduling error:', error);
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

// ============================================
// YOUSSEF CMO - Marketing Jobs
// ============================================

/**
 * Generate Daily Content Package
 * توليد حزمة المحتوى اليومية
 * Runs at 07:00 Cairo time
 */
export const runYoussefDailyContent = async () => {
  try {
    logger.info('[YoussefCMO] 📣 Generating daily content package...');
    const content = await generateDailyContentPackage();
    logger.info('[YoussefCMO] ✅ Daily content package generated');
    return content;
  } catch (error) {
    logger.error('[YoussefCMO] ❌ Daily content error:', error);
    throw error;
  }
};

/**
 * Generate Weekly Marketing Report
 * توليد تقرير التسويق الأسبوعي
 * Runs at 09:00 Cairo time on Saturdays
 */
export const runYoussefWeeklyReport = async () => {
  try {
    logger.info('[YoussefCMO] 📊 Generating weekly marketing report...');
    const report = await generateWeeklyMarketingReport();
    logger.info('[YoussefCMO] ✅ Weekly marketing report generated');
    return report;
  } catch (error) {
    logger.error('[YoussefCMO] ❌ Weekly report error:', error);
    throw error;
  }
};

/**
 * Generate Competitor Analysis
 * توليد تحليل المنافسين
 * Runs at 10:00 Cairo time on Sundays
 */
export const runYoussefCompetitorAnalysis = async () => {
  try {
    logger.info('[YoussefCMO] 🔍 Generating competitor analysis...');
    const analysis = await generateCompetitorAnalysis();
    logger.info('[YoussefCMO] ✅ Competitor analysis generated');
    return analysis;
  } catch (error) {
    logger.error('[YoussefCMO] ❌ Competitor analysis error:', error);
    throw error;
  }
};

// ============================================
// OMAR COO - Operations Jobs
// ============================================

/**
 * Generate Response Templates
 * توليد قوالب الردود
 * Runs at 08:00 Cairo time on Mondays
 */
export const runOmarResponseTemplates = async () => {
  try {
    logger.info('[OmarCOO] 📝 Generating response templates...');
    const categories = ['refunds', 'complaints', 'shipping'];
    for (const category of categories) {
      await generateResponseTemplates(category);
    }
    logger.info('[OmarCOO] ✅ Response templates updated');
  } catch (error) {
    logger.error('[OmarCOO] ❌ Response templates error:', error);
    throw error;
  }
};

/**
 * Generate Daily Operations Report
 * توليد تقرير العمليات اليومي
 * Runs at 17:00 Cairo time
 */
export const runOmarDailyOpsReport = async () => {
  try {
    logger.info('[OmarCOO] ⚙️ Generating daily operations report...');
    const report = await generateDailyOperationsReport();
    logger.info('[OmarCOO] ✅ Daily operations report generated');
    return report;
  } catch (error) {
    logger.error('[OmarCOO] ❌ Daily ops report error:', error);
    throw error;
  }
};

// ============================================
// LAILA CFO - Finance Jobs
// ============================================

/**
 * Generate Daily Financial Report
 * توليد التقرير المالي اليومي
 * Runs at 07:30 Cairo time
 */
export const runLailaDailyFinancialReport = async () => {
  try {
    logger.info('[LailaCFO] 💰 Generating daily financial report...');
    const report = await generateDailyFinancialReport();
    logger.info('[LailaCFO] ✅ Daily financial report generated');
    return report;
  } catch (error) {
    logger.error('[LailaCFO] ❌ Daily financial report error:', error);
    throw error;
  }
};

/**
 * Calculate Runway Analysis
 * حساب تحليل المدى الزمني
 * Runs at 08:00 Cairo time on Fridays
 */
export const runLailaRunwayAnalysis = async () => {
  try {
    logger.info('[LailaCFO] 📊 Calculating runway analysis...');
    const runway = await calculateRunway();
    logger.info('[LailaCFO] ✅ Runway analysis completed');
    return runway;
  } catch (error) {
    logger.error('[LailaCFO] ❌ Runway analysis error:', error);
    throw error;
  }
};

/**
 * Generate Monthly Financial Analysis
 * توليد التحليل المالي الشهري
 * Runs at 08:00 Cairo time on 1st of month
 */
export const runLailaMonthlyAnalysis = async () => {
  try {
    logger.info('[LailaCFO] 📈 Generating monthly financial analysis...');
    const analysis = await generateMonthlyAnalysis();
    logger.info('[LailaCFO] ✅ Monthly financial analysis generated');
    return analysis;
  } catch (error) {
    logger.error('[LailaCFO] ❌ Monthly analysis error:', error);
    throw error;
  }
};

// ============================================
// HANA CLO - Legal Jobs
// ============================================

/**
 * Check License Renewals
 * فحص تجديدات التراخيص
 * Runs at 09:00 Cairo time daily
 */
export const runHanaLicenseCheck = async () => {
  try {
    logger.info('[HanaCLO] 📋 Checking license renewals...');
    const alerts = await checkLicenseRenewals();
    if (alerts.length > 0) {
      logger.info(`[HanaCLO] ⚠️ ${alerts.length} license renewal alerts`);
    } else {
      logger.info('[HanaCLO] ✅ No license renewal alerts');
    }
    return alerts;
  } catch (error) {
    logger.error('[HanaCLO] ❌ License check error:', error);
    throw error;
  }
};

/**
 * Generate Regulatory Watch
 * توليد تقرير مراقبة اللوائح
 * Runs at 11:00 Cairo time on Sundays
 */
export const runHanaRegulatoryWatch = async () => {
  try {
    logger.info('[HanaCLO] 🔍 Generating regulatory watch...');
    const watch = await generateRegulatoryWatch();
    logger.info('[HanaCLO] ✅ Regulatory watch generated');
    return watch;
  } catch (error) {
    logger.error('[HanaCLO] ❌ Regulatory watch error:', error);
    throw error;
  }
};

/**
 * Generate Monthly Compliance Report
 * توليد تقرير الامتثال الشهري
 * Runs at 10:00 Cairo time on 1st of month
 */
export const runHanaComplianceReport = async () => {
  try {
    logger.info('[HanaCLO] ⚖️ Generating monthly compliance report...');
    const report = await generateComplianceReport();
    logger.info('[HanaCLO] ✅ Monthly compliance report generated');
    return report;
  } catch (error) {
    logger.error('[HanaCLO] ❌ Compliance report error:', error);
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

  // ============================================
  // YOUSSEF CMO - Marketing Schedule
  // ============================================

  // 07:00 AM Cairo - Daily Content Package
  cron.schedule('0 7 * * *', async () => {
    logger.info('[YoussefCMO] ⏰ Trigger: Daily Content Package (07:00)');
    await runYoussefDailyContent();
  }, {
    timezone: CAIRO_TIMEZONE
  });

  // 09:00 AM Cairo Saturday - Weekly Marketing Report
  cron.schedule('0 9 * * 6', async () => {
    logger.info('[YoussefCMO] ⏰ Trigger: Weekly Marketing Report (Saturday 09:00)');
    await runYoussefWeeklyReport();
  }, {
    timezone: CAIRO_TIMEZONE
  });

  // 10:00 AM Cairo Sunday - Competitor Analysis
  cron.schedule('0 10 * * 0', async () => {
    logger.info('[YoussefCMO] ⏰ Trigger: Competitor Analysis (Sunday 10:00)');
    await runYoussefCompetitorAnalysis();
  }, {
    timezone: CAIRO_TIMEZONE
  });

  // ============================================
  // OMAR COO - Operations Schedule
  // ============================================

  // 08:00 AM Cairo Monday - Response Templates Update
  cron.schedule('0 8 * * 1', async () => {
    logger.info('[OmarCOO] ⏰ Trigger: Response Templates Update (Monday 08:00)');
    await runOmarResponseTemplates();
  }, {
    timezone: CAIRO_TIMEZONE
  });

  // 17:00 (5 PM) Cairo - Daily Operations Report
  cron.schedule('0 17 * * *', async () => {
    logger.info('[OmarCOO] ⏰ Trigger: Daily Operations Report (17:00)');
    await runOmarDailyOpsReport();
  }, {
    timezone: CAIRO_TIMEZONE
  });

  // ============================================
  // LAILA CFO - Finance Schedule
  // ============================================

  // 07:30 AM Cairo - Daily Financial Report
  cron.schedule('30 7 * * *', async () => {
    logger.info('[LailaCFO] ⏰ Trigger: Daily Financial Report (07:30)');
    await runLailaDailyFinancialReport();
  }, {
    timezone: CAIRO_TIMEZONE
  });

  // 08:00 AM Cairo Friday - Runway Analysis
  cron.schedule('0 8 * * 5', async () => {
    logger.info('[LailaCFO] ⏰ Trigger: Runway Analysis (Friday 08:00)');
    await runLailaRunwayAnalysis();
  }, {
    timezone: CAIRO_TIMEZONE
  });

  // 08:00 AM Cairo 1st of month - Monthly Financial Analysis
  cron.schedule('0 8 1 * *', async () => {
    logger.info('[LailaCFO] ⏰ Trigger: Monthly Financial Analysis (1st 08:00)');
    await runLailaMonthlyAnalysis();
  }, {
    timezone: CAIRO_TIMEZONE
  });

  // ============================================
  // HANA CLO - Legal Schedule
  // ============================================

  // 09:00 AM Cairo - License Renewal Alerts
  cron.schedule('0 9 * * *', async () => {
    logger.info('[HanaCLO] ⏰ Trigger: License Renewal Check (09:00)');
    await runHanaLicenseCheck();
  }, {
    timezone: CAIRO_TIMEZONE
  });

  // 11:00 AM Cairo Sunday - Regulatory Watch
  cron.schedule('0 11 * * 0', async () => {
    logger.info('[HanaCLO] ⏰ Trigger: Regulatory Watch (Sunday 11:00)');
    await runHanaRegulatoryWatch();
  }, {
    timezone: CAIRO_TIMEZONE
  });

  // 10:00 AM Cairo 1st of month - Monthly Compliance Report
  cron.schedule('0 10 1 * *', async () => {
    logger.info('[HanaCLO] ⏰ Trigger: Monthly Compliance Report (1st 10:00)');
    await runHanaComplianceReport();
  }, {
    timezone: CAIRO_TIMEZONE
  });

  logger.info('[AutonomousBoard] ✅ All scheduled jobs started:');
  logger.info('  === Core Board Functions ===');
  logger.info('  - 06:00 AM: Morning Intelligence');
  logger.info('  - 10:00 AM: Strategic Meeting');
  logger.info('  - 11:00 AM: Environment Scan (Sun/Wed)');
  logger.info('  - 02:00 PM: Operational Meeting');
  logger.info('  - 06:00 PM: Daily Closing Report');
  logger.info('  - Hourly: Approval Reminders');
  logger.info('  - Every 15 min: Auto-execute decisions');
  logger.info('  === Youssef CMO - Marketing ===');
  logger.info('  - 07:00 AM: Daily Content Package');
  logger.info('  - 09:00 AM Saturday: Weekly Marketing Report');
  logger.info('  - 10:00 AM Sunday: Competitor Analysis');
  logger.info('  === Omar COO - Operations ===');
  logger.info('  - 08:00 AM Monday: Response Templates Update');
  logger.info('  - 05:00 PM: Daily Operations Report');
  logger.info('  === Laila CFO - Finance ===');
  logger.info('  - 07:30 AM: Daily Financial Report');
  logger.info('  - 08:00 AM Friday: Runway Analysis');
  logger.info('  - 08:00 AM 1st: Monthly Financial Analysis');
  logger.info('  === Hana CLO - Legal ===');
  logger.info('  - 09:00 AM: License Renewal Alerts');
  logger.info('  - 11:00 AM Sunday: Regulatory Watch');
  logger.info('  - 10:00 AM 1st: Monthly Compliance Report');
};

export default {
  startAutonomousBoardJobs,
  // Core Board
  runMorningIntelligence,
  runMorningMeeting,
  runEnvironmentScanJob,
  runAfternoonMeeting,
  runDailyClosingReport,
  runApprovalReminders,
  runAutoExecuteDecisions,
  // Youssef CMO
  runYoussefDailyContent,
  runYoussefWeeklyReport,
  runYoussefCompetitorAnalysis,
  // Omar COO
  runOmarResponseTemplates,
  runOmarDailyOpsReport,
  // Laila CFO
  runLailaDailyFinancialReport,
  runLailaRunwayAnalysis,
  runLailaMonthlyAnalysis,
  // Hana CLO
  runHanaLicenseCheck,
  runHanaRegulatoryWatch,
  runHanaComplianceReport,
};
