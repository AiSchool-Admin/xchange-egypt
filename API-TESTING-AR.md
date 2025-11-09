# 🧪 دليل اختبار الـ API - منصة Xchange

دليل سريع لاختبار جميع أنظمة المنصة بعد النشر.

---

## 🔧 الأدوات المطلوبة

يمكنك استخدام أي من:
- **Postman** - https://www.postman.com/downloads/
- **Thunder Client** (إضافة VS Code)
- **curl** (من Terminal)
- أو أي متصفح للطلبات البسيطة (GET)

**رابط الـ API:** `https://xchange-backend.onrender.com`

---

## 1️⃣ اختبارات أساسية (بدون تسجيل دخول)

### ✅ فحص الصحة (Health Check)
```
GET https://xchange-backend.onrender.com/health
```

**النتيجة المتوقعة:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-08T...",
  "environment": "production"
}
```

---

### ✅ معلومات الـ API
```
GET https://xchange-backend.onrender.com/api/v1
```

**النتيجة المتوقعة:**
```json
{
  "message": "Xchange API v1",
  "version": "0.1.0",
  "documentation": "/api/v1/docs"
}
```

---

## 2️⃣ نظام المصادقة (Authentication)

### 📝 تسجيل مستخدم جديد

```
POST https://xchange-backend.onrender.com/api/v1/auth/register

Headers:
Content-Type: application/json

Body:
{
  "email": "test@xchange.com",
  "password": "Test123!@#",
  "fullName": "أحمد محمد",
  "phone": "+201234567890",
  "userType": "INDIVIDUAL"
}
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid...",
      "email": "test@xchange.com",
      "fullName": "أحمد محمد"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

✅ **احفظ الـ `accessToken` - ستحتاجه في جميع الطلبات القادمة!**

---

### 🔑 تسجيل الدخول

```
POST https://xchange-backend.onrender.com/api/v1/auth/login

Headers:
Content-Type: application/json

Body:
{
  "email": "test@xchange.com",
  "password": "Test123!@#"
}
```

---

## 3️⃣ نظام الأصناف (Categories)

### 📋 عرض جميع الأصناف

```
GET https://xchange-backend.onrender.com/api/v1/categories
```

---

## 4️⃣ نظام المنتجات (Items)

### ➕ إضافة منتج جديد

```
POST https://xchange-backend.onrender.com/api/v1/items

Headers:
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN

Body:
{
  "title": "آيفون 14 برو ماكس 256 جيجا",
  "description": "جهاز جديد، لم يستخدم، بالكرتونة والضمان",
  "categoryId": "CATEGORY_UUID",
  "condition": "NEW",
  "estimatedValue": 45000,
  "images": [
    "https://example.com/image1.jpg"
  ],
  "location": "القاهرة",
  "specifications": {
    "color": "أسود",
    "storage": "256GB",
    "warranty": "سنة"
  }
}
```

---

### 🔍 البحث عن منتجات

```
GET https://xchange-backend.onrender.com/api/v1/items?page=1&limit=20
```

---

## 5️⃣ نظام البحث المتقدم (Advanced Search)

### 🔍 بحث متقدم

```
GET https://xchange-backend.onrender.com/api/v1/search?query=ايفون&minPrice=20000&maxPrice=50000&condition=NEW&location=القاهرة
```

---

### 🤖 بحث ذكي بالـ AI

```
GET https://xchange-backend.onrender.com/api/v1/search/ai?query=أبحث عن لابتوب للجيمنج&limit=10
```

---

### 📊 عمليات البحث الشائعة

```
GET https://xchange-backend.onrender.com/api/v1/search/popular?limit=10
```

---

### 🔥 البحث الرائج (Trending)

```
GET https://xchange-backend.onrender.com/api/v1/search/trending?limit=10
```

---

### 💾 حفظ بحث

```
POST https://xchange-backend.onrender.com/api/v1/search/saved

Headers:
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

Body:
{
  "name": "آيفونات جديدة تحت 20 ألف",
  "query": "ايفون",
  "filters": {
    "maxPrice": 20000,
    "condition": "NEW"
  },
  "notifyOnNew": true
}
```

---

## 6️⃣ نظام التقييمات (Reviews)

### ⭐ إضافة تقييم

```
POST https://xchange-backend.onrender.com/api/v1/reviews

Headers:
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

Body:
{
  "transactionId": "TRANSACTION_UUID",
  "reviewedId": "USER_UUID",
  "overallRating": 5,
  "itemAsDescribed": 5,
  "communication": 5,
  "shippingSpeed": 4,
  "packaging": 5,
  "title": "بائع ممتاز!",
  "comment": "المنتج وصل بسرعة وبحالة ممتازة. البائع محترم جداً."
}
```

---

### 📋 عرض تقييمات بائع

```
GET https://xchange-backend.onrender.com/api/v1/reviews?reviewedId=USER_UUID&sortBy=helpful
```

---

### 📊 إحصائيات التقييمات

```
GET https://xchange-backend.onrender.com/api/v1/reviews/users/USER_UUID/stats
```

---

## 7️⃣ نظام الإشعارات (Notifications)

### 🔔 عرض الإشعارات

```
GET https://xchange-backend.onrender.com/api/v1/notifications

Headers:
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

### 📬 عدد الإشعارات غير المقروءة

```
GET https://xchange-backend.onrender.com/api/v1/notifications/unread-count

Headers:
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

### ✅ تعليم كل الإشعارات كمقروءة

```
POST https://xchange-backend.onrender.com/api/v1/notifications/mark-all-read

Headers:
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 8️⃣ نظام الشات (Real-time Chat)

### 💬 إنشاء محادثة

```
POST https://xchange-backend.onrender.com/api/v1/chat/conversations

Headers:
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

Body:
{
  "participant2Id": "USER_UUID",
  "itemId": "ITEM_UUID"
}
```

---

### 📨 إرسال رسالة

```
POST https://xchange-backend.onrender.com/api/v1/chat/messages

Headers:
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

Body:
{
  "conversationId": "CONVERSATION_UUID",
  "content": "السلام عليكم، المنتج لسه متاح؟",
  "type": "TEXT"
}
```

---

### 💬 عرض المحادثات

```
GET https://xchange-backend.onrender.com/api/v1/chat/conversations

Headers:
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

### 📬 عدد الرسائل غير المقروءة

```
GET https://xchange-backend.onrender.com/api/v1/chat/unread-count

Headers:
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 9️⃣ نظام المزادات العكسية (Reverse Auctions)

### 📢 إنشاء طلب (مزاد عكسي)

```
POST https://xchange-backend.onrender.com/api/v1/reverse-auctions

Headers:
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

Body:
{
  "title": "محتاج لابتوب Dell للبرمجة",
  "description": "أبحث عن لابتوب Dell جديد أو شبه جديد...",
  "categoryId": "CATEGORY_UUID",
  "condition": "LIKE_NEW",
  "maxBudget": 15000,
  "targetPrice": 12000,
  "endDate": "2025-11-15T23:59:59Z",
  "quantity": 1
}
```

---

### 📋 عرض المزادات العكسية النشطة

```
GET https://xchange-backend.onrender.com/api/v1/reverse-auctions?status=ACTIVE
```

---

## 🔟 نظام رفع الصور (Image Upload)

### 📸 رفع صورة

```
POST https://xchange-backend.onrender.com/api/v1/images/upload

Headers:
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: multipart/form-data

Body (form-data):
- image: [اختر ملف الصورة]
- category: items
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "filename": "image-abc123.jpg",
    "sizes": {
      "original": "https://.../original/image-abc123.jpg",
      "large": "https://.../large/image-abc123.jpg",
      "medium": "https://.../medium/image-abc123.jpg",
      "thumbnail": "https://.../thumbnail/image-abc123.jpg"
    }
  }
}
```

---

## 📊 سيناريو اختبار كامل

### خطوات الاختبار الشامل:

1. ✅ **التسجيل** - أنشئ حساب جديد
2. ✅ **تسجيل الدخول** - احصل على Token
3. ✅ **إضافة منتج** - أضف منتج للبيع
4. ✅ **البحث** - ابحث عن منتجات
5. ✅ **إنشاء محادثة** - تواصل مع بائع
6. ✅ **إرسال رسالة** - أرسل رسالة
7. ✅ **عرض الإشعارات** - تحقق من الإشعارات
8. ✅ **إضافة تقييم** - قيّم بائع

---

## 🐛 استكشاف الأخطاء

### خطأ 401 Unauthorized
- تأكد من إضافة `Authorization: Bearer TOKEN`
- تحقق من أن الـ Token صحيح وغير منتهي الصلاحية

### خطأ 404 Not Found
- تأكد من الرابط صحيح
- تحقق من أن المنصة تعمل

### خطأ 500 Internal Server Error
- تحقق من الـ logs في Render
- تأكد من اتصال قاعدة البيانات

---

## 📝 ملاحظات مهمة

1. **استبدل `YOUR_ACCESS_TOKEN`** بالـ Token الذي حصلت عليه من تسجيل الدخول
2. **استبدل `CATEGORY_UUID`, `USER_UUID`, إلخ** بالقيم الحقيقية من قاعدة البيانات
3. **جميع الطلبات تتطلب `Content-Type: application/json`** ما عدا رفع الصور
4. **الطلبات المحمية تحتاج `Authorization: Bearer TOKEN`**

---

## 🎉 تهانينا!

إذا نجحت جميع الاختبارات، فالمنصة تعمل بكفاءة 100%! 🚀

**المنصة جاهزة الآن لاستقبال المستخدمين الحقيقيين!**
