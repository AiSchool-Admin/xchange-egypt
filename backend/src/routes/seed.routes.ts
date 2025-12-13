/**
 * TEMPORARY SEED ROUTES - DELETE AFTER USE
 * One-time endpoints to seed data in production
 */

import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

interface CategoryData {
  nameEn: string;
  nameAr: string;
  slug: string;
  description?: string;
  icon?: string;
  children?: CategoryData[];
}

/**
 * Categories matching seed-items.ts and seed-marketplace-data.ts slugs
 */
const categories: CategoryData[] = [
  // Electronics
  {
    nameEn: 'Electronics',
    nameAr: 'إلكترونيات',
    slug: 'electronics',
    icon: '📱',
    children: [
      {
        nameEn: 'Mobile Phones',
        nameAr: 'هواتف محمولة',
        slug: 'mobile-phones',
        children: [
          { nameEn: 'iPhone', nameAr: 'آيفون', slug: 'iphone' },
          { nameEn: 'Samsung', nameAr: 'سامسونج', slug: 'samsung-phones' },
          { nameEn: 'Xiaomi', nameAr: 'شاومي', slug: 'xiaomi-phones' },
          { nameEn: 'Other Phones', nameAr: 'هواتف أخرى', slug: 'other-phones' },
        ],
      },
      {
        nameEn: 'Computers',
        nameAr: 'أجهزة كمبيوتر',
        slug: 'computers',
        children: [
          { nameEn: 'Laptops', nameAr: 'لابتوب', slug: 'laptops' },
          { nameEn: 'Desktop PCs', nameAr: 'كمبيوتر مكتبي', slug: 'desktop-pcs' },
          { nameEn: 'Monitors', nameAr: 'شاشات', slug: 'monitors' },
        ],
      },
      {
        nameEn: 'Tablets',
        nameAr: 'أجهزة لوحية',
        slug: 'tablets',
        children: [
          { nameEn: 'iPad', nameAr: 'آيباد', slug: 'ipad' },
          { nameEn: 'Samsung Tablets', nameAr: 'تابلت سامسونج', slug: 'samsung-tablets' },
          { nameEn: 'Other Tablets', nameAr: 'تابلت أخرى', slug: 'other-tablets' },
        ],
      },
      {
        nameEn: 'Cameras',
        nameAr: 'كاميرات',
        slug: 'cameras',
        children: [
          { nameEn: 'DSLR Cameras', nameAr: 'كاميرات DSLR', slug: 'dslr-cameras' },
          { nameEn: 'Mirrorless', nameAr: 'ميرورليس', slug: 'mirrorless-cameras' },
        ],
      },
      {
        nameEn: 'Audio & Headphones',
        nameAr: 'سماعات وصوتيات',
        slug: 'audio-headphones',
      },
    ],
  },

  // Home Appliances
  {
    nameEn: 'Home Appliances',
    nameAr: 'أجهزة منزلية',
    slug: 'home-appliances',
    icon: '🏡',
    children: [
      {
        nameEn: 'Refrigerators',
        nameAr: 'ثلاجات',
        slug: 'refrigerators',
      },
      {
        nameEn: 'Washing Machines',
        nameAr: 'غسالات',
        slug: 'washing-machines',
      },
      {
        nameEn: 'Air Conditioners',
        nameAr: 'مكيفات',
        slug: 'air-conditioners',
      },
      {
        nameEn: 'Ovens & Stoves',
        nameAr: 'أفران ومواقد',
        slug: 'ovens-stoves',
      },
    ],
  },

  // Furniture
  {
    nameEn: 'Furniture',
    nameAr: 'أثاث ومفروشات',
    slug: 'furniture',
    icon: '🛋️',
    children: [
      {
        nameEn: 'Living Room',
        nameAr: 'غرفة المعيشة',
        slug: 'living-room',
        children: [
          { nameEn: 'Sofas', nameAr: 'كنب وأرائك', slug: 'sofas' },
          { nameEn: 'TV Units', nameAr: 'وحدات تلفزيون', slug: 'tv-units' },
        ],
      },
      {
        nameEn: 'Bedroom',
        nameAr: 'غرفة النوم',
        slug: 'bedroom',
        children: [
          { nameEn: 'Beds', nameAr: 'أسرة', slug: 'beds' },
          { nameEn: 'Wardrobes', nameAr: 'دواليب', slug: 'wardrobes' },
        ],
      },
      {
        nameEn: 'Office Furniture',
        nameAr: 'أثاث مكتبي',
        slug: 'office-furniture',
      },
    ],
  },

  // Vehicles
  {
    nameEn: 'Vehicles',
    nameAr: 'سيارات ومركبات',
    slug: 'vehicles',
    icon: '🚗',
    children: [
      {
        nameEn: 'Cars',
        nameAr: 'سيارات',
        slug: 'cars',
        children: [
          { nameEn: 'Sedans', nameAr: 'سيدان', slug: 'sedans' },
          { nameEn: 'SUVs', nameAr: 'دفع رباعي', slug: 'suvs' },
        ],
      },
      {
        nameEn: 'Motorcycles',
        nameAr: 'دراجات نارية',
        slug: 'motorcycles',
      },
      {
        nameEn: 'Auto Parts',
        nameAr: 'قطع غيار',
        slug: 'auto-parts',
      },
    ],
  },

  // Fashion
  {
    nameEn: 'Fashion',
    nameAr: 'ملابس وأزياء',
    slug: 'fashion',
    icon: '👔',
    children: [
      { nameEn: "Men's Clothing", nameAr: 'ملابس رجالية', slug: 'mens-clothing' },
      { nameEn: "Women's Clothing", nameAr: 'ملابس نسائية', slug: 'womens-clothing' },
      { nameEn: 'Kids Clothing', nameAr: 'ملابس أطفال', slug: 'kids-clothing' },
      { nameEn: 'Shoes', nameAr: 'أحذية', slug: 'shoes' },
      { nameEn: 'Bags', nameAr: 'حقائب', slug: 'bags' },
    ],
  },

  // Sports & Hobbies
  {
    nameEn: 'Sports & Hobbies',
    nameAr: 'رياضة وترفيه',
    slug: 'sports-hobbies',
    icon: '⚽',
    children: [
      { nameEn: 'Sports Equipment', nameAr: 'معدات رياضية', slug: 'sports-equipment' },
      { nameEn: 'Bicycles', nameAr: 'دراجات', slug: 'bicycles' },
      { nameEn: 'Toys & Games', nameAr: 'ألعاب', slug: 'toys-games' },
    ],
  },

  // Books & Media
  {
    nameEn: 'Books & Media',
    nameAr: 'كتب ووسائط',
    slug: 'books-media',
    icon: '📚',
    children: [
      { nameEn: 'Books', nameAr: 'كتب', slug: 'books' },
      { nameEn: 'Magazines', nameAr: 'مجلات', slug: 'magazines' },
    ],
  },

  // Services
  {
    nameEn: 'Services',
    nameAr: 'خدمات',
    slug: 'services',
    icon: '🛠️',
    children: [
      { nameEn: 'Maintenance & Repair', nameAr: 'صيانة وإصلاح', slug: 'maintenance-repair' },
      { nameEn: 'Moving & Shipping', nameAr: 'نقل وشحن', slug: 'moving-shipping' },
    ],
  },
];

async function createCategoryHierarchy(
  categoryData: CategoryData,
  parentId: string | null = null,
  order: number = 0
): Promise<void> {
  const category = await prisma.category.create({
    data: {
      nameEn: categoryData.nameEn,
      nameAr: categoryData.nameAr,
      slug: categoryData.slug,
      description: categoryData.description,
      icon: categoryData.icon,
      parentId,
      order,
      isActive: true,
    },
  });

  if (categoryData.children && categoryData.children.length > 0) {
    for (let i = 0; i < categoryData.children.length; i++) {
      await createCategoryHierarchy(categoryData.children[i], category.id, i);
    }
  }
}

/**
 * TEMPORARY: Seed categories
 * DELETE THIS ROUTE AFTER USE!
 */
router.post('/seed-categories', async (req, res) => {
  try {
    // Check if categories already exist
    const existingCount = await prisma.category.count();
    if (existingCount > 0) {
      return res.json({
        success: false,
        message: `Categories already exist (${existingCount} found). Use /reseed-categories to force re-seed.`,
      });
    }

    // Create categories
    for (let i = 0; i < categories.length; i++) {
      await createCategoryHierarchy(categories[i], null, i);
    }

    const totalCount = await prisma.category.count();
    return res.json({
      success: true,
      message: `Successfully seeded ${totalCount} categories`,
      data: { count: totalCount },
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to seed categories',
      error: error.message,
    });
  }
});

/**
 * RESEED CATEGORIES - Force delete and reseed
 * إعادة بذور الفئات - حذف وإعادة البذور بالقوة
 */
router.post('/reseed-categories', async (req, res) => {
  try {
    // First, remove categoryId from all items to avoid foreign key issues
    const itemsUpdated = await prisma.item.updateMany({
      where: { categoryId: { not: null } },
      data: { categoryId: null },
    });
    console.log(`[Reseed] Removed category references from ${itemsUpdated.count} items`);

    // Also update reverse auctions
    try {
      await prisma.reverseAuction.updateMany({
        where: { categoryId: { not: null } },
        data: { categoryId: null as any },
      });
    } catch {
      // Table might not exist or have different schema
    }

    // Delete all existing categories
    const deletedCount = await prisma.category.deleteMany({});
    console.log(`[Reseed] Deleted ${deletedCount.count} categories`);

    // Create new categories
    for (let i = 0; i < categories.length; i++) {
      await createCategoryHierarchy(categories[i], null, i);
    }

    const totalCount = await prisma.category.count();

    return res.json({
      success: true,
      message: `تم إعادة بذور الفئات بنجاح`,
      data: {
        deletedCategories: deletedCount.count,
        newCategories: totalCount,
        itemsUpdated: itemsUpdated.count,
        note: 'يجب إعادة تعيين الفئات للمنتجات الموجودة',
      },
    });
  } catch (error: any) {
    console.error('Reseed error:', error);
    return res.status(500).json({
      success: false,
      message: 'فشل في إعادة بذور الفئات',
      error: error.message,
    });
  }
});

/**
 * FIX ITEM CATEGORIES - Reassign categories to items based on their title/type
 * إصلاح فئات المنتجات
 */
router.post('/fix-item-categories', async (req, res) => {
  try {
    // Get all categories for mapping
    const allCategories = await prisma.category.findMany();
    const categoryMap = new Map(allCategories.map((c) => [c.slug, c.id]));

    // Get items without categories
    const itemsWithoutCategory = await prisma.item.findMany({
      where: { categoryId: null },
      select: { id: true, title: true, listingType: true },
    });

    let updated = 0;

    for (const item of itemsWithoutCategory) {
      const title = item.title.toLowerCase();
      let categorySlug: string | null = null;

      // Match by keywords in title
      if (title.includes('iphone') || title.includes('آيفون') || title.includes('samsung') || title.includes('سامسونج') || title.includes('هاتف') || title.includes('phone') || title.includes('موبايل')) {
        categorySlug = 'mobile-phones';
      } else if (title.includes('laptop') || title.includes('لابتوب') || title.includes('macbook') || title.includes('ماك بوك') || title.includes('كمبيوتر') || title.includes('computer')) {
        categorySlug = 'computers';
      } else if (title.includes('tablet') || title.includes('تابلت') || title.includes('ipad') || title.includes('آيباد')) {
        categorySlug = 'tablets';
      } else if (title.includes('camera') || title.includes('كاميرا') || title.includes('canon') || title.includes('nikon') || title.includes('sony')) {
        categorySlug = 'cameras';
      } else if (title.includes('ثلاجة') || title.includes('refrigerator') || title.includes('fridge')) {
        categorySlug = 'refrigerators';
      } else if (title.includes('غسالة') || title.includes('washer') || title.includes('washing')) {
        categorySlug = 'washing-machines';
      } else if (title.includes('تكييف') || title.includes('مكيف') || title.includes('air conditioner') || title.includes('ac ')) {
        categorySlug = 'air-conditioners';
      } else if (title.includes('سيارة') || title.includes('car') || title.includes('toyota') || title.includes('mercedes') || title.includes('bmw') || title.includes('تويوتا')) {
        categorySlug = 'cars';
      } else if (title.includes('كنب') || title.includes('أريكة') || title.includes('sofa') || title.includes('غرفة معيشة')) {
        categorySlug = 'living-room';
      } else if (title.includes('سرير') || title.includes('غرفة نوم') || title.includes('bed') || title.includes('bedroom')) {
        categorySlug = 'bedroom';
      } else if (title.includes('ملابس') || title.includes('حقيبة') || title.includes('ساعة') || title.includes('watch') || title.includes('bag') || title.includes('fashion')) {
        categorySlug = 'fashion';
      } else if (title.includes('playstation') || title.includes('بلايستيشن') || title.includes('ps5') || title.includes('xbox') || title.includes('game')) {
        categorySlug = 'electronics';
      }

      if (categorySlug && categoryMap.has(categorySlug)) {
        await prisma.item.update({
          where: { id: item.id },
          data: { categoryId: categoryMap.get(categorySlug) },
        });
        updated++;
      }
    }

    return res.json({
      success: true,
      message: `تم إصلاح فئات ${updated} منتج`,
      data: {
        totalItemsWithoutCategory: itemsWithoutCategory.length,
        itemsFixed: updated,
        stillWithoutCategory: itemsWithoutCategory.length - updated,
      },
    });
  } catch (error: any) {
    console.error('Fix categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'فشل في إصلاح فئات المنتجات',
      error: error.message,
    });
  }
});

/**
 * TEMPORARY: Seed flash deals for testing
 * DELETE THIS ROUTE AFTER USE!
 */
router.post('/seed-flash-deals', async (req, res) => {
  try {
    // First, clean up any existing test data
    await prisma.flashDeal.deleteMany({
      where: { title: { startsWith: 'عرض فلاش' } }
    });

    // Get a seller user (or create one)
    let seller = await prisma.user.findFirst({
      where: { email: 'seller@test.com' }
    });

    if (!seller) {
      seller = await prisma.user.create({
        data: {
          email: 'seller@test.com',
          passwordHash: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu9.m', // password123
          fullName: 'محمد البائع',
          phone: '+201012345678',
          emailVerified: true,
        }
      });
    }

    // Get a category
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: {
          nameEn: 'Electronics',
          nameAr: 'الإلكترونيات',
          slug: 'electronics',
          isActive: true,
        }
      });
    }

    // Create test listings
    const listings = [];
    const products = [
      { title: 'iPhone 15 Pro Max 256GB', titleAr: 'آيفون 15 برو ماكس 256 جيجا', price: 65000, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400' },
      { title: 'Samsung Galaxy S24 Ultra', titleAr: 'سامسونج جالاكسي S24 ألترا', price: 55000, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400' },
      { title: 'MacBook Pro M3 14"', titleAr: 'ماك بوك برو M3 14 بوصة', price: 85000, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400' },
      { title: 'Sony PlayStation 5', titleAr: 'سوني بلايستيشن 5', price: 25000, image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400' },
      { title: 'Apple Watch Ultra 2', titleAr: 'ساعة أبل ألترا 2', price: 42000, image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400' },
    ];

    for (const product of products) {
      const item = await prisma.item.create({
        data: {
          title: product.title,
          description: `Test product: ${product.title}`,
          condition: 'NEW',
          listingType: 'DIRECT_SALE',
          estimatedValue: product.price,
          images: [product.image],
          seller: { connect: { id: seller.id } },
          category: category ? { connect: { id: category.id } } : undefined,
        }
      });

      const listing = await prisma.listing.create({
        data: {
          listingType: 'DIRECT_SALE',
          price: product.price,
          user: { connect: { id: seller.id } },
          item: { connect: { id: item.id } },
        }
      });

      listings.push({ ...listing, titleAr: product.titleAr, originalPrice: product.price });
    }

    // Create flash deals
    const now = new Date();
    const flashDeals = [];

    for (let i = 0; i < listings.length; i++) {
      const listing = listings[i];
      const discountPct = [30, 40, 50, 25, 35][i];
      const dealPriceCalc = Math.round(listing.originalPrice * (1 - discountPct / 100));

      const deal = await prisma.flashDeal.create({
        data: {
          title: `عرض فلاش ${i + 1}: ${listing.titleAr}`,
          description: `Amazing flash deal with ${discountPct}% off!`,
          listing: { connect: { id: listing.id } },
          originalPrice: listing.originalPrice,
          dealPrice: dealPriceCalc,
          discountPercent: discountPct,
          totalQuantity: 10,
          soldQuantity: Math.floor(Math.random() * 5),
          startTime: new Date(now.getTime() - 1000 * 60 * 30), // Started 30 min ago
          endTime: new Date(now.getTime() + 1000 * 60 * 60 * (i + 2)), // Ends in 2-6 hours
          status: 'ACTIVE', // Important: Set status to ACTIVE
        }
      });

      flashDeals.push(deal);
    }

    // Create one upcoming deal
    const upcomingListing = listings[0];
    await prisma.flashDeal.create({
      data: {
        title: 'عرض قادم: خصم 60% على أحدث الأجهزة',
        description: 'Coming soon - the biggest flash deal yet!',
        listing: { connect: { id: upcomingListing.id } },
        originalPrice: upcomingListing.originalPrice,
        dealPrice: Math.round(upcomingListing.originalPrice * 0.4),
        discountPercent: 60,
        totalQuantity: 20,
        soldQuantity: 0,
        startTime: new Date(now.getTime() + 1000 * 60 * 60 * 24), // Starts tomorrow
        endTime: new Date(now.getTime() + 1000 * 60 * 60 * 48), // Ends in 2 days
      }
    });

    return res.json({
      success: true,
      message: `Successfully created ${flashDeals.length} active flash deals and 1 upcoming deal`,
      data: {
        activeDeals: flashDeals.length,
        upcomingDeals: 1,
        seller: { id: seller.id, email: seller.email }
      },
    });
  } catch (error: any) {
    console.error('Seed flash deals error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to seed flash deals',
      error: error.message,
      details: error.code || error.meta || 'No additional details',
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    });
  }
});

/**
 * COMPREHENSIVE DEMO SEED
 * Use the SQL script in prisma/seed-demo.sql via Supabase SQL Editor
 * استخدم ملف SQL في prisma/seed-demo.sql عبر Supabase SQL Editor
 */
router.get('/seed-demo-info', async (_req, res) => {
  return res.json({
    success: true,
    message: 'لإدخال بيانات العرض التوضيحي، استخدم ملف SQL في Supabase SQL Editor',
    instructions: {
      ar: [
        '1. افتح Supabase Dashboard',
        '2. اذهب إلى SQL Editor',
        '3. انسخ محتوى الملف: backend/prisma/seed-demo.sql',
        '4. الصقه وقم بتشغيله',
      ],
      en: [
        '1. Open Supabase Dashboard',
        '2. Go to SQL Editor',
        '3. Copy contents of: backend/prisma/seed-demo.sql',
        '4. Paste and run it',
      ]
    },
    loginCredentials: {
      message: 'بعد تشغيل SQL، يمكن تسجيل الدخول بأي من الحسابات التالية',
      password: 'Demo@123',
      users: [
        { email: 'ahmed.hassan@demo.xchange.eg', role: 'تاجر إلكترونيات' },
        { email: 'sara.mohamed@demo.xchange.eg', role: 'مستخدم عادي' },
        { email: 'omar.ali@demo.xchange.eg', role: 'تاجر سيارات' },
        { email: 'mohamed.ibrahim@demo.xchange.eg', role: 'تاجر ساعات فاخرة' },
        { email: 'youssef.kamal@demo.xchange.eg', role: 'تاجر توالف' },
        { email: 'khaled.mansour@demo.xchange.eg', role: 'وسيط معتمد' },
      ]
    }
  });
});

/**
 * CLEANUP DEMO DATA
 * Removes all demo data
 * حذف بيانات العرض التوضيحي
 */
router.delete('/cleanup-demo', async (req, res) => {
  try {
    // Delete in correct order to respect foreign keys
    await prisma.review.deleteMany({ where: { reviewer: { email: { contains: '@demo.xchange.eg' } } } });
    await prisma.walletTransaction.deleteMany({ where: { wallet: { user: { email: { contains: '@demo.xchange.eg' } } } } });
    await prisma.wallet.deleteMany({ where: { user: { email: { contains: '@demo.xchange.eg' } } } });
    await prisma.flashDeal.deleteMany({});
    await prisma.escrow.deleteMany({});
    await prisma.barterPoolParticipant.deleteMany({});
    await prisma.barterPool.deleteMany({});
    await prisma.facilitator.deleteMany({ where: { user: { email: { contains: '@demo.xchange.eg' } } } });
    await prisma.scrapDealerVerification.deleteMany({ where: { user: { email: { contains: '@demo.xchange.eg' } } } });
    await prisma.metalPrice.deleteMany({});
    await prisma.listing.deleteMany({ where: { user: { email: { contains: '@demo.xchange.eg' } } } });
    await prisma.item.deleteMany({ where: { seller: { email: { contains: '@demo.xchange.eg' } } } });
    await prisma.exchangePoint.deleteMany({});
    await prisma.user.deleteMany({ where: { email: { contains: '@demo.xchange.eg' } } });

    return res.json({
      success: true,
      message: '✅ تم حذف جميع بيانات العرض التوضيحي',
    });
  } catch (error: any) {
    console.error('Cleanup error:', error);
    return res.status(500).json({
      success: false,
      message: 'فشل في حذف البيانات',
      error: error.message,
    });
  }
});

/**
 * CHECK AVAILABLE PRODUCTS BY LISTING TYPE
 * فحص المنتجات المتاحة حسب نوع البيع
 */
router.get('/check-products', async (req, res) => {
  try {
    // Get all items with their listings
    const items = await prisma.item.findMany({
      where: { status: 'ACTIVE' },
      include: {
        listings: {
          select: {
            id: true,
            listingType: true,
            status: true,
            price: true,
          },
        },
        seller: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by listing type
    const directSale = items.filter(item =>
      item.listings.some(l => l.listingType === 'DIRECT_SALE' && l.status === 'ACTIVE')
    ).map(item => ({
      itemId: item.id,
      listingId: item.listings.find(l => l.listingType === 'DIRECT_SALE' && l.status === 'ACTIVE')?.id,
      title: item.title,
      price: item.listings.find(l => l.listingType === 'DIRECT_SALE')?.price || item.estimatedValue,
      seller: item.seller?.fullName,
      category: item.category?.nameAr,
    }));

    const auction = items.filter(item =>
      item.listings.some(l => l.listingType === 'AUCTION' && l.status === 'ACTIVE')
    ).map(item => ({
      itemId: item.id,
      listingId: item.listings.find(l => l.listingType === 'AUCTION' && l.status === 'ACTIVE')?.id,
      title: item.title,
      startingPrice: item.listings.find(l => l.listingType === 'AUCTION')?.price || item.estimatedValue,
      seller: item.seller?.fullName,
      category: item.category?.nameAr,
    }));

    const barter = items.filter(item =>
      item.listings.some(l => l.listingType === 'BARTER' && l.status === 'ACTIVE')
    ).map(item => ({
      itemId: item.id,
      listingId: item.listings.find(l => l.listingType === 'BARTER' && l.status === 'ACTIVE')?.id,
      title: item.title,
      estimatedValue: item.estimatedValue,
      seller: item.seller?.fullName,
      category: item.category?.nameAr,
    }));

    const noListing = items.filter(item =>
      item.listings.length === 0 || !item.listings.some(l => l.status === 'ACTIVE')
    ).map(item => ({
      itemId: item.id,
      title: item.title,
      listingType: item.listingType,
      estimatedValue: item.estimatedValue,
      seller: item.seller?.fullName,
      category: item.category?.nameAr,
      inactiveListings: item.listings.length,
    }));

    return res.json({
      success: true,
      message: 'تقرير المنتجات المتاحة',
      summary: {
        totalItems: items.length,
        directSale: directSale.length,
        auction: auction.length,
        barter: barter.length,
        noActiveListing: noListing.length,
      },
      data: {
        directSale: {
          count: directSale.length,
          description: 'منتجات متاحة للشراء المباشر (يمكن إضافتها للسلة)',
          items: directSale,
        },
        auction: {
          count: auction.length,
          description: 'منتجات معروضة في مزاد',
          items: auction,
        },
        barter: {
          count: barter.length,
          description: 'منتجات متاحة للمقايضة',
          items: barter,
        },
        noActiveListing: {
          count: noListing.length,
          description: 'منتجات بدون قائمة نشطة',
          items: noListing,
        },
      },
    });
  } catch (error: any) {
    console.error('Check products error:', error);
    return res.status(500).json({
      success: false,
      message: 'فشل في جلب المنتجات',
      error: error.message,
    });
  }
});

/**
 * SEED PROPERTIES MARKETPLACE
 * تغذية سوق العقارات ببيانات تجريبية
 */
router.post('/seed-properties', async (req, res) => {
  try {
    const fs = await import('fs');
    const path = await import('path');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '../../prisma/seeds/properties_comprehensive_seed.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    // Split by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const statement of statements) {
      try {
        await prisma.$executeRawUnsafe(statement + ';');
        successCount++;
      } catch (err: any) {
        // Skip duplicate key errors
        if (!err.message?.includes('duplicate key') && !err.message?.includes('already exists')) {
          errorCount++;
          errors.push(err.message?.substring(0, 100) || 'Unknown error');
        }
      }
    }

    // Get counts
    const propertiesCount = await prisma.property.count();
    const transactionsCount = await prisma.propertyTransaction.count();
    const rentalsCount = await prisma.rentalContract.count();
    const inspectionsCount = await prisma.fieldInspection.count();
    const barterProposalsCount = await prisma.propertyBarterProposal.count();

    return res.json({
      success: true,
      message: 'تم تغذية سوق العقارات بنجاح! 🏠',
      data: {
        statementsExecuted: successCount,
        errors: errorCount,
        counts: {
          properties: propertiesCount,
          transactions: transactionsCount,
          rentals: rentalsCount,
          inspections: inspectionsCount,
          barterProposals: barterProposalsCount,
        },
      },
      errorDetails: errors.length > 0 ? errors.slice(0, 5) : undefined,
    });
  } catch (error: any) {
    console.error('Seed properties error:', error);
    return res.status(500).json({
      success: false,
      message: 'فشل في تغذية سوق العقارات',
      error: error.message,
    });
  }
});

/**
 * CHECK PROPERTIES MARKETPLACE DATA
 * فحص بيانات سوق العقارات
 */
router.get('/check-properties', async (_req, res) => {
  try {
    const properties = await prisma.property.findMany({
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const transactions = await prisma.propertyTransaction.findMany({
      include: {
        property: {
          select: {
            id: true,
            title: true,
            titleAr: true,
          },
        },
        buyer: {
          select: {
            fullName: true,
          },
        },
        seller: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const rentals = await prisma.rentalContract.count();
    const inspections = await prisma.fieldInspection.count();
    const barterProposals = await prisma.propertyBarterProposal.count();

    // Group properties by type
    const byType = properties.reduce((acc, p) => {
      acc[p.propertyType] = (acc[p.propertyType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group properties by listing type
    const byListingType = properties.reduce((acc, p) => {
      acc[p.listingType] = (acc[p.listingType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group transactions by status
    const txByStatus = transactions.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return res.json({
      success: true,
      message: 'تقرير سوق العقارات',
      summary: {
        totalProperties: properties.length,
        totalTransactions: transactions.length,
        totalRentals: rentals,
        totalInspections: inspections,
        totalBarterProposals: barterProposals,
      },
      breakdown: {
        byPropertyType: byType,
        byListingType: byListingType,
        transactionsByStatus: txByStatus,
      },
      properties: properties.map(p => ({
        id: p.id,
        title: p.titleAr || p.title,
        type: p.propertyType,
        listingType: p.listingType,
        governorate: p.governorate,
        price: p.salePrice || p.rentPrice,
        status: p.status,
        verificationLevel: p.verificationLevel,
        owner: p.owner?.fullName,
      })),
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.transactionType,
        property: t.property?.titleAr || t.property?.title,
        buyer: t.buyer?.fullName,
        seller: t.seller?.fullName,
        price: t.agreedPrice,
        status: t.status,
        escrowStatus: t.escrowStatus,
      })),
    });
  } catch (error: any) {
    console.error('Check properties error:', error);
    return res.status(500).json({
      success: false,
      message: 'فشل في جلب بيانات العقارات',
      error: error.message,
    });
  }
});

export default router;
