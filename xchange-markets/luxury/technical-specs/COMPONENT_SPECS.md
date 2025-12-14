# 🎨 مواصفات المكونات - Xchange Luxury

## UI Components Specification

---

## 🎨 Design System

### Colors

```css
:root {
  /* Primary Colors */
  --color-primary: #1a1a2e;      /* Navy - الرئيسي */
  --color-primary-light: #2d2d44;
  --color-primary-dark: #0f0f1a;
  
  /* Secondary Colors */
  --color-secondary: #c9a227;    /* Gold - الذهبي */
  --color-secondary-light: #d4b343;
  --color-secondary-dark: #a68620;
  
  /* Accent Colors */
  --color-accent: #e94560;       /* Red - للتنبيهات */
  --color-success: #10b981;      /* Green */
  --color-warning: #f59e0b;      /* Orange */
  --color-error: #ef4444;        /* Red */
  
  /* Neutral Colors */
  --color-white: #ffffff;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  --color-black: #000000;
  
  /* Verification Colors */
  --color-verified-ai: #3b82f6;      /* Blue */
  --color-verified-expert: #c9a227;  /* Gold */
  --color-verified-full: #10b981;    /* Green */
}
```

### Typography

```css
:root {
  /* Font Families */
  --font-arabic: 'Cairo', 'Noto Sans Arabic', sans-serif;
  --font-english: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Font Sizes */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  
  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

### Spacing

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
```

### Border Radius

```css
:root {
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-2xl: 1.5rem;   /* 24px */
  --radius-full: 9999px;
}
```

### Shadows

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}
```

---

## 🧩 Core Components

### 1. Button

```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}

// Usage
<Button variant="primary" size="md" loading={isLoading}>
  إضافة للسلة
</Button>
```

**Variants:**
| Variant | Background | Text | Border |
|---------|------------|------|--------|
| primary | gold | white | none |
| secondary | navy | white | none |
| outline | transparent | gold | gold |
| ghost | transparent | gray | none |
| danger | red | white | none |

**Sizes:**
| Size | Padding | Font Size | Height |
|------|---------|-----------|--------|
| sm | 8px 16px | 14px | 32px |
| md | 12px 24px | 16px | 40px |
| lg | 16px 32px | 18px | 48px |

---

### 2. Input

```tsx
interface InputProps {
  type: 'text' | 'email' | 'tel' | 'number' | 'password';
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  value: string;
  onChange: (value: string) => void;
}

// Usage
<Input
  type="tel"
  label="رقم الهاتف"
  placeholder="+20 10 1234 5678"
  leftIcon={<PhoneIcon />}
  error={errors.phone}
  value={phone}
  onChange={setPhone}
/>
```

---

### 3. Select

```tsx
interface SelectProps {
  label?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  multiple?: boolean;
  searchable?: boolean;
  error?: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

// Usage
<Select
  label="الماركة"
  placeholder="اختر الماركة"
  options={brands}
  searchable
  value={selectedBrand}
  onChange={setSelectedBrand}
/>
```

---

### 4. Badge

```tsx
interface BadgeProps {
  variant: 'default' | 'success' | 'warning' | 'error' | 'verified';
  size: 'sm' | 'md';
  children: ReactNode;
}

// Verification Badges
<Badge variant="verified" size="sm">
  <ShieldCheckIcon /> Xchange Verified
</Badge>
```

**Verification Badge Variants:**
```tsx
// AI Verified (Blue)
<VerificationBadge level="ai" />

// Expert Verified (Gold)
<VerificationBadge level="expert" />

// Fully Verified (Green + Gold)
<VerificationBadge level="full" />
```

---

### 5. Card

```tsx
interface CardProps {
  variant: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

// Usage
<Card variant="elevated" padding="md">
  <ProductDetails />
</Card>
```

---

### 6. Modal

```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: ReactNode;
  footer?: ReactNode;
}

// Usage
<Modal
  isOpen={showOfferModal}
  onClose={() => setShowOfferModal(false)}
  title="تقديم عرض"
  size="md"
>
  <OfferForm />
</Modal>
```

---

### 7. Toast/Notification

```tsx
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Usage
toast({
  type: 'success',
  title: 'تم بنجاح',
  message: 'تم إضافة المنتج للمفضلة'
});
```

---

## 📦 Product Components

### 8. ProductCard

```tsx
interface ProductCardProps {
  product: {
    id: string;
    title: string;
    price: number;
    primaryImage: string;
    brand: { name: string };
    condition: string;
    authenticationStatus: string;
    seller: {
      sellerLevel: string;
      sellerRating: number;
    };
  };
  variant: 'grid' | 'list';
  onFavorite?: () => void;
  isFavorited?: boolean;
}
```

**Grid View Layout:**
```
┌─────────────────────────┐
│  ┌───────────────────┐  │
│  │                   │  │
│  │      IMAGE        │  │  ← 1:1 aspect ratio
│  │                   │  │
│  │  ❤️              🔒  │  ← Favorite + Verified badge
│  └───────────────────┘  │
│                         │
│  ROLEX                  │  ← Brand (muted)
│  Submariner Date        │  ← Title (2 lines max)
│                         │
│  450,000 ج.م           │  ← Price (bold, gold)
│  ممتاز ⭐ 4.8           │  ← Condition + Rating
│                         │
└─────────────────────────┘
```

---

### 9. ProductGallery

```tsx
interface ProductGalleryProps {
  images: {
    id: string;
    url: string;
    thumbnailUrl: string;
    imageType: string;
  }[];
  onImageClick?: (index: number) => void;
}
```

**Features:**
- Main image with zoom on hover
- Thumbnail strip below
- Fullscreen lightbox
- Swipe support on mobile
- Lazy loading

---

### 10. ProductDetails

```tsx
interface ProductDetailsProps {
  product: Product;
  onMakeOffer: () => void;
  onBuyNow: () => void;
  onAddToFavorites: () => void;
  onShare: () => void;
}
```

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  ROLEX                                                   │
│  Submariner Date 116610LN                               │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │ 🔒 XCHANGE VERIFIED                                 ││
│  │ AI + Expert Verified | شهادة #XL-2024-001          ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  450,000 ج.م                    السعر الأصلي: 380,000   │
│                                                          │
│  ┌────────────────┐  ┌────────────────┐                 │
│  │   شراء الآن    │  │  تقديم عرض    │                 │
│  └────────────────┘  └────────────────┘                 │
│                                                          │
│  ❤️ المفضلة    🔗 مشاركة    🔄 طلب مقايضة              │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  📋 التفاصيل                                            │
│  ├─ الحالة: ممتاز                                       │
│  ├─ السنة: 2020                                         │
│  ├─ الحركة: أوتوماتيك                                   │
│  ├─ حجم العلبة: 40mm                                    │
│  └─ العلبة والأوراق: متوفرة ✓                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### 11. SellerCard

```tsx
interface SellerCardProps {
  seller: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    sellerLevel: string;
    sellerRating: number;
    totalSales: number;
    memberSince: string;
    responseTime?: string;
  };
  onContact?: () => void;
  onViewProfile?: () => void;
}
```

**Layout:**
```
┌─────────────────────────────────────────┐
│  ┌────┐                                 │
│  │ 👤 │  أحمد م.                        │
│  └────┘  ⭐ 4.8 (15 تقييم)              │
│          🏆 بائع موثوق                  │
│                                         │
│  📅 عضو منذ يناير 2024                  │
│  ⏱️ عادة يرد خلال ساعة                  │
│                                         │
│  ┌─────────────┐  ┌─────────────┐      │
│  │  مراسلة    │  │ عرض الملف  │      │
│  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────┘
```

---

### 12. PriceTag

```tsx
interface PriceTagProps {
  price: number;
  originalPrice?: number;
  currency?: string;
  size: 'sm' | 'md' | 'lg';
  showDiscount?: boolean;
}

// Usage
<PriceTag
  price={450000}
  originalPrice={520000}
  size="lg"
  showDiscount
/>

// Renders:
// 450,000 ج.م
// ~~520,000~~ (-13%)
```

---

### 13. ConditionBadge

```tsx
interface ConditionBadgeProps {
  condition: 'new' | 'excellent' | 'very_good' | 'good' | 'fair';
  showLabel?: boolean;
}
```

**Condition Colors:**
| Condition | Arabic | Color |
|-----------|--------|-------|
| new | جديد | Green |
| excellent | ممتاز | Blue |
| very_good | جيد جداً | Teal |
| good | جيد | Yellow |
| fair | مقبول | Orange |

---

## 🔍 Search Components

### 14. SearchBar

```tsx
interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  suggestions?: string[];
  recentSearches?: string[];
}
```

---

### 15. FilterPanel

```tsx
interface FilterPanelProps {
  filters: {
    categories: Category[];
    brands: Brand[];
    conditions: string[];
    priceRange: { min: number; max: number };
  };
  selectedFilters: SelectedFilters;
  onChange: (filters: SelectedFilters) => void;
  onClear: () => void;
}
```

**Mobile:** Bottom sheet
**Desktop:** Side panel

---

## 💰 Transaction Components

### 16. OfferForm

```tsx
interface OfferFormProps {
  product: Product;
  userProducts?: Product[]; // للمقايضة
  onSubmit: (offer: OfferData) => void;
  onCancel: () => void;
}
```

---

### 17. TransactionTimeline

```tsx
interface TransactionTimelineProps {
  steps: {
    status: TransactionStatus;
    label: string;
    timestamp?: string;
    isActive: boolean;
    isCompleted: boolean;
  }[];
}
```

**Visual:**
```
  ✓ تم الدفع
  │  1 ديسمبر 10:30 ص
  │
  ✓ تم الشحن
  │  2 ديسمبر 10:00 ص
  │  Bosta: BOSTA123456
  │
  ○ في الانتظار
  │  التوصيل المتوقع: 4 ديسمبر
  │
  ○ فترة الفحص
  │  14 يوم من الاستلام
  │
  ○ مكتمل
```

---

### 18. PaymentMethodSelector

```tsx
interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selected: string;
  onChange: (method: string) => void;
}
```

---

## 📱 Layout Components

### 19. Header

```tsx
interface HeaderProps {
  showSearch?: boolean;
  showNotifications?: boolean;
  transparent?: boolean;
}
```

---

### 20. BottomNav

```tsx
// Mobile only
interface BottomNavProps {
  activeTab: 'home' | 'search' | 'add' | 'messages' | 'profile';
}
```

**Items:**
- 🏠 الرئيسية
- 🔍 البحث
- ➕ إضافة (FAB style)
- 💬 الرسائل (with badge)
- 👤 حسابي

---

### 21. EmptyState

```tsx
interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Usage
<EmptyState
  icon={<SearchIcon />}
  title="لا توجد نتائج"
  description="جرب تغيير معايير البحث"
  action={{
    label: "مسح الفلاتر",
    onClick: clearFilters
  }}
/>
```

---

### 22. LoadingState

```tsx
interface LoadingStateProps {
  type: 'spinner' | 'skeleton' | 'dots';
  text?: string;
}

// Skeleton for ProductCard
<ProductCardSkeleton />

// Spinner for actions
<LoadingState type="spinner" text="جاري التحميل..." />
```

---

## 🔔 Notification Components

### 23. NotificationItem

```tsx
interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    titleAr: string;
    bodyAr?: string;
    isRead: boolean;
    createdAt: string;
    referenceType?: string;
    referenceId?: string;
  };
  onClick: () => void;
}
```

---

### 24. NotificationBadge

```tsx
interface NotificationBadgeProps {
  count: number;
  max?: number; // default 99
}

// Renders: 3, 15, 99+
```

---

## 📊 Data Display Components

### 25. StatsCard

```tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: ReactNode;
}

// Usage
<StatsCard
  title="إجمالي المبيعات"
  value="1,250,000 ج.م"
  change={{ value: 15, type: 'increase' }}
  icon={<TrendingUpIcon />}
/>
```

---

### 26. RatingDisplay

```tsx
interface RatingDisplayProps {
  rating: number;
  count?: number;
  size: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

// Renders: ⭐⭐⭐⭐☆ 4.2 (15)
```

---

## 🎯 Responsive Breakpoints

```css
/* Mobile First */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

---

## 🌙 Dark Mode (Future)

```css
.dark {
  --color-background: #0f0f1a;
  --color-surface: #1a1a2e;
  --color-text-primary: #ffffff;
  --color-text-secondary: #9ca3af;
}
```

---

*آخر تحديث: ديسمبر 2024*
