# 🧪 دليل الإعداد والاختبار - Xchange Egypt Platform

**آخر تحديث:** نوفمبر 2025

---

## 📋 المتطلبات الأساسية

### 1. البرامج المطلوبة:
- **Node.js** >= 18.0.0 ([تحميل](https://nodejs.org/))
- **pnpm** >= 8.0.0 (تثبيت: `npm install -g pnpm`)
- **PostgreSQL** >= 14.0 ([تحميل](https://www.postgresql.org/download/))
- **Redis** (اختياري) ([تحميل](https://redis.io/download))
- **Git** ([تحميل](https://git-scm.com/))

### 2. أدوات الاختبار (اختيارية):
- **Postman** ([تحميل](https://www.postman.com/downloads/))
- **TablePlus** أو **pgAdmin** (لإدارة قاعدة البيانات)

---

## 🚀 خطوات الإعداد

### الخطوة 1: استنساخ المشروع

```bash
git clone <repository-url>
cd xchange-egypt/backend
```

### الخطوة 2: تثبيت Dependencies

```bash
pnpm install
```

إذا ظهرت تحذيرات حول build scripts:
```bash
pnpm approve-builds
# ثم اختر: @prisma/client, prisma, sharp, bcrypt
```

### الخطوة 3: إعداد قاعدة البيانات PostgreSQL

#### أ. إنشاء قاعدة البيانات:

**على Windows (PowerShell):**
```powershell
# تسجيل الدخول لـ PostgreSQL
psql -U postgres

# إنشاء database و user
CREATE DATABASE xchange;
CREATE USER xchange_user WITH PASSWORD 'dev123';
GRANT ALL PRIVILEGES ON DATABASE xchange TO xchange_user;
\q
```

**على Mac/Linux:**
```bash
# تسجيل الدخول لـ PostgreSQL
sudo -u postgres psql

# إنشاء database و user
CREATE DATABASE xchange;
CREATE USER xchange_user WITH PASSWORD 'dev123';
GRANT ALL PRIVILEGES ON DATABASE xchange TO xchange_user;
\q
```

#### ب. التحقق من الاتصال:
```bash
psql -U xchange_user -d xchange -h localhost
# إذا نجح الاتصال، اكتب: \q للخروج
```

### الخطوة 4: إعداد ملف البيئة (.env)

الملف `.env` موجود بالفعل! تحقق من المحتوى:

```bash
cat .env
```

**إذا كنت تريد تغيير إعدادات قاعدة البيانات:**
```env
DATABASE_URL="postgresql://xchange_user:dev123@localhost:5432/xchange"
```

### الخطوة 5: تطبيق Database Migrations

```bash
pnpm prisma generate
pnpm prisma migrate dev --name init
```

**أو استخدم db push (أسرع للتطوير):**
```bash
pnpm db:push
```

### الخطوة 6: إضافة Seed Data (بيانات تجريبية)

```bash
# تشغيل كل الـ seed data
pnpm seed

# أو خطوة بخطوة:
pnpm seed:categories    # إضافة categories
pnpm seed:users         # إضافة مستخدمين تجريبيين
pnpm seed:items         # إضافة منتجات
pnpm seed:demo          # إضافة بيانات كاملة (listings, barters, auctions)
```

---

## ▶️ تشغيل السيرفر

### وضع التطوير (Development):
```bash
pnpm dev
```

السيرفر سيعمل على: **http://localhost:3001**

### وضع الإنتاج (Production):
```bash
pnpm build
pnpm start
```

---

## 🧪 اختبار النظام

### 1. التحقق من صحة السيرفر

**Health Check:**
```bash
curl http://localhost:3001/health
```

**النتيجة المتوقعة:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-15T10:30:00.000Z"
}
```

### 2. حسابات الاختبار

تم إنشاء 4 حسابات تجريبية عبر seed data:

| Email | Password | Role | الوصف |
|-------|----------|------|-------|
| admin@xchange.eg | Admin123! | Admin | حساب المدير |
| john@example.com | Test123! | User | مشتري/بائع فردي |
| sarah@example.com | Test123! | User | مشتري/بائع فردي |
| business@example.com | Test123! | Business | حساب تجاري |

### 3. تسجيل الدخول

**Request:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Test123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "john@example.com",
      "fullName": "John Doe",
      "userType": "INDIVIDUAL"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**احفظ الـ accessToken لاستخدامه في الطلبات التالية!**

---

## 📡 اختبار الـ APIs

### أ. باستخدام cURL

#### 1. الحصول على Categories:
```bash
curl http://localhost:3001/api/v1/categories
```

#### 2. الحصول على Items:
```bash
curl http://localhost:3001/api/v1/items
```

#### 3. الحصول على Auctions:
```bash
curl http://localhost:3001/api/v1/auctions
```

#### 4. إنشاء Listing (يحتاج Authentication):
```bash
# استبدل YOUR_TOKEN بالـ token من تسجيل الدخول
curl -X POST http://localhost:3001/api/v1/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "itemId": "item-id-here",
    "listingType": "DIRECT_SALE",
    "price": 5000
  }'
```

### ب. باستخدام Postman

#### 1. استيراد Collection:

**إنشاء Collection جديدة في Postman:**

1. افتح Postman
2. اضغط "New" → "Collection"
3. اسمها "Xchange APIs"
4. أضف Environment variables:
   - `BASE_URL`: `http://localhost:3001`
   - `ACCESS_TOKEN`: (سيتم ملؤه بعد Login)

#### 2. إضافة Requests:

**أ. Authentication - Login:**
- Method: `POST`
- URL: `{{BASE_URL}}/api/v1/auth/login`
- Body (JSON):
```json
{
  "email": "john@example.com",
  "password": "Test123!"
}
```
- Test Script (لحفظ token تلقائياً):
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("ACCESS_TOKEN", response.data.accessToken);
}
```

**ب. Categories - Get All:**
- Method: `GET`
- URL: `{{BASE_URL}}/api/v1/categories`

**ج. Items - Get All:**
- Method: `GET`
- URL: `{{BASE_URL}}/api/v1/items`

**د. Auctions - Get All:**
- Method: `GET`
- URL: `{{BASE_URL}}/api/v1/auctions`

**هـ. Auctions - Create Auction:**
- Method: `POST`
- URL: `{{BASE_URL}}/api/v1/auctions`
- Headers:
  - `Authorization`: `Bearer {{ACCESS_TOKEN}}`
- Body (JSON):
```json
{
  "itemId": "item-id-from-listings",
  "startingPrice": 1000,
  "buyNowPrice": 5000,
  "reservePrice": 800,
  "startTime": "2025-11-15T10:00:00Z",
  "endTime": "2025-11-20T10:00:00Z",
  "minBidIncrement": 50,
  "autoExtend": true
}
```

---

## 🔍 اختبار كل نظام

### 1. نظام المستخدمين (Users & Auth) ✅

**التسجيل:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test123!",
    "fullName": "Test User",
    "phone": "+201234567890",
    "userType": "INDIVIDUAL"
  }'
```

**تسجيل الدخول:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test123!"
  }'
```

**الحصول على Profile:**
```bash
curl http://localhost:3001/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. نظام Categories ✅

**الحصول على كل الـ Categories:**
```bash
curl http://localhost:3001/api/v1/categories
```

**الحصول على category معين:**
```bash
curl http://localhost:3001/api/v1/categories/CATEGORY_ID
```

### 3. نظام Items ✅

**الحصول على كل الـ Items:**
```bash
curl http://localhost:3001/api/v1/items
```

**إنشاء Item جديد:**
```bash
curl -X POST http://localhost:3001/api/v1/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "iPhone 13 Pro",
    "description": "Used iPhone in excellent condition",
    "categoryId": "CATEGORY_ID",
    "condition": "LIKE_NEW",
    "estimatedValue": 15000,
    "location": "Cairo",
    "images": ["https://example.com/image1.jpg"]
  }'
```

### 4. نظام Direct Sales (Listings) ✅

**الحصول على كل الـ Listings:**
```bash
curl http://localhost:3001/api/v1/listings
```

**إنشاء Listing:**
```bash
curl -X POST http://localhost:3001/api/v1/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "itemId": "ITEM_ID",
    "listingType": "DIRECT_SALE",
    "price": 15000
  }'
```

### 5. نظام Barter ✅

**الحصول على Barter Offers:**
```bash
curl http://localhost:3001/api/v1/barter/offers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**إنشاء Barter Offer:**
```bash
curl -X POST http://localhost:3001/api/v1/barter/offers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "offeredItemIds": ["ITEM_ID_1"],
    "preferenceSets": [
      {
        "priority": 1,
        "items": [
          {
            "itemId": "ITEM_ID_2"
          }
        ]
      }
    ]
  }'
```

### 6. نظام Auctions ✅

**الحصول على كل المزادات:**
```bash
curl http://localhost:3001/api/v1/auctions
```

**إنشاء مزاد:**
```bash
curl -X POST http://localhost:3001/api/v1/auctions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "itemId": "ITEM_ID",
    "startingPrice": 1000,
    "buyNowPrice": 5000,
    "reservePrice": 800,
    "startTime": "2025-11-16T10:00:00Z",
    "endTime": "2025-11-20T10:00:00Z",
    "minBidIncrement": 50
  }'
```

**المزايدة على مزاد:**
```bash
curl -X POST http://localhost:3001/api/v1/auctions/AUCTION_ID/bids \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "bidAmount": 1100,
    "isAutoBid": false
  }'
```

**مزايدة تلقائية (Proxy Bidding):**
```bash
curl -X POST http://localhost:3001/api/v1/auctions/AUCTION_ID/bids \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "bidAmount": 1100,
    "maxAutoBid": 3000,
    "isAutoBid": true
  }'
```

**الشراء الفوري (Buy Now):**
```bash
curl -X POST http://localhost:3001/api/v1/auctions/AUCTION_ID/buy-now \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 فحص قاعدة البيانات

### استخدام Prisma Studio (واجهة رسومية):
```bash
pnpm prisma:studio
```

سيفتح متصفح على: **http://localhost:5555**

يمكنك:
- عرض كل الجداول
- تحرير البيانات
- إضافة سجلات جديدة
- حذف البيانات

### استخدام psql:
```bash
psql -U xchange_user -d xchange
```

**أوامر مفيدة:**
```sql
-- عرض كل الجداول
\dt

-- عدد المستخدمين
SELECT COUNT(*) FROM users;

-- عدد الـ Items
SELECT COUNT(*) FROM items;

-- عدد المزادات
SELECT COUNT(*) FROM auctions;

-- عدد المزايدات
SELECT COUNT(*) FROM auction_bids;

-- أحدث 5 مستخدمين
SELECT id, email, "fullName", "createdAt" FROM users ORDER BY "createdAt" DESC LIMIT 5;

-- كل المزادات النشطة
SELECT id, "startingPrice", "currentPrice", status FROM auctions WHERE status = 'ACTIVE';
```

---

## 🐛 حل المشاكل الشائعة

### 1. خطأ في الاتصال بقاعدة البيانات:
```
Error: Can't reach database server at localhost:5432
```

**الحل:**
- تأكد من تشغيل PostgreSQL:
  ```bash
  # Windows
  net start postgresql-x64-14

  # Mac
  brew services start postgresql

  # Linux
  sudo systemctl start postgresql
  ```

### 2. خطأ في Authentication:
```
Error: password authentication failed for user "xchange_user"
```

**الحل:**
- تحقق من كلمة المرور في DATABASE_URL
- أعد إنشاء المستخدم:
  ```sql
  DROP USER IF EXISTS xchange_user;
  CREATE USER xchange_user WITH PASSWORD 'dev123';
  GRANT ALL PRIVILEGES ON DATABASE xchange TO xchange_user;
  ```

### 3. Port 3001 مستخدم بالفعل:
```
Error: listen EADDRINUSE: address already in use :::3001
```

**الحل:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3001
kill -9 <PID>
```

أو غيّر PORT في .env:
```env
PORT=3002
```

### 4. Prisma Client لم يتم توليده:
```
Error: @prisma/client did not initialize yet
```

**الحل:**
```bash
pnpm prisma generate
```

---

## 📝 سيناريوهات الاختبار الكاملة

### سيناريو 1: رحلة البائع (Seller Journey)

1. **التسجيل:**
   ```bash
   # POST /api/v1/auth/register
   ```

2. **تسجيل الدخول:**
   ```bash
   # POST /api/v1/auth/login
   ```

3. **إنشاء Item:**
   ```bash
   # POST /api/v1/items
   ```

4. **إنشاء Listing (بيع مباشر):**
   ```bash
   # POST /api/v1/listings
   ```

5. **إنشاء Auction:**
   ```bash
   # POST /api/v1/auctions
   ```

6. **مراقبة المزايدات:**
   ```bash
   # GET /api/v1/auctions/AUCTION_ID/bids
   ```

### سيناريو 2: رحلة المشتري (Buyer Journey)

1. **التسجيل والدخول**

2. **تصفح المنتجات:**
   ```bash
   # GET /api/v1/items
   # GET /api/v1/items?category=electronics
   ```

3. **عرض المزادات:**
   ```bash
   # GET /api/v1/auctions
   # GET /api/v1/auctions?status=ACTIVE
   ```

4. **المزايدة:**
   ```bash
   # POST /api/v1/auctions/AUCTION_ID/bids
   ```

5. **الشراء الفوري:**
   ```bash
   # POST /api/v1/auctions/AUCTION_ID/buy-now
   ```

### سيناريو 3: رحلة المقايضة (Barter Journey)

1. **إنشاء Items للمقايضة**

2. **إنشاء Barter Offer:**
   ```bash
   # POST /api/v1/barter/offers
   ```

3. **قبول/رفض Offer:**
   ```bash
   # POST /api/v1/barter/offers/OFFER_ID/accept
   # POST /api/v1/barter/offers/OFFER_ID/reject
   ```

---

## 📚 موارد إضافية

### التوثيق:
- **API Documentation:** `docs/api/`
- **Auction API:** `docs/api/AUCTION-API.md`
- **Database Schema:** `prisma/schema.prisma`

### أدوات التطوير:
- **TypeScript Docs:** https://www.typescriptlang.org/docs/
- **Prisma Docs:** https://www.prisma.io/docs/
- **Express Docs:** https://expressjs.com/

---

## ✅ Checklist قبل البدء في التطوير

- [ ] PostgreSQL مثبت ويعمل
- [ ] قاعدة البيانات `xchange` موجودة
- [ ] Dependencies مثبتة (`pnpm install`)
- [ ] Prisma Client تم توليده (`pnpm prisma generate`)
- [ ] Migrations مطبقة (`pnpm db:push`)
- [ ] Seed data مضافة (`pnpm seed`)
- [ ] السيرفر يعمل (`pnpm dev`)
- [ ] Health check يعمل (`curl localhost:3001/health`)
- [ ] Login API يعمل
- [ ] تم اختبار API واحد على الأقل بنجاح

---

## 🎯 الخطوات التالية

بعد التأكد من عمل كل شيء:

1. ✅ اختبر كل الـ APIs الموجودة
2. ✅ راجع الـ PROGRESS.md لمعرفة ما تم إنجازه
3. ✅ اختر النظام التالي للتطوير:
   - Reverse Auction System
   - Reviews & Ratings
   - Notifications
   - Chat/Messaging
   - Image Upload
   - Advanced Search

---

**إذا واجهت أي مشكلة، راجع قسم "حل المشاكل الشائعة" أو اطلب المساعدة!**

**Happy Testing! 🚀**
