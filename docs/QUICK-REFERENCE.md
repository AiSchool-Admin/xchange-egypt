# Xchange Platform - Quick Reference Card

**Print this and keep it handy for demos!**

---

## 🚀 Starting the Platform

### Every Time You Want to Demo:

```bash
# 1. Open Terminal and navigate to backend
cd xchange-egypt/backend

# 2. Start the server
pnpm run dev

# 3. In a NEW terminal, open Prisma Studio
cd xchange-egypt/backend
pnpm run prisma:studio
```

**Server runs at:** http://localhost:3000
**Prisma Studio at:** http://localhost:5555

---

## 🔐 Demo Login Credentials

**All passwords:** `Password123!`

### Individual Users
| Name | Email | Location |
|------|-------|----------|
| Ahmed Mohamed | ahmed.mohamed@example.com | Cairo |
| Fatma Ali | fatma.ali@example.com | Alexandria |
| Khaled Hassan | khaled.hassan@example.com | Giza |
| Mona Ibrahim | mona.ibrahim@example.com | Cairo |
| Omar Saeed | omar.saeed@example.com | Cairo |

### Business Accounts
| Business | Email | Type |
|----------|-------|------|
| Tech Store Egypt | contact@techstore.eg | Electronics |
| Furniture Hub | info@furniturehub.eg | Furniture |
| Auto Parts Plus | sales@autoparts.eg | Auto Parts |
| Green Cycle | support@greencycle.eg | Recycling |

---

## 🎯 Investor Demo Script

### 1. User Accounts (30 seconds)
- Open Prisma Studio → Click "User"
- Show: "We have both individual sellers and businesses"
- Show: "Multiple governorates - Cairo, Alexandria, Giza"
- Point out: Different account types

### 2. Product Catalog (1 minute)
- Click "Item" table
- Show Dell XPS 13: "Notice bilingual content - Arabic and English"
- Show different categories: Electronics, Furniture, Vehicles
- Show conditions: NEW, EXCELLENT, GOOD
- Point out: Multiple images, detailed descriptions

### 3. Active Marketplace (1 minute)
- Click "Listing" table
- Show price range: EGP 12,000 to 35,000
- Point out: "These are live listings buyers can purchase"
- Show: Expiration dates, negotiable prices

### 4. Transaction Flow (1 minute)
- Click "Transaction" table
- **Delivered transaction**: "Complete order with tracking, delivered 5 days ago"
- **Shipped transaction**: "Currently in transit"
- **Pending transaction**: "Awaiting payment confirmation"
- Show payment methods: Bank transfer, Cash on Delivery, Mobile wallet

### 5. Barter System - UNIQUE FEATURE! (2 minutes)
- Click "BarterOffer" table
- **THIS IS OUR DIFFERENTIATOR**

| Status | Example | What It Shows |
|--------|---------|---------------|
| PENDING | Ahmed ↔ Fatma (Laptop for iPhone) | Initial offer |
| COUNTER_OFFERED | Khaled ↔ Omar (Car for MacBook → Bed) | Negotiation |
| ACCEPTED | Fatma ↔ Mona (Sofa for Fridge) | Agreement reached |
| COMPLETED | Omar ↔ Ahmed (Bed for Camera) | Successful exchange |

**Key talking point:** "Unlike eBay or Amazon, users can trade items directly without cash - perfect for Egypt's market"

---

## 🧪 Quick Test Commands

### Test the API (Automated)

**Mac/Linux:**
```bash
cd backend
./test-api-simple.sh
```

**Windows:**
```bash
cd backend
test-api-simple.bat
```

### Manual API Tests

**Get all listings:**
```bash
curl http://localhost:3000/api/v1/listings
```

**Login as Ahmed:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ahmed.mohamed@example.com", "password": "Password123!"}'
```

---

## 🔄 Resetting Demo Data

If data gets messy, reset everything:

```bash
cd backend
pnpm run seed
```

**Warning:** This deletes ALL data and creates fresh demo data.

---

## 🎨 What Makes Us Unique?

When talking to investors, emphasize:

### 1. Barter System ⭐
- "No other platform in Egypt offers 2-party barter matching"
- "Users can trade without cash - important for liquidity-constrained market"
- "Counter-offer functionality enables negotiation"

### 2. Multi-Market Support
- "We handle B2B (businesses), B2C, and C2C in one platform"
- "Same infrastructure serves all market segments"

### 3. Bilingual by Design
- "Full Arabic and English support from day one"
- "Not just translation - culturally appropriate for Egyptian market"

### 4. Four Trading Systems
- Direct sales (like eBay)
- 2-party barter (unique!)
- Auctions (coming soon)
- Reverse auctions/tenders (coming soon)

### 5. Waste & Recycling Focus
- "Green Cycle business shows recycling companies can participate"
- "Supports circular economy and sustainability"

---

## 📊 Key Metrics to Share

Based on seed data:

| Metric | Value | What It Shows |
|--------|-------|---------------|
| Product Categories | 4 main + 12 sub | Comprehensive coverage |
| Demo Users | 9 (5 individual, 4 business) | Multi-market ready |
| Sample Items | 13 across categories | Diverse inventory |
| Active Listings | 4 live sales | Marketplace activity |
| Transactions | 3 (various states) | Order management |
| Barter Exchanges | 4 (all states) | Unique functionality |

---

## ❌ Troubleshooting

### Server won't start
```bash
# Check if another instance is running
lsof -i :3000
# Kill it if needed, then restart
```

### Database connection error
```bash
# Check PostgreSQL is running
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
# Windows: Check Services app
```

### "Module not found" errors
```bash
cd backend
pnpm install
```

### Need fresh start
```bash
cd backend
pnpm run db:reset
pnpm run seed
```

---

## 📱 API Endpoints for Live Testing

**Base URL:** http://localhost:3000/api/v1

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /categories | GET | Get all categories |
| /auth/login | POST | User login |
| /users/me | GET | Get my profile (auth required) |
| /items | GET | Browse all items |
| /listings | GET | Active sale listings |
| /barter/my-offers | GET | My barter offers (auth) |
| /barter/search | GET | Search barterable items |

---

## 🎤 Elevator Pitch (Use This!)

> "Xchange is Egypt's first multi-mode trading platform for used goods and waste. Unlike competitors, we offer four trading systems - including a unique 2-party barter system that lets users trade items without cash. Our bilingual platform serves individuals and businesses across B2B, B2C, and C2C markets. We're targeting Egypt's $2B+ secondhand market with a focus on sustainability and circular economy."

**Duration:** 30 seconds
**Key differentiator:** Barter system
**Market size:** $2B+
**Target:** Egypt first, then MENA

---

## 📞 Pre-Demo Checklist

Before investor meeting:

- [ ] Start PostgreSQL database
- [ ] Run `pnpm run dev` in backend
- [ ] Open Prisma Studio
- [ ] Test login with ahmed.mohamed@example.com
- [ ] Have this quick reference ready
- [ ] Browser tabs open: Prisma Studio, maybe Postman
- [ ] Prepare to show barter system as unique feature
- [ ] Have market size numbers ready ($2B+)
- [ ] Know the competition: OLX, Dubizzle (none have barter!)

---

## 💡 Investor Questions You'll Get

**Q: "How is this different from OLX or Dubizzle?"**
A: "We have four trading modes including barter. They only have fixed-price sales. Our target includes waste/recycling which they don't serve."

**Q: "What's your revenue model?"**
A: "Commission on completed transactions, featured listings, business subscriptions. The barter system creates stickiness - users stay on our platform longer."

**Q: "Why barter? Does anyone actually want that?"**
A: "Egypt has liquidity constraints. Many people have valuable items but limited cash. Barter unlocks transactions that wouldn't happen otherwise. It's our competitive moat."

**Q: "How big is the market?"**
A: "Egypt's secondhand market is $2B+. Only 15% is currently online. We're targeting the 85% offline market, especially in tier-2 cities."

**Q: "What's your traction?"**
A: "We're pre-launch. This is MVP to demonstrate technical feasibility. With seed funding, we'll launch in Cairo, then expand to Alexandria and Giza."

---

**Keep this card handy during demos!**

*Last updated: January 2025*
