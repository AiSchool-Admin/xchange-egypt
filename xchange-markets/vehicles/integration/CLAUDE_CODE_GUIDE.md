# Xchange Cars - Complete Integration Guide for Claude Code

## 📦 Project Overview

**Project Name:** Xchange Cars Marketplace  
**Tech Stack:** Next.js 14 (App Router) + Express API + PostgreSQL + Prisma  
**Deployment:** Vercel (Frontend) + Railway/Render (Backend)  
**Languages:** TypeScript, Arabic (primary UI language)

---

## 🗂️ Project Structure

```
xchange-cars/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (marketplace)/
│   │   │   │   ├── page.tsx          # Homepage/Feed
│   │   │   │   ├── search/
│   │   │   │   ├── listing/[id]/
│   │   │   │   └── create-listing/
│   │   │   ├── (account)/
│   │   │   │   ├── my-listings/
│   │   │   │   ├── favorites/
│   │   │   │   ├── messages/
│   │   │   │   └── transactions/
│   │   │   └── api/           # Next.js API routes (proxies)
│   │   ├── components/
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── listing-card.tsx
│   │   │   ├── search-filters.tsx
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── api-client.ts
│   │   │   ├── utils.ts
│   │   │   └── hooks/
│   │   └── public/
│   │       ├── locales/       # i18n translations
│   │       └── images/
│   │
│   └── api/                    # Express backend
│       ├── src/
│       │   ├── server.ts
│       │   ├── routes/
│       │   │   ├── auth.ts
│       │   │   ├── listings.ts
│       │   │   ├── transactions.ts
│       │   │   ├── inspections.ts
│       │   │   ├── financing.ts
│       │   │   ├── barter.ts
│       │   │   └── recommendations.ts
│       │   ├── controllers/
│       │   ├── services/
│       │   │   ├── pricing-algorithm.ts        # From Opus
│       │   │   ├── barter-matcher.ts           # From Opus
│       │   │   ├── recommendation-engine.ts    # From Opus
│       │   │   └── ...
│       │   ├── middleware/
│       │   │   ├── auth.ts
│       │   │   ├── validation.ts
│       │   │   └── rate-limit.ts
│       │   └── utils/
│       └── prisma/
│           ├── schema.prisma  # Database schema (already provided)
│           └── seed.ts
│
├── packages/
│   ├── shared/                # Shared types/utils
│   │   └── types/
│   │       ├── user.ts
│   │       ├── listing.ts
│   │       └── ...
│   └── ui/                    # Shared UI components
│
├── .env.example
├── package.json
├── turbo.json                 # Turborepo config
└── README.md
```

---

## 🔧 Technology Stack Details

### Frontend (Next.js 14)
```json
{
  "dependencies": {
    "next": "14.2.0",
    "react": "18.3.0",
    "react-dom": "18.3.0",
    "typescript": "5.4.0",
    
    // UI
    "@radix-ui/react-*": "latest",
    "tailwindcss": "3.4.0",
    "lucide-react": "latest",
    "framer-motion": "11.0.0",
    
    // State Management
    "zustand": "4.5.0",
    "react-query": "5.0.0",
    
    // Forms
    "react-hook-form": "7.51.0",
    "zod": "3.22.0",
    
    // i18n
    "next-intl": "3.11.0",
    
    // Images
    "next-cloudinary": "6.0.0",
    "react-image-gallery": "1.3.0",
    
    // Maps
    "@vis.gl/react-google-maps": "1.0.0"
  }
}
```

### Backend (Express + Prisma)
```json
{
  "dependencies": {
    "express": "4.19.0",
    "typescript": "5.4.0",
    
    // Database
    "@prisma/client": "5.12.0",
    "prisma": "5.12.0",
    
    // Authentication
    "jsonwebtoken": "9.0.2",
    "bcrypt": "5.1.1",
    
    // Validation
    "zod": "3.22.0",
    "express-validator": "7.0.1",
    
    // File Upload
    "multer": "1.4.5-lts.1",
    "cloudinary": "2.0.0",
    
    // Payment
    "paymob": "1.0.0",
    
    // SMS/Email
    "twilio": "5.0.0",
    "nodemailer": "6.9.0",
    
    // Cache
    "ioredis": "5.3.0",
    
    // Utilities
    "axios": "1.6.0",
    "date-fns": "3.3.0",
    "lodash": "4.17.21"
  }
}
```

---

## 🚀 Setup Instructions

### 1. Initialize Project

```bash
# Create monorepo with Turborepo
npx create-turbo@latest xchange-cars

# Navigate to project
cd xchange-cars

# Install dependencies
pnpm install
```

### 2. Setup Database

```bash
# Create PostgreSQL database (Railway/Render/Supabase)
# Get connection URL: postgresql://user:pass@host:5432/xchange_cars

# In apps/api directory
cd apps/api

# Initialize Prisma
npx prisma init

# Copy the provided schema.prisma to prisma/schema.prisma

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Seed database with initial data
npx prisma db seed
```

### 3. Environment Variables

Create `.env` files:

**apps/api/.env**
```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/xchange_cars"

# JWT
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRES_IN="30d"

# API
PORT=3001
NODE_ENV="development"

# Payment (Paymob)
PAYMOB_API_KEY="your-paymob-api-key"
PAYMOB_INTEGRATION_ID="your-integration-id"

# SMS (Twilio or local gateway)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Redis (Upstash/Railway)
REDIS_URL="redis://default:password@host:6379"

# Email (SendGrid)
SENDGRID_API_KEY="your-sendgrid-key"
FROM_EMAIL="noreply@xchange.eg"

# Financing Partners
CONTACT_API_URL="https://api.contact-finance.com"
CONTACT_API_KEY="your-contact-key"
```

**apps/web/.env.local**
```env
# API
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_KEY="your-google-maps-key"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
```

### 4. Run Development Servers

```bash
# From root directory, run all apps
pnpm dev

# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
```

---

## 📋 Implementation Checklist

### Phase 1: Core Foundation (Week 1-2)

#### Backend API
- [ ] Set up Express server with TypeScript
- [ ] Configure Prisma with provided schema
- [ ] Implement authentication (register, login, JWT)
- [ ] Create middleware (auth, validation, error handling)
- [ ] Implement rate limiting
- [ ] Set up file upload (Cloudinary)
- [ ] Configure Redis caching

#### Frontend
- [ ] Set up Next.js 14 with App Router
- [ ] Configure Tailwind CSS + shadcn/ui
- [ ] Set up i18n with Arabic as primary language
- [ ] Create layout components (Header, Footer, Sidebar)
- [ ] Implement authentication pages (Login, Register)
- [ ] Create protected route wrapper
- [ ] Set up React Query for data fetching

### Phase 2: Listings (Week 3-4)

#### Backend
- [ ] Listings CRUD endpoints
- [ ] Image upload for listings (multiple images)
- [ ] Search & filters endpoint
- [ ] Similar listings algorithm
- [ ] Favorite listings endpoints
- [ ] View tracking

#### Frontend
- [ ] Homepage with listing feed
- [ ] Search page with filters (make, model, price, year, location)
- [ ] Listing detail page with image gallery
- [ ] Create listing form (multi-step)
- [ ] Edit listing page
- [ ] My listings dashboard
- [ ] Favorites page

### Phase 3: Inspection System (Week 5)

#### Backend
- [ ] Schedule inspection endpoint
- [ ] Inspector assignment logic
- [ ] 150-point checklist API
- [ ] Inspection report generation
- [ ] Certification logic

#### Frontend
- [ ] Request inspection flow
- [ ] Inspector app (mobile-friendly checklist)
- [ ] View inspection report page
- [ ] Certification badge component

### Phase 4: Transactions & Payments (Week 6-7)

#### Backend
- [ ] Initiate transaction endpoint
- [ ] Paymob integration (card payment)
- [ ] Fawry integration
- [ ] Escrow logic
- [ ] Transaction status management
- [ ] Refund processing

#### Frontend
- [ ] Purchase flow (multi-step)
- [ ] Payment page with Paymob iframe
- [ ] Transaction tracking page
- [ ] Request refund form
- [ ] Transaction history

### Phase 5: Advanced Features (Week 8+)

#### Financing
- [ ] Backend: Contact/Drive API integration
- [ ] Backend: Eligibility check endpoint
- [ ] Backend: Application submission
- [ ] Frontend: Financing calculator
- [ ] Frontend: Application form

#### Trade-In
- [ ] Backend: Trade-in request endpoint
- [ ] Backend: Instant quote algorithm
- [ ] Frontend: Trade-in form
- [ ] Frontend: Quote acceptance flow

#### Barter (Use Opus Algorithm)
- [ ] Backend: Implement barter matching from Opus
- [ ] Backend: Create barter offer endpoint
- [ ] Backend: Accept/counter-offer logic
- [ ] Frontend: Barter offer form
- [ ] Frontend: Barter management dashboard

#### Recommendations (Use Opus Algorithm)
- [ ] Backend: Implement recommendation engine from Opus
- [ ] Backend: User profiling logic
- [ ] Backend: Recommendations endpoint
- [ ] Frontend: "For You" feed
- [ ] Frontend: Email digest generation

#### Messaging
- [ ] Backend: WebSocket server
- [ ] Backend: Message CRUD
- [ ] Backend: Notification system
- [ ] Frontend: Chat interface
- [ ] Frontend: Notification bell

---

## 🎨 UI/UX Guidelines

### Design System

**Colors (Arabic-friendly)**
```css
:root {
  --primary: 16 100% 50%;      /* Blue #0080FF */
  --secondary: 142 76% 36%;    /* Green #16A34A */
  --accent: 25 95% 53%;        /* Orange #F97316 */
  --background: 0 0% 100%;     /* White */
  --foreground: 222 47% 11%;   /* Dark Gray */
}
```

**Typography**
```css
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');

body {
  font-family: 'Cairo', sans-serif;
  direction: rtl;  /* Right-to-left for Arabic */
}
```

**Components**
- Use shadcn/ui as base
- Customize for RTL layout
- Add Arabic translations for all UI text
- Ensure mobile-first responsive design

### Key Pages Layout

**Homepage**
```
┌─────────────────────────────────────┐
│ Header (Logo, Search, Login)       │
├─────────────────────────────────────┤
│ Search Bar (Quick filters)          │
├─────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │Car 1│ │Car 2│ │Car 3│ │Car 4│   │ ← Horizontal scroll
│ └─────┘ └─────┘ └─────┘ └─────┘   │
├─────────────────────────────────────┤
│ "For You" Feed (Recommendations)    │
│ ┌──────────┐                       │
│ │ Listing  │ [Image] [Details]     │
│ └──────────┘                       │
│ ┌──────────┐                       │
│ │ Listing  │ [Image] [Details]     │
│ └──────────┘                       │
└─────────────────────────────────────┘
```

**Listing Detail Page**
```
┌─────────────────────────────────────┐
│ Image Gallery (swipeable)           │
├─────────────────────────────────────┤
│ Price │ Certified Badge │ Favorite  │
├─────────────────────────────────────┤
│ Title & Description                 │
├─────────────────────────────────────┤
│ Specs (Grid layout)                 │
├─────────────────────────────────────┤
│ Seller Info │ Rating │ Verified     │
├─────────────────────────────────────┤
│ [Contact] [Make Offer] [Trade-in]   │
├─────────────────────────────────────┤
│ Inspection Report (if certified)    │
├─────────────────────────────────────┤
│ Similar Listings                    │
└─────────────────────────────────────┘
```

---

## 🔌 API Integration Examples

### Authentication

```typescript
// apps/web/lib/api-client.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: RegisterDTO) => api.post('/auth/register', data),
  login: (data: LoginDTO) => api.post('/auth/login', data),
  verifyOTP: (data: { phone: string; otp: string }) => 
    api.post('/auth/confirm-otp', data),
};
```

### Listings

```typescript
// apps/web/lib/hooks/use-listings.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../api-client';

export function useListings(filters?: SearchFilters) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: async () => {
      const { data } = await api.get('/listings', { params: filters });
      return data;
    },
  });
}

export function useCreateListing() {
  return useMutation({
    mutationFn: async (listingData: CreateListingDTO) => {
      const { data } = await api.post('/listings', listingData);
      return data;
    },
    onSuccess: () => {
      // Invalidate listings cache
      queryClient.invalidateQueries(['listings']);
    },
  });
}
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// apps/api/src/services/__tests__/pricing-algorithm.test.ts
import { calculatePrice } from '../pricing-algorithm';

describe('Pricing Algorithm', () => {
  it('should calculate correct price for Toyota Corolla 2021', () => {
    const result = calculatePrice({
      make: 'Toyota',
      model: 'Corolla',
      year: 2021,
      mileage: 45000,
      condition: 'USED_EXCELLENT',
      governorate: 'Cairo',
    });
    
    expect(result.estimatedValue).toBeGreaterThan(450000);
    expect(result.estimatedValue).toBeLessThan(510000);
  });
});
```

### Integration Tests
```typescript
// apps/api/src/routes/__tests__/listings.test.ts
import request from 'supertest';
import app from '../../server';

describe('Listings API', () => {
  it('should create a listing with authentication', async () => {
    const token = await getTestToken();
    
    const response = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Toyota Corolla 2021',
        vehicle: { /* ... */ },
        askingPrice: 480000,
      });
    
    expect(response.status).toBe(201);
    expect(response.body.listing.id).toBeDefined();
  });
});
```

---

## 📦 Deployment

### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel --prod
```

### Backend (Railway/Render)
```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .

RUN npx prisma generate
RUN pnpm build

EXPOSE 3001

CMD ["pnpm", "start"]
```

---

## 🎯 Success Metrics

Track these KPIs:
- User registrations per day
- Active listings
- Search-to-inquiry conversion rate
- Listing-to-purchase conversion rate
- Average time on site
- Mobile vs Desktop usage
- Payment success rate
- Customer satisfaction (reviews)

---

## 📚 Additional Resources

- **Prisma Docs:** https://www.prisma.io/docs
- **Next.js Docs:** https://nextjs.org/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Paymob Integration:** https://docs.paymob.com
- **Google Maps API:** https://developers.google.com/maps

---

**Ready for Development! 🚀**

Use this guide as your roadmap. Start with Phase 1, then progressively add features.
