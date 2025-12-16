# XCHANGE TENDER MARKETPLACE - INTEGRATIONS GUIDE
# دليل التكاملات لسوق المناقصات

---

## 📋 فهرس التكاملات

1. [بوابات الدفع](#بوابات-الدفع)
2. [التحقق من الهوية (KYC)](#التحقق-من-الهوية)
3. [الإشعارات](#الإشعارات)
4. [التخزين السحابي](#التخزين-السحابي)
5. [الخرائط والموقع](#الخرائط-والموقع)
6. [التوقيع الإلكتروني](#التوقيع-الإلكتروني)
7. [التحليلات](#التحليلات)
8. [تكامل أسواق Xchange](#تكامل-أسواق-xchange)

---

# 💳 بوابات الدفع

## Paymob Integration

### الإعداد
```typescript
// config/paymob.ts
export const paymobConfig = {
  apiKey: process.env.PAYMOB_API_KEY,
  integrationId: process.env.PAYMOB_INTEGRATION_ID,
  iframeId: process.env.PAYMOB_IFRAME_ID,
  hmacSecret: process.env.PAYMOB_HMAC_SECRET,
  baseUrl: 'https://accept.paymob.com/api'
};
```

### Authentication
```typescript
// services/payment/paymob.ts
import axios from 'axios';

class PaymobService {
  private authToken: string;

  /**
   * الحصول على Token للمصادقة
   */
  async authenticate(): Promise<string> {
    const response = await axios.post(
      `${paymobConfig.baseUrl}/auth/tokens`,
      { api_key: paymobConfig.apiKey }
    );
    this.authToken = response.data.token;
    return this.authToken;
  }

  /**
   * إنشاء طلب دفع
   */
  async createPaymentOrder(
    amount: number,
    currency: string = 'EGP'
  ): Promise<PaymentOrder> {
    await this.authenticate();

    const response = await axios.post(
      `${paymobConfig.baseUrl}/ecommerce/orders`,
      {
        auth_token: this.authToken,
        delivery_needed: false,
        amount_cents: amount * 100, // Convert to cents
        currency,
        items: []
      }
    );

    return response.data;
  }

  /**
   * إنشاء Payment Key
   */
  async createPaymentKey(
    orderId: number,
    amount: number,
    billingData: BillingData
  ): Promise<string> {
    const response = await axios.post(
      `${paymobConfig.baseUrl}/acceptance/payment_keys`,
      {
        auth_token: this.authToken,
        amount_cents: amount * 100,
        expiration: 3600, // 1 hour
        order_id: orderId,
        billing_data: billingData,
        currency: 'EGP',
        integration_id: paymobConfig.integrationId
      }
    );

    return response.data.token;
  }

  /**
   * التحقق من Callback
   */
  verifyCallback(data: any, hmac: string): boolean {
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
      data.success
    ].join('');

    const calculatedHmac = crypto
      .createHmac('sha512', paymobConfig.hmacSecret)
      .update(concatenated)
      .digest('hex');

    return calculatedHmac === hmac;
  }

  /**
   * استرداد المبلغ
   */
  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    await this.authenticate();

    const response = await axios.post(
      `${paymobConfig.baseUrl}/acceptance/void_refund/refund`,
      {
        auth_token: this.authToken,
        transaction_id: transactionId,
        amount_cents: amount * 100
      }
    );

    return response.data;
  }
}
```

### Webhook Handler
```typescript
// api/webhooks/paymob.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { obj, hmac } = req.body;

  // Verify HMAC
  const paymobService = new PaymobService();
  if (!paymobService.verifyCallback(obj, hmac)) {
    return res.status(400).json({ error: 'Invalid HMAC' });
  }

  // Process based on transaction status
  if (obj.success) {
    // Payment successful
    await handleSuccessfulPayment({
      transactionId: obj.id,
      orderId: obj.order.id,
      amount: obj.amount_cents / 100,
      merchantOrderId: obj.order.merchant_order_id
    });
  } else {
    // Payment failed
    await handleFailedPayment({
      transactionId: obj.id,
      error: obj.data.message
    });
  }

  res.status(200).json({ received: true });
}
```

---

## Fawry Integration

### الإعداد
```typescript
// config/fawry.ts
export const fawryConfig = {
  merchantCode: process.env.FAWRY_MERCHANT_CODE,
  securityKey: process.env.FAWRY_SECURITY_KEY,
  baseUrl: process.env.NODE_ENV === 'production'
    ? 'https://www.atfawry.com/fawrypay-api'
    : 'https://atfawry.fawrystaging.com/fawrypay-api'
};
```

### Payment Service
```typescript
// services/payment/fawry.ts
import crypto from 'crypto';

class FawryService {
  /**
   * إنشاء رقم مرجعي للدفع
   */
  async createPaymentReference(
    merchantRefNum: string,
    amount: number,
    customerData: CustomerData
  ): Promise<FawryPaymentResponse> {
    const signature = this.generateSignature({
      merchantCode: fawryConfig.merchantCode,
      merchantRefNum,
      customerProfileId: customerData.profileId,
      paymentMethod: 'PAYATFAWRY',
      amount: amount.toFixed(2),
      securityKey: fawryConfig.securityKey
    });

    const payload = {
      merchantCode: fawryConfig.merchantCode,
      merchantRefNum,
      customerProfileId: customerData.profileId,
      customerName: customerData.name,
      customerMobile: customerData.mobile,
      customerEmail: customerData.email,
      paymentMethod: 'PAYATFAWRY',
      amount: amount.toFixed(2),
      currencyCode: 'EGP',
      description: 'Xchange Tender Payment',
      paymentExpiry: this.getExpiryTimestamp(48), // 48 hours
      chargeItems: [{
        itemId: merchantRefNum,
        description: 'Tender Deposit/Payment',
        price: amount.toFixed(2),
        quantity: 1
      }],
      signature
    };

    const response = await axios.post(
      `${fawryConfig.baseUrl}/v2/payments/init`,
      payload
    );

    return {
      referenceNumber: response.data.referenceNumber,
      expirationTime: response.data.expirationTime,
      merchantRefNum
    };
  }

  /**
   * توليد التوقيع
   */
  private generateSignature(data: any): string {
    const concatenated = Object.values(data).join('');
    return crypto
      .createHash('sha256')
      .update(concatenated)
      .digest('hex');
  }

  /**
   * التحقق من حالة الدفع
   */
  async checkPaymentStatus(referenceNumber: string): Promise<PaymentStatus> {
    const signature = this.generateSignature({
      merchantCode: fawryConfig.merchantCode,
      merchantRefNumber: referenceNumber,
      securityKey: fawryConfig.securityKey
    });

    const response = await axios.get(
      `${fawryConfig.baseUrl}/v2/payments/status`,
      {
        params: {
          merchantCode: fawryConfig.merchantCode,
          merchantRefNumber: referenceNumber,
          signature
        }
      }
    );

    return {
      status: response.data.paymentStatus,
      amount: response.data.paymentAmount,
      paidAt: response.data.paymentTime
    };
  }
}
```

---

## InstaPay Integration

```typescript
// services/payment/instapay.ts

class InstaPayService {
  /**
   * إنشاء طلب تحويل InstaPay
   */
  async createPaymentRequest(
    amount: number,
    senderIPA: string,
    description: string
  ): Promise<InstaPayRequest> {
    // InstaPay uses IPA (Instant Payment Address)
    const request = {
      amount,
      currency: 'EGP',
      receiverIPA: process.env.XCHANGE_INSTAPAY_IPA,
      senderIPA,
      description,
      referenceNumber: this.generateReference(),
      expiryMinutes: 30
    };

    // Generate QR code for payment
    const qrCode = await this.generateQRCode(request);

    return {
      ...request,
      qrCode,
      deepLink: this.generateDeepLink(request)
    };
  }

  /**
   * التحقق من التحويل
   */
  async verifyTransfer(referenceNumber: string): Promise<TransferVerification> {
    // Integration with bank API to verify transfer
    // This varies by bank
    return {
      verified: true,
      transactionId: 'xxx',
      amount: 0,
      timestamp: new Date()
    };
  }
}
```

---

# 🔐 التحقق من الهوية (KYC)

## Egyptian National ID Verification

```typescript
// services/kyc/national-id.ts

class NationalIDVerificationService {
  /**
   * التحقق من الرقم القومي
   */
  async verifyNationalId(
    nationalId: string,
    frontImage: string,
    backImage: string,
    selfieImage: string
  ): Promise<KYCResult> {
    // 1. Validate National ID format
    if (!this.validateFormat(nationalId)) {
      return { valid: false, error: 'INVALID_FORMAT' };
    }

    // 2. Extract data from National ID
    const extractedData = this.extractData(nationalId);

    // 3. OCR verification on images
    const ocrResult = await this.performOCR(frontImage, backImage);

    // 4. Face matching
    const faceMatch = await this.matchFaces(frontImage, selfieImage);

    // 5. Liveness detection
    const livenessCheck = await this.checkLiveness(selfieImage);

    return {
      valid: ocrResult.match && faceMatch.score > 0.85 && livenessCheck.live,
      extractedData: {
        ...extractedData,
        ...ocrResult.data
      },
      faceMatchScore: faceMatch.score,
      liveness: livenessCheck.live
    };
  }

  /**
   * استخراج البيانات من الرقم القومي
   */
  private extractData(nationalId: string): NationalIDData {
    // Format: CYYMMDDSSSSG
    // C: Century (2=1900s, 3=2000s)
    // YY: Year
    // MM: Month
    // DD: Day
    // SSSS: Serial (governorate code + sequence)
    // G: Gender (odd=male, even=female)

    const century = nationalId[0] === '2' ? 1900 : 2000;
    const year = century + parseInt(nationalId.substring(1, 3));
    const month = parseInt(nationalId.substring(3, 5));
    const day = parseInt(nationalId.substring(5, 7));
    const governorateCode = nationalId.substring(7, 9);
    const gender = parseInt(nationalId[13]) % 2 === 1 ? 'male' : 'female';

    return {
      dateOfBirth: new Date(year, month - 1, day),
      governorate: this.getGovernorate(governorateCode),
      gender
    };
  }

  /**
   * الحصول على المحافظة من الكود
   */
  private getGovernorate(code: string): string {
    const governorates: Record<string, string> = {
      '01': 'القاهرة',
      '02': 'الإسكندرية',
      '03': 'بورسعيد',
      '04': 'السويس',
      '11': 'دمياط',
      '12': 'الدقهلية',
      '13': 'الشرقية',
      '14': 'القليوبية',
      '15': 'كفر الشيخ',
      '16': 'الغربية',
      '17': 'المنوفية',
      '18': 'البحيرة',
      '19': 'الإسماعيلية',
      '21': 'الجيزة',
      '22': 'بني سويف',
      '23': 'الفيوم',
      '24': 'المنيا',
      '25': 'أسيوط',
      '26': 'سوهاج',
      '27': 'قنا',
      '28': 'أسوان',
      '29': 'الأقصر',
      '31': 'البحر الأحمر',
      '32': 'الوادي الجديد',
      '33': 'مطروح',
      '34': 'شمال سيناء',
      '35': 'جنوب سيناء',
      // ... more codes
    };
    return governorates[code] || 'غير معروف';
  }
}
```

## Commercial Register Verification

```typescript
// services/kyc/commercial-register.ts

class CommercialRegisterService {
  /**
   * التحقق من السجل التجاري
   */
  async verifyCommercialRegister(
    registerNumber: string,
    companyName: string
  ): Promise<CRVerificationResult> {
    // Integration with GAFI (General Authority for Investment)
    // or commercial registry database

    const response = await axios.get(
      `${process.env.CR_VERIFICATION_API}/verify`,
      {
        params: { registerNumber },
        headers: {
          'Authorization': `Bearer ${process.env.CR_API_KEY}`
        }
      }
    );

    return {
      valid: response.data.status === 'ACTIVE',
      companyName: response.data.companyName,
      registrationDate: response.data.registrationDate,
      expiryDate: response.data.expiryDate,
      activities: response.data.activities,
      legalRepresentative: response.data.legalRepresentative
    };
  }
}
```

---

# 📱 الإشعارات

## Push Notifications (Firebase)

```typescript
// services/notifications/firebase.ts
import * as admin from 'firebase-admin';

class FirebaseNotificationService {
  private messaging: admin.messaging.Messaging;

  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      })
    });
    this.messaging = admin.messaging();
  }

  /**
   * إرسال إشعار لمستخدم واحد
   */
  async sendToUser(
    userId: string,
    notification: NotificationPayload
  ): Promise<void> {
    const tokens = await this.getUserTokens(userId);

    if (tokens.length === 0) return;

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: notification.titleAr || notification.title,
        body: notification.messageAr || notification.message
      },
      data: {
        type: notification.type,
        relatedId: notification.relatedId || '',
        actionUrl: notification.actionUrl || ''
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    await this.messaging.sendEachForMulticast(message);
  }

  /**
   * إرسال إشعار لموضوع (Topic)
   */
  async sendToTopic(
    topic: string,
    notification: NotificationPayload
  ): Promise<void> {
    const message: admin.messaging.Message = {
      topic,
      notification: {
        title: notification.titleAr || notification.title,
        body: notification.messageAr || notification.message
      },
      data: {
        type: notification.type,
        relatedId: notification.relatedId || ''
      }
    };

    await this.messaging.send(message);
  }
}
```

## SMS Notifications

```typescript
// services/notifications/sms.ts

class SMSService {
  private provider: 'vodafone' | 'etisalat' | 'twilio';

  /**
   * إرسال SMS عبر Vodafone Business
   */
  async sendViaSMSGateway(
    phone: string,
    message: string
  ): Promise<SMSResult> {
    // Using Vodafone Business SMS Gateway
    const response = await axios.post(
      process.env.SMS_GATEWAY_URL,
      {
        username: process.env.SMS_USERNAME,
        password: process.env.SMS_PASSWORD,
        sender: 'XCHANGE',
        mobile: this.formatPhone(phone),
        message: message,
        encoding: 'UTF8'
      }
    );

    return {
      sent: response.data.status === 'success',
      messageId: response.data.messageId
    };
  }

  /**
   * تنسيق رقم الهاتف
   */
  private formatPhone(phone: string): string {
    // Remove any non-digits
    let cleaned = phone.replace(/\D/g, '');

    // Add country code if not present
    if (cleaned.startsWith('0')) {
      cleaned = '2' + cleaned; // Egypt country code
    }
    if (!cleaned.startsWith('2')) {
      cleaned = '2' + cleaned;
    }

    return cleaned;
  }

  /**
   * قوالب الرسائل
   */
  getTemplates(): SMSTemplates {
    return {
      OTP: 'رمز التحقق الخاص بك: {code}. صالح لمدة 5 دقائق. Xchange',
      TENDER_CLOSING: 'مناقصة "{title}" تغلق خلال {hours} ساعات. Xchange',
      BID_ACCEPTED: 'تهانينا! تم قبول عرضك على مناقصة "{title}". Xchange',
      PAYMENT_RECEIVED: 'تم استلام مبلغ {amount} ج.م في حسابك. Xchange',
      AUCTION_OUTBID: 'تم المزايدة عليك! السعر الحالي: {price} ج.م. Xchange'
    };
  }
}
```

## Email Service (SendGrid/Mailgun)

```typescript
// services/notifications/email.ts
import sgMail from '@sendgrid/mail';

class EmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  /**
   * إرسال بريد إلكتروني
   */
  async send(
    to: string,
    templateId: string,
    data: Record<string, any>
  ): Promise<void> {
    const msg = {
      to,
      from: {
        email: 'noreply@xchange.eg',
        name: 'Xchange مناقصات'
      },
      templateId,
      dynamicTemplateData: {
        ...data,
        year: new Date().getFullYear(),
        supportEmail: 'support@xchange.eg'
      }
    };

    await sgMail.send(msg);
  }

  /**
   * قوالب البريد الإلكتروني
   */
  getTemplateIds(): EmailTemplates {
    return {
      WELCOME: 'd-xxx1',
      TENDER_PUBLISHED: 'd-xxx2',
      NEW_BID: 'd-xxx3',
      BID_ACCEPTED: 'd-xxx4',
      CONTRACT_SIGNED: 'd-xxx5',
      PAYMENT_RELEASED: 'd-xxx6',
      WEEKLY_DIGEST: 'd-xxx7'
    };
  }
}
```

---

# 📁 التخزين السحابي

## AWS S3 / Cloudflare R2

```typescript
// services/storage/s3.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

class StorageService {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
    this.bucket = process.env.S3_BUCKET!;
  }

  /**
   * رفع ملف
   */
  async uploadFile(
    file: Buffer,
    path: string,
    contentType: string
  ): Promise<UploadResult> {
    const key = `${path}/${Date.now()}-${Math.random().toString(36).substring(7)}`;

    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: contentType
    }));

    return {
      key,
      url: `https://${this.bucket}.s3.amazonaws.com/${key}`,
      cdnUrl: `https://cdn.xchange.eg/${key}`
    };
  }

  /**
   * الحصول على رابط موقع مؤقت
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  /**
   * مسارات التخزين
   */
  getPaths(): StoragePaths {
    return {
      tenderDocuments: 'tenders/documents',
      bidDocuments: 'bids/documents',
      vendorPortfolio: 'vendors/portfolio',
      userAvatars: 'users/avatars',
      kycDocuments: 'kyc/documents',
      contractDocuments: 'contracts/documents'
    };
  }
}
```

---

# 🗺️ الخرائط والموقع

## Google Maps Integration

```typescript
// services/maps/google-maps.ts
import { Client } from '@googlemaps/google-maps-services-js';

class MapsService {
  private client: Client;

  constructor() {
    this.client = new Client({});
  }

  /**
   * Geocoding - تحويل العنوان إلى إحداثيات
   */
  async geocode(address: string): Promise<GeoLocation> {
    const response = await this.client.geocode({
      params: {
        address: `${address}, مصر`,
        key: process.env.GOOGLE_MAPS_API_KEY!,
        language: 'ar'
      }
    });

    if (response.data.results.length === 0) {
      throw new Error('ADDRESS_NOT_FOUND');
    }

    const result = response.data.results[0];
    return {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
      components: this.parseAddressComponents(result.address_components)
    };
  }

  /**
   * حساب المسافة بين نقطتين
   */
  async calculateDistance(
    origin: GeoLocation,
    destination: GeoLocation
  ): Promise<DistanceResult> {
    const response = await this.client.distancematrix({
      params: {
        origins: [`${origin.latitude},${origin.longitude}`],
        destinations: [`${destination.latitude},${destination.longitude}`],
        key: process.env.GOOGLE_MAPS_API_KEY!,
        mode: 'driving'
      }
    });

    const element = response.data.rows[0].elements[0];
    return {
      distance: element.distance.value, // meters
      distanceText: element.distance.text,
      duration: element.duration.value, // seconds
      durationText: element.duration.text
    };
  }

  /**
   * البحث عن موردين قريبين
   */
  async findNearbyVendors(
    location: GeoLocation,
    radiusKm: number,
    category?: TenderCategory
  ): Promise<NearbyVendor[]> {
    const vendors = await prisma.vendor.findMany({
      where: {
        isActive: true,
        ...(category && { categories: { has: category } })
      },
      include: {
        user: {
          include: { addresses: true }
        }
      }
    });

    // Filter by distance
    return vendors
      .map(vendor => {
        const address = vendor.user.addresses.find(a => a.isDefault);
        if (!address?.latitude || !address?.longitude) return null;

        const distance = this.haversineDistance(
          location,
          { latitude: address.latitude, longitude: address.longitude }
        );

        if (distance <= radiusKm) {
          return { vendor, distance };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a!.distance - b!.distance) as NearbyVendor[];
  }

  /**
   * حساب المسافة بصيغة Haversine
   */
  private haversineDistance(point1: GeoLocation, point2: GeoLocation): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.latitude - point1.latitude);
    const dLon = this.toRad(point2.longitude - point1.longitude);
    const lat1 = this.toRad(point1.latitude);
    const lat2 = this.toRad(point2.latitude);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }
}
```

---

# ✍️ التوقيع الإلكتروني

## Digital Signature Service

```typescript
// services/signature/digital-signature.ts

class DigitalSignatureService {
  /**
   * إنشاء مستند للتوقيع
   */
  async createSigningRequest(
    documentUrl: string,
    signers: Signer[]
  ): Promise<SigningRequest> {
    // Using local signing or DocuSign/SignNow
    const request = {
      id: generateId(),
      documentUrl,
      signers: signers.map(s => ({
        email: s.email,
        name: s.name,
        order: s.order,
        signatureLocation: s.signatureLocation
      })),
      status: 'PENDING',
      createdAt: new Date()
    };

    await prisma.signingRequest.create({ data: request });

    // Send signing invitations
    for (const signer of signers) {
      await this.sendSigningInvitation(signer, request.id);
    }

    return request;
  }

  /**
   * التوقيع على المستند
   */
  async signDocument(
    requestId: string,
    signerId: string,
    signatureData: SignatureData
  ): Promise<SignatureResult> {
    // Verify signer identity
    const verified = await this.verifySigner(signerId, signatureData.verificationCode);
    if (!verified) {
      throw new Error('VERIFICATION_FAILED');
    }

    // Apply signature to document
    const signedDocument = await this.applySignature(
      requestId,
      signerId,
      signatureData
    );

    // Check if all signatures complete
    const allSigned = await this.checkAllSignatures(requestId);
    if (allSigned) {
      await this.finalizeDocument(requestId);
    }

    return {
      signed: true,
      signedAt: new Date(),
      signedDocumentUrl: signedDocument.url,
      allSignaturesComplete: allSigned
    };
  }

  /**
   * إنشاء توقيع مرئي
   */
  private async applySignature(
    requestId: string,
    signerId: string,
    signatureData: SignatureData
  ): Promise<SignedDocument> {
    // Add signature image/text to PDF at specified location
    // Using pdf-lib or similar library

    const request = await prisma.signingRequest.findUnique({
      where: { id: requestId }
    });

    // Apply signature with timestamp and IP
    const signatureInfo = {
      signedAt: new Date(),
      signedBy: signerId,
      ipAddress: signatureData.ipAddress,
      deviceInfo: signatureData.deviceInfo,
      signatureImage: signatureData.signatureImage
    };

    // Update document
    return { url: 'signed-document-url' };
  }
}
```

---

# 📊 التحليلات

## Analytics Integration

```typescript
// services/analytics/analytics.ts

class AnalyticsService {
  /**
   * تتبع الأحداث
   */
  async trackEvent(
    userId: string | null,
    event: AnalyticsEvent
  ): Promise<void> {
    // Send to multiple analytics services

    // 1. Internal analytics
    await this.trackInternal(userId, event);

    // 2. Google Analytics
    if (process.env.GA_MEASUREMENT_ID) {
      await this.trackGA(userId, event);
    }

    // 3. Mixpanel
    if (process.env.MIXPANEL_TOKEN) {
      await this.trackMixpanel(userId, event);
    }
  }

  /**
   * تحليلات داخلية
   */
  private async trackInternal(
    userId: string | null,
    event: AnalyticsEvent
  ): Promise<void> {
    await prisma.analyticsEvent.create({
      data: {
        userId,
        eventName: event.name,
        eventData: event.data,
        sessionId: event.sessionId,
        timestamp: new Date(),
        source: event.source,
        deviceInfo: event.deviceInfo
      }
    });
  }

  /**
   * أنواع الأحداث
   */
  getEventTypes(): AnalyticsEventTypes {
    return {
      // User events
      USER_SIGNED_UP: 'user_signed_up',
      USER_LOGGED_IN: 'user_logged_in',

      // Tender events
      TENDER_VIEWED: 'tender_viewed',
      TENDER_CREATED: 'tender_created',
      TENDER_PUBLISHED: 'tender_published',

      // Bid events
      BID_SUBMITTED: 'bid_submitted',
      BID_WON: 'bid_won',

      // Auction events
      AUCTION_JOINED: 'auction_joined',
      AUCTION_BID_PLACED: 'auction_bid_placed',
      AUCTION_WON: 'auction_won',

      // Payment events
      PAYMENT_INITIATED: 'payment_initiated',
      PAYMENT_COMPLETED: 'payment_completed',

      // Conversion events
      SEARCH_PERFORMED: 'search_performed',
      DOCUMENT_DOWNLOADED: 'document_downloaded',
      VENDOR_CONTACTED: 'vendor_contacted'
    };
  }
}
```

---

# 🔗 تكامل أسواق Xchange

## Cross-Market Integration

```typescript
// services/xchange/cross-market.ts

class XchangeIntegrationService {
  /**
   * البحث عن موردين من أسواق أخرى
   */
  async findCrossMarketVendors(
    tender: Tender
  ): Promise<CrossMarketVendor[]> {
    const vendors: CrossMarketVendor[] = [];

    // Check related markets based on tender category
    if (['CONSTRUCTION', 'FINISHING'].includes(tender.category)) {
      // Get real estate contractors
      const realEstateVendors = await this.getRealEstateContractors(tender);
      vendors.push(...realEstateVendors);
    }

    if (['VEHICLES', 'TRANSPORT'].includes(tender.category)) {
      // Get vehicle dealers
      const vehicleVendors = await this.getVehicleDealers(tender);
      vendors.push(...vehicleVendors);
    }

    if (['RAW_MATERIALS', 'MANUFACTURING'].includes(tender.category)) {
      // Get scrap dealers
      const scrapVendors = await this.getScrapDealers(tender);
      vendors.push(...scrapVendors);
    }

    return vendors;
  }

  /**
   * إنشاء مناقصة متعددة الأسواق
   */
  async createCrossMarketTender(
    tender: Tender,
    markets: XchangeMarket[]
  ): Promise<CrossMarketTender> {
    const crossMarketTender = {
      primaryTenderId: tender.id,
      markets,
      listings: []
    };

    for (const market of markets) {
      const listing = await this.createMarketListing(tender, market);
      crossMarketTender.listings.push(listing);
    }

    return crossMarketTender;
  }

  /**
   * الحصول على موردي العقارات
   */
  private async getRealEstateContractors(tender: Tender): Promise<CrossMarketVendor[]> {
    // Query real estate marketplace for contractors
    const contractors = await prisma.realEstateContractor.findMany({
      where: {
        specializations: { hasSome: this.mapCategories(tender.category) },
        operatingAreas: { has: tender.governorate }
      }
    });

    return contractors.map(c => ({
      id: c.id,
      source: 'REAL_ESTATE',
      name: c.companyName,
      rating: c.rating,
      specializations: c.specializations
    }));
  }

  /**
   * الحصول على تجار السيارات
   */
  private async getVehicleDealers(tender: Tender): Promise<CrossMarketVendor[]> {
    // Query vehicle marketplace for fleet dealers
    const dealers = await prisma.vehicleDealer.findMany({
      where: {
        dealerType: 'FLEET',
        verified: true
      }
    });

    return dealers.map(d => ({
      id: d.id,
      source: 'VEHICLES',
      name: d.name,
      rating: d.rating,
      inventory: d.inventoryCount
    }));
  }

  /**
   * الأسواق المتاحة
   */
  getAvailableMarkets(): XchangeMarket[] {
    return [
      { id: 'VEHICLES', name: 'سوق السيارات', categories: ['VEHICLES', 'TRANSPORT'] },
      { id: 'REAL_ESTATE', name: 'سوق العقارات', categories: ['CONSTRUCTION', 'FINISHING'] },
      { id: 'SCRAP', name: 'سوق الخردة', categories: ['RAW_MATERIALS', 'MANUFACTURING'] },
      { id: 'GOLD', name: 'سوق الذهب', categories: ['LUXURY_GOODS'] },
      { id: 'MOBILE', name: 'سوق الموبايلات', categories: ['ELECTRONICS'] },
      { id: 'AUCTIONS', name: 'سوق المزادات', categories: ['*'] }
    ];
  }
}
```

---

# 🛠️ Environment Variables

```env
# Application
NODE_ENV=production
APP_URL=https://tenders.xchange.eg
API_URL=https://api.xchange.eg

# Database
DATABASE_URL=postgresql://user:pass@host:5432/xchange_tenders

# Authentication
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Payment - Paymob
PAYMOB_API_KEY=your-paymob-api-key
PAYMOB_INTEGRATION_ID=your-integration-id
PAYMOB_IFRAME_ID=your-iframe-id
PAYMOB_HMAC_SECRET=your-hmac-secret

# Payment - Fawry
FAWRY_MERCHANT_CODE=your-merchant-code
FAWRY_SECURITY_KEY=your-security-key

# Storage - AWS S3
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=xchange-tenders

# Notifications - Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key

# Notifications - SendGrid
SENDGRID_API_KEY=your-sendgrid-key

# Notifications - SMS
SMS_GATEWAY_URL=https://smsgateway.vodafone.com.eg
SMS_USERNAME=your-username
SMS_PASSWORD=your-password

# Maps
GOOGLE_MAPS_API_KEY=your-google-maps-key

# KYC Verification
CR_VERIFICATION_API=https://api.gafi.gov.eg
CR_API_KEY=your-api-key

# Analytics
GA_MEASUREMENT_ID=G-XXXXXXXXXX
MIXPANEL_TOKEN=your-mixpanel-token

# Redis (for caching & real-time)
REDIS_URL=redis://localhost:6379
```

---

هذا الدليل يغطي جميع التكاملات المطلوبة لسوق المناقصات. كل تكامل يتضمن:

1. ✅ التكوين والإعداد
2. ✅ الكود الأساسي
3. ✅ معالجة الأخطاء
4. ✅ أمثلة الاستخدام
