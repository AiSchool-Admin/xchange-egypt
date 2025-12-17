# 🤖 مساعد التفاوض الذكي - AI Negotiation Assistant
## Xchange AI-Powered Negotiation System

**الأولوية:** 🔥 عالية جداً
**التأثير على الإيرادات:** +25% conversion rate
**صعوبة التطوير:** متوسطة
**الوقت المقدر:** 8-10 أسابيع

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [المواصفات التقنية](#المواصفات-التقنية)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [خوارزميات AI](#خوارزميات-ai)
6. [User Stories](#user-stories)
7. [Implementation Guide](#implementation-guide)
8. [Security & Privacy](#security-privacy)

---

## 1. نظرة عامة {#نظرة-عامة}

### 1.1 المشكلة
- **40%** من الصفقات تفشل بسبب عدم الوصول لاتفاق سعري
- المستخدمون لا يعرفون السعر العادل للتفاوض
- التفاوض يستغرق وقتاً طويلاً (معدل 5-7 أيام)
- عدم وجود وسيط محايد يساعد الطرفين

### 1.2 الحل
مساعد ذكي يعمل كـ **وسيط محايد** يساعد البائع والمشتري على:
- فهم السعر العادل للمنتج
- تقديم عروض منطقية
- الوصول لاتفاق سريع وعادل
- تحسين تجربة التفاوض

### 1.3 القيمة المضافة

```
┌─────────────────────────────────────────────────────────────┐
│                      فوائد للمستخدمين                       │
├─────────────────────────────────────────────────────────────┤
│  للمشتري:                                                   │
│  ✅ معرفة السعر العادل                                      │
│  ✅ نصائح تفاوضية ذكية                                      │
│  ✅ توفير المال (معدل 8-12%)                                │
│  ✅ توفير الوقت (50% أسرع)                                  │
│                                                              │
│  للبائع:                                                     │
│  ✅ بيع أسرع (معدل 3 أيام بدلاً من 7)                       │
│  ✅ سعر عادل (لا تفريط)                                     │
│  ✅ تقليل المساومات العشوائية                               │
│                                                              │
│  للمنصة:                                                     │
│  ✅ زيادة معدل إتمام الصفقات +25%                           │
│  ✅ تحسين تجربة المستخدم                                     │
│  ✅ ميزة تنافسية فريدة                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. المواصفات التقنية {#المواصفات-التقنية}

### 2.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐         ┌──────────────┐                     │
│  │  User    │────────→│  Next.js     │                     │
│  │ (Mobile/ │         │  Frontend    │                     │
│  │  Web)    │         └──────┬───────┘                     │
│  └──────────┘                │                              │
│                               ▼                              │
│                    ┌──────────────────┐                     │
│                    │  API Gateway     │                     │
│                    │  (Express)       │                     │
│                    └────────┬─────────┘                     │
│                             │                                │
│        ┌────────────────────┼──────────────────┐            │
│        ▼                    ▼                  ▼            │
│  ┌──────────┐      ┌──────────────┐    ┌──────────┐       │
│  │Negotiation│      │  AI Engine   │    │Pricing   │       │
│  │ Service  │      │  (GPT-4 +    │    │Service   │       │
│  │          │      │   Custom ML) │    │          │       │
│  └────┬─────┘      └──────┬───────┘    └────┬─────┘       │
│       │                   │                  │              │
│       └───────────┬───────┴──────────────────┘              │
│                   ▼                                          │
│        ┌──────────────────────┐                             │
│        │   PostgreSQL DB      │                             │
│        │  + Redis Cache       │                             │
│        └──────────────────────┘                             │
│                   │                                          │
│                   ▼                                          │
│        ┌──────────────────────┐                             │
│        │  External Services   │                             │
│        ├──────────────────────┤                             │
│        │ • OpenAI GPT-4       │                             │
│        │ • Sentiment Analysis │                             │
│        │ • Translation API    │                             │
│        │ • Notification Svc   │                             │
│        └──────────────────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js 14, TypeScript, TailwindCSS | UI/UX |
| **Backend** | Node.js, Express, TypeScript | API Server |
| **AI/ML** | OpenAI GPT-4 Turbo, Custom ML models | Negotiation Intelligence |
| **Database** | PostgreSQL 16 | Primary data storage |
| **Cache** | Redis 7 | Real-time session data |
| **Queue** | Bull (Redis-based) | Async AI processing |
| **NLP** | spaCy, Transformers | Arabic text analysis |
| **Analytics** | Mixpanel, Custom ML | User behavior tracking |

### 2.3 System Requirements

**Performance:**
- Response time: < 1.5 seconds للردود الذكية
- Concurrent users: 10,000+ simultaneous negotiations
- AI processing: < 3 seconds لتحليل العرض

**Scalability:**
- Horizontal scaling للـ AI service
- Redis cluster للـ sessions
- PostgreSQL read replicas

---

## 3. Database Schema {#database-schema}

### 3.1 Prisma Schema

```prisma
// ============================================
// AI NEGOTIATION ASSISTANT SCHEMA
// ============================================

enum NegotiationStatus {
  INITIATED        // بدأ التفاوض
  ONGOING          // جاري التفاوض
  OFFER_MADE       // تم تقديم عرض
  COUNTER_OFFERED  // عرض مضاد
  AGREED           // تم الاتفاق
  REJECTED         // مرفوض
  EXPIRED          // منتهي
  COMPLETED        // اكتمل البيع
}

enum MessageSender {
  BUYER            // المشتري
  SELLER           // البائع
  AI_ASSISTANT     // المساعد الذكي
  SYSTEM           // النظام
}

enum OfferType {
  INITIAL          // عرض أولي
  COUNTER          // عرض مضاد
  FINAL            // عرض نهائي
  AI_SUGGESTED     // اقتراح من AI
}

enum NegotiationStrategy {
  AGGRESSIVE       // متشدد في السعر
  BALANCED         // متوازن
  FLEXIBLE         // مرن
  QUICK_SALE       // بيع سريع
}

model NegotiationSession {
  id                    String              @id @default(uuid())

  // Parties
  listingId             String
  listing               Listing             @relation(fields: [listingId], references: [id])
  buyerId               String
  buyer                 User                @relation("NegotiationBuyer", fields: [buyerId], references: [id])
  sellerId              String
  seller                User                @relation("NegotiationSeller", fields: [sellerId], references: [id])

  // Session Details
  status                NegotiationStatus   @default(INITIATED)

  // Initial Context
  listingPrice          Float               // السعر المعلن
  buyerInitialOffer     Float?              // أول عرض من المشتري

  // AI Analysis
  fairMarketValue       Float               // القيمة السوقية العادلة (من AI)
  recommendedPrice      Float               // السعر الموصى به
  priceRange            Json                // {min, max, optimal}
  aiConfidence          Float               // ثقة AI (0-100)

  // Negotiation Dynamics
  currentOffer          Float?              // العرض الحالي
  lastOfferedBy         String?             // آخر من قدم عرض (buyerId or sellerId)
  offerCount            Int                 @default(0)

  // AI Strategy
  buyerStrategy         NegotiationStrategy @default(BALANCED)
  sellerStrategy        NegotiationStrategy @default(BALANCED)

  // Sentiment Analysis
  buyerSentiment        String?             // positive, neutral, negative
  sellerSentiment       String?
  negotiationTone       String?             // friendly, tense, professional

  // Success Prediction
  successProbability    Float?              // احتمالية نجاح الصفقة (0-100)
  suggestedNextAction   String?             // الخطوة التالية المقترحة

  // Messages & Offers
  messages              NegotiationMessage[]
  offers                NegotiationOffer[]

  // Timestamps
  startedAt             DateTime            @default(now())
  lastActivityAt        DateTime            @default(now())
  agreedAt              DateTime?
  expiresAt             DateTime            // تنتهي بعد 72 ساعة من آخر نشاط
  completedAt           DateTime?

  // Metadata
  metadata              Json?               // بيانات إضافية

  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  @@index([listingId])
  @@index([buyerId])
  @@index([sellerId])
  @@index([status])
  @@index([lastActivityAt])
}

model NegotiationMessage {
  id                  String              @id @default(uuid())

  sessionId           String
  session             NegotiationSession  @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  // Message Details
  sender              MessageSender
  senderUserId        String?             // null if AI or System
  senderUser          User?               @relation(fields: [senderUserId], references: [id])

  content             String              // النص
  contentAr           String?             // ترجمة عربية

  // AI Generation (if AI message)
  isAIGenerated       Boolean             @default(false)
  aiPrompt            String?             // البرومبت المستخدم
  aiModel             String?             // gpt-4-turbo
  aiConfidence        Float?

  // Sentiment
  sentiment           String?             // positive, negative, neutral
  sentimentScore      Float?              // -1 to +1

  // Metadata
  metadata            Json?               // {translation, alternatives}

  createdAt           DateTime            @default(now())

  @@index([sessionId])
  @@index([sender])
  @@index([createdAt])
}

model NegotiationOffer {
  id                  String              @id @default(uuid())

  sessionId           String
  session             NegotiationSession  @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  // Offer Details
  offerType           OfferType
  offeredBy           String              // userId (buyer or seller)
  offerer             User                @relation(fields: [offeredBy], references: [id])

  amount              Float               // المبلغ المعروض
  previousAmount      Float?              // العرض السابق
  changePercent       Float?              // نسبة التغيير

  // AI Analysis of this offer
  isFairOffer         Boolean?            // هل العرض عادل؟
  deviationFromFair   Float?              // الانحراف عن السعر العادل (%)
  aiRecommendation    String?             // accept, reject, counter
  aiReasoning         String?             // سبب التوصية

  // Offer Context
  message             String?             // رسالة مرفقة مع العرض
  conditions          String?             // شروط (cash only, no shipping, etc.)

  // Response
  isAccepted          Boolean?
  isCountered         Boolean?
  counterOfferId      String?             // العرض المضاد

  // Timestamps
  expiresAt           DateTime?           // العرض صالح حتى
  acceptedAt          DateTime?
  rejectedAt          DateTime?

  createdAt           DateTime            @default(now())

  @@index([sessionId])
  @@index([offeredBy])
  @@index([offerType])
  @@index([createdAt])
}

model NegotiationInsight {
  id                  String              @id @default(uuid())

  sessionId           String              @unique

  // Market Analysis
  similarListings     Json                // قوائم مشابهة
  avgMarketPrice      Float
  marketDemand        String              // HIGH, MEDIUM, LOW

  // User Profiles
  buyerProfile        Json                // {avgSpent, negotiationStyle, successRate}
  sellerProfile       Json                // {avgDiscount, responseTime, flexibility}

  // Predictions
  predictedFinalPrice Float?              // السعر النهائي المتوقع
  predictedDuration   Int?                // المدة المتوقعة (دقائق)
  dealBreakers        String[]            // عوامل قد تفشل الصفقة

  // Recommendations
  buyerTips           String[]            // نصائح للمشتري
  sellerTips          String[]            // نصائح للبائع

  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
}

// Analytics Table
model NegotiationAnalytics {
  id                  String              @id @default(uuid())

  sessionId           String              @unique

  // Performance Metrics
  totalMessages       Int
  totalOffers         Int
  responseTimeAvg     Int                 // متوسط وقت الرد (ثواني)
  negotiationDuration Int                 // المدة الكلية (دقائق)

  // Price Dynamics
  startPrice          Float
  finalPrice          Float?
  priceChangePercent  Float?
  numberOfCounters    Int

  // Outcomes
  wasSuccessful       Boolean
  failureReason       String?

  // AI Performance
  aiMessagesCount     Int
  aiAccuracyScore     Float?              // دقة توقعات AI
  userSatisfaction    Float?              // من feedback

  createdAt           DateTime            @default(now())

  @@index([wasSuccessful])
  @@index([createdAt])
}
```

---

## 4. API Endpoints {#api-endpoints}

### 4.1 Negotiation Session Endpoints

#### **POST /api/negotiations/start**
بدء جلسة تفاوض جديدة

```typescript
// Request
{
  "listingId": "uuid",
  "initialOffer": 8000,        // اختياري
  "message": "هل ممكن 8 آلاف؟"
}

// Response
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "status": "INITIATED",
    "fairMarketValue": 8500,
    "recommendedPrice": 8200,
    "priceRange": {
      "min": 7800,
      "max": 9000,
      "optimal": 8200
    },
    "aiConfidence": 87.5,
    "aiMessage": "بناءً على تحليل السوق، السعر العادل لهذا الموبايل هو 8500 ج.م. عرضك بـ 8000 ج.م معقول ويمكن التفاوض عليه. هل تريد مني إرسال العرض للبائع؟"
  }
}
```

#### **GET /api/negotiations/:sessionId**
الحصول على تفاصيل جلسة تفاوض

```typescript
// Response
{
  "success": true,
  "data": {
    "session": {
      "id": "uuid",
      "status": "ONGOING",
      "listing": {...},
      "buyer": {...},
      "seller": {...},
      "currentOffer": 8200,
      "fairMarketValue": 8500,
      "messages": [...],
      "offers": [...]
    },
    "insights": {
      "successProbability": 78,
      "suggestedNextAction": "counter_with_8300",
      "buyerTips": [
        "البائع عادة يقبل 5-8% أقل من السعر المعلن",
        "أفضل وقت للتفاوض: المساء (استجابة أسرع)"
      ]
    }
  }
}
```

#### **POST /api/negotiations/:sessionId/offer**
تقديم عرض جديد

```typescript
// Request
{
  "amount": 8300,
  "message": "آخر سعر 8300 ج.م نقداً",
  "conditions": "cash_only"
}

// Response
{
  "success": true,
  "data": {
    "offer": {...},
    "aiAnalysis": {
      "isFairOffer": true,
      "deviationFromFair": -2.4,  // 2.4% أقل من العادل
      "recommendation": "LIKELY_ACCEPTED",
      "reasoning": "هذا العرض قريب جداً من السعر العادل. احتمالية القبول 82%.",
      "suggestedResponse": "عرضك ممتاز! سأرسله للبائع الآن."
    }
  }
}
```

#### **POST /api/negotiations/:sessionId/message**
إرسال رسالة في التفاوض

```typescript
// Request
{
  "content": "ممكن تنزل كمان 100 جنيه؟"
}

// Response
{
  "success": true,
  "data": {
    "message": {...},
    "aiResponse": {
      "content": "فهمت، تريد خصم إضافي 100 ج.م. دعني أقترح طريقة أفضل للتفاوض...",
      "suggestions": [
        {
          "type": "counter_offer",
          "amount": 8200,
          "reason": "قريب من السعر العادل وأكثر قبولاً"
        }
      ]
    }
  }
}
```

#### **POST /api/negotiations/:sessionId/accept**
قبول عرض

```typescript
// Request
{
  "offerId": "uuid"
}

// Response
{
  "success": true,
  "data": {
    "session": {
      "status": "AGREED",
      "finalPrice": 8300,
      "agreedAt": "2024-12-17T10:30:00Z"
    },
    "nextSteps": {
      "action": "create_order",
      "message": "تهانينا! تم الاتفاق على 8300 ج.م. سننتقل الآن لإتمام عملية الشراء."
    }
  }
}
```

### 4.2 AI Assistant Endpoints

#### **POST /api/negotiations/:sessionId/ai-suggest**
طلب اقتراح من AI

```typescript
// Request
{
  "context": "البائع رفض عرضي بـ 8000، ماذا أفعل؟"
}

// Response
{
  "success": true,
  "data": {
    "suggestion": {
      "type": "counter_offer",
      "amount": 8300,
      "reasoning": "البائع معلن بـ 9000 ج.م. رفضه لـ 8000 يعني أنه مستعد للتفاوض لكن ليس بهذا القدر. اقتراحي:\n\n1. قدم عرض 8300 ج.م (8% خصم من المعلن)\n2. أضف شرط الدفع نقداً (جاذب للبائع)\n3. أظهر جديتك بسؤال عن موعد التسليم\n\nاحتمالية القبول: 75%",
      "messageTemplate": "تمام، أنا موافق على 8300 ج.م نقداً. متى ممكن أستلم الموبايل؟"
    }
  }
}
```

#### **POST /api/negotiations/:sessionId/analyze**
تحليل شامل للتفاوض

```typescript
// Response
{
  "success": true,
  "data": {
    "analysis": {
      "currentState": {
        "phase": "mid_negotiation",
        "momentum": "positive",
        "priceGap": 500,
        "gapPercent": 5.9
      },
      "marketContext": {
        "similarListings": 12,
        "avgPrice": 8450,
        "demandLevel": "HIGH",
        "competitiveAdvantage": "السعر المعلن تنافسي"
      },
      "userBehavior": {
        "buyerStyle": "BALANCED",
        "sellerStyle": "FLEXIBLE",
        "compatibilityScore": 82
      },
      "predictions": {
        "likelyFinalPrice": 8300,
        "estimatedDuration": "15-30 minutes",
        "successProbability": 78
      },
      "recommendations": {
        "buyer": [
          "قدم 8300 ج.م كعرض نهائي",
          "أكد على الدفع الفوري",
          "اطلب معاينة الجهاز قبل الشراء"
        ],
        "seller": [
          "اقبل 8300 ج.م إذا الدفع نقدي",
          "البيع السريع أفضل من الانتظار",
          "احتمال عدم وجود عرض أفضل: 70%"
        ]
      }
    }
  }
}
```

### 4.3 Analytics Endpoints

#### **GET /api/negotiations/analytics/summary**
إحصائيات عامة للتفاوض

```typescript
// Response
{
  "success": true,
  "data": {
    "overall": {
      "totalSessions": 1543,
      "successfulSessions": 1157,
      "successRate": 75,
      "avgDuration": 32,  // minutes
      "avgDiscount": 7.8  // percent
    },
    "aiPerformance": {
      "predictionAccuracy": 84.2,
      "userSatisfaction": 4.6,  // out of 5
      "messagesGenerated": 8934,
      "acceptedSuggestions": 67  // percent
    }
  }
}
```

---

## 5. خوارزميات AI {#خوارزميات-ai}

### 5.1 Fair Market Value Calculation

```typescript
/**
 * حساب القيمة السوقية العادلة
 * باستخدام Multiple Linear Regression + Market Data
 */
interface FairValueInput {
  listing: Listing;
  marketData: MarketData;
  userContext: UserContext;
}

interface FairValueOutput {
  fairMarketValue: number;
  priceRange: { min: number; max: number; optimal: number };
  confidence: number;
  factors: PriceFactor[];
}

async function calculateFairMarketValue(
  input: FairValueInput
): Promise<FairValueOutput> {

  // 1. جمع البيانات المشابهة
  const comparables = await findComparableListings({
    category: input.listing.category,
    brand: input.listing.brand,
    model: input.listing.model,
    ageRange: [input.listing.age - 1, input.listing.age + 1],
    conditionRange: getSimilarConditions(input.listing.condition),
    locationRadius: 50  // km
  });

  // 2. حساب السعر الأساسي من Comparables
  const basePrice = calculateMedianPrice(comparables);

  // 3. تطبيق التعديلات
  let adjustedPrice = basePrice;
  const factors: PriceFactor[] = [];

  // Condition adjustment
  const conditionFactor = getConditionMultiplier(input.listing.condition);
  adjustedPrice *= conditionFactor;
  factors.push({
    name: 'condition',
    impact: (conditionFactor - 1) * 100,
    weight: 0.25
  });

  // Age/Depreciation
  const depreciationFactor = calculateDepreciation(
    input.listing.age,
    input.listing.category
  );
  adjustedPrice *= depreciationFactor;
  factors.push({
    name: 'depreciation',
    impact: (depreciationFactor - 1) * 100,
    weight: 0.20
  });

  // Market demand
  const demandFactor = calculateDemandFactor(
    comparables,
    input.marketData.supplyDemandRatio
  );
  adjustedPrice *= demandFactor;
  factors.push({
    name: 'market_demand',
    impact: (demandFactor - 1) * 100,
    weight: 0.15
  });

  // Location
  const locationFactor = getLocationMultiplier(input.listing.governorate);
  adjustedPrice *= locationFactor;
  factors.push({
    name: 'location',
    impact: (locationFactor - 1) * 100,
    weight: 0.10
  });

  // Seller reputation
  const reputationFactor = getSellerReputationFactor(input.listing.seller);
  adjustedPrice *= reputationFactor;
  factors.push({
    name: 'seller_reputation',
    impact: (reputationFactor - 1) * 100,
    weight: 0.10
  });

  // Urgency/Time on market
  const urgencyFactor = calculateUrgencyFactor(input.listing.createdAt);
  adjustedPrice *= urgencyFactor;
  factors.push({
    name: 'urgency',
    impact: (urgencyFactor - 1) * 100,
    weight: 0.10
  });

  // 4. حساب مدى الثقة
  const confidence = calculateConfidence({
    comparablesCount: comparables.length,
    dataQuality: assessDataQuality(comparables),
    marketVolatility: input.marketData.priceVolatility
  });

  // 5. حساب النطاق السعري
  const stdDev = calculateStandardDeviation(comparables.map(c => c.price));
  const priceRange = {
    min: Math.max(adjustedPrice - stdDev, adjustedPrice * 0.85),
    max: Math.min(adjustedPrice + stdDev, adjustedPrice * 1.15),
    optimal: adjustedPrice
  };

  return {
    fairMarketValue: Math.round(adjustedPrice),
    priceRange: {
      min: Math.round(priceRange.min),
      max: Math.round(priceRange.max),
      optimal: Math.round(priceRange.optimal)
    },
    confidence,
    factors
  };
}
```

### 5.2 Negotiation Strategy Selection

```typescript
/**
 * اختيار استراتيجية التفاوض المناسبة
 * باستخدام Reinforcement Learning + User Profiling
 */

enum Strategy {
  AGGRESSIVE = 'aggressive',      // خصم 15-20%
  BALANCED = 'balanced',          // خصم 8-12%
  FLEXIBLE = 'flexible',          // خصم 3-7%
  QUICK_SALE = 'quick_sale'       // قبول أول عرض معقول
}

interface UserProfile {
  userId: string;
  pastNegotiations: NegotiationHistory[];
  avgDiscount: number;
  avgDuration: number;
  successRate: number;
  preferredStrategy: Strategy;
  flexibility: number;  // 0-100
}

async function selectNegotiationStrategy(
  user: UserProfile,
  listing: Listing,
  marketConditions: MarketData
): Promise<Strategy> {

  // 1. تحليل سلوك المستخدم السابق
  const userBehavior = analyzeUserBehavior(user.pastNegotiations);

  // 2. تقييم ظروف السوق
  const marketScore = assessMarketConditions({
    demand: marketConditions.demandLevel,
    supply: marketConditions.availableListings,
    priceVolatility: marketConditions.volatility
  });

  // 3. تقييم عجلة البائع/المشتري
  const urgencyScore = assessUrgency({
    listingAge: listing.age,
    viewsCount: listing.viewsCount,
    inquiriesCount: listing.inquiriesCount,
    userHistory: user.pastNegotiations
  });

  // 4. ML Model Prediction
  const strategyScores = await mlModel.predict({
    features: {
      user_flexibility: user.flexibility,
      user_avg_discount: user.avgDiscount,
      market_demand: marketScore.demand,
      listing_age_days: listing.ageInDays,
      price_vs_market: listing.price / marketConditions.avgPrice,
      seller_urgency: urgencyScore
    }
  });

  // 5. اختيار الاستراتيجية الأفضل
  const bestStrategy = Object.entries(strategyScores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)[0][0];

  return bestStrategy as Strategy;
}
```

### 5.3 GPT-4 Integration للرسائل الذكية

```typescript
/**
 * توليد رسائل تفاوضية ذكية باستخدام GPT-4
 */

interface AIMessageRequest {
  sessionId: string;
  context: NegotiationContext;
  userIntent: string;
  tone: 'friendly' | 'professional' | 'assertive';
}

async function generateAIMessage(
  request: AIMessageRequest
): Promise<string> {

  const { context, userIntent, tone } = request;

  // بناء البرومبت
  const systemPrompt = `
أنت مساعد تفاوض ذكي في منصة Xchange لبيع وشراء المنتجات المستعملة في مصر.
دورك هو مساعدة المستخدمين على التفاوض بشكل عادل وفعّال.

قواعد مهمة:
1. استخدم اللغة العربية المصرية البسيطة
2. كن محايداً ومنصفاً للطرفين
3. ركز على الوصول لاتفاق win-win
4. استخدم البيانات والحقائق في توصياتك
5. كن مختصراً وواضحاً (لا تزيد عن 3-4 جمل)

النبرة المطلوبة: ${tone}
  `.trim();

  const userPrompt = `
السياق:
- المنتج: ${context.listing.title}
- السعر المعلن: ${context.listing.price} ج.م
- السعر العادل (AI): ${context.fairMarketValue} ج.م
- العرض الحالي: ${context.currentOffer || 'لا يوجد'} ج.م
- عدد العروض: ${context.offerCount}
- حالة التفاوض: ${context.status}

${userIntent === 'suggest_offer' ? `
المطلوب: اقترح عرضاً مناسباً للمشتري مع تبرير مقنع.
` : userIntent === 'respond_to_offer' ? `
المطلوب: ساعد البائع على الرد على عرض المشتري بـ ${context.currentOffer} ج.م
` : userIntent === 'encourage_acceptance' ? `
المطلوب: شجع ${context.targetUser} على قبول العرض الحالي مع توضيح الأسباب
` : `
المطلوب: ${userIntent}
`}

اكتب رسالة قصيرة ومقنعة:
  `.trim();

  // استدعاء GPT-4
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 200,
    presence_penalty: 0.3,
    frequency_penalty: 0.3
  });

  const aiMessage = response.choices[0].message.content.trim();

  // تحليل المشاعر للرسالة المولدة
  const sentiment = await analyzeSentiment(aiMessage);

  // حفظ في قاعدة البيانات
  await prisma.negotiationMessage.create({
    data: {
      sessionId: request.sessionId,
      sender: 'AI_ASSISTANT',
      content: aiMessage,
      isAIGenerated: true,
      aiPrompt: userPrompt,
      aiModel: 'gpt-4-turbo',
      sentiment: sentiment.label,
      sentimentScore: sentiment.score
    }
  });

  return aiMessage;
}
```

### 5.4 Success Probability Prediction

```typescript
/**
 * توقع احتمالية نجاح الصفقة
 * باستخدام Gradient Boosting (XGBoost)
 */

interface SuccessPredictionInput {
  priceGap: number;              // الفرق بين العرض والمطلوب
  offerCount: number;            // عدد العروض
  duration: number;              // مدة التفاوض (دقائق)
  buyerProfile: UserProfile;
  sellerProfile: UserProfile;
  marketConditions: MarketData;
  sentimentScore: number;        // -1 to +1
}

async function predictSuccessProbability(
  input: SuccessPredictionInput
): Promise<number> {

  // تحضير المميزات (Features)
  const features = {
    // Price features
    price_gap_percent: (input.priceGap / input.fairMarketValue) * 100,
    price_gap_absolute: input.priceGap,
    current_offer_vs_fair: input.currentOffer / input.fairMarketValue,

    // Negotiation dynamics
    offer_count: input.offerCount,
    duration_minutes: input.duration,
    avg_response_time: input.duration / (input.offerCount || 1),

    // User profiles
    buyer_success_rate: input.buyerProfile.successRate,
    seller_success_rate: input.sellerProfile.successRate,
    buyer_flexibility: input.buyerProfile.flexibility,
    seller_flexibility: input.sellerProfile.flexibility,

    // Market
    market_demand: input.marketConditions.demandScore,
    similar_listings_count: input.marketConditions.similarCount,

    // Sentiment
    overall_sentiment: input.sentimentScore,

    // Behavioral
    buyer_engagement: input.buyerProfile.avgMessagesPerNegotiation,
    seller_engagement: input.sellerProfile.avgMessagesPerNegotiation
  };

  // استخدام نموذج XGBoost المدرب
  const prediction = await xgboostModel.predict(features);

  // تحويل لنسبة مئوية (0-100)
  const probability = Math.round(prediction * 100);

  return probability;
}
```

### 5.5 Sentiment Analysis

```typescript
/**
 * تحليل المشاعر في الرسائل
 * Arabic Sentiment Analysis
 */

import { pipeline } from '@xenova/transformers';

let sentimentAnalyzer: any = null;

async function initSentimentAnalyzer() {
  if (!sentimentAnalyzer) {
    // نموذج مدرب على العربية
    sentimentAnalyzer = await pipeline(
      'sentiment-analysis',
      'CAMeL-Lab/bert-base-arabic-camelbert-msa-sentiment'
    );
  }
  return sentimentAnalyzer;
}

interface SentimentResult {
  label: 'positive' | 'negative' | 'neutral';
  score: number;  // -1 to +1
  confidence: number;  // 0 to 1
}

async function analyzeSentiment(text: string): Promise<SentimentResult> {
  const analyzer = await initSentimentAnalyzer();

  const result = await analyzer(text);

  // تحويل النتيجة
  const label = result[0].label.toLowerCase();
  const confidence = result[0].score;

  let score: number;
  if (label === 'positive') score = confidence;
  else if (label === 'negative') score = -confidence;
  else score = 0;

  return {
    label: label as 'positive' | 'negative' | 'neutral',
    score,
    confidence
  };
}

/**
 * تحليل نبرة المحادثة بالكامل
 */
async function analyzeConversationTone(
  messages: NegotiationMessage[]
): Promise<string> {

  const sentiments = await Promise.all(
    messages.map(msg => analyzeSentiment(msg.content))
  );

  const avgScore = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
  const variance = calculateVariance(sentiments.map(s => s.score));

  // تحديد النبرة
  if (avgScore > 0.3 && variance < 0.2) return 'friendly';
  if (avgScore < -0.3) return 'tense';
  if (variance > 0.5) return 'volatile';
  return 'professional';
}
```

---

## 6. User Stories {#user-stories}

### Story 1: المشتري يبدأ تفاوض
```
كـ مشتري
أريد أن أبدأ التفاوض على منتج
حتى أحصل على سعر أفضل

معايير القبول:
✅ يمكنني رؤية السعر العادل قبل التفاوض
✅ AI يقترح عليّ عرض مبدئي مناسب
✅ أستطيع تعديل العرض قبل الإرسال
✅ البائع يستلم إشعار فوري

المثال:
1. المستخدم يضغط "ابدأ التفاوض" على إعلان موبايل بـ 9000 ج.م
2. AI يحلل: "السعر العادل 8500 ج.م، اقترح البدء بـ 8000 ج.م"
3. المستخدم يوافق أو يعدل
4. الرسالة ترسل للبائع مع توصية AI
```

### Story 2: البائع يرد على عرض
```
كـ بائع
أريد الرد على عرض المشتري بذكاء
حتى لا أفقد البيع أو أبيع بأقل من القيمة

معايير القبول:
✅ أرى تحليل AI للعرض (عادل/منخفض/جيد)
✅ AI يقترح لي رد مناسب
✅ أستطيع قبول/رفض/تقديم عرض مضاد
✅ إذا رفضت، AI يساعدني أصيغ الرد

المثال:
1. البائع يستلم عرض 8000 ج.م على إعلان 9000 ج.م
2. AI: "العرض منخفض 11% عن العادل. اقترح عرض مضاد 8500 ج.م"
3. البائع يختار "عرض مضاد"
4. AI يكتب: "شكراً لاهتمامك! السعر معقول لكن آخر سعر 8500 ج.م نقداً"
```

### Story 3: التفاوض المتقدم
```
كـ مشتري/بائع
أريد مساعدة ذكية أثناء التفاوض
حتى أصل لأفضل نتيجة بسرعة

معايير القبول:
✅ AI يتابع سير التفاوض ويقدم نصائح
✅ يحذرني من العروض غير العادلة
✅ يشجعني على قبول العرض إذا كان جيداً
✅ يتوقع السعر النهائي المحتمل

المثال:
- بعد 3 عروض متبادلة، الفرق 300 ج.م فقط
- AI للمشتري: "العرض الحالي ممتاز! البائع مرن. احتمالية القبول 85%"
- AI للبائع: "عرض جيد والمشتري جاد. قبوله يوفر لك 5 أيام بحث عن مشتري آخر"
```

### Story 4: إنهاء الصفقة
```
كـ مستخدم (مشتري/بائع)
أريد إتمام الصفقة بسلاسة بعد الاتفاق
حتى أكمل البيع/الشراء بأمان

معايير القبول:
✅ عند قبول العرض، تحويل تلقائي لصفحة الطلب
✅ السعر المتفق عليه يثبت تلقائياً
✅ شروط التفاوض تنقل للطلب (نقدي/شحن/إلخ)
✅ حفظ سجل التفاوض للمراجعة

المثال:
1. البائع يقبل عرض 8300 ج.م
2. AI: "تهانينا! اتفقتم على 8300 ج.م"
3. زر "إتمام الشراء" يظهر
4. الطلب يُنشأ تلقائياً بالسعر والشروط المتفق عليها
```

---

## 7. Implementation Guide {#implementation-guide}

### 7.1 Phase 1: Core Infrastructure (Week 1-2)

**Tasks:**
```bash
# 1. Setup Database
npx prisma migrate dev --name add_negotiation_tables

# 2. Create Base Services
src/
  services/
    negotiation.service.ts       # جلسات التفاوض
    ai.service.ts                 # OpenAI integration
    pricing.service.ts            # Fair value calculation
    sentiment.service.ts          # Sentiment analysis
```

**Code Example: Negotiation Service**
```typescript
// src/services/negotiation.service.ts

import { PrismaClient } from '@prisma/client';
import { AIService } from './ai.service';
import { PricingService } from './pricing.service';

const prisma = new PrismaClient();

export class NegotiationService {

  async startNegotiation(data: {
    listingId: string;
    buyerId: string;
    initialOffer?: number;
    message?: string;
  }) {

    // 1. Get listing details
    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId },
      include: { seller: true }
    });

    if (!listing) throw new Error('Listing not found');
    if (listing.sellerId === data.buyerId) {
      throw new Error('Cannot negotiate your own listing');
    }

    // 2. Calculate fair market value
    const fairValue = await PricingService.calculateFairValue(listing);

    // 3. Create negotiation session
    const session = await prisma.negotiationSession.create({
      data: {
        listingId: data.listingId,
        buyerId: data.buyerId,
        sellerId: listing.sellerId,
        status: 'INITIATED',
        listingPrice: listing.price,
        buyerInitialOffer: data.initialOffer,
        fairMarketValue: fairValue.value,
        recommendedPrice: fairValue.optimal,
        priceRange: fairValue.range,
        aiConfidence: fairValue.confidence,
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000) // 72 hours
      }
    });

    // 4. Generate AI welcome message
    const aiMessage = await AIService.generateWelcomeMessage({
      sessionId: session.id,
      fairValue: fairValue.value,
      initialOffer: data.initialOffer,
      listingPrice: listing.price
    });

    // 5. Save AI message
    await prisma.negotiationMessage.create({
      data: {
        sessionId: session.id,
        sender: 'AI_ASSISTANT',
        content: aiMessage,
        isAIGenerated: true,
        aiModel: 'gpt-4-turbo'
      }
    });

    // 6. Send notification to seller
    await this.notifySeller(session.id, listing.sellerId);

    return {
      session,
      aiMessage,
      fairValue
    };
  }

  async makeOffer(sessionId: string, userId: string, data: {
    amount: number;
    message?: string;
    conditions?: string;
  }) {

    const session = await prisma.negotiationSession.findUnique({
      where: { id: sessionId },
      include: { listing: true }
    });

    if (!session) throw new Error('Session not found');

    // Determine role
    const isBuyer = session.buyerId === userId;
    const isSeller = session.sellerId === userId;

    if (!isBuyer && !isSeller) {
      throw new Error('Unauthorized');
    }

    // Create offer
    const offer = await prisma.negotiationOffer.create({
      data: {
        sessionId,
        offerType: session.offerCount === 0 ? 'INITIAL' : 'COUNTER',
        offeredBy: userId,
        amount: data.amount,
        previousAmount: session.currentOffer,
        changePercent: session.currentOffer
          ? ((data.amount - session.currentOffer) / session.currentOffer) * 100
          : null,
        message: data.message,
        conditions: data.conditions,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
      }
    });

    // Update session
    await prisma.negotiationSession.update({
      where: { id: sessionId },
      data: {
        currentOffer: data.amount,
        lastOfferedBy: userId,
        offerCount: { increment: 1 },
        lastActivityAt: new Date(),
        status: 'OFFER_MADE'
      }
    });

    // AI analysis of the offer
    const aiAnalysis = await AIService.analyzeOffer({
      offer: data.amount,
      fairValue: session.fairMarketValue,
      previousOffer: session.currentOffer,
      role: isBuyer ? 'buyer' : 'seller'
    });

    // Update offer with AI analysis
    await prisma.negotiationOffer.update({
      where: { id: offer.id },
      data: {
        isFairOffer: aiAnalysis.isFair,
        deviationFromFair: aiAnalysis.deviation,
        aiRecommendation: aiAnalysis.recommendation,
        aiReasoning: aiAnalysis.reasoning
      }
    });

    // Notify other party
    const otherPartyId = isBuyer ? session.sellerId : session.buyerId;
    await this.notifyNewOffer(sessionId, otherPartyId, data.amount);

    return {
      offer,
      aiAnalysis
    };
  }
}
```

### 7.2 Phase 2: AI Integration (Week 3-4)

**OpenAI Integration:**
```typescript
// src/services/ai.service.ts

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class AIService {

  static async generateWelcomeMessage(context: {
    sessionId: string;
    fairValue: number;
    initialOffer?: number;
    listingPrice: number;
  }): Promise<string> {

    const prompt = `
أنت مساعد تفاوض ذكي. مشتري بدأ تفاوض على منتج:
- السعر المعلن: ${context.listingPrice} ج.م
- السعر العادل (بناءً على تحليلنا): ${context.fairValue} ج.م
${context.initialOffer ? `- عرض المشتري: ${context.initialOffer} ج.م` : ''}

اكتب رسالة ترحيبية قصيرة (2-3 جمل) توضح:
1. السعر العادل للمنتج
2. تقييم عرض المشتري (إذا وجد)
3. خطوة مقترحة

استخدم لغة عربية مصرية بسيطة وودودة.
    `.trim();

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'أنت مساعد تفاوض محترف في منصة Xchange المصرية.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    return response.choices[0].message.content?.trim() || '';
  }

  static async suggestCounterOffer(context: {
    currentOffer: number;
    fairValue: number;
    listingPrice: number;
    offerCount: number;
    role: 'buyer' | 'seller';
  }): Promise<{
    amount: number;
    reasoning: string;
    message: string;
  }> {

    const gap = context.listingPrice - context.currentOffer;
    const gapPercent = (gap / context.listingPrice) * 100;

    let suggestedAmount: number;

    if (context.role === 'buyer') {
      // المشتري يزيد عرضه
      if (gapPercent > 15) {
        // فجوة كبيرة: زيادة 40% من الفجوة
        suggestedAmount = context.currentOffer + (gap * 0.4);
      } else if (gapPercent > 8) {
        // فجوة متوسطة: زيادة 50%
        suggestedAmount = context.currentOffer + (gap * 0.5);
      } else {
        // فجوة صغيرة: زيادة 60%
        suggestedAmount = context.currentOffer + (gap * 0.6);
      }
    } else {
      // البائع يخفض سعره
      if (gapPercent > 15) {
        // فجوة كبيرة: خفض 30%
        suggestedAmount = context.listingPrice - (gap * 0.3);
      } else if (gapPercent > 8) {
        // فجوة متوسطة: خفض 40%
        suggestedAmount = context.listingPrice - (gap * 0.4);
      } else {
        // فجوة صغيرة: خفض 50%
        suggestedAmount = context.listingPrice - (gap * 0.5);
      }
    }

    // تقريب لأقرب 50
    suggestedAmount = Math.round(suggestedAmount / 50) * 50;

    // توليد التبرير والرسالة
    const prompt = `
أنت مساعد تفاوض. الوضع الحالي:
- ${context.role === 'buyer' ? 'المشتري' : 'البائع'}
- السعر المعلن: ${context.listingPrice} ج.م
- السعر العادل: ${context.fairValue} ج.م
- العرض الحالي: ${context.currentOffer} ج.م
- عدد العروض المتبادلة: ${context.offerCount}

أقترح ${context.role === 'buyer' ? 'زيادة' : 'خفض'} العرض إلى ${suggestedAmount} ج.م

1. اكتب سبب هذا الاقتراح (جملة واحدة)
2. اكتب رسالة تفاوضية مقترحة (جملتين)

JSON فقط:
{
  "reasoning": "...",
  "message": "..."
}
    `.trim();

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      amount: suggestedAmount,
      reasoning: result.reasoning,
      message: result.message
    };
  }
}
```

### 7.3 Phase 3: Frontend UI (Week 5-6)

**React Components:**
```typescript
// src/components/NegotiationChat.tsx

'use client';

import { useState, useEffect } from 'react';
import { useNegotiation } from '@/hooks/useNegotiation';

export function NegotiationChat({ sessionId }: { sessionId: string }) {
  const {
    session,
    messages,
    sendMessage,
    makeOffer,
    acceptOffer,
    loading
  } = useNegotiation(sessionId);

  const [message, setMessage] = useState('');
  const [offerAmount, setOfferAmount] = useState<number | null>(null);

  if (!session) return <div>Loading...</div>;

  const isBuyer = session.buyerId === currentUserId;
  const fairValue = session.fairMarketValue;
  const currentOffer = session.currentOffer;

  return (
    <div className="flex flex-col h-screen">

      {/* Header: Fair Value Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm opacity-80">السعر العادل</h3>
            <p className="text-2xl font-bold">{fairValue.toLocaleString()} ج.م</p>
          </div>
          <div>
            <h3 className="text-sm opacity-80">العرض الحالي</h3>
            <p className="text-2xl font-bold">
              {currentOffer?.toLocaleString() || '--'} ج.م
            </p>
          </div>
          <div>
            <h3 className="text-sm opacity-80">احتمالية النجاح</h3>
            <p className="text-2xl font-bold">{session.successProbability}%</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isCurrentUser={msg.senderUserId === currentUserId}
            isAI={msg.sender === 'AI_ASSISTANT'}
          />
        ))}
      </div>

      {/* AI Suggestions */}
      {session.suggestedNextAction && (
        <div className="bg-yellow-50 border-t border-yellow-200 p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900 mb-1">
                اقتراح من المساعد الذكي
              </h4>
              <p className="text-yellow-800 text-sm">
                {session.suggestedNextAction}
              </p>
              {session.aiSuggestedOffer && (
                <button
                  onClick={() => makeOffer(session.aiSuggestedOffer!)}
                  className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded-lg"
                >
                  استخدم هذا العرض ({session.aiSuggestedOffer.toLocaleString()} ج.م)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t p-4 bg-white">
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="اكتب عرضك..."
            value={offerAmount || ''}
            onChange={(e) => setOfferAmount(Number(e.target.value))}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            onClick={() => offerAmount && makeOffer(offerAmount)}
            disabled={!offerAmount || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            إرسال عرض
          </button>
        </div>

        <div className="mt-2 flex gap-2">
          <input
            type="text"
            placeholder="أو اكتب رسالة..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            onClick={() => message && sendMessage(message)}
            disabled={!message || loading}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg"
          >
            إرسال
          </button>
        </div>
      </div>

    </div>
  );
}
```

### 7.4 Phase 4: Testing & Optimization (Week 7-8)

**Test Scenarios:**
```typescript
// tests/negotiation.test.ts

describe('Negotiation AI Assistant', () => {

  test('should calculate fair market value correctly', async () => {
    const listing = await createTestListing({
      price: 9000,
      category: 'mobiles',
      brand: 'Samsung'
    });

    const fairValue = await PricingService.calculateFairValue(listing);

    expect(fairValue.value).toBeGreaterThan(7000);
    expect(fairValue.value).toBeLessThan(10000);
    expect(fairValue.confidence).toBeGreaterThan(70);
  });

  test('should suggest appropriate counter offer', async () => {
    const session = await createTestSession({
      listingPrice: 9000,
      currentOffer: 7500,
      fairValue: 8500
    });

    const suggestion = await AIService.suggestCounterOffer({
      currentOffer: 7500,
      fairValue: 8500,
      listingPrice: 9000,
      offerCount: 1,
      role: 'seller'
    });

    // البائع يجب أن يعرض بين 8000-8700
    expect(suggestion.amount).toBeGreaterThan(8000);
    expect(suggestion.amount).toBeLessThan(8700);
  });

  test('should predict success probability accurately', async () => {
    const session = await createTestSession({
      listingPrice: 9000,
      currentOffer: 8500,
      fairValue: 8500,
      offerCount: 2
    });

    const probability = await predictSuccessProbability(session);

    // عرض قريب جداً من العادل = احتمالية عالية
    expect(probability).toBeGreaterThan(75);
  });
});
```

---

## 8. Security & Privacy {#security-privacy}

### 8.1 أمان البيانات

**Encryption:**
```typescript
// تشفير الرسائل الحساسة
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.MESSAGE_ENCRYPTION_KEY!;
const IV_LENGTH = 16;

export function encryptMessage(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv
  );

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
}

export function decryptMessage(encrypted: string): string {
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];

  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv
  );

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

### 8.2 Rate Limiting

```typescript
// منع إساءة الاستخدام
import rateLimit from 'express-rate-limit';

export const negotiationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  message: 'تم تجاوز الحد المسموح. حاول مرة أخرى بعد 15 دقيقة',
  standardHeaders: true,
  legacyHeaders: false
});

// للـ AI requests
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 AI requests per minute
  message: 'طلبات كثيرة جداً. انتظر قليلاً',
  keyGenerator: (req) => req.user?.id || req.ip
});
```

### 8.3 Privacy Controls

```typescript
// إعدادات الخصوصية
interface PrivacySettings {
  showNegotiationHistory: boolean;  // إظهار تاريخ التفاوض
  allowAIAnalysis: boolean;          // السماح لـ AI بتحليل سلوكي
  shareDataForImprovement: boolean;  // مشاركة البيانات لتحسين الخدمة
}

// حذف البيانات بعد فترة
async function cleanupExpiredNegotiations() {
  // حذف الجلسات المنتهية بعد 90 يوم
  await prisma.negotiationSession.deleteMany({
    where: {
      completedAt: {
        lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      }
    }
  });
}
```

---

## 📊 Success Metrics

### KPIs للقياس:

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Conversion Rate** | +25% | TBD | 🎯 |
| **Avg Negotiation Duration** | < 30 min | TBD | 🎯 |
| **User Satisfaction** | > 4.5/5 | TBD | 🎯 |
| **AI Accuracy** | > 80% | TBD | 🎯 |
| **Success Rate** | > 70% | TBD | 🎯 |

---

## 🚀 Deployment Checklist

- [ ] Database migrations applied
- [ ] OpenAI API key configured
- [ ] Redis cache setup
- [ ] Rate limiters enabled
- [ ] Privacy controls implemented
- [ ] Analytics tracking integrated
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] User documentation ready
- [ ] A/B testing configured

---

**تاريخ الإنشاء:** ديسمبر 2024
**الإصدار:** 1.0
**المطور:** Xchange Egypt Platform Team
**Contact:** dev@xchange-egypt.com
