# Getting Started Guide for Non-Technical Users

This guide will help you set up and test the Xchange platform without needing programming knowledge.

## What is the Seed System?

Think of the seed system as a "demo data generator" that fills your empty database with realistic sample data:
- 9 fake users (like test accounts)
- 13 products listed for sale
- Some completed orders
- Some barter exchanges in progress

This lets you show investors a working marketplace without manually creating hundreds of test accounts and products.

## Prerequisites (One-Time Setup)

You need these installed on your computer:

### 1. Install Node.js (JavaScript Runtime)
- Visit: https://nodejs.org/
- Download the "LTS" version (left button)
- Run the installer
- Click "Next" through all steps
- To verify: Open Terminal/Command Prompt and type: `node --version`
  - You should see something like `v18.x.x` or `v20.x.x`

### 2. Install pnpm (Package Manager)
- Open Terminal/Command Prompt
- Type: `npm install -g pnpm`
- Wait for installation to complete
- To verify: Type: `pnpm --version`
  - You should see something like `10.x.x`

### 3. Install PostgreSQL (Database)
- Visit: https://www.postgresql.org/download/
- Download for your operating system
- During installation:
  - Remember the password you set (you'll need it later)
  - Default port: 5432 (keep it)
  - Remember where it's installed
- To verify: Type: `psql --version`
  - You should see something like `psql (PostgreSQL) 15.x`

### 4. Create Database
- Open Terminal/Command Prompt
- Type: `psql -U postgres`
- Enter the password you set during PostgreSQL installation
- Type: `CREATE DATABASE xchange_dev;`
- Type: `\q` to exit

## Setting Up the Project

### Step 1: Download the Code

If you haven't already cloned the repository:

```bash
# Open Terminal/Command Prompt
# Navigate to where you want to store the project
cd Desktop  # or wherever you prefer

# Clone the repository
git clone <your-repository-url>
cd xchange-egypt
```

### Step 2: Configure Environment Variables

1. Go to the `backend` folder in your project
2. Find the file `.env.example`
3. Make a copy and rename it to `.env`
4. Open `.env` in a text editor (Notepad, TextEdit, etc.)
5. Update these lines:

```bash
# Database connection
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/xchange_dev"
# Replace YOUR_PASSWORD with the PostgreSQL password you set

# JWT Secret (can be any random string)
JWT_SECRET="your-secret-key-change-this-in-production"

# Redis (if not installed, you can skip this for now)
REDIS_URL="redis://localhost:6379"

# Node environment
NODE_ENV="development"

# Server port
PORT=3000
```

6. Save the file

### Step 3: Install Dependencies

```bash
# Open Terminal/Command Prompt
# Navigate to the backend folder
cd xchange-egypt/backend

# Install all required packages (this may take 2-5 minutes)
pnpm install
```

You'll see lots of text scrolling by - this is normal. Wait until you see "Done in X.Xs".

### Step 4: Set Up Database Structure

```bash
# Still in the backend folder
# Create database tables
pnpm run prisma:migrate

# Generate Prisma client
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm exec prisma generate
```

If asked "Are you sure?", type `y` and press Enter.

## Running the Seed System

Now for the fun part - filling your database with demo data!

### Option 1: Full Demo Data (Recommended for First Time)

```bash
# Make sure you're in the backend folder
pnpm run seed
```

**What you'll see:**
```
============================================================
🌱 XCHANGE PLATFORM - COMPREHENSIVE DATABASE SEEDING
============================================================
This will seed the database with demo data for testing
and demonstrations to investors.
============================================================

🧹 Clearing existing data...
   ✓ Cleared barter offers
   ✓ Cleared transactions
   ✓ Cleared listings
   ✓ Cleared items
   ✓ Cleared users
   ✓ Cleared categories
✅ Database cleared successfully

============================================================
📦 Seeding Categories
============================================================
🌱 Seeding categories...
✅ Categories seeded successfully

============================================================
📦 Seeding Users
============================================================
🌱 Seeding 9 demo users...
✅ Users seeded successfully

============================================================
📦 Seeding Items
============================================================
🌱 Seeding 13 demo items...
✅ Items seeded successfully

============================================================
📦 Seeding Demo Data (Listings, Transactions, Barter)
============================================================
🌱 Seeding demo data...
✅ Demo data seeded successfully

============================================================
✅ DATABASE SEEDING COMPLETED SUCCESSFULLY
============================================================
⏱️  Total time: 3.45s

📊 Database is now populated with:
   • Product categories (hierarchical)
   • Demo users (individuals & businesses)
   • Sample items across categories
   • Active listings
   • Transaction history
   • Barter offers and exchanges

🔐 Demo Login Credentials:
   Individual: ahmed.mohamed@example.com / Password123!
   Business: contact@techstore.eg / Password123!
   All passwords: Password123!

🚀 Ready for testing and demonstrations!

============================================================
```

**Success!** Your database now has realistic demo data.

### Option 2: Individual Components

If you only want to add specific data:

```bash
# Add only users
pnpm run seed:users

# Add only items
pnpm run seed:items

# Add only demo transactions and barters
pnpm run seed:demo
```

## Starting the Server

Now let's start the backend server so you can test the API:

```bash
# Make sure you're in the backend folder
pnpm run dev
```

**What you'll see:**
```
🚀 Server is running on port 3000
📊 Environment: development
🗄️  Database: Connected
🔴 Redis: Connected (or "Not configured" if you skipped Redis)
```

**Keep this terminal window open** - the server needs to keep running.

## Testing the Demo Data

### Method 1: Using Prisma Studio (Visual Database Browser)

This is the easiest way to see your data visually.

1. Open a **new** Terminal/Command Prompt window (keep the server running)
2. Navigate to backend folder: `cd xchange-egypt/backend`
3. Run: `pnpm run prisma:studio`
4. Your web browser will open automatically at `http://localhost:5555`

**What you can do:**
- Click "User" to see all 9 demo users
- Click "Item" to see all 13 products
- Click "Listing" to see active sales
- Click "Transaction" to see completed orders
- Click "BarterOffer" to see barter exchanges
- Click any row to see full details
- Edit data directly if needed

### Method 2: Using API Calls (For Testing Endpoints)

I'll create a simple test script for you:

#### Test Script 1: Get All Listings

Create a file called `test-api.sh` in the backend folder:

```bash
#!/bin/bash

echo "🔍 Testing Xchange API with Demo Data"
echo "======================================"
echo ""

echo "1. Getting all active listings..."
curl -s http://localhost:3000/api/v1/listings | json_pp
echo ""
echo "======================================"
```

Run it:
```bash
chmod +x test-api.sh
./test-api.sh
```

#### Test Script 2: Login as Demo User

Create `test-login.sh`:

```bash
#!/bin/bash

echo "🔐 Testing Login with Demo User"
echo "======================================"
echo ""

echo "Logging in as Ahmed Mohamed..."
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ahmed.mohamed@example.com", "password": "Password123!"}' \
  | json_pp

echo ""
echo "======================================"
```

Run it:
```bash
chmod +x test-login.sh
./test-login.sh
```

**What you'll see:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "ahmed.mohamed@example.com",
      "fullName": "Ahmed Mohamed",
      "accountType": "INDIVIDUAL"
    }
  }
}
```

Copy the token value - you'll need it for authenticated requests.

## Demo Scenarios for Investors

Now you can demonstrate these scenarios:

### Scenario 1: Browse Products
- Open Prisma Studio
- Show the Items table
- Click on "Dell XPS 13" - show bilingual titles
- Show different categories (Electronics, Furniture, Vehicles)

### Scenario 2: User Accounts
- Show the User table
- Demonstrate both individual and business accounts
- Show different governorates (Cairo, Alexandria, Giza)

### Scenario 3: Active Marketplace
- Show the Listing table
- Point out different price points (EGP 12,000 - 35,000)
- Show expiration dates

### Scenario 4: Order Management
- Show the Transaction table
- Demonstrate different statuses:
  - **Delivered**: Completed order with tracking number
  - **Shipped**: Order in transit
  - **Pending**: Awaiting payment
- Show payment methods (Bank Transfer, Cash on Delivery, Mobile Wallet)

### Scenario 5: Barter System (Unique Feature!)
- Show the BarterOffer table
- Demonstrate different states:
  - **Pending**: Ahmed wants to trade laptop for Fatma's iPhone
  - **Counter-Offered**: Khaled offered different item instead
  - **Accepted**: Users agreed to exchange
  - **Completed**: Successful barter exchange finished

## Troubleshooting

### "Connection refused" or "ECONNREFUSED"
**Problem:** Database isn't running
**Solution:**
- Windows: Open "Services" → Find "PostgreSQL" → Click "Start"
- Mac: `brew services start postgresql`
- Linux: `sudo systemctl start postgresql`

### "Database does not exist"
**Problem:** Database wasn't created
**Solution:**
```bash
psql -U postgres
CREATE DATABASE xchange_dev;
\q
```

### "pnpm: command not found"
**Problem:** pnpm not installed
**Solution:**
```bash
npm install -g pnpm
```

### "Port 3000 already in use"
**Problem:** Another app is using port 3000
**Solution:**
- Kill the other process, OR
- Change PORT in `.env` to 3001 or another number

### Seed Command Shows Errors
**Problem:** Tables might have existing data
**Solution:**
```bash
# Reset everything and start fresh
pnpm run db:reset
pnpm run seed
```

## Quick Reference: Demo Login Credentials

Use these to test login functionality:

| User Type | Email | Password | Governorate |
|-----------|-------|----------|-------------|
| Individual | ahmed.mohamed@example.com | Password123! | Cairo |
| Individual | fatma.ali@example.com | Password123! | Alexandria |
| Individual | khaled.hassan@example.com | Password123! | Giza |
| Individual | mona.ibrahim@example.com | Password123! | Cairo |
| Individual | omar.saeed@example.com | Password123! | Cairo |
| Business | contact@techstore.eg | Password123! | Cairo |
| Business | info@furniturehub.eg | Password123! | Giza |
| Business | sales@autoparts.eg | Password123! | Alexandria |
| Business | support@greencycle.eg | Password123! | Cairo |

**All passwords are:** `Password123!`

## Regular Testing Workflow

Every time you want to demo the platform:

1. **Start the database** (if not running)
   - Usually starts automatically, but check if you have connection errors

2. **Navigate to backend folder**
   ```bash
   cd xchange-egypt/backend
   ```

3. **Start the server**
   ```bash
   pnpm run dev
   ```

4. **Open Prisma Studio** (in a new terminal)
   ```bash
   pnpm run prisma:studio
   ```

5. **Browse the data** at http://localhost:5555

6. **Show investors** the different features using the demo data

## Resetting Demo Data

If you make changes and want to start fresh:

```bash
# This will delete everything and recreate with fresh demo data
pnpm run seed
```

**Warning:** This deletes ALL data in your database!

## Next Steps

Once you're comfortable with the seed data:

1. **Test the Frontend** - When frontend is built, it will connect to this backend
2. **Modify Demo Data** - Edit the seed files to add more items or users
3. **Create Custom Scenarios** - Add specific demo scenarios for different investors
4. **Prepare Demo Script** - Write out what you'll show in what order

## Getting Help

If you get stuck:

1. Check the error message carefully
2. Look in the Troubleshooting section above
3. Make sure all prerequisites are installed
4. Verify the database is running
5. Check that `.env` file has correct database password

## Summary

**You've successfully:**
✅ Set up the development environment
✅ Created a database with demo data
✅ Started the backend server
✅ Viewed the data in Prisma Studio
✅ Tested API endpoints
✅ Prepared demo scenarios for investors

**Your platform now has:**
- 9 demo user accounts
- 13 products across multiple categories
- 4 active sale listings
- 3 transactions showing the order lifecycle
- 4 barter exchanges demonstrating your unique feature

**Ready for investor demos!** 🚀
