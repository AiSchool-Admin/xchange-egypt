# Xchange Multi-Party Bartering - Implementation Plan

## Overview

This document provides step-by-step implementation instructions for transforming Xchange into a multi-party bartering platform.

---

## Phase 1: Database Schema & Models (Week 1-2)

### Step 1.1: Create New Database Tables

**File:** `backend/prisma/migrations/20251127000000_add_multi_party_barter/migration.sql`

```sql
-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- BARTER REQUESTS WITH A/B/C PRIORITIES
-- ============================================

CREATE TYPE "barter_request_status" AS ENUM (
  'ACTIVE',
  'IN_CHAIN',
  'COMPLETED',
  'CANCELLED'
);

CREATE TABLE "barter_requests" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  "item_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,

  -- Priority A: Primary preference (JSON)
  "priority_a" JSONB NOT NULL,

  -- Priority B: Secondary preference (optional)
  "priority_b" JSONB,

  -- Priority C: Tertiary preference (optional, often cash)
  "priority_c" JSONB,

  "status" barter_request_status NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "barter_requests_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE,
  CONSTRAINT "barter_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "barter_requests_item_id_idx" ON "barter_requests"("item_id");
CREATE INDEX "barter_requests_user_id_idx" ON "barter_requests"("user_id");
CREATE INDEX "barter_requests_status_idx" ON "barter_requests"("status");

-- ============================================
-- BARTER CHAINS
-- ============================================

CREATE TYPE "chain_type" AS ENUM (
  'TWO_PARTY',
  'THREE_PARTY',
  'MULTI_PARTY'
);

CREATE TYPE "chain_status" AS ENUM (
  'PENDING',
  'APPROVED',
  'IN_PROGRESS',
  'COMPLETED',
  'REJECTED',
  'EXPIRED',
  'CANCELLED'
);

CREATE TABLE "barter_chains" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  "chain_type" chain_type NOT NULL,
  "participant_count" INTEGER NOT NULL,

  -- Chain quality metrics
  "average_score" DOUBLE PRECISION NOT NULL,
  "total_score" DOUBLE PRECISION NOT NULL,
  "priority_level" TEXT NOT NULL, -- "A", "B", or "C"

  -- Lifecycle
  "status" chain_status NOT NULL DEFAULT 'PENDING',
  "discovered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approved_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "expires_at" TIMESTAMP(3) NOT NULL, -- Auto-expire after 48h

  CONSTRAINT "barter_chains_priority_level_check" CHECK ("priority_level" IN ('A', 'B', 'C'))
);

CREATE INDEX "barter_chains_status_idx" ON "barter_chains"("status");
CREATE INDEX "barter_chains_expires_at_idx" ON "barter_chains"("expires_at");
CREATE INDEX "barter_chains_status_expires_idx" ON "barter_chains"("status", "expires_at");

-- ============================================
-- CHAIN PARTICIPANTS
-- ============================================

CREATE TYPE "approval_status" AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED'
);

CREATE TABLE "chain_participants" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  "chain_id" TEXT NOT NULL,
  "barter_request_id" TEXT NOT NULL,

  -- What participant gives/receives
  "gives_item_id" TEXT NOT NULL,
  "receives_item_id" TEXT NOT NULL,

  -- Position in chain (0-indexed)
  "position" INTEGER NOT NULL,

  -- Approval workflow
  "approval_status" approval_status NOT NULL DEFAULT 'PENDING',
  "approved_at" TIMESTAMP(3),
  "rejected_reason" TEXT,

  -- Match quality
  "match_score" DOUBLE PRECISION NOT NULL,

  CONSTRAINT "chain_participants_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "barter_chains"("id") ON DELETE CASCADE,
  CONSTRAINT "chain_participants_barter_request_id_fkey" FOREIGN KEY ("barter_request_id") REFERENCES "barter_requests"("id") ON DELETE CASCADE,
  CONSTRAINT "chain_participants_gives_item_id_fkey" FOREIGN KEY ("gives_item_id") REFERENCES "items"("id") ON DELETE RESTRICT,
  CONSTRAINT "chain_participants_receives_item_id_fkey" FOREIGN KEY ("receives_item_id") REFERENCES "items"("id") ON DELETE RESTRICT,
  CONSTRAINT "chain_participants_chain_request_unique" UNIQUE ("chain_id", "barter_request_id")
);

CREATE INDEX "chain_participants_chain_id_idx" ON "chain_participants"("chain_id");
CREATE INDEX "chain_participants_barter_request_id_idx" ON "chain_participants"("barter_request_id");
CREATE INDEX "chain_participants_approval_status_idx" ON "chain_participants"("approval_status");

-- ============================================
-- TRANSACTIONS
-- ============================================

CREATE TYPE "transaction_status" AS ENUM (
  'PENDING',
  'IN_TRANSIT',
  'DELIVERED',
  'CONFIRMED',
  'DISPUTED',
  'RESOLVED'
);

CREATE TABLE "transactions" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  "chain_id" TEXT NOT NULL,

  "from_user_id" TEXT NOT NULL,
  "to_user_id" TEXT NOT NULL,
  "item_id" TEXT NOT NULL,

  -- Delivery tracking
  "status" transaction_status NOT NULL DEFAULT 'PENDING',
  "exchanged_at" TIMESTAMP(3),
  "confirmed_at" TIMESTAMP(3),

  -- Optional escrow
  "escrow_id" TEXT,

  CONSTRAINT "transactions_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "barter_chains"("id") ON DELETE CASCADE,
  CONSTRAINT "transactions_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE RESTRICT,
  CONSTRAINT "transactions_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE RESTRICT,
  CONSTRAINT "transactions_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT
);

CREATE INDEX "transactions_chain_id_idx" ON "transactions"("chain_id");
CREATE INDEX "transactions_from_user_id_idx" ON "transactions"("from_user_id");
CREATE INDEX "transactions_to_user_id_idx" ON "transactions"("to_user_id");
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- ============================================
-- ESCROWS (Optional)
-- ============================================

CREATE TYPE "escrow_status" AS ENUM (
  'HELD',
  'RELEASED',
  'REFUNDED'
);

CREATE TABLE "escrows" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  "description" TEXT NOT NULL,
  "value" DOUBLE PRECISION NOT NULL,

  "status" escrow_status NOT NULL DEFAULT 'HELD',
  "held_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "released_at" TIMESTAMP(3)
);

CREATE INDEX "escrows_status_idx" ON "escrows"("status");

-- Add foreign key constraint to transactions
ALTER TABLE "transactions"
  ADD CONSTRAINT "transactions_escrow_id_fkey"
  FOREIGN KEY ("escrow_id") REFERENCES "escrows"("id") ON DELETE SET NULL;
```

### Step 1.2: Update Prisma Schema

**File:** `backend/prisma/schema.prisma`

Add the new models:

```prisma
// ============================================
// BARTER REQUESTS WITH A/B/C PRIORITIES
// ============================================

model BarterRequest {
  id     String              @id @default(uuid())
  itemId String              @map("item_id")
  userId String              @map("user_id")

  // Priority A: Primary preference
  priorityA Json @map("priority_a")

  // Priority B: Secondary preference
  priorityB Json? @map("priority_b")

  // Priority C: Tertiary preference
  priorityC Json? @map("priority_c")

  status    BarterRequestStatus @default(ACTIVE)
  createdAt DateTime            @default(now()) @map("created_at")
  updatedAt DateTime            @updatedAt @map("updated_at")

  // Relations
  item         Item               @relation(fields: [itemId], references: [id], onDelete: Cascade)
  user         User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  participants ChainParticipant[]

  @@index([itemId])
  @@index([userId])
  @@index([status])
  @@map("barter_requests")
}

enum BarterRequestStatus {
  ACTIVE
  IN_CHAIN
  COMPLETED
  CANCELLED
}

// ============================================
// BARTER CHAINS
// ============================================

model BarterChain {
  id               String      @id @default(uuid())
  chainType        ChainType   @map("chain_type")
  participantCount Int         @map("participant_count")

  // Quality metrics
  averageScore  Float  @map("average_score")
  totalScore    Float  @map("total_score")
  priorityLevel String @map("priority_level")

  // Lifecycle
  status       ChainStatus @default(PENDING)
  discoveredAt DateTime    @default(now()) @map("discovered_at")
  approvedAt   DateTime?   @map("approved_at")
  completedAt  DateTime?   @map("completed_at")
  expiresAt    DateTime    @map("expires_at")

  // Relations
  participants ChainParticipant[]
  transactions Transaction[]

  @@index([status])
  @@index([expiresAt])
  @@index([status, expiresAt])
  @@map("barter_chains")
}

enum ChainType {
  TWO_PARTY
  THREE_PARTY
  MULTI_PARTY
}

enum ChainStatus {
  PENDING
  APPROVED
  IN_PROGRESS
  COMPLETED
  REJECTED
  EXPIRED
  CANCELLED
}

// ============================================
// CHAIN PARTICIPANTS
// ============================================

model ChainParticipant {
  id              String         @id @default(uuid())
  chainId         String         @map("chain_id")
  barterRequestId String         @map("barter_request_id")

  // Exchange details
  givesItemId    String @map("gives_item_id")
  receivesItemId String @map("receives_item_id")

  // Position
  position Int

  // Approval
  approvalStatus ApprovalStatus @default(PENDING) @map("approval_status")
  approvedAt     DateTime?      @map("approved_at")
  rejectedReason String?        @map("rejected_reason")

  // Quality
  matchScore Float @map("match_score")

  // Relations
  chain         BarterChain   @relation(fields: [chainId], references: [id], onDelete: Cascade)
  barterRequest BarterRequest @relation(fields: [barterRequestId], references: [id], onDelete: Cascade)
  givesItem     Item          @relation("GivesItem", fields: [givesItemId], references: [id], onDelete: Restrict)
  receivesItem  Item          @relation("ReceivesItem", fields: [receivesItemId], references: [id], onDelete: Restrict)

  @@unique([chainId, barterRequestId])
  @@index([chainId])
  @@index([barterRequestId])
  @@index([approvalStatus])
  @@map("chain_participants")
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}

// ============================================
// TRANSACTIONS
// ============================================

model Transaction {
  id      String @id @default(uuid())
  chainId String @map("chain_id")

  fromUserId String @map("from_user_id")
  toUserId   String @map("to_user_id")
  itemId     String @map("item_id")

  // Tracking
  status      TransactionStatus @default(PENDING)
  exchangedAt DateTime?         @map("exchanged_at")
  confirmedAt DateTime?         @map("confirmed_at")

  // Escrow
  escrowId String? @map("escrow_id")

  // Relations
  chain    BarterChain @relation(fields: [chainId], references: [id], onDelete: Cascade)
  fromUser User        @relation("TransactionFrom", fields: [fromUserId], references: [id], onDelete: Restrict)
  toUser   User        @relation("TransactionTo", fields: [toUserId], references: [id], onDelete: Restrict)
  item     Item        @relation(fields: [itemId], references: [id], onDelete: Restrict)
  escrow   Escrow?     @relation(fields: [escrowId], references: [id], onDelete: SetNull)

  @@index([chainId])
  @@index([fromUserId])
  @@index([toUserId])
  @@index([status])
  @@map("transactions")
}

enum TransactionStatus {
  PENDING
  IN_TRANSIT
  DELIVERED
  CONFIRMED
  DISPUTED
  RESOLVED
}

// ============================================
// ESCROWS
// ============================================

model Escrow {
  id          String       @id @default(uuid())
  description String
  value       Float

  status     EscrowStatus @default(HELD)
  heldAt     DateTime     @default(now()) @map("held_at")
  releasedAt DateTime?    @map("released_at")

  transactions Transaction[]

  @@index([status])
  @@map("escrows")
}

enum EscrowStatus {
  HELD
  RELEASED
  REFUNDED
}
```

**Also update existing models:**

```prisma
model User {
  // ... existing fields

  // NEW: Relations to barter system
  barterRequests    BarterRequest[]
  transactionsFrom  Transaction[]   @relation("TransactionFrom")
  transactionsTo    Transaction[]   @relation("TransactionTo")
}

model Item {
  // ... existing fields

  // NEW: Relations to barter system
  barterRequests      BarterRequest[]
  givesInChains       ChainParticipant[] @relation("GivesItem")
  receivesInChains    ChainParticipant[] @relation("ReceivesItem")
  transactions        Transaction[]
}
```

### Step 1.3: Apply Migration

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name add_multi_party_barter

# Apply to production (Supabase)
# Option 1: Via Supabase SQL Editor
# Copy contents of migration.sql and run it

# Option 2: Via Prisma
npx prisma migrate deploy
```

---

## Phase 2: Backend Services (Week 3-4)

### Step 2.1: Graph Construction Service

**File:** `backend/src/services/chain-discovery/graph-builder.service.ts`

```typescript
import { PrismaClient } from '@prisma/client';

export interface BarterNode {
  itemId: string;
  ownerId: string;
  requestId: string;

  // Item details
  categoryId: string;
  subCategoryId?: string;
  subSubCategoryId?: string;
  description: string;

  // Desired items (3 priority levels)
  priorityA: DesiredItem;
  priorityB?: DesiredItem;
  priorityC?: DesiredItem;

  // Outgoing edges with weights
  edges: Map<string, number>; // targetItemId → matchScore
}

export interface DesiredItem {
  categoryId?: string;
  subCategoryId?: string;
  subSubCategoryId?: string;
  keywords: string;
  cashAmount?: number;
}

export interface BarterGraph {
  nodes: Map<string, BarterNode>;
  adjacencyList: Map<string, string[]>; // itemId → [targetItemIds]

  // Metadata
  nodeCount: number;
  edgeCount: number;
  builtAt: Date;
}

export class GraphBuilderService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Build complete barter graph from all active requests
   */
  async buildGraph(): Promise<BarterGraph> {
    // 1. Fetch all active barter requests with items
    const requests = await this.prisma.barterRequest.findMany({
      where: { status: 'ACTIVE' },
      include: {
        item: {
          include: {
            category: {
              include: {
                parent: { include: { parent: true } }
              }
            }
          }
        }
      }
    });

    const graph: BarterGraph = {
      nodes: new Map(),
      adjacencyList: new Map(),
      nodeCount: 0,
      edgeCount: 0,
      builtAt: new Date(),
    };

    // 2. Create nodes
    for (const request of requests) {
      const node: BarterNode = {
        itemId: request.item.id,
        ownerId: request.userId,
        requestId: request.id,

        categoryId: request.item.categoryId,
        subCategoryId: this.getSubCategoryId(request.item),
        subSubCategoryId: this.getSubSubCategoryId(request.item),
        description: request.item.description,

        priorityA: request.priorityA as DesiredItem,
        priorityB: request.priorityB as DesiredItem | undefined,
        priorityC: request.priorityC as DesiredItem | undefined,

        edges: new Map(),
      };

      graph.nodes.set(node.itemId, node);
      graph.adjacencyList.set(node.itemId, []);
    }

    graph.nodeCount = graph.nodes.size;

    // 3. Create edges (calculate matches between all node pairs)
    for (const [sourceId, sourceNode] of graph.nodes) {
      for (const [targetId, targetNode] of graph.nodes) {
        // Skip self-edges and same owner
        if (sourceId === targetId || sourceNode.ownerId === targetNode.ownerId) {
          continue;
        }

        // Calculate match score for each priority level
        const scoreA = this.calculateMatch(targetNode, sourceNode.priorityA);
        const scoreB = sourceNode.priorityB
          ? this.calculateMatch(targetNode, sourceNode.priorityB)
          : 0;
        const scoreC = sourceNode.priorityC
          ? this.calculateMatch(targetNode, sourceNode.priorityC)
          : 0;

        // Use best score (prioritize A > B > C)
        const bestScore = Math.max(scoreA, scoreB * 0.9, scoreC * 0.8);

        // Only create edge if match score meets threshold
        if (bestScore >= 30) { // Min 30% match
          sourceNode.edges.set(targetId, bestScore);
          graph.adjacencyList.get(sourceId)!.push(targetId);
          graph.edgeCount++;
        }
      }
    }

    return graph;
  }

  /**
   * Calculate match score between target item and desired criteria
   * Returns 0-100 score
   */
  private calculateMatch(
    targetItem: BarterNode,
    desired: DesiredItem
  ): number {
    let score = 0;
    let weights = 0;

    // Category matching (hierarchical)
    if (desired.subSubCategoryId) {
      // Level 3: Most specific
      if (targetItem.subSubCategoryId === desired.subSubCategoryId) {
        score += 30;
      }
      weights += 30;
    }

    if (desired.subCategoryId) {
      // Level 2: Medium specific
      if (targetItem.subCategoryId === desired.subCategoryId) {
        score += 30;
      }
      weights += 30;
    } else if (desired.categoryId) {
      // Level 1: Least specific (fallback)
      if (targetItem.categoryId === desired.categoryId) {
        score += 30;
      }
      weights += 30;
    }

    // Keyword matching
    if (desired.keywords) {
      const keywordScore = this.calculateKeywordMatch(
        targetItem.description,
        desired.keywords
      );
      score += keywordScore * 0.4; // 40% weight
      weights += 40;
    }

    // Normalize to 0-100
    return weights > 0 ? (score / weights) * 100 : 0;
  }

  /**
   * Calculate keyword match using fuzzy matching
   */
  private calculateKeywordMatch(
    itemDescription: string,
    keywords: string
  ): number {
    const itemWords = itemDescription.toLowerCase().split(/\s+/);
    const keywordList = keywords.toLowerCase().split(/\s+/);

    let matchCount = 0;
    for (const keyword of keywordList) {
      if (itemWords.some(word => word.includes(keyword) || keyword.includes(word))) {
        matchCount++;
      }
    }

    return (matchCount / keywordList.length) * 100;
  }

  private getSubCategoryId(item: any): string | undefined {
    if (item.category?.parent && !item.category.parent.parent) {
      return item.categoryId; // Item is at level 2
    }
    if (item.category?.parent?.parent) {
      return item.category.parentId; // Item is at level 3
    }
    return undefined;
  }

  private getSubSubCategoryId(item: any): string | undefined {
    if (item.category?.parent?.parent) {
      return item.categoryId; // Item is at level 3
    }
    return undefined;
  }
}
```

### Step 2.2: Chain Discovery Service

**File:** `backend/src/services/chain-discovery/chain-finder.service.ts`

```typescript
import { BarterGraph, BarterNode } from './graph-builder.service';

export interface BarterChainResult {
  participants: ChainLink[];
  totalScore: number;
  averageScore: number;
  priorityLevel: 'A' | 'B' | 'C';
  chainType: 'TWO_PARTY' | 'THREE_PARTY' | 'MULTI_PARTY';
}

export interface ChainLink {
  requestId: string;
  userId: string;
  givesItemId: string;
  receivesItemId: string;
  matchScore: number;
  position: number;
}

export class ChainFinderService {
  /**
   * Discover all possible barter chains for a given item
   */
  async discoverChains(
    graph: BarterGraph,
    startItemId: string,
    options: {
      maxDepth?: number;
      maxChains?: number;
      minScore?: number;
    } = {}
  ): Promise<BarterChainResult[]> {

    const {
      maxDepth = 5,
      maxChains = 20,
      minScore = 50,
    } = options;

    const startNode = graph.nodes.get(startItemId);
    if (!startNode) {
      throw new Error(`Item ${startItemId} not found in graph`);
    }

    const allChains: BarterChainResult[] = [];

    // Try each priority level
    const chainsA = this.findCyclesForPriority(
      graph, startNode, 'A', maxDepth, minScore
    );
    allChains.push(...chainsA.map(c => ({ ...c, priorityLevel: 'A' as const })));

    // If not enough A chains, try B
    if (allChains.length < 5 && startNode.priorityB) {
      const chainsB = this.findCyclesForPriority(
        graph, startNode, 'B', maxDepth, minScore
      );
      allChains.push(...chainsB.map(c => ({ ...c, priorityLevel: 'B' as const })));
    }

    // If still not enough, try C
    if (allChains.length < 5 && startNode.priorityC) {
      const chainsC = this.findCyclesForPriority(
        graph, startNode, 'C', maxDepth, minScore
      );
      allChains.push(...chainsC.map(c => ({ ...c, priorityLevel: 'C' as const })));
    }

    // Rank and return top chains
    return this.rankChains(allChains).slice(0, maxChains);
  }

  /**
   * Find cycles for specific priority level using DFS
   */
  private findCyclesForPriority(
    graph: BarterGraph,
    startNode: BarterNode,
    priority: 'A' | 'B' | 'C',
    maxDepth: number,
    minScore: number
  ): Omit<BarterChainResult, 'priorityLevel'>[] {

    const chains: Omit<BarterChainResult, 'priorityLevel'>[] = [];
    const visited = new Set<string>();
    const path: ChainLink[] = [];

    const dfs = (currentNode: BarterNode, depth: number) => {
      // Max depth exceeded
      if (depth > maxDepth) return;

      // Mark visited
      visited.add(currentNode.itemId);

      // Get desired items for this priority
      const desired = this.getDesiredForPriority(currentNode, priority);
      if (!desired) {
        visited.delete(currentNode.itemId);
        return;
      }

      // Check all potential targets
      for (const [targetId, matchScore] of currentNode.edges) {
        // Skip low-score matches
        if (matchScore < minScore) continue;

        const targetNode = graph.nodes.get(targetId)!;

        // Found cycle back to start!
        if (targetId === startNode.itemId && depth >= 1) {
          const chain = this.buildChain(path, currentNode, startNode, matchScore);

          if (chain.averageScore >= minScore) {
            chains.push(chain);
          }
          continue;
        }

        // Continue exploring (avoid revisiting nodes)
        if (!visited.has(targetId)) {
          path.push({
            requestId: currentNode.requestId,
            userId: currentNode.ownerId,
            givesItemId: currentNode.itemId,
            receivesItemId: targetId,
            matchScore,
            position: path.length,
          });

          dfs(targetNode, depth + 1);

          path.pop();
        }
      }

      visited.delete(currentNode.itemId);
    };

    dfs(startNode, 0);
    return chains;
  }

  /**
   * Build complete chain from path
   */
  private buildChain(
    path: ChainLink[],
    lastNode: BarterNode,
    startNode: BarterNode,
    finalScore: number
  ): Omit<BarterChainResult, 'priorityLevel'> {

    // Add final link (last → start)
    const participants: ChainLink[] = [
      ...path,
      {
        requestId: lastNode.requestId,
        userId: lastNode.ownerId,
        givesItemId: lastNode.itemId,
        receivesItemId: startNode.itemId,
        matchScore: finalScore,
        position: path.length,
      }
    ];

    const totalScore = participants.reduce((sum, p) => sum + p.matchScore, 0);
    const averageScore = totalScore / participants.length;

    const chainType =
      participants.length === 2 ? 'TWO_PARTY' :
      participants.length === 3 ? 'THREE_PARTY' :
      'MULTI_PARTY';

    return {
      participants,
      totalScore,
      averageScore,
      chainType,
    };
  }

  /**
   * Get desired criteria for priority level
   */
  private getDesiredForPriority(node: BarterNode, priority: 'A' | 'B' | 'C') {
    switch (priority) {
      case 'A': return node.priorityA;
      case 'B': return node.priorityB;
      case 'C': return node.priorityC;
    }
  }

  /**
   * Rank chains by quality
   */
  private rankChains(
    chains: BarterChainResult[]
  ): BarterChainResult[] {
    return chains.sort((a, b) => {
      // 1. Prefer shorter chains
      if (a.participants.length !== b.participants.length) {
        return a.participants.length - b.participants.length;
      }

      // 2. Prefer higher priority
      const priorityWeight = { A: 3, B: 2, C: 1 };
      if (a.priorityLevel !== b.priorityLevel) {
        return priorityWeight[b.priorityLevel] - priorityWeight[a.priorityLevel];
      }

      // 3. Prefer higher average score
      return b.averageScore - a.averageScore;
    });
  }
}
```

### Step 2.3: Chain Management Service

**File:** `backend/src/services/chain-discovery/chain-manager.service.ts`

```typescript
import { PrismaClient, ChainStatus } from '@prisma/client';
import { BarterChainResult } from './chain-finder.service';

export class ChainManagerService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create barter chain in database
   */
  async createChain(chainData: BarterChainResult): Promise<string> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48h expiry

    const chain = await this.prisma.barterChain.create({
      data: {
        chainType: chainData.chainType,
        participantCount: chainData.participants.length,
        averageScore: chainData.averageScore,
        totalScore: chainData.totalScore,
        priorityLevel: chainData.priorityLevel,
        expiresAt,

        participants: {
          create: chainData.participants.map(p => ({
            barterRequestId: p.requestId,
            givesItemId: p.givesItemId,
            receivesItemId: p.receivesItemId,
            position: p.position,
            matchScore: p.matchScore,
          }))
        }
      },
      include: {
        participants: {
          include: {
            barterRequest: { include: { user: true } },
            givesItem: true,
            receivesItem: true,
          }
        }
      }
    });

    // Update barter requests status
    await this.prisma.barterRequest.updateMany({
      where: {
        id: { in: chainData.participants.map(p => p.requestId) }
      },
      data: { status: 'IN_CHAIN' }
    });

    // Send notifications to all participants
    await this.notifyParticipants(chain.id);

    return chain.id;
  }

  /**
   * Approve participation in chain
   */
  async approveParticipation(
    chainId: string,
    participantId: string
  ): Promise<void> {

    await this.prisma.chainParticipant.update({
      where: { id: participantId },
      data: {
        approvalStatus: 'APPROVED',
        approvedAt: new Date(),
      }
    });

    // Check if all participants approved
    const chain = await this.prisma.barterChain.findUnique({
      where: { id: chainId },
      include: { participants: true }
    });

    if (!chain) return;

    const allApproved = chain.participants.every(
      p => p.approvalStatus === 'APPROVED'
    );

    if (allApproved) {
      await this.finalizeChain(chainId);
    }
  }

  /**
   * Reject participation in chain
   */
  async rejectParticipation(
    chainId: string,
    participantId: string,
    reason: string
  ): Promise<void> {

    await this.prisma.chainParticipant.update({
      where: { id: participantId },
      data: {
        approvalStatus: 'REJECTED',
        rejectedReason: reason,
      }
    });

    // Mark entire chain as rejected
    await this.prisma.barterChain.update({
      where: { id: chainId },
      data: { status: 'REJECTED' }
    });

    // Reset barter request statuses
    const chain = await this.prisma.barterChain.findUnique({
      where: { id: chainId },
      include: { participants: true }
    });

    if (chain) {
      await this.prisma.barterRequest.updateMany({
        where: {
          id: { in: chain.participants.map(p => p.barterRequestId) }
        },
        data: { status: 'ACTIVE' }
      });
    }

    // Notify participants of rejection
    await this.notifyRejection(chainId, reason);
  }

  /**
   * Finalize chain when all approved
   */
  private async finalizeChain(chainId: string): Promise<void> {
    await this.prisma.barterChain.update({
      where: { id: chainId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      }
    });

    // Create transactions for each exchange
    const chain = await this.prisma.barterChain.findUnique({
      where: { id: chainId },
      include: {
        participants: {
          include: {
            barterRequest: { include: { user: true } }
          }
        }
      }
    });

    if (!chain) return;

    for (const participant of chain.participants) {
      const nextParticipant = chain.participants.find(
        p => p.givesItemId === participant.receivesItemId
      );

      if (nextParticipant) {
        await this.prisma.transaction.create({
          data: {
            chainId,
            fromUserId: participant.barterRequest.userId,
            toUserId: nextParticipant.barterRequest.userId,
            itemId: participant.givesItemId,
            status: 'PENDING',
          }
        });
      }
    }

    // Notify participants chain is approved
    await this.notifyChainApproved(chainId);
  }

  /**
   * Auto-expire chains after 48h
   */
  async expireStaleChains(): Promise<number> {
    const result = await this.prisma.barterChain.updateMany({
      where: {
        status: 'PENDING',
        expiresAt: { lt: new Date() }
      },
      data: { status: 'EXPIRED' }
    });

    // Reset barter request statuses
    const expiredChains = await this.prisma.barterChain.findMany({
      where: {
        status: 'EXPIRED',
        expiresAt: { lt: new Date() }
      },
      include: { participants: true }
    });

    for (const chain of expiredChains) {
      await this.prisma.barterRequest.updateMany({
        where: {
          id: { in: chain.participants.map(p => p.barterRequestId) }
        },
        data: { status: 'ACTIVE' }
      });
    }

    return result.count;
  }

  // Notification stubs (implement with actual notification service)
  private async notifyParticipants(chainId: string) {
    // TODO: Send email/push notifications
    console.log(`Notifying participants of chain ${chainId}`);
  }

  private async notifyRejection(chainId: string, reason: string) {
    console.log(`Chain ${chainId} rejected: ${reason}`);
  }

  private async notifyChainApproved(chainId: string) {
    console.log(`Chain ${chainId} fully approved!`);
  }
}
```

---

## Phase 3: API Endpoints (Week 5)

### Step 3.1: Chain Discovery Controller

**File:** `backend/src/controllers/chain-discovery.controller.ts`

```typescript
import { Request, Response } from 'express';
import { GraphBuilderService } from '../services/chain-discovery/graph-builder.service';
import { ChainFinderService } from '../services/chain-discovery/chain-finder.service';
import { ChainManagerService } from '../services/chain-discovery/chain-manager.service';
import { prisma } from '../lib/prisma';

const graphBuilder = new GraphBuilderService(prisma);
const chainFinder = new ChainFinderService();
const chainManager = new ChainManagerService(prisma);

/**
 * POST /api/chains/discover
 * Discover barter chains for an item
 */
export async function discoverChains(req: Request, res: Response) {
  try {
    const { itemId, maxDepth = 5, minScore = 50 } = req.body;

    // Build graph
    const graph = await graphBuilder.buildGraph();

    // Discover chains
    const chains = await chainFinder.discoverChains(graph, itemId, {
      maxDepth,
      minScore,
    });

    return res.json({
      success: true,
      data: {
        chains,
        graphStats: {
          nodes: graph.nodeCount,
          edges: graph.edgeCount,
          builtAt: graph.builtAt,
        }
      }
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/chains/create
 * Create a new chain from discovery result
 */
export async function createChain(req: Request, res: Response) {
  try {
    const chainData = req.body;

    const chainId = await chainManager.createChain(chainData);

    return res.json({
      success: true,
      data: { chainId }
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/chains/:id
 * Get chain details
 */
export async function getChain(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const chain = await prisma.barterChain.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            barterRequest: {
              include: { user: true, item: true }
            },
            givesItem: {
              include: { category: true, images: true }
            },
            receivesItem: {
              include: { category: true, images: true }
            }
          }
        },
        transactions: true,
      }
    });

    if (!chain) {
      return res.status(404).json({
        success: false,
        error: 'Chain not found',
      });
    }

    return res.json({
      success: true,
      data: chain,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/chains/:id/approve
 * Approve participation in chain
 */
export async function approveChain(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { participantId } = req.body;

    await chainManager.approveParticipation(id, participantId);

    return res.json({
      success: true,
      message: 'Participation approved',
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/chains/:id/reject
 * Reject participation in chain
 */
export async function rejectChain(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { participantId, reason } = req.body;

    await chainManager.rejectParticipation(id, participantId, reason);

    return res.json({
      success: true,
      message: 'Participation rejected',
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
```

**Register routes in:** `backend/src/routes/chains.routes.ts`

```typescript
import express from 'express';
import * as chainController from '../controllers/chain-discovery.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/discover', authenticateUser, chainController.discoverChains);
router.post('/create', authenticateUser, chainController.createChain);
router.get('/:id', authenticateUser, chainController.getChain);
router.post('/:id/approve', authenticateUser, chainController.approveChain);
router.post('/:id/reject', authenticateUser, chainController.rejectChain);

export default router;
```

---

## Phase 4: Frontend UI (Week 6-7)

### Step 4.1: Barter Request Form with A/B/C Priorities

**File:** `frontend/app/barter/request/new/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { CategoryCascade } from '@/components/CategoryCascade';

interface PriorityForm {
  categoryId: string;
  subCategoryId: string;
  subSubCategoryId: string;
  keywords: string;
  cashAmount?: number;
}

export default function NewBarterRequestPage() {
  const [formData, setFormData] = useState({
    itemId: '',
    priorityA: {
      categoryId: '',
      subCategoryId: '',
      subSubCategoryId: '',
      keywords: '',
    },
    priorityB: {
      categoryId: '',
      subCategoryId: '',
      subSubCategoryId: '',
      keywords: '',
    },
    priorityC: {
      categoryId: '',
      subCategoryId: '',
      subSubCategoryId: '',
      keywords: '',
      cashAmount: undefined,
    }
  });

  const [showPriorityB, setShowPriorityB] = useState(false);
  const [showPriorityC, setShowPriorityC] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      itemId: formData.itemId,
      priorityA: formData.priorityA,
      priorityB: showPriorityB ? formData.priorityB : undefined,
      priorityC: showPriorityC ? formData.priorityC : undefined,
    };

    const response = await fetch('/api/barter-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      // Redirect to chain discovery
      window.location.href = '/barter/opportunities';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create Barter Request</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Item Selection */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">I'm Offering:</h2>
          <select
            value={formData.itemId}
            onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
            required
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">Select an item...</option>
            {/* TODO: Load user's items */}
          </select>
        </section>

        {/* Priority A */}
        <section className="bg-green-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">
            Priority A - I Most Want:
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Your top preference. We'll search for these items first.
          </p>

          <CategoryCascade
            value={formData.priorityA}
            onChange={(value) => setFormData({
              ...formData,
              priorityA: { ...formData.priorityA, ...value }
            })}
          />

          <input
            type="text"
            placeholder="Keywords (e.g., 'Samsung 24 feet')"
            value={formData.priorityA.keywords}
            onChange={(e) => setFormData({
              ...formData,
              priorityA: { ...formData.priorityA, keywords: e.target.value }
            })}
            className="w-full px-4 py-2 border rounded mt-4"
          />
        </section>

        {/* Priority B (Optional) */}
        {!showPriorityB && (
          <button
            type="button"
            onClick={() => setShowPriorityB(true)}
            className="text-blue-600 hover:underline"
          >
            + Add backup option (Priority B)
          </button>
        )}

        {showPriorityB && (
          <section className="bg-yellow-50 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">
              Priority B - Or I'd Accept:
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              If Priority A isn't available, we'll look for these items.
            </p>

            <CategoryCascade
              value={formData.priorityB}
              onChange={(value) => setFormData({
                ...formData,
                priorityB: { ...formData.priorityB, ...value }
              })}
            />

            <input
              type="text"
              placeholder="Keywords"
              value={formData.priorityB.keywords}
              onChange={(e) => setFormData({
                ...formData,
                priorityB: { ...formData.priorityB, keywords: e.target.value }
              })}
              className="w-full px-4 py-2 border rounded mt-4"
            />
          </section>
        )}

        {/* Priority C (Optional) */}
        {!showPriorityC && showPriorityB && (
          <button
            type="button"
            onClick={() => setShowPriorityC(true)}
            className="text-blue-600 hover:underline"
          >
            + Add last resort option (Priority C)
          </button>
        )}

        {showPriorityC && (
          <section className="bg-red-50 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">
              Priority C - Last Resort:
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              If nothing else is available, we'll consider these options.
            </p>

            <CategoryCascade
              value={formData.priorityC}
              onChange={(value) => setFormData({
                ...formData,
                priorityC: { ...formData.priorityC, ...value }
              })}
            />

            <input
              type="text"
              placeholder="Keywords or 'Cash'"
              value={formData.priorityC.keywords}
              onChange={(e) => setFormData({
                ...formData,
                priorityC: { ...formData.priorityC, keywords: e.target.value }
              })}
              className="w-full px-4 py-2 border rounded mt-4"
            />

            <input
              type="number"
              placeholder="Cash amount (optional)"
              value={formData.priorityC.cashAmount || ''}
              onChange={(e) => setFormData({
                ...formData,
                priorityC: {
                  ...formData.priorityC,
                  cashAmount: e.target.value ? Number(e.target.value) : undefined
                }
              })}
              className="w-full px-4 py-2 border rounded mt-4"
            />
          </section>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Find Barter Opportunities →
        </button>
      </form>
    </div>
  );
}
```

---

## Next Steps

1. **Review Architecture**: Get stakeholder approval on ARCHITECTURE.md
2. **Start Phase 1**: Begin with database schema implementation
3. **Build Prototype**: Create minimal viable chain discovery
4. **Test with Real Data**: Use actual items from production
5. **Iterate**: Refine algorithm based on user feedback

---

## Success Criteria

- ✅ Multi-party chains (3+ participants) discovered successfully
- ✅ Chain discovery completes in <5 seconds
- ✅ Priority A achieves 70%+ match rate
- ✅ Chain approval workflow functional
- ✅ 90%+ chain completion rate (once approved)
