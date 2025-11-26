/**
 * Admin Dashboard Controllers
 * Handles all admin operations for managing the platform
 */

import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { UserStatus, ItemStatus, ListingStatus } from '@prisma/client';

// ============================================
// DASHBOARD STATISTICS
// ============================================

/**
 * Get platform statistics for admin dashboard
 */
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get counts in parallel
    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      totalCategories,
      totalItems,
      activeItems,
      totalListings,
      activeListings,
      totalTransactions,
      completedTransactions,
      pendingDisputes,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      prisma.user.count({ where: { status: UserStatus.PENDING } }),
      prisma.user.count({ where: { status: UserStatus.SUSPENDED } }),
      prisma.category.count(),
      prisma.item.count(),
      prisma.item.count({ where: { is_active: true } }),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: ListingStatus.ACTIVE } }),
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: 'COMPLETED' } }),
      prisma.dispute.count({ where: { status: 'OPEN' } }),
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          pending: pendingUsers,
          suspended: suspendedUsers,
        },
        categories: {
          total: totalCategories,
        },
        items: {
          total: totalItems,
          active: activeItems,
          inactive: totalItems - activeItems,
        },
        listings: {
          total: totalListings,
          active: activeListings,
          inactive: totalListings - activeListings,
        },
        transactions: {
          total: totalTransactions,
          completed: completedTransactions,
          pending: totalTransactions - completedTransactions,
        },
        disputes: {
          pending: pendingDisputes,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * Get all users with pagination and filters
 */
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      user_type,
      search,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (user_type) {
      where.user_type = user_type;
    }

    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { full_name: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Get users and total count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { [sort_by as string]: sort_order },
        select: {
          id: true,
          email: true,
          full_name: true,
          phone: true,
          user_type: true,
          status: true,
          email_verified: true,
          phone_verified: true,
          rating: true,
          total_reviews: true,
          total_transactions: true,
          created_at: true,
          last_login: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user details by ID
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            items: true,
            listings: true,
            transactions_as_buyer: true,
            transactions_as_seller: true,
            reviews_received: true,
            reviews_given: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user status (activate, suspend, ban)
 */
export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!Object.values(UserStatus).includes(status)) {
      throw new BadRequestError('Invalid status');
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        status,
        suspension_reason: status === UserStatus.SUSPENDED ? reason : null,
      },
    });

    // TODO: Send notification to user about status change
    // TODO: Log this action in audit trail

    res.json({
      success: true,
      message: `User status updated to ${status}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify user email manually (admin override)
 */
export const verifyUserEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: { email_verified: true },
    });

    res.json({
      success: true,
      message: 'User email verified',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify user phone manually (admin override)
 */
export const verifyUserPhone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: { phone_verified: true },
    });

    res.json({
      success: true,
      message: 'User phone verified',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user account (soft delete - mark as deleted)
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.body;

    if (permanent) {
      // Hard delete - remove all user data
      // WARNING: This is irreversible!
      await prisma.user.delete({ where: { id } });

      res.json({
        success: true,
        message: 'User permanently deleted',
      });
    } else {
      // Soft delete - just change status
      await prisma.user.update({
        where: { id },
        data: {
          status: UserStatus.SUSPENDED,
          suspension_reason: 'Account deleted by admin',
        },
      });

      res.json({
        success: true,
        message: 'User account suspended (soft delete)',
      });
    }
  } catch (error) {
    next(error);
  }
};

// ============================================
// CATEGORY MANAGEMENT
// ============================================

/**
 * Get all categories (for admin - includes inactive)
 */
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { level, parent_id, include_inactive = 'true' } = req.query;

    const where: any = {};

    if (level) {
      where.level = parseInt(level as string);
    }

    if (parent_id) {
      where.parent_id = parent_id;
    }

    if (include_inactive !== 'true') {
      where.is_active = true;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ level: 'asc' }, { name_en: 'asc' }],
      include: {
        parent: {
          select: {
            id: true,
            name_en: true,
            name_ar: true,
            slug: true,
          },
        },
        _count: {
          select: {
            children: true,
            items: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: categories,
      total: categories.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new category
 */
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name_en,
      name_ar,
      slug,
      icon,
      level,
      parent_id,
      description_en,
      description_ar,
      is_active = true,
    } = req.body;

    // Validate level
    if (level < 1 || level > 3) {
      throw new BadRequestError('Category level must be between 1 and 3');
    }

    // Validate parent for levels 2 and 3
    if (level > 1 && !parent_id) {
      throw new BadRequestError('Parent category required for level 2 and 3 categories');
    }

    const category = await prisma.category.create({
      data: {
        name_en,
        name_ar,
        slug,
        icon,
        level,
        parent_id,
        description_en,
        description_ar,
        is_active,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update category
 */
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      name_en,
      name_ar,
      slug,
      icon,
      description_en,
      description_ar,
      is_active,
    } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name_en,
        name_ar,
        slug,
        icon,
        description_en,
        description_ar,
        is_active,
      },
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete category (only if no items)
 */
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if category has items
    const itemCount = await prisma.item.count({
      where: { category_id: id },
    });

    if (itemCount > 0) {
      throw new BadRequestError(`Cannot delete category with ${itemCount} items. Deactivate instead.`);
    }

    // Check if category has children
    const childrenCount = await prisma.category.count({
      where: { parent_id: id },
    });

    if (childrenCount > 0) {
      throw new BadRequestError(`Cannot delete category with ${childrenCount} sub-categories`);
    }

    await prisma.category.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// LISTING MODERATION
// ============================================

/**
 * Get all listings (for moderation)
 */
export const getListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      listing_type,
      flagged_only = 'false',
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (listing_type) {
      where.listing_type = listing_type;
    }

    if (flagged_only === 'true') {
      where.is_flagged = true;
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
        include: {
          item: {
            select: {
              title: true,
              description: true,
              category_id: true,
            },
          },
          seller: {
            select: {
              id: true,
              full_name: true,
              email: true,
              user_type: true,
              status: true,
            },
          },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({
      success: true,
      data: listings,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Flag listing for review
 */
export const flagListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        is_flagged: true,
        flag_reason: reason,
      },
    });

    res.json({
      success: true,
      message: 'Listing flagged for review',
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve listing (remove flag)
 */
export const approveListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        is_flagged: false,
        flag_reason: null,
        status: ListingStatus.ACTIVE,
      },
    });

    res.json({
      success: true,
      message: 'Listing approved',
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject/Remove listing
 */
export const rejectListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        status: ListingStatus.CLOSED,
        closure_reason: reason,
      },
    });

    // TODO: Notify seller

    res.json({
      success: true,
      message: 'Listing rejected',
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// DISPUTE RESOLUTION
// ============================================

/**
 * Get all disputes
 */
export const getDisputes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20', status = 'OPEN' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where: { status: status as any },
        skip,
        take,
        orderBy: { created_at: 'asc' }, // Oldest first
        include: {
          transaction: {
            include: {
              buyer: {
                select: {
                  id: true,
                  full_name: true,
                  email: true,
                },
              },
              seller: {
                select: {
                  id: true,
                  full_name: true,
                  email: true,
                },
              },
            },
          },
          initiated_by_user: {
            select: {
              id: true,
              full_name: true,
              email: true,
            },
          },
        },
      }),
      prisma.dispute.count({ where: { status: status as any } }),
    ]);

    res.json({
      success: true,
      data: disputes,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resolve dispute
 */
export const resolveDispute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { resolution, resolved_in_favor_of } = req.body;

    const dispute = await prisma.dispute.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolution,
        resolved_in_favor_of,
        resolved_at: new Date(),
        resolved_by_admin_id: req.user.id,
      },
    });

    // TODO: Notify both parties
    // TODO: Update transaction status based on resolution

    res.json({
      success: true,
      message: 'Dispute resolved',
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
};
