import { ItemCondition, PromotionTier } from '../types/prisma-enums';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { processItemImage } from '../utils/image';
import { itemEvents } from '../events/item.events';
import path from 'path';
import fs from 'fs/promises';
import prisma from '../lib/prisma';

// Type for Item with basic seller relation
interface ItemWithSeller {
  id: string;
  title: string;
  description: string | null;
  categoryId: string;
  sellerId: string;
  condition: ItemCondition;
  estimatedValue: number;
  images: string[];
  status: string;
  location: string | null;
  governorate: string | null;
  createdAt: Date;
  updatedAt: Date;
  seller: {
    id: string;
    fullName: string;
    avatar: string | null;
    businessName?: string | null;
  };
  category: {
    id: string;
    nameAr: string;
    nameEn: string;
    slug: string;
    parent?: {
      id: string;
      nameAr: string;
      nameEn: string;
      slug: string;
    } | null;
  };
  desiredCategory?: {
    id: string;
    nameAr: string;
    nameEn: string;
  } | null;
  [key: string]: unknown; // Allow additional properties from Prisma
}

// Mapping of English governorate names to Arabic
const GOVERNORATE_EN_TO_AR: Record<string, string> = {
  'Cairo': 'القاهرة',
  'cairo': 'القاهرة',
  'Giza': 'الجيزة',
  'giza': 'الجيزة',
  'Alexandria': 'الإسكندرية',
  'alexandria': 'الإسكندرية',
  'Dakahlia': 'الدقهلية',
  'Sharqia': 'الشرقية',
  'Qalyubia': 'القليوبية',
  'Gharbia': 'الغربية',
  'Menoufia': 'المنوفية',
  'Beheira': 'البحيرة',
  'Kafr El Sheikh': 'كفر الشيخ',
  'Damietta': 'دمياط',
  'Port Said': 'بورسعيد',
  'Ismailia': 'الإسماعيلية',
  'Suez': 'السويس',
  'North Sinai': 'شمال سيناء',
  'South Sinai': 'جنوب سيناء',
  'Red Sea': 'البحر الأحمر',
  'Matrouh': 'مطروح',
  'New Valley': 'الوادي الجديد',
  'Fayoum': 'الفيوم',
  'Beni Suef': 'بني سويف',
  'Minya': 'المنيا',
  'Assiut': 'أسيوط',
  'Sohag': 'سوهاج',
  'Qena': 'قنا',
  'Luxor': 'الأقصر',
  'Aswan': 'أسوان',
};

// Convert governorate to Arabic if it's in English
const toArabicGovernorate = (governorate: string | undefined): string | undefined => {
  if (!governorate) return undefined;
  return GOVERNORATE_EN_TO_AR[governorate] || governorate;
};

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
  desiredItemTitle?: string;
  desiredItemDescription?: string;
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
  images?: string[];
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
  // Listing type filter
  listingType?: string;
  // Scrap filter
  isScrap?: boolean;
  // Featured/promotion filters
  isFeatured?: boolean;
  promotionTier?: PromotionTier;

  // Real Estate filters
  propertyType?: string;
  propertyFinishing?: string;
  propertyView?: string;
  minArea?: number;
  maxArea?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minFloor?: number;
  maxFloor?: number;
  hasElevator?: boolean;
  hasParking?: boolean;
  hasGarden?: boolean;
  hasSecurity?: boolean;
  hasPool?: boolean;

  // Vehicle filters
  vehicleBrand?: string;
  vehicleModel?: string;
  minYear?: number;
  maxYear?: number;
  minKilometers?: number;
  maxKilometers?: number;
  fuelType?: string;
  transmissionType?: string;
  bodyType?: string;
  vehicleColor?: string;
  hasWarranty?: boolean;

  // Delivery & Installment filters
  deliveryAvailable?: boolean;
  installmentAvailable?: boolean;

  // Seller verification filter
  verifiedSeller?: boolean;

  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'estimatedValue' | 'areaInSqm' | 'vehicleYear' | 'vehicleKilometers';
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
): Promise<ItemWithSeller> => {
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
  const processedImages: string[] = [];
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

  // Get user's governorate as fallback and convert to Arabic
  let governorate = itemData.governorate;
  if (!governorate) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { governorate: true },
    });
    governorate = user?.governorate || undefined;
  }
  // Convert to Arabic if in English
  const arabicGovernorate = toArabicGovernorate(governorate);

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
      governorate: arabicGovernorate,
      images: processedImages,
      // Barter preferences
      desiredItemTitle: itemData.desiredItemTitle,
      desiredItemDescription: itemData.desiredItemDescription,
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
    itemData.desiredItemTitle ||
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
export const getItemById = async (itemId: string): Promise<ItemWithSeller> => {
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
      // Include desired category for barter items
      desiredCategory: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
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
): Promise<ItemWithSeller> => {
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
 * When a category is selected, includes all items from that category AND its subcategories
 */
export const searchItems = async (
  params: SearchItemsParams
): Promise<PaginatedResult<ItemWithSeller>> => {
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
    listingType,
    isScrap,
    isFeatured,
    promotionTier,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  // Build where clause
  const where: Record<string, unknown> = {};
  const andConditions: Record<string, unknown>[] = [];

  if (search) {
    andConditions.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  // Category filter - include all subcategories (up to 3 levels deep)
  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        children: {
          select: {
            id: true,
            children: { select: { id: true } } // Level 3
          }
        }
      }
    });

    if (category) {
      // Collect all category IDs (parent + children + grandchildren)
      const categoryIds: string[] = [category.id];
      category.children.forEach(child => {
        categoryIds.push(child.id);
        child.children.forEach(grandchild => {
          categoryIds.push(grandchild.id);
        });
      });

      // Use IN query to include all subcategories
      where.categoryId = { in: categoryIds };
    } else {
      // Category not found, use exact match (will return empty)
      where.categoryId = categoryId;
    }
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

  // City filtering - search in city field
  if (city) {
    andConditions.push({
      OR: [
        { city: { contains: city, mode: 'insensitive' } },
        { location: { contains: city, mode: 'insensitive' } },
      ],
    });
  }

  // District filtering - search in district field
  if (district) {
    andConditions.push({
      OR: [
        { district: { contains: district, mode: 'insensitive' } },
        { location: { contains: district, mode: 'insensitive' } },
      ],
    });
  }

  // Combine AND conditions
  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  // Price range filtering (using estimatedValue field)
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter: { gte?: number; lte?: number } = {};
    if (minPrice !== undefined) {
      priceFilter.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      priceFilter.lte = maxPrice;
    }
    where.estimatedValue = priceFilter;
  }

  // Status filtering
  if (status) {
    where.status = status;
  }

  // Listing type filtering - filter items with active listings of the specified type
  if (listingType) {
    // Filter items that have at least one active listing of this type
    where.listings = {
      some: {
        listingType: listingType,
        status: 'ACTIVE',
      },
    };
  }

  // Scrap items filtering
  if (isScrap !== undefined) {
    where.isScrap = isScrap;
  }

  // Featured filtering
  if (isFeatured !== undefined) {
    where.isFeatured = isFeatured;
    // Also check that promotion hasn't expired
    if (isFeatured) {
      andConditions.push({
        OR: [
          { promotionExpiresAt: null },
          { promotionExpiresAt: { gte: new Date() } },
        ],
      });
    }
  }

  // Promotion tier filtering
  if (promotionTier) {
    where.promotionTier = promotionTier;
  }

  // ============================================
  // Real Estate Filters
  // ============================================
  if (params.propertyType) {
    where.propertyType = params.propertyType;
  }

  if (params.propertyFinishing) {
    where.propertyFinishing = params.propertyFinishing;
  }

  if (params.propertyView) {
    where.propertyView = params.propertyView;
  }

  // Area range
  if (params.minArea !== undefined || params.maxArea !== undefined) {
    const areaFilter: { gte?: number; lte?: number } = {};
    if (params.minArea !== undefined) {
      areaFilter.gte = params.minArea;
    }
    if (params.maxArea !== undefined) {
      areaFilter.lte = params.maxArea;
    }
    where.areaInSqm = areaFilter;
  }

  // Bedrooms range
  if (params.minBedrooms !== undefined || params.maxBedrooms !== undefined) {
    const bedroomsFilter: { gte?: number; lte?: number } = {};
    if (params.minBedrooms !== undefined) {
      bedroomsFilter.gte = params.minBedrooms;
    }
    if (params.maxBedrooms !== undefined) {
      bedroomsFilter.lte = params.maxBedrooms;
    }
    where.bedrooms = bedroomsFilter;
  }

  // Bathrooms range
  if (params.minBathrooms !== undefined || params.maxBathrooms !== undefined) {
    const bathroomsFilter: { gte?: number; lte?: number } = {};
    if (params.minBathrooms !== undefined) {
      bathroomsFilter.gte = params.minBathrooms;
    }
    if (params.maxBathrooms !== undefined) {
      bathroomsFilter.lte = params.maxBathrooms;
    }
    where.bathrooms = bathroomsFilter;
  }

  // Floor range
  if (params.minFloor !== undefined || params.maxFloor !== undefined) {
    const floorFilter: { gte?: number; lte?: number } = {};
    if (params.minFloor !== undefined) {
      floorFilter.gte = params.minFloor;
    }
    if (params.maxFloor !== undefined) {
      floorFilter.lte = params.maxFloor;
    }
    where.floorNumber = floorFilter;
  }

  // Property amenities
  if (params.hasElevator !== undefined) {
    where.hasElevator = params.hasElevator;
  }
  if (params.hasParking !== undefined) {
    where.hasParking = params.hasParking;
  }
  if (params.hasGarden !== undefined) {
    where.hasGarden = params.hasGarden;
  }
  if (params.hasSecurity !== undefined) {
    where.hasSecurity = params.hasSecurity;
  }
  if (params.hasPool !== undefined) {
    where.hasPool = params.hasPool;
  }

  // ============================================
  // Vehicle Filters
  // ============================================
  if (params.vehicleBrand) {
    where.vehicleBrand = { contains: params.vehicleBrand, mode: 'insensitive' };
  }

  if (params.vehicleModel) {
    where.vehicleModel = { contains: params.vehicleModel, mode: 'insensitive' };
  }

  // Year range
  if (params.minYear !== undefined || params.maxYear !== undefined) {
    const yearFilter: { gte?: number; lte?: number } = {};
    if (params.minYear !== undefined) {
      yearFilter.gte = params.minYear;
    }
    if (params.maxYear !== undefined) {
      yearFilter.lte = params.maxYear;
    }
    where.vehicleYear = yearFilter;
  }

  // Kilometers range
  if (params.minKilometers !== undefined || params.maxKilometers !== undefined) {
    const kilometersFilter: { gte?: number; lte?: number } = {};
    if (params.minKilometers !== undefined) {
      kilometersFilter.gte = params.minKilometers;
    }
    if (params.maxKilometers !== undefined) {
      kilometersFilter.lte = params.maxKilometers;
    }
    where.vehicleKilometers = kilometersFilter;
  }

  if (params.fuelType) {
    where.fuelType = params.fuelType;
  }

  if (params.transmissionType) {
    where.transmissionType = params.transmissionType;
  }

  if (params.bodyType) {
    where.bodyType = params.bodyType;
  }

  if (params.vehicleColor) {
    where.vehicleColor = { contains: params.vehicleColor, mode: 'insensitive' };
  }

  if (params.hasWarranty !== undefined) {
    where.hasWarranty = params.hasWarranty;
  }

  // ============================================
  // Delivery & Installment Filters
  // ============================================
  if (params.deliveryAvailable !== undefined) {
    where.deliveryAvailable = params.deliveryAvailable;
  }

  if (params.installmentAvailable !== undefined) {
    where.installmentAvailable = params.installmentAvailable;
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get total count
  const total = await prisma.item.count({ where: where as any });

  // Get items
  const items = await prisma.item.findMany({
    where: where as any,
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
    items: items as unknown as ItemWithSeller[],
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
): Promise<PaginatedResult<ItemWithSeller>> => {
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
): Promise<PaginatedResult<ItemWithSeller>> => {
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
  let categoryFilter: Record<string, unknown> = { categoryId };

  if (includeSubcategories && category.children && category.children.length > 0) {
    const categoryIds = [
      categoryId,
      ...category.children.map((child: { id: string }) => child.id),
    ];
    categoryFilter = { categoryId: { in: categoryIds } };
  }

  // Build where clause
  const where: Record<string, unknown> = {
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
  const total = await prisma.item.count({ where: where as any });

  // Get items
  const items = await prisma.item.findMany({
    where: where as any,
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
    items: items as unknown as ItemWithSeller[],
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
): Promise<ItemWithSeller> => {
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
): Promise<ItemWithSeller> => {
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

/**
 * Get featured items with optional filters
 * Supports filtering by category slug or ID, including child categories
 */
export const getFeaturedItems = async (params: {
  limit?: number;
  categoryId?: string; // Can be a slug (e.g., 'luxury-watches') or UUID
  governorate?: string;
  minTier?: PromotionTier;
}): Promise<ItemWithSeller[]> => {
  const { limit = 10, categoryId, governorate, minTier } = params;

  const where: Record<string, unknown> = {
    isFeatured: true,
    status: 'ACTIVE',
    OR: [
      { promotionExpiresAt: null },
      { promotionExpiresAt: { gte: new Date() } },
    ],
  };

  // Handle category filter - support both slug and UUID
  if (categoryId) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
    let categoryIds: string[] = [];

    if (isUUID) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { children: { select: { id: true } } }
      });
      if (category) {
        categoryIds = [category.id, ...category.children.map(c => c.id)];
      }
    } else {
      const category = await prisma.category.findUnique({
        where: { slug: categoryId },
        include: {
          children: {
            select: { id: true, children: { select: { id: true } } }
          }
        }
      });
      if (category) {
        categoryIds = [category.id];
        category.children.forEach(child => {
          categoryIds.push(child.id);
          child.children.forEach(grandchild => categoryIds.push(grandchild.id));
        });
      }
    }

    if (categoryIds.length > 0) {
      where.categoryId = { in: categoryIds };
    }
  }

  if (governorate) {
    where.governorate = { contains: governorate, mode: 'insensitive' };
  }

  // Filter by minimum tier (PLATINUM > GOLD > PREMIUM > FEATURED > BASIC)
  if (minTier) {
    const tierOrder: PromotionTier[] = ['BASIC', 'FEATURED', 'PREMIUM', 'GOLD', 'PLATINUM'];
    const minTierIndex = tierOrder.indexOf(minTier);
    const validTiers = tierOrder.slice(minTierIndex);
    where.promotionTier = { in: validTiers };
  }

  const items = await prisma.item.findMany({
    where: where as any,
    take: limit,
    orderBy: [
      // Order by tier first (higher tiers first)
      { promotionTier: 'desc' },
      // Then by estimated value
      { estimatedValue: 'desc' },
      // Then by promotion date
      { promotedAt: 'desc' },
    ],
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
        },
      },
    },
  });

  return items as unknown as ItemWithSeller[];
};

/**
 * Get luxury items (high-value items)
 * Supports filtering by category slug or ID, including child categories
 */
export const getLuxuryItems = async (params: {
  limit?: number;
  minPrice?: number;
  categoryId?: string; // Can be a slug (e.g., 'luxury-watches') or UUID
  governorate?: string;
  sortBy?: 'price_high' | 'price_low' | 'recent';
}): Promise<ItemWithSeller[]> => {
  const {
    limit = 20,
    minPrice = 50000, // Default luxury threshold
    categoryId,
    governorate,
    sortBy = 'price_high'
  } = params;

  const where: Record<string, unknown> = {
    status: 'ACTIVE',
    estimatedValue: { gte: minPrice },
  };

  // Handle category filter - support both slug and UUID
  if (categoryId) {
    // Check if it's a UUID (36 chars with dashes) or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);

    let categoryIds: string[] = [];

    if (isUUID) {
      // It's a UUID - get this category and its children
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { children: { select: { id: true } } }
      });
      if (category) {
        categoryIds = [category.id, ...category.children.map(c => c.id)];
      }
    } else {
      // It's a slug - find category by slug and include children
      const category = await prisma.category.findUnique({
        where: { slug: categoryId },
        include: {
          children: {
            select: {
              id: true,
              children: { select: { id: true } } // Level 3
            }
          }
        }
      });
      if (category) {
        categoryIds = [category.id];
        // Add level 2 children
        category.children.forEach(child => {
          categoryIds.push(child.id);
          // Add level 3 children
          child.children.forEach(grandchild => {
            categoryIds.push(grandchild.id);
          });
        });
      }
    }

    if (categoryIds.length > 0) {
      where.categoryId = { in: categoryIds };
    }
  }

  if (governorate) {
    where.governorate = { contains: governorate, mode: 'insensitive' };
  }

  // Determine sort order
  let orderBy: Record<string, 'asc' | 'desc'>;
  switch (sortBy) {
    case 'price_low':
      orderBy = { estimatedValue: 'asc' };
      break;
    case 'recent':
      orderBy = { createdAt: 'desc' };
      break;
    case 'price_high':
    default:
      orderBy = { estimatedValue: 'desc' };
  }

  const items = await prisma.item.findMany({
    where: where as any,
    take: limit,
    orderBy,
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
        },
      },
    },
  });

  return items as unknown as ItemWithSeller[];
};

/**
 * Promote an item to featured status
 */
export const promoteItem = async (
  itemId: string,
  userId: string,
  promotionData: {
    tier: PromotionTier;
    durationDays?: number;
  }
): Promise<ItemWithSeller> => {
  // Check if item exists and user owns it
  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw new NotFoundError('Item not found');
  }

  if (item.sellerId !== userId) {
    throw new ForbiddenError('You can only promote your own items');
  }

  if (item.status !== 'ACTIVE') {
    throw new BadRequestError('Only active items can be promoted');
  }

  // Calculate expiration date
  const promotedAt = new Date();
  let promotionExpiresAt: Date | null = null;

  if (promotionData.durationDays) {
    promotionExpiresAt = new Date(promotedAt);
    promotionExpiresAt.setDate(promotionExpiresAt.getDate() + promotionData.durationDays);
  }

  // Update the item
  const updatedItem = await prisma.item.update({
    where: { id: itemId },
    data: {
      isFeatured: true,
      promotionTier: promotionData.tier,
      promotedAt,
      promotionExpiresAt,
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
 * Remove promotion from an item
 */
export const removePromotion = async (
  itemId: string,
  userId: string
): Promise<ItemWithSeller> => {
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

  // Update the item
  const updatedItem = await prisma.item.update({
    where: { id: itemId },
    data: {
      isFeatured: false,
      promotionTier: 'BASIC',
      promotedAt: null,
      promotionExpiresAt: null,
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
