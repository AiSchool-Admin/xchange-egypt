import { PrismaClient, ItemCondition, ListingType, ListingStatus, ItemStatus, BarterOfferStatus, ScrapType, ScrapCondition, MetalType, ScrapPricingType, MarketType } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// Professional Images from Unsplash (Free)
// ============================================
const IMAGES = {
  // Electronics
  iphone15: [
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80',
  ],
  iphone14: [
    'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&q=80',
    'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&q=80',
  ],
  samsung: [
    'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80',
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80',
  ],
  macbook: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80',
  ],
  laptop: [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80',
  ],
  ps5: [
    'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80',
    'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&q=80',
  ],
  camera: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80',
  ],
  airpods: [
    'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80',
    'https://images.unsplash.com/photo-1588423771073-b8903fba77ac?w=800&q=80',
  ],
  tv: [
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80',
    'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&q=80',
  ],
  // Vehicles
  mercedes: [
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
    'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80',
  ],
  bmw: [
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80',
  ],
  toyota: [
    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
    'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80',
  ],
  // Furniture
  sofa: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80',
  ],
  bed: [
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
    'https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=800&q=80',
  ],
  diningTable: [
    'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80',
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80',
  ],
  office: [
    'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
  ],
  // Fashion & Luxury
  watch: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80',
  ],
  rolex: [
    'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80',
    'https://images.unsplash.com/photo-1548169874-53e85f753f1e?w=800&q=80',
  ],
  handbag: [
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
  ],
  louisVuitton: [
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
    'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80',
  ],
  jewelry: [
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
  ],
  // Appliances
  refrigerator: [
    'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80',
    'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80',
  ],
  washer: [
    'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80',
    'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800&q=80',
  ],
  ac: [
    'https://images.unsplash.com/photo-1631567091574-5ba9f55efb25?w=800&q=80',
    'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80',
  ],
  // Scrap
  scrapMetal: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80',
  ],
  scrapElectronics: [
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&q=80',
    'https://images.unsplash.com/photo-1591243315780-978fd00ff9db?w=800&q=80',
  ],
  scrapCar: [
    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80',
    'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&q=80',
  ],
  // Flash Sale Banners
  flashBanner1: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&q=80',
  flashBanner2: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80',
};

async function seedMarketplaceData() {
  console.log('🚀 Starting comprehensive marketplace data seeding...\n');

  // ============================================
  // Get existing users
  // ============================================
  const users = {
    ahmed: await prisma.user.findUnique({ where: { email: 'ahmed.mohamed@example.com' } }),
    fatma: await prisma.user.findUnique({ where: { email: 'fatma.ali@example.com' } }),
    khaled: await prisma.user.findUnique({ where: { email: 'khaled.hassan@example.com' } }),
    mona: await prisma.user.findUnique({ where: { email: 'mona.ibrahim@example.com' } }),
    omar: await prisma.user.findUnique({ where: { email: 'omar.saeed@example.com' } }),
    techStore: await prisma.user.findUnique({ where: { email: 'contact@techstore.eg' } }),
    furnitureHub: await prisma.user.findUnique({ where: { email: 'info@furniturehub.eg' } }),
    autoParts: await prisma.user.findUnique({ where: { email: 'sales@autoparts.eg' } }),
    greenCycle: await prisma.user.findUnique({ where: { email: 'support@greencycle.eg' } }),
  };

  if (!users.ahmed || !users.fatma || !users.khaled || !users.mona || !users.omar || !users.techStore) {
    throw new Error('Required users not found. Please run seed-users.ts first');
  }

  // Get categories
  const categories = {
    electronics: await prisma.category.findFirst({ where: { slug: 'electronics' } }),
    mobilePhones: await prisma.category.findFirst({ where: { slug: 'mobile-phones' } }),
    computers: await prisma.category.findFirst({ where: { slug: 'computers' } }),
    cameras: await prisma.category.findFirst({ where: { slug: 'cameras' } }),
    furniture: await prisma.category.findFirst({ where: { slug: 'furniture' } }),
    bedroom: await prisma.category.findFirst({ where: { slug: 'bedroom' } }),
    livingRoom: await prisma.category.findFirst({ where: { slug: 'living-room' } }),
    vehicles: await prisma.category.findFirst({ where: { slug: 'vehicles' } }),
    cars: await prisma.category.findFirst({ where: { slug: 'cars' } }),
    homeAppliances: await prisma.category.findFirst({ where: { slug: 'home-appliances' } }),
    fashion: await prisma.category.findFirst({ where: { slug: 'fashion' } }),
  };

  if (!categories.electronics || !categories.furniture || !categories.vehicles) {
    throw new Error('Categories not found. Please run seed-categories.ts first');
  }

  // ============================================
  // 1. DIRECT SALE ITEMS (اصناف البيع المباشر)
  // ============================================
  console.log('\n💰 Creating Direct Sale Items...');

  const directSaleItems = [
    // Electronics
    {
      sellerId: users.techStore!.id,
      categoryId: categories.mobilePhones?.id || categories.electronics!.id,
      title: 'iPhone 15 Pro Max 256GB - جديد بالكرتونة',
      description: 'آيفون 15 برو ماكس الجديد كلياً، سعة 256 جيجابايت، لون تيتانيوم أزرق. ضمان أبل الرسمي لمدة عام كامل. الجهاز مغلف ولم يفتح. شحن مجاني لجميع المحافظات.',
      condition: ItemCondition.NEW,
      estimatedValue: 75000,
      images: IMAGES.iphone15,
      governorate: 'Cairo',
      city: 'Downtown',
      listingType: ListingType.DIRECT_SALE,
      isFeatured: true,
      promotionTier: 'GOLD',
    },
    {
      sellerId: users.techStore!.id,
      categoryId: categories.mobilePhones?.id || categories.electronics!.id,
      title: 'Samsung Galaxy S24 Ultra 512GB',
      description: 'سامسونج جالاكسي S24 ألترا، أحدث إصدار، سعة 512 جيجابايت، لون بنفسجي تيتانيوم. يأتي مع قلم S Pen وشاحن سريع 45 واط. ضمان سنتين.',
      condition: ItemCondition.NEW,
      estimatedValue: 65000,
      images: IMAGES.samsung,
      governorate: 'Cairo',
      city: 'Downtown',
      listingType: ListingType.DIRECT_SALE,
      isFeatured: true,
      promotionTier: 'PREMIUM',
    },
    {
      sellerId: users.ahmed!.id,
      categoryId: categories.computers?.id || categories.electronics!.id,
      title: 'MacBook Pro 14" M3 Pro - حالة ممتازة',
      description: 'ماك بوك برو 14 إنش بمعالج M3 Pro، ذاكرة 18 جيجابايت، تخزين 512 جيجابايت SSD. استخدام شخصي خفيف لمدة 3 أشهر فقط. البطارية 98%. يأتي مع الكرتونة الأصلية والشاحن.',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 85000,
      images: IMAGES.macbook,
      governorate: 'Cairo',
      city: 'Nasr City',
      listingType: ListingType.DIRECT_SALE,
      isFeatured: true,
      promotionTier: 'GOLD',
    },
    {
      sellerId: users.techStore!.id,
      categoryId: categories.electronics!.id,
      title: 'PlayStation 5 + 2 Controllers + 3 Games',
      description: 'بلايستيشن 5 النسخة الرقمية مع 2 دراعات DualSense و3 ألعاب (FIFA 24, Spider-Man 2, God of War). حالة ممتازة، ضمان المحل 6 أشهر.',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 28000,
      images: IMAGES.ps5,
      governorate: 'Cairo',
      city: 'Downtown',
      listingType: ListingType.DIRECT_SALE,
    },
    {
      sellerId: users.fatma!.id,
      categoryId: categories.cameras?.id || categories.electronics!.id,
      title: 'Canon EOS R6 Mark II + عدسة 24-105mm',
      description: 'كاميرا كانون EOS R6 Mark II الاحترافية مع عدسة RF 24-105mm f/4L. مثالية للتصوير الفوتوغرافي والفيديو 4K. استخدام خفيف، عدد الشتر أقل من 5000.',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 95000,
      images: IMAGES.camera,
      governorate: 'Alexandria',
      city: 'Smouha',
      listingType: ListingType.DIRECT_SALE,
      isFeatured: true,
      promotionTier: 'PREMIUM',
    },
    {
      sellerId: users.techStore!.id,
      categoryId: categories.electronics!.id,
      title: 'Apple AirPods Pro 2 - جديد بالضمان',
      description: 'سماعات أبل إيربودز برو الجيل الثاني مع علبة شحن MagSafe. خاصية إلغاء الضوضاء النشطة وصوت مكاني. ضمان أبل الرسمي سنة كاملة.',
      condition: ItemCondition.NEW,
      estimatedValue: 9500,
      images: IMAGES.airpods,
      governorate: 'Cairo',
      city: 'Downtown',
      listingType: ListingType.DIRECT_SALE,
    },
    {
      sellerId: users.techStore!.id,
      categoryId: categories.electronics!.id,
      title: 'LG OLED 65" C3 Smart TV 4K',
      description: 'شاشة LG OLED مقاس 65 بوصة، موديل C3 الأحدث. دقة 4K مع تقنية Dolby Vision و Dolby Atmos. مثالية للأفلام والألعاب مع معدل تحديث 120Hz.',
      condition: ItemCondition.NEW,
      estimatedValue: 55000,
      images: IMAGES.tv,
      governorate: 'Cairo',
      city: 'Downtown',
      listingType: ListingType.DIRECT_SALE,
      isFeatured: true,
      promotionTier: 'GOLD',
    },
    // Furniture
    {
      sellerId: users.furnitureHub!.id,
      categoryId: categories.livingRoom?.id || categories.furniture!.id,
      title: 'طقم كنب مودرن 7 مقاعد - جلد إيطالي',
      description: 'طقم كنب فاخر من الجلد الإيطالي الأصلي، 7 مقاعد (3+2+1+1). تصميم عصري أنيق، لون رمادي داكن. التوصيل والتركيب مجاناً داخل القاهرة الكبرى.',
      condition: ItemCondition.NEW,
      estimatedValue: 85000,
      images: IMAGES.sofa,
      governorate: 'Giza',
      city: '6th October City',
      listingType: ListingType.DIRECT_SALE,
      isFeatured: true,
      promotionTier: 'PREMIUM',
    },
    {
      sellerId: users.furnitureHub!.id,
      categoryId: categories.bedroom?.id || categories.furniture!.id,
      title: 'غرفة نوم كاملة خشب زان طبيعي',
      description: 'غرفة نوم كاملة من خشب الزان الطبيعي: سرير كينج سايز + دولاب 6 أبواب + 2 كومودينو + تسريحة بمرآة. صناعة مصرية فاخرة بضمان 5 سنوات.',
      condition: ItemCondition.NEW,
      estimatedValue: 65000,
      images: IMAGES.bed,
      governorate: 'Giza',
      city: '6th October City',
      listingType: ListingType.DIRECT_SALE,
      isFeatured: true,
      promotionTier: 'GOLD',
    },
    {
      sellerId: users.furnitureHub!.id,
      categoryId: categories.furniture!.id,
      title: 'سفرة 8 كراسي خشب أوك أمريكي',
      description: 'طاولة سفرة فاخرة من خشب الأوك الأمريكي مع 8 كراسي مبطنة. التصميم كلاسيكي عصري، مقاس الطاولة 220×100 سم. مناسبة للفيلات والشقق الكبيرة.',
      condition: ItemCondition.NEW,
      estimatedValue: 45000,
      images: IMAGES.diningTable,
      governorate: 'Giza',
      city: '6th October City',
      listingType: ListingType.DIRECT_SALE,
    },
    // Home Appliances
    {
      sellerId: users.mona!.id,
      categoryId: categories.homeAppliances?.id || categories.electronics!.id,
      title: 'ثلاجة سامسونج 28 قدم - French Door',
      description: 'ثلاجة سامسونج الذكية بنظام French Door، سعة 28 قدم مكعب. شاشة تحكم ذكية، موزع ماء وثلج، نظام Twin Cooling+. استخدام سنة واحدة، حالة ممتازة.',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 45000,
      images: IMAGES.refrigerator,
      governorate: 'Cairo',
      city: 'Heliopolis',
      listingType: ListingType.DIRECT_SALE,
    },
    {
      sellerId: users.mona!.id,
      categoryId: categories.homeAppliances?.id || categories.electronics!.id,
      title: 'غسالة LG 12 كيلو - AI Direct Drive',
      description: 'غسالة LG بتقنية الذكاء الاصطناعي، سعة 12 كيلو، موتور Direct Drive بضمان 10 سنوات. خاصية البخار للتعقيم، استهلاك طاقة منخفض.',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 22000,
      images: IMAGES.washer,
      governorate: 'Cairo',
      city: 'Heliopolis',
      listingType: ListingType.DIRECT_SALE,
    },
    // Vehicles
    {
      sellerId: users.khaled!.id,
      categoryId: categories.cars?.id || categories.vehicles!.id,
      title: 'Toyota Camry 2023 - فبريكة بالكامل',
      description: 'تويوتا كامري 2023، موديل GLE هايبرد، لون أبيض لؤلؤي. عداد 15,000 كم فقط، فبريكة بالكامل، صيانة الوكالة. سيارة أول مالك، رخصة سارية.',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 1450000,
      images: IMAGES.toyota,
      governorate: 'Giza',
      city: 'Dokki',
      listingType: ListingType.DIRECT_SALE,
      isFeatured: true,
      promotionTier: 'GOLD',
    },
  ];

  const createdDirectSaleItems = [];
  for (const itemData of directSaleItems) {
    const item = await prisma.item.create({
      data: {
        ...itemData,
        status: ItemStatus.ACTIVE,
      },
    });
    createdDirectSaleItems.push(item);
    console.log(`  ✅ ${item.title}`);
  }

  // ============================================
  // 2. AUCTION ITEMS (معاملات المزادات)
  // ============================================
  console.log('\n🔨 Creating Auction Items and Bids...');

  const auctionItems = [
    {
      sellerId: users.ahmed!.id,
      categoryId: categories.mobilePhones?.id || categories.electronics!.id,
      title: 'iPhone 14 Pro 256GB - مزاد يبدأ من 1 جنيه!',
      description: 'آيفون 14 برو سعة 256 جيجابايت، لون ذهبي. حالة ممتازة جداً، البطارية 95%. يأتي مع الكرتونة الأصلية وجميع الملحقات. المزاد يبدأ من جنيه واحد فقط!',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 42000,
      images: IMAGES.iphone14,
      governorate: 'Cairo',
      city: 'Nasr City',
      listingType: ListingType.AUCTION,
      startingPrice: 1,
      reservePrice: 35000,
    },
    {
      sellerId: users.fatma!.id,
      categoryId: categories.cameras?.id || categories.electronics!.id,
      title: 'Sony A7 IV + 2 عدسات - مزاد للمحترفين',
      description: 'كاميرا سوني A7 IV الاحترافية مع عدستين: Sony 24-70mm f/2.8 GM و Sony 85mm f/1.4 GM. كاميرا للمحترفين، استخدام studio فقط.',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 150000,
      images: IMAGES.camera,
      governorate: 'Alexandria',
      city: 'Smouha',
      listingType: ListingType.AUCTION,
      startingPrice: 50000,
      reservePrice: 120000,
    },
    {
      sellerId: users.omar!.id,
      categoryId: categories.computers?.id || categories.electronics!.id,
      title: 'Gaming PC RTX 4090 - كمبيوتر العمر!',
      description: 'جهاز جيمنج خارق: RTX 4090، Intel i9-14900K، 64GB DDR5، 2TB NVMe SSD، كيسة Lian Li مع تبريد مائي كامل. الجهاز وحش للألعاب والـ 3D.',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 180000,
      images: IMAGES.laptop,
      governorate: 'Cairo',
      city: 'Maadi',
      listingType: ListingType.AUCTION,
      startingPrice: 80000,
      reservePrice: 150000,
    },
  ];

  for (const auctionData of auctionItems) {
    const { startingPrice, reservePrice, ...itemData } = auctionData;

    const item = await prisma.item.create({
      data: {
        ...itemData,
        status: ItemStatus.ACTIVE,
      },
    });

    // Create listing for auction
    const listing = await prisma.listing.create({
      data: {
        itemId: item.id,
        userId: item.sellerId,
        listingType: ListingType.AUCTION,
        price: startingPrice,
        startingBid: startingPrice,
        currentBid: startingPrice,
        reservePrice: reservePrice,
        status: ListingStatus.ACTIVE,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Create auction
    const auction = await prisma.auction.create({
      data: {
        listingId: listing.id,
        startingPrice: startingPrice,
        currentPrice: startingPrice + Math.floor(Math.random() * 5000),
        reservePrice: reservePrice,
        minBidIncrement: 100,
        startTime: new Date(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        bidCount: Math.floor(Math.random() * 15) + 5,
      },
    });

    // Create some bids
    const bidders = [users.mona!, users.khaled!, users.omar!, users.fatma!].filter(u => u.id !== item.sellerId);
    let currentBid = startingPrice;

    for (let i = 0; i < 5; i++) {
      const bidder = bidders[i % bidders.length];
      currentBid += Math.floor(Math.random() * 2000) + 500;

      await prisma.auctionBid.create({
        data: {
          listingId: listing.id,
          bidderId: bidder.id,
          amount: currentBid,
          isAutoBid: Math.random() > 0.7,
        },
      });
    }

    // Update auction current price
    await prisma.auction.update({
      where: { id: auction.id },
      data: { currentPrice: currentBid },
    });

    console.log(`  ✅ ${item.title} (${auction.bidCount} bids)`);
  }

  // ============================================
  // 3. WANTED/DIRECT BUY ITEMS (اصناف الشراء المباشر)
  // ============================================
  console.log('\n🔍 Creating Wanted/Direct Buy Items...');

  const wantedItems = [
    {
      sellerId: users.ahmed!.id,
      categoryId: categories.cars?.id || categories.vehicles!.id,
      title: 'مطلوب: BMW X5 2020 أو أحدث',
      description: 'أبحث عن BMW X5 موديل 2020 أو أحدث، لون أبيض أو أسود. الميزانية تصل إلى 2.5 مليون جنيه. يفضل أن تكون فبريكة من الوكيل مع سجل صيانة كامل.',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 2500000,
      images: IMAGES.bmw,
      governorate: 'Cairo',
      city: 'New Cairo',
      listingType: ListingType.DIRECT_BUY,
    },
    {
      sellerId: users.fatma!.id,
      categoryId: categories.mobilePhones?.id || categories.electronics!.id,
      title: 'مطلوب: iPhone 15 Pro Max بسعر معقول',
      description: 'أبحث عن iPhone 15 Pro Max سعة 256GB أو أكثر. أقبل الجديد أو المستعمل بحالة ممتازة. الميزانية: 55,000 - 65,000 جنيه.',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 60000,
      images: IMAGES.iphone15,
      governorate: 'Alexandria',
      city: 'Smouha',
      listingType: ListingType.DIRECT_BUY,
    },
    {
      sellerId: users.mona!.id,
      categoryId: categories.furniture!.id,
      title: 'مطلوب: غرفة نوم أطفال كاملة',
      description: 'أبحث عن غرفة نوم أطفال كاملة، تصميم عصري، ألوان فاتحة. تشمل سريرين أو سرير بدورين، دولاب، ومكتب. الميزانية: 25,000 - 40,000 جنيه.',
      condition: ItemCondition.GOOD,
      estimatedValue: 35000,
      images: IMAGES.bed,
      governorate: 'Cairo',
      city: 'Heliopolis',
      listingType: ListingType.DIRECT_BUY,
    },
    {
      sellerId: users.khaled!.id,
      categoryId: categories.computers?.id || categories.electronics!.id,
      title: 'مطلوب: MacBook Pro M2/M3 للبرمجة',
      description: 'مبرمج يبحث عن MacBook Pro بمعالج M2 Pro أو M3، ذاكرة 16GB على الأقل. أفضل الشاشة 14 إنش. الميزانية حتى 70,000 جنيه.',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 70000,
      images: IMAGES.macbook,
      governorate: 'Giza',
      city: 'Dokki',
      listingType: ListingType.DIRECT_BUY,
    },
    {
      sellerId: users.omar!.id,
      categoryId: categories.homeAppliances?.id || categories.electronics!.id,
      title: 'مطلوب: تكييف 2.25 حصان انفرتر',
      description: 'أبحث عن تكييف سبليت 2.25 حصان، يفضل انفرتر لتوفير الكهرباء. ماركات مقبولة: شارب، كاريير، LG، سامسونج. جديد أو مستعمل بحالة ممتازة.',
      condition: ItemCondition.GOOD,
      estimatedValue: 25000,
      images: IMAGES.ac,
      governorate: 'Cairo',
      city: 'Maadi',
      listingType: ListingType.DIRECT_BUY,
    },
  ];

  for (const itemData of wantedItems) {
    const item = await prisma.item.create({
      data: {
        ...itemData,
        status: ItemStatus.ACTIVE,
      },
    });
    console.log(`  ✅ ${item.title}`);
  }

  // ============================================
  // 4. REVERSE AUCTIONS / TENDERS (معاملات المناقصات)
  // ============================================
  console.log('\n📋 Creating Reverse Auctions (Tenders)...');

  const reverseAuctions = [
    {
      buyerId: users.ahmed!.id,
      title: 'مناقصة: 10 لابتوبات للشركة',
      description: 'نبحث عن 10 لابتوبات للموظفين. المواصفات المطلوبة: Core i5 أو أعلى، 16GB RAM، 512GB SSD، شاشة 15 بوصة. نقبل ماركات Dell, HP, Lenovo.',
      categoryId: categories.computers?.id || categories.electronics!.id,
      condition: ItemCondition.NEW,
      quantity: 10,
      maxBudget: 180000,
      location: 'Cairo',
    },
    {
      buyerId: users.furnitureHub!.id,
      title: 'مناقصة: أثاث مكتبي لـ 20 موظف',
      description: 'نحتاج أثاث مكتبي كامل لـ 20 موظف: مكاتب + كراسي مريحة + أدراج. التسليم خلال أسبوعين. نرحب بعروض المصنعين والموردين.',
      categoryId: categories.furniture!.id,
      condition: ItemCondition.NEW,
      quantity: 20,
      maxBudget: 150000,
      location: 'Giza',
    },
    {
      buyerId: users.techStore!.id,
      title: 'مناقصة: شاشات عرض للمحل',
      description: 'نبحث عن 5 شاشات عرض تجارية مقاس 55 بوصة أو أكبر، دقة 4K، مناسبة للعمل المتواصل. نفضل ماركات LG أو Samsung التجارية.',
      categoryId: categories.electronics!.id,
      condition: ItemCondition.NEW,
      quantity: 5,
      maxBudget: 100000,
      location: 'Cairo',
    },
    {
      buyerId: users.mona!.id,
      title: 'مناقصة: تجهيز مطبخ كامل',
      description: 'أبحث عن عروض لتجهيز مطبخ كامل: ثلاجة + بوتاجاز + غسالة أطباق + ميكروويف + خلاط. أفضل الأجهزة الموفرة للطاقة.',
      categoryId: categories.homeAppliances?.id || categories.electronics!.id,
      condition: ItemCondition.NEW,
      quantity: 1,
      maxBudget: 80000,
      location: 'Cairo',
    },
  ];

  for (const raData of reverseAuctions) {
    const reverseAuction = await prisma.reverseAuction.create({
      data: {
        buyerId: raData.buyerId,
        title: raData.title,
        description: raData.description,
        categoryId: raData.categoryId!,
        condition: raData.condition,
        quantity: raData.quantity,
        maxBudget: raData.maxBudget,
        location: raData.location,
        status: 'ACTIVE',
        startTime: new Date(),
        endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      },
    });

    // Add some bids to each reverse auction
    const sellers = [users.techStore!, users.furnitureHub!, users.autoParts!].filter(s => s && s.id !== raData.buyerId);

    for (let i = 0; i < Math.min(3, sellers.length); i++) {
      const seller = sellers[i];
      if (!seller) continue;

      const bidPrice = raData.maxBudget * (0.7 + Math.random() * 0.25); // 70-95% of max budget

      await prisma.reverseAuctionBid.create({
        data: {
          reverseAuctionId: reverseAuction.id,
          sellerId: seller.id,
          price: Math.floor(bidPrice),
          description: `عرض من ${seller.businessName || seller.fullName}: نوفر المطلوب بجودة عالية وضمان كامل.`,
          deliveryTime: `${Math.floor(Math.random() * 7) + 3} أيام`,
          warranty: `${Math.floor(Math.random() * 12) + 6} شهور`,
          status: 'PENDING',
        },
      });
    }

    console.log(`  ✅ ${reverseAuction.title}`);
  }

  // ============================================
  // 5. BARTER ITEMS (معاملات المقايضات)
  // ============================================
  console.log('\n🔄 Creating Barter Items and Offers...');

  const barterItems = [
    {
      sellerId: users.ahmed!.id,
      categoryId: categories.mobilePhones?.id || categories.electronics!.id,
      title: 'iPhone 13 Pro للمقايضة بـ Samsung S24',
      description: 'آيفون 13 برو 256GB، حالة ممتازة، البطارية 90%. أبحث عن Samsung Galaxy S24 أو S24+ للمقايضة المباشرة. مستعد لدفع فرق إذا لزم الأمر.',
      condition: ItemCondition.GOOD,
      estimatedValue: 35000,
      images: IMAGES.iphone14,
      governorate: 'Cairo',
      city: 'Nasr City',
      listingType: ListingType.BARTER,
      desiredItemTitle: 'Samsung Galaxy S24',
      desiredValueMin: 30000,
      desiredValueMax: 45000,
    },
    {
      sellerId: users.fatma!.id,
      categoryId: categories.furniture!.id,
      title: 'كنبة جلد إيطالي للمقايضة بغرفة سفرة',
      description: 'كنبة 4 مقاعد جلد إيطالي أصلي، لون كحلي، حالة ممتازة جداً. قيمتها حوالي 25,000 جنيه. أبحث عن سفرة 6 كراسي خشب للمقايضة.',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 25000,
      images: IMAGES.sofa,
      governorate: 'Alexandria',
      city: 'Smouha',
      listingType: ListingType.BARTER,
      desiredItemTitle: 'سفرة خشب 6 كراسي',
      desiredValueMin: 20000,
      desiredValueMax: 30000,
    },
    {
      sellerId: users.omar!.id,
      categoryId: categories.electronics!.id,
      title: 'PS5 + ألعاب للمقايضة بـ Nintendo Switch',
      description: 'بلايستيشن 5 مع 5 ألعاب أصلية (FIFA 24, Spider-Man 2, Hogwarts Legacy, الخ). أبحث عن Nintendo Switch OLED مع ألعاب. أفضل المقايضة المباشرة.',
      condition: ItemCondition.GOOD,
      estimatedValue: 22000,
      images: IMAGES.ps5,
      governorate: 'Cairo',
      city: 'Maadi',
      listingType: ListingType.BARTER,
      desiredItemTitle: 'Nintendo Switch OLED',
      desiredValueMin: 15000,
      desiredValueMax: 25000,
    },
    {
      sellerId: users.khaled!.id,
      categoryId: categories.cameras?.id || categories.electronics!.id,
      title: 'كاميرا Canon للمقايضة بدرون DJI',
      description: 'كاميرا Canon EOS 90D مع عدسة 18-135mm، حالة ممتازة. أبحث عن درون DJI (Mini 3 Pro أو Air 2S) للمقايضة. مهتم بالتصوير الجوي.',
      condition: ItemCondition.GOOD,
      estimatedValue: 30000,
      images: IMAGES.camera,
      governorate: 'Giza',
      city: 'Dokki',
      listingType: ListingType.BARTER,
      desiredItemTitle: 'DJI Drone',
      desiredValueMin: 25000,
      desiredValueMax: 40000,
    },
  ];

  const createdBarterItems = [];
  for (const itemData of barterItems) {
    const item = await prisma.item.create({
      data: {
        ...itemData,
        status: ItemStatus.ACTIVE,
      },
    });
    createdBarterItems.push(item);
    console.log(`  ✅ ${item.title}`);
  }

  // Create barter offers
  console.log('\n  Creating barter offers...');

  // Offer 1: Pending
  await prisma.barterOffer.create({
    data: {
      initiatorId: users.mona!.id,
      recipientId: users.ahmed!.id,
      offeredItemIds: [],
      offeredBundleValue: 38000,
      status: BarterOfferStatus.PENDING,
      notes: 'مرحباً، عندي Samsung S24 جديد وأريد مقايضته بالآيفون. الجهاز بالكرتونة والضمان.',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Offer 2: Counter-offered
  await prisma.barterOffer.create({
    data: {
      initiatorId: users.khaled!.id,
      recipientId: users.fatma!.id,
      offeredItemIds: [],
      offeredBundleValue: 22000,
      status: BarterOfferStatus.COUNTER_OFFERED,
      notes: 'العرض الأصلي: سفرة 4 كراسي. العرض المضاد: ممكن سفرة 6 كراسي مع إضافة 3000 جنيه؟',
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });

  // Offer 3: Accepted
  await prisma.barterOffer.create({
    data: {
      initiatorId: users.ahmed!.id,
      recipientId: users.omar!.id,
      offeredItemIds: [],
      offeredBundleValue: 20000,
      status: BarterOfferStatus.ACCEPTED,
      notes: 'تمام، موافق على المقايضة. نتقابل في المعادي يوم الجمعة؟',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('  ✅ Created 3 barter offers');

  // ============================================
  // 6. SCRAP ITEMS (اصناف التوالف)
  // ============================================
  console.log('\n♻️ Creating Scrap Market Items...');

  const scrapItems = [
    {
      sellerId: users.greenCycle?.id || users.ahmed!.id,
      categoryId: categories.electronics!.id,
      title: 'خردة إلكترونيات - لوحات كمبيوتر',
      description: '50 كيلو لوحات إلكترونية من كمبيوترات قديمة. تحتوي على معادن ثمينة (ذهب، فضة، نحاس). مناسبة لشركات إعادة التدوير.',
      condition: ItemCondition.POOR,
      estimatedValue: 15000,
      images: IMAGES.scrapElectronics,
      governorate: 'Cairo',
      city: 'New Cairo',
      listingType: ListingType.DIRECT_SALE,
      isScrap: true,
      scrapType: ScrapType.ELECTRONICS,
      scrapCondition: ScrapCondition.NOT_WORKING,
      scrapPricingType: ScrapPricingType.PER_KG,
      weightKg: 50,
      pricePerKg: 300,
    },
    {
      sellerId: users.autoParts?.id || users.khaled!.id,
      categoryId: categories.vehicles!.id,
      title: 'سيارة تالفة للبيع كقطع غيار',
      description: 'سيارة هيونداي اكسنت 2015، تالفة من حادث أمامي. الموتور والجيربوكس سليمين. مناسبة للفك وبيع القطع أو كخردة حديد.',
      condition: ItemCondition.POOR,
      estimatedValue: 45000,
      images: IMAGES.scrapCar,
      governorate: 'Alexandria',
      city: 'El-Manshia',
      listingType: ListingType.DIRECT_SALE,
      isScrap: true,
      scrapType: ScrapType.CAR_PARTS,
      scrapCondition: ScrapCondition.PARTIALLY_WORKING,
      isRepairable: false,
      workingPartsDesc: 'الموتور، الجيربوكس، الأبواب الخلفية، المقاعد',
      defectDescription: 'الجزء الأمامي كامل تالف من الحادث',
    },
    {
      sellerId: users.greenCycle?.id || users.omar!.id,
      categoryId: categories.electronics!.id,
      title: 'كابلات نحاس - 100 كيلو',
      description: '100 كيلو كابلات نحاسية من مشاريع كهرباء. النحاس نقي بنسبة 95%. السعر قابل للتفاوض للكميات الكبيرة.',
      condition: ItemCondition.FAIR,
      estimatedValue: 35000,
      images: IMAGES.scrapMetal,
      governorate: 'Cairo',
      city: 'New Cairo',
      listingType: ListingType.DIRECT_SALE,
      isScrap: true,
      scrapType: ScrapType.CABLES_WIRES,
      scrapCondition: ScrapCondition.NOT_WORKING,
      scrapPricingType: ScrapPricingType.PER_KG,
      weightKg: 100,
      pricePerKg: 350,
      metalType: MetalType.COPPER,
      metalPurity: 95,
    },
    {
      sellerId: users.greenCycle?.id || users.mona!.id,
      categoryId: categories.homeAppliances?.id || categories.electronics!.id,
      title: 'أجهزة منزلية تالفة للتدوير',
      description: 'مجموعة أجهزة منزلية تالفة: 2 غسالة + 3 ثلاجات + 5 ميكروويف. مناسبة للفك وإعادة التدوير. البيع جملة واحدة فقط.',
      condition: ItemCondition.POOR,
      estimatedValue: 8000,
      images: IMAGES.scrapElectronics,
      governorate: 'Cairo',
      city: 'Heliopolis',
      listingType: ListingType.DIRECT_SALE,
      isScrap: true,
      scrapType: ScrapType.HOME_APPLIANCES,
      scrapCondition: ScrapCondition.TOTALLY_DAMAGED,
    },
    {
      sellerId: users.autoParts?.id || users.khaled!.id,
      categoryId: categories.vehicles!.id,
      title: 'بطاريات سيارات مستعملة - 20 قطعة',
      description: '20 بطارية سيارة مستعملة، ماركات متنوعة. بعضها يعمل لفترة قصيرة، والباقي للتدوير. مناسبة لمحلات البطاريات أو مصانع التدوير.',
      condition: ItemCondition.POOR,
      estimatedValue: 6000,
      images: IMAGES.scrapMetal,
      governorate: 'Alexandria',
      city: 'El-Manshia',
      listingType: ListingType.DIRECT_SALE,
      isScrap: true,
      scrapType: ScrapType.BATTERIES,
      scrapCondition: ScrapCondition.PARTIALLY_WORKING,
    },
  ];

  for (const itemData of scrapItems) {
    const item = await prisma.item.create({
      data: {
        ...itemData,
        status: ItemStatus.ACTIVE,
      },
    });
    console.log(`  ✅ ${item.title}`);
  }

  // ============================================
  // 7. LUXURY ITEMS (اصناف الفاخرة)
  // ============================================
  console.log('\n👑 Creating Luxury Market Items...');

  const luxuryItems = [
    {
      sellerId: users.fatma!.id,
      categoryId: categories.fashion?.id || categories.electronics!.id,
      title: 'ساعة Rolex Submariner أصلية',
      description: 'ساعة رولكس سبمارينر موديل 2022، ستانلس ستيل مع قرص أسود. أصلية 100% مع شهادة الأصالة والكرتونة والفاتورة الأصلية من الوكيل.',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 850000,
      images: IMAGES.rolex,
      governorate: 'Cairo',
      city: 'Zamalek',
      listingType: ListingType.DIRECT_SALE,
      isFeatured: true,
      promotionTier: 'GOLD',
    },
    {
      sellerId: users.mona!.id,
      categoryId: categories.fashion?.id || categories.electronics!.id,
      title: 'حقيبة Louis Vuitton Neverfull MM',
      description: 'حقيبة لويس فيتون Neverfull MM أصلية، كانفاس مونوجرام مع بطانة وردية. حالة ممتازة، استخدام خفيف جداً. معها الفاتورة والداست باج.',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 65000,
      images: IMAGES.louisVuitton,
      governorate: 'Cairo',
      city: 'Heliopolis',
      listingType: ListingType.DIRECT_SALE,
      isFeatured: true,
      promotionTier: 'PREMIUM',
    },
    {
      sellerId: users.techStore!.id,
      categoryId: categories.fashion?.id || categories.electronics!.id,
      title: 'ساعة Omega Seamaster Professional',
      description: 'ساعة أوميغا سيماستر بروفيشنال 300M، موديل جيمس بوند. حركة أوتوماتيكية، مقاومة للماء 300 متر. أصلية مع الأوراق والضمان.',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 280000,
      images: IMAGES.watch,
      governorate: 'Cairo',
      city: 'Downtown',
      listingType: ListingType.DIRECT_SALE,
      isFeatured: true,
      promotionTier: 'GOLD',
    },
    {
      sellerId: users.fatma!.id,
      categoryId: categories.fashion?.id || categories.electronics!.id,
      title: 'طقم مجوهرات ذهب عيار 21',
      description: 'طقم مجوهرات ذهب عيار 21 قيراط: سلسلة + أقراط + خاتم + إسورة. التصميم عصري أنيق، الوزن الإجمالي 45 جرام. صناعة مصرية فاخرة.',
      condition: ItemCondition.NEW,
      estimatedValue: 180000,
      images: IMAGES.jewelry,
      governorate: 'Alexandria',
      city: 'Smouha',
      listingType: ListingType.DIRECT_SALE,
      isFeatured: true,
      promotionTier: 'PREMIUM',
    },
    {
      sellerId: users.khaled!.id,
      categoryId: categories.cars?.id || categories.vehicles!.id,
      title: 'Mercedes-Benz S-Class 2023',
      description: 'مرسيدس S500 موديل 2023، لون أسود ميتاليك مع جلد بيج. فل الفل، كل الكماليات. عداد 8,000 كم فقط، حالة الزيرو. ضمان الوكيل ساري.',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 6500000,
      images: IMAGES.mercedes,
      governorate: 'Giza',
      city: 'Sheikh Zayed',
      listingType: ListingType.DIRECT_SALE,
      isFeatured: true,
      promotionTier: 'GOLD',
    },
    {
      sellerId: users.omar!.id,
      categoryId: categories.fashion?.id || categories.electronics!.id,
      title: 'حقيبة Hermès Birkin 30 - نادرة',
      description: 'حقيبة هيرميس بيركن 30 سم، جلد Togo لون أسود مع إكسسوارات ذهبية. الحقيبة أصلية 100% مع شهادة الأصالة. نادرة ومحدودة.',
      condition: ItemCondition.LIKE_NEW,
      estimatedValue: 1200000,
      images: IMAGES.handbag,
      governorate: 'Cairo',
      city: 'Garden City',
      listingType: ListingType.DIRECT_SALE,
      isFeatured: true,
      promotionTier: 'GOLD',
    },
  ];

  for (const itemData of luxuryItems) {
    const item = await prisma.item.create({
      data: {
        ...itemData,
        status: ItemStatus.ACTIVE,
      },
    });
    console.log(`  ✅ ${item.title}`);
  }

  // ============================================
  // 8. FLASH DEALS (عروض فلاش)
  // ============================================
  console.log('\n⚡ Creating Flash Deals...');

  // Get some items for flash deals
  const flashDealItems = await prisma.item.findMany({
    where: {
      status: ItemStatus.ACTIVE,
      listingType: ListingType.DIRECT_SALE,
      isFeatured: false,
    },
    take: 5,
  });

  for (const item of flashDealItems) {
    // Create listing if not exists
    let listing = await prisma.listing.findFirst({
      where: { itemId: item.id },
    });

    if (!listing) {
      listing = await prisma.listing.create({
        data: {
          itemId: item.id,
          userId: item.sellerId,
          listingType: ListingType.DIRECT_SALE,
          price: item.estimatedValue,
          status: ListingStatus.ACTIVE,
          startDate: new Date(),
        },
      });
    }

    const discountPercent = Math.floor(Math.random() * 30) + 20; // 20-50% discount
    const dealPrice = item.estimatedValue * (1 - discountPercent / 100);

    await prisma.flashDeal.create({
      data: {
        listingId: listing.id,
        title: `خصم ${discountPercent}% على ${item.title.substring(0, 30)}...`,
        description: `عرض فلاش لفترة محدودة! وفر ${Math.floor(item.estimatedValue - dealPrice).toLocaleString()} جنيه`,
        originalPrice: item.estimatedValue,
        dealPrice: Math.floor(dealPrice),
        discountPercent: discountPercent,
        startTime: new Date(),
        endTime: new Date(Date.now() + (Math.floor(Math.random() * 48) + 24) * 60 * 60 * 1000), // 24-72 hours
        totalQuantity: Math.floor(Math.random() * 10) + 5,
        soldQuantity: Math.floor(Math.random() * 3),
        status: 'ACTIVE',
      },
    });

    console.log(`  ✅ Flash Deal: ${discountPercent}% off - ${item.title.substring(0, 40)}...`);
  }

  // ============================================
  // Summary
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('✨ MARKETPLACE DATA SEEDING COMPLETED SUCCESSFULLY! ✨');
  console.log('='.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   💰 Direct Sale Items: ${directSaleItems.length}`);
  console.log(`   🔨 Auction Items: ${auctionItems.length} (with bids)`);
  console.log(`   🔍 Wanted Items: ${wantedItems.length}`);
  console.log(`   📋 Reverse Auctions: ${reverseAuctions.length} (with bids)`);
  console.log(`   🔄 Barter Items: ${barterItems.length} (with offers)`);
  console.log(`   ♻️ Scrap Items: ${scrapItems.length}`);
  console.log(`   👑 Luxury Items: ${luxuryItems.length}`);
  console.log(`   ⚡ Flash Deals: ${flashDealItems.length}`);
  console.log('\n🎉 Total Items Created: ${directSaleItems.length + auctionItems.length + wantedItems.length + barterItems.length + scrapItems.length + luxuryItems.length}');
  console.log('\n');
}

seedMarketplaceData()
  .catch((e) => {
    console.error('❌ Error seeding marketplace data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
