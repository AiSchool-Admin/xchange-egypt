/**
 * Company Phases Configuration
 * إعدادات مراحل نمو الشركة
 *
 * Each phase has different priorities, KPIs, and board focus areas.
 * The board adapts its discussions and decisions based on current phase.
 */

export enum CompanyPhase {
  MVP = 'MVP',
  PRODUCT_MARKET_FIT = 'PRODUCT_MARKET_FIT',
  GROWTH = 'GROWTH',
  SCALE = 'SCALE',
  MATURITY = 'MATURITY',
}

export interface PhaseKPI {
  code: string;
  name: string;
  nameAr: string;
  targetRange: { min: number; max: number };
  unit: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface PhasePriority {
  area: string;
  areaAr: string;
  weight: number; // 1-10
  description: string;
}

export interface PhaseConfig {
  phase: CompanyPhase;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  duration: string; // Expected duration
  primaryGoal: string;
  primaryGoalAr: string;
  kpis: PhaseKPI[];
  priorities: PhasePriority[];
  boardFocus: string[];
  riskTolerance: 'HIGH' | 'MEDIUM' | 'LOW';
  innovationMode: 'EXPERIMENTAL' | 'BALANCED' | 'CONSERVATIVE';
  meetingFrequency: {
    strategic: number; // per week
    operational: number; // per day
    emergency: boolean;
  };
  founderInvolvement: 'MINIMAL' | 'MODERATE' | 'HIGH';
  nadiaAutonomy: 'FULL' | 'SUPERVISED' | 'RESTRICTED';
}

export const COMPANY_PHASES_CONFIG: PhaseConfig[] = [
  {
    phase: CompanyPhase.MVP,
    name: 'Minimum Viable Product',
    nameAr: 'الحد الأدنى من المنتج',
    description: 'Building core product, validating assumptions, learning fast',
    descriptionAr: 'بناء المنتج الأساسي، التحقق من الافتراضات، التعلم السريع',
    duration: '3-6 months',
    primaryGoal: 'Validate core value proposition with real users',
    primaryGoalAr: 'التحقق من القيمة الأساسية مع مستخدمين حقيقيين',
    kpis: [
      {
        code: 'ACTIVE_LISTINGS',
        name: 'Active Listings',
        nameAr: 'الإعلانات النشطة',
        targetRange: { min: 100, max: 1000 },
        unit: 'listings',
        priority: 'CRITICAL',
      },
      {
        code: 'REGISTERED_USERS',
        name: 'Registered Users',
        nameAr: 'المستخدمون المسجلون',
        targetRange: { min: 500, max: 5000 },
        unit: 'users',
        priority: 'CRITICAL',
      },
      {
        code: 'WEEKLY_TRANSACTIONS',
        name: 'Weekly Transactions',
        nameAr: 'المعاملات الأسبوعية',
        targetRange: { min: 10, max: 100 },
        unit: 'transactions',
        priority: 'HIGH',
      },
      {
        code: 'USER_FEEDBACK_SCORE',
        name: 'User Feedback Score',
        nameAr: 'درجة ملاحظات المستخدم',
        targetRange: { min: 3.5, max: 5 },
        unit: 'rating',
        priority: 'HIGH',
      },
    ],
    priorities: [
      { area: 'Product Development', areaAr: 'تطوير المنتج', weight: 10, description: 'Ship core features fast' },
      { area: 'User Research', areaAr: 'أبحاث المستخدم', weight: 9, description: 'Talk to users daily' },
      { area: 'Technical Foundation', areaAr: 'الأساس التقني', weight: 8, description: 'Build scalable architecture' },
      { area: 'Marketing', areaAr: 'التسويق', weight: 5, description: 'Minimal, targeted outreach' },
      { area: 'Operations', areaAr: 'العمليات', weight: 4, description: 'Manual processes OK' },
      { area: 'Legal', areaAr: 'القانوني', weight: 3, description: 'Basic compliance only' },
    ],
    boardFocus: [
      'Speed of iteration',
      'User feedback integration',
      'Core feature completion',
      'Technical debt management',
      'Burn rate optimization',
    ],
    riskTolerance: 'HIGH',
    innovationMode: 'EXPERIMENTAL',
    meetingFrequency: { strategic: 2, operational: 2, emergency: true },
    founderInvolvement: 'MODERATE',
    nadiaAutonomy: 'FULL',
  },
  {
    phase: CompanyPhase.PRODUCT_MARKET_FIT,
    name: 'Product-Market Fit',
    nameAr: 'توافق المنتج مع السوق',
    description: 'Finding repeatable, scalable customer acquisition',
    descriptionAr: 'إيجاد استحواذ عملاء قابل للتكرار والتوسع',
    duration: '6-12 months',
    primaryGoal: 'Achieve clear signs of product-market fit',
    primaryGoalAr: 'تحقيق علامات واضحة على توافق المنتج مع السوق',
    kpis: [
      {
        code: 'MONTHLY_GMV',
        name: 'Monthly GMV',
        nameAr: 'القيمة الإجمالية الشهرية',
        targetRange: { min: 50000, max: 500000 },
        unit: 'EGP',
        priority: 'CRITICAL',
      },
      {
        code: 'REPEAT_USERS',
        name: 'Repeat Users %',
        nameAr: 'نسبة المستخدمين المتكررين',
        targetRange: { min: 20, max: 40 },
        unit: '%',
        priority: 'CRITICAL',
      },
      {
        code: 'NPS_SCORE',
        name: 'Net Promoter Score',
        nameAr: 'صافي نقاط الترويج',
        targetRange: { min: 30, max: 50 },
        unit: 'score',
        priority: 'HIGH',
      },
      {
        code: 'ORGANIC_GROWTH',
        name: 'Organic Growth Rate',
        nameAr: 'معدل النمو العضوي',
        targetRange: { min: 10, max: 30 },
        unit: '%/month',
        priority: 'HIGH',
      },
    ],
    priorities: [
      { area: 'Retention', areaAr: 'الاحتفاظ', weight: 10, description: 'Keep users coming back' },
      { area: 'User Experience', areaAr: 'تجربة المستخدم', weight: 9, description: 'Polish and delight' },
      { area: 'Growth Experiments', areaAr: 'تجارب النمو', weight: 8, description: 'Find growth channels' },
      { area: 'Unit Economics', areaAr: 'اقتصاديات الوحدة', weight: 7, description: 'Path to profitability' },
      { area: 'Team Building', areaAr: 'بناء الفريق', weight: 6, description: 'Key hires' },
    ],
    boardFocus: [
      'Retention metrics',
      'Referral mechanics',
      'User satisfaction signals',
      'Cohort analysis',
      'Channel experimentation',
    ],
    riskTolerance: 'MEDIUM',
    innovationMode: 'BALANCED',
    meetingFrequency: { strategic: 2, operational: 2, emergency: true },
    founderInvolvement: 'MODERATE',
    nadiaAutonomy: 'FULL',
  },
  {
    phase: CompanyPhase.GROWTH,
    name: 'Growth',
    nameAr: 'النمو',
    description: 'Scaling what works, optimizing channels',
    descriptionAr: 'توسيع ما ينجح، تحسين القنوات',
    duration: '12-24 months',
    primaryGoal: 'Rapid user and revenue growth',
    primaryGoalAr: 'نمو سريع في المستخدمين والإيرادات',
    kpis: [
      {
        code: 'MONTHLY_GMV',
        name: 'Monthly GMV',
        nameAr: 'القيمة الإجمالية الشهرية',
        targetRange: { min: 500000, max: 5000000 },
        unit: 'EGP',
        priority: 'CRITICAL',
      },
      {
        code: 'USER_GROWTH',
        name: 'User Growth Rate',
        nameAr: 'معدل نمو المستخدمين',
        targetRange: { min: 15, max: 50 },
        unit: '%/month',
        priority: 'CRITICAL',
      },
      {
        code: 'CAC',
        name: 'Customer Acquisition Cost',
        nameAr: 'تكلفة اكتساب العميل',
        targetRange: { min: 10, max: 50 },
        unit: 'EGP',
        priority: 'HIGH',
      },
      {
        code: 'LTV_CAC_RATIO',
        name: 'LTV/CAC Ratio',
        nameAr: 'نسبة القيمة الدائمة/التكلفة',
        targetRange: { min: 3, max: 10 },
        unit: 'ratio',
        priority: 'HIGH',
      },
    ],
    priorities: [
      { area: 'User Acquisition', areaAr: 'اكتساب المستخدمين', weight: 10, description: 'Scale proven channels' },
      { area: 'Platform Reliability', areaAr: 'موثوقية المنصة', weight: 9, description: 'Handle scale' },
      { area: 'Team Scaling', areaAr: 'توسيع الفريق', weight: 8, description: 'Build teams' },
      { area: 'Process Automation', areaAr: 'أتمتة العمليات', weight: 7, description: 'Reduce manual work' },
      { area: 'Market Expansion', areaAr: 'توسع السوق', weight: 6, description: 'New cities/segments' },
    ],
    boardFocus: [
      'Growth metrics',
      'Scalability challenges',
      'Team performance',
      'Competitive response',
      'Fundraising readiness',
    ],
    riskTolerance: 'MEDIUM',
    innovationMode: 'BALANCED',
    meetingFrequency: { strategic: 3, operational: 2, emergency: true },
    founderInvolvement: 'MINIMAL',
    nadiaAutonomy: 'SUPERVISED',
  },
  {
    phase: CompanyPhase.SCALE,
    name: 'Scale',
    nameAr: 'التوسع',
    description: 'Market leadership, operational excellence',
    descriptionAr: 'قيادة السوق، التميز التشغيلي',
    duration: '24-48 months',
    primaryGoal: 'Become market leader in Egypt',
    primaryGoalAr: 'أن نصبح رائد السوق في مصر',
    kpis: [
      {
        code: 'MARKET_SHARE',
        name: 'Market Share',
        nameAr: 'حصة السوق',
        targetRange: { min: 20, max: 50 },
        unit: '%',
        priority: 'CRITICAL',
      },
      {
        code: 'MONTHLY_REVENUE',
        name: 'Monthly Revenue',
        nameAr: 'الإيرادات الشهرية',
        targetRange: { min: 1000000, max: 10000000 },
        unit: 'EGP',
        priority: 'CRITICAL',
      },
      {
        code: 'GROSS_MARGIN',
        name: 'Gross Margin',
        nameAr: 'هامش الربح الإجمالي',
        targetRange: { min: 40, max: 70 },
        unit: '%',
        priority: 'HIGH',
      },
      {
        code: 'EBITDA',
        name: 'EBITDA',
        nameAr: 'الأرباح قبل الفوائد والضرائب',
        targetRange: { min: -500000, max: 1000000 },
        unit: 'EGP',
        priority: 'HIGH',
      },
    ],
    priorities: [
      { area: 'Market Dominance', areaAr: 'السيطرة على السوق', weight: 10, description: 'Win the market' },
      { area: 'Profitability', areaAr: 'الربحية', weight: 9, description: 'Sustainable business' },
      { area: 'Operational Excellence', areaAr: 'التميز التشغيلي', weight: 8, description: 'Best-in-class ops' },
      { area: 'Strategic Partnerships', areaAr: 'الشراكات الاستراتيجية', weight: 7, description: 'Ecosystem building' },
      { area: 'Innovation', areaAr: 'الابتكار', weight: 6, description: 'Stay ahead' },
    ],
    boardFocus: [
      'Market position',
      'Profitability path',
      'Competitive moat',
      'Strategic opportunities',
      'Risk management',
    ],
    riskTolerance: 'LOW',
    innovationMode: 'CONSERVATIVE',
    meetingFrequency: { strategic: 2, operational: 1, emergency: true },
    founderInvolvement: 'MINIMAL',
    nadiaAutonomy: 'SUPERVISED',
  },
  {
    phase: CompanyPhase.MATURITY,
    name: 'Maturity',
    nameAr: 'النضج',
    description: 'Sustained leadership, diversification',
    descriptionAr: 'القيادة المستدامة، التنويع',
    duration: 'Ongoing',
    primaryGoal: 'Sustainable market leadership and expansion',
    primaryGoalAr: 'قيادة سوق مستدامة وتوسع',
    kpis: [
      {
        code: 'ANNUAL_REVENUE',
        name: 'Annual Revenue',
        nameAr: 'الإيرادات السنوية',
        targetRange: { min: 50000000, max: 500000000 },
        unit: 'EGP',
        priority: 'CRITICAL',
      },
      {
        code: 'PROFIT_MARGIN',
        name: 'Net Profit Margin',
        nameAr: 'هامش صافي الربح',
        targetRange: { min: 10, max: 30 },
        unit: '%',
        priority: 'CRITICAL',
      },
      {
        code: 'BRAND_VALUE',
        name: 'Brand Value Index',
        nameAr: 'مؤشر قيمة العلامة',
        targetRange: { min: 70, max: 100 },
        unit: 'index',
        priority: 'HIGH',
      },
    ],
    priorities: [
      { area: 'Profitability', areaAr: 'الربحية', weight: 10, description: 'Maximize returns' },
      { area: 'Diversification', areaAr: 'التنويع', weight: 8, description: 'New revenue streams' },
      { area: 'Brand Leadership', areaAr: 'قيادة العلامة', weight: 8, description: 'Market authority' },
      { area: 'Innovation Pipeline', areaAr: 'خط الابتكار', weight: 7, description: 'Future-proofing' },
      { area: 'Talent Development', areaAr: 'تطوير المواهب', weight: 6, description: 'Build leaders' },
    ],
    boardFocus: [
      'Long-term strategy',
      'Dividend/returns',
      'Succession planning',
      'Regional expansion',
      'M&A opportunities',
    ],
    riskTolerance: 'LOW',
    innovationMode: 'CONSERVATIVE',
    meetingFrequency: { strategic: 1, operational: 1, emergency: true },
    founderInvolvement: 'MINIMAL',
    nadiaAutonomy: 'RESTRICTED',
  },
];

/**
 * Get current company phase config
 * In production, this would be stored in database
 */
export const getCurrentPhase = (): CompanyPhase => {
  // TODO: Fetch from database
  return CompanyPhase.MVP;
};

/**
 * Get phase config by phase
 */
export const getPhaseConfig = (phase: CompanyPhase): PhaseConfig | undefined => {
  return COMPANY_PHASES_CONFIG.find(p => p.phase === phase);
};

/**
 * Get current phase config
 */
export const getCurrentPhaseConfig = (): PhaseConfig => {
  const currentPhase = getCurrentPhase();
  return getPhaseConfig(currentPhase) || COMPANY_PHASES_CONFIG[0];
};

/**
 * Get phase-specific KPIs
 */
export const getPhaseKPIs = (phase: CompanyPhase): PhaseKPI[] => {
  const config = getPhaseConfig(phase);
  return config?.kpis || [];
};

/**
 * Get phase-specific priorities
 */
export const getPhasePriorities = (phase: CompanyPhase): PhasePriority[] => {
  const config = getPhaseConfig(phase);
  return config?.priorities || [];
};

export default COMPANY_PHASES_CONFIG;
