/**
 * Transport Marketplace Seed Data
 * ================================
 *
 * بيانات تجريبية لسوق النقل الذكي:
 * - مزودي خدمات (أفراد، شركات صغيرة، شركات كبيرة)
 * - طلبات شحن ورحلات
 * - عروض أسعار
 * - معاملات مكتملة
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// =====================================================
// SERVICE PROVIDERS - مزودي الخدمات
// =====================================================

const SERVICE_PROVIDERS = [
  // شركات كبيرة
  {
    type: 'COMPANY',
    name: 'Nile Express Shipping',
    nameAr: 'شركة النيل إكسبريس للشحن',
    phone: '+201200000001',
    email: 'info@nileexpress.eg',
    companyName: 'شركة النيل إكسبريس للشحن',
    commercialRegister: 'CR-12345',
    taxNumber: 'TAX-567890',
    coverageAreas: ['القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'الغربية', 'البحيرة'],
    serviceTypes: ['SHIPPING'],
    rating: 4.8,
    totalRatings: 256,
    completedOrders: 1523,
    isVerified: true,
    vehicles: [
      { type: 'VAN', make: 'Mercedes', model: 'Sprinter', year: 2022, plateNumber: 'ق م ص 1234', color: 'أبيض' },
      { type: 'VAN', make: 'Mercedes', model: 'Sprinter', year: 2021, plateNumber: 'ق م ص 1235', color: 'أبيض' },
      { type: 'TRUCK_MEDIUM', make: 'Isuzu', model: 'NPR', year: 2020, plateNumber: 'ن ق ل 5678', color: 'أزرق' },
      { type: 'TRUCK_LARGE', make: 'Volvo', model: 'FH', year: 2019, plateNumber: 'ن ق ل 9012', color: 'أحمر' },
    ],
  },
  {
    type: 'COMPANY',
    name: 'Cairo Trans',
    nameAr: 'القاهرة للنقل والتوصيل',
    phone: '+201200000002',
    email: 'contact@cairotrans.com',
    companyName: 'شركة القاهرة للنقل والتوصيل',
    commercialRegister: 'CR-23456',
    taxNumber: 'TAX-678901',
    coverageAreas: ['القاهرة', 'الجيزة', 'القليوبية', 'الفيوم', 'بني سويف', 'المنيا'],
    serviceTypes: ['SHIPPING', 'INTERCITY_RIDE'],
    rating: 4.6,
    totalRatings: 189,
    completedOrders: 987,
    isVerified: true,
    vehicles: [
      { type: 'VAN', make: 'Hyundai', model: 'H350', year: 2021, plateNumber: 'ق ت ر 2345', color: 'أبيض' },
      { type: 'PICKUP', make: 'Toyota', model: 'Hilux', year: 2022, plateNumber: 'ق ت ر 2346', color: 'فضي' },
      { type: 'SUV', make: 'Toyota', model: 'Fortuner', year: 2023, plateNumber: 'ق ت ر 3456', color: 'أسود' },
      { type: 'BUS_SMALL', make: 'Toyota', model: 'Hiace', year: 2021, plateNumber: 'ق ت ر 4567', color: 'أبيض' },
    ],
  },
  // شركات صغيرة
  {
    type: 'SMALL_BUSINESS',
    name: 'Fast Delivery Alex',
    nameAr: 'توصيل سريع الإسكندرية',
    phone: '+201200000003',
    email: 'fast.alex@gmail.com',
    companyName: 'توصيل سريع الإسكندرية',
    coverageAreas: ['الإسكندرية', 'البحيرة', 'مطروح', 'كفر الشيخ'],
    serviceTypes: ['SHIPPING'],
    rating: 4.5,
    totalRatings: 78,
    completedOrders: 234,
    isVerified: true,
    vehicles: [
      { type: 'VAN', make: 'Suzuki', model: 'Carry', year: 2020, plateNumber: 'س ك 7890', color: 'أبيض' },
      { type: 'PICKUP', make: 'Nissan', model: 'Navara', year: 2019, plateNumber: 'س ك 7891', color: 'رمادي' },
    ],
  },
  {
    type: 'SMALL_BUSINESS',
    name: 'Delta Tours',
    nameAr: 'دلتا تورز للسياحة',
    phone: '+201200000004',
    email: 'delta.tours@outlook.com',
    companyName: 'دلتا تورز للسياحة والنقل',
    coverageAreas: ['الدقهلية', 'الغربية', 'كفر الشيخ', 'دمياط', 'الشرقية', 'القاهرة'],
    serviceTypes: ['INTERCITY_RIDE'],
    rating: 4.7,
    totalRatings: 112,
    completedOrders: 456,
    isVerified: true,
    vehicles: [
      { type: 'SEDAN', make: 'Hyundai', model: 'Elantra', year: 2022, plateNumber: 'د ت 1111', color: 'أبيض' },
      { type: 'SUV', make: 'Kia', model: 'Sportage', year: 2021, plateNumber: 'د ت 2222', color: 'أسود' },
      { type: 'MINIVAN', make: 'Kia', model: 'Carnival', year: 2020, plateNumber: 'د ت 3333', color: 'فضي' },
    ],
  },
  {
    type: 'SMALL_BUSINESS',
    name: 'Hurghada Express',
    nameAr: 'الغردقة إكسبريس',
    phone: '+201200000005',
    email: 'hurghada.exp@gmail.com',
    companyName: 'الغردقة إكسبريس للنقل',
    coverageAreas: ['البحر الأحمر', 'قنا', 'الأقصر', 'أسوان', 'سوهاج'],
    serviceTypes: ['SHIPPING', 'INTERCITY_RIDE'],
    rating: 4.4,
    totalRatings: 67,
    completedOrders: 189,
    isVerified: true,
    vehicles: [
      { type: 'SUV', make: 'Toyota', model: 'Land Cruiser', year: 2021, plateNumber: 'غ ر د 5555', color: 'أبيض' },
      { type: 'VAN', make: 'Toyota', model: 'Hiace', year: 2020, plateNumber: 'غ ر د 6666', color: 'أبيض' },
    ],
  },
  // أفراد
  {
    type: 'INDIVIDUAL',
    name: 'Mohamed Ahmed',
    nameAr: 'محمد أحمد',
    phone: '+201200000006',
    email: 'mohamed.ahmed.driver@gmail.com',
    coverageAreas: ['القاهرة', 'الجيزة', 'القليوبية'],
    serviceTypes: ['SHIPPING', 'INTERCITY_RIDE'],
    rating: 4.9,
    totalRatings: 45,
    completedOrders: 123,
    isVerified: true,
    vehicles: [
      { type: 'PICKUP', make: 'Chevrolet', model: 'Colorado', year: 2021, plateNumber: 'م أ 8888', color: 'أسود' },
    ],
  },
  {
    type: 'INDIVIDUAL',
    name: 'Ahmed Hassan',
    nameAr: 'أحمد حسن',
    phone: '+201200000007',
    email: 'ahmed.hassan.cairo@gmail.com',
    coverageAreas: ['القاهرة', 'الجيزة', 'الإسكندرية', 'البحيرة'],
    serviceTypes: ['INTERCITY_RIDE'],
    rating: 4.7,
    totalRatings: 89,
    completedOrders: 267,
    isVerified: true,
    vehicles: [
      { type: 'SEDAN', make: 'Toyota', model: 'Camry', year: 2022, plateNumber: 'أ ح 1234', color: 'فضي' },
    ],
  },
  {
    type: 'INDIVIDUAL',
    name: 'Mahmoud Saeed',
    nameAr: 'محمود سعيد',
    phone: '+201200000008',
    email: 'mahmoud.saeed@gmail.com',
    coverageAreas: ['الإسكندرية', 'البحيرة', 'الغربية', 'كفر الشيخ'],
    serviceTypes: ['SHIPPING'],
    rating: 4.3,
    totalRatings: 34,
    completedOrders: 78,
    isVerified: true,
    vehicles: [
      { type: 'VAN', make: 'Fiat', model: 'Ducato', year: 2019, plateNumber: 'م س 4567', color: 'أبيض' },
    ],
  },
  {
    type: 'INDIVIDUAL',
    name: 'Khaled Ibrahim',
    nameAr: 'خالد إبراهيم',
    phone: '+201200000009',
    email: 'khaled.ibrahim.driver@gmail.com',
    coverageAreas: ['الجيزة', 'الفيوم', 'بني سويف', 'المنيا'],
    serviceTypes: ['SHIPPING', 'INTERCITY_RIDE'],
    rating: 4.6,
    totalRatings: 56,
    completedOrders: 145,
    isVerified: false,
    vehicles: [
      { type: 'PICKUP', make: 'Toyota', model: 'Hilux', year: 2020, plateNumber: 'خ أ 7890', color: 'أبيض' },
      { type: 'SEDAN', make: 'Hyundai', model: 'Accent', year: 2021, plateNumber: 'خ أ 7891', color: 'أزرق' },
    ],
  },
  {
    type: 'INDIVIDUAL',
    name: 'Youssef Ali',
    nameAr: 'يوسف علي',
    phone: '+201200000010',
    email: 'youssef.ali.transport@gmail.com',
    coverageAreas: ['أسوان', 'الأقصر', 'قنا', 'سوهاج', 'أسيوط'],
    serviceTypes: ['INTERCITY_RIDE'],
    rating: 4.8,
    totalRatings: 78,
    completedOrders: 234,
    isVerified: true,
    vehicles: [
      { type: 'SUV', make: 'Mitsubishi', model: 'Pajero', year: 2019, plateNumber: 'ي ع 2468', color: 'رمادي' },
    ],
  },
];

// =====================================================
// SERVICE REQUESTS - طلبات الخدمة
// =====================================================

const SERVICE_REQUESTS = [
  // طلبات شحن مفتوحة
  {
    serviceType: 'SHIPPING',
    status: 'OPEN',
    pickup: { governorate: 'القاهرة', city: 'مدينة نصر', address: 'شارع مكرم عبيد، عمارة 15', lat: 30.0511, lng: 31.3486 },
    dropoff: { governorate: 'الإسكندرية', city: 'سموحة', address: 'شارع فوزي معاذ، بجوار كارفور', lat: 31.2001, lng: 29.9187 },
    shippingDetails: { weight: 25, packageType: 'إلكترونيات', quantity: 2, fragile: true, requiresCooling: false },
    scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    scheduledTime: '10:00',
    flexibility: 'FLEXIBLE_HOURS',
    paymentMethod: 'CASH',
    customerName: 'أحمد محمد',
    customerPhone: '+201012345678',
    budgetMin: 200,
    budgetMax: 400,
    quotesCount: 0,
  },
  {
    serviceType: 'SHIPPING',
    status: 'QUOTED',
    pickup: { governorate: 'الجيزة', city: 'المهندسين', address: 'شارع لبنان، برج الجزيرة', lat: 30.0444, lng: 31.2085 },
    dropoff: { governorate: 'الشرقية', city: 'الزقازيق', address: 'شارع الجلاء، أمام جامعة الزقازيق', lat: 30.5877, lng: 31.5039 },
    shippingDetails: { weight: 50, packageType: 'أثاث', quantity: 5, fragile: false, requiresCooling: false },
    scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    flexibility: 'FLEXIBLE_DAYS',
    paymentMethod: 'CASH',
    customerName: 'سارة أحمد',
    customerPhone: '+201023456789',
    budgetMin: 300,
    budgetMax: 600,
    quotesCount: 3,
  },
  {
    serviceType: 'SHIPPING',
    status: 'OPEN',
    pickup: { governorate: 'الإسكندرية', city: 'العجمي', address: 'كيلو 21، بجوار قرية الشروق', lat: 31.0409, lng: 29.7618 },
    dropoff: { governorate: 'القاهرة', city: 'المعادي', address: 'شارع 9، بجوار جراند مول', lat: 29.9602, lng: 31.2569 },
    shippingDetails: { weight: 15, packageType: 'مستندات', quantity: 1, fragile: false, requiresCooling: false },
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    scheduledTime: '14:00',
    flexibility: 'EXACT',
    paymentMethod: 'COD',
    codAmount: 5000,
    customerName: 'محمود علي',
    customerPhone: '+201034567890',
    quotesCount: 0,
  },
  // طلبات رحلات مفتوحة
  {
    serviceType: 'INTERCITY_RIDE',
    status: 'OPEN',
    pickup: { governorate: 'القاهرة', city: 'مصر الجديدة', address: 'ميدان تريومف، أمام سيتي ستارز', lat: 30.0729, lng: 31.3452 },
    dropoff: { governorate: 'البحر الأحمر', city: 'الغردقة', address: 'طريق الجونة، قرية أرابيلا', lat: 27.2579, lng: 33.8116 },
    rideDetails: { passengers: 4, luggage: 3, vehiclePreference: 'SUV' },
    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    scheduledTime: '06:00',
    flexibility: 'EXACT',
    paymentMethod: 'CASH',
    customerName: 'عمر حسن',
    customerPhone: '+201045678901',
    budgetMin: 1000,
    budgetMax: 1500,
    quotesCount: 0,
  },
  {
    serviceType: 'INTERCITY_RIDE',
    status: 'QUOTED',
    pickup: { governorate: 'الجيزة', city: 'الدقي', address: 'ميدان المساحة، برج الأطباء', lat: 30.0379, lng: 31.2120 },
    dropoff: { governorate: 'الإسكندرية', city: 'المنتزه', address: 'قصر المنتزه، المدخل الرئيسي', lat: 31.2865, lng: 30.0119 },
    rideDetails: { passengers: 2, luggage: 2, vehiclePreference: 'SEDAN' },
    scheduledDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    scheduledTime: '08:00',
    flexibility: 'FLEXIBLE_HOURS',
    paymentMethod: 'CASH',
    customerName: 'نورهان محمد',
    customerPhone: '+201056789012',
    quotesCount: 4,
  },
  // طلبات مقبولة (قيد التنفيذ)
  {
    serviceType: 'SHIPPING',
    status: 'ACCEPTED',
    pickup: { governorate: 'القاهرة', city: 'التجمع الخامس', address: 'الحي الأول، فيلا 23', lat: 30.0084, lng: 31.4270 },
    dropoff: { governorate: 'الأقصر', city: 'الأقصر', address: 'شارع التلفزيون، بجوار معبد الكرنك', lat: 25.6872, lng: 32.6396 },
    shippingDetails: { weight: 100, packageType: 'أجهزة منزلية', quantity: 3, fragile: true, requiresCooling: false },
    scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    flexibility: 'EXACT',
    paymentMethod: 'CASH',
    customerName: 'كريم سمير',
    customerPhone: '+201067890123',
    budgetMax: 1200,
    quotesCount: 5,
    acceptedQuoteId: 'quote_accepted_1',
  },
  {
    serviceType: 'INTERCITY_RIDE',
    status: 'IN_PROGRESS',
    pickup: { governorate: 'القاهرة', city: 'الزمالك', address: 'شارع 26 يوليو، برج النيل', lat: 30.0609, lng: 31.2234 },
    dropoff: { governorate: 'جنوب سيناء', city: 'شرم الشيخ', address: 'خليج نعمة، فندق هيلتون', lat: 27.9158, lng: 34.3300 },
    rideDetails: { passengers: 3, luggage: 4, vehiclePreference: 'SUV', amenities: ['AC', 'WIFI'] },
    scheduledDate: new Date(),
    scheduledTime: '05:00',
    flexibility: 'EXACT',
    paymentMethod: 'CARD',
    customerName: 'ياسمين علي',
    customerPhone: '+201078901234',
    quotesCount: 6,
    acceptedQuoteId: 'quote_accepted_2',
  },
  // طلبات مكتملة
  {
    serviceType: 'SHIPPING',
    status: 'COMPLETED',
    pickup: { governorate: 'الإسكندرية', city: 'الإبراهيمية', address: 'شارع ابو قير، عمارة 45', lat: 31.2156, lng: 29.9553 },
    dropoff: { governorate: 'القاهرة', city: 'وسط البلد', address: 'شارع طلعت حرب، برج الجزيرة', lat: 30.0444, lng: 31.2357 },
    shippingDetails: { weight: 20, packageType: 'ملابس', quantity: 10, fragile: false, requiresCooling: false },
    scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    flexibility: 'FLEXIBLE_DAYS',
    paymentMethod: 'CASH',
    customerName: 'منى إبراهيم',
    customerPhone: '+201089012345',
    quotesCount: 2,
    acceptedQuoteId: 'quote_completed_1',
  },
  {
    serviceType: 'INTERCITY_RIDE',
    status: 'COMPLETED',
    pickup: { governorate: 'الجيزة', city: 'أكتوبر', address: 'الحي المتميز، مول مصر', lat: 29.9729, lng: 30.9474 },
    dropoff: { governorate: 'مطروح', city: 'مرسى مطروح', address: 'كورنيش الميناء', lat: 31.3543, lng: 27.2373 },
    rideDetails: { passengers: 5, luggage: 5, vehiclePreference: 'MINIVAN' },
    scheduledDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    flexibility: 'EXACT',
    paymentMethod: 'CASH',
    customerName: 'حسام الدين',
    customerPhone: '+201090123456',
    quotesCount: 3,
    acceptedQuoteId: 'quote_completed_2',
  },
  {
    serviceType: 'SHIPPING',
    status: 'COMPLETED',
    pickup: { governorate: 'القاهرة', city: 'شبرا', address: 'شارع شبرا الرئيسي', lat: 30.0771, lng: 31.2452 },
    dropoff: { governorate: 'أسيوط', city: 'أسيوط', address: 'شارع الجمهورية', lat: 27.1809, lng: 31.1837 },
    shippingDetails: { weight: 200, packageType: 'بضائع تجارية', quantity: 20, fragile: false, requiresCooling: false },
    scheduledDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    flexibility: 'FLEXIBLE_DAYS',
    paymentMethod: 'COD',
    codAmount: 15000,
    customerName: 'تاجر الصعيد',
    customerPhone: '+201101234567',
    quotesCount: 4,
    acceptedQuoteId: 'quote_completed_3',
  },
];

// =====================================================
// QUOTES - عروض الأسعار
// =====================================================

const generateQuotes = (requestIndex: number, providersCount: number) => {
  const quotes = [];
  const basePrice = 150 + Math.random() * 300;

  for (let i = 0; i < providersCount; i++) {
    const variation = 0.8 + Math.random() * 0.4; // 80% to 120%
    const price = Math.round(basePrice * variation);

    quotes.push({
      requestIndex,
      providerIndex: i % SERVICE_PROVIDERS.length,
      price,
      priceBreakdown: {
        basePrice: Math.round(price * 0.7),
        distanceCharge: Math.round(price * 0.2),
        extras: Math.random() > 0.5 ? [{ name: 'تأمين', price: Math.round(price * 0.1) }] : undefined,
      },
      vehicleType: ['VAN', 'PICKUP', 'SEDAN', 'SUV'][Math.floor(Math.random() * 4)],
      estimatedDuration: 60 + Math.floor(Math.random() * 180), // 1-4 hours
      estimatedArrival: new Date(Date.now() + (2 + Math.random() * 6) * 60 * 60 * 1000),
      notes: [
        'تأمين شامل على الشحنة',
        'توصيل حتى باب المنزل',
        'خدمة على مدار الساعة',
        'سائق محترف ومدرب',
        'مركبة مكيفة ومريحة',
      ][Math.floor(Math.random() * 5)],
      status: ['PENDING', 'PENDING', 'PENDING', 'ACCEPTED', 'REJECTED'][Math.floor(Math.random() * 5)],
    });
  }

  return quotes;
};

// =====================================================
// NOTIFICATIONS - الإشعارات
// =====================================================

const SAMPLE_NOTIFICATIONS = [
  { type: 'NEW_REQUEST', titleAr: 'طلب جديد في منطقتك', messageAr: 'طلب شحن جديد من القاهرة إلى الإسكندرية' },
  { type: 'NEW_QUOTE', titleAr: 'عرض سعر جديد', messageAr: 'استلمت عرض سعر جديد بقيمة 350 ج.م' },
  { type: 'QUOTE_ACCEPTED', titleAr: 'تم قبول عرضك', messageAr: 'تهانينا! تم قبول عرضك لطلب الشحن #REQ123' },
  { type: 'QUOTE_REJECTED', titleAr: 'تم رفض عرضك', messageAr: 'للأسف تم رفض عرضك لطلب الرحلة #REQ456' },
  { type: 'ORDER_UPDATE', titleAr: 'تحديث الطلب', messageAr: 'تم تحديث حالة طلبك إلى: جاري التنفيذ' },
];

// =====================================================
// SEED FUNCTION
// =====================================================

async function seedTransportMarketplace() {
  console.log('🚚 Starting Transport Marketplace Seeding...\n');

  // Get existing users to link providers
  const existingUsers = await prisma.user.findMany({ take: 10 });

  if (existingUsers.length < 5) {
    console.log('⚠️  Not enough users found. Creating placeholder user associations...');
  }

  // =====================================================
  // 1. CREATE SERVICE PROVIDERS
  // =====================================================
  console.log('👥 Creating Service Providers...');

  const createdProviders: any[] = [];

  for (let i = 0; i < SERVICE_PROVIDERS.length; i++) {
    const providerData = SERVICE_PROVIDERS[i];
    const userId = existingUsers[i % existingUsers.length]?.id || `user_placeholder_${i}`;

    // Check if provider already exists
    const existingProvider = await prisma.serviceProvider.findUnique({
      where: { userId },
    }).catch(() => null);

    if (existingProvider) {
      console.log(`  ⏭️  Provider for user ${userId} already exists, skipping...`);
      createdProviders.push(existingProvider);
      continue;
    }

    try {
      const provider = await prisma.serviceProvider.create({
        data: {
          userId,
          type: providerData.type as any,
          name: providerData.name,
          nameAr: providerData.nameAr,
          phone: providerData.phone,
          email: providerData.email,
          companyName: providerData.companyName,
          commercialRegister: providerData.commercialRegister,
          taxNumber: providerData.taxNumber,
          coverageAreas: providerData.coverageAreas,
          serviceTypes: providerData.serviceTypes as any[],
          rating: providerData.rating,
          totalRatings: providerData.totalRatings,
          completedOrders: providerData.completedOrders,
          isVerified: providerData.isVerified,
          isActive: true,
        },
      });

      // Create vehicles for provider
      for (const vehicleData of providerData.vehicles) {
        await prisma.providerVehicle.create({
          data: {
            providerId: provider.id,
            type: vehicleData.type as any,
            make: vehicleData.make,
            model: vehicleData.model,
            year: vehicleData.year,
            plateNumber: vehicleData.plateNumber,
            color: vehicleData.color,
            isActive: true,
            photos: [],
          },
        });
      }

      createdProviders.push(provider);
      console.log(`  ✅ ${providerData.nameAr} (${providerData.type}) - ${providerData.vehicles.length} vehicles`);
    } catch (error: any) {
      console.log(`  ⚠️  Could not create provider ${providerData.nameAr}: ${error.message}`);
    }
  }

  // =====================================================
  // 2. CREATE SERVICE REQUESTS
  // =====================================================
  console.log('\n📋 Creating Service Requests...');

  const createdRequests: any[] = [];

  for (let i = 0; i < SERVICE_REQUESTS.length; i++) {
    const requestData = SERVICE_REQUESTS[i];
    const userId = existingUsers[i % existingUsers.length]?.id || `user_placeholder_${i}`;

    try {
      const request = await prisma.serviceRequest.create({
        data: {
          userId,
          serviceType: requestData.serviceType as any,
          status: requestData.status as any,
          pickupAddress: requestData.pickup.address,
          pickupCity: requestData.pickup.city,
          pickupGov: requestData.pickup.governorate,
          pickupLat: requestData.pickup.lat,
          pickupLng: requestData.pickup.lng,
          dropoffAddress: requestData.dropoff.address,
          dropoffCity: requestData.dropoff.city,
          dropoffGov: requestData.dropoff.governorate,
          dropoffLat: requestData.dropoff.lat,
          dropoffLng: requestData.dropoff.lng,
          shippingDetails: requestData.shippingDetails ? JSON.parse(JSON.stringify(requestData.shippingDetails)) : undefined,
          rideDetails: requestData.rideDetails ? JSON.parse(JSON.stringify(requestData.rideDetails)) : undefined,
          scheduledDate: requestData.scheduledDate,
          scheduledTime: requestData.scheduledTime,
          flexibility: requestData.flexibility,
          paymentMethod: requestData.paymentMethod,
          codAmount: requestData.codAmount,
          customerName: requestData.customerName,
          customerPhone: requestData.customerPhone,
          budgetMin: requestData.budgetMin,
          budgetMax: requestData.budgetMax,
          quotesCount: requestData.quotesCount,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      createdRequests.push(request);
      console.log(`  ✅ ${requestData.serviceType}: ${requestData.pickup.governorate} → ${requestData.dropoff.governorate} (${requestData.status})`);
    } catch (error: any) {
      console.log(`  ⚠️  Could not create request: ${error.message}`);
    }
  }

  // =====================================================
  // 3. CREATE QUOTES FOR REQUESTS WITH QUOTES
  // =====================================================
  console.log('\n💬 Creating Quotes...');

  let quotesCreated = 0;

  for (let i = 0; i < createdRequests.length; i++) {
    const request = createdRequests[i];
    const requestData = SERVICE_REQUESTS[i];

    if (requestData.quotesCount > 0 && createdProviders.length > 0) {
      const quotes = generateQuotes(i, requestData.quotesCount);

      for (const quoteData of quotes) {
        const provider = createdProviders[quoteData.providerIndex % createdProviders.length];
        if (!provider) continue;

        try {
          await prisma.serviceQuote.create({
            data: {
              requestId: request.id,
              providerId: provider.id,
              status: quoteData.status as any,
              price: quoteData.price,
              currency: 'EGP',
              priceBreakdown: JSON.parse(JSON.stringify(quoteData.priceBreakdown)),
              vehicleType: quoteData.vehicleType as any,
              estimatedDuration: quoteData.estimatedDuration,
              estimatedArrival: quoteData.estimatedArrival,
              notes: quoteData.notes,
              validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
          });
          quotesCreated++;
        } catch (error: any) {
          // Skip duplicate quotes
        }
      }
    }
  }

  console.log(`  ✅ Created ${quotesCreated} quotes`);

  // =====================================================
  // 4. CREATE NOTIFICATIONS
  // =====================================================
  console.log('\n🔔 Creating Notifications...');

  let notificationsCreated = 0;

  for (const user of existingUsers.slice(0, 5)) {
    for (const notif of SAMPLE_NOTIFICATIONS) {
      try {
        await prisma.marketplaceNotification.create({
          data: {
            userId: user.id,
            type: notif.type,
            title: notif.type.replace(/_/g, ' '),
            titleAr: notif.titleAr,
            message: notif.type,
            messageAr: notif.messageAr,
            isRead: Math.random() > 0.5,
          },
        });
        notificationsCreated++;
      } catch (error: any) {
        // Skip errors
      }
    }
  }

  console.log(`  ✅ Created ${notificationsCreated} notifications`);

  // =====================================================
  // SUMMARY
  // =====================================================
  console.log('\n' + '='.repeat(60));
  console.log('✨ TRANSPORT MARKETPLACE SEEDING COMPLETED! ✨');
  console.log('='.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   👥 Service Providers: ${createdProviders.length}`);
  console.log(`      - Companies: ${SERVICE_PROVIDERS.filter(p => p.type === 'COMPANY').length}`);
  console.log(`      - Small Businesses: ${SERVICE_PROVIDERS.filter(p => p.type === 'SMALL_BUSINESS').length}`);
  console.log(`      - Individuals: ${SERVICE_PROVIDERS.filter(p => p.type === 'INDIVIDUAL').length}`);
  console.log(`   📋 Service Requests: ${createdRequests.length}`);
  console.log(`      - Shipping: ${SERVICE_REQUESTS.filter(r => r.serviceType === 'SHIPPING').length}`);
  console.log(`      - Intercity Rides: ${SERVICE_REQUESTS.filter(r => r.serviceType === 'INTERCITY_RIDE').length}`);
  console.log(`   💬 Quotes: ${quotesCreated}`);
  console.log(`   🔔 Notifications: ${notificationsCreated}`);
  console.log('\n🔐 Demo Login Credentials:');
  console.log('   All users: Password123!');
  console.log('   Provider emails: See SERVICE_PROVIDERS array');
  console.log('\n');
}

// Run the seed
seedTransportMarketplace()
  .catch((e) => {
    console.error('❌ Error seeding transport marketplace:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
