/**
 * Silver Marketplace Seed Data
 * بيانات تجريبية شاملة لسوق الفضة
 */

import { PrismaClient, SilverPurity, SilverCategory, SilverCondition, SilverItemStatus, SilverVerificationLevel } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// Professional Silver Images from Unsplash
// ============================================
const SILVER_IMAGES = {
  // Rings
  ring1: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80', 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80'],
  ring2: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80', 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80'],
  ring3: ['https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80'],
  // Necklaces
  necklace1: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80', 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&q=80'],
  necklace2: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80', 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&q=80'],
  // Bracelets
  bracelet1: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'],
  bracelet2: ['https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80'],
  // Earrings
  earring1: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80', 'https://images.unsplash.com/photo-1599459183200-59c3f8cbd669?w=800&q=80'],
  earring2: ['https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=800&q=80'],
  // Sets
  set1: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80', 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&q=80', 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80'],
  // Coins
  coin1: ['https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80', 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80'],
  coin2: ['https://images.unsplash.com/photo-1607292803062-5b8a3c6a6e21?w=800&q=80'],
  // Bars/Ingots
  bar1: ['https://images.unsplash.com/photo-1589787168422-dc7418a3f730?w=800&q=80', 'https://images.unsplash.com/photo-1574607383476-f517f260d30b?w=800&q=80'],
  bar2: ['https://images.unsplash.com/photo-1611222671004-cd6adcfa95ee?w=800&q=80'],
  // Antiques
  antique1: ['https://images.unsplash.com/photo-1586104237516-5b7e7a0f6f63?w=800&q=80', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80'],
  antique2: ['https://images.unsplash.com/photo-1611222671004-cd6adcfa95ee?w=800&q=80'],
  // Pendants
  pendant1: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&q=80', 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80'],
  // Anklets
  anklet1: ['https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&q=80'],
};

async function seedSilverMarketplace() {
  console.log('🥈 Starting Silver Marketplace Data Seeding...\n');

  // ============================================
  // 1. Seed Silver Prices (أسعار الفضة اليوم)
  // ============================================
  console.log('📊 Seeding Silver Prices...');

  const silverPrices = [
    // Pure Silver 999
    { purity: SilverPurity.S999, buyPrice: 67.50, sellPrice: 65.00, source: 'market_api' },
    // Sterling Silver 925
    { purity: SilverPurity.S925, buyPrice: 58.00, sellPrice: 55.50, source: 'market_api' },
    // Silver 900
    { purity: SilverPurity.S900, buyPrice: 53.00, sellPrice: 50.50, source: 'market_api' },
    // Silver 800
    { purity: SilverPurity.S800, buyPrice: 47.00, sellPrice: 45.00, source: 'market_api' },
  ];

  for (const price of silverPrices) {
    await prisma.silverPrice.create({
      data: price,
    });
    console.log(`  ✅ ${price.purity}: Buy ${price.buyPrice} / Sell ${price.sellPrice} EGP/gram`);
  }

  // ============================================
  // 2. Seed Silver Partners (محلات الفضة الشريكة)
  // ============================================
  console.log('\n🏪 Seeding Silver Partners...');

  const silverPartners = [
    {
      name: 'El-Sagha Silver',
      nameAr: 'الصاغة للفضيات',
      description: 'أقدم وأشهر محل فضة في الصاغة. نقدم شهادات توثيق معتمدة.',
      descriptionAr: 'أقدم وأشهر محل فضة في الصاغة. نقدم شهادات توثيق معتمدة.',
      address: '15 شارع الصاغة، الحسين، القاهرة',
      governorate: 'Cairo',
      city: 'El-Hussein',
      phone: '01001234567',
      email: 'contact@elsagha-silver.eg',
      certificationFee: 75,
      offersCertification: true,
      offersPickup: true,
      offersDelivery: true,
      rating: 4.9,
      totalReviews: 156,
      isVerified: true,
      isActive: true,
      workingHours: 'السبت - الخميس: 10:00 ص - 10:00 م',
    },
    {
      name: 'Alexandria Silver House',
      nameAr: 'بيت الفضة الإسكندراني',
      description: 'متخصصون في الفضة الإسترليني والأنتيك منذ 1960',
      descriptionAr: 'متخصصون في الفضة الإسترليني والأنتيك منذ 1960',
      address: '45 شارع الحرية، سموحة، الإسكندرية',
      governorate: 'Alexandria',
      city: 'Smouha',
      phone: '01112345678',
      email: 'info@alex-silver.eg',
      certificationFee: 100,
      offersCertification: true,
      offersPickup: false,
      offersDelivery: true,
      rating: 4.7,
      totalReviews: 89,
      isVerified: true,
      isActive: true,
      workingHours: 'السبت - الخميس: 11:00 ص - 9:00 م',
    },
    {
      name: 'Giza Precious Metals',
      nameAr: 'الجيزة للمعادن الثمينة',
      description: 'خبراء في تقييم وتوثيق الفضة والذهب',
      descriptionAr: 'خبراء في تقييم وتوثيق الفضة والذهب',
      address: '78 شارع الهرم، الجيزة',
      governorate: 'Giza',
      city: 'Haram',
      phone: '01223456789',
      email: 'giza-metals@example.eg',
      certificationFee: 85,
      offersCertification: true,
      offersPickup: true,
      offersDelivery: true,
      rating: 4.6,
      totalReviews: 72,
      isVerified: true,
      isActive: true,
      workingHours: 'يومياً: 10:00 ص - 8:00 م',
    },
    {
      name: 'Premium Silver Co.',
      nameAr: 'بريميوم سيلفر',
      description: 'أحدث معمل لفحص الفضة بتقنية XRF',
      descriptionAr: 'أحدث معمل لفحص الفضة بتقنية XRF',
      address: '25 التجمع الخامس، القاهرة الجديدة',
      governorate: 'Cairo',
      city: 'New Cairo',
      phone: '01098765432',
      email: 'premium@silver.eg',
      certificationFee: 150,
      offersCertification: true,
      offersPickup: true,
      offersDelivery: true,
      rating: 4.8,
      totalReviews: 45,
      isVerified: true,
      isActive: true,
      workingHours: 'السبت - الخميس: 9:00 ص - 6:00 م',
    },
  ];

  const createdPartners: any[] = [];
  for (const partner of silverPartners) {
    const created = await prisma.silverPartner.create({
      data: partner,
    });
    createdPartners.push(created);
    console.log(`  ✅ ${partner.nameAr} (${partner.governorate})`);
  }

  // ============================================
  // 3. Get or Create Users for Sellers
  // ============================================
  console.log('\n👥 Getting users for silver items...');

  const users = {
    ahmed: await prisma.user.findUnique({ where: { email: 'ahmed.mohamed@example.com' } }),
    fatma: await prisma.user.findUnique({ where: { email: 'fatma.ali@example.com' } }),
    khaled: await prisma.user.findUnique({ where: { email: 'khaled.hassan@example.com' } }),
    mona: await prisma.user.findUnique({ where: { email: 'mona.ibrahim@example.com' } }),
    omar: await prisma.user.findUnique({ where: { email: 'omar.saeed@example.com' } }),
  };

  if (!users.ahmed || !users.fatma || !users.khaled || !users.mona || !users.omar) {
    console.log('  ⚠️ Some users not found. Please run seed-users.ts first');
    console.log('  Creating fallback users...');
    // Use admin or first available user
    const anyUser = await prisma.user.findFirst();
    if (!anyUser) {
      throw new Error('No users found in database. Please run seed-users.ts first');
    }
    users.ahmed = users.ahmed || anyUser;
    users.fatma = users.fatma || anyUser;
    users.khaled = users.khaled || anyUser;
    users.mona = users.mona || anyUser;
    users.omar = users.omar || anyUser;
  }

  // ============================================
  // 4. Seed Silver Items (قطع الفضة المعروضة)
  // ============================================
  console.log('\n💍 Seeding Silver Items...');

  const silverItems = [
    // ===== RINGS (خواتم) =====
    {
      sellerId: users.fatma!.id,
      title: 'خاتم فضة إسترليني 925 بتصميم كلاسيكي',
      description: 'خاتم فضة إسترليني أصلي عيار 925، تصميم كلاسيكي أنيق يناسب جميع المناسبات. الخاتم مقاوم للتأكسد ويحافظ على لمعانه. مقاس 17.',
      category: SilverCategory.RING,
      purity: SilverPurity.S925,
      weightGrams: 8.5,
      condition: SilverCondition.NEW,
      askingPrice: 650,
      images: SILVER_IMAGES.ring1,
      governorate: 'Cairo',
      city: 'Nasr City',
      allowBarter: true,
      allowGoldBarter: false,
      barterPreferences: 'أقبل المقايضة بخواتم فضة أخرى أو سلاسل',
      verificationLevel: SilverVerificationLevel.VERIFIED,
    },
    {
      sellerId: users.ahmed!.id,
      title: 'خاتم فضة نقية 999 للرجال - تصميم عصري',
      description: 'خاتم رجالي من الفضة النقية عيار 999، تصميم عصري جريء. مثالي للهدايا الفاخرة. مرفق شهادة نقاء.',
      category: SilverCategory.RING,
      purity: SilverPurity.S999,
      weightGrams: 15.2,
      condition: SilverCondition.NEW,
      askingPrice: 1150,
      images: SILVER_IMAGES.ring2,
      governorate: 'Alexandria',
      city: 'Smouha',
      allowBarter: true,
      allowGoldBarter: true,
      barterPreferences: 'مستعد لمقايضة بذهب مع دفع الفرق',
      verificationLevel: SilverVerificationLevel.CERTIFIED,
    },
    {
      sellerId: users.khaled!.id,
      title: 'خاتم فضة بفص فيروز طبيعي',
      description: 'خاتم فضة عيار 925 مرصع بفص فيروز طبيعي أزرق. صناعة يدوية تقليدية. قطعة فريدة لعشاق الأحجار الكريمة.',
      category: SilverCategory.RING,
      purity: SilverPurity.S925,
      weightGrams: 12.0,
      condition: SilverCondition.LIKE_NEW,
      askingPrice: 950,
      images: SILVER_IMAGES.ring3,
      governorate: 'Cairo',
      city: 'Heliopolis',
      allowBarter: false,
      verificationLevel: SilverVerificationLevel.VERIFIED,
    },

    // ===== NECKLACES (سلاسل) =====
    {
      sellerId: users.mona!.id,
      title: 'سلسلة فضة إسترليني 925 مع تعليقة قلب',
      description: 'سلسلة فضة أنيقة مع تعليقة على شكل قلب. طول السلسلة 45 سم. مثالية للإهداء في المناسبات الخاصة.',
      category: SilverCategory.NECKLACE,
      purity: SilverPurity.S925,
      weightGrams: 6.8,
      condition: SilverCondition.NEW,
      askingPrice: 580,
      images: SILVER_IMAGES.necklace1,
      governorate: 'Giza',
      city: '6th October City',
      allowBarter: true,
      barterPreferences: 'أبحث عن أقراط فضة للمقايضة',
      verificationLevel: SilverVerificationLevel.BASIC,
    },
    {
      sellerId: users.fatma!.id,
      title: 'سلسلة فضة إيطالية ثقيلة للرجال',
      description: 'سلسلة فضة إيطالية أصلية عيار 925، وزن ثقيل للرجال. طول 60 سم، عرض 5 مم. صناعة إيطالية فاخرة.',
      category: SilverCategory.NECKLACE,
      purity: SilverPurity.S925,
      weightGrams: 45.0,
      condition: SilverCondition.LIKE_NEW,
      askingPrice: 2800,
      images: SILVER_IMAGES.necklace2,
      governorate: 'Cairo',
      city: 'Maadi',
      allowBarter: true,
      allowGoldBarter: true,
      barterPreferences: 'أقبل مقايضة بسلسلة ذهب أو إسورة',
      verificationLevel: SilverVerificationLevel.CERTIFIED,
    },

    // ===== BRACELETS (أساور) =====
    {
      sellerId: users.omar!.id,
      title: 'إسورة فضة كلاسيكية للسيدات',
      description: 'إسورة فضة إسترليني 925 بتصميم كلاسيكي رقيق. قطر داخلي 6.5 سم. مثالية للارتداء اليومي.',
      category: SilverCategory.BRACELET,
      purity: SilverPurity.S925,
      weightGrams: 18.5,
      condition: SilverCondition.GOOD,
      askingPrice: 1100,
      images: SILVER_IMAGES.bracelet1,
      governorate: 'Alexandria',
      city: 'Mandara',
      allowBarter: true,
      verificationLevel: SilverVerificationLevel.VERIFIED,
    },
    {
      sellerId: users.ahmed!.id,
      title: 'إسورة فضة رجالية سميكة',
      description: 'إسورة رجالية من الفضة عيار 900، تصميم سميك وقوي. مناسبة للمقاسات الكبيرة. وزن ممتاز.',
      category: SilverCategory.BRACELET,
      purity: SilverPurity.S900,
      weightGrams: 55.0,
      condition: SilverCondition.LIKE_NEW,
      askingPrice: 3200,
      images: SILVER_IMAGES.bracelet2,
      governorate: 'Giza',
      city: 'Dokki',
      allowBarter: true,
      allowGoldBarter: true,
      verificationLevel: SilverVerificationLevel.CERTIFIED,
    },

    // ===== EARRINGS (أقراط) =====
    {
      sellerId: users.mona!.id,
      title: 'أقراط فضة مرصعة بالزركون',
      description: 'أقراط فضة إسترليني 925 مرصعة بأحجار الزركون اللامعة. تصميم عصري أنيق للسيدات.',
      category: SilverCategory.EARRING,
      purity: SilverPurity.S925,
      weightGrams: 4.2,
      condition: SilverCondition.NEW,
      askingPrice: 420,
      images: SILVER_IMAGES.earring1,
      governorate: 'Cairo',
      city: 'New Cairo',
      allowBarter: true,
      verificationLevel: SilverVerificationLevel.VERIFIED,
    },
    {
      sellerId: users.fatma!.id,
      title: 'أقراط فضة حلقية كلاسيكية',
      description: 'أقراط حلقية من الفضة النقية، تصميم كلاسيكي يناسب جميع الأعمار. قطر 3 سم.',
      category: SilverCategory.EARRING,
      purity: SilverPurity.S999,
      weightGrams: 8.0,
      condition: SilverCondition.LIKE_NEW,
      askingPrice: 620,
      images: SILVER_IMAGES.earring2,
      governorate: 'Cairo',
      city: 'Nasr City',
      allowBarter: false,
      verificationLevel: SilverVerificationLevel.BASIC,
    },

    // ===== SETS (أطقم) =====
    {
      sellerId: users.khaled!.id,
      title: 'طقم فضة كامل - سلسلة وأقراط وخاتم',
      description: 'طقم فضة إسترليني 925 كامل يتضمن: سلسلة مع تعليقة، أقراط متطابقة، وخاتم. تصميم موحد أنيق. مثالي للهدايا.',
      category: SilverCategory.SET,
      purity: SilverPurity.S925,
      weightGrams: 25.5,
      condition: SilverCondition.NEW,
      askingPrice: 1850,
      images: SILVER_IMAGES.set1,
      governorate: 'Cairo',
      city: 'Zamalek',
      allowBarter: true,
      allowGoldBarter: true,
      barterPreferences: 'أقبل طقم ذهب أو قطع فضة متعددة',
      verificationLevel: SilverVerificationLevel.CERTIFIED,
    },

    // ===== COINS (عملات فضية) =====
    {
      sellerId: users.ahmed!.id,
      title: 'عملة فضة أمريكية 1 أونصة - American Eagle',
      description: 'عملة American Silver Eagle أصلية، وزن 1 أونصة (31.1 جرام)، نقاء 999. مثالية للاستثمار والادخار.',
      category: SilverCategory.COIN,
      purity: SilverPurity.S999,
      weightGrams: 31.1,
      condition: SilverCondition.NEW,
      askingPrice: 2400,
      images: SILVER_IMAGES.coin1,
      governorate: 'Cairo',
      city: 'Garden City',
      allowBarter: false,
      verificationLevel: SilverVerificationLevel.CERTIFIED,
    },
    {
      sellerId: users.omar!.id,
      title: 'مجموعة 5 عملات فضة عثمانية قديمة',
      description: 'مجموعة نادرة من 5 عملات فضة عثمانية تاريخية. حالة ممتازة للعملات القديمة. للمقتنين والمهتمين بالتاريخ.',
      category: SilverCategory.COIN,
      purity: SilverPurity.S800,
      weightGrams: 65.0,
      condition: SilverCondition.ANTIQUE,
      askingPrice: 8500,
      images: SILVER_IMAGES.coin2,
      governorate: 'Alexandria',
      city: 'El-Raml',
      allowBarter: true,
      barterPreferences: 'أبحث عن عملات قديمة أخرى للمقايضة',
      verificationLevel: SilverVerificationLevel.CERTIFIED,
    },

    // ===== BARS (سبائك) =====
    {
      sellerId: users.khaled!.id,
      title: 'سبيكة فضة 100 جرام - نقاء 999',
      description: 'سبيكة فضة نقية 999، وزن 100 جرام بالضبط. مختومة ومعتمدة. مثالية للاستثمار طويل الأجل.',
      category: SilverCategory.BAR,
      purity: SilverPurity.S999,
      weightGrams: 100.0,
      condition: SilverCondition.NEW,
      askingPrice: 7200,
      images: SILVER_IMAGES.bar1,
      governorate: 'Giza',
      city: 'Sheikh Zayed',
      allowBarter: false,
      verificationLevel: SilverVerificationLevel.CERTIFIED,
    },
    {
      sellerId: users.mona!.id,
      title: 'سبيكة فضة 50 جرام PAMP Suisse',
      description: 'سبيكة فضة PAMP Suisse السويسرية، 50 جرام، نقاء 999.0. مغلفة ومختومة. الأفضل للمستثمرين.',
      category: SilverCategory.BAR,
      purity: SilverPurity.S999,
      weightGrams: 50.0,
      condition: SilverCondition.NEW,
      askingPrice: 3800,
      images: SILVER_IMAGES.bar2,
      governorate: 'Cairo',
      city: 'Heliopolis',
      allowBarter: true,
      allowGoldBarter: true,
      verificationLevel: SilverVerificationLevel.CERTIFIED,
    },

    // ===== ANTIQUES (أنتيك) =====
    {
      sellerId: users.fatma!.id,
      title: 'صينية فضة أنتيك إنجليزية - Victorian Era',
      description: 'صينية فضة إنجليزية أصلية من العصر الفيكتوري (1880 تقريباً). نقوش يدوية رائعة. قطعة متحفية نادرة.',
      category: SilverCategory.ANTIQUE,
      purity: SilverPurity.S925,
      weightGrams: 450.0,
      condition: SilverCondition.ANTIQUE,
      askingPrice: 35000,
      images: SILVER_IMAGES.antique1,
      governorate: 'Cairo',
      city: 'Garden City',
      allowBarter: true,
      barterPreferences: 'أقبل قطع أنتيك أخرى أو ذهب',
      verificationLevel: SilverVerificationLevel.CERTIFIED,
    },
    {
      sellerId: users.ahmed!.id,
      title: 'طقم شاي فضة مصري قديم',
      description: 'طقم شاي فضة مصري من الستينات، يتضمن إبريق وسكرية و6 فناجين. حالة ممتازة. صناعة مصرية أصيلة.',
      category: SilverCategory.ANTIQUE,
      purity: SilverPurity.S900,
      weightGrams: 850.0,
      condition: SilverCondition.GOOD,
      askingPrice: 45000,
      images: SILVER_IMAGES.antique2,
      governorate: 'Alexandria',
      city: 'Moharram Bey',
      allowBarter: true,
      allowGoldBarter: true,
      verificationLevel: SilverVerificationLevel.CERTIFIED,
    },

    // ===== PENDANTS (تعليقات) =====
    {
      sellerId: users.omar!.id,
      title: 'تعليقة فضة على شكل عين حورس',
      description: 'تعليقة فضة إسترليني بتصميم عين حورس الفرعونية. صناعة يدوية دقيقة. رمز الحماية والحظ.',
      category: SilverCategory.PENDANT,
      purity: SilverPurity.S925,
      weightGrams: 5.5,
      condition: SilverCondition.NEW,
      askingPrice: 380,
      images: SILVER_IMAGES.pendant1,
      governorate: 'Luxor',
      city: 'Luxor City',
      allowBarter: true,
      verificationLevel: SilverVerificationLevel.VERIFIED,
    },

    // ===== ANKLETS (خلاخيل) =====
    {
      sellerId: users.mona!.id,
      title: 'خلخال فضة بأجراس صغيرة',
      description: 'خلخال فضة إسترليني مع أجراس صغيرة تصدر صوتاً ناعماً عند المشي. تصميم تقليدي جميل.',
      category: SilverCategory.ANKLET,
      purity: SilverPurity.S925,
      weightGrams: 12.0,
      condition: SilverCondition.LIKE_NEW,
      askingPrice: 750,
      images: SILVER_IMAGES.anklet1,
      governorate: 'Aswan',
      city: 'Aswan City',
      allowBarter: true,
      verificationLevel: SilverVerificationLevel.BASIC,
    },

    // ===== More items for variety =====
    {
      sellerId: users.khaled!.id,
      title: 'خاتم فضة ثقيل للرجال - Wolf Design',
      description: 'خاتم فضة رجالي ثقيل بتصميم ذئب، عيار 925. للرجال الذين يحبون التصاميم الجريئة والمميزة.',
      category: SilverCategory.RING,
      purity: SilverPurity.S925,
      weightGrams: 22.0,
      condition: SilverCondition.NEW,
      askingPrice: 1450,
      images: SILVER_IMAGES.ring1,
      governorate: 'Cairo',
      city: 'Mohandessin',
      allowBarter: false,
      verificationLevel: SilverVerificationLevel.VERIFIED,
    },
    {
      sellerId: users.fatma!.id,
      title: 'سلسلة فضة رفيعة 925 - طول 50 سم',
      description: 'سلسلة فضة رفيعة وأنيقة، طول 50 سم، مثالية لتعليق البندانت. قفل محكم وآمن.',
      category: SilverCategory.NECKLACE,
      purity: SilverPurity.S925,
      weightGrams: 3.5,
      condition: SilverCondition.NEW,
      askingPrice: 280,
      images: SILVER_IMAGES.necklace1,
      governorate: 'Giza',
      city: 'Giza',
      allowBarter: true,
      verificationLevel: SilverVerificationLevel.BASIC,
    },
  ];

  // Get current silver prices for rawValue calculation
  const currentPrices = await prisma.silverPrice.findMany({
    orderBy: { timestamp: 'desc' },
    distinct: ['purity'],
  });
  const priceMap: Record<string, number> = {};
  currentPrices.forEach(p => {
    priceMap[p.purity] = p.buyPrice;
  });

  const createdItems: any[] = [];
  for (const itemData of silverItems) {
    const marketPrice = priceMap[itemData.purity] || 55;
    const rawValue = itemData.weightGrams * marketPrice;

    const item = await prisma.silverItem.create({
      data: {
        ...itemData,
        rawValue,
        silverPriceAtListing: marketPrice,
        status: SilverItemStatus.ACTIVE,
        views: Math.floor(Math.random() * 500) + 50,
      },
    });
    createdItems.push(item);
    console.log(`  ✅ ${item.title} (${item.weightGrams}g ${item.purity})`);
  }

  // ============================================
  // 5. Create some certificates for verified items
  // ============================================
  console.log('\n📜 Creating Silver Certificates...');

  const certifiedItems = createdItems.filter(i => i.verificationLevel === SilverVerificationLevel.CERTIFIED);
  for (const item of certifiedItems.slice(0, 5)) {
    const partner = createdPartners[Math.floor(Math.random() * createdPartners.length)];

    await prisma.silverCertificate.create({
      data: {
        itemId: item.id,
        partnerId: partner.id,
        certificateNumber: `SC-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
        verifiedPurity: item.purity,
        verifiedWeight: item.weightGrams,
        purityVariance: Math.random() * 0.5,
        weightVariance: Math.random() * 0.2,
        isAuthentic: true,
        testMethod: 'XRF',
        notes: 'تم الفحص والتوثيق بنجاح',
        expertName: 'أحمد محمود',
        validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
      },
    });
    console.log(`  ✅ Certificate for: ${item.title}`);
  }

  // ============================================
  // Summary
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('✨ SILVER MARKETPLACE SEEDING COMPLETED! ✨');
  console.log('='.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   📈 Silver Prices: ${silverPrices.length} purities`);
  console.log(`   🏪 Silver Partners: ${silverPartners.length}`);
  console.log(`   💍 Silver Items: ${silverItems.length}`);
  console.log(`   📜 Certificates: ${Math.min(5, certifiedItems.length)}`);
  console.log('\n🎉 Silver marketplace is ready for testing!\n');
}

seedSilverMarketplace()
  .catch((e) => {
    console.error('❌ Error seeding silver marketplace:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
