/**
 * Laila CFO Permissions Configuration
 * إعدادات صلاحيات ليلى المدير المالي
 */

export enum PermissionLevel {
  AUTONOMOUS = 'AUTONOMOUS',
  CEO_APPROVAL = 'CEO_APPROVAL',
  FOUNDER_APPROVAL = 'FOUNDER_APPROVAL',
}

export enum FinanceCategory {
  REPORTING = 'REPORTING',
  ANALYSIS = 'ANALYSIS',
  BUDGETING = 'BUDGETING',
  PAYMENTS = 'PAYMENTS',
  FORECASTING = 'FORECASTING',
  COMPLIANCE = 'COMPLIANCE',
}

export interface LailaAction {
  action: string;
  actionAr: string;
  category: FinanceCategory;
  permissionLevel: PermissionLevel;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  budgetLimit?: number;
  examples: string[];
}

/**
 * AUTONOMOUS Actions
 */
export const AUTONOMOUS_ACTIONS: LailaAction[] = [
  {
    action: 'GENERATE_FINANCIAL_REPORT',
    actionAr: 'إنشاء تقرير مالي',
    category: FinanceCategory.REPORTING,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Generate financial reports and dashboards',
    riskLevel: 'LOW',
    examples: ['Daily P&L', 'Weekly summary', 'Monthly report'],
  },
  {
    action: 'CALCULATE_UNIT_ECONOMICS',
    actionAr: 'حساب اقتصاديات الوحدة',
    category: FinanceCategory.ANALYSIS,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Calculate and analyze unit economics',
    riskLevel: 'LOW',
    examples: ['CAC calculation', 'LTV analysis', 'Margin analysis'],
  },
  {
    action: 'RUNWAY_CALCULATION',
    actionAr: 'حساب المدى الزمني',
    category: FinanceCategory.FORECASTING,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Calculate runway and burn rate',
    riskLevel: 'LOW',
    examples: ['Runway months', 'Burn rate', 'Cash projection'],
  },
  {
    action: 'REVENUE_FORECAST',
    actionAr: 'توقع الإيرادات',
    category: FinanceCategory.FORECASTING,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Generate revenue forecasts',
    riskLevel: 'LOW',
    examples: ['Monthly forecast', 'Quarterly projection', 'Annual budget'],
  },
  {
    action: 'COST_ANALYSIS',
    actionAr: 'تحليل التكاليف',
    category: FinanceCategory.ANALYSIS,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Analyze cost structures and efficiency',
    riskLevel: 'LOW',
    examples: ['Cost breakdown', 'Efficiency analysis', 'Cost trends'],
  },
  {
    action: 'CREATE_INVOICE',
    actionAr: 'إنشاء فاتورة',
    category: FinanceCategory.PAYMENTS,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Create and send invoices',
    riskLevel: 'LOW',
    examples: ['Customer invoice', 'Partner invoice', 'Service invoice'],
  },
  {
    action: 'CASH_FLOW_MONITORING',
    actionAr: 'مراقبة التدفق النقدي',
    category: FinanceCategory.REPORTING,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Monitor and report cash flow',
    riskLevel: 'LOW',
    examples: ['Daily cash position', 'Inflows/outflows', 'Cash alerts'],
  },
  {
    action: 'BUDGET_TRACKING',
    actionAr: 'تتبع الميزانية',
    category: FinanceCategory.BUDGETING,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Track budget vs actual spending',
    riskLevel: 'LOW',
    examples: ['Department budgets', 'Project costs', 'Variance analysis'],
  },
  {
    action: 'KPI_DASHBOARD',
    actionAr: 'لوحة المؤشرات',
    category: FinanceCategory.REPORTING,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Maintain financial KPI dashboard',
    riskLevel: 'LOW',
    examples: ['GMV tracking', 'Revenue metrics', 'Profitability KPIs'],
  },
];

/**
 * CEO_APPROVAL Actions
 */
export const CEO_APPROVAL_ACTIONS: LailaAction[] = [
  {
    action: 'EXPENSE_SMALL',
    actionAr: 'مصروف صغير',
    category: FinanceCategory.PAYMENTS,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Approve expenses under 5K EGP',
    riskLevel: 'MEDIUM',
    budgetLimit: 5000,
    examples: ['Office supplies', 'Software subscription', 'Minor purchases'],
  },
  {
    action: 'PAYMENT_TERMS_CHANGE',
    actionAr: 'تغيير شروط الدفع',
    category: FinanceCategory.PAYMENTS,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Modify payment terms with vendors',
    riskLevel: 'MEDIUM',
    examples: ['Extended payment', 'Early payment discount', 'New terms'],
  },
  {
    action: 'VENDOR_PAYMENT',
    actionAr: 'دفع المورد',
    category: FinanceCategory.PAYMENTS,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Process vendor payments under 5K',
    riskLevel: 'MEDIUM',
    budgetLimit: 5000,
    examples: ['Service payment', 'Supplier payment', 'Contractor payment'],
  },
  {
    action: 'REFUND_SMALL',
    actionAr: 'استرداد صغير',
    category: FinanceCategory.PAYMENTS,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Process refunds under 5K EGP',
    riskLevel: 'MEDIUM',
    budgetLimit: 5000,
    examples: ['Customer refund', 'Partial refund', 'Goodwill credit'],
  },
  {
    action: 'BUDGET_REALLOCATION',
    actionAr: 'إعادة توزيع الميزانية',
    category: FinanceCategory.BUDGETING,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Reallocate budget between departments',
    riskLevel: 'MEDIUM',
    examples: ['Move funds', 'Adjust allocation', 'Emergency fund'],
  },
];

/**
 * FOUNDER_APPROVAL Actions
 */
export const FOUNDER_APPROVAL_ACTIONS: LailaAction[] = [
  {
    action: 'EXPENSE_LARGE',
    actionAr: 'مصروف كبير',
    category: FinanceCategory.PAYMENTS,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Approve expenses over 5K EGP',
    riskLevel: 'HIGH',
    examples: ['Major purchase', 'Equipment', 'Large contract'],
  },
  {
    action: 'SALARY_DECISION',
    actionAr: 'قرار الرواتب',
    category: FinanceCategory.PAYMENTS,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Salary-related decisions',
    riskLevel: 'CRITICAL',
    examples: ['Salary increase', 'Bonus', 'New hire salary'],
  },
  {
    action: 'INVESTMENT_DECISION',
    actionAr: 'قرار استثماري',
    category: FinanceCategory.BUDGETING,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Investment and capital allocation',
    riskLevel: 'CRITICAL',
    examples: ['New investment', 'Capital expenditure', 'Asset purchase'],
  },
  {
    action: 'LOAN_APPROVAL',
    actionAr: 'موافقة القرض',
    category: FinanceCategory.PAYMENTS,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Approve loans or credit facilities',
    riskLevel: 'CRITICAL',
    examples: ['Bank loan', 'Credit line', 'Debt financing'],
  },
  {
    action: 'PRICING_ADJUSTMENT',
    actionAr: 'تعديل التسعير',
    category: FinanceCategory.ANALYSIS,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Adjust platform pricing or fees',
    riskLevel: 'HIGH',
    examples: ['Commission change', 'Fee adjustment', 'Pricing model'],
  },
  {
    action: 'FINANCIAL_AUDIT',
    actionAr: 'تدقيق مالي',
    category: FinanceCategory.COMPLIANCE,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Initiate or respond to financial audits',
    riskLevel: 'HIGH',
    examples: ['External audit', 'Tax audit', 'Compliance review'],
  },
];

export const ALL_LAILA_ACTIONS: LailaAction[] = [
  ...AUTONOMOUS_ACTIONS,
  ...CEO_APPROVAL_ACTIONS,
  ...FOUNDER_APPROVAL_ACTIONS,
];

export const getActionConfig = (action: string): LailaAction | undefined => {
  return ALL_LAILA_ACTIONS.find((a) => a.action === action);
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
  ALL_LAILA_ACTIONS,
  getActionConfig,
  requiresApproval,
  getRequiredApprover,
};
