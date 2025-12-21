# 🚗 Xchange Transport - Smart Ride Aggregator Platform

## Claude Code Development Prompt

---

## 📋 PROJECT OVERVIEW

### Project Name
Xchange Transport - مجمع النقل التشاركي الذكي

### Vision
Build Egypt's first intelligent ride-hailing aggregator that displays **100% accurate real-time prices** from all transport providers (Uber, Careem, Bolt, inDrive, DiDi, Swvl) and shipping companies (Bosta, Aramex, Mylerz) in a single interface with AI-powered recommendations.

### Core Value Proposition
- User opens ONE app instead of 5 separate apps
- Sees ALL prices in 3 seconds with exact accuracy
- Gets AI recommendation for best option
- Books directly via Deep Link to provider app
- Integrated with Xchange ecosystem (Cars, Mobile, Real Estate marketplaces)

### Repository
```
GitHub: AiSchool-Admin/xchange-transport
```

---

## 🛠️ TECH STACK

### Frontend
```yaml
framework: Next.js 14 (App Router)
language: TypeScript
styling: Tailwind CSS
state: Zustand
maps: Google Maps API
ui_components: shadcn/ui
```

### Backend
```yaml
runtime: Node.js 20
framework: Next.js API Routes
database: PostgreSQL 16
orm: Prisma
cache: Redis
realtime: Socket.io
queue: Bull (for background jobs)
```

### External APIs
```yaml
rides:
  - Uber API (Official - developer.uber.com)
  - Deep Links (Careem, Bolt, inDrive, DiDi)
  
shipping:
  - Bosta API
  - Aramex API
  
maps:
  - Google Maps Platform (Distance Matrix, Geocoding, Places)
  
payments:
  - Paymob
  - Fawry
```

---

## 📁 PROJECT STRUCTURE

```
xchange-transport/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (main)/
│   │   │   ├── rides/
│   │   │   │   ├── page.tsx              # Main ride search
│   │   │   │   ├── [id]/page.tsx         # Ride details
│   │   │   │   └── history/page.tsx      # Ride history
│   │   │   ├── shipping/
│   │   │   │   ├── page.tsx              # Shipping calculator
│   │   │   │   └── track/[id]/page.tsx   # Track shipment
│   │   │   └── wallet/
│   │   │       └── page.tsx              # User wallet
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── pricing/
│   │   │   │   ├── page.tsx              # Pricing dashboard
│   │   │   │   ├── formulas/page.tsx     # Formula management
│   │   │   │   └── test/page.tsx         # Price testing
│   │   │   ├── providers/
│   │   │   └── users/
│   │   ├── api/
│   │   │   ├── rides/
│   │   │   │   ├── estimate/route.ts     # Get all prices
│   │   │   │   ├── book/route.ts         # Generate deep link
│   │   │   │   └── history/route.ts
│   │   │   ├── shipping/
│   │   │   │   ├── calculate/route.ts
│   │   │   │   └── track/route.ts
│   │   │   ├── pricing/
│   │   │   │   ├── formulas/route.ts     # CRUD formulas
│   │   │   │   ├── reload/route.ts       # Reload formulas
│   │   │   │   └── test/route.ts         # Test pricing
│   │   │   ├── auth/
│   │   │   └── webhook/
│   │   │       └── xchange/route.ts      # Ecosystem integration
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── rides/
│   │   │   ├── RideSearchForm.tsx
│   │   │   ├── PriceComparisonCard.tsx
│   │   │   ├── ProviderCard.tsx
│   │   │   └── MapView.tsx
│   │   ├── shipping/
│   │   │   ├── ShippingCalculator.tsx
│   │   │   └── TrackingTimeline.tsx
│   │   ├── common/
│   │   │   ├── LocationPicker.tsx
│   │   │   └── PriceDisplay.tsx
│   │   └── admin/
│   │       ├── PricingDashboard.tsx
│   │       └── FormulaEditor.tsx
│   ├── lib/
│   │   ├── pricing/
│   │   │   ├── engine.ts                 # Main pricing engine
│   │   │   ├── formulas.ts               # Formula definitions
│   │   │   ├── providers/
│   │   │   │   ├── uber.ts
│   │   │   │   ├── careem.ts
│   │   │   │   ├── bolt.ts
│   │   │   │   ├── indrive.ts
│   │   │   │   └── didi.ts
│   │   │   └── surge.ts                  # Surge prediction
│   │   ├── deeplinks/
│   │   │   ├── generator.ts
│   │   │   └── providers.ts
│   │   ├── shipping/
│   │   │   ├── bosta.ts
│   │   │   └── aramex.ts
│   │   ├── ai/
│   │   │   └── recommender.ts            # AI recommendation
│   │   ├── maps/
│   │   │   └── google.ts
│   │   └── db/
│   │       └── prisma.ts
│   ├── hooks/
│   │   ├── useRideEstimate.ts
│   │   ├── useLocation.ts
│   │   └── usePricing.ts
│   ├── store/
│   │   ├── rideStore.ts
│   │   └── userStore.ts
│   └── types/
│       ├── ride.ts
│       ├── pricing.ts
│       └── provider.ts
├── config/
│   └── pricing_formulas.json             # Pricing formulas file
├── public/
│   └── providers/                        # Provider logos
├── .env.example
├── package.json
└── README.md
```

---

## 📊 DATABASE SCHEMA (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== ENUMS ====================

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}

enum Provider {
  UBER
  CAREEM
  BOLT
  INDRIVE
  DIDI
  SWVL
  BOSTA
  ARAMEX
  MYLERZ
}

enum RideStatus {
  SEARCHING
  REDIRECTED
  COMPLETED
  CANCELLED
}

enum ShipmentStatus {
  PENDING
  PICKED_UP
  IN_TRANSIT
  OUT_FOR_DELIVERY
  DELIVERED
  RETURNED
}

enum PricingSource {
  OFFICIAL_API
  DISCOVERED_FORMULA
  FALLBACK_ESTIMATE
}

// ==================== MODELS ====================

model User {
  id                String    @id @default(cuid())
  phone             String    @unique
  email             String?   @unique
  name              String?
  role              UserRole  @default(USER)
  
  // Preferences
  preferredProvider Provider?
  homeLocation      Json?     // { lat, lng, address }
  workLocation      Json?     // { lat, lng, address }
  
  // Relations
  rideRequests      RideRequest[]
  shipments         Shipment[]
  wallet            Wallet?
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([phone])
}

model Wallet {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  balance   Decimal  @default(0) @db.Decimal(10, 2)
  currency  String   @default("EGP")
  
  transactions WalletTransaction[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model WalletTransaction {
  id          String   @id @default(cuid())
  walletId    String
  wallet      Wallet   @relation(fields: [walletId], references: [id])
  amount      Decimal  @db.Decimal(10, 2)
  type        String   // credit, debit, refund
  description String?
  reference   String?
  
  createdAt   DateTime @default(now())
}

model RideRequest {
  id              String      @id @default(cuid())
  userId          String
  user            User        @relation(fields: [userId], references: [id])
  
  // Locations
  pickupLat       Float
  pickupLng       Float
  pickupAddress   String
  dropoffLat      Float
  dropoffLng      Float
  dropoffAddress  String
  
  // Route info
  distanceKm      Float
  durationMin     Float
  
  // Status
  status          RideStatus  @default(SEARCHING)
  
  // Selected provider
  selectedProvider Provider?
  selectedProduct  String?
  estimatedPrice   Decimal?    @db.Decimal(10, 2)
  actualPrice      Decimal?    @db.Decimal(10, 2)
  
  // Deep link used
  deepLinkUsed     String?
  
  // All offers received
  offers           RideOffer[]
  
  // Timestamps
  createdAt        DateTime    @default(now())
  completedAt      DateTime?
  
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

model RideOffer {
  id              String        @id @default(cuid())
  rideRequestId   String
  rideRequest     RideRequest   @relation(fields: [rideRequestId], references: [id])
  
  provider        Provider
  product         String        // UberX, Careem Go, Bolt, etc.
  
  // Pricing
  price           Decimal       @db.Decimal(10, 2)
  currency        String        @default("EGP")
  pricingSource   PricingSource
  confidence      Float         // 0.0 to 1.0
  
  // Price breakdown
  baseFare        Decimal?      @db.Decimal(10, 2)
  distanceFare    Decimal?      @db.Decimal(10, 2)
  timeFare        Decimal?      @db.Decimal(10, 2)
  bookingFee      Decimal?      @db.Decimal(10, 2)
  
  // Surge
  surgeMultiplier Float         @default(1.0)
  isSurge         Boolean       @default(false)
  
  // ETA
  etaMinutes      Int?
  
  // AI Recommendation
  isRecommended   Boolean       @default(false)
  recommendReason String?
  
  // Deep link
  deepLink        String?
  
  createdAt       DateTime      @default(now())
  
  @@index([rideRequestId])
  @@index([provider])
}

model PricingFormula {
  id              String    @id @default(cuid())
  provider        Provider
  product         String
  
  // Formula components
  baseFare        Decimal   @db.Decimal(10, 2)
  perKm           Decimal   @db.Decimal(10, 4)
  perMinute       Decimal   @db.Decimal(10, 4)
  bookingFee      Decimal   @default(0) @db.Decimal(10, 2)
  minFare         Decimal   @default(0) @db.Decimal(10, 2)
  
  // Accuracy metrics
  accuracyR2      Float?
  avgErrorEgp     Float?
  samplesCount    Int?
  
  // Status
  isActive        Boolean   @default(true)
  source          String    @default("discovered") // discovered, manual, official
  
  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  verifiedAt      DateTime?
  
  @@unique([provider, product])
  @@index([provider])
  @@index([isActive])
}

model SurgeData {
  id              String    @id @default(cuid())
  provider        Provider
  city            String    @default("cairo")
  
  multiplier      Float
  capturedAt      DateTime  @default(now())
  expiresAt       DateTime
  
  // Location (optional, for zone-specific surge)
  lat             Float?
  lng             Float?
  
  @@index([provider, city])
  @@index([expiresAt])
}

model Shipment {
  id              String          @id @default(cuid())
  userId          String
  user            User            @relation(fields: [userId], references: [id])
  
  // Provider
  provider        Provider
  trackingNumber  String?
  
  // Addresses
  pickupAddress   Json            // { name, phone, address, lat, lng }
  deliveryAddress Json            // { name, phone, address, lat, lng }
  
  // Package
  weight          Float?          // kg
  dimensions      Json?           // { length, width, height }
  description     String?
  
  // Pricing
  price           Decimal         @db.Decimal(10, 2)
  currency        String          @default("EGP")
  
  // Status
  status          ShipmentStatus  @default(PENDING)
  statusHistory   Json[]          // Array of { status, timestamp, note }
  
  // Timestamps
  createdAt       DateTime        @default(now())
  pickedUpAt      DateTime?
  deliveredAt     DateTime?
  
  @@index([userId])
  @@index([trackingNumber])
  @@index([status])
}

model XchangeIntegration {
  id              String    @id @default(cuid())
  
  // Source
  sourceMarketplace String  // cars, mobile, realestate
  sourceListingId   String
  sourceAction      String  // view_listing, purchase, etc.
  
  // Transport request
  rideRequestId   String?
  shipmentId      String?
  
  // Context
  contextData     Json?     // Additional data from source marketplace
  
  createdAt       DateTime  @default(now())
  
  @@index([sourceMarketplace])
  @@index([sourceListingId])
}

model ApiLog {
  id              String    @id @default(cuid())
  provider        Provider
  endpoint        String
  method          String
  
  requestBody     Json?
  responseStatus  Int
  responseBody    Json?
  responseTimeMs  Int
  
  error           String?
  
  createdAt       DateTime  @default(now())
  
  @@index([provider])
  @@index([createdAt])
}
```

---

## ⚙️ PRICING ENGINE IMPLEMENTATION

### Core Pricing Engine

```typescript
// src/lib/pricing/engine.ts

import { Provider, PricingSource } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { redis } from '@/lib/cache/redis';
import { calculateDistance, estimateDuration } from '@/lib/maps/google';

// Types
export interface Location {
  lat: number;
  lng: number;
  address?: string;
  city?: string;
}

export interface PriceBreakdown {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  bookingFee: number;
  surgeAmount: number;
  subtotal: number;
}

export interface PriceResult {
  provider: Provider;
  product: string;
  price: number;
  currency: string;
  source: PricingSource;
  confidence: number;
  breakdown: PriceBreakdown;
  surgeMultiplier: number;
  isSurge: boolean;
  etaMinutes?: number;
  deepLink: string;
  isRecommended?: boolean;
  recommendReason?: string;
}

export interface PricingFormula {
  baseFare: number;
  perKm: number;
  perMinute: number;
  bookingFee: number;
  minFare: number;
  accuracyR2?: number;
}

// Pricing Engine Class
export class PricingEngine {
  private formulas: Map<string, PricingFormula> = new Map();
  private formulasLoadedAt: Date | null = null;
  private readonly FORMULAS_TTL = 3600; // 1 hour cache
  
  constructor() {
    this.loadFormulas();
  }
  
  // Load formulas from database
  async loadFormulas(): Promise<void> {
    const dbFormulas = await prisma.pricingFormula.findMany({
      where: { isActive: true }
    });
    
    this.formulas.clear();
    
    for (const formula of dbFormulas) {
      const key = `${formula.provider}_${formula.product}`;
      this.formulas.set(key, {
        baseFare: Number(formula.baseFare),
        perKm: Number(formula.perKm),
        perMinute: Number(formula.perMinute),
        bookingFee: Number(formula.bookingFee),
        minFare: Number(formula.minFare),
        accuracyR2: formula.accuracyR2 || undefined
      });
    }
    
    this.formulasLoadedAt = new Date();
    console.log(`✅ Loaded ${this.formulas.size} pricing formulas`);
  }
  
  // Reload formulas if needed
  async ensureFormulasLoaded(): Promise<void> {
    if (!this.formulasLoadedAt) {
      await this.loadFormulas();
      return;
    }
    
    const age = (Date.now() - this.formulasLoadedAt.getTime()) / 1000;
    if (age > this.FORMULAS_TTL) {
      await this.loadFormulas();
    }
  }
  
  // Get formula for provider/product
  getFormula(provider: Provider, product: string): PricingFormula | null {
    const key = `${provider}_${product}`;
    return this.formulas.get(key) || null;
  }
  
  // Get surge multiplier
  async getSurgeMultiplier(provider: Provider, location: Location): Promise<number> {
    const city = location.city || 'cairo';
    const cacheKey = `surge:${provider}:${city}`;
    
    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return parseFloat(cached);
    }
    
    // Check database
    const surgeData = await prisma.surgeData.findFirst({
      where: {
        provider,
        city,
        expiresAt: { gt: new Date() }
      },
      orderBy: { capturedAt: 'desc' }
    });
    
    if (surgeData) {
      // Cache for 5 minutes
      await redis.setex(cacheKey, 300, surgeData.multiplier.toString());
      return surgeData.multiplier;
    }
    
    // Predict based on time
    return this.predictSurge(provider, location);
  }
  
  // Predict surge based on time patterns
  predictSurge(provider: Provider, location: Location): number {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    
    // Weekday patterns
    if (day >= 0 && day <= 4) {
      if (hour >= 7 && hour <= 9) return 1.3;   // Morning rush
      if (hour >= 17 && hour <= 20) return 1.5; // Evening rush
    }
    
    // Weekend patterns
    if (day === 5 || day === 6) {
      if (hour >= 20 && hour <= 23) return 1.4; // Weekend nights
    }
    
    return 1.0;
  }
  
  // Calculate price for a single provider
  async calculatePrice(
    provider: Provider,
    product: string,
    origin: Location,
    destination: Location
  ): Promise<PriceResult> {
    await this.ensureFormulasLoaded();
    
    // Get route info
    const distanceKm = await calculateDistance(origin, destination);
    const durationMin = estimateDuration(distanceKm, origin.city);
    
    // Get surge
    const surge = await this.getSurgeMultiplier(provider, origin);
    
    // Get formula
    const formula = this.getFormula(provider, product);
    
    let source: PricingSource;
    let confidence: number;
    let breakdown: PriceBreakdown;
    
    if (formula) {
      source = PricingSource.DISCOVERED_FORMULA;
      confidence = formula.accuracyR2 || 0.9;
      
      const baseFare = formula.baseFare;
      const distanceFare = distanceKm * formula.perKm;
      const timeFare = durationMin * formula.perMinute;
      const bookingFee = formula.bookingFee;
      const subtotal = Math.max(baseFare + distanceFare + timeFare + bookingFee, formula.minFare);
      const surgeAmount = surge > 1 ? subtotal * (surge - 1) : 0;
      
      breakdown = {
        baseFare: Math.round(baseFare * 100) / 100,
        distanceFare: Math.round(distanceFare * 100) / 100,
        timeFare: Math.round(timeFare * 100) / 100,
        bookingFee: Math.round(bookingFee * 100) / 100,
        surgeAmount: Math.round(surgeAmount * 100) / 100,
        subtotal: Math.round(subtotal * 100) / 100
      };
    } else {
      // Fallback to default estimates
      source = PricingSource.FALLBACK_ESTIMATE;
      confidence = 0.7;
      
      const defaultFormula = this.getDefaultFormula(provider);
      const baseFare = defaultFormula.baseFare;
      const distanceFare = distanceKm * defaultFormula.perKm;
      const timeFare = durationMin * defaultFormula.perMinute;
      const subtotal = baseFare + distanceFare + timeFare;
      
      breakdown = {
        baseFare,
        distanceFare: Math.round(distanceFare * 100) / 100,
        timeFare: Math.round(timeFare * 100) / 100,
        bookingFee: 0,
        surgeAmount: 0,
        subtotal: Math.round(subtotal * 100) / 100
      };
    }
    
    const totalPrice = Math.round((breakdown.subtotal + breakdown.surgeAmount) * 100) / 100;
    
    // Generate deep link
    const deepLink = this.generateDeepLink(provider, origin, destination);
    
    return {
      provider,
      product,
      price: totalPrice,
      currency: 'EGP',
      source,
      confidence,
      breakdown,
      surgeMultiplier: surge,
      isSurge: surge > 1,
      deepLink
    };
  }
  
  // Get default formula for provider (fallback)
  getDefaultFormula(provider: Provider): PricingFormula {
    const defaults: Record<Provider, PricingFormula> = {
      UBER: { baseFare: 10, perKm: 3.5, perMinute: 0.5, bookingFee: 5, minFare: 15 },
      CAREEM: { baseFare: 8, perKm: 3.2, perMinute: 0.4, bookingFee: 0, minFare: 15 },
      BOLT: { baseFare: 7, perKm: 3.0, perMinute: 0.35, bookingFee: 0, minFare: 12 },
      INDRIVE: { baseFare: 5, perKm: 4.0, perMinute: 0, bookingFee: 0, minFare: 10 },
      DIDI: { baseFare: 8, perKm: 3.0, perMinute: 0.4, bookingFee: 0, minFare: 12 },
      SWVL: { baseFare: 15, perKm: 1.5, perMinute: 0, bookingFee: 0, minFare: 15 },
      // Shipping providers (not applicable)
      BOSTA: { baseFare: 0, perKm: 0, perMinute: 0, bookingFee: 0, minFare: 0 },
      ARAMEX: { baseFare: 0, perKm: 0, perMinute: 0, bookingFee: 0, minFare: 0 },
      MYLERZ: { baseFare: 0, perKm: 0, perMinute: 0, bookingFee: 0, minFare: 0 }
    };
    
    return defaults[provider];
  }
  
  // Generate deep link for provider
  generateDeepLink(provider: Provider, origin: Location, destination: Location): string {
    const deepLinks: Record<Provider, string> = {
      UBER: `uber://?action=setPickup&pickup[latitude]=${origin.lat}&pickup[longitude]=${origin.lng}&dropoff[latitude]=${destination.lat}&dropoff[longitude]=${destination.lng}`,
      CAREEM: `careem://booking?pickup_lat=${origin.lat}&pickup_lng=${origin.lng}&dropoff_lat=${destination.lat}&dropoff_lng=${destination.lng}`,
      BOLT: `bolt://ride?pickup_lat=${origin.lat}&pickup_lng=${origin.lng}&dropoff_lat=${destination.lat}&dropoff_lng=${destination.lng}`,
      INDRIVE: `indrive://createorder?pickup_lat=${origin.lat}&pickup_lng=${origin.lng}&dropoff_lat=${destination.lat}&dropoff_lng=${destination.lng}`,
      DIDI: `didiglobal://passenger?fromlat=${origin.lat}&fromlng=${origin.lng}&tolat=${destination.lat}&tolng=${destination.lng}`,
      SWVL: `swvl://book?from_lat=${origin.lat}&from_lng=${origin.lng}&to_lat=${destination.lat}&to_lng=${destination.lng}`,
      BOSTA: '',
      ARAMEX: '',
      MYLERZ: ''
    };
    
    return deepLinks[provider];
  }
  
  // Get all prices for a ride
  async getAllPrices(origin: Location, destination: Location): Promise<PriceResult[]> {
    const providers: Array<{ provider: Provider; products: string[] }> = [
      { provider: Provider.UBER, products: ['UberX', 'Uber Comfort', 'UberXL'] },
      { provider: Provider.CAREEM, products: ['Careem Go', 'Careem Comfort'] },
      { provider: Provider.BOLT, products: ['Bolt'] },
      { provider: Provider.INDRIVE, products: ['inDrive'] },
      { provider: Provider.DIDI, products: ['DiDi Express'] }
    ];
    
    const results: PriceResult[] = [];
    
    for (const { provider, products } of providers) {
      for (const product of products) {
        try {
          const result = await this.calculatePrice(provider, product, origin, destination);
          results.push(result);
        } catch (error) {
          console.error(`Error calculating ${provider} ${product}:`, error);
        }
      }
    }
    
    // Sort by price
    results.sort((a, b) => a.price - b.price);
    
    // Add AI recommendation
    if (results.length > 0) {
      const recommended = this.getRecommendation(results);
      const index = results.findIndex(
        r => r.provider === recommended.provider && r.product === recommended.product
      );
      if (index >= 0) {
        results[index].isRecommended = true;
        results[index].recommendReason = recommended.reason;
      }
    }
    
    return results;
  }
  
  // AI Recommendation
  getRecommendation(offers: PriceResult[]): { provider: Provider; product: string; reason: string } {
    // Score each offer
    const scored = offers.map(offer => {
      let score = 100;
      
      // Price factor (40% weight)
      const minPrice = Math.min(...offers.map(o => o.price));
      const priceRatio = offer.price / minPrice;
      score -= (priceRatio - 1) * 40;
      
      // Confidence factor (30% weight)
      score += (offer.confidence - 0.5) * 60;
      
      // Surge penalty (20% weight)
      if (offer.isSurge) {
        score -= (offer.surgeMultiplier - 1) * 20;
      }
      
      // Provider reliability bonus (10% weight)
      const reliabilityBonus: Partial<Record<Provider, number>> = {
        UBER: 5,
        CAREEM: 5,
        BOLT: 3,
        DIDI: 2,
        INDRIVE: 0
      };
      score += reliabilityBonus[offer.provider] || 0;
      
      return { offer, score };
    });
    
    // Get best
    scored.sort((a, b) => b.score - a.score);
    const best = scored[0].offer;
    
    // Generate reason
    let reason = '';
    const cheapest = offers[0];
    
    if (best.provider === cheapest.provider && best.product === cheapest.product) {
      reason = 'الأرخص والأفضل تقييماً';
    } else if (best.confidence > 0.9) {
      reason = 'أفضل توازن بين السعر والموثوقية';
    } else if (!best.isSurge && cheapest.isSurge) {
      reason = 'بدون ذروة - سعر مستقر';
    } else {
      reason = 'الخيار الأمثل بناءً على تحليل AI';
    }
    
    return {
      provider: best.provider,
      product: best.product,
      reason
    };
  }
  
  // Update formula (admin function)
  async updateFormula(
    provider: Provider,
    product: string,
    formula: Partial<PricingFormula>
  ): Promise<void> {
    await prisma.pricingFormula.upsert({
      where: {
        provider_product: { provider, product }
      },
      update: {
        ...formula,
        updatedAt: new Date(),
        source: 'manual'
      },
      create: {
        provider,
        product,
        baseFare: formula.baseFare || 0,
        perKm: formula.perKm || 0,
        perMinute: formula.perMinute || 0,
        bookingFee: formula.bookingFee || 0,
        minFare: formula.minFare || 0,
        source: 'manual'
      }
    });
    
    // Reload formulas
    await this.loadFormulas();
  }
}

// Export singleton instance
export const pricingEngine = new PricingEngine();
```

---

## 🔗 DEEP LINKS GENERATOR

```typescript
// src/lib/deeplinks/generator.ts

import { Provider } from '@prisma/client';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface DeepLinkConfig {
  scheme: string;
  iosAppStore: string;
  androidPlayStore: string;
  webFallback: string;
}

const PROVIDER_CONFIG: Record<Provider, DeepLinkConfig> = {
  UBER: {
    scheme: 'uber://',
    iosAppStore: 'https://apps.apple.com/app/uber/id368677368',
    androidPlayStore: 'https://play.google.com/store/apps/details?id=com.ubercab',
    webFallback: 'https://m.uber.com'
  },
  CAREEM: {
    scheme: 'careem://',
    iosAppStore: 'https://apps.apple.com/app/careem/id592978487',
    androidPlayStore: 'https://play.google.com/store/apps/details?id=com.careem.acma',
    webFallback: 'https://www.careem.com'
  },
  BOLT: {
    scheme: 'bolt://',
    iosAppStore: 'https://apps.apple.com/app/bolt-request-a-ride/id675033630',
    androidPlayStore: 'https://play.google.com/store/apps/details?id=ee.mtakso.client',
    webFallback: 'https://bolt.eu'
  },
  INDRIVE: {
    scheme: 'indrive://',
    iosAppStore: 'https://apps.apple.com/app/indrive/id1050781958',
    androidPlayStore: 'https://play.google.com/store/apps/details?id=sinet.startup.inDriver',
    webFallback: 'https://indrive.com'
  },
  DIDI: {
    scheme: 'didiglobal://',
    iosAppStore: 'https://apps.apple.com/app/didi-rider/id1484abordar',
    androidPlayStore: 'https://play.google.com/store/apps/details?id=com.xiaojukeji.didi.rider',
    webFallback: 'https://www.didiglobal.com'
  },
  SWVL: {
    scheme: 'swvl://',
    iosAppStore: 'https://apps.apple.com/app/swvl/id1218498210',
    androidPlayStore: 'https://play.google.com/store/apps/details?id=com.swvl.rider',
    webFallback: 'https://www.swvl.com'
  },
  // Shipping - not applicable for deep links
  BOSTA: { scheme: '', iosAppStore: '', androidPlayStore: '', webFallback: 'https://bosta.co' },
  ARAMEX: { scheme: '', iosAppStore: '', androidPlayStore: '', webFallback: 'https://www.aramex.com' },
  MYLERZ: { scheme: '', iosAppStore: '', androidPlayStore: '', webFallback: 'https://mylerz.com' }
};

export function generateDeepLink(
  provider: Provider,
  origin: Location,
  destination: Location,
  options?: { product?: string }
): string {
  switch (provider) {
    case 'UBER':
      return generateUberDeepLink(origin, destination, options);
    case 'CAREEM':
      return generateCareemDeepLink(origin, destination, options);
    case 'BOLT':
      return generateBoltDeepLink(origin, destination);
    case 'INDRIVE':
      return generateInDriveDeepLink(origin, destination);
    case 'DIDI':
      return generateDiDiDeepLink(origin, destination);
    case 'SWVL':
      return generateSwvlDeepLink(origin, destination);
    default:
      return '';
  }
}

function generateUberDeepLink(origin: Location, destination: Location, options?: { product?: string }): string {
  const params = new URLSearchParams({
    action: 'setPickup',
    'pickup[latitude]': origin.lat.toString(),
    'pickup[longitude]': origin.lng.toString(),
    'pickup[formatted_address]': origin.address || '',
    'dropoff[latitude]': destination.lat.toString(),
    'dropoff[longitude]': destination.lng.toString(),
    'dropoff[formatted_address]': destination.address || ''
  });
  
  if (options?.product) {
    params.append('product_id', options.product);
  }
  
  return `uber://?${params.toString()}`;
}

function generateCareemDeepLink(origin: Location, destination: Location, options?: { product?: string }): string {
  const params = new URLSearchParams({
    pickup_lat: origin.lat.toString(),
    pickup_lng: origin.lng.toString(),
    dropoff_lat: destination.lat.toString(),
    dropoff_lng: destination.lng.toString()
  });
  
  if (origin.address) params.append('pickup_address', origin.address);
  if (destination.address) params.append('dropoff_address', destination.address);
  
  return `careem://booking?${params.toString()}`;
}

function generateBoltDeepLink(origin: Location, destination: Location): string {
  const params = new URLSearchParams({
    pickup_lat: origin.lat.toString(),
    pickup_lng: origin.lng.toString(),
    dropoff_lat: destination.lat.toString(),
    dropoff_lng: destination.lng.toString()
  });
  
  return `bolt://ride?${params.toString()}`;
}

function generateInDriveDeepLink(origin: Location, destination: Location): string {
  const params = new URLSearchParams({
    pickup_lat: origin.lat.toString(),
    pickup_lng: origin.lng.toString(),
    dropoff_lat: destination.lat.toString(),
    dropoff_lng: destination.lng.toString()
  });
  
  return `indrive://createorder?${params.toString()}`;
}

function generateDiDiDeepLink(origin: Location, destination: Location): string {
  return `didiglobal://passenger?fromlat=${origin.lat}&fromlng=${origin.lng}&tolat=${destination.lat}&tolng=${destination.lng}`;
}

function generateSwvlDeepLink(origin: Location, destination: Location): string {
  return `swvl://book?from_lat=${origin.lat}&from_lng=${origin.lng}&to_lat=${destination.lat}&to_lng=${destination.lng}`;
}

// Universal link generator with fallbacks
export function generateUniversalLink(
  provider: Provider,
  origin: Location,
  destination: Location
): { deepLink: string; webFallback: string; appStore: { ios: string; android: string } } {
  const config = PROVIDER_CONFIG[provider];
  const deepLink = generateDeepLink(provider, origin, destination);
  
  return {
    deepLink,
    webFallback: config.webFallback,
    appStore: {
      ios: config.iosAppStore,
      android: config.androidPlayStore
    }
  };
}
```

---

## 🛣️ API ROUTES

### Ride Estimate API

```typescript
// src/app/api/rides/estimate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { pricingEngine, Location } from '@/lib/pricing/engine';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { calculateDistance, estimateDuration } from '@/lib/maps/google';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const body = await request.json();
    const { origin, destination } = body as {
      origin: Location;
      destination: Location;
    };
    
    // Validate input
    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
      return NextResponse.json(
        { error: 'Invalid origin or destination' },
        { status: 400 }
      );
    }
    
    // Calculate route info
    const distanceKm = await calculateDistance(origin, destination);
    const durationMin = estimateDuration(distanceKm, origin.city);
    
    // Get all prices
    const offers = await pricingEngine.getAllPrices(origin, destination);
    
    // Create ride request record
    const rideRequest = await prisma.rideRequest.create({
      data: {
        userId: session?.user?.id || 'anonymous',
        pickupLat: origin.lat,
        pickupLng: origin.lng,
        pickupAddress: origin.address || '',
        dropoffLat: destination.lat,
        dropoffLng: destination.lng,
        dropoffAddress: destination.address || '',
        distanceKm,
        durationMin,
        status: 'SEARCHING',
        offers: {
          create: offers.map(offer => ({
            provider: offer.provider,
            product: offer.product,
            price: offer.price,
            currency: offer.currency,
            pricingSource: offer.source,
            confidence: offer.confidence,
            baseFare: offer.breakdown.baseFare,
            distanceFare: offer.breakdown.distanceFare,
            timeFare: offer.breakdown.timeFare,
            bookingFee: offer.breakdown.bookingFee,
            surgeMultiplier: offer.surgeMultiplier,
            isSurge: offer.isSurge,
            isRecommended: offer.isRecommended || false,
            recommendReason: offer.recommendReason,
            deepLink: offer.deepLink
          }))
        }
      },
      include: {
        offers: true
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        requestId: rideRequest.id,
        route: {
          distanceKm: Math.round(distanceKm * 10) / 10,
          durationMin: Math.round(durationMin),
          origin,
          destination
        },
        offers: offers.map(offer => ({
          provider: offer.provider,
          product: offer.product,
          price: offer.price,
          currency: offer.currency,
          source: offer.source,
          confidence: Math.round(offer.confidence * 100),
          breakdown: offer.breakdown,
          surge: {
            active: offer.isSurge,
            multiplier: offer.surgeMultiplier
          },
          deepLink: offer.deepLink,
          recommendation: offer.isRecommended ? {
            recommended: true,
            reason: offer.recommendReason
          } : null
        }))
      }
    });
    
  } catch (error) {
    console.error('Estimate error:', error);
    return NextResponse.json(
      { error: 'Failed to get estimates' },
      { status: 500 }
    );
  }
}
```

### Admin Pricing API

```typescript
// src/app/api/pricing/formulas/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { pricingEngine } from '@/lib/pricing/engine';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - List all formulas
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const formulas = await prisma.pricingFormula.findMany({
    orderBy: [{ provider: 'asc' }, { product: 'asc' }]
  });
  
  return NextResponse.json({
    success: true,
    data: formulas
  });
}

// POST - Create or update formula
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  const { provider, product, baseFare, perKm, perMinute, bookingFee, minFare } = body;
  
  // Validate
  if (!provider || !product) {
    return NextResponse.json(
      { error: 'Provider and product are required' },
      { status: 400 }
    );
  }
  
  // Upsert formula
  const formula = await prisma.pricingFormula.upsert({
    where: {
      provider_product: { provider, product }
    },
    update: {
      baseFare: baseFare || 0,
      perKm: perKm || 0,
      perMinute: perMinute || 0,
      bookingFee: bookingFee || 0,
      minFare: minFare || 0,
      source: 'manual',
      updatedAt: new Date()
    },
    create: {
      provider,
      product,
      baseFare: baseFare || 0,
      perKm: perKm || 0,
      perMinute: perMinute || 0,
      bookingFee: bookingFee || 0,
      minFare: minFare || 0,
      source: 'manual'
    }
  });
  
  // Reload formulas in engine
  await pricingEngine.loadFormulas();
  
  return NextResponse.json({
    success: true,
    message: `Formula updated for ${provider} - ${product}`,
    data: formula
  });
}

// DELETE - Delete formula
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');
  const product = searchParams.get('product');
  
  if (!provider || !product) {
    return NextResponse.json(
      { error: 'Provider and product are required' },
      { status: 400 }
    );
  }
  
  await prisma.pricingFormula.delete({
    where: {
      provider_product: { provider: provider as any, product }
    }
  });
  
  await pricingEngine.loadFormulas();
  
  return NextResponse.json({
    success: true,
    message: `Formula deleted for ${provider} - ${product}`
  });
}
```

### Reload Formulas API

```typescript
// src/app/api/pricing/reload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { pricingEngine } from '@/lib/pricing/engine';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  await pricingEngine.loadFormulas();
  
  return NextResponse.json({
    success: true,
    message: 'Pricing formulas reloaded successfully',
    timestamp: new Date().toISOString()
  });
}
```

---

## 🖥️ FRONTEND COMPONENTS

### Main Ride Search Component

```tsx
// src/components/rides/RideSearchForm.tsx

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, Navigation, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRideEstimate } from '@/hooks/useRideEstimate';
import { LocationPicker } from '@/components/common/LocationPicker';
import { PriceComparisonCard } from './PriceComparisonCard';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

export function RideSearchForm() {
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  
  const { estimates, isLoading, error, getEstimates } = useRideEstimate();
  
  const handleSearch = async () => {
    if (!origin || !destination) return;
    
    await getEstimates({
      origin: { lat: origin.lat, lng: origin.lng, address: origin.address },
      destination: { lat: destination.lat, lng: destination.lng, address: destination.address }
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-800">
          🚗 احجز رحلتك
        </h2>
        
        {/* Origin */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">
            من أين؟
          </label>
          <LocationPicker
            value={origin}
            onChange={setOrigin}
            placeholder="موقع الانطلاق"
            icon={<MapPin className="w-5 h-5 text-green-500" />}
          />
        </div>
        
        {/* Destination */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">
            إلى أين؟
          </label>
          <LocationPicker
            value={destination}
            onChange={setDestination}
            placeholder="الوجهة"
            icon={<Navigation className="w-5 h-5 text-red-500" />}
          />
        </div>
        
        {/* Search Button */}
        <Button
          onClick={handleSearch}
          disabled={!origin || !destination || isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              جاري البحث...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              قارن الأسعار
            </>
          )}
        </Button>
      </div>
      
      {/* Results */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">
          {error}
        </div>
      )}
      
      {estimates && (
        <div className="space-y-4">
          {/* Route Info */}
          <div className="bg-gray-50 rounded-xl p-4 flex justify-between text-sm">
            <span>
              📍 المسافة: <strong>{estimates.route.distanceKm} كم</strong>
            </span>
            <span>
              ⏱️ الوقت المتوقع: <strong>{estimates.route.durationMin} دقيقة</strong>
            </span>
          </div>
          
          {/* Offers */}
          <div className="space-y-3">
            {estimates.offers.map((offer, index) => (
              <PriceComparisonCard
                key={`${offer.provider}-${offer.product}`}
                offer={offer}
                rank={index + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Price Comparison Card

```tsx
// src/components/rides/PriceComparisonCard.tsx

'use client';

import { useState } from 'react';
import { Star, ChevronDown, ExternalLink, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PriceOffer {
  provider: string;
  product: string;
  price: number;
  currency: string;
  source: string;
  confidence: number;
  breakdown: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    bookingFee: number;
    surgeAmount: number;
  };
  surge: {
    active: boolean;
    multiplier: number;
  };
  deepLink: string;
  recommendation?: {
    recommended: boolean;
    reason: string;
  };
}

interface Props {
  offer: PriceOffer;
  rank: number;
}

const PROVIDER_LOGOS: Record<string, string> = {
  UBER: '/providers/uber.svg',
  CAREEM: '/providers/careem.svg',
  BOLT: '/providers/bolt.svg',
  INDRIVE: '/providers/indrive.svg',
  DIDI: '/providers/didi.svg',
  SWVL: '/providers/swvl.svg'
};

const PROVIDER_COLORS: Record<string, string> = {
  UBER: 'bg-black',
  CAREEM: 'bg-green-500',
  BOLT: 'bg-green-400',
  INDRIVE: 'bg-green-600',
  DIDI: 'bg-orange-500',
  SWVL: 'bg-red-500'
};

export function PriceComparisonCard({ offer, rank }: Props) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  const isRecommended = offer.recommendation?.recommended;
  const isCheapest = rank === 1;
  
  const handleBook = () => {
    // Track click
    fetch('/api/rides/track-click', {
      method: 'POST',
      body: JSON.stringify({ provider: offer.provider, product: offer.product })
    });
    
    // Open deep link
    window.location.href = offer.deepLink;
  };
  
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-md overflow-hidden transition-all',
        isRecommended && 'ring-2 ring-purple-500 shadow-purple-100'
      )}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm py-2 px-4 flex items-center gap-2">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span>الخيار الأمثل - {offer.recommendation?.reason}</span>
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Provider Info */}
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              PROVIDER_COLORS[offer.provider] || 'bg-gray-200'
            )}>
              <img
                src={PROVIDER_LOGOS[offer.provider]}
                alt={offer.provider}
                className="w-8 h-8"
              />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{offer.product}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {offer.surge.active && (
                  <span className="flex items-center gap-1 text-orange-500">
                    <Zap className="w-3 h-3" />
                    ذروة {offer.surge.multiplier}x
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  دقة {offer.confidence}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Price */}
          <div className="text-left">
            <div className="text-2xl font-bold text-gray-800">
              {offer.price.toFixed(0)}
              <span className="text-sm font-normal text-gray-500 mr-1">
                {offer.currency}
              </span>
            </div>
            {isCheapest && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                الأرخص
              </span>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Button
            onClick={handleBook}
            className={cn(
              'flex-1',
              isRecommended
                ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                : 'bg-gray-800'
            )}
          >
            احجز الآن
            <ExternalLink className="w-4 h-4 mr-2" />
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="px-3"
          >
            <ChevronDown className={cn(
              'w-4 h-4 transition-transform',
              showBreakdown && 'rotate-180'
            )} />
          </Button>
        </div>
        
        {/* Price Breakdown */}
        {showBreakdown && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">السعر الأساسي</span>
              <span>{offer.breakdown.baseFare.toFixed(2)} ج.م</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">تكلفة المسافة</span>
              <span>{offer.breakdown.distanceFare.toFixed(2)} ج.م</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">تكلفة الوقت</span>
              <span>{offer.breakdown.timeFare.toFixed(2)} ج.م</span>
            </div>
            {offer.breakdown.bookingFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">رسوم الحجز</span>
                <span>{offer.breakdown.bookingFee.toFixed(2)} ج.م</span>
              </div>
            )}
            {offer.breakdown.surgeAmount > 0 && (
              <div className="flex justify-between text-orange-500">
                <span>رسوم الذروة</span>
                <span>+{offer.breakdown.surgeAmount.toFixed(2)} ج.م</span>
              </div>
            )}
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>الإجمالي</span>
              <span>{offer.price.toFixed(2)} ج.م</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🔧 ADMIN DASHBOARD

### Pricing Dashboard Page

```tsx
// src/app/admin/pricing/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { 
  RefreshCw, Plus, Settings, TestTube, 
  CheckCircle, AlertCircle, Clock 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormulaEditor } from '@/components/admin/FormulaEditor';

interface Formula {
  id: string;
  provider: string;
  product: string;
  baseFare: number;
  perKm: number;
  perMinute: number;
  bookingFee: number;
  minFare: number;
  accuracyR2: number | null;
  source: string;
  updatedAt: string;
}

export default function PricingDashboardPage() {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  
  useEffect(() => {
    loadFormulas();
  }, []);
  
  const loadFormulas = async () => {
    setLoading(true);
    const res = await fetch('/api/pricing/formulas');
    const data = await res.json();
    setFormulas(data.data || []);
    setLoading(false);
  };
  
  const handleReload = async () => {
    const res = await fetch('/api/pricing/reload', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      alert('تم إعادة تحميل المعادلات بنجاح');
      loadFormulas();
    }
  };
  
  const getAccuracyBadge = (accuracy: number | null) => {
    if (!accuracy) return <span className="text-gray-400">غير محدد</span>;
    
    const pct = accuracy * 100;
    if (pct >= 90) {
      return (
        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          {pct.toFixed(1)}%
        </span>
      );
    } else if (pct >= 80) {
      return (
        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-sm flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {pct.toFixed(1)}%
        </span>
      );
    } else {
      return (
        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {pct.toFixed(1)}%
        </span>
      );
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            ⚙️ إدارة محرك التسعير
          </h1>
          <p className="text-gray-500">
            إدارة ومراقبة خوارزميات التسعير لجميع المزودين
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReload}>
            <RefreshCw className="w-4 h-4 ml-2" />
            إعادة التحميل
          </Button>
          <Button onClick={() => { setSelectedFormula(null); setShowEditor(true); }}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة معادلة
          </Button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-purple-600">
            {formulas.length}
          </div>
          <div className="text-gray-500 text-sm">معادلات نشطة</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-green-600">
            {formulas.filter(f => (f.accuracyR2 || 0) >= 0.9).length}
          </div>
          <div className="text-gray-500 text-sm">دقة عالية (90%+)</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-yellow-600">
            {formulas.filter(f => f.source === 'manual').length}
          </div>
          <div className="text-gray-500 text-sm">تحديث يدوي</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-blue-600">90</div>
          <div className="text-gray-500 text-sm flex items-center gap-1">
            <Clock className="w-3 h-3" />
            يوم للتحديث القادم
          </div>
        </div>
      </div>
      
      {/* Formulas Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right p-4 font-medium text-gray-600">المزود</th>
              <th className="text-right p-4 font-medium text-gray-600">المنتج</th>
              <th className="text-right p-4 font-medium text-gray-600">السعر الأساسي</th>
              <th className="text-right p-4 font-medium text-gray-600">سعر/كم</th>
              <th className="text-right p-4 font-medium text-gray-600">سعر/دقيقة</th>
              <th className="text-right p-4 font-medium text-gray-600">الدقة</th>
              <th className="text-right p-4 font-medium text-gray-600">المصدر</th>
              <th className="text-right p-4 font-medium text-gray-600">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {formulas.map(formula => (
              <tr key={formula.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-bold">{formula.provider}</td>
                <td className="p-4">{formula.product}</td>
                <td className="p-4">{formula.baseFare} ج.م</td>
                <td className="p-4">{formula.perKm} ج.م</td>
                <td className="p-4">{formula.perMinute} ج.م</td>
                <td className="p-4">{getAccuracyBadge(formula.accuracyR2)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    formula.source === 'discovered' 
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {formula.source === 'discovered' ? 'مُكتشف' : 'يدوي'}
                  </span>
                </td>
                <td className="p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setSelectedFormula(formula); setShowEditor(true); }}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Formula Editor Modal */}
      {showEditor && (
        <FormulaEditor
          formula={selectedFormula}
          onClose={() => setShowEditor(false)}
          onSave={() => { setShowEditor(false); loadFormulas(); }}
        />
      )}
    </div>
  );
}
```

---

## 🌐 ENVIRONMENT VARIABLES

```env
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/xchange_transport"

# Redis
REDIS_URL="redis://localhost:6379"

# Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google Maps
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Uber API (Official)
UBER_CLIENT_ID="your-uber-client-id"
UBER_CLIENT_SECRET="your-uber-client-secret"
UBER_SERVER_TOKEN="your-uber-server-token"

# Shipping APIs
BOSTA_API_KEY="your-bosta-api-key"
ARAMEX_USERNAME="your-aramex-username"
ARAMEX_PASSWORD="your-aramex-password"
ARAMEX_ACCOUNT_NUMBER="your-account-number"

# Payments
PAYMOB_API_KEY="your-paymob-api-key"
PAYMOB_INTEGRATION_ID="your-integration-id"
FAWRY_MERCHANT_CODE="your-merchant-code"
FAWRY_SECURITY_KEY="your-security-key"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Xchange Transport"

# Pricing Config
PRICING_FORMULAS_PATH="./config/pricing_formulas.json"
SURGE_CACHE_TTL_SECONDS="300"
AUTO_UPDATE_INTERVAL_DAYS="90"
```

---

## 🚀 SETUP COMMANDS

```bash
# 1. Clone repository
git clone https://github.com/AiSchool-Admin/xchange-transport.git
cd xchange-transport

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your values

# 4. Setup database
npx prisma migrate dev --name init
npx prisma generate

# 5. Seed initial pricing formulas
npx prisma db seed

# 6. Run development server
npm run dev

# 7. Build for production
npm run build
npm start
```

---

## 📝 IMPLEMENTATION NOTES

### Priority Order
1. **Database Schema** - Setup Prisma and run migrations
2. **Pricing Engine** - Core pricing logic with formula management
3. **API Routes** - Estimate and admin APIs
4. **Frontend** - Ride search and comparison UI
5. **Admin Dashboard** - Formula management interface
6. **Deep Links** - Provider integration
7. **Xchange Integration** - Cross-marketplace features

### Key Points
- All prices must be **100% accurate** - use discovered formulas, not estimates
- Admin can update formulas **manually** when providers change prices
- System should **reload formulas** without restart
- Support **Arabic language** throughout the UI
- **Mobile-first** responsive design
- **Deep links** must work on both iOS and Android

### Formula Update Process
1. Admin receives notification of price change from provider
2. Admin logs into dashboard
3. Admin updates formula values (baseFare, perKm, perMinute, etc.)
4. System reloads formulas automatically
5. New prices reflected immediately for all users

---

*Xchange Transport - Building Egypt's Smartest Ride Aggregator*

*December 2024*
