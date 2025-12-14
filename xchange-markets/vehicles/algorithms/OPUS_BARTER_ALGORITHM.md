# OPUS TASK: Multi-Party Barter Matching Algorithm for Xchange

## Context
You are building an innovative barter system for Xchange marketplace that allows users to exchange vehicles (and potentially other assets) in complex multi-party transactions. This goes beyond simple 1:1 swaps to enable circular exchanges like: A's car → B's car → C's car → A's phone.

## Objective
Create a sophisticated matching algorithm that:
1. Finds optimal multi-party barter chains
2. Calculates fair value adjustments
3. Handles cross-category exchanges (car ↔ phone ↔ gold ↔ property)
4. Minimizes cash transfers needed
5. Ensures all parties benefit

## Core Concepts

### Simple Barter (2-Party)
```
User A has: Car worth 500K
User B has: Car worth 450K

Solution:
- A gives car to B
- B gives car + 50K cash to A
```

### Circular Barter (3-Party)
```
User A has: Toyota Corolla 2021 (480K), wants: Hyundai Tucson
User B has: Hyundai Tucson 2020 (550K), wants: Mercedes C-Class
User C has: Mercedes C-Class 2018 (620K), wants: Toyota Corolla

Direct chain: A → B → C → A
Value imbalance: 480K → 550K → 620K → 480K
Total difference: 210K

Cash flow optimization:
- A pays 70K to B
- B pays 70K to C  
- C pays 70K to A
Net: All balanced!
```

### Cross-Category (Complex)
```
User A: Car 500K → wants iPhone 15 Pro (40K) + Cash
User B: iPhone 15 Pro 40K → wants Gold jewelry (60K)
User C: Gold jewelry 60K → wants Car

Chain: A's car → C, B's phone → A, C's gold → B
Cash adjustments:
- C pays A: 500K - 40K = 460K
- B pays C: 60K - 40K = 20K
```

## Data Structures

```typescript
interface BarterItem {
  id: string;
  userId: string;
  category: "CAR" | "PHONE" | "GOLD" | "PROPERTY" | "MIXED";
  listingId?: string;  // For cars/phones
  estimatedValue: number;
  description: string;
  
  // For cars specifically
  vehicleDetails?: {
    make: string;
    model: string;
    year: number;
    mileage: number;
  };
}

interface BarterPreference {
  userId: string;
  offering: BarterItem;
  seeking: {
    categories: string[];       // ["CAR", "PROPERTY"]
    minValue?: number;
    maxValue?: number;
    specificRequirements?: {
      make?: string[];          // ["Toyota", "Honda"]
      yearMin?: number;
      mileageMax?: number;
    };
  };
  acceptsCash: boolean;          // Willing to add/receive cash
  maxCashDifference?: number;    // Maximum cash willing to pay/receive
}

interface BarterChain {
  participants: string[];         // User IDs in order
  items: BarterItem[];           // Items in exchange order
  
  // Value flow
  values: number[];              // Value of each item in chain
  totalImbalance: number;        // Sum of value differences
  
  // Cash adjustments needed
  cashFlows: Array<{
    from: string;                // User ID
    to: string;                  // User ID
    amount: number;
  }>;
  
  // Metrics
  chainLength: number;           // 2, 3, 4, etc.
  complexity: number;            // 0-100 score
  fairness: number;              // 0-100 (how balanced are values)
  feasibility: number;           // 0-100 (likelihood of completion)
  
  // For ranking
  score: number;                 // Overall score for optimization
}
```

## Algorithm Design

### Phase 1: Build Barter Graph

```typescript
interface BarterGraph {
  nodes: Map<string, BarterPreference>;  // userId → preference
  edges: Map<string, string[]>;          // userId → potential matches
  
  // Pre-computed compatibility matrix
  compatibility: Map<string, Map<string, number>>;  // userId → userId → score
}

function buildBarterGraph(preferences: BarterPreference[]): BarterGraph {
  // 1. Create nodes for each user with their offering/seeking
  
  // 2. For each pair of users, calculate compatibility:
  //    - Does A's offering match B's seeking?
  //    - Is value difference acceptable?
  //    - Are categories compatible?
  
  // 3. Create directed edges where compatibility > threshold
  
  // Compatibility scoring:
  // - Perfect match (exact category + value ±10%): 100
  // - Category match + acceptable value gap: 70-90
  // - Category mismatch but cash adjustment possible: 40-60
  // - Incompatible: 0
}
```

### Phase 2: Find Cycles (Chains)

```typescript
function findBarterChains(
  graph: BarterGraph,
  maxChainLength: number = 5
): BarterChain[] {
  
  const chains: BarterChain[] = [];
  
  // Use DFS to find cycles
  for (const startUser of graph.nodes.keys()) {
    const visited = new Set<string>();
    const path: string[] = [];
    
    function dfs(currentUser: string, depth: number) {
      if (depth > maxChainLength) return;
      
      visited.add(currentUser);
      path.push(currentUser);
      
      // Check if we've completed a cycle back to start
      if (depth > 1 && graph.edges.get(currentUser)?.includes(startUser)) {
        // Found a valid cycle!
        const chain = constructChain(path);
        if (isViableChain(chain)) {
          chains.push(chain);
        }
      }
      
      // Continue exploring
      for (const nextUser of graph.edges.get(currentUser) || []) {
        if (!visited.has(nextUser)) {
          dfs(nextUser, depth + 1);
        }
      }
      
      path.pop();
      visited.delete(currentUser);
    }
    
    dfs(startUser, 0);
  }
  
  return chains;
}
```

### Phase 3: Calculate Cash Flows

```typescript
function calculateCashFlows(chain: BarterChain): CashFlow[] {
  /*
  Goal: Minimize total cash transferred while balancing value
  
  Example:
  User A: gives 500K car → receives 450K car (shortfall: 50K)
  User B: gives 450K car → receives 600K car (shortfall: 150K)
  User C: gives 600K car → receives 500K car (surplus: 100K)
  
  Imbalances: A needs +50K, B needs +150K, C has +100K
  
  Solution:
  - C pays B 100K (C's surplus to B's need)
  - A pays B 50K (A's shortfall becomes payment)
  - Net: B receives 150K total, A pays 50K, C pays 100K ✓
  */
  
  const imbalances: Map<string, number> = new Map();
  
  // Calculate each user's imbalance
  for (let i = 0; i < chain.participants.length; i++) {
    const userId = chain.participants[i];
    const giving = chain.values[i];
    const receiving = chain.values[(i + 1) % chain.participants.length];
    
    imbalances.set(userId, receiving - giving);
  }
  
  // Optimize cash flows using minimum cost flow algorithm
  return optimizeCashFlows(imbalances);
}

function optimizeCashFlows(
  imbalances: Map<string, number>
): CashFlow[] {
  // Separate creditors (owed money) and debtors (owe money)
  const creditors = Array.from(imbalances.entries())
    .filter(([_, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1]);
  
  const debtors = Array.from(imbalances.entries())
    .filter(([_, amount]) => amount < 0)
    .map(([id, amt]) => [id, -amt] as [string, number])
    .sort((a, b) => b[1] - a[1]);
  
  const flows: CashFlow[] = [];
  
  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const [creditorId, creditAmount] = creditors[i];
    const [debtorId, debtAmount] = debtors[j];
    
    const transferAmount = Math.min(creditAmount, debtAmount);
    
    flows.push({
      from: debtorId,
      to: creditorId,
      amount: transferAmount
    });
    
    creditors[i][1] -= transferAmount;
    debtors[j][1] -= transferAmount;
    
    if (creditors[i][1] === 0) i++;
    if (debtors[j][1] === 0) j++;
  }
  
  return flows;
}
```

### Phase 4: Rank & Filter Chains

```typescript
function rankChains(chains: BarterChain[]): BarterChain[] {
  return chains
    .map(chain => ({
      ...chain,
      score: calculateChainScore(chain)
    }))
    .sort((a, b) => b.score - a.score);
}

function calculateChainScore(chain: BarterChain): number {
  /*
  Scoring factors:
  1. Fairness (40%) - How balanced are values
  2. Simplicity (30%) - Fewer participants = better
  3. Cash requirement (20%) - Less cash transfer = better
  4. Feasibility (10%) - User reliability, past transactions
  */
  
  // Fairness: inverse of value variance
  const valueVariance = calculateVariance(chain.values);
  const maxAcceptableVariance = 100000; // 100K EGP
  const fairnessScore = Math.max(0, 100 - (valueVariance / maxAcceptableVariance * 100));
  
  // Simplicity: prefer shorter chains
  const simplicityScore = Math.max(0, 100 - (chain.chainLength - 2) * 20);
  
  // Cash requirement: prefer minimal cash transfer
  const totalCash = chain.cashFlows.reduce((sum, flow) => sum + flow.amount, 0);
  const avgItemValue = chain.values.reduce((a, b) => a + b) / chain.values.length;
  const cashRatio = totalCash / avgItemValue;
  const cashScore = Math.max(0, 100 - cashRatio * 50);
  
  // Feasibility: based on user trust scores
  const avgTrustScore = calculateAverageTrustScore(chain.participants);
  const feasibilityScore = avgTrustScore;
  
  // Weighted total
  return (
    fairnessScore * 0.4 +
    simplicityScore * 0.3 +
    cashScore * 0.2 +
    feasibilityScore * 0.1
  );
}
```

### Phase 5: Validation & Constraints

```typescript
function isViableChain(chain: BarterChain): boolean {
  // Check constraints:
  
  // 1. All participants must have verified accounts
  if (!allParticipantsVerified(chain.participants)) {
    return false;
  }
  
  // 2. Maximum cash difference per user not exceeded
  for (const flow of chain.cashFlows) {
    const userPreference = getUserPreference(flow.from);
    if (flow.amount > userPreference.maxCashDifference) {
      return false;
    }
  }
  
  // 3. All items still available (not sold/removed)
  if (!allItemsAvailable(chain.items)) {
    return false;
  }
  
  // 4. Value imbalance not too extreme
  if (chain.totalImbalance > 200000) {  // 200K EGP max
    return false;
  }
  
  // 5. No duplicate participants
  if (new Set(chain.participants).size !== chain.participants.length) {
    return false;
  }
  
  return true;
}
```

## Cross-Category Matching

```typescript
interface CategoryConverter {
  fromCategory: string;
  toCategory: string;
  conversionRate: number;  // Liquidity penalty
}

const categoryConversions: CategoryConverter[] = [
  // Cars are most liquid (baseline)
  { fromCategory: "CAR", toCategory: "CAR", conversionRate: 1.0 },
  
  // Phones less liquid (20% penalty)
  { fromCategory: "PHONE", toCategory: "CAR", conversionRate: 0.8 },
  { fromCategory: "CAR", toCategory: "PHONE", conversionRate: 1.0 },
  
  // Gold medium liquid (10% penalty)
  { fromCategory: "GOLD", toCategory: "CAR", conversionRate: 0.9 },
  { fromCategory: "CAR", toCategory: "GOLD", conversionRate: 1.0 },
  
  // Property least liquid (30% penalty)
  { fromCategory: "PROPERTY", toCategory: "CAR", conversionRate: 0.7 },
  { fromCategory: "CAR", toCategory: "PROPERTY", conversionRate: 1.0 },
];

function adjustValueForCategory(
  value: number,
  fromCategory: string,
  toCategory: string
): number {
  const converter = categoryConversions.find(
    c => c.fromCategory === fromCategory && c.toCategory === toCategory
  );
  
  return value * (converter?.conversionRate || 0.8);
}
```

## Notification & Coordination

```typescript
interface BarterProposal {
  chainId: string;
  chain: BarterChain;
  proposedBy: string;
  proposedAt: Date;
  
  // Acceptance tracking
  acceptances: Map<string, {
    accepted: boolean;
    acceptedAt?: Date;
    conditions?: string;
  }>;
  
  // Timing
  expiresAt: Date;  // 48 hours to accept
  
  // Status
  status: "PROPOSED" | "NEGOTIATING" | "ACCEPTED" | "EXECUTING" | "COMPLETED" | "FAILED";
}

async function proposeBarterChain(chain: BarterChain): Promise<BarterProposal> {
  // 1. Create proposal record
  const proposal: BarterProposal = {
    chainId: generateUUID(),
    chain,
    proposedBy: chain.participants[0],
    proposedAt: new Date(),
    acceptances: new Map(),
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    status: "PROPOSED"
  };
  
  // 2. Notify all participants
  for (const userId of chain.participants) {
    await sendBarterNotification(userId, {
      type: "BARTER_CHAIN_PROPOSAL",
      chain,
      cashFlow: chain.cashFlows.find(f => f.from === userId || f.to === userId),
      expiresIn: "48 hours"
    });
  }
  
  // 3. Reserve all items (temporary hold)
  for (const item of chain.items) {
    await reserveItem(item.listingId, proposal.chainId);
  }
  
  return proposal;
}

async function executeBarterChain(proposalId: string): Promise<void> {
  /*
  Execution steps:
  1. Verify all acceptances
  2. Schedule inspections (if items not already certified)
  3. Process cash payments (via escrow)
  4. Transfer ownership documents
  5. Coordinate physical exchanges
  6. Release escrow
  7. Complete transactions
  */
  
  // This is a complex orchestration requiring state machine
  // and careful error handling with rollback capabilities
}
```

## Performance Optimizations

```typescript
// Cache frequently accessed data
const graphCache = new Map<string, BarterGraph>();
const chainCache = new Map<string, BarterChain[]>();

// Limit search space
const MAX_GRAPH_NODES = 1000;  // Only consider most active users
const MAX_CHAIN_LENGTH = 4;     // Avoid overly complex chains
const MAX_CHAINS_TO_CONSIDER = 50;  // Top 50 best matches

// Incremental updates
async function updateBarterGraph(userId: string, preference: BarterPreference) {
  // Only recompute edges for this user, not entire graph
  const graph = await getGraph();
  graph.nodes.set(userId, preference);
  
  // Update compatibility with all existing users
  for (const [otherUserId, otherPref] of graph.nodes) {
    if (otherUserId === userId) continue;
    
    const compatibility = calculateCompatibility(preference, otherPref);
    graph.compatibility.get(userId)?.set(otherUserId, compatibility);
    graph.compatibility.get(otherUserId)?.set(userId, calculateCompatibility(otherPref, preference));
  }
  
  graphCache.set("main", graph);
}
```

## Testing Requirements

```typescript
describe("Barter Matching Algorithm", () => {
  test("Simple 2-party car swap", () => {
    // User A: Toyota 500K → wants Hyundai
    // User B: Hyundai 450K → wants Toyota
    // Expected: A pays B 50K
  });
  
  test("3-party circular barter", () => {
    // A: Car1 (480K) → wants Car2
    // B: Car2 (550K) → wants Car3
    // C: Car3 (620K) → wants Car1
    // Expected: Find chain with balanced cash flows
  });
  
  test("Cross-category: Car for Phone + Cash", () => {
    // A: Car (500K) → wants iPhone (40K)
    // B: iPhone (40K) → wants Car
    // Expected: B pays A 460K
  });
  
  test("No possible match", () => {
    // A: Car (1M) → wants Cheap car (100K)
    // B: Car (100K) → wants Luxury car (2M)
    // Expected: No viable chain (imbalance too large)
  });
  
  test("4-party complex chain", () => {
    // A→B→C→D→A with varying values
    // Expected: Optimal cash flow minimization
  });
});
```

## Deliverables

1. ✅ Complete TypeScript implementation of barter matching
2. ✅ Graph building and cycle detection algorithms
3. ✅ Cash flow optimization function
4. ✅ Chain scoring and ranking system
5. ✅ Cross-category value conversion
6. ✅ Notification and coordination system
7. ✅ Comprehensive test suite
8. ✅ Performance benchmarks
9. ✅ API endpoint implementations
10. ✅ Documentation with examples

## Success Criteria

- Find optimal 2-party matches in < 100ms
- Find 3-party matches in < 500ms
- Handle 4+ party matches in < 2 seconds
- Support 10,000+ active barter preferences
- 95%+ user satisfaction with proposed matches
- Zero execution failures due to coordination issues

---

**Begin Implementation:**
Start with graph construction, then implement cycle detection, then optimize cash flows, finally add cross-category support.
