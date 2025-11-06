# Database Seeding Guide

This guide explains how to seed the Xchange platform database with demo data for testing and demonstrations.

## Overview

The seeding system provides comprehensive demo data including:

- **Product Categories** - Hierarchical category structure (Electronics, Furniture, Vehicles, etc.)
- **Demo Users** - 9 users (5 individuals, 4 businesses)
- **Sample Items** - 13 items across all categories with bilingual content
- **Active Listings** - Direct sale listings at various price points
- **Transaction History** - Completed, shipped, and pending orders
- **Barter Offers** - Pending, counter-offered, accepted, and completed exchanges

## Quick Start

### Full Database Seed

To seed the entire database with all demo data:

```bash
cd backend
pnpm run seed
```

This will:
1. Clear all existing data (⚠️ destructive operation!)
2. Seed categories
3. Seed users
4. Seed items
5. Seed demo data (listings, transactions, barter offers)

### Individual Seed Scripts

You can also run individual seed scripts:

```bash
# Seed categories only
pnpm run seed:categories

# Seed users only
pnpm run seed:users

# Seed items only (requires categories and users)
pnpm run seed:items

# Seed demo data only (requires all of the above)
pnpm run seed:demo
```

## Demo Data Details

### Users

#### Individual Users (5)

| Email | Name | Governorate | Password |
|-------|------|-------------|----------|
| ahmed.mohamed@example.com | Ahmed Mohamed | Cairo | Password123! |
| fatma.ali@example.com | Fatma Ali | Alexandria | Password123! |
| khaled.hassan@example.com | Khaled Hassan | Giza | Password123! |
| mona.ibrahim@example.com | Mona Ibrahim | Cairo | Password123! |
| omar.saeed@example.com | Omar Saeed | Cairo | Password123! |

#### Business Users (4)

| Email | Business Name | Type | Governorate | Password |
|-------|---------------|------|-------------|----------|
| contact@techstore.eg | Tech Store Egypt | Electronics Retailer | Cairo | Password123! |
| info@furniturehub.eg | Furniture Hub | Furniture Retailer | Giza | Password123! |
| sales@autoparts.eg | Auto Parts Plus | Auto Parts Dealer | Alexandria | Password123! |
| support@greencycle.eg | Green Cycle | Recycling Company | Cairo | Password123! |

### Categories

Hierarchical category structure:

- **Electronics**
  - Computers & Laptops
  - Mobile Phones
  - Cameras & Photography
  - Home Appliances
- **Furniture**
  - Living Room
  - Bedroom
  - Office Furniture
- **Vehicles**
  - Cars
  - Motorcycles
  - Parts & Accessories
- **Books & Media**
  - Books
  - Music & Movies
  - Video Games

### Sample Items

13 diverse items including:

- **Electronics**: Dell XPS 13 laptop, Canon EOS 750D camera, Samsung Galaxy S23, iPhone 12 Pro
- **Furniture**: Leather sofa set, refrigerator, king-size bed
- **Vehicles**: Toyota Corolla 2018, Honda motorcycle
- **Books**: "Atomic Habits" in English

All items include:
- Bilingual titles and descriptions (Arabic & English)
- Realistic conditions (NEW, EXCELLENT, GOOD, FAIR)
- Multiple high-quality images
- Location and governorate information
- Quantity tracking

### Listings

4 active listings demonstrating various scenarios:

1. **Dell XPS 13** - EGP 25,000 (Individual seller, negotiable)
2. **Canon Camera** - EGP 12,000 (Individual seller)
3. **Leather Sofa Set** - EGP 35,000 (Individual seller)
4. **Samsung Galaxy S23** - EGP 22,000 (Business seller, quantity: 10)

### Transactions

3 transactions showing different states:

1. **Delivered** - Completed purchase from Tech Store (Bank Transfer)
   - Payment reference: TRX20250115001
   - Tracking: TRACK123456
   - Delivered 5 days ago

2. **Shipped** - Camera purchase (Cash on Delivery)
   - Tracking: TRACK789012
   - Shipped 1 day ago

3. **Pending** - Dell laptop purchase (Mobile Wallet)
   - Awaiting payment confirmation

### Barter Offers

4 barter offers demonstrating all states:

1. **Pending** - Ahmed ↔ Fatma
   - Offered: Dell laptop
   - Requested: iPhone
   - Expires in 7 days

2. **Counter-Offered** - Khaled ↔ Omar
   - Original: Toyota for MacBook
   - Counter: How about the bed instead?
   - Expires in 5 days

3. **Accepted** - Fatma ↔ Mona
   - Offered: Sofa
   - Requested: Refrigerator
   - Meeting scheduled this weekend

4. **Completed** - Omar ↔ Ahmed
   - Exchanged: Bed ↔ Camera
   - Successfully completed in Maadi

## Important Notes

### ⚠️ Destructive Operations

The full seed command (`pnpm run seed`) **clears all existing data** before seeding. Use with caution in development and **never in production**.

### Dependencies

Seed scripts must be run in order:

1. Categories (no dependencies)
2. Users (no dependencies)
3. Items (requires categories + users)
4. Demo data (requires categories + users + items)

The master seed script handles this automatically.

### Password Security

All demo users use the same password: `Password123!`

This is **only for development/demo purposes**. Passwords are properly hashed using bcrypt with 10 salt rounds.

## Use Cases

### Testing Authentication

Use any demo user to test login:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ahmed.mohamed@example.com", "password": "Password123!"}'
```

### Testing Trading Systems

The seed data provides scenarios for testing:

- **Direct Sales**: Active listings ready for purchase
- **Transactions**: Various order states (pending, shipped, delivered)
- **Barter System**: Offers in all possible states
- **User Interactions**: Multiple users to test different perspectives

### Investor Demonstrations

The seed data is designed for impressive demos:

- **Diverse Products**: Items across all major categories
- **Real Scenarios**: Authentic Egyptian context (locations, names, prices)
- **Complete Workflows**: From listing creation to order fulfillment
- **Barter Innovation**: Showcases the unique 2-party barter system

## Troubleshooting

### "Users not found" Error

Make sure you've run the user seed before the items seed:

```bash
pnpm run seed:users
pnpm run seed:items
```

### "Not enough items" Error

Run the items seed before demo data:

```bash
pnpm run seed:items
pnpm run seed:demo
```

### Database Connection Errors

Ensure:
1. PostgreSQL is running
2. Database exists
3. `.env` file is configured correctly
4. Prisma has generated the client: `pnpm run prisma:generate`

### Clear and Reseed

To completely reset and reseed:

```bash
cd backend
pnpm run db:reset  # Resets migrations
pnpm run seed      # Seeds all data
```

## Development Workflow

Recommended workflow for development:

```bash
# Initial setup
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run seed

# After schema changes
pnpm run prisma:migrate
pnpm run seed

# Quick reset during testing
pnpm run seed  # Clears and reseeds
```

## Extending the Seed Data

To add more demo data:

1. **Edit existing seeds**: Modify the seed scripts directly
2. **Create new seeds**: Add new seed scripts and update `seed.ts`
3. **Update package.json**: Add new seed commands if needed

Example - adding more users:

```typescript
// In seed-users.ts
const individuals = [
  // ... existing users
  {
    email: 'new.user@example.com',
    password: hashedPassword,
    fullName: 'New User',
    // ... other fields
  },
];
```

## API Testing with Seed Data

### Get All Listings

```bash
curl http://localhost:3000/api/v1/listings
```

### Get User Profile (Ahmed)

```bash
# First login to get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ahmed.mohamed@example.com", "password": "Password123!"}' \
  | jq -r '.data.token')

# Get profile
curl http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN"
```

### Get Barter Offers

```bash
curl http://localhost:3000/api/v1/barter/my-offers \
  -H "Authorization: Bearer $TOKEN"
```

## Production Considerations

**Never run seeds in production!**

For production:
1. Remove seed scripts from production builds
2. Use migrations only
3. Load production data through admin interfaces
4. Implement proper data validation and user onboarding

## Summary

The seeding system provides a comprehensive, realistic dataset for:

- ✅ Development and testing
- ✅ Investor demonstrations
- ✅ Feature validation
- ✅ Performance testing
- ✅ API documentation and examples

All data is carefully crafted to represent real Egyptian marketplace scenarios, making it perfect for showcasing the Xchange platform's unique features.
