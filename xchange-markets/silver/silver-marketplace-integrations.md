# XCHANGE SILVER MARKETPLACE - INTEGRATION GUIDE

## نظرة عامة على التكاملات المطلوبة

| الخدمة | المزود | الأولوية | التكلفة المقدرة |
|--------|---------|----------|-----------------|
| أسعار الفضة | Metals-API | عالية جداً | $49-99/شهر |
| الدفع الإلكتروني | Paymob | عالية جداً | عمولة لكل معاملة |
| الدفع عند الاستلام | Fawry | عالية | عمولة لكل معاملة |
| الشحن | Bosta | عالية | ~50 ج.م/شحنة |
| الرسائل النصية | Vodafone SMS | متوسطة | ~0.10 ج.م/رسالة |
| الخرائط | Google Maps | متوسطة | مجاني حتى 28,000 طلب/شهر |
| التخزين السحابي | AWS S3 / Cloudinary | عالية | $5-50/شهر |
| البريد الإلكتروني | SendGrid | متوسطة | مجاني حتى 100/يوم |

---

## 1️⃣ أسعار الفضة - Metals-API

### لماذا Metals-API؟
- تحديث كل 60 ثانية
- 170+ عملة مدعومة
- دقة عالية من البورصات العالمية
- واجهة برمجية بسيطة

### التسجيل
```
1. زيارة: https://metals-api.com
2. التسجيل للحصول على API Key
3. اختيار خطة: Free (50 طلب/شهر) أو Professional ($49/شهر - 10,000 طلب)
```

### API Endpoint
```bash
GET https://metals-api.com/api/latest?access_key=YOUR_API_KEY&base=USD&symbols=XAG
```

**المتغيرات:**
- `access_key`: مفتاح API الخاص بك
- `base`: العملة الأساسية (USD)
- `symbols`: XAG (رمز الفضة)

### Response Example
```json
{
  "success": true,
  "timestamp": 1702560000,
  "base": "USD",
  "date": "2024-12-14",
  "rates": {
    "XAG": 0.031746031746031744
  }
}
```

**ملاحظة:** السعر المعطى هو عدد أونصات الفضة لكل 1 دولار. لحساب سعر الأونصة:
```
سعر الأونصة بالدولار = 1 / rates.XAG
مثال: 1 / 0.031746 = $31.50 للأونصة
```

### تحويل لجنيه مصري للجرام
```javascript
// Node.js Example
const axios = require('axios');

async function getSilverPriceEgypt() {
  // 1. Get silver price in USD per troy ounce
  const silverRes = await axios.get('https://metals-api.com/api/latest', {
    params: {
      access_key: process.env.METALS_API_KEY,
      base: 'USD',
      symbols: 'XAG'
    }
  });
  
  const silverPerOunce = 1 / silverRes.data.rates.XAG; // e.g., 31.50 USD
  
  // 2. Get current USD/EGP exchange rate
  const usdEgpRate = 49; // Update from external source or hardcode
  
  // 3. Convert to EGP per gram
  const silverPerGramEgp = (silverPerOunce * usdEgpRate) / 31.1035; // Troy ounce = 31.1035 grams
  
  // 4. Calculate different purities
  return {
    pure999: Math.round(silverPerGramEgp * 100) / 100,
    sterling925: Math.round(silverPerGramEgp * 0.925 * 100) / 100,
    grade900: Math.round(silverPerGramEgp * 0.90 * 100) / 100,
    grade800: Math.round(silverPerGramEgp * 0.80 * 100) / 100
  };
}

// Result: { pure999: 107.00, sterling925: 99.00, grade900: 96.50, grade800: 86.00 }
```

### Cron Job للتحديث التلقائي
```javascript
// Using node-cron
const cron = require('node-cron');

// Run every hour
cron.schedule('0 * * * *', async () => {
  const prices = await getSilverPriceEgypt();
  
  // Save to database
  await prisma.silverPrice.create({
    data: {
      spotPrice: prices.pure999 * 31.1035 / 49, // Convert back to USD/oz for reference
      egyptPrice: prices.pure999,
      sterling925: prices.sterling925,
      grade900: prices.grade900,
      grade800: prices.grade800,
      source: 'Metals-API',
      timestamp: new Date()
    }
  });
  
  console.log('✅ Silver prices updated:', prices);
});
```

### معالجة الأخطاء
```javascript
async function getSilverPriceWithFallback() {
  try {
    return await getSilverPriceEgypt();
  } catch (error) {
    console.error('❌ Failed to fetch live prices:', error.message);
    
    // Fallback: Use last saved price
    const lastPrice = await prisma.silverPrice.findFirst({
      orderBy: { timestamp: 'desc' }
    });
    
    if (!lastPrice) {
      throw new Error('No silver price data available');
    }
    
    console.log('⚠️ Using cached price from:', lastPrice.timestamp);
    return {
      pure999: lastPrice.egyptPrice,
      sterling925: lastPrice.sterling925,
      grade900: lastPrice.grade900,
      grade800: lastPrice.grade800
    };
  }
}
```

---

## 2️⃣ الدفع الإلكتروني - Paymob

### لماذا Paymob؟
- الأكثر استخداماً في مصر
- يدعم: بطاقات، محافظ إلكترونية، فوري، Valu، تقسيط
- عمولات تنافسية: ~2.5% + 1 ج.م
- دعم Escrow (حجز المبلغ)

### التسجيل
```
1. زيارة: https://accept.paymob.com
2. تسجيل حساب تاجر
3. إكمال KYC (السجل التجاري، البطاقة الضريبية)
4. الحصول على: API Key, Integration ID, iFrame ID
```

### تدفق الدفع

#### الخطوة 1: الحصول على Authentication Token
```bash
POST https://accept.paymob.com/api/auth/tokens
Content-Type: application/json

{
  "api_key": "YOUR_API_KEY"
}
```

**Response:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### الخطوة 2: إنشاء Order
```bash
POST https://accept.paymob.com/api/ecommerce/orders
Content-Type: application/json
Authorization: Bearer {token}

{
  "auth_token": "{token}",
  "delivery_needed": "false",
  "amount_cents": "150000",
  "currency": "EGP",
  "merchant_order_id": "purchase_abc123",
  "items": [
    {
      "name": "خاتم فضة 925 - 12.5 جرام",
      "amount_cents": "135000",
      "description": "Silver ring 925 - 12.5g",
      "quantity": "1"
    },
    {
      "name": "عمولة المنصة",
      "amount_cents": "6750",
      "description": "Platform fee 5%",
      "quantity": "1"
    },
    {
      "name": "الشحن",
      "amount_cents": "8250",
      "description": "Shipping via Bosta",
      "quantity": "1"
    }
  ]
}
```

**Response:**
```json
{
  "id": 123456789,
  "amount_cents": 150000,
  ...
}
```

#### الخطوة 3: توليد Payment Key
```bash
POST https://accept.paymob.com/api/acceptance/payment_keys
Content-Type: application/json

{
  "auth_token": "{token}",
  "amount_cents": "150000",
  "expiration": 3600,
  "order_id": "123456789",
  "billing_data": {
    "apartment": "NA",
    "email": "buyer@example.com",
    "floor": "NA",
    "first_name": "أحمد",
    "street": "NA",
    "building": "NA",
    "phone_number": "+201234567890",
    "shipping_method": "NA",
    "postal_code": "NA",
    "city": "Cairo",
    "country": "EG",
    "last_name": "محمد",
    "state": "Cairo"
  },
  "currency": "EGP",
  "integration_id": YOUR_INTEGRATION_ID
}
```

**Response:**
```json
{
  "token": "ZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKSVV6STFOaUo5..."
}
```

#### الخطوة 4: توجيه المستخدم للدفع
```javascript
const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${IFRAME_ID}?payment_token=${paymentToken}`;

// Redirect user to paymentUrl
res.redirect(paymentUrl);
```

### Webhook للتأكيد
```javascript
// POST /webhooks/paymob
app.post('/webhooks/paymob', async (req, res) => {
  const data = req.body;
  
  // Verify HMAC signature (important for security)
  const calculatedHmac = calculateHmac(data, process.env.PAYMOB_HMAC_SECRET);
  if (calculatedHmac !== data.hmac) {
    return res.status(403).send('Invalid signature');
  }
  
  if (data.type === 'TRANSACTION' && data.obj.success === true) {
    const purchaseId = data.obj.merchant_order_id;
    const amountCents = data.obj.amount_cents;
    
    // Update purchase status
    await prisma.silverPurchase.update({
      where: { id: purchaseId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        escrow: {
          create: {
            userId: data.obj.order.shipping_data.email, // Assuming we store user email
            amount: amountCents / 100,
            status: 'HELD',
            purpose: `Purchase #${purchaseId}`
          }
        }
      }
    });
    
    // Send notification to seller
    await sendNotification({
      userId: purchase.listing.sellerId,
      type: 'PURCHASE_PAID',
      message: 'تم استلام الدفع! يرجى شحن القطعة.'
    });
  }
  
  res.status(200).send('OK');
});
```

### تطبيق Escrow (حجز المبلغ)
Paymob لا يدعم Escrow مباشرة، لكن يمكن تطبيقه بالطرق التالية:

**الخيار 1: Delayed Capture (الموصى به)**
```javascript
// عند الدفع: Authorize فقط (لا Capture)
// بعد تأكيد المشتري: Capture المبلغ
// عند النزاع: Void/Refund

// This requires special Paymob configuration
```

**الخيار 2: المحفظة الداخلية**
```javascript
// 1. المشتري يدفع لـ Xchange
// 2. Xchange تحجز المبلغ في جدول EscrowTransaction
// 3. عند التأكيد: تحويل للبائع من محفظة Xchange
// 4. عند النزاع: رد للمشتري

// أبسط للتطبيق ولكن يتطلب رخصة تحويل أموال
```

---

## 3️⃣ فوري - Fawry

### لماذا Fawry؟
- 35+ مليون مستخدم في مصر
- 370,000+ نقطة دفع
- دفع نقدي أو عبر التطبيق
- يدعم B2B (للمدفوعات الكبيرة)

### التكامل مع Fawry Pay
Fawry يعمل كـ "payment method" إضافي عبر Paymob

```javascript
// في الخطوة 3 من Paymob، استخدم integration_id خاص بـ Fawry
const FAWRY_INTEGRATION_ID = process.env.FAWRY_INTEGRATION_ID;

// المستخدم سيحصل على:
// - Fawry Reference Number
// - يمكنه الدفع في أي فرع Fawry أو عبر التطبيق
```

---

## 4️⃣ الشحن - Bosta

### لماذا Bosta؟
- 95% معدل نجاح التوصيل
- تغطية جميع المحافظات
- توصيل نفس اليوم في القاهرة الكبرى
- API سهل الاستخدام
- tracking real-time

### التسجيل
```
1. زيارة: https://bosta.co
2. تسجيل حساب شركة
3. الحصول على API Key من لوحة التحكم
```

### إنشاء طلب شحن

```javascript
const axios = require('axios');

async function createBostaDelivery(purchase) {
  const response = await axios.post(
    'https://app.bosta.co/api/v2/deliveries',
    {
      type: 0, // Delivery
      specs: {
        packageType: 'Package',
        size: 'SMALL',
        packageDetails: {
          itemsCount: 1,
          description: 'قطعة فضية - Xchange Marketplace'
        }
      },
      cod: purchase.paymentMethod === 'CASH_ON_DELIVERY' ? purchase.total : 0,
      allowToOpenPackage: false, // لا يُسمح بفتح الطرد
      
      // Pickup (from seller)
      pickup: {
        name: purchase.listing.seller.fullName,
        phone: purchase.listing.seller.phone,
        address: {
          firstLine: purchase.listing.seller.address.street,
          secondLine: purchase.listing.seller.address.building,
          city: purchase.listing.seller.address.city,
          district: purchase.listing.seller.address.district,
          geoLocation: {
            lat: purchase.listing.seller.address.latitude,
            lng: purchase.listing.seller.address.longitude
          }
        }
      },
      
      // Dropoff (to buyer)
      dropOff: {
        name: purchase.buyer.fullName,
        phone: purchase.buyer.phone,
        address: {
          firstLine: purchase.deliveryAddress.street,
          secondLine: purchase.deliveryAddress.building,
          city: purchase.deliveryAddress.city,
          district: purchase.deliveryAddress.district,
          geoLocation: {
            lat: purchase.deliveryAddress.latitude,
            lng: purchase.deliveryAddress.longitude
          }
        }
      },
      
      // Xchange business info
      businessReference: purchase.id
    },
    {
      headers: {
        'Authorization': process.env.BOSTA_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return {
    trackingNumber: response.data.trackingNumber,
    deliveryId: response.data._id
  };
}
```

### Webhook للتحديثات
```javascript
// POST /webhooks/bosta
app.post('/webhooks/bosta', async (req, res) => {
  const { trackingNumber, state } = req.body;
  
  // Update purchase status based on state
  const statusMap = {
    '10': 'PICKED_UP',        // تم الاستلام من البائع
    '20': 'IN_TRANSIT',       // في الطريق
    '30': 'OUT_FOR_DELIVERY', // خارج للتوصيل
    '45': 'DELIVERED',        // تم التسليم
    '40': 'RETURNED'          // مُرتجع
  };
  
  await prisma.silverPurchase.update({
    where: { trackingNumber },
    data: {
      status: statusMap[state] || 'SHIPPED',
      ...(state === '45' && { deliveredAt: new Date() })
    }
  });
  
  res.status(200).send('OK');
});
```

### تتبع الشحنة
```javascript
async function trackDelivery(trackingNumber) {
  const response = await axios.get(
    `https://app.bosta.co/api/v2/deliveries/${trackingNumber}`,
    {
      headers: { 'Authorization': process.env.BOSTA_API_KEY }
    }
  );
  
  return {
    status: response.data.state.value,
    currentLocation: response.data.currentLocation,
    events: response.data.events,
    estimatedDelivery: response.data.estimatedDeliveryDate
  };
}
```

---

## 5️⃣ الرسائل النصية - Vodafone SMS

### حالات الاستخدام
- التحقق من رقم الهاتف (OTP)
- إشعارات الدفع
- تحديثات الشحن
- تذكيرات مهمة

### مزودون مقترحون
1. **Vodafone SMS Egypt**: ~0.10 ج.م/رسالة
2. **Twilio**: $0.0350/رسالة (~1.7 ج.م)
3. **MSEGAT**: خدمة عربية، أسعار تنافسية

### التكامل (مثال: Twilio)
```javascript
const twilio = require('twilio');
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendOTP(phone, code) {
  await client.messages.create({
    body: `كود التحقق من Xchange: ${code}. صالح لمدة 10 دقائق.`,
    from: '+1234567890', // Twilio number
    to: phone // e.g., '+201234567890'
  });
}

async function sendPurchaseConfirmation(phone, purchaseId) {
  await client.messages.create({
    body: `تم استلام طلبك #${purchaseId}. سيتم الشحن قريباً.`,
    from: '+1234567890',
    to: phone
  });
}
```

---

## 6️⃣ الخرائط - Google Maps API

### حالات الاستخدام
- Geocoding: تحويل العناوين لـ lat/lng
- Distance Matrix: حساب تكلفة الشحن
- Places Autocomplete: إدخال عناوين سهل

### التفعيل
```
1. Google Cloud Console: https://console.cloud.google.com
2. تفعيل APIs:
   - Geocoding API
   - Places API
   - Distance Matrix API
3. الحصول على API Key
4. تقييد الاستخدام (لحماية التكاليف)
```

### Geocoding (تحويل عنوان لإحداثيات)
```javascript
const axios = require('axios');

async function geocodeAddress(address) {
  const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
    params: {
      address: `${address.street}, ${address.district}, ${address.city}, Egypt`,
      key: process.env.GOOGLE_MAPS_API_KEY
    }
  });
  
  if (response.data.results.length > 0) {
    const location = response.data.results[0].geometry.location;
    return {
      latitude: location.lat,
      longitude: location.lng
    };
  }
  
  return null;
}
```

### حساب مسافة الشحن
```javascript
async function calculateShippingCost(origin, destination) {
  const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
    params: {
      origins: `${origin.latitude},${origin.longitude}`,
      destinations: `${destination.latitude},${destination.longitude}`,
      key: process.env.GOOGLE_MAPS_API_KEY
    }
  });
  
  const distanceMeters = response.data.rows[0].elements[0].distance.value;
  const distanceKm = distanceMeters / 1000;
  
  // تسعير تقديري
  let cost = 50; // حد أدنى
  if (distanceKm > 20) cost = 75;
  if (distanceKm > 50) cost = 100;
  if (distanceKm > 100) cost = 150;
  
  return cost;
}
```

---

## 7️⃣ التخزين السحابي - Cloudinary

### لماذا Cloudinary؟
- تحسين تلقائي للصور
- CDN سريع عالمياً
- تحويلات الصور (resize, crop, watermark)
- فيديو hosting
- خطة مجانية سخية

### التسجيل
```
1. https://cloudinary.com
2. التسجيل - خطة Free (25 GB storage, 25 GB bandwidth/شهر)
3. الحصول على: Cloud Name, API Key, API Secret
```

### رفع الصور
```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadImage(imageBuffer, folder) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: `xchange/${folder}`,
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }, // تحسين تلقائي
          { width: 1200, height: 1200, crop: 'limit' } // حد أقصى للحجم
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    ).end(imageBuffer);
  });
}

// Usage in API
app.post('/api/upload', upload.single('image'), async (req, res) => {
  const url = await uploadImage(req.file.buffer, 'listings');
  res.json({ url });
});
```

### Watermark للحماية
```javascript
const watermarkedUrl = cloudinary.url('image_id', {
  transformation: [
    { overlay: 'xchange_logo', gravity: 'south_east', opacity: 30, width: 100 }
  ]
});
```

---

## 8️⃣ البريد الإلكتروني - SendGrid

### حالات الاستخدام
- تأكيد التسجيل
- إعادة تعيين كلمة المرور
- إشعارات المعاملات
- النشرة الإخبارية

### التكامل
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendWelcomeEmail(user) {
  await sgMail.send({
    to: user.email,
    from: 'noreply@xchange.eg',
    subject: 'مرحباً بك في Xchange',
    html: `
      <h1>أهلاً ${user.fullName}!</h1>
      <p>شكراً لتسجيلك في Xchange، أول منصة لبيع وشراء الفضة المستعملة في مصر.</p>
      <a href="https://xchange.eg/verify/${user.id}">تأكيد بريدك الإلكتروني</a>
    `
  });
}
```

---

## 🔒 الأمان والبيئة

### ملف `.env` (لا يُرفع على Git)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/xchange_silver"

# Metals API
METALS_API_KEY="your_metals_api_key"

# Paymob
PAYMOB_API_KEY="your_paymob_api_key"
PAYMOB_INTEGRATION_ID="123456"
PAYMOB_IFRAME_ID="654321"
PAYMOB_HMAC_SECRET="your_hmac_secret"

# Fawry
FAWRY_INTEGRATION_ID="789012"

# Bosta
BOSTA_API_KEY="your_bosta_api_key"

# Twilio SMS
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"

# Google Maps
GOOGLE_MAPS_API_KEY="your_google_maps_key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_key"
CLOUDINARY_API_SECRET="your_cloudinary_secret"

# SendGrid
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxx"

# JWT
JWT_SECRET="your_super_secret_jwt_key_min_32_chars"
JWT_EXPIRY="7d"

# App
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:3001"
```

---

## 📊 ملخص التكاليف الشهرية

| الخدمة | التكلفة (MVP) | التكلفة (بعد النمو) |
|--------|--------------|---------------------|
| Metals-API | $49 | $99 |
| Paymob | ~2.5% من المبيعات | ~2.5% من المبيعات |
| Bosta | ~50 ج.م × عدد الشحنات | متغير |
| SMS | ~100 ج.م | ~500 ج.م |
| Cloudinary | مجاني | $49 |
| SendGrid | مجاني | $15 |
| Google Maps | مجاني | $50 |
| **الإجمالي الثابت** | **~$50** | **~$200** |

**ملاحظة:** التكاليف المتغيرة (Paymob, Bosta, SMS) تعتمد على حجم المعاملات
