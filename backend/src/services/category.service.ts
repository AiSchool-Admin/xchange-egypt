import prisma from '../config/database';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../validations/category.validation';

// Flag to track if we've already seeded
let hasCheckedSeeding = false;

/**
 * Default categories for auto-seeding
 * Slugs must match what seed-items.ts and seed-marketplace-data.ts expect
 */
const DEFAULT_CATEGORIES = [
  {
    nameAr: 'إلكترونيات',
    nameEn: 'Electronics',
    slug: 'electronics',
    icon: '📱',
    order: 1,
    subcategories: [
      { nameAr: 'هواتف محمولة', nameEn: 'Mobile Phones', slug: 'mobile-phones', order: 1 },
      { nameAr: 'أجهزة كمبيوتر', nameEn: 'Computers', slug: 'computers', order: 2 },
      { nameAr: 'أجهزة لوحية', nameEn: 'Tablets', slug: 'tablets', order: 3 },
      { nameAr: 'كاميرات', nameEn: 'Cameras', slug: 'cameras', order: 4 },
      { nameAr: 'سماعات وصوتيات', nameEn: 'Audio & Headphones', slug: 'audio-headphones', order: 5 },
    ],
  },
  {
    nameAr: 'أثاث ومفروشات',
    nameEn: 'Furniture',
    slug: 'furniture',
    icon: '🛋️',
    order: 2,
    subcategories: [
      { nameAr: 'غرفة النوم', nameEn: 'Bedroom', slug: 'bedroom', order: 1 },
      { nameAr: 'غرفة المعيشة', nameEn: 'Living Room', slug: 'living-room', order: 2 },
      { nameAr: 'أثاث مكتبي', nameEn: 'Office Furniture', slug: 'office-furniture', order: 3 },
    ],
  },
  {
    nameAr: 'سيارات ومركبات',
    nameEn: 'Vehicles',
    slug: 'vehicles',
    icon: '🚗',
    order: 3,
    subcategories: [
      { nameAr: 'سيارات', nameEn: 'Cars', slug: 'cars', order: 1 },
      { nameAr: 'دراجات نارية', nameEn: 'Motorcycles', slug: 'motorcycles', order: 2 },
      { nameAr: 'قطع غيار', nameEn: 'Auto Parts', slug: 'auto-parts', order: 3 },
    ],
  },
  {
    nameAr: 'أجهزة منزلية',
    nameEn: 'Home Appliances',
    slug: 'home-appliances',
    icon: '🏡',
    order: 4,
    subcategories: [
      { nameAr: 'ثلاجات', nameEn: 'Refrigerators', slug: 'refrigerators', order: 1 },
      { nameAr: 'غسالات', nameEn: 'Washing Machines', slug: 'washing-machines', order: 2 },
      { nameAr: 'مكيفات', nameEn: 'Air Conditioners', slug: 'air-conditioners', order: 3 },
      { nameAr: 'أفران ومواقد', nameEn: 'Ovens & Stoves', slug: 'ovens-stoves', order: 4 },
    ],
  },
  {
    nameAr: 'ملابس وأزياء',
    nameEn: 'Fashion',
    slug: 'fashion',
    icon: '👔',
    order: 5,
    subcategories: [
      { nameAr: 'ملابس رجالية', nameEn: "Men's Clothing", slug: 'mens-clothing', order: 1 },
      { nameAr: 'ملابس نسائية', nameEn: "Women's Clothing", slug: 'womens-clothing', order: 2 },
      { nameAr: 'ملابس أطفال', nameEn: 'Kids Clothing', slug: 'kids-clothing', order: 3 },
      { nameAr: 'أحذية', nameEn: 'Shoes', slug: 'shoes', order: 4 },
    ],
  },
  {
    nameAr: 'رياضة وترفيه',
    nameEn: 'Sports & Hobbies',
    slug: 'sports-hobbies',
    icon: '⚽',
    order: 6,
    subcategories: [
      { nameAr: 'معدات رياضية', nameEn: 'Sports Equipment', slug: 'sports-equipment', order: 1 },
      { nameAr: 'دراجات', nameEn: 'Bicycles', slug: 'bicycles', order: 2 },
      { nameAr: 'ألعاب', nameEn: 'Toys & Games', slug: 'toys-games', order: 3 },
    ],
  },
  {
    nameAr: 'كتب ووسائط',
    nameEn: 'Books & Media',
    slug: 'books-media',
    icon: '📚',
    order: 7,
    subcategories: [
      { nameAr: 'كتب', nameEn: 'Books', slug: 'books', order: 1 },
      { nameAr: 'مجلات', nameEn: 'Magazines', slug: 'magazines', order: 2 },
    ],
  },
  {
    nameAr: 'خدمات',
    nameEn: 'Services',
    slug: 'services',
    icon: '🛠️',
    order: 8,
    subcategories: [
      { nameAr: 'صيانة وإصلاح', nameEn: 'Maintenance & Repair', slug: 'maintenance-repair', order: 1 },
      { nameAr: 'نقل وشحن', nameEn: 'Moving & Shipping', slug: 'moving-shipping', order: 2 },
    ],
  },
];

/**
 * Auto-seed categories if none exist
 */
async function ensureCategoriesExist() {
  if (hasCheckedSeeding) return;
  hasCheckedSeeding = true;

  try {
    const count = await prisma.category.count();
    if (count > 0) {
      console.log(`[Categories] Found ${count} existing categories`);
      return;
    }

    console.log('[Categories] No categories found, auto-seeding default categories...');

    for (const category of DEFAULT_CATEGORIES) {
      // Create parent category
      const parent = await prisma.category.create({
        data: {
          nameAr: category.nameAr,
          nameEn: category.nameEn,
          slug: category.slug,
          icon: category.icon,
          order: category.order,
          isActive: true,
        },
      });

      // Create subcategories
      if (category.subcategories) {
        for (const sub of category.subcategories) {
          await prisma.category.create({
            data: {
              nameAr: sub.nameAr,
              nameEn: sub.nameEn,
              slug: sub.slug,
              parentId: parent.id,
              order: sub.order,
              isActive: true,
            },
          });
        }
      }
    }

    const newCount = await prisma.category.count();
    console.log(`[Categories] Auto-seeded ${newCount} categories successfully`);
  } catch (error) {
    console.error('[Categories] Failed to auto-seed categories:', error);
    // Don't throw - let the request continue without categories
  }
}

/**
 * Get all categories (with hierarchy)
 */
export const getAllCategories = async (includeInactive = false) => {
  // Auto-seed categories if none exist
  await ensureCategoriesExist();

  const categories = await prisma.category.findMany({
    where: includeInactive ? {} : { isActive: true },
    include: {
      parent: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
        },
      },
      children: {
        where: includeInactive ? {} : { isActive: true },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
          icon: true,
          image: true,
          order: true,
          isActive: true,
        },
      },
    },
    orderBy: [{ order: 'asc' }, { nameAr: 'asc' }],
  });

  return categories;
};

/**
 * Get root categories only (no parent)
 * Includes nested children up to 3 levels for sub-sub-category support
 */
export const getRootCategories = async (includeInactive = false) => {
  // Auto-seed categories if none exist
  await ensureCategoriesExist();

  const categories = await prisma.category.findMany({
    where: {
      parentId: null,
      ...(includeInactive ? {} : { isActive: true }),
    },
    include: {
      children: {
        where: includeInactive ? {} : { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          // Include grandchildren (Level 3: Sub-Sub-Categories)
          children: {
            where: includeInactive ? {} : { isActive: true },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
    orderBy: [{ order: 'asc' }, { nameAr: 'asc' }],
  });

  return categories;
};

/**
 * Get category by ID
 */
export const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
        },
      },
      children: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
          icon: true,
          image: true,
          order: true,
          isActive: true,
        },
      },
    },
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  return category;
};

/**
 * Get category by slug
 */
export const getCategoryBySlug = async (slug: string) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
        },
      },
      children: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
          icon: true,
          image: true,
          order: true,
          isActive: true,
        },
      },
    },
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  return category;
};

/**
 * Create new category
 */
export const createCategory = async (data: CreateCategoryInput) => {
  // Check if slug already exists
  const existingSlug = await prisma.category.findUnique({
    where: { slug: data.slug },
  });

  if (existingSlug) {
    throw new ConflictError('Category with this slug already exists');
  }

  // If parentId is provided, verify it exists
  if (data.parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: data.parentId },
    });

    if (!parent) {
      throw new NotFoundError('Parent category not found');
    }

    // Prevent circular reference (parent cannot be its own child)
    if (data.parentId === parent.id) {
      throw new BadRequestError('Category cannot be its own parent');
    }
  }

  // Create category
  const category = await prisma.category.create({
    data: {
      nameAr: data.nameAr,
      nameEn: data.nameEn,
      slug: data.slug,
      description: data.description,
      icon: data.icon,
      image: data.image,
      parentId: data.parentId || null,
      order: data.order || 0,
      isActive: data.isActive ?? true,
    },
    include: {
      parent: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
        },
      },
    },
  });

  return category;
};

/**
 * Update category
 */
export const updateCategory = async (id: string, data: UpdateCategoryInput) => {
  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new NotFoundError('Category not found');
  }

  // Check if new slug conflicts with another category
  if (data.slug && data.slug !== existingCategory.slug) {
    const slugExists = await prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (slugExists) {
      throw new ConflictError('Category with this slug already exists');
    }
  }

  // If updating parentId, verify it exists and prevent circular reference
  if (data.parentId !== undefined) {
    if (data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw new NotFoundError('Parent category not found');
      }

      // Prevent circular reference
      if (data.parentId === id) {
        throw new BadRequestError('Category cannot be its own parent');
      }

      // Check if new parent is a descendant of this category
      const isDescendant = await checkIsDescendant(id, data.parentId);
      if (isDescendant) {
        throw new BadRequestError('Cannot set a descendant category as parent');
      }
    }
  }

  // Update category
  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(data.nameAr && { nameAr: data.nameAr }),
      ...(data.nameEn && { nameEn: data.nameEn }),
      ...(data.slug && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.icon !== undefined && { icon: data.icon }),
      ...(data.image !== undefined && { image: data.image }),
      ...(data.parentId !== undefined && { parentId: data.parentId }),
      ...(data.order !== undefined && { order: data.order }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
    include: {
      parent: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
        },
      },
      children: {
        where: { isActive: true },
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
        },
      },
    },
  });

  return category;
};

/**
 * Delete category
 */
export const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      children: true,
      items: true,
    },
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  // Check if category has children
  if (category.children.length > 0) {
    throw new BadRequestError(
      'Cannot delete category with subcategories. Delete subcategories first or reassign them.'
    );
  }

  // Check if category has items
  if (category.items.length > 0) {
    throw new BadRequestError(
      'Cannot delete category with items. Reassign or delete items first.'
    );
  }

  // Delete category
  await prisma.category.delete({
    where: { id },
  });

  return { message: 'Category deleted successfully' };
};

/**
 * Helper: Check if a category is a descendant of another
 */
const checkIsDescendant = async (ancestorId: string, descendantId: string): Promise<boolean> => {
  const descendant = await prisma.category.findUnique({
    where: { id: descendantId },
    include: { parent: true },
  });

  if (!descendant) return false;
  if (!descendant.parent) return false;
  if (descendant.parentId === ancestorId) return true;

  // Recursively check parent
  return checkIsDescendant(ancestorId, descendant.parentId);
};

/**
 * Get category tree (hierarchical structure)
 */
export const getCategoryTree = async (includeInactive = false) => {
  // Auto-seed categories if none exist
  await ensureCategoriesExist();

  // Get all categories
  const allCategories = await prisma.category.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: [{ order: 'asc' }, { nameAr: 'asc' }],
    select: {
      id: true,
      nameAr: true,
      nameEn: true,
      slug: true,
      icon: true,
      image: true,
      parentId: true,
      order: true,
      isActive: true,
    },
  });

  // Build tree structure
  const buildTree = (
    parentId: string | null = null
  ): Array<{
    id: string;
    nameAr: string;
    nameEn: string;
    slug: string;
    icon: string | null;
    image: string | null;
    order: number;
    isActive: boolean;
    children: any[];
  }> => {
    return allCategories
      .filter((cat) => cat.parentId === parentId)
      .map((cat) => ({
        ...cat,
        children: buildTree(cat.id),
      }));
  };

  return buildTree();
};
