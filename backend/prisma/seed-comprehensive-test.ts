/**
 * =====================================================
 * COMPREHENSIVE TEST DATA SEED
 * سيناريوهات اختبار شاملة - 10 مستخدمين
 * =====================================================
 *
 * يقوم هذا الملف بإنشاء:
 * - 10 حسابات اختبار
 * - منتجات متنوعة لكل مستخدم
 * - عقارات، سيارات، ذهب، موبايلات
 * - بيانات للمزادات والمقايضات
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

async function seedComprehensiveTestData() {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('         🧪 COMPREHENSIVE TEST DATA SEED - 20 SCENARIOS            ');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('\n');

  const hashedPassword = await hashPassword('Test@1234');

  // =====================================================
  // 1. CREATE 10 TEST USERS
  // =====================================================
  console.log('📦 Creating 10 Test Users...\n');

  const testUsers = [
    {
      email: 'test1@xchange.eg',
      password: hashedPassword,
      fullName: 'أحمد التاجر',
      phone: '+201111111111',
      accountType: 'BUSINESS',
      businessName: 'متجر أحمد للإلكترونيات',
      governorate: 'Cairo',
      city: 'Nasr City',
      address: '15 شارع عباس العقاد، مدينة نصر',
      isVerified: true,
      bio: 'تاجر إلكترونيات معتمد - خبرة 10 سنوات',
    },
    {
      email: 'test2@xchange.eg',
      password: hashedPassword,
      fullName: 'سارة المقايضة',
      phone: '+201222222222',
      accountType: 'INDIVIDUAL',
      governorate: 'Alexandria',
      city: 'Smouha',
      address: '25 شارع فوزي معاذ، سموحة',
      isVerified: true,
      bio: 'متخصصة في المقايضات الذكية',
    },
    {
      email: 'test3@xchange.eg',
      password: hashedPassword,
      fullName: 'محمد المزادات',
      phone: '+201333333333',
      accountType: 'INDIVIDUAL',
      governorate: 'Giza',
      city: 'Dokki',
      address: '8 شارع التحرير، الدقي',
      isVerified: true,
      bio: 'خبير مزادات ومقتنيات نادرة',
    },
    {
      email: 'test4@xchange.eg',
      password: hashedPassword,
      fullName: 'فاطمة الخردة',
      phone: '+201444444444',
      accountType: 'BUSINESS',
      businessName: 'مؤسسة الخردة الذهبية',
      governorate: 'Cairo',
      city: 'Shubra',
      address: '120 شارع شبرا الرئيسي',
      isVerified: true,
      bio: 'متخصصون في شراء وبيع الخردة والمعادن',
    },
    {
      email: 'test5@xchange.eg',
      password: hashedPassword,
      fullName: 'كريم الفاخر',
      phone: '+201555555555',
      accountType: 'INDIVIDUAL',
      governorate: 'Cairo',
      city: 'Zamalek',
      address: '5 شارع البرازيل، الزمالك',
      isVerified: true,
      bio: 'جامع للتحف والسلع الفاخرة',
    },
    {
      email: 'test6@xchange.eg',
      password: hashedPassword,
      fullName: 'نورهان العقارية',
      phone: '+201666666666',
      accountType: 'BUSINESS',
      businessName: 'نورهان للتطوير العقاري',
      governorate: 'Cairo',
      city: 'New Cairo',
      address: '10 التجمع الخامس',
      isVerified: true,
      bio: 'وسيط عقاري معتمد - عقارات فاخرة',
    },
    {
      email: 'test7@xchange.eg',
      password: hashedPassword,
      fullName: 'ياسر السيارات',
      phone: '+201777777777',
      accountType: 'BUSINESS',
      businessName: 'معرض ياسر للسيارات',
      governorate: 'Giza',
      city: '6th of October',
      address: 'محور 26 يوليو، 6 أكتوبر',
      isVerified: true,
      bio: 'معرض سيارات جديدة ومستعملة',
    },
    {
      email: 'test8@xchange.eg',
      password: hashedPassword,
      fullName: 'منى الذهب',
      phone: '+201888888888',
      accountType: 'BUSINESS',
      businessName: 'مجوهرات منى',
      governorate: 'Cairo',
      city: 'Heliopolis',
      address: 'شارع الحجاز، مصر الجديدة',
      isVerified: true,
      bio: 'صائغة معتمدة - ذهب وفضة ومجوهرات',
    },
    {
      email: 'test9@xchange.eg',
      password: hashedPassword,
      fullName: 'عمر الموبايلات',
      phone: '+201999999999',
      accountType: 'INDIVIDUAL',
      governorate: 'Cairo',
      city: 'Maadi',
      address: 'شارع 9، المعادي',
      isVerified: true,
      bio: 'متخصص في بيع وشراء الموبايلات',
    },
    {
      email: 'test10@xchange.eg',
      password: hashedPassword,
      fullName: 'هدى المشتريات',
      phone: '+201000000000',
      accountType: 'INDIVIDUAL',
      governorate: 'Alexandria',
      city: 'Mandara',
      address: 'شارع الجيش، المندرة',
      isVerified: true,
      bio: 'مشتري نشط يبحث عن أفضل العروض',
    },
  ];

  const createdUsers: any[] = [];

  for (const userData of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: { password: hashedPassword },
      create: userData as any,
    });
    createdUsers.push(user);
    console.log(`   ✅ ${user.fullName} (${user.email})`);
  }

  // Get users by index
  const [
    ahmed,    // test1 - إلكترونيات
    sara,     // test2 - مقايضات
    mohamed,  // test3 - مزادات
    fatma,    // test4 - خردة
    karim,    // test5 - فاخر
    nourhan,  // test6 - عقارات
    yasser,   // test7 - سيارات
    mona,     // test8 - ذهب
    omar,     // test9 - موبايلات
    huda,     // test10 - مشتري
  ] = createdUsers;

  // =====================================================
  // 2. GET OR CREATE CATEGORIES
  // =====================================================
  console.log('\n📁 Setting up categories...');

  const getOrCreateCategory = async (slug: string, nameAr: string, nameEn: string, icon: string) => {
    let category = await prisma.category.findFirst({ where: { slug } });
    if (!category) {
      category = await prisma.category.create({
        data: { slug, nameAr, nameEn, icon, isActive: true },
      });
    }
    return category;
  };

  const electronics = await getOrCreateCategory('electronics', 'إلكترونيات', 'Electronics', '📱');
  const mobilePhones = await getOrCreateCategory('mobile-phones', 'هواتف محمولة', 'Mobile Phones', '📱');
  const computers = await getOrCreateCategory('computers', 'أجهزة كمبيوتر', 'Computers', '💻');
  const furniture = await getOrCreateCategory('furniture', 'أثاث', 'Furniture', '🛋️');
  const vehicles = await getOrCreateCategory('vehicles', 'سيارات', 'Vehicles', '🚗');
  const fashion = await getOrCreateCategory('fashion', 'أزياء', 'Fashion', '👔');
  const homeAppliances = await getOrCreateCategory('home-appliances', 'أجهزة منزلية', 'Home Appliances', '🏡');
  const jewelry = await getOrCreateCategory('jewelry', 'مجوهرات', 'Jewelry', '💎');
  const realEstate = await getOrCreateCategory('real-estate', 'عقارات', 'Real Estate', '🏠');
  const scrap = await getOrCreateCategory('scrap', 'خردة', 'Scrap', '♻️');

  console.log('   ✅ Categories ready');

  // =====================================================
  // 3. CREATE ITEMS FOR EACH USER
  // =====================================================
  console.log('\n📦 Creating items for each user...\n');

  // -------------------- User 1: أحمد التاجر (Electronics) --------------------
  console.log('   → Creating items for أحمد التاجر (Electronics)...');

  const ahmedItems = [
    {
      sellerId: ahmed.id,
      categoryId: mobilePhones.id,
      titleAr: 'آيفون 15 برو ماكس 256GB جديد',
      titleEn: 'iPhone 15 Pro Max 256GB New',
      descriptionAr: 'آيفون 15 برو ماكس جديد بالكرتونة، ضمان أبل سنة كاملة. لون تيتانيوم طبيعي.',
      condition: 'NEW',
      estimatedValue: 75000,
      quantity: 5,
      location: 'Nasr City',
      governorate: 'Cairo',
      status: 'ACTIVE',
      allowBarter: false,
    },
    {
      sellerId: ahmed.id,
      categoryId: computers.id,
      titleAr: 'ماك بوك اير M3 جديد',
      titleEn: 'MacBook Air M3 New',
      descriptionAr: 'ماك بوك اير M3 شريحة جديدة، 8GB RAM، 256GB SSD.',
      condition: 'NEW',
      estimatedValue: 55000,
      quantity: 3,
      location: 'Nasr City',
      governorate: 'Cairo',
      status: 'ACTIVE',
      allowBarter: true,
    },
    {
      sellerId: ahmed.id,
      categoryId: electronics.id,
      titleAr: 'سماعات AirPods Pro 2',
      titleEn: 'AirPods Pro 2',
      descriptionAr: 'سماعات أبل ايربودز برو 2 جديدة بالكرتونة، USB-C.',
      condition: 'NEW',
      estimatedValue: 12000,
      quantity: 10,
      location: 'Nasr City',
      governorate: 'Cairo',
      status: 'ACTIVE',
      allowBarter: false,
    },
    {
      sellerId: ahmed.id,
      categoryId: electronics.id,
      titleAr: 'تلفزيون سامسونج 65 بوصة QLED',
      titleEn: 'Samsung 65 inch QLED TV',
      descriptionAr: 'تلفزيون سامسونج سمارت 65 بوصة، دقة 4K، موديل 2024.',
      condition: 'NEW',
      estimatedValue: 45000,
      quantity: 2,
      location: 'Nasr City',
      governorate: 'Cairo',
      status: 'ACTIVE',
      allowBarter: true,
    },
  ];

  for (const item of ahmedItems) {
    await prisma.item.create({ data: item as any });
  }
  console.log(`      ✅ Created ${ahmedItems.length} items`);

  // -------------------- User 2: سارة المقايضة (Barter Specialist) --------------------
  console.log('   → Creating items for سارة المقايضة (Barter)...');

  const saraItems = [
    {
      sellerId: sara.id,
      categoryId: furniture.id,
      titleAr: 'أريكة جلد طبيعي 3 مقاعد',
      titleEn: 'Genuine Leather 3-Seater Sofa',
      descriptionAr: 'أريكة جلد طبيعي إيطالي، لون بني، حالة ممتازة.',
      condition: 'LIKE_NEW',
      estimatedValue: 25000,
      quantity: 1,
      location: 'Smouha',
      governorate: 'Alexandria',
      status: 'ACTIVE',
      allowBarter: true,
      desiredItemTitle: 'طاولة سفرة 6 أشخاص',
    },
    {
      sellerId: sara.id,
      categoryId: mobilePhones.id,
      titleAr: 'سامسونج S24 Ultra للمقايضة',
      titleEn: 'Samsung S24 Ultra for Barter',
      descriptionAr: 'سامسونج جالاكسي S24 Ultra، 512GB، حالة ممتازة.',
      condition: 'LIKE_NEW',
      estimatedValue: 60000,
      quantity: 1,
      location: 'Smouha',
      governorate: 'Alexandria',
      status: 'ACTIVE',
      allowBarter: true,
      desiredItemTitle: 'آيفون 15 برو',
    },
    {
      sellerId: sara.id,
      categoryId: homeAppliances.id,
      titleAr: 'غسالة LG 9 كيلو',
      titleEn: 'LG 9kg Washing Machine',
      descriptionAr: 'غسالة LG فول أوتوماتيك 9 كيلو، موديل 2023.',
      condition: 'GOOD',
      estimatedValue: 18000,
      quantity: 1,
      location: 'Smouha',
      governorate: 'Alexandria',
      status: 'ACTIVE',
      allowBarter: true,
      desiredItemTitle: 'ثلاجة 14 قدم',
    },
  ];

  for (const item of saraItems) {
    await prisma.item.create({ data: item as any });
  }
  console.log(`      ✅ Created ${saraItems.length} items`);

  // -------------------- User 3: محمد المزادات (Auctions Expert) --------------------
  console.log('   → Creating items for محمد المزادات (Auctions)...');

  const mohamedItems = [
    {
      sellerId: mohamed.id,
      categoryId: electronics.id,
      titleAr: 'كاميرا سوني A7IV مع عدسة',
      titleEn: 'Sony A7IV with Lens',
      descriptionAr: 'كاميرا سوني A7IV مع عدسة 24-70mm، حالة ممتازة.',
      condition: 'LIKE_NEW',
      estimatedValue: 120000,
      quantity: 1,
      location: 'Dokki',
      governorate: 'Giza',
      status: 'ACTIVE',
      allowBarter: false,
    },
    {
      sellerId: mohamed.id,
      categoryId: furniture.id,
      titleAr: 'أنتيكات مصرية قديمة - مجموعة',
      titleEn: 'Vintage Egyptian Antiques Collection',
      descriptionAr: 'مجموعة أنتيكات مصرية من الثلاثينات.',
      condition: 'FAIR',
      estimatedValue: 50000,
      quantity: 1,
      location: 'Dokki',
      governorate: 'Giza',
      status: 'ACTIVE',
      allowBarter: true,
    },
    {
      sellerId: mohamed.id,
      categoryId: furniture.id,
      titleAr: 'لوحة فنية قديمة - توقيع فنان مصري',
      titleEn: 'Vintage Art Painting - Egyptian Artist',
      descriptionAr: 'لوحة زيتية أصلية من الخمسينات، موقعة من فنان مصري شهير.',
      condition: 'GOOD',
      estimatedValue: 150000,
      quantity: 1,
      location: 'Dokki',
      governorate: 'Giza',
      status: 'ACTIVE',
      allowBarter: false,
    },
  ];

  for (const item of mohamedItems) {
    await prisma.item.create({ data: item as any });
  }
  console.log(`      ✅ Created ${mohamedItems.length} items`);

  // -------------------- User 4: فاطمة الخردة (Scrap Market) --------------------
  console.log('   → Creating items for فاطمة الخردة (Scrap)...');

  const fatmaItems = [
    {
      sellerId: fatma.id,
      categoryId: scrap.id,
      titleAr: 'نحاس أصفر خردة - 500 كيلو',
      titleEn: 'Yellow Brass Scrap - 500kg',
      descriptionAr: 'نحاس أصفر خردة نظيف، 500 كيلو جاهز للتسليم.',
      condition: 'POOR',
      estimatedValue: 150000,
      quantity: 500,
      location: 'Shubra',
      governorate: 'Cairo',
      status: 'ACTIVE',
      allowBarter: false,
    },
    {
      sellerId: fatma.id,
      categoryId: scrap.id,
      titleAr: 'ألومنيوم خردة - 200 كيلو',
      titleEn: 'Aluminum Scrap - 200kg',
      descriptionAr: 'ألومنيوم خردة متنوع، 200 كيلو.',
      condition: 'POOR',
      estimatedValue: 16000,
      quantity: 200,
      location: 'Shubra',
      governorate: 'Cairo',
      status: 'ACTIVE',
      allowBarter: false,
    },
    {
      sellerId: fatma.id,
      categoryId: scrap.id,
      titleAr: 'خردة إلكترونيات - بوردات كمبيوتر',
      titleEn: 'Electronic Scrap - Computer Boards',
      descriptionAr: 'بوردات كمبيوتر للتدوير، 50 كيلو. غنية بالمعادن.',
      condition: 'POOR',
      estimatedValue: 30000,
      quantity: 50,
      location: 'Shubra',
      governorate: 'Cairo',
      status: 'ACTIVE',
      allowBarter: false,
    },
  ];

  for (const item of fatmaItems) {
    await prisma.item.create({ data: item as any });
  }
  console.log(`      ✅ Created ${fatmaItems.length} items`);

  // -------------------- User 5: كريم الفاخر (Luxury Items) --------------------
  console.log('   → Creating items for كريم الفاخر (Luxury)...');

  const karimItems = [
    {
      sellerId: karim.id,
      categoryId: fashion.id,
      titleAr: 'ساعة رولكس صب مارينر أصلية',
      titleEn: 'Rolex Submariner Original',
      descriptionAr: 'ساعة رولكس صب مارينر أصلية 100%، موديل 2022.',
      condition: 'LIKE_NEW',
      estimatedValue: 850000,
      quantity: 1,
      location: 'Zamalek',
      governorate: 'Cairo',
      status: 'ACTIVE',
      allowBarter: true,
    },
    {
      sellerId: karim.id,
      categoryId: fashion.id,
      titleAr: 'حقيبة هيرميس بيركين 30',
      titleEn: 'Hermès Birkin 30',
      descriptionAr: 'حقيبة هيرميس بيركين 30 أصلية، جلد توغو.',
      condition: 'LIKE_NEW',
      estimatedValue: 1200000,
      quantity: 1,
      location: 'Zamalek',
      governorate: 'Cairo',
      status: 'ACTIVE',
      allowBarter: true,
    },
    {
      sellerId: karim.id,
      categoryId: computers.id,
      titleAr: 'ماك بوك برو 16 انش M3 Max',
      titleEn: 'MacBook Pro 16 M3 Max',
      descriptionAr: 'ماك بوك برو 16 بوصة، شريحة M3 Max، 64GB RAM.',
      condition: 'NEW',
      estimatedValue: 180000,
      quantity: 1,
      location: 'Zamalek',
      governorate: 'Cairo',
      status: 'ACTIVE',
      allowBarter: true,
    },
  ];

  for (const item of karimItems) {
    await prisma.item.create({ data: item as any });
  }
  console.log(`      ✅ Created ${karimItems.length} items`);

  // -------------------- User 6: نورهان العقارية (Real Estate) --------------------
  console.log('   → Creating items for نورهان العقارية (Properties)...');

  // Create properties
  const nourhanProperties = [
    {
      ownerId: nourhan.id,
      titleAr: 'شقة فاخرة 150م² في الزمالك',
      titleEn: 'Luxury Apartment 150m² in Zamalek',
      descriptionAr: 'شقة فاخرة بإطلالة على النيل، 3 غرف، 2 حمام، تشطيب سوبر لوكس.',
      type: 'APARTMENT',
      purpose: 'SALE',
      area: 150,
      bedrooms: 3,
      bathrooms: 2,
      price: 8000000,
      governorate: 'Cairo',
      city: 'Zamalek',
      address: 'شارع البرازيل، الزمالك',
      status: 'ACTIVE',
      features: ['نيلي', 'مصعد', 'حارس', 'جراج'],
    },
    {
      ownerId: nourhan.id,
      titleAr: 'فيلا 400م² في التجمع الخامس',
      titleEn: 'Villa 400m² in New Cairo',
      descriptionAr: 'فيلا مستقلة، 5 غرف، حديقة خاصة، حمام سباحة.',
      type: 'VILLA',
      purpose: 'SALE',
      area: 400,
      bedrooms: 5,
      bathrooms: 4,
      price: 15000000,
      governorate: 'Cairo',
      city: 'New Cairo',
      address: 'التجمع الخامس، كمبوند جاردينيا',
      status: 'ACTIVE',
      features: ['حمام سباحة', 'حديقة', 'جراج مزدوج', 'أمن 24 ساعة'],
    },
    {
      ownerId: nourhan.id,
      titleAr: 'شقة 120م² للمقايضة',
      titleEn: 'Apartment 120m² for Barter',
      descriptionAr: 'شقة 120م في مصر الجديدة، مقايضة بسيارة + فرق.',
      type: 'APARTMENT',
      purpose: 'BARTER',
      area: 120,
      bedrooms: 2,
      bathrooms: 1,
      price: 5000000,
      governorate: 'Cairo',
      city: 'Heliopolis',
      address: 'شارع بغداد، مصر الجديدة',
      status: 'ACTIVE',
      features: ['قريب من المترو', 'مصعد', 'بلكونة'],
      allowBarter: true,
    },
  ];

  for (const prop of nourhanProperties) {
    await prisma.property.create({ data: prop as any });
  }
  console.log(`      ✅ Created ${nourhanProperties.length} properties`);

  // -------------------- User 7: ياسر السيارات (Cars) --------------------
  console.log('   → Creating items for ياسر السيارات (Cars)...');

  const yasserCars = [
    {
      sellerId: yasser.id,
      make: 'Mercedes-Benz',
      model: 'E200',
      year: 2020,
      mileage: 45000,
      fuelType: 'PETROL',
      transmission: 'AUTOMATIC',
      color: 'Black',
      price: 1500000,
      descriptionAr: 'مرسيدس E200 موديل 2020، فبريكا بالكامل.',
      descriptionEn: 'Mercedes E200 2020 model, fully original.',
      governorate: 'Giza',
      city: '6th of October',
      status: 'ACTIVE',
      allowBarter: true,
    },
    {
      sellerId: yasser.id,
      make: 'BMW',
      model: 'X5',
      year: 2023,
      mileage: 15000,
      fuelType: 'PETROL',
      transmission: 'AUTOMATIC',
      color: 'White',
      price: 3500000,
      descriptionAr: 'BMW X5 موديل 2023، فل أوبشن.',
      descriptionEn: 'BMW X5 2023 model, full option.',
      governorate: 'Giza',
      city: '6th of October',
      status: 'ACTIVE',
      allowBarter: true,
    },
    {
      sellerId: yasser.id,
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      mileage: 30000,
      fuelType: 'HYBRID',
      transmission: 'AUTOMATIC',
      color: 'Silver',
      price: 1200000,
      descriptionAr: 'تويوتا كامري هايبرد 2022، اقتصادية.',
      descriptionEn: 'Toyota Camry Hybrid 2022, economical.',
      governorate: 'Giza',
      city: '6th of October',
      status: 'ACTIVE',
      allowBarter: false,
    },
  ];

  for (const car of yasserCars) {
    await prisma.carListing.create({ data: car as any });
  }
  console.log(`      ✅ Created ${yasserCars.length} car listings`);

  // -------------------- User 8: منى الذهب (Gold & Jewelry) --------------------
  console.log('   → Creating items for منى الذهب (Gold)...');

  const monaGold = [
    {
      sellerId: mona.id,
      categoryId: jewelry.id,
      titleAr: 'سبيكة ذهب 50 جرام عيار 24',
      titleEn: 'Gold Bar 50g 24K',
      descriptionAr: 'سبيكة ذهب 50 جرام عيار 24، مع شهادة أصالة.',
      condition: 'NEW',
      estimatedValue: 200000,
      quantity: 1,
      location: 'Heliopolis',
      governorate: 'Cairo',
      status: 'ACTIVE',
      allowBarter: true,
    },
    {
      sellerId: mona.id,
      categoryId: jewelry.id,
      titleAr: 'طقم ذهب عيار 21 - 100 جرام',
      titleEn: 'Gold Set 21K - 100g',
      descriptionAr: 'طقم ذهب كامل (عقد + أسورة + حلق) عيار 21.',
      condition: 'NEW',
      estimatedValue: 350000,
      quantity: 1,
      location: 'Heliopolis',
      governorate: 'Cairo',
      status: 'ACTIVE',
      allowBarter: true,
    },
    {
      sellerId: mona.id,
      categoryId: jewelry.id,
      titleAr: 'فضة 925 - 2 كيلو سبائك',
      titleEn: 'Silver 925 - 2kg Bars',
      descriptionAr: 'سبائك فضة 925، 2 كيلو، مع شهادة.',
      condition: 'NEW',
      estimatedValue: 80000,
      quantity: 2000,
      location: 'Heliopolis',
      governorate: 'Cairo',
      status: 'ACTIVE',
      allowBarter: true,
    },
  ];

  for (const item of monaGold) {
    await prisma.item.create({ data: item as any });
  }
  console.log(`      ✅ Created ${monaGold.length} gold/jewelry items`);

  // -------------------- User 9: عمر الموبايلات (Mobile Phones) --------------------
  console.log('   → Creating items for عمر الموبايلات (Mobiles)...');

  const omarMobiles = [
    {
      sellerId: omar.id,
      categoryId: mobilePhones.id,
      titleAr: 'آيفون 14 برو 256GB',
      titleEn: 'iPhone 14 Pro 256GB',
      descriptionAr: 'آيفون 14 برو، حالة ممتازة، جميع الملحقات.',
      condition: 'LIKE_NEW',
      estimatedValue: 45000,
      quantity: 1,
      location: 'Maadi',
      governorate: 'Cairo',
      status: 'ACTIVE',
      allowBarter: true,
    },
    {
      sellerId: omar.id,
      categoryId: mobilePhones.id,
      titleAr: 'سامسونج فولد 5',
      titleEn: 'Samsung Fold 5',
      descriptionAr: 'سامسونج جالاكسي فولد 5، 512GB.',
      condition: 'LIKE_NEW',
      estimatedValue: 65000,
      quantity: 1,
      location: 'Maadi',
      governorate: 'Cairo',
      status: 'ACTIVE',
      allowBarter: true,
    },
    {
      sellerId: omar.id,
      categoryId: mobilePhones.id,
      titleAr: 'آيفون 15 برو للمقايضة',
      titleEn: 'iPhone 15 Pro for Barter',
      descriptionAr: 'آيفون 15 برو 128GB، للمقايضة بسامسونج S24.',
      condition: 'LIKE_NEW',
      estimatedValue: 55000,
      quantity: 1,
      location: 'Maadi',
      governorate: 'Cairo',
      status: 'ACTIVE',
      allowBarter: true,
      desiredItemTitle: 'Samsung S24 Ultra',
    },
  ];

  for (const item of omarMobiles) {
    await prisma.item.create({ data: item as any });
  }
  console.log(`      ✅ Created ${omarMobiles.length} mobile items`);

  // -------------------- User 10: هدى المشتريات (Active Buyer) --------------------
  console.log('   → Creating watchlist for هدى المشتريات...');

  // هدى مشتري، سننشئ لها قائمة مراقبة وبعض المنتجات البسيطة
  const hudaItems = [
    {
      sellerId: huda.id,
      categoryId: electronics.id,
      titleAr: 'سماعات بوز QC45 مستعملة',
      titleEn: 'Bose QC45 Used',
      descriptionAr: 'سماعات بوز QC45، حالة ممتازة، مستخدمة 3 أشهر.',
      condition: 'LIKE_NEW',
      estimatedValue: 8000,
      quantity: 1,
      location: 'Mandara',
      governorate: 'Alexandria',
      status: 'ACTIVE',
      allowBarter: true,
    },
  ];

  for (const item of hudaItems) {
    await prisma.item.create({ data: item as any });
  }
  console.log(`      ✅ Created ${hudaItems.length} items`);

  // =====================================================
  // 4. CREATE SAMPLE AUCTIONS
  // =====================================================
  console.log('\n🔨 Creating sample auctions...');

  const now = new Date();
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const mohamedItem = await prisma.item.findFirst({
    where: { sellerId: mohamed.id },
  });

  if (mohamedItem) {
    await prisma.auction.create({
      data: {
        itemId: mohamedItem.id,
        sellerId: mohamed.id,
        startingPrice: 80000,
        reservePrice: 100000,
        currentBid: 80000,
        minimumIncrement: 5000,
        startTime: now,
        endTime: oneWeekLater,
        status: 'ACTIVE',
      } as any,
    });
    console.log('   ✅ Created auction for camera');
  }

  // =====================================================
  // 5. CREATE SAMPLE BARTER OFFERS
  // =====================================================
  console.log('\n🔄 Creating sample barter offers...');

  const saraItem = await prisma.item.findFirst({
    where: { sellerId: sara.id, allowBarter: true },
  });
  const omarItem = await prisma.item.findFirst({
    where: { sellerId: omar.id, allowBarter: true },
  });

  if (saraItem && omarItem) {
    await prisma.barterOffer.create({
      data: {
        offererId: omar.id,
        receiverId: sara.id,
        offeredItemId: omarItem.id,
        requestedItemId: saraItem.id,
        status: 'PENDING',
        message: 'أقترح مقايضة موبايلي بموبايلك',
      } as any,
    });
    console.log('   ✅ Created barter offer between Omar and Sara');
  }

  // =====================================================
  // FINAL SUMMARY
  // =====================================================
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('                    ✅ SEED COMPLETED SUCCESSFULLY                  ');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('\n');
  console.log('  📊 DATA SUMMARY:');
  console.log('  ─────────────────────────────────────────────────────────────────');
  console.log('  │ Users Created     │ 10 accounts                              │');
  console.log('  │ Items Created     │ 25+ items across all categories          │');
  console.log('  │ Properties        │ 3 properties                             │');
  console.log('  │ Car Listings      │ 3 cars                                   │');
  console.log('  │ Auctions          │ 1 active auction                         │');
  console.log('  │ Barter Offers     │ 1 pending offer                          │');
  console.log('  ─────────────────────────────────────────────────────────────────');
  console.log('\n');
  console.log('  🔐 LOGIN CREDENTIALS:');
  console.log('  ─────────────────────────────────────────────────────────────────');
  console.log('  │ Password for ALL  │ Test@1234                                │');
  console.log('  ─────────────────────────────────────────────────────────────────');
  console.log('\n');
  console.log('  📧 TEST ACCOUNTS:');
  console.log('  ─────────────────────────────────────────────────────────────────');
  testUsers.forEach((u, i) => {
    console.log(`  │ ${i + 1}. ${u.email.padEnd(22)} │ ${u.fullName.padEnd(20)} │`);
  });
  console.log('  ─────────────────────────────────────────────────────────────────');
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════════\n');
}

seedComprehensiveTestData()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
