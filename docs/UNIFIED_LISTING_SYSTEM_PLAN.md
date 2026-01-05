# خطة توحيد نظام إضافة الإعلانات - Unified Listing System

## المشكلة الحالية

### الوضع الحالي: 12 طريقة مختلفة لإضافة إعلان!

| # | الصفحة | النوع | عدد الخطوات | يدعم المقايضة | يدعم المزاد |
|---|--------|-------|-------------|---------------|-------------|
| 1 | `/auctions/new` | مزاد | 1 | ❌ | ✅ |
| 2 | `/barter/new` | مقايضة | 3 | ✅ | ❌ |
| 3 | `/cars/sell` | بيع سيارات | 4 | ✅ | ❌ |
| 4 | `/mobiles/sell` | بيع موبايلات | 5 | ✅ | ❌ |
| 5 | `/properties/create` | عقارات | 6 | ✅ | ❌ |
| 6 | `/items/new` | منتجات عامة | 1 | ✅ | ✅ |
| 7 | `/inventory/add` | مخزون | متعدد | ✅ | ✅ |
| 8 | `/luxury/sell` | منتجات فاخرة | متعدد | ❌ | ❌ |
| 9 | `/gold/sell` | ذهب | 3 | ❌ | ❌ |
| 10 | `/pools/new` | مجمع مقايضة | 4 | ✅ | ❌ |
| 11 | `/marketplace/rides/new` | طلب توصيل | 4 | ❌ | ❌ |
| 12 | `/marketplace/shipping/new` | طلب شحن | 4 | ❌ | ❌ |

### المشاكل:
1. **تجربة مستخدم مربكة** - المستخدم لا يعرف أي صفحة يستخدم
2. **تكرار الكود** - نفس الحقول مكررة في كل مكان (الموقع، الصور، السعر)
3. **واجهات مختلفة** - بعضها خطوة واحدة، بعضها 6 خطوات
4. **APIs مختلفة** - كل سوق له endpoint خاص

---

## الحل المقترح: نظام موحد

### المفهوم الأساسي

```
┌─────────────────────────────────────────────────────────────┐
│                    نقطة دخول واحدة                          │
│                    /listing/new                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              الخطوة 1: ماذا تريد أن تفعل؟                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   أريد بيع  │    │  أريد شراء  │    │ أريد مقايضة │     │
│  │     🏷️      │    │     🛒      │    │     🔄      │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              الخطوة 2: ما نوع المنتج/الخدمة؟                │
│                                                             │
│  📱 موبايلات    🚗 سيارات    🏠 عقارات    ♻️ خردة          │
│  💎 فاخرة      💰 ذهب       📦 منتجات عامة                  │
│  🚚 شحن       🚗 توصيل     🛠️ خدمات                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│      الخطوة 3: بيانات المنتج (حسب النوع)                   │
│      ─────────────────────────────────────                  │
│      حقول مشتركة + حقول خاصة بالفئة                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              الخطوة 4: كيف تريد البيع؟                      │
│  (إذا اختار "بيع")                                          │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │ بيع مباشر  │    │    مزاد    │    │  قبول مقايضة │     │
│  │   💵        │    │    🔨      │    │     🔄       │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              الخطوة 5: السعر والتفاصيل النهائية             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     المراجعة والنشر                         │
└─────────────────────────────────────────────────────────────┘
```

---

## الهيكل التقني المقترح

### 1. الملفات الجديدة

```
frontend/
├── app/
│   └── listing/
│       └── new/
│           ├── page.tsx              # الصفحة الرئيسية
│           └── layout.tsx            # Layout مع progress bar
│
├── components/
│   └── listing/
│       ├── UnifiedListingWizard.tsx  # Wizard الموحد
│       ├── steps/
│       │   ├── IntentStep.tsx        # اختيار النية (بيع/شراء/مقايضة)
│       │   ├── CategoryStep.tsx      # اختيار الفئة
│       │   ├── DetailsStep.tsx       # بيانات المنتج
│       │   ├── TransactionStep.tsx   # نوع المعاملة
│       │   ├── PricingStep.tsx       # السعر
│       │   └── ReviewStep.tsx        # المراجعة
│       │
│       ├── fields/
│       │   ├── CommonFields.tsx      # حقول مشتركة
│       │   ├── MobileFields.tsx      # حقول الموبايلات
│       │   ├── CarFields.tsx         # حقول السيارات
│       │   ├── PropertyFields.tsx    # حقول العقارات
│       │   ├── GoldFields.tsx        # حقول الذهب
│       │   ├── LuxuryFields.tsx      # حقول الفاخرة
│       │   └── GeneralFields.tsx     # حقول عامة
│       │
│       └── hooks/
│           ├── useListingForm.ts     # إدارة النموذج
│           ├── usePriceEstimation.ts # تقدير السعر
│           └── useListingSubmit.ts   # إرسال الإعلان
│
├── lib/
│   └── api/
│       └── unified-listing.ts        # API موحد
│
└── types/
    └── listing.ts                    # Types موحدة
```

### 2. Types موحدة

```typescript
// types/listing.ts

// نوع النية
type ListingIntent = 'SELL' | 'BUY' | 'BARTER';

// نوع المعاملة
type TransactionType = 'DIRECT' | 'AUCTION' | 'REVERSE_AUCTION' | 'BARTER';

// فئات المنتجات
type ListingCategory =
  | 'MOBILE'
  | 'CAR'
  | 'PROPERTY'
  | 'GOLD'
  | 'LUXURY'
  | 'SCRAP'
  | 'GENERAL'
  | 'SERVICE_RIDE'
  | 'SERVICE_SHIPPING';

// الحقول المشتركة
interface CommonListingFields {
  title: string;
  description: string;
  governorate: string;
  city?: string;
  images: string[];
}

// حقول الموبايلات
interface MobileFields extends CommonListingFields {
  category: 'MOBILE';
  brand: string;
  model: string;
  storageCapacity: number;
  ramSize: number;
  batteryHealth: number;
  condition: 'A' | 'B' | 'C' | 'D';
  imei?: string;
  accessories?: string[];
}

// حقول السيارات
interface CarFields extends CommonListingFields {
  category: 'CAR';
  make: string;
  model: string;
  year: number;
  mileage: number;
  transmission: 'AUTOMATIC' | 'MANUAL';
  fuelType: string;
  condition: string;
  features?: string[];
}

// ... وهكذا لكل فئة

// الإعلان الموحد
interface UnifiedListing {
  intent: ListingIntent;
  transactionType: TransactionType;
  category: ListingCategory;

  // البيانات حسب الفئة
  data: MobileFields | CarFields | PropertyFields | ...;

  // بيانات المعاملة
  pricing: {
    price?: number;
    minPrice?: number;
    maxPrice?: number;
    acceptsNegotiation?: boolean;
  };

  // بيانات المزاد (إن وجد)
  auction?: {
    startingPrice: number;
    reservePrice?: number;
    buyNowPrice?: number;
    startTime: Date;
    endTime: Date;
  };

  // بيانات المقايضة (إن وجد)
  barter?: {
    acceptsBarter: boolean;
    preferences?: string[];
  };
}
```

### 3. API موحد

```typescript
// lib/api/unified-listing.ts

export async function createUnifiedListing(listing: UnifiedListing) {
  const { category, intent, transactionType } = listing;

  // تحديد الـ endpoint حسب الفئة
  const endpoints: Record<ListingCategory, string> = {
    MOBILE: '/mobiles/listings',
    CAR: '/cars/listings',
    PROPERTY: '/properties',
    GOLD: '/gold/listings',
    LUXURY: '/luxury/listings',
    SCRAP: '/scrap/listings',
    GENERAL: '/items',
    SERVICE_RIDE: '/marketplace/rides',
    SERVICE_SHIPPING: '/marketplace/shipping',
  };

  // تحويل البيانات للصيغة المطلوبة
  const payload = transformToLegacyFormat(listing);

  // إرسال للـ API
  const response = await apiClient.post(endpoints[category], payload);

  // إذا كان مزاد، إنشاء المزاد
  if (transactionType === 'AUCTION' && response.data.id) {
    await createAuction({
      itemId: response.data.id,
      ...listing.auction
    });
  }

  return response;
}
```

---

## خطة التنفيذ

### المرحلة 1: البنية الأساسية (أسبوع 1)
- [ ] إنشاء صفحة `/listing/new`
- [ ] إنشاء `UnifiedListingWizard` component
- [ ] إنشاء الـ types الموحدة
- [ ] إنشاء `useListingForm` hook

### المرحلة 2: الخطوات المشتركة (أسبوع 2)
- [ ] `IntentStep` - اختيار النية
- [ ] `CategoryStep` - اختيار الفئة
- [ ] `CommonFields` - الحقول المشتركة
- [ ] `ReviewStep` - المراجعة

### المرحلة 3: حقول الفئات (أسبوع 3-4)
- [ ] `MobileFields` - حقول الموبايلات
- [ ] `CarFields` - حقول السيارات
- [ ] `PropertyFields` - حقول العقارات
- [ ] `GoldFields` - حقول الذهب
- [ ] `LuxuryFields` - حقول الفاخرة
- [ ] `GeneralFields` - حقول عامة

### المرحلة 4: التكامل (أسبوع 5)
- [ ] `TransactionStep` - اختيار نوع المعاملة
- [ ] `PricingStep` - السعر
- [ ] تكامل مع APIs الحالية
- [ ] تكامل مع نظام المزادات
- [ ] تكامل مع نظام المقايضة

### المرحلة 5: الاختبار والنشر (أسبوع 6)
- [ ] اختبار جميع السيناريوهات
- [ ] إضافة redirects من الصفحات القديمة
- [ ] توثيق النظام الجديد

---

## الفوائد المتوقعة

| الفائدة | الوصف |
|---------|-------|
| **تجربة موحدة** | نقطة دخول واحدة لكل أنواع الإعلانات |
| **كود أقل** | تقليل التكرار بنسبة 60-70% |
| **صيانة أسهل** | تغيير واحد يؤثر على كل الأسواق |
| **مرونة** | سهولة إضافة أسواق جديدة |
| **UX أفضل** | wizard موحد مع progress واضح |

---

## التوافق مع النظام الحالي

### الصفحات القديمة
- ستظل الصفحات القديمة تعمل (backwards compatibility)
- يمكن إضافة redirect تدريجي للصفحة الجديدة
- APIs الحالية لن تتغير

### الترحيل التدريجي
1. إطلاق النظام الجديد بجانب القديم
2. A/B testing لقياس الأداء
3. ترحيل تدريجي للمستخدمين
4. إزالة الصفحات القديمة بعد فترة

---

## هل تريد أن أبدأ في تنفيذ هذه الخطة؟

اختر أحد الخيارات:
1. **نعم، ابدأ فوراً** - سأبدأ بإنشاء البنية الأساسية
2. **راجع الخطة أولاً** - أرسل ملاحظاتك وأعدل الخطة
3. **ابدأ بجزء معين** - حدد أي مرحلة تريد البدء بها
