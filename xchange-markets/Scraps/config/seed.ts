// prisma/seed.ts
// Xchange Scrap Marketplace - Database Seed Data

import { PrismaClient, UserType, QualityGrade, Unit, PriceSource, BusinessType, VehicleType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ==========================================
  // 1. MATERIAL CATEGORIES
  // ==========================================
  console.log('📁 Creating material categories...');

  const categories = await Promise.all([
    // معادن حديدية
    prisma.materialCategory.create({
      data: {
        nameAr: 'معادن حديدية',
        nameEn: 'Ferrous Metals',
        slug: 'ferrous-metals',
        iconUrl: '/icons/iron.svg',
        descriptionAr: 'الحديد والصلب وسبائكهما',
        descriptionEn: 'Iron, steel and their alloys',
        sortOrder: 1,
      },
    }),
    // معادن غير حديدية
    prisma.materialCategory.create({
      data: {
        nameAr: 'معادن غير حديدية',
        nameEn: 'Non-Ferrous Metals',
        slug: 'non-ferrous-metals',
        iconUrl: '/icons/copper.svg',
        descriptionAr: 'النحاس، الألومنيوم، الرصاص، الزنك',
        descriptionEn: 'Copper, Aluminium, Lead, Zinc',
        sortOrder: 2,
      },
    }),
    // بلاستيك
    prisma.materialCategory.create({
      data: {
        nameAr: 'بلاستيك',
        nameEn: 'Plastics',
        slug: 'plastics',
        iconUrl: '/icons/plastic.svg',
        descriptionAr: 'جميع أنواع البلاستيك القابل للتدوير',
        descriptionEn: 'All recyclable plastic types',
        sortOrder: 3,
      },
    }),
    // ورق وكرتون
    prisma.materialCategory.create({
      data: {
        nameAr: 'ورق وكرتون',
        nameEn: 'Paper & Cardboard',
        slug: 'paper-cardboard',
        iconUrl: '/icons/paper.svg',
        descriptionAr: 'الورق والكرتون بأنواعهما',
        descriptionEn: 'Paper and cardboard of all types',
        sortOrder: 4,
      },
    }),
    // إلكترونيات
    prisma.materialCategory.create({
      data: {
        nameAr: 'إلكترونيات',
        nameEn: 'Electronics',
        slug: 'electronics',
        iconUrl: '/icons/electronics.svg',
        descriptionAr: 'الأجهزة الإلكترونية والكهربائية',
        descriptionEn: 'Electronic and electrical devices',
        sortOrder: 5,
      },
    }),
    // أجهزة منزلية
    prisma.materialCategory.create({
      data: {
        nameAr: 'أجهزة منزلية',
        nameEn: 'Home Appliances',
        slug: 'home-appliances',
        iconUrl: '/icons/appliances.svg',
        descriptionAr: 'الأجهزة المنزلية الكبيرة والصغيرة',
        descriptionEn: 'Large and small home appliances',
        sortOrder: 6,
      },
    }),
    // زجاج
    prisma.materialCategory.create({
      data: {
        nameAr: 'زجاج',
        nameEn: 'Glass',
        slug: 'glass',
        iconUrl: '/icons/glass.svg',
        descriptionAr: 'الزجاج بأنواعه',
        descriptionEn: 'All types of glass',
        sortOrder: 7,
      },
    }),
    // مطاط
    prisma.materialCategory.create({
      data: {
        nameAr: 'مطاط وكاوتش',
        nameEn: 'Rubber',
        slug: 'rubber',
        iconUrl: '/icons/rubber.svg',
        descriptionAr: 'الإطارات والمطاط',
        descriptionEn: 'Tires and rubber',
        sortOrder: 8,
      },
    }),
  ]);

  const [ferrousCategory, nonFerrousCategory, plasticsCategory, paperCategory, electronicsCategory, appliancesCategory, glassCategory, rubberCategory] = categories;

  // ==========================================
  // 2. MATERIAL TYPES
  // ==========================================
  console.log('📦 Creating material types...');

  // معادن حديدية
  const ferrousMaterials = await Promise.all([
    prisma.materialType.create({
      data: {
        categoryId: ferrousCategory.id,
        nameAr: 'حديد خردة خليط',
        nameEn: 'Mixed Iron Scrap',
        slug: 'mixed-iron-scrap',
        descriptionAr: 'حديد خردة مخلوط من مصادر متعددة',
        unit: Unit.kg,
        minQuantity: 5,
        sortOrder: 1,
      },
    }),
    prisma.materialType.create({
      data: {
        categoryId: ferrousCategory.id,
        nameAr: 'حديد خردة ممتاز',
        nameEn: 'Premium Iron Scrap',
        slug: 'premium-iron-scrap',
        descriptionAr: 'حديد تسليح وصاج نظيف',
        unit: Unit.kg,
        minQuantity: 5,
        sortOrder: 2,
      },
    }),
    prisma.materialType.create({
      data: {
        categoryId: ferrousCategory.id,
        nameAr: 'خردة سيارات',
        nameEn: 'Car Scrap',
        slug: 'car-scrap',
        descriptionAr: 'هياكل السيارات المعدنية',
        unit: Unit.kg,
        minQuantity: 50,
        sortOrder: 3,
      },
    }),
    prisma.materialType.create({
      data: {
        categoryId: ferrousCategory.id,
        nameAr: 'صاج خردة',
        nameEn: 'Sheet Metal Scrap',
        slug: 'sheet-metal-scrap',
        descriptionAr: 'صاج معدني من مصادر مختلفة',
        unit: Unit.kg,
        minQuantity: 5,
        sortOrder: 4,
      },
    }),
    prisma.materialType.create({
      data: {
        categoryId: ferrousCategory.id,
        nameAr: 'مواسير زهر',
        nameEn: 'Cast Iron Pipes',
        slug: 'cast-iron-pipes',
        descriptionAr: 'مواسير حديد الزهر',
        unit: Unit.kg,
        minQuantity: 10,
        sortOrder: 5,
      },
    }),
  ]);

  // معادن غير حديدية
  const nonFerrousMaterials = await Promise.all([
    prisma.materialType.create({
      data: {
        categoryId: nonFerrousCategory.id,
        nameAr: 'نحاس أحمر خشن',
        nameEn: 'Rough Red Copper',
        slug: 'rough-red-copper',
        descriptionAr: 'نحاس أحمر غير منظف',
        unit: Unit.kg,
        minQuantity: 1,
        sortOrder: 1,
      },
    }),
    prisma.materialType.create({
      data: {
        categoryId: nonFerrousCategory.id,
        nameAr: 'نحاس أحمر لامع',
        nameEn: 'Shiny Red Copper',
        slug: 'shiny-red-copper',
        descriptionAr: 'نحاس أحمر نظيف ولامع',
        unit: Unit.kg,
        minQuantity: 1,
        sortOrder: 2,
      },
    }),
    prisma.materialType.create({
      data: {
        categoryId: nonFerrousCategory.id,
        nameAr: 'نحاس أصفر',
        nameEn: 'Yellow Copper (Brass)',
        slug: 'yellow-copper-brass',
        descriptionAr: 'النحاس الأصفر (البرونز)',
        unit: Unit.kg,
        minQuantity: 1,
        sortOrder: 3,
      },
    }),
    prisma.materialType.create({
      data: {
        categoryId: nonFerrousCategory.id,
        nameAr: 'ألومنيوم طري',
        nameEn: 'Soft Aluminium',
        slug: 'soft-aluminium',
        descriptionAr: 'ألومنيوم طري (علب، رقائق)',
        unit: Unit.kg,
        minQuantity: 1,
        sortOrder: 4,
      },
    }),
    prisma.materialType.create({
      data: {
        categoryId: nonFerrousCategory.id,
        nameAr: 'علب كانز',
        nameEn: 'Aluminium Cans',
        slug: 'aluminium-cans',
        descriptionAr: 'علب المشروبات الألومنيوم',
        unit: Unit.kg,
        minQuantity: 0.5,
        sortOrder: 5,
      },
    }),
    prisma.materialType.create({
      data: {
        categoryId: nonFerrousCategory.id,
        nameAr: 'استانلس 304',
        nameEn: 'Stainless Steel 304',
        slug: 'stainless-steel-304',
        descriptionAr: 'ستانلس ستيل نوع 304',
        unit: Unit.kg,
        minQuantity: 1,
        sortOrder: 6,
      },
    }),
    prisma.materialType.create({
      data: {
        categoryId: nonFerrousCategory.id,
        nameAr: 'رصاص',
        nameEn: 'Lead',
        slug: 'lead',
        descriptionAr: 'رصاص من بطاريات وغيرها',
        unit: Unit.kg,
        minQuantity: 5,
        sortOrder: 7,
      },
    }),
  ]);

  // بلاستيك
  const plasticMaterials = await Promise.all([
    prisma.materialType.create({
      data: {
        categoryId: plasticsCategory.id,
        nameAr: 'بلاستيك PET',
        nameEn: 'PET Plastic',
        slug: 'pet-plastic',
        descriptionAr: 'زجاجات المياه والمشروبات',
        unit: Unit.kg,
        minQuantity: 2,
        sortOrder: 1,
      },
    }),
    prisma.materialType.create({
      data: {
        categoryId: plasticsCategory.id,
        nameAr: 'بلاستيك طري',
        nameEn: 'Soft Plastic',
        slug: 'soft-plastic',
        descriptionAr: 'أكياس وأغلفة بلاستيكية',
        unit: Unit.kg,
        minQuantity: 2,
        sortOrder: 2,
      },
    }),
    prisma.materialType.create({
      data: {
        categoryId: plasticsCategory.id,
        nameAr: 'بلاستيك صلب',
        nameEn: 'Hard Plastic',
        slug: 'hard-plastic',
        descriptionAr: 'أدوات وقطع بلاستيكية صلبة',
        unit: Unit.kg,
        minQuantity: 2,
        sortOrder: 3,
      },
    }),
  ]);

  // ورق وكرتون
  const paperMaterials = await Promise.all([
    prisma.materialType.create({
      data: {
        categoryId: paperCategory.id,
        nameAr: 'كرتون خردة',
        nameEn: 'Cardboard Scrap',
        slug: 'cardboard-scrap',
        descriptionAr: 'صناديق وكرتون مستعمل',
        unit: Unit.kg,
        minQuantity: 5,
        sortOrder: 1,
      },
    }),
    prisma.materialType.create({
      data: {
        categoryId: paperCategory.id,
        nameAr: 'ورق أبيض',
        nameEn: 'White Paper',
        slug: 'white-paper',
        descriptionAr: 'أوراق مكتبية بيضاء',
        unit: Unit.kg,
        minQuantity: 2,
        sortOrder: 2,
      },
    }),
    prisma.materialType.create({
      data: {
        categoryId: paperCategory.id,
        nameAr: 'ورق جرائد',
        nameEn: 'Newspaper',
        slug: 'newspaper',
        descriptionAr: 'جرائد ومجلات',
        unit: Unit.kg,
        minQuantity: 2,
        sortOrder: 3,
      },
    }),
  ]);

  // إلكترونيات
  const electronicsMaterials = await Promise.all([
    prisma.materialType.create({
      data: {
        categoryId: electronicsCategory.id,
        nameAr: 'موبايل تالف',
        nameEn: 'Damaged Mobile',
        slug: 'damaged-mobile',
        descriptionAr: 'هواتف محمولة تالفة',
        unit: Unit.piece,
        minQuantity: 1,
        sortOrder: 1,
      },
    }),
    prisma.materialType.create({
      data: {
        categoryId: electronicsCategory.id,
        nameAr: 'لابتوب تالف',
        nameEn: 'Damaged Laptop',
        slug: 'damaged-laptop',
        descriptionAr: 'أجهزة لابتوب تالفة',
        unit: Unit.piece,
        minQuantity: 1,
        sortOrder: 2,
      },
    }),
    prisma.materialType.create({
      data: {
        categoryId: electronicsCategory.id,
        nameAr: 'شاشة كمبيوتر',
        nameEn: 'Computer Monitor',
        slug: 'computer-monitor',
        descriptionAr: 'شاشات كمبيوتر تالفة',
        unit: Unit.piece,
        minQuantity: 1,
        sortOrder: 3,
      },
    }),
    prisma.materialType.create({
      data: {
        categoryId: electronicsCategory.id,
        nameAr: 'طابعة',
        nameEn: 'Printer',
        slug: 'printer',
        descriptionAr: 'طابعات تالفة',
        unit: Unit.piece,
        minQuantity: 1,
        sortOrder: 4,
      },
    }),
  ]);

  // أجهزة منزلية
  const appliancesMaterials = await Promise.all([
    prisma.materialType.create({
      data: {
        categoryId: appliancesCategory.id,
        nameAr: 'ثلاجة تالفة',
        nameEn: 'Damaged Refrigerator',
        slug: 'damaged-refrigerator',
        descriptionAr: 'ثلاجات تالفة أو قديمة',
        unit: Unit.piece,
        minQuantity: 1,
        sortOrder: 1,
      },
    }),
    prisma.materialType.create({
      data: {
        categoryId: appliancesCategory.id,
        nameAr: 'غسالة تالفة',
        nameEn: 'Damaged Washing Machine',
        slug: 'damaged-washing-machine',
        descriptionAr: 'غسالات تالفة أو قديمة',
        unit: Unit.piece,
        minQuantity: 1,
        sortOrder: 2,
      },
    }),
    prisma.materialType.create({
      data: {
        categoryId: appliancesCategory.id,
        nameAr: 'تكييف تالف',
        nameEn: 'Damaged AC',
        slug: 'damaged-ac',
        descriptionAr: 'أجهزة تكييف تالفة',
        unit: Unit.piece,
        minQuantity: 1,
        sortOrder: 3,
      },
    }),
    prisma.materialType.create({
      data: {
        categoryId: appliancesCategory.id,
        nameAr: 'ميكروويف',
        nameEn: 'Microwave',
        slug: 'microwave',
        descriptionAr: 'أجهزة ميكروويف تالفة',
        unit: Unit.piece,
        minQuantity: 1,
        sortOrder: 4,
      },
    }),
  ]);

  // كاوتش
  const rubberMaterials = await Promise.all([
    prisma.materialType.create({
      data: {
        categoryId: rubberCategory.id,
        nameAr: 'كاوتش متهالك',
        nameEn: 'Worn Tires',
        slug: 'worn-tires',
        descriptionAr: 'إطارات سيارات متهالكة',
        unit: Unit.kg,
        minQuantity: 10,
        sortOrder: 1,
      },
    }),
  ]);

  // ==========================================
  // 3. PRICES (December 2024)
  // ==========================================
  console.log('💰 Creating prices...');

  const priceData = [
    // حديد
    { materialSlug: 'mixed-iron-scrap', price: 40 },
    { materialSlug: 'premium-iron-scrap', price: 43 },
    { materialSlug: 'car-scrap', price: 22 },
    { materialSlug: 'sheet-metal-scrap', price: 34 },
    { materialSlug: 'cast-iron-pipes', price: 17 },
    // نحاس
    { materialSlug: 'rough-red-copper', price: 588 },
    { materialSlug: 'shiny-red-copper', price: 529 },
    { materialSlug: 'yellow-copper-brass', price: 489 },
    // ألومنيوم
    { materialSlug: 'soft-aluminium', price: 199 },
    { materialSlug: 'aluminium-cans', price: 166 },
    // معادن أخرى
    { materialSlug: 'stainless-steel-304', price: 85 },
    { materialSlug: 'lead', price: 78 },
    // بلاستيك
    { materialSlug: 'pet-plastic', price: 38 },
    { materialSlug: 'soft-plastic', price: 58 },
    { materialSlug: 'hard-plastic', price: 30 },
    // ورق
    { materialSlug: 'cardboard-scrap', price: 10 },
    { materialSlug: 'white-paper', price: 9 },
    { materialSlug: 'newspaper', price: 7.5 },
    // كاوتش
    { materialSlug: 'worn-tires', price: 6 },
  ];

  for (const data of priceData) {
    const material = await prisma.materialType.findUnique({
      where: { slug: data.materialSlug },
    });
    
    if (material) {
      await prisma.price.create({
        data: {
          materialTypeId: material.id,
          qualityGrade: QualityGrade.standard,
          pricePerKg: data.price,
          pricePerTon: data.price * 1000,
          source: PriceSource.market,
          effectiveDate: new Date(),
        },
      });
    }
  }

  // ==========================================
  // 4. DEMO USERS
  // ==========================================
  console.log('👤 Creating demo users...');

  // مستخدم عادي (فرد)
  const individualUser = await prisma.user.create({
    data: {
      phone: '+201012345678',
      phoneVerified: true,
      name: 'أحمد محمد',
      userType: UserType.individual,
      addressGovernorate: 'القاهرة',
      addressCity: 'مدينة نصر',
      isVerified: true,
    },
  });

  // روبابيكيا/جامع
  const collectorUser = await prisma.user.create({
    data: {
      phone: '+201098765432',
      phoneVerified: true,
      name: 'محمد حسن',
      userType: UserType.collector,
      addressGovernorate: 'القاهرة',
      addressCity: 'منشأة ناصر',
      isVerified: true,
    },
  });

  await prisma.collector.create({
    data: {
      userId: collectorUser.id,
      vehicleType: VehicleType.tricycle,
      serviceGovernorates: ['القاهرة', 'الجيزة'],
      serviceCities: ['مدينة نصر', 'المعادي', 'حلوان', 'الدقي', 'المهندسين'],
      serviceRadiusKm: 15,
      isAvailable: true,
      isVerified: true,
      workingHours: {
        saturday: { start: '08:00', end: '18:00' },
        sunday: { start: '08:00', end: '18:00' },
        monday: { start: '08:00', end: '18:00' },
        tuesday: { start: '08:00', end: '18:00' },
        wednesday: { start: '08:00', end: '18:00' },
        thursday: { start: '08:00', end: '18:00' },
        friday: { start: '10:00', end: '14:00' },
      },
    },
  });

  // تاجر
  const dealerUser = await prisma.user.create({
    data: {
      phone: '+201111222333',
      phoneVerified: true,
      name: 'صلاح عبدالله',
      userType: UserType.dealer,
      addressGovernorate: 'القاهرة',
      addressCity: 'السبتية',
      isVerified: true,
    },
  });

  await prisma.dealer.create({
    data: {
      userId: dealerUser.id,
      businessName: 'مخازن الأمل للخردة',
      businessType: BusinessType.warehouse,
      addressGovernorate: 'القاهرة',
      addressCity: 'السبتية',
      addressStreet: 'شارع السبتية الرئيسي',
      hasScale: true,
      scaleCapacityKg: 5000,
      hasLoadingEquipment: true,
      acceptsSmallQuantities: true,
      minQuantityKg: 10,
      offersPickup: true,
      pickupFeePerKm: 5,
      isVerified: true,
      isFeatured: true,
      workingHours: {
        saturday: { start: '09:00', end: '20:00' },
        sunday: { start: '09:00', end: '20:00' },
        monday: { start: '09:00', end: '20:00' },
        tuesday: { start: '09:00', end: '20:00' },
        wednesday: { start: '09:00', end: '20:00' },
        thursday: { start: '09:00', end: '20:00' },
        friday: { start: 'مغلق', end: 'مغلق' },
      },
    },
  });

  // شركة
  const companyUser = await prisma.user.create({
    data: {
      phone: '+201222333444',
      phoneVerified: true,
      name: 'سارة أحمد',
      userType: UserType.company,
      companyName: 'شركة النور للصناعات',
      commercialRegister: '12345',
      taxId: '123-456-789',
      addressGovernorate: 'القاهرة',
      addressCity: 'العاشر من رمضان',
      isVerified: true,
    },
  });

  // ==========================================
  // 5. SYSTEM CONFIG
  // ==========================================
  console.log('⚙️ Creating system config...');

  await prisma.systemConfig.createMany({
    data: [
      {
        key: 'platform_fees',
        value: {
          c2b: 0.15,
          c2c_seller: 0.03,
          c2c_buyer: 0.02,
          b2b: 0.02,
        },
        description: 'نسب عمولات المنصة',
      },
      {
        key: 'min_order',
        value: {
          min_value_egp: 50,
          min_weight_kg: 1,
        },
        description: 'الحد الأدنى للطلبات',
      },
      {
        key: 'price_update_schedule',
        value: {
          cron: '0 * * * *',
          sources: ['lme', 'local_market'],
        },
        description: 'جدول تحديث الأسعار',
      },
      {
        key: 'governorates',
        value: [
          'القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية',
          'الشرقية', 'الدقهلية', 'الغربية', 'المنوفية',
          'البحيرة', 'الفيوم', 'بني سويف', 'المنيا',
          'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان',
          'السويس', 'الإسماعيلية', 'بورسعيد',
          'شمال سيناء', 'جنوب سيناء', 'البحر الأحمر',
          'الوادي الجديد', 'مطروح'
        ],
        description: 'قائمة المحافظات',
      },
    ],
  });

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Export for testing
export { main as seed };
