/**
 * Autonomous Board Services Index
 * فهرس خدمات المجلس الذاتي
 */

// Core Services
export { generateMorningIntelligence } from './morning-intelligence.service';
export { runAutonomousMeeting } from './autonomous-meeting.service';
export { generateMOM, formatMOMAsMarkdown, getMOMSummaryForNotification } from './mom-generator.service';
export {
  sendApprovalReminders,
  autoExecuteType2Decisions,
  processApprovalResponse,
} from './approval-workflow.service';
export { runEnvironmentScan } from './environment-scanner.service';
export { generateDailyClosingReport, formatClosingReportAsMarkdown } from './closing-report.service';

// Daily Scheduling
export {
  scheduleDailyMeetings,
  scheduleWeeklyMeeting,
  getTodaysMeetings,
} from './daily-scheduler.service';

// Intelligence & Agenda
export { generateMeetingAgenda, applyFounderOverrides } from './agenda-intelligence.service';

// Emergency Meetings
export {
  requestEmergencyMeeting,
  conveneEmergencyMeeting,
  startEmergencyMeeting,
  conductEmergencyDiscussion,
  makeEmergencyDecision,
  createEmergencyAction,
  endEmergencyMeeting,
  getSessionStatus,
  getActiveSessions,
  cancelEmergencyMeeting,
  EmergencyType,
  EmergencyStatus,
} from './emergency-meeting.service';

// Nadia CTO
export {
  createTaskFromDecision,
  generateImplementationPlan,
  requestApproval as requestNadiaApproval,
  approveTask as approveNadiaTask,
  rejectTask as rejectNadiaTask,
  executeTask as executeNadiaTask,
  getTaskStatus as getNadiaTaskStatus,
  getTasksByStatus as getNadiaTasksByStatus,
  getPendingApprovalTasks as getNadiaPendingTasks,
  getAllActiveTasks as getAllNadiaTasks,
  rollbackTask as rollbackNadiaTask,
  getDailyActivitySummary as getNadiaDailyActivity,
  getAvailableActions as getNadiaAvailableActions,
  NadiaActionStatus,
} from './nadia-cto.service';

// Youssef CMO - Marketing
export {
  generateDailyContentPackage,
  generateCompetitorAnalysis,
  generateWeeklyMarketingReport,
  generateAdCopy,
  getSeasonalCampaignSuggestions,
  getDailyActivitySummary as getYoussefDailyActivity,
  getAvailableActions as getYoussefAvailableActions,
} from './youssef-cmo.service';

// Omar COO - Operations
export {
  generateResponseTemplates,
  generateSOP,
  generateDailyOperationsReport,
  analyzeShippingPerformance,
  getDailyActivitySummary as getOmarDailyActivity,
  getAvailableActions as getOmarAvailableActions,
} from './omar-coo.service';

// Laila CFO - Finance
export {
  generateDailyFinancialReport,
  calculateRunway,
  calculateUnitEconomics,
  generateMonthlyAnalysis,
  getDailyActivitySummary as getLailaDailyActivity,
  getAvailableActions as getLailaAvailableActions,
} from './laila-cfo.service';

// Hana CLO - Legal
export {
  generateContractTemplate,
  reviewAgreement,
  generateComplianceReport,
  generateRegulatoryWatch,
  checkLicenseRenewals,
  getDailyActivitySummary as getHanaDailyActivity,
  getAvailableActions as getHanaAvailableActions,
} from './hana-clo.service';
