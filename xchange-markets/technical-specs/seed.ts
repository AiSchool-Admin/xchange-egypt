// Xchange Scrap Marketplace - Seed Data
// ملف بيانات البذور للتطوير والاختبار

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// فئات المواد
// ============================================

const materialCategories = [
  {
    id: 'cat-metals-ferrous',
    nameAr: 'معادن حديدية',
    nameEn: 'Ferrous Metals',
    slug: 'ferrous-metals',
    iconUrl: '/icons/iron.svg',
    descriptionAr: 'الحديد والصلب وجميع السبائك الحديدية',
    descriptionEn: 'Iron, steel and all ferrous alloys',
    sortOrder: 1
  },
  {
    id: 'cat-metals-nonferrous',
    nameAr: 'معادن غير حديدية',
    nameEn: 'Non-Ferrous Metals',
    slug: 'non-ferrous-metals',
    iconUrl: '/icons/copper.svg',
    descriptionAr: 'النحاس، الألومنيوم، الرصاص، الزنك وغيرها',
    descriptionEn: 'Copper, aluminium, lead, zinc and others',
    sortOrder: 2
  },
  {
    id: 'cat-electronics',
    nameAr: 'إلكترونيات',
    nameEn: 'Electronics',
    slug: 'electronics',
    iconUrl: '/icons/electronics.svg',
    descriptionAr: 'الأجهزة الإلكترونية والكهربائية',
    descriptionEn: 'Electronic and electrical devices',
    sortOrder: 3
  },
  {
    id: 'cat-recyclables',
    nameAr: 'مواد قابلة للتدوير',
    nameEn: 'Recyclables',
    slug: 'recyclables',
    iconUrl: '/icons/recycle.svg',
    descriptionAr: 'الورق، البلاستيك، الزجاج والكرتون',
    descriptionEn: 'Paper, plastic, glass and cardboard',
    sortOrder: 4
  },
  {
    id: 'cat-appliances',
    nameAr: 'أجهزة منزلية',
    nameEn: 'Home Appliances',
    slug: 'home-appliances',
    iconUrl: '/icons/appliances.svg',
    descriptionAr: 'الثلاجات، الغسالات، التكييفات وغيرها',
    descriptionEn: 'Refrigerators, washing machines, ACs and others',
    sortOrder: 5
  }
];

// ============================================
// أنواع المواد
// ============================================

const materialTypes = [
  // معادن حديدية
  {
    id: 'mat-iron-mixed',
    categoryId: 'cat-metals-ferrous',
    nameAr: 'حديد خردة خليط',
    nameEn: 'Mixed Iron Scrap',
    slug: 'iron-mixed',
    descriptionAr: 'حديد مخلوط من مصادر متنوعة',
    unit: 'kg',
    qualityGrades: ['premium', 'standard', 'mixed', 'low'],
    sortOrder: 1
  },
  {
    id: 'mat-iron-premium',
    categoryId: 'cat-metals-ferrous',
    nameAr: 'حديد خردة مميز',
    nameEn: 'Premium Iron Scrap',
    slug: 'iron-premium',
    descriptionAr: 'حديد نظيف عالي الجودة',
    unit: 'kg',
    qualityGrades: ['premium', 'standard'],
    sortOrder: 2
  },
  {
    id: 'mat-iron-rebar',
    categoryId: 'cat-metals-ferrous',
    nameAr: 'حديد تسليح خردة',
    nameEn: 'Rebar Scrap',
    slug: 'iron-rebar',
    descriptionAr: 'حديد تسليح من الهدم والبناء',
    unit: 'kg',
    qualityGrades: ['premium', 'standard', 'rusty'],
    sortOrder: 3
  },
  {
    id: 'mat-iron-car',
    categoryId: 'cat-metals-ferrous',
    nameAr: 'خردة سيارات',
    nameEn: 'Car Scrap',
    slug: 'car-scrap',
    descriptionAr: 'هياكل وأجزاء السيارات المعدنية',
    unit: 'kg',
    qualityGrades: ['standard', 'mixed'],
    sortOrder: 4
  },
  {
    id: 'mat-sheet-metal',
    categoryId: 'cat-metals-ferrous',
    nameAr: 'صاج خردة',
    nameEn: 'Sheet Metal Scrap',
    slug: 'sheet-metal',
    descriptionAr: 'ألواح الصاج والصفيح',
    unit: 'kg',
    qualityGrades: ['clean', 'painted', 'rusty'],
    sortOrder: 5
  },
  
  // معادن غير حديدية
  {
    id: 'mat-copper-red-shiny',
    categoryId: 'cat-metals-nonferrous',
    nameAr: 'نحاس أحمر لامع',
    nameEn: 'Shiny Red Copper',
    slug: 'copper-red-shiny',
    descriptionAr: 'نحاس أحمر نظيف ولامع',
    unit: 'kg',
    qualityGrades: ['shiny', 'clean'],
    sortOrder: 1
  },
  {
    id: 'mat-copper-red-rough',
    categoryId: 'cat-metals-nonferrous',
    nameAr: 'نحاس أحمر خشن',
    nameEn: 'Rough Red Copper',
    slug: 'copper-red-rough',
    descriptionAr: 'نحاس أحمر مع شوائب',
    unit: 'kg',
    qualityGrades: ['standard', 'mixed'],
    sortOrder: 2
  },
  {
    id: 'mat-copper-yellow',
    categoryId: 'cat-metals-nonferrous',
    nameAr: 'نحاس أصفر (برونز)',
    nameEn: 'Yellow Copper (Brass)',
    slug: 'copper-yellow',
    descriptionAr: 'سبائك النحاس الأصفر والبرونز',
    unit: 'kg',
    qualityGrades: ['clean', 'mixed'],
    sortOrder: 3
  },
  {
    id: 'mat-aluminium-soft',
    categoryId: 'cat-metals-nonferrous',
    nameAr: 'ألومنيوم طري',
    nameEn: 'Soft Aluminium',
    slug: 'aluminium-soft',
    descriptionAr: 'ألومنيوم طري من العلب والرقائق',
    unit: 'kg',
    qualityGrades: ['clean', 'mixed'],
    sortOrder: 4
  },
  {
    id: 'mat-aluminium-cans',
    categoryId: 'cat-metals-nonferrous',
    nameAr: 'علب كانز',
    nameEn: 'Aluminium Cans',
    slug: 'aluminium-cans',
    descriptionAr: 'علب المشروبات الألومنيوم',
    unit: 'kg',
    qualityGrades: ['pressed', 'loose'],
    sortOrder: 5
  },
  {
    id: 'mat-stainless-304',
    categoryId: 'cat-metals-nonferrous',
    nameAr: 'استانلس 304',
    nameEn: 'Stainless Steel 304',
    slug: 'stainless-304',
    descriptionAr: 'الستانلس ستيل درجة 304',
    unit: 'kg',
    qualityGrades: ['clean', 'mixed'],
    sortOrder: 6
  },
  {
    id: 'mat-lead',
    categoryId: 'cat-metals-nonferrous',
    nameAr: 'رصاص',
    nameEn: 'Lead',
    slug: 'lead',
    descriptionAr: 'الرصاص من البطاريات وغيرها',
    unit: 'kg',
    qualityGrades: ['pure', 'battery', 'mixed'],
    sortOrder: 7
  },
  
  // إلكترونيات
  {
    id: 'mat-mobile-phones',
    categoryId: 'cat-electronics',
    nameAr: 'هواتف محمولة',
    nameEn: 'Mobile Phones',
    slug: 'mobile-phones',
    descriptionAr: 'الهواتف المحمولة التالفة أو القديمة',
    unit: 'piece',
    qualityGrades: ['working', 'repairable', 'for_parts', 'scrap'],
    sortOrder: 1
  },
  {
    id: 'mat-laptops',
    categoryId: 'cat-electronics',
    nameAr: 'لابتوب',
    nameEn: 'Laptops',
    slug: 'laptops',
    descriptionAr: 'أجهزة اللابتوب التالفة أو القديمة',
    unit: 'piece',
    qualityGrades: ['working', 'repairable', 'for_parts', 'scrap'],
    sortOrder: 2
  },
  {
    id: 'mat-computers',
    categoryId: 'cat-electronics',
    nameAr: 'كمبيوتر',
    nameEn: 'Desktop Computers',
    slug: 'desktop-computers',
    descriptionAr: 'أجهزة الكمبيوتر المكتبية',
    unit: 'piece',
    qualityGrades: ['working', 'repairable', 'for_parts', 'scrap'],
    sortOrder: 3
  },
  {
    id: 'mat-printers',
    categoryId: 'cat-electronics',
    nameAr: 'طابعات',
    nameEn: 'Printers',
    slug: 'printers',
    descriptionAr: 'الطابعات بجميع أنواعها',
    unit: 'piece',
    qualityGrades: ['working', 'for_parts', 'scrap'],
    sortOrder: 4
  },
  
  // مواد قابلة للتدوير
  {
    id: 'mat-cardboard',
    categoryId: 'cat-recyclables',
    nameAr: 'كرتون',
    nameEn: 'Cardboard',
    slug: 'cardboard',
    descriptionAr: 'الكرتون المقوى والصناديق',
    unit: 'kg',
    qualityGrades: ['clean', 'mixed'],
    sortOrder: 1
  },
  {
    id: 'mat-paper-white',
    categoryId: 'cat-recyclables',
    nameAr: 'ورق أبيض',
    nameEn: 'White Paper',
    slug: 'paper-white',
    descriptionAr: 'الورق الأبيض والمكتبي',
    unit: 'kg',
    qualityGrades: ['clean', 'mixed'],
    sortOrder: 2
  },
  {
    id: 'mat-paper-newspaper',
    categoryId: 'cat-recyclables',
    nameAr: 'جرائد',
    nameEn: 'Newspaper',
    slug: 'newspaper',
    descriptionAr: 'الجرائد والمجلات القديمة',
    unit: 'kg',
    qualityGrades: ['standard'],
    sortOrder: 3
  },
  {
    id: 'mat-plastic-pet',
    categoryId: 'cat-recyclables',
    nameAr: 'بلاستيك PET',
    nameEn: 'PET Plastic',
    slug: 'plastic-pet',
    descriptionAr: 'زجاجات المياه والمشروبات',
    unit: 'kg',
    qualityGrades: ['clear', 'colored'],
    sortOrder: 4
  },
  {
    id: 'mat-plastic-soft',
    categoryId: 'cat-recyclables',
    nameAr: 'بلاستيك طري',
    nameEn: 'Soft Plastic',
    slug: 'plastic-soft',
    descriptionAr: 'أكياس وأغلفة البلاستيك',
    unit: 'kg',
    qualityGrades: ['clean', 'mixed'],
    sortOrder: 5
  },
  
  // أجهزة منزلية
  {
    id: 'mat-refrigerator',
    categoryId: 'cat-appliances',
    nameAr: 'ثلاجة',
    nameEn: 'Refrigerator',
    slug: 'refrigerator',
    descriptionAr: 'الثلاجات والفريزرات',
    unit: 'piece',
    qualityGrades: ['working', 'repairable', 'scrap'],
    sortOrder: 1
  },
  {
    id: 'mat-washing-machine',
    categoryId: 'cat-appliances',
    nameAr: 'غسالة',
    nameEn: 'Washing Machine',
    slug: 'washing-machine',
    descriptionAr: 'الغسالات بجميع أنواعها',
    unit: 'piece',
    qualityGrades: ['working', 'repairable', 'scrap'],
    sortOrder: 2
  },
  {
    id: 'mat-air-conditioner',
    categoryId: 'cat-appliances',
    nameAr: 'تكييف',
    nameEn: 'Air Conditioner',
    slug: 'air-conditioner',
    descriptionAr: 'أجهزة التكييف والتبريد',
    unit: 'piece',
    qualityGrades: ['working', 'repairable', 'scrap'],
    sortOrder: 3
  },
  {
    id: 'mat-microwave',
    categoryId: 'cat-appliances',
    nameAr: 'ميكروويف',
    nameEn: 'Microwave',
    slug: 'microwave',
    descriptionAr: 'أفران الميكروويف',
    unit: 'piece',
    qualityGrades: ['working', 'scrap'],
    sortOrder: 4
  }
];

// ============================================
// الأسعار الحالية (ديسمبر 2024)
// ============================================

const currentPrices = [
  // معادن حديدية
  { materialTypeId: 'mat-iron-mixed', qualityGrade: 'standard', pricePerKg: 40 },
  { materialTypeId: 'mat-iron-mixed', qualityGrade: 'premium', pricePerKg: 43 },
  { materialTypeId: 'mat-iron-mixed', qualityGrade: 'low', pricePerKg: 35 },
  { materialTypeId: 'mat-iron-premium', qualityGrade: 'standard', pricePerKg: 43 },
  { materialTypeId: 'mat-iron-premium', qualityGrade: 'premium', pricePerKg: 46 },
  { materialTypeId: 'mat-iron-rebar', qualityGrade: 'standard', pricePerKg: 40 },
  { materialTypeId: 'mat-iron-car', qualityGrade: 'standard', pricePerKg: 22 },
  { materialTypeId: 'mat-sheet-metal', qualityGrade: 'clean', pricePerKg: 34 },
  
  // معادن غير حديدية
  { materialTypeId: 'mat-copper-red-shiny', qualityGrade: 'shiny', pricePerKg: 588 },
  { materialTypeId: 'mat-copper-red-rough', qualityGrade: 'standard', pricePerKg: 529 },
  { materialTypeId: 'mat-copper-yellow', qualityGrade: 'clean', pricePerKg: 489 },
  { materialTypeId: 'mat-aluminium-soft', qualityGrade: 'clean', pricePerKg: 199 },
  { materialTypeId: 'mat-aluminium-cans', qualityGrade: 'pressed', pricePerKg: 166 },
  { materialTypeId: 'mat-aluminium-cans', qualityGrade: 'loose', pricePerKg: 157 },
  { materialTypeId: 'mat-stainless-304', qualityGrade: 'clean', pricePerKg: 90 },
  { materialTypeId: 'mat-stainless-304', qualityGrade: 'mixed', pricePerKg: 80 },
  { materialTypeId: 'mat-lead', qualityGrade: 'pure', pricePerKg: 93 },
  { materialTypeId: 'mat-lead', qualityGrade: 'battery', pricePerKg: 75 },
  
  // إلكترونيات (سعر القطعة)
  { materialTypeId: 'mat-mobile-phones', qualityGrade: 'working', pricePerKg: 200 },
  { materialTypeId: 'mat-mobile-phones', qualityGrade: 'scrap', pricePerKg: 50 },
  { materialTypeId: 'mat-laptops', qualityGrade: 'working', pricePerKg: 500 },
  { materialTypeId: 'mat-laptops', qualityGrade: 'scrap', pricePerKg: 150 },
  { materialTypeId: 'mat-computers', qualityGrade: 'scrap', pricePerKg: 100 },
  { materialTypeId: 'mat-printers', qualityGrade: 'scrap', pricePerKg: 50 },
  
  // مواد قابلة للتدوير
  { materialTypeId: 'mat-cardboard', qualityGrade: 'clean', pricePerKg: 10 },
  { materialTypeId: 'mat-cardboard', qualityGrade: 'mixed', pricePerKg: 8 },
  { materialTypeId: 'mat-paper-white', qualityGrade: 'clean', pricePerKg: 10 },
  { materialTypeId: 'mat-paper-newspaper', qualityGrade: 'standard', pricePerKg: 7 },
  { materialTypeId: 'mat-plastic-pet', qualityGrade: 'clear', pricePerKg: 38 },
  { materialTypeId: 'mat-plastic-soft', qualityGrade: 'clean', pricePerKg: 58 },
  
  // أجهزة منزلية (سعر القطعة)
  { materialTypeId: 'mat-refrigerator', qualityGrade: 'scrap', pricePerKg: 800 },
  { materialTypeId: 'mat-washing-machine', qualityGrade: 'scrap', pricePerKg: 500 },
  { materialTypeId: 'mat-air-conditioner', qualityGrade: 'scrap', pricePerKg: 700 },
  { materialTypeId: 'mat-microwave', qualityGrade: 'scrap', pricePerKg: 80 }
];

// ============================================
// مستخدمين للاختبار
// ============================================

const testUsers = [
  {
    id: 'user-test-individual',
    phone: '+201000000001',
    phoneVerified: true,
    name: 'أحمد محمد',
    userType: 'individual',
    addressGovernorate: 'القاهرة',
    addressCity: 'مدينة نصر',
    isVerified: true,
    isActive: true
  },
  {
    id: 'user-test-collector',
    phone: '+201000000002',
    phoneVerified: true,
    name: 'عم حسن',
    userType: 'collector',
    addressGovernorate: 'القاهرة',
    addressCity: 'منشأة ناصر',
    isVerified: true,
    isActive: true
  },
  {
    id: 'user-test-dealer',
    phone: '+201000000003',
    phoneVerified: true,
    name: 'الحاج صلاح',
    userType: 'dealer',
    addressGovernorate: 'القاهرة',
    addressCity: 'السبتية',
    isVerified: true,
    isActive: true
  },
  {
    id: 'user-test-company',
    phone: '+201000000004',
    phoneVerified: true,
    name: 'سارة أحمد',
    email: 'sara@company.com',
    userType: 'company',
    companyName: 'شركة النظافة الخضراء',
    commercialRegister: '12345',
    addressGovernorate: 'القاهرة',
    addressCity: 'وسط البلد',
    isVerified: true,
    isActive: true
  }
];

// ============================================
// جامع للاختبار
// ============================================

const testCollector = {
  id: 'collector-test-1',
  userId: 'user-test-collector',
  vehicleType: 'tricycle',
  vehicleCapacityKg: 500,
  serviceGovernorates: ['القاهرة', 'الجيزة'],
  serviceCities: ['مدينة نصر', 'مصر الجديدة', 'المعادي', 'الدقي'],
  serviceRadiusKm: 15,
  isAvailable: true,
  workingHours: {
    saturday: { start: '08:00', end: '18:00' },
    sunday: { start: '08:00', end: '18:00' },
    monday: { start: '08:00', end: '18:00' },
    tuesday: { start: '08:00', end: '18:00' },
    wednesday: { start: '08:00', end: '18:00' },
    thursday: { start: '08:00', end: '16:00' },
    friday: null
  },
  totalPickups: 150,
  totalWeightCollectedKg: 2500,
  avgRating: 4.8,
  completionRate: 95,
  isVerified: true,
  isActive: true
};

// ============================================
// تاجر للاختبار
// ============================================

const testDealer = {
  id: 'dealer-test-1',
  userId: 'user-test-dealer',
  businessName: 'مخازن الأمل للخردة',
  businessType: 'warehouse',
  specializations: ['iron', 'copper', 'aluminium'],
  addressGovernorate: 'القاهرة',
  addressCity: 'السبتية',
  addressStreet: 'شارع السبتية الرئيسي',
  addressLat: 30.0566,
  addressLng: 31.2262,
  phoneSecondary: '+201000000033',
  whatsapp: '+201000000003',
  workingHours: {
    saturday: { start: '08:00', end: '20:00' },
    sunday: { start: '08:00', end: '20:00' },
    monday: { start: '08:00', end: '20:00' },
    tuesday: { start: '08:00', end: '20:00' },
    wednesday: { start: '08:00', end: '20:00' },
    thursday: { start: '08:00', end: '18:00' },
    friday: { start: '14:00', end: '20:00' }
  },
  hasScale: true,
  scaleCapacityKg: 5000,
  hasLoadingEquipment: true,
  acceptsSmallQuantities: true,
  minQuantityKg: 10,
  offersPickup: true,
  pickupFeePerKm: 5,
  totalTransactions: 500,
  totalWeightKg: 150000,
  avgRating: 4.7,
  isVerified: true,
  isFeatured: true,
  isActive: true
};

// ============================================
// إعدادات النظام
// ============================================

const systemSettings = [
  {
    key: 'platform_margin_rate',
    value: { default: 0.15, min: 0.10, max: 0.25 },
    description: 'نسبة هامش المنصة من معاملات C2B'
  },
  {
    key: 'collector_payout_rate',
    value: { default: 0.50 },
    description: 'نسبة حصة الجامع من هامش المنصة'
  },
  {
    key: 'min_pickup_value',
    value: { amount: 50, currency: 'EGP' },
    description: 'الحد الأدنى لقيمة طلب الجمع'
  },
  {
    key: 'price_update_interval',
    value: { hours: 1 },
    description: 'فترة تحديث الأسعار'
  },
  {
    key: 'pickup_cancellation_fee',
    value: { amount: 20, afterAssignment: true },
    description: 'رسوم إلغاء طلب الجمع بعد تعيين جامع'
  },
  {
    key: 'supported_governorates',
    value: [
      'القاهرة', 'الجيزة', 'القليوبية', 'الإسكندرية',
      'الدقهلية', 'الشرقية', 'الغربية', 'المنوفية'
    ],
    description: 'المحافظات المدعومة حالياً'
  }
];

// ============================================
// دالة الـ Seed
// ============================================

async function main() {
  console.log('🌱 Starting seed...');

  // 1. إنشاء الفئات
  console.log('📁 Creating categories...');
  for (const category of materialCategories) {
    await prisma.materialCategory.upsert({
      where: { id: category.id },
      update: category,
      create: category
    });
  }

  // 2. إنشاء أنواع المواد
  console.log('📦 Creating material types...');
  for (const materialType of materialTypes) {
    await prisma.materialType.upsert({
      where: { id: materialType.id },
      update: materialType,
      create: materialType
    });
  }

  // 3. إنشاء الأسعار
  console.log('💰 Creating prices...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (const price of currentPrices) {
    await prisma.price.upsert({
      where: {
        materialTypeId_qualityGrade_governorate_effectiveDate: {
          materialTypeId: price.materialTypeId,
          qualityGrade: price.qualityGrade,
          governorate: null,
          effectiveDate: today
        }
      },
      update: { pricePerKg: price.pricePerKg },
      create: {
        materialTypeId: price.materialTypeId,
        qualityGrade: price.qualityGrade,
        pricePerKg: price.pricePerKg,
        pricePerTon: price.pricePerKg * 1000,
        source: 'manual',
        effectiveDate: today
      }
    });
  }

  // 4. إنشاء المستخدمين
  console.log('👥 Creating test users...');
  for (const user of testUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user
    });
  }

  // 5. إنشاء الجامع
  console.log('🚛 Creating test collector...');
  await prisma.collector.upsert({
    where: { id: testCollector.id },
    update: testCollector,
    create: testCollector
  });

  // 6. إنشاء التاجر
  console.log('🏪 Creating test dealer...');
  await prisma.dealer.upsert({
    where: { id: testDealer.id },
    update: testDealer,
    create: testDealer
  });

  // 7. إنشاء إعدادات النظام
  console.log('⚙️ Creating system settings...');
  for (const setting of systemSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting
    });
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export { materialCategories, materialTypes, currentPrices, testUsers };
