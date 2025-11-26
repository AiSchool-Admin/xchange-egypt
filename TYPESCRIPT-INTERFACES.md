# TypeScript Interfaces for Multi-Party Bartering System

## Overview

This document contains all TypeScript interfaces, types, and enums needed for the multi-party bartering system implementation.

---

## Core Domain Types

### Barter Request

```typescript
/**
 * Priority-based barter request with A/B/C fallback logic
 */
export interface BarterRequest {
  id: string;
  itemId: string;
  userId: string;

  // Priority levels
  priorityA: DesiredItem;
  priorityB?: DesiredItem;
  priorityC?: DesiredItem;

  status: BarterRequestStatus;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  item?: Item;
  user?: User;
  participants?: ChainParticipant[];
}

export enum BarterRequestStatus {
  ACTIVE = 'ACTIVE',
  IN_CHAIN = 'IN_CHAIN',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Desired item criteria for matching
 */
export interface DesiredItem {
  // 3-level category hierarchy
  categoryId?: string;
  subCategoryId?: string;
  subSubCategoryId?: string;

  // Text matching
  keywords: string;

  // Special case: cash fallback
  cashAmount?: number;
}
```

### Barter Chain

```typescript
/**
 * Discovered barter chain with N participants
 */
export interface BarterChain {
  id: string;
  chainType: ChainType;
  participantCount: number;

  // Quality metrics
  averageScore: number;
  totalScore: number;
  priorityLevel: 'A' | 'B' | 'C';

  // Lifecycle
  status: ChainStatus;
  discoveredAt: Date;
  approvedAt?: Date;
  completedAt?: Date;
  expiresAt: Date;

  // Relations
  participants?: ChainParticipant[];
  transactions?: Transaction[];
}

export enum ChainType {
  TWO_PARTY = 'TWO_PARTY',       // A ↔ B
  THREE_PARTY = 'THREE_PARTY',   // A → B → C → A
  MULTI_PARTY = 'MULTI_PARTY',   // A → B → ... → N → A
}

export enum ChainStatus {
  PENDING = 'PENDING',           // Awaiting approvals
  APPROVED = 'APPROVED',         // All approved
  IN_PROGRESS = 'IN_PROGRESS',   // Exchange happening
  COMPLETED = 'COMPLETED',       // Successfully completed
  REJECTED = 'REJECTED',         // Someone rejected
  EXPIRED = 'EXPIRED',           // Approval timeout
  CANCELLED = 'CANCELLED',       // Manually cancelled
}
```

### Chain Participant

```typescript
/**
 * Individual participant in a barter chain
 */
export interface ChainParticipant {
  id: string;
  chainId: string;
  barterRequestId: string;

  // Exchange details
  givesItemId: string;
  receivesItemId: string;

  // Position in chain (0-indexed)
  position: number;

  // Approval workflow
  approvalStatus: ApprovalStatus;
  approvedAt?: Date;
  rejectedReason?: string;

  // Match quality
  matchScore: number;

  // Relations
  chain?: BarterChain;
  barterRequest?: BarterRequest;
  givesItem?: Item;
  receivesItem?: Item;
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
```

### Transaction

```typescript
/**
 * Individual item exchange within a chain
 */
export interface Transaction {
  id: string;
  chainId: string;

  fromUserId: string;
  toUserId: string;
  itemId: string;

  // Delivery tracking
  status: TransactionStatus;
  exchangedAt?: Date;
  confirmedAt?: Date;

  // Optional escrow
  escrowId?: string;

  // Relations
  chain?: BarterChain;
  fromUser?: User;
  toUser?: User;
  item?: Item;
  escrow?: Escrow;
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CONFIRMED = 'CONFIRMED',
  DISPUTED = 'DISPUTED',
  RESOLVED = 'RESOLVED',
}
```

### Escrow

```typescript
/**
 * Optional escrow for high-value items
 */
export interface Escrow {
  id: string;
  description: string;
  value: number;

  status: EscrowStatus;
  heldAt: Date;
  releasedAt?: Date;

  transactions?: Transaction[];
}

export enum EscrowStatus {
  HELD = 'HELD',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
}
```

---

## Graph Algorithm Types

### Graph Nodes and Edges

```typescript
/**
 * Node in barter graph representing an item available for trade
 */
export interface BarterNode {
  itemId: string;
  ownerId: string;
  requestId: string;

  // Item classification
  categoryId: string;
  subCategoryId?: string;
  subSubCategoryId?: string;
  description: string;

  // What owner wants (3 priority levels)
  priorityA: DesiredItem;
  priorityB?: DesiredItem;
  priorityC?: DesiredItem;

  // Outgoing edges with match scores
  edges: Map<string, number>; // targetItemId → score (0-100)
}

/**
 * Complete barter graph
 */
export interface BarterGraph {
  nodes: Map<string, BarterNode>;
  adjacencyList: Map<string, string[]>; // itemId → [targetItemIds]

  // Metadata
  nodeCount: number;
  edgeCount: number;
  builtAt: Date;
}
```

### Chain Discovery Results

```typescript
/**
 * Discovered chain result from algorithm
 */
export interface BarterChainResult {
  participants: ChainLink[];
  totalScore: number;
  averageScore: number;
  priorityLevel: 'A' | 'B' | 'C';
  chainType: ChainType;
}

/**
 * Single link in a chain
 */
export interface ChainLink {
  requestId: string;
  userId: string;
  givesItemId: string;
  receivesItemId: string;
  matchScore: number;
  position: number;
}

/**
 * Options for chain discovery
 */
export interface ChainDiscoveryOptions {
  maxDepth?: number;      // Max chain length (default: 5)
  maxChains?: number;     // Max results to return (default: 20)
  minScore?: number;      // Min average score (default: 50)
  timeout?: number;       // Max search time in ms (default: 30000)
}
```

---

## API Request/Response Types

### Barter Request API

```typescript
/**
 * POST /api/barter-requests
 */
export interface CreateBarterRequestDTO {
  itemId: string;
  priorityA: DesiredItem;
  priorityB?: DesiredItem;
  priorityC?: DesiredItem;
}

export interface CreateBarterRequestResponse {
  success: boolean;
  data?: {
    requestId: string;
    barterRequest: BarterRequest;
  };
  error?: string;
}

/**
 * PATCH /api/barter-requests/:id
 */
export interface UpdateBarterRequestDTO {
  priorityA?: DesiredItem;
  priorityB?: DesiredItem;
  priorityC?: DesiredItem;
  status?: BarterRequestStatus;
}
```

### Chain Discovery API

```typescript
/**
 * POST /api/chains/discover
 */
export interface DiscoverChainsDTO {
  itemId: string;
  maxDepth?: number;
  minScore?: number;
}

export interface DiscoverChainsResponse {
  success: boolean;
  data?: {
    chains: BarterChainResult[];
    graphStats: {
      nodes: number;
      edges: number;
      builtAt: Date;
    };
  };
  error?: string;
}

/**
 * POST /api/chains/create
 */
export interface CreateChainDTO {
  chainData: BarterChainResult;
}

export interface CreateChainResponse {
  success: boolean;
  data?: {
    chainId: string;
  };
  error?: string;
}

/**
 * GET /api/chains/:id
 */
export interface GetChainResponse {
  success: boolean;
  data?: BarterChain;
  error?: string;
}
```

### Chain Approval API

```typescript
/**
 * POST /api/chains/:id/approve
 */
export interface ApproveChainDTO {
  participantId: string;
}

export interface ApproveChainResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * POST /api/chains/:id/reject
 */
export interface RejectChainDTO {
  participantId: string;
  reason: string;
}

export interface RejectChainResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * GET /api/chains/:id/status
 */
export interface ChainStatusResponse {
  success: boolean;
  data?: {
    chainId: string;
    status: ChainStatus;
    expiresAt: Date;
    participants: Array<{
      userId: string;
      userName: string;
      approvalStatus: ApprovalStatus;
      approvedAt?: Date;
    }>;
  };
  error?: string;
}
```

### Transaction API

```typescript
/**
 * POST /api/transactions/:id/mark-delivered
 */
export interface MarkDeliveredDTO {
  trackingNumber?: string;
  deliveryNotes?: string;
}

/**
 * POST /api/transactions/:id/confirm-receipt
 */
export interface ConfirmReceiptDTO {
  rating?: number; // 1-5 stars
  feedback?: string;
}

/**
 * POST /api/transactions/:id/dispute
 */
export interface DisputeTransactionDTO {
  reason: string;
  description: string;
  evidence?: string[]; // URLs to images/docs
}
```

---

## Frontend Component Props

### Barter Request Form

```typescript
export interface BarterRequestFormProps {
  initialData?: Partial<BarterRequest>;
  userItems: Item[];
  onSubmit: (data: CreateBarterRequestDTO) => Promise<void>;
  onCancel: () => void;
}

export interface PriorityFormData {
  categoryId: string;
  subCategoryId: string;
  subSubCategoryId: string;
  keywords: string;
  cashAmount?: number;
}
```

### Chain Visualization

```typescript
export interface ChainVisualizationProps {
  chain: BarterChain;
  currentUserId: string;
  onApprove?: (participantId: string) => void;
  onReject?: (participantId: string, reason: string) => void;
}

export interface ChainLinkCardProps {
  participant: ChainParticipant;
  isCurrentUser: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}

export interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}
```

### Category Cascade

```typescript
export interface CategoryCascadeProps {
  value: {
    categoryId: string;
    subCategoryId: string;
    subSubCategoryId: string;
  };
  onChange: (value: {
    categoryId: string;
    subCategoryId: string;
    subSubCategoryId: string;
  }) => void;
  required?: boolean;
  disabled?: boolean;
}
```

---

## Service Interfaces

### Graph Builder Service

```typescript
export interface IGraphBuilderService {
  /**
   * Build complete barter graph from active requests
   */
  buildGraph(): Promise<BarterGraph>;

  /**
   * Calculate match score between item and desired criteria
   */
  calculateMatch(item: BarterNode, desired: DesiredItem): number;
}
```

### Chain Finder Service

```typescript
export interface IChainFinderService {
  /**
   * Discover all possible chains for an item
   */
  discoverChains(
    graph: BarterGraph,
    startItemId: string,
    options?: ChainDiscoveryOptions
  ): Promise<BarterChainResult[]>;

  /**
   * Find cycles at specific priority level
   */
  findCyclesForPriority(
    graph: BarterGraph,
    startNode: BarterNode,
    priority: 'A' | 'B' | 'C',
    maxDepth: number,
    minScore: number
  ): Promise<Omit<BarterChainResult, 'priorityLevel'>[]>;

  /**
   * Rank chains by quality
   */
  rankChains(chains: BarterChainResult[]): BarterChainResult[];
}
```

### Chain Manager Service

```typescript
export interface IChainManagerService {
  /**
   * Create chain in database
   */
  createChain(chainData: BarterChainResult): Promise<string>;

  /**
   * Approve participation
   */
  approveParticipation(chainId: string, participantId: string): Promise<void>;

  /**
   * Reject participation
   */
  rejectParticipation(
    chainId: string,
    participantId: string,
    reason: string
  ): Promise<void>;

  /**
   * Auto-expire stale chains
   */
  expireStaleChains(): Promise<number>;

  /**
   * Get chains for user
   */
  getUserChains(userId: string, status?: ChainStatus): Promise<BarterChain[]>;
}
```

### Notification Service

```typescript
export interface INotificationService {
  /**
   * Notify participants of new chain
   */
  notifyChainCreated(chainId: string): Promise<void>;

  /**
   * Notify participant approved
   */
  notifyParticipantApproved(chainId: string, participantId: string): Promise<void>;

  /**
   * Notify chain fully approved
   */
  notifyChainApproved(chainId: string): Promise<void>;

  /**
   * Notify chain rejected
   */
  notifyChainRejected(chainId: string, reason: string): Promise<void>;

  /**
   * Notify chain expiring soon
   */
  notifyChainExpiringSoon(chainId: string, hoursRemaining: number): Promise<void>;

  /**
   * Notify transaction status change
   */
  notifyTransactionUpdate(transactionId: string, status: TransactionStatus): Promise<void>;
}
```

---

## Utility Types

### API Response Wrapper

```typescript
export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  code?: string;
};
```

### Pagination

```typescript
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### Filter Options

```typescript
export interface ChainFilterOptions {
  status?: ChainStatus[];
  priorityLevel?: ('A' | 'B' | 'C')[];
  minScore?: number;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface TransactionFilterOptions {
  status?: TransactionStatus[];
  userId?: string;
  chainId?: string;
}
```

---

## Constants

```typescript
/**
 * Chain discovery constraints
 */
export const CHAIN_DISCOVERY_DEFAULTS = {
  MAX_DEPTH: 5,
  MAX_CHAINS: 20,
  MIN_SCORE: 50,
  TIMEOUT_MS: 30000,
  EXPIRY_HOURS: 48,
} as const;

/**
 * Match score weights
 */
export const MATCH_WEIGHTS = {
  DESCRIPTION: 0.4,
  SUB_CATEGORY: 0.3,
  SUB_SUB_CATEGORY: 0.3,
} as const;

/**
 * Priority score multipliers
 */
export const PRIORITY_MULTIPLIERS = {
  A: 1.0,
  B: 0.9,
  C: 0.8,
} as const;

/**
 * Notification timing
 */
export const NOTIFICATION_TIMING = {
  EXPIRY_REMINDER_HOURS: [24, 12, 2],
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 5000,
} as const;
```

---

## Type Guards

```typescript
/**
 * Check if chain is still active
 */
export function isChainActive(chain: BarterChain): boolean {
  return chain.status === ChainStatus.PENDING ||
         chain.status === ChainStatus.APPROVED ||
         chain.status === ChainStatus.IN_PROGRESS;
}

/**
 * Check if participant can still approve/reject
 */
export function canParticipantRespond(participant: ChainParticipant): boolean {
  return participant.approvalStatus === ApprovalStatus.PENDING;
}

/**
 * Check if chain has expired
 */
export function isChainExpired(chain: BarterChain): boolean {
  return chain.status === ChainStatus.PENDING &&
         new Date() > new Date(chain.expiresAt);
}

/**
 * Check if transaction needs action
 */
export function needsUserAction(
  transaction: Transaction,
  userId: string
): boolean {
  if (transaction.fromUserId === userId) {
    return transaction.status === TransactionStatus.PENDING ||
           transaction.status === TransactionStatus.IN_TRANSIT;
  }
  if (transaction.toUserId === userId) {
    return transaction.status === TransactionStatus.DELIVERED;
  }
  return false;
}
```

---

## Usage Examples

### Creating a Barter Request

```typescript
const request: CreateBarterRequestDTO = {
  itemId: 'item-123',
  priorityA: {
    categoryId: 'home-appliances',
    subCategoryId: 'refrigerators',
    subSubCategoryId: '24-feet',
    keywords: 'Samsung LG',
  },
  priorityB: {
    categoryId: 'home-appliances',
    subCategoryId: 'refrigerators',
    subSubCategoryId: '20-feet',
    keywords: 'any brand',
  },
  priorityC: {
    keywords: 'cash',
    cashAmount: 800,
  },
};

const response = await fetch('/api/barter-requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(request),
});
```

### Discovering Chains

```typescript
const discovery: DiscoverChainsDTO = {
  itemId: 'item-123',
  maxDepth: 5,
  minScore: 60,
};

const response = await fetch('/api/chains/discover', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(discovery),
});

const { data } = await response.json();
console.log(`Found ${data.chains.length} chains`);
```

### Approving a Chain

```typescript
const approval: ApproveChainDTO = {
  participantId: 'participant-456',
};

await fetch(`/api/chains/${chainId}/approve`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(approval),
});
```

---

This TypeScript interfaces document provides complete type safety for the multi-party bartering system implementation.
