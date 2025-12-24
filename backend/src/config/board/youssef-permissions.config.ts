/**
 * Youssef CMO Permissions Configuration
 * إعدادات صلاحيات يوسف مدير التسويق
 *
 * Three-tier permission system:
 * 1. AUTONOMOUS - Youssef can execute without approval
 * 2. CEO_APPROVAL - Requires CEO (Karim) approval
 * 3. FOUNDER_APPROVAL - Requires founder (Eng. Mamdouh) approval
 */

export enum PermissionLevel {
  AUTONOMOUS = 'AUTONOMOUS',
  CEO_APPROVAL = 'CEO_APPROVAL',
  FOUNDER_APPROVAL = 'FOUNDER_APPROVAL',
}

export enum MarketingCategory {
  CONTENT = 'CONTENT',
  ADVERTISING = 'ADVERTISING',
  ANALYTICS = 'ANALYTICS',
  BRAND = 'BRAND',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  PARTNERSHIPS = 'PARTNERSHIPS',
  RESEARCH = 'RESEARCH',
}

export interface YoussefAction {
  action: string;
  actionAr: string;
  category: MarketingCategory;
  permissionLevel: PermissionLevel;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  budgetLimit?: number; // in EGP
  examples: string[];
}

/**
 * AUTONOMOUS Actions - يوسف ينفذ مباشرة
 */
export const AUTONOMOUS_ACTIONS: YoussefAction[] = [
  {
    action: 'CREATE_SOCIAL_CONTENT',
    actionAr: 'إنشاء محتوى اجتماعي',
    category: MarketingCategory.CONTENT,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Create social media posts, captions, and stories',
    riskLevel: 'LOW',
    examples: ['Facebook post', 'Instagram story', 'Twitter thread'],
  },
  {
    action: 'CREATE_AD_COPY',
    actionAr: 'كتابة نصوص إعلانية',
    category: MarketingCategory.ADVERTISING,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Write advertising copy for campaigns',
    riskLevel: 'LOW',
    examples: ['Facebook ad copy', 'Google ads text', 'Banner copy'],
  },
  {
    action: 'GENERATE_CONTENT_PACKAGE',
    actionAr: 'إنشاء حزمة المحتوى اليومية',
    category: MarketingCategory.CONTENT,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Generate daily content package with posts and stories',
    riskLevel: 'LOW',
    examples: ['Daily content calendar', 'Weekly posts batch'],
  },
  {
    action: 'COMPETITOR_ANALYSIS',
    actionAr: 'تحليل المنافسين',
    category: MarketingCategory.RESEARCH,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Analyze competitor marketing strategies',
    riskLevel: 'LOW',
    examples: ['OLX analysis', 'Noon pricing study', 'Jumia campaigns'],
  },
  {
    action: 'KEYWORD_RESEARCH',
    actionAr: 'بحث الكلمات المفتاحية',
    category: MarketingCategory.RESEARCH,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Research keywords for SEO and ads',
    riskLevel: 'LOW',
    examples: ['Arabic keywords', 'Search trends', 'ASO research'],
  },
  {
    action: 'GENERATE_MARKETING_REPORT',
    actionAr: 'إنشاء تقرير التسويق',
    category: MarketingCategory.ANALYTICS,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Generate marketing performance reports',
    riskLevel: 'LOW',
    examples: ['Weekly report', 'Campaign analysis', 'ROI summary'],
  },
  {
    action: 'AUDIENCE_INSIGHTS',
    actionAr: 'رؤى الجمهور',
    category: MarketingCategory.ANALYTICS,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Analyze audience behavior and demographics',
    riskLevel: 'LOW',
    examples: ['User segments', 'Behavior analysis', 'Demographics'],
  },
  {
    action: 'AB_TEST_SUGGESTION',
    actionAr: 'اقتراح اختبار A/B',
    category: MarketingCategory.ANALYTICS,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Suggest A/B tests for optimization',
    riskLevel: 'LOW',
    examples: ['Landing page test', 'CTA test', 'Copy variations'],
  },
  {
    action: 'CONTENT_CALENDAR',
    actionAr: 'تقويم المحتوى',
    category: MarketingCategory.CONTENT,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Maintain and update content calendar',
    riskLevel: 'LOW',
    examples: ['Monthly calendar', 'Holiday planning', 'Event schedule'],
  },
  {
    action: 'EMAIL_TEMPLATE',
    actionAr: 'قالب البريد الإلكتروني',
    category: MarketingCategory.CONTENT,
    permissionLevel: PermissionLevel.AUTONOMOUS,
    description: 'Create email marketing templates',
    riskLevel: 'LOW',
    examples: ['Newsletter template', 'Promo email', 'Welcome series'],
  },
];

/**
 * CEO_APPROVAL Actions - تتطلب موافقة كريم
 */
export const CEO_APPROVAL_ACTIONS: YoussefAction[] = [
  {
    action: 'LAUNCH_CAMPAIGN_SMALL',
    actionAr: 'إطلاق حملة صغيرة',
    category: MarketingCategory.ADVERTISING,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Launch advertising campaigns under 5,000 EGP',
    riskLevel: 'MEDIUM',
    budgetLimit: 5000,
    examples: ['Facebook campaign', 'Instagram ads', 'Google ads'],
  },
  {
    action: 'BRAND_VOICE_MODIFICATION',
    actionAr: 'تعديل صوت العلامة',
    category: MarketingCategory.BRAND,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Modify brand voice or messaging guidelines',
    riskLevel: 'MEDIUM',
    examples: ['Tone adjustment', 'New tagline', 'Messaging update'],
  },
  {
    action: 'NEW_MARKETING_CHANNEL',
    actionAr: 'قناة تسويقية جديدة',
    category: MarketingCategory.ADVERTISING,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Add new marketing channels',
    riskLevel: 'MEDIUM',
    examples: ['TikTok ads', 'LinkedIn', 'Podcast sponsorship'],
  },
  {
    action: 'PARTNERSHIP_OUTREACH',
    actionAr: 'تواصل الشراكات',
    category: MarketingCategory.PARTNERSHIPS,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Initiate partnership discussions',
    riskLevel: 'MEDIUM',
    examples: ['Influencer outreach', 'Brand collaboration', 'Co-marketing'],
  },
  {
    action: 'MICRO_INFLUENCER',
    actionAr: 'مؤثر صغير',
    category: MarketingCategory.PARTNERSHIPS,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Engage micro-influencers (under 10K EGP)',
    riskLevel: 'MEDIUM',
    budgetLimit: 10000,
    examples: ['Instagram influencer', 'TikTok creator', 'YouTube review'],
  },
  {
    action: 'PROMOTIONAL_OFFER',
    actionAr: 'عرض ترويجي',
    category: MarketingCategory.ADVERTISING,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Create promotional offers or discounts',
    riskLevel: 'MEDIUM',
    examples: ['Ramadan sale', 'First-time discount', 'Referral bonus'],
  },
  {
    action: 'LANDING_PAGE_CREATION',
    actionAr: 'إنشاء صفحة هبوط',
    category: MarketingCategory.CONTENT,
    permissionLevel: PermissionLevel.CEO_APPROVAL,
    description: 'Create new landing pages',
    riskLevel: 'MEDIUM',
    examples: ['Campaign landing', 'Product page', 'Lead capture'],
  },
];

/**
 * FOUNDER_APPROVAL Actions - تتطلب موافقة المؤسس
 */
export const FOUNDER_APPROVAL_ACTIONS: YoussefAction[] = [
  {
    action: 'LAUNCH_CAMPAIGN_LARGE',
    actionAr: 'إطلاق حملة كبيرة',
    category: MarketingCategory.ADVERTISING,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Launch advertising campaigns over 5,000 EGP',
    riskLevel: 'HIGH',
    examples: ['Major campaign', 'Seasonal push', 'Launch campaign'],
  },
  {
    action: 'BRAND_IDENTITY_CHANGE',
    actionAr: 'تغيير هوية العلامة',
    category: MarketingCategory.BRAND,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Major brand identity changes',
    riskLevel: 'CRITICAL',
    examples: ['Logo change', 'Color palette', 'Brand repositioning'],
  },
  {
    action: 'MAJOR_INFLUENCER',
    actionAr: 'مؤثر رئيسي',
    category: MarketingCategory.PARTNERSHIPS,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Engage major influencers (over 10K EGP)',
    riskLevel: 'HIGH',
    examples: ['Celebrity endorsement', 'Major YouTuber', 'TV personality'],
  },
  {
    action: 'TV_RADIO_ADVERTISING',
    actionAr: 'إعلانات التلفزيون والراديو',
    category: MarketingCategory.ADVERTISING,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Television or radio advertising',
    riskLevel: 'CRITICAL',
    examples: ['TV commercial', 'Radio spot', 'Billboard'],
  },
  {
    action: 'PRESS_RELEASE',
    actionAr: 'بيان صحفي',
    category: MarketingCategory.BRAND,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Issue official press releases',
    riskLevel: 'HIGH',
    examples: ['Company announcement', 'Product launch PR', 'Crisis response'],
  },
  {
    action: 'STRATEGIC_PARTNERSHIP',
    actionAr: 'شراكة استراتيجية',
    category: MarketingCategory.PARTNERSHIPS,
    permissionLevel: PermissionLevel.FOUNDER_APPROVAL,
    description: 'Enter strategic marketing partnerships',
    riskLevel: 'HIGH',
    examples: ['Bank partnership', 'Telco deal', 'Brand alliance'],
  },
];

/**
 * All Youssef actions combined
 */
export const ALL_YOUSSEF_ACTIONS: YoussefAction[] = [
  ...AUTONOMOUS_ACTIONS,
  ...CEO_APPROVAL_ACTIONS,
  ...FOUNDER_APPROVAL_ACTIONS,
];

/**
 * Get action by name
 */
export const getActionConfig = (action: string): YoussefAction | undefined => {
  return ALL_YOUSSEF_ACTIONS.find((a) => a.action === action);
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
  if (!config) return 'FOUNDER';

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

export default {
  AUTONOMOUS_ACTIONS,
  CEO_APPROVAL_ACTIONS,
  FOUNDER_APPROVAL_ACTIONS,
  ALL_YOUSSEF_ACTIONS,
  getActionConfig,
  requiresApproval,
  getRequiredApprover,
};
