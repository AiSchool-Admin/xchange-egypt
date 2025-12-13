# 🔌 دليل التكاملات الخارجية

## Integration Guide - Xchange Scrap Marketplace

---

## 📋 الفهرس

1. [بوابات الدفع](#1-بوابات-الدفع)
2. [خدمات SMS](#2-خدمات-sms)
3. [Google Maps](#3-google-maps)
4. [Push Notifications](#4-push-notifications)
5. [أسعار المعادن (LME)](#5-أسعار-المعادن-lme)
6. [تخزين الملفات](#6-تخزين-الملفات)

---

## 1. بوابات الدفع

### 1.1 Paymob (الرئيسية)

**الموقع:** https://paymob.com

**المميزات:**
- بطاقات ائتمان/خصم
- محافظ إلكترونية (فودافون كاش، اتصالات كاش، إلخ)
- فوري
- Apple Pay / Google Pay

**التكامل:**

```typescript
// services/payment/paymob.service.ts

import axios from 'axios';

interface PaymobConfig {
  apiKey: string;
  integrationId: string;
  iframeId: string;
  hmacSecret: string;
}

class PaymobService {
  private config: PaymobConfig;
  private baseUrl = 'https://accept.paymob.com/api';

  constructor(config: PaymobConfig) {
    this.config = config;
  }

  /**
   * الخطوة 1: الحصول على Auth Token
   */
  async getAuthToken(): Promise<string> {
    const response = await axios.post(`${this.baseUrl}/auth/tokens`, {
      api_key: this.config.apiKey,
    });
    return response.data.token;
  }

  /**
   * الخطوة 2: إنشاء Order
   */
  async createOrder(authToken: string, amount: number, merchantOrderId: string): Promise<number> {
    const response = await axios.post(`${this.baseUrl}/ecommerce/orders`, {
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: amount * 100, // تحويل لقروش
      currency: 'EGP',
      merchant_order_id: merchantOrderId,
      items: [],
    });
    return response.data.id;
  }

  /**
   * الخطوة 3: إنشاء Payment Key
   */
  async createPaymentKey(
    authToken: string,
    orderId: number,
    amount: number,
    billingData: BillingData
  ): Promise<string> {
    const response = await axios.post(`${this.baseUrl}/acceptance/payment_keys`, {
      auth_token: authToken,
      amount_cents: amount * 100,
      expiration: 3600, // ساعة
      order_id: orderId,
      billing_data: billingData,
      currency: 'EGP',
      integration_id: this.config.integrationId,
    });
    return response.data.token;
  }

  /**
   * إنشاء رابط الدفع الكامل
   */
  async createPaymentUrl(amount: number, orderId: string, customer: CustomerData): Promise<string> {
    const authToken = await this.getAuthToken();
    const paymobOrderId = await this.createOrder(authToken, amount, orderId);
    const paymentKey = await this.createPaymentKey(authToken, paymobOrderId, amount, {
      first_name: customer.firstName,
      last_name: customer.lastName,
      phone_number: customer.phone,
      email: customer.email || 'customer@xchange.com.eg',
      country: 'EG',
      city: customer.city,
      street: customer.street || 'NA',
      building: 'NA',
      floor: 'NA',
      apartment: 'NA',
    });

    return `https://accept.paymob.com/api/acceptance/iframes/${this.config.iframeId}?payment_token=${paymentKey}`;
  }

  /**
   * التحقق من HMAC للـ webhook
   */
  verifyWebhook(data: any, receivedHmac: string): boolean {
    const crypto = require('crypto');
    const concatenated = [
      data.amount_cents,
      data.created_at,
      data.currency,
      data.error_occured,
      data.has_parent_transaction,
      data.id,
      data.integration_id,
      data.is_3d_secure,
      data.is_auth,
      data.is_capture,
      data.is_refunded,
      data.is_standalone_payment,
      data.is_voided,
      data.order.id,
      data.owner,
      data.pending,
      data.source_data.pan,
      data.source_data.sub_type,
      data.source_data.type,
      data.success,
    ].join('');

    const calculatedHmac = crypto
      .createHmac('sha512', this.config.hmacSecret)
      .update(concatenated)
      .digest('hex');

    return calculatedHmac === receivedHmac;
  }
}
```

**Webhook Handler:**

```typescript
// routes/webhooks/paymob.ts

app.post('/webhooks/paymob', async (req, res) => {
  const { obj, hmac } = req.body;
  
  if (!paymobService.verifyWebhook(obj, hmac)) {
    return res.status(400).json({ error: 'Invalid HMAC' });
  }
  
  if (obj.success) {
    // الدفع ناجح
    await transactionService.confirmPayment(obj.order.merchant_order_id, {
      paymentReference: obj.id.toString(),
      amount: obj.amount_cents / 100,
    });
  } else {
    // الدفع فشل
    await transactionService.failPayment(obj.order.merchant_order_id, obj.error_occured);
  }
  
  res.json({ success: true });
});
```

---

### 1.2 Fawry

**الموقع:** https://developer.fawrystaging.com

**المميزات:**
- الدفع النقدي في 370,000+ منفذ
- مناسب للعملاء بدون بطاقات
- رسوم منخفضة

**التكامل:**

```typescript
// services/payment/fawry.service.ts

import crypto from 'crypto';
import axios from 'axios';

class FawryService {
  private merchantCode: string;
  private securityKey: string;
  private baseUrl: string;

  constructor(config: FawryConfig) {
    this.merchantCode = config.merchantCode;
    this.securityKey = config.securityKey;
    this.baseUrl = config.isProduction
      ? 'https://www.atfawry.com/ECommerceWeb/Fawry/payments'
      : 'https://atfawry.fawrystaging.com/ECommerceWeb/Fawry/payments';
  }

  /**
   * إنشاء طلب دفع
   */
  async createPayment(data: {
    merchantRefNum: string;
    customerPhone: string;
    customerEmail?: string;
    amount: number;
    description: string;
    expiryHours?: number;
  }): Promise<FawryPaymentResponse> {
    const expiry = Date.now() + (data.expiryHours || 24) * 60 * 60 * 1000;
    
    const signature = this.generateSignature([
      this.merchantCode,
      data.merchantRefNum,
      data.customerPhone,
      data.amount.toFixed(2),
      this.securityKey,
    ]);

    const response = await axios.post(`${this.baseUrl}/charge`, {
      merchantCode: this.merchantCode,
      merchantRefNum: data.merchantRefNum,
      customerMobile: data.customerPhone,
      customerEmail: data.customerEmail || '',
      customerName: '',
      paymentMethod: 'PAYATFAWRY',
      amount: data.amount,
      currencyCode: 'EGP',
      description: data.description,
      paymentExpiry: expiry,
      chargeItems: [{
        itemId: data.merchantRefNum,
        description: data.description,
        price: data.amount,
        quantity: 1,
      }],
      signature,
    });

    return {
      referenceNumber: response.data.referenceNumber,
      expirationTime: response.data.expirationTime,
      statusCode: response.data.statusCode,
    };
  }

  /**
   * التحقق من حالة الدفع
   */
  async checkStatus(merchantRefNum: string): Promise<PaymentStatus> {
    const signature = this.generateSignature([
      this.merchantCode,
      merchantRefNum,
      this.securityKey,
    ]);

    const response = await axios.get(
      `${this.baseUrl}/status/v2?merchantCode=${this.merchantCode}&merchantRefNumber=${merchantRefNum}&signature=${signature}`
    );

    return {
      paid: response.data.paymentStatus === 'PAID',
      status: response.data.paymentStatus,
      paidAmount: response.data.paymentAmount,
    };
  }

  private generateSignature(data: string[]): string {
    const concatenated = data.join('');
    return crypto.createHash('sha256').update(concatenated).digest('hex');
  }
}
```

---

## 2. خدمات SMS

### 2.1 Vodafone SMS Gateway (مصر)

```typescript
// services/sms/vodafone.service.ts

import axios from 'axios';

class VodafoneSmsService {
  private username: string;
  private password: string;
  private sender: string;
  private baseUrl = 'https://e3len.vodafone.com.eg/web2sms/sms/submit';

  constructor(config: VodafoneSmsConfig) {
    this.username = config.username;
    this.password = config.password;
    this.sender = config.sender;
  }

  async sendOTP(phone: string, otp: string): Promise<boolean> {
    // تنظيف الرقم
    const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '2');
    
    const message = `رمز التحقق الخاص بك في Xchange هو: ${otp}\nصالح لمدة 5 دقائق.`;
    
    try {
      const response = await axios.post(this.baseUrl, {
        AccountId: this.username,
        Password: this.password,
        SenderName: this.sender,
        ReceiverMSISDN: cleanPhone,
        SMSText: message,
      });
      
      return response.data.Success === true;
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }

  async sendNotification(phone: string, message: string): Promise<boolean> {
    const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '2');
    
    try {
      const response = await axios.post(this.baseUrl, {
        AccountId: this.username,
        Password: this.password,
        SenderName: this.sender,
        ReceiverMSISDN: cleanPhone,
        SMSText: message,
      });
      
      return response.data.Success === true;
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }
}
```

### 2.2 Twilio (بديل دولي)

```typescript
// services/sms/twilio.service.ts

import twilio from 'twilio';

class TwilioSmsService {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor(config: TwilioConfig) {
    this.client = twilio(config.accountSid, config.authToken);
    this.fromNumber = config.phoneNumber;
  }

  async sendOTP(phone: string, otp: string): Promise<boolean> {
    try {
      await this.client.messages.create({
        body: `رمز التحقق الخاص بك في Xchange هو: ${otp}\nصالح لمدة 5 دقائق.`,
        from: this.fromNumber,
        to: phone,
      });
      return true;
    } catch (error) {
      console.error('Twilio SMS failed:', error);
      return false;
    }
  }
}
```

---

## 3. Google Maps

### 3.1 إعداد API Key

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com)
2. أنشئ مشروع جديد
3. فعّل APIs:
   - Maps JavaScript API
   - Geocoding API
   - Distance Matrix API
   - Places API
4. أنشئ API Key مع restrictions

### 3.2 تكامل Frontend

```typescript
// hooks/useGoogleMaps.ts

import { useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  version: 'weekly',
  libraries: ['places', 'geometry'],
  language: 'ar',
  region: 'EG',
});

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loader
      .load()
      .then(() => setIsLoaded(true))
      .catch(setError);
  }, []);

  return { isLoaded, error };
}
```

```tsx
// components/LocationPicker.tsx

import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useRef, useEffect, useState } from 'react';

interface LocationPickerProps {
  onSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
}

export function LocationPicker({ onSelect, initialLocation }: LocationPickerProps) {
  const { isLoaded } = useGoogleMaps();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  // موقع القاهرة كافتراضي
  const defaultCenter = initialLocation || { lat: 30.0444, lng: 31.2357 };

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 15,
      mapTypeControl: false,
      fullscreenControl: false,
    });

    const markerInstance = new google.maps.Marker({
      position: defaultCenter,
      map: mapInstance,
      draggable: true,
    });

    // عند سحب الـ marker
    markerInstance.addListener('dragend', async () => {
      const position = markerInstance.getPosition();
      if (position) {
        const address = await reverseGeocode(position.lat(), position.lng());
        onSelect({
          lat: position.lat(),
          lng: position.lng(),
          address,
        });
      }
    });

    // عند النقر على الخريطة
    mapInstance.addListener('click', async (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        markerInstance.setPosition(e.latLng);
        const address = await reverseGeocode(e.latLng.lat(), e.latLng.lng());
        onSelect({
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
          address,
        });
      }
    });

    setMap(mapInstance);
    setMarker(markerInstance);
  }, [isLoaded]);

  // زر "موقعي الحالي"
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          map?.setCenter({ lat: latitude, lng: longitude });
          marker?.setPosition({ lat: latitude, lng: longitude });
          const address = await reverseGeocode(latitude, longitude);
          onSelect({ lat: latitude, lng: longitude, address });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  if (!isLoaded) {
    return <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />;
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="h-64 rounded-lg" />
      <button
        onClick={getCurrentLocation}
        className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md"
      >
        📍 موقعي الحالي
      </button>
    </div>
  );
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const geocoder = new google.maps.Geocoder();
  const response = await geocoder.geocode({ location: { lat, lng } });
  return response.results[0]?.formatted_address || '';
}
```

### 3.3 حساب المسافة

```typescript
// services/maps/distance.service.ts

export async function calculateDistance(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<{ distance: number; duration: number }> {
  const service = new google.maps.DistanceMatrixService();
  
  const response = await service.getDistanceMatrix({
    origins: [origin],
    destinations: [destination],
    travelMode: google.maps.TravelMode.DRIVING,
    unitSystem: google.maps.UnitSystem.METRIC,
  });

  const result = response.rows[0].elements[0];
  
  return {
    distance: result.distance.value / 1000, // كم
    duration: result.duration.value / 60, // دقائق
  };
}
```

---

## 4. Push Notifications

### 4.1 Firebase Cloud Messaging

**الإعداد:**

```typescript
// lib/firebase-admin.ts

import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

export const messaging = admin.messaging();
```

**خدمة الإشعارات:**

```typescript
// services/notification.service.ts

import { messaging } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

class NotificationService {
  /**
   * إرسال إشعار لمستخدم واحد
   */
  async sendToUser(userId: string, payload: NotificationPayload): Promise<void> {
    // جلب FCM tokens للمستخدم
    const tokens = await prisma.fcmToken.findMany({
      where: { userId },
      select: { token: true },
    });

    if (tokens.length === 0) return;

    const message: admin.messaging.MulticastMessage = {
      tokens: tokens.map(t => t.token),
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
      },
      data: payload.data,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'xchange_notifications',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    try {
      const response = await messaging.sendEachForMulticast(message);
      
      // حذف التوكنات غير الصالحة
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
          prisma.fcmToken.delete({ where: { token: tokens[idx].token } });
        }
      });
    } catch (error) {
      console.error('Push notification failed:', error);
    }

    // حفظ في جدول الإشعارات
    await prisma.notification.create({
      data: {
        userId,
        type: payload.data?.type || 'general',
        title: payload.title,
        body: payload.body,
        data: payload.data,
      },
    });
  }

  /**
   * إشعارات جاهزة
   */
  async notifyPickupAssigned(userId: string, collectorName: string, pickupId: string) {
    await this.sendToUser(userId, {
      title: '✅ تم تعيين جامع',
      body: `الجامع ${collectorName} سيصل في الموعد المحدد`,
      data: { type: 'pickup_assigned', pickupId },
    });
  }

  async notifyCollectorOnTheWay(userId: string, collectorName: string, eta: number, pickupId: string) {
    await this.sendToUser(userId, {
      title: '🚛 الجامع في الطريق',
      body: `${collectorName} سيصل خلال ${eta} دقيقة`,
      data: { type: 'collector_on_way', pickupId },
    });
  }

  async notifyPriceAlert(userId: string, materialName: string, price: number, change: string) {
    await this.sendToUser(userId, {
      title: '📊 تنبيه سعر',
      body: `${materialName} ${change} - السعر الآن ${price} ج/كجم`,
      data: { type: 'price_alert' },
    });
  }

  async notifyNewPickupRequest(collectorId: string, address: string, estimatedValue: number, pickupId: string) {
    await this.sendToUser(collectorId, {
      title: '📦 طلب جمع جديد',
      body: `${address} - القيمة المتوقعة ${estimatedValue} ج`,
      data: { type: 'new_pickup_request', pickupId },
    });
  }
}

export const notificationService = new NotificationService();
```

---

## 5. أسعار المعادن (LME)

### 5.1 الحصول على الأسعار

```typescript
// services/lme.service.ts

import axios from 'axios';

interface LMEPrices {
  copper: number;
  aluminium: number;
  lead: number;
  zinc: number;
  nickel: number;
  timestamp: Date;
}

class LMEService {
  private apiKey: string;
  private baseUrl = 'https://www.lme.com/api/v1';

  // بديل مجاني: metalpriceapi.com
  private freeApiUrl = 'https://api.metalpriceapi.com/v1/latest';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchPrices(): Promise<LMEPrices> {
    try {
      // استخدام API مجاني
      const response = await axios.get(this.freeApiUrl, {
        params: {
          api_key: this.apiKey,
          base: 'USD',
          currencies: 'XCU,XAL,XPB,XZN,XNI', // copper, aluminium, lead, zinc, nickel
        },
      });

      const rates = response.data.rates;

      // الأسعار بالدولار للطن
      return {
        copper: 1 / rates.XCU,
        aluminium: 1 / rates.XAL,
        lead: 1 / rates.XPB,
        zinc: 1 / rates.XZN,
        nickel: 1 / rates.XNI,
        timestamp: new Date(response.data.timestamp * 1000),
      };
    } catch (error) {
      console.error('Failed to fetch LME prices:', error);
      throw error;
    }
  }

  /**
   * تحويل سعر LME إلى سعر محلي بالكيلو
   */
  convertToLocalPrice(lmePricePerTon: number, usdToEgp: number): number {
    // سعر LME بالدولار للطن
    // تحويل للجنيه المصري للكيلو
    const pricePerKgUsd = lmePricePerTon / 1000;
    const pricePerKgEgp = pricePerKgUsd * usdToEgp;
    
    // خصم 10-20% للسوق المحلي (الخردة أقل من السعر الرسمي)
    return pricePerKgEgp * 0.85;
  }
}
```

---

## 6. تخزين الملفات

### 6.1 Cloudinary

```typescript
// services/upload.service.ts

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class UploadService {
  /**
   * رفع صورة
   */
  async uploadImage(
    file: Buffer | string, // Buffer or base64 or URL
    options?: {
      folder?: string;
      width?: number;
      height?: number;
    }
  ): Promise<string> {
    const result = await cloudinary.uploader.upload(
      typeof file === 'string' ? file : `data:image/jpeg;base64,${file.toString('base64')}`,
      {
        folder: options?.folder || 'xchange-scrap',
        transformation: [
          {
            width: options?.width || 800,
            height: options?.height || 800,
            crop: 'limit',
            quality: 'auto',
            format: 'webp',
          },
        ],
      }
    );

    return result.secure_url;
  }

  /**
   * حذف صورة
   */
  async deleteImage(url: string): Promise<void> {
    // استخراج public_id من الـ URL
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = `xchange-scrap/${filename.split('.')[0]}`;

    await cloudinary.uploader.destroy(publicId);
  }

  /**
   * رفع صور متعددة
   */
  async uploadMultiple(files: Buffer[], folder: string): Promise<string[]> {
    const urls = await Promise.all(
      files.map(file => this.uploadImage(file, { folder }))
    );
    return urls;
  }
}

export const uploadService = new UploadService();
```

### 6.2 استخدام في API

```typescript
// routes/upload.ts

import multer from 'multer';
import { uploadService } from '@/services/upload.service';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  },
});

app.post('/api/upload', upload.array('images', 5), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const urls = await uploadService.uploadMultiple(
      files.map(f => f.buffer),
      'listings'
    );
    res.json({ urls });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});
```

---

## 📝 ملخص التكاملات

| الخدمة | المزود | الغرض | الأولوية |
|--------|--------|-------|----------|
| الدفع | Paymob | بطاقات + محافظ | 🔴 حرجة |
| الدفع النقدي | Fawry | دفع في المنافذ | 🟠 عالية |
| SMS | Vodafone | OTP + إشعارات | 🔴 حرجة |
| الخرائط | Google Maps | تحديد المواقع | 🔴 حرجة |
| Push | Firebase | الإشعارات | 🟠 عالية |
| أسعار المعادن | MetalPriceAPI | تحديث الأسعار | 🟠 عالية |
| الصور | Cloudinary | تخزين الصور | 🟠 عالية |

---

*آخر تحديث: ديسمبر 2024*
*Xchange Egypt - Scrap Marketplace*
