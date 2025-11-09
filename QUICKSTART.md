# 🚀 Quick Start Guide - Xchange Platform

This guide will help you get the Xchange backend up and running in **under 10 minutes**.

---

## 📋 Prerequisites

Make sure you have these installed:
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** ([Install](https://pnpm.io/installation)): `npm install -g pnpm`
- **Docker** ([Download](https://www.docker.com/)) - for databases

---

## 🎯 Step-by-Step Setup

### 1️⃣ Setup Databases (PostgreSQL + Redis)

**Using Docker (Recommended):**

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

# Verify they're running
docker ps
```

**Alternative (Manual Installation):**
- [Install PostgreSQL](https://www.postgresql.org/download/)
- [Install Redis](https://redis.io/download/)

---

### 2️⃣ Install Dependencies

```bash
cd backend
pnpm install
```

This will install all required packages (~2-3 minutes).

---

### 3️⃣ Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your preferred editor
nano .env
```

**Minimum required configuration:**
```env
DATABASE_URL="postgresql://xchange_user:dev123@localhost:5432/xchange"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-change-this-too"
```

**Important:** Change the JWT secrets to random strings in production!

---

### 4️⃣ Setup Database

```bash
# Generate Prisma Client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate

# (Optional) Open Prisma Studio to view database
pnpm prisma:studio
```

Prisma Studio will open at: http://localhost:5555

---

### 5️⃣ Start Development Server

```bash
pnpm dev
```

You should see:
```
✅ Redis connected
✅ Database connected
🚀 Server running on port 3001
🌍 Environment: development
📍 API URL: http://localhost:3001
🔗 Health check: http://localhost:3001/health
```

---

## ✅ Test the API

### Health Check

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-06T12:00:00.000Z",
  "environment": "development"
}
```

### Register a User

```bash
curl -X POST http://localhost:3001/api/v1/auth/register/individual \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "fullName": "Test User",
    "phone": "01012345678"
  }'
```

Expected response (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "fullName": "Test User",
      ...
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

### Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

### Get Profile (Protected Route)

```bash
# Replace YOUR_TOKEN with the accessToken from login/register
curl http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📚 Available Endpoints

### Authentication
- `POST /api/v1/auth/register/individual` - Register individual
- `POST /api/v1/auth/register/business` - Register business
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/logout-all` - Logout all devices (protected)
- `GET /api/v1/auth/me` - Get current user (protected)

**Full API documentation:** [docs/api/AUTHENTICATION.md](./docs/api/AUTHENTICATION.md)

---

## 🛠️ Development Commands

```bash
# Start development server (hot reload)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Open Prisma Studio (database GUI)
pnpm prisma:studio

# Run database migrations
pnpm prisma:migrate

# Reset database (WARNING: deletes all data)
pnpm db:reset
```

---

## 🐛 Troubleshooting

### "Cannot connect to database"

**Check if PostgreSQL is running:**
```bash
docker ps
# Should show xchange-postgres container
```

**If not running:**
```bash
docker start xchange-postgres
```

**Test connection:**
```bash
psql "postgresql://xchange_user:dev123@localhost:5432/xchange"
```

---

### "Cannot connect to Redis"

**Check if Redis is running:**
```bash
docker ps
# Should show xchange-redis container
```

**If not running:**
```bash
docker start xchange-redis
```

**Test connection:**
```bash
redis-cli ping
# Should return: PONG
```

---

### "Port 3001 already in use"

**Find and kill the process:**
```bash
# Linux/Mac
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Or change the port in `.env`:**
```env
PORT=3002
```

---

### "Prisma Client Not Generated"

```bash
pnpm prisma:generate
```

---

### "Migration Failed"

**Reset database and try again:**
```bash
pnpm db:reset
pnpm prisma:migrate
```

---

## 🔄 Resetting Everything

If things get messy, start fresh:

```bash
# Stop and remove containers
docker stop xchange-postgres xchange-redis
docker rm xchange-postgres xchange-redis

# Delete node_modules
rm -rf node_modules

# Reinstall everything
pnpm install

# Start containers again
# (run the docker commands from Step 1)

# Run migrations
pnpm prisma:migrate
```

---

## 📊 Viewing Database

### Option 1: Prisma Studio (Recommended)
```bash
pnpm prisma:studio
```
Opens at: http://localhost:5555

### Option 2: psql CLI
```bash
psql "postgresql://xchange_user:dev123@localhost:5432/xchange"
```

**Useful commands:**
```sql
-- List all tables
\dt

-- View users
SELECT * FROM users;

-- Count users
SELECT COUNT(*) FROM users;

-- Exit
\q
```

### Option 3: DBeaver / pgAdmin
- [DBeaver](https://dbeaver.io/) - Free, multi-platform
- [pgAdmin](https://www.pgadmin.org/) - PostgreSQL official GUI

**Connection details:**
- Host: localhost
- Port: 5432
- Database: xchange
- Username: xchange_user
- Password: dev123

---

## 🧪 Testing with Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Import the collection: [docs/postman/Xchange.postman_collection.json](./docs/postman/) (coming soon)
3. Set environment variable `BASE_URL` to `http://localhost:3001`

---

## 📖 Next Steps

Now that authentication is working, here are the next features to implement:

### Week 1-2:
- [ ] User profile management (update, upload avatar)
- [ ] Category management (CRUD)
- [ ] Item management (create, read, update, delete)
- [ ] Image upload with Sharp

### Week 3-4:
- [ ] Direct sales system
- [ ] Simple barter (2-party)
- [ ] Search & filters
- [ ] Admin panel basics

---

## 📞 Need Help?

- **Documentation:** [README.md](./README.md)
- **API Docs:** [docs/api/](./docs/api/)
- **Technical Plan:** [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md)
- **GitHub Issues:** Create an issue in the repository

---

## 🎉 Congratulations!

You now have a fully working authentication system! 🚀

**What you've accomplished:**
✅ Backend server running
✅ Database setup
✅ User registration
✅ Login/logout
✅ JWT authentication
✅ Protected routes

**Ready to build more features!** 💪

---

**Made with ❤️ by Xchange Team**
