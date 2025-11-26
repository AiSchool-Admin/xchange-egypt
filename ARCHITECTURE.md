# Xchange Multi-Party Bartering System Architecture

## Executive Summary

This document outlines the complete architecture for transforming Xchange from a simple 2-party barter system into a sophisticated multi-party (2-N) bartering platform with AI-driven chain discovery.

**Current State:**
- ✅ 3-level category hierarchy (Category → Sub-Category → Sub-Sub-Category)
- ✅ Basic 2-party barter matching with weighted scoring
- ✅ Item listings with desired preferences
- ❌ Multi-party barter chains
- ❌ Priority-based item selection (A, B, C)
- ❌ Chain optimization and ranking

**Target State:**
- Multi-party barter chains (2-N participants)
- Graph-based chain discovery algorithm
- AI-driven matching with chain optimization
- Priority-based preferences with fallback logic
- Real-time chain validation and notifications
- Transaction coordination and escrow

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Next.js)                   │
├─────────────────────────────────────────────────────────────┤
│  - Barter Request UI (A/B/C Priority Selection)             │
│  - Chain Visualization (Interactive Graph)                  │
│  - Notification & Approval Interface                        │
└─────────────────┬───────────────────────────────────────────┘
                  │ REST/GraphQL API
┌─────────────────▼───────────────────────────────────────────┐
│                   API Gateway (Express)                      │
├─────────────────────────────────────────────────────────────┤
│  - Authentication & Authorization                           │
│  - Rate Limiting                                            │
│  - Request Validation                                       │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                 Business Logic Layer                         │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────┐  ┌────────────────────┐            │
│  │ Chain Discovery    │  │ Matching Engine    │            │
│  │ Service            │  │ Service            │            │
│  └────────────────────┘  └────────────────────┘            │
│  ┌────────────────────┐  ┌────────────────────┐            │
│  │ Chain Validation   │  │ Transaction        │            │
│  │ Service            │  │ Coordinator        │            │
│  └────────────────────┘  └────────────────────┘            │
│  ┌────────────────────┐  ┌────────────────────┐            │
│  │ Notification       │  │ Escrow             │            │
│  │ Service            │  │ Service            │            │
│  └────────────────────┘  └────────────────────┘            │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                    Data Layer (Prisma)                       │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL Database (Supabase)                             │
│  - Items, Users, Categories                                 │
│  - BarterRequests (with A/B/C priorities)                   │
│  - BarterChains, ChainParticipants                          │
│  - Transactions, Escrows                                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                  Infrastructure Layer                        │
├─────────────────────────────────────────────────────────────┤
│  - Background Jobs (Bull/Redis)                             │
│  - Cache Layer (Redis)                                      │
│  - File Storage (Supabase Storage)                          │
│  - Message Queue (for chain coordination)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Core Components

### 2.1 Chain Discovery Service

**Purpose:** Find optimal barter chains using graph algorithms

**Key Responsibilities:**
1. Build directed weighted graph from active items
2. Execute chain discovery algorithms (DFS, A*, Cycle Detection)
3. Rank chains by quality score
4. Handle priority-based preferences (A → B → C)

**Algorithm Flow:**

```
1. Graph Construction:
   ├─ Nodes: Active items available for barter
   ├─ Edges: Potential matches (weighted by score)
   └─ Weights: Combined score (40% desc, 30% L2, 30% L3)

2. Chain Discovery (for each item):
   ├─ Start Node: User's item to offer
   ├─ Target Nodes: Priority A items (best match)
   │  ├─ If not found → Priority B items
   │  └─ If not found → Priority C items
   └─ Algorithms:
      ├─ Simple Cycles (2-party): Direct swap A↔B
      ├─ 3-Party Chains: A→B→C→A
      ├─ N-Party Chains: A→B→C→...→N→A
      └─ Max Chain Length: Configurable (default: 5)

3. Chain Validation:
   ├─ All participants have what next person wants
   ├─ Chain closes (forms complete cycle)
   ├─ No duplicate participants
   └─ All items still available

4. Chain Ranking:
   ├─ Shortest chains preferred (fewer participants)
   ├─ Higher average match scores
   ├─ Priority level achieved (A > B > C)
   └─ Participant reputation scores
```

**Pseudocode:**

```typescript
interface BarterNode {
  itemId: string;
  ownerId: string;
  priorities: {
    A: DesiredItem[];  // Primary preference
    B: DesiredItem[];  // Secondary preference
    C: DesiredItem[];  // Tertiary preference
  };
  matchScores: Map<string, number>;  // itemId → score
}

interface BarterChain {
  participants: ChainLink[];
  totalScore: number;
  averageScore: number;
  priorityLevel: 'A' | 'B' | 'C';
  isComplete: boolean;
}

async function discoverChains(
  startItemId: string,
  maxDepth: number = 5
): Promise<BarterChain[]> {

  const graph = await buildBarterGraph();
  const startNode = graph.nodes.get(startItemId);
  const chains: BarterChain[] = [];

  // Try priority A first
  const chainsA = findCycles(graph, startNode, 'A', maxDepth);
  if (chainsA.length > 0) {
    chains.push(...chainsA);
  }

  // Try priority B if A failed or found few options
  if (chainsA.length < 3) {
    const chainsB = findCycles(graph, startNode, 'B', maxDepth);
    chains.push(...chainsB);
  }

  // Try priority C as last resort
  if (chains.length < 5) {
    const chainsC = findCycles(graph, startNode, 'C', maxDepth);
    chains.push(...chainsC);
  }

  // Rank and return top chains
  return rankChains(chains);
}

function findCycles(
  graph: BarterGraph,
  start: BarterNode,
  priority: 'A' | 'B' | 'C',
  maxDepth: number
): BarterChain[] {

  const chains: BarterChain[] = [];
  const visited = new Set<string>();
  const path: ChainLink[] = [];

  function dfs(current: BarterNode, depth: number) {
    if (depth > maxDepth) return;

    visited.add(current.itemId);
    path.push({
      itemId: current.itemId,
      ownerId: current.ownerId,
      givesTo: null,  // Set in next iteration
    });

    // Get desired items at this priority level
    const desired = current.priorities[priority];

    for (const target of desired) {
      const targetNode = graph.nodes.get(target.itemId);

      // Found cycle back to start
      if (targetNode.itemId === start.itemId && depth >= 2) {
        chains.push(completePath(path));
        continue;
      }

      // Continue exploring
      if (!visited.has(targetNode.itemId)) {
        dfs(targetNode, depth + 1);
      }
    }

    // Backtrack
    visited.delete(current.itemId);
    path.pop();
  }

  dfs(start, 0);
  return chains;
}

function rankChains(chains: BarterChain[]): BarterChain[] {
  return chains.sort((a, b) => {
    // 1. Shorter chains preferred
    if (a.participants.length !== b.participants.length) {
      return a.participants.length - b.participants.length;
    }

    // 2. Higher priority level
    const priorityMap = { A: 3, B: 2, C: 1 };
    if (a.priorityLevel !== b.priorityLevel) {
      return priorityMap[b.priorityLevel] - priorityMap[a.priorityLevel];
    }

    // 3. Higher average match score
    return b.averageScore - a.averageScore;
  });
}
```

---

### 2.2 Database Schema Extensions

**New Tables:**

```prisma
// Priority-based barter request
model BarterRequest {
  id          String   @id @default(uuid())
  itemId      String   @map("item_id")
  userId      String   @map("user_id")

  // Priority A: Primary preference
  priorityA   Json     @map("priority_a")  // { categoryIds: [], keywords: "" }

  // Priority B: Secondary preference
  priorityB   Json?    @map("priority_b")

  // Priority C: Tertiary preference (often just cash)
  priorityC   Json?    @map("priority_c")

  status      BarterRequestStatus  @default(ACTIVE)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  item        Item     @relation(fields: [itemId], references: [id])
  user        User     @relation(fields: [userId], references: [id])
  chains      ChainParticipant[]

  @@map("barter_requests")
}

enum BarterRequestStatus {
  ACTIVE
  IN_CHAIN
  COMPLETED
  CANCELLED
}

// Discovered barter chain
model BarterChain {
  id              String   @id @default(uuid())
  chainType       ChainType
  participantCount Int     @map("participant_count")

  // Chain quality metrics
  averageScore    Float    @map("average_score")
  totalScore      Float    @map("total_score")
  priorityLevel   String   @map("priority_level")  // "A", "B", or "C"

  // Chain lifecycle
  status          ChainStatus  @default(PENDING)
  discoveredAt    DateTime @default(now()) @map("discovered_at")
  approvedAt      DateTime? @map("approved_at")
  completedAt     DateTime? @map("completed_at")
  expiresAt       DateTime @map("expires_at")  // Auto-expire after 48h

  participants    ChainParticipant[]
  transactions    Transaction[]

  @@map("barter_chains")
}

enum ChainType {
  TWO_PARTY      // A ↔ B
  THREE_PARTY    // A → B → C → A
  MULTI_PARTY    // A → B → ... → N → A
}

enum ChainStatus {
  PENDING        // Awaiting participant approvals
  APPROVED       // All participants approved
  IN_PROGRESS    // Exchange in progress
  COMPLETED      // Successfully completed
  REJECTED       // One or more participants rejected
  EXPIRED        // Approval deadline passed
  CANCELLED      // Manually cancelled
}

// Individual participant in a chain
model ChainParticipant {
  id              String   @id @default(uuid())
  chainId         String   @map("chain_id")
  barterRequestId String   @map("barter_request_id")

  // What this participant gives/receives
  givesItemId     String   @map("gives_item_id")
  receivesItemId  String   @map("receives_item_id")

  // Position in chain (0-indexed)
  position        Int

  // Approval workflow
  approvalStatus  ApprovalStatus @default(PENDING) @map("approval_status")
  approvedAt      DateTime? @map("approved_at")
  rejectedReason  String? @map("rejected_reason")

  // Match quality for this participant
  matchScore      Float    @map("match_score")

  chain           BarterChain   @relation(fields: [chainId], references: [id])
  barterRequest   BarterRequest @relation(fields: [barterRequestId], references: [id])
  givesItem       Item          @relation("GivesItem", fields: [givesItemId], references: [id])
  receivesItem    Item          @relation("ReceivesItem", fields: [receivesItemId], references: [id])

  @@unique([chainId, barterRequestId])
  @@map("chain_participants")
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}

// Transaction tracking for chain exchanges
model Transaction {
  id          String   @id @default(uuid())
  chainId     String   @map("chain_id")

  fromUserId  String   @map("from_user_id")
  toUserId    String   @map("to_user_id")
  itemId      String   @map("item_id")

  // Delivery/exchange tracking
  status      TransactionStatus @default(PENDING)
  exchangedAt DateTime? @map("exchanged_at")
  confirmedAt DateTime? @map("confirmed_at")

  // Escrow (if needed)
  escrowId    String?  @map("escrow_id")

  chain       BarterChain @relation(fields: [chainId], references: [id])
  fromUser    User        @relation("TransactionFrom", fields: [fromUserId], references: [id])
  toUser      User        @relation("TransactionTo", fields: [toUserId], references: [id])
  item        Item        @relation(fields: [itemId], references: [id])
  escrow      Escrow?     @relation(fields: [escrowId], references: [id])

  @@map("transactions")
}

enum TransactionStatus {
  PENDING        // Waiting for exchange
  IN_TRANSIT     // Item being delivered
  DELIVERED      // Item delivered, awaiting confirmation
  CONFIRMED      // Receiver confirmed receipt
  DISPUTED       // Issue reported
  RESOLVED       // Dispute resolved
}

// Optional escrow for high-value items
model Escrow {
  id          String   @id @default(uuid())
  description String
  value       Float    // Estimated value for insurance

  status      EscrowStatus @default(HELD)
  heldAt      DateTime @default(now()) @map("held_at")
  releasedAt  DateTime? @map("released_at")

  transactions Transaction[]

  @@map("escrows")
}

enum EscrowStatus {
  HELD
  RELEASED
  REFUNDED
}
```

---

### 2.3 API Endpoints

**Barter Request Management:**

```
POST   /api/barter-requests
GET    /api/barter-requests/:id
PATCH  /api/barter-requests/:id
DELETE /api/barter-requests/:id
```

**Chain Discovery:**

```
POST   /api/chains/discover
       Body: { itemId, maxDepth?, minScore? }
       Returns: BarterChain[]

GET    /api/chains/:id
       Returns: BarterChain with full participant details

GET    /api/chains/my-opportunities
       Returns: Chains where current user is a participant
```

**Chain Approval Workflow:**

```
POST   /api/chains/:chainId/approve
       Body: { participantId }
       Approves participation in chain

POST   /api/chains/:chainId/reject
       Body: { participantId, reason }
       Rejects participation

GET    /api/chains/:chainId/status
       Returns: Approval status of all participants
```

**Transaction Management:**

```
POST   /api/transactions/:id/mark-delivered
POST   /api/transactions/:id/confirm-receipt
POST   /api/transactions/:id/dispute
```

---

### 2.4 Priority-Based Preference UI

**Barter Request Form:**

```tsx
interface BarterRequestForm {
  itemId: string;

  // Priority A: Primary Preference
  priorityA: {
    categoryId: string;
    subCategoryId?: string;
    subSubCategoryId?: string;
    keywords: string;
  };

  // Priority B: Secondary Preference (optional)
  priorityB?: {
    categoryId: string;
    subCategoryId?: string;
    subSubCategoryId?: string;
    keywords: string;
  };

  // Priority C: Tertiary Preference (optional, often "Cash")
  priorityC?: {
    categoryId: string;  // Could be "Cash & Services"
    subCategoryId?: string;
    subSubCategoryId?: string;
    keywords: string;
    cashAmount?: number;
  };
}

// Example UI Component
<form onSubmit={handleSubmit}>
  <h3>I'm offering:</h3>
  <ItemSelector value={formData.itemId} />

  <h3>Priority A - I most want:</h3>
  <CategoryCascade
    level1={formData.priorityA.categoryId}
    level2={formData.priorityA.subCategoryId}
    level3={formData.priorityA.subSubCategoryId}
    onChange={(cats) => setPriorityA(cats)}
  />
  <input
    placeholder="Keywords (e.g., 'Samsung 24 feet')"
    value={formData.priorityA.keywords}
  />

  <h3>Priority B - Or I'd accept: (optional)</h3>
  <CategoryCascade {...} />

  <h3>Priority C - Or as last resort: (optional)</h3>
  <CategoryCascade {...} />
  <input
    type="number"
    placeholder="Cash amount (optional)"
  />

  <button>Find Barter Opportunities</button>
</form>
```

---

### 2.5 Chain Visualization

**Interactive Graph Display:**

```tsx
interface ChainVisualizationProps {
  chain: BarterChain;
}

// Example: 4-party chain A → B → C → D → A
const ChainVisualization = ({ chain }: ChainVisualizationProps) => {
  return (
    <div className="chain-graph">
      {chain.participants.map((participant, idx) => {
        const next = chain.participants[(idx + 1) % chain.participants.length];

        return (
          <div key={participant.id} className="chain-link">
            {/* Current participant */}
            <UserCard user={participant.user}>
              <ItemCard item={participant.givesItem} label="Gives" />
              <ArrowRight />
              <ItemCard item={participant.receivesItem} label="Receives" />
            </UserCard>

            {/* Match quality */}
            <MatchScore score={participant.matchScore} />

            {/* Approval status */}
            <ApprovalBadge status={participant.approvalStatus} />

            {/* Arrow to next participant */}
            {idx < chain.participants.length - 1 && <ChainArrow />}
          </div>
        );
      })}

      {/* Chain summary */}
      <ChainSummary
        participantCount={chain.participantCount}
        averageScore={chain.averageScore}
        priorityLevel={chain.priorityLevel}
        expiresAt={chain.expiresAt}
      />

      {/* Approval actions */}
      {isCurrentUserParticipant && (
        <ApprovalActions
          chainId={chain.id}
          participantId={currentParticipant.id}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};
```

---

## 3. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Update database schema (add new tables)
- [ ] Implement BarterRequest model with A/B/C priorities
- [ ] Create priority-based request form UI
- [ ] Update existing items to support new schema

### Phase 2: Chain Discovery (Weeks 3-4)
- [ ] Implement graph construction algorithm
- [ ] Build DFS cycle detection for 2-party chains
- [ ] Extend to 3-party and N-party chains
- [ ] Add chain ranking algorithm
- [ ] Create chain discovery API endpoints

### Phase 3: Approval Workflow (Week 5)
- [ ] Implement ChainParticipant approval logic
- [ ] Build notification system for chain invitations
- [ ] Create chain visualization UI
- [ ] Add approval/rejection actions
- [ ] Implement auto-expiration (48h timeout)

### Phase 4: Transaction Coordination (Week 6)
- [ ] Build transaction tracking system
- [ ] Implement delivery status updates
- [ ] Add confirmation workflow
- [ ] Create dispute resolution interface
- [ ] (Optional) Add escrow system for high-value items

### Phase 5: Optimization & Testing (Week 7-8)
- [ ] Add Redis caching for graph construction
- [ ] Implement background job for periodic chain discovery
- [ ] Performance testing with large datasets
- [ ] Security audit
- [ ] User acceptance testing

---

## 4. Technical Considerations

### 4.1 Performance Optimization

**Graph Construction:**
- Cache the barter graph in Redis (TTL: 5 minutes)
- Rebuild graph only when items/requests change
- Use materialized views for frequently accessed queries

**Chain Discovery:**
- Limit max chain length (default: 5 participants)
- Timeout long-running searches (max: 30 seconds)
- Run discovery as background job for better UX
- Return partial results if timeout reached

**Database Indexing:**
```sql
-- Critical indexes for performance
CREATE INDEX idx_barter_requests_status ON barter_requests(status);
CREATE INDEX idx_chain_participants_approval ON chain_participants(approval_status);
CREATE INDEX idx_chains_status_expires ON barter_chains(status, expires_at);
CREATE INDEX idx_items_category_hierarchy ON items(category_id, desired_sub_category_id, desired_sub_sub_category_id);
```

### 4.2 Scalability

**Horizontal Scaling:**
- Stateless API servers (can scale horizontally)
- Shared Redis cache for coordination
- PostgreSQL read replicas for queries
- Message queue (Redis/RabbitMQ) for async processing

**Vertical Scaling:**
- Optimize graph algorithms (A* instead of BFS)
- Batch notifications
- Lazy load chain details in UI

### 4.3 Security & Fairness

**Anti-Gaming Measures:**
- Limit active barter requests per user (e.g., max 5)
- Reputation system (penalize frequent rejections)
- Rate limiting on chain discovery API
- Prevent circular gaming (user A↔B↔A with dummy accounts)

**Data Privacy:**
- Don't expose full user graph to clients
- Only show chains where user is participant
- Redact sensitive data in notifications

### 4.4 Edge Cases

**Concurrent Chain Conflicts:**
- Item appears in multiple pending chains
- First chain to get all approvals wins
- Auto-reject other chains when item committed
- Notify affected participants

**Partial Approvals:**
- Chain expires after 48h if not all approved
- Send reminders at 24h, 12h, 2h before expiration
- Auto-cancel and notify all participants

**Item Unavailability:**
- Validate all items still active before creating chain
- Revalidate before finalizing approvals
- Cancel chain if any item becomes unavailable

---

## 5. Example User Flow

**Scenario:** Alice wants to trade her laptop for a refrigerator

1. **Create Barter Request:**
   ```
   Alice's Item: MacBook Pro 2021

   Priority A: Home Appliances > Refrigerators > 24 Feet
               Keywords: "Samsung, LG"

   Priority B: Home Appliances > Refrigerators > 20 Feet
               Keywords: "any brand"

   Priority C: Cash & Services
               Amount: $800
   ```

2. **Chain Discovery:**
   - System finds 3 possible chains:
     - 2-party: Alice ↔ Bob (Bob has 24 Feet Samsung)
     - 3-party: Alice → Bob → Charlie → Alice
     - 4-party: Alice → Bob → Charlie → David → Alice

3. **Notification:**
   - All participants receive notification: "You're invited to a barter chain!"
   - Each sees: what they give, what they receive, match score

4. **Approval:**
   - Bob approves (gets MacBook, gives Samsung fridge)
   - Alice approves (gives MacBook, gets Samsung fridge)
   - Chain status: APPROVED

5. **Exchange:**
   - Alice ships MacBook to Bob
   - Bob ships Samsung fridge to Alice
   - Both mark items as delivered
   - Both confirm receipt
   - Chain status: COMPLETED
   - Items marked as TRADED

---

## 6. Success Metrics

**User Engagement:**
- % of items that find barter matches
- Average time to find match
- Chain completion rate
- User satisfaction score

**System Performance:**
- Chain discovery response time (target: <5s)
- Graph construction time (target: <2s)
- API response times (p95 < 500ms)

**Business Metrics:**
- Number of active chains
- Multi-party chain ratio (3+ parties)
- Priority A match rate (vs B/C fallback)
- Platform transaction volume

---

## Conclusion

This architecture transforms Xchange into a sophisticated multi-party bartering platform while maintaining simplicity and performance. The graph-based chain discovery algorithm enables complex trades that wouldn't be possible in traditional 2-party systems, unlocking significant value for users.

**Key Differentiators:**
1. ✅ Priority-based preferences (A/B/C fallback logic)
2. ✅ 3-level category matching for precision
3. ✅ AI-driven chain discovery (2-N participants)
4. ✅ Transparent approval workflow
5. ✅ Transaction coordination with escrow option

**Next Steps:**
1. Review and approve architecture
2. Begin Phase 1 implementation (database schema)
3. Build prototype chain discovery algorithm
4. Test with real user data
