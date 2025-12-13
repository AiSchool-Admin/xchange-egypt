# 🔄 Xchange Barter Algorithm
## خوارزمية المقايضة الذكية - الميزة التنافسية غير القابلة للتقليد

---

## 1. نظرة عامة

خوارزمية المقايضة في Xchange هي **الميزة التنافسية الأساسية** التي تميز المنصة عن كل المنافسين. لا توجد منصة مصرية أو عربية تقدم مقايضة ذكية متعددة الأطراف.

### أنواع المقايضة

| النوع | الوصف | التعقيد |
|-------|-------|---------|
| **Direct (مباشرة)** | A ↔ B | بسيط |
| **Three-Way (ثلاثية)** | A → B → C → A | متوسط |
| **Chain (سلسلة)** | A → B → C → D → A | معقد |

---

## 2. Direct Barter - المقايضة المباشرة

### الفكرة
```
أحمد لديه: iPhone 15 Pro (40,000 ج.م)
أحمد يريد: Samsung S24 Ultra

سارة لديها: Samsung S24 Ultra (45,000 ج.م)
سارة تريد: iPhone 15 Pro

→ تطابق مباشر!
→ أحمد يدفع فرق 5,000 ج.م لسارة
→ كلاهما يحصل على ما يريد
```

### Algorithm
```typescript
interface BarterPreferences {
  wanted_brands: string[];          // العلامات المقبولة
  wanted_models?: string[];         // موديلات محددة (اختياري)
  min_value_percent: number;        // الحد الأدنى كنسبة من قيمة جهازي (e.g., 70%)
  max_value_percent: number;        // الحد الأقصى (e.g., 130%)
  max_cash_to_pay?: number;         // أقصى فرق نقدي مستعد لدفعه
  max_cash_to_receive?: number;     // أقصى فرق نقدي مستعد لاستلامه
  accepted_conditions: string[];    // الحالات المقبولة ['A', 'B']
  same_governorate_only: boolean;   // نفس المحافظة فقط
}

async function findDirectMatches(listing: Listing): Promise<DirectMatch[]> {
  const preferences = listing.barter_preferences as BarterPreferences;
  
  // Step 1: Find listings that match what I want
  const potentialMatches = await prisma.listing.findMany({
    where: {
      accepts_barter: true,
      status: 'active',
      seller_id: { not: listing.seller_id },
      brand: { in: preferences.wanted_brands },
      model: preferences.wanted_models 
        ? { in: preferences.wanted_models } 
        : undefined,
      condition_grade: { in: preferences.accepted_conditions },
      price_egp: {
        gte: listing.price_egp * (preferences.min_value_percent / 100),
        lte: listing.price_egp * (preferences.max_value_percent / 100)
      },
      governorate: preferences.same_governorate_only 
        ? listing.governorate 
        : undefined
    },
    include: {
      seller: true,
      barter_preferences: true
    }
  });

  // Step 2: Filter - do they want what I have?
  const mutualMatches = potentialMatches.filter(match => {
    const theirPrefs = match.barter_preferences as BarterPreferences;
    return (
      theirPrefs.wanted_brands.includes(listing.brand) &&
      (!theirPrefs.wanted_models || theirPrefs.wanted_models.includes(listing.model)) &&
      theirPrefs.accepted_conditions.includes(listing.condition_grade)
    );
  });

  // Step 3: Calculate match details and score
  return mutualMatches.map(match => {
    const valueDiff = match.price_egp - listing.price_egp;
    
    return {
      my_listing: listing,
      their_listing: match,
      value_difference: Math.abs(valueDiff),
      i_pay: valueDiff > 0,
      cash_amount: Math.abs(valueDiff),
      match_score: calculateMatchScore(listing, match),
      location_distance: calculateDistance(listing, match)
    };
  }).sort((a, b) => b.match_score - a.match_score);
}

function calculateMatchScore(listing1: Listing, listing2: Listing): number {
  let score = 0;
  const maxScore = 100;

  // 1. Value Alignment (35 points)
  // Perfect match = 35, decreases as difference increases
  const valueDiff = Math.abs(listing1.price_egp - listing2.price_egp);
  const valueDiffPercent = valueDiff / listing1.price_egp;
  score += Math.max(0, 35 - (valueDiffPercent * 100));

  // 2. Condition Compatibility (20 points)
  const grades = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
  const conditionDiff = Math.abs(
    grades[listing1.condition_grade] - grades[listing2.condition_grade]
  );
  score += (4 - conditionDiff) * 5; // 0-20 points

  // 3. Location Proximity (20 points)
  if (listing1.governorate === listing2.governorate) {
    score += 20;
  } else if (areNeighboring(listing1.governorate, listing2.governorate)) {
    score += 12;
  } else {
    score += 5; // Still possible with shipping
  }

  // 4. Seller Trust (15 points)
  const trustLevels = { 'new': 1, 'verified': 2, 'trusted': 3, 'pro': 4 };
  score += trustLevels[listing2.seller.trust_level] * 3.75;

  // 5. Listing Freshness (10 points)
  const ageInDays = daysSince(listing2.created_at);
  score += Math.max(0, 10 - ageInDays);

  return Math.round(score);
}
```

---

## 3. Three-Way Barter - المقايضة الثلاثية

### الفكرة
```
المشكلة: أحمد يريد ما عند سارة، لكن سارة لا تريد ما عند أحمد!

أحمد: لديه iPhone 15، يريد Samsung S24
سارة: لديها Samsung S24، تريد Xiaomi 14
محمد: لديه Xiaomi 14، يريد iPhone 15

→ سلسلة مغلقة!
→ أحمد يعطي iPhone لمحمد
→ محمد يعطي Xiaomi لسارة
→ سارة تعطي Samsung لأحمد
→ الكل سعيد!
```

### Graph-Based Algorithm

```typescript
interface BarterNode {
  listing_id: string;
  user_id: string;
  has: { brand: string; model: string; value: number };
  wants: BarterPreferences;
}

interface BarterEdge {
  from: string;  // listing_id that gives
  to: string;    // listing_id that receives
  weight: number; // match score
}

class BarterGraph {
  private nodes: Map<string, BarterNode> = new Map();
  private edges: Map<string, BarterEdge[]> = new Map();

  async build(): Promise<void> {
    // Get all active listings that accept barter
    const listings = await prisma.listing.findMany({
      where: { accepts_barter: true, status: 'active' },
      include: { seller: true }
    });

    // Create nodes
    for (const listing of listings) {
      this.nodes.set(listing.id, {
        listing_id: listing.id,
        user_id: listing.seller_id,
        has: {
          brand: listing.brand,
          model: listing.model,
          value: listing.price_egp
        },
        wants: listing.barter_preferences as BarterPreferences
      });
    }

    // Create edges (A → B if owner of A wants something like B)
    for (const [fromId, fromNode] of this.nodes) {
      const outEdges: BarterEdge[] = [];
      
      for (const [toId, toNode] of this.nodes) {
        if (fromId === toId) continue;
        if (fromNode.user_id === toNode.user_id) continue;
        
        if (this.wouldAccept(fromNode.wants, toNode.has)) {
          outEdges.push({
            from: fromId,
            to: toId,
            weight: this.calculateEdgeWeight(fromNode, toNode)
          });
        }
      }
      
      this.edges.set(fromId, outEdges);
    }
  }

  private wouldAccept(wants: BarterPreferences, has: { brand: string; model: string; value: number }): boolean {
    return (
      wants.wanted_brands.includes(has.brand) &&
      (!wants.wanted_models || wants.wanted_models.includes(has.model))
    );
  }

  findCycles(startNode: string, maxLength: number = 4): BarterCycle[] {
    const cycles: BarterCycle[] = [];
    const visited = new Set<string>();
    const path: string[] = [];

    const dfs = (current: string, depth: number) => {
      if (depth > maxLength) return;
      
      path.push(current);
      visited.add(current);

      const edges = this.edges.get(current) || [];
      
      for (const edge of edges) {
        if (edge.to === startNode && depth >= 2) {
          // Found a cycle back to start!
          cycles.push(this.buildCycle([...path]));
        } else if (!visited.has(edge.to)) {
          dfs(edge.to, depth + 1);
        }
      }

      path.pop();
      visited.delete(current);
    };

    dfs(startNode, 0);
    return cycles.sort((a, b) => b.total_score - a.total_score);
  }

  private buildCycle(nodePath: string[]): BarterCycle {
    const participants = nodePath.map((nodeId, index) => {
      const node = this.nodes.get(nodeId)!;
      const nextNodeId = nodePath[(index + 1) % nodePath.length];
      const nextNode = this.nodes.get(nextNodeId)!;
      
      return {
        user_id: node.user_id,
        gives_listing_id: node.listing_id,
        receives_listing_id: nextNode.listing_id,
        gives_value: node.has.value,
        receives_value: nextNode.has.value
      };
    });

    // Calculate cash settlements
    const cashSettlements = this.calculateSettlements(participants);
    
    return {
      participants,
      chain_length: nodePath.length,
      cash_settlements: cashSettlements,
      total_score: this.scoreCycle(participants),
      total_value: participants.reduce((sum, p) => sum + p.gives_value, 0)
    };
  }

  private calculateSettlements(participants: CycleParticipant[]): CashSettlement[] {
    const settlements: CashSettlement[] = [];
    
    for (const participant of participants) {
      const diff = participant.receives_value - participant.gives_value;
      
      if (Math.abs(diff) > 500) { // Minimum threshold
        if (diff > 0) {
          // They receive more valuable item, they pay
          settlements.push({
            payer_id: participant.user_id,
            amount: diff,
            reason: 'value_difference'
          });
        } else {
          // They give more valuable item, they receive
          settlements.push({
            receiver_id: participant.user_id,
            amount: Math.abs(diff),
            reason: 'value_difference'
          });
        }
      }
    }

    return this.netSettlements(settlements);
  }

  private netSettlements(settlements: CashSettlement[]): CashSettlement[] {
    // Net out all settlements to minimize transactions
    const balances = new Map<string, number>();
    
    for (const s of settlements) {
      if (s.payer_id) {
        balances.set(s.payer_id, (balances.get(s.payer_id) || 0) - s.amount);
      }
      if (s.receiver_id) {
        balances.set(s.receiver_id, (balances.get(s.receiver_id) || 0) + s.amount);
      }
    }

    // Create direct transfers from negative to positive balances
    const netted: CashSettlement[] = [];
    const payers = [...balances.entries()].filter(([_, v]) => v < 0);
    const receivers = [...balances.entries()].filter(([_, v]) => v > 0);

    // Simple matching (can be optimized)
    for (const [payerId, payerBalance] of payers) {
      let remaining = Math.abs(payerBalance);
      
      for (const [receiverId, receiverBalance] of receivers) {
        if (remaining <= 0) break;
        if (receiverBalance <= 0) continue;
        
        const amount = Math.min(remaining, receiverBalance);
        netted.push({
          payer_id: payerId,
          receiver_id: receiverId,
          amount,
          reason: 'value_difference'
        });
        
        remaining -= amount;
        balances.set(receiverId, balances.get(receiverId)! - amount);
      }
    }

    return netted;
  }
}
```

---

## 4. Match Scoring System

### Scoring Criteria

```typescript
const SCORING_WEIGHTS = {
  VALUE_ALIGNMENT: 0.35,      // قرب القيمة
  CONDITION_MATCH: 0.20,      // تطابق الحالة
  LOCATION: 0.20,             // القرب الجغرافي
  TRUST: 0.15,                // مستوى ثقة الطرف الآخر
  FRESHNESS: 0.10             // حداثة الإعلان
};

// Egyptian Governorate Proximity Map
const GOVERNORATE_REGIONS = {
  'greater_cairo': ['القاهرة', 'الجيزة', 'القليوبية'],
  'alexandria_region': ['الإسكندرية', 'البحيرة', 'مرسى مطروح'],
  'delta': ['الشرقية', 'الدقهلية', 'الغربية', 'المنوفية', 'كفر الشيخ', 'دمياط'],
  'canal': ['بورسعيد', 'الإسماعيلية', 'السويس'],
  'upper_egypt_north': ['بني سويف', 'الفيوم', 'المنيا'],
  'upper_egypt_south': ['أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان'],
  'red_sea': ['البحر الأحمر', 'جنوب سيناء', 'شمال سيناء']
};

function areNeighboring(gov1: string, gov2: string): boolean {
  for (const region of Object.values(GOVERNORATE_REGIONS)) {
    if (region.includes(gov1) && region.includes(gov2)) {
      return true;
    }
  }
  return false;
}
```

---

## 5. Real-Time Match Discovery

### Background Job
```typescript
// Run every 15 minutes
async function discoverNewMatches() {
  const graph = new BarterGraph();
  await graph.build();

  // For each active barter-enabled listing
  const activeListings = await prisma.listing.findMany({
    where: { accepts_barter: true, status: 'active' }
  });

  for (const listing of activeListings) {
    // Find direct matches
    const directMatches = await findDirectMatches(listing);
    
    // Find multi-party matches
    const multiMatches = graph.findCycles(listing.id, 4);
    
    // Store new matches
    for (const match of [...directMatches, ...multiMatches]) {
      const exists = await prisma.barterMatch.findFirst({
        where: {
          participants: { equals: match.participants }
        }
      });

      if (!exists) {
        await prisma.barterMatch.create({
          data: {
            match_type: match.chain_length === 2 ? 'direct' : 
                        match.chain_length === 3 ? 'three_way' : 'chain',
            participants: match.participants,
            cash_settlements: match.cash_settlements,
            match_score: match.total_score,
            status: 'proposed',
            expires_at: addDays(new Date(), 7)
          }
        });

        // Notify all participants
        for (const participant of match.participants) {
          await sendNotification(participant.user_id, {
            type: 'barter_match',
            title_ar: 'تطابق مقايضة جديد! 🔄',
            body_ar: `وجدنا مقايضة مناسبة لإعلانك`,
            data: { match_id: match.id }
          });
        }
      }
    }
  }
}
```

---

## 6. Transaction Coordination

### Simultaneous Exchange Protocol

```typescript
async function executeBarterTransaction(matchId: string) {
  const match = await prisma.barterMatch.findUnique({
    where: { id: matchId },
    include: { /* all participants and listings */ }
  });

  // All participants must have accepted
  if (match.status !== 'all_accepted') {
    throw new Error('Not all participants accepted');
  }

  // Start transaction
  await prisma.$transaction(async (tx) => {
    // 1. Hold all devices (mark as reserved)
    for (const participant of match.participants) {
      await tx.listing.update({
        where: { id: participant.gives_listing_id },
        data: { status: 'reserved' }
      });
    }

    // 2. Process cash settlements
    for (const settlement of match.cash_settlements) {
      await processPayment({
        payer_id: settlement.payer_id,
        receiver_id: settlement.receiver_id,
        amount: settlement.amount,
        type: 'barter_settlement',
        match_id: matchId
      });
    }

    // 3. Create shipping orders
    // For 3-way: coordinate so all ship on same day
    const shipDate = addDays(new Date(), 1); // Tomorrow
    
    for (const participant of match.participants) {
      const receiver = match.participants.find(
        p => p.receives_listing_id === participant.gives_listing_id
      );
      
      await createShippingOrder({
        from_user: participant.user_id,
        to_user: receiver.user_id,
        listing_id: participant.gives_listing_id,
        scheduled_date: shipDate
      });
    }

    // 4. Update match status
    await tx.barterMatch.update({
      where: { id: matchId },
      data: { status: 'in_progress' }
    });
  });
}
```

---

## 7. Edge Cases & Protections

### Handling Dropouts
```typescript
// If one party backs out after accepting
async function handleBarterDropout(matchId: string, dropoutUserId: string) {
  const match = await prisma.barterMatch.findUnique({ where: { id: matchId } });
  
  // Mark match as cancelled
  await prisma.barterMatch.update({
    where: { id: matchId },
    data: { 
      status: 'cancelled',
      cancellation_reason: 'participant_dropout',
      cancelled_by: dropoutUserId
    }
  });

  // Penalize dropout user
  await prisma.user.update({
    where: { id: dropoutUserId },
    data: {
      trust_score: { decrement: 10 },
      barter_dropout_count: { increment: 1 }
    }
  });

  // Notify other participants
  for (const participant of match.participants) {
    if (participant.user_id !== dropoutUserId) {
      await sendNotification(participant.user_id, {
        type: 'barter_cancelled',
        title_ar: 'تم إلغاء المقايضة ❌',
        body_ar: 'للأسف أحد الأطراف انسحب من المقايضة'
      });
    }
  }

  // Re-activate listings
  for (const participant of match.participants) {
    await prisma.listing.update({
      where: { id: participant.gives_listing_id },
      data: { status: 'active' }
    });
  }
}
```

### Dispute in Multi-Party
```typescript
// If one device doesn't match description in 3-way
async function handleMultiPartyDispute(matchId: string, disputingUserId: string, reason: string) {
  // In multi-party, one dispute affects everyone
  // Options:
  // 1. All return to original state (full reversal)
  // 2. Partial resolution (complex)
  
  // For MVP: Full reversal
  await prisma.barterMatch.update({
    where: { id: matchId },
    data: { status: 'disputed' }
  });

  // Freeze all transactions
  // Initiate return shipping for all devices
  // Platform mediates
}
```

---

## 8. Performance Optimization

### Caching Strategy
```typescript
// Cache the barter graph (rebuild every hour)
const GRAPH_CACHE_KEY = 'barter_graph';
const GRAPH_TTL = 3600; // 1 hour

// Cache user preferences hash for quick lookup
// Only rebuild edges when preferences change
```

### Indexing
```sql
-- Optimize for barter queries
CREATE INDEX idx_listings_barter_active ON listings(accepts_barter, status) 
  WHERE accepts_barter = TRUE AND status = 'active';

CREATE INDEX idx_listings_brand_value ON listings(brand, price_egp) 
  WHERE accepts_barter = TRUE;

CREATE INDEX idx_barter_matches_status ON barter_matches(status) 
  WHERE status IN ('proposed', 'partially_accepted');
```

---

## 9. Analytics & Improvement

### Metrics to Track
```typescript
const BARTER_METRICS = {
  // Success rates
  'direct_match_acceptance_rate': 'accepted / proposed',
  'multi_party_acceptance_rate': 'all_accepted / proposed',
  'completion_rate': 'completed / accepted',
  
  // Quality
  'average_match_score': 'sum(score) / count',
  'average_value_difference': 'sum(diff) / count',
  'average_chain_length': 'sum(length) / count',
  
  // Engagement
  'barter_enabled_percent': 'barter_listings / total_listings',
  'users_with_barter_activity': 'unique users',
  
  // Problems
  'dropout_rate': 'cancelled / accepted',
  'dispute_rate': 'disputed / completed'
};
```

---

*This algorithm is Xchange's core competitive advantage.*
*Patents pending for multi-party barter matching system.*

*Document Version: 1.0*
*Last Updated: December 2024*
