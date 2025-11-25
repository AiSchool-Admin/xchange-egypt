import prisma from '../config/database';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../validations/category.validation';

/**
 * Get all categories (with hierarchy)
 */
export const getAllCategories = async (includeInactive = false) => {
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
