# Xchange Services Marketplace

## سوق خدمات إكسشينج - The First Integrated Services Marketplace in MENA

<div dir="rtl">

**أول منصة خدمات متكاملة في الشرق الأوسط وشمال أفريقيا** - تربط مقدمي الخدمات المستقلين بالعملاء من أسواق المنتجات العشرة على إكسشينج.

</div>

---

## Overview

Xchange Services Marketplace is a world-class mobile application that integrates services with 10 existing product marketplaces (cars, real estate, mobile phones, gold, silver, luxury goods, scrap materials, auctions, tenders, and a unique multi-party barter system).

### Key Differentiators

1. **10 Product Marketplace Integration** - Smart linking between products and relevant services
2. **Trade Credits System** - Use credits earned from selling products to pay for services
3. **Bulletproof Escrow** - Payment protection with milestone support for large projects
4. **Xchange Protect Guarantee** - 14-day to 365-day service guarantees
5. **Express Services** - 60-minute response guarantee
6. **AI-Powered Recommendations** - Predictive maintenance and smart suggestions
7. **Arabic-First** - Full RTL support with Egyptian dialect AI chatbot
8. **Xchange Academy** - Provider training and certification programs

---

## Tech Stack

### Mobile App (React Native + Expo)

```
├── Framework: React Native 0.73+ with Expo
├── Language: TypeScript
├── State Management: Zustand
├── Data Fetching: TanStack Query (React Query)
├── Navigation: React Navigation 6+
├── UI Components: React Native Paper
├── Forms: React Hook Form + Zod
├── Real-time: Socket.io Client
├── Maps: react-native-maps
├── Internationalization: i18next
└── Storage: MMKV / AsyncStorage
```

### Backend (Express.js + TypeScript)

```
├── Framework: Express.js
├── Language: TypeScript
├── ORM: Prisma
├── Database: PostgreSQL
├── Cache: Redis
├── Real-time: Socket.io
├── Validation: Zod
├── Authentication: JWT
└── File Storage: Cloudflare R2 / AWS S3
```

---

## Directory Structure

```
xchange-markets/Services/
├── database/
│   └── schema.prisma          # Complete Prisma schema (50+ models)
├── docs/
│   ├── API_SPECIFICATION.md   # Full API documentation
│   ├── BUSINESS_LOGIC.md      # Business rules and flows
│   └── DEPLOYMENT.md          # Deployment guide
├── api-specs/
│   └── openapi.yaml           # OpenAPI 3.0 specification
└── mobile-app/
    ├── App.tsx                # Main app entry
    ├── package.json           # Dependencies
    ├── src/
    │   ├── components/        # Reusable UI components
    │   │   ├── ui/           # Basic UI elements
    │   │   ├── services/     # Service-related components
    │   │   ├── booking/      # Booking flow components
    │   │   ├── provider/     # Provider-specific components
    │   │   ├── chat/         # Chat components
    │   │   └── common/       # Shared components
    │   ├── screens/          # App screens
    │   │   ├── auth/         # Authentication screens
    │   │   ├── home/         # Home & discovery
    │   │   ├── search/       # Search & filters
    │   │   ├── services/     # Service detail & provider
    │   │   ├── bookings/     # Booking management
    │   │   ├── profile/      # User profile & settings
    │   │   ├── provider/     # Provider dashboard
    │   │   ├── admin/        # Admin screens
    │   │   └── chat/         # Chat & AI chatbot
    │   ├── navigation/       # Navigation configuration
    │   ├── hooks/            # Custom React hooks
    │   ├── store/            # Zustand stores
    │   ├── services/         # API services
    │   │   └── api/          # API client & endpoints
    │   ├── utils/            # Utility functions
    │   ├── constants/        # App constants & config
    │   ├── types/            # TypeScript types
    │   ├── i18n/             # Internationalization
    │   │   └── translations/ # AR/EN translations
    │   └── assets/           # Images, icons, fonts
    └── __tests__/            # Test files
```

---

## Features

### Customer Features

| Feature | Description |
|---------|-------------|
| **Service Discovery** | Search, filter, browse by category/location/rating |
| **Smart Recommendations** | AI-powered suggestions based on product purchases |
| **Booking Flow** | Date/time selection, add-ons, instant or request booking |
| **Trade Credits** | Pay with credits earned from product sales |
| **Xchange Protect** | 4-tier protection plans (14/30/90/365 days) |
| **Express Services** | 60-minute guaranteed response |
| **Real-time Tracking** | Track provider location during service |
| **In-app Chat** | Message providers directly |
| **Reviews & Ratings** | Rate services with photos/videos |
| **Dispute Resolution** | Open disputes with evidence upload |
| **Wallet Management** | Cash + Trade Credits balance |

### Provider Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Earnings, bookings, ratings overview |
| **Service Management** | Create, edit, pause services |
| **Calendar & Availability** | Set working hours, block dates |
| **Booking Management** | Accept/reject, start, complete |
| **Express Mode** | Receive instant booking requests |
| **Earnings & Payouts** | Track earnings, request withdrawals |
| **Reviews Management** | Respond to customer reviews |
| **Certifications** | Upload and verify credentials |
| **Subscription Tiers** | Free, Trusted, Pro, Elite plans |

### Admin Features

| Feature | Description |
|---------|-------------|
| **Provider Approval** | Review and verify providers |
| **Dispute Resolution** | Mediate customer-provider disputes |
| **Analytics Dashboard** | GMV, bookings, ratings metrics |
| **Category Management** | Manage service categories |
| **Commission Settings** | Configure commission rates |

---

## Service Categories (Linked Marketplaces)

| Category | Linked Marketplace | Key Services |
|----------|-------------------|--------------|
| **Automotive** | Cars | Pre-purchase inspection, mobile mechanic, detailing, roadside assistance |
| **Real Estate** | Properties | Home inspection, renovation, interior design, cleaning, moving |
| **Mobile** | Mobiles | Device inspection, screen repair, data transfer, unlocking |
| **Precious Metals** | Gold/Silver | Valuation, authentication, jewelry repair, safe storage |
| **Luxury** | Luxury | Authentication, watch servicing, bag restoration |
| **Auctions** | Auctions | Pre-auction inspection, secure delivery, insurance |
| **Tenders** | Tenders | Bid preparation, project management, legal advisory |
| **Barter** | Barter | Multi-party valuation, trade mediation |
| **Recycling** | Scrap | Waste collection, sorting, recycling certificates |
| **General** | All | Photography, copywriting, shipping, legal docs |

---

## API Endpoints

### Services API

```
GET    /api/v1/services/categories         # Get all categories
GET    /api/v1/services/categories/:id     # Get category by ID
GET    /api/v1/services/search             # Search services
GET    /api/v1/services/featured           # Get featured services
GET    /api/v1/services/:id                # Get service details
POST   /api/v1/services/recommend          # Get recommendations
POST   /api/v1/services/:id/favorite       # Add to favorites
DELETE /api/v1/services/:id/favorite       # Remove from favorites
GET    /api/v1/services/favorites          # Get user favorites
```

### Bookings API

```
POST   /api/v1/bookings                    # Create booking
POST   /api/v1/bookings/calculate-price    # Calculate price
GET    /api/v1/bookings/my                 # Get customer bookings
GET    /api/v1/bookings/provider           # Get provider bookings
GET    /api/v1/bookings/:id                # Get booking details
POST   /api/v1/bookings/:id/cancel         # Cancel booking
POST   /api/v1/bookings/:id/accept         # Accept booking (provider)
POST   /api/v1/bookings/:id/reject         # Reject booking (provider)
POST   /api/v1/bookings/:id/on-way         # Mark on way (provider)
POST   /api/v1/bookings/:id/start          # Start service (provider)
POST   /api/v1/bookings/:id/complete       # Complete service (provider)
POST   /api/v1/bookings/:id/confirm-completion  # Confirm completion (customer)
```

### Providers API

```
POST   /api/v1/providers/register          # Register as provider
GET    /api/v1/providers/:id               # Get provider profile
GET    /api/v1/providers/search            # Search providers
PUT    /api/v1/providers/profile           # Update profile
GET    /api/v1/providers/services          # Get my services
POST   /api/v1/providers/services          # Create service
PUT    /api/v1/providers/services/:id      # Update service
DELETE /api/v1/providers/services/:id      # Delete service
GET    /api/v1/providers/availability      # Get availability
PUT    /api/v1/providers/availability      # Update availability
GET    /api/v1/providers/stats             # Get statistics
GET    /api/v1/providers/earnings          # Get earnings
POST   /api/v1/providers/payouts           # Request payout
GET    /api/v1/providers/subscription      # Get subscription
POST   /api/v1/providers/subscription/upgrade  # Upgrade tier
```

---

## Database Schema

### Core Models (50+ total)

- **ServiceProvider** - Provider profiles with verification levels
- **ServiceCategory** - Hierarchical categories linked to marketplaces
- **Service** - Service listings with pricing, add-ons, packages
- **ServiceBooking** - Booking records with escrow, protection
- **ServiceEscrow** - Payment escrow with milestone support
- **ServiceReview** - Ratings and reviews with media
- **ServiceDispute** - Dispute records with resolution
- **ProviderAvailability** - Working hours and blocked dates
- **ProviderCertification** - Professional credentials
- **CustomerServiceSubscription** - Maintenance subscriptions
- **AcademyCourse** - Training courses with modules/quizzes
- **ChatbotConversation** - AI chatbot sessions
- **PredictiveMaintenanceAlert** - Smart maintenance reminders

### Key Enums

```typescript
enum VerificationLevel {
  BASIC,          // ID verified only
  TRUSTED,        // Background check + 4.5★ + 20 bookings
  PRO,            // Certifications + 4.8★ + 50 bookings
  ELITE,          // Top 5%, special training
  XCHANGE_CERTIFIED  // Xchange Academy graduate
}

enum ProviderSubscriptionTier {
  FREE,           // 20% commission
  TRUSTED,        // 300 EGP/month, 15% commission
  PRO,            // 700 EGP/month, 12% commission
  ELITE           // 1500 EGP/month, 10% commission
}

enum ProtectLevel {
  NONE,           // No protection
  BASIC,          // 14 days, free
  STANDARD,       // 30 days, +5%
  PREMIUM,        // 90 days, +10%
  ELITE           // 365 days, +15%
}

enum BookingStatus {
  PENDING,
  CONFIRMED,
  PROVIDER_ON_WAY,
  IN_PROGRESS,
  COMPLETED,
  CANCELLED_BY_CUSTOMER,
  CANCELLED_BY_PROVIDER,
  DISPUTED,
  REFUNDED
}
```

---

## Commission Structure

| Subscription Tier | Monthly Fee | Commission | Features |
|-------------------|-------------|------------|----------|
| Free | 0 EGP | 20% | Basic listing |
| Trusted | 300 EGP | 15% | Priority listing, faster support |
| Pro | 700 EGP | 12% | Pro badge, analytics, live support |
| Elite | 1,500 EGP | 10% | Same-day guarantee, account manager |

---

## Escrow System

```
1. Customer books service → Payment held in escrow
2. Provider accepts booking → Funds remain held
3. Provider completes service → Awaiting customer confirmation
4. Customer confirms → Funds released to provider (minus commission)
5. Auto-release after 48-72 hours if no customer response
6. If disputed → Funds held until resolution
```

### Milestone-Based Escrow (Large Projects)

```
For services > 5,000 EGP or multi-day projects:
- 25% released after milestone 1
- 25% released after milestone 2
- 25% released after milestone 3
- 25% released after final completion
```

---

## Trade Credits Integration

```
1. User sells product on Xchange → Earns Trade Credits (1 EGP = 1 Credit)
2. User books service → Can pay up to 50% with Credits
3. Credits deducted from wallet → Service booked
4. Credits valid for 12 months from earning date
```

---

## Express Services

- **Response Time**: Guaranteed 60 minutes
- **Extra Charge**: 50% of base price
- **Weekend/Holiday**: Additional 40% surcharge
- **Provider Requirements**: 4.5★+ rating, 20+ completed bookings
- **Real-time Tracking**: GPS tracking of provider location

---

## Setup Instructions

### Mobile App

```bash
cd xchange-markets/Services/mobile-app

# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Backend

```bash
# Add services schema to main Prisma schema
cat xchange-markets/Services/database/schema.prisma >> backend/prisma/schema.prisma

# Generate Prisma client
cd backend
npx prisma generate
npx prisma migrate dev --name add_services_marketplace

# Register routes in main app
# Add to backend/src/app.ts:
import servicesRoutes from './routes/services.routes';
import providersRoutes from './routes/providers.routes';
app.use('/api/v1/services', servicesRoutes);
app.use('/api/v1/providers', providersRoutes);
```

### Environment Variables

```env
# Mobile App (.env)
EXPO_PUBLIC_API_URL=https://api.xchange.eg/api/v1
EXPO_PUBLIC_SOCKET_URL=https://api.xchange.eg

# Backend (.env)
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
```

---

## Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

---

## Deployment

### Mobile App

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Backend

- Deploy to Railway, Render, or AWS
- Configure PostgreSQL and Redis
- Set up CDN for images (Cloudflare R2)
- Configure webhook endpoints for payments

---

## Support

- **Email**: support@xchange.eg
- **Phone**: +20 1000 000 000
- **WhatsApp**: +20 1000 000 000

---

## License

Proprietary - Xchange Egypt 2024

---

<div dir="rtl">

## نظرة عامة

سوق خدمات إكسشينج هو تطبيق جوال عالمي المستوى يربط الخدمات بـ 10 أسواق منتجات موجودة (السيارات، العقارات، الهواتف المحمولة، الذهب، الفضة، السلع الفاخرة، التوالف، المزادات، المناقصات، ونظام المقايضة متعدد الأطراف الفريد).

### المميزات الرئيسية

1. **تكامل مع 10 أسواق منتجات** - ربط ذكي بين المنتجات والخدمات ذات الصلة
2. **نظام كريديت التجارة** - استخدم الكريديت المكتسب من بيع المنتجات للدفع مقابل الخدمات
3. **نظام ضمان قوي** - حماية الدفع مع دعم المراحل للمشاريع الكبيرة
4. **ضمان إكسشينج بروتكت** - ضمانات الخدمة من 14 يوم إلى 365 يوم
5. **خدمات سريعة** - ضمان الاستجابة خلال 60 دقيقة
6. **توصيات مدعومة بالذكاء الاصطناعي** - صيانة تنبؤية واقتراحات ذكية
7. **العربية أولاً** - دعم كامل للـ RTL مع روبوت محادثة بالعامية المصرية
8. **أكاديمية إكسشينج** - برامج تدريب واعتماد لمقدمي الخدمات

</div>
