// Xchange Luxury - Seed Data
// بيانات أولية لقاعدة البيانات

import { PrismaClient, BrandTier, ProductCondition, WatchMovement } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء إضافة البيانات الأولية...');

  // =============================================
  // 1. إضافة الفئات
  // =============================================
  console.log('📁 إضافة الفئات...');
  
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'watches' },
      update: {},
      create: {
        nameAr: 'ساعات',
        nameEn: 'Watches',
        slug: 'watches',
        icon: '⌚',
        sortOrder: 1,
        requiresAuthentication: true,
        commissionRate: 12.00
      }
    }),
    prisma.category.upsert({
      where: { slug: 'bags' },
      update: {},
      create: {
        nameAr: 'حقائب',
        nameEn: 'Bags',
        slug: 'bags',
        icon: '👜',
        sortOrder: 2,
        requiresAuthentication: true,
        commissionRate: 12.00
      }
    }),
    prisma.category.upsert({
      where: { slug: 'jewelry' },
      update: {},
      create: {
        nameAr: 'مجوهرات',
        nameEn: 'Jewelry',
        slug: 'jewelry',
        icon: '💎',
        sortOrder: 3,
        requiresAuthentication: true,
        commissionRate: 15.00
      }
    }),
    prisma.category.upsert({
      where: { slug: 'clothing' },
      update: {},
      create: {
        nameAr: 'ملابس',
        nameEn: 'Clothing',
        slug: 'clothing',
        icon: '👔',
        sortOrder: 4,
        requiresAuthentication: true,
        commissionRate: 10.00
      }
    }),
    prisma.category.upsert({
      where: { slug: 'shoes' },
      update: {},
      create: {
        nameAr: 'أحذية',
        nameEn: 'Shoes',
        slug: 'shoes',
        icon: '👞',
        sortOrder: 5,
        requiresAuthentication: true,
        commissionRate: 10.00
      }
    }),
    prisma.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: {
        nameAr: 'إكسسوارات',
        nameEn: 'Accessories',
        slug: 'accessories',
        icon: '🎀',
        sortOrder: 6,
        requiresAuthentication: false,
        commissionRate: 8.00
      }
    })
  ]);

  const watchCategory = categories.find(c => c.slug === 'watches')!;
  const bagCategory = categories.find(c => c.slug === 'bags')!;
  const jewelryCategory = categories.find(c => c.slug === 'jewelry')!;

  // =============================================
  // 2. إضافة الماركات
  // =============================================
  console.log('🏷️ إضافة الماركات...');

  // ماركات الساعات
  const watchBrands = await Promise.all([
    // Ultra Luxury
    prisma.brand.upsert({
      where: { slug: 'patek-philippe' },
      update: {},
      create: {
        name: 'Patek Philippe',
        slug: 'patek-philippe',
        tier: BrandTier.ultra_luxury,
        categoryId: watchCategory.id,
        country: 'Switzerland',
        avgValueRetention: 120.00,
        isEntrupySupported: false,
        authenticationNotes: 'يتطلب خبير متخصص - فحص الحركة أساسي'
      }
    }),
    prisma.brand.upsert({
      where: { slug: 'audemars-piguet' },
      update: {},
      create: {
        name: 'Audemars Piguet',
        slug: 'audemars-piguet',
        tier: BrandTier.ultra_luxury,
        categoryId: watchCategory.id,
        country: 'Switzerland',
        avgValueRetention: 110.00,
        isEntrupySupported: false,
        authenticationNotes: 'Royal Oak الأكثر طلباً - فحص التشطيب الخاص'
      }
    }),
    prisma.brand.upsert({
      where: { slug: 'richard-mille' },
      update: {},
      create: {
        name: 'Richard Mille',
        slug: 'richard-mille',
        tier: BrandTier.ultra_luxury,
        categoryId: watchCategory.id,
        country: 'Switzerland',
        avgValueRetention: 130.00,
        isEntrupySupported: false,
        authenticationNotes: 'أعلى فئة سعرية - يتطلب وثائق كاملة'
      }
    }),
    // Prestige
    prisma.brand.upsert({
      where: { slug: 'rolex' },
      update: {},
      create: {
        name: 'Rolex',
        slug: 'rolex',
        tier: BrandTier.prestige,
        categoryId: watchCategory.id,
        country: 'Switzerland',
        avgValueRetention: 95.00,
        isEntrupySupported: false,
        authenticationNotes: 'الأكثر طلباً - فحص Serial Number والحركة'
      }
    }),
    prisma.brand.upsert({
      where: { slug: 'omega' },
      update: {},
      create: {
        name: 'Omega',
        slug: 'omega',
        tier: BrandTier.prestige,
        categoryId: watchCategory.id,
        country: 'Switzerland',
        avgValueRetention: 70.00,
        isEntrupySupported: false,
        authenticationNotes: 'Speedmaster و Seamaster الأشهر'
      }
    }),
    prisma.brand.upsert({
      where: { slug: 'cartier-watches' },
      update: {},
      create: {
        name: 'Cartier',
        slug: 'cartier-watches',
        tier: BrandTier.prestige,
        categoryId: watchCategory.id,
        country: 'France',
        avgValueRetention: 75.00,
        isEntrupySupported: false,
        authenticationNotes: 'Santos و Tank الأشهر - فحص الحفر'
      }
    }),
    // Entry Luxury
    prisma.brand.upsert({
      where: { slug: 'tag-heuer' },
      update: {},
      create: {
        name: 'TAG Heuer',
        slug: 'tag-heuer',
        tier: BrandTier.entry_luxury,
        categoryId: watchCategory.id,
        country: 'Switzerland',
        avgValueRetention: 50.00,
        isEntrupySupported: false,
        authenticationNotes: 'Carrera و Monaco الأشهر'
      }
    }),
    prisma.brand.upsert({
      where: { slug: 'longines' },
      update: {},
      create: {
        name: 'Longines',
        slug: 'longines',
        tier: BrandTier.entry_luxury,
        categoryId: watchCategory.id,
        country: 'Switzerland',
        avgValueRetention: 45.00,
        isEntrupySupported: false
      }
    }),
    prisma.brand.upsert({
      where: { slug: 'tudor' },
      update: {},
      create: {
        name: 'Tudor',
        slug: 'tudor',
        tier: BrandTier.entry_luxury,
        categoryId: watchCategory.id,
        country: 'Switzerland',
        avgValueRetention: 65.00,
        isEntrupySupported: false,
        authenticationNotes: 'Black Bay الأشهر - علاقة بـ Rolex'
      }
    })
  ]);

  // ماركات الحقائب
  const bagBrands = await Promise.all([
    // Ultra Luxury
    prisma.brand.upsert({
      where: { slug: 'hermes' },
      update: {},
      create: {
        name: 'Hermès',
        slug: 'hermes',
        tier: BrandTier.ultra_luxury,
        categoryId: bagCategory.id,
        country: 'France',
        avgValueRetention: 150.00,
        isEntrupySupported: true,
        authenticationNotes: 'Birkin و Kelly تزيد قيمتها - فحص الخياطة اليدوية'
      }
    }),
    prisma.brand.upsert({
      where: { slug: 'chanel' },
      update: {},
      create: {
        name: 'Chanel',
        slug: 'chanel',
        tier: BrandTier.ultra_luxury,
        categoryId: bagCategory.id,
        country: 'France',
        avgValueRetention: 130.00,
        isEntrupySupported: true,
        authenticationNotes: 'Classic Flap الأشهر - فحص Serial Sticker'
      }
    }),
    // Prestige
    prisma.brand.upsert({
      where: { slug: 'louis-vuitton' },
      update: {},
      create: {
        name: 'Louis Vuitton',
        slug: 'louis-vuitton',
        tier: BrandTier.prestige,
        categoryId: bagCategory.id,
        country: 'France',
        avgValueRetention: 80.00,
        isEntrupySupported: true,
        authenticationNotes: 'فحص Date Code و Canvas'
      }
    }),
    prisma.brand.upsert({
      where: { slug: 'gucci' },
      update: {},
      create: {
        name: 'Gucci',
        slug: 'gucci',
        tier: BrandTier.prestige,
        categoryId: bagCategory.id,
        country: 'Italy',
        avgValueRetention: 60.00,
        isEntrupySupported: true
      }
    }),
    prisma.brand.upsert({
      where: { slug: 'dior' },
      update: {},
      create: {
        name: 'Dior',
        slug: 'dior',
        tier: BrandTier.prestige,
        categoryId: bagCategory.id,
        country: 'France',
        avgValueRetention: 70.00,
        isEntrupySupported: true,
        authenticationNotes: 'Lady Dior الأشهر - فحص Cannage Pattern'
      }
    }),
    prisma.brand.upsert({
      where: { slug: 'prada' },
      update: {},
      create: {
        name: 'Prada',
        slug: 'prada',
        tier: BrandTier.prestige,
        categoryId: bagCategory.id,
        country: 'Italy',
        avgValueRetention: 55.00,
        isEntrupySupported: true
      }
    }),
    // Entry Luxury
    prisma.brand.upsert({
      where: { slug: 'ysl' },
      update: {},
      create: {
        name: 'Saint Laurent',
        slug: 'ysl',
        tier: BrandTier.entry_luxury,
        categoryId: bagCategory.id,
        country: 'France',
        avgValueRetention: 50.00,
        isEntrupySupported: true
      }
    }),
    prisma.brand.upsert({
      where: { slug: 'balenciaga' },
      update: {},
      create: {
        name: 'Balenciaga',
        slug: 'balenciaga',
        tier: BrandTier.entry_luxury,
        categoryId: bagCategory.id,
        country: 'Spain',
        avgValueRetention: 45.00,
        isEntrupySupported: true
      }
    })
  ]);

  // ماركات المجوهرات
  const jewelryBrands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'cartier-jewelry' },
      update: {},
      create: {
        name: 'Cartier',
        slug: 'cartier-jewelry',
        tier: BrandTier.ultra_luxury,
        categoryId: jewelryCategory.id,
        country: 'France',
        avgValueRetention: 90.00,
        authenticationNotes: 'Love Bracelet و Juste un Clou الأشهر'
      }
    }),
    prisma.brand.upsert({
      where: { slug: 'van-cleef' },
      update: {},
      create: {
        name: 'Van Cleef & Arpels',
        slug: 'van-cleef',
        tier: BrandTier.ultra_luxury,
        categoryId: jewelryCategory.id,
        country: 'France',
        avgValueRetention: 95.00,
        authenticationNotes: 'Alhambra الأشهر'
      }
    }),
    prisma.brand.upsert({
      where: { slug: 'tiffany' },
      update: {},
      create: {
        name: 'Tiffany & Co.',
        slug: 'tiffany',
        tier: BrandTier.prestige,
        categoryId: jewelryCategory.id,
        country: 'USA',
        avgValueRetention: 70.00
      }
    }),
    prisma.brand.upsert({
      where: { slug: 'bulgari' },
      update: {},
      create: {
        name: 'Bulgari',
        slug: 'bulgari',
        tier: BrandTier.prestige,
        categoryId: jewelryCategory.id,
        country: 'Italy',
        avgValueRetention: 75.00,
        authenticationNotes: 'Serpenti و B.zero1 الأشهر'
      }
    })
  ]);

  // =============================================
  // 3. إضافة مستخدمين تجريبيين
  // =============================================
  console.log('👥 إضافة مستخدمين تجريبيين...');

  const users = await Promise.all([
    prisma.user.upsert({
      where: { phone: '+201001234567' },
      update: {},
      create: {
        phone: '+201001234567',
        email: 'ahmed@example.com',
        fullName: 'أحمد محمد',
        isPhoneVerified: true,
        isEmailVerified: true,
        isIdentityVerified: true,
        sellerLevel: 'trusted',
        sellerRating: 4.8,
        totalSales: 15,
        totalPurchases: 5
      }
    }),
    prisma.user.upsert({
      where: { phone: '+201009876543' },
      update: {},
      create: {
        phone: '+201009876543',
        email: 'sara@example.com',
        fullName: 'سارة أحمد',
        isPhoneVerified: true,
        isEmailVerified: true,
        isIdentityVerified: false,
        sellerLevel: 'verified',
        sellerRating: 4.5,
        totalSales: 5,
        totalPurchases: 10
      }
    }),
    prisma.user.upsert({
      where: { phone: '+201005555555' },
      update: {},
      create: {
        phone: '+201005555555',
        email: 'dealer@example.com',
        fullName: 'شركة الساعات الفاخرة',
        isPhoneVerified: true,
        isEmailVerified: true,
        isIdentityVerified: true,
        sellerLevel: 'pro',
        sellerRating: 4.9,
        totalSales: 150,
        totalPurchases: 50
      }
    })
  ]);

  const ahmedUser = users[0];
  const saraUser = users[1];
  const dealerUser = users[2];

  // =============================================
  // 4. إضافة منتجات تجريبية
  // =============================================
  console.log('📦 إضافة منتجات تجريبية...');

  const rolexBrand = watchBrands.find(b => b.slug === 'rolex')!;
  const omegaBrand = watchBrands.find(b => b.slug === 'omega')!;
  const lvBrand = bagBrands.find(b => b.slug === 'louis-vuitton')!;
  const chanelBrand = bagBrands.find(b => b.slug === 'chanel')!;

  await Promise.all([
    // ساعة Rolex
    prisma.product.create({
      data: {
        sellerId: ahmedUser.id,
        categoryId: watchCategory.id,
        brandId: rolexBrand.id,
        title: 'Rolex Submariner Date 116610LN',
        description: 'ساعة روليكس صب مارينر سوداء، حالة ممتازة، مع العلبة والأوراق الأصلية. تم الشراء من الوكيل في دبي 2020.',
        model: 'Submariner Date',
        referenceNumber: '116610LN',
        condition: ProductCondition.excellent,
        conditionNotes: 'خدوش طفيفة جداً على البريسليت من الاستخدام العادي',
        price: 450000,
        originalRetailPrice: 380000,
        isNegotiable: true,
        acceptsTrade: true,
        authenticationStatus: 'fully_verified',
        watchMovement: WatchMovement.automatic,
        watchCaseSize: '40mm',
        watchCaseMaterial: 'Oystersteel',
        watchDialColor: 'Black',
        watchBraceletMaterial: 'Oystersteel',
        watchYear: 2020,
        watchBoxPapers: true,
        watchServiceHistory: 'تم الصيانة في 2023',
        status: 'active',
        viewsCount: 234,
        favoritesCount: 18,
        publishedAt: new Date()
      }
    }),
    // ساعة Omega
    prisma.product.create({
      data: {
        sellerId: dealerUser.id,
        categoryId: watchCategory.id,
        brandId: omegaBrand.id,
        title: 'Omega Speedmaster Moonwatch',
        description: 'ساعة أوميجا سبيد ماستر الأسطورية، ساعة رواد الفضاء. حالة ممتازة مع كل الملحقات.',
        model: 'Speedmaster Professional',
        referenceNumber: '311.30.42.30.01.005',
        condition: ProductCondition.very_good,
        price: 180000,
        originalRetailPrice: 220000,
        isNegotiable: true,
        acceptsTrade: true,
        authenticationStatus: 'expert_verified',
        watchMovement: WatchMovement.manual,
        watchCaseSize: '42mm',
        watchCaseMaterial: 'Stainless Steel',
        watchDialColor: 'Black',
        watchBraceletMaterial: 'Stainless Steel',
        watchYear: 2019,
        watchBoxPapers: true,
        status: 'active',
        viewsCount: 156,
        favoritesCount: 12,
        publishedAt: new Date()
      }
    }),
    // حقيبة Louis Vuitton
    prisma.product.create({
      data: {
        sellerId: saraUser.id,
        categoryId: bagCategory.id,
        brandId: lvBrand.id,
        title: 'Louis Vuitton Neverfull MM Monogram',
        description: 'حقيبة لويس فيتون نيفرفول الكلاسيكية، مقاس متوسط. استخدام قليل جداً، حالة ممتازة.',
        model: 'Neverfull MM',
        condition: ProductCondition.excellent,
        conditionNotes: 'الجلد في حالة ممتازة، لا علامات استخدام واضحة',
        price: 45000,
        originalRetailPrice: 65000,
        isNegotiable: true,
        acceptsTrade: false,
        authenticationStatus: 'ai_verified',
        bagSize: 'MM (Medium)',
        bagMaterial: 'Monogram Canvas',
        bagColor: 'Brown',
        bagHardwareColor: 'Gold',
        bagDateCode: 'SD4189',
        bagIncludesDustbag: true,
        bagIncludesBox: true,
        status: 'active',
        viewsCount: 89,
        favoritesCount: 7,
        publishedAt: new Date()
      }
    }),
    // حقيبة Chanel
    prisma.product.create({
      data: {
        sellerId: dealerUser.id,
        categoryId: bagCategory.id,
        brandId: chanelBrand.id,
        title: 'Chanel Classic Flap Medium Black Caviar',
        description: 'شنطة شانيل كلاسيك فلاب الأيقونية، جلد كافيار أسود مع هاردوير ذهبي. قطعة نادرة.',
        model: 'Classic Flap',
        condition: ProductCondition.excellent,
        price: 180000,
        originalRetailPrice: 250000,
        isNegotiable: false,
        acceptsTrade: true,
        authenticationStatus: 'fully_verified',
        bagSize: 'Medium',
        bagMaterial: 'Caviar Leather',
        bagColor: 'Black',
        bagHardwareColor: 'Gold',
        bagIncludesDustbag: true,
        bagIncludesBox: true,
        status: 'active',
        viewsCount: 312,
        favoritesCount: 45,
        publishedAt: new Date()
      }
    })
  ]);

  // =============================================
  // 5. إعدادات النظام
  // =============================================
  console.log('⚙️ إضافة إعدادات النظام...');

  await Promise.all([
    prisma.systemConfig.upsert({
      where: { key: 'platform_fees' },
      update: {},
      create: {
        key: 'platform_fees',
        value: {
          seller_fee_percent: 12,
          buyer_fee_percent: 3,
          trade_fee_percent: 8,
          auction_seller_fee: 15,
          auction_buyer_fee: 5
        }
      }
    }),
    prisma.systemConfig.upsert({
      where: { key: 'inspection_period' },
      update: {},
      create: {
        key: 'inspection_period',
        value: {
          days: 14,
          auto_release: true
        }
      }
    }),
    prisma.systemConfig.upsert({
      where: { key: 'authentication_settings' },
      update: {},
      create: {
        key: 'authentication_settings',
        value: {
          ai_enabled: true,
          ai_provider: 'entrupy',
          expert_review_threshold: 100000,
          require_expert_for_ultra_luxury: true
        }
      }
    }),
    prisma.systemConfig.upsert({
      where: { key: 'supported_payment_methods' },
      update: {},
      create: {
        key: 'supported_payment_methods',
        value: ['card', 'wallet', 'bank_transfer', 'fawry', 'instapay']
      }
    }),
    prisma.systemConfig.upsert({
      where: { key: 'shipping_providers' },
      update: {},
      create: {
        key: 'shipping_providers',
        value: [
          { name: 'Bosta', enabled: true, insured: true },
          { name: 'Aramex', enabled: true, insured: true },
          { name: 'DHL', enabled: true, international: true }
        ]
      }
    })
  ]);

  console.log('✅ تم إضافة البيانات الأولية بنجاح!');
  console.log(`
📊 ملخص:
- ${categories.length} فئات
- ${watchBrands.length + bagBrands.length + jewelryBrands.length} ماركات
- ${users.length} مستخدمين
- 4 منتجات تجريبية
- 5 إعدادات نظام
  `);
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
