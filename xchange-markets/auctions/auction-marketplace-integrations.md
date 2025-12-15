# XCHANGE AUCTION MARKETPLACE - INTEGRATIONS GUIDE

## 🔌 EXTERNAL SERVICES INTEGRATION

---

## 1. PAYMENT GATEWAYS

### Paymob (Primary Payment Gateway)

**Purpose:** Process card payments, InstaPay, Fawry  
**Pricing:** ~2.5% + 1 EGP per transaction  
**Documentation:** https://docs.paymob.com/

#### API Setup
```javascript
// config/paymob.js
const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID;
const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET;

// Step 1: Authentication
async function getAuthToken() {
  const response = await axios.post('https://accept.paymob.com/api/auth/tokens', {
    api_key: PAYMOB_API_KEY
  });
  return response.data.token;
}

// Step 2: Create Order
async function createOrder(authToken, amount, orderRef) {
  const response = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
    auth_token: authToken,
    delivery_needed: false,
    amount_cents: Math.round(amount * 100), // Convert to cents
    currency: 'EGP',
    merchant_order_id: orderRef,
    items: [
      {
        name: 'Auction Payment',
        amount_cents: Math.round(amount * 100),
        quantity: 1
      }
    ]
  });
  return response.data;
}

// Step 3: Generate Payment Key
async function getPaymentKey(authToken, orderId, amount, userEmail, userPhone) {
  const response = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
    auth_token: authToken,
    amount_cents: Math.round(amount * 100),
    expiration: 3600, // 1 hour
    order_id: orderId,
    billing_data: {
      email: userEmail,
      phone_number: userPhone,
      first_name: 'Auction',
      last_name: 'Winner'
    },
    currency: 'EGP',
    integration_id: PAYMOB_INTEGRATION_ID
  });
  return response.data.token;
}

// Complete Flow
async function initiatePayment(amount, userEmail, userPhone, auctionId) {
  const authToken = await getAuthToken();
  const order = await createOrder(authToken, amount, `AUC-${auctionId}`);
  const paymentKey = await getPaymentKey(authToken, order.id, amount, userEmail, userPhone);
  
  const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;
  
  return {
    paymentUrl,
    orderId: order.id,
    paymentKey
  };
}
```

#### Webhook Handler
```javascript
// POST /webhooks/paymob
async function handlePaymobWebhook(req, res) {
  const data = req.body;
  
  // Verify HMAC signature
  const calculatedHmac = crypto
    .createHmac('sha512', PAYMOB_HMAC_SECRET)
    .update(JSON.stringify(data))
    .digest('hex');
  
  if (calculatedHmac !== req.query.hmac) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process payment
  if (data.success === true && data.is_voided === false) {
    await processSuccessfulPayment({
      transactionId: data.id,
      orderId: data.order.id,
      amount: data.amount_cents / 100,
      currency: data.currency
    });
  }
  
  res.status(200).send('OK');
}
```

#### Escrow Implementation
```javascript
// Hold payment (authorization without capture)
async function holdPayment(amount, userCard) {
  // Use Paymob's authorization-only mode
  const response = await axios.post('https://accept.paymob.com/api/acceptance/payments', {
    // ... authorization parameters
    capture: false // Don't capture immediately
  });
  return response.data.transaction_id;
}

// Capture after confirmation
async function capturePayment(transactionId) {
  await axios.post(`https://accept.paymob.com/api/acceptance/capture/${transactionId}`, {
    // Capture held funds
  });
}

// Refund if dispute
async function refundPayment(transactionId, amount) {
  await axios.post('https://accept.paymob.com/api/acceptance/void_refund/refund', {
    transaction_id: transactionId,
    amount_cents: Math.round(amount * 100)
  });
}
```

---

### Fawry (Cash Payment Network)

**Purpose:** 370,000+ payment points across Egypt  
**Integration:** Through Paymob or direct API

```javascript
// Generate Fawry reference
async function generateFawryReference(amount, auctionId, userPhone) {
  const response = await axios.post('https://accept.paymobsolutions.com/api/acceptance/payments/pay', {
    payment_method: 'fawry',
    amount_cents: Math.round(amount * 100),
    merchant_order_id: `AUC-${auctionId}`,
    customer_mobile: userPhone
  });
  
  return {
    referenceNumber: response.data.fawry_reference,
    expiryDate: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
  };
}
```

---

## 2. REAL-TIME COMMUNICATION

### Socket.IO (WebSocket Server)

**Purpose:** Real-time bidding updates  
**Library:** socket.io@4.7.2

#### Server Setup
```javascript
// server.js
import { Server } from 'socket.io';
import { createServer } from 'http';
import { verifyJWT } from './auth.js';

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

// Middleware: Authentication
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const user = await verifyJWT(token);
    socket.userId = user.id;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

// Connection handler
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);
  
  // Join auction room
  socket.on('join_auction', (auctionId) => {
    socket.join(`auction:${auctionId}`);
    console.log(`User ${socket.userId} joined auction ${auctionId}`);
  });
  
  // Leave auction room
  socket.on('leave_auction', (auctionId) => {
    socket.leave(`auction:${auctionId}`);
  });
  
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

// Emit events
export function emitBidPlaced(auctionId, bidData) {
  io.to(`auction:${auctionId}`).emit('bid_placed', bidData);
}

export function emitAuctionExtended(auctionId, newEndTime) {
  io.to(`auction:${auctionId}`).emit('auction_extended', {
    auctionId,
    newEndTime
  });
}

export function notifyOutbid(userId, auctionId, bidData) {
  io.to(userId).emit('you_are_outbid', {
    auctionId,
    ...bidData
  });
}
```

#### Client Connection (Frontend)
```javascript
// lib/socket.js
import io from 'socket.io-client';

let socket;

export function connectSocket(token) {
  socket = io(process.env.NEXT_PUBLIC_WS_URL, {
    auth: { token }
  });
  
  socket.on('connect', () => {
    console.log('Socket connected');
  });
  
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
  
  return socket;
}

export function joinAuction(auctionId) {
  socket?.emit('join_auction', auctionId);
}

export function leaveAuction(auctionId) {
  socket?.emit('leave_auction', auctionId);
}

// Listen for bid updates
export function onBidPlaced(callback) {
  socket?.on('bid_placed', callback);
}

export function onOutbid(callback) {
  socket?.on('you_are_outbid', callback);
}
```

---

## 3. NOTIFICATIONS

### Twilio SMS (or Vodafone Egypt SMS)

**Purpose:** Critical notifications (outbid, payment due)  
**Pricing:** ~0.10 EGP per SMS

```javascript
// services/sms.js
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(phone, message) {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+2${phone}` // Egypt country code
    });
    return result.sid;
  } catch (error) {
    console.error('SMS Error:', error);
    throw error;
  }
}

// Templates
export const SMS_TEMPLATES = {
  OUTBID: (auctionTitle, newBid) => 
    `تم المزايدة عليك! ${auctionTitle} - العرض الجديد: ${newBid} ج.م`,
  
  WON_AUCTION: (auctionTitle, winningBid) =>
    `تهانينا! فزت بالمزاد: ${auctionTitle} بسعر ${winningBid} ج.م. ادفع خلال 48 ساعة.`,
  
  PAYMENT_DUE: (auctionTitle, amount, hours) =>
    `تذكير: الدفع مطلوب خلال ${hours} ساعة للمزاد: ${auctionTitle} - المبلغ: ${amount} ج.م`
};
```

---

### SendGrid (Email)

**Purpose:** Transaction emails, notifications  
**Free Tier:** 100 emails/day

```javascript
// services/email.js
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail({ to, subject, html, text }) {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject,
    text,
    html
  };
  
  await sgMail.send(msg);
}

// Email Templates
export const EMAIL_TEMPLATES = {
  AUCTION_APPROVED: (userName, auctionTitle, startTime) => ({
    subject: 'تم الموافقة على مزادك',
    html: `
      <h2>مرحباً ${userName}</h2>
      <p>تم الموافقة على مزادك: <strong>${auctionTitle}</strong></p>
      <p>سيبدأ المزاد في: ${startTime}</p>
      <a href="${process.env.FRONTEND_URL}/auctions/${auctionId}">عرض المزاد</a>
    `
  }),
  
  WON_AUCTION: (userName, auctionTitle, amount) => ({
    subject: `تهانينا! فزت بمزاد ${auctionTitle}`,
    html: `
      <h2>مبروك ${userName}!</h2>
      <p>فزت بالمزاد: <strong>${auctionTitle}</strong></p>
      <p>المبلغ الإجمالي: ${amount} ج.م</p>
      <p>يرجى الدفع خلال 48 ساعة.</p>
      <a href="${process.env.FRONTEND_URL}/payment/${auctionId}">ادفع الآن</a>
    `
  })
};
```

---

## 4. SHIPPING & LOGISTICS

### Bosta (Delivery Partner)

**Purpose:** Nationwide shipping  
**Pricing:** ~50 EGP per shipment

```javascript
// services/bosta.js
import axios from 'axios';

const BOSTA_API_KEY = process.env.BOSTA_API_KEY;
const BOSTA_BASE_URL = 'https://app.bosta.co/api/v2';

// Create delivery
export async function createDelivery(deliveryData) {
  const response = await axios.post(
    `${BOSTA_BASE_URL}/deliveries`,
    {
      type: 1, // Send
      specs: {
        packageType: 'Package',
        size: deliveryData.size || 'MEDIUM',
        packageDetails: {
          itemsCount: 1,
          description: deliveryData.description
        }
      },
      dropOffAddress: {
        firstLine: deliveryData.address.street,
        secondLine: deliveryData.address.building,
        city: deliveryData.address.city,
        zone: deliveryData.address.district,
        buildingNumber: deliveryData.address.buildingNumber
      },
      receiver: {
        firstName: deliveryData.receiverName,
        phone: deliveryData.receiverPhone
      },
      cod: deliveryData.cod || 0,
      allowToOpenPackage: false
    },
    {
      headers: {
        'Authorization': BOSTA_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return {
    trackingNumber: response.data.trackingNumber,
    deliveryId: response.data._id
  };
}

// Track delivery
export async function trackDelivery(trackingNumber) {
  const response = await axios.get(
    `${BOSTA_BASE_URL}/deliveries/${trackingNumber}`,
    {
      headers: { 'Authorization': BOSTA_API_KEY }
    }
  );
  
  return {
    status: response.data.state.value,
    currentLocation: response.data.state.location,
    estimatedDelivery: response.data.estimatedDeliveryDate
  };
}

// Webhook handler
export async function handleBostaWebhook(req, res) {
  const event = req.body;
  
  // Update delivery status in database
  await updateDeliveryStatus(event.trackingNumber, event.state);
  
  // Notify user
  if (event.state === 'DELIVERED') {
    await notifyDeliveryComplete(event.trackingNumber);
  }
  
  res.status(200).send('OK');
}
```

---

## 5. STORAGE & MEDIA

### Cloudinary (Image/Video CDN)

**Purpose:** Image hosting, optimization  
**Free Tier:** 25GB storage, 25GB bandwidth

```javascript
// services/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image
export async function uploadImage(file, folder = 'auctions') {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: 'image',
    quality: 'auto',
    fetch_format: 'auto',
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto:good' }
    ]
  });
  
  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height
  };
}

// Generate optimized URLs
export function getOptimizedUrl(publicId, width, height) {
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto'
  });
}

// Delete image
export async function deleteImage(publicId) {
  await cloudinary.uploader.destroy(publicId);
}
```

---

## 6. FRAUD DETECTION

### FingerprintJS (Device Fingerprinting)

**Purpose:** Detect multiple accounts, bot bidding  
**Pricing:** Free tier available

```javascript
// Frontend: components/BidButton.jsx
import FingerprintJS from '@fingerprintjs/fingerprintjs';

async function getBrowserFingerprint() {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  return result.visitorId;
}

// Include in bid submission
async function placeBid(auctionId, amount) {
  const fingerprint = await getBrowserFingerprint();
  
  await api.post(`/auctions/${auctionId}/bids`, {
    amount,
    deviceInfo: {
      fingerprint,
      userAgent: navigator.userAgent,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  });
}
```

---

## 7. TASK SCHEDULING

### Node-Cron (Background Jobs)

**Purpose:** End auctions, send reminders, refund deposits

```javascript
// services/scheduler.js
import cron from 'node-cron';
import { endExpiredAuctions, sendPaymentReminders } from './auction-jobs.js';

// Every minute: Check for auctions that should end
cron.schedule('* * * * *', async () => {
  await endExpiredAuctions();
});

// Every hour: Send payment reminders
cron.schedule('0 * * * *', async () => {
  await sendPaymentReminders();
});

// Daily at 2 AM: Refund deposits for lost bids
cron.schedule('0 2 * * *', async () => {
  await processDepositRefunds();
});
```

---

## 8. GEOCODING

### Google Maps API

**Purpose:** Validate addresses, calculate shipping costs

```javascript
// services/geocoding.js
import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function geocodeAddress(address) {
  const response = await axios.get(
    'https://maps.googleapis.com/maps/api/geocode/json',
    {
      params: {
        address: `${address.street}, ${address.city}, Egypt`,
        key: GOOGLE_MAPS_API_KEY
      }
    }
  );
  
  const result = response.data.results[0];
  return {
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
    formattedAddress: result.formatted_address
  };
}
```

---

## 🔄 INTEGRATION TESTING

```javascript
// tests/integrations.test.js
import { describe, it, expect } from 'vitest';

describe('Paymob Integration', () => {
  it('should create payment successfully', async () => {
    const payment = await initiatePayment(1000, 'test@example.com', '01012345678', 'test123');
    expect(payment.paymentUrl).toBeDefined();
  });
});

describe('Bosta Integration', () => {
  it('should create delivery', async () => {
    const delivery = await createDelivery({
      address: { city: 'Cairo', street: 'Test St' },
      receiverName: 'Test User',
      receiverPhone: '01012345678',
      description: 'Test item'
    });
    expect(delivery.trackingNumber).toBeDefined();
  });
});
```

---

## 📊 COST ESTIMATES (Monthly)

| Service | Free Tier | Paid (1000 auctions/month) |
|---------|-----------|---------------------------|
| Paymob | - | ~2.5% of GMV |
| Twilio SMS | - | ~500 EGP (5000 SMS) |
| SendGrid | 100/day | Free |
| Cloudinary | 25GB | Free |
| Bosta | - | ~50,000 EGP (1000 deliveries) |
| Socket.IO | Free | Free (self-hosted) |
| **Total Fixed** | **~0 EGP** | **~500 EGP** |
| **Total Variable** | - | **2.5% GMV + 50 EGP/delivery** |
