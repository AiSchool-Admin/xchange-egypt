# XCHANGE BARTER MARKETPLACE - BUSINESS LOGIC
# منطق العمل لسوق المقايضة

## Overview | نظرة عامة

The Xchange Barter Marketplace enables users to exchange items without cash transactions, using AI-powered matching to find optimal trades including multi-party chains.

منصة Xchange للمقايضة تتيح للمستخدمين تبادل المنتجات بدون معاملات نقدية، باستخدام المطابقة الذكية بالذكاء الاصطناعي لإيجاد أفضل الصفقات بما في ذلك سلاسل المقايضة متعددة الأطراف.

---

## 1. BARTER OFFER LIFECYCLE | دورة حياة عرض المقايضة

### 1.1 Offer States | حالات العرض

```
PENDING → ACCEPTED → IN_ESCROW → COMPLETED
    ↓         ↓           ↓
 REJECTED  COUNTERED   DISPUTED
    ↓         ↓           ↓
 EXPIRED   [new offer]  RESOLVED
```

### 1.2 State Transitions | انتقالات الحالة

| From | To | Action | Allowed By |
|------|-----|--------|-----------|
| PENDING | ACCEPTED | accept() | Offeree |
| PENDING | REJECTED | reject() | Offeree |
| PENDING | COUNTERED | counter() | Offeree |
| PENDING | EXPIRED | system_check() | System (cron) |
| PENDING | CANCELLED | cancel() | Offeror |
| ACCEPTED | IN_ESCROW | start_escrow() | System |
| IN_ESCROW | COMPLETED | complete_escrow() | System |
| IN_ESCROW | DISPUTED | open_dispute() | Either party |

### 1.3 Offer Validation Rules | قواعد التحقق من العرض

```typescript
interface OfferValidation {
  // Item availability
  offeredItemMustBeActive: true;
  requestedItemMustBeActive: true;
  itemsCannotBeInActiveOffer: true;

  // Value rules
  valueDifferenceMax: 50%; // Max 50% difference without cash top-up
  cashTopUpMax: 'min(offeredValue, requestedValue) * 0.5';

  // User rules
  cannotOfferOwnItem: true;
  mustBeVerifiedForHighValue: 50000; // EGP threshold

  // Time rules
  expirationMin: '1 day';
  expirationMax: '30 days';
  expirationDefault: '7 days';
}
```

---

## 2. VALUE MATCHING | مطابقة القيمة

### 2.1 Match Score Calculation | حساب درجة المطابقة

```typescript
function calculateMatchScore(
  offeredItem: Item,
  requestedItem: Item,
  offerorPreferences: Preferences,
  offereePreferences: Preferences
): MatchScore {

  const scores = {
    // Value match (40% weight)
    valueMatch: calculateValueMatch(
      offeredItem.estimatedValue,
      requestedItem.estimatedValue
    ), // 0-100

    // Category relevance (20% weight)
    categoryMatch: calculateCategoryMatch(
      offeredItem.categoryId,
      offereePreferences.desiredCategories
    ), // 0-100

    // Location proximity (15% weight)
    locationMatch: calculateLocationMatch(
      offeredItem.governorate,
      requestedItem.governorate
    ), // 0-100

    // Condition match (10% weight)
    conditionMatch: calculateConditionMatch(
      offeredItem.condition,
      requestedItem.condition
    ), // 0-100

    // User trust score (10% weight)
    trustMatch: calculateTrustMatch(
      offeror.trustScore,
      offeree.trustScore
    ), // 0-100

    // Historical success (5% weight)
    historyMatch: calculateHistoryMatch(
      offeror.barterSuccessRate,
      offeree.barterSuccessRate
    ) // 0-100
  };

  const weights = {
    valueMatch: 0.40,
    categoryMatch: 0.20,
    locationMatch: 0.15,
    conditionMatch: 0.10,
    trustMatch: 0.10,
    historyMatch: 0.05
  };

  const totalScore = Object.entries(scores).reduce(
    (sum, [key, score]) => sum + score * weights[key],
    0
  );

  return {
    totalScore: Math.round(totalScore),
    breakdown: scores,
    suggestedCashTopUp: calculateSuggestedTopUp(
      offeredItem.estimatedValue,
      requestedItem.estimatedValue
    )
  };
}
```

### 2.2 Value Match Formula | معادلة مطابقة القيمة

```typescript
function calculateValueMatch(offeredValue: number, requestedValue: number): number {
  const minValue = Math.min(offeredValue, requestedValue);
  const maxValue = Math.max(offeredValue, requestedValue);

  if (maxValue === 0) return 0;

  const ratio = minValue / maxValue; // 0 to 1

  // Perfect match = 100, 50% difference = 50, 100% difference = 0
  return Math.round(ratio * 100);
}
```

---

## 3. MULTI-PARTY MATCHING (CHAINS) | المطابقة متعددة الأطراف

### 3.1 Chain Discovery Algorithm | خوارزمية اكتشاف السلاسل

```typescript
// Using graph-based cycle detection
async function discoverBarterChains(): Promise<Chain[]> {
  // 1. Build item-want graph
  const graph = await buildWantGraph();

  // 2. Find cycles using Tarjan's algorithm
  const cycles = findCycles(graph, {
    minParticipants: 3,
    maxParticipants: 6,
    minValueMatch: 70 // Minimum 70% value match
  });

  // 3. Score and rank chains
  const scoredChains = cycles.map(cycle => ({
    ...cycle,
    score: scoreChain(cycle),
    cashAdjustments: calculateChainCashAdjustments(cycle)
  }));

  // 4. Filter profitable chains
  return scoredChains
    .filter(chain => chain.score >= 80)
    .sort((a, b) => b.score - a.score)
    .slice(0, 100);
}
```

### 3.2 Chain Scoring | تسجيل السلاسل

```typescript
function scoreChain(chain: Chain): number {
  const factors = {
    // Average value match across all exchanges
    avgValueMatch: calculateAvgValueMatch(chain.exchanges),

    // Participant trust scores
    avgTrustScore: calculateAvgTrustScore(chain.participants),

    // Geographic clustering (same area = better)
    geographicScore: calculateGeographicClustering(chain.participants),

    // Chain length penalty (shorter = better)
    lengthPenalty: Math.max(0, 100 - (chain.participants.length - 3) * 10),

    // Cash adjustment penalty (less cash = better)
    cashPenalty: calculateCashPenalty(chain.cashAdjustments)
  };

  return (
    factors.avgValueMatch * 0.35 +
    factors.avgTrustScore * 0.20 +
    factors.geographicScore * 0.15 +
    factors.lengthPenalty * 0.15 +
    factors.cashPenalty * 0.15
  );
}
```

### 3.3 Chain Confirmation Process | عملية تأكيد السلسلة

```typescript
async function handleChainConfirmation(chainId: string, userId: string): Promise<void> {
  const chain = await getChain(chainId);

  // 1. Record confirmation
  chain.confirmations[userId] = true;

  // 2. Check if all confirmed
  const allConfirmed = chain.participants.every(
    p => chain.confirmations[p.userId]
  );

  if (allConfirmed) {
    // 3. Lock all items
    await Promise.all(
      chain.participants.map(p =>
        lockItem(p.itemId, 'BARTER_CHAIN', chainId)
      )
    );

    // 4. Create multi-party escrow
    const escrow = await createMultiPartyEscrow({
      chainId,
      parties: chain.participants.map(p => ({
        userId: p.userId,
        givesItemId: p.gives.itemId,
        receivesItemId: p.receives.itemId,
        cashAdjustment: getCashAdjustment(p, chain)
      })),
      deadline: addDays(new Date(), 7)
    });

    // 5. Notify all participants
    await notifyChainExecutionStart(chain, escrow);
  } else {
    // Check for expiration
    const remaining = chain.participants.filter(
      p => !chain.confirmations[p.userId]
    );

    if (isExpiringSoon(chain)) {
      await notifyPendingConfirmations(remaining, chain);
    }
  }
}
```

---

## 4. BARTER POOL LOGIC | منطق مجمع المقايضة

### 4.1 Pool Matching Algorithm | خوارزمية مطابقة المجمع

```typescript
async function matchPoolParticipants(poolId: string): Promise<PoolMatch[]> {
  const pool = await getPool(poolId);
  const participants = await getPoolParticipants(poolId);

  // 1. Build preference matrix
  const matrix = buildPreferenceMatrix(participants, pool.targetCategory);

  // 2. Apply Hungarian algorithm for optimal matching
  const optimalMatches = hungarianAlgorithm(matrix);

  // 3. Identify unmatched participants
  const unmatched = findUnmatched(participants, optimalMatches);

  // 4. Try to form chains among unmatched
  const chains = discoverChainsAmong(unmatched);

  // 5. Combine bilateral matches and chains
  return [
    ...optimalMatches.map(m => ({ type: 'BILATERAL', ...m })),
    ...chains.map(c => ({ type: 'CHAIN', ...c }))
  ];
}
```

### 4.2 Pool Rules | قواعد المجمع

```typescript
interface PoolRules {
  // Participation
  minContributionValue: 'pool.targetMinValue * 0.5';
  maxContributionValue: 'pool.targetMaxValue * 2';

  // Timing
  contributionDeadline: 'pool.deadline';
  matchingStartDelay: '24 hours after deadline';

  // Matching
  minMatchScore: 70;
  allowPartialMatches: true;
  allowCashAdjustments: true;
  maxCashAdjustmentPercent: 30;

  // Execution
  escrowDeadline: '7 days';
  disputeWindow: '48 hours after receipt';
}
```

---

## 5. ESCROW PROCESS | عملية الضمان

### 5.1 Bilateral Escrow Flow | تدفق الضمان الثنائي

```
1. OFFER_ACCEPTED
   ↓
2. ESCROW_CREATED (items locked)
   ↓
3. AWAITING_DELIVERIES
   ├── Party A delivers → A_DELIVERED
   └── Party B delivers → B_DELIVERED
   ↓
4. BOTH_DELIVERED (verification period)
   ↓
5. AWAITING_CONFIRMATIONS
   ├── Party A confirms receipt → A_CONFIRMED
   └── Party B confirms receipt → B_CONFIRMED
   ↓
6. COMPLETED (items transferred, cash released)
```

### 5.2 Escrow Timeouts | مهلات الضمان

```typescript
const escrowTimeouts = {
  // Time to deliver after escrow starts
  deliveryDeadline: '72 hours',

  // Time to confirm after delivery
  confirmationDeadline: '48 hours',

  // Auto-confirm if no response
  autoConfirmAfter: '72 hours after delivery',

  // Dispute window
  disputeWindow: '48 hours after confirmation',

  // Fund release
  fundReleaseDelay: '24 hours after both confirm'
};
```

### 5.3 Escrow Auto-Actions | الإجراءات التلقائية للضمان

```typescript
async function processEscrowTimeouts(): Promise<void> {
  // 1. Auto-cancel if delivery deadline passed
  const overdueDeliveries = await getEscrowsOverdueDelivery();
  for (const escrow of overdueDeliveries) {
    if (!escrow.partyA.delivered && !escrow.partyB.delivered) {
      await cancelEscrow(escrow.id, 'BOTH_NO_DELIVERY');
    } else if (!escrow.partyA.delivered) {
      await penalizeAndRefund(escrow, 'PARTY_A');
    } else if (!escrow.partyB.delivered) {
      await penalizeAndRefund(escrow, 'PARTY_B');
    }
  }

  // 2. Auto-confirm if confirmation deadline passed
  const overdueConfirmations = await getEscrowsOverdueConfirmation();
  for (const escrow of overdueConfirmations) {
    if (!escrow.partyA.confirmed) {
      await autoConfirm(escrow, 'PARTY_A');
    }
    if (!escrow.partyB.confirmed) {
      await autoConfirm(escrow, 'PARTY_B');
    }

    // If both now confirmed, complete
    if (escrow.partyA.confirmed && escrow.partyB.confirmed) {
      await completeEscrow(escrow.id);
    }
  }

  // 3. Release funds if dispute window passed
  const readyForRelease = await getEscrowsReadyForRelease();
  for (const escrow of readyForRelease) {
    await releaseFunds(escrow.id);
  }
}
```

---

## 6. TRUST & REPUTATION | الثقة والسمعة

### 6.1 Barter-Specific Trust Score | درجة الثقة الخاصة بالمقايضة

```typescript
function calculateBarterTrustScore(userId: string): number {
  const metrics = {
    // Completion rate
    completionRate: getCompletionRate(userId), // 0-100

    // Response time
    avgResponseTime: getAvgResponseTime(userId), // hours
    responseScore: responseTimeToScore(avgResponseTime), // 0-100

    // Accuracy rating
    accuracyScore: getAccuracyRating(userId), // 0-100

    // Dispute rate (inverse)
    disputeRate: getDisputeRate(userId), // 0-100 (lower is better)
    disputeScore: 100 - disputeRate,

    // Volume bonus
    volumeBonus: Math.min(20, getTotalBarters(userId) / 5),

    // Verification bonus
    verificationBonus: isVerified(userId) ? 10 : 0
  };

  return Math.min(100,
    metrics.completionRate * 0.30 +
    metrics.responseScore * 0.15 +
    metrics.accuracyScore * 0.25 +
    metrics.disputeScore * 0.20 +
    metrics.volumeBonus +
    metrics.verificationBonus
  );
}
```

### 6.2 Reputation Badges | شارات السمعة

```typescript
const barterBadges = {
  BARTER_BEGINNER: {
    criteria: { completedBarters: 1 },
    nameAr: 'مبتدئ المقايضة'
  },
  BARTER_ACTIVE: {
    criteria: { completedBarters: 10 },
    nameAr: 'نشط في المقايضة'
  },
  BARTER_PRO: {
    criteria: { completedBarters: 50, successRate: 90 },
    nameAr: 'محترف المقايضة'
  },
  BARTER_MASTER: {
    criteria: { completedBarters: 100, successRate: 95, avgRating: 4.8 },
    nameAr: 'خبير المقايضة'
  },
  CHAIN_PARTICIPANT: {
    criteria: { completedChains: 5 },
    nameAr: 'مشارك في السلاسل'
  },
  FAST_RESPONDER: {
    criteria: { avgResponseTime: '<2h', minBarters: 10 },
    nameAr: 'سريع الاستجابة'
  },
  ACCURATE_LISTER: {
    criteria: { accuracyRating: 4.9, minBarters: 20 },
    nameAr: 'دقيق في الوصف'
  }
};
```

---

## 7. NOTIFICATIONS | الإشعارات

### 7.1 Notification Triggers | محفزات الإشعارات

| Event | Recipients | Channels | Priority |
|-------|-----------|----------|----------|
| New offer received | Offeree | Push, In-app, WS | High |
| Offer accepted | Offeror | Push, In-app | High |
| Offer rejected | Offeror | In-app | Medium |
| Counter offer | Offeror | Push, In-app | High |
| AI match found | Both parties | Push, In-app | Medium |
| Chain available | All participants | Push, In-app, Email | High |
| Chain confirmed | All participants | Push, In-app | High |
| Escrow started | Both parties | Push, In-app, Email | High |
| Item delivered | Recipient | Push, In-app | High |
| Confirm reminder | Pending party | Push, In-app | High |
| Barter completed | Both parties | Push, In-app | Medium |
| Dispute opened | Other party | Push, In-app, Email | Urgent |

---

## 8. FRAUD PREVENTION | منع الاحتيال

### 8.1 Anti-Fraud Measures | إجراءات مكافحة الاحتيال

```typescript
const fraudPrevention = {
  // Rate limiting
  maxOffersPerDay: 20,
  maxActiveOffers: 10,

  // Value limits
  maxSingleOfferValue: 500000, // EGP
  maxDailyValue: 1000000,

  // Pattern detection
  detectRingTrading: true, // Same items cycling
  detectValueManipulation: true, // Artificial pricing
  detectFakeAccounts: true, // Multi-account abuse

  // Verification requirements
  requirePhoneVerification: true,
  requireIdForHighValue: 50000, // EGP threshold

  // Escrow requirements
  mandatoryEscrow: true,
  exchangePointForHighValue: 100000 // EGP threshold
};
```

### 8.2 Suspicious Activity Flags | علامات النشاط المشبوه

```typescript
function checkSuspiciousActivity(offer: BarterOffer): SuspiciousFlags {
  return {
    rapidOfferCancellations: checkRapidCancellations(offer.offerorId),
    unusualValueDifference: checkValueAnomaly(offer),
    newAccountHighValue: checkNewAccountRisk(offer),
    geographicAnomaly: checkLocationPattern(offer),
    itemDescriptionMismatch: checkDescriptionAccuracy(offer),
    multipleFailedEscrows: checkEscrowHistory(offer.offerorId)
  };
}
```

---

## 9. ANALYTICS & REPORTING | التحليلات والتقارير

### 9.1 Key Metrics | المقاييس الرئيسية

```typescript
interface BarterAnalytics {
  // Volume metrics
  totalOffers: number;
  acceptedOffers: number;
  rejectedOffers: number;
  completedBarters: number;

  // Value metrics
  totalValueExchanged: number;
  avgOfferValue: number;
  avgCashTopUp: number;

  // Efficiency metrics
  avgTimeToAccept: string;
  avgTimeToComplete: string;
  conversionRate: number;

  // Matching metrics
  aiMatchRate: number;
  chainParticipationRate: number;
  avgChainSize: number;

  // Trust metrics
  avgTrustScore: number;
  disputeRate: number;
  fraudDetectionRate: number;
}
```

---

## 10. INTEGRATION POINTS | نقاط التكامل

### 10.1 With Other Markets | مع الأسواق الأخرى

```typescript
const integrations = {
  // Cross-market barter
  allowBarterFrom: ['items', 'cars', 'properties', 'mobiles', 'gold', 'silver'],

  // Auction to barter
  convertAuctionToBarter: true, // Failed auctions can become barter offers

  // Buy Now + Barter
  hybridListings: true, // Items can accept both cash and barter

  // Escrow integration
  useUnifiedEscrow: true,

  // Review integration
  useUnifiedReviews: true,

  // Notification integration
  useUnifiedNotifications: true
};
```

### 10.2 External Integrations | التكاملات الخارجية

```typescript
const externalIntegrations = {
  // Payment for cash top-ups
  paymentGateways: ['paymob', 'fawry', 'vodafoneCash'],

  // Delivery coordination
  deliveryPartners: ['aramex', 'bosta', 'exchange-points'],

  // Verification services
  verificationProviders: ['egyptian-id-verification'],

  // Valuation services
  valuationApis: ['ai-price-estimation', 'market-comparison']
};
```
