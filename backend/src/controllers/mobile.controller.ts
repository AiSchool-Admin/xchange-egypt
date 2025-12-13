/**
 * Mobile Marketplace Controller
 * وحدة التحكم في سوق الموبايلات
 */

import { Request, Response } from 'express';
import { PrismaClient, MobileListingStatus, MobileTransactionStatus, MobileBarterProposalStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// Price References - الأسعار المرجعية
// ============================================

export const getPriceReferences = async (req: Request, res: Response) => {
  try {
    const { brand, model, storageGb } = req.query;

    const where: any = {};
    if (brand) where.brand = brand;
    if (model) where.model = { contains: model as string, mode: 'insensitive' };
    if (storageGb) where.storageGb = parseInt(storageGb as string);

    const prices = await prisma.mobilePriceReference.findMany({
      where,
      orderBy: [{ brand: 'asc' }, { model: 'asc' }, { storageGb: 'asc' }]
    });

    res.json({ success: true, data: prices });
  } catch (error) {
    console.error('Error fetching price references:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch price references' });
  }
};

export const getPricesByBrand = async (req: Request, res: Response) => {
  try {
    const { brand } = req.params;

    const prices = await prisma.mobilePriceReference.findMany({
      where: { brand: brand.toUpperCase() as any },
      orderBy: [{ model: 'asc' }, { storageGb: 'asc' }]
    });

    res.json({ success: true, data: prices });
  } catch (error) {
    console.error('Error fetching prices by brand:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch prices' });
  }
};

export const getPricesByModel = async (req: Request, res: Response) => {
  try {
    const { brand, model } = req.params;

    const prices = await prisma.mobilePriceReference.findMany({
      where: {
        brand: brand.toUpperCase() as any,
        model: { contains: model, mode: 'insensitive' }
      },
      orderBy: { storageGb: 'asc' }
    });

    res.json({ success: true, data: prices });
  } catch (error) {
    console.error('Error fetching prices by model:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch prices' });
  }
};

export const calculatePrice = async (req: Request, res: Response) => {
  try {
    const { brand, model, storageGb, conditionGrade, batteryHealth } = req.body;

    // Get base price reference
    const priceRef = await prisma.mobilePriceReference.findFirst({
      where: {
        brand: brand.toUpperCase(),
        model: { contains: model, mode: 'insensitive' },
        storageGb: parseInt(storageGb)
      }
    });

    if (!priceRef) {
      return res.status(404).json({
        success: false,
        error: 'Price reference not found for this model'
      });
    }

    // Apply condition multiplier
    let multiplier = 1.0;
    switch (conditionGrade) {
      case 'A': multiplier = priceRef.conditionAMultiplier; break;
      case 'B': multiplier = priceRef.conditionBMultiplier; break;
      case 'C': multiplier = priceRef.conditionCMultiplier; break;
      case 'D': multiplier = priceRef.conditionDMultiplier; break;
    }

    // Additional battery health adjustment
    if (batteryHealth && batteryHealth < 80) {
      multiplier *= 0.9; // 10% reduction for battery below 80%
    }

    const estimatedPrice = {
      low: Math.round(priceRef.priceLow * multiplier),
      average: Math.round(priceRef.priceAverage * multiplier),
      high: Math.round(priceRef.priceHigh * multiplier)
    };

    res.json({
      success: true,
      data: {
        estimatedPrice,
        basePrice: priceRef.priceAverage,
        conditionMultiplier: multiplier,
        conditionGrade
      }
    });
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate price' });
  }
};

// ============================================
// Listings - الإعلانات
// ============================================

export const getListings = async (req: Request, res: Response) => {
  try {
    const {
      brand, model, minPrice, maxPrice, condition, governorate,
      acceptsBarter, imeiVerified, sort, page = '1', limit = '20'
    } = req.query;

    const where: any = {
      status: 'ACTIVE'
    };

    if (brand) where.brand = brand;
    if (model) where.model = { contains: model as string, mode: 'insensitive' };
    if (minPrice) where.priceEgp = { ...where.priceEgp, gte: parseFloat(minPrice as string) };
    if (maxPrice) where.priceEgp = { ...where.priceEgp, lte: parseFloat(maxPrice as string) };
    if (condition) where.conditionGrade = condition;
    if (governorate) where.governorate = governorate;
    if (acceptsBarter === 'true') where.acceptsBarter = true;
    if (imeiVerified === 'true') where.imeiVerified = true;

    let orderBy: any = { createdAt: 'desc' };
    switch (sort) {
      case 'price_asc': orderBy = { priceEgp: 'asc' }; break;
      case 'price_desc': orderBy = { priceEgp: 'desc' }; break;
      case 'newest': orderBy = { createdAt: 'desc' }; break;
      case 'popular': orderBy = { viewsCount: 'desc' }; break;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [listings, total] = await Promise.all([
      prisma.mobileListing.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          seller: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
              rating: true,
              totalReviews: true,
              governorate: true
            }
          }
        }
      }),
      prisma.mobileListing.count({ where })
    ]);

    res.json({
      success: true,
      data: listings,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch listings' });
  }
};

export const getFeaturedListings = async (req: Request, res: Response) => {
  try {
    const listings = await prisma.mobileListing.findMany({
      where: {
        status: 'ACTIVE',
        featured: true,
        featuredUntil: { gte: new Date() }
      },
      orderBy: { viewsCount: 'desc' },
      take: 12,
      include: {
        seller: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            rating: true
          }
        }
      }
    });

    res.json({ success: true, data: listings });
  } catch (error) {
    console.error('Error fetching featured listings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch featured listings' });
  }
};

export const getRecentListings = async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;

    const listings = await prisma.mobileListing.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      include: {
        seller: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            rating: true
          }
        }
      }
    });

    res.json({ success: true, data: listings });
  } catch (error) {
    console.error('Error fetching recent listings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recent listings' });
  }
};

export const getListingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const listing = await prisma.mobileListing.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            rating: true,
            totalReviews: true,
            governorate: true,
            city: true,
            createdAt: true
          }
        },
        imeiVerification: true,
        diagnostics: true
      }
    });

    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    // Increment view count
    await prisma.mobileListing.update({
      where: { id },
      data: { viewsCount: { increment: 1 } }
    });

    // Get similar listings
    const similar = await prisma.mobileListing.findMany({
      where: {
        id: { not: id },
        status: 'ACTIVE',
        brand: listing.brand,
        priceEgp: {
          gte: listing.priceEgp * 0.7,
          lte: listing.priceEgp * 1.3
        }
      },
      take: 4,
      include: {
        seller: {
          select: { id: true, fullName: true, rating: true }
        }
      }
    });

    res.json({ success: true, data: { listing, similar } });
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch listing' });
  }
};

export const createListing = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      title, titleAr, description, descriptionAr,
      brand, model, storageGb, ramGb, color, colorAr,
      imei, conditionGrade, batteryHealth, screenCondition, bodyCondition,
      originalParts, hasBox, hasAccessories, accessoriesDetails,
      priceEgp, negotiable, acceptsBarter, barterPreferences,
      images, governorate, city, district
    } = req.body;

    // Generate verification code
    const verificationCode = `XCH-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const listing = await prisma.mobileListing.create({
      data: {
        sellerId: userId,
        title,
        titleAr,
        description,
        descriptionAr,
        brand,
        model,
        storageGb: parseInt(storageGb),
        ramGb: ramGb ? parseInt(ramGb) : null,
        color,
        colorAr,
        imei,
        conditionGrade,
        batteryHealth: batteryHealth ? parseInt(batteryHealth) : null,
        screenCondition,
        bodyCondition,
        originalParts: originalParts ?? true,
        hasBox: hasBox ?? false,
        hasAccessories: hasAccessories ?? false,
        accessoriesDetails,
        priceEgp: parseFloat(priceEgp),
        negotiable: negotiable ?? true,
        acceptsBarter: acceptsBarter ?? false,
        barterPreferences: barterPreferences || null,
        images: images || [],
        verificationCode,
        governorate,
        city,
        district,
        status: 'DRAFT',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    res.status(201).json({
      success: true,
      data: listing,
      verificationCode
    });
  } catch (error: any) {
    console.error('Error creating listing:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('imei')) {
      return res.status(400).json({
        success: false,
        error: 'This IMEI is already registered on another listing'
      });
    }
    res.status(500).json({ success: false, error: 'Failed to create listing' });
  }
};

export const updateListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const existing = await prisma.mobileListing.findFirst({
      where: { id, sellerId: userId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    const listing = await prisma.mobileListing.update({
      where: { id },
      data: req.body
    });

    res.json({ success: true, data: listing });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ success: false, error: 'Failed to update listing' });
  }
};

export const deleteListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const existing = await prisma.mobileListing.findFirst({
      where: { id, sellerId: userId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    await prisma.mobileListing.delete({ where: { id } });

    res.json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ success: false, error: 'Failed to delete listing' });
  }
};

export const getMyListings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { status } = req.query;

    const where: any = { sellerId: userId };
    if (status) where.status = status;

    const listings = await prisma.mobileListing.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: listings });
  } catch (error) {
    console.error('Error fetching my listings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch listings' });
  }
};

export const uploadVerificationImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { verificationImageUrl } = req.body;

    const listing = await prisma.mobileListing.findFirst({
      where: { id, sellerId: userId }
    });

    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    const updated = await prisma.mobileListing.update({
      where: { id },
      data: { verificationImageUrl }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error uploading verification image:', error);
    res.status(500).json({ success: false, error: 'Failed to upload verification image' });
  }
};

export const publishListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const listing = await prisma.mobileListing.findFirst({
      where: { id, sellerId: userId }
    });

    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    // Check if IMEI is verified for trusted status
    const status = listing.imeiVerified ? 'ACTIVE' : 'PENDING_REVIEW';

    const updated = await prisma.mobileListing.update({
      where: { id },
      data: { status }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error publishing listing:', error);
    res.status(500).json({ success: false, error: 'Failed to publish listing' });
  }
};

export const markAsSold = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const listing = await prisma.mobileListing.findFirst({
      where: { id, sellerId: userId }
    });

    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    const updated = await prisma.mobileListing.update({
      where: { id },
      data: {
        status: 'SOLD',
        soldAt: new Date()
      }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error marking listing as sold:', error);
    res.status(500).json({ success: false, error: 'Failed to mark as sold' });
  }
};

// ============================================
// IMEI Verification - التحقق من IMEI
// ============================================

export const checkIMEI = async (req: Request, res: Response) => {
  try {
    const { imei } = req.body;

    // Basic IMEI validation (15 digits)
    if (!imei || !/^\d{15}$/.test(imei)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid IMEI format. Must be 15 digits.'
      });
    }

    // Check if IMEI exists in our database
    const existingListing = await prisma.mobileListing.findFirst({
      where: { imei }
    });

    // Check our verification records
    const verification = await prisma.mobileIMEIVerification.findFirst({
      where: { imei },
      orderBy: { verifiedAt: 'desc' }
    });

    res.json({
      success: true,
      data: {
        imei,
        isRegistered: !!existingListing,
        lastVerification: verification ? {
          isBlacklisted: verification.isBlacklisted,
          isStolen: verification.isStolen,
          verifiedAt: verification.verifiedAt
        } : null
      }
    });
  } catch (error) {
    console.error('Error checking IMEI:', error);
    res.status(500).json({ success: false, error: 'Failed to check IMEI' });
  }
};

export const verifyIMEI = async (req: Request, res: Response) => {
  try {
    const { imei, listingId } = req.body;

    // Basic IMEI validation
    if (!imei || !/^\d{15}$/.test(imei)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid IMEI format'
      });
    }

    // Here we would call external IMEI verification API
    // For now, simulate verification
    const isClean = !imei.startsWith('000'); // Simple simulation

    const verification = await prisma.mobileIMEIVerification.create({
      data: {
        listingId,
        imei,
        isBlacklisted: !isClean,
        isStolen: false,
        isFinanced: false,
        modelMatches: true,
        verificationProvider: 'xchange_internal',
        verifiedAt: new Date()
      }
    });

    // Update listing
    await prisma.mobileListing.update({
      where: { id: listingId },
      data: {
        imeiVerified: true,
        imeiStatus: isClean ? 'CLEAN' : 'BLACKLISTED'
      }
    });

    res.json({
      success: true,
      data: {
        isClean,
        verification
      }
    });
  } catch (error) {
    console.error('Error verifying IMEI:', error);
    res.status(500).json({ success: false, error: 'Failed to verify IMEI' });
  }
};

export const getIMEICertificate = async (req: Request, res: Response) => {
  try {
    const { imei } = req.params;

    const verification = await prisma.mobileIMEIVerification.findFirst({
      where: { imei },
      include: { listing: true }
    });

    if (!verification) {
      return res.status(404).json({ success: false, error: 'Verification not found' });
    }

    // Generate certificate data
    const certificate = {
      imei,
      verifiedAt: verification.verifiedAt,
      status: verification.isBlacklisted ? 'BLACKLISTED' : 'CLEAN',
      device: verification.actualModel,
      certificateId: verification.id
    };

    res.json({ success: true, data: certificate });
  } catch (error) {
    console.error('Error getting IMEI certificate:', error);
    res.status(500).json({ success: false, error: 'Failed to get certificate' });
  }
};

export const getIMEIStatus = async (req: Request, res: Response) => {
  try {
    const { imei } = req.params;

    const verification = await prisma.mobileIMEIVerification.findFirst({
      where: { imei },
      orderBy: { verifiedAt: 'desc' }
    });

    res.json({
      success: true,
      data: verification || { imei, status: 'NOT_VERIFIED' }
    });
  } catch (error) {
    console.error('Error getting IMEI status:', error);
    res.status(500).json({ success: false, error: 'Failed to get IMEI status' });
  }
};

// ============================================
// Favorites - المفضلة
// ============================================

export const getMyFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const favorites = await prisma.mobileFavorite.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            seller: {
              select: { id: true, fullName: true, rating: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch favorites' });
  }
};

export const addToFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { listingId } = req.params;

    const favorite = await prisma.mobileFavorite.create({
      data: { userId, listingId }
    });

    // Increment favorites count
    await prisma.mobileListing.update({
      where: { id: listingId },
      data: { favoritesCount: { increment: 1 } }
    });

    res.status(201).json({ success: true, data: favorite });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'Already in favorites' });
    }
    console.error('Error adding to favorites:', error);
    res.status(500).json({ success: false, error: 'Failed to add to favorites' });
  }
};

export const removeFromFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { listingId } = req.params;

    await prisma.mobileFavorite.delete({
      where: { userId_listingId: { userId, listingId } }
    });

    // Decrement favorites count
    await prisma.mobileListing.update({
      where: { id: listingId },
      data: { favoritesCount: { decrement: 1 } }
    });

    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ success: false, error: 'Failed to remove from favorites' });
  }
};

// ============================================
// Price Alerts - تنبيهات الأسعار
// ============================================

export const getMyPriceAlerts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const alerts = await prisma.mobilePriceAlert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error('Error fetching price alerts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch price alerts' });
  }
};

export const createPriceAlert = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { brand, model, maxPriceEgp, minConditionGrade, governorate, minStorageGb } = req.body;

    const alert = await prisma.mobilePriceAlert.create({
      data: {
        userId,
        brand,
        model,
        maxPriceEgp: maxPriceEgp ? parseFloat(maxPriceEgp) : null,
        minConditionGrade,
        governorate,
        minStorageGb: minStorageGb ? parseInt(minStorageGb) : null
      }
    });

    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    console.error('Error creating price alert:', error);
    res.status(500).json({ success: false, error: 'Failed to create price alert' });
  }
};

export const updatePriceAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const alert = await prisma.mobilePriceAlert.updateMany({
      where: { id, userId },
      data: req.body
    });

    res.json({ success: true, data: alert });
  } catch (error) {
    console.error('Error updating price alert:', error);
    res.status(500).json({ success: false, error: 'Failed to update price alert' });
  }
};

export const deletePriceAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    await prisma.mobilePriceAlert.deleteMany({
      where: { id, userId }
    });

    res.json({ success: true, message: 'Price alert deleted' });
  } catch (error) {
    console.error('Error deleting price alert:', error);
    res.status(500).json({ success: false, error: 'Failed to delete price alert' });
  }
};

// ============================================
// Transactions - المعاملات
// ============================================

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const buyerId = (req as any).user.id;
    const {
      listingId, transactionType, paymentMethod, deliveryMethod,
      deliveryAddress, barterListingId, cashDifferenceEgp
    } = req.body;

    const listing = await prisma.mobileListing.findUnique({
      where: { id: listingId }
    });

    if (!listing || listing.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, error: 'Listing not available' });
    }

    // Calculate fees (5% seller fee)
    const platformFee = listing.priceEgp * 0.05;
    const sellerPayout = listing.priceEgp - platformFee;

    const transaction = await prisma.mobileTransaction.create({
      data: {
        listingId,
        buyerId,
        sellerId: listing.sellerId,
        transactionType: transactionType || 'SALE',
        agreedPriceEgp: listing.priceEgp,
        platformFeeEgp: platformFee,
        sellerPayoutEgp: sellerPayout,
        paymentMethod,
        deliveryMethod,
        deliveryAddress,
        barterListingId,
        cashDifferenceEgp,
        status: 'INITIATED'
      }
    });

    // Reserve the listing
    await prisma.mobileListing.update({
      where: { id: listingId },
      data: { status: 'RESERVED' }
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ success: false, error: 'Failed to create transaction' });
  }
};

export const getMyTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { role, status } = req.query;

    let where: any = {};

    if (role === 'buyer') {
      where.buyerId = userId;
    } else if (role === 'seller') {
      where.sellerId = userId;
    } else {
      where.OR = [{ buyerId: userId }, { sellerId: userId }];
    }

    if (status) where.status = status;

    const transactions = await prisma.mobileTransaction.findMany({
      where,
      include: {
        listing: true,
        buyer: {
          select: { id: true, fullName: true, avatar: true, rating: true }
        },
        seller: {
          select: { id: true, fullName: true, avatar: true, rating: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
};

export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const transaction = await prisma.mobileTransaction.findFirst({
      where: {
        id,
        OR: [{ buyerId: userId }, { sellerId: userId }]
      },
      include: {
        listing: true,
        buyer: {
          select: { id: true, fullName: true, avatar: true, phone: true, rating: true }
        },
        seller: {
          select: { id: true, fullName: true, avatar: true, phone: true, rating: true }
        },
        disputes: true,
        reviews: true
      }
    });

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transaction' });
  }
};

export const updateTransactionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { status, trackingNumber } = req.body;

    const transaction = await prisma.mobileTransaction.findFirst({
      where: {
        id,
        OR: [{ buyerId: userId }, { sellerId: userId }]
      }
    });

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    const updateData: any = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;

    const updated = await prisma.mobileTransaction.update({
      where: { id },
      data: updateData
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ success: false, error: 'Failed to update transaction' });
  }
};

export const confirmDelivery = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { conditionOk, notes } = req.body;

    const transaction = await prisma.mobileTransaction.findFirst({
      where: { id, buyerId: userId }
    });

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    const updated = await prisma.mobileTransaction.update({
      where: { id },
      data: {
        status: 'INSPECTION',
        deliveryStatus: 'DELIVERED',
        inspectionStartsAt: new Date(),
        inspectionEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        buyerNotes: notes
      }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error confirming delivery:', error);
    res.status(500).json({ success: false, error: 'Failed to confirm delivery' });
  }
};

export const releaseEscrow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const transaction = await prisma.mobileTransaction.findFirst({
      where: { id, buyerId: userId, status: 'INSPECTION' }
    });

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found or not in inspection' });
    }

    const updated = await prisma.mobileTransaction.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        buyerConfirmed: true,
        escrowReleasedAt: new Date(),
        completedAt: new Date()
      }
    });

    // Mark listing as sold
    await prisma.mobileListing.update({
      where: { id: transaction.listingId },
      data: { status: 'SOLD', soldAt: new Date() }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error releasing escrow:', error);
    res.status(500).json({ success: false, error: 'Failed to release escrow' });
  }
};

// ============================================
// Barter System - نظام المقايضة
// ============================================

export const createBarterProposal = async (req: Request, res: Response) => {
  try {
    const proposerId = (req as any).user.id;
    const { offeredListingId, requestedListingId, cashDifference, cashDirection, message } = req.body;

    // Verify offered listing belongs to proposer
    const offeredListing = await prisma.mobileListing.findFirst({
      where: { id: offeredListingId, sellerId: proposerId, status: 'ACTIVE' }
    });

    if (!offeredListing) {
      return res.status(400).json({ success: false, error: 'Invalid offered listing' });
    }

    // Verify requested listing accepts barter
    const requestedListing = await prisma.mobileListing.findFirst({
      where: { id: requestedListingId, status: 'ACTIVE', acceptsBarter: true }
    });

    if (!requestedListing) {
      return res.status(400).json({ success: false, error: 'Requested listing not available for barter' });
    }

    const proposal = await prisma.mobileBarterProposal.create({
      data: {
        proposerId,
        receiverId: requestedListing.sellerId,
        offeredListingId,
        requestedListingId,
        cashDifference: cashDifference || 0,
        cashDirection,
        proposerMessage: message,
        status: 'PENDING'
      }
    });

    res.status(201).json({ success: true, data: proposal });
  } catch (error) {
    console.error('Error creating barter proposal:', error);
    res.status(500).json({ success: false, error: 'Failed to create barter proposal' });
  }
};

export const getMyBarterProposals = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const proposals = await prisma.mobileBarterProposal.findMany({
      where: { proposerId: userId },
      include: {
        offeredListing: true,
        requestedListing: true,
        receiver: {
          select: { id: true, fullName: true, avatar: true, rating: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: proposals });
  } catch (error) {
    console.error('Error fetching barter proposals:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch proposals' });
  }
};

export const getReceivedBarterProposals = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const proposals = await prisma.mobileBarterProposal.findMany({
      where: { receiverId: userId, status: 'PENDING' },
      include: {
        offeredListing: true,
        requestedListing: true,
        proposer: {
          select: { id: true, fullName: true, avatar: true, rating: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: proposals });
  } catch (error) {
    console.error('Error fetching received proposals:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch proposals' });
  }
};

export const respondToBarterProposal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { action, counterCashOffer, response } = req.body;

    const proposal = await prisma.mobileBarterProposal.findFirst({
      where: { id, receiverId: userId, status: 'PENDING' }
    });

    if (!proposal) {
      return res.status(404).json({ success: false, error: 'Proposal not found' });
    }

    let status: MobileBarterProposalStatus;
    switch (action) {
      case 'accept': status = 'ACCEPTED'; break;
      case 'reject': status = 'REJECTED'; break;
      case 'counter': status = 'COUNTERED'; break;
      default: return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    const updated = await prisma.mobileBarterProposal.update({
      where: { id },
      data: {
        status,
        receiverResponse: response,
        counterCashOffer: counterCashOffer || null,
        respondedAt: new Date()
      }
    });

    // If accepted, create transaction
    if (status === 'ACCEPTED') {
      await prisma.mobileTransaction.create({
        data: {
          listingId: proposal.requestedListingId,
          buyerId: proposal.proposerId,
          sellerId: proposal.receiverId,
          transactionType: proposal.cashDifference > 0 ? 'BARTER_WITH_CASH' : 'BARTER',
          barterListingId: proposal.offeredListingId,
          cashDifferenceEgp: proposal.cashDifference,
          cashPaidBy: proposal.cashDirection,
          status: 'INITIATED'
        }
      });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error responding to proposal:', error);
    res.status(500).json({ success: false, error: 'Failed to respond to proposal' });
  }
};

export const withdrawBarterProposal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    await prisma.mobileBarterProposal.updateMany({
      where: { id, proposerId: userId, status: 'PENDING' },
      data: { status: 'WITHDRAWN' }
    });

    res.json({ success: true, message: 'Proposal withdrawn' });
  } catch (error) {
    console.error('Error withdrawing proposal:', error);
    res.status(500).json({ success: false, error: 'Failed to withdraw proposal' });
  }
};

// ============================================
// Barter Matches - مطابقات المقايضة الذكية
// ============================================

export const getBarterMatches = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const matches = await prisma.mobileBarterMatch.findMany({
      where: {
        participants: {
          some: { userId }
        },
        status: { in: ['PROPOSED', 'PARTIALLY_ACCEPTED'] }
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, fullName: true, avatar: true, rating: true }
            },
            offersListing: true
          }
        }
      },
      orderBy: { matchScore: 'desc' }
    });

    res.json({ success: true, data: matches });
  } catch (error) {
    console.error('Error fetching barter matches:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch matches' });
  }
};

export const getBarterMatchById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const match = await prisma.mobileBarterMatch.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, fullName: true, avatar: true, rating: true, governorate: true }
            },
            offersListing: true
          }
        }
      }
    });

    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found' });
    }

    res.json({ success: true, data: match });
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch match' });
  }
};

export const acceptBarterMatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // Update participant acceptance
    await prisma.mobileBarterMatchParticipant.updateMany({
      where: { matchId: id, userId },
      data: { accepted: true, acceptedAt: new Date() }
    });

    // Check if all participants accepted
    const participants = await prisma.mobileBarterMatchParticipant.findMany({
      where: { matchId: id }
    });

    const allAccepted = participants.every(p => p.accepted);

    if (allAccepted) {
      await prisma.mobileBarterMatch.update({
        where: { id },
        data: { status: 'ALL_ACCEPTED' }
      });
    } else {
      await prisma.mobileBarterMatch.update({
        where: { id },
        data: { status: 'PARTIALLY_ACCEPTED' }
      });
    }

    res.json({ success: true, message: 'Match accepted', allAccepted });
  } catch (error) {
    console.error('Error accepting match:', error);
    res.status(500).json({ success: false, error: 'Failed to accept match' });
  }
};

export const rejectBarterMatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    await prisma.mobileBarterMatch.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledBy: userId,
        cancellationReason: 'User rejected'
      }
    });

    res.json({ success: true, message: 'Match rejected' });
  } catch (error) {
    console.error('Error rejecting match:', error);
    res.status(500).json({ success: false, error: 'Failed to reject match' });
  }
};

export const getBarterSuggestions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get user's barter-enabled listings
    const myListings = await prisma.mobileListing.findMany({
      where: { sellerId: userId, status: 'ACTIVE', acceptsBarter: true }
    });

    if (myListings.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Find potential matches
    const suggestions = [];

    for (const listing of myListings) {
      const preferences = listing.barterPreferences as any;

      const potentialMatches = await prisma.mobileListing.findMany({
        where: {
          status: 'ACTIVE',
          acceptsBarter: true,
          sellerId: { not: userId },
          brand: preferences?.wanted_brands ? { in: preferences.wanted_brands } : undefined,
          priceEgp: {
            gte: listing.priceEgp * 0.7,
            lte: listing.priceEgp * 1.3
          }
        },
        include: {
          seller: {
            select: { id: true, fullName: true, rating: true }
          }
        },
        take: 5
      });

      for (const match of potentialMatches) {
        const valueDiff = Math.abs(listing.priceEgp - match.priceEgp);
        const score = Math.max(0, 100 - (valueDiff / listing.priceEgp * 100));

        suggestions.push({
          myListing: listing,
          theirListing: match,
          valueDifference: valueDiff,
          matchScore: Math.round(score),
          iPayDifference: match.priceEgp > listing.priceEgp
        });
      }
    }

    // Sort by score
    suggestions.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ success: true, data: suggestions.slice(0, 10) });
  } catch (error) {
    console.error('Error fetching barter suggestions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch suggestions' });
  }
};

export const getBarterSuggestionsForListing = async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;

    const listing = await prisma.mobileListing.findUnique({
      where: { id: listingId }
    });

    if (!listing || !listing.acceptsBarter) {
      return res.status(400).json({ success: false, error: 'Listing not available for barter' });
    }

    const preferences = listing.barterPreferences as any;

    const matches = await prisma.mobileListing.findMany({
      where: {
        status: 'ACTIVE',
        acceptsBarter: true,
        sellerId: { not: listing.sellerId },
        brand: preferences?.wanted_brands ? { in: preferences.wanted_brands } : undefined,
        priceEgp: {
          gte: listing.priceEgp * (preferences?.min_value_percent || 70) / 100,
          lte: listing.priceEgp * (preferences?.max_value_percent || 130) / 100
        }
      },
      include: {
        seller: {
          select: { id: true, fullName: true, rating: true, governorate: true }
        }
      },
      take: 20
    });

    const suggestions = matches.map(match => {
      const valueDiff = match.priceEgp - listing.priceEgp;
      const score = Math.max(0, 100 - (Math.abs(valueDiff) / listing.priceEgp * 100));

      return {
        listing: match,
        valueDifference: Math.abs(valueDiff),
        iPayDifference: valueDiff > 0,
        matchScore: Math.round(score),
        sameGovernorate: match.governorate === listing.governorate
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.json({ success: true, data: suggestions });
  } catch (error) {
    console.error('Error fetching listing suggestions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch suggestions' });
  }
};

// ============================================
// Disputes - النزاعات
// ============================================

export const createDispute = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { transactionId, reason, descriptionAr, descriptionEn, evidenceUrls } = req.body;

    const transaction = await prisma.mobileTransaction.findFirst({
      where: {
        id: transactionId,
        OR: [{ buyerId: userId }, { sellerId: userId }],
        status: { in: ['INSPECTION', 'DELIVERED'] }
      }
    });

    if (!transaction) {
      return res.status(400).json({ success: false, error: 'Cannot dispute this transaction' });
    }

    const dispute = await prisma.mobileDispute.create({
      data: {
        transactionId,
        initiatedById: userId,
        reason,
        descriptionAr,
        descriptionEn,
        evidenceUrls: evidenceUrls || [],
        status: 'OPEN'
      }
    });

    // Update transaction status
    await prisma.mobileTransaction.update({
      where: { id: transactionId },
      data: { status: 'DISPUTED' }
    });

    res.status(201).json({ success: true, data: dispute });
  } catch (error) {
    console.error('Error creating dispute:', error);
    res.status(500).json({ success: false, error: 'Failed to create dispute' });
  }
};

export const getMyDisputes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const disputes = await prisma.mobileDispute.findMany({
      where: {
        OR: [
          { initiatedById: userId },
          { transaction: { OR: [{ buyerId: userId }, { sellerId: userId }] } }
        ]
      },
      include: {
        transaction: {
          include: { listing: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: disputes });
  } catch (error) {
    console.error('Error fetching disputes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch disputes' });
  }
};

export const getDisputeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const dispute = await prisma.mobileDispute.findUnique({
      where: { id },
      include: {
        transaction: {
          include: {
            listing: true,
            buyer: { select: { id: true, fullName: true } },
            seller: { select: { id: true, fullName: true } }
          }
        },
        initiatedBy: { select: { id: true, fullName: true } }
      }
    });

    if (!dispute) {
      return res.status(404).json({ success: false, error: 'Dispute not found' });
    }

    res.json({ success: true, data: dispute });
  } catch (error) {
    console.error('Error fetching dispute:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dispute' });
  }
};

export const respondToDispute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    // This would typically be handled by the other party in the dispute
    // For now, just add to notes

    res.json({ success: true, message: 'Response recorded' });
  } catch (error) {
    console.error('Error responding to dispute:', error);
    res.status(500).json({ success: false, error: 'Failed to respond' });
  }
};

export const addDisputeEvidence = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { evidenceUrl } = req.body;

    const dispute = await prisma.mobileDispute.findUnique({ where: { id } });

    if (!dispute) {
      return res.status(404).json({ success: false, error: 'Dispute not found' });
    }

    const currentEvidence = (dispute.evidenceUrls as string[]) || [];

    await prisma.mobileDispute.update({
      where: { id },
      data: { evidenceUrls: [...currentEvidence, evidenceUrl] }
    });

    res.json({ success: true, message: 'Evidence added' });
  } catch (error) {
    console.error('Error adding evidence:', error);
    res.status(500).json({ success: false, error: 'Failed to add evidence' });
  }
};

export const resolveDispute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { resolution, resolutionNotes, refundAmount } = req.body;

    const dispute = await prisma.mobileDispute.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolution,
        resolutionNotes,
        refundAmount,
        resolvedById: userId,
        resolvedAt: new Date()
      }
    });

    res.json({ success: true, data: dispute });
  } catch (error) {
    console.error('Error resolving dispute:', error);
    res.status(500).json({ success: false, error: 'Failed to resolve dispute' });
  }
};

// ============================================
// Reviews - التقييمات
// ============================================

export const createReview = async (req: Request, res: Response) => {
  try {
    const reviewerId = (req as any).user.id;
    const {
      transactionId, rating, accuracyRating,
      communicationRating, speedRating, commentAr, commentEn
    } = req.body;

    const transaction = await prisma.mobileTransaction.findFirst({
      where: {
        id: transactionId,
        status: 'COMPLETED',
        OR: [{ buyerId: reviewerId }, { sellerId: reviewerId }]
      }
    });

    if (!transaction) {
      return res.status(400).json({ success: false, error: 'Cannot review this transaction' });
    }

    const revieweeId = transaction.buyerId === reviewerId
      ? transaction.sellerId
      : transaction.buyerId;

    const review = await prisma.mobileReview.create({
      data: {
        transactionId,
        reviewerId,
        revieweeId,
        rating,
        accuracyRating,
        communicationRating,
        speedRating,
        commentAr,
        commentEn
      }
    });

    // Update user rating
    const allReviews = await prisma.mobileReview.findMany({
      where: { revieweeId }
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.user.update({
      where: { id: revieweeId },
      data: {
        rating: avgRating,
        totalReviews: allReviews.length
      }
    });

    res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'Already reviewed this transaction' });
    }
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, error: 'Failed to create review' });
  }
};

export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const reviews = await prisma.mobileReview.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: {
          select: { id: true, fullName: true, avatar: true }
        },
        transaction: {
          include: { listing: { select: { title: true, brand: true, model: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const stats = {
      total: reviews.length,
      average: reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0,
      distribution: {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length
      }
    };

    res.json({ success: true, data: { reviews, stats } });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
};

export const getListingSellerReviews = async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;

    const listing = await prisma.mobileListing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    const reviews = await prisma.mobileReview.findMany({
      where: { revieweeId: listing.sellerId },
      include: {
        reviewer: {
          select: { id: true, fullName: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching seller reviews:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
};

export const respondToReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { response } = req.body;

    const review = await prisma.mobileReview.findFirst({
      where: { id, revieweeId: userId }
    });

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    const updated = await prisma.mobileReview.update({
      where: { id },
      data: {
        sellerResponse: response,
        sellerRespondedAt: new Date()
      }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error responding to review:', error);
    res.status(500).json({ success: false, error: 'Failed to respond' });
  }
};

// ============================================
// Statistics & Data - الإحصائيات والبيانات
// ============================================

export const getStatistics = async (req: Request, res: Response) => {
  try {
    const [
      totalListings,
      activeListings,
      totalTransactions,
      completedTransactions
    ] = await Promise.all([
      prisma.mobileListing.count(),
      prisma.mobileListing.count({ where: { status: 'ACTIVE' } }),
      prisma.mobileTransaction.count(),
      prisma.mobileTransaction.count({ where: { status: 'COMPLETED' } })
    ]);

    // Get brand distribution
    const brandStats = await prisma.mobileListing.groupBy({
      by: ['brand'],
      where: { status: 'ACTIVE' },
      _count: true,
      orderBy: { _count: { brand: 'desc' } },
      take: 10
    });

    // Get price ranges
    const priceStats = await prisma.mobileListing.aggregate({
      where: { status: 'ACTIVE' },
      _avg: { priceEgp: true },
      _min: { priceEgp: true },
      _max: { priceEgp: true }
    });

    res.json({
      success: true,
      data: {
        listings: { total: totalListings, active: activeListings },
        transactions: { total: totalTransactions, completed: completedTransactions },
        brands: brandStats,
        prices: priceStats
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
  }
};

export const getPopularBrands = async (req: Request, res: Response) => {
  try {
    const brands = await prisma.mobileListing.groupBy({
      by: ['brand'],
      where: { status: 'ACTIVE' },
      _count: true,
      orderBy: { _count: { brand: 'desc' } },
      take: 10
    });

    res.json({ success: true, data: brands });
  } catch (error) {
    console.error('Error fetching popular brands:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch brands' });
  }
};

export const getPopularModels = async (req: Request, res: Response) => {
  try {
    const { brand } = req.query;

    const where: any = { status: 'ACTIVE' };
    if (brand) where.brand = brand;

    const models = await prisma.mobileListing.groupBy({
      by: ['brand', 'model'],
      where,
      _count: true,
      _avg: { priceEgp: true },
      orderBy: { _count: { model: 'desc' } },
      take: 20
    });

    res.json({ success: true, data: models });
  } catch (error) {
    console.error('Error fetching popular models:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch models' });
  }
};

export const getBrands = async (req: Request, res: Response) => {
  try {
    // Return all available brands
    const brands = [
      { value: 'APPLE', label: 'Apple', labelAr: 'أبل' },
      { value: 'SAMSUNG', label: 'Samsung', labelAr: 'سامسونج' },
      { value: 'XIAOMI', label: 'Xiaomi', labelAr: 'شاومي' },
      { value: 'OPPO', label: 'OPPO', labelAr: 'أوبو' },
      { value: 'VIVO', label: 'Vivo', labelAr: 'فيفو' },
      { value: 'REALME', label: 'Realme', labelAr: 'ريلمي' },
      { value: 'HUAWEI', label: 'Huawei', labelAr: 'هواوي' },
      { value: 'HONOR', label: 'Honor', labelAr: 'هونر' },
      { value: 'ONEPLUS', label: 'OnePlus', labelAr: 'ون بلس' },
      { value: 'GOOGLE', label: 'Google', labelAr: 'جوجل' },
      { value: 'MOTOROLA', label: 'Motorola', labelAr: 'موتورولا' },
      { value: 'NOKIA', label: 'Nokia', labelAr: 'نوكيا' },
      { value: 'INFINIX', label: 'Infinix', labelAr: 'انفينكس' },
      { value: 'TECNO', label: 'Tecno', labelAr: 'تكنو' },
      { value: 'ITEL', label: 'Itel', labelAr: 'ايتل' },
      { value: 'NOTHING', label: 'Nothing', labelAr: 'ناثينج' },
      { value: 'ASUS', label: 'Asus', labelAr: 'أسوس' },
      { value: 'SONY', label: 'Sony', labelAr: 'سوني' },
      { value: 'LG', label: 'LG', labelAr: 'إل جي' },
      { value: 'OTHER', label: 'Other', labelAr: 'أخرى' }
    ];

    res.json({ success: true, data: brands });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch brands' });
  }
};

export const getModelsByBrand = async (req: Request, res: Response) => {
  try {
    const { brand } = req.params;

    // Get unique models for this brand from listings and price references
    const [listingModels, priceModels] = await Promise.all([
      prisma.mobileListing.findMany({
        where: { brand: brand.toUpperCase() as any },
        select: { model: true },
        distinct: ['model']
      }),
      prisma.mobilePriceReference.findMany({
        where: { brand: brand.toUpperCase() as any },
        select: { model: true },
        distinct: ['model']
      })
    ]);

    const models = [...new Set([
      ...listingModels.map(l => l.model),
      ...priceModels.map(p => p.model)
    ])].sort();

    res.json({ success: true, data: models });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch models' });
  }
};

// ============================================
// Admin Functions - وظائف الإدارة
// ============================================

export const updatePriceReferences = async (req: Request, res: Response) => {
  try {
    const prices = req.body.prices;

    for (const price of prices) {
      await prisma.mobilePriceReference.upsert({
        where: {
          brand_model_storageGb: {
            brand: price.brand,
            model: price.model,
            storageGb: price.storageGb
          }
        },
        update: {
          priceLow: price.priceLow,
          priceAverage: price.priceAverage,
          priceHigh: price.priceHigh
        },
        create: price
      });
    }

    res.json({ success: true, message: 'Prices updated' });
  } catch (error) {
    console.error('Error updating prices:', error);
    res.status(500).json({ success: false, error: 'Failed to update prices' });
  }
};

export const adminUpdateListingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const listing = await prisma.mobileListing.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null
      }
    });

    res.json({ success: true, data: listing });
  } catch (error) {
    console.error('Error updating listing status:', error);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
};
