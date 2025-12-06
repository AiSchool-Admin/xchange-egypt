/**
 * Seed Data for Smart Matching Tests
 * بيانات أولية لاختبارات التوافق الذكي
 *
 * Creates test scenarios for:
 * 1. Perfect Barter Matches (A wants B, B wants A)
 * 2. Geographic Proximity Matching (DISTRICT > CITY > GOVERNORATE)
 * 3. Supply-Demand Matching (Sellers ↔ Buyers)
 * 4. Multi-party Chain Matching (A→B→C→A)
 * 5. Category and Keyword Matching
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TestUser {
  id: string;
  email: string;
  fullName: string;
  governorate: string;
  city: string;
  district: string;
}

interface TestCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
}

export const seedMatchingTestData = async () => {
  console.log('🌱 Seeding matching test data...');

  // ============================================
  // 1. Create Test Categories
  // ============================================
  const categories: TestCategory[] = [];

  const categoryData = [
    { nameEn: 'Electronics', nameAr: 'إلكترونيات', slug: 'electronics', icon: '📱' },
    { nameEn: 'Furniture', nameAr: 'أثاث', slug: 'furniture', icon: '🛋️' },
    { nameEn: 'Vehicles', nameAr: 'سيارات', slug: 'vehicles', icon: '🚗' },
    { nameEn: 'Clothing', nameAr: 'ملابس', slug: 'clothing', icon: '👕' },
    { nameEn: 'Sports', nameAr: 'رياضة', slug: 'sports', icon: '⚽' },
    { nameEn: 'Books', nameAr: 'كتب', slug: 'books', icon: '📚' },
  ];

  for (const cat of categoryData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        nameEn: cat.nameEn,
        nameAr: cat.nameAr,
        slug: cat.slug,
        icon: cat.icon,
        level: 1,
        isActive: true,
      },
    });
    categories.push({
      id: category.id,
      nameEn: cat.nameEn,
      nameAr: cat.nameAr,
      slug: cat.slug,
    });
  }

  console.log(`✅ Created ${categories.length} categories`);

  // ============================================
  // 2. Create Test Users with Different Locations
  // ============================================
  const users: TestUser[] = [];

  const userData = [
    // Cairo - Nasr City - District 1 (Same district group)
    { email: 'ahmed@test.com', fullName: 'أحمد محمد', governorate: 'القاهرة', city: 'مدينة نصر', district: 'الحي الأول' },
    { email: 'sara@test.com', fullName: 'سارة علي', governorate: 'القاهرة', city: 'مدينة نصر', district: 'الحي الأول' },
    // Cairo - Nasr City - District 2 (Same city, different district)
    { email: 'omar@test.com', fullName: 'عمر حسن', governorate: 'القاهرة', city: 'مدينة نصر', district: 'الحي الثاني' },
    { email: 'mona@test.com', fullName: 'منى إبراهيم', governorate: 'القاهرة', city: 'مدينة نصر', district: 'الحي الثالث' },
    // Cairo - Heliopolis (Same governorate, different city)
    { email: 'khaled@test.com', fullName: 'خالد أحمد', governorate: 'القاهرة', city: 'مصر الجديدة', district: 'روكسي' },
    { email: 'fatma@test.com', fullName: 'فاطمة يوسف', governorate: 'القاهرة', city: 'المعادي', district: 'المعادي الجديدة' },
    // Alexandria (Different governorate)
    { email: 'hassan@test.com', fullName: 'حسن سعيد', governorate: 'الإسكندرية', city: 'سيدي جابر', district: 'الكورنيش' },
    { email: 'amal@test.com', fullName: 'أمل محمود', governorate: 'الإسكندرية', city: 'سموحة', district: 'شارع فوزي معاذ' },
    // Giza
    { email: 'mahmoud@test.com', fullName: 'محمود عبدالله', governorate: 'الجيزة', city: 'الدقي', district: 'ميدان المساحة' },
    { email: 'nadia@test.com', fullName: 'نادية حسين', governorate: 'الجيزة', city: 'الهرم', district: 'شارع الأهرام' },
  ];

  for (const user of userData) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        passwordHash: '$2b$10$testHash123456789012345678901234567890123456789012',
        fullName: user.fullName,
        phone: `+2010${Math.floor(10000000 + Math.random() * 90000000)}`,
        userType: 'INDIVIDUAL',
        status: 'ACTIVE',
        emailVerified: true,
        phoneVerified: true,
        governorate: user.governorate,
        city: user.city,
        district: user.district,
      },
    });
    users.push({
      id: created.id,
      email: user.email,
      fullName: user.fullName,
      governorate: user.governorate,
      city: user.city,
      district: user.district,
    });
  }

  console.log(`✅ Created ${users.length} users`);

  // Get category IDs
  const electronicsId = categories.find(c => c.slug === 'electronics')!.id;
  const furnitureId = categories.find(c => c.slug === 'furniture')!.id;
  const vehiclesId = categories.find(c => c.slug === 'vehicles')!.id;
  const clothingId = categories.find(c => c.slug === 'clothing')!.id;
  const sportsId = categories.find(c => c.slug === 'sports')!.id;
  const booksId = categories.find(c => c.slug === 'books')!.id;

  // Get user IDs
  const ahmed = users.find(u => u.email === 'ahmed@test.com')!;
  const sara = users.find(u => u.email === 'sara@test.com')!;
  const omar = users.find(u => u.email === 'omar@test.com')!;
  const mona = users.find(u => u.email === 'mona@test.com')!;
  const khaled = users.find(u => u.email === 'khaled@test.com')!;
  const fatma = users.find(u => u.email === 'fatma@test.com')!;
  const hassan = users.find(u => u.email === 'hassan@test.com')!;
  const amal = users.find(u => u.email === 'amal@test.com')!;
  const mahmoud = users.find(u => u.email === 'mahmoud@test.com')!;
  const nadia = users.find(u => u.email === 'nadia@test.com')!;

  // ============================================
  // 3. Create Test Items - Perfect Barter Match Scenario
  // Ahmed has iPhone, wants MacBook
  // Sara has MacBook, wants iPhone
  // Both in same district → Perfect Match!
  // ============================================

  // Ahmed's iPhone (BARTER) - wants MacBook
  await prisma.item.create({
    data: {
      sellerId: ahmed.id,
      title: 'iPhone 15 Pro Max - 256GB',
      description: 'هاتف آيفون 15 برو ماكس بحالة ممتازة، لون أسود تيتانيوم',
      categoryId: electronicsId,
      listingType: 'BARTER',
      condition: 'EXCELLENT',
      estimatedValue: 55000,
      images: ['https://example.com/iphone.jpg'],
      governorate: ahmed.governorate,
      city: ahmed.city,
      district: ahmed.district,
      desiredCategoryId: electronicsId,
      desiredItemTitle: 'MacBook',
      desiredKeywords: 'macbook,ماك بوك,لابتوب,apple,أبل',
      desiredValueMin: 40000,
      desiredValueMax: 70000,
      status: 'ACTIVE',
    },
  });

  // Sara's MacBook (BARTER) - wants iPhone
  await prisma.item.create({
    data: {
      sellerId: sara.id,
      title: 'MacBook Pro 14 M3 - ماك بوك برو',
      description: 'لابتوب ماك بوك برو 14 انش بمعالج M3، رام 16 جيجا',
      categoryId: electronicsId,
      listingType: 'BARTER',
      condition: 'EXCELLENT',
      estimatedValue: 60000,
      images: ['https://example.com/macbook.jpg'],
      governorate: sara.governorate,
      city: sara.city,
      district: sara.district,
      desiredCategoryId: electronicsId,
      desiredItemTitle: 'iPhone',
      desiredKeywords: 'iphone,آيفون,هاتف,apple,أبل,موبايل',
      desiredValueMin: 45000,
      desiredValueMax: 65000,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Created Perfect Barter Match scenario (Ahmed ↔ Sara)');

  // ============================================
  // 4. Geographic Proximity Test Items
  // Same item type, different locations
  // ============================================

  // Omar (same city as Ahmed, different district) - selling PS5
  await prisma.item.create({
    data: {
      sellerId: omar.id,
      title: 'PlayStation 5 مع ألعاب',
      description: 'بلايستيشن 5 ديجيتال مع 3 ألعاب وذراعين',
      categoryId: electronicsId,
      listingType: 'DIRECT_SALE',
      condition: 'GOOD',
      estimatedValue: 25000,
      images: ['https://example.com/ps5.jpg'],
      governorate: omar.governorate,
      city: omar.city,
      district: omar.district,
      status: 'ACTIVE',
    },
  });

  // Khaled (same governorate, different city) - wants PS5
  await prisma.item.create({
    data: {
      sellerId: khaled.id,
      title: 'مطلوب PlayStation 5',
      description: 'أبحث عن بلايستيشن 5 بحالة جيدة',
      categoryId: electronicsId,
      listingType: 'DIRECT_BUY',
      condition: 'GOOD',
      estimatedValue: 23000,
      images: [],
      governorate: khaled.governorate,
      city: khaled.city,
      district: khaled.district,
      desiredKeywords: 'playstation,ps5,بلايستيشن,سوني',
      desiredValueMax: 26000,
      status: 'ACTIVE',
    },
  });

  // Hassan (different governorate) - also wants PS5
  await prisma.item.create({
    data: {
      sellerId: hassan.id,
      title: 'مطلوب PS5 في الإسكندرية',
      description: 'أريد بلايستيشن 5 جديد أو مستعمل',
      categoryId: electronicsId,
      listingType: 'DIRECT_BUY',
      condition: 'GOOD',
      estimatedValue: 24000,
      images: [],
      governorate: hassan.governorate,
      city: hassan.city,
      district: hassan.district,
      desiredKeywords: 'playstation,ps5,بلايستيشن,سوني',
      desiredValueMax: 27000,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Created Geographic Proximity Test items');

  // ============================================
  // 5. Multi-Party Barter Chain Scenario
  // A wants B, B wants C, C wants A
  // ============================================

  // Mona has furniture, wants vehicle parts
  await prisma.item.create({
    data: {
      sellerId: mona.id,
      title: 'طقم صالون كلاسيك',
      description: 'طقم صالون 7 قطع خشب زان بحالة ممتازة',
      categoryId: furnitureId,
      listingType: 'BARTER',
      condition: 'EXCELLENT',
      estimatedValue: 35000,
      images: ['https://example.com/salon.jpg'],
      governorate: mona.governorate,
      city: mona.city,
      district: mona.district,
      desiredCategoryId: vehiclesId,
      desiredItemTitle: 'قطع غيار سيارة',
      desiredKeywords: 'قطع غيار,سيارة,موتور,vehicle,parts',
      status: 'ACTIVE',
    },
  });

  // Fatma has vehicle parts, wants sports equipment
  await prisma.item.create({
    data: {
      sellerId: fatma.id,
      title: 'موتور سيارة تويوتا',
      description: 'موتور تويوتا كامري 2019 بحالة جيدة',
      categoryId: vehiclesId,
      listingType: 'BARTER',
      condition: 'GOOD',
      estimatedValue: 40000,
      images: ['https://example.com/engine.jpg'],
      governorate: fatma.governorate,
      city: fatma.city,
      district: fatma.district,
      desiredCategoryId: sportsId,
      desiredItemTitle: 'أدوات رياضية',
      desiredKeywords: 'رياضة,جيم,أثقال,treadmill,مشاية',
      status: 'ACTIVE',
    },
  });

  // Mahmoud has sports equipment, wants furniture
  await prisma.item.create({
    data: {
      sellerId: mahmoud.id,
      title: 'جهاز جري كهربائي وأثقال',
      description: 'تريدميل مشاية كهربائية + مجموعة أثقال حديد',
      categoryId: sportsId,
      listingType: 'BARTER',
      condition: 'GOOD',
      estimatedValue: 30000,
      images: ['https://example.com/gym.jpg'],
      governorate: mahmoud.governorate,
      city: mahmoud.city,
      district: mahmoud.district,
      desiredCategoryId: furnitureId,
      desiredItemTitle: 'أثاث صالون',
      desiredKeywords: 'أثاث,صالون,كنب,furniture,salon',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Created Multi-Party Barter Chain scenario (Mona→Fatma→Mahmoud→Mona)');

  // ============================================
  // 6. Supply-Demand Matching (Direct Sale ↔ Direct Buy)
  // ============================================

  // Amal selling books
  await prisma.item.create({
    data: {
      sellerId: amal.id,
      title: 'مجموعة كتب برمجة وتقنية',
      description: 'مجموعة من 10 كتب في البرمجة وعلوم الحاسب',
      categoryId: booksId,
      listingType: 'DIRECT_SALE',
      condition: 'EXCELLENT',
      estimatedValue: 1500,
      images: ['https://example.com/books.jpg'],
      governorate: amal.governorate,
      city: amal.city,
      district: amal.district,
      status: 'ACTIVE',
    },
  });

  // Nadia wants books
  await prisma.item.create({
    data: {
      sellerId: nadia.id,
      title: 'مطلوب كتب برمجة',
      description: 'أبحث عن كتب في تعلم البرمجة',
      categoryId: booksId,
      listingType: 'DIRECT_BUY',
      condition: 'GOOD',
      estimatedValue: 2000,
      images: [],
      governorate: nadia.governorate,
      city: nadia.city,
      district: nadia.district,
      desiredKeywords: 'كتب,برمجة,تقنية,programming,books',
      desiredValueMax: 2500,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Created Supply-Demand Matching scenario');

  // ============================================
  // 7. Clothing Category Tests (Value Range Matching)
  // ============================================

  // Omar selling jacket at 500 EGP
  await prisma.item.create({
    data: {
      sellerId: omar.id,
      title: 'جاكيت جلد أصلي',
      description: 'جاكيت جلد طبيعي مقاس L بحالة ممتازة',
      categoryId: clothingId,
      listingType: 'DIRECT_SALE',
      condition: 'EXCELLENT',
      estimatedValue: 500,
      images: ['https://example.com/jacket.jpg'],
      governorate: omar.governorate,
      city: omar.city,
      district: omar.district,
      status: 'ACTIVE',
    },
  });

  // Mona wants jacket around that price range
  await prisma.item.create({
    data: {
      sellerId: mona.id,
      title: 'مطلوب جاكيت جلد',
      description: 'أبحث عن جاكيت جلد مقاس L أو XL',
      categoryId: clothingId,
      listingType: 'DIRECT_BUY',
      condition: 'GOOD',
      estimatedValue: 600,
      images: [],
      governorate: mona.governorate,
      city: mona.city,
      district: mona.district,
      desiredKeywords: 'جاكيت,جلد,leather,jacket',
      desiredValueMin: 300,
      desiredValueMax: 800,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Created Value Range Matching scenario');

  // ============================================
  // Summary
  // ============================================
  console.log('\n📊 Matching Test Data Summary:');
  console.log('==============================');
  console.log(`Categories: ${categories.length}`);
  console.log(`Users: ${users.length}`);
  console.log('Test Scenarios:');
  console.log('  ✓ Perfect Barter Match (Ahmed ↔ Sara, same district)');
  console.log('  ✓ Geographic Proximity (PS5 sellers/buyers across locations)');
  console.log('  ✓ Multi-Party Chain (Mona→Fatma→Mahmoud furniture↔vehicle↔sports)');
  console.log('  ✓ Supply-Demand (Amal books → Nadia)');
  console.log('  ✓ Value Range Matching (jacket price tolerance)');
  console.log('==============================\n');

  return {
    categories,
    users,
    ahmed,
    sara,
    omar,
    mona,
    khaled,
    fatma,
    hassan,
    amal,
    mahmoud,
    nadia,
  };
};

// Run if executed directly
if (require.main === module) {
  seedMatchingTestData()
    .then(() => {
      console.log('✅ Matching test data seeded successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error seeding matching test data:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

export default seedMatchingTestData;
