import logger from '../lib/logger';
import { OrderStatus } from '../types/prisma-enums';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { clearCart, getCart } from './cart.service';
import { createNotification } from './notification.service';
import prisma from '../lib/prisma';

// Egyptian governorates for shipping calculations
const EGYPTIAN_GOVERNORATES = [
  'Cairo', 'Giza', 'Alexandria', 'Dakahlia', 'Red Sea', 'Beheira', 'Fayoum',
  'Gharbiya', 'Ismailia', 'Menofia', 'Minya', 'Qaliubiya', 'New Valley',
  'Suez', 'Aswan', 'Assiut', 'Beni Suef', 'Port Said', 'Damietta', 'Sharkia',
  'South Sinai', 'Kafr El Sheikh', 'Matrouh', 'Luxor', 'Qena', 'North Sinai', 'Sohag'
];

// Shipping costs by governorate
const SHIPPING_COSTS: Record<string, number> = {
  'Cairo': 30,
  'Giza': 30,
  'Alexandria': 45,
  'default': 60,
};

/**
 * Generate order number
 */
const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `XCH-${timestamp}-${random}`;
};

/**
 * Calculate shipping cost
 */
export const calculateShippingCost = (governorate: string): number => {
  return SHIPPING_COSTS[governorate] || SHIPPING_COSTS['default'];
};

/**
 * Get shipping addresses for user
 */
export const getShippingAddresses = async (userId: string) => {
  return prisma.shippingAddress.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
};

/**
 * Create shipping address
 */
export const createShippingAddress = async (
  userId: string,
  data: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    governorate: string;
    postalCode?: string;
    isDefault?: boolean;
  }
) => {
  // If setting as default, unset other defaults
  if (data.isDefault) {
    await prisma.shippingAddress.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  return prisma.shippingAddress.create({
    data: {
      userId,
      ...data,
    },
  });
};

/**
 * Update shipping address
 */
export const updateShippingAddress = async (
  userId: string,
  addressId: string,
  data: Partial<{
    fullName: string;
    phone: string;
    address: string;
    city: string;
    governorate: string;
    postalCode: string;
    isDefault: boolean;
  }>
) => {
  const address = await prisma.shippingAddress.findFirst({
    where: { id: addressId, userId },
  });

  if (!address) {
    throw new NotFoundError('Shipping address not found');
  }

  // If setting as default, unset other defaults
  if (data.isDefault) {
    await prisma.shippingAddress.updateMany({
      where: { userId, id: { not: addressId } },
      data: { isDefault: false },
    });
  }

  return prisma.shippingAddress.update({
    where: { id: addressId },
    data,
  });
};

/**
 * Delete shipping address
 */
export const deleteShippingAddress = async (userId: string, addressId: string) => {
  const address = await prisma.shippingAddress.findFirst({
    where: { id: addressId, userId },
  });

  if (!address) {
    throw new NotFoundError('Shipping address not found');
  }

  await prisma.shippingAddress.delete({
    where: { id: addressId },
  });

  return { success: true };
};

/**
 * Create order from cart
 * Accepts either shippingAddressId OR shippingAddress object
 * Uses transaction with row-level locking to prevent race conditions
 */
export const createOrder = async (
  userId: string,
  data: {
    shippingAddressId?: string;
    shippingAddress?: {
      fullName: string;
      phone: string;
      street: string;
      buildingName?: string;
      buildingNumber?: string;
      floor?: string;
      apartmentNumber?: string;
      landmark?: string;
      city: string;
      governorate: string;
    };
    paymentMethod: string;
    notes?: string;
  }
) => {
  try {
    logger.info('[createOrder] Starting order creation for user:', userId);

    // Get cart first (outside transaction for validation)
    const cart = await getCart(userId);
    logger.info('[createOrder] Cart fetched, items count:', cart.items.length);

    if (cart.items.length === 0) {
      throw new BadRequestError('السلة فارغة');
    }

    // Log cart items for debugging
    cart.items.forEach((item, index) => {
      logger.info(`[createOrder] Cart item ${index}:`, {
        listingId: item.listingId,
        userId: item.listing?.userId,
        price: item.listing?.price,
        quantity: item.quantity,
      });
    });

    // Validate all cart items have valid listing data
    for (const item of cart.items) {
      if (!item.listing?.userId) {
        logger.error('[createOrder] Missing userId for listing:', item.listingId);
        throw new BadRequestError('بيانات المنتج غير مكتملة. يرجى إزالة المنتج وإضافته مرة أخرى.');
      }
    }

    // Extract listing IDs for verification
    const listingIds = cart.items.map(item => item.listingId);
    logger.info('[createOrder] Listing IDs:', listingIds);

    // Use transaction with serializable isolation to prevent race conditions
    const order = await prisma.$transaction(async (tx) => {
    // Verify listings are still available using Prisma query
    const listings = await tx.listing.findMany({
      where: { id: { in: listingIds } },
      include: { item: { select: { title: true } } },
    });

    logger.info('[createOrder] Found listings:', listings.length);

    // Verify all listings are still available
    for (const listing of listings) {
      if (listing.status !== 'ACTIVE') {
        throw new BadRequestError(`المنتج "${listing.item?.title}" لم يعد متاحاً`);
      }
    }

    // Ensure all cart items have valid listings
    if (listings.length !== listingIds.length) {
      throw new BadRequestError('بعض المنتجات لم تعد متاحة');
    }

    // Handle shipping address
    let shippingAddress;
    let shippingAddressId = data.shippingAddressId;

    if (data.shippingAddress && !data.shippingAddressId) {
      const addressData = data.shippingAddress;
      // Combine all address parts into a single address field
      // (Individual columns like street, buildingName, etc. may not exist in DB yet)
      const combinedAddress = [
        addressData.street,
        addressData.buildingName ? `${addressData.buildingName}` : '',
        addressData.buildingNumber ? `مبنى ${addressData.buildingNumber}` : '',
        addressData.floor ? `الدور ${addressData.floor}` : '',
        addressData.apartmentNumber ? `شقة ${addressData.apartmentNumber}` : '',
        addressData.landmark || '',
      ].filter(Boolean).join('، ');

      const newAddress = await tx.shippingAddress.create({
        data: {
          userId,
          fullName: addressData.fullName,
          phone: addressData.phone,
          address: combinedAddress,
          city: addressData.city,
          governorate: addressData.governorate,
          isDefault: false,
        },
      });
      shippingAddress = newAddress;
      shippingAddressId = newAddress.id;
    } else if (data.shippingAddressId) {
      shippingAddress = await tx.shippingAddress.findFirst({
        where: { id: data.shippingAddressId, userId },
      });

      if (!shippingAddress) {
        throw new NotFoundError('Shipping address not found');
      }
    } else {
      throw new BadRequestError('Either shippingAddressId or shippingAddress is required');
    }

    // Calculate totals
    const subtotal = cart.subtotal;
    const shippingCost = calculateShippingCost(shippingAddress.governorate);
    const total = subtotal + shippingCost;

    // Create order
    const newOrder = await tx.order.create({
      data: {
        userId,
        orderNumber: generateOrderNumber(),
        status: OrderStatus.PENDING,
        subtotal,
        shippingCost,
        total,
        shippingAddressId: shippingAddressId,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        items: {
          create: cart.items.map(item => ({
            listingId: item.listingId,
            sellerId: item.listing.userId,
            quantity: item.quantity,
            price: item.listing.price || 0,
          })),
        },
      },
      include: {
        items: {
          include: {
            listing: {
              include: {
                item: true,
              },
            },
          },
        },
        shippingAddress: true,
      },
    });

    // Mark all listings as COMPLETED to prevent double-selling
    await tx.listing.updateMany({
      where: { id: { in: listingIds } },
      data: { status: 'COMPLETED' },
    });

    // Clear cart items within transaction
    await tx.cartItem.deleteMany({
      where: { cart: { userId } },
    });

    return newOrder;
  }, {
    // Use serializable isolation for strongest consistency
    isolationLevel: 'Serializable',
    // Set timeout to prevent long-running locks
    timeout: 10000,
  });

  // Send notifications outside transaction (non-critical)
  try {
    // Send notification to buyer confirming order
    await createNotification({
      userId: userId,
      type: 'TRANSACTION_PAYMENT_RECEIVED',
      title: 'تم إنشاء طلبك بنجاح',
      message: `تم إنشاء طلبك رقم ${order.orderNumber} وهو قيد المعالجة`,
      priority: 'HIGH',
      entityType: 'ORDER',
      entityId: order.id,
      actionUrl: `/dashboard/orders`,
      actionText: 'عرض الطلب',
    });

    // Send notifications to all sellers
    const sellerIds = [...new Set(order.items.map(item => item.sellerId as string))];
    for (const sellerId of sellerIds) {
      const sellerItems = order.items.filter(item => item.sellerId === sellerId);
      const itemTitles = sellerItems.map(item => item.listing.item.title).join('، ');

      await createNotification({
        userId: sellerId as string,
        type: 'ITEM_SOLD',
        title: 'تم بيع سلعتك! 🎉',
        message: `تم بيع: ${itemTitles}`,
        priority: 'HIGH',
        entityType: 'ORDER',
        entityId: order.id,
        actionUrl: `/dashboard/sales`,
        actionText: 'عرض الطلبات الواردة',
      });
    }
  } catch (notificationError) {
    // Log but don't fail the order if notifications fail
    logger.error('Failed to send order notifications:', notificationError);
  }

  return order;
  } catch (error: any) {
    logger.error('[createOrder] Error:', error?.message, error?.stack);
    // Re-throw BadRequestError and NotFoundError as-is
    if (error instanceof BadRequestError || error instanceof NotFoundError) {
      throw error;
    }
    // For other errors, throw a more descriptive message
    throw new BadRequestError(`فشل في إنشاء الطلب: ${error?.message || 'خطأ غير متوقع'}`);
  }
};

/**
 * Get user's orders
 */
export const getMyOrders = async (
  userId: string,
  page: number = 1,
  limit: number = 20,
  status?: OrderStatus
) => {
  const where: any = { userId };
  if (status) {
    where.status = status;
  }

  const skip = (page - 1) * limit;
  const total = await prisma.order.count({ where });

  const orders = await prisma.order.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          listing: {
            include: {
              item: {
                select: {
                  id: true,
                  title: true,
                  images: true,
                },
              },
            },
          },
        },
      },
      shippingAddress: true,
    },
  });

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
      hasMore: page * limit < total,
    },
  };
};

/**
 * Get order by ID
 */
export const getOrderById = async (userId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: {
        include: {
          listing: {
            include: {
              item: true,
            },
          },
        },
      },
      shippingAddress: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  return order;
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  userId?: string
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // If user is provided, check ownership
  if (userId && order.userId !== userId) {
    throw new ForbiddenError('You do not have permission to update this order');
  }

  const updateData: any = { status };

  // Set timestamps based on status
  if (status === OrderStatus.PAID) {
    updateData.paidAt = new Date();
  } else if (status === OrderStatus.SHIPPED) {
    updateData.shippedAt = new Date();
  } else if (status === OrderStatus.DELIVERED) {
    updateData.deliveredAt = new Date();
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      items: {
        include: {
          listing: {
            include: {
              item: true,
            },
          },
        },
      },
      shippingAddress: true,
    },
  });

  // Send notifications based on status change
  const notificationMessages: Record<string, { title: string; message: string; type: string }> = {
    [OrderStatus.PAID]: {
      title: 'تم تأكيد الدفع',
      message: `تم تأكيد دفع طلبك رقم ${updatedOrder.orderNumber}`,
      type: 'TRANSACTION_PAYMENT_RECEIVED',
    },
    [OrderStatus.SHIPPED]: {
      title: 'تم شحن طلبك 🚚',
      message: `طلبك رقم ${updatedOrder.orderNumber} في الطريق إليك`,
      type: 'TRANSACTION_SHIPPED',
    },
    [OrderStatus.DELIVERED]: {
      title: 'تم التوصيل ✅',
      message: `تم توصيل طلبك رقم ${updatedOrder.orderNumber} بنجاح`,
      type: 'TRANSACTION_DELIVERED',
    },
  };

  const notification = notificationMessages[status];
  if (notification) {
    await createNotification({
      userId: updatedOrder.userId,
      type: notification.type as any,
      title: notification.title,
      message: notification.message,
      priority: 'HIGH',
      entityType: 'ORDER',
      entityId: updatedOrder.id,
      actionUrl: `/dashboard/orders`,
      actionText: 'عرض الطلب',
    });
  }

  return updatedOrder;
};

/**
 * Cancel order
 */
export const cancelOrder = async (userId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  if (order.status !== OrderStatus.PENDING) {
    throw new BadRequestError('Only pending orders can be cancelled');
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.CANCELLED },
  });
};

/**
 * Get order by order number
 */
export const getOrderByNumber = async (orderNumber: string) => {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          listing: {
            include: {
              item: true,
            },
          },
        },
      },
      shippingAddress: true,
    },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  return order;
};

/**
 * Update order payment status
 */
export const updateOrderPaymentStatus = async (
  orderId: string,
  paymentData:
    | 'PENDING'
    | 'PAID'
    | 'FAILED'
    | 'REFUNDED'
    | {
        paymentMethod?: string;
        paymentTransactionId?: string;
        paymentStatus?: string;
        paidAt?: Date;
        collectedAmount?: number;
        collectorId?: string;
      },
  userId?: string
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // If user is provided, check ownership
  if (userId && order.userId !== userId) {
    throw new ForbiddenError('You do not have permission to update this order');
  }

  const updateData: any = {};

  // Handle both string and object formats
  let paymentStatus: string;
  if (typeof paymentData === 'string') {
    paymentStatus = paymentData;
  } else {
    paymentStatus = paymentData.paymentStatus || 'PENDING';
    if (paymentData.paymentMethod) updateData.paymentMethod = paymentData.paymentMethod;
    if (paymentData.paymentTransactionId) updateData.paymentId = paymentData.paymentTransactionId;
    if (paymentData.paidAt) updateData.paidAt = paymentData.paidAt;
    if (paymentData.collectedAmount !== undefined) updateData.total = paymentData.collectedAmount;
    if (paymentData.collectorId) updateData.notes = `Collected by: ${paymentData.collectorId}`;
  }

  // Set timestamps based on payment status
  if (paymentStatus === 'PAID') {
    updateData.status = OrderStatus.PAID;
    if (!updateData.paidAt) {
      updateData.paidAt = new Date();
    }
  } else if (paymentStatus === 'FAILED') {
    updateData.status = OrderStatus.CANCELLED;
  } else if (paymentStatus === 'REFUNDED') {
    updateData.status = OrderStatus.REFUNDED;
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      items: {
        include: {
          listing: {
            include: {
              item: true,
            },
          },
        },
      },
      shippingAddress: true,
    },
  });

  return updatedOrder;
};

/**
 * Get Egyptian governorates
 */
export const getGovernorates = () => {
  return EGYPTIAN_GOVERNORATES.map(name => ({
    name,
    shippingCost: calculateShippingCost(name),
  }));
};

/**
 * Create order from auction win
 * Creates an order for a user who won an auction
 */
export const createAuctionOrder = async (
  userId: string,
  data: {
    auctionId: string;
    shippingAddressId?: string;
    shippingAddress?: {
      fullName: string;
      phone: string;
      street: string;
      buildingName?: string;
      buildingNumber?: string;
      floor?: string;
      apartmentNumber?: string;
      landmark?: string;
      city: string;
      governorate: string;
    };
    paymentMethod: string;
    notes?: string;
  }
) => {
  // Get auction with related data
  const auction = await prisma.auction.findUnique({
    where: { id: data.auctionId },
    include: {
      listing: {
        include: {
          item: {
            include: {
              seller: true,
            },
          },
        },
      },
    },
  });

  if (!auction) {
    throw new NotFoundError('Auction not found');
  }

  // Verify user is the winner
  if (auction.winnerId !== userId) {
    throw new ForbiddenError('You are not the winner of this auction');
  }

  // Check auction status
  if (auction.status !== 'COMPLETED' && auction.status !== 'ENDED') {
    throw new BadRequestError('Auction has not ended yet');
  }

  // Check if order already exists for this auction
  const existingOrder = await prisma.order.findFirst({
    where: {
      userId,
      items: {
        some: {
          listingId: auction.listingId,
        },
      },
    },
  });

  if (existingOrder) {
    throw new BadRequestError('Order already exists for this auction');
  }

  // Create order in transaction
  const order = await prisma.$transaction(async (tx) => {
    // Handle shipping address
    let shippingAddress;
    let shippingAddressId = data.shippingAddressId;

    if (data.shippingAddress && !data.shippingAddressId) {
      const addressData = data.shippingAddress;
      // Combine all address parts into a single address field
      const combinedAddress = [
        addressData.street,
        addressData.buildingName ? `${addressData.buildingName}` : '',
        addressData.buildingNumber ? `مبنى ${addressData.buildingNumber}` : '',
        addressData.floor ? `الدور ${addressData.floor}` : '',
        addressData.apartmentNumber ? `شقة ${addressData.apartmentNumber}` : '',
        addressData.landmark || '',
      ].filter(Boolean).join('، ');

      const newAddress = await tx.shippingAddress.create({
        data: {
          userId,
          fullName: addressData.fullName,
          phone: addressData.phone,
          address: combinedAddress,
          city: addressData.city,
          governorate: addressData.governorate,
          isDefault: false,
        },
      });
      shippingAddress = newAddress;
      shippingAddressId = newAddress.id;
    } else if (data.shippingAddressId) {
      shippingAddress = await tx.shippingAddress.findFirst({
        where: { id: data.shippingAddressId, userId },
      });

      if (!shippingAddress) {
        throw new NotFoundError('Shipping address not found');
      }
    } else {
      throw new BadRequestError('Either shippingAddressId or shippingAddress is required');
    }

    // Calculate totals - use currentPrice (winning bid amount)
    const subtotal = auction.currentPrice;
    const shippingCost = calculateShippingCost(shippingAddress.governorate);
    const total = subtotal + shippingCost;

    // Create order
    const newOrder = await tx.order.create({
      data: {
        userId,
        orderNumber: generateOrderNumber(),
        status: OrderStatus.PENDING,
        subtotal,
        shippingCost,
        total,
        shippingAddressId: shippingAddressId,
        paymentMethod: data.paymentMethod,
        notes: data.notes || `طلب من مزاد رقم ${auction.id}`,
        items: {
          create: {
            listingId: auction.listingId,
            sellerId: auction.listing.item.sellerId,
            quantity: 1,
            price: auction.currentPrice,
          },
        },
      },
      include: {
        items: {
          include: {
            listing: {
              include: {
                item: true,
              },
            },
          },
        },
        shippingAddress: true,
      },
    });

    // Update auction transaction (if exists) with order reference
    await tx.transaction.updateMany({
      where: {
        listingId: auction.listingId,
        buyerId: userId,
      },
      data: {
        paymentStatus: 'PENDING',
      },
    });

    return newOrder;
  });

  // Send notifications outside transaction
  try {
    // Notify buyer
    await createNotification({
      userId: userId,
      type: 'TRANSACTION_PAYMENT_RECEIVED',
      title: 'تم إنشاء طلب المزاد بنجاح',
      message: `تم إنشاء طلبك رقم ${order.orderNumber} للمنتج الذي فزت به في المزاد`,
      priority: 'HIGH',
      entityType: 'ORDER',
      entityId: order.id,
      actionUrl: `/dashboard/orders`,
      actionText: 'عرض الطلب',
    });

    // Notify seller
    await createNotification({
      userId: auction.listing.item.sellerId,
      type: 'ITEM_SOLD',
      title: 'طلب جديد من مزاد! 🎉',
      message: `الفائز بمزاد "${auction.listing.item.title}" قام بإتمام الطلب`,
      priority: 'HIGH',
      entityType: 'ORDER',
      entityId: order.id,
      actionUrl: `/dashboard/sales`,
      actionText: 'عرض الطلبات الواردة',
    });
  } catch (notificationError) {
    logger.error('Failed to send auction order notifications:', notificationError);
  }

  return order;
};

/**
 * Get orders where user is a seller
 * Shows all orders containing items sold by this user
 */
export const getSellerOrders = async (
  sellerId: string,
  page: number = 1,
  limit: number = 20,
  status?: OrderStatus
) => {
  const skip = (page - 1) * limit;

  // Find all orders that contain items sold by this seller
  const whereClause: any = {
    items: {
      some: {
        sellerId: sellerId,
      },
    },
  };

  if (status) {
    whereClause.status = status;
  }

  const total = await prisma.order.count({ where: whereClause });

  const orders = await prisma.order.findMany({
    where: whereClause,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        where: {
          sellerId: sellerId,
        },
        include: {
          listing: {
            include: {
              item: {
                select: {
                  id: true,
                  title: true,
                  images: true,
                },
              },
            },
          },
        },
      },
      shippingAddress: true,
      user: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
        },
      },
    },
  });

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
      hasMore: page * limit < total,
    },
  };
};

/**
 * Update order status (for sellers to mark as shipped/delivered)
 */
export const updateSellerOrderStatus = async (
  sellerId: string,
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string
) => {
  // Verify seller has items in this order
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      items: {
        some: {
          sellerId: sellerId,
        },
      },
    },
  });

  if (!order) {
    throw new NotFoundError('Order not found or you are not a seller in this order');
  }

  // Sellers can only update to certain statuses
  const allowedStatuses: OrderStatus[] = [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED];
  if (!allowedStatuses.includes(status)) {
    throw new BadRequestError('Invalid status update for seller');
  }

  const updateData: any = { status };

  if (status === OrderStatus.SHIPPED) {
    updateData.shippedAt = new Date();
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
  } else if (status === OrderStatus.DELIVERED) {
    updateData.deliveredAt = new Date();
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      items: {
        include: {
          listing: {
            include: {
              item: true,
            },
          },
        },
      },
      shippingAddress: true,
      user: {
        select: {
          id: true,
          fullName: true,
          phone: true,
        },
      },
    },
  });

  // Send notification to buyer
  const notificationMessages: Record<string, { title: string; message: string; type: string }> = {
    [OrderStatus.PROCESSING]: {
      title: 'جاري تجهيز طلبك 📦',
      message: `البائع يقوم بتجهيز طلبك رقم ${updatedOrder.orderNumber}`,
      type: 'TRANSACTION_UPDATE',
    },
    [OrderStatus.SHIPPED]: {
      title: 'تم شحن طلبك 🚚',
      message: `طلبك رقم ${updatedOrder.orderNumber} في الطريق إليك${trackingNumber ? ` - رقم التتبع: ${trackingNumber}` : ''}`,
      type: 'TRANSACTION_SHIPPED',
    },
    [OrderStatus.DELIVERED]: {
      title: 'تم التوصيل ✅',
      message: `تم توصيل طلبك رقم ${updatedOrder.orderNumber} بنجاح`,
      type: 'TRANSACTION_DELIVERED',
    },
  };

  const notification = notificationMessages[status];
  if (notification) {
    try {
      await createNotification({
        userId: updatedOrder.userId,
        type: notification.type as any,
        title: notification.title,
        message: notification.message,
        priority: 'HIGH',
        entityType: 'ORDER',
        entityId: updatedOrder.id,
        actionUrl: `/dashboard/orders`,
        actionText: 'عرض الطلب',
      });
    } catch (notificationError) {
      logger.error('Failed to send order status notification:', notificationError);
    }
  }

  return updatedOrder;
};
