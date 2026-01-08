import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import prisma from '../lib/prisma';
import { createNotification } from './notification.service';
import { Prisma } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Transaction = any;

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

// Use any for complex relations - types are inferred at runtime
type TransactionWithRelations = {
  id: string;
  buyer: { id: string; fullName: string | null; email: string | null; phone: string; avatar: string | null };
  seller: { id: string; fullName: string | null; email: string | null; phone: string; avatar: string | null; businessName: string | null };
  listing: {
    item: {
      category: { id: string; nameAr: string; nameEn: string } | null;
    } & Record<string, unknown>;
  } & Record<string, unknown>;
} & Record<string, unknown>;

/**
 * Create a purchase transaction (order)
 */
export const createPurchase = async (
  buyerId: string,
  purchaseData: CreatePurchaseData
): Promise<{ transaction: any; item: any; message: string }> => {
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

  // Send notification to seller about new order
  await createNotification({
    userId: listing.item.sellerId,
    type: 'ORDER_RECEIVED',
    title: 'طلب شراء جديد! 🛒',
    message: `لديك طلب شراء جديد للمنتج "${listing.item.title}"`,
    priority: 'HIGH',
    entityType: 'TRANSACTION',
    entityId: transaction.id,
    actionUrl: `/transactions/${transaction.id}`,
    actionText: 'عرض الطلب',
  });

  return {
    transaction,
    item: listing.item,
    message: 'Purchase created successfully! The seller has been notified.',
  };
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
): Promise<{ transaction: any; item: any; message: string }> => {
  console.log('[buyItemDirectly] Starting with:', { buyerId, itemId: purchaseData.itemId });

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
    console.log('[buyItemDirectly] Item not found:', purchaseData.itemId);
    throw new NotFoundError('Item not found');
  }

  console.log('[buyItemDirectly] Item found:', { id: item.id, status: item.status, sellerId: item.sellerId });

  // Check item is available
  if (item.status !== 'ACTIVE') {
    console.log('[buyItemDirectly] Item not active:', item.status);
    throw new BadRequestError('Item is not available for purchase');
  }

  // Check buyer is not the seller
  if (item.sellerId === buyerId) {
    console.log('[buyItemDirectly] Buyer is seller');
    throw new BadRequestError('You cannot buy your own item');
  }

  console.log('[buyItemDirectly] Starting Prisma transaction...');

  // Use a transaction to ensure atomicity and prevent race conditions
  let transactionResult: { transaction: any; listing: any };
  try {
    transactionResult = await prisma.$transaction(async (tx) => {
      console.log('[buyItemDirectly] Inside transaction, checking item status...');

    // Double-check item is still available (with row-level lock)
    const currentItem = await tx.item.findUnique({
      where: { id: item.id },
      select: { status: true },
    });

    if (!currentItem || currentItem.status !== 'ACTIVE') {
      console.log('[buyItemDirectly] Item no longer active in transaction:', currentItem?.status);
      throw new BadRequestError('Item is no longer available for purchase');
    }

    console.log('[buyItemDirectly] Finding/creating listing...');

    // Create or find a listing for this item
    let listingRecord = await tx.listing.findFirst({
      where: { itemId: item.id, status: 'ACTIVE' },
    });

    if (!listingRecord) {
      console.log('[buyItemDirectly] Creating new listing...');
      // Create a listing automatically
      listingRecord = await tx.listing.create({
        data: {
          itemId: item.id,
          userId: item.sellerId,
          listingType: 'DIRECT_SALE',
          price: item.estimatedValue,
          currency: 'EGP',
          status: 'ACTIVE',
        },
      });
      console.log('[buyItemDirectly] Listing created:', listingRecord.id);
    } else {
      console.log('[buyItemDirectly] Found existing listing:', listingRecord.id);
    }

    // Update item status to SOLD first (prevents other buyers)
    console.log('[buyItemDirectly] Updating item status to SOLD...');
    await tx.item.update({
      where: { id: item.id },
      data: { status: 'SOLD' },
    });

    // Update listing status
    console.log('[buyItemDirectly] Updating listing status to COMPLETED...');
    await tx.listing.update({
      where: { id: listingRecord.id },
      data: { status: 'COMPLETED' },
    });

    // Create the transaction record
    console.log('[buyItemDirectly] Creating transaction record...');
    const txRecord = await tx.transaction.create({
      data: {
        listingId: listingRecord.id,
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

    console.log('[buyItemDirectly] Transaction record created:', txRecord.id);
      return { transaction: txRecord, listing: listingRecord };
    });
  } catch (dbError: any) {
    console.error('[buyItemDirectly] Database transaction error:', {
      message: dbError?.message,
      code: dbError?.code,
      meta: dbError?.meta,
      stack: dbError?.stack,
    });
    throw dbError;
  }

  const { transaction, listing } = transactionResult;
  console.log('[buyItemDirectly] Prisma transaction completed successfully');

  // Send notifications (non-critical - don't fail purchase if notifications fail)
  try {
    // Send notification to seller about the sale
    await createNotification({
      userId: item.sellerId,
      type: 'ITEM_SOLD',
      title: 'تم بيع منتجك! 🎉',
      message: `تم شراء "${item.title}" - يرجى التواصل مع المشتري لإتمام التسليم`,
      priority: 'HIGH',
      entityType: 'TRANSACTION',
      entityId: transaction.id,
      actionUrl: `/transactions/${transaction.id}`,
      actionText: 'عرض التفاصيل',
    });

    // Send notification to buyer confirming purchase
    await createNotification({
      userId: buyerId,
      type: 'ORDER_CONFIRMED',
      title: 'تم تأكيد طلبك! ✅',
      message: `تم شراء "${item.title}" بنجاح - سيتواصل معك البائع قريباً`,
      priority: 'HIGH',
      entityType: 'TRANSACTION',
      entityId: transaction.id,
      actionUrl: `/transactions/${transaction.id}`,
      actionText: 'تتبع الطلب',
    });
  } catch (notificationError) {
    console.error('[buyItemDirectly] Notification error (non-critical):', notificationError);
    // Don't throw - notifications are non-critical
  }

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
): Promise<TransactionWithRelations> => {
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
): Promise<Transaction> => {
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

  // If transaction is delivered, update listing status and send notifications
  if (deliveryStatus === 'DELIVERED') {
    await prisma.listing.update({
      where: { id: transaction.listingId },
      data: {
        status: 'COMPLETED',
      },
    });

    // Get item details for notification
    const listing = await prisma.listing.findUnique({
      where: { id: transaction.listingId },
      include: { item: true },
    });

    const itemTitle = listing?.item?.title || 'المنتج';

    // Notify seller that delivery is confirmed
    await createNotification({
      userId: updatedTransaction.sellerId,
      type: 'ORDER_DELIVERED',
      title: 'تم تسليم الطلب بنجاح! ✅',
      message: `تم تأكيد استلام "${itemTitle}" - شكراً لك!`,
      priority: 'HIGH',
      entityType: 'TRANSACTION',
      entityId: transactionId,
      actionUrl: `/transactions/${transactionId}`,
      actionText: 'عرض التفاصيل',
    });

    // Notify buyer that transaction is complete
    await createNotification({
      userId: updatedTransaction.buyerId,
      type: 'ORDER_COMPLETED',
      title: 'اكتملت المعاملة! 🎉',
      message: `تم إكمال معاملة "${itemTitle}" بنجاح - نتمنى لك تجربة سعيدة!`,
      priority: 'MEDIUM',
      entityType: 'TRANSACTION',
      entityId: transactionId,
      actionUrl: `/transactions/${transactionId}`,
      actionText: 'تقييم البائع',
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
      listing: {
        include: {
          item: true,
        },
      },
    },
  });

  // Send notification to seller about payment confirmation
  await createNotification({
    userId: updatedTransaction.sellerId,
    type: 'PAYMENT_RECEIVED',
    title: 'تم استلام الدفع! 💰',
    message: `تم تأكيد دفع "${updatedTransaction.listing.item.title}" - يرجى شحن المنتج`,
    priority: 'HIGH',
    entityType: 'TRANSACTION',
    entityId: transactionId,
    actionUrl: `/transactions/${transactionId}`,
    actionText: 'شحن المنتج',
  });

  // Send notification to buyer confirming payment
  await createNotification({
    userId: updatedTransaction.buyerId,
    type: 'PAYMENT_CONFIRMED',
    title: 'تم تأكيد الدفع! ✅',
    message: `تم تأكيد دفعك لـ "${updatedTransaction.listing.item.title}" - سيتم الشحن قريباً`,
    priority: 'MEDIUM',
    entityType: 'TRANSACTION',
    entityId: transactionId,
    actionUrl: `/transactions/${transactionId}`,
    actionText: 'تتبع الطلب',
  });

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
      listing: {
        include: {
          item: true,
        },
      },
    },
  });

  // Send notification to buyer about shipment
  await createNotification({
    userId: updatedTransaction.buyerId,
    type: 'ORDER_SHIPPED',
    title: 'تم شحن طلبك! 📦',
    message: `تم شحن "${updatedTransaction.listing.item.title}"${trackingNumber ? ` - رقم التتبع: ${trackingNumber}` : ''}`,
    priority: 'HIGH',
    entityType: 'TRANSACTION',
    entityId: transactionId,
    actionUrl: `/transactions/${transactionId}`,
    actionText: 'تتبع الشحنة',
  });

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
      listing: {
        include: {
          item: true,
        },
      },
    },
  });

  const itemTitle = updatedTransaction.listing.item.title;
  const cancelledBy = userId === transaction.buyerId ? 'المشتري' : 'البائع';

  // Notify the other party about cancellation
  const otherUserId = userId === transaction.buyerId ? transaction.sellerId : transaction.buyerId;

  await createNotification({
    userId: otherUserId,
    type: 'ORDER_CANCELLED',
    title: 'تم إلغاء الطلب ❌',
    message: `تم إلغاء طلب "${itemTitle}" بواسطة ${cancelledBy}${reason ? `: ${reason}` : ''}`,
    priority: 'HIGH',
    entityType: 'TRANSACTION',
    entityId: transactionId,
    actionUrl: `/transactions/${transactionId}`,
    actionText: 'عرض التفاصيل',
  });

  // Confirm cancellation to the user who cancelled
  await createNotification({
    userId: userId,
    type: 'ORDER_CANCELLED',
    title: 'تم إلغاء الطلب',
    message: `تم إلغاء طلبك لـ "${itemTitle}" بنجاح`,
    priority: 'MEDIUM',
    entityType: 'TRANSACTION',
    entityId: transactionId,
    actionUrl: `/transactions/${transactionId}`,
    actionText: 'عرض التفاصيل',
  });

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
          phone: true,
          email: true,
          avatar: true,
        },
      },
      seller: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
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

  const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

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
