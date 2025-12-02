import { ItemCondition } from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { processItemImage } from '../utils/image';
import { itemEvents } from '../events/item.events';
import path from 'path';
import fs from 'fs/promises';
import prisma from '../lib/prisma';

// Types
interface CreateItemData {
  title: string;
  description: string;
  categoryId: string;
  condition: ItemCondition;
  estimatedValue: number;
  location?: string;
  governorate?: string;
  // Barter preferences
  desiredCategoryId?: string;
  desiredKeywords?: string;
  desiredValueMin?: number;
  desiredValueMax?: number;
}

interface UpdateItemData {
  title?: string;
  description?: string;
  categoryId?: string;
  condition?: ItemCondition;
  estimatedValue?: number;
  location?: string;
  governorate?: string;
}

interface SearchItemsParams {
  search?: string;
  categoryId?: string;
  sellerId?: string;
  condition?: ItemCondition;
  governorate?: string;
  city?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Create a new item with images
 */
export const createItem = async (
  userId: string,
  itemData: CreateItemData,
  imageFiles?: Express.Multer.File[]
): Promise<any> => {
  // Verify category exists and is active
  const category = await prisma.category.findUnique({
    where: { id: itemData.categoryId },
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  if (!category.isActive) {
    throw new BadRequestError('Cannot create item in inactive category');
  }

  // Process images if provided
  let processedImages: string[] = [];
  if (imageFiles && imageFiles.length > 0) {
    for (const file of imageFiles) {
      try {
        const processedPath = await processItemImage(file.path);
        // Store relative path from public directory
        const relativePath = processedPath.replace(/^.*\/public/, '');
        processedImages.push(relativePath);
      } catch (error) {
        // Clean up already processed images on error
        await cleanupImages(processedImages);
        throw new BadRequestError('Failed to process images');
      }
    }
  }

  // Create the item
  const item = await prisma.item.create({
    data: {
      sellerId: userId,
      categoryId: itemData.categoryId,
      title: itemData.title,
      description: itemData.description,
      condition: itemData.condition,
      estimatedValue: itemData.estimatedValue,
      location: itemData.location,
      images: processedImages,
      // Barter preferences
      desiredCategoryId: itemData.desiredCategoryId,
      desiredKeywords: itemData.desiredKeywords,
      desiredValueMin: itemData.desiredValueMin,
      desiredValueMax: itemData.desiredValueMax,
    },
    include: {
      seller: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      category: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
        },
      },
    },
  });

  // Emit item created event for real-time matching
  const hasBarterPreferences = !!(
    itemData.desiredCategoryId ||
    itemData.desiredKeywords ||
    itemData.desiredValueMin ||
    itemData.desiredValueMax
  );

  itemEvents.emitItemCreated({
    itemId: item.id,
    userId: item.sellerId,
    categoryId: item.categoryId,
    hasBarterPreferences,
    timestamp: new Date(),
  });

  return item;
};

/**
 * Get item by ID
 */
export const getItemById = async (itemId: string): Promise<any> => {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      seller: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          businessName: true,
        },
      },
      category: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
          parent: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!item) {
    throw new NotFoundError('Item not found');
  }

  return item;
};

/**
 * Update an item
 */
export const updateItem = async (
  itemId: string,
  userId: string,
  updateData: UpdateItemData
): Promise<any> => {
  // Check if item exists and user owns it
  const existingItem = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!existingItem) {
    throw new NotFoundError('Item not found');
  }

  if (existingItem.sellerId !== userId) {
    throw new ForbiddenError('You can only update your own items');
  }

  // If category is being updated, verify it exists and is active
  if (updateData.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: updateData.categoryId },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    if (!category.isActive) {
      throw new BadRequestError('Cannot move item to inactive category');
    }
  }

  // Update the item
  const updatedItem = await prisma.item.update({
    where: { id: itemId },
    data: updateData,
    include: {
      seller: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      category: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
        },
      },
    },
  });

  // Emit item updated event for real-time matching
  itemEvents.emitItemUpdated({
    itemId: updatedItem.id,
    userId: updatedItem.sellerId,
    categoryId: updatedItem.categoryId,
    changes: {
      category: updateData.categoryId !== undefined,
      barterPreferences: false, // Item preferences update not supported yet
      description: updateData.description !== undefined,
    },
    timestamp: new Date(),
  });

  return updatedItem;
};

/**
 * Delete an item
 */
export const deleteItem = async (
  itemId: string,
  userId: string
): Promise<void> => {
  // Check if item exists and user owns it
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      listings: true,
    },
  });

  if (!item) {
    throw new NotFoundError('Item not found');
  }

  if (item.sellerId !== userId) {
    throw new ForbiddenError('You can only delete your own items');
  }

  // Check if item has active listings
  const hasActiveListings = item.listings.some(
    (listing) => listing.status === 'ACTIVE'
  );

  if (hasActiveListings) {
    throw new BadRequestError(
      'Cannot delete item with active listings. Close or complete the listings first.'
    );
  }

  // Clean up images
  await cleanupImages(item.images);

  // Delete the item (cascade will handle related records)
  await prisma.item.delete({
    where: { id: itemId },
  });

  // Emit item deleted event
  itemEvents.emitItemDeleted({
    itemId: item.id,
    userId: item.sellerId,
    timestamp: new Date(),
  });
};

/**
 * Search items with filters and pagination
 */
export const searchItems = async (
  params: SearchItemsParams
): Promise<PaginatedResult<any>> => {
  const {
    search,
    categoryId,
    sellerId,
    condition,
    governorate,
    city,
    district,
    minPrice,
    maxPrice,
    status,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  // Build where clause
  const where: any = {};
  const andConditions: any[] = [];

  if (search) {
    andConditions.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (sellerId) {
    where.sellerId = sellerId;
  }

  if (condition) {
    where.condition = condition;
  }

  // Location filtering - hierarchical (governorate > city > district)
  // Use flexible matching to support both Arabic and English names
  if (governorate) {
    andConditions.push({
      OR: [
        { governorate: { contains: governorate, mode: 'insensitive' } },
        { location: { contains: governorate, mode: 'insensitive' } },
      ],
    });
  }

  // City and district filtering via location field (contains search)
  if (city) {
    where.location = { contains: city, mode: 'insensitive' };
  }

  if (district) {
    where.location = { contains: district, mode: 'insensitive' };
  }

  // Combine AND conditions
  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  // Price range filtering (using estimatedValue field)
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.estimatedValue = {};
    if (minPrice !== undefined) {
      where.estimatedValue.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      where.estimatedValue.lte = maxPrice;
    }
  }

  // Status filtering
  if (status) {
    where.status = status;
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get total count
  const total = await prisma.item.count({ where });

  // Get items
  const items = await prisma.item.findMany({
    where,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: {
      seller: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      category: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
        },
      },
    },
  });

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
};

/**
 * Get items by user
 */
export const getUserItems = async (
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResult<any>> => {
  const skip = (page - 1) * limit;

  const total = await prisma.item.count({
    where: { sellerId: userId },
  });

  const items = await prisma.item.findMany({
    where: { sellerId: userId },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      category: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
        },
      },
    },
  });

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
};

/**
 * Get items by category (with optional subcategories)
 */
export const getCategoryItems = async (
  categoryId: string,
  includeSubcategories: boolean = false,
  params: {
    condition?: ItemCondition;
    governorate?: string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'updatedAt' | 'title';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<PaginatedResult<any>> => {
  const {
    condition,
    governorate,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  // Verify category exists
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: includeSubcategories
      ? {
          children: {
            select: { id: true },
          },
        }
      : undefined,
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  // Build category filter
  let categoryFilter: any = { categoryId };

  if (includeSubcategories && category.children && category.children.length > 0) {
    const categoryIds = [
      categoryId,
      ...category.children.map((child) => child.id),
    ];
    categoryFilter = { categoryId: { in: categoryIds } };
  }

  // Build where clause
  const where: any = {
    ...categoryFilter,
  };

  if (condition) {
    where.condition = condition;
  }

  // Location filtering - flexible matching for governorate
  if (governorate) {
    where.AND = [
      {
        OR: [
          { governorate: { contains: governorate, mode: 'insensitive' } },
          { location: { contains: governorate, mode: 'insensitive' } },
        ],
      },
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get total count
  const total = await prisma.item.count({ where });

  // Get items
  const items = await prisma.item.findMany({
    where,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: {
      seller: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      category: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
        },
      },
    },
  });

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
};

/**
 * Add images to an existing item
 */
export const addItemImages = async (
  itemId: string,
  userId: string,
  imageFiles: Express.Multer.File[]
): Promise<any> => {
  // Check if item exists and user owns it
  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw new NotFoundError('Item not found');
  }

  if (item.sellerId !== userId) {
    throw new ForbiddenError('You can only modify your own items');
  }

  // Check total image count (max 10 images per item)
  const currentImageCount = item.images.length;
  const newImageCount = imageFiles.length;

  if (currentImageCount + newImageCount > 10) {
    throw new BadRequestError(
      `Cannot add ${newImageCount} images. Maximum 10 images per item. Current: ${currentImageCount}`
    );
  }

  // Process new images
  const processedImages: string[] = [];
  for (const file of imageFiles) {
    try {
      const processedPath = await processItemImage(file.path);
      const relativePath = processedPath.replace(/^.*\/public/, '');
      processedImages.push(relativePath);
    } catch (error) {
      // Clean up already processed images on error
      await cleanupImages(processedImages);
      throw new BadRequestError('Failed to process images');
    }
  }

  // Update item with new images
  const updatedItem = await prisma.item.update({
    where: { id: itemId },
    data: {
      images: [...item.images, ...processedImages],
    },
    include: {
      seller: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      category: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
        },
      },
    },
  });

  return updatedItem;
};

/**
 * Remove images from an item
 */
export const removeItemImages = async (
  itemId: string,
  userId: string,
  imagesToRemove: string[]
): Promise<any> => {
  // Check if item exists and user owns it
  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw new NotFoundError('Item not found');
  }

  if (item.sellerId !== userId) {
    throw new ForbiddenError('You can only modify your own items');
  }

  // Verify all images to remove exist in the item
  const invalidImages = imagesToRemove.filter(
    (img) => !item.images.includes(img)
  );

  if (invalidImages.length > 0) {
    throw new BadRequestError('Some images do not belong to this item');
  }

  // Check that at least one image remains (optional - remove if items can have 0 images)
  const remainingImages = item.images.filter(
    (img) => !imagesToRemove.includes(img)
  );

  // Update item with remaining images
  const updatedItem = await prisma.item.update({
    where: { id: itemId },
    data: {
      images: remainingImages,
    },
    include: {
      seller: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      category: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
        },
      },
    },
  });

  // Clean up the removed images from filesystem
  await cleanupImages(imagesToRemove);

  return updatedItem;
};

/**
 * Helper function to clean up image files
 */
const cleanupImages = async (imagePaths: string[]): Promise<void> => {
  for (const imagePath of imagePaths) {
    try {
      const fullPath = path.join(
        process.cwd(),
        'public',
        imagePath.replace(/^\//, '')
      );
      await fs.unlink(fullPath);
    } catch (error) {
      // Ignore errors (file might not exist)
      console.error(`Failed to delete image: ${imagePath}`, error);
    }
  }
};
