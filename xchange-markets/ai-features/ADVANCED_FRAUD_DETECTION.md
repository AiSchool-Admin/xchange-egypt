# 🛡️ نظام كشف الاحتيال المتقدم - Advanced Fraud Detection
## Xchange AI-Powered Fraud Prevention System

**الأولوية:** 🔥 عالية جداً (أمان المنصة)
**التأثير:** -90% fraud incidents, +35% trust
**صعوبة التطوير:** متوسطة
**الوقت المقدر:** 8-10 أسابيع

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Fraud Types](#fraud-types)
3. [Detection Methods](#detection-methods)
4. [System Architecture](#architecture)
5. [Database Schema](#schema)
6. [ML Models](#ml-models)
7. [API Endpoints](#api)
8. [Implementation](#implementation)
9. [Response Procedures](#procedures)

---

## 1. Overview {#overview}

### 1.1 المشكلة

**أنواع الاحتيال الشائعة في Marketplaces:**
```
📊 إحصائيات الاحتيال في الأسواق الإلكترونية:

- 15% من الإعلانات تحتوي على معلومات مضللة
- 8% من الحسابات وهمية أو متعددة
- 12% من الصور مسروقة من الإنترنت
- 5% محاولات احتيال نصب مباشر
- 20% أسعار غير واقعية (مرتفعة جداً أو منخفضة جداً)

💰 التكلفة:
- متوسط خسارة لكل عملية احتيال: 2,500 ج.م
- تكلفة سمعة المنصة: غير قابلة للحساب
- معدل ترك المستخدمين بعد الاحتيال: 70%
```

### 1.2 الحل المتكامل

```
┌──────────────────────────────────────────────────────┐
│        نظام الحماية متعدد الطبقات                    │
├──────────────────────────────────────────────────────┤
│                                                       │
│  🔍 Layer 1: Real-time Detection                    │
│     • Reverse image search                          │
│     • Price anomaly detection                       │
│     • Behavioral analysis                           │
│                                                       │
│  🤖 Layer 2: ML-Powered Scoring                     │
│     • Fraud probability score                       │
│     • User trust score                              │
│     • Listing quality score                         │
│                                                       │
│  🌐 Layer 3: Graph Analysis                         │
│     • Social network analysis                       │
│     • Multi-account detection                       │
│     • Collusion rings identification                │
│                                                       │
│  ⚡ Layer 4: Automated Response                     │
│     • Auto-flag suspicious listings                 │
│     • Block high-risk users                         │
│     • Alert moderators                              │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

## 2. Fraud Types {#fraud-types}

### 2.1 تصنيف أنواع الاحتيال

```typescript
enum FraudType {
  // صور مزيفة
  STOLEN_IMAGES = 'stolen_images',           // صور مسروقة
  STOCK_PHOTOS = 'stock_photos',             // صور من المواقع
  PHOTOSHOPPED = 'photoshopped',             // صور معدلة

  // أسعار
  PRICE_TOO_LOW = 'price_too_low',           // سعر منخفض جداً (طعم)
  PRICE_TOO_HIGH = 'price_too_high',         // سعر مبالغ فيه
  FAKE_DISCOUNT = 'fake_discount',           // خصم وهمي

  // حسابات
  FAKE_ACCOUNT = 'fake_account',             // حساب وهمي
  MULTI_ACCOUNT = 'multi_account',           // حسابات متعددة
  BOT_ACTIVITY = 'bot_activity',             // نشاط بوتات

  // معلومات
  MISLEADING_DESC = 'misleading_desc',       // وصف مضلل
  FAKE_SPECS = 'fake_specs',                 // مواصفات كاذبة
  COUNTERFEIT = 'counterfeit',               // منتج مقلد

  // سلوكيات
  PHISHING = 'phishing',                     // محاولة احتيال مباشر
  PAYMENT_SCAM = 'payment_scam',             // احتيال الدفع
  SHIPPING_SCAM = 'shipping_scam',           // احتيال الشحن

  // شبكات
  REVIEW_MANIPULATION = 'review_manipulation', // تلاعب بالتقييمات
  SHILL_BIDDING = 'shill_bidding',          // مزايدة وهمية
  COLLUSION = 'collusion',                   // تواطؤ
}

enum RiskLevel {
  LOW = 'low',           // 0-30%
  MEDIUM = 'medium',     // 30-60%
  HIGH = 'high',         // 60-85%
  CRITICAL = 'critical'  // 85-100%
}
```

---

## 3. Detection Methods {#detection-methods}

### 3.1 Reverse Image Search

```typescript
/**
 * البحث العكسي عن الصور لكشف الصور المسروقة
 */

import axios from 'axios';
import sharp from 'sharp';
import crypto from 'crypto';

class ReverseImageSearchService {

  /**
   * فحص إذا كانت الصورة مسروقة من الإنترنت
   */
  async checkImageOriginality(imageUrl: string): Promise<{
    isOriginal: boolean;
    confidence: number;
    sources: string[];
    reason: string;
  }> {

    // 1. حساب Hash الصورة
    const imageHash = await this.calculateImageHash(imageUrl);

    // 2. البحث في قاعدة البيانات المحلية
    const localMatches = await this.searchLocalDatabase(imageHash);
    if (localMatches.length > 0) {
      return {
        isOriginal: false,
        confidence: 95,
        sources: localMatches,
        reason: 'تم استخدام هذه الصورة في إعلانات أخرى على المنصة'
      };
    }

    // 3. البحث في Google Images
    const googleResults = await this.searchGoogleImages(imageUrl);
    if (googleResults.matches > 5) {
      return {
        isOriginal: false,
        confidence: 90,
        sources: googleResults.urls,
        reason: 'الصورة موجودة على الإنترنت في مواقع متعددة'
      };
    }

    // 4. البحث في TinEye
    const tineye Results = await this.searchTinEye(imageUrl);
    if (tineyeResults.matches > 0) {
      return {
        isOriginal: false,
        confidence: 85,
        sources: tineyeResults.urls,
        reason: 'صورة من مصدر آخر على الإنترنت'
      };
    }

    // 5. كشف Stock Photos
    const stockCheck = await this.checkStockPhotos(imageHash);
    if (stockCheck.isStock) {
      return {
        isOriginal: false,
        confidence: 100,
        sources: [stockCheck.source],
        reason: 'صورة من مواقع الصور الجاهزة (Stock Photos)'
      };
    }

    return {
      isOriginal: true,
      confidence: 80,
      sources: [],
      reason: 'لم يتم العثور على مصدر آخر للصورة'
    };
  }

  /**
   * حساب Perceptual Hash للصورة
   */
  private async calculateImageHash(imageUrl: string): Promise<string> {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });

    const buffer = Buffer.from(response.data);

    // Resize to 8x8 and convert to grayscale
    const resized = await sharp(buffer)
      .resize(8, 8, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer();

    // Calculate average
    const pixels = new Uint8Array(resized);
    const avg = pixels.reduce((a, b) => a + b) / pixels.length;

    // Generate hash
    let hash = '';
    for (let pixel of pixels) {
      hash += pixel > avg ? '1' : '0';
    }

    return hash;
  }

  /**
   * مقارنة Hashes (Hamming Distance)
   */
  private hammingDistance(hash1: string, hash2: string): number {
    let distance = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] !== hash2[i]) distance++;
    }
    return distance;
  }

  /**
   * البحث في قاعدة البيانات المحلية
   */
  private async searchLocalDatabase(hash: string): Promise<string[]> {
    // البحث عن صور متطابقة أو شبه متطابقة
    const allHashes = await prisma.imageHash.findMany({
      select: { hash: true, listingId: true }
    });

    const matches: string[] = [];

    for (const record of allHashes) {
      const distance = this.hammingDistance(hash, record.hash);
      if (distance < 5) {  // متطابقة جداً
        matches.push(record.listingId);
      }
    }

    return matches;
  }

  /**
   * البحث في Google Images API
   */
  private async searchGoogleImages(imageUrl: string): Promise<{
    matches: number;
    urls: string[];
  }> {
    // استخدام Google Custom Search API
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_CX;

    const response = await axios.get(
      `https://www.googleapis.com/customsearch/v1`,
      {
        params: {
          key: apiKey,
          cx: cx,
          searchType: 'image',
          imgSize: 'large',
          q: imageUrl  // reverse image search
        }
      }
    );

    return {
      matches: response.data.searchInformation?.totalResults || 0,
      urls: response.data.items?.map((item: any) => item.link) || []
    };
  }
}
```

### 3.2 Price Anomaly Detection

```typescript
/**
 * كشف الأسعار الشاذة
 */

interface PriceAnomalyCheck {
  isAnomalous: boolean;
  zScore: number;
  percentile: number;
  reason: string;
  suggestedPrice: number;
}

async function detectPriceAnomaly(
  listing: Listing
): Promise<PriceAnomalyCheck> {

  // 1. جمع الأسعار المشابهة
  const similarListings = await prisma.listing.findMany({
    where: {
      category: listing.category,
      brand: listing.brand,
      model: listing.model,
      status: 'active',
      createdAt: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // آخر 90 يوم
      }
    },
    select: { price: true }
  });

  if (similarListings.length < 5) {
    return {
      isAnomalous: false,
      zScore: 0,
      percentile: 50,
      reason: 'بيانات غير كافية للمقارنة',
      suggestedPrice: listing.price
    };
  }

  const prices = similarListings.map(l => l.price);

  // 2. حساب الإحصائيات
  const mean = prices.reduce((a, b) => a + b) / prices.length;
  const stdDev = Math.sqrt(
    prices.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / prices.length
  );
  const zScore = (listing.price - mean) / stdDev;

  // 3. حساب Percentile
  const sorted = [...prices].sort((a, b) => a - b);
  const rank = sorted.filter(p => p <= listing.price).length;
  const percentile = (rank / sorted.length) * 100;

  // 4. تحديد إذا كان شاذاً
  let isAnomalous = false;
  let reason = '';

  if (zScore < -3) {
    isAnomalous = true;
    reason = `السعر منخفض جداً (${Math.abs(zScore).toFixed(1)} انحراف معياري). قد يكون طعم احتيال`;
  } else if (zScore > 3) {
    isAnomalous = true;
    reason = `السعر مرتفع جداً (${zScore.toFixed(1)} انحراف معياري). غير واقعي`;
  } else if (percentile < 5) {
    isAnomalous = true;
    reason = `السعر في أدنى 5% من السوق. مشبوه`;
  } else if (percentile > 95) {
    isAnomalous = true;
    reason = `السعر في أعلى 5% من السوق. مبالغ فيه`;
  }

  return {
    isAnomalous,
    zScore,
    percentile,
    reason: reason || 'السعر ضمن النطاق الطبيعي',
    suggestedPrice: Math.round(mean)
  };
}
```

### 3.3 Behavioral Analysis

```typescript
/**
 * تحليل سلوك المستخدم لكشف الأنماط المشبوهة
 */

interface BehaviorScore {
  score: number;  // 0-100
  flags: string[];
  isBot: boolean;
  isSuspicious: boolean;
}

async function analyzeBehavior(
  userId: string,
  action: string,
  context: any
): Promise<BehaviorScore> {

  const flags: string[] = [];
  let suspicionScore = 0;

  // 1. معدل النشاط (Activity Rate)
  const recentActions = await getRecentActions(userId, 60); // آخر 60 دقيقة

  if (recentActions.length > 100) {
    flags.push('EXCESSIVE_ACTIVITY');
    suspicionScore += 30;
  }

  // 2. أنماط التكرار (Repetitive Patterns)
  const pattern = detectRepetitivePattern(recentActions);
  if (pattern.isRepetitive) {
    flags.push('BOT_LIKE_PATTERN');
    suspicionScore += 40;
  }

  // 3. وقت النشاط (Activity Timing)
  const hourlyDistribution = getHourlyDistribution(userId);
  if (isUnnatural Timing(hourlyDistribution)) {
    flags.push('UNNATURAL_TIMING');
    suspicionScore += 20;
  }

  // 4. تنوع الأنشطة (Activity Diversity)
  const diversity = calculateActivityDiversity(userId);
  if (diversity < 0.3) {  // نشاط محدد جداً
    flags.push('LIMITED_ACTIVITY_TYPES');
    suspicionScore += 15;
  }

  // 5. سرعة الإجراءات (Action Speed)
  const avgSpeed = calculateAvgActionSpeed(recentActions);
  if (avgSpeed < 1000) {  // أقل من ثانية
    flags.push('SUPERHUMAN_SPEED');
    suspicionScore += 35;
  }

  // 6. تشابه مع حسابات أخرى
  const similarAccounts = await findSimilarAccounts(userId);
  if (similarAccounts.length > 0) {
    flags.push('SIMILAR_TO_BANNED_ACCOUNTS');
    suspicionScore += 50;
  }

  return {
    score: Math.min(100, suspicionScore),
    flags,
    isBot: suspicionScore > 70,
    isSuspicious: suspicionScore > 40
  };
}

/**
 * كشف الأنماط المتكررة
 */
function detectRepetitivePattern(actions: UserAction[]): {
  isRepetitive: boolean;
  pattern: string;
} {

  if (actions.length < 10) {
    return { isRepetitive: false, pattern: '' };
  }

  // تحليل التسلسل
  const intervals: number[] = [];
  for (let i = 1; i < actions.length; i++) {
    const timeDiff = actions[i].timestamp - actions[i-1].timestamp;
    intervals.push(timeDiff);
  }

  // حساب Standard Deviation
  const mean = intervals.reduce((a, b) => a + b) / intervals.length;
  const variance = intervals.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);

  // إذا الانحراف المعياري صغير جداً = نمط متكرر
  const coefficientOfVariation = stdDev / mean;

  if (coefficientOfVariation < 0.1) {  // تكرار شبه مثالي
    return {
      isRepetitive: true,
      pattern: `إجراءات كل ${mean.toFixed(0)} ms`
    };
  }

  return { isRepetitive: false, pattern: '' };
}
```

### 3.4 Graph-Based Collusion Detection

```typescript
/**
 * كشف شبكات التواطؤ باستخدام Graph Analysis
 */

import neo4j from 'neo4j-driver';

class CollusionDetector {

  private driver: neo4j.Driver;

  constructor() {
    this.driver = neo4j.driver(
      process.env.NEO4J_URI!,
      neo4j.auth.basic(
        process.env.NEO4J_USER!,
        process.env.NEO4J_PASSWORD!
      )
    );
  }

  /**
   * كشف شبكات الحسابات المتواطئة
   */
  async detectCollusionRings(): Promise<CollusionRing[]> {

    const session = this.driver.session();

    try {
      // Cypher query لكشف المجموعات المشبوهة
      const result = await session.run(`
        // إيجاد مجموعات مستخدمين مترابطة بقوة
        MATCH (u1:User)-[r:TRANSACTED_WITH]->(u2:User)
        WHERE r.count > 5  // تعاملوا أكثر من 5 مرات

        WITH u1, u2
        MATCH path = (u1)-[:TRANSACTED_WITH*2..4]-(u2)

        WITH DISTINCT nodes(path) as ring
        WHERE size(ring) >= 3  // على الأقل 3 مستخدمين

        // حساب مؤشر الاشتباه
        UNWIND ring as user
        MATCH (user)-[r:REVIEWED|RATED]->()
        WITH ring,
             avg(r.rating) as avgRating,
             count(r) as totalReviews
        WHERE avgRating > 4.5 AND totalReviews > 20

        RETURN ring, avgRating, totalReviews
      `);

      const rings: CollusionRing[] = [];

      for (const record of result.records) {
        const userNodes = record.get('ring');
        const avgRating = record.get('avgRating');
        const totalReviews = record.get('totalReviews');

        rings.push({
          users: userNodes.map((n: any) => n.properties.id),
          suspicionScore: this.calculateRingSuspicion(avgRating, totalReviews),
          evidence: {
            avgRating,
            totalReviews,
            pattern: 'تقييمات إيجابية متبادلة مرتفعة'
          }
        });
      }

      return rings;

    } finally {
      await session.close();
    }
  }

  /**
   * كشف Multi-Account (حسابات متعددة لنفس الشخص)
   */
  async detectMultiAccounts(userId: string): Promise<string[]> {

    const session = this.driver.session();

    try {
      const result = await session.run(`
        MATCH (u:User {id: $userId})

        // نفس الجهاز
        MATCH (u)-[:USED_DEVICE]->(d:Device)<-[:USED_DEVICE]-(other:User)
        WHERE u <> other

        WITH collect(DISTINCT other.id) as deviceMatches

        // نفس IP
        MATCH (u:User {id: $userId})-[:USED_IP]->(ip:IP)<-[:USED_IP]-(other2:User)
        WHERE u <> other2

        WITH deviceMatches, collect(DISTINCT other2.id) as ipMatches

        // نفس رقم الهاتف (معدل)
        MATCH (u:User {id: $userId})
        MATCH (other3:User)
        WHERE u <> other3
          AND u.phone IS NOT NULL
          AND other3.phone IS NOT NULL
          AND apoc.text.distance(u.phone, other3.phone) <= 2

        WITH deviceMatches, ipMatches, collect(DISTINCT other3.id) as phoneMatches

        RETURN deviceMatches, ipMatches, phoneMatches
      `, { userId });

      const record = result.records[0];
      const deviceMatches = record.get('deviceMatches');
      const ipMatches = record.get('ipMatches');
      const phoneMatches = record.get('phoneMatches');

      // تجميع كل الحسابات المشبوهة
      const suspiciousAccounts = new Set([
        ...deviceMatches,
        ...ipMatches,
        ...phoneMatches
      ]);

      return Array.from(suspiciousAccounts);

    } finally {
      await session.close();
    }
  }
}
```

---

## 4. System Architecture {#architecture}

```
┌──────────────────────────────────────────────────────┐
│             FRAUD DETECTION PIPELINE                 │
├──────────────────────────────────────────────────────┤
│                                                       │
│  📥 Input Events                                     │
│  ├─ New Listing Created                             │
│  ├─ Image Uploaded                                  │
│  ├─ User Action                                     │
│  ├─ Transaction Initiated                           │
│  └─ Review Posted                                   │
│          │                                            │
│          ▼                                            │
│  ┌────────────────────┐                              │
│  │  Event Processor   │                              │
│  │  (Kafka Consumer)  │                              │
│  └─────────┬──────────┘                              │
│            │                                          │
│            ▼                                          │
│  ┌─────────────────────────────────┐                 │
│  │     Fraud Detection Engine      │                 │
│  ├─────────────────────────────────┤                 │
│  │  • Image Analysis               │                 │
│  │  • Price Checking               │                 │
│  │  • Behavior Analysis            │                 │
│  │  • Graph Analysis               │                 │
│  └─────────┬───────────────────────┘                 │
│            │                                          │
│            ▼                                          │
│  ┌─────────────────────┐                             │
│  │   ML Risk Scorer    │                             │
│  │  (XGBoost Model)    │                             │
│  └─────────┬───────────┘                             │
│            │                                          │
│            ▼                                          │
│  ┌──────────────────────────────┐                    │
│  │  Risk Score: 0-100           │                    │
│  │  ├─ Low (0-30)               │                    │
│  │  ├─ Medium (30-60)           │                    │
│  │  ├─ High (60-85)             │                    │
│  │  └─ Critical (85-100)        │                    │
│  └─────────┬────────────────────┘                    │
│            │                                          │
│            ▼                                          │
│  ┌───────────────────────────────┐                   │
│  │   Automated Response          │                   │
│  ├───────────────────────────────┤                   │
│  │  Low: Allow + Monitor         │                   │
│  │  Medium: Flag + Human Review  │                   │
│  │  High: Block + Alert          │                   │
│  │  Critical: Ban + Report       │                   │
│  └───────────────────────────────┘                   │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

## 5. Database Schema {#schema}

```prisma
// Fraud Detection Schema

enum FraudType {
  STOLEN_IMAGES
  FAKE_ACCOUNT
  PRICE_ANOMALY
  BOT_ACTIVITY
  COLLUSION
  COUNTERFEIT
  PHISHING
}

enum FraudStatus {
  DETECTED
  UNDER_REVIEW
  CONFIRMED
  FALSE_POSITIVE
  RESOLVED
}

model FraudAlert {
  id              String        @id @default(uuid())

  // What was detected
  fraudType       FraudType
  riskLevel       RiskLevel
  riskScore       Float         // 0-100
  confidence      Float         // 0-100

  // Target
  targetType      String        // listing, user, transaction
  targetId        String

  // Evidence
  evidence        Json          // {reasons, data, sources}
  detectedBy      String        // ai, manual, automated_rule

  // Status
  status          FraudStatus   @default(DETECTED)

  // Actions Taken
  actionsToken    String[]      // [flagged, blocked, banned]
  autoBlocked     Boolean       @default(false)

  // Human Review
  reviewedBy      String?
  reviewedAt      DateTime?
  reviewNotes     String?

  // Resolution
  isFraud         Boolean?
  resolvedAt      DateTime?

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([targetType, targetId])
  @@index([fraudType])
  @@index([riskLevel])
  @@index([status])
}

model ImageHash {
  id            String    @id @default(uuid())

  imageUrl      String
  perceptualHash String   // pHash

  listingId     String?
  userId        String?

  firstSeen     DateTime  @default(now())

  @@index([perceptualHash])
  @@index([listingId])
}

model UserTrustScore {
  id            String    @id @default(uuid())
  userId        String    @unique

  // Scores
  overallScore  Float     // 0-100
  imageScore    Float
  priceScore    Float
  behaviorScore Float
  networkScore  Float

  // Flags
  totalFlags    Int       @default(0)
  activeFlags   Int       @default(0)

  // History
  previousBans  Int       @default(0)
  warningsCount Int       @default(0)

  // Status
  isTrusted     Boolean   @default(false)
  isBlacklisted Boolean   @default(false)

  lastCalculated DateTime  @default(now())
  updatedAt     DateTime   @updatedAt

  @@index([userId])
  @@index([overallScore])
}
```

---

## 6. ML Models {#ml-models}

### Fraud Risk Scoring Model

```python
# ml/fraud_scorer.py

import xgboost as xgb
import pandas as pd
import numpy as np

class FraudRiskScorer:
    """
    نموذج XGBoost لحساب احتمالية الاحتيال
    """

    def __init__(self, model_path: str):
        self.model = xgb.Booster()
        self.model.load_model(model_path)

    def score(self, features: dict) -> float:
        """
        حساب Risk Score (0-100)
        """

        # تحضير المميزات
        feature_vector = self.prepare_features(features)

        # Prediction
        dmatrix = xgb.DMatrix(feature_vector)
        prob = self.model.predict(dmatrix)[0]

        # تحويل لنسبة مئوية
        risk_score = prob * 100

        return risk_score

    def prepare_features(self, data: dict) -> pd.DataFrame:
        """
        تحضير feature vector
        """

        features = {
            # User features
            'user_age_days': data.get('user_age_days', 0),
            'user_listing_count': data.get('user_listing_count', 0),
            'user_transaction_count': data.get('user_transaction_count', 0),
            'user_avg_rating': data.get('user_avg_rating', 0),
            'user_verification_level': data.get('user_verification_level', 0),

            # Listing features
            'price_zscore': data.get('price_zscore', 0),
            'price_percentile': data.get('price_percentile', 50),
            'has_stock_images': int(data.get('has_stock_images', False)),
            'image_count': data.get('image_count', 0),
            'description_length': len(data.get('description', '')),

            # Behavioral features
            'actions_per_hour': data.get('actions_per_hour', 0),
            'avg_action_speed_ms': data.get('avg_action_speed_ms', 5000),
            'activity_diversity': data.get('activity_diversity', 1.0),

            # Network features
            'similar_accounts_count': data.get('similar_accounts_count', 0),
            'multi_account_probability': data.get('multi_account_probability', 0),

            # Historical
            'previous_fraud_alerts': data.get('previous_fraud_alerts', 0),
            'previous_successful_sales': data.get('previous_successful_sales', 0),
        }

        return pd.DataFrame([features])
```

---

## 7. API Endpoints {#api}

```typescript
// Fraud Detection APIs

// Check Listing
POST /api/fraud/check-listing
{
  "listingId": "uuid"
}

Response:
{
  "riskScore": 75,
  "riskLevel": "HIGH",
  "flags": [
    {
      "type": "STOLEN_IMAGES",
      "severity": "high",
      "evidence": {
        "imageUrl": "...",
        "foundOn": ["website1.com", "website2.com"],
        "confidence": 92
      }
    },
    {
      "type": "PRICE_ANOMALY",
      "severity": "medium",
      "evidence": {
        "listedPrice": 3000,
        "marketAverage": 8500,
        "zScore": -3.2
      }
    }
  ],
  "recommendation": "BLOCK",
  "reason": "صور مسروقة + سعر منخفض جداً = احتمال احتيال عالي"
}

// Report Fraud
POST /api/fraud/report
{
  "targetType": "listing",
  "targetId": "uuid",
  "fraudType": "COUNTERFEIT",
  "description": "المنتج مقلد",
  "evidence": ["image1.jpg"]
}
```

---

## 8. Implementation {#implementation}

### Week 1-2: Image Detection
```bash
- Reverse image search integration
- pHash calculation
- Stock photo database
```

### Week 3-4: Price & Behavior
```bash
- Price anomaly detector
- Behavioral analysis
- Bot detection
```

### Week 5-6: Graph Analysis
```bash
- Neo4j setup
- Collusion detection
- Multi-account linking
```

### Week 7-8: ML & Integration
```bash
- Train XGBoost model
- API endpoints
- Automated responses
- Dashboard للمراقبة
```

---

## 9. Response Procedures {#procedures}

### Automated Actions by Risk Level

```typescript
const FRAUD_RESPONSE_MATRIX = {
  LOW: {
    actions: ['LOG', 'MONITOR'],
    notify: [],
    block: false
  },

  MEDIUM: {
    actions: ['FLAG', 'REQUIRE_VERIFICATION'],
    notify: ['MODERATORS'],
    block: false,
    message: 'يرجى التحقق من هويتك لإكمال هذا الإجراء'
  },

  HIGH: {
    actions: ['BLOCK_LISTING', 'LIMIT_ACCOUNT'],
    notify: ['MODERATORS', 'SECURITY_TEAM'],
    block: true,
    message: 'تم إيقاف هذا الإعلان مؤقتاً للمراجعة'
  },

  CRITICAL: {
    actions: ['BAN_USER', 'BLOCK_ALL_CONTENT', 'REPORT_AUTHORITIES'],
    notify: ['SECURITY_TEAM', 'LEGAL'],
    block: true,
    permanent: true,
    message: 'تم إيقاف حسابك بسبب نشاط احتيالي'
  }
};
```

---

**تاريخ الإنشاء:** ديسمبر 2024
**الإصدار:** 1.0
**Contact:** security@xchange-egypt.com
