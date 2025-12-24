/**
 * Hana CLO Permissions Configuration
 * إعدادات صلاحيات هنا المستشار القانوني
 */

export enum PermissionLevel {
  AUTONOMOUS = 'AUTONOMOUS',
  CEO_APPROVAL = 'CEO_APPROVAL',
  FOUNDER_APPROVAL = 'FOUNDER_APPROVAL',
}

export enum LegalCategory {
  CONTRACTS = 'CONTRACTS',
  COMPLIANCE = 'COMPLIANCE',
  POLICIES = 'POLICIES',
  LICENSING = 'LICENSING',
  DISPUTES = 'DISPUTES',
  REPORTING = 'REPORTING',
}

export interface HanaAction {
  action: string;
  actionAr: string;
  category: LegalCategory;
  permissionLevel: PermissionLevel;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  contractLimit?: number;
  examples: string[];
}

/**
 * AUTONOMOUS Actions
 */
export const AUTONOMOUS_ACTIONS: HanaAction[] = [
  {
    action: 'CREATE_CONTRACT_TEMPLATE',
    actionAr: 'إنشاء قالب عقد',
    category: LegalCategory.CONTRACTS,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Create and maintain contract templates',
    riskLevel: 'LOW',
    examples: ['Vendor template', 'NDA template', 'Service agreement'],
  },
  {
    action: 'REVIEW_AGREEMENT',
    actionAr: 'مراجعة اتفاقية',
    category: LegalCategory.CONTRACTS,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Review external agreements for risks',
    riskLevel: 'LOW',
    examples: ['Vendor contract review', 'Partner agreement', 'Terms review'],
  },
  {
    action: 'LEGAL_RISK_ANALYSIS',
    actionAr: 'تحليل المخاطر القانونية',
    category: LegalCategory.COMPLIANCE,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Analyze legal exposure and risks',
    riskLevel: 'LOW',
    examples: ['Risk assessment', 'Liability analysis', 'Exposure report'],
  },
  {
    action: 'DRAFT_TOS',
    actionAr: 'صياغة شروط الاستخدام',
    category: LegalCategory.POLICIES,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Draft Terms of Service updates',
    riskLevel: 'LOW',
    examples: ['TOS update', 'New clause', 'Policy addition'],
  },
  {
    action: 'DRAFT_PRIVACY_POLICY',
    actionAr: 'صياغة سياسة الخصوصية',
    category: LegalCategory.POLICIES,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Draft Privacy Policy updates',
    riskLevel: 'LOW',
    examples: ['Privacy update', 'GDPR compliance', 'Data policy'],
  },
  {
    action: 'LICENSE_MONITORING',
    actionAr: 'مراقبة التراخيص',
    category: LegalCategory.LICENSING,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Monitor license status and renewals',
    riskLevel: 'LOW',
    examples: ['License tracking', 'Renewal alerts', 'Expiry monitoring'],
  },
  {
    action: 'REGULATORY_WATCH',
    actionAr: 'مراقبة اللوائح',
    category: LegalCategory.COMPLIANCE,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Monitor regulatory changes',
    riskLevel: 'LOW',
    examples: ['New regulations', 'Law updates', 'Compliance requirements'],
  },
  {
    action: 'COMPLIANCE_REPORT',
    actionAr: 'تقرير الامتثال',
    category: LegalCategory.REPORTING,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Generate compliance reports',
    riskLevel: 'LOW',
    examples: ['Monthly compliance', 'Audit prep', 'Status report'],
  },
  {
    action: 'DISPUTE_ANALYSIS',
    actionAr: 'تحليل النزاع',
    category: LegalCategory.DISPUTES,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Analyze user disputes and recommend resolution',
    riskLevel: 'LOW',
    examples: ['Dispute review', 'Resolution options', 'Risk assessment'],
  },
];

/**
 * CEO_APPROVAL Actions
 */
export const CEO_APPROVAL_ACTIONS: HanaAction[] = [
  {
    action: 'CONTRACT_SMALL',
    actionAr: 'عقد صغير',
    category: LegalCategory.CONTRACTS,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Approve contracts under 50K EGP',
    riskLevel: 'MEDIUM',
    contractLimit: 50000,
    examples: ['Service contract', 'Vendor agreement', 'Consultant contract'],
  },
  {
    action: 'POLICY_UPDATE_MINOR',
    actionAr: 'تحديث سياسة بسيط',
    category: LegalCategory.POLICIES,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Minor policy updates',
    riskLevel: 'MEDIUM',
    examples: ['Clarification', 'Small addition', 'Wording change'],
  },
  {
    action: 'VENDOR_AGREEMENT',
    actionAr: 'اتفاقية مورد',
    category: LegalCategory.CONTRACTS,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Approve standard vendor agreements',
    riskLevel: 'MEDIUM',
    contractLimit: 50000,
    examples: ['Software vendor', 'Service provider', 'Supplier contract'],
  },
  {
    action: 'NDA_EXECUTION',
    actionAr: 'تنفيذ اتفاقية سرية',
    category: LegalCategory.CONTRACTS,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Execute NDAs with partners',
    riskLevel: 'MEDIUM',
    examples: ['Partner NDA', 'Investor NDA', 'Vendor NDA'],
  },
  {
    action: 'DISPUTE_RESOLUTION_SMALL',
    actionAr: 'حل نزاع صغير',
    category: LegalCategory.DISPUTES,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Resolve minor disputes',
    riskLevel: 'MEDIUM',
    examples: ['User complaint', 'Refund dispute', 'Service issue'],
  },
];

/**
 * FOUNDER_APPROVAL Actions
 */
export const FOUNDER_APPROVAL_ACTIONS: HanaAction[] = [
  {
    action: 'CONTRACT_LARGE',
    actionAr: 'عقد كبير',
    category: LegalCategory.CONTRACTS,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Approve contracts over 50K EGP',
    riskLevel: 'HIGH',
    examples: ['Major contract', 'Long-term agreement', 'Strategic deal'],
  },
  {
    action: 'POLICY_UPDATE_MAJOR',
    actionAr: 'تحديث سياسة رئيسي',
    category: LegalCategory.POLICIES,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Major policy revisions',
    riskLevel: 'HIGH',
    examples: ['TOS overhaul', 'Privacy policy rewrite', 'New policy'],
  },
  {
    action: 'PARTNERSHIP_AGREEMENT',
    actionAr: 'اتفاقية شراكة',
    category: LegalCategory.CONTRACTS,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Strategic partnership agreements',
    riskLevel: 'HIGH',
    examples: ['Bank partnership', 'Platform integration', 'Co-branding'],
  },
  {
    action: 'LEGAL_PROCEEDINGS',
    actionAr: 'إجراءات قانونية',
    category: LegalCategory.DISPUTES,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Initiate or respond to legal proceedings',
    riskLevel: 'CRITICAL',
    examples: ['Lawsuit', 'Arbitration', 'Legal claim'],
  },
  {
    action: 'REGULATORY_SUBMISSION',
    actionAr: 'تقديم تنظيمي',
    category: LegalCategory.COMPLIANCE,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Submit to regulatory bodies',
    riskLevel: 'HIGH',
    examples: ['License application', 'NTRA submission', 'CBE filing'],
  },
  {
    action: 'INVESTMENT_AGREEMENT',
    actionAr: 'اتفاقية استثمار',
    category: LegalCategory.CONTRACTS,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Investment or funding agreements',
    riskLevel: 'CRITICAL',
    examples: ['Term sheet', 'SAFE agreement', 'Convertible note'],
  },
];

export const ALL_HANA_ACTIONS: HanaAction[] = [
  ...AUTONOMOUS_ACTIONS,
  ...CEO_APPROVAL_ACTIONS,
  ...FOUNDER_APPROVAL_ACTIONS,
];

export const getActionConfig = (action: string): HanaAction | undefined => {
  return ALL_HANA_ACTIONS.find((a) => a.action === action);
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
  ALL_HANA_ACTIONS,
  getActionConfig,
  requiresApproval,
  getRequiredApprover,
};
