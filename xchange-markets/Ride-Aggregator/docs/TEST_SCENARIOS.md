# 🧪 سيناريوهات اختبار خدمة النقل الذكي

## نظرة عامة

هذا الدليل يشرح كيفية اختبار جميع مميزات ووظائف خدمة النقل الذكي في Xchange.

---

## 🔧 الإعداد

### تشغيل الاختبارات الآلية

```bash
cd backend
npx jest src/tests/transport-service.test.ts --verbose
```

### متغيرات البيئة المطلوبة

```env
GOOGLE_MAPS_API_KEY=your_api_key
REDIS_URL=redis://localhost:6379
```

---

## 📡 اختبار API Endpoints

### Base URL
```
https://your-api.railway.app/api/v1
```

---

## 1️⃣ الحصول على تقديرات الأسعار

### Request
```http
GET /transport/estimates?pickupLat=30.0444&pickupLng=31.2357&dropoffLat=29.9602&dropoffLng=31.2569
```

### مع معلمات إضافية
```http
GET /transport/estimates?pickupLat=30.0444&pickupLng=31.2357&dropoffLat=29.9602&dropoffLng=31.2569&isRaining=true&hasEvent=true&eventName=مباراة
```

### Expected Response
```json
{
  "success": true,
  "data": {
    "route": {
      "pickup": { "lat": 30.0444, "lng": 31.2357 },
      "dropoff": { "lat": 29.9602, "lng": 31.2569 },
      "distanceKm": 9.5,
      "durationMin": 25,
      "trafficCondition": "moderate"
    },
    "surge": {
      "multiplier": 1.35,
      "isActive": true,
      "demandLevel": "MEDIUM"
    },
    "estimates": [
      {
        "provider": "BOLT",
        "providerNameAr": "بولت",
        "vehicleTypeName": "Bolt",
        "price": 35,
        "priceRange": { "min": 33, "max": 37 },
        "priceBreakdown": {
          "baseFare": 7,
          "distanceFare": 26.6,
          "timeFare": 8.75,
          "bookingFee": 0,
          "surgeMultiplier": 1.35,
          "surgeCost": 14
        },
        "etaMinutes": 5,
        "surgeInfo": {
          "multiplier": 1.35,
          "reason": "ساعة الذروة"
        },
        "features": ["أرخص سعر", "تكييف"],
        "capacity": 4,
        "deepLink": "bolt://ride?..."
      }
    ],
    "recommendation": {
      "provider": "Bolt",
      "product": "Bolt",
      "price": 35,
      "reason": "أفضل توازن بين السعر والوقت والموثوقية"
    },
    "meta": {
      "totalProviders": 7,
      "totalEstimates": 18,
      "pricingEngine": "AI_SIMULATOR_V1",
      "accuracy": "95-100%"
    }
  }
}
```

### سيناريوهات الاختبار

| السيناريو | المعلمات | التوقع |
|-----------|----------|--------|
| رحلة قصيرة | distance < 5km | أسعار منخفضة |
| رحلة طويلة | distance > 30km | أسعار أعلى |
| ذروة صباحية | time: 8-10 AM | Surge > 1.3 |
| ذروة مسائية | time: 6-8 PM | Surge > 1.4 |
| مطر | isRaining=true | Surge يزيد 30-50% |
| حدث | hasEvent=true | Surge يزيد 50-100% |

---

## 2️⃣ معلومات Surge

### Request
```http
GET /transport/surge?lat=30.0444&lng=31.2357
```

### مع ظروف خاصة
```http
GET /transport/surge?lat=30.0444&lng=31.2357&isRaining=true&hasEvent=true
```

### Expected Response
```json
{
  "success": true,
  "data": {
    "current": {
      "multiplier": 1.45,
      "isActive": true,
      "demandLevel": "HIGH",
      "byProvider": [
        { "provider": "UBER", "multiplier": 1.5, "reason": "ساعة الذروة + أمطار" },
        { "provider": "CAREEM", "multiplier": 1.6, "reason": "ساعة الذروة + أمطار" },
        { "provider": "BOLT", "multiplier": 1.4, "reason": "ساعة الذروة + أمطار" },
        { "provider": "DIDI", "multiplier": 1.3, "reason": "ساعة الذروة" }
      ]
    },
    "predictions": [
      { "hour": 18, "multiplier": 1.45, "label": "الذروة المسائية" },
      { "hour": 19, "multiplier": 1.6, "label": "الذروة المسائية" },
      { "hour": 20, "multiplier": 1.3, "label": "الذروة المسائية" },
      { "hour": 21, "multiplier": 1.1, "label": "الليل" }
    ],
    "bestTimeToBook": {
      "hour": 14,
      "multiplier": 1.0,
      "label": "بعد الظهر",
      "savings": 0.45,
      "savingsPercent": 31
    },
    "worstTimeToBook": {
      "hour": 19,
      "multiplier": 1.6,
      "label": "الذروة المسائية",
      "extraCost": 60
    },
    "tips": [
      "الطلب مرتفع جداً الآن - فكر في الانتظار إذا أمكن",
      "جرب inDrive للتفاوض على سعر أقل",
      "المطر يزيد الطلب - توقع أسعار أعلى قليلاً"
    ]
  }
}
```

---

## 3️⃣ قائمة المزودين

### Request
```http
GET /transport/providers
```

### Expected Response
```json
{
  "success": true,
  "data": [
    {
      "id": "UBER",
      "name": "Uber",
      "nameAr": "أوبر",
      "avgRating": 4.7,
      "reliabilityScore": 95,
      "vehicleTypes": [
        { "type": "ECONOMY", "name": "UberX", "nameAr": "أوبر إكس" },
        { "type": "COMFORT", "name": "Uber Comfort", "nameAr": "أوبر كومفورت" },
        { "type": "PREMIUM", "name": "Uber Black", "nameAr": "أوبر بلاك" },
        { "type": "XL", "name": "UberXL", "nameAr": "أوبر XL" }
      ]
    }
  ]
}
```

---

## 4️⃣ إنشاء تنبيه سعر

### Request
```http
POST /transport/alerts
Content-Type: application/json
Authorization: Bearer <token>

{
  "pickupLat": 30.0444,
  "pickupLng": 31.2357,
  "pickupAddress": "ميدان التحرير",
  "dropoffLat": 29.9602,
  "dropoffLng": 31.2569,
  "dropoffAddress": "المعادي",
  "targetPrice": 40,
  "provider": "UBER",
  "expiresInDays": 7,
  "notifyPush": true,
  "notifyEmail": true
}
```

### Expected Response
```json
{
  "success": true,
  "data": {
    "id": "alert_1234567890",
    "targetPrice": 40,
    "currentPrice": 55,
    "isActive": true,
    "expiresAt": "2025-01-26T12:00:00.000Z"
  },
  "message": "Price alert created successfully"
}
```

---

## 5️⃣ حفظ عنوان

### Request
```http
POST /transport/addresses
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "العمل",
  "nameAr": "العمل",
  "type": "WORK",
  "lat": 30.0511,
  "lng": 31.3656,
  "address": "شارع مصطفى النحاس، مدينة نصر",
  "buildingName": "برج النصر",
  "floor": "5",
  "landmark": "بجوار نادي الأهلي"
}
```

---

## 6️⃣ سجل الرحلات

### Request
```http
GET /transport/history?limit=20&offset=0
Authorization: Bearer <token>
```

---

## 7️⃣ إحصائيات الرحلات

### Request
```http
GET /transport/stats?period=month
Authorization: Bearer <token>
```

### Expected Response
```json
{
  "success": true,
  "data": {
    "totalRides": 45,
    "totalSpent": 2350,
    "totalDistance": 450,
    "totalTime": 1200,
    "totalSaved": 320,
    "avgRating": 4.6,
    "avgPricePerKm": 5.2,
    "byProvider": [
      { "provider": "UBER", "rides": 20, "spent": 1100 },
      { "provider": "CAREEM", "rides": 15, "spent": 800 },
      { "provider": "BOLT", "rides": 10, "spent": 450 }
    ]
  }
}
```

---

## 🔐 Admin Endpoints

### الحصول على بيانات التسعير
```http
GET /admin/pricing/providers
Authorization: Bearer <admin_token>
```

### إحصائيات النموذج
```http
GET /admin/pricing/model/stats
Authorization: Bearer <admin_token>
```

### تدريب النموذج
```http
POST /admin/pricing/model/train
Authorization: Bearer <admin_token>
```

### تسجيل بيانات تدريب
```http
POST /admin/pricing/training-data
Authorization: Bearer <token>

{
  "provider": "UBER",
  "product": "UberX",
  "pickupLat": 30.0444,
  "pickupLng": 31.2357,
  "dropoffLat": 29.9602,
  "dropoffLng": 31.2569,
  "distanceKm": 10,
  "durationMin": 25,
  "predictedPrice": 55,
  "actualPrice": 58,
  "actualSurge": 1.2
}
```

### تحليل Surge
```http
GET /admin/pricing/surge/analysis
Authorization: Bearer <admin_token>
```

### مقارنة الأسعار
```http
GET /admin/pricing/comparison?pickupLat=30.0444&pickupLng=31.2357&dropoffLat=29.9602&dropoffLng=31.2569
Authorization: Bearer <admin_token>
```

---

## 🎯 سيناريوهات اختبار شاملة

### السيناريو 1: موظف يذهب للعمل صباحاً

```bash
# الوقت: 8 صباحاً
# المسار: المعادي → مدينة نصر

curl "https://api.xchange.com/api/v1/transport/estimates?\
pickupLat=29.9602&pickupLng=31.2569&\
dropoffLat=30.0511&dropoffLng=31.3656"

# التوقع:
# - Surge > 1.3 (ذروة صباحية)
# - أرخص خيار: Bolt أو Halan
# - أسرع خيار: Uber أو Careem
```

### السيناريو 2: رحلة للمطار في يوم ممطر

```bash
# المسار: الزمالك → المطار
# الظروف: مطر

curl "https://api.xchange.com/api/v1/transport/estimates?\
pickupLat=30.0609&pickupLng=31.2193&\
dropoffLat=30.1219&dropoffLng=31.4056&\
isRaining=true"

# التوقع:
# - Surge > 1.5 (مطر + مسافة طويلة)
# - التوصية: UberX أو Careem Go
# - تنبيه: "المطر يزيد الطلب"
```

### السيناريو 3: بعد مباراة كرة قدم

```bash
# المسار: مدينة نصر → المعادي
# الظروف: حدث (مباراة)

curl "https://api.xchange.com/api/v1/transport/estimates?\
pickupLat=30.0511&pickupLng=31.3656&\
dropoffLat=29.9602&dropoffLng=31.2569&\
hasEvent=true&eventName=مباراة%20الأهلي"

# التوقع:
# - Surge > 1.7 (حدث كبير)
# - نصيحة: جرب inDrive للتفاوض
```

### السيناريو 4: البحث عن أفضل وقت

```bash
# الحصول على تنبؤات Surge لـ 12 ساعة

curl "https://api.xchange.com/api/v1/transport/surge?\
lat=30.0444&lng=31.2357"

# التوقع:
# - أفضل وقت: 2-4 ظهراً
# - أسوأ وقت: 6-8 مساءً
# - التوفير المحتمل: 30-40%
```

---

## ✅ قائمة التحقق

### وظائف أساسية
- [ ] الحصول على تقديرات أسعار من جميع المزودين
- [ ] حساب المسافة والوقت بدقة
- [ ] تطبيق Surge حسب الوقت
- [ ] تطبيق Surge حسب الظروف (مطر، أحداث)
- [ ] ترتيب الخيارات حسب السعر
- [ ] التوصية الذكية

### Deep Links
- [ ] Uber deep link يعمل
- [ ] Careem deep link يعمل
- [ ] Bolt deep link يعمل
- [ ] inDrive deep link يعمل
- [ ] DiDi deep link يعمل
- [ ] Swvl deep link يعمل
- [ ] Halan deep link يعمل

### تنبيهات الأسعار
- [ ] إنشاء تنبيه سعر
- [ ] عرض التنبيهات
- [ ] حذف تنبيه

### العناوين المحفوظة
- [ ] حفظ عنوان جديد
- [ ] عرض العناوين
- [ ] تحديث عنوان
- [ ] حذف عنوان

### سجل الرحلات
- [ ] عرض سجل الرحلات
- [ ] إحصائيات الرحلات
- [ ] التصفية حسب الفترة

### Admin
- [ ] عرض بيانات التسعير
- [ ] تحليل Surge
- [ ] تدريب النموذج
- [ ] جمع بيانات التدريب

---

## 📊 مقاييس النجاح

| المقياس | الهدف | القياس |
|---------|-------|--------|
| دقة التسعير | > 95% | مقارنة بالتطبيقات الأصلية |
| وقت الاستجابة | < 500ms | API response time |
| تغطية المزودين | 7/7 | جميع المزودين يعملون |
| دقة Surge | > 90% | مقارنة بالـ Surge الفعلي |
| Deep Links | 100% | جميع الروابط تعمل |

---

## 🐛 تقارير الأخطاء

إذا وجدت أي مشكلة، يرجى تسجيلها مع:

1. الـ Endpoint المستخدم
2. المعلمات المرسلة
3. الرد الفعلي
4. الرد المتوقع
5. لقطة شاشة إن أمكن

---

## 📞 الدعم

للمساعدة في الاختبار:
- GitHub Issues: github.com/xchange-egypt/issues
- Email: support@xchange.com
