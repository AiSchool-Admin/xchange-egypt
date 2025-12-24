/**
 * Board Configuration Index
 * فهرس إعدادات المجلس
 */

// Board Members Configuration
export * from './board-members.config';
export * from './company-phases.config';

// Nadia CTO Permissions
export {
  PermissionLevel,
  ActionCategory as NadiaActionCategory,
  NadiaAction,
  PermissionOverride,
  AUTONOMOUS_ACTIONS as NADIA_AUTONOMOUS_ACTIONS,
  CEO_APPROVAL_ACTIONS as NADIA_CEO_APPROVAL_ACTIONS,
  FOUNDER_APPROVAL_ACTIONS as NADIA_FOUNDER_APPROVAL_ACTIONS,
  ALL_NADIA_ACTIONS,
  getActionConfig as getNadiaActionConfig,
  getActionsByPermissionLevel as getNadiaActionsByPermissionLevel,
  getActionsByCategory as getNadiaActionsByCategory,
  requiresApproval as nadiaRequiresApproval,
  getRequiredApprover as getNadiaRequiredApprover,
  PERMISSION_OVERRIDES as NADIA_PERMISSION_OVERRIDES,
} from './nadia-permissions.config';

// Youssef CMO Permissions
export {
  MarketingCategory,
  YoussefAction,
  ALL_YOUSSEF_ACTIONS,
  getActionConfig as getYoussefActionConfig,
  requiresApproval as youssefRequiresApproval,
  getRequiredApprover as getYoussefRequiredApprover,
} from './youssef-permissions.config';

// Omar COO Permissions
export {
  OperationsCategory,
  OmarAction,
  ALL_OMAR_ACTIONS,
  getActionConfig as getOmarActionConfig,
  requiresApproval as omarRequiresApproval,
  getRequiredApprover as getOmarRequiredApprover,
} from './omar-permissions.config';

// Laila CFO Permissions
export {
  FinanceCategory,
  LailaAction,
  ALL_LAILA_ACTIONS,
  getActionConfig as getLailaActionConfig,
  requiresApproval as lailaRequiresApproval,
  getRequiredApprover as getLailaRequiredApprover,
} from './laila-permissions.config';

// Hana CLO Permissions
export {
  LegalCategory,
  HanaAction,
  ALL_HANA_ACTIONS,
  getActionConfig as getHanaActionConfig,
  requiresApproval as hanaRequiresApproval,
  getRequiredApprover as getHanaRequiredApprover,
} from './hana-permissions.config';
