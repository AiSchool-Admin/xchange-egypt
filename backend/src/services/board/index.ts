/**
 * Board Module Index
 * تصدير جميع خدمات مجلس الإدارة
 */

// Core Services
export { boardEngineService } from './board-engine.service';

// Governance Services - خدمات الحوكمة
export { meetingSchedulerService, AGENDA_TEMPLATES } from './meeting-scheduler.service';
export { kpiTrackerService, DEFAULT_KPIS } from './kpi-tracker.service';
export { alertEngineService } from './alert-engine.service';
export { decisionFrameworkService } from './decision-framework.service';

// Prompts
export * from './prompts';

// Types (re-export from local types)
export * from './board.types';
