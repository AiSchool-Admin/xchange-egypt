import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';

/**
 * خدمة إنشاء بيانات العرض التوضيحي للمستثمرين
 * Demo Seed Service for Investor Presentation
 */

// ============================================
// Egyptian Governorates
// ============================================
const GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'الشرقية',
  'المنوفية',
  'القليوبية',
  'البحيرة',
  'الغربية',
  'بورسعيد',
  'السويس',
  'الإسماعيلية',
  'أسيوط',
  'سوهاج',
  'المنيا',
  'الأقصر',
  'أسوان',
];

// ============================================
// Demo Users Data
// ============================================
const DEMO_USERS = [
  {
    email: 'ahmed.hassan@demo.xchange.eg',
    fullName: 'أحمد حسن محمود',
    phone: '+201001234567',
    governorate: 'القاهرة',
    city: 'مدينة نصر',
    bio: 'تاجر إلكترونيات منذ 10 سنوات، متخصص في الهواتف الذكية',
    userType: 'BUSINESS' as const,
    businessName: 'حسن للإلكترونيات',
  },
  {
    email: 'sara.mohamed@demo.xchange.eg',
    fullName: 'سارة محمد عبدالله',
    phone: '+201112345678',
    governorate: 'الإسكندرية',
    city: 'سموحة',
    bio: 'مهتمة بالأثاث المنزلي والديكور',
    userType: 'INDIVIDUAL' as const,
  },
  {
    email: 'omar.ali@demo.xchange.eg',
    fullName: 'عمر علي إبراهيم',
    phone: '+201223456789',
    governorate: 'الجيزة',
    city: '6 أكتوبر',
    bio: 'خبير في السيارات المستعملة وقطع الغيار',
    userType: 'BUSINESS' as const,
    businessName: 'عمر موتورز',
  },
  {
    email: 'fatma.ahmed@demo.xchange.eg',
    fullName: 'فاطمة أحمد السيد',
    phone: '+201098765432',
    governorate: 'المنصورة',
    city: 'المنصورة',
    bio: 'أعمل في مجال الأجهزة المنزلية والكهربائية',
    userType: 'INDIVIDUAL' as const,
  },
  {
    email: 'mohamed.ibrahim@demo.xchange.eg',
    fullName: 'محمد إبراهيم خليل',
    phone: '+201156789012',
    governorate: 'القاهرة',
    city: 'المعادي',
    bio: 'جامع ومتداول للساعات الفاخرة والمجوهرات',
    userType: 'BUSINESS' as const,
    businessName: 'خليل للساعات الفاخرة',
  },
  {
    email: 'noura.hassan@demo.xchange.eg',
    fullName: 'نورا حسن عبدالرحمن',
    phone: '+201267890123',
    governorate: 'الإسكندرية',
    city: 'المنتزه',
    bio: 'مصممة أزياء ومهتمة بالموضة',
    userType: 'INDIVIDUAL' as const,
  },
  {
    email: 'youssef.kamal@demo.xchange.eg',
    fullName: 'يوسف كمال محمود',
    phone: '+201012345000',
    governorate: 'الجيزة',
    city: 'الشيخ زايد',
    bio: 'تاجر توالف ومواد قابلة لإعادة التدوير',
    userType: 'BUSINESS' as const,
    businessName: 'يوسف لتجارة الخردة',
  },
  {
    email: 'mona.salem@demo.xchange.eg',
    fullName: 'منى سالم أحمد',
    phone: '+201178901234',
    governorate: 'أسيوط',
    city: 'أسيوط',
    bio: 'معلمة ومهتمة بالكتب والأدوات التعليمية',
    userType: 'INDIVIDUAL' as const,
  },
  {
    email: 'khaled.mansour@demo.xchange.eg',
    fullName: 'خالد منصور عبدالله',
    phone: '+201289012345',
    governorate: 'بورسعيد',
    city: 'بورسعيد',
    bio: 'وسيط معتمد في المقايضات الكبيرة',
    userType: 'BUSINESS' as const,
    businessName: 'منصور للوساطة',
  },
  {
    email: 'layla.omar@demo.xchange.eg',
    fullName: 'ليلى عمر حسين',
    phone: '+201190123456',
    governorate: 'الأقصر',
    city: 'الأقصر',
    bio: 'صاحبة محل للتحف والأنتيكات',
    userType: 'BUSINESS' as const,
    businessName: 'بازار ليلى',
  },
];

// ============================================
// Demo Items Data
// ============================================
const DEMO_ITEMS = [
  // Electronics
  {
    title: 'iPhone 15 Pro Max 256GB',
    description: 'آيفون 15 برو ماكس جديد لم يفتح، ضمان سنة من أبل مصر. اللون تيتانيوم طبيعي.',
    condition: 'NEW' as const,
    estimatedValue: 65000,
    categorySlug: 'electronics',
    governorate: 'القاهرة',
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800'],
  },
  {
    title: 'Samsung Galaxy S24 Ultra 512GB',
    description: 'سامسونج S24 ألترا مستعمل أسبوعين فقط، كل الملحقات الأصلية موجودة.',
    condition: 'LIKE_NEW' as const,
    estimatedValue: 48000,
    categorySlug: 'electronics',
    governorate: 'الإسكندرية',
    images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800'],
  },
  {
    title: 'MacBook Pro M3 Pro 14 بوصة',
    description: 'ماك بوك برو M3 برو، رام 18 جيجا، 512 SSD. مثالي للمصممين والمبرمجين.',
    condition: 'NEW' as const,
    estimatedValue: 95000,
    categorySlug: 'electronics',
    governorate: 'الجيزة',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'],
  },
  // Home Appliances
  {
    title: 'ثلاجة توشيبا 18 قدم نوفروست',
    description: 'ثلاجة توشيبا انفرتر موفرة للطاقة، لون سيلفر، ضمان 5 سنوات.',
    condition: 'NEW' as const,
    estimatedValue: 22000,
    categorySlug: 'home-appliances',
    governorate: 'القاهرة',
    images: ['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800'],
  },
  {
    title: 'غسالة LG 9 كيلو فول أوتوماتيك',
    description: 'غسالة LG موتور انفرتر، برامج متعددة، استعمال سنة واحدة.',
    condition: 'GOOD' as const,
    estimatedValue: 12000,
    categorySlug: 'home-appliances',
    governorate: 'المنصورة',
    images: ['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800'],
  },
  // Furniture
  {
    title: 'طقم صالون كلاسيك 9 قطع',
    description: 'طقم صالون خشب زان مصري، تنجيد شامواه فاخر، صناعة دمياط.',
    condition: 'GOOD' as const,
    estimatedValue: 35000,
    categorySlug: 'furniture',
    governorate: 'الجيزة',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'],
  },
  {
    title: 'غرفة نوم مودرن كاملة',
    description: 'غرفة نوم مودرن: سرير 180، دولاب 6 ضلفة، 2 كمودينو، تسريحة.',
    condition: 'LIKE_NEW' as const,
    estimatedValue: 45000,
    categorySlug: 'furniture',
    governorate: 'الإسكندرية',
    images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800'],
  },
  // Vehicles
  {
    title: 'هيونداي إلنترا AD 2020',
    description: 'إلنترا 2020 فابريكا بالكامل، 45000 كم فقط، رخصة سنة.',
    condition: 'GOOD' as const,
    estimatedValue: 580000,
    categorySlug: 'vehicles',
    governorate: 'القاهرة',
    images: ['https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'],
  },
];

// ============================================
// Luxury Items Data
// ============================================
const LUXURY_ITEMS = [
  {
    title: 'ساعة Rolex Submariner Date',
    description: 'رولكس صب مارينر أصلية 100%، مع جميع الأوراق والصندوق الأصلي. موديل 2022.',
    estimatedValue: 850000,
    governorate: 'القاهرة',
    images: ['https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800'],
  },
  {
    title: 'حقيبة Louis Vuitton Neverfull MM',
    description: 'حقيبة لويس فيتون نيفرفول أصلية، استعمال خفيف جداً، مع الدست باج.',
    estimatedValue: 65000,
    governorate: 'الجيزة',
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'],
  },
  {
    title: 'خاتم ألماس 2 قيراط',
    description: 'خاتم سوليتير ألماس 2 قيراط، ذهب أبيض 18 قيراط، شهادة GIA.',
    estimatedValue: 450000,
    governorate: 'القاهرة',
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800'],
  },
  {
    title: 'ساعة Patek Philippe Nautilus',
    description: 'باتيك فيليب نوتيلوس 5711، ستيل، مع جميع الأوراق. نادرة جداً.',
    estimatedValue: 2500000,
    governorate: 'الإسكندرية',
    images: ['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800'],
  },
];

// ============================================
// Scrap Items Data
// ============================================
const SCRAP_ITEMS = [
  {
    title: 'خردة نحاس نقي 50 كيلو',
    description: 'نحاس أحمر نقي من كابلات كهربائية، نظيف وجاهز للصهر.',
    scrapType: 'CABLES_WIRES' as const,
    scrapCondition: 'TOTALLY_DAMAGED' as const,
    metalType: 'COPPER' as const,
    weightKg: 50,
    pricePerKg: 280,
    estimatedValue: 14000,
    governorate: 'الجيزة',
  },
  {
    title: 'ثلاجة توشيبا تالفة للخردة',
    description: 'ثلاجة قديمة لا تعمل، صالحة للتفكيك واستخراج النحاس والألومنيوم.',
    scrapType: 'HOME_APPLIANCES' as const,
    scrapCondition: 'NOT_WORKING' as const,
    weightKg: 80,
    estimatedValue: 1500,
    governorate: 'القاهرة',
  },
  {
    title: 'موتور سيارة تويوتا للخردة',
    description: 'موتور تويوتا كورولا 2010، محتاج عمرة كاملة أو للخردة.',
    scrapType: 'CAR_PARTS' as const,
    scrapCondition: 'NOT_WORKING' as const,
    metalType: 'IRON' as const,
    weightKg: 150,
    estimatedValue: 3500,
    governorate: 'الإسكندرية',
    isRepairable: true,
    repairCostEstimate: 8000,
  },
  {
    title: 'ألومنيوم نوافذ قديمة 100 كيلو',
    description: 'ألومنيوم من نوافذ مفككة، نظيف من الزجاج والبلاستيك.',
    scrapType: 'CONSTRUCTION' as const,
    scrapCondition: 'TOTALLY_DAMAGED' as const,
    metalType: 'ALUMINUM' as const,
    weightKg: 100,
    pricePerKg: 85,
    estimatedValue: 8500,
    governorate: 'المنصورة',
  },
  {
    title: 'بطاريات سيارات مستعملة 20 قطعة',
    description: 'بطاريات 12 فولت مستعملة، بعضها يعمل، معظمها للرصاص.',
    scrapType: 'BATTERIES' as const,
    scrapCondition: 'PARTIALLY_WORKING' as const,
    metalType: 'LEAD' as const,
    weightKg: 400,
    estimatedValue: 6000,
    governorate: 'بورسعيد',
  },
  {
    title: 'لابتوبات وكمبيوترات قديمة 15 جهاز',
    description: 'أجهزة كمبيوتر قديمة للخردة، تصلح لاستخراج المعادن الثمينة.',
    scrapType: 'COMPUTERS' as const,
    scrapCondition: 'NOT_WORKING' as const,
    weightKg: 60,
    estimatedValue: 4500,
    governorate: 'القاهرة',
  },
];

// ============================================
// Exchange Points Data
// ============================================
const EXCHANGE_POINTS = [
  {
    name: 'مول سيتي ستارز - البوابة الرئيسية',
    nameEn: 'City Stars Mall - Main Gate',
    description: 'نقطة تبادل آمنة عند البوابة الرئيسية لمول سيتي ستارز، كاميرات مراقبة 24/7',
    address: 'شارع عمر بن الخطاب، مدينة نصر',
    governorate: 'القاهرة',
    city: 'مدينة نصر',
    latitude: 30.0733,
    longitude: 31.3456,
    safetyRating: 5,
    amenities: ['مواقف سيارات', 'كاميرات مراقبة', 'أمن 24 ساعة', 'مطاعم قريبة'],
  },
  {
    name: 'كارفور المعادي - منطقة الاستلام',
    nameEn: 'Carrefour Maadi - Pickup Area',
    description: 'منطقة الاستلام في كارفور المعادي، مكان واسع ومضاء جيداً',
    address: 'شارع 9، المعادي',
    governorate: 'القاهرة',
    city: 'المعادي',
    latitude: 29.9602,
    longitude: 31.2569,
    safetyRating: 5,
    amenities: ['مواقف سيارات مجانية', 'كاميرات مراقبة', 'أمن'],
  },
  {
    name: 'سان ستيفانو مول - الطابق الأرضي',
    nameEn: 'San Stefano Mall - Ground Floor',
    description: 'نقطة تبادل في سان ستيفانو، بجوار مدخل السينما',
    address: 'طريق الكورنيش، سان ستيفانو',
    governorate: 'الإسكندرية',
    city: 'سان ستيفانو',
    latitude: 31.2437,
    longitude: 29.9673,
    safetyRating: 5,
    amenities: ['مواقف سيارات', 'أمن', 'كافيهات'],
  },
  {
    name: 'داندي مول - المدخل الشمالي',
    nameEn: 'Dandy Mall - North Entrance',
    description: 'نقطة تبادل آمنة في داندي مول 6 أكتوبر',
    address: '6 أكتوبر، الحي المتميز',
    governorate: 'الجيزة',
    city: '6 أكتوبر',
    latitude: 29.9792,
    longitude: 30.9347,
    safetyRating: 4,
    amenities: ['مواقف سيارات', 'أمن', 'مطاعم'],
  },
  {
    name: 'محطة مترو السادات',
    nameEn: 'Sadat Metro Station',
    description: 'عند مخرج التحرير، مكان عام ومزدحم وآمن',
    address: 'ميدان التحرير، وسط البلد',
    governorate: 'القاهرة',
    city: 'وسط البلد',
    latitude: 30.0444,
    longitude: 31.2357,
    safetyRating: 4,
    amenities: ['مترو', 'مكان عام', 'كاميرات'],
  },
];

// ============================================
// Service Class
// ============================================
export class DemoSeedService {
  private createdUsers: any[] = [];
  private createdItems: any[] = [];
  private createdListings: any[] = [];

  async seedAll() {
    const results: any = {};

    try {
      // 1. Create demo users
      results.users = await this.seedUsers();

      // 2. Create categories if not exist
      results.categories = await this.ensureCategories();

      // 3. Create regular items and listings
      results.items = await this.seedItems();

      // 4. Create luxury items
      results.luxuryItems = await this.seedLuxuryItems();

      // 5. Create scrap items
      results.scrapItems = await this.seedScrapItems();

      // 6. Create scrap dealers
      results.scrapDealers = await this.seedScrapDealers();

      // 7. Create exchange points
      results.exchangePoints = await this.seedExchangePoints();

      // 8. Create flash deals
      results.flashDeals = await this.seedFlashDeals();

      // 9. Create wallets and transactions
      results.wallets = await this.seedWallets();

      // 10. Create escrow transactions
      results.escrow = await this.seedEscrow();

      // 11. Create barter pools
      results.barterPools = await this.seedBarterPools();

      // 12. Create facilitators
      results.facilitators = await this.seedFacilitators();

      // 13. Create metal prices
      results.metalPrices = await this.seedMetalPrices();

      // 14. Create reviews
      results.reviews = await this.seedReviews();

      return {
        success: true,
        message: 'تم إنشاء جميع بيانات العرض التوضيحي بنجاح',
        data: results,
      };
    } catch (error: any) {
      console.error('Demo seed error:', error);
      throw error;
    }
  }

  // ============================================
  // Seed Users
  // ============================================
  async seedUsers() {
    const passwordHash = await bcrypt.hash('Demo@123', 10);
    const users = [];

    for (const userData of DEMO_USERS) {
      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: userData.email,
            passwordHash,
            fullName: userData.fullName,
            phone: userData.phone,
            governorate: userData.governorate,
            city: userData.city,
            bio: userData.bio,
            userType: userData.userType,
            businessName: userData.businessName,
            emailVerified: true,
            phoneVerified: true,
            rating: 4 + Math.random(),
            totalReviews: Math.floor(Math.random() * 50) + 10,
          },
        });
      }

      users.push(user);
    }

    this.createdUsers = users;
    return { count: users.length, users: users.map((u) => ({ id: u.id, email: u.email, fullName: u.fullName })) };
  }

  // ============================================
  // Ensure Categories
  // ============================================
  async ensureCategories() {
    const count = await prisma.category.count();
    if (count > 0) {
      return { message: 'Categories already exist', count };
    }

    // Create basic categories
    const categories = [
      { nameEn: 'Electronics', nameAr: 'الإلكترونيات', slug: 'electronics', icon: '📱' },
      { nameEn: 'Home Appliances', nameAr: 'الأجهزة المنزلية', slug: 'home-appliances', icon: '🏠' },
      { nameEn: 'Furniture', nameAr: 'الأثاث', slug: 'furniture', icon: '🛋️' },
      { nameEn: 'Vehicles', nameAr: 'المركبات', slug: 'vehicles', icon: '🚗' },
      { nameEn: 'Luxury', nameAr: 'الفاخرة', slug: 'luxury', icon: '💎' },
      { nameEn: 'Scrap', nameAr: 'التوالف', slug: 'scrap', icon: '♻️' },
    ];

    for (const cat of categories) {
      await prisma.category.create({
        data: {
          nameEn: cat.nameEn,
          nameAr: cat.nameAr,
          slug: cat.slug,
          icon: cat.icon,
          isActive: true,
        },
      });
    }

    return { message: 'Created basic categories', count: categories.length };
  }

  // ============================================
  // Seed Items
  // ============================================
  async seedItems() {
    const items = [];
    const category = await prisma.category.findFirst({ where: { slug: 'electronics' } });

    for (let i = 0; i < DEMO_ITEMS.length; i++) {
      const itemData = DEMO_ITEMS[i];
      const seller = this.createdUsers[i % this.createdUsers.length];

      const item = await prisma.item.create({
        data: {
          title: itemData.title,
          description: itemData.description,
          condition: itemData.condition,
          estimatedValue: itemData.estimatedValue,
          images: itemData.images,
          governorate: itemData.governorate,
          sellerId: seller.id,
          categoryId: category?.id,
          status: 'ACTIVE',
          views: Math.floor(Math.random() * 500) + 50,
        },
      });

      const listing = await prisma.listing.create({
        data: {
          itemId: item.id,
          userId: seller.id,
          listingType: 'DIRECT_SALE',
          price: itemData.estimatedValue,
          status: 'ACTIVE',
        },
      });

      items.push(item);
      this.createdItems.push(item);
      this.createdListings.push(listing);
    }

    return { count: items.length };
  }

  // ============================================
  // Seed Luxury Items
  // ============================================
  async seedLuxuryItems() {
    const luxuryCategory = await prisma.category.findFirst({ where: { slug: 'luxury' } });
    const items = [];

    for (let i = 0; i < LUXURY_ITEMS.length; i++) {
      const itemData = LUXURY_ITEMS[i];
      const seller = this.createdUsers[4]; // Mohamed - luxury specialist

      const item = await prisma.item.create({
        data: {
          title: itemData.title,
          description: itemData.description,
          condition: 'LIKE_NEW',
          estimatedValue: itemData.estimatedValue,
          images: itemData.images,
          governorate: itemData.governorate,
          sellerId: seller.id,
          categoryId: luxuryCategory?.id,
          status: 'ACTIVE',
          isFeatured: true,
          promotionTier: 'GOLD',
          views: Math.floor(Math.random() * 1000) + 200,
        },
      });

      await prisma.listing.create({
        data: {
          itemId: item.id,
          userId: seller.id,
          listingType: 'DIRECT_SALE',
          price: itemData.estimatedValue,
          status: 'ACTIVE',
        },
      });

      items.push(item);
    }

    return { count: items.length };
  }

  // ============================================
  // Seed Scrap Items
  // ============================================
  async seedScrapItems() {
    const items = [];
    const scrapCategory = await prisma.category.findFirst({ where: { slug: 'scrap' } });
    const scrapSeller = this.createdUsers[6]; // Youssef - scrap dealer

    for (const itemData of SCRAP_ITEMS) {
      const item = await prisma.item.create({
        data: {
          title: itemData.title,
          description: itemData.description,
          condition: 'POOR',
          estimatedValue: itemData.estimatedValue,
          governorate: itemData.governorate,
          sellerId: scrapSeller.id,
          categoryId: scrapCategory?.id,
          status: 'ACTIVE',
          isScrap: true,
          scrapType: itemData.scrapType,
          scrapCondition: itemData.scrapCondition,
          metalType: itemData.metalType,
          weightKg: itemData.weightKg,
          pricePerKg: itemData.pricePerKg,
          isRepairable: itemData.isRepairable,
          repairCostEstimate: itemData.repairCostEstimate,
          scrapPricingType: itemData.pricePerKg ? 'PER_KG' : 'PER_PIECE',
          images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
        },
      });

      items.push(item);
    }

    return { count: items.length };
  }

  // ============================================
  // Seed Scrap Dealers
  // ============================================
  async seedScrapDealers() {
    const scrapUser = this.createdUsers[6]; // Youssef

    // Check if already exists
    const existing = await prisma.scrapDealerVerification.findFirst({
      where: { userId: scrapUser.id },
    });

    if (existing) {
      return { message: 'Scrap dealer already exists' };
    }

    const dealer = await prisma.scrapDealerVerification.create({
      data: {
        userId: scrapUser.id,
        dealerType: 'SCRAP_DEALER',
        businessName: 'يوسف لتجارة الخردة والمعادن',
        governorate: 'الجيزة',
        city: 'الشيخ زايد',
        address: 'المنطقة الصناعية، الشيخ زايد',
        specializations: ['METAL_SCRAP', 'CABLES_WIRES', 'HOME_APPLIANCES', 'CAR_PARTS'],
        acceptedMetals: ['COPPER', 'ALUMINUM', 'IRON', 'STEEL', 'BRASS'],
        offersPickup: true,
        pickupRadiusKm: 50,
        pickupFee: 100,
        minWeightKg: 10,
        status: 'APPROVED',
        isVerified: true,
        verifiedAt: new Date(),
        rating: 4.7,
        totalTransactions: 156,
        totalWeightBoughtKg: 12500,
      },
    });

    return { dealerId: dealer.id };
  }

  // ============================================
  // Seed Exchange Points
  // ============================================
  async seedExchangePoints() {
    const points = [];

    for (const pointData of EXCHANGE_POINTS) {
      // Check if exists
      const existing = await prisma.exchangePoint.findFirst({
        where: { name: pointData.name },
      });

      if (!existing) {
        const point = await prisma.exchangePoint.create({
          data: {
            name: pointData.name,
            nameEn: pointData.nameEn,
            description: pointData.description,
            address: pointData.address,
            governorate: pointData.governorate,
            city: pointData.city,
            latitude: pointData.latitude,
            longitude: pointData.longitude,
            safetyRating: pointData.safetyRating,
            amenities: pointData.amenities,
            isActive: true,
            isVerified: true,
            totalMeetups: Math.floor(Math.random() * 200) + 50,
          },
        });
        points.push(point);
      }
    }

    return { count: points.length };
  }

  // ============================================
  // Seed Flash Deals
  // ============================================
  async seedFlashDeals() {
    // Delete existing flash deals
    await prisma.flashDeal.deleteMany({
      where: { title: { contains: 'عرض' } },
    });

    const deals = [];
    const now = new Date();

    const dealItems = this.createdListings.slice(0, 5);
    const discounts = [30, 40, 50, 35, 45];

    for (let i = 0; i < dealItems.length; i++) {
      const listing = dealItems[i];
      const discount = discounts[i];
      const originalPrice = listing.price || 10000;
      const dealPrice = Math.round(originalPrice * (1 - discount / 100));

      const deal = await prisma.flashDeal.create({
        data: {
          title: `عرض فلاش: خصم ${discount}% على ${this.createdItems[i].title}`,
          description: `عرض لفترة محدودة! وفر ${originalPrice - dealPrice} جنيه`,
          listingId: listing.id,
          originalPrice,
          dealPrice,
          discountPercent: discount,
          totalQuantity: 10,
          soldQuantity: Math.floor(Math.random() * 5),
          reservedQuantity: Math.floor(Math.random() * 2),
          startTime: new Date(now.getTime() - 1000 * 60 * 60), // Started 1 hour ago
          endTime: new Date(now.getTime() + 1000 * 60 * 60 * (i + 3)), // Ends in 3-7 hours
          status: 'ACTIVE',
        },
      });

      deals.push(deal);
    }

    return { count: deals.length };
  }

  // ============================================
  // Seed Wallets
  // ============================================
  async seedWallets() {
    const wallets = [];

    for (const user of this.createdUsers) {
      // Check if wallet exists
      let wallet = await prisma.wallet.findUnique({
        where: { userId: user.id },
      });

      if (!wallet) {
        const balance = Math.floor(Math.random() * 5000) + 500;
        wallet = await prisma.wallet.create({
          data: {
            userId: user.id,
            balance,
            frozenBalance: Math.floor(Math.random() * 200),
            lifetimeEarned: balance + Math.floor(Math.random() * 3000),
            lifetimeSpent: Math.floor(Math.random() * 2000),
          },
        });

        // Create some transactions
        const transactionTypes = [
          'REWARD_SIGNUP',
          'REWARD_FIRST_DEAL',
          'REWARD_REVIEW',
          'REWARD_DAILY_LOGIN',
        ];

        for (const type of transactionTypes) {
          await prisma.walletTransaction.create({
            data: {
              walletId: wallet.id,
              type: type as any,
              amount: Math.floor(Math.random() * 200) + 50,
              balanceAfter: wallet.balance,
              description: `مكافأة: ${type}`,
            },
          });
        }
      }

      wallets.push(wallet);
    }

    return { count: wallets.length };
  }

  // ============================================
  // Seed Escrow
  // ============================================
  async seedEscrow() {
    const escrows = [];

    // Create a few escrow transactions
    for (let i = 0; i < 3; i++) {
      const buyer = this.createdUsers[i];
      const seller = this.createdUsers[i + 3];
      const item = this.createdItems[i];

      if (item) {
        const escrow = await prisma.escrowTransaction.create({
          data: {
            buyerId: buyer.id,
            sellerId: seller.id,
            itemId: item.id,
            amount: item.estimatedValue,
            platformFee: Math.round(item.estimatedValue * 0.02),
            status: ['PENDING', 'FUNDED', 'RELEASED'][i] as any,
            notes: 'صفقة تجريبية',
          },
        });

        escrows.push(escrow);
      }
    }

    return { count: escrows.length };
  }

  // ============================================
  // Seed Barter Pools
  // ============================================
  async seedBarterPools() {
    const category = await prisma.category.findFirst({ where: { slug: 'electronics' } });

    // Check if pool exists
    const existing = await prisma.barterPool.findFirst({
      where: { name: { contains: 'إلكترونيات' } },
    });

    if (existing) {
      return { message: 'Barter pool already exists' };
    }

    const pool = await prisma.barterPool.create({
      data: {
        name: 'صندوق مقايضة الإلكترونيات',
        description: 'صندوق لتبادل الأجهزة الإلكترونية والهواتف الذكية',
        categoryId: category?.id,
        minParticipants: 3,
        maxParticipants: 20,
        status: 'ACTIVE',
        totalValue: 150000,
        participantsCount: 5,
        governorate: 'القاهرة',
      },
    });

    // Add participants
    for (let i = 0; i < 3; i++) {
      const item = this.createdItems[i];
      if (item) {
        await prisma.barterPoolParticipant.create({
          data: {
            poolId: pool.id,
            userId: this.createdUsers[i].id,
            itemId: item.id,
            itemValue: item.estimatedValue,
            status: 'ACTIVE',
          },
        });
      }
    }

    return { poolId: pool.id };
  }

  // ============================================
  // Seed Facilitators
  // ============================================
  async seedFacilitators() {
    const facilitatorUser = this.createdUsers[8]; // Khaled - mediator

    // Check if exists
    const existing = await prisma.facilitator.findFirst({
      where: { userId: facilitatorUser.id },
    });

    if (existing) {
      return { message: 'Facilitator already exists' };
    }

    const facilitator = await prisma.facilitator.create({
      data: {
        userId: facilitatorUser.id,
        displayName: 'خالد منصور - وسيط معتمد',
        bio: 'وسيط معتمد من منصة Xchange، خبرة 5 سنوات في المقايضات الكبيرة',
        specializations: ['السيارات', 'العقارات', 'الإلكترونيات'],
        governorates: ['القاهرة', 'الجيزة', 'الإسكندرية', 'بورسعيد'],
        commissionRate: 2.5,
        isVerified: true,
        verificationDate: new Date(),
        status: 'ACTIVE',
        rating: 4.8,
        totalDeals: 87,
        successfulDeals: 82,
        totalValueFacilitated: 2500000,
      },
    });

    return { facilitatorId: facilitator.id };
  }

  // ============================================
  // Seed Metal Prices
  // ============================================
  async seedMetalPrices() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const metalPrices = [
      { metalType: 'COPPER', pricePerKg: 280, source: 'سوق الخردة المصري' },
      { metalType: 'ALUMINUM', pricePerKg: 85, source: 'سوق الخردة المصري' },
      { metalType: 'IRON', pricePerKg: 12, source: 'سوق الخردة المصري' },
      { metalType: 'STEEL', pricePerKg: 15, source: 'سوق الخردة المصري' },
      { metalType: 'BRASS', pricePerKg: 190, source: 'سوق الخردة المصري' },
      { metalType: 'LEAD', pricePerKg: 48, source: 'سوق الخردة المصري' },
      { metalType: 'STAINLESS_STEEL', pricePerKg: 38, source: 'سوق الخردة المصري' },
    ];

    for (const price of metalPrices) {
      await prisma.metalPrice.upsert({
        where: {
          metalType_date: {
            metalType: price.metalType as any,
            date: today,
          },
        },
        update: { pricePerKg: price.pricePerKg },
        create: {
          metalType: price.metalType as any,
          pricePerKg: price.pricePerKg,
          source: price.source,
          date: today,
        },
      });
    }

    return { count: metalPrices.length };
  }

  // ============================================
  // Seed Reviews
  // ============================================
  async seedReviews() {
    const reviews = [];
    const comments = [
      'تجربة ممتازة، البائع أمين وصادق',
      'المنتج مطابق للوصف تماماً، شكراً',
      'سرعة في الرد والتوصيل، أنصح بالتعامل',
      'جودة عالية وسعر مناسب',
      'تعامل راقي ومحترم، سأتعامل مجدداً',
    ];

    for (let i = 0; i < 5; i++) {
      const reviewer = this.createdUsers[i];
      const reviewed = this.createdUsers[(i + 1) % this.createdUsers.length];

      const review = await prisma.review.create({
        data: {
          reviewerId: reviewer.id,
          reviewedId: reviewed.id,
          rating: 4 + Math.floor(Math.random() * 2),
          comment: comments[i],
          isVerifiedPurchase: true,
        },
      });

      reviews.push(review);
    }

    return { count: reviews.length };
  }
}

export const demoSeedService = new DemoSeedService();
