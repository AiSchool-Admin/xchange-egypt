# 📊 خوارزمية التسعير الذكي - سوق الخردة

## Smart Pricing Algorithm - Xchange Scrap Marketplace

---

## 📋 الفهرس

1. [نظرة عامة](#1-نظرة-عامة)
2. [مصادر البيانات](#2-مصادر-البيانات)
3. [خوارزمية السعر المرجعي](#3-خوارزمية-السعر-المرجعي)
4. [تعديلات السعر](#4-تعديلات-السعر)
5. [خوارزمية C2B Pricing](#5-خوارزمية-c2b-pricing)
6. [نظام تنبيهات الأسعار](#6-نظام-تنبيهات-الأسعار)
7. [خوارزمية مطابقة العرض والطلب](#7-خوارزمية-مطابقة-العرض-والطلب)
8. [التنفيذ البرمجي](#8-التنفيذ-البرمجي)

---

## 1. نظرة عامة

### 1.1 أهداف نظام التسعير

```
┌─────────────────────────────────────────────────────────────┐
│                   أهداف نظام التسعير                        │
├─────────────────────────────────────────────────────────────┤
│  1. الشفافية    → أسعار موحدة ومعلنة للجميع                │
│  2. العدالة     → سعر عادل للبائع والمشتري                  │
│  3. الديناميكية → تحديث مستمر حسب السوق                    │
│  4. الربحية     → هامش ربح للمنصة مستدام                    │
│  5. التنافسية   → أسعار أفضل من السوق التقليدي             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 تدفق التسعير

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  مصادر     │────→│  محرك      │────→│  سعر       │
│  البيانات   │     │  التسعير    │     │  نهائي     │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
  • LME API          • الخوارزمية        • سعر الشراء
  • سعر الصرف        • التعديلات         • سعر البيع
  • السوق المحلي     • القواعد          • هامش المنصة
  • بيانات المنصة
```

---

## 2. مصادر البيانات

### 2.1 المصادر الخارجية

```typescript
interface ExternalDataSources {
  // بورصة لندن للمعادن
  lme: {
    endpoint: 'https://api.lme.com/v1/prices',
    metals: ['copper', 'aluminium', 'lead', 'zinc', 'nickel'],
    updateFrequency: '1h',
    currency: 'USD'
  };
  
  // سعر صرف الدولار
  exchangeRate: {
    endpoint: 'https://api.exchangerate.host/latest',
    baseCurrency: 'USD',
    targetCurrency: 'EGP',
    updateFrequency: '1h'
  };
  
  // أسعار الحديد العالمية
  steelPrices: {
    endpoint: 'https://api.steelprices.com/v1/scrap',
    updateFrequency: '24h'
  };
}
```

### 2.2 المصادر المحلية

```typescript
interface LocalDataSources {
  // أسعار السوق المحلي (إدخال يدوي/مسح ميداني)
  localMarket: {
    source: 'manual_survey',
    locations: ['السبتية', 'عزبة أبو حشيش', 'منشأة ناصر'],
    updateFrequency: 'daily',
    fields: ['material_type', 'quality', 'price_buy', 'price_sell']
  };
  
  // بيانات معاملات المنصة
  platformData: {
    source: 'transactions_table',
    metrics: ['avg_price', 'volume', 'trend'],
    window: '7d'
  };
  
  // أسعار التجار المسجلين
  dealerPrices: {
    source: 'dealer_prices_table',
    aggregation: 'weighted_average',
    weight: 'transaction_volume'
  };
}
```

### 2.3 جدول تحديث البيانات

| المصدر | التكرار | الأولوية | Fallback |
|--------|---------|----------|----------|
| LME | كل ساعة | عالية | آخر قيمة معروفة |
| سعر الصرف | كل ساعة | حرجة | البنك المركزي |
| السوق المحلي | يومياً | عالية | متوسط أسبوع |
| معاملات المنصة | فوري | متوسطة | - |
| أسعار التجار | كل 6 ساعات | متوسطة | السوق المحلي |

---

## 3. خوارزمية السعر المرجعي

### 3.1 الصيغة الأساسية

```typescript
/**
 * حساب السعر المرجعي للمعدن
 * Reference Price = Weighted Average of Multiple Sources
 */
function calculateReferencePrice(
  materialType: MaterialType,
  governorate?: string
): ReferencePrice {
  
  // 1. جلب البيانات من المصادر
  const lmePrice = getLMEPrice(materialType);
  const exchangeRate = getExchangeRate('USD', 'EGP');
  const localMarketPrice = getLocalMarketPrice(materialType, governorate);
  const platformAvgPrice = getPlatformAveragePrice(materialType, '7d');
  const dealerAvgPrice = getDealerAveragePrice(materialType, governorate);
  
  // 2. تحويل LME إلى جنيه مصري
  const lmePriceEGP = lmePrice * exchangeRate;
  
  // 3. حساب الأوزان حسب نوع المادة
  const weights = getWeights(materialType);
  
  // 4. حساب المتوسط الموزون
  const referencePrice = 
    (lmePriceEGP * weights.lme) +
    (localMarketPrice * weights.local) +
    (platformAvgPrice * weights.platform) +
    (dealerAvgPrice * weights.dealer);
  
  return {
    price: Math.round(referencePrice * 100) / 100,
    confidence: calculateConfidence(weights, dataQuality),
    sources: { lme: lmePriceEGP, local: localMarketPrice, platform: platformAvgPrice },
    updatedAt: new Date()
  };
}
```

### 3.2 أوزان المصادر حسب نوع المادة

```typescript
const sourceWeights: Record<MaterialCategory, SourceWeights> = {
  // المعادن غير الحديدية (مرتبطة بقوة بـ LME)
  'non_ferrous_metals': {
    lme: 0.40,      // 40% من LME
    local: 0.30,    // 30% من السوق المحلي
    platform: 0.20, // 20% من معاملات المنصة
    dealer: 0.10    // 10% من أسعار التجار
  },
  
  // الحديد والصلب (السوق المحلي أهم)
  'ferrous_metals': {
    lme: 0.20,
    local: 0.45,
    platform: 0.25,
    dealer: 0.10
  },
  
  // البلاستيك والورق (السوق المحلي فقط)
  'recyclables': {
    lme: 0.00,
    local: 0.50,
    platform: 0.35,
    dealer: 0.15
  },
  
  // الإلكترونيات (معقد - يحتاج تقييم خاص)
  'electronics': {
    lme: 0.15,      // للمعادن الثمينة
    local: 0.40,
    platform: 0.30,
    dealer: 0.15
  }
};
```

### 3.3 معامل الثقة (Confidence Score)

```typescript
/**
 * حساب معامل الثقة في السعر
 * 0-100 حيث 100 = ثقة عالية جداً
 */
function calculateConfidence(
  dataQuality: DataQuality,
  sourceAvailability: SourceAvailability
): number {
  let confidence = 100;
  
  // خصم لعدم توفر المصادر
  if (!sourceAvailability.lme) confidence -= 15;
  if (!sourceAvailability.local) confidence -= 25;
  if (!sourceAvailability.platform) confidence -= 10;
  
  // خصم لقدم البيانات
  const hoursOld = dataQuality.hoursOld;
  if (hoursOld > 24) confidence -= 20;
  else if (hoursOld > 12) confidence -= 10;
  else if (hoursOld > 6) confidence -= 5;
  
  // خصم للتقلب العالي
  if (dataQuality.volatility > 10) confidence -= 15;
  else if (dataQuality.volatility > 5) confidence -= 5;
  
  return Math.max(0, Math.min(100, confidence));
}
```

---

## 4. تعديلات السعر

### 4.1 تعديل الجودة

```typescript
const qualityMultipliers: Record<MaterialType, Record<QualityGrade, number>> = {
  'iron_scrap': {
    'premium': 1.08,    // +8% للممتاز
    'standard': 1.00,   // السعر الأساسي
    'mixed': 0.92,      // -8% للمخلوط
    'low': 0.82         // -18% للمنخفض
  },
  
  'copper_red': {
    'shiny': 1.12,      // +12% للامع نظيف
    'standard': 1.00,
    'mixed': 0.88,
    'burnt': 0.75       // -25% للمحروق
  },
  
  'aluminium': {
    'clean': 1.10,
    'standard': 1.00,
    'painted': 0.85,    // -15% للمدهون
    'mixed': 0.80
  },
  
  'electronics': {
    'working': 1.80,    // +80% للعامل
    'repairable': 1.30, // +30% للقابل للإصلاح
    'for_parts': 1.00,
    'scrap': 0.60       // -40% للخردة فقط
  }
};

function applyQualityAdjustment(
  basePrice: number,
  materialType: MaterialType,
  quality: QualityGrade
): number {
  const multiplier = qualityMultipliers[materialType]?.[quality] ?? 1.0;
  return basePrice * multiplier;
}
```

### 4.2 تعديل الكمية

```typescript
/**
 * خصم/علاوة حسب الكمية
 * الكميات الكبيرة = سعر أفضل
 * الكميات الصغيرة = خصم بسيط
 */
function applyQuantityAdjustment(
  basePrice: number,
  quantityKg: number,
  materialType: MaterialType
): number {
  const thresholds = getQuantityThresholds(materialType);
  
  if (quantityKg >= thresholds.bulk) {
    // كمية كبيرة (> 1 طن عادة)
    return basePrice * 1.05; // +5%
  } else if (quantityKg >= thresholds.medium) {
    // كمية متوسطة (100-1000 كجم)
    return basePrice * 1.00; // السعر الأساسي
  } else if (quantityKg >= thresholds.small) {
    // كمية صغيرة (10-100 كجم)
    return basePrice * 0.97; // -3%
  } else {
    // كمية صغيرة جداً (< 10 كجم)
    return basePrice * 0.93; // -7%
  }
}

const quantityThresholds: Record<MaterialCategory, QuantityThresholds> = {
  'metals': { bulk: 1000, medium: 100, small: 10 },
  'electronics': { bulk: 50, medium: 10, small: 2 },
  'recyclables': { bulk: 500, medium: 50, small: 5 }
};
```

### 4.3 تعديل الموقع

```typescript
/**
 * تعديل السعر حسب الموقع
 * القاهرة الكبرى = السعر الأساسي
 * المحافظات البعيدة = خصم للنقل
 */
const locationMultipliers: Record<string, number> = {
  // القاهرة الكبرى (المرجع)
  'القاهرة': 1.00,
  'الجيزة': 1.00,
  'القليوبية': 0.98,
  
  // الدلتا والوجه البحري
  'الإسكندرية': 0.97,
  'الدقهلية': 0.95,
  'الشرقية': 0.96,
  'الغربية': 0.95,
  'المنوفية': 0.96,
  'البحيرة': 0.94,
  
  // الصعيد
  'بني سويف': 0.93,
  'المنيا': 0.91,
  'أسيوط': 0.89,
  'سوهاج': 0.87,
  'قنا': 0.85,
  'الأقصر': 0.84,
  'أسوان': 0.82,
  
  // القناة وسيناء
  'السويس': 0.98,
  'الإسماعيلية': 0.96,
  'بورسعيد': 0.95,
  
  // مناطق صناعية (أسعار أعلى)
  'العاشر من رمضان': 1.02,
  '6 أكتوبر': 1.02,
  'السادات': 1.01
};

function applyLocationAdjustment(
  basePrice: number,
  governorate: string
): number {
  const multiplier = locationMultipliers[governorate] ?? 0.90;
  return basePrice * multiplier;
}
```

---

## 5. خوارزمية C2B Pricing

### 5.1 نموذج تسعير خدمة الجمع

```typescript
/**
 * حساب السعر للعميل في خدمة الجمع من الباب
 * 
 * السعر للعميل = السعر المرجعي - هامش المنصة - تكلفة الجمع
 */
interface C2BPricingResult {
  customerPrice: number;      // ما يحصل عليه العميل
  platformMargin: number;     // هامش المنصة
  collectorPayout: number;    // ما يحصل عليه الجامع
  breakdown: PriceBreakdown;
}

function calculateC2BPrice(
  materials: MaterialInput[],
  location: Location,
  options: C2BOptions
): C2BPricingResult {
  
  let totalReferencePrice = 0;
  let breakdown: PriceBreakdown[] = [];
  
  // 1. حساب السعر المرجعي لكل مادة
  for (const material of materials) {
    const refPrice = calculateReferencePrice(material.type, location.governorate);
    const qualityAdjusted = applyQualityAdjustment(refPrice.price, material.type, material.quality);
    const quantityAdjusted = applyQuantityAdjustment(qualityAdjusted, material.weightKg, material.type);
    const locationAdjusted = applyLocationAdjustment(quantityAdjusted, location.governorate);
    
    const materialTotal = locationAdjusted * material.weightKg;
    totalReferencePrice += materialTotal;
    
    breakdown.push({
      materialType: material.type,
      weightKg: material.weightKg,
      pricePerKg: locationAdjusted,
      total: materialTotal
    });
  }
  
  // 2. حساب الهوامش
  const platformMarginRate = getPlatformMarginRate(totalReferencePrice, location);
  const platformMargin = totalReferencePrice * platformMarginRate;
  
  // 3. السعر للعميل
  const customerPrice = totalReferencePrice - platformMargin;
  
  // 4. حصة الجامع
  const collectorRate = getCollectorRate(location);
  const collectorPayout = platformMargin * collectorRate;
  
  return {
    customerPrice: Math.round(customerPrice),
    platformMargin: Math.round(platformMargin),
    collectorPayout: Math.round(collectorPayout),
    breakdown
  };
}
```

### 5.2 هوامش المنصة

```typescript
/**
 * هامش المنصة يعتمد على:
 * 1. قيمة المعاملة (أقل = هامش أعلى)
 * 2. الموقع (بعيد = هامش أعلى)
 * 3. نوع المادة
 */
function getPlatformMarginRate(
  transactionValue: number,
  location: Location
): number {
  // الهامش الأساسي حسب القيمة
  let baseMargin: number;
  
  if (transactionValue < 100) {
    baseMargin = 0.25; // 25% للمعاملات الصغيرة جداً
  } else if (transactionValue < 500) {
    baseMargin = 0.20; // 20%
  } else if (transactionValue < 2000) {
    baseMargin = 0.15; // 15%
  } else if (transactionValue < 10000) {
    baseMargin = 0.12; // 12%
  } else {
    baseMargin = 0.10; // 10% للمعاملات الكبيرة
  }
  
  // تعديل حسب الموقع
  const locationFactor = getLocationCostFactor(location);
  
  return baseMargin * locationFactor;
}

// توزيع الهامش
const marginDistribution = {
  platformNet: 0.40,      // 40% صافي ربح المنصة
  collectorPayout: 0.50,  // 50% للجامع
  operations: 0.10        // 10% تكاليف تشغيلية
};
```

### 5.3 الحد الأدنى للطلب

```typescript
const minimumOrderConfig = {
  // الحد الأدنى لقيمة الطلب
  minOrderValue: 50, // 50 جنيه
  
  // الحد الأدنى للوزن حسب المادة
  minWeight: {
    'metals': 1,        // 1 كجم
    'electronics': 0.5, // 0.5 كجم
    'recyclables': 2    // 2 كجم
  },
  
  // رسوم إضافية للطلبات الصغيرة
  smallOrderFee: {
    threshold: 100,     // إذا أقل من 100 جنيه
    fee: 10             // رسوم 10 جنيه
  }
};
```

---

## 6. نظام تنبيهات الأسعار

### 6.1 أنواع التنبيهات

```typescript
interface PriceAlert {
  id: string;
  userId: string;
  materialTypeId: string;
  alertType: 'above' | 'below' | 'change_percent';
  threshold: number;
  isActive: boolean;
  lastTriggered?: Date;
  createdAt: Date;
}

// أمثلة:
// - نبهني إذا النحاس وصل 600 ج/كجم
// - نبهني إذا الحديد نزل عن 38 ج/كجم
// - نبهني إذا تغير أي سعر أكثر من 5%
```

### 6.2 خوارزمية التنبيهات

```typescript
/**
 * فحص التنبيهات عند تحديث الأسعار
 */
async function checkPriceAlerts(
  materialTypeId: string,
  newPrice: number,
  oldPrice: number
): Promise<void> {
  
  // 1. جلب التنبيهات النشطة لهذه المادة
  const alerts = await getActiveAlerts(materialTypeId);
  
  for (const alert of alerts) {
    let shouldTrigger = false;
    let message = '';
    
    switch (alert.alertType) {
      case 'above':
        if (newPrice >= alert.threshold && oldPrice < alert.threshold) {
          shouldTrigger = true;
          message = `سعر ${alert.materialName} وصل ${newPrice} ج/كجم`;
        }
        break;
        
      case 'below':
        if (newPrice <= alert.threshold && oldPrice > alert.threshold) {
          shouldTrigger = true;
          message = `سعر ${alert.materialName} نزل إلى ${newPrice} ج/كجم`;
        }
        break;
        
      case 'change_percent':
        const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;
        if (Math.abs(changePercent) >= alert.threshold) {
          shouldTrigger = true;
          const direction = changePercent > 0 ? 'ارتفع' : 'انخفض';
          message = `${alert.materialName} ${direction} ${Math.abs(changePercent).toFixed(1)}%`;
        }
        break;
    }
    
    if (shouldTrigger) {
      await sendNotification(alert.userId, {
        type: 'price_alert',
        title: '📊 تنبيه سعر',
        body: message,
        data: { materialTypeId, newPrice, alertId: alert.id }
      });
      
      await updateAlertLastTriggered(alert.id);
    }
  }
}
```

---

## 7. خوارزمية مطابقة العرض والطلب

### 7.1 نموذج المطابقة

```typescript
/**
 * مطابقة إعلانات البيع مع طلبات الشراء
 */
interface MatchResult {
  sellListing: Listing;
  buyListing: Listing;
  matchScore: number;
  priceGap: number;
  distanceKm: number;
  recommendation: 'high' | 'medium' | 'low';
}

async function findMatches(
  listing: Listing
): Promise<MatchResult[]> {
  
  const oppositeType = listing.listingType === 'sell' ? 'buy' : 'sell';
  
  // 1. جلب الإعلانات المقابلة
  const candidates = await getListings({
    type: oppositeType,
    materialTypeId: listing.materialTypeId,
    status: 'active',
    governorate: listing.governorate // نفس المحافظة أولاً
  });
  
  // 2. حساب نقاط المطابقة
  const matches: MatchResult[] = [];
  
  for (const candidate of candidates) {
    const score = calculateMatchScore(listing, candidate);
    
    if (score.total >= 50) { // حد أدنى 50%
      matches.push({
        sellListing: listing.listingType === 'sell' ? listing : candidate,
        buyListing: listing.listingType === 'buy' ? listing : candidate,
        matchScore: score.total,
        priceGap: score.priceGap,
        distanceKm: score.distance,
        recommendation: getRecommendation(score.total)
      });
    }
  }
  
  // 3. ترتيب حسب أفضل مطابقة
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}
```

### 7.2 حساب نقاط المطابقة

```typescript
interface MatchScore {
  total: number;
  priceScore: number;
  quantityScore: number;
  qualityScore: number;
  locationScore: number;
  priceGap: number;
  distance: number;
}

function calculateMatchScore(
  listing1: Listing,
  listing2: Listing
): MatchScore {
  
  // 1. مطابقة السعر (40% من النقاط)
  const priceDiff = Math.abs(listing1.pricePerKg - listing2.pricePerKg);
  const avgPrice = (listing1.pricePerKg + listing2.pricePerKg) / 2;
  const priceGapPercent = (priceDiff / avgPrice) * 100;
  
  let priceScore: number;
  if (priceGapPercent <= 5) priceScore = 100;
  else if (priceGapPercent <= 10) priceScore = 80;
  else if (priceGapPercent <= 15) priceScore = 60;
  else if (priceGapPercent <= 20) priceScore = 40;
  else priceScore = 20;
  
  // 2. مطابقة الكمية (25% من النقاط)
  const quantityRatio = Math.min(listing1.quantityKg, listing2.quantityKg) /
                        Math.max(listing1.quantityKg, listing2.quantityKg);
  const quantityScore = quantityRatio * 100;
  
  // 3. مطابقة الجودة (20% من النقاط)
  const qualityScore = listing1.qualityGrade === listing2.qualityGrade ? 100 :
                       areQualitiesCompatible(listing1.qualityGrade, listing2.qualityGrade) ? 70 : 40;
  
  // 4. مطابقة الموقع (15% من النقاط)
  const distance = calculateDistance(listing1.location, listing2.location);
  let locationScore: number;
  if (distance <= 5) locationScore = 100;
  else if (distance <= 20) locationScore = 80;
  else if (distance <= 50) locationScore = 60;
  else if (distance <= 100) locationScore = 40;
  else locationScore = 20;
  
  // المجموع الموزون
  const total = 
    (priceScore * 0.40) +
    (quantityScore * 0.25) +
    (qualityScore * 0.20) +
    (locationScore * 0.15);
  
  return {
    total: Math.round(total),
    priceScore,
    quantityScore,
    qualityScore,
    locationScore,
    priceGap: priceDiff,
    distance
  };
}
```

---

## 8. التنفيذ البرمجي

### 8.1 خدمة التسعير (PricingService)

```typescript
// services/pricing.service.ts

import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';
import { LMEService } from './lme.service';
import { ExchangeRateService } from './exchange-rate.service';
import { NotificationService } from './notification.service';

@Injectable()
export class PricingService {
  constructor(
    private prisma: PrismaService,
    private lme: LMEService,
    private exchangeRate: ExchangeRateService,
    private notifications: NotificationService
  ) {}

  /**
   * تحديث الأسعار كل ساعة
   */
  @Cron(CronExpression.EVERY_HOUR)
  async updatePrices(): Promise<void> {
    console.log('Starting price update job...');
    
    try {
      // 1. جلب البيانات الخارجية
      const lmePrices = await this.lme.fetchLatestPrices();
      const usdToEgp = await this.exchangeRate.getRate('USD', 'EGP');
      
      // 2. تحديث كل نوع مادة
      const materialTypes = await this.prisma.materialType.findMany({
        where: { isActive: true }
      });
      
      for (const material of materialTypes) {
        const oldPrice = await this.getCurrentPrice(material.id);
        const newPrice = await this.calculateNewPrice(material, lmePrices, usdToEgp);
        
        // 3. حفظ السعر الجديد
        await this.savePrice(material.id, newPrice);
        
        // 4. فحص التنبيهات
        if (oldPrice) {
          await this.checkPriceAlerts(material.id, newPrice.price, oldPrice.price);
        }
      }
      
      console.log('Price update completed successfully');
    } catch (error) {
      console.error('Price update failed:', error);
      // إرسال تنبيه للمسؤولين
      await this.notifications.alertAdmins('Price update failed', error);
    }
  }

  /**
   * حساب سعر طلب جمع
   */
  async calculatePickupPrice(
    materials: { materialTypeId: string; weightKg: number; quality: string }[],
    governorate: string
  ): Promise<C2BPricingResult> {
    let totalCustomerPrice = 0;
    let totalPlatformMargin = 0;
    const breakdown: PriceBreakdown[] = [];
    
    for (const item of materials) {
      const price = await this.getCurrentPrice(item.materialTypeId);
      if (!price) continue;
      
      // تطبيق التعديلات
      let adjustedPrice = price.price;
      adjustedPrice = this.applyQualityAdjustment(adjustedPrice, item.materialTypeId, item.quality);
      adjustedPrice = this.applyQuantityAdjustment(adjustedPrice, item.weightKg);
      adjustedPrice = this.applyLocationAdjustment(adjustedPrice, governorate);
      
      const itemTotal = adjustedPrice * item.weightKg;
      const itemMargin = itemTotal * this.getPlatformMarginRate(itemTotal, governorate);
      
      totalCustomerPrice += (itemTotal - itemMargin);
      totalPlatformMargin += itemMargin;
      
      breakdown.push({
        materialTypeId: item.materialTypeId,
        weightKg: item.weightKg,
        pricePerKg: adjustedPrice,
        subtotal: itemTotal,
        customerGets: itemTotal - itemMargin
      });
    }
    
    return {
      customerPrice: Math.round(totalCustomerPrice),
      platformMargin: Math.round(totalPlatformMargin),
      collectorPayout: Math.round(totalPlatformMargin * 0.5),
      breakdown,
      validUntil: new Date(Date.now() + 30 * 60 * 1000) // صالح لمدة 30 دقيقة
    };
  }

  /**
   * الحصول على جميع الأسعار الحالية
   */
  async getAllCurrentPrices(governorate?: string): Promise<PriceListItem[]> {
    const prices = await this.prisma.price.findMany({
      where: {
        effectiveDate: { lte: new Date() },
        OR: [
          { expiryDate: null },
          { expiryDate: { gt: new Date() } }
        ],
        governorate: governorate ?? null
      },
      include: {
        materialType: {
          include: { category: true }
        }
      },
      orderBy: [
        { materialType: { category: { sortOrder: 'asc' } } },
        { materialType: { sortOrder: 'asc' } }
      ]
    });
    
    // إضافة نسبة التغير
    return Promise.all(prices.map(async (price) => {
      const yesterdayPrice = await this.getPriceAt(
        price.materialTypeId,
        new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      
      const change24h = yesterdayPrice 
        ? ((price.pricePerKg - yesterdayPrice.pricePerKg) / yesterdayPrice.pricePerKg) * 100
        : 0;
      
      return {
        ...price,
        change24h: Math.round(change24h * 10) / 10
      };
    }));
  }
}
```

### 8.2 API Endpoints

```typescript
// controllers/prices.controller.ts

@Controller('api/prices')
export class PricesController {
  constructor(private pricingService: PricingService) {}

  /**
   * GET /api/prices
   * الحصول على جميع الأسعار الحالية
   */
  @Get()
  async getAllPrices(
    @Query('governorate') governorate?: string,
    @Query('categoryId') categoryId?: string
  ): Promise<ApiResponse<PriceListItem[]>> {
    const prices = await this.pricingService.getAllCurrentPrices(governorate);
    
    const filtered = categoryId
      ? prices.filter(p => p.materialType.categoryId === categoryId)
      : prices;
    
    return {
      success: true,
      data: filtered,
      meta: {
        lastUpdated: new Date(),
        count: filtered.length
      }
    };
  }

  /**
   * POST /api/prices/calculate
   * حساب قيمة الخردة
   */
  @Post('calculate')
  async calculateValue(
    @Body() body: CalculateValueDto
  ): Promise<ApiResponse<C2BPricingResult>> {
    const result = await this.pricingService.calculatePickupPrice(
      body.materials,
      body.governorate
    );
    
    return {
      success: true,
      data: result
    };
  }

  /**
   * GET /api/prices/history/:materialTypeId
   * تاريخ الأسعار
   */
  @Get('history/:materialTypeId')
  async getPriceHistory(
    @Param('materialTypeId') materialTypeId: string,
    @Query('period') period: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<ApiResponse<PriceHistoryPoint[]>> {
    const history = await this.pricingService.getPriceHistory(materialTypeId, period);
    
    return {
      success: true,
      data: history
    };
  }
}
```

---

## 📊 ملخص الخوارزميات

| الخوارزمية | الهدف | التكرار |
|------------|-------|---------|
| السعر المرجعي | سعر موحد للسوق | كل ساعة |
| تعديل الجودة | عدالة حسب النوعية | لحظي |
| تعديل الكمية | حوافز للكميات | لحظي |
| تعديل الموقع | تغطية تكاليف النقل | لحظي |
| C2B Pricing | سعر عادل + هامش | لحظي |
| تنبيهات الأسعار | إخطار المستخدمين | عند التغير |
| المطابقة | ربط البائع بالمشتري | عند الطلب |

---

*آخر تحديث: ديسمبر 2024*
*Xchange Egypt - Scrap Marketplace*
