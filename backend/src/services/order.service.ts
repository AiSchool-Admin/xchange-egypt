import { OrderStatus } from '@prisma/client';
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
 */
export const createOrder = async (
  userId: string,
  data: {
    shippingAddressId: string;
    paymentMethod: string;
    notes?: string;
  }
) => {
  // Get cart
  const cart = await getCart(userId);

  if (cart.items.length === 0) {
    throw new BadRequestError('Cart is empty');
  }

  // Verify shipping address
  const shippingAddress = await prisma.shippingAddress.findFirst({
    where: { id: data.shippingAddressId, userId },
  });

  if (!shippingAddress) {
    throw new NotFoundError('Shipping address not found');
  }

  // Verify all listings are still available
  for (const item of cart.items) {
    if (item.listing.status !== 'ACTIVE') {
      throw new BadRequestError(`Item "${item.listing.item.title}" is no longer available`);
    }
  }

  // Calculate totals
  const subtotal = cart.subtotal;
  const shippingCost = calculateShippingCost(shippingAddress.governorate);
  const total = subtotal + shippingCost;

  // Create order
  const order = await prisma.order.create({
    data: {
      userId,
      orderNumber: generateOrderNumber(),
      status: OrderStatus.PENDING,
      subtotal,
      shippingCost,
      total,
      shippingAddressId: data.shippingAddressId,
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

  // Clear cart
  await clearCart(userId);

  // Send notification to buyer confirming order
  await createNotification({
    userId: userId,
    type: 'TRANSACTION_PAYMENT_RECEIVED',
    title: 'تم إنشاء طلبك بنجاح',
    message: `تم إنشاء طلبك رقم ${order.orderNumber} وهو قيد المعالجة`,
    priority: 'HIGH',
    entityType: 'ORDER',
    entityId: order.id,
    actionUrl: `/dashboard/orders/${order.id}`,
    actionText: 'عرض الطلب',
  });

  // Send notifications to all sellers
  const sellerIds = [...new Set(order.items.map(item => item.sellerId))];
  for (const sellerId of sellerIds) {
    const sellerItems = order.items.filter(item => item.sellerId === sellerId);
    const itemTitles = sellerItems.map(item => item.listing.item.title).join('، ');

    await createNotification({
      userId: sellerId,
      type: 'ITEM_SOLD',
      title: 'تم بيع سلعتك! 🎉',
      message: `تم بيع: ${itemTitles}`,
      priority: 'HIGH',
      entityType: 'ORDER',
      entityId: order.id,
      actionUrl: `/dashboard/orders`,
      actionText: 'عرض الطلبات',
    });
  }

  return order;
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
      totalPages: Math.ceil(total / limit),
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
      actionUrl: `/dashboard/orders/${updatedOrder.id}`,
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
 * Get Egyptian governorates
 */
export const getGovernorates = () => {
  return EGYPTIAN_GOVERNORATES.map(name => ({
    name,
    shippingCost: calculateShippingCost(name),
  }));
};
