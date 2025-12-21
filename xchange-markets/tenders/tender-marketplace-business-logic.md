# XCHANGE TENDER MARKETPLACE - BUSINESS LOGIC & ALGORITHMS
# منطق الأعمال والخوارزميات لسوق المناقصات

---

## 🎯 1. VENDOR TRUST SCORE ALGORITHM (خوارزمية نقاط ثقة المورد)

```typescript
/**
 * حساب نقاط الثقة للمورد
 * Trust Score = Weighted average of multiple factors (0-100)
 */

interface TrustScoreFactors {
  completionRate: number;      // معدل إتمام العقود
  onTimeDelivery: number;      // التسليم في الوقت
  averageRating: number;       // متوسط التقييم
  responseRate: number;        // معدل الاستجابة
  accountAge: number;          // عمر الحساب
  verificationLevel: number;   // مستوى التحقق
  disputeRate: number;         // معدل النزاعات
  contractValue: number;       // قيمة العقود المنفذة
}

function calculateVendorTrustScore(vendor: Vendor): number {
  const WEIGHTS = {
    completionRate: 0.20,      // 20%
    onTimeDelivery: 0.15,      // 15%
    averageRating: 0.20,       // 20%
    responseRate: 0.10,        // 10%
    accountAge: 0.05,          // 5%
    verificationLevel: 0.10,  // 10%
    disputeRate: 0.10,         // 10%
    contractValue: 0.10        // 10%
  };

  // 1. Completion Rate (0-100)
  const completionScore = vendor.completedProjects > 0
    ? (vendor.completedProjects / (vendor.completedProjects + vendor.cancelledProjects)) * 100
    : 50; // Default for new vendors

  // 2. On-Time Delivery (0-100)
  const onTimeScore = vendor.onTimeDelivery || 50;

  // 3. Average Rating (0-100)
  const ratingScore = (vendor.averageRating / 5) * 100;

  // 4. Response Rate (0-100)
  const responseScore = vendor.responseRate || 50;

  // 5. Account Age Score (0-100)
  const accountAgeMonths = getMonthsSince(vendor.createdAt);
  const ageScore = Math.min(accountAgeMonths * 2, 100);

  // 6. Verification Level Score
  const verificationScores = {
    BASIC: 25,
    DOCUMENTS: 50,
    SITE_VISIT: 75,
    PREMIUM: 100
  };
  const verificationScore = verificationScores[vendor.verificationLevel];

  // 7. Dispute Rate (inverse - lower is better)
  const totalContracts = vendor.completedProjects + vendor.cancelledProjects;
  const disputeRate = totalContracts > 0
    ? (vendor.disputes / totalContracts) * 100
    : 0;
  const disputeScore = Math.max(0, 100 - (disputeRate * 10));

  // 8. Contract Value Score (logarithmic scale)
  const valueScore = Math.min(
    Math.log10(vendor.totalContractValue + 1) * 10,
    100
  );

  // Calculate weighted average
  const trustScore =
    (completionScore * WEIGHTS.completionRate) +
    (onTimeScore * WEIGHTS.onTimeDelivery) +
    (ratingScore * WEIGHTS.averageRating) +
    (responseScore * WEIGHTS.responseRate) +
    (ageScore * WEIGHTS.accountAge) +
    (verificationScore * WEIGHTS.verificationLevel) +
    (disputeScore * WEIGHTS.disputeRate) +
    (valueScore * WEIGHTS.contractValue);

  return Math.round(trustScore * 10) / 10; // Round to 1 decimal
}

/**
 * تحديد مستوى الثقة بناءً على النقاط والعقود المكتملة
 */
function determineTrustLevel(trustScore: number, completedContracts: number): TrustLevel {
  if (completedContracts >= 100 && trustScore >= 90) return 'ELITE';
  if (completedContracts >= 25 && trustScore >= 75) return 'PROFESSIONAL';
  if (completedContracts >= 5 && trustScore >= 60) return 'TRUSTED';
  if (trustScore >= 40) return 'VERIFIED';
  return 'NEW';
}
```

---

## 🔄 2. REVERSE AUCTION ALGORITHM (خوارزمية المزاد العكسي)

```typescript
/**
 * نظام المزاد العكسي
 * - البداية بسعر مرتفع والموردون يتنافسون بخفض السعر
 * - الفائز هو صاحب أقل سعر مقبول
 */

class ReverseAuctionEngine {
  private auction: ReverseAuction;
  private io: SocketIO.Server;

  constructor(auction: ReverseAuction, io: SocketIO.Server) {
    this.auction = auction;
    this.io = io;
  }

  /**
   * تقديم عرض جديد في المزاد
   */
  async placeBid(bidderId: string, amount: number): Promise<AuctionBidResult> {
    // 1. Validate auction is active
    if (this.auction.status !== 'ACTIVE') {
      throw new Error('AUCTION_NOT_ACTIVE');
    }

    // 2. Check auction hasn't ended
    if (new Date() > this.auction.endTime) {
      throw new Error('AUCTION_ENDED');
    }

    // 3. Validate deposit paid
    const deposit = await this.getDeposit(bidderId);
    if (!deposit || deposit.status !== 'PAID') {
      throw new Error('DEPOSIT_REQUIRED');
    }

    // 4. Validate bid amount
    const currentPrice = this.auction.currentPrice || this.auction.startingPrice;
    const minimumBid = currentPrice - this.auction.minimumDecrement;

    if (amount > minimumBid) {
      throw new Error(`BID_TOO_HIGH: Maximum allowed is ${minimumBid}`);
    }

    // 5. Check reserve price (if exists)
    if (this.auction.reservePrice && amount < this.auction.reservePrice) {
      // Allow bid but mark reserve not met
    }

    // 6. Create bid
    const bid = await prisma.reverseAuctionBid.create({
      data: {
        auctionId: this.auction.id,
        bidderId,
        amount,
        isWinning: true,
        rankAtBid: 1
      }
    });

    // 7. Update previous winning bid
    await prisma.reverseAuctionBid.updateMany({
      where: {
        auctionId: this.auction.id,
        isWinning: true,
        id: { not: bid.id }
      },
      data: { isWinning: false, isOutbid: true }
    });

    // 8. Update auction state
    await prisma.reverseAuction.update({
      where: { id: this.auction.id },
      data: {
        currentPrice: amount,
        currentWinnerId: bidderId,
        totalBids: { increment: 1 }
      }
    });

    // 9. Check for anti-sniper extension
    const extensionResult = await this.checkAndExtend(bid.createdAt);

    // 10. Calculate price drop percentage
    const priceDropPercentage =
      ((this.auction.startingPrice - amount) / this.auction.startingPrice) * 100;

    // 11. Broadcast to all participants
    this.broadcastNewBid({
      bidId: bid.id,
      amount,
      bidderName: await this.getMaskedName(bidderId),
      newEndTime: extensionResult.newEndTime,
      priceDropPercentage
    });

    // 12. Notify outbid participants
    await this.notifyOutbidParticipants(bidderId);

    return {
      bidId: bid.id,
      amount,
      status: 'WINNING',
      rank: 1,
      nextMinimumBid: amount - this.auction.minimumDecrement,
      auctionExtended: extensionResult.extended,
      newEndTime: extensionResult.newEndTime
    };
  }

  /**
   * نظام مكافحة القنص (Anti-Sniper)
   * تمديد المزاد إذا وردت عروض في الدقائق الأخيرة
   */
  private async checkAndExtend(bidTime: Date): Promise<ExtensionResult> {
    if (!this.auction.extendOnBid) {
      return { extended: false };
    }

    const timeUntilEnd = this.auction.endTime.getTime() - bidTime.getTime();
    const extensionThreshold = this.auction.extensionMinutes * 60 * 1000;

    if (timeUntilEnd <= extensionThreshold) {
      // Check max extensions
      if (this.auction.currentExtensions >= this.auction.maxExtensions) {
        return {
          extended: false,
          reason: 'MAX_EXTENSIONS_REACHED',
          extensionsRemaining: 0
        };
      }

      // Extend auction
      const newEndTime = new Date(bidTime.getTime() + extensionThreshold);

      await prisma.reverseAuction.update({
        where: { id: this.auction.id },
        data: {
          endTime: newEndTime,
          currentExtensions: { increment: 1 },
          status: 'EXTENDED'
        }
      });

      this.auction.endTime = newEndTime;
      this.auction.currentExtensions++;

      return {
        extended: true,
        newEndTime,
        extensionsRemaining: this.auction.maxExtensions - this.auction.currentExtensions
      };
    }

    return { extended: false };
  }

  /**
   * إنهاء المزاد وتحديد الفائز
   */
  async endAuction(): Promise<AuctionEndResult> {
    const winningBid = await prisma.reverseAuctionBid.findFirst({
      where: { auctionId: this.auction.id, isWinning: true },
      include: { bidder: true }
    });

    // Case 1: No bids
    if (!winningBid) {
      await prisma.reverseAuction.update({
        where: { id: this.auction.id },
        data: {
          status: 'NO_BIDS',
          completedAt: new Date()
        }
      });

      // Refund all deposits
      await this.refundAllDeposits();

      return { status: 'NO_BIDS', winner: null };
    }

    // Case 2: Reserve price not met
    if (this.auction.reservePrice && winningBid.amount > this.auction.reservePrice) {
      await prisma.reverseAuction.update({
        where: { id: this.auction.id },
        data: {
          status: 'ENDED',
          completedAt: new Date()
        }
      });

      // Notify tender owner about reserve not met
      await this.notifyReserveNotMet(winningBid.amount);

      return {
        status: 'RESERVE_NOT_MET',
        highestBid: winningBid.amount,
        reservePrice: this.auction.reservePrice
      };
    }

    // Case 3: Successful auction
    await prisma.$transaction([
      prisma.reverseAuction.update({
        where: { id: this.auction.id },
        data: {
          status: 'AWARDED',
          completedAt: new Date()
        }
      }),
      prisma.tender.update({
        where: { id: this.auction.tenderId },
        data: {
          status: 'AWARDED',
          winnerId: winningBid.bidderId,
          awardedAt: new Date()
        }
      })
    ]);

    // Calculate savings
    const savingsAmount = this.auction.startingPrice - winningBid.amount;
    const savingsPercentage = (savingsAmount / this.auction.startingPrice) * 100;

    // Notify winner
    await this.notifyWinner(winningBid);

    // Notify losers
    await this.notifyLosers(winningBid.bidderId);

    // Refund non-winner deposits
    await this.refundNonWinnerDeposits(winningBid.bidderId);

    // Create contract
    const contract = await this.createContract(winningBid);

    return {
      status: 'AWARDED',
      winner: {
        id: winningBid.bidderId,
        amount: winningBid.amount
      },
      savings: {
        amount: savingsAmount,
        percentage: savingsPercentage
      },
      contract
    };
  }

  /**
   * حساب الحد الأدنى للعرض التالي
   */
  getNextMinimumBid(): number {
    const currentPrice = this.auction.currentPrice || this.auction.startingPrice;
    return currentPrice - this.auction.minimumDecrement;
  }

  /**
   * الحصول على ترتيب العروض الحالي
   */
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const bids = await prisma.reverseAuctionBid.findMany({
      where: { auctionId: this.auction.id },
      orderBy: { amount: 'asc' },
      distinct: ['bidderId'],
      include: { bidder: true }
    });

    return bids.map((bid, index) => ({
      rank: index + 1,
      vendorName: this.maskName(bid.bidder.fullName),
      amount: bid.amount,
      timestamp: bid.createdAt
    }));
  }
}

/**
 * حساب خفض السعر الديناميكي
 * يتناقص الحد الأدنى للخفض كلما اقترب السعر من الحد الأدنى
 */
function calculateDynamicDecrement(
  currentPrice: number,
  startingPrice: number,
  reservePrice?: number
): number {
  const range = startingPrice - (reservePrice || 0);
  const progress = (startingPrice - currentPrice) / range;

  // Base decrements
  const DECREMENTS = [
    { threshold: 0.25, decrement: 0.02 },   // 2% في أول 25%
    { threshold: 0.50, decrement: 0.015 },  // 1.5% في 25-50%
    { threshold: 0.75, decrement: 0.01 },   // 1% في 50-75%
    { threshold: 1.00, decrement: 0.005 }   // 0.5% في آخر 25%
  ];

  for (const tier of DECREMENTS) {
    if (progress <= tier.threshold) {
      return Math.max(currentPrice * tier.decrement, 1000); // Minimum 1000 EGP
    }
  }

  return 1000;
}
```

---

## 📊 3. BID EVALUATION ALGORITHM (خوارزمية تقييم العروض)

```typescript
/**
 * نظام تقييم العروض بناءً على معايير متعددة
 */

interface BidEvaluation {
  bid: Bid;
  technicalScore: number;
  financialScore: number;
  criteriaScores: Map<string, number>;
  totalScore: number;
  rank: number;
}

class BidEvaluationEngine {
  /**
   * تقييم جميع العروض المقدمة على مناقصة
   */
  async evaluateAllBids(tenderId: string): Promise<BidEvaluation[]> {
    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
      include: {
        evaluationCriteria: true,
        bids: {
          where: { status: 'SUBMITTED' },
          include: { vendor: true }
        }
      }
    });

    if (!tender.bids.length) return [];

    const evaluations: BidEvaluation[] = [];

    // Get price range for normalization
    const prices = tender.bids.map(b => b.totalPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    for (const bid of tender.bids) {
      const evaluation = await this.evaluateBid(
        bid,
        tender,
        { minPrice, maxPrice }
      );
      evaluations.push(evaluation);
    }

    // Sort and assign ranks
    evaluations.sort((a, b) => b.totalScore - a.totalScore);
    evaluations.forEach((eval, index) => {
      eval.rank = index + 1;
    });

    return evaluations;
  }

  /**
   * تقييم عرض واحد
   */
  private async evaluateBid(
    bid: Bid,
    tender: Tender,
    priceRange: { minPrice: number; maxPrice: number }
  ): Promise<BidEvaluation> {
    let totalWeightedScore = 0;
    const criteriaScores = new Map<string, number>();

    for (const criteria of tender.evaluationCriteria) {
      let score: number;

      if (criteria.name === 'السعر' || criteria.name.toLowerCase().includes('price')) {
        // Financial score - lower price = higher score
        score = this.calculateFinancialScore(
          bid.totalPrice,
          priceRange.minPrice,
          priceRange.maxPrice
        );
      } else {
        // Technical score - from manual evaluation or AI
        score = bid.criteriaScores?.[criteria.id] || 0;
      }

      criteriaScores.set(criteria.id, score);
      totalWeightedScore += (score * criteria.weight) / 100;
    }

    return {
      bid,
      technicalScore: bid.technicalScore || 0,
      financialScore: this.calculateFinancialScore(
        bid.totalPrice,
        priceRange.minPrice,
        priceRange.maxPrice
      ),
      criteriaScores,
      totalScore: totalWeightedScore,
      rank: 0 // Will be assigned after sorting
    };
  }

  /**
   * حساب النقاط المالية
   * أقل سعر = أعلى نقاط
   */
  private calculateFinancialScore(
    price: number,
    minPrice: number,
    maxPrice: number
  ): number {
    if (minPrice === maxPrice) return 100;

    // Linear inverse scoring
    return ((maxPrice - price) / (maxPrice - minPrice)) * 100;
  }

  /**
   * تحديد الفائز بناءً على طريقة التقييم
   */
  async determineWinner(
    tenderId: string,
    method: EvaluationMethod
  ): Promise<Bid | null> {
    const evaluations = await this.evaluateAllBids(tenderId);

    if (!evaluations.length) return null;

    switch (method) {
      case 'LOWEST_PRICE':
        // Simply return lowest price bid
        return evaluations
          .sort((a, b) => a.bid.totalPrice - b.bid.totalPrice)[0].bid;

      case 'BEST_VALUE':
        // Return highest total score
        return evaluations[0].bid; // Already sorted by totalScore

      case 'QUALITY_BASED':
        // Minimum 70% technical score required, then best value
        const qualified = evaluations.filter(e => e.technicalScore >= 70);
        return qualified.length > 0 ? qualified[0].bid : null;

      case 'WEIGHTED_CRITERIA':
        return evaluations[0].bid;

      default:
        return evaluations[0].bid;
    }
  }
}

/**
 * خوارزمية المطابقة الذكية للموردين
 */
function calculateVendorMatchScore(
  tender: Tender,
  vendor: Vendor
): number {
  let score = 0;
  const weights = {
    categoryMatch: 30,
    locationMatch: 20,
    experienceMatch: 25,
    ratingMatch: 15,
    responseRate: 10
  };

  // 1. Category Match
  if (vendor.categories.includes(tender.category)) {
    score += weights.categoryMatch;
  } else if (vendor.categories.some(c => isSimilarCategory(c, tender.category))) {
    score += weights.categoryMatch * 0.5;
  }

  // 2. Location Match
  if (vendor.operatingGovernorate.includes(tender.governorate)) {
    score += weights.locationMatch;
  } else if (tender.isRemote) {
    score += weights.locationMatch * 0.8;
  }

  // 3. Experience Match
  const budgetMid = (tender.budgetMin + tender.budgetMax) / 2;
  if (vendor.totalContractValue >= budgetMid * 5) {
    score += weights.experienceMatch;
  } else if (vendor.totalContractValue >= budgetMid) {
    score += weights.experienceMatch * 0.7;
  } else {
    score += weights.experienceMatch * 0.3;
  }

  // 4. Rating Match
  score += (vendor.averageRating / 5) * weights.ratingMatch;

  // 5. Response Rate
  score += (vendor.responseRate / 100) * weights.responseRate;

  return Math.round(score);
}
```

---

## 💰 4. ESCROW & PAYMENT FLOW (نظام الضمان والدفع)

```typescript
/**
 * نظام الضمان (Escrow) لحماية المعاملات
 */

class EscrowService {
  /**
   * إنشاء معاملة ضمان جديدة
   */
  async createEscrow(
    contractId: string,
    payerId: string,
    amount: number,
    type: EscrowType,
    milestoneId?: string
  ): Promise<EscrowTransaction> {
    // Validate contract exists and payer is buyer
    const contract = await prisma.contract.findUnique({
      where: { id: contractId }
    });

    if (!contract) throw new Error('CONTRACT_NOT_FOUND');
    if (contract.buyerId !== payerId) throw new Error('UNAUTHORIZED');

    // Create escrow transaction
    const escrow = await prisma.escrowTransaction.create({
      data: {
        contractId,
        payerId,
        amount,
        type,
        milestoneId,
        status: 'PENDING',
        releaseConditions: this.generateReleaseConditions(type, milestoneId)
      }
    });

    // Generate payment link
    const paymentLink = await this.generatePaymentLink(escrow);

    return { ...escrow, paymentLink };
  }

  /**
   * تأكيد استلام الدفع
   */
  async confirmPayment(
    escrowId: string,
    paymentRef: string
  ): Promise<EscrowTransaction> {
    const escrow = await prisma.escrowTransaction.findUnique({
      where: { id: escrowId }
    });

    if (!escrow) throw new Error('ESCROW_NOT_FOUND');
    if (escrow.status !== 'PENDING') throw new Error('INVALID_STATUS');

    // Update escrow status
    const updatedEscrow = await prisma.escrowTransaction.update({
      where: { id: escrowId },
      data: {
        status: 'HELD',
        paymentRef,
        paidAt: new Date(),
        heldAt: new Date()
      }
    });

    // Update milestone if applicable
    if (escrow.milestoneId) {
      await prisma.milestone.update({
        where: { id: escrow.milestoneId },
        data: {
          paymentStatus: 'HELD',
          escrowId
        }
      });
    }

    // Notify vendor
    await this.notifyVendor(escrow.contractId, 'PAYMENT_HELD', escrow.amount);

    return updatedEscrow;
  }

  /**
   * تحرير أموال الضمان
   */
  async releaseEscrow(
    escrowId: string,
    releaserId: string
  ): Promise<EscrowTransaction> {
    const escrow = await prisma.escrowTransaction.findUnique({
      where: { id: escrowId },
      include: { contract: true }
    });

    if (!escrow) throw new Error('ESCROW_NOT_FOUND');
    if (escrow.status !== 'HELD') throw new Error('INVALID_STATUS');

    // Verify releaser is buyer
    if (escrow.contract.buyerId !== releaserId) {
      throw new Error('UNAUTHORIZED');
    }

    // If milestone, verify it's approved
    if (escrow.milestoneId) {
      const milestone = await prisma.milestone.findUnique({
        where: { id: escrow.milestoneId }
      });
      if (milestone.status !== 'APPROVED') {
        throw new Error('MILESTONE_NOT_APPROVED');
      }
    }

    // Release funds
    const updatedEscrow = await prisma.escrowTransaction.update({
      where: { id: escrowId },
      data: {
        status: 'RELEASED',
        releasedAt: new Date()
      }
    });

    // Update milestone payment status
    if (escrow.milestoneId) {
      await prisma.milestone.update({
        where: { id: escrow.milestoneId },
        data: {
          paymentStatus: 'RELEASED',
          paidAt: new Date()
        }
      });
    }

    // Initiate actual fund transfer
    await this.transferFunds(escrow.contract.vendorUserId, escrow.amount);

    // Calculate and deduct platform fee
    const platformFee = escrow.amount * 0.02; // 2%
    const vendorReceives = escrow.amount - platformFee;

    // Notify both parties
    await Promise.all([
      this.notifyBuyer(escrow.contractId, 'PAYMENT_RELEASED', escrow.amount),
      this.notifyVendor(escrow.contractId, 'PAYMENT_RECEIVED', vendorReceives)
    ]);

    return updatedEscrow;
  }

  /**
   * استرداد أموال الضمان
   */
  async refundEscrow(
    escrowId: string,
    reason: string
  ): Promise<EscrowTransaction> {
    const escrow = await prisma.escrowTransaction.findUnique({
      where: { id: escrowId }
    });

    if (!escrow) throw new Error('ESCROW_NOT_FOUND');
    if (!['HELD', 'DISPUTED'].includes(escrow.status)) {
      throw new Error('INVALID_STATUS');
    }

    // Process refund
    const updatedEscrow = await prisma.escrowTransaction.update({
      where: { id: escrowId },
      data: {
        status: 'REFUNDED',
        refundedAt: new Date(),
        notes: reason
      }
    });

    // Initiate actual refund
    await this.processRefund(escrow.payerId, escrow.amount);

    return updatedEscrow;
  }

  /**
   * التحرير التلقائي بعد الموافقة
   */
  async autoRelease(milestoneId: string): Promise<void> {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { contract: true }
    });

    if (milestone.status !== 'APPROVED') return;
    if (milestone.paymentStatus !== 'HELD') return;

    // Auto-release after 3 days of approval if no disputes
    const daysSinceApproval = getDaysSince(milestone.approvedAt);
    if (daysSinceApproval >= 3) {
      const escrow = await prisma.escrowTransaction.findFirst({
        where: { milestoneId }
      });

      if (escrow && escrow.status === 'HELD') {
        await this.releaseEscrow(escrow.id, milestone.contract.buyerId);
      }
    }
  }
}

/**
 * حساب الرسوم
 */
function calculatePlatformFees(
  amount: number,
  category: TenderCategory,
  businessType: BusinessType
): FeeBreakdown {
  const BASE_RATES = {
    G2B: 0.01,      // 1% للمناقصات الحكومية
    B2B: 0.02,      // 2% للشركات
    B2C: 0.025,     // 2.5%
    C2B: 0.03,      // 3%
    C2C: 0.035      // 3.5% للخدمات
  };

  const categoryMultiplier = {
    CONSTRUCTION: 1.0,
    IT_HARDWARE: 0.9,
    IT_SOFTWARE: 0.8,
    CONSULTING: 1.0,
    HOME_SERVICES: 1.2,
    default: 1.0
  };

  const baseRate = BASE_RATES[businessType];
  const multiplier = categoryMultiplier[category] || categoryMultiplier.default;
  const finalRate = baseRate * multiplier;

  const platformFee = amount * finalRate;
  const escrowFee = amount * 0.005; // 0.5% escrow fee

  return {
    amount,
    platformFee: Math.round(platformFee),
    escrowFee: Math.round(escrowFee),
    totalFees: Math.round(platformFee + escrowFee),
    vendorReceives: Math.round(amount - platformFee),
    buyerPays: Math.round(amount + escrowFee)
  };
}
```

---

## 🎯 5. SMART MATCHING ALGORITHM (خوارزمية المطابقة الذكية)

```typescript
/**
 * نظام المطابقة الذكية بين المناقصات والموردين
 */

class SmartMatchingEngine {
  /**
   * إيجاد أفضل الموردين المطابقين لمناقصة
   */
  async findMatchingVendors(
    tender: Tender,
    limit: number = 20
  ): Promise<VendorMatch[]> {
    // Get all eligible vendors
    const vendors = await prisma.vendor.findMany({
      where: {
        isActive: true,
        categories: { has: tender.category },
        // Include vendors in same governorate OR remote-capable
        OR: [
          { operatingGovernorate: { has: tender.governorate } },
          tender.isRemote ? {} : undefined
        ].filter(Boolean)
      },
      include: {
        user: true,
        certifications: true,
        portfolio: true
      }
    });

    // Calculate match scores
    const matches: VendorMatch[] = [];

    for (const vendor of vendors) {
      const matchScore = this.calculateMatchScore(tender, vendor);

      if (matchScore.total >= 40) { // Minimum threshold
        matches.push({
          vendor,
          score: matchScore,
          matchPercentage: matchScore.total,
          reasons: matchScore.reasons
        });
      }
    }

    // Sort by score and return top matches
    return matches
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, limit);
  }

  /**
   * حساب نقاط المطابقة
   */
  private calculateMatchScore(
    tender: Tender,
    vendor: Vendor
  ): MatchScore {
    const scores: ScoreComponent[] = [];
    let totalWeight = 0;
    let totalScore = 0;

    // 1. Category Match (Weight: 25)
    const categoryScore = this.scoreCategoryMatch(tender.category, vendor.categories);
    scores.push({
      factor: 'category',
      score: categoryScore.score,
      weight: 25,
      reason: categoryScore.reason
    });
    totalWeight += 25;
    totalScore += categoryScore.score * 25;

    // 2. Location Match (Weight: 20)
    const locationScore = this.scoreLocationMatch(
      tender.governorate,
      vendor.operatingGovernorate,
      tender.isRemote
    );
    scores.push({
      factor: 'location',
      score: locationScore.score,
      weight: 20,
      reason: locationScore.reason
    });
    totalWeight += 20;
    totalScore += locationScore.score * 20;

    // 3. Experience Match (Weight: 20)
    const experienceScore = this.scoreExperienceMatch(
      tender.budgetMax || tender.budgetFixed,
      vendor.totalContractValue,
      vendor.completedProjects
    );
    scores.push({
      factor: 'experience',
      score: experienceScore.score,
      weight: 20,
      reason: experienceScore.reason
    });
    totalWeight += 20;
    totalScore += experienceScore.score * 20;

    // 4. Trust Score (Weight: 15)
    const trustScore = vendor.trustScore;
    scores.push({
      factor: 'trust',
      score: trustScore,
      weight: 15,
      reason: `Trust Score: ${trustScore}`
    });
    totalWeight += 15;
    totalScore += trustScore * 15;

    // 5. Rating (Weight: 10)
    const ratingScore = (vendor.averageRating / 5) * 100;
    scores.push({
      factor: 'rating',
      score: ratingScore,
      weight: 10,
      reason: `Average Rating: ${vendor.averageRating}/5`
    });
    totalWeight += 10;
    totalScore += ratingScore * 10;

    // 6. Response Rate (Weight: 10)
    const responseScore = vendor.responseRate;
    scores.push({
      factor: 'response',
      score: responseScore,
      weight: 10,
      reason: `Response Rate: ${responseScore}%`
    });
    totalWeight += 10;
    totalScore += responseScore * 10;

    const total = totalScore / totalWeight;

    return {
      total: Math.round(total),
      components: scores,
      reasons: scores
        .filter(s => s.score >= 70)
        .map(s => s.reason)
    };
  }

  /**
   * نقاط تطابق الفئة
   */
  private scoreCategoryMatch(
    tenderCategory: TenderCategory,
    vendorCategories: TenderCategory[]
  ): { score: number; reason: string } {
    // Exact match
    if (vendorCategories.includes(tenderCategory)) {
      return {
        score: 100,
        reason: 'تطابق مباشر في التخصص'
      };
    }

    // Related category match
    const relatedCategories = this.getRelatedCategories(tenderCategory);
    const hasRelated = vendorCategories.some(c => relatedCategories.includes(c));
    if (hasRelated) {
      return {
        score: 70,
        reason: 'تخصص ذو صلة'
      };
    }

    return { score: 20, reason: 'تخصص مختلف' };
  }

  /**
   * الفئات ذات الصلة
   */
  private getRelatedCategories(category: TenderCategory): TenderCategory[] {
    const relations: Record<TenderCategory, TenderCategory[]> = {
      'CONSTRUCTION': ['FINISHING', 'ELECTRICAL', 'PLUMBING', 'HVAC'],
      'IT_SOFTWARE': ['IT_SERVICES', 'CLOUD_SERVICES', 'CYBERSECURITY'],
      'IT_HARDWARE': ['IT_SERVICES', 'NETWORKING'],
      'HOME_SERVICES': ['MAINTENANCE', 'FINISHING', 'ELECTRICAL', 'PLUMBING'],
      // ... more relations
    };

    return relations[category] || [];
  }

  /**
   * إرسال دعوات تلقائية للموردين المطابقين
   */
  async autoInviteVendors(
    tenderId: string,
    maxInvitations: number = 10
  ): Promise<void> {
    const tender = await prisma.tender.findUnique({ where: { id: tenderId } });

    const matches = await this.findMatchingVendors(tender, maxInvitations);

    for (const match of matches) {
      // Create invitation
      await prisma.tenderInvitation.create({
        data: {
          tenderId,
          vendorId: match.vendor.id,
          status: 'PENDING',
          message: `تمت دعوتك للمشاركة في مناقصة "${tender.title}" بناءً على تخصصك وسجل أعمالك.`
        }
      });

      // Send notification
      await this.notifyVendor(match.vendor.userId, {
        type: 'TENDER_INVITATION',
        tenderId,
        matchScore: match.matchPercentage
      });
    }
  }
}
```

---

## 📅 6. NOTIFICATION & SCHEDULING SYSTEM (نظام الإشعارات والجدولة)

```typescript
/**
 * نظام الإشعارات والجدولة
 */

class NotificationScheduler {
  /**
   * جدولة إشعارات المواعيد النهائية
   */
  async scheduleDeadlineReminders(tender: Tender): Promise<void> {
    const deadline = tender.submissionDeadline;

    // Reminder intervals
    const reminders = [
      { hours: 72, type: 'TENDER_CLOSING_SOON' },   // 3 days
      { hours: 24, type: 'TENDER_CLOSING_SOON' },   // 1 day
      { hours: 6, type: 'TENDER_CLOSING_SOON' },    // 6 hours
      { hours: 1, type: 'TENDER_CLOSING_SOON' }     // 1 hour
    ];

    for (const reminder of reminders) {
      const sendAt = new Date(deadline.getTime() - reminder.hours * 60 * 60 * 1000);

      if (sendAt > new Date()) {
        await this.scheduleJob({
          type: 'TENDER_REMINDER',
          tenderId: tender.id,
          sendAt,
          notificationType: reminder.type,
          data: { hoursRemaining: reminder.hours }
        });
      }
    }
  }

  /**
   * معالجة إنهاء المناقصات
   */
  async processTenderDeadlines(): Promise<void> {
    const expiredTenders = await prisma.tender.findMany({
      where: {
        status: 'ACTIVE',
        submissionDeadline: { lte: new Date() }
      }
    });

    for (const tender of expiredTenders) {
      await this.closeTender(tender.id);
    }
  }

  /**
   * إغلاق المناقصة
   */
  private async closeTender(tenderId: string): Promise<void> {
    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
      include: { bids: true }
    });

    const newStatus = tender.bids.length > 0 ? 'EVALUATION' : 'NO_BIDS';

    await prisma.tender.update({
      where: { id: tenderId },
      data: {
        status: newStatus,
        closedAt: new Date()
      }
    });

    // Notify owner
    await this.notify(tender.ownerId, {
      type: 'TENDER_CLOSED',
      tenderId,
      bidCount: tender.bids.length,
      status: newStatus
    });

    // Notify all bidders
    for (const bid of tender.bids) {
      await this.notify(bid.bidderId, {
        type: 'TENDER_CLOSED',
        tenderId,
        bidId: bid.id
      });
    }
  }

  /**
   * جدولة إشعارات المراحل
   */
  async scheduleMilestoneReminders(contract: Contract): Promise<void> {
    const milestones = await prisma.milestone.findMany({
      where: { contractId: contract.id },
      orderBy: { dueDate: 'asc' }
    });

    for (const milestone of milestones) {
      // Reminder 3 days before
      await this.scheduleJob({
        type: 'MILESTONE_REMINDER',
        milestoneId: milestone.id,
        sendAt: new Date(milestone.dueDate.getTime() - 3 * 24 * 60 * 60 * 1000),
        recipients: [contract.vendorUserId]
      });

      // Reminder 1 day before
      await this.scheduleJob({
        type: 'MILESTONE_REMINDER',
        milestoneId: milestone.id,
        sendAt: new Date(milestone.dueDate.getTime() - 24 * 60 * 60 * 1000),
        recipients: [contract.vendorUserId, contract.buyerId]
      });

      // Overdue check
      await this.scheduleJob({
        type: 'MILESTONE_OVERDUE_CHECK',
        milestoneId: milestone.id,
        sendAt: new Date(milestone.dueDate.getTime() + 60 * 60 * 1000) // 1 hour after
      });
    }
  }
}

/**
 * إنشاء الإشعار
 */
async function createNotification(
  userId: string,
  type: NotificationType,
  data: NotificationData
): Promise<Notification> {
  const templates = getNotificationTemplates();
  const template = templates[type];

  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title: template.titleAr,
      titleAr: template.titleAr,
      message: interpolate(template.messageAr, data),
      messageAr: interpolate(template.messageAr, data),
      relatedType: data.entityType,
      relatedId: data.entityId,
      actionUrl: template.actionUrl ? interpolate(template.actionUrl, data) : null,
      channels: template.channels
    }
  });

  // Send via channels
  if (template.channels.includes('email')) {
    await sendEmailNotification(userId, notification);
  }
  if (template.channels.includes('push')) {
    await sendPushNotification(userId, notification);
  }
  if (template.channels.includes('sms')) {
    await sendSMSNotification(userId, notification);
  }

  return notification;
}

/**
 * قوالب الإشعارات
 */
function getNotificationTemplates(): NotificationTemplates {
  return {
    TENDER_PUBLISHED: {
      titleAr: 'مناقصة جديدة',
      messageAr: 'تم نشر مناقصة "{title}" في تخصصك',
      channels: ['email', 'push'],
      actionUrl: '/tenders/{tenderId}'
    },
    NEW_BID_RECEIVED: {
      titleAr: 'عرض جديد',
      messageAr: 'تم تقديم عرض جديد على مناقصتك "{title}" بقيمة {amount} ج.م',
      channels: ['email', 'push'],
      actionUrl: '/tenders/{tenderId}/bids'
    },
    BID_ACCEPTED: {
      titleAr: 'تهانينا! تم قبول عرضك',
      messageAr: 'تم قبول عرضك على مناقصة "{title}". قيمة العقد: {amount} ج.م',
      channels: ['email', 'push', 'sms'],
      actionUrl: '/contracts/{contractId}'
    },
    OUTBID: {
      titleAr: 'تم المزايدة عليك',
      messageAr: 'عرضك في المزاد العكسي لـ "{title}" لم يعد الأقل. السعر الحالي: {currentPrice} ج.م',
      channels: ['push'],
      actionUrl: '/tenders/{tenderId}/auction'
    },
    PAYMENT_RECEIVED: {
      titleAr: 'تم استلام الدفع',
      messageAr: 'تم تحرير مبلغ {amount} ج.م لحسابك عن مرحلة "{milestoneName}"',
      channels: ['email', 'push'],
      actionUrl: '/contracts/{contractId}'
    },
    // ... المزيد من القوالب
  };
}
```

---

## 🔒 7. SECURITY & FRAUD DETECTION (الأمان وكشف الاحتيال)

```typescript
/**
 * نظام كشف الاحتيال
 */

class FraudDetectionService {
  /**
   * تحليل العرض للكشف عن أنماط مشبوهة
   */
  async analyzeBid(bid: Bid, tender: Tender): Promise<FraudAnalysis> {
    const checks: FraudCheck[] = [];
    let riskScore = 0;

    // 1. Check bid-tender relationship
    const relationshipCheck = await this.checkBidderTenderOwnerRelationship(
      bid.bidderId,
      tender.ownerId
    );
    checks.push(relationshipCheck);
    riskScore += relationshipCheck.riskPoints;

    // 2. Check for collusion patterns
    const collusionCheck = await this.checkCollusionPatterns(bid, tender);
    checks.push(collusionCheck);
    riskScore += collusionCheck.riskPoints;

    // 3. Check price anomaly
    const priceCheck = this.checkPriceAnomaly(bid.totalPrice, tender);
    checks.push(priceCheck);
    riskScore += priceCheck.riskPoints;

    // 4. Check bidding velocity
    const velocityCheck = await this.checkBiddingVelocity(bid.bidderId);
    checks.push(velocityCheck);
    riskScore += velocityCheck.riskPoints;

    // 5. Check device/IP patterns
    const deviceCheck = await this.checkDevicePatterns(bid);
    checks.push(deviceCheck);
    riskScore += deviceCheck.riskPoints;

    // Determine severity
    let severity: FraudSeverity;
    if (riskScore < 20) severity = 'LOW';
    else if (riskScore < 50) severity = 'MEDIUM';
    else if (riskScore < 80) severity = 'HIGH';
    else severity = 'CRITICAL';

    // Auto-flag if high risk
    if (riskScore >= 50) {
      await this.flagForReview(bid.id, checks, severity);
    }

    // Auto-reject if critical
    if (riskScore >= 80) {
      await this.rejectBid(bid.id, 'AUTO_FRAUD_DETECTION');
    }

    return {
      bidId: bid.id,
      riskScore,
      severity,
      checks,
      action: riskScore >= 80 ? 'REJECTED' : riskScore >= 50 ? 'FLAGGED' : 'APPROVED'
    };
  }

  /**
   * فحص العلاقة بين مقدم العرض وصاحب المناقصة
   */
  private async checkBidderTenderOwnerRelationship(
    bidderId: string,
    ownerId: string
  ): Promise<FraudCheck> {
    // Same user check
    if (bidderId === ownerId) {
      return {
        name: 'SELF_BIDDING',
        riskPoints: 100,
        details: 'محاولة تقديم عرض على مناقصة شخصية'
      };
    }

    // Same device/IP check
    const sameDevice = await this.checkSameDeviceHistory(bidderId, ownerId);
    if (sameDevice) {
      return {
        name: 'SAME_DEVICE',
        riskPoints: 60,
        details: 'نفس الجهاز المستخدم لحسابين مختلفين'
      };
    }

    // Company relationship check
    const relatedCompanies = await this.checkCompanyRelationship(bidderId, ownerId);
    if (relatedCompanies) {
      return {
        name: 'RELATED_COMPANIES',
        riskPoints: 40,
        details: 'شركات مرتبطة'
      };
    }

    return {
      name: 'RELATIONSHIP_CHECK',
      riskPoints: 0,
      details: 'لا توجد علاقات مشبوهة'
    };
  }

  /**
   * فحص أنماط التواطؤ
   */
  private async checkCollusionPatterns(
    bid: Bid,
    tender: Tender
  ): Promise<FraudCheck> {
    // Get all bids on this tender
    const allBids = await prisma.bid.findMany({
      where: { tenderId: tender.id }
    });

    // Check for cover bidding pattern
    // (intentionally high bids to make one bid look good)
    const coverBidScore = this.detectCoverBidding(allBids);
    if (coverBidScore > 0.7) {
      return {
        name: 'COVER_BIDDING',
        riskPoints: 50,
        details: 'نمط عروض وهمية محتمل'
      };
    }

    // Check for bid rotation
    // (same vendors winning alternately)
    const rotationScore = await this.detectBidRotation(bid.bidderId, tender.ownerId);
    if (rotationScore > 0.6) {
      return {
        name: 'BID_ROTATION',
        riskPoints: 45,
        details: 'نمط تناوب في الفوز بالمناقصات'
      };
    }

    return {
      name: 'COLLUSION_CHECK',
      riskPoints: 0,
      details: 'لا توجد أنماط تواطؤ'
    };
  }

  /**
   * فحص شذوذ السعر
   */
  private checkPriceAnomaly(
    bidPrice: number,
    tender: Tender
  ): FraudCheck {
    const budgetMid = (tender.budgetMin + tender.budgetMax) / 2;
    const deviation = Math.abs(bidPrice - budgetMid) / budgetMid;

    // Price too low (potential loss-leader or fraud)
    if (bidPrice < tender.budgetMin * 0.5) {
      return {
        name: 'PRICE_TOO_LOW',
        riskPoints: 40,
        details: `السعر أقل بكثير من الميزانية المتوقعة (${Math.round(deviation * 100)}%)`
      };
    }

    // Price too high (potential bid rigging)
    if (bidPrice > tender.budgetMax * 1.5) {
      return {
        name: 'PRICE_TOO_HIGH',
        riskPoints: 30,
        details: `السعر أعلى بكثير من الميزانية المتوقعة (${Math.round(deviation * 100)}%)`
      };
    }

    return {
      name: 'PRICE_CHECK',
      riskPoints: 0,
      details: 'السعر ضمن النطاق المتوقع'
    };
  }

  /**
   * فحص سرعة تقديم العروض
   */
  private async checkBiddingVelocity(bidderId: string): Promise<FraudCheck> {
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);

    const recentBids = await prisma.bid.count({
      where: {
        bidderId,
        createdAt: { gte: lastHour }
      }
    });

    // More than 20 bids per hour is suspicious
    if (recentBids > 20) {
      return {
        name: 'HIGH_VELOCITY',
        riskPoints: 35,
        details: `${recentBids} عرض خلال الساعة الماضية`
      };
    }

    if (recentBids > 10) {
      return {
        name: 'MODERATE_VELOCITY',
        riskPoints: 15,
        details: `${recentBids} عرض خلال الساعة الماضية`
      };
    }

    return {
      name: 'VELOCITY_CHECK',
      riskPoints: 0,
      details: 'معدل تقديم عروض طبيعي'
    };
  }
}
```

---

## 📈 8. ANALYTICS ENGINE (محرك التحليلات)

```typescript
/**
 * محرك التحليلات والإحصائيات
 */

class AnalyticsEngine {
  /**
   * تحليلات لوحة التحكم
   */
  async getDashboardAnalytics(userId: string): Promise<DashboardAnalytics> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { vendorProfile: true }
    });

    const isVendor = !!user.vendorProfile;

    if (isVendor) {
      return this.getVendorDashboard(user);
    } else {
      return this.getBuyerDashboard(user);
    }
  }

  /**
   * لوحة تحكم المورد
   */
  private async getVendorDashboard(user: User): Promise<VendorDashboard> {
    const vendorId = user.vendorProfile.id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get statistics
    const [
      activeBids,
      wonContracts,
      pendingPayments,
      recentActivity
    ] = await Promise.all([
      // Active bids
      prisma.bid.count({
        where: { vendorId, status: 'SUBMITTED' }
      }),

      // Won contracts this month
      prisma.contract.count({
        where: {
          vendorId,
          status: { in: ['ACTIVE', 'IN_PROGRESS', 'COMPLETED'] },
          createdAt: { gte: thirtyDaysAgo }
        }
      }),

      // Pending payments
      prisma.milestone.aggregate({
        where: {
          contract: { vendorId },
          paymentStatus: 'HELD'
        },
        _sum: { amount: true }
      }),

      // Recent activity
      prisma.bid.findMany({
        where: { vendorId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { tender: true }
      })
    ]);

    // Calculate win rate
    const totalBids = await prisma.bid.count({ where: { vendorId } });
    const wonBids = await prisma.bid.count({ where: { vendorId, isWinning: true } });
    const winRate = totalBids > 0 ? (wonBids / totalBids) * 100 : 0;

    // Get trending tenders matching vendor's categories
    const matchingTenders = await this.getMatchingTenders(user.vendorProfile);

    return {
      summary: {
        activeBids,
        wonContracts,
        pendingPayments: pendingPayments._sum.amount || 0,
        winRate: Math.round(winRate)
      },
      recentActivity,
      matchingTenders,
      performance: {
        trustScore: user.vendorProfile.trustScore,
        averageRating: user.vendorProfile.averageRating,
        responseRate: user.vendorProfile.responseRate
      }
    };
  }

  /**
   * تحليلات المناقصة
   */
  async getTenderAnalytics(tenderId: string): Promise<TenderAnalyticsReport> {
    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
      include: { bids: true }
    });

    // View analytics
    const views = await prisma.tenderAnalytics.findUnique({
      where: { tenderId }
    });

    // Bid statistics
    const bidStats = this.calculateBidStatistics(tender.bids);

    // Conversion funnel
    const funnel = {
      views: views?.totalViews || 0,
      watchlistAdds: views?.watchlistAdds || 0,
      documentDownloads: views?.documentDownloads || 0,
      bidsSubmitted: tender.bids.length,
      conversionRate: views?.totalViews > 0
        ? (tender.bids.length / views.totalViews) * 100
        : 0
    };

    // Compare with similar tenders
    const benchmark = await this.getBenchmarkData(tender.category);

    return {
      tender,
      views,
      bidStats,
      funnel,
      benchmark
    };
  }

  /**
   * حساب إحصائيات العروض
   */
  private calculateBidStatistics(bids: Bid[]): BidStatistics {
    if (bids.length === 0) {
      return {
        count: 0,
        average: 0,
        median: 0,
        min: 0,
        max: 0,
        range: 0,
        standardDeviation: 0
      };
    }

    const prices = bids.map(b => b.totalPrice).sort((a, b) => a - b);
    const count = prices.length;
    const sum = prices.reduce((a, b) => a + b, 0);
    const average = sum / count;
    const median = count % 2 === 0
      ? (prices[count / 2 - 1] + prices[count / 2]) / 2
      : prices[Math.floor(count / 2)];
    const min = prices[0];
    const max = prices[count - 1];
    const range = max - min;
    const variance = prices.reduce((acc, p) => acc + Math.pow(p - average, 2), 0) / count;
    const standardDeviation = Math.sqrt(variance);

    return {
      count,
      average: Math.round(average),
      median: Math.round(median),
      min,
      max,
      range,
      standardDeviation: Math.round(standardDeviation)
    };
  }

  /**
   * تقرير أداء المنصة
   */
  async getPlatformReport(period: 'day' | 'week' | 'month' | 'year'): Promise<PlatformReport> {
    const startDate = this.getStartDate(period);

    const [
      tenderStats,
      bidStats,
      contractStats,
      userStats,
      revenueStats
    ] = await Promise.all([
      // Tender statistics
      prisma.tender.groupBy({
        by: ['status'],
        where: { createdAt: { gte: startDate } },
        _count: true,
        _sum: { budgetMax: true }
      }),

      // Bid statistics
      prisma.bid.aggregate({
        where: { createdAt: { gte: startDate } },
        _count: true,
        _avg: { totalPrice: true }
      }),

      // Contract statistics
      prisma.contract.aggregate({
        where: { createdAt: { gte: startDate } },
        _count: true,
        _sum: { totalValue: true }
      }),

      // User statistics
      prisma.user.aggregate({
        where: { createdAt: { gte: startDate } },
        _count: true
      }),

      // Revenue (from platform fees)
      this.calculatePlatformRevenue(startDate)
    ]);

    return {
      period,
      startDate,
      tenders: tenderStats,
      bids: bidStats,
      contracts: contractStats,
      users: userStats,
      revenue: revenueStats
    };
  }
}
```

---

هذا يغطي كل منطق الأعمال والخوارزميات الأساسية لسوق المناقصات. النظام يتضمن:

1. ✅ خوارزمية نقاط الثقة للموردين
2. ✅ نظام المزاد العكسي الكامل
3. ✅ خوارزمية تقييم العروض
4. ✅ نظام الضمان والدفع
5. ✅ المطابقة الذكية بين المناقصات والموردين
6. ✅ نظام الإشعارات والجدولة
7. ✅ كشف الاحتيال والأمان
8. ✅ محرك التحليلات
