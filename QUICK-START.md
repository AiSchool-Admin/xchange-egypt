# Quick Start: Multi-Party Bartering System

## 🚀 Get Started in 5 Minutes

This guide helps you start implementing the multi-party bartering system **right now**.

---

## Prerequisites

- ✅ 3-level category hierarchy already implemented
- ✅ Supabase database access
- ✅ Railway backend deployed
- ✅ Prisma ORM set up

---

## Phase 1: Database Setup (Start Here!)

### Step 1: Review the Migration

The complete SQL migration is in `IMPLEMENTATION-PLAN.md` starting at "Step 1.1".

**What it creates:**
- `barter_requests` - Store user's A/B/C priority preferences
- `barter_chains` - Discovered chain opportunities
- `chain_participants` - Individual participants in chains
- `transactions` - Track item exchanges
- `escrows` - Optional escrow for high-value items

### Step 2: Run the Migration in Supabase

1. **Go to Supabase SQL Editor:**
   - Open your Supabase dashboard
   - Click "SQL Editor" in sidebar
   - Click "New query"

2. **Copy the migration SQL:**
   ```bash
   # View the migration SQL from IMPLEMENTATION-PLAN.md
   # Starting at "Step 1.1: Create New Database Tables"
   ```

3. **Paste and execute:**
   - Copy the entire SQL (from `CREATE EXTENSION` to end)
   - Paste into Supabase editor
   - Click "Run" (Ctrl+Enter)

4. **Verify success:**
   ```sql
   -- Check tables were created
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN (
     'barter_requests',
     'barter_chains',
     'chain_participants',
     'transactions',
     'escrows'
   );

   -- Should return 5 rows
   ```

### Step 3: Update Prisma Schema

1. **Open:** `backend/prisma/schema.prisma`

2. **Add new models:**
   - Copy models from `IMPLEMENTATION-PLAN.md` Step 1.2
   - Models to add:
     - `BarterRequest`
     - `BarterChain`
     - `ChainParticipant`
     - `Transaction`
     - `Escrow`
   - All enums (BarterRequestStatus, ChainType, etc.)

3. **Update existing models:**
   ```prisma
   model User {
     // ... existing fields

     // Add these relations:
     barterRequests    BarterRequest[]
     transactionsFrom  Transaction[]   @relation("TransactionFrom")
     transactionsTo    Transaction[]   @relation("TransactionTo")
   }

   model Item {
     // ... existing fields

     // Add these relations:
     barterRequests      BarterRequest[]
     givesInChains       ChainParticipant[] @relation("GivesItem")
     receivesInChains    ChainParticipant[] @relation("ReceivesItem")
     transactions        Transaction[]
   }
   ```

4. **Generate Prisma Client:**
   ```bash
   cd backend
   npx prisma generate
   ```

5. **Verify schema:**
   ```bash
   npx prisma validate
   ```

### Step 4: Commit Changes

```bash
git add backend/prisma/schema.prisma
git commit -m "feat: Add multi-party barter database schema

- Add BarterRequest model with A/B/C priorities
- Add BarterChain and ChainParticipant models
- Add Transaction and Escrow models
- Update User and Item relations"

git push
```

---

## Phase 2: Build the Graph Service (Week 1-2)

### Step 1: Create Graph Builder

1. **Create directory:**
   ```bash
   mkdir -p backend/src/services/chain-discovery
   ```

2. **Create file:** `backend/src/services/chain-discovery/graph-builder.service.ts`

3. **Copy implementation from:** `IMPLEMENTATION-PLAN.md` Step 2.1

4. **Key methods:**
   - `buildGraph()` - Constructs the barter graph
   - `calculateMatch()` - Scores item matches
   - `calculateKeywordMatch()` - Fuzzy text matching

### Step 2: Create Chain Finder

1. **Create file:** `backend/src/services/chain-discovery/chain-finder.service.ts`

2. **Copy implementation from:** `IMPLEMENTATION-PLAN.md` Step 2.2

3. **Key methods:**
   - `discoverChains()` - Main entry point
   - `findCyclesForPriority()` - DFS cycle detection
   - `rankChains()` - Quality sorting

### Step 3: Create Chain Manager

1. **Create file:** `backend/src/services/chain-discovery/chain-manager.service.ts`

2. **Copy implementation from:** `IMPLEMENTATION-PLAN.md` Step 2.3

3. **Key methods:**
   - `createChain()` - Save chain to DB
   - `approveParticipation()` - Handle approvals
   - `rejectParticipation()` - Handle rejections
   - `expireStaleChains()` - Cleanup job

### Step 4: Test the Services

Create a test script to verify graph building:

```typescript
// backend/src/scripts/test-graph.ts
import { PrismaClient } from '@prisma/client';
import { GraphBuilderService } from '../services/chain-discovery/graph-builder.service';
import { ChainFinderService } from '../services/chain-discovery/chain-finder.service';

const prisma = new PrismaClient();
const graphBuilder = new GraphBuilderService(prisma);
const chainFinder = new ChainFinderService();

async function testGraph() {
  console.log('Building graph...');
  const graph = await graphBuilder.buildGraph();

  console.log(`Graph stats:
    - Nodes: ${graph.nodeCount}
    - Edges: ${graph.edgeCount}
    - Built at: ${graph.builtAt}
  `);

  // Test chain discovery for first node
  if (graph.nodeCount > 0) {
    const firstNode = graph.nodes.values().next().value;
    console.log(`\nDiscovering chains for item: ${firstNode.itemId}`);

    const chains = await chainFinder.discoverChains(graph, firstNode.itemId, {
      maxDepth: 5,
      minScore: 50,
    });

    console.log(`Found ${chains.length} chains:`);
    chains.forEach((chain, idx) => {
      console.log(`  ${idx + 1}. ${chain.chainType} - ${chain.participants.length} participants - ${chain.averageScore.toFixed(1)}% avg score`);
    });
  }
}

testGraph()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run it:
```bash
npx ts-node src/scripts/test-graph.ts
```

---

## Phase 3: Build the API (Week 2)

### Step 1: Create Controllers

1. **Create file:** `backend/src/controllers/chain-discovery.controller.ts`

2. **Copy implementation from:** `IMPLEMENTATION-PLAN.md` Step 3.1

3. **Endpoints:**
   - `POST /api/chains/discover` - Find chains
   - `POST /api/chains/create` - Create chain
   - `GET /api/chains/:id` - Get chain details
   - `POST /api/chains/:id/approve` - Approve participation
   - `POST /api/chains/:id/reject` - Reject participation

### Step 2: Register Routes

1. **Create file:** `backend/src/routes/chains.routes.ts`

2. **Add routes:**
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

3. **Register in main app:**
   ```typescript
   // backend/src/index.ts or app.ts
   import chainRoutes from './routes/chains.routes';

   app.use('/api/chains', chainRoutes);
   ```

### Step 3: Test the API

Use curl or Postman:

```bash
# Discover chains
curl -X POST http://localhost:3000/api/chains/discover \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"itemId": "item-123", "maxDepth": 5, "minScore": 50}'

# Create chain
curl -X POST http://localhost:3000/api/chains/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @chain-data.json

# Get chain
curl http://localhost:3000/api/chains/chain-456 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Approve
curl -X POST http://localhost:3000/api/chains/chain-456/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"participantId": "participant-789"}'
```

---

## Phase 4: Build the Frontend (Week 3)

### Step 1: Create Barter Request Form

1. **Create file:** `frontend/app/barter/request/new/page.tsx`

2. **Copy implementation from:** `IMPLEMENTATION-PLAN.md` Step 4.1

3. **Key features:**
   - Priority A/B/C sections
   - Category cascade for each priority
   - Keywords input
   - Optional cash amount for Priority C

### Step 2: Create Chain Visualization

1. **Create file:** `frontend/components/ChainVisualization.tsx`

2. **Display:**
   - Chain participants in circular layout
   - Item exchanges (A gives X, receives Y)
   - Match scores
   - Approval status badges
   - Approve/Reject buttons

3. **Example structure:**
   ```tsx
   export function ChainVisualization({ chain, currentUserId }) {
     return (
       <div className="chain-container">
         {chain.participants.map((participant, idx) => (
           <div key={participant.id} className="participant-card">
             <UserAvatar user={participant.user} />

             <div className="exchange">
               <ItemCard item={participant.givesItem} label="Gives" />
               <ArrowRight />
               <ItemCard item={participant.receivesItem} label="Receives" />
             </div>

             <MatchScore score={participant.matchScore} />
             <ApprovalBadge status={participant.approvalStatus} />

             {participant.userId === currentUserId && (
               <ApprovalButtons
                 onApprove={() => handleApprove(participant.id)}
                 onReject={() => handleReject(participant.id)}
               />
             )}
           </div>
         ))}

         <ChainSummary
           participantCount={chain.participantCount}
           averageScore={chain.averageScore}
           expiresAt={chain.expiresAt}
         />
       </div>
     );
   }
   ```

### Step 3: Create Chain Discovery Page

1. **Create file:** `frontend/app/barter/opportunities/page.tsx`

2. **Features:**
   - Show discovered chains for user's barter requests
   - Filter by status (PENDING, APPROVED, etc.)
   - Sort by score, participant count
   - Click to view chain details

---

## Testing Checklist

Before deploying to production:

### Database Tests
- [ ] All tables created successfully
- [ ] Foreign keys working correctly
- [ ] Indexes created for performance
- [ ] Enums match TypeScript types

### Backend Tests
- [ ] Graph builds without errors
- [ ] Chain discovery finds valid cycles
- [ ] Chains ranked correctly (shorter = better)
- [ ] Priority A preferred over B/C
- [ ] Approval workflow functional
- [ ] Auto-expiration works (48h)

### API Tests
- [ ] All endpoints return correct responses
- [ ] Authentication working
- [ ] Error handling for invalid requests
- [ ] Concurrent chain conflicts handled

### Frontend Tests
- [ ] Form validation working
- [ ] Category cascades functional
- [ ] Chain visualization renders correctly
- [ ] Approval/rejection updates UI
- [ ] Expiration countdown displays

---

## Deployment Checklist

### Backend (Railway)
```bash
# Push changes
git push origin claude/xchange-egypt-sprint-01XWqYvky93aH6br1eUagLXF

# Railway auto-deploys
# Monitor deployment: railway logs

# Run database migration
railway run npx prisma migrate deploy
```

### Frontend (Vercel)
```bash
# Push changes
git push origin claude/xchange-egypt-sprint-01XWqYvky93aH6br1eUagLXF

# Vercel auto-deploys
# Monitor: vercel logs
```

### Database (Supabase)
- Run migration SQL in Supabase editor (already done in Step 2)
- Verify indexes created: `\di` in SQL editor
- Check table sizes: `SELECT pg_size_pretty(pg_total_relation_size('barter_chains'));`

---

## Background Jobs (Optional for Phase 1)

Set up cron job for chain expiration:

```typescript
// backend/src/jobs/expire-chains.job.ts
import { PrismaClient } from '@prisma/client';
import { ChainManagerService } from '../services/chain-discovery/chain-manager.service';

const prisma = new PrismaClient();
const chainManager = new ChainManagerService(prisma);

async function expireChainsJob() {
  console.log('Running chain expiration job...');
  const expiredCount = await chainManager.expireStaleChains();
  console.log(`Expired ${expiredCount} chains`);
}

// Run every hour
setInterval(expireChainsJob, 60 * 60 * 1000);
```

---

## Performance Monitoring

### Key Metrics to Track

1. **Graph Construction Time**
   - Target: < 2 seconds
   - Monitor: Log `graph.builtAt` timestamp

2. **Chain Discovery Time**
   - Target: < 5 seconds for depth=5
   - Monitor: Add timing in `discoverChains()`

3. **Database Query Performance**
   - Use Prisma logging: `log: ['query']`
   - Identify slow queries with `EXPLAIN ANALYZE`

4. **API Response Times**
   - Target: p95 < 500ms
   - Use Railway metrics or add middleware

---

## Common Issues & Solutions

### Issue: No chains found

**Solution:**
- Verify active barter requests exist
- Check match scores not too strict (lower minScore)
- Ensure category IDs match between items
- Test graph has edges: `console.log(graph.edgeCount)`

### Issue: Migration fails

**Solution:**
- Check UUID extension enabled: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
- Verify no conflicting table names
- Drop tables manually if needed: `DROP TABLE IF EXISTS barter_chains CASCADE`

### Issue: Graph build takes too long

**Solution:**
- Add Redis caching (see ARCHITECTURE.md)
- Reduce active request pool size
- Add `LIMIT` to Prisma queries
- Consider incremental graph updates

### Issue: Prisma client out of sync

**Solution:**
```bash
npx prisma generate
npx prisma validate
npm run build
```

---

## Next Steps After Phase 1

Once Phase 1 is complete:

1. **Add Notifications**
   - Email when chain created
   - Push notifications for approvals
   - Reminders before expiration

2. **Add Chain Caching**
   - Cache discovered chains in Redis
   - Invalidate on new requests
   - Reduce duplicate discoveries

3. **Add Analytics**
   - Track chain discovery success rate
   - Monitor priority A/B/C distribution
   - Measure average match scores

4. **Add Admin Dashboard**
   - View all active chains
   - Manually resolve disputes
   - System health monitoring

---

## Resources

- **Full Architecture:** See `ARCHITECTURE.md`
- **Implementation Details:** See `IMPLEMENTATION-PLAN.md`
- **TypeScript Types:** See `TYPESCRIPT-INTERFACES.md`
- **Current Codebase:** `/home/user/xchange-egypt/`

---

## Support

If you encounter issues:

1. Check logs: `railway logs` or `vercel logs`
2. Test locally first: `npm run dev`
3. Verify database connection: `npx prisma studio`
4. Review recent commits: `git log --oneline -10`

---

## Success Criteria

You've successfully completed Phase 1 when:

- ✅ Database schema deployed to Supabase
- ✅ Prisma client generated without errors
- ✅ Graph builder constructs graph from active requests
- ✅ Chain finder discovers 2-party and 3-party chains
- ✅ API endpoints return correct responses
- ✅ Frontend form creates barter requests
- ✅ Test with real data shows discovered chains

---

**Ready to start? Begin with "Phase 1: Database Setup" above!** 🚀
