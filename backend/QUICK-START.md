# ⚡ Quick Start Guide - Xchange Egypt

**Setup in 5 minutes!**

---

## 🚀 الإعداد السريع

### 1. تثبيت PostgreSQL

**Windows:**
```powershell
# تحميل من: https://www.postgresql.org/download/windows/
# أو باستخدام Chocolatey:
choco install postgresql
```

**Mac:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. إنشاء Database

```bash
# افتح PostgreSQL
psql -U postgres

# أو في Linux:
sudo -u postgres psql
```

```sql
CREATE DATABASE xchange;
CREATE USER xchange_user WITH PASSWORD 'dev123';
GRANT ALL PRIVILEGES ON DATABASE xchange TO xchange_user;
\q
```

### 3. تثبيت Dependencies

```bash
cd backend
pnpm install
```

### 4. إعداد البيئة

ملف `.env` جاهز بالفعل! ✅

### 5. إعداد Database

```bash
pnpm prisma generate
pnpm db:push
```

### 6. إضافة بيانات تجريبية

```bash
pnpm seed
```

### 7. تشغيل السيرفر

```bash
pnpm dev
```

السيرفر يعمل الآن على: **http://localhost:3001** ✅

---

## 🧪 الاختبار السريع

### 1. Health Check

```bash
curl http://localhost:3001/health
```

### 2. Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Test123!"}'
```

### 3. Get Categories

```bash
curl http://localhost:3001/api/v1/categories
```

### 4. Get Items

```bash
curl http://localhost:3001/api/v1/items
```

### 5. Get Auctions

```bash
curl http://localhost:3001/api/v1/auctions
```

---

## 📦 حسابات الاختبار

| Email | Password | Type |
|-------|----------|------|
| admin@xchange.eg | Admin123! | Admin |
| john@example.com | Test123! | User |
| sarah@example.com | Test123! | User |
| business@example.com | Test123! | Business |

---

## 📚 للمزيد

- **دليل الاختبار الكامل:** `TESTING-GUIDE.md`
- **Postman Collection:** `Xchange-APIs.postman_collection.json`
- **API Docs:** `docs/api/`

---

## 🐛 مشكلة؟

```bash
# إعادة تشغيل PostgreSQL
# Windows:
net start postgresql-x64-14

# Mac:
brew services restart postgresql@14

# Linux:
sudo systemctl restart postgresql

# إعادة إنشاء Database
pnpm db:reset
pnpm seed
```

---

**You're all set! 🎉**
