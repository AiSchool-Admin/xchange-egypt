import {
  PrismaClient,
  BarterOfferStatus,
  ItemStatus,
  ItemCondition,
} from '@prisma/client';

const prisma = new PrismaClient();

async function seedBarterMarketplace() {
  console.log('🔄 Seeding Barter Marketplace Demo Data...\n');

  // Get users
  const ahmed = await prisma.user.findUnique({ where: { email: 'ahmed.mohamed@example.com' } });
  const fatma = await prisma.user.findUnique({ where: { email: 'fatma.ali@example.com' } });
  const khaled = await prisma.user.findUnique({ where: { email: 'khaled.hassan@example.com' } });
  const mona = await prisma.user.findUnique({ where: { email: 'mona.ibrahim@example.com' } });
  const omar = await prisma.user.findUnique({ where: { email: 'omar.saeed@example.com' } });
  const techStore = await prisma.user.findUnique({ where: { email: 'contact@techstore.eg' } });

  if (!ahmed || !fatma || !khaled || !mona || !omar || !techStore) {
    console.error('❌ Required users not found. Run seed-users.ts first');
    process.exit(1);
  }

  // Get categories
  const electronicsCategory = await prisma.category.findFirst({
    where: { nameEn: { contains: 'Electronics' } },
  });
  const furnitureCategory = await prisma.category.findFirst({
    where: { nameEn: { contains: 'Furniture' } },
  });
  const vehiclesCategory = await prisma.category.findFirst({
    where: { nameEn: { contains: 'Vehicles' } },
  });
  const clothingCategory = await prisma.category.findFirst({
    where: { nameEn: { contains: 'Clothing' } },
  });

  console.log('📦 Creating Barter-Ready Items...');

  // Create items specifically for bartering
  const barterItems = await Promise.all([
    // Ahmed's items
    prisma.item.upsert({
      where: { id: 'barter-item-001' },
      update: {},
      create: {
        id: 'barter-item-001',
        title: 'آيفون 14 برو ماكس',
        titleAr: 'آيفون 14 برو ماكس',
        titleEn: 'iPhone 14 Pro Max',
        description: 'آيفون 14 برو ماكس 256 جيجا، حالة ممتازة، مع جميع الملحقات الأصلية',
        descriptionAr: 'آيفون 14 برو ماكس 256 جيجا، حالة ممتازة، مع جميع الملحقات الأصلية',
        descriptionEn: 'iPhone 14 Pro Max 256GB, excellent condition with all original accessories',
        sellerId: ahmed.id,
        categoryId: electronicsCategory?.id,
        condition: ItemCondition.LIKE_NEW,
        status: ItemStatus.ACTIVE,
        estimatedValue: 35000,
        availableForBarter: true,
        governorate: 'القاهرة',
        city: 'مدينة نصر',
        desiredItemTitle: 'لابتوب MacBook Pro',
        desiredItemDescription: 'أبحث عن MacBook Pro حديث للمقايضة',
      },
    }),
    prisma.item.upsert({
      where: { id: 'barter-item-002' },
      update: {},
      create: {
        id: 'barter-item-002',
        title: 'كاميرا Canon EOS R6',
        titleAr: 'كاميرا Canon EOS R6',
        titleEn: 'Canon EOS R6 Camera',
        description: 'كاميرا احترافية Canon EOS R6 مع عدسة 24-105mm',
        descriptionAr: 'كاميرا احترافية Canon EOS R6 مع عدسة 24-105mm',
        descriptionEn: 'Professional Canon EOS R6 camera with 24-105mm lens',
        sellerId: ahmed.id,
        categoryId: electronicsCategory?.id,
        condition: ItemCondition.GOOD,
        status: ItemStatus.ACTIVE,
        estimatedValue: 45000,
        availableForBarter: true,
        governorate: 'القاهرة',
        city: 'مدينة نصر',
        desiredItemTitle: 'سيارة أو أجهزة إلكترونية',
        desiredItemDescription: 'مفتوح لأي عروض مناسبة',
      },
    }),

    // Fatma's items
    prisma.item.upsert({
      where: { id: 'barter-item-003' },
      update: {},
      create: {
        id: 'barter-item-003',
        title: 'MacBook Pro M2',
        titleAr: 'ماك بوك برو M2',
        titleEn: 'MacBook Pro M2',
        description: 'MacBook Pro M2 2023، 16 جيجا رام، 512 SSD، ضمان سنة',
        descriptionAr: 'MacBook Pro M2 2023، 16 جيجا رام، 512 SSD، ضمان سنة',
        descriptionEn: 'MacBook Pro M2 2023, 16GB RAM, 512GB SSD, 1 year warranty',
        sellerId: fatma.id,
        categoryId: electronicsCategory?.id,
        condition: ItemCondition.NEW,
        status: ItemStatus.ACTIVE,
        estimatedValue: 55000,
        availableForBarter: true,
        governorate: 'الإسكندرية',
        city: 'سموحة',
        desiredItemTitle: 'آيفون + كاميرا',
        desiredItemDescription: 'أبحث عن آيفون حديث مع كاميرا احترافية للمقايضة',
      },
    }),
    prisma.item.upsert({
      where: { id: 'barter-item-004' },
      update: {},
      create: {
        id: 'barter-item-004',
        title: 'طقم غرفة نوم كاملة',
        titleAr: 'طقم غرفة نوم كاملة',
        titleEn: 'Complete Bedroom Set',
        description: 'طقم غرفة نوم كامل خشب زان، سرير + دولاب + تسريحة + 2 كومودينو',
        descriptionAr: 'طقم غرفة نوم كامل خشب زان، سرير + دولاب + تسريحة + 2 كومودينو',
        descriptionEn: 'Complete beech wood bedroom set, bed + wardrobe + dresser + 2 nightstands',
        sellerId: fatma.id,
        categoryId: furnitureCategory?.id,
        condition: ItemCondition.GOOD,
        status: ItemStatus.ACTIVE,
        estimatedValue: 25000,
        availableForBarter: true,
        governorate: 'الإسكندرية',
        city: 'سموحة',
      },
    }),

    // Khaled's items
    prisma.item.upsert({
      where: { id: 'barter-item-005' },
      update: {},
      create: {
        id: 'barter-item-005',
        title: 'بلايستيشن 5 + ألعاب',
        titleAr: 'بلايستيشن 5 + ألعاب',
        titleEn: 'PlayStation 5 + Games',
        description: 'PS5 Digital Edition مع 5 ألعاب أصلية ويد إضافية',
        descriptionAr: 'PS5 Digital Edition مع 5 ألعاب أصلية ويد إضافية',
        descriptionEn: 'PS5 Digital Edition with 5 original games and extra controller',
        sellerId: khaled.id,
        categoryId: electronicsCategory?.id,
        condition: ItemCondition.LIKE_NEW,
        status: ItemStatus.ACTIVE,
        estimatedValue: 18000,
        availableForBarter: true,
        governorate: 'الجيزة',
        city: '6 أكتوبر',
        desiredItemTitle: 'لابتوب أو تابلت',
        desiredItemDescription: 'أبحث عن لابتوب للدراسة أو iPad Pro',
      },
    }),
    prisma.item.upsert({
      where: { id: 'barter-item-006' },
      update: {},
      create: {
        id: 'barter-item-006',
        title: 'دراجة نارية Honda PCX 150',
        titleAr: 'دراجة نارية Honda PCX 150',
        titleEn: 'Honda PCX 150 Motorcycle',
        description: 'دراجة هوندا PCX 150 موديل 2022، ماشية 5000 كم، حالة ممتازة',
        descriptionAr: 'دراجة هوندا PCX 150 موديل 2022، ماشية 5000 كم، حالة ممتازة',
        descriptionEn: 'Honda PCX 150 2022 model, 5000km, excellent condition',
        sellerId: khaled.id,
        categoryId: vehiclesCategory?.id,
        condition: ItemCondition.LIKE_NEW,
        status: ItemStatus.ACTIVE,
        estimatedValue: 65000,
        availableForBarter: true,
        governorate: 'الجيزة',
        city: '6 أكتوبر',
        desiredItemTitle: 'سيارة صغيرة',
        desiredItemDescription: 'أبحث عن سيارة صغيرة مستعملة بحالة جيدة',
      },
    }),

    // Mona's items
    prisma.item.upsert({
      where: { id: 'barter-item-007' },
      update: {},
      create: {
        id: 'barter-item-007',
        title: 'ثلاجة سامسونج 20 قدم',
        titleAr: 'ثلاجة سامسونج 20 قدم',
        titleEn: 'Samsung 20ft Refrigerator',
        description: 'ثلاجة سامسونج 20 قدم، نوفروست، شاشة ديجيتال، موفرة للطاقة',
        descriptionAr: 'ثلاجة سامسونج 20 قدم، نوفروست، شاشة ديجيتال، موفرة للطاقة',
        descriptionEn: 'Samsung 20ft refrigerator, no frost, digital display, energy efficient',
        sellerId: mona.id,
        categoryId: electronicsCategory?.id,
        condition: ItemCondition.GOOD,
        status: ItemStatus.ACTIVE,
        estimatedValue: 15000,
        availableForBarter: true,
        governorate: 'القاهرة',
        city: 'المعادي',
      },
    }),
    prisma.item.upsert({
      where: { id: 'barter-item-008' },
      update: {},
      create: {
        id: 'barter-item-008',
        title: 'مجموعة مجوهرات ذهبية',
        titleAr: 'مجموعة مجوهرات ذهبية',
        titleEn: 'Gold Jewelry Set',
        description: 'طقم ذهب عيار 21، عقد + حلق + خاتم، وزن 50 جرام',
        descriptionAr: 'طقم ذهب عيار 21، عقد + حلق + خاتم، وزن 50 جرام',
        descriptionEn: '21k gold set, necklace + earrings + ring, 50 grams total',
        sellerId: mona.id,
        categoryId: clothingCategory?.id,
        condition: ItemCondition.LIKE_NEW,
        status: ItemStatus.ACTIVE,
        estimatedValue: 120000,
        availableForBarter: true,
        governorate: 'القاهرة',
        city: 'المعادي',
        desiredItemTitle: 'سيارة أو عقار',
        desiredItemDescription: 'مقايضة بسيارة حديثة أو جزء من قيمة شقة',
      },
    }),

    // Omar's items
    prisma.item.upsert({
      where: { id: 'barter-item-009' },
      update: {},
      create: {
        id: 'barter-item-009',
        title: 'جيتار Fender Stratocaster',
        titleAr: 'جيتار فيندر ستراتوكاستر',
        titleEn: 'Fender Stratocaster Guitar',
        description: 'جيتار كهربائي Fender Stratocaster أمريكي أصلي مع أمبليفاير',
        descriptionAr: 'جيتار كهربائي Fender Stratocaster أمريكي أصلي مع أمبليفاير',
        descriptionEn: 'Original American Fender Stratocaster electric guitar with amplifier',
        sellerId: omar.id,
        categoryId: electronicsCategory?.id,
        condition: ItemCondition.GOOD,
        status: ItemStatus.ACTIVE,
        estimatedValue: 22000,
        availableForBarter: true,
        governorate: 'القاهرة',
        city: 'الدقي',
        desiredItemTitle: 'كاميرا أو معدات صوت',
        desiredItemDescription: 'أبحث عن كاميرا فيديو أو معدات تسجيل صوت',
      },
    }),
    prisma.item.upsert({
      where: { id: 'barter-item-010' },
      update: {},
      create: {
        id: 'barter-item-010',
        title: 'iPad Pro 12.9 مع قلم',
        titleAr: 'iPad Pro 12.9 مع قلم',
        titleEn: 'iPad Pro 12.9 with Pencil',
        description: 'iPad Pro 12.9 inch M2 chip، 256 جيجا، مع Apple Pencil 2',
        descriptionAr: 'iPad Pro 12.9 inch M2 chip، 256 جيجا، مع Apple Pencil 2',
        descriptionEn: 'iPad Pro 12.9 inch M2 chip, 256GB with Apple Pencil 2',
        sellerId: omar.id,
        categoryId: electronicsCategory?.id,
        condition: ItemCondition.LIKE_NEW,
        status: ItemStatus.ACTIVE,
        estimatedValue: 28000,
        availableForBarter: true,
        governorate: 'القاهرة',
        city: 'الدقي',
      },
    }),
  ]);

  console.log(`✅ Created ${barterItems.length} barter items\n`);

  console.log('🔄 Creating Barter Offers...');

  // Create diverse barter offers
  const offers = await Promise.all([
    // Pending offers
    prisma.barterOffer.create({
      data: {
        initiatorId: ahmed.id,
        recipientId: fatma.id,
        offeredBundleValue: 35000,
        message: 'مرحباً! أعرض مقايضة الآيفون الخاص بي بالماك بوك. يمكنني إضافة فرق نقدي إذا لزم الأمر.',
        status: BarterOfferStatus.PENDING,
        isOpenOffer: false,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        preferenceSets: {
          create: {
            priority: 1,
            description: 'آيفون 14 برو ماكس للمقايضة',
            items: {
              create: {
                itemId: 'barter-item-001',
              },
            },
          },
        },
        itemRequests: {
          create: {
            description: 'MacBook Pro M2',
            categoryId: electronicsCategory?.id,
            minValue: 50000,
            maxValue: 60000,
          },
        },
      },
    }),

    prisma.barterOffer.create({
      data: {
        initiatorId: khaled.id,
        recipientId: omar.id,
        offeredBundleValue: 18000,
        message: 'أريد مقايضة البلايستيشن بالآيباد. هل العرض مناسب؟',
        status: BarterOfferStatus.PENDING,
        isOpenOffer: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        preferenceSets: {
          create: {
            priority: 1,
            description: 'PS5 + ألعاب',
            items: {
              create: {
                itemId: 'barter-item-005',
              },
            },
          },
        },
      },
    }),

    // Open offers (visible to all)
    prisma.barterOffer.create({
      data: {
        initiatorId: ahmed.id,
        offeredBundleValue: 45000,
        message: 'كاميرا Canon EOS R6 احترافية للمقايضة. مفتوح لجميع العروض المناسبة!',
        status: BarterOfferStatus.PENDING,
        isOpenOffer: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        preferenceSets: {
          create: {
            priority: 1,
            description: 'كاميرا Canon EOS R6',
            items: {
              create: {
                itemId: 'barter-item-002',
              },
            },
          },
        },
        itemRequests: {
          create: [
            {
              description: 'لابتوب احترافي',
              categoryId: electronicsCategory?.id,
              minValue: 40000,
              maxValue: 50000,
            },
            {
              description: 'أو معدات تصوير أخرى',
              categoryId: electronicsCategory?.id,
              minValue: 35000,
              maxValue: 50000,
            },
          ],
        },
      },
    }),

    prisma.barterOffer.create({
      data: {
        initiatorId: khaled.id,
        offeredBundleValue: 65000,
        message: 'دراجة هوندا PCX 150 للمقايضة بسيارة صغيرة. الدراجة حالتها ممتازة!',
        status: BarterOfferStatus.PENDING,
        isOpenOffer: true,
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        preferenceSets: {
          create: {
            priority: 1,
            description: 'دراجة هوندا PCX 150',
            items: {
              create: {
                itemId: 'barter-item-006',
              },
            },
          },
        },
        itemRequests: {
          create: {
            description: 'سيارة مستعملة بحالة جيدة',
            categoryId: vehiclesCategory?.id,
            minValue: 50000,
            maxValue: 100000,
          },
        },
      },
    }),

    prisma.barterOffer.create({
      data: {
        initiatorId: mona.id,
        offeredBundleValue: 120000,
        message: 'طقم ذهب عيار 21 للمقايضة. أبحث عن سيارة أو جزء من قيمة شقة.',
        status: BarterOfferStatus.PENDING,
        isOpenOffer: true,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        preferenceSets: {
          create: {
            priority: 1,
            description: 'مجموعة مجوهرات ذهبية 50 جرام',
            items: {
              create: {
                itemId: 'barter-item-008',
              },
            },
          },
        },
      },
    }),

    prisma.barterOffer.create({
      data: {
        initiatorId: omar.id,
        offeredBundleValue: 22000,
        message: 'جيتار Fender أمريكي أصلي للمقايضة بكاميرا أو معدات صوت.',
        status: BarterOfferStatus.PENDING,
        isOpenOffer: true,
        expiresAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        preferenceSets: {
          create: {
            priority: 1,
            description: 'جيتار Fender Stratocaster',
            items: {
              create: {
                itemId: 'barter-item-009',
              },
            },
          },
        },
        itemRequests: {
          create: {
            description: 'كاميرا فيديو أو معدات تسجيل صوت',
            categoryId: electronicsCategory?.id,
            minValue: 15000,
            maxValue: 30000,
          },
        },
      },
    }),

    // Accepted offer
    prisma.barterOffer.create({
      data: {
        initiatorId: fatma.id,
        recipientId: mona.id,
        offeredBundleValue: 25000,
        message: 'تمت الموافقة! سنلتقي في المعادي يوم السبت لإتمام المقايضة.',
        status: BarterOfferStatus.ACCEPTED,
        isOpenOffer: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        preferenceSets: {
          create: {
            priority: 1,
            description: 'طقم غرفة نوم',
            items: {
              create: {
                itemId: 'barter-item-004',
              },
            },
          },
        },
      },
    }),

    // Completed offer
    prisma.barterOffer.create({
      data: {
        initiatorId: omar.id,
        recipientId: khaled.id,
        offeredBundleValue: 28000,
        message: 'تمت المقايضة بنجاح! شكراً على التعامل الراقي.',
        status: BarterOfferStatus.COMPLETED,
        isOpenOffer: false,
        expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        preferenceSets: {
          create: {
            priority: 1,
            description: 'iPad Pro 12.9',
            items: {
              create: {
                itemId: 'barter-item-010',
              },
            },
          },
        },
      },
    }),
  ]);

  console.log(`✅ Created ${offers.length} barter offers\n`);

  console.log('🤝 Creating Barter Pools...');

  // Create barter pools
  const pools = await Promise.all([
    prisma.barterPool.create({
      data: {
        title: 'صندوق شراء MacBook Pro جماعي',
        description: 'نجمع منتجاتنا للحصول على MacBook Pro M3 جديد. كل مشارك يساهم بقيمة منتجاته.',
        targetDescription: 'MacBook Pro M3 Pro 14 inch - 18GB RAM - 512GB SSD',
        targetMinValue: 80000,
        targetMaxValue: 95000,
        currentValue: 45000,
        creatorId: ahmed.id,
        status: 'OPEN',
        minParticipants: 3,
        maxParticipants: 5,
        participantCount: 2,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        participants: {
          create: [
            {
              userId: ahmed.id,
              status: 'APPROVED',
              contribution: {
                cashAmount: 25000,
              },
            },
            {
              userId: fatma.id,
              status: 'APPROVED',
              contribution: {
                cashAmount: 20000,
              },
            },
          ],
        },
      },
    }),

    prisma.barterPool.create({
      data: {
        title: 'صندوق شراء كاميرا سينمائية',
        description: 'للمصورين المحترفين: نجمع لشراء كاميرا Blackmagic Cinema Camera للاستخدام المشترك.',
        targetDescription: 'Blackmagic Cinema Camera 6K Pro',
        targetMinValue: 120000,
        targetMaxValue: 140000,
        currentValue: 65000,
        creatorId: khaled.id,
        status: 'OPEN',
        minParticipants: 4,
        maxParticipants: 6,
        participantCount: 3,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        participants: {
          create: [
            {
              userId: khaled.id,
              status: 'APPROVED',
              contribution: {
                cashAmount: 30000,
              },
            },
            {
              userId: omar.id,
              status: 'APPROVED',
              contribution: {
                cashAmount: 22000,
              },
            },
            {
              userId: ahmed.id,
              status: 'PENDING',
              contribution: {
                cashAmount: 15000,
              },
            },
          ],
        },
      },
    }),

    prisma.barterPool.create({
      data: {
        title: 'صندوق أثاث منزلي كامل',
        description: 'للعرسان الجدد: نجمع لشراء طقم أثاث غرفة معيشة كامل.',
        targetDescription: 'طقم غرفة معيشة كامل (صالون + سفرة + نيش)',
        targetMinValue: 60000,
        targetMaxValue: 75000,
        currentValue: 15000,
        creatorId: mona.id,
        status: 'OPEN',
        minParticipants: 3,
        maxParticipants: 4,
        participantCount: 1,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        participants: {
          create: [
            {
              userId: mona.id,
              status: 'APPROVED',
              contribution: {
                cashAmount: 15000,
              },
            },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${pools.length} barter pools\n`);

  console.log('🔗 Creating Barter Chains...');

  // Create barter chains (multi-party exchanges)
  const chains = await Promise.all([
    prisma.barterChain.create({
      data: {
        status: 'PROPOSED',
        totalValue: 83000,
        participantCount: 3,
        createdById: ahmed.id,
        participants: {
          create: [
            {
              userId: ahmed.id,
              offeredItemId: 'barter-item-001', // iPhone
              wantedItemId: 'barter-item-003', // MacBook
              order: 1,
              status: 'ACCEPTED',
            },
            {
              userId: fatma.id,
              offeredItemId: 'barter-item-003', // MacBook
              wantedItemId: 'barter-item-002', // Canon Camera
              order: 2,
              status: 'PENDING',
            },
            {
              userId: ahmed.id,
              offeredItemId: 'barter-item-002', // Canon Camera
              wantedItemId: 'barter-item-001', // iPhone (completing the chain)
              order: 3,
              status: 'PENDING',
            },
          ],
        },
      },
    }),

    prisma.barterChain.create({
      data: {
        status: 'PROPOSED',
        totalValue: 113000,
        participantCount: 4,
        createdById: khaled.id,
        participants: {
          create: [
            {
              userId: khaled.id,
              offeredItemId: 'barter-item-005', // PS5
              wantedItemId: 'barter-item-010', // iPad
              order: 1,
              status: 'PENDING',
            },
            {
              userId: omar.id,
              offeredItemId: 'barter-item-010', // iPad
              wantedItemId: 'barter-item-002', // Canon Camera
              order: 2,
              status: 'PENDING',
            },
            {
              userId: ahmed.id,
              offeredItemId: 'barter-item-002', // Canon Camera
              wantedItemId: 'barter-item-009', // Guitar
              order: 3,
              status: 'PENDING',
            },
            {
              userId: omar.id,
              offeredItemId: 'barter-item-009', // Guitar
              wantedItemId: 'barter-item-005', // PS5 (completing the chain)
              order: 4,
              status: 'PENDING',
            },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${chains.length} barter chains\n`);

  // Summary
  console.log('═'.repeat(60));
  console.log('✨ BARTER MARKETPLACE DEMO DATA SEEDED SUCCESSFULLY!');
  console.log('═'.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   • ${barterItems.length} Barter Items`);
  console.log(`   • ${offers.length} Barter Offers (Direct + Open)`);
  console.log(`   • ${pools.length} Barter Pools (Collective Trading)`);
  console.log(`   • ${chains.length} Barter Chains (Multi-party Exchange)`);
  console.log('\n🔐 Demo Users with Barter Items:');
  console.log('   • ahmed.mohamed@example.com - iPhone, Camera');
  console.log('   • fatma.ali@example.com - MacBook, Bedroom Set');
  console.log('   • khaled.hassan@example.com - PS5, Honda Motorcycle');
  console.log('   • mona.ibrahim@example.com - Refrigerator, Gold Jewelry');
  console.log('   • omar.saeed@example.com - Guitar, iPad Pro');
  console.log('\n🚀 Ready for barter marketplace testing!\n');
}

seedBarterMarketplace()
  .catch((e) => {
    console.error('❌ Error seeding barter marketplace:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
