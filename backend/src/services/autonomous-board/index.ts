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
