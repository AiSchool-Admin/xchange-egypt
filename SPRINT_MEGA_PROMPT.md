# XChange Egypt - 24-Hour Sprint Execution

## Mission
Implement all features sequentially. Commit and push after EACH feature. Do not stop or ask questions - make reasonable decisions and document them in commit messages.

---

## PLATFORM CURRENT STATE (CRITICAL - READ FIRST)

### Technical Architecture
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Deployment**: Vercel (frontend), Railway (backend)
- **Authentication**: JWT with refresh tokens

### Repository Structure
```
/home/user/xchange-egypt/
├── frontend/
│   ├── app/                    # Next.js App Router pages
│   │   ├── barter/            # Barter marketplace pages
│   │   ├── dashboard/         # User dashboard
│   │   ├── items/             # Item pages
│   │   └── ...
│   ├── lib/
│   │   └── api/               # API client functions
│   └── components/            # React components
├── backend/
│   ├── src/
│   │   ├── services/          # Business logic
│   │   ├── controllers/       # Route handlers
│   │   ├── routes/            # Express routes
│   │   ├── middleware/        # Auth, validation
│   │   └── app.ts             # App entry
│   └── prisma/
│       └── schema.prisma      # Database schema
```

### Database Schema Key Models
- **User**: id, email, fullName, phone, userType, governorate, rating
- **Item**: id, sellerId, title, description, categoryId, condition, estimatedValue, images (String[]), status
- **Category**: id, nameAr, nameEn, slug, parentId
- **Listing**: id, itemId, listingType (DIRECT_SALE, AUCTION, BARTER), price, status
- **BarterOffer**: id, initiatorId, recipientId, offeredItemIds, status, preferenceSets
- **BarterChain**: id, chainType, participants, matchScore, status
- **Notification**: id, userId, type, title, message, entityId, entityType, isRead
- **WishListItem**: id, userId, categoryId, description, keywords, maxPrice

### Schema Critical Notes (VERY IMPORTANT)
- Item.title (NOT titleEn/titleAr)
- Item.images is String[] (NOT a relation)
- Item.description (NOT descriptionEn)
- Notification uses entityId/entityType (NOT referenceId/referenceType)

### Already Implemented Features

#### Authentication & Users
- [x] User registration with email verification
- [x] Login with JWT tokens
- [x] Refresh token rotation
- [x] User profile management
- [x] Bilingual support (AR/EN)

#### Items & Listings
- [x] Create items with images
- [x] Item categories (hierarchical)
- [x] Item conditions (NEW, LIKE_NEW, GOOD, FAIR, POOR)
- [x] Direct sale listings
- [x] Item search and filtering

#### Barter System (Basic)
- [x] Create barter offers
- [x] Accept/reject offers
- [x] Counter offers
- [x] Bundle trades (multiple items)
- [x] Preference sets with priorities

#### Barter System (Advanced)
- [x] Multi-party matching algorithm (graph-based cycle detection)
- [x] Suggested barter partners
- [x] AI price recommendations
- [x] Market trend analysis
- [x] Wish list with keyword matching
- [x] Wish list match notifications
- [x] Advanced search filters (condition, governorate, sort)

#### Auctions
- [x] Regular auctions with bidding
- [x] Auto-extension on late bids
- [x] Reverse auctions (buyer requests)

### Existing API Endpoints

#### Auth Routes (/auth)
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout

#### Item Routes (/items)
- GET /items
- GET /items/:id
- POST /items
- PUT /items/:id
- DELETE /items/:id

#### Barter Routes (/barter)
- GET /barter/items
- GET /barter/offers/my
- POST /barter/offers
- POST /barter/offers/:id/accept
- POST /barter/offers/:id/reject
- POST /barter/offers/:id/counter
- GET /barter/multi-party-matches
- GET /barter/suggested-partners
- GET /barter/price-recommendation
- POST /barter/evaluate-fairness

#### Wishlist Routes (/wishlist)
- GET /wishlist
- POST /wishlist
- DELETE /wishlist/:id
- GET /wishlist/matches
- GET /wishlist/notifications

### Git Setup
```bash
# Pull latest and create new branch
git fetch origin
git checkout -b claude/sprint-24h-[session-id]
```

---

## PHASE 0: BARTER SYSTEM ENHANCEMENT (4-5 hours)

### 0.1 SCHEMA UPDATE (Commit: "feat: Extend barter schema for cash and item requests")

Update /backend/prisma/schema.prisma:

```prisma
// Add to BarterOffer model:
offeredCashAmount   Float   @default(0) @map("offered_cash_amount")
requestedCashAmount Float   @default(0) @map("requested_cash_amount")
itemRequests        ItemRequest[]

// Create new model for abstract item requests
model ItemRequest {
  id              String         @id @default(uuid())
  barterOfferId   String         @map("barter_offer_id")
  description     String
  categoryId      String?        @map("category_id")
  subcategoryId   String?        @map("subcategory_id")
  minPrice        Float?         @map("min_price")
  maxPrice        Float?         @map("max_price")
  condition       ItemCondition?
  keywords        String[]
  createdAt       DateTime       @default(now()) @map("created_at")

  barterOffer     BarterOffer    @relation(fields: [barterOfferId], references: [id], onDelete: Cascade)
  category        Category?      @relation(fields: [categoryId], references: [id])

  @@map("item_requests")
  @@index([barterOfferId])
  @@index([categoryId])
}

// Add to Category model:
itemRequests      ItemRequest[]
```

Run migration:
```bash
cd backend && npx prisma migrate dev --name barter_cash_requests
```

### 0.2 SMART MATCHING SERVICE (Commit: "feat: Add smart matching for item requests")

Create /backend/src/services/smartMatch.service.ts:

```typescript
import { prisma } from '../config/database';
import { ItemRequest } from '@prisma/client';

interface MatchedItem {
  id: string;
  title: string;
  estimatedValue: number;
  condition: string;
  images: string[];
  matchScore: number;
  seller: {
    id: string;
    fullName: string;
  };
}

// Match item requests against market items
export const matchItemRequests = async (itemRequest: ItemRequest): Promise<MatchedItem[]> => {
  // Build search query based on request
  const items = await prisma.item.findMany({
    where: {
      status: 'ACTIVE',
      ...(itemRequest.categoryId && { categoryId: itemRequest.categoryId }),
      ...(itemRequest.condition && { condition: itemRequest.condition }),
      ...(itemRequest.minPrice || itemRequest.maxPrice ? {
        estimatedValue: {
          ...(itemRequest.minPrice && { gte: itemRequest.minPrice }),
          ...(itemRequest.maxPrice && { lte: itemRequest.maxPrice }),
        },
      } : {}),
      OR: itemRequest.keywords.length > 0 ? [
        ...itemRequest.keywords.map(keyword => ({
          title: { contains: keyword, mode: 'insensitive' as const },
        })),
        ...itemRequest.keywords.map(keyword => ({
          description: { contains: keyword, mode: 'insensitive' as const },
        })),
      ] : undefined,
    },
    include: {
      seller: {
        select: { id: true, fullName: true },
      },
    },
    take: 20,
  });

  // Score and sort matches
  return items.map(item => {
    let score = 50;

    // Keyword matches in title (higher weight)
    const titleMatches = itemRequest.keywords.filter(k =>
      item.title.toLowerCase().includes(k.toLowerCase())
    ).length;
    score += titleMatches * 15;

    // Price proximity
    if (itemRequest.minPrice && itemRequest.maxPrice) {
      const targetPrice = (itemRequest.minPrice + itemRequest.maxPrice) / 2;
      const priceDiff = Math.abs(item.estimatedValue - targetPrice) / targetPrice;
      score -= priceDiff * 20;
    }

    // Condition match
    if (itemRequest.condition && item.condition === itemRequest.condition) {
      score += 10;
    }

    return {
      id: item.id,
      title: item.title,
      estimatedValue: item.estimatedValue,
      condition: item.condition,
      images: item.images,
      matchScore: Math.max(0, Math.min(100, Math.round(score))),
      seller: item.seller,
    };
  }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
};

// Find best matches for a barter offer
export const findOfferMatches = async (offerId: string) => {
  const offer = await prisma.barterOffer.findUnique({
    where: { id: offerId },
    include: {
      itemRequests: true,
    },
  });

  if (!offer) return [];

  const allMatches: MatchedItem[] = [];

  for (const request of offer.itemRequests) {
    const matches = await matchItemRequests(request);
    allMatches.push(...matches);
  }

  // Remove duplicates and sort by score
  const uniqueMatches = Array.from(
    new Map(allMatches.map(m => [m.id, m])).values()
  ).sort((a, b) => b.matchScore - a.matchScore);

  return uniqueMatches;
};

// Proactive search for all pending offers
export const runProactiveMatching = async (): Promise<number> => {
  const pendingOffers = await prisma.barterOffer.findMany({
    where: {
      status: 'PENDING',
      itemRequests: { some: {} },
    },
    include: {
      itemRequests: true,
      initiator: true,
    },
  });

  let notificationCount = 0;

  for (const offer of pendingOffers) {
    const matches = await findOfferMatches(offer.id);

    // Notify for high-score matches
    const highScoreMatches = matches.filter(m => m.matchScore >= 70);

    for (const match of highScoreMatches.slice(0, 3)) {
      // Check if already notified
      const existing = await prisma.notification.findFirst({
        where: {
          userId: offer.initiatorId,
          entityId: match.id,
          type: 'ITEM_AVAILABLE',
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            userId: offer.initiatorId,
            type: 'ITEM_AVAILABLE',
            title: 'Match Found!',
            message: `"${match.title}" matches your barter request (${match.matchScore}% match)`,
            entityId: match.id,
            entityType: 'Item',
          },
        });
        notificationCount++;
      }
    }
  }

  return notificationCount;
};
```

### 0.3 CASH IN BARTER (Commit: "feat: Support cash in barter offers")

Update /backend/src/services/barter.service.ts:

Add these functions and update existing ones:

```typescript
// Add to CreateBarterOfferData interface:
interface CreateBarterOfferData {
  offeredItemIds: string[];
  offeredCashAmount?: number;
  requestedCashAmount?: number;
  itemRequests?: {
    description: string;
    categoryId?: string;
    subcategoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    keywords?: string[];
  }[];
  preferenceSets?: {
    priority: number;
    itemIds: string[];
    description?: string;
  }[];
  recipientId?: string;
  notes?: string;
  expiresAt?: string;
  isOpenOffer?: boolean;
}

// Update createBarterOffer to handle cash and item requests
export const createBarterOffer = async (
  userId: string,
  data: CreateBarterOfferData
) => {
  // Calculate offered bundle value including cash
  const offeredItems = await prisma.item.findMany({
    where: { id: { in: data.offeredItemIds } },
  });
  const offeredBundleValue = offeredItems.reduce((sum, item) => sum + item.estimatedValue, 0)
    + (data.offeredCashAmount || 0);

  const offer = await prisma.barterOffer.create({
    data: {
      initiatorId: userId,
      offeredItemIds: data.offeredItemIds,
      offeredBundleValue,
      offeredCashAmount: data.offeredCashAmount || 0,
      requestedCashAmount: data.requestedCashAmount || 0,
      recipientId: data.recipientId,
      notes: data.notes,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      isOpenOffer: data.isOpenOffer ?? true,
      // Create item requests
      itemRequests: data.itemRequests ? {
        create: data.itemRequests.map(req => ({
          description: req.description,
          categoryId: req.categoryId,
          subcategoryId: req.subcategoryId,
          minPrice: req.minPrice,
          maxPrice: req.maxPrice,
          condition: req.condition as any,
          keywords: req.keywords || extractKeywords(req.description),
        })),
      } : undefined,
      // Create preference sets
      preferenceSets: data.preferenceSets ? {
        create: await Promise.all(data.preferenceSets.map(async (ps) => {
          const items = await prisma.item.findMany({
            where: { id: { in: ps.itemIds } },
          });
          const totalValue = items.reduce((sum, item) => sum + item.estimatedValue, 0);
          return {
            priority: ps.priority,
            totalValue,
            valueDifference: totalValue - offeredBundleValue,
            isBalanced: Math.abs(totalValue - offeredBundleValue) / offeredBundleValue < 0.2,
            description: ps.description,
            items: {
              create: ps.itemIds.map(itemId => ({
                itemId,
                itemValue: items.find(i => i.id === itemId)?.estimatedValue || 0,
              })),
            },
          };
        })),
      } : undefined,
    },
    include: {
      initiator: true,
      itemRequests: true,
      preferenceSets: { include: { items: true } },
    },
  });

  return offer;
};

// Helper to extract keywords from description
function extractKeywords(description: string): string[] {
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'i', 'want', 'need', 'looking'];
  return description
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .slice(0, 10);
}

// Calculate total value including cash
export const calculateOfferValue = async (offerId: string) => {
  const offer = await prisma.barterOffer.findUnique({
    where: { id: offerId },
    include: {
      itemRequests: true,
      preferenceSets: { include: { items: { include: { item: true } } } },
    },
  });

  if (!offer) return { offered: 0, requested: 0 };

  // Offered value
  const offeredItems = await prisma.item.findMany({
    where: { id: { in: offer.offeredItemIds } },
  });
  const offeredValue = offeredItems.reduce((sum, item) => sum + item.estimatedValue, 0)
    + offer.offeredCashAmount;

  // Requested value
  let requestedValue = offer.requestedCashAmount;

  // From preference sets
  if (offer.preferenceSets.length > 0) {
    requestedValue += offer.preferenceSets[0].totalValue;
  }

  // From item requests (use average of price range)
  for (const req of offer.itemRequests) {
    if (req.minPrice && req.maxPrice) {
      requestedValue += (req.minPrice + req.maxPrice) / 2;
    } else if (req.maxPrice) {
      requestedValue += req.maxPrice;
    }
  }

  return { offered: offeredValue, requested: requestedValue };
};
```

Update controller to handle new fields.

### 0.4 PROACTIVE MATCHING JOB (Commit: "feat: Add background job for proactive matching")

Create /backend/src/jobs/barterMatcher.job.ts:

```typescript
import cron from 'node-cron';
import { runProactiveMatching } from '../services/smartMatch.service';

export const startBarterMatcherJob = () => {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      console.log('[BarterMatcher] Running proactive matching...');
      const count = await runProactiveMatching();
      console.log(`[BarterMatcher] Created ${count} notifications`);
    } catch (error) {
      console.error('[BarterMatcher] Error:', error);
    }
  });

  console.log('[BarterMatcher] Job scheduled (every 15 minutes)');
};
```

Update /backend/src/app.ts to start the job:

```typescript
import { startBarterMatcherJob } from './jobs/barterMatcher.job';

// After app setup
if (process.env.NODE_ENV === 'production') {
  startBarterMatcherJob();
}
```

Install dependency:
```bash
cd backend && npm install node-cron && npm install -D @types/node-cron
```

### 0.5 ENHANCED BARTER UI (Commit: "feat: Update barter UI for cash and item requests")

Create /frontend/app/barter/create/page.tsx:

Full-featured form with:
- "What I'm Offering" section: Select items + Cash input
- "What I Want" section: Toggle between Specific Items / Describe
- If describe: Category, subcategory, price range, description, keywords
- Cash request input
- Total value display for both sides
- Create button

Update /frontend/lib/api/barter.ts:
- Add ItemRequest type
- Update CreateBarterOfferData to include cash and itemRequests
- Add getSmartMatches(offerId) function

Update /frontend/app/barter/page.tsx:
- Show "System Matched" badge
- Display cash amounts
- Show item request descriptions

---

## PHASE 1: CORE COMMERCE (10-12 hours)

### 1. SHOPPING CART (Commit: "feat: Add shopping cart functionality")

Backend Schema (add to schema.prisma):
```prisma
model Cart {
  id        String     @id @default(uuid())
  userId    String     @unique @map("user_id")
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]

  @@map("carts")
}

model CartItem {
  id        String   @id @default(uuid())
  cartId    String   @map("cart_id")
  listingId String   @map("listing_id")
  quantity  Int      @default(1)
  createdAt DateTime @default(now()) @map("created_at")

  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  listing   Listing  @relation(fields: [listingId], references: [id])

  @@unique([cartId, listingId])
  @@map("cart_items")
}

// Add to User model:
cart      Cart?

// Add to Listing model:
cartItems CartItem[]
```

Backend:
- Create /backend/src/services/cart.service.ts
  - getCart(userId)
  - addToCart(userId, listingId, quantity)
  - updateQuantity(userId, listingId, quantity)
  - removeFromCart(userId, listingId)
  - clearCart(userId)
  - getCartTotal(userId)
- Create /backend/src/controllers/cart.controller.ts
- Create /backend/src/routes/cart.routes.ts
- Register in app.ts

Frontend:
- Create /frontend/lib/api/cart.ts
- Create /frontend/context/CartContext.tsx
- Create /frontend/app/cart/page.tsx
- Add cart icon with badge to header

### 2. CHECKOUT FLOW (Commit: "feat: Add checkout flow")

Backend Schema:
```prisma
model ShippingAddress {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  fullName     String   @map("full_name")
  phone        String
  address      String
  city         String
  governorate  String
  postalCode   String?  @map("postal_code")
  isDefault    Boolean  @default(false) @map("is_default")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  orders       Order[]

  @@map("shipping_addresses")
}

// Add to User:
shippingAddresses ShippingAddress[]
```

Backend:
- Create /backend/src/services/checkout.service.ts
  - validateCart(userId)
  - calculateTotals(userId)
  - getShippingOptions(governorate)
- Create controller and routes

Frontend:
- Create /frontend/app/checkout/page.tsx
- Multi-step: Address → Payment → Review
- Egyptian governorates dropdown

### 3. ORDER MANAGEMENT (Commit: "feat: Add order management system")

Backend Schema:
```prisma
enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

model Order {
  id                String        @id @default(uuid())
  userId            String        @map("user_id")
  orderNumber       String        @unique @map("order_number")
  status            OrderStatus   @default(PENDING)
  subtotal          Float
  shippingCost      Float         @map("shipping_cost")
  total             Float
  shippingAddressId String        @map("shipping_address_id")
  paymentMethod     String        @map("payment_method")
  paymentId         String?       @map("payment_id")
  notes             String?
  createdAt         DateTime      @default(now()) @map("created_at")
  updatedAt         DateTime      @updatedAt @map("updated_at")
  paidAt            DateTime?     @map("paid_at")
  shippedAt         DateTime?     @map("shipped_at")
  deliveredAt       DateTime?     @map("delivered_at")

  user              User          @relation(fields: [userId], references: [id])
  shippingAddress   ShippingAddress @relation(fields: [shippingAddressId], references: [id])
  items             OrderItem[]

  @@map("orders")
  @@index([userId])
  @@index([status])
}

model OrderItem {
  id          String   @id @default(uuid())
  orderId     String   @map("order_id")
  listingId   String   @map("listing_id")
  sellerId    String   @map("seller_id")
  quantity    Int
  price       Float

  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  listing     Listing  @relation(fields: [listingId], references: [id])

  @@map("order_items")
}

// Add to User:
orders Order[]

// Add to Listing:
orderItems OrderItem[]
```

Backend:
- Create /backend/src/services/order.service.ts
- Create controller and routes: /orders

Frontend:
- Create /frontend/lib/api/orders.ts
- Create /frontend/app/dashboard/orders/page.tsx
- Create /frontend/app/dashboard/orders/[id]/page.tsx

### 4. INSTAPAY INTEGRATION (Commit: "feat: Add Instapay payment integration")

Backend:
- Create /backend/src/services/payment/instapay.service.ts
  - initiatePayment(orderId, amount, customerData)
  - verifyPayment(transactionId)
  - handleCallback(payload)
- Create /backend/src/routes/payment.routes.ts
  - POST /payment/instapay/initiate
  - POST /payment/instapay/callback
  - GET /payment/instapay/verify/:transactionId

Environment variables:
```
INSTAPAY_API_URL=https://api.instapay.eg
INSTAPAY_API_KEY=
INSTAPAY_SECRET_KEY=
INSTAPAY_MERCHANT_ID=
```

Frontend:
- Add InstaPay option in checkout
- Create /frontend/app/payment/success/page.tsx
- Create /frontend/app/payment/failure/page.tsx

### 5. FAWRY INTEGRATION (Commit: "feat: Add Fawry payment integration")

Backend:
- Create /backend/src/services/payment/fawry.service.ts
  - createFawryPayment(orderId, amount, customerData)
  - checkPaymentStatus(referenceNumber)
  - handleFawryCallback(payload)
- Add routes:
  - POST /payment/fawry/create
  - POST /payment/fawry/callback
  - GET /payment/fawry/status/:referenceNumber

Environment variables:
```
FAWRY_BASE_URL=https://atfawry.com
FAWRY_MERCHANT_CODE=
FAWRY_SECURITY_KEY=
```

Frontend:
- Add Fawry option in checkout
- Show reference number + instructions
- Show expiry countdown

### 6. ORDER NOTIFICATIONS (Commit: "feat: Add order status notifications")

Backend:
- Add notification types: ORDER_PLACED, ORDER_PAID, ORDER_SHIPPED, ORDER_DELIVERED, ORDER_CANCELLED
- Create /backend/src/services/orderNotification.service.ts
- Integrate with order status updates

Frontend:
- Display order notifications in notification dropdown

---

## PHASE 2: MOBILE PWA (6-8 hours)

### 7. PWA MANIFEST (Commit: "feat: Add PWA manifest and icons")

Create /frontend/public/manifest.json:
```json
{
  "name": "XChange Egypt",
  "short_name": "XChange",
  "description": "Egypt's Smart Marketplace for Buy, Sell & Barter",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- Create placeholder icons
- Add manifest link to layout.tsx
- Create install prompt component

### 8. SERVICE WORKER (Commit: "feat: Add service worker for offline support")

Create /frontend/public/sw.js with:
- Cache static assets
- Network-first for API
- Offline fallback page

Create /frontend/app/offline/page.tsx

Register service worker in app

### 9. PUSH NOTIFICATIONS (Commit: "feat: Add web push notifications")

Backend Schema:
```prisma
model PushSubscription {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  endpoint     String   @unique
  p256dh       String
  auth         String
  createdAt    DateTime @default(now()) @map("created_at")

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("push_subscriptions")
}

// Add to User:
pushSubscriptions PushSubscription[]
```

Backend:
- Install web-push
- Create /backend/src/services/push.service.ts
- Add routes: /push/subscribe, /push/unsubscribe

Environment variables:
```
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=mailto:support@xchange.eg
```

Frontend:
- Create /frontend/lib/pushNotifications.ts
- Add push event handler to service worker
- Add notification settings

### 10. MOBILE OPTIMIZATION (Commit: "feat: Optimize for mobile experience")

Frontend:
- Viewport meta tag
- Pull-to-refresh
- Bottom navigation for mobile
- Touch targets minimum 44x44px
- Smooth page transitions
- Image optimization with next/image

---

## PHASE 3: FINALIZATION

### 11. CREATE PULL REQUEST (Commit: N/A - just run commands)

```bash
# Verify all changes committed
git status

# View sprint commits
git log --oneline main..HEAD

# Create PR
gh pr create \
  --title "feat: Complete 24-hour sprint - Barter Enhancement, Commerce & PWA" \
  --body "$(cat <<'EOF'
## Summary
Complete implementation of XChange Egypt platform features in 24-hour sprint.

### Phase 0: Barter System Enhancement
- Schema update for cash and item requests
- Smart matching service for item requests
- Cash support in barter offers
- Proactive matching background job
- Enhanced barter UI

### Phase 1: Core Commerce
- Shopping cart functionality
- Checkout flow with shipping
- Order management system
- Instapay payment integration
- Fawry payment integration
- Order status notifications

### Phase 2: Mobile PWA
- PWA manifest and icons
- Service worker for offline support
- Web push notifications
- Mobile optimization

## Environment Variables Required
- INSTAPAY_API_KEY, INSTAPAY_SECRET_KEY, INSTAPAY_MERCHANT_ID
- FAWRY_MERCHANT_CODE, FAWRY_SECURITY_KEY
- VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL

## Test Plan
- Create barter offer with cash + item descriptions
- Verify smart matching finds relevant items
- Complete checkout flow
- Install PWA on mobile
- Receive push notification
EOF
)"

echo "✅ Sprint Complete! PR created for review."
```

---

## EXECUTION RULES

1. **Commit after EACH feature** - don't batch commits
2. **Run migrations** when schema changes:
   ```bash
   cd backend && npx prisma migrate dev --name feature_name
   ```
3. **Push after each commit**:
   ```bash
   git push -u origin claude/sprint-24h-[session-id]
   ```
4. **TypeScript strict** - avoid 'any' types where possible
5. **Bilingual** - support AR/EN in all UI text
6. **No stopping** - make reasonable decisions, document in commits
7. **Mock external APIs** if keys not available - add TODO comments

---

## START NOW

Begin with Feature 0.1 (Schema Update for Barter Enhancement).
Work through all 11 features sequentially without stopping.

Good luck! 🚀
