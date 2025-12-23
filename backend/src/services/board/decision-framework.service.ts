/**
 * Decision Framework Service - خدمة إطار اتخاذ القرارات (SPADE)
 *
 * SPADE Framework:
 * - S: Setting - تحديد السياق
 * - P: People - تحديد المشاركين
 * - A: Alternatives - توليد البدائل
 * - D: Decide - اتخاذ القرار
 * - E: Explain - شرح القرار
 *
 * المسؤوليات:
 * - بدء قرار جديد بإطار SPADE
 * - إدارة مراحل القرار
 * - إضافة وتقييم البدائل
 * - تسجيل القرار النهائي
 */

import { PrismaClient, SPADEStatus, SPADERole, BoardRole } from '@prisma/client';

const prisma = new PrismaClient();

// Decision number prefix
const DECISION_PREFIX = 'DEC';

// Action item number prefix
const ACTION_PREFIX = 'ACT';

interface InitiateSPADEParams {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  initiatedById: string;
  decisionMakerId: string;
  deadline?: Date;
  meetingId?: string;
}

interface SetContextParams {
  decisionId: string;
  context: string;
  contextAr: string;
  constraints?: {
    budget?: number;
    timeline?: string;
    resources?: string[];
    risks?: string[];
  };
}

interface AddConsultantParams {
  decisionId: string;
  memberId: string;
  role: 'Approver' | 'Contributor' | 'Informed';
}

interface AddAlternativeParams {
  decisionId: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  proposedById: string;
  pros?: string[];
  cons?: string[];
  risks?: string[];
  cost?: number;
  timeEstimate?: string;
}

interface MakeDecisionParams {
  decisionId: string;
  selectedAlternativeId: string;
  explanation: string;
  explanationAr: string;
  communicationPlan?: string;
}

interface CreateActionItemParams {
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
  assigneeId: string;
  assignedById: string;
  dueDate: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  meetingId?: string;
  decisionId?: string;
}

export class DecisionFrameworkService {
  /**
   * Generate sequential decision number - توليد رقم تسلسلي للقرار
   * Format: DEC-YEAR-SEQUENCE (e.g., DEC-2025-001)
   */
  async generateDecisionNumber(): Promise<string> {
    const year = new Date().getFullYear();

    const count = await prisma.boardDecisionSPADE.count({
      where: {
        decisionNumber: {
          startsWith: `${DECISION_PREFIX}-${year}-`,
        },
      },
    });

    const sequence = String(count + 1).padStart(3, '0');
    return `${DECISION_PREFIX}-${year}-${sequence}`;
  }

  /**
   * Generate sequential action item number - توليد رقم تسلسلي لبند العمل
   * Format: ACT-YEAR-SEQUENCE (e.g., ACT-2025-001)
   */
  async generateActionItemNumber(): Promise<string> {
    const year = new Date().getFullYear();

    const count = await prisma.actionItem.count({
      where: {
        itemNumber: {
          startsWith: `${ACTION_PREFIX}-${year}-`,
        },
      },
    });

    const sequence = String(count + 1).padStart(3, '0');
    return `${ACTION_PREFIX}-${year}-${sequence}`;
  }

  /**
   * Initiate SPADE decision - بدء قرار SPADE جديد
   */
  async initiateSPADE(params: InitiateSPADEParams) {
    const decisionNumber = await this.generateDecisionNumber();

    const decision = await prisma.boardDecisionSPADE.create({
      data: {
        decisionNumber,
        title: params.title,
        titleAr: params.titleAr,
        description: params.description,
        descriptionAr: params.descriptionAr,
        status: 'INITIATED',
        currentPhase: 'SETTING',
        decisionMakerId: params.decisionMakerId,
        initiatedById: params.initiatedById,
        deadline: params.deadline,
        meetingId: params.meetingId,
      },
      include: {
        decisionMaker: true,
        initiatedBy: true,
      },
    });

    return decision;
  }

  /**
   * Set context (S phase) - تحديد السياق
   */
  async setContext(params: SetContextParams) {
    const decision = await prisma.boardDecisionSPADE.update({
      where: { id: params.decisionId },
      data: {
        context: params.context,
        contextAr: params.contextAr,
        constraints: params.constraints,
        status: 'SETTING_PHASE',
        currentPhase: 'SETTING',
      },
    });

    return decision;
  }

  /**
   * Move to People phase - الانتقال لمرحلة المشاركين
   */
  async moveToPeoplePhase(decisionId: string) {
    return prisma.boardDecisionSPADE.update({
      where: { id: decisionId },
      data: {
        status: 'PEOPLE_PHASE',
        currentPhase: 'PEOPLE',
      },
    });
  }

  /**
   * Add consultant (P phase) - إضافة مستشار
   */
  async addConsultant(params: AddConsultantParams) {
    return prisma.boardMemberOnSPADE.create({
      data: {
        decisionId: params.decisionId,
        memberId: params.memberId,
        role: params.role,
      },
      include: {
        member: true,
      },
    });
  }

  /**
   * Add multiple consultants by role - إضافة مستشارين بالدور
   */
  async addConsultantsByRole(decisionId: string, roles: BoardRole[]) {
    const members = await prisma.boardMember.findMany({
      where: {
        role: { in: roles },
        status: 'ACTIVE',
      },
    });

    const consultants = await Promise.all(
      members.map(member =>
        this.addConsultant({
          decisionId,
          memberId: member.id,
          role: 'Contributor',
        })
      )
    );

    return consultants;
  }

  /**
   * Move to Alternatives phase - الانتقال لمرحلة البدائل
   */
  async moveToAlternativesPhase(decisionId: string) {
    return prisma.boardDecisionSPADE.update({
      where: { id: decisionId },
      data: {
        status: 'ALTERNATIVES_PHASE',
        currentPhase: 'ALTERNATIVES',
      },
    });
  }

  /**
   * Add alternative (A phase) - إضافة بديل
   */
  async addAlternative(params: AddAlternativeParams) {
    return prisma.sPADEAlternative.create({
      data: {
        decisionId: params.decisionId,
        title: params.title,
        titleAr: params.titleAr,
        description: params.description,
        descriptionAr: params.descriptionAr,
        proposedById: params.proposedById,
        pros: params.pros,
        cons: params.cons,
        risks: params.risks,
        cost: params.cost,
        timeEstimate: params.timeEstimate,
      },
      include: {
        proposedBy: true,
      },
    });
  }

  /**
   * Score alternative - تقييم بديل
   */
  async scoreAlternative(alternativeId: string, score: number) {
    return prisma.sPADEAlternative.update({
      where: { id: alternativeId },
      data: { score },
    });
  }

  /**
   * Vote for alternative - التصويت لبديل
   */
  async voteForAlternative(decisionId: string, memberId: string, alternativeId: string, opinion?: string, opinionAr?: string) {
    // Update consultant's vote
    await prisma.boardMemberOnSPADE.update({
      where: {
        decisionId_memberId: {
          decisionId,
          memberId,
        },
      },
      data: {
        votedFor: alternativeId,
        opinion,
        opinionAr,
      },
    });

    // Increment vote count
    await prisma.sPADEAlternative.update({
      where: { id: alternativeId },
      data: {
        votes: { increment: 1 },
      },
    });

    return { success: true };
  }

  /**
   * Move to Decide phase - الانتقال لمرحلة القرار
   */
  async moveToDecidePhase(decisionId: string) {
    return prisma.boardDecisionSPADE.update({
      where: { id: decisionId },
      data: {
        status: 'DECIDE_PHASE',
        currentPhase: 'DECIDE',
      },
    });
  }

  /**
   * Make decision (D phase) - اتخاذ القرار
   */
  async makeDecision(params: MakeDecisionParams) {
    const decision = await prisma.boardDecisionSPADE.update({
      where: { id: params.decisionId },
      data: {
        selectedAlternativeId: params.selectedAlternativeId,
        decidedAt: new Date(),
        status: 'EXPLAIN_PHASE',
        currentPhase: 'EXPLAIN',
        explanation: params.explanation,
        explanationAr: params.explanationAr,
        communicationPlan: params.communicationPlan,
      },
      include: {
        selectedAlternative: true,
        decisionMaker: true,
        alternatives: true,
        consultants: {
          include: {
            member: true,
          },
        },
      },
    });

    return decision;
  }

  /**
   * Complete decision - إتمام القرار
   */
  async completeDecision(decisionId: string) {
    return prisma.boardDecisionSPADE.update({
      where: { id: decisionId },
      data: {
        status: 'COMPLETED',
      },
    });
  }

  /**
   * Cancel decision - إلغاء القرار
   */
  async cancelDecision(decisionId: string, reason: string) {
    return prisma.boardDecisionSPADE.update({
      where: { id: decisionId },
      data: {
        status: 'CANCELLED',
        explanation: reason,
      },
    });
  }

  /**
   * Create action item - إنشاء بند عمل
   */
  async createActionItem(params: CreateActionItemParams) {
    const itemNumber = await this.generateActionItemNumber();

    return prisma.actionItem.create({
      data: {
        itemNumber,
        title: params.title,
        titleAr: params.titleAr,
        description: params.description,
        descriptionAr: params.descriptionAr,
        assigneeId: params.assigneeId,
        assignedById: params.assignedById,
        dueDate: params.dueDate,
        priority: params.priority,
        status: 'PENDING',
        meetingId: params.meetingId,
        decisionId: params.decisionId,
      },
      include: {
        assignee: true,
        assignedBy: true,
      },
    });
  }

  /**
   * Update action item status - تحديث حالة بند العمل
   */
  async updateActionItemStatus(itemId: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED') {
    const data: any = { status };

    if (status === 'COMPLETED') {
      data.completedAt = new Date();
    }

    return prisma.actionItem.update({
      where: { id: itemId },
      data,
    });
  }

  /**
   * Update action item progress - تحديث تقدم بند العمل
   */
  async updateActionItemProgress(itemId: string, progress: number, notes?: string) {
    return prisma.actionItem.update({
      where: { id: itemId },
      data: {
        progress,
        notes,
        status: progress >= 100 ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: progress >= 100 ? new Date() : null,
      },
    });
  }

  /**
   * Get decision with full details - الحصول على القرار بكامل التفاصيل
   */
  async getDecision(decisionId: string) {
    return prisma.boardDecisionSPADE.findUnique({
      where: { id: decisionId },
      include: {
        decisionMaker: true,
        initiatedBy: true,
        selectedAlternative: true,
        alternatives: {
          include: {
            proposedBy: true,
          },
          orderBy: { score: 'desc' },
        },
        consultants: {
          include: {
            member: true,
          },
        },
        actionItems: {
          include: {
            assignee: true,
          },
        },
        meeting: true,
      },
    });
  }

  /**
   * Get pending decisions - القرارات المعلقة
   */
  async getPendingDecisions() {
    return prisma.boardDecisionSPADE.findMany({
      where: {
        status: {
          notIn: ['COMPLETED', 'CANCELLED'],
        },
      },
      include: {
        decisionMaker: true,
        alternatives: true,
      },
      orderBy: [
        { deadline: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Get decisions by phase - القرارات حسب المرحلة
   */
  async getDecisionsByPhase(phase: SPADERole) {
    return prisma.boardDecisionSPADE.findMany({
      where: {
        currentPhase: phase,
        status: {
          notIn: ['COMPLETED', 'CANCELLED'],
        },
      },
      include: {
        decisionMaker: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get overdue action items - بنود العمل المتأخرة
   */
  async getOverdueActionItems() {
    const now = new Date();

    // First update overdue items
    await prisma.actionItem.updateMany({
      where: {
        dueDate: { lt: now },
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
      data: {
        status: 'OVERDUE',
      },
    });

    // Then fetch them
    return prisma.actionItem.findMany({
      where: {
        status: 'OVERDUE',
      },
      include: {
        assignee: true,
        meeting: true,
        decision: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  /**
   * Get action items for member - بنود العمل المخصصة لعضو
   */
  async getActionItemsForMember(memberId: string) {
    return prisma.actionItem.findMany({
      where: {
        assigneeId: memberId,
        status: { in: ['PENDING', 'IN_PROGRESS', 'OVERDUE'] },
      },
      include: {
        meeting: true,
        decision: true,
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    });
  }

  /**
   * Get decision dashboard - لوحة القرارات
   */
  async getDecisionDashboard() {
    const [
      initiatedCount,
      settingCount,
      peopleCount,
      alternativesCount,
      decideCount,
      explainCount,
      completedCount,
      pendingActionItems,
      overdueActionItems,
    ] = await Promise.all([
      prisma.boardDecisionSPADE.count({ where: { status: 'INITIATED' } }),
      prisma.boardDecisionSPADE.count({ where: { status: 'SETTING_PHASE' } }),
      prisma.boardDecisionSPADE.count({ where: { status: 'PEOPLE_PHASE' } }),
      prisma.boardDecisionSPADE.count({ where: { status: 'ALTERNATIVES_PHASE' } }),
      prisma.boardDecisionSPADE.count({ where: { status: 'DECIDE_PHASE' } }),
      prisma.boardDecisionSPADE.count({ where: { status: 'EXPLAIN_PHASE' } }),
      prisma.boardDecisionSPADE.count({ where: { status: 'COMPLETED' } }),
      prisma.actionItem.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
      prisma.actionItem.count({ where: { status: 'OVERDUE' } }),
    ]);

    const recentDecisions = await prisma.boardDecisionSPADE.findMany({
      where: {
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
      },
      include: {
        decisionMaker: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      summary: {
        byPhase: {
          initiated: initiatedCount,
          setting: settingCount,
          people: peopleCount,
          alternatives: alternativesCount,
          decide: decideCount,
          explain: explainCount,
        },
        completed: completedCount,
        inProgress: initiatedCount + settingCount + peopleCount + alternativesCount + decideCount + explainCount,
      },
      actionItems: {
        pending: pendingActionItems,
        overdue: overdueActionItems,
      },
      recentDecisions,
    };
  }
}

export const decisionFrameworkService = new DecisionFrameworkService();
