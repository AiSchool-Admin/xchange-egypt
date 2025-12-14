/**
 * @fileoverview بيانات تجريبية لسوق العقارات
 * @description Seed data للعقارات والأسعار والمقايضات
 * @author Xchange Real Estate
 * @version 1.0.0
 */

import { PrismaClient, PropertyType, PropertyStatus, FinishingLevel, FurnishedStatus, TitleType, PropertyVerificationLevel, PropertyListingType, PropertyDeliveryStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// Sample Data
// ============================================

const GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'التجمع الخامس',
  'الشيخ زايد',
  '6 أكتوبر',
  'مدينتي',
  'الرحاب',
  'المعادي',
  'الساحل الشمالي',
  'العين السخنة',
];

const CITIES: Record<string, string[]> = {
  'القاهرة': ['مدينة نصر', 'المعادي', 'مصر الجديدة', 'الزمالك', 'النزهة', 'عين شمس'],
  'الجيزة': ['الدقي', 'المهندسين', 'الهرم', 'فيصل', 'حدائق الأهرام'],
  'الإسكندرية': ['سموحة', 'الإبراهيمية', 'سيدي بشر', 'المندرة', 'ستانلي'],
  'التجمع الخامس': ['الأندلس', 'البنفسج', 'اللوتس', 'النرجس', 'الياسمين'],
  'الشيخ زايد': ['الحي الأول', 'الحي الثاني', 'الحي السابع', 'بيفرلي هيلز'],
  '6 أكتوبر': ['الحي الأول', 'الحي الثاني', 'الحي المتميز', 'المحور المركزي'],
  'مدينتي': ['B1', 'B2', 'B5', 'B7', 'B10'],
  'الرحاب': ['المرحلة الأولى', 'المرحلة الثانية', 'السوق'],
  'المعادي': ['دجلة', 'سرايات المعادي', 'المعادي الجديدة', 'زهراء المعادي'],
  'الساحل الشمالي': ['مراسي', 'هاسيندا باي', 'بو آيلاند', 'العلمين الجديدة'],
  'العين السخنة': ['بورتو السخنة', 'لا فيستا', 'كانكون'],
};

const COMPOUNDS: Record<string, string[]> = {
  'التجمع الخامس': ['ماونتن فيو', 'هايد بارك', 'بالم هيلز', 'ليك فيو', 'ميفيدا'],
  'الشيخ زايد': ['الربوة', 'صن كابيتال', 'أليجريا', 'ذا إستيتس'],
  '6 أكتوبر': ['دريم لاند', 'بالم بارك', 'جاردينيا'],
  'الساحل الشمالي': ['مراسي', 'هاسيندا باي', 'سولت', 'أزها'],
};

const PROPERTY_TITLES = [
  'شقة فاخرة بموقع متميز',
  'فيلا مستقلة بحديقة خاصة',
  'دوبلكس بإطلالة رائعة',
  'بنتهاوس بتراس واسع',
  'ستوديو مفروش بالكامل',
  'شاليه على البحر مباشرة',
  'تاون هاوس في كمبوند راقي',
  'شقة بحري تشطيب سوبر لوكس',
  'فيلا توين هاوس',
  'شقة أرضي بحديقة',
  'روف جاردن مميز',
  'شقة استلام فوري',
  'فيلا للبيع بالتقسيط',
  'شقة قريبة من الخدمات',
  'بنتهاوس دور كامل',
];

const FEATURES = [
  'parking',
  'elevator',
  'garden',
  'pool',
  'security',
  'gym',
  'balcony',
  'central_ac',
  'storage',
  'maid_room',
  'driver_room',
  'smart_home',
  'rooftop',
  'private_entrance',
  'corner_unit',
];

// ============================================
// Helper Functions
// ============================================

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomSubset<T>(arr: T[], min: number, max: number): T[] {
  const count = randomInt(min, max);
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateDescription(propertyType: PropertyType, area: number, governorate: string): string {
  const descriptions = [
    `${propertyType === 'APARTMENT' ? 'شقة' : propertyType === 'VILLA' ? 'فيلا' : 'عقار'} رائعة بمساحة ${area} متر مربع في ${governorate}`,
    `فرصة استثمارية ممتازة - ${area} متر في أفضل موقع بـ${governorate}`,
    `عقار مميز للبيع - موقع حيوي وقريب من الخدمات`,
    `تشطيب فاخر وموقع استراتيجي - لا تفوت الفرصة`,
  ];
  return randomElement(descriptions);
}

// ============================================
// Price Data
// ============================================

async function seedPropertyPrices() {
  console.log('🏠 Seeding property prices...');

  const priceData = [
    // القاهرة والجيزة
    { governorate: 'القاهرة', city: 'مدينة نصر', propertyType: 'APARTMENT', avgPrice: 22000 },
    { governorate: 'القاهرة', city: 'المعادي', propertyType: 'APARTMENT', avgPrice: 28000 },
    { governorate: 'القاهرة', city: 'مصر الجديدة', propertyType: 'APARTMENT', avgPrice: 25000 },
    { governorate: 'القاهرة', city: 'الزمالك', propertyType: 'APARTMENT', avgPrice: 45000 },
    { governorate: 'الجيزة', city: 'الدقي', propertyType: 'APARTMENT', avgPrice: 30000 },
    { governorate: 'الجيزة', city: 'المهندسين', propertyType: 'APARTMENT', avgPrice: 32000 },
    // المدن الجديدة
    { governorate: 'التجمع الخامس', city: null, propertyType: 'APARTMENT', avgPrice: 35000 },
    { governorate: 'التجمع الخامس', city: null, propertyType: 'VILLA', avgPrice: 45000 },
    { governorate: 'الشيخ زايد', city: null, propertyType: 'APARTMENT', avgPrice: 32000 },
    { governorate: 'الشيخ زايد', city: null, propertyType: 'VILLA', avgPrice: 40000 },
    { governorate: '6 أكتوبر', city: null, propertyType: 'APARTMENT', avgPrice: 25000 },
    { governorate: 'مدينتي', city: null, propertyType: 'APARTMENT', avgPrice: 28000 },
    { governorate: 'الرحاب', city: null, propertyType: 'APARTMENT', avgPrice: 26000 },
    // المناطق الساحلية
    { governorate: 'الساحل الشمالي', city: null, propertyType: 'CHALET', avgPrice: 50000 },
    { governorate: 'العين السخنة', city: null, propertyType: 'CHALET', avgPrice: 45000 },
    { governorate: 'الإسكندرية', city: 'سموحة', propertyType: 'APARTMENT', avgPrice: 18000 },
  ];

  for (const data of priceData) {
    const variance = 0.15;
    const low = data.avgPrice * (1 - variance);
    const high = data.avgPrice * (1 + variance);

    await prisma.propertyPrice.upsert({
      where: {
        governorate_city_district_compoundName_propertyType: {
          governorate: data.governorate,
          city: data.city || '',
          district: '',
          compoundName: '',
          propertyType: data.propertyType as PropertyType,
        },
      },
      update: {
        pricePerSqmAvg: data.avgPrice,
        pricePerSqmLow: low,
        pricePerSqmHigh: high,
        rentalYieldAvg: randomFloat(0.05, 0.08),
        priceChangeMonthly: randomFloat(-2, 5),
        priceChangeYearly: randomFloat(5, 20),
        sampleSize: randomInt(50, 200),
        recordedAt: new Date(),
      },
      create: {
        governorate: data.governorate,
        city: data.city,
        propertyType: data.propertyType as PropertyType,
        pricePerSqmAvg: data.avgPrice,
        pricePerSqmLow: low,
        pricePerSqmHigh: high,
        rentalYieldAvg: randomFloat(0.05, 0.08),
        priceChangeMonthly: randomFloat(-2, 5),
        priceChangeYearly: randomFloat(5, 20),
        sampleSize: randomInt(50, 200),
      },
    });
  }

  console.log(`✅ Created ${priceData.length} price records`);
}

// ============================================
// Properties Seed
// ============================================

async function seedProperties(userIds: string[]) {
  console.log('🏠 Seeding properties...');

  const properties = [];

  for (let i = 0; i < 100; i++) {
    const governorate = randomElement(GOVERNORATES);
    const cities = CITIES[governorate] || [];
    const city = cities.length > 0 ? randomElement(cities) : null;
    const compounds = COMPOUNDS[governorate] || [];
    const compound = compounds.length > 0 && Math.random() > 0.5 ? randomElement(compounds) : null;

    const propertyType = randomElement([
      'APARTMENT', 'APARTMENT', 'APARTMENT', // أكثر شيوعاً
      'VILLA', 'DUPLEX', 'PENTHOUSE', 'STUDIO', 'CHALET', 'TOWNHOUSE',
    ]) as PropertyType;

    const area = propertyType === 'VILLA' ? randomInt(200, 500) :
                 propertyType === 'PENTHOUSE' ? randomInt(180, 350) :
                 propertyType === 'STUDIO' ? randomInt(35, 60) :
                 propertyType === 'CHALET' ? randomInt(80, 150) :
                 randomInt(80, 250);

    const pricePerMeter = randomInt(15000, 50000);
    const price = area * pricePerMeter;

    const bedrooms = propertyType === 'STUDIO' ? 0 :
                     propertyType === 'VILLA' ? randomInt(4, 7) :
                     randomInt(1, 4);

    const bathrooms = propertyType === 'STUDIO' ? 1 :
                      propertyType === 'VILLA' ? randomInt(3, 6) :
                      randomInt(1, 3);

    const floor = propertyType === 'VILLA' ? 0 :
                  propertyType === 'PENTHOUSE' ? randomInt(8, 15) :
                  randomInt(0, 12);

    const features = randomSubset(FEATURES, 2, 7);

    const status = randomElement([
      PropertyStatus.ACTIVE, PropertyStatus.ACTIVE, PropertyStatus.ACTIVE, // أكثر
      PropertyStatus.SOLD, PropertyStatus.RENTED,
    ]);

    const listingType = randomElement([
      PropertyListingType.SALE, PropertyListingType.SALE, // أكثر
      PropertyListingType.RENT,
    ]);

    const finishingLevel = randomElement([
      FinishingLevel.SUPER_LUX, FinishingLevel.LUX, FinishingLevel.FINISHED,
      FinishingLevel.SEMI_FINISHED,
    ]);

    const furnished = randomElement([
      FurnishedStatus.UNFURNISHED, FurnishedStatus.UNFURNISHED,
      FurnishedStatus.SEMI_FURNISHED, FurnishedStatus.FURNISHED,
    ]);

    const verificationLevel = randomElement([
      PropertyVerificationLevel.UNVERIFIED,
      PropertyVerificationLevel.DOCUMENTS_VERIFIED,
      PropertyVerificationLevel.LOCATION_VERIFIED,
      PropertyVerificationLevel.GOVERNMENT_VERIFIED,
    ]);

    const openForBarter = Math.random() > 0.7;

    properties.push({
      ownerId: randomElement(userIds),
      title: randomElement(PROPERTY_TITLES),
      titleAr: randomElement(PROPERTY_TITLES),
      description: generateDescription(propertyType, area, governorate),
      descriptionAr: generateDescription(propertyType, area, governorate),
      propertyType,
      governorate,
      city,
      district: null,
      compoundName: compound,
      address: `شارع ${randomInt(1, 100)} - ${governorate}`,
      latitude: 30 + randomFloat(-1, 1),
      longitude: 31 + randomFloat(-1, 1),
      areaSqm: area,
      gardenArea: propertyType === 'VILLA' ? randomInt(50, 200) : null,
      roofArea: propertyType === 'PENTHOUSE' ? randomInt(30, 100) : null,
      bedrooms,
      bathrooms,
      floorNumber: floor,
      totalFloors: randomInt(floor + 1, 15),
      finishingLevel,
      furnished,
      amenities: Object.fromEntries(features.map(f => [f, true])),
      listingType,
      salePrice: listingType === PropertyListingType.SALE ? price : null,
      pricePerSqm: listingType === PropertyListingType.SALE ? pricePerMeter : null,
      priceNegotiable: Math.random() > 0.3,
      rentPrice: listingType === PropertyListingType.RENT ? randomInt(5000, 30000) : null,
      rentPeriod: listingType === PropertyListingType.RENT ? 'monthly' : null,
      installmentAvailable: Math.random() > 0.5,
      installmentYears: Math.random() > 0.5 ? randomInt(3, 10) : null,
      downPaymentPercent: Math.random() > 0.5 ? randomInt(10, 30) : null,
      deliveryStatus: randomElement([
        PropertyDeliveryStatus.READY, PropertyDeliveryStatus.READY,
        PropertyDeliveryStatus.UNDER_CONSTRUCTION, PropertyDeliveryStatus.OFF_PLAN,
      ]),
      titleType: randomElement([TitleType.FINAL, TitleType.PRELIMINARY]),
      verificationLevel,
      openForBarter,
      barterPreferences: openForBarter ? {
        acceptsCash: true,
        maxCashDiff: price * 0.2,
        seekingType: 'PROPERTY',
        preferredGovernorate: governorate,
      } : null,
      status,
      featured: Math.random() > 0.9,
      viewsCount: randomInt(0, 500),
      favoritesCount: randomInt(0, 50),
      images: [
        { url: `https://picsum.photos/seed/${i}-1/800/600`, isPrimary: true },
        { url: `https://picsum.photos/seed/${i}-2/800/600`, isPrimary: false },
        { url: `https://picsum.photos/seed/${i}-3/800/600`, isPrimary: false },
      ],
      estimatedValue: price,
    });
  }

  let created = 0;
  for (const prop of properties) {
    try {
      await prisma.property.create({ data: prop });
      created++;
    } catch (error) {
      console.error('Error creating property:', error);
    }
  }

  console.log(`✅ Created ${created} properties`);
  return created;
}

// ============================================
// Test Users
// ============================================

async function getOrCreateTestUsers(): Promise<string[]> {
  console.log('👤 Getting/Creating test users...');

  // البحث عن مستخدمين موجودين
  const existingUsers = await prisma.user.findMany({
    take: 10,
    select: { id: true },
  });

  if (existingUsers.length >= 5) {
    console.log(`✅ Found ${existingUsers.length} existing users`);
    return existingUsers.map(u => u.id);
  }

  // إنشاء مستخدمين جدد
  const testUsers = [];
  const arabicNames = [
    'أحمد محمد', 'محمد علي', 'سارة أحمد', 'نورهان حسن', 'كريم عبدالله',
    'ياسمين محمود', 'عمر خالد', 'فاطمة إبراهيم', 'مصطفى سعيد', 'هدى عبدالرحمن',
  ];

  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: `realestate_test${i + 1}@xchange.com`,
        passwordHash: '$2b$10$example_hash_for_testing',
        fullName: arabicNames[i],
        phone: `0100000000${i}`,
        userType: i < 2 ? 'BUSINESS' : 'INDIVIDUAL',
        status: 'ACTIVE',
        emailVerified: true,
        phoneVerified: true,
        governorate: randomElement(GOVERNORATES),
        rating: randomFloat(3.5, 5),
        totalReviews: randomInt(0, 50),
      },
    });
    testUsers.push(user.id);
  }

  console.log(`✅ Created ${testUsers.length} test users`);
  return testUsers;
}

// ============================================
// Main Seed Function
// ============================================

export async function seedRealEstate() {
  console.log('🚀 Starting Real Estate seed...\n');

  try {
    // 1. إنشاء/الحصول على مستخدمين
    const userIds = await getOrCreateTestUsers();

    // 2. إضافة بيانات الأسعار
    await seedPropertyPrices();

    // 3. إضافة العقارات
    await seedProperties(userIds);

    console.log('\n✅ Real Estate seed completed successfully!');
  } catch (error) {
    console.error('❌ Error in Real Estate seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// ============================================
// Run if called directly
// ============================================

if (require.main === module) {
  seedRealEstate()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedRealEstate;
