/**
 * Omar COO Permissions Configuration
 * إعدادات صلاحيات عمر مدير العمليات
 */

export enum PermissionLevel {
  AUTONOMOUS = 'AUTONOMOUS',
  CEO_APPROVAL = 'CEO_APPROVAL',
  FOUNDER_APPROVAL = 'FOUNDER_APPROVAL',
}

export enum OperationsCategory {
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',
  LOGISTICS = 'LOGISTICS',
  PROCESSES = 'PROCESSES',
  QUALITY = 'QUALITY',
  VENDORS = 'VENDORS',
  REPORTING = 'REPORTING',
}

export interface OmarAction {
  action: string;
  actionAr: string;
  category: OperationsCategory;
  permissionLevel: PermissionLevel;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  budgetLimit?: number;
  examples: string[];
}

/**
 * AUTONOMOUS Actions
 */
export const AUTONOMOUS_ACTIONS: OmarAction[] = [
  {
    action: 'CREATE_RESPONSE_TEMPLATE',
    actionAr: 'إنشاء قالب رد',
    category: OperationsCategory.CUSTOMER_SERVICE,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Create customer service response templates',
    riskLevel: 'LOW',
    examples: ['FAQ response', 'Complaint template', 'Welcome message'],
  },
  {
    action: 'CREATE_SOP',
    actionAr: 'إنشاء إجراء تشغيلي',
    category: OperationsCategory.PROCESSES,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Create standard operating procedures',
    riskLevel: 'LOW',
    examples: ['Refund SOP', 'Listing review SOP', 'Dispute resolution SOP'],
  },
  {
    action: 'GENERATE_OPS_REPORT',
    actionAr: 'إنشاء تقرير العمليات',
    category: OperationsCategory.REPORTING,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Generate operations performance reports',
    riskLevel: 'LOW',
    examples: ['Daily ops report', 'Weekly KPIs', 'Monthly review'],
  },
  {
    action: 'TRACK_ORDERS',
    actionAr: 'تتبع الطلبات',
    category: OperationsCategory.LOGISTICS,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Track and analyze order fulfillment',
    riskLevel: 'LOW',
    examples: ['Order status', 'Delivery tracking', 'Fulfillment rate'],
  },
  {
    action: 'ANALYZE_SHIPPING',
    actionAr: 'تحليل الشحن',
    category: OperationsCategory.LOGISTICS,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Analyze shipping performance metrics',
    riskLevel: 'LOW',
    examples: ['Delivery times', 'Carrier performance', 'Cost analysis'],
  },
  {
    action: 'CUSTOMER_FEEDBACK_ANALYSIS',
    actionAr: 'تحليل ملاحظات العملاء',
    category: OperationsCategory.QUALITY,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Analyze customer feedback and reviews',
    riskLevel: 'LOW',
    examples: ['Sentiment analysis', 'Common issues', 'Satisfaction scores'],
  },
  {
    action: 'BOTTLENECK_ANALYSIS',
    actionAr: 'تحليل الاختناقات',
    category: OperationsCategory.PROCESSES,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Identify operational bottlenecks',
    riskLevel: 'LOW',
    examples: ['Process delays', 'Resource gaps', 'Efficiency issues'],
  },
  {
    action: 'UPDATE_FAQ',
    actionAr: 'تحديث الأسئلة الشائعة',
    category: OperationsCategory.CUSTOMER_SERVICE,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Update frequently asked questions',
    riskLevel: 'LOW',
    examples: ['Add new FAQ', 'Update answers', 'Remove outdated'],
  },
];

/**
 * CEO_APPROVAL Actions
 */
export const CEO_APPROVAL_ACTIONS: OmarAction[] = [
  {
    action: 'CHANGE_SHIPPING_PARTNER',
    actionAr: 'تغيير شريك الشحن',
    category: OperationsCategory.LOGISTICS,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Change or add shipping partners',
    riskLevel: 'MEDIUM',
    examples: ['Add Bosta', 'Switch to Aramex', 'New delivery partner'],
  },
  {
    action: 'NEW_SUPPLIER_SMALL',
    actionAr: 'مورد جديد صغير',
    category: OperationsCategory.VENDORS,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Add suppliers under 50K EGP',
    riskLevel: 'MEDIUM',
    budgetLimit: 50000,
    examples: ['Packaging supplier', 'Office supplies', 'Small vendor'],
  },
  {
    action: 'PROCESS_MODIFICATION',
    actionAr: 'تعديل العملية',
    category: OperationsCategory.PROCESSES,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Modify existing operational processes',
    riskLevel: 'MEDIUM',
    examples: ['Change workflow', 'Update procedure', 'New step added'],
  },
  {
    action: 'SLA_UPDATE',
    actionAr: 'تحديث اتفاقية مستوى الخدمة',
    category: OperationsCategory.QUALITY,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Update service level agreements',
    riskLevel: 'MEDIUM',
    examples: ['Response time SLA', 'Resolution SLA', 'Delivery SLA'],
  },
  {
    action: 'AUTOMATION_IMPLEMENTATION',
    actionAr: 'تنفيذ الأتمتة',
    category: OperationsCategory.PROCESSES,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Implement new automation workflows',
    riskLevel: 'MEDIUM',
    examples: ['Auto-response', 'Ticket routing', 'Status updates'],
  },
];

/**
 * FOUNDER_APPROVAL Actions
 */
export const FOUNDER_APPROVAL_ACTIONS: OmarAction[] = [
  {
    action: 'NEW_SUPPLIER_LARGE',
    actionAr: 'مورد جديد كبير',
    category: OperationsCategory.VENDORS,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Add suppliers over 50K EGP',
    riskLevel: 'HIGH',
    examples: ['Major vendor', 'Long-term contract', 'Strategic supplier'],
  },
  {
    action: 'WAREHOUSE_DECISION',
    actionAr: 'قرار المستودع',
    category: OperationsCategory.LOGISTICS,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Warehouse-related decisions',
    riskLevel: 'CRITICAL',
    examples: ['New warehouse', 'Warehouse closure', 'Location change'],
  },
  {
    action: 'MAJOR_PROCESS_CHANGE',
    actionAr: 'تغيير عملية رئيسي',
    category: OperationsCategory.PROCESSES,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Major process restructuring',
    riskLevel: 'HIGH',
    examples: ['Full redesign', 'New system', 'Org restructure'],
  },
  {
    action: 'OPERATIONS_HIRING',
    actionAr: 'توظيف العمليات',
    category: OperationsCategory.PROCESSES,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Hire operations staff',
    riskLevel: 'HIGH',
    examples: ['New team member', 'Manager hire', 'Team expansion'],
  },
];

export const ALL_OMAR_ACTIONS: OmarAction[] = [
  ...AUTONOMOUS_ACTIONS,
  ...CEO_APPROVAL_ACTIONS,
  ...FOUNDER_APPROVAL_ACTIONS,
];

export const getActionConfig = (action: string): OmarAction | undefined => {
  return ALL_OMAR_ACTIONS.find((a) => a.action === action);
};

export const requiresApproval = (action: string): boolean => {
  const config = getActionConfig(action);
  return config?.permissionLevel !== PermissionLevel.AUTONOMOUS;
};

export const getRequiredApprover = (action: string): 'NONE' | 'CEO' | 'FOUNDER' => {
  const config = getActionConfig(action);
  if (!config) return 'FOUNDER';
  switch (config.permissionLevel) {
    case PermissionLevel.AUTONOMOUS: return 'NONE';
    case PermissionLevel.CEO_APPROVAL: return 'CEO';
    case PermissionLevel.FOUNDER_APPROVAL: return 'FOUNDER';
    default: return 'FOUNDER';
  }
};

export default {
  AUTONOMOUS_ACTIONS,
  CEO_APPROVAL_ACTIONS,
  FOUNDER_APPROVAL_ACTIONS,
  ALL_OMAR_ACTIONS,
  getActionConfig,
  requiresApproval,
  getRequiredApprover,
};
