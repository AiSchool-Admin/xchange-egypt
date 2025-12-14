# Claude Code Integration Guide - Xchange Real Estate

## 🎯 المهمة
تطوير منصة Xchange للعقارات - أول سوق عقاري موثق في مصر

## 📦 ما لديك
1. ✅ Database Schema (45+ models) - `/database/schema.prisma`
2. ✅ API Endpoints (100+) - `/api/endpoints.md`
3. ✅ User Stories (50+) - `/user-stories/stories.md`
4. ✅ الخوارزميات المعقدة - `/algorithms/` (للـ Opus)
5. ✅ Market Research - تقرير 20 صفحة عن السوق المصري

## 🏗️ Tech Stack

```
Frontend:  Next.js 14 + TypeScript + Tailwind + shadcn/ui
Backend:   Express.js + TypeScript
Database:  PostgreSQL + Prisma ORM + PostGIS
Cache:     Redis
Storage:   Cloudinary
Payments:  Paymob + Fawry
Maps:      Google Maps API
Deploy:    Vercel (Frontend) + Railway (Backend)
```

## 📂 Project Structure

```
xchange-real-estate/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/
│   │   │   ├── (auth)/         # Login, register
│   │   │   ├── (browse)/       # Search, listings
│   │   │   ├── (dashboard)/    # User dashboard
│   │   │   └── api/            # API routes
│   │   ├── components/
│   │   │   ├── ui/             # shadcn components
│   │   │   ├── property/       # Property cards, filters
│   │   │   └── layout/         # Header, footer
│   │   └── lib/
│   │       ├── api-client.ts
│   │       └── utils.ts
│   └── api/                    # Express backend
│       ├── src/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── middleware/
│       │   └── utils/
│       └── prisma/
│           ├── schema.prisma
│           └── seed.ts
└── packages/
    ├── shared/                 # Shared types
    └── ui/                     # Shared components
```

## 🚀 خطة التنفيذ (12 أسبوع - MVP)

### Phase 1: Foundation (Week 1-2)

**Week 1 - Backend Setup:**
```bash
# 1. Initialize project
npx create-turbo@latest xchange-real-estate

# 2. Setup Express API
cd apps/api
npm install express prisma @prisma/client bcrypt jsonwebtoken
npm install -D typescript @types/express @types/node

# 3. Copy schema.prisma
# 4. Run migrations
npx prisma migrate dev --name init
npx prisma generate

# 5. Create basic structure
mkdir -p src/{routes,services,middleware,utils}

# 6. Implement:
- [ ] Authentication (register, login, JWT)
- [ ] User CRUD
- [ ] Phone OTP verification (Twilio)
```

**Week 2 - Frontend Setup:**
```bash
# 1. Setup Next.js
cd apps/web
npm install @tanstack/react-query zustand axios

# 2. Setup Tailwind + shadcn
npx shadcn-ui@latest init

# 3. Install components
npx shadcn-ui@latest add button input form card

# 4. Create pages:
- [ ] Landing page
- [ ] Login/Register
- [ ] Dashboard layout

# 5. API client setup
- [ ] Axios instance with interceptors
- [ ] React Query hooks
```

### Phase 2: Core Marketplace (Week 3-6)

**Week 3-4 - Property Listings:**
```typescript
// Backend
- [ ] POST /properties (create listing - 7 step form)
- [ ] GET /properties (search with filters)
- [ ] GET /properties/:id (detail page)
- [ ] PATCH /properties/:id (edit)
- [ ] DELETE /properties/:id
- [ ] Image upload (Cloudinary)

// Frontend
- [ ] Multi-step listing creation form
- [ ] Property search page with filters
- [ ] Property detail page
- [ ] Image gallery component
- [ ] Google Maps integration
```

**Week 5-6 - Search & Discovery:**
```typescript
// Backend
- [ ] Advanced search with 20+ filters
- [ ] Elasticsearch integration (optional)
- [ ] Geospatial queries (PostGIS)
- [ ] Similar properties algorithm

// Frontend
- [ ] Filter sidebar
- [ ] Map view
- [ ] Grid/list toggle
- [ ] Sorting options
- [ ] Pagination
- [ ] Save search functionality
```

### Phase 3: User Features (Week 7-8)

**Week 7 - Favorites & Messaging:**
```typescript
// Backend
- [ ] POST /favorites
- [ ] GET /favorites
- [ ] DELETE /favorites/:id
- [ ] WebSocket server for messaging
- [ ] POST /conversations
- [ ] GET /conversations/:id/messages

// Frontend
- [ ] Favorites page
- [ ] Real-time messaging UI
- [ ] Conversation list
- [ ] Unread badges
```

**Week 8 - Notifications:**
```typescript
// Backend
- [ ] Notification service
- [ ] Email templates (SendGrid)
- [ ] Push notifications (FCM)
- [ ] SMS notifications (Twilio)

// Frontend
- [ ] Notification center
- [ ] Toast notifications
- [ ] Email preferences page
```

### Phase 4: Transactions (Week 9-10)

**Week 9 - Payment Integration:**
```typescript
// Backend
- [ ] Paymob integration
- [ ] Fawry integration
- [ ] Transaction creation
- [ ] Escrow logic

// Frontend
- [ ] Payment page
- [ ] Transaction tracking
- [ ] Escrow countdown
```

**Week 10 - Inspection System:**
```typescript
// Backend
- [ ] POST /inspections
- [ ] Inspector assignment
- [ ] Inspection checklist API
- [ ] PDF report generation

// Frontend
- [ ] Request inspection flow
- [ ] Inspector dashboard (mobile PWA)
- [ ] View inspection report
```

### Phase 5: Polish & Launch (Week 11-12)

**Week 11 - Admin Panel:**
```typescript
// Backend
- [ ] Admin authentication
- [ ] User verification endpoints
- [ ] Listing moderation
- [ ] Dispute resolution

// Frontend
- [ ] Admin dashboard
- [ ] Verification queue
- [ ] Moderation tools
```

**Week 12 - Testing & Deployment:**
```bash
# Testing
- [ ] Unit tests (Jest)
- [ ] Integration tests
- [ ] E2E tests (Playwright)

# Optimization
- [ ] Image optimization
- [ ] Code splitting
- [ ] Caching strategy
- [ ] SEO meta tags

# Deployment
- [ ] Vercel setup (frontend)
- [ ] Railway setup (backend)
- [ ] Domain & SSL
- [ ] Environment variables
- [ ] CI/CD pipeline
```

## 🔧 Implementation Tips

### Authentication
```typescript
// apps/api/src/services/auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const authService = {
  async register(phone: string, password: string, fullName: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { phone, password: hashedPassword, fullName }
    });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);
    return { user, token };
  }
};
```

### Property Search
```typescript
// apps/api/src/services/property.service.ts
export const propertyService = {
  async search(filters: PropertyFilters) {
    const where = {
      status: 'AVAILABLE',
      ...(filters.propertyType && { propertyType: filters.propertyType }),
      ...(filters.minPrice && { price: { gte: filters.minPrice } }),
      ...(filters.maxPrice && { price: { lte: filters.maxPrice } }),
      ...(filters.governorate && { governorate: filters.governorate }),
    };
    
    const properties = await prisma.propertyListing.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });
    
    return properties;
  }
};
```

### Real-time Messaging
```typescript
// apps/api/src/websocket.ts
import { Server } from 'socket.io';

export function initWebSocket(httpServer) {
  const io = new Server(httpServer, { cors: { origin: '*' } });
  
  io.on('connection', (socket) => {
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
    });
    
    socket.on('send_message', async (data) => {
      const message = await prisma.message.create({ data });
      io.to(data.conversationId).emit('new_message', message);
    });
  });
}
```

## 📊 Environment Variables

```env
# Backend (.env)
DATABASE_URL="postgresql://user:pass@localhost:5432/xchange_real_estate"
JWT_SECRET="your-secret-key"
PAYMOB_API_KEY="pk_test_xxx"
FAWRY_MERCHANT_CODE="xxx"
CLOUDINARY_URL="cloudinary://xxx"
TWILIO_ACCOUNT_SID="ACxxx"
TWILIO_AUTH_TOKEN="xxx"
GOOGLE_MAPS_API_KEY="AIzaxxx"
SENDGRID_API_KEY="SG.xxx"

# Frontend (.env.local)
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_GOOGLE_MAPS_KEY="AIzaxxx"
```

## 🎨 UI Guidelines

### Colors
- Primary: `#0080FF` (Blue)
- Secondary: `#16A34A` (Green)
- Accent: `#F97316` (Orange)
- Danger: `#DC2626` (Red)

### Typography
- Font: Cairo (Arabic), Inter (English)
- Sizes: text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl

### Components
- Use shadcn/ui for all base components
- Custom components for property cards, filters, maps
- Mobile-first responsive design
- RTL support for Arabic

## 🚨 Critical Features

1. **Search Performance**
   - Index key columns
   - Use pagination (20 items/page)
   - Cache popular searches (Redis)
   - Debounce filter changes

2. **Image Handling**
   - Cloudinary for storage
   - Lazy loading
   - WebP format
   - Responsive images
   - Max 15 images per listing

3. **Security**
   - JWT authentication
   - Rate limiting (100 req/min)
   - Input validation (Zod)
   - SQL injection prevention
   - XSS protection

4. **Mobile Experience**
   - PWA capabilities
   - Touch gestures
   - Bottom navigation
   - Offline favorites
   - Fast loading (<3s)

## 📈 Success Metrics

Track these KPIs:
- User registrations
- Property listings created
- Searches performed
- Messages sent
- Transactions initiated
- Page load times
- Mobile vs desktop ratio
- Conversion rate

## 🎯 MVP Launch Checklist

- [ ] 1,000+ test properties seeded
- [ ] 50 agent accounts created
- [ ] All core features working
- [ ] Mobile responsive
- [ ] SEO optimized
- [ ] Analytics integrated (GA4)
- [ ] Error tracking (Sentry)
- [ ] Performance monitored
- [ ] Backup strategy
- [ ] Support system

## 🔄 Post-Launch Iterations

### Week 13-16: Enhancements
- [ ] Virtual tour creator
- [ ] Property verification badges
- [ ] Financing calculator
- [ ] Reviews & ratings
- [ ] Advanced analytics

### Week 17-20: Advanced Features
- [ ] Automated valuation (Opus algorithm)
- [ ] AI recommendations (Opus algorithm)
- [ ] Property-for-property barter
- [ ] Bank financing integration

## 💡 Pro Tips

1. **Start Small**: Build core features first, polish later
2. **Use Templates**: shadcn/ui components save time
3. **Test Early**: Write tests as you build
4. **Mobile First**: 80% of users will be mobile
5. **Arabic First**: Egypt market is Arabic-native
6. **Cache Aggressively**: Use Redis for hot data
7. **Monitor Always**: Set up logging from day 1

## 🆘 When to Use Opus vs Sonnet

**Use Opus 4 for:**
- Property pricing algorithm (complex ML)
- Barter matching (graph algorithms)
- Recommendation engine (hybrid filtering)

**Use Sonnet 4 for:**
- CRUD operations
- UI components
- API endpoints
- Database queries
- Form validation

## 📞 Need Help?

- Review `/api/endpoints.md` for API specs
- Check `/user-stories/stories.md` for requirements
- See `/database/schema.prisma` for data model
- Read `/algorithms/` for complex logic

---

**Ready? Let's build Egypt's most trusted real estate platform! 🏘️🇪🇬**
