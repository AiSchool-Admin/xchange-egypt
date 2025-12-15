/**
 * Auctions Marketplace Seed Data
 * بيانات تجريبية شاملة لسوق المزادات
 */

import { PrismaClient, AuctionStatus, BidStatus, ListingType, ListingStatus, ItemStatus, ItemCondition } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// Professional Auction Images from Unsplash
// ============================================
const AUCTION_IMAGES = {
  // Electronics
  iphone: ['https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&q=80', 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&q=80'],
  macbook: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80'],
  samsung_tv: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80', 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&q=80'],
  ps5: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80', 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&q=80'],
  camera: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80'],
  drone: ['https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80', 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=800&q=80'],
  watch_smart: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80'],
  headphones: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80'],

  // Furniture
  antique_furniture: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80'],
  modern_sofa: ['https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'],
  dining_table: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80', 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=800&q=80'],

  // Vehicles
  motorcycle: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80'],
  bicycle: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80', 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80'],

  // Art & Collectibles
  painting: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80', 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&q=80'],
  sculpture: ['https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&q=80', 'https://images.unsplash.com/photo-1561839561-b13bcfe95249?w=800&q=80'],
  vintage_camera: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80', 'https://images.unsplash.com/photo-1554074326-baea80c52c08?w=800&q=80'],

  // Fashion
  luxury_bag: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'],
  luxury_watch: ['https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80', 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80'],

  // Sports
  golf_clubs: ['https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80', 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80'],
  tennis_racket: ['https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80'],
};

async function seedAuctionsMarketplace() {
  console.log('🔨 Starting Auctions Marketplace Data Seeding...\n');

  // ============================================
  // 1. Get Users for Sellers and Bidders
  // ============================================
  console.log('👥 Getting users for auctions...');

  const users = await prisma.user.findMany({
    take: 10,
    orderBy: { createdAt: 'asc' },
  });

  if (users.length < 5) {
    throw new Error('Not enough users found in database. Please run seed-users.ts first');
  }

  // Assign roles
  const sellers = users.slice(0, 5);
  const bidders = users.slice(2, 10); // Some overlap is realistic

  console.log(`  ✅ Found ${users.length} users (${sellers.length} sellers, ${bidders.length} bidders)`);

  // ============================================
  // 2. Get Categories
  // ============================================
  console.log('\n📂 Getting categories...');

  const categories = await prisma.category.findMany({
    where: {
      slug: {
        in: ['electronics', 'furniture', 'vehicles', 'fashion-accessories', 'sports-fitness', 'art-collectibles'],
      },
    },
  });

  if (categories.length === 0) {
    // Fallback - get any categories
    const anyCategories = await prisma.category.findMany({ take: 6 });
    if (anyCategories.length === 0) {
      throw new Error('No categories found. Please run seed-categories.ts first');
    }
    categories.push(...anyCategories);
  }

  const categoryMap: Record<string, string> = {};
  categories.forEach((c) => {
    categoryMap[c.slug] = c.id;
  });

  console.log(`  ✅ Found ${categories.length} categories`);

  // ============================================
  // 3. Define Auction Items Data
  // ============================================
  const now = new Date();
  const hoursFromNow = (hours: number) => new Date(now.getTime() + hours * 60 * 60 * 1000);
  const daysFromNow = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const auctionItemsData = [
    // ===== ACTIVE AUCTIONS (مزادات جارية) =====
    {
      title: 'iPhone 15 Pro Max 256GB - مزاد يبدأ من 30,000 جنيه',
      titleAr: 'آيفون 15 برو ماكس 256 جيجا - مزاد مميز',
      description: 'آيفون 15 برو ماكس الجديد، لون تيتانيوم أزرق، فتح علبة فقط. ضمان أبل الرسمي ساري حتى 2025. فرصة ذهبية للحصول على أحدث آيفون بسعر مميز!',
      images: AUCTION_IMAGES.iphone,
      categorySlug: 'electronics',
      condition: ItemCondition.NEW,
      estimatedValue: 65000,
      governorate: 'Cairo',
      city: 'Nasr City',
      seller: sellers[0],
      auction: {
        startingPrice: 30000,
        currentPrice: 42500,
        buyNowPrice: 60000,
        reservePrice: 45000,
        minBidIncrement: 500,
        startTime: daysAgo(2),
        endTime: daysFromNow(5),
        status: AuctionStatus.ACTIVE,
        totalBids: 25,
        uniqueBidders: 8,
        views: 1250,
        autoExtend: true,
      },
      bids: [
        { bidder: 2, amount: 30500, time: -45 },
        { bidder: 3, amount: 31000, time: -42 },
        { bidder: 4, amount: 32000, time: -38 },
        { bidder: 2, amount: 33500, time: -30 },
        { bidder: 5, amount: 35000, time: -24 },
        { bidder: 3, amount: 37000, time: -18 },
        { bidder: 6, amount: 39000, time: -12 },
        { bidder: 2, amount: 41000, time: -6 },
        { bidder: 4, amount: 42500, time: -2 },
      ],
      featured: true,
      promotionTier: 'GOLD',
    },
    {
      title: 'MacBook Pro M3 14" - مزاد على لابتوب أبل الأقوى',
      titleAr: 'ماك بوك برو M3 - أقوى لابتوب من أبل',
      description: 'ماك بوك برو الجديد بمعالج M3، شاشة 14 بوصة Retina، ذاكرة 16GB، تخزين 512GB SSD. استخدام 3 أشهر فقط، حالة ممتازة كالجديد. ضمان أبل متبقي 9 أشهر.',
      images: AUCTION_IMAGES.macbook,
      categorySlug: 'electronics',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 85000,
      governorate: 'Alexandria',
      city: 'Smouha',
      seller: sellers[1],
      auction: {
        startingPrice: 45000,
        currentPrice: 58000,
        buyNowPrice: 80000,
        reservePrice: 55000,
        minBidIncrement: 1000,
        startTime: daysAgo(1),
        endTime: daysFromNow(4),
        status: AuctionStatus.ACTIVE,
        totalBids: 13,
        uniqueBidders: 5,
        views: 890,
        autoExtend: true,
      },
      bids: [
        { bidder: 3, amount: 46000, time: -22 },
        { bidder: 5, amount: 48000, time: -18 },
        { bidder: 2, amount: 50000, time: -14 },
        { bidder: 6, amount: 53000, time: -8 },
        { bidder: 3, amount: 56000, time: -4 },
        { bidder: 5, amount: 58000, time: -1 },
      ],
      featured: true,
      promotionTier: 'PREMIUM',
    },
    {
      title: 'PlayStation 5 + 10 ألعاب أصلية - مزاد شامل',
      titleAr: 'بلايستيشن 5 مع مجموعة ألعاب ضخمة',
      description: 'بلايستيشن 5 نسخة الديسك مع 10 ألعاب أصلية تشمل: God of War Ragnarok, Spider-Man 2, FIFA 24, وغيرها. حالة ممتازة، استخدام منزلي خفيف.',
      images: AUCTION_IMAGES.ps5,
      categorySlug: 'electronics',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 35000,
      governorate: 'Giza',
      city: '6th October City',
      seller: sellers[2],
      auction: {
        startingPrice: 15000,
        currentPrice: 22500,
        buyNowPrice: 32000,
        minBidIncrement: 500,
        startTime: daysAgo(3),
        endTime: daysFromNow(2),
        status: AuctionStatus.ACTIVE,
        totalBids: 15,
        uniqueBidders: 6,
        views: 2100,
        autoExtend: true,
      },
      bids: [
        { bidder: 4, amount: 15500, time: -68 },
        { bidder: 2, amount: 16500, time: -60 },
        { bidder: 5, amount: 18000, time: -48 },
        { bidder: 7, amount: 19500, time: -36 },
        { bidder: 4, amount: 21000, time: -24 },
        { bidder: 2, amount: 22500, time: -8 },
      ],
      featured: true,
      promotionTier: 'GOLD',
    },
    {
      title: 'كاميرا Sony A7 IV + عدسات احترافية',
      titleAr: 'طقم تصوير احترافي سوني',
      description: 'كاميرا Sony A7 IV Full Frame مع عدستين: 24-70mm f/2.8 GM و 70-200mm f/2.8 GM. حقيبة احترافية وفلاش Godox. للمصورين المحترفين.',
      images: AUCTION_IMAGES.camera,
      categorySlug: 'electronics',
      condition: ItemCondition.GOOD,
      estimatedValue: 150000,
      governorate: 'Cairo',
      city: 'Heliopolis',
      seller: sellers[3],
      auction: {
        startingPrice: 80000,
        currentPrice: 95000,
        buyNowPrice: 140000,
        reservePrice: 100000,
        minBidIncrement: 2500,
        startTime: hoursFromNow(-36),
        endTime: daysFromNow(6),
        status: AuctionStatus.ACTIVE,
        totalBids: 6,
        uniqueBidders: 4,
        views: 450,
        autoExtend: true,
      },
      bids: [
        { bidder: 5, amount: 82500, time: -30 },
        { bidder: 3, amount: 85000, time: -24 },
        { bidder: 6, amount: 90000, time: -12 },
        { bidder: 5, amount: 95000, time: -4 },
      ],
      featured: false,
    },
    {
      title: 'DJI Mavic 3 Pro - درون احترافي للتصوير الجوي',
      titleAr: 'درون DJI Mavic 3 Pro للتصوير الاحترافي',
      description: 'درون DJI Mavic 3 Pro مع كاميرا Hasselblad. يشمل 3 بطاريات، حقيبة سفر، وجميع الملحقات. مثالي للتصوير العقاري والسينمائي.',
      images: AUCTION_IMAGES.drone,
      categorySlug: 'electronics',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 95000,
      governorate: 'Cairo',
      city: 'New Cairo',
      seller: sellers[4],
      auction: {
        startingPrice: 50000,
        currentPrice: 62000,
        buyNowPrice: 90000,
        minBidIncrement: 2000,
        startTime: daysAgo(1),
        endTime: daysFromNow(7),
        status: AuctionStatus.ACTIVE,
        totalBids: 6,
        uniqueBidders: 3,
        views: 680,
        autoExtend: true,
      },
      bids: [
        { bidder: 2, amount: 52000, time: -20 },
        { bidder: 4, amount: 56000, time: -12 },
        { bidder: 2, amount: 60000, time: -6 },
        { bidder: 6, amount: 62000, time: -2 },
      ],
      featured: true,
      promotionTier: 'PREMIUM',
    },

    // ===== SCHEDULED AUCTIONS (مزادات قادمة) =====
    {
      title: 'طقم أنتيك نادر من القرن 19 - للمقتنين',
      titleAr: 'أثاث أنتيك فيكتوري نادر',
      description: 'طقم صالون أنتيك من العصر الفيكتوري، خشب ماهوجني أصلي منحوت يدوياً. يتضمن كنبة 3 مقاعد، 2 فوتيه، طاولة وسط. قطعة متحفية للمقتنين الجادين.',
      images: AUCTION_IMAGES.antique_furniture,
      categorySlug: 'furniture',
      condition: ItemCondition.GOOD,
      estimatedValue: 250000,
      governorate: 'Cairo',
      city: 'Zamalek',
      seller: sellers[0],
      auction: {
        startingPrice: 100000,
        currentPrice: 100000,
        buyNowPrice: 230000,
        reservePrice: 150000,
        minBidIncrement: 10000,
        startTime: daysFromNow(2),
        endTime: daysFromNow(12),
        status: AuctionStatus.SCHEDULED,
        totalBids: 0,
        uniqueBidders: 0,
        views: 320,
        autoExtend: true,
      },
      bids: [],
      featured: true,
      promotionTier: 'GOLD',
    },
    {
      title: 'ساعة Rolex Submariner - مزاد على ساعة فاخرة',
      titleAr: 'رولكس سبمارينر الفاخرة',
      description: 'ساعة Rolex Submariner Date أصلية 100%، ref. 126610LN. كرتونة وأوراق كاملة. ضمان رولكس الدولي. للمقتنين وعشاق الساعات الفاخرة.',
      images: AUCTION_IMAGES.luxury_watch,
      categorySlug: 'fashion-accessories',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 650000,
      governorate: 'Cairo',
      city: 'Garden City',
      seller: sellers[1],
      auction: {
        startingPrice: 400000,
        currentPrice: 400000,
        buyNowPrice: 620000,
        reservePrice: 500000,
        minBidIncrement: 25000,
        startTime: daysFromNow(1),
        endTime: daysFromNow(8),
        status: AuctionStatus.SCHEDULED,
        totalBids: 0,
        uniqueBidders: 0,
        views: 890,
        autoExtend: true,
      },
      bids: [],
      featured: true,
      promotionTier: 'GOLD',
    },
    {
      title: 'لوحة زيتية أصلية - فنان مصري معاصر',
      titleAr: 'لوحة فنية مصرية معاصرة',
      description: 'لوحة زيتية أصلية للفنان المصري محمد عبده، مقاس 120x80 سم. تصور مشهد نيلي عند الغروب. موقعة ومؤرخة 2023. شهادة أصالة مرفقة.',
      images: AUCTION_IMAGES.painting,
      categorySlug: 'art-collectibles',
      condition: ItemCondition.NEW,
      estimatedValue: 85000,
      governorate: 'Alexandria',
      city: 'El-Raml',
      seller: sellers[2],
      auction: {
        startingPrice: 25000,
        currentPrice: 25000,
        buyNowPrice: 75000,
        minBidIncrement: 5000,
        startTime: daysFromNow(3),
        endTime: daysFromNow(17),
        status: AuctionStatus.SCHEDULED,
        totalBids: 0,
        uniqueBidders: 0,
        views: 210,
        autoExtend: true,
      },
      bids: [],
      featured: false,
    },

    // ===== ENDING SOON (ينتهي قريباً) =====
    {
      title: 'Apple Watch Ultra 2 - ينتهي خلال ساعات!',
      titleAr: 'ساعة أبل ألترا 2 - مزاد ساخن',
      description: 'Apple Watch Ultra 2 الجديدة كلياً، لون تيتانيوم طبيعي. شاشة أكبر وأكثر سطوعاً. مثالية للرياضيين والمغامرين. مع جميع الملحقات الأصلية.',
      images: AUCTION_IMAGES.watch_smart,
      categorySlug: 'electronics',
      condition: ItemCondition.NEW,
      estimatedValue: 45000,
      governorate: 'Cairo',
      city: 'Maadi',
      seller: sellers[3],
      auction: {
        startingPrice: 25000,
        currentPrice: 36500,
        buyNowPrice: 42000,
        minBidIncrement: 500,
        startTime: daysAgo(6),
        endTime: hoursFromNow(4),
        status: AuctionStatus.ACTIVE,
        totalBids: 23,
        uniqueBidders: 9,
        views: 3200,
        autoExtend: true,
      },
      bids: [
        { bidder: 2, amount: 25500, time: -140 },
        { bidder: 3, amount: 27000, time: -130 },
        { bidder: 4, amount: 28500, time: -120 },
        { bidder: 5, amount: 30000, time: -100 },
        { bidder: 2, amount: 32000, time: -72 },
        { bidder: 6, amount: 33500, time: -48 },
        { bidder: 3, amount: 35000, time: -24 },
        { bidder: 7, amount: 36500, time: -3 },
      ],
      featured: true,
      promotionTier: 'PREMIUM',
    },
    {
      title: 'سماعات Sony WH-1000XM5 - آخر ساعة!',
      titleAr: 'سماعات سوني إلغاء الضوضاء',
      description: 'سماعات Sony WH-1000XM5 الرائدة في إلغاء الضوضاء. لون أسود، حالة ممتازة. صوت استثنائي وراحة طوال اليوم.',
      images: AUCTION_IMAGES.headphones,
      categorySlug: 'electronics',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 12000,
      governorate: 'Giza',
      city: 'Dokki',
      seller: sellers[4],
      auction: {
        startingPrice: 5000,
        currentPrice: 8500,
        buyNowPrice: 11000,
        minBidIncrement: 250,
        startTime: daysAgo(5),
        endTime: hoursFromNow(1),
        status: AuctionStatus.ACTIVE,
        totalBids: 14,
        uniqueBidders: 6,
        views: 1800,
        autoExtend: true,
      },
      bids: [
        { bidder: 5, amount: 5250, time: -115 },
        { bidder: 3, amount: 5750, time: -100 },
        { bidder: 2, amount: 6250, time: -80 },
        { bidder: 4, amount: 7000, time: -50 },
        { bidder: 5, amount: 7750, time: -24 },
        { bidder: 6, amount: 8500, time: -2 },
      ],
      featured: false,
    },

    // ===== MORE ACTIVE AUCTIONS =====
    {
      title: 'دراجة نارية Honda CBR 600RR - للمحترفين',
      titleAr: 'هوندا CBR 600RR سوبر سبورت',
      description: 'Honda CBR 600RR موديل 2022، موتور 600cc، 4 سلندر. ممشى 8000 كم فقط. حالة ممتازة، صيانة وكالة منتظمة. رخصة سارية.',
      images: AUCTION_IMAGES.motorcycle,
      categorySlug: 'vehicles',
      condition: ItemCondition.GOOD,
      estimatedValue: 180000,
      governorate: 'Cairo',
      city: 'Mohandessin',
      seller: sellers[0],
      auction: {
        startingPrice: 100000,
        currentPrice: 125000,
        buyNowPrice: 170000,
        reservePrice: 130000,
        minBidIncrement: 5000,
        startTime: daysAgo(4),
        endTime: daysFromNow(3),
        status: AuctionStatus.ACTIVE,
        totalBids: 5,
        uniqueBidders: 3,
        views: 560,
        autoExtend: true,
      },
      bids: [
        { bidder: 3, amount: 105000, time: -90 },
        { bidder: 5, amount: 110000, time: -70 },
        { bidder: 3, amount: 118000, time: -48 },
        { bidder: 7, amount: 125000, time: -12 },
      ],
      featured: false,
    },
    {
      title: 'طقم جولف Callaway كامل - للمحترفين',
      titleAr: 'طقم جولف كالاواي احترافي',
      description: 'طقم جولف Callaway Paradym كامل: Driver, 3-wood, 5-hybrid, حديد 5-PW, wedges 52° 56° 60°, putter. حقيبة Callaway فاخرة. للاعبين الجادين.',
      images: AUCTION_IMAGES.golf_clubs,
      categorySlug: 'sports-fitness',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 95000,
      governorate: 'Cairo',
      city: 'New Cairo',
      seller: sellers[1],
      auction: {
        startingPrice: 40000,
        currentPrice: 52000,
        buyNowPrice: 85000,
        minBidIncrement: 2000,
        startTime: daysAgo(2),
        endTime: daysFromNow(5),
        status: AuctionStatus.ACTIVE,
        totalBids: 6,
        uniqueBidders: 4,
        views: 340,
        autoExtend: true,
      },
      bids: [
        { bidder: 4, amount: 42000, time: -45 },
        { bidder: 6, amount: 46000, time: -30 },
        { bidder: 4, amount: 49000, time: -18 },
        { bidder: 2, amount: 52000, time: -6 },
      ],
      featured: false,
    },
    {
      title: 'حقيبة Louis Vuitton أصلية - للسيدات',
      titleAr: 'لويس فيتون أصلية فاخرة',
      description: 'حقيبة Louis Vuitton Neverfull MM أصلية 100%. لون Monogram الكلاسيكي. مع كيس الغبار والفاتورة الأصلية. حالة ممتازة جداً.',
      images: AUCTION_IMAGES.luxury_bag,
      categorySlug: 'fashion-accessories',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 75000,
      governorate: 'Cairo',
      city: 'Heliopolis',
      seller: sellers[2],
      auction: {
        startingPrice: 35000,
        currentPrice: 48000,
        buyNowPrice: 70000,
        reservePrice: 50000,
        minBidIncrement: 2000,
        startTime: daysAgo(3),
        endTime: daysFromNow(4),
        status: AuctionStatus.ACTIVE,
        totalBids: 7,
        uniqueBidders: 4,
        views: 920,
        autoExtend: true,
      },
      bids: [
        { bidder: 5, amount: 37000, time: -65 },
        { bidder: 3, amount: 40000, time: -50 },
        { bidder: 6, amount: 43000, time: -35 },
        { bidder: 5, amount: 46000, time: -20 },
        { bidder: 7, amount: 48000, time: -8 },
      ],
      featured: true,
      promotionTier: 'PREMIUM',
    },
    {
      title: 'كنبة مودرن L-Shape - تصميم إيطالي',
      titleAr: 'كنبة حرف L تصميم إيطالي',
      description: 'كنبة L-Shape من القماش الفاخر، تصميم إيطالي عصري. لون رمادي فاتح. أبعاد: 320x200 سم. حالة ممتازة، عمرها سنة فقط.',
      images: AUCTION_IMAGES.modern_sofa,
      categorySlug: 'furniture',
      condition: ItemCondition.GOOD,
      estimatedValue: 45000,
      governorate: 'Giza',
      city: 'Sheikh Zayed',
      seller: sellers[3],
      auction: {
        startingPrice: 15000,
        currentPrice: 22000,
        buyNowPrice: 40000,
        minBidIncrement: 1000,
        startTime: daysAgo(5),
        endTime: daysFromNow(2),
        status: AuctionStatus.ACTIVE,
        totalBids: 7,
        uniqueBidders: 4,
        views: 480,
        autoExtend: true,
      },
      bids: [
        { bidder: 2, amount: 16000, time: -110 },
        { bidder: 4, amount: 18000, time: -85 },
        { bidder: 6, amount: 19500, time: -60 },
        { bidder: 2, amount: 21000, time: -30 },
        { bidder: 7, amount: 22000, time: -10 },
      ],
      featured: false,
    },
    {
      title: 'كاميرا Leica أنتيك نادرة - للمقتنين',
      titleAr: 'كاميرا لايكا أنتيك نادرة',
      description: 'كاميرا Leica M3 من الستينات، حالة استثنائية للعمر. تعمل بشكل مثالي. مع عدسة Summicron 50mm. للمقتنين وعشاق التصوير الكلاسيكي.',
      images: AUCTION_IMAGES.vintage_camera,
      categorySlug: 'art-collectibles',
      condition: ItemCondition.FAIR,
      estimatedValue: 120000,
      governorate: 'Alexandria',
      city: 'Stanley',
      seller: sellers[4],
      auction: {
        startingPrice: 60000,
        currentPrice: 78000,
        buyNowPrice: 110000,
        reservePrice: 80000,
        minBidIncrement: 3000,
        startTime: daysAgo(2),
        endTime: daysFromNow(8),
        status: AuctionStatus.ACTIVE,
        totalBids: 6,
        uniqueBidders: 4,
        views: 290,
        autoExtend: true,
      },
      bids: [
        { bidder: 3, amount: 63000, time: -44 },
        { bidder: 5, amount: 68000, time: -32 },
        { bidder: 3, amount: 73000, time: -20 },
        { bidder: 6, amount: 78000, time: -8 },
      ],
      featured: false,
    },
  ];

  // ============================================
  // 4. Create Items, Listings, Auctions, and Bids
  // ============================================
  console.log('\n🎯 Creating Auction Items, Listings, and Auctions...\n');

  let createdAuctions = 0;
  let createdBids = 0;

  for (const data of auctionItemsData) {
    try {
      // Get category ID
      const categoryId = categoryMap[data.categorySlug] || categories[0].id;

      // 1. Create Item
      const item = await prisma.item.create({
        data: {
          sellerId: data.seller.id,
          categoryId,
          title: data.title,
          description: data.description,
          condition: data.condition,
          estimatedValue: data.estimatedValue,
          images: data.images,
          governorate: data.governorate,
          city: data.city,
          listingType: ListingType.AUCTION,
          isFeatured: data.featured || false,
          promotionTier: data.promotionTier || null,
          status: ItemStatus.ACTIVE,
        },
      });

      // 2. Create Listing
      const listing = await prisma.listing.create({
        data: {
          itemId: item.id,
          userId: data.seller.id,
          listingType: ListingType.AUCTION,
          price: data.auction.buyNowPrice || data.estimatedValue,
          startingBid: data.auction.startingPrice,
          currentBid: data.auction.currentPrice,
          bidIncrement: data.auction.minBidIncrement,
          status: ListingStatus.ACTIVE,
          startDate: data.auction.startTime,
          endDate: data.auction.endTime,
        },
      });

      // 3. Create Auction
      const auction = await prisma.auction.create({
        data: {
          listingId: listing.id,
          startingPrice: data.auction.startingPrice,
          currentPrice: data.auction.currentPrice,
          buyNowPrice: data.auction.buyNowPrice,
          reservePrice: data.auction.reservePrice,
          minBidIncrement: data.auction.minBidIncrement,
          startTime: data.auction.startTime,
          endTime: data.auction.endTime,
          status: data.auction.status,
          totalBids: data.auction.totalBids,
          uniqueBidders: data.auction.uniqueBidders,
          views: data.auction.views,
          autoExtend: data.auction.autoExtend,
        },
      });

      createdAuctions++;
      console.log(`  ✅ ${data.titleAr} (${data.auction.status})`);

      // 4. Create Bids
      if (data.bids && data.bids.length > 0) {
        for (let i = 0; i < data.bids.length; i++) {
          const bidData = data.bids[i];
          const bidder = bidders[bidData.bidder % bidders.length];
          const bidTime = new Date(now.getTime() + bidData.time * 60 * 60 * 1000);

          const isLastBid = i === data.bids.length - 1;
          const status = isLastBid ? BidStatus.WINNING : BidStatus.OUTBID;

          await prisma.auctionBid.create({
            data: {
              auctionId: auction.id,
              listingId: listing.id,
              bidderId: bidder.id,
              bidAmount: bidData.amount,
              status,
              createdAt: bidTime,
            },
          });
          createdBids++;
        }
        console.log(`     └─ ${data.bids.length} bids created`);
      }
    } catch (error: any) {
      console.error(`  ❌ Error creating auction "${data.title}":`, error.message);
    }
  }

  // ============================================
  // Summary
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('🎉 AUCTIONS MARKETPLACE SEEDING COMPLETED! 🎉');
  console.log('='.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   🔨 Auctions created: ${createdAuctions}`);
  console.log(`   💰 Bids created: ${createdBids}`);
  console.log(`   🔥 Active auctions: ${auctionItemsData.filter(a => a.auction.status === AuctionStatus.ACTIVE).length}`);
  console.log(`   📅 Scheduled auctions: ${auctionItemsData.filter(a => a.auction.status === AuctionStatus.SCHEDULED).length}`);
  console.log(`   ⏰ Ending soon: 2 auctions`);
  console.log(`   ⭐ Featured auctions: ${auctionItemsData.filter(a => a.featured).length}`);
  console.log('\n🚀 Auctions marketplace is ready for testing!\n');
}

seedAuctionsMarketplace()
  .catch((e) => {
    console.error('❌ Error seeding auctions marketplace:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
