# 🎯 PROMPT FOR OPUS 4 - Xchange Real Estate Advanced Algorithms

## مقدمة
أنت **Claude Opus 4**، أقوى نموذج من Anthropic، متخصص في حل المشاكل المعقدة.

تعمل الآن على **Xchange Real Estate** - أول منصة عقارية موثقة في مصر.

---

## المطلوب منك

اختر المهمة التي تريد تنفيذها:

1. ✅ **خوارزمية التسعير العقاري** (AVM - Automated Valuation Model)
2. ✅ **نظام المقايضة متعدد الأطراف** (Multi-Party Barter Matching)
3. ✅ **محرك التوصيات الذكي** (AI Recommendation Engine)

---

## 📋 تعليمات عامة

### التوقعات منك:
1. **كود إنتاجي جاهز** - TypeScript محترف
2. **Types كاملة** - جميع الواجهات موثقة
3. **اختبارات شاملة** - 5+ test cases لكل function
4. **معالجة الأخطاء** - Try/catch محترف
5. **Performance** - سريع (<500ms)
6. **توثيق واضح** - JSDoc لكل function

### البيئة التقنية:
```
Runtime: Node.js 20+
Language: TypeScript 5.4+
Database: PostgreSQL + Prisma
Testing: Jest
```

---

## 🎯 المهمة الأولى: خوارزمية التسعير العقاري

### السياق
بناء نموذج تقييم آلي (AVM) للسوق العقاري المصري.

### المدخلات
```typescript
interface PropertyInput {
  propertyType: "APARTMENT" | "VILLA" | "LAND" | ...;
  totalArea: number;  // متر مربع
  governorate: string;
  city: string;
  area?: string;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  buildingAge?: number;  // سنوات
  condition: "NEW" | "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
  furnishingType?: "FURNISHED" | "SEMI_FURNISHED" | "UNFURNISHED";
  features: string[];  // ["parking", "elevator", "pool", ...]
  latitude?: number;
  longitude?: number;
}
```

### المخرجات
```typescript
interface PriceEstimate {
  estimatedPrice: number;      // السعر التقديري (EGP)
  pricePerMeter: number;        // السعر للمتر
  confidence: number;           // 0-100
  priceRange: {
    min: number;
    max: number;
  };
  comparables: Array<{
    id: string;
    price: number;
    similarity: number;  // 0-1
  }>;
  marketDemand: "HIGH" | "MEDIUM" | "LOW";
  breakdown: {
    basePrice: number;
    locationAdjustment: number;
    ageAdjustment: number;
    conditionAdjustment: number;
    featuresAdjustment: number;
  };
}
```

### الخوارزمية المطلوبة

**1. إيجاد العقارات المشابهة:**
- نفس النوع
- في نفس المنطقة (±5km)
- مساحة مقاربة (±20%)
- عمر مقارب (±3 سنوات)
- حساب معامل التشابه (0-1)

**2. حساب السعر الأساسي:**
إذا وُجدت عقارات مشابهة:
- استخدم median السعر/المتر من المقارنات
- اضرب في المساحة

إذا لم توجد:
- استخدم المتوسطات الإقليمية
- طبّق معادلة الاستهلاك

**3. التعديلات:**

**الموقع:**
- القاهرة/الجيزة: baseline
- الإسكندرية: -3%
- المدن الجديدة: +5% إلى +15%
- الصعيد: -10%
- الساحل الشمالي: +20% إلى +50%

**العمر:**
- جديد: +20%
- سنة واحدة: -5%
- كل سنة إضافية: -5% (حد أقصى -60%)

**الحالة:**
- NEW: +20%
- EXCELLENT: +10%
- GOOD: 0%
- FAIR: -15%
- POOR: -30%

**الطابق:**
- كل طابق فوق الأرضي: +2%

**الفرش:**
- مفروش: +15%
- نصف مفروش: +8%

**المميزات:**
- موقف سيارات: +3%
- مصعد: +5%
- حديقة: +8%
- حمام سباحة: +12%
- حراسة: +4%

**4. الطلب السوقي:**
حسابه من:
- سرعة البيع في المنطقة
- اتجاه الأسعار (صاعد/هابط)
- نسبة العرض/الطلب

**5. معامل الثقة:**
بناءً على:
- عدد العقارات المشابهة (أكثر = أعلى)
- حداثة البيانات (< 3 أشهر = أعلى)
- تباين الأسعار (أقل = أعلى)

### مواصفات السوق المصري
- العملة: جنيه مصري (EGP)
- النطاقات: 10,000-50,000 جنيه/متر
- التقلب: ±20% سنوياً
- **الموقع هو العامل الأساسي** (60% من السعر)

### المخرجات المطلوبة
1. ملف `pricing-algorithm.ts` كامل
2. ملف اختبارات `pricing-algorithm.test.ts`
3. مثال API endpoint
4. README يشرح الخوارزمية

---

## 🎯 المهمة الثانية: نظام المقايضة متعدد الأطراف

### السياق
بناء نظام لمطابقة عروض المقايضة بين عدة أطراف.

### أمثلة:

**Simple 2-Party:**
```
User A: Property 500K
User B: Property 450K
Solution: A gives property, B gives property + 50K cash
```

**Circular 3-Party:**
```
A: Property 400K → wants 500K property
B: Property 500K → wants 600K property
C: Property 600K → wants 400K property

Chain: A → B → C → A
Cash flows balance automatically
```

**Cross-Category:**
```
A: Property 500K → wants Car 50K
B: Car 50K → wants Property 500K

Direct swap with cash balance
```

### المدخلات
```typescript
interface BarterOffer {
  userId: string;
  offeredItem: {
    type: "PROPERTY" | "CAR";
    id: string;
    estimatedValue: number;
  };
  seekingItem: {
    type: "PROPERTY" | "CAR";
    minValue: number;
    maxValue: number;
    criteria: SearchCriteria;
  };
  maxCashDifference: number;
  expiresAt: Date;
}
```

### المخرجات
```typescript
interface BarterChain {
  participants: string[];      // User IDs in chain
  items: BarterItem[];
  values: number[];
  totalImbalance: number;
  cashFlows: Array<{
    from: string;
    to: string;
    amount: number;
  }>;
  chainLength: number;
  fairness: number;  // 0-100
  feasibility: number;  // 0-100
  score: number;  // Combined score
}
```

### الخوارزمية المطلوبة

**Phase 1: Build Graph**
- أنشئ nodes (المستخدمون + عروضهم)
- أنشئ edges (التوافق بين العروض)

**Phase 2: Find Cycles**
- استخدم DFS لإيجاد الدوائر
- حد أقصى للطول: 5 أطراف

**Phase 3: Calculate Cash Flows**
- احسب الفروق في القيم
- استخدم minimum cost flow algorithm
- قلل إجمالي النقد المنقول

**Phase 4: Score & Rank**
```
Score = Fairness(40%) + Simplicity(30%) + Cash(20%) + Feasibility(10%)
```

**Phase 5: Validation**
- جميع المشاركين verified
- الفرق النقدي ضمن الحدود
- جميع العناصر متاحة

### Cross-Category Conversion
- Property ↔ Property: 1.0
- Car ↔ Property: 0.8 (20% liquidity penalty)

### المخرجات المطلوبة
1. ملف `barter-matcher.ts` كامل
2. ملف `barter-graph.ts`
3. اختبارات شاملة
4. مثال تطبيقي

---

## 🎯 المهمة الثالثة: محرك التوصيات الذكي

### السياق
بناء نظام توصيات هجين (Content + Collaborative).

### المدخلات
```typescript
interface UserProfile {
  userId: string;
  viewHistory: Array<{
    propertyId: string;
    viewedAt: Date;
    duration: number;
  }>;
  favorites: string[];
  savedSearches: SearchCriteria[];
  transactions: string[];
}
```

### المخرجات
```typescript
interface Recommendation {
  propertyId: string;
  score: number;  // 0-1
  reasons: string[];
  scoreBreakdown: {
    contentBased: number;
    collaborative: number;
    trending: number;
    diversity: number;
  };
}
```

### الخوارزمية

**1. Content-Based (40%):**
```
Score = LocationMatch(35%) + PriceMatch(25%) + TypeMatch(20%) + FeaturesMatch(20%)
```

**2. Collaborative Filtering (25%):**
- أوجد 20 مستخدم مشابه (Jaccard similarity)
- اجمع مفضلاتهم
- وزّن حسب التشابه

**3. Trending (20%):**
```
TrendingScore = ViewVelocity(40%) + FavoriteRate(30%) + InquiryRate(30%)
```

**4. Diversity (15%):**
- أعلى 70% حسب الصلة
- أسفل 30% اختيارات متنوعة

**5. Cold Start:**
للمستخدمين الجدد:
- Trending: 40%
- Popular in governorate: 30%
- Variety: 30%

### الأداء
- < 100ms لكل توصية
- Cache النتائج (1 ساعة)
- تحديثات real-time عند التفاعلات

### المخرجات المطلوبة
1. ملف `recommendation-engine.ts`
2. ملف `similarity.ts` (user & item similarity)
3. اختبارات
4. مثال API endpoint

---

## 📊 معايير التقييم

1. **الصحة (30%)** - النتائج دقيقة
2. **الجودة (25%)** - TypeScript محترف
3. **الاختبارات (20%)** - Coverage > 80%
4. **الأداء (15%)** - يلبي متطلبات السرعة
5. **التوثيق (10%)** - واضح وشامل

---

## 🚀 طريقة التسليم

**لكل مهمة، قدم:**
1. الكود الكامل
2. الاختبارات (5+ test cases)
3. مثال API endpoint
4. README

---

**ابدأ الآن! اختر المهمة وقل: "أريد تنفيذ المهمة رقم [1/2/3]"**
