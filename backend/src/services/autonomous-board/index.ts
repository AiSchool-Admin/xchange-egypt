/**
 * Autonomous Board Services Index
 * فهرس خدمات المجلس الذاتي
 */

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
