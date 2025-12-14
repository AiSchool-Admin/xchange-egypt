/**
 * @fileoverview نظام المقايضة متعدد الأطراف (Multi-Party Barter Matching)
 * @description خوارزمية متقدمة لمطابقة عروض المقايضة بين عدة أطراف
 * @author Xchange Real Estate
 * @version 1.0.0
 */

import { PropertyStatus } from '@prisma/client';
import prisma from '../../lib/prisma';
import {
  BarterGraph,
  BarterOffer,
  BarterItem,
  BarterItemType,
  GraphCycle,
  SearchCriteria,
} from './barter-graph';

// ============================================
// Types & Interfaces
// ============================================

/**
 * تدفق نقدي في سلسلة المقايضة
 */
export interface CashFlow {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
  reason: string;
}

/**
 * مشارك في سلسلة المقايضة
 */
export interface ChainParticipant {
  userId: string;
  userName: string;
  userVerified: boolean;
  gives: BarterItem;
  receives: BarterItem;
  cashDelta: number; // موجب = يدفع، سالب = يستلم
}

/**
 * سلسلة مقايضة كاملة
 */
export interface BarterChain {
  id: string;
  participants: ChainParticipant[];
  items: BarterItem[];
  values: number[];
  totalImbalance: number;
  cashFlows: CashFlow[];
  chainLength: number;
  fairnessScore: number;
  feasibilityScore: number;
  simplicityScore: number;
  cashEfficiencyScore: number;
  totalScore: number;
  status: 'PROPOSED' | 'PENDING_APPROVAL' | 'APPROVED' | 'EXECUTING' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  expiresAt: Date;
}

/**
 * نتيجة المطابقة
 */
export interface MatchResult {
  chains: BarterChain[];
  totalMatches: number;
  processingTimeMs: number;
  graphStats: {
    totalNodes: number;
    totalEdges: number;
    connectivity: number;
  };
}

/**
 * خيارات المطابقة
 */
export interface MatchOptions {
  maxChainLength?: number;
  minFairnessScore?: number;
  maxCashFlowPercent?: number;
  prioritizeSimplicity?: boolean;
  includeExpired?: boolean;
  limit?: number;
}

// ============================================
// Constants
// ============================================

/**
 * معاملات تحويل بين أنواع العناصر المختلفة
 * (عقوبة السيولة للتحويل بين الفئات)
 */
const CROSS_CATEGORY_FACTORS: Record<string, number> = {
  'PROPERTY_PROPERTY': 1.0,
  'CAR_CAR': 1.0,
  'PROPERTY_CAR': 0.8,
  'CAR_PROPERTY': 0.8,
  'GOLD_GOLD': 1.0,
  'PROPERTY_GOLD': 0.85,
  'GOLD_PROPERTY': 0.85,
  'CAR_GOLD': 0.9,
  'GOLD_CAR': 0.9,
};

/**
 * الحد الأقصى للفرق النقدي كنسبة من القيمة
 */
const MAX_CASH_DIFFERENCE_RATIO = 0.25;

/**
 * الحد الأدنى لنسبة العدالة
 */
const MIN_FAIRNESS_THRESHOLD = 0.6;

// ============================================
// BarterMatcher Class
// ============================================

/**
 * محرك مطابقة المقايضة
 */
export class BarterMatcher {
  private graph: BarterGraph;

  constructor() {
    this.graph = new BarterGraph();
  }

  /**
   * تحميل عروض المقايضة النشطة من قاعدة البيانات
   */
  async loadActiveOffers(): Promise<number> {
    // تحميل عروض مقايضة العقارات
    const propertyOffers = await prisma.propertyBarterProposal.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        proposer: {
          select: {
            id: true,
            fullName: true,
            phoneVerified: true,
            emailVerified: true,
          },
        },
        offeredProperty: {
          select: {
            id: true,
            title: true,
            salePrice: true,
            estimatedValue: true,
            verificationLevel: true,
          },
        },
        requestedProperty: {
          select: {
            id: true,
            title: true,
            salePrice: true,
            estimatedValue: true,
          },
        },
      },
    });

    // تحويل إلى عروض مقايضة عامة وإضافتها للرسم البياني
    let count = 0;
    for (const proposal of propertyOffers) {
      const offer: BarterOffer = {
        id: proposal.id,
        userId: proposal.proposerId,
        userName: proposal.proposer.fullName,
        userVerified: proposal.proposer.phoneVerified && proposal.proposer.emailVerified,
        offeredItem: {
          type: 'PROPERTY',
          id: proposal.offeredPropertyId,
          estimatedValue: proposal.offeredProperty.salePrice || proposal.offeredProperty.estimatedValue || 0,
          ownerId: proposal.proposerId,
          title: proposal.offeredProperty.title,
          verified: proposal.offeredProperty.verificationLevel !== 'UNVERIFIED',
        },
        seekingItem: {
          type: 'PROPERTY',
          minValue: (proposal.requestedProperty.salePrice || 0) * 0.8,
          maxValue: (proposal.requestedProperty.salePrice || 0) * 1.2,
          criteria: {
            type: 'PROPERTY',
          },
        },
        maxCashDifference: proposal.cashDifference || 0,
        cashDirection: proposal.cashPayer === 'proposer' ? 'GIVE' : 'RECEIVE',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم
        createdAt: proposal.createdAt,
        status: 'ACTIVE',
      };

      this.graph.addNode(offer);
      count++;
    }

    // تحميل العقارات المفتوحة للمقايضة
    const openForBarter = await prisma.property.findMany({
      where: {
        status: PropertyStatus.ACTIVE,
        openForBarter: true,
      },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            phoneVerified: true,
            emailVerified: true,
          },
        },
      },
      take: 500,
    });

    for (const property of openForBarter) {
      const barterPrefs = property.barterPreferences as Record<string, any> || {};

      const offer: BarterOffer = {
        id: `property-${property.id}`,
        userId: property.ownerId,
        userName: property.owner.fullName,
        userVerified: property.owner.phoneVerified && property.owner.emailVerified,
        offeredItem: {
          type: 'PROPERTY',
          id: property.id,
          estimatedValue: property.salePrice || property.estimatedValue || 0,
          ownerId: property.ownerId,
          title: property.title,
          verified: property.verificationLevel !== 'UNVERIFIED',
        },
        seekingItem: {
          type: barterPrefs.seekingType || 'PROPERTY',
          minValue: barterPrefs.minValue || (property.salePrice || 0) * 0.7,
          maxValue: barterPrefs.maxValue || (property.salePrice || 0) * 1.3,
          criteria: {
            type: barterPrefs.seekingType || 'PROPERTY',
            governorate: barterPrefs.preferredGovernorate,
            propertyType: barterPrefs.preferredPropertyType,
          },
        },
        maxCashDifference: barterPrefs.maxCashDiff || (property.salePrice || 0) * 0.2,
        cashDirection: barterPrefs.cashDirection || 'EITHER',
        expiresAt: property.expiresAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        createdAt: property.createdAt,
        status: 'ACTIVE',
      };

      this.graph.addNode(offer);
      count++;
    }

    return count;
  }

  /**
   * إضافة عرض مقايضة جديد
   * @param offer عرض المقايضة
   */
  addOffer(offer: BarterOffer): void {
    this.graph.addNode(offer);
  }

  /**
   * إزالة عرض مقايضة
   * @param offerId معرف العرض
   */
  removeOffer(offerId: string): void {
    this.graph.removeNode(offerId);
  }

  /**
   * البحث عن سلاسل المقايضة المتاحة
   * @param options خيارات البحث
   */
  async findMatches(options: MatchOptions = {}): Promise<MatchResult> {
    const startTime = Date.now();

    const {
      maxChainLength = 5,
      minFairnessScore = MIN_FAIRNESS_THRESHOLD,
      limit = 20,
    } = options;

    // إيجاد الدورات في الرسم البياني
    const cycles = this.graph.findAllCycles(maxChainLength);

    // تحويل الدورات إلى سلاسل مقايضة
    const chains: BarterChain[] = [];

    for (const cycle of cycles) {
      const chain = this.cycleToChain(cycle);
      if (chain && chain.fairnessScore >= minFairnessScore) {
        chains.push(chain);
      }
    }

    // ترتيب السلاسل حسب الدرجة الإجمالية
    chains.sort((a, b) => b.totalScore - a.totalScore);

    const processingTimeMs = Date.now() - startTime;
    const graphStats = this.graph.getStats();

    return {
      chains: chains.slice(0, limit),
      totalMatches: chains.length,
      processingTimeMs,
      graphStats: {
        totalNodes: graphStats.totalNodes,
        totalEdges: graphStats.totalEdges,
        connectivity: graphStats.connectivity,
      },
    };
  }

  /**
   * تحويل دورة إلى سلسلة مقايضة
   * @param cycle الدورة
   */
  private cycleToChain(cycle: GraphCycle): BarterChain | null {
    const participants: ChainParticipant[] = [];
    const items: BarterItem[] = [];
    const values: number[] = [];
    const cashFlows: CashFlow[] = [];

    // بناء قائمة المشاركين
    for (let i = 0; i < cycle.nodeIds.length; i++) {
      const currentNode = this.graph.getNode(cycle.nodeIds[i]);
      const nextNode = this.graph.getNode(cycle.nodeIds[(i + 1) % cycle.nodeIds.length]);

      if (!currentNode || !nextNode) return null;

      const gives = currentNode.offer.offeredItem;
      const receives = nextNode.offer.offeredItem;

      items.push(gives);
      values.push(gives.estimatedValue);

      // حساب الفرق النقدي
      const valueDiff = receives.estimatedValue - gives.estimatedValue;

      participants.push({
        userId: currentNode.offer.userId,
        userName: currentNode.offer.userName,
        userVerified: currentNode.offer.userVerified,
        gives,
        receives,
        cashDelta: valueDiff > 0 ? valueDiff : 0,
      });
    }

    // حساب التدفقات النقدية
    const totalValue = values.reduce((a, b) => a + b, 0);
    let totalCashFlow = 0;

    for (let i = 0; i < participants.length; i++) {
      const current = participants[i];
      const prev = participants[(i - 1 + participants.length) % participants.length];

      if (current.cashDelta > 0) {
        cashFlows.push({
          from: current.userId,
          fromName: current.userName,
          to: prev.userId,
          toName: prev.userName,
          amount: current.cashDelta,
          reason: `تعويض فرق القيمة`,
        });
        totalCashFlow += current.cashDelta;
      }
    }

    // حساب الدرجات
    const fairnessScore = this.calculateFairness(participants);
    const feasibilityScore = this.calculateFeasibility(participants);
    const simplicityScore = this.calculateSimplicity(cycle.length);
    const cashEfficiencyScore = this.calculateCashEfficiency(totalCashFlow, totalValue);

    // الدرجة الإجمالية
    const totalScore =
      fairnessScore * 0.40 +
      simplicityScore * 0.30 +
      cashEfficiencyScore * 0.20 +
      feasibilityScore * 0.10;

    // حساب عدم التوازن الإجمالي
    const totalImbalance = participants.reduce(
      (sum, p) => sum + Math.abs(p.cashDelta),
      0
    );

    return {
      id: this.generateChainId(),
      participants,
      items,
      values,
      totalImbalance,
      cashFlows,
      chainLength: cycle.length,
      fairnessScore,
      feasibilityScore,
      simplicityScore,
      cashEfficiencyScore,
      totalScore,
      status: 'PROPOSED',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 أيام
    };
  }

  /**
   * حساب درجة العدالة
   * @param participants المشاركون
   */
  private calculateFairness(participants: ChainParticipant[]): number {
    if (participants.length === 0) return 0;

    let fairnessSum = 0;

    for (const participant of participants) {
      const givesValue = participant.gives.estimatedValue;
      const receivesValue = participant.receives.estimatedValue;
      const cashDelta = participant.cashDelta;

      // القيمة الصافية التي يحصل عليها المشارك
      const netValue = receivesValue - givesValue - cashDelta;
      const avgValue = (givesValue + receivesValue) / 2;

      // نسبة العدالة للمشارك (كلما اقتربت من 0 كانت أفضل)
      const fairnessRatio = avgValue > 0 ? 1 - Math.abs(netValue) / avgValue : 0;
      fairnessSum += Math.max(0, Math.min(1, fairnessRatio));
    }

    return fairnessSum / participants.length;
  }

  /**
   * حساب درجة الجدوى
   * @param participants المشاركون
   */
  private calculateFeasibility(participants: ChainParticipant[]): number {
    let score = 1;

    for (const participant of participants) {
      // عقوبة إذا لم يكن المستخدم موثقاً
      if (!participant.userVerified) {
        score *= 0.9;
      }

      // عقوبة إذا لم يكن العنصر موثقاً
      if (!participant.gives.verified) {
        score *= 0.85;
      }

      // عقوبة إذا كان الفرق النقدي كبيراً
      const cashRatio = participant.cashDelta / participant.gives.estimatedValue;
      if (cashRatio > MAX_CASH_DIFFERENCE_RATIO) {
        score *= 0.8;
      }
    }

    return Math.max(0, score);
  }

  /**
   * حساب درجة البساطة
   * @param chainLength طول السلسلة
   */
  private calculateSimplicity(chainLength: number): number {
    // السلاسل الأقصر أبسط
    if (chainLength === 2) return 1.0;
    if (chainLength === 3) return 0.85;
    if (chainLength === 4) return 0.65;
    if (chainLength === 5) return 0.45;
    return 0.3;
  }

  /**
   * حساب كفاءة النقد
   * @param totalCashFlow إجمالي التدفق النقدي
   * @param totalValue إجمالي القيمة
   */
  private calculateCashEfficiency(totalCashFlow: number, totalValue: number): number {
    if (totalValue === 0) return 1;
    const cashRatio = totalCashFlow / totalValue;
    return Math.max(0, 1 - cashRatio * 2);
  }

  /**
   * توليد معرف فريد للسلسلة
   */
  private generateChainId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `chain_${timestamp}_${random}`;
  }

  /**
   * البحث عن مطابقات مباشرة (ثنائية)
   * @param offerId معرف العرض
   */
  async findDirectMatches(offerId: string): Promise<BarterChain[]> {
    const node = this.graph.getNode(offerId);
    if (!node) return [];

    const matches: BarterChain[] = [];

    for (const edge of node.edges) {
      if (!edge.compatible) continue;

      const targetNode = this.graph.getNode(edge.toNodeId);
      if (!targetNode) continue;

      // فحص المطابقة العكسية
      const reverseEdge = targetNode.edges.find(e => e.toNodeId === offerId);
      if (!reverseEdge?.compatible) continue;

      // إنشاء سلسلة ثنائية
      const cycle: GraphCycle = {
        nodeIds: [offerId, edge.toNodeId],
        totalValue: node.offer.offeredItem.estimatedValue + targetNode.offer.offeredItem.estimatedValue,
        maxValueDiff: Math.abs(edge.valueDifference),
        avgWeight: (edge.weight + reverseEdge.weight) / 2,
        length: 2,
      };

      const chain = this.cycleToChain(cycle);
      if (chain) {
        matches.push(chain);
      }
    }

    return matches.sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * التحقق من صحة سلسلة المقايضة
   * @param chain السلسلة
   */
  async validateChain(chain: BarterChain): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. التحقق من وجود جميع المشاركين
    for (const participant of chain.participants) {
      const user = await prisma.user.findUnique({
        where: { id: participant.userId },
        select: { id: true, status: true },
      });

      if (!user) {
        errors.push(`المستخدم ${participant.userName} غير موجود`);
      } else if (user.status !== 'ACTIVE') {
        errors.push(`حساب ${participant.userName} غير نشط`);
      }
    }

    // 2. التحقق من توفر العناصر
    for (const item of chain.items) {
      if (item.type === 'PROPERTY') {
        const property = await prisma.property.findUnique({
          where: { id: item.id },
          select: { status: true, ownerId: true },
        });

        if (!property) {
          errors.push(`العقار ${item.title} غير موجود`);
        } else if (property.status !== PropertyStatus.ACTIVE) {
          errors.push(`العقار ${item.title} غير متاح للمقايضة`);
        }
      }
    }

    // 3. التحقق من الحدود النقدية
    for (const participant of chain.participants) {
      if (participant.cashDelta > participant.gives.estimatedValue * MAX_CASH_DIFFERENCE_RATIO) {
        warnings.push(`الفرق النقدي لـ ${participant.userName} أعلى من المعتاد`);
      }
    }

    // 4. التحقق من العدالة
    if (chain.fairnessScore < MIN_FAIRNESS_THRESHOLD) {
      warnings.push(`درجة العدالة منخفضة (${(chain.fairnessScore * 100).toFixed(0)}%)`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * حفظ سلسلة المقايضة في قاعدة البيانات
   * @param chain السلسلة
   */
  async saveChain(chain: BarterChain): Promise<string> {
    // إنشاء سجل السلسلة
    const barterChain = await prisma.barterChain.create({
      data: {
        chainData: chain as any,
        status: 'PENDING_PARTICIPANTS',
        participantCount: chain.participants.length,
        totalValue: chain.values.reduce((a, b) => a + b, 0),
        totalCashFlow: chain.cashFlows.reduce((a, b) => a + b.amount, 0),
        fairnessScore: chain.fairnessScore,
        expiresAt: chain.expiresAt,
      },
    });

    // إنشاء سجلات المشاركين
    for (const participant of chain.participants) {
      await prisma.barterParticipant.create({
        data: {
          chainId: barterChain.id,
          userId: participant.userId,
          role: 'PARTICIPANT',
          offeredItemType: participant.gives.type,
          offeredItemId: participant.gives.id,
          offeredValue: participant.gives.estimatedValue,
          receivedItemType: participant.receives.type,
          receivedItemId: participant.receives.id,
          receivedValue: participant.receives.estimatedValue,
          cashDelta: participant.cashDelta,
          status: 'PENDING',
        },
      });
    }

    return barterChain.id;
  }

  /**
   * الحصول على إحصائيات المطابقة
   */
  getStats(): {
    graphStats: ReturnType<typeof this.graph.getStats>;
    potentialMatches: number;
  } {
    const graphStats = this.graph.getStats();
    const cycles = this.graph.findAllCycles(5);

    return {
      graphStats,
      potentialMatches: cycles.length,
    };
  }

  /**
   * تنظيف العروض المنتهية
   */
  cleanup(): number {
    return this.graph.cleanupExpiredNodes();
  }
}

// ============================================
// Singleton Instance
// ============================================

let matcherInstance: BarterMatcher | null = null;

/**
 * الحصول على نسخة المطابق
 */
export function getBarterMatcher(): BarterMatcher {
  if (!matcherInstance) {
    matcherInstance = new BarterMatcher();
  }
  return matcherInstance;
}

/**
 * تهيئة المطابق وتحميل العروض
 */
export async function initializeBarterMatcher(): Promise<BarterMatcher> {
  const matcher = getBarterMatcher();
  await matcher.loadActiveOffers();
  return matcher;
}

export default BarterMatcher;
