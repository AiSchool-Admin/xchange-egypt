import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

/**
 * =====================================================
 * UAT TRANSACTIONS SEED - بيانات اختبار قبول المستخدم
 * =====================================================
 *
 * هذا الملف يُنشئ بيانات اختبار شاملة تشمل:
 * - 10 مستخدمين اختباريين (test1-test10)
 * - معاملات بيع وشراء مباشر
 * - مزادات نشطة وعروض
 * - مناقصات (مزادات عكسية)
 * - عروض مقايضة وسلاسل مقايضة ذكية
 * - إشعارات تتطلب استجابة المستخدمين
 * - طلبات شحن ودفع
 *
 * كلمة المرور لجميع الحسابات: Test@1234
 *
 * =====================================================
 */

// Helper function to generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `XCH-${timestamp}-${random}`;
};

async function seedUATTransactions() {
  console.log('🚀 بدء إنشاء بيانات اختبار قبول المستخدم (UAT)...\n');

  const hashedPassword = await hashPassword('Test@1234');

  // =====================================================
  // 1. CREATE ALL 10 TEST USERS
  // =====================================================
  console.log('👥 إنشاء المستخدمين الاختباريين (test1-test10)...');

  const testUsersData = [
    {
      email: 'test1@xchange.eg',
      passwordHash: hashedPassword,
      fullName: 'أحمد التاجر',
      phone: '+201111111111',
      userType: 'BUSINESS' as const,
      businessName: 'متجر أحمد للإلكترونيات',
      governorate: 'Cairo',
      city: 'Nasr City',
      address: '15 شارع عباس العقاد، مدينة نصر',
      emailVerified: true,
      phoneVerified: true,
      rating: 4.8,
      totalReviews: 45,
    },
    {
      email: 'test2@xchange.eg',
      passwordHash: hashedPassword,
      fullName: 'سارة المقايضة',
      phone: '+201222222222',
      userType: 'INDIVIDUAL' as const,
      governorate: 'Alexandria',
      city: 'Smouha',
      address: '25 شارع فوزي معاذ، سموحة',
      emailVerified: true,
      phoneVerified: true,
      rating: 4.9,
      totalReviews: 32,
    },
    {
      email: 'test3@xchange.eg',
      passwordHash: hashedPassword,
      fullName: 'محمد المزادات',
      phone: '+201333333333',
      userType: 'INDIVIDUAL' as const,
      governorate: 'Giza',
      city: 'Dokki',
      address: '8 شارع التحرير، الدقي',
      emailVerified: true,
      phoneVerified: true,
      rating: 4.7,
      totalReviews: 28,
    },
    {
      email: 'test4@xchange.eg',
      passwordHash: hashedPassword,
      fullName: 'فاطمة الخردة',
      phone: '+201444444444',
      userType: 'BUSINESS' as const,
      businessName: 'مؤسسة الخردة الذهبية',
      governorate: 'Cairo',
      city: 'Shubra',
      address: '120 شارع شبرا الرئيسي',
      emailVerified: true,
      phoneVerified: true,
      rating: 4.6,
      totalReviews: 67,
    },
    {
      email: 'test5@xchange.eg',
      passwordHash: hashedPassword,
      fullName: 'كريم الفاخر',
      phone: '+201555555555',
      userType: 'INDIVIDUAL' as const,
      governorate: 'Cairo',
      city: 'Zamalek',
      address: '5 شارع البرازيل، الزمالك',
      emailVerified: true,
      phoneVerified: true,
      rating: 5.0,
      totalReviews: 15,
    },
    {
      email: 'test6@xchange.eg',
      passwordHash: hashedPassword,
      fullName: 'نورا المناقصات',
      phone: '+201666666666',
      userType: 'BUSINESS' as const,
      businessName: 'شركة نورا للتوريدات',
      governorate: 'Cairo',
      city: 'Maadi',
      address: '45 شارع 9، المعادي',
      emailVerified: true,
      phoneVerified: true,
      rating: 4.5,
      totalReviews: 22,
    },
    {
      email: 'test7@xchange.eg',
      passwordHash: hashedPassword,
      fullName: 'ياسر العقارات',
      phone: '+201777777777',
      userType: 'BUSINESS' as const,
      businessName: 'ياسر للعقارات',
      governorate: 'Cairo',
      city: 'New Cairo',
      address: '10 التجمع الخامس، القاهرة الجديدة',
      emailVerified: true,
      phoneVerified: true,
      rating: 4.4,
      totalReviews: 18,
    },
    {
      email: 'test8@xchange.eg',
      passwordHash: hashedPassword,
      fullName: 'منى الموبايلات',
      phone: '+201888888888',
      userType: 'BUSINESS' as const,
      businessName: 'منى موبايل',
      governorate: 'Alexandria',
      city: 'Sidi Gaber',
      address: '78 شارع سيدي جابر',
      emailVerified: true,
      phoneVerified: true,
      rating: 4.8,
      totalReviews: 56,
    },
    {
      email: 'test9@xchange.eg',
      passwordHash: hashedPassword,
      fullName: 'علي السيارات',
      phone: '+201999999999',
      userType: 'BUSINESS' as const,
      businessName: 'معرض علي للسيارات',
      governorate: 'Giza',
      city: '6th of October',
      address: 'المحور المركزي، 6 أكتوبر',
      emailVerified: true,
      phoneVerified: true,
      rating: 4.3,
      totalReviews: 89,
    },
    {
      email: 'test10@xchange.eg',
      passwordHash: hashedPassword,
      fullName: 'هدى المشتريات',
      phone: '+201000000010',
      userType: 'INDIVIDUAL' as const,
      governorate: 'Cairo',
      city: 'Heliopolis',
      address: '30 شارع الميرغني، مصر الجديدة',
      emailVerified: true,
      phoneVerified: true,
      rating: 4.7,
      totalReviews: 12,
    },
  ];

  const users: any[] = [];
  for (const userData of testUsersData) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    users.push(user);
    console.log(`   ✅ ${user.fullName} (${user.email})`);
  }

  const [user1, user2, user3, user4, user5, user6, user7, user8, user9, user10] = users;

  // =====================================================
  // 2. CREATE SHIPPING ADDRESSES FOR USERS
  // =====================================================
  console.log('\n📍 إنشاء عناوين الشحن...');

  for (const user of users) {
    await prisma.shippingAddress.upsert({
      where: { id: `addr-${user.id}` },
      update: {},
      create: {
        id: `addr-${user.id}`,
        userId: user.id,
        fullName: user.fullName,
        phone: user.phone || '+201000000000',
        street: user.address || 'شارع رئيسي',
        city: user.city || 'Cairo',
        governorate: user.governorate || 'Cairo',
        isDefault: true,
      },
    });
  }
  console.log(`   ✅ تم إنشاء ${users.length} عنوان شحن`);

  // =====================================================
  // 3. GET CATEGORIES
  // =====================================================
  console.log('\n📂 جلب الفئات...');

  const categories = await prisma.category.findMany({ where: { isActive: true }, take: 20 });
  const electronics = categories.find(c => c.slug === 'electronics') || categories[0];
  const mobilePhones = categories.find(c => c.slug === 'mobile-phones') || electronics;
  const computers = categories.find(c => c.slug === 'computers') || electronics;
  const furniture = categories.find(c => c.slug === 'furniture') || categories[1] || electronics;
  const vehicles = categories.find(c => c.slug === 'vehicles') || categories[2] || electronics;
  const fashion = categories.find(c => c.slug === 'fashion') || categories[3] || electronics;
  const homeAppliances = categories.find(c => c.slug === 'home-appliances') || electronics;

  if (!electronics) {
    console.log('   ⚠️ لا توجد فئات - قم بتشغيل seed-categories.ts أولاً');
    return;
  }
  console.log(`   ✅ تم جلب ${categories.length} فئة`);

  // =====================================================
  // 4. CREATE ITEMS FOR ALL USERS
  // =====================================================
  console.log('\n📦 إنشاء المنتجات للمستخدمين...');

  // Items for User 1 (Direct Sales - Electronics)
  const items1 = await Promise.all([
    prisma.item.create({
      data: {
        sellerId: user1.id,
        title: 'آيفون 15 برو ماكس 256GB جديد',
        description: 'آيفون 15 برو ماكس جديد بالكرتونة، ضمان أبل سنة كاملة. لون تيتانيوم طبيعي.',
        categoryId: mobilePhones?.id,
        condition: 'NEW',
        estimatedValue: 75000,
        governorate: 'Cairo',
        city: 'Nasr City',
        status: 'ACTIVE',
        images: ['https://placehold.co/400x400?text=iPhone15'],
        listingType: 'DIRECT_SALE',
      },
    }),
    prisma.item.create({
      data: {
        sellerId: user1.id,
        title: 'ماك بوك اير M3 جديد',
        description: 'ماك بوك اير M3 شريحة جديدة، 8GB RAM، 256GB SSD. لون ميدنايت.',
        categoryId: computers?.id,
        condition: 'NEW',
        estimatedValue: 55000,
        governorate: 'Cairo',
        city: 'Nasr City',
        status: 'ACTIVE',
        images: ['https://placehold.co/400x400?text=MacBook'],
        listingType: 'DIRECT_SALE',
      },
    }),
  ]);
  console.log(`   ✅ أحمد التاجر: ${items1.length} منتجات`);

  // Items for User 2 (Barter)
  const items2 = await Promise.all([
    prisma.item.create({
      data: {
        sellerId: user2.id,
        title: 'سامسونج S24 Ultra للمقايضة',
        description: 'سامسونج جالاكسي S24 Ultra، 512GB، حالة ممتازة. أقايضه بآيفون 15 برو.',
        categoryId: mobilePhones?.id,
        condition: 'LIKE_NEW',
        estimatedValue: 60000,
        governorate: 'Alexandria',
        city: 'Smouha',
        status: 'ACTIVE',
        images: ['https://placehold.co/400x400?text=S24Ultra'],
        listingType: 'BARTER',
        desiredItemTitle: 'آيفون 15 برو أو أحدث',
        desiredItemDescription: 'آيفون 15 برو أو برو ماكس بحالة جيدة',
      },
    }),
    prisma.item.create({
      data: {
        sellerId: user2.id,
        title: 'أريكة جلد طبيعي للمقايضة',
        description: 'أريكة جلد طبيعي إيطالي، لون بني، حالة ممتازة. أبحث عن طاولة سفرة.',
        categoryId: furniture?.id,
        condition: 'LIKE_NEW',
        estimatedValue: 25000,
        governorate: 'Alexandria',
        city: 'Smouha',
        status: 'ACTIVE',
        images: ['https://placehold.co/400x400?text=Sofa'],
        listingType: 'BARTER',
        desiredItemTitle: 'طاولة سفرة 6 أشخاص',
        desiredItemDescription: 'طاولة سفرة خشب زان مع 6 كراسي',
      },
    }),
  ]);
  console.log(`   ✅ سارة المقايضة: ${items2.length} منتجات`);

  // Items for User 3 (Auctions)
  const items3 = await Promise.all([
    prisma.item.create({
      data: {
        sellerId: user3.id,
        title: 'كاميرا سوني A7IV - مزاد',
        description: 'كاميرا سوني A7IV مع عدسة 24-70mm، حالة ممتازة. المزاد يبدأ من 80,000 جنيه.',
        categoryId: electronics?.id,
        condition: 'LIKE_NEW',
        estimatedValue: 120000,
        governorate: 'Giza',
        city: 'Dokki',
        status: 'ACTIVE',
        images: ['https://placehold.co/400x400?text=SonyA7'],
        listingType: 'AUCTION',
      },
    }),
    prisma.item.create({
      data: {
        sellerId: user3.id,
        title: 'أنتيكات مصرية قديمة - مزاد',
        description: 'مجموعة أنتيكات مصرية من الثلاثينات، تشمل ساعة حائط ومرآة.',
        categoryId: furniture?.id,
        condition: 'FAIR',
        estimatedValue: 50000,
        governorate: 'Giza',
        city: 'Dokki',
        status: 'ACTIVE',
        images: ['https://placehold.co/400x400?text=Antiques'],
        listingType: 'AUCTION',
      },
    }),
  ]);
  console.log(`   ✅ محمد المزادات: ${items3.length} منتجات`);

  // Items for User 6 (Reverse Auctions/Tenders)
  const items6 = await Promise.all([
    prisma.item.create({
      data: {
        sellerId: user6.id,
        title: 'مطلوب: 100 لابتوب Dell للشركة',
        description: 'نحتاج 100 لابتوب Dell أو HP للشركة، مواصفات: Core i5، 8GB RAM، 256GB SSD.',
        categoryId: computers?.id,
        condition: 'NEW',
        estimatedValue: 1500000,
        governorate: 'Cairo',
        city: 'Maadi',
        status: 'ACTIVE',
        images: ['https://placehold.co/400x400?text=Laptops'],
        listingType: 'DIRECT_BUY',
      },
    }),
  ]);
  console.log(`   ✅ نورا المناقصات: ${items6.length} منتجات`);

  // Items for User 8 (Mobiles)
  const items8 = await Promise.all([
    prisma.item.create({
      data: {
        sellerId: user8.id,
        title: 'آيفون 14 برو مستعمل',
        description: 'آيفون 14 برو 256GB، حالة ممتازة، بطارية 92%.',
        categoryId: mobilePhones?.id,
        condition: 'LIKE_NEW',
        estimatedValue: 45000,
        governorate: 'Alexandria',
        city: 'Sidi Gaber',
        status: 'ACTIVE',
        images: ['https://placehold.co/400x400?text=iPhone14'],
        listingType: 'DIRECT_SALE',
      },
    }),
    prisma.item.create({
      data: {
        sellerId: user8.id,
        title: 'شاومي 14 Ultra جديد',
        description: 'شاومي 14 Ultra 512GB جديد بالكرتونة.',
        categoryId: mobilePhones?.id,
        condition: 'NEW',
        estimatedValue: 42000,
        governorate: 'Alexandria',
        city: 'Sidi Gaber',
        status: 'ACTIVE',
        images: ['https://placehold.co/400x400?text=Xiaomi14'],
        listingType: 'DIRECT_SALE',
      },
    }),
  ]);
  console.log(`   ✅ منى الموبايلات: ${items8.length} منتجات`);

  // Items for User 9 (Cars for barter)
  const items9 = await Promise.all([
    prisma.item.create({
      data: {
        sellerId: user9.id,
        title: 'تويوتا كامري 2022 للمقايضة',
        description: 'تويوتا كامري 2022، 30,000 كم، فل كامل. أقبل مقايضة بسيارة SUV.',
        categoryId: vehicles?.id,
        condition: 'LIKE_NEW',
        estimatedValue: 950000,
        governorate: 'Giza',
        city: '6th of October',
        status: 'ACTIVE',
        images: ['https://placehold.co/400x400?text=Camry'],
        listingType: 'BARTER',
        desiredItemTitle: 'سيارة SUV',
        desiredItemDescription: 'RAV4 أو Tucson أو ما يعادلها',
        vehicleBrand: 'Toyota',
        vehicleModel: 'Camry',
        vehicleYear: 2022,
        vehicleKilometers: 30000,
      },
    }),
  ]);
  console.log(`   ✅ علي السيارات: ${items9.length} منتجات`);

  // Items for User 10 (Buyer looking for items)
  const items10 = await Promise.all([
    prisma.item.create({
      data: {
        sellerId: user10.id,
        title: 'أبحث عن ثلاجة سامسونج',
        description: 'أبحث عن ثلاجة سامسونج أو LG، 18-22 قدم، نوفروست.',
        categoryId: homeAppliances?.id,
        condition: 'GOOD',
        estimatedValue: 25000,
        governorate: 'Cairo',
        city: 'Heliopolis',
        status: 'ACTIVE',
        images: ['https://placehold.co/400x400?text=Wanted'],
        listingType: 'DIRECT_BUY',
      },
    }),
  ]);
  console.log(`   ✅ هدى المشتريات: ${items10.length} منتجات`);

  // =====================================================
  // 5. CREATE LISTINGS FOR ITEMS
  // =====================================================
  console.log('\n📋 إنشاء القوائم (Listings)...');

  // Create listings for direct sale items
  const listing1 = await prisma.listing.create({
    data: {
      itemId: items1[0].id,
      userId: user1.id,
      listingType: 'DIRECT_SALE',
      price: 75000,
      status: 'ACTIVE',
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      itemId: items1[1].id,
      userId: user1.id,
      listingType: 'DIRECT_SALE',
      price: 55000,
      status: 'ACTIVE',
    },
  });

  // Create auction listings
  const auctionListing1 = await prisma.listing.create({
    data: {
      itemId: items3[0].id,
      userId: user3.id,
      listingType: 'AUCTION',
      startingBid: 80000,
      currentBid: 95000,
      bidIncrement: 5000,
      reservePrice: 100000,
      status: 'ACTIVE',
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  const auctionListing2 = await prisma.listing.create({
    data: {
      itemId: items3[1].id,
      userId: user3.id,
      listingType: 'AUCTION',
      startingBid: 30000,
      currentBid: 45000,
      bidIncrement: 2000,
      status: 'ACTIVE',
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    },
  });

  // Create mobile listings
  const mobileListing1 = await prisma.listing.create({
    data: {
      itemId: items8[0].id,
      userId: user8.id,
      listingType: 'DIRECT_SALE',
      price: 45000,
      status: 'ACTIVE',
    },
  });

  console.log(`   ✅ تم إنشاء 5 قوائم`);

  // =====================================================
  // 6. CREATE AUCTIONS WITH BIDS
  // =====================================================
  console.log('\n🔨 إنشاء المزادات والعروض...');

  // Create auction record
  const auction1 = await prisma.auction.create({
    data: {
      listingId: auctionListing1.id,
      startingPrice: 80000,
      currentPrice: 95000,
      minBidIncrement: 5000,
      reservePrice: 100000,
      startTime: new Date(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
    },
  });

  // Create bids on auction
  await prisma.auctionBid.createMany({
    data: [
      {
        listingId: auctionListing1.id,
        auctionId: auction1.id,
        bidderId: user5.id,
        amount: 85000,
        status: 'OUTBID',
      },
      {
        listingId: auctionListing1.id,
        auctionId: auction1.id,
        bidderId: user10.id,
        amount: 90000,
        status: 'OUTBID',
      },
      {
        listingId: auctionListing1.id,
        auctionId: auction1.id,
        bidderId: user5.id,
        amount: 95000,
        status: 'ACTIVE',
      },
    ],
  });

  console.log(`   ✅ تم إنشاء مزاد مع 3 عروض`);

  // =====================================================
  // 7. CREATE REVERSE AUCTION (TENDER)
  // =====================================================
  console.log('\n📢 إنشاء المناقصات (المزادات العكسية)...');

  const reverseAuction = await prisma.reverseAuction.create({
    data: {
      buyerId: user6.id,
      title: 'مناقصة: 100 لابتوب للشركة',
      description: 'نحتاج 100 لابتوب Dell أو HP للشركة، مواصفات: Core i5، 8GB RAM، 256GB SSD.',
      categoryId: computers?.id,
      quantity: 100,
      maxBudget: 1500000,
      status: 'OPEN',
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      governorate: 'Cairo',
      city: 'Maadi',
    },
  });

  // Add bids to reverse auction
  await prisma.reverseAuctionBid.createMany({
    data: [
      {
        reverseAuctionId: reverseAuction.id,
        sellerId: user1.id,
        itemId: items1[1].id,
        pricePerUnit: 14000,
        totalPrice: 1400000,
        deliveryDays: 14,
        warranty: '1 year warranty',
        notes: 'Dell Latitude 5540, original with warranty',
        status: 'PENDING',
      },
      {
        reverseAuctionId: reverseAuction.id,
        sellerId: user8.id,
        itemId: items8[1].id,
        pricePerUnit: 13500,
        totalPrice: 1350000,
        deliveryDays: 10,
        warranty: '2 year warranty',
        notes: 'HP ProBook 450 G10, brand new',
        status: 'PENDING',
      },
    ],
  });

  console.log(`   ✅ تم إنشاء مناقصة مع 2 عروض`);

  // =====================================================
  // 8. CREATE BARTER OFFERS
  // =====================================================
  console.log('\n🔄 إنشاء عروض المقايضة...');

  // Pending barter offer (Samsung for iPhone)
  const barterOffer1 = await prisma.barterOffer.create({
    data: {
      initiatorId: user2.id,
      recipientId: user1.id,
      offeredItemIds: [items2[0].id],
      offeredBundleValue: 60000,
      status: 'PENDING',
      notes: 'أعرض سامسونج S24 Ultra للمقايضة بآيفون 15 برو ماكس',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      marketType: 'NATIONAL',
    },
  });

  // Accepted barter offer (Car for Car)
  const barterOffer2 = await prisma.barterOffer.create({
    data: {
      initiatorId: user9.id,
      recipientId: user3.id,
      offeredItemIds: [items9[0].id],
      offeredBundleValue: 950000,
      status: 'ACCEPTED',
      notes: 'مقايضة تويوتا كامري بمرسيدس',
      respondedAt: new Date(),
      marketType: 'NATIONAL',
    },
  });

  // Open barter offer (Sofa for anything)
  const barterOffer3 = await prisma.barterOffer.create({
    data: {
      initiatorId: user2.id,
      offeredItemIds: [items2[1].id],
      offeredBundleValue: 25000,
      status: 'PENDING',
      isOpenOffer: true,
      notes: 'أريكة جلد للمقايضة - أقبل عروض متنوعة',
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      marketType: 'GOVERNORATE',
      governorate: 'Alexandria',
    },
  });

  console.log(`   ✅ تم إنشاء 3 عروض مقايضة`);

  // =====================================================
  // 9. CREATE BARTER CHAIN (SMART BARTER)
  // =====================================================
  console.log('\n⛓️ إنشاء سلسلة مقايضة ذكية...');

  const barterChain = await prisma.barterChain.create({
    data: {
      chainType: 'CYCLE',
      participantCount: 3,
      matchScore: 0.95,
      algorithmVersion: '2.0',
      description: 'سلسلة مقايضة: سارة ← أحمد ← منى ← سارة',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  // Add participants to chain
  await prisma.barterParticipant.createMany({
    data: [
      {
        chainId: barterChain.id,
        userId: user2.id,
        givingItemId: items2[0].id,
        receivingItemId: items8[0].id,
        position: 0,
        status: 'ACCEPTED',
        respondedAt: new Date(),
      },
      {
        chainId: barterChain.id,
        userId: user1.id,
        givingItemId: items1[0].id,
        receivingItemId: items2[0].id,
        position: 1,
        status: 'PENDING',
      },
      {
        chainId: barterChain.id,
        userId: user8.id,
        givingItemId: items8[0].id,
        receivingItemId: items1[0].id,
        position: 2,
        status: 'PENDING',
      },
    ],
  });

  console.log(`   ✅ تم إنشاء سلسلة مقايضة ذكية مع 3 مشاركين`);

  // =====================================================
  // 10. CREATE ORDERS WITH PAYMENTS
  // =====================================================
  console.log('\n🛒 إنشاء الطلبات والمدفوعات...');

  // Get shipping addresses
  const shippingAddr10 = await prisma.shippingAddress.findFirst({
    where: { userId: user10.id },
  });

  if (shippingAddr10) {
    // Completed order
    const order1 = await prisma.order.create({
      data: {
        userId: user10.id,
        orderNumber: generateOrderNumber(),
        status: 'DELIVERED',
        subtotal: 45000,
        shippingCost: 100,
        total: 45100,
        shippingAddressId: shippingAddr10.id,
        paymentMethod: 'CARD',
        paymentId: 'PAY_' + Date.now(),
        paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        shippedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.orderItem.create({
      data: {
        orderId: order1.id,
        listingId: mobileListing1.id,
        sellerId: user8.id,
        quantity: 1,
        price: 45000,
      },
    });

    // Pending order
    const order2 = await prisma.order.create({
      data: {
        userId: user10.id,
        orderNumber: generateOrderNumber(),
        status: 'PROCESSING',
        subtotal: 55000,
        shippingCost: 150,
        total: 55150,
        shippingAddressId: shippingAddr10.id,
        paymentMethod: 'COD',
        paidAt: new Date(),
      },
    });

    await prisma.orderItem.create({
      data: {
        orderId: order2.id,
        listingId: listing2.id,
        sellerId: user1.id,
        quantity: 1,
        price: 55000,
      },
    });

    console.log(`   ✅ تم إنشاء 2 طلبات`);
  }

  // =====================================================
  // 11. CREATE NOTIFICATIONS
  // =====================================================
  console.log('\n🔔 إنشاء الإشعارات...');

  const notifications = [
    // Barter match notification for User 1
    {
      userId: user1.id,
      type: 'BARTER_OFFER_RECEIVED',
      title: '🔄 عرض مقايضة جديد!',
      message: 'سارة المقايضة تعرض Samsung S24 Ultra مقابل iPhone 15 Pro Max الخاص بك',
      priority: 'HIGH',
      entityType: 'BARTER_OFFER',
      entityId: barterOffer1.id,
      actionUrl: `/barter/respond/${barterOffer1.id}`,
      actionText: 'عرض التفاصيل',
      isRead: false,
    },
    // Barter chain notification for User 1
    {
      userId: user1.id,
      type: 'BARTER_CHAIN_PROPOSED',
      title: '⛓️ فرصة مقايضة ذكية!',
      message: 'تم إيجاد سلسلة مقايضة مناسبة لمنتجك - 3 أطراف متطابقة',
      priority: 'HIGH',
      entityType: 'BARTER_CHAIN',
      entityId: barterChain.id,
      actionUrl: `/barter/chains/${barterChain.id}`,
      actionText: 'عرض السلسلة',
      isRead: false,
    },
    // Barter chain notification for User 8
    {
      userId: user8.id,
      type: 'BARTER_CHAIN_PROPOSED',
      title: '⛓️ فرصة مقايضة ذكية!',
      message: 'تم إيجاد سلسلة مقايضة مناسبة - يمكنك الحصول على iPhone 15 Pro Max',
      priority: 'HIGH',
      entityType: 'BARTER_CHAIN',
      entityId: barterChain.id,
      actionUrl: `/barter/chains/${barterChain.id}`,
      actionText: 'عرض السلسلة',
      isRead: false,
    },
    // Auction outbid notification for User 10
    {
      userId: user10.id,
      type: 'AUCTION_OUTBID',
      title: '⚠️ تم تجاوز عرضك!',
      message: 'تم تجاوز عرضك على كاميرا سوني A7IV - العرض الحالي 95,000 جنيه',
      priority: 'HIGH',
      entityType: 'AUCTION',
      entityId: auction1.id,
      actionUrl: `/auctions/${auction1.id}`,
      actionText: 'زيادة العرض',
      isRead: false,
    },
    // Tender bid notification for User 6
    {
      userId: user6.id,
      type: 'REVERSE_AUCTION_BID_RECEIVED',
      title: '📢 عروض جديدة على مناقصتك!',
      message: 'تم استلام 2 عروض على مناقصة اللابتوبات - راجع العروض',
      priority: 'MEDIUM',
      entityType: 'REVERSE_AUCTION',
      entityId: reverseAuction.id,
      actionUrl: `/tenders/${reverseAuction.id}`,
      actionText: 'عرض العروض',
      isRead: false,
    },
    // Order shipped notification for User 10
    {
      userId: user10.id,
      type: 'ORDER_SHIPPED',
      title: '🚚 تم شحن طلبك!',
      message: 'طلبك MacBook Air M3 في الطريق إليك',
      priority: 'MEDIUM',
      entityType: 'ORDER',
      actionUrl: '/dashboard/orders',
      actionText: 'تتبع الطلب',
      isRead: false,
    },
    // Item sold notification for User 8
    {
      userId: user8.id,
      type: 'ITEM_SOLD',
      title: '🎉 تم بيع منتجك!',
      message: 'تم بيع iPhone 14 Pro بمبلغ 45,000 جنيه',
      priority: 'HIGH',
      entityType: 'ORDER',
      actionUrl: '/dashboard/transactions',
      actionText: 'عرض التفاصيل',
      isRead: false,
    },
    // Barter match suggestion for User 2
    {
      userId: user2.id,
      type: 'BARTER_MATCH_FOUND',
      title: '✨ تطابق مقايضة مثالي!',
      message: 'وجدنا منتجات تطابق ما تبحث عنه لمقايضة Samsung S24 Ultra',
      priority: 'HIGH',
      entityType: 'ITEM',
      entityId: items1[0].id,
      actionUrl: `/items/${items1[0].id}`,
      actionText: 'عرض التطابق',
      isRead: false,
    },
    // Price drop alert
    {
      userId: user10.id,
      type: 'PRICE_DROP',
      title: '💰 انخفاض سعر!',
      message: 'انخفض سعر MacBook Air M3 من 60,000 إلى 55,000 جنيه',
      priority: 'MEDIUM',
      entityType: 'ITEM',
      entityId: items1[1].id,
      actionUrl: `/items/${items1[1].id}`,
      actionText: 'شراء الآن',
      isRead: false,
    },
    // Review request
    {
      userId: user10.id,
      type: 'REVIEW_REQUEST',
      title: '⭐ قيّم تجربتك',
      message: 'كيف كانت تجربتك مع منى الموبايلات؟ شاركنا رأيك',
      priority: 'LOW',
      entityType: 'USER',
      entityId: user8.id,
      actionUrl: `/users/${user8.id}/review`,
      actionText: 'كتابة تقييم',
      isRead: false,
    },
  ];

  for (const notif of notifications) {
    await prisma.notification.create({ data: notif as any });
  }

  console.log(`   ✅ تم إنشاء ${notifications.length} إشعارات`);

  // =====================================================
  // 12. CREATE TRANSACTIONS RECORD
  // =====================================================
  console.log('\n💰 إنشاء سجلات المعاملات...');

  await prisma.transaction.createMany({
    data: [
      {
        buyerId: user10.id,
        sellerId: user8.id,
        listingId: mobileListing1.id,
        transactionType: 'DIRECT_SALE',
        status: 'COMPLETED',
        amount: 45000,
        platformFee: 450,
        sellerAmount: 44550,
        paymentMethod: 'CARD',
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        buyerId: user10.id,
        sellerId: user1.id,
        listingId: listing2.id,
        transactionType: 'DIRECT_SALE',
        status: 'PENDING',
        amount: 55000,
        platformFee: 550,
        sellerAmount: 54450,
        paymentMethod: 'COD',
      },
    ],
  });

  console.log(`   ✅ تم إنشاء 2 سجل معاملات`);

  // =====================================================
  // SUMMARY
  // =====================================================
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('                    ✅ اكتمل إنشاء بيانات UAT                           ');
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  📊 ملخص البيانات المُنشأة:');
  console.log('  ─────────────────────────────');
  console.log('  • 10 مستخدمين اختباريين (test1-test10@xchange.eg)');
  console.log('  • 10+ منتجات متنوعة');
  console.log('  • 5 قوائم نشطة');
  console.log('  • 1 مزاد نشط مع 3 عروض');
  console.log('  • 1 مناقصة مع 2 عروض');
  console.log('  • 3 عروض مقايضة');
  console.log('  • 1 سلسلة مقايضة ذكية');
  console.log('  • 2 طلبات (مكتمل + قيد المعالجة)');
  console.log('  • 10 إشعارات تتطلب استجابة');
  console.log('');
  console.log('  🔐 كلمة المرور لجميع الحسابات: Test@1234');
  console.log('');
  console.log('  📱 الإشعارات المهمة:');
  console.log('  ─────────────────────');
  console.log('  • test1: عرض مقايضة + سلسلة مقايضة ذكية');
  console.log('  • test2: تطابق مقايضة مثالي');
  console.log('  • test6: عروض على المناقصة');
  console.log('  • test8: سلسلة مقايضة + بيع منتج');
  console.log('  • test10: تجاوز عرض + شحن طلب + طلب تقييم');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════\n');
}

seedUATTransactions()
  .catch((e) => {
    console.error('❌ خطأ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
