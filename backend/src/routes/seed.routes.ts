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

export default router;
