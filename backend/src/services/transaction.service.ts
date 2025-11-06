import { PrismaClient, TransactionStatus, PaymentMethod } from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';

const prisma = new PrismaClient();

// Types
interface CreatePurchaseData {
  listingId: string;
  quantity: number;
  paymentMethod: PaymentMethod;
  shippingAddress: string;
  notes?: string;
}

interface UpdateTransactionStatusData {
  status: TransactionStatus;
  notes?: string;
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

  if (listing.type !== 'SALE') {
    throw new BadRequestError('Listing is not for direct sale');
  }

  // Prevent sellers from buying their own items
  if (listing.item.sellerId === buyerId) {
    throw new BadRequestError('You cannot purchase your own items');
  }

  // Validate quantity
  if (purchaseData.quantity > listing.quantity) {
    throw new BadRequestError(
      `Requested quantity (${purchaseData.quantity}) exceeds available quantity (${listing.quantity})`
    );
  }

  // Calculate total amount
  const totalAmount = listing.price * purchaseData.quantity;

  // Create transaction
  const transaction = await prisma.transaction.create({
    data: {
      listingId: listing.id,
      buyerId,
      sellerId: listing.item.sellerId,
      itemId: listing.itemId,
      quantity: purchaseData.quantity,
      unitPrice: listing.price,
      totalAmount,
      paymentMethod: purchaseData.paymentMethod,
      shippingAddress: purchaseData.shippingAddress,
      status: TransactionStatus.PENDING,
      notes: purchaseData.notes,
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
          accountType: true,
          businessName: true,
        },
      },
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
      listing: {
        select: {
          id: true,
          type: true,
          status: true,
        },
      },
    },
  });

  // TODO: Integrate with payment gateway here
  // For now, we'll just create the transaction in PENDING status

  return transaction;
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
          accountType: true,
          businessName: true,
        },
      },
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
      listing: {
        select: {
          id: true,
          type: true,
          status: true,
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
 * Update transaction status
 */
export const updateTransactionStatus = async (
  transactionId: string,
  userId: string,
  updateData: UpdateTransactionStatusData
): Promise<any> => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      listing: true,
      item: true,
    },
  });

  if (!transaction) {
    throw new NotFoundError('Transaction not found');
  }

  // Only buyer or seller can update the transaction
  if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
    throw new ForbiddenError('You do not have permission to update this transaction');
  }

  // Validate status transitions
  const { status } = updateData;

  // Validate status transition logic
  if (status === 'CANCELLED') {
    if (!['PENDING', 'CONFIRMED', 'PAYMENT_PENDING'].includes(transaction.status)) {
      throw new BadRequestError(
        'Can only cancel transactions in PENDING, CONFIRMED, or PAYMENT_PENDING status'
      );
    }
  }

  if (status === 'CONFIRMED') {
    if (transaction.status !== 'PENDING') {
      throw new BadRequestError('Can only confirm transactions in PENDING status');
    }
    // Only seller can confirm
    if (transaction.sellerId !== userId) {
      throw new ForbiddenError('Only the seller can confirm the transaction');
    }
  }

  if (status === 'SHIPPED') {
    if (transaction.status !== 'PAID') {
      throw new BadRequestError('Can only ship transactions in PAID status');
    }
    // Only seller can mark as shipped
    if (transaction.sellerId !== userId) {
      throw new ForbiddenError('Only the seller can mark the transaction as shipped');
    }
  }

  if (status === 'DELIVERED') {
    if (transaction.status !== 'SHIPPED') {
      throw new BadRequestError('Can only deliver transactions in SHIPPED status');
    }
  }

  // Update transaction
  const updatedTransaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: updateData.status,
      notes: updateData.notes,
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
          accountType: true,
          businessName: true,
        },
      },
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
      listing: {
        select: {
          id: true,
          type: true,
          status: true,
        },
      },
    },
  });

  // If transaction is completed or delivered, update listing quantity
  if (status === 'DELIVERED') {
    const listing = await prisma.listing.findUnique({
      where: { id: transaction.listingId },
    });

    if (listing) {
      const newQuantity = listing.quantity - transaction.quantity;

      // Update listing quantity
      await prisma.listing.update({
        where: { id: listing.id },
        data: {
          quantity: newQuantity,
          // Mark as sold if quantity reaches 0
          ...(newQuantity === 0 && { status: 'SOLD' }),
        },
      });

      // Update item quantity
      await prisma.item.update({
        where: { id: transaction.itemId },
        data: {
          quantity: {
            decrement: transaction.quantity,
          },
        },
      });
    }
  }

  return updatedTransaction;
};

/**
 * Confirm payment for a transaction
 */
export const confirmPayment = async (
  transactionId: string,
  userId: string,
  paymentReference?: string
): Promise<any> => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    throw new NotFoundError('Transaction not found');
  }

  // Only buyer can confirm payment
  if (transaction.buyerId !== userId) {
    throw new ForbiddenError('Only the buyer can confirm payment');
  }

  if (transaction.status !== 'CONFIRMED' && transaction.status !== 'PAYMENT_PENDING') {
    throw new BadRequestError(
      'Can only confirm payment for transactions in CONFIRMED or PAYMENT_PENDING status'
    );
  }

  // Update transaction
  const updatedTransaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: TransactionStatus.PAID,
      paymentReference,
      paidAt: new Date(),
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
      item: true,
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

  if (transaction.status !== 'PAID') {
    throw new BadRequestError('Can only ship transactions in PAID status');
  }

  // Update transaction
  const updatedTransaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: TransactionStatus.SHIPPED,
      trackingNumber,
      shippedAt: new Date(),
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
      item: true,
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

  if (transaction.status !== 'SHIPPED') {
    throw new BadRequestError('Can only mark transactions as delivered in SHIPPED status');
  }

  // Update transaction and listing/item quantities
  return await updateTransactionStatus(transactionId, userId, {
    status: TransactionStatus.DELIVERED,
  });
};

/**
 * Cancel transaction
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

  if (!['PENDING', 'CONFIRMED', 'PAYMENT_PENDING'].includes(transaction.status)) {
    throw new BadRequestError(
      'Can only cancel transactions in PENDING, CONFIRMED, or PAYMENT_PENDING status'
    );
  }

  // Update transaction
  const updatedTransaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: TransactionStatus.CANCELLED,
      notes: reason,
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
      item: true,
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
  status?: TransactionStatus,
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

  // Filter by status
  if (status) {
    where.status = status;
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
          accountType: true,
          businessName: true,
        },
      },
      item: {
        select: {
          id: true,
          titleAr: true,
          titleEn: true,
          images: true,
          condition: true,
        },
      },
      listing: {
        select: {
          id: true,
          type: true,
          status: true,
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
