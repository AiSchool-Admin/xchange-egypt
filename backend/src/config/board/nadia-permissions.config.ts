/**
 * Nadia CTO Permissions Configuration
 * إعدادات صلاحيات نادية المدير التقني
 *
 * Three-tier permission system:
 * 1. AUTONOMOUS - Nadia can execute without approval
 * 2. CEO_APPROVAL - Requires CEO (Karim) approval
 * 3. FOUNDER_APPROVAL - Requires founder (Eng. Mamdouh) approval
 */

export enum PermissionLevel {
  AUTONOMOUS = 'AUTONOMOUS',
  CEO_APPROVAL = 'CEO_APPROVAL',
  FOUNDER_APPROVAL = 'FOUNDER_APPROVAL',
}

export enum ActionCategory {
  CODE = 'CODE',
  DATABASE = 'DATABASE',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  SECURITY = 'SECURITY',
  DEPLOYMENT = 'DEPLOYMENT',
  DOCUMENTATION = 'DOCUMENTATION',
  TESTING = 'TESTING',
  ARCHITECTURE = 'ARCHITECTURE',
}

export interface NadiaAction {
  action: string;
  actionAr: string;
  category: ActionCategory;
  permissionLevel: PermissionLevel;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresReview: boolean;
  autoRevert: boolean; // Can be auto-reverted if issues detected
  examples: string[];
}

export interface PermissionOverride {
  condition: string;
  newLevel: PermissionLevel;
  reason: string;
}

/**
 * AUTONOMOUS Actions - نادية تنفذ مباشرة
 * These actions Nadia can perform without any approval
 */
export const AUTONOMOUS_ACTIONS: NadiaAction[] = [
  {
    action: 'READ_CODE',
    actionAr: 'قراءة الكود',
    category: ActionCategory.CODE,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Read and analyze any code in the repository',
    riskLevel: 'LOW',
    requiresReview: false,
    autoRevert: false,
    examples: ['Review file contents', 'Analyze code patterns', 'Check implementation'],
  },
  {
    action: 'RUN_TESTS',
    actionAr: 'تشغيل الاختبارات',
    category: ActionCategory.TESTING,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Execute test suites and analyze results',
    riskLevel: 'LOW',
    requiresReview: false,
    autoRevert: false,
    examples: ['npm test', 'Run unit tests', 'Integration tests'],
  },
  {
    action: 'CREATE_BRANCH',
    actionAr: 'إنشاء فرع',
    category: ActionCategory.CODE,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Create new feature branches',
    riskLevel: 'LOW',
    requiresReview: false,
    autoRevert: false,
    examples: ['git checkout -b feature/new-feature', 'Create PR branch'],
  },
  {
    action: 'WRITE_FEATURE_CODE',
    actionAr: 'كتابة كود الميزات',
    category: ActionCategory.CODE,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Write code for new features in feature branches',
    riskLevel: 'MEDIUM',
    requiresReview: true,
    autoRevert: true,
    examples: ['Implement new component', 'Add API endpoint', 'Create service'],
  },
  {
    action: 'FIX_BUGS',
    actionAr: 'إصلاح الأخطاء',
    category: ActionCategory.CODE,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Fix bugs and issues in feature branches',
    riskLevel: 'MEDIUM',
    requiresReview: true,
    autoRevert: true,
    examples: ['Debug error', 'Fix failing test', 'Resolve issue'],
  },
  {
    action: 'CREATE_PR',
    actionAr: 'إنشاء طلب دمج',
    category: ActionCategory.CODE,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Create pull requests for review',
    riskLevel: 'LOW',
    requiresReview: false,
    autoRevert: false,
    examples: ['Open PR to develop', 'Request code review'],
  },
  {
    action: 'WRITE_DOCUMENTATION',
    actionAr: 'كتابة التوثيق',
    category: ActionCategory.DOCUMENTATION,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Create and update documentation',
    riskLevel: 'LOW',
    requiresReview: false,
    autoRevert: false,
    examples: ['Update README', 'Add API docs', 'Write comments'],
  },
  {
    action: 'CODE_REVIEW',
    actionAr: 'مراجعة الكود',
    category: ActionCategory.CODE,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Review code and provide feedback',
    riskLevel: 'LOW',
    requiresReview: false,
    autoRevert: false,
    examples: ['Review PR', 'Suggest improvements', 'Check quality'],
  },
  {
    action: 'ANALYZE_PERFORMANCE',
    actionAr: 'تحليل الأداء',
    category: ActionCategory.CODE,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Analyze code performance and bottlenecks',
    riskLevel: 'LOW',
    requiresReview: false,
    autoRevert: false,
    examples: ['Profile code', 'Check bundle size', 'Memory analysis'],
  },
  {
    action: 'WRITE_TESTS',
    actionAr: 'كتابة الاختبارات',
    category: ActionCategory.TESTING,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Write unit and integration tests',
    riskLevel: 'LOW',
    requiresReview: false,
    autoRevert: false,
    examples: ['Add unit test', 'Create test suite', 'E2E tests'],
  },
];

/**
 * CEO_APPROVAL Actions - تتطلب موافقة كريم
 * These actions require CEO approval before execution
 */
export const CEO_APPROVAL_ACTIONS: NadiaAction[] = [
  {
    action: 'MERGE_TO_DEVELOP',
    actionAr: 'الدمج في فرع التطوير',
    category: ActionCategory.CODE,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Merge approved PRs to develop branch',
    riskLevel: 'MEDIUM',
    requiresReview: true,
    autoRevert: true,
    examples: ['Merge feature branch', 'Integrate changes'],
  },
  {
    action: 'ADD_DEPENDENCY',
    actionAr: 'إضافة مكتبة',
    category: ActionCategory.CODE,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Add new npm packages or dependencies',
    riskLevel: 'MEDIUM',
    requiresReview: true,
    autoRevert: true,
    examples: ['npm install package', 'Add new library'],
  },
  {
    action: 'CHANGE_ARCHITECTURE',
    actionAr: 'تغيير البنية',
    category: ActionCategory.ARCHITECTURE,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Modify system architecture or patterns',
    riskLevel: 'HIGH',
    requiresReview: true,
    autoRevert: false,
    examples: ['Change data flow', 'Refactor structure', 'New pattern'],
  },
  {
    action: 'CREATE_NEW_MODULE',
    actionAr: 'إنشاء وحدة جديدة',
    category: ActionCategory.ARCHITECTURE,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Create entirely new modules or services',
    riskLevel: 'MEDIUM',
    requiresReview: true,
    autoRevert: false,
    examples: ['New service', 'New API module', 'New component library'],
  },
  {
    action: 'DATABASE_MIGRATION_DEV',
    actionAr: 'هجرة قاعدة بيانات التطوير',
    category: ActionCategory.DATABASE,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Create and run migrations on development',
    riskLevel: 'MEDIUM',
    requiresReview: true,
    autoRevert: true,
    examples: ['Add new table', 'Modify schema', 'Add column'],
  },
  {
    action: 'API_BREAKING_CHANGE',
    actionAr: 'تغيير كسر API',
    category: ActionCategory.CODE,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Changes that break API compatibility',
    riskLevel: 'HIGH',
    requiresReview: true,
    autoRevert: false,
    examples: ['Remove endpoint', 'Change response format', 'Modify contract'],
  },
  {
    action: 'INFRASTRUCTURE_DEV',
    actionAr: 'بنية تحتية التطوير',
    category: ActionCategory.INFRASTRUCTURE,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Modify development infrastructure',
    riskLevel: 'MEDIUM',
    requiresReview: true,
    autoRevert: true,
    examples: ['Change Docker config', 'Modify CI/CD', 'Update dev environment'],
  },
  {
    action: 'REFACTOR_LARGE',
    actionAr: 'إعادة هيكلة كبيرة',
    category: ActionCategory.CODE,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Large-scale code refactoring',
    riskLevel: 'MEDIUM',
    requiresReview: true,
    autoRevert: false,
    examples: ['Restructure codebase', 'Major refactor', 'Pattern change'],
  },
];

/**
 * FOUNDER_APPROVAL Actions - تتطلب موافقة المؤسس
 * These actions MUST have founder approval before execution
 */
export const FOUNDER_APPROVAL_ACTIONS: NadiaAction[] = [
  {
    action: 'MERGE_TO_MAIN',
    actionAr: 'الدمج في الفرع الرئيسي',
    category: ActionCategory.DEPLOYMENT,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Merge to main/production branch',
    riskLevel: 'CRITICAL',
    requiresReview: true,
    autoRevert: false,
    examples: ['Release to production', 'Deploy update'],
  },
  {
    action: 'PRODUCTION_DEPLOYMENT',
    actionAr: 'النشر على الإنتاج',
    category: ActionCategory.DEPLOYMENT,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Deploy to production environment',
    riskLevel: 'CRITICAL',
    requiresReview: true,
    autoRevert: true,
    examples: ['Railway deploy', 'Production release', 'Go live'],
  },
  {
    action: 'DATABASE_MIGRATION_PROD',
    actionAr: 'هجرة قاعدة بيانات الإنتاج',
    category: ActionCategory.DATABASE,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Run migrations on production database',
    riskLevel: 'CRITICAL',
    requiresReview: true,
    autoRevert: false,
    examples: ['Migrate prod DB', 'Schema change in prod'],
  },
  {
    action: 'DATA_DELETION',
    actionAr: 'حذف البيانات',
    category: ActionCategory.DATABASE,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Delete any production data',
    riskLevel: 'CRITICAL',
    requiresReview: true,
    autoRevert: false,
    examples: ['Delete records', 'Purge data', 'Remove entries'],
  },
  {
    action: 'SECURITY_CHANGES',
    actionAr: 'تغييرات الأمان',
    category: ActionCategory.SECURITY,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Modify security configurations or access',
    riskLevel: 'CRITICAL',
    requiresReview: true,
    autoRevert: false,
    examples: ['Change auth', 'Modify permissions', 'Update security'],
  },
  {
    action: 'API_KEYS_SECRETS',
    actionAr: 'مفاتيح وأسرار API',
    category: ActionCategory.SECURITY,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Modify API keys or secrets',
    riskLevel: 'CRITICAL',
    requiresReview: true,
    autoRevert: false,
    examples: ['Rotate keys', 'Add secret', 'Change credentials'],
  },
  {
    action: 'INFRASTRUCTURE_PROD',
    actionAr: 'بنية تحتية الإنتاج',
    category: ActionCategory.INFRASTRUCTURE,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Modify production infrastructure',
    riskLevel: 'CRITICAL',
    requiresReview: true,
    autoRevert: false,
    examples: ['Scale servers', 'Change prod config', 'Modify resources'],
  },
  {
    action: 'PAYMENT_INTEGRATION',
    actionAr: 'تكامل الدفع',
    category: ActionCategory.CODE,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Modify payment processing code',
    riskLevel: 'CRITICAL',
    requiresReview: true,
    autoRevert: false,
    examples: ['Change payment flow', 'Add payment method', 'Modify checkout'],
  },
  {
    action: 'USER_DATA_ACCESS',
    actionAr: 'الوصول لبيانات المستخدمين',
    category: ActionCategory.DATABASE,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Direct access to user data',
    riskLevel: 'CRITICAL',
    requiresReview: true,
    autoRevert: false,
    examples: ['Query user data', 'Export user info', 'Access PII'],
  },
  {
    action: 'THIRD_PARTY_INTEGRATION',
    actionAr: 'تكامل طرف ثالث',
    category: ActionCategory.CODE,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Add or modify third-party integrations',
    riskLevel: 'HIGH',
    requiresReview: true,
    autoRevert: false,
    examples: ['Add external service', 'Modify integration', 'New provider'],
  },
];

/**
 * All Nadia actions combined
 */
export const ALL_NADIA_ACTIONS: NadiaAction[] = [
  ...AUTONOMOUS_ACTIONS,
  ...CEO_APPROVAL_ACTIONS,
  ...FOUNDER_APPROVAL_ACTIONS,
];

/**
 * Get action by name
 */
export const getActionConfig = (action: string): NadiaAction | undefined => {
  return ALL_NADIA_ACTIONS.find(a => a.action === action);
};

/**
 * Get actions by permission level
 */
export const getActionsByPermissionLevel = (level: PermissionLevel): NadiaAction[] => {
  return ALL_NADIA_ACTIONS.filter(a => a.permissionLevel === level);
};

/**
 * Get actions by category
 */
export const getActionsByCategory = (category: ActionCategory): NadiaAction[] => {
  return ALL_NADIA_ACTIONS.filter(a => a.category === category);
};

/**
 * Check if action requires approval
 */
export const requiresApproval = (action: string): boolean => {
  const config = getActionConfig(action);
  return config?.permissionLevel !== PermissionLevel.AUTONOMOUS;
};

/**
 * Get required approver for action
 */
export const getRequiredApprover = (action: string): 'NONE' | 'CEO' | 'FOUNDER' => {
  const config = getActionConfig(action);
  if (!config) return 'FOUNDER'; // Default to highest level for unknown actions

  switch (config.permissionLevel) {
    case PermissionLevel.AUTONOMOUS:
      return 'NONE';
    case PermissionLevel.CEO_APPROVAL:
      return 'CEO';
    case PermissionLevel.FOUNDER_APPROVAL:
      return 'FOUNDER';
    default:
      return 'FOUNDER';
  }
};

/**
 * Permission overrides based on conditions
 */
export const PERMISSION_OVERRIDES: PermissionOverride[] = [
  {
    condition: 'EMERGENCY_HOTFIX',
    newLevel: PermissionLevel.CEO_APPROVAL,
    reason: 'Emergency hotfixes can be expedited with CEO approval only',
  },
  {
    condition: 'SECURITY_INCIDENT',
    newLevel: PermissionLevel.CEO_APPROVAL,
    reason: 'Security incidents require faster response',
  },
  {
    condition: 'FOUNDER_UNAVAILABLE_24H',
    newLevel: PermissionLevel.CEO_APPROVAL,
    reason: 'If founder unavailable for 24h, CEO can approve critical items',
  },
];

export default {
  AUTONOMOUS_ACTIONS,
  CEO_APPROVAL_ACTIONS,
  FOUNDER_APPROVAL_ACTIONS,
  ALL_NADIA_ACTIONS,
  PERMISSION_OVERRIDES,
  getActionConfig,
  getActionsByPermissionLevel,
  getActionsByCategory,
  requiresApproval,
  getRequiredApprover,
};
