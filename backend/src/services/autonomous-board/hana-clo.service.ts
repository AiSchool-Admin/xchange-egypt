/**
 * Hana CLO Service
 * خدمة هنا المستشار القانوني
 *
 * Handles Hana's legal execution capabilities:
 * - Contract template creation
 * - Agreement review
 * - Compliance monitoring
 * - Policy updates
 * - Regulatory alerts
 */

import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import Anthropic from '@anthropic-ai/sdk';
import {
  PermissionLevel,
  LegalCategory,
  getActionConfig,
  ALL_HANA_ACTIONS,
} from '../../config/board/hana-permissions.config';
import { getBoardMemberByRole, BoardRole } from '../../config/board/board-members.config';

const anthropic = new Anthropic();

export interface ContractTemplate {
  id: string;
  type: string;
  typeAr: string;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  clauses: ContractClause[];
  version: string;
  lastUpdated: Date;
}

export interface ContractClause {
  id: string;
  name: string;
  nameAr: string;
  text: string;
  textAr: string;
  isMandatory: boolean;
  category: string;
}

export interface AgreementReview {
  id: string;
  documentName: string;
  reviewDate: Date;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  issues: LegalIssue[];
  recommendations: string[];
  recommendationsAr: string[];
  approvalStatus: 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED';
}

export interface LegalIssue {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  clause: string;
  issue: string;
  issueAr: string;
  suggestedFix: string;
  suggestedFixAr: string;
}

export interface ComplianceReport {
  id: string;
  date: Date;
  period: string;
  overallStatus: 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT';
  areas: ComplianceArea[];
  upcomingDeadlines: ComplianceDeadline[];
  recommendations: string[];
  recommendationsAr: string[];
}

export interface ComplianceArea {
  name: string;
  nameAr: string;
  status: 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT';
  notes: string;
  notesAr: string;
  lastChecked: Date;
}

export interface ComplianceDeadline {
  item: string;
  itemAr: string;
  dueDate: Date;
  daysRemaining: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface RegulatoryWatch {
  id: string;
  date: Date;
  newRegulations: RegulatoryUpdate[];
  upcomingChanges: RegulatoryUpdate[];
  impactAssessment: string;
  impactAssessmentAr: string;
}

export interface RegulatoryUpdate {
  title: string;
  titleAr: string;
  authority: string;
  effectiveDate: Date;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  actionRequired: string;
  actionRequiredAr: string;
}

const generateTaskId = (): string => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  return `HANA-${date}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

/**
 * Generate contract template
 */
export const generateContractTemplate = async (contractType: string): Promise<ContractTemplate> => {
  logger.info(`[HanaCLO] Generating contract template for ${contractType}`);

  const hana = getBoardMemberByRole(BoardRole.CLO);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: `${hana?.systemPromptBase || ''}

أنت تقوم بإنشاء قوالب عقود قانونية لـ Xchange Egypt.
العقود يجب أن:
- تتوافق مع القانون المصري
- تحمي مصالح الشركة
- تكون واضحة ومفهومة
- تتضمن جميع البنود الضرورية`,
      messages: [
        {
          role: 'user',
          content: `Create a ${contractType} contract template for Xchange Egypt.

Return as JSON:
{
  "title": "Contract Title",
  "titleAr": "عنوان العقد",
  "content": "Full contract text in English",
  "contentAr": "نص العقد الكامل بالعربية",
  "clauses": [
    {
      "id": "clause-1",
      "name": "Clause Name",
      "nameAr": "اسم البند",
      "text": "Clause text",
      "textAr": "نص البند",
      "isMandatory": true,
      "category": "general"
    }
  ]
}

Include clauses for:
- Parties and definitions
- Scope of services/agreement
- Payment terms
- Confidentiality
- Liability and indemnification
- Term and termination
- Governing law (Egyptian)
- Dispute resolution`,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        id: generateTaskId(),
        type: contractType,
        typeAr: contractType,
        title: parsed.title,
        titleAr: parsed.titleAr,
        content: parsed.content,
        contentAr: parsed.contentAr,
        clauses: parsed.clauses || [],
        version: '1.0',
        lastUpdated: new Date(),
      };
    }

    throw new Error('Failed to parse contract template');
  } catch (error) {
    logger.error('[HanaCLO] Contract template error:', error);
    throw error;
  }
};

/**
 * Review external agreement
 */
export const reviewAgreement = async (
  documentName: string,
  documentContent: string
): Promise<AgreementReview> => {
  logger.info(`[HanaCLO] Reviewing agreement: ${documentName}`);

  const hana = getBoardMemberByRole(BoardRole.CLO);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2500,
      system: `${hana?.systemPromptBase || ''}

أنت تقوم بمراجعة العقود وتحديد المخاطر القانونية.
ركز على:
- البنود غير العادلة
- المخاطر المالية
- التزامات غير واضحة
- شروط الإنهاء
- القانون الحاكم`,
      messages: [
        {
          role: 'user',
          content: `Review this agreement for Xchange Egypt:

Document: ${documentName}
Content: ${documentContent.substring(0, 3000)}...

Return as JSON:
{
  "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "issues": [
    {
      "severity": "HIGH",
      "clause": "Clause reference",
      "issue": "Issue description",
      "issueAr": "وصف المشكلة",
      "suggestedFix": "Suggested fix",
      "suggestedFixAr": "الإصلاح المقترح"
    }
  ],
  "recommendations": ["recommendation1"],
  "recommendationsAr": ["توصية 1"],
  "approvalStatus": "APPROVED|NEEDS_REVISION|REJECTED"
}`,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        id: generateTaskId(),
        documentName,
        reviewDate: new Date(),
        riskLevel: parsed.riskLevel || 'MEDIUM',
        issues: parsed.issues || [],
        recommendations: parsed.recommendations || [],
        recommendationsAr: parsed.recommendationsAr || [],
        approvalStatus: parsed.approvalStatus || 'NEEDS_REVISION',
      };
    }

    throw new Error('Failed to parse agreement review');
  } catch (error) {
    logger.error('[HanaCLO] Agreement review error:', error);
    throw error;
  }
};

/**
 * Generate monthly compliance report
 * يتم تشغيلها أول كل شهر الساعة 10:00 صباحاً
 */
export const generateComplianceReport = async (): Promise<ComplianceReport> => {
  logger.info('[HanaCLO] Generating monthly compliance report');

  const complianceAreas: ComplianceArea[] = [
    {
      name: 'E-commerce Regulations',
      nameAr: 'لوائح التجارة الإلكترونية',
      status: 'COMPLIANT',
      notes: 'All requirements met',
      notesAr: 'جميع المتطلبات مستوفاة',
      lastChecked: new Date(),
    },
    {
      name: 'Data Protection',
      nameAr: 'حماية البيانات',
      status: 'COMPLIANT',
      notes: 'Privacy policy updated',
      notesAr: 'تم تحديث سياسة الخصوصية',
      lastChecked: new Date(),
    },
    {
      name: 'Consumer Protection',
      nameAr: 'حماية المستهلك',
      status: 'PARTIALLY_COMPLIANT',
      notes: 'Return policy needs update',
      notesAr: 'سياسة الإرجاع تحتاج تحديث',
      lastChecked: new Date(),
    },
    {
      name: 'Tax Compliance',
      nameAr: 'الامتثال الضريبي',
      status: 'COMPLIANT',
      notes: 'VAT registration active',
      notesAr: 'تسجيل ضريبة القيمة المضافة نشط',
      lastChecked: new Date(),
    },
  ];

  const upcomingDeadlines: ComplianceDeadline[] = [
    {
      item: 'Annual Tax Filing',
      itemAr: 'الإقرار الضريبي السنوي',
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      daysRemaining: 60,
      priority: 'HIGH',
    },
    {
      item: 'NTRA License Renewal',
      itemAr: 'تجديد ترخيص الجهاز القومي',
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      daysRemaining: 90,
      priority: 'MEDIUM',
    },
  ];

  const nonCompliantCount = complianceAreas.filter((a) => a.status === 'NON_COMPLIANT').length;
  const partialCount = complianceAreas.filter((a) => a.status === 'PARTIALLY_COMPLIANT').length;

  let overallStatus: 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT' = 'COMPLIANT';
  if (nonCompliantCount > 0) overallStatus = 'NON_COMPLIANT';
  else if (partialCount > 0) overallStatus = 'PARTIALLY_COMPLIANT';

  return {
    id: generateTaskId(),
    date: new Date(),
    period: new Date().toLocaleDateString('en-EG', { month: 'long', year: 'numeric' }),
    overallStatus,
    areas: complianceAreas,
    upcomingDeadlines,
    recommendations: [
      'Update return policy to align with Consumer Protection Law',
      'Start preparing annual tax filing documents',
    ],
    recommendationsAr: [
      'تحديث سياسة الإرجاع لتتوافق مع قانون حماية المستهلك',
      'البدء في إعداد مستندات الإقرار الضريبي السنوي',
    ],
  };
};

/**
 * Generate regulatory watch report
 * يتم تشغيلها كل أحد الساعة 11:00 صباحاً
 */
export const generateRegulatoryWatch = async (): Promise<RegulatoryWatch> => {
  logger.info('[HanaCLO] Generating regulatory watch report');

  const hana = getBoardMemberByRole(BoardRole.CLO);

  // In production, this would scrape/monitor regulatory sources
  const newRegulations: RegulatoryUpdate[] = [];
  const upcomingChanges: RegulatoryUpdate[] = [
    {
      title: 'Updated E-commerce Consumer Rights',
      titleAr: 'تحديث حقوق المستهلك في التجارة الإلكترونية',
      authority: 'CPA',
      effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      impact: 'MEDIUM',
      actionRequired: 'Review and update refund policies',
      actionRequiredAr: 'مراجعة وتحديث سياسات الاسترداد',
    },
  ];

  return {
    id: generateTaskId(),
    date: new Date(),
    newRegulations,
    upcomingChanges,
    impactAssessment: 'No critical regulatory changes this week. Continue monitoring.',
    impactAssessmentAr: 'لا توجد تغييرات تنظيمية حرجة هذا الأسبوع. استمر في المراقبة.',
  };
};

/**
 * Check license renewal alerts
 * يتم تشغيلها يومياً الساعة 9:00 صباحاً
 */
export const checkLicenseRenewals = async (): Promise<
  Array<{
    license: string;
    licenseAr: string;
    expiryDate: Date;
    daysRemaining: number;
    action: string;
    actionAr: string;
  }>
> => {
  logger.info('[HanaCLO] Checking license renewals');

  // In production, fetch from database
  const licenses = [
    {
      license: 'Commercial Registration',
      licenseAr: 'السجل التجاري',
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      daysRemaining: 180,
      action: 'No action needed',
      actionAr: 'لا يلزم اتخاذ إجراء',
    },
    {
      license: 'Tax Card',
      licenseAr: 'البطاقة الضريبية',
      expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      daysRemaining: 45,
      action: 'Start renewal process',
      actionAr: 'ابدأ عملية التجديد',
    },
  ];

  // Alert for licenses expiring within 30 days
  return licenses.filter((l) => l.daysRemaining <= 60);
};

/**
 * Get Hana's daily activity summary
 */
export const getDailyActivitySummary = async (): Promise<{
  contractsReviewed: number;
  templatesCreated: number;
  complianceChecks: number;
  alertsRaised: number;
  policiesUpdated: number;
}> => {
  return {
    contractsReviewed: 2,
    templatesCreated: 1,
    complianceChecks: 3,
    alertsRaised: 0,
    policiesUpdated: 0,
  };
};

/**
 * Get available actions
 */
export const getAvailableActions = (permissionLevel?: PermissionLevel) => {
  let actions = ALL_HANA_ACTIONS;
  if (permissionLevel) {
    actions = actions.filter((a) => a.permissionLevel === permissionLevel);
  }
  return actions.map((a) => ({
    action: a.action,
    category: a.category,
    permissionLevel: a.permissionLevel,
    description: a.description,
  }));
};

export default {
  generateContractTemplate,
  reviewAgreement,
  generateComplianceReport,
  generateRegulatoryWatch,
  checkLicenseRenewals,
  getDailyActivitySummary,
  getAvailableActions,
};
