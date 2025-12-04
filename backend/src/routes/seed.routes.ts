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

const categories: CategoryData[] = [
  // Electronics
  {
    nameEn: 'Electronics',
    nameAr: 'الإلكترونيات',
    slug: 'electronics',
    icon: '📱',
    children: [
      {
        nameEn: 'Smartphones',
        nameAr: 'الهواتف الذكية',
        slug: 'smartphones',
        children: [
          { nameEn: 'iPhone', nameAr: 'آيفون', slug: 'iphone' },
          { nameEn: 'Samsung', nameAr: 'سامسونج', slug: 'samsung' },
          { nameEn: 'Xiaomi', nameAr: 'شاومي', slug: 'xiaomi' },
          { nameEn: 'Oppo', nameAr: 'أوبو', slug: 'oppo' },
          { nameEn: 'Other Brands', nameAr: 'ماركات أخرى', slug: 'other-brands' },
        ],
      },
      {
        nameEn: 'Laptops',
        nameAr: 'أجهزة الكمبيوتر',
        slug: 'laptops',
        children: [
          { nameEn: 'MacBook', nameAr: 'ماك بوك', slug: 'macbook' },
          { nameEn: 'Gaming Laptops', nameAr: 'ألعاب', slug: 'gaming-laptops' },
          { nameEn: 'Business Laptops', nameAr: 'أعمال', slug: 'business-laptops' },
        ],
      },
    ],
  },

  // Home Appliances
  {
    nameEn: 'Home Appliances',
    nameAr: 'الأجهزة المنزلية',
    slug: 'home-appliances',
    icon: '🏠',
    children: [
      {
        nameEn: 'Refrigerators',
        nameAr: 'الثلاجات',
        slug: 'refrigerators',
        children: [
          { nameEn: '16 Feet', nameAr: '16 قدم', slug: '16-feet' },
          { nameEn: '18 Feet', nameAr: '18 قدم', slug: '18-feet' },
          { nameEn: '20 Feet', nameAr: '20 قدم', slug: '20-feet' },
          { nameEn: '24 Feet', nameAr: '24 قدم', slug: '24-feet' },
          { nameEn: 'Side by Side', nameAr: 'جنب إلى جنب', slug: 'side-by-side' },
        ],
      },
      {
        nameEn: 'Washing Machines',
        nameAr: 'الغسالات',
        slug: 'washing-machines',
        children: [
          { nameEn: 'Top Load', nameAr: 'تحميل علوي', slug: 'top-load' },
          { nameEn: 'Front Load', nameAr: 'تحميل أمامي', slug: 'front-load' },
          { nameEn: '7-8 KG', nameAr: '7-8 كيلو', slug: '7-8-kg' },
          { nameEn: '10 KG+', nameAr: '10 كيلو+', slug: '10-kg-plus' },
        ],
      },
    ],
  },

  // Furniture
  {
    nameEn: 'Furniture',
    nameAr: 'الأثاث',
    slug: 'furniture',
    icon: '🛋️',
    children: [
      {
        nameEn: 'Living Room',
        nameAr: 'غرفة المعيشة',
        slug: 'living-room',
        children: [
          { nameEn: 'Sofas', nameAr: 'الكنب', slug: 'sofas' },
          { nameEn: 'TV Units', nameAr: 'وحدات التلفزيون', slug: 'tv-units' },
        ],
      },
      {
        nameEn: 'Bedroom',
        nameAr: 'غرفة النوم',
        slug: 'bedroom',
        children: [
          { nameEn: 'Beds', nameAr: 'الأسرة', slug: 'beds' },
          { nameEn: 'Wardrobes', nameAr: 'الخزائن', slug: 'wardrobes' },
        ],
      },
    ],
  },

  // Vehicles
  {
    nameEn: 'Vehicles',
    nameAr: 'المركبات',
    slug: 'vehicles',
    icon: '🚗',
    children: [
      {
        nameEn: 'Cars',
        nameAr: 'السيارات',
        slug: 'cars',
        children: [
          { nameEn: 'Sedans', nameAr: 'سيدان', slug: 'sedans' },
          { nameEn: 'SUVs', nameAr: 'دفع رباعي', slug: 'suvs' },
          { nameEn: 'Hatchbacks', nameAr: 'هاتشباك', slug: 'hatchbacks' },
        ],
      },
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
        message: `Categories already exist (${existingCount} found). Delete them first if you want to re-seed.`,
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
    await prisma.escrow.deleteMany({ where: { buyer: { email: { contains: '@demo.xchange.eg' } } } });
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

export default router;
