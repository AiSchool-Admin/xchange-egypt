/**
 * @fileoverview بناء وإدارة الرسم البياني للمقايضة
 * @description هيكل بيانات Graph لتمثيل عروض المقايضة والعلاقات بينها
 * @author Xchange Real Estate
 * @version 1.0.0
 */

// ============================================
// Types & Interfaces
// ============================================

/**
 * نوع العنصر في المقايضة
 */
export type BarterItemType = 'PROPERTY' | 'CAR' | 'GOLD' | 'OTHER';

/**
 * عنصر في عرض المقايضة
 */
export interface BarterItem {
  type: BarterItemType;
  id: string;
  estimatedValue: number;
  ownerId: string;
  title: string;
  verified: boolean;
}

/**
 * معايير البحث عن عنصر
 */
export interface SearchCriteria {
  type: BarterItemType;
  propertyType?: string;
  governorate?: string;
  city?: string;
  minArea?: number;
  maxArea?: number;
  minBedrooms?: number;
  features?: string[];
}

/**
 * عرض مقايضة
 */
export interface BarterOffer {
  id: string;
  userId: string;
  userName: string;
  userVerified: boolean;
  offeredItem: BarterItem;
  seekingItem: {
    type: BarterItemType;
    minValue: number;
    maxValue: number;
    criteria: SearchCriteria;
  };
  maxCashDifference: number;
  cashDirection: 'GIVE' | 'RECEIVE' | 'EITHER';
  expiresAt: Date;
  createdAt: Date;
  status: 'ACTIVE' | 'MATCHED' | 'EXPIRED' | 'CANCELLED';
}

/**
 * عقدة في الرسم البياني
 */
export interface GraphNode {
  id: string;
  offer: BarterOffer;
  edges: GraphEdge[];
}

/**
 * حافة في الرسم البياني (اتصال بين عرضين)
 */
export interface GraphEdge {
  fromNodeId: string;
  toNodeId: string;
  weight: number; // قوة التوافق (0-1)
  valueDifference: number; // الفرق في القيمة
  compatible: boolean;
}

/**
 * دورة في الرسم البياني (سلسلة مقايضة)
 */
export interface GraphCycle {
  nodeIds: string[];
  totalValue: number;
  maxValueDiff: number;
  avgWeight: number;
  length: number;
}

// ============================================
// BarterGraph Class
// ============================================

/**
 * الرسم البياني للمقايضة
 * يمثل جميع عروض المقايضة والعلاقات بينها
 */
export class BarterGraph {
  private nodes: Map<string, GraphNode>;
  private edges: GraphEdge[];

  constructor() {
    this.nodes = new Map();
    this.edges = [];
  }

  /**
   * إضافة عقدة (عرض مقايضة) للرسم البياني
   * @param offer عرض المقايضة
   */
  addNode(offer: BarterOffer): void {
    const node: GraphNode = {
      id: offer.id,
      offer,
      edges: [],
    };
    this.nodes.set(offer.id, node);

    // إنشاء الحواف مع العقد الموجودة
    this.createEdgesForNode(node);
  }

  /**
   * إزالة عقدة من الرسم البياني
   * @param offerId معرف العرض
   */
  removeNode(offerId: string): void {
    const node = this.nodes.get(offerId);
    if (!node) return;

    // إزالة الحواف المرتبطة
    this.edges = this.edges.filter(
      edge => edge.fromNodeId !== offerId && edge.toNodeId !== offerId
    );

    // تحديث الحواف في العقد الأخرى
    for (const [, otherNode] of this.nodes) {
      otherNode.edges = otherNode.edges.filter(
        edge => edge.fromNodeId !== offerId && edge.toNodeId !== offerId
      );
    }

    this.nodes.delete(offerId);
  }

  /**
   * الحصول على عقدة
   * @param offerId معرف العرض
   */
  getNode(offerId: string): GraphNode | undefined {
    return this.nodes.get(offerId);
  }

  /**
   * الحصول على جميع العقد
   */
  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * الحصول على جميع الحواف
   */
  getAllEdges(): GraphEdge[] {
    return this.edges;
  }

  /**
   * إنشاء حواف لعقدة جديدة
   * @param node العقدة الجديدة
   */
  private createEdgesForNode(node: GraphNode): void {
    for (const [otherId, otherNode] of this.nodes) {
      if (otherId === node.id) continue;

      // فحص التوافق المتبادل
      const forwardCompatibility = this.checkCompatibility(node.offer, otherNode.offer);
      const backwardCompatibility = this.checkCompatibility(otherNode.offer, node.offer);

      // إنشاء حافة إذا كان هناك توافق في أي اتجاه
      if (forwardCompatibility.compatible) {
        const edge: GraphEdge = {
          fromNodeId: node.id,
          toNodeId: otherId,
          weight: forwardCompatibility.weight,
          valueDifference: forwardCompatibility.valueDifference,
          compatible: true,
        };
        this.edges.push(edge);
        node.edges.push(edge);
      }

      if (backwardCompatibility.compatible) {
        const edge: GraphEdge = {
          fromNodeId: otherId,
          toNodeId: node.id,
          weight: backwardCompatibility.weight,
          valueDifference: backwardCompatibility.valueDifference,
          compatible: true,
        };
        this.edges.push(edge);
        otherNode.edges.push(edge);
      }
    }
  }

  /**
   * فحص التوافق بين عرضين
   * @param offer1 العرض الأول (المعطي)
   * @param offer2 العرض الثاني (المستقبل)
   */
  private checkCompatibility(
    offer1: BarterOffer,
    offer2: BarterOffer
  ): { compatible: boolean; weight: number; valueDifference: number } {
    // لا يمكن المقايضة مع النفس
    if (offer1.userId === offer2.userId) {
      return { compatible: false, weight: 0, valueDifference: 0 };
    }

    // فحص انتهاء الصلاحية
    const now = new Date();
    if (offer1.expiresAt < now || offer2.expiresAt < now) {
      return { compatible: false, weight: 0, valueDifference: 0 };
    }

    // فحص الحالة
    if (offer1.status !== 'ACTIVE' || offer2.status !== 'ACTIVE') {
      return { compatible: false, weight: 0, valueDifference: 0 };
    }

    // فحص نوع العنصر المطلوب
    const offeredType = offer1.offeredItem.type;
    const seekingType = offer2.seekingItem.type;
    if (offeredType !== seekingType) {
      return { compatible: false, weight: 0, valueDifference: 0 };
    }

    // فحص نطاق القيمة
    const offeredValue = offer1.offeredItem.estimatedValue;
    const minValue = offer2.seekingItem.minValue;
    const maxValue = offer2.seekingItem.maxValue;
    if (offeredValue < minValue || offeredValue > maxValue) {
      return { compatible: false, weight: 0, valueDifference: 0 };
    }

    // فحص الفرق النقدي
    const valueDifference = offer2.offeredItem.estimatedValue - offeredValue;
    if (Math.abs(valueDifference) > Math.max(offer1.maxCashDifference, offer2.maxCashDifference)) {
      return { compatible: false, weight: 0, valueDifference: 0 };
    }

    // حساب وزن التوافق
    let weight = 0;

    // 1. تطابق القيمة (40%)
    const valueRatio = Math.min(offeredValue, maxValue) / Math.max(offeredValue, minValue);
    weight += valueRatio * 0.4;

    // 2. فحص المعايير الإضافية (30%)
    const criteriaMatch = this.matchCriteria(offer1.offeredItem, offer2.seekingItem.criteria);
    weight += criteriaMatch * 0.3;

    // 3. مستوى التحقق (15%)
    if (offer1.offeredItem.verified) weight += 0.10;
    if (offer1.userVerified) weight += 0.05;

    // 4. حداثة العرض (15%)
    const ageInDays = (now.getTime() - offer1.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const freshnessScore = Math.max(0, 1 - (ageInDays / 30));
    weight += freshnessScore * 0.15;

    return {
      compatible: weight >= 0.3, // الحد الأدنى للتوافق
      weight,
      valueDifference,
    };
  }

  /**
   * مطابقة المعايير
   * @param item العنصر المعروض
   * @param criteria معايير البحث
   */
  private matchCriteria(item: BarterItem, criteria: SearchCriteria): number {
    let matchScore = 0;
    let totalCriteria = 0;

    // نوع العنصر (مطلوب)
    if (criteria.type === item.type) {
      matchScore += 1;
    }
    totalCriteria += 1;

    // المنطقة (إذا محددة)
    // Note: هذه المعايير تحتاج بيانات إضافية من العقار
    // سيتم تحسينها عند ربطها بقاعدة البيانات

    return totalCriteria > 0 ? matchScore / totalCriteria : 1;
  }

  /**
   * إيجاد جميع الدورات في الرسم البياني باستخدام DFS
   * @param maxLength الحد الأقصى لطول الدورة
   */
  findAllCycles(maxLength: number = 5): GraphCycle[] {
    const cycles: GraphCycle[] = [];
    const visited = new Set<string>();

    for (const [nodeId] of this.nodes) {
      this.dfs(nodeId, [nodeId], visited, cycles, maxLength);
    }

    // إزالة الدورات المكررة
    return this.removeDuplicateCycles(cycles);
  }

  /**
   * البحث بالعمق أولاً (DFS) لإيجاد الدورات
   * @param currentId العقدة الحالية
   * @param path المسار الحالي
   * @param globalVisited العقد المزارة عالمياً
   * @param cycles الدورات المكتشفة
   * @param maxLength الحد الأقصى للطول
   */
  private dfs(
    currentId: string,
    path: string[],
    globalVisited: Set<string>,
    cycles: GraphCycle[],
    maxLength: number
  ): void {
    if (path.length > maxLength) return;

    const currentNode = this.nodes.get(currentId);
    if (!currentNode) return;

    // فحص الحواف الخارجة
    for (const edge of currentNode.edges) {
      if (!edge.compatible) continue;

      const nextId = edge.toNodeId;

      // هل وصلنا لبداية الدورة؟
      if (nextId === path[0] && path.length >= 2) {
        // وجدنا دورة!
        const cycle = this.createCycle(path);
        if (cycle) {
          cycles.push(cycle);
        }
        continue;
      }

      // هل هذه العقدة موجودة في المسار الحالي؟
      if (path.includes(nextId)) continue;

      // الاستمرار في البحث
      this.dfs(nextId, [...path, nextId], globalVisited, cycles, maxLength);
    }

    globalVisited.add(currentId);
  }

  /**
   * إنشاء كائن دورة من مسار
   * @param nodeIds معرفات العقد في الدورة
   */
  private createCycle(nodeIds: string[]): GraphCycle | null {
    if (nodeIds.length < 2) return null;

    let totalValue = 0;
    let maxValueDiff = 0;
    let totalWeight = 0;
    let edgeCount = 0;

    for (let i = 0; i < nodeIds.length; i++) {
      const fromId = nodeIds[i];
      const toId = nodeIds[(i + 1) % nodeIds.length];

      const node = this.nodes.get(fromId);
      if (!node) return null;

      totalValue += node.offer.offeredItem.estimatedValue;

      // إيجاد الحافة
      const edge = node.edges.find(e => e.toNodeId === toId);
      if (edge) {
        maxValueDiff = Math.max(maxValueDiff, Math.abs(edge.valueDifference));
        totalWeight += edge.weight;
        edgeCount++;
      }
    }

    return {
      nodeIds,
      totalValue,
      maxValueDiff,
      avgWeight: edgeCount > 0 ? totalWeight / edgeCount : 0,
      length: nodeIds.length,
    };
  }

  /**
   * إزالة الدورات المكررة
   * @param cycles الدورات المكتشفة
   */
  private removeDuplicateCycles(cycles: GraphCycle[]): GraphCycle[] {
    const uniqueCycles: GraphCycle[] = [];
    const seen = new Set<string>();

    for (const cycle of cycles) {
      // إنشاء معرف فريد للدورة (مرتب)
      const sortedIds = [...cycle.nodeIds].sort().join('-');
      if (!seen.has(sortedIds)) {
        seen.add(sortedIds);
        uniqueCycles.push(cycle);
      }
    }

    return uniqueCycles;
  }

  /**
   * إيجاد أفضل الدورات
   * @param limit عدد النتائج المطلوبة
   */
  findBestCycles(limit: number = 10): GraphCycle[] {
    const allCycles = this.findAllCycles();

    // ترتيب حسب: (avgWeight * 0.5) + (length_penalty * 0.3) + (value_balance * 0.2)
    return allCycles
      .sort((a, b) => {
        const scoreA = this.calculateCycleScore(a);
        const scoreB = this.calculateCycleScore(b);
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  /**
   * حساب درجة الدورة
   * @param cycle الدورة
   */
  private calculateCycleScore(cycle: GraphCycle): number {
    // متوسط الوزن (50%)
    const weightScore = cycle.avgWeight * 0.5;

    // عقوبة الطول - الدورات الأقصر أفضل (30%)
    const lengthPenalty = Math.max(0, 1 - ((cycle.length - 2) * 0.2)) * 0.3;

    // توازن القيمة - أقل فرق أفضل (20%)
    const avgValue = cycle.totalValue / cycle.length;
    const valueBalance = Math.max(0, 1 - (cycle.maxValueDiff / avgValue)) * 0.2;

    return weightScore + lengthPenalty + valueBalance;
  }

  /**
   * الحصول على إحصائيات الرسم البياني
   */
  getStats(): {
    totalNodes: number;
    totalEdges: number;
    activeNodes: number;
    avgEdgesPerNode: number;
    connectivity: number;
  } {
    const totalNodes = this.nodes.size;
    const totalEdges = this.edges.length;

    let activeNodes = 0;
    for (const [, node] of this.nodes) {
      if (node.offer.status === 'ACTIVE') {
        activeNodes++;
      }
    }

    const avgEdgesPerNode = totalNodes > 0 ? totalEdges / totalNodes : 0;

    // نسبة الاتصالية
    const maxPossibleEdges = totalNodes * (totalNodes - 1);
    const connectivity = maxPossibleEdges > 0 ? totalEdges / maxPossibleEdges : 0;

    return {
      totalNodes,
      totalEdges,
      activeNodes,
      avgEdgesPerNode,
      connectivity,
    };
  }

  /**
   * تنظيف العقد المنتهية
   */
  cleanupExpiredNodes(): number {
    const now = new Date();
    let removed = 0;

    for (const [nodeId, node] of this.nodes) {
      if (node.offer.expiresAt < now || node.offer.status !== 'ACTIVE') {
        this.removeNode(nodeId);
        removed++;
      }
    }

    return removed;
  }

  /**
   * تصدير الرسم البياني بتنسيق JSON
   */
  toJSON(): {
    nodes: Array<{ id: string; offer: BarterOffer }>;
    edges: GraphEdge[];
  } {
    const nodes = Array.from(this.nodes.values()).map(node => ({
      id: node.id,
      offer: node.offer,
    }));

    return { nodes, edges: this.edges };
  }

  /**
   * استيراد رسم بياني من JSON
   */
  static fromJSON(data: {
    nodes: Array<{ id: string; offer: BarterOffer }>;
    edges: GraphEdge[];
  }): BarterGraph {
    const graph = new BarterGraph();

    for (const nodeData of data.nodes) {
      graph.nodes.set(nodeData.id, {
        id: nodeData.id,
        offer: nodeData.offer,
        edges: [],
      });
    }

    for (const edge of data.edges) {
      graph.edges.push(edge);
      const fromNode = graph.nodes.get(edge.fromNodeId);
      if (fromNode) {
        fromNode.edges.push(edge);
      }
    }

    return graph;
  }
}

export default BarterGraph;
