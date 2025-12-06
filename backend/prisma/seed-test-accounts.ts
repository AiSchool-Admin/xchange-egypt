import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * =====================================================
 * 5 TEST ACCOUNTS FOR PLATFORM TESTING
 * =====================================================
 *
 * All accounts use password: Test@1234
 *
 * 1. test1@xchange.eg - أحمد التاجر (Electronics & Direct Sales)
 * 2. test2@xchange.eg - سارة المقايضة (Barter Specialist)
 * 3. test3@xchange.eg - محمد المزادات (Auctions Expert)
 * 4. test4@xchange.eg - فاطمة الخردة (Scrap Market)
 * 5. test5@xchange.eg - كريم الفاخر (Luxury Items)
 *
 * =====================================================
 */

async function seedTestAccounts() {
  console.log('🌱 Creating 5 Test Accounts with Demo Data...\n');

  const hashedPassword = await hashPassword('Test@1234');

  // =====================================================
  // CREATE 5 TEST USERS
  // =====================================================
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
    console.log(`✅ User: ${user.fullName} (${user.email})`);
  }

  // =====================================================
  // GET CATEGORIES
  // =====================================================
  const electronics = await prisma.category.findFirst({ where: { slug: 'electronics' } });
  const mobilePhones = await prisma.category.findFirst({ where: { slug: 'mobile-phones' } });
  const computers = await prisma.category.findFirst({ where: { slug: 'computers' } });
  const furniture = await prisma.category.findFirst({ where: { slug: 'furniture' } });
  const vehicles = await prisma.category.findFirst({ where: { slug: 'vehicles' } });
  const fashion = await prisma.category.findFirst({ where: { slug: 'fashion' } });
  const homeAppliances = await prisma.category.findFirst({ where: { slug: 'home-appliances' } });

  // Use first available category as fallback
  const defaultCategory = electronics || await prisma.category.findFirst();

  if (!defaultCategory) {
    throw new Error('No categories found. Run seed-categories.ts first.');
  }

  const [user1, user2, user3, user4, user5] = createdUsers;

  // =====================================================
  // USER 1: أحمد التاجر - DIRECT SALE (Electronics)
  // =====================================================
  console.log('\n📦 Creating items for أحمد التاجر (Direct Sales)...');

  const user1Items = [
    {
      sellerId: user1.id,
      categoryId: (mobilePhones || defaultCategory).id,
      titleAr: 'آيفون 15 برو ماكس 256GB جديد',
      titleEn: 'iPhone 15 Pro Max 256GB New',
      descriptionAr: 'آيفون 15 برو ماكس جديد بالكرتونة، ضمان أبل سنة كاملة. لون تيتانيوم طبيعي.',
      descriptionEn: 'Brand new iPhone 15 Pro Max in box, 1-year Apple warranty. Natural Titanium color.',
      condition: "NEW",
      estimatedValue: 75000,
      quantity: 3,
      location: 'Nasr City',
      governorate: 'Cairo',
      status: 'ACTIVE',
    },
    {
      sellerId: user1.id,
      categoryId: (computers || defaultCategory).id,
      titleAr: 'لابتوب ماك بوك اير M3 جديد',
      titleEn: 'MacBook Air M3 New',
      descriptionAr: 'ماك بوك اير M3 شريحة جديدة، 8GB RAM، 256GB SSD. لون ميدنايت.',
      descriptionEn: 'MacBook Air M3 chip new, 8GB RAM, 256GB SSD. Midnight color.',
      condition: "NEW",
      estimatedValue: 55000,
      quantity: 2,
      location: 'Nasr City',
      governorate: 'Cairo',
      status: 'ACTIVE',
    },
    {
      sellerId: user1.id,
      categoryId: (electronics || defaultCategory).id,
      titleAr: 'سماعات AirPods Pro 2 جديدة',
      titleEn: 'AirPods Pro 2 New',
      descriptionAr: 'سماعات أبل ايربودز برو 2 جديدة بالكرتونة، USB-C.',
      descriptionEn: 'Apple AirPods Pro 2 new in box, USB-C version.',
      condition: "NEW",
      estimatedValue: 12000,
      quantity: 5,
      location: 'Nasr City',
      governorate: 'Cairo',
      status: 'ACTIVE',
    },
  ];

  for (const item of user1Items) {
    await prisma.item.create({ data: item as any });
  }
  console.log(`   ✅ Created ${user1Items.length} items (Direct Sale)`);

  // =====================================================
  // USER 2: سارة المقايضة - BARTER Items
  // =====================================================
  console.log('\n🔄 Creating items for سارة المقايضة (Barter)...');

  const user2Items = [
    {
      sellerId: user2.id,
      categoryId: (furniture || defaultCategory).id,
      titleAr: 'أريكة جلد طبيعي 3 مقاعد',
      titleEn: 'Genuine Leather 3-Seater Sofa',
      descriptionAr: 'أريكة جلد طبيعي إيطالي، لون بني، حالة ممتازة. أبحث عن مقايضة بطاولة سفرة.',
      descriptionEn: 'Italian genuine leather sofa, brown color, excellent condition. Looking to trade for dining table.',
      condition: "LIKE_NEW",
      estimatedValue: 25000,
      quantity: 1,
      location: 'Smouha',
      governorate: 'Alexandria',
      status: 'ACTIVE',
      // Barter preferences
      desiredItemTitle: 'طاولة سفرة 6 أشخاص',
      desiredItemDescription: 'طاولة سفرة خشب زان مع 6 كراسي',
    },
    {
      sellerId: user2.id,
      categoryId: (mobilePhones || defaultCategory).id,
      titleAr: 'سامسونج S24 Ultra للمقايضة',
      titleEn: 'Samsung S24 Ultra for Barter',
      descriptionAr: 'سامسونج جالاكسي S24 Ultra، 512GB، حالة ممتازة. أقايضه بآيفون 15 برو.',
      descriptionEn: 'Samsung Galaxy S24 Ultra, 512GB, excellent condition. Trade for iPhone 15 Pro.',
      condition: "LIKE_NEW",
      estimatedValue: 60000,
      quantity: 1,
      location: 'Smouha',
      governorate: 'Alexandria',
      status: 'ACTIVE',
      desiredItemTitle: 'آيفون 15 برو أو أحدث',
      desiredItemDescription: 'آيفون 15 برو أو برو ماكس بحالة جيدة',
    },
    {
      sellerId: user2.id,
      categoryId: (homeAppliances || defaultCategory).id,
      titleAr: 'غسالة LG 9 كيلو للمقايضة',
      titleEn: 'LG 9kg Washing Machine for Barter',
      descriptionAr: 'غسالة LG فول أوتوماتيك 9 كيلو، موديل 2023. أقايضها بثلاجة متوسطة.',
      descriptionEn: 'LG fully automatic 9kg washing machine, 2023 model. Trade for medium refrigerator.',
      condition: "GOOD",
      estimatedValue: 18000,
      quantity: 1,
      location: 'Smouha',
      governorate: 'Alexandria',
      status: 'ACTIVE',
      desiredItemTitle: 'ثلاجة 12-16 قدم',
      desiredItemDescription: 'ثلاجة نوفروست بحالة جيدة',
    },
  ];

  for (const item of user2Items) {
    await prisma.item.create({ data: item as any });
  }
  console.log(`   ✅ Created ${user2Items.length} items (Barter)`);

  // =====================================================
  // USER 3: محمد المزادات - AUCTION Items
  // =====================================================
  console.log('\n🔨 Creating items for محمد المزادات (Auctions)...');

  const user3Items = [
    {
      sellerId: user3.id,
      categoryId: (vehicles || defaultCategory).id,
      titleAr: 'مرسيدس E200 موديل 2020 - مزاد',
      titleEn: 'Mercedes E200 2020 - Auction',
      descriptionAr: 'مرسيدس E200 موديل 2020، 45,000 كم، فبريكا بالكامل. المزاد يبدأ من 1,200,000 جنيه.',
      descriptionEn: 'Mercedes E200 2020 model, 45,000 km, fully original. Auction starts at 1,200,000 EGP.',
      condition: "LIKE_NEW",
      estimatedValue: 1500000,
      quantity: 1,
      location: 'Dokki',
      governorate: 'Giza',
      status: 'ACTIVE',
    },
    {
      sellerId: user3.id,
      categoryId: (electronics || defaultCategory).id,
      titleAr: 'كاميرا سوني A7IV - مزاد',
      titleEn: 'Sony A7IV Camera - Auction',
      descriptionAr: 'كاميرا سوني A7IV مع عدسة 24-70mm، حالة ممتازة. المزاد يبدأ من 80,000 جنيه.',
      descriptionEn: 'Sony A7IV camera with 24-70mm lens, excellent condition. Auction starts at 80,000 EGP.',
      condition: "LIKE_NEW",
      estimatedValue: 120000,
      quantity: 1,
      location: 'Dokki',
      governorate: 'Giza',
      status: 'ACTIVE',
    },
    {
      sellerId: user3.id,
      categoryId: (furniture || defaultCategory).id,
      titleAr: 'أنتيكات مصرية قديمة - مزاد',
      titleEn: 'Vintage Egyptian Antiques - Auction',
      descriptionAr: 'مجموعة أنتيكات مصرية من الثلاثينات، تشمل ساعة حائط ومرآة وشمعدانات نحاس.',
      descriptionEn: 'Collection of Egyptian antiques from the 1930s, includes wall clock, mirror, and brass candlesticks.',
      condition: "FAIR",
      estimatedValue: 50000,
      quantity: 1,
      location: 'Dokki',
      governorate: 'Giza',
      status: 'ACTIVE',
    },
  ];

  for (const item of user3Items) {
    await prisma.item.create({ data: item as any });
  }
  console.log(`   ✅ Created ${user3Items.length} items (Auction)`);

  // =====================================================
  // USER 4: فاطمة الخردة - SCRAP Market
  // =====================================================
  console.log('\n♻️ Creating items for فاطمة الخردة (Scrap Market)...');

  const user4Items = [
    {
      sellerId: user4.id,
      categoryId: defaultCategory.id,
      titleAr: 'نحاس أصفر خردة - 50 كيلو',
      titleEn: 'Yellow Brass Scrap - 50kg',
      descriptionAr: 'نحاس أصفر خردة نظيف، 50 كيلو جاهز للتسليم. السعر للكيلو.',
      descriptionEn: 'Clean yellow brass scrap, 50kg ready for delivery. Price per kg.',
      condition: "POOR",
      estimatedValue: 15000,
      quantity: 50,
      location: 'Shubra',
      governorate: 'Cairo',
      status: 'ACTIVE',
    },
    {
      sellerId: user4.id,
      categoryId: defaultCategory.id,
      titleAr: 'ألومنيوم خردة - 100 كيلو',
      titleEn: 'Aluminum Scrap - 100kg',
      descriptionAr: 'ألومنيوم خردة متنوع (علب، أسلاك، قطع)، 100 كيلو. السعر قابل للتفاوض للكميات.',
      descriptionEn: 'Mixed aluminum scrap (cans, wires, pieces), 100kg. Price negotiable for quantities.',
      condition: "POOR",
      estimatedValue: 8000,
      quantity: 100,
      location: 'Shubra',
      governorate: 'Cairo',
      status: 'ACTIVE',
    },
    {
      sellerId: user4.id,
      categoryId: defaultCategory.id,
      titleAr: 'حديد خردة - 200 كيلو',
      titleEn: 'Iron Scrap - 200kg',
      descriptionAr: 'حديد خردة مشكل (زوايا، مواسير، صاج)، 200 كيلو. التوصيل متاح.',
      descriptionEn: 'Mixed iron scrap (angles, pipes, sheets), 200kg. Delivery available.',
      condition: "POOR",
      estimatedValue: 6000,
      quantity: 200,
      location: 'Shubra',
      governorate: 'Cairo',
      status: 'ACTIVE',
    },
    {
      sellerId: user4.id,
      categoryId: (electronics || defaultCategory).id,
      titleAr: 'خردة إلكترونيات - بوردات كمبيوتر',
      titleEn: 'Electronic Scrap - Computer Boards',
      descriptionAr: 'بوردات كمبيوتر ولوحات إلكترونية للتدوير، 20 كيلو. غنية بالمعادن.',
      descriptionEn: 'Computer boards and electronic circuits for recycling, 20kg. Rich in metals.',
      condition: "POOR",
      estimatedValue: 12000,
      quantity: 20,
      location: 'Shubra',
      governorate: 'Cairo',
      status: 'ACTIVE',
    },
  ];

  for (const item of user4Items) {
    await prisma.item.create({ data: item as any });
  }
  console.log(`   ✅ Created ${user4Items.length} items (Scrap Market)`);

  // =====================================================
  // USER 5: كريم الفاخر - LUXURY Items
  // =====================================================
  console.log('\n💎 Creating items for كريم الفاخر (Luxury)...');

  const user5Items = [
    {
      sellerId: user5.id,
      categoryId: (fashion || defaultCategory).id,
      titleAr: 'ساعة رولكس صب مارينر أصلية',
      titleEn: 'Rolex Submariner Original Watch',
      descriptionAr: 'ساعة رولكس صب مارينر أصلية 100%، موديل 2022، مع الأوراق والضمان الدولي.',
      descriptionEn: '100% original Rolex Submariner, 2022 model, with papers and international warranty.',
      condition: "LIKE_NEW",
      estimatedValue: 850000,
      quantity: 1,
      location: 'Zamalek',
      governorate: 'Cairo',
      status: 'ACTIVE',
    },
    {
      sellerId: user5.id,
      categoryId: (fashion || defaultCategory).id,
      titleAr: 'حقيبة هيرميس بيركين 30 أصلية',
      titleEn: 'Hermès Birkin 30 Original Bag',
      descriptionAr: 'حقيبة هيرميس بيركين 30 أصلية، جلد توغو، لون إتوب. مع الفاتورة والكرتونة.',
      descriptionEn: 'Original Hermès Birkin 30, Togo leather, Etoupe color. With receipt and box.',
      condition: "LIKE_NEW",
      estimatedValue: 1200000,
      quantity: 1,
      location: 'Zamalek',
      governorate: 'Cairo',
      status: 'ACTIVE',
    },
    {
      sellerId: user5.id,
      categoryId: (fashion || defaultCategory).id,
      titleAr: 'نظارة كارتييه ذهب أصلية',
      titleEn: 'Cartier Gold Sunglasses Original',
      descriptionAr: 'نظارة كارتييه بانثير ذهب أصلية، عدسات متدرجة. حالة ممتازة.',
      descriptionEn: 'Original Cartier Panthère gold sunglasses, gradient lenses. Excellent condition.',
      condition: "LIKE_NEW",
      estimatedValue: 95000,
      quantity: 1,
      location: 'Zamalek',
      governorate: 'Cairo',
      status: 'ACTIVE',
    },
  ];

  for (const item of user5Items) {
    await prisma.item.create({ data: item as any });
  }
  console.log(`   ✅ Created ${user5Items.length} items (Luxury)`);

  // =====================================================
  // PRINT LOGIN CREDENTIALS
  // =====================================================
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    🔐 TEST ACCOUNTS CREATED                    ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  Password for ALL accounts: Test@1234');
  console.log('');
  console.log('  ┌─────────────────────────┬──────────────────┬───────────────┐');
  console.log('  │ Email                   │ Name             │ Market        │');
  console.log('  ├─────────────────────────┼──────────────────┼───────────────┤');
  console.log('  │ test1@xchange.eg        │ أحمد التاجر      │ Direct Sales  │');
  console.log('  │ test2@xchange.eg        │ سارة المقايضة    │ Barter        │');
  console.log('  │ test3@xchange.eg        │ محمد المزادات    │ Auctions      │');
  console.log('  │ test4@xchange.eg        │ فاطمة الخردة     │ Scrap Market  │');
  console.log('  │ test5@xchange.eg        │ كريم الفاخر      │ Luxury        │');
  console.log('  └─────────────────────────┴──────────────────┴───────────────┘');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  📊 ITEMS SUMMARY:');
  console.log('  ─────────────────');
  console.log('  • Direct Sales (أحمد): 3 items');
  console.log('  • Barter (سارة): 3 items with trade preferences');
  console.log('  • Auctions (محمد): 3 items for auction');
  console.log('  • Scrap Market (فاطمة): 4 items (metals & electronics)');
  console.log('  • Luxury (كريم): 3 items (watches, bags, accessories)');
  console.log('');
  console.log('  Total: 16 test items across all markets');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

seedTestAccounts()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
