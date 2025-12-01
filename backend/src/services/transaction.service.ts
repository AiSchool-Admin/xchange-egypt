import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import prisma from '../lib/prisma';

// Types
interface CreatePurchaseData {
  listingId: string;
  paymentMethod?: string;
}

interface PaginatedResult<T> {
  transactions: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Create a purchase transaction (order)
 */
export const createPurchase = async (
  buyerId: string,
  purchaseData: CreatePurchaseData
): Promise<any> => {
  // Get listing with item and seller information
  const listing = await prisma.listing.findUnique({
    where: { id: purchaseData.listingId },
    include: {
      item: {
        include: {
          seller: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!listing) {
    throw new NotFoundError('Listing not found');
  }

  // Validate listing is active and for sale
  if (listing.status !== 'ACTIVE') {
    throw new BadRequestError('Listing is not active');
  }

  if (listing.listingType !== 'DIRECT_SALE') {
    throw new BadRequestError('Listing is not for direct sale');
  }

  // Prevent sellers from buying their own items
  if (listing.item.sellerId === buyerId) {
    throw new BadRequestError('You cannot purchase your own items');
  }

  // Create transaction
  const transaction = await prisma.transaction.create({
    data: {
      listingId: listing.id,
      buyerId,
      sellerId: listing.item.sellerId,
      transactionType: 'DIRECT_SALE',
      amount: listing.price,
      paymentMethod: purchaseData.paymentMethod,
      paymentStatus: 'PENDING',
      deliveryStatus: 'PENDING',
    },
    include: {
      buyer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatar: true,
        },
      },
      seller: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatar: true,
          businessName: true,
        },
      },
      listing: {
        include: {
          item: {
            include: {
              category: {
                select: {
                  id: true,
                  nameAr: true,
                  nameEn: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // TODO: Integrate with payment gateway here
  // For now, we'll just create the transaction in PENDING status

  return transaction;
};

/**
 * Buy an item directly (simplified flow for demo)
 */
export const buyItemDirectly = async (
  buyerId: string,
  purchaseData: {
    itemId: string;
    paymentMethod: string;
    shippingAddress: string;
    phoneNumber: string;
    notes?: string;
  }
): Promise<any> => {
  // Get item with seller information
  const item = await prisma.item.findUnique({
    where: { id: purchaseData.itemId },
    include: {
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
  });

  if (!item) {
    throw new NotFoundError('Item not found');
  }

  // Check item is available
  if (item.status !== 'ACTIVE') {
    throw new BadRequestError('Item is not available for purchase');
  }

  // Check buyer is not the seller
  if (item.sellerId === buyerId) {
    throw new BadRequestError('You cannot buy your own item');
  }

  // Create or find a listing for this item
  let listing = await prisma.listing.findFirst({
    where: { itemId: item.id, status: 'ACTIVE' },
  });

  if (!listing) {
    // Create a listing automatically
    listing = await prisma.listing.create({
      data: {
        itemId: item.id,
        userId: item.sellerId,
        listingType: 'DIRECT_SALE',
        price: item.estimatedValue,
        currency: 'EGP',
        status: 'ACTIVE',
      },
    });
  }

  // Create the transaction
  const transaction = await prisma.transaction.create({
    data: {
      listingId: listing.id,
      buyerId,
      sellerId: item.sellerId,
      transactionType: 'DIRECT_SALE',
      amount: item.estimatedValue,
      currency: 'EGP',
      paymentMethod: purchaseData.paymentMethod,
      paymentStatus: 'PENDING',
      deliveryStatus: 'PENDING',
    },
    include: {
      buyer: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      seller: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  // Update item status to SOLD
  await prisma.item.update({
    where: { id: item.id },
    data: { status: 'SOLD' },
  });

  // Update listing status
  await prisma.listing.update({
    where: { id: listing.id },
    data: { status: 'COMPLETED' },
  });

  return {
    transaction,
    item,
    message: 'Purchase successful! The seller will contact you shortly.',
  };
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (
  transactionId: string,
  userId: string
): Promise<any> => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      buyer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatar: true,
        },
      },
      seller: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatar: true,
          businessName: true,
        },
      },
      listing: {
        include: {
          item: {
            include: {
              category: {
                select: {
                  id: true,
                  nameAr: true,
                  nameEn: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!transaction) {
    throw new NotFoundError('Transaction not found');
  }

  // Only buyer or seller can view the transaction
  if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
    throw new ForbiddenError('You do not have permission to view this transaction');
  }

  return transaction;
};

/**
 * Update transaction delivery status
 */
export const updateDeliveryStatus = async (
  transactionId: string,
  userId: string,
  deliveryStatus: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'RETURNED'
): Promise<any> => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      listing: true,
    },
  });

  if (!transaction) {
    throw new NotFoundError('Transaction not found');
  }

  // Only seller can update delivery status (except DELIVERED which buyer can also confirm)
  if (transaction.sellerId !== userId && deliveryStatus !== 'DELIVERED') {
    throw new ForbiddenError('Only the seller can update delivery status');
  }

  // Validate delivery status transitions
  if (deliveryStatus === 'SHIPPED' && transaction.deliveryStatus !== 'PENDING') {
    throw new BadRequestError('Can only ship from PENDING status');
  }

  if (deliveryStatus === 'DELIVERED' && transaction.deliveryStatus !== 'SHIPPED') {
    throw new BadRequestError('Can only deliver from SHIPPED status');
  }

  // Update transaction
  const updatedTransaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      deliveryStatus,
      ...(deliveryStatus === 'DELIVERED' && { completedAt: new Date() }),
    },
    include: {
      buyer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatar: true,
        },
      },
      seller: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatar: true,
          businessName: true,
        },
      },
      listing: {
        include: {
          item: {
            include: {
              category: {
                select: {
                  id: true,
                  nameAr: true,
                  nameEn: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // If transaction is delivered, update listing status
  if (deliveryStatus === 'DELIVERED') {
    await prisma.listing.update({
      where: { id: transaction.listingId },
      data: {
        status: 'COMPLETED',
      },
    });
  }

  return updatedTransaction;
};

/**
 * Confirm payment for a transaction
 */
export const confirmPayment = async (
  transactionId: string,
  userId: string
): Promise<any> => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    throw new NotFoundError('Transaction not found');
  }

  // Only buyer or seller can confirm payment
  if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
    throw new ForbiddenError('Only buyer or seller can confirm payment');
  }

  if (transaction.paymentStatus !== 'PENDING') {
    throw new BadRequestError('Payment already processed');
  }

  // Update transaction
  const updatedTransaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      paymentStatus: 'COMPLETED',
    },
    include: {
      buyer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatar: true,
        },
      },
      seller: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatar: true,
        },
      },
      listing: true,
    },
  });

  // TODO: Send notification to seller about payment

  return updatedTransaction;
};

/**
 * Mark transaction as shipped
 */
export const markAsShipped = async (
  transactionId: string,
  userId: string,
  trackingNumber?: string
): Promise<any> => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    throw new NotFoundError('Transaction not found');
  }

  // Only seller can mark as shipped
  if (transaction.sellerId !== userId) {
    throw new ForbiddenError('Only the seller can mark the transaction as shipped');
  }

  if (transaction.paymentStatus !== 'COMPLETED') {
    throw new BadRequestError('Can only ship transactions with completed payment');
  }

  if (transaction.deliveryStatus !== 'PENDING') {
    throw new BadRequestError('Transaction already shipped');
  }

  // Update transaction
  const updatedTransaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      deliveryStatus: 'SHIPPED',
      trackingNumber,
    },
    include: {
      buyer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatar: true,
        },
      },
      seller: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatar: true,
        },
      },
      listing: true,
    },
  });

  // TODO: Send notification to buyer about shipment

  return updatedTransaction;
};

/**
 * Mark transaction as delivered
 */
export const markAsDelivered = async (
  transactionId: string,
  userId: string
): Promise<any> => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    throw new NotFoundError('Transaction not found');
  }

  // Either buyer or seller can mark as delivered
  if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
    throw new ForbiddenError('You do not have permission to update this transaction');
  }

  if (transaction.deliveryStatus !== 'SHIPPED') {
    throw new BadRequestError('Can only mark transactions as delivered in SHIPPED status');
  }

  // Update transaction delivery status
  return await updateDeliveryStatus(transactionId, userId, 'DELIVERED');
};

/**
 * Cancel transaction (refund)
 */
export const cancelTransaction = async (
  transactionId: string,
  userId: string,
  reason: string
): Promise<any> => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    throw new NotFoundError('Transaction not found');
  }

  // Either buyer or seller can cancel
  if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
    throw new ForbiddenError('You do not have permission to cancel this transaction');
  }

  if (transaction.paymentStatus === 'COMPLETED' && transaction.deliveryStatus !== 'PENDING') {
    throw new BadRequestError('Cannot cancel transaction after shipment');
  }

  // Update transaction
  const updatedTransaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      paymentStatus: 'REFUNDED',
    },
    include: {
      buyer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatar: true,
        },
      },
      seller: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatar: true,
        },
      },
      listing: true,
    },
  });

  // TODO: Process refund if payment was made
  // TODO: Send notifications

  return updatedTransaction;
};

/**
 * Get user transactions
 */
export const getUserTransactions = async (
  userId: string,
  role?: 'buyer' | 'seller',
  paymentStatus?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED',
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResult<any>> => {
  const where: any = {};

  // Filter by role
  if (role === 'buyer') {
    where.buyerId = userId;
  } else if (role === 'seller') {
    where.sellerId = userId;
  } else {
    // Both buyer and seller
    where.OR = [{ buyerId: userId }, { sellerId: userId }];
  }

  // Filter by payment status
  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }

  const skip = (page - 1) * limit;

  const total = await prisma.transaction.count({ where });

  const transactions = await prisma.transaction.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      buyer: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      seller: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          businessName: true,
        },
      },
      listing: {
        include: {
          item: {
            select: {
              id: true,
              title: true,
              images: true,
              condition: true,
            },
          },
        },
      },
    },
  });

  const totalPages = Math.ceil(total / limit);

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
};
