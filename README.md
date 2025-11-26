# 🔄 Xchange - منصة التجارة الإلكترونية الذكية

> **🆕 NEW: Multi-Party Bartering System Documentation**
> Complete architecture and implementation guide now available!
> 📖 **Start here:** [PROJECT-ROADMAP.md](./PROJECT-ROADMAP.md)

---

## 📚 Multi-Party Bartering Documentation

We've just completed comprehensive documentation for the multi-party bartering system (2-N participant chains with AI-driven discovery):

| Document | Purpose | Start Here If... |
|----------|---------|------------------|
| **[PROJECT-ROADMAP.md](./PROJECT-ROADMAP.md)** | Executive summary & 8-week timeline | You're new to the project |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | System design & technical architecture | You need the big picture |
| **[IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md)** | Step-by-step implementation guide | You're ready to code |
| **[TYPESCRIPT-INTERFACES.md](./TYPESCRIPT-INTERFACES.md)** | Complete type definitions | You need type safety |
| **[QUICK-START.md](./QUICK-START.md)** | Developer quick reference | You want to start NOW |

**Current Status:** ✅ Planning complete, ready for Phase 1 implementation (Database Setup)

---

<div dir="rtl">

## نظرة عامة

**Xchange** هي منصة تجارة إلكترونية مبتكرة للمنتجات المستعملة والنفايات، تجمع بين أربعة أنظمة تداول فريدة في منصة واحدة:

1. 🔁 **المقايضة الذكية** - نظام مطابقة متعدد الأطراف
2. 🔨 **المزايدات** - للحصول على أفضل سعر
3. 📋 **المناقصات** - المشترون يطلبون والبائعون يتنافسون
4. 💰 **البيع المباشر** - تجارة تقليدية سريعة

</div>

---

## ✨ Unique Features

- **Smart Multi-Party Barter Matching** - Find complex trade chains automatically
- **AI-Powered Price Recommendations** - Get fair market value for used items
- **B2B, B2C & C2C Support** - All business models in one platform
- **Luxury Goods, Real Estate, Cars, Electronics** - Comprehensive categories
- **Full Arabic Support** - Built for the Egyptian market first
- **Environmental Impact** - Reduce waste, promote circular economy

---

## 🏗️ Project Structure

```
xchange-egypt/
├── backend/                 # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Data models
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utilities
│   │   ├── config/          # Configuration
│   │   └── app.ts           # App entry point
│   ├── prisma/              # Database schema & migrations
│   ├── tests/               # API tests
│   └── package.json
│
├── frontend/                # Next.js 14 + TypeScript
│   ├── app/                 # App Router pages
│   │   ├── (auth)/          # Authentication
│   │   ├── (main)/          # Public pages
│   │   └── (admin)/         # Admin panel
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   └── features/        # Feature components
│   ├── lib/                 # Utilities & API client
│   ├── public/
│   │   └── locales/         # i18n translations (ar/en)
│   └── package.json
│
├── mobile/                  # React Native (Future)
│   └── ...
│
├── docs/                    # Documentation
│   ├── api/                 # API documentation
│   ├── guides/              # User guides
│   └── architecture/        # Technical docs
│
├── scripts/                 # Utility scripts
│   ├── seed-db.ts           # Database seeding
│   └── deploy.sh            # Deployment script
│
├── .github/
│   └── workflows/           # GitHub Actions CI/CD
│
├── TECHNICAL_PLAN.md        # Technical architecture
├── TECH_STACK.md            # Technology decisions
├── README.md                # This file
└── LICENSE
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ LTS
- **PostgreSQL** 15+
- **Redis** 7+
- **pnpm** (recommended) or npm

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/AiSchool-Admin/xchange-egypt.git
cd xchange-egypt
```

#### 2. Setup Backend
```bash
cd backend
pnpm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
pnpm prisma migrate dev

# Seed initial data
pnpm run seed

# Start development server
pnpm run dev
```

Backend will run on: `http://localhost:3001`

#### 3. Setup Frontend
```bash
cd frontend
pnpm install

# Configure environment
cp .env.local.example .env.local

# Start development server
pnpm run dev
```

Frontend will run on: `http://localhost:3000`

#### 4. Setup Database (Docker - Optional)
```bash
# PostgreSQL
docker run --name xchange-postgres \
  -e POSTGRES_DB=xchange \
  -e POSTGRES_USER=xchange_user \
  -e POSTGRES_PASSWORD=dev123 \
  -p 5432:5432 \
  -d postgres:15

# Redis
docker run --name xchange-redis \
  -p 6379:6379 \
  -d redis:7-alpine
```

---

## 🛠️ Development

### Backend Commands
```bash
cd backend

pnpm run dev          # Start dev server
pnpm run build        # Build for production
pnpm run start        # Start production server
pnpm run test         # Run tests
pnpm run lint         # Lint code
pnpm prisma studio    # Open Prisma Studio (DB GUI)
```

### Frontend Commands
```bash
cd frontend

pnpm run dev          # Start dev server
pnpm run build        # Build for production
pnpm run start        # Start production server
pnpm run lint         # Lint code
pnpm run test         # Run tests
```

---

## 📊 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Auth**: JWT + Refresh Tokens
- **Validation**: Zod
- **File Upload**: Multer + Sharp

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui + Radix UI
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **API Client**: Axios + React Query
- **i18n**: next-intl (Arabic/English)

### Infrastructure
- **Hosting**: Railway (Backend) + Vercel (Frontend)
- **Storage**: Cloudflare R2
- **CDN**: Cloudflare
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry (Future)

---

## 🗃️ Database Schema

### Core Tables
- **users** - User accounts (individual/business)
- **items** - Products/services listings
- **categories** - Product categories (hierarchical)
- **listings** - Trading listings (sale/auction/barter/tender)
- **barter_offers** - Barter exchange proposals
- **auction_bids** - Auction bids
- **reverse_auction_offers** - Tender offers
- **transactions** - Completed trades
- **reviews** - User ratings & feedback
- **wish_list_items** - User want lists for matching

See [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md) for detailed schema.

---

## 🔐 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/xchange"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key"

# Storage (Cloudflare R2)
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="xchange-media"

# App
PORT=3001
NODE_ENV=development
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_TIMEOUT=10000

# App
NEXT_PUBLIC_APP_NAME=Xchange
NEXT_PUBLIC_DEFAULT_LOCALE=ar

# Maps (optional for MVP)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key
```

---

## 🎨 Features Roadmap

### ✅ Phase 1: MVP (Current)
- [x] User authentication & registration
- [x] Product listing with images
- [x] Direct sales
- [x] Basic search & filters
- [x] Simple 2-party barter
- [x] User profiles & ratings
- [x] Admin panel (basic)

### 🔄 Phase 2: Core Features (Next 3 months)
- [ ] Auction system
- [ ] Reverse auction (tender) system
- [ ] Multi-party barter matching algorithm
- [ ] Advanced search with filters
- [ ] Notification system (email + SMS)
- [ ] Payment gateway integration (Fawry, Paymob)
- [ ] Mobile responsive design
- [ ] Arabic/English switching

### 🚀 Phase 3: Advanced (6+ months)
- [ ] Mobile apps (React Native)
- [ ] AI price recommendations
- [ ] Wish list matching notifications
- [ ] Shipping integration
- [ ] Business accounts (B2B features)
- [ ] Analytics dashboard
- [ ] API for third-party integrations
- [ ] Blockchain transaction logging

---

## 🤝 Team

<div dir="rtl">

- **المؤسس والمدير التنفيذي**: صاحب الفكرة
- **المدير التقني (CTO)**: Claude AI
- **المطورون**: قريباً (بعد التمويل)

</div>

---

## 📄 License

This project is proprietary software owned by Xchange.

---

## 📞 Contact

- **Email**: contact@xchange.eg (placeholder)
- **Website**: https://xchange.eg (placeholder)

---

## 🙏 Acknowledgments

Built with modern technologies and best practices to create a sustainable, scalable platform for Egypt's circular economy.

---

**Made with ❤️ in Egypt**

<div dir="rtl">

## 📌 ملاحظات هامة

- هذا المشروع في مرحلة MVP
- نرحب بالملاحظات والاقتراحات
- الهدف: بناء منصة تساهم في تقليل النفايات وتعزيز الاقتصاد الدائري

</div>

---

**Ready to change the game! 🚀**