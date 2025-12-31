import { Request, Response, NextFunction } from 'express';
import * as orderService from '../services/order.service';
import { successResponse, errorResponse } from '../utils/response';
import { OrderStatus, PaymentMethod } from '../types';

// Helper to safely get user ID from request
const getUserId = (req: Request): string | null => req.user?.id || null;

/**
 * Get user's orders
 * GET /api/v1/orders
 */
export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { page, limit, status } = req.query;

    const result = await orderService.getMyOrders(
      userId,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20,
      status as OrderStatus | undefined
    );

    // Convert Decimal values to numbers for JSON serialization (including nested listings)
    const serializedOrders = result.orders.map((order: any) => ({
      ...order,
      subtotal: order.subtotal ? Number(order.subtotal) : 0,
      shippingCost: order.shippingCost ? Number(order.shippingCost) : 0,
      total: order.total ? Number(order.total) : 0,
      items: order.items?.map((item: any) => ({
        ...item,
        price: item.price ? Number(item.price) : 0,
        listing: item.listing ? {
          ...item.listing,
          price: item.listing.price ? Number(item.listing.price) : null,
          startingBid: item.listing.startingBid ? Number(item.listing.startingBid) : null,
          currentBid: item.listing.currentBid ? Number(item.listing.currentBid) : null,
          bidIncrement: item.listing.bidIncrement ? Number(item.listing.bidIncrement) : null,
          reservePrice: item.listing.reservePrice ? Number(item.listing.reservePrice) : null,
          item: item.listing.item ? {
            ...item.listing.item,
            estimatedValue: item.listing.item.estimatedValue ? Number(item.listing.item.estimatedValue) : null,
          } : null,
        } : null,
      })) || [],
    }));

    return successResponse(res, { ...result, orders: serializedOrders }, 'Orders retrieved successfully');
  } catch (error: any) {
    console.error('[Orders API Error]', error?.message, error?.stack);
    next(error);
  }
};

/**
 * Get order by ID
 * GET /api/v1/orders/:orderId
 */
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { orderId } = req.params;

    const order = await orderService.getOrderById(userId, orderId) as any;

    // Convert Decimal values to numbers for JSON serialization (including nested listings)
    const serializedOrder = order ? {
      ...order,
      subtotal: order.subtotal ? Number(order.subtotal) : 0,
      shippingCost: order.shippingCost ? Number(order.shippingCost) : 0,
      total: order.total ? Number(order.total) : 0,
      items: order.items?.map((item: any) => ({
        ...item,
        price: item.price ? Number(item.price) : 0,
        listing: item.listing ? {
          ...item.listing,
          price: item.listing.price ? Number(item.listing.price) : null,
          startingBid: item.listing.startingBid ? Number(item.listing.startingBid) : null,
          currentBid: item.listing.currentBid ? Number(item.listing.currentBid) : null,
          bidIncrement: item.listing.bidIncrement ? Number(item.listing.bidIncrement) : null,
          reservePrice: item.listing.reservePrice ? Number(item.listing.reservePrice) : null,
          item: item.listing.item ? {
            ...item.listing.item,
            estimatedValue: item.listing.item.estimatedValue ? Number(item.listing.item.estimatedValue) : null,
          } : null,
        } : null,
      })) || [],
    } : null;

    return successResponse(res, serializedOrder, 'Order retrieved successfully');
  } catch (error: any) {
    console.error('[Order By ID Error]', error?.message, error?.stack);
    next(error);
  }
};

/**
 * Create order from cart
 * POST /api/v1/orders
 * Accepts either shippingAddressId OR shippingAddress object
 */
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { shippingAddressId, shippingAddress, paymentMethod, notes } = req.body as {
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
      paymentMethod: PaymentMethod;
      notes?: string;
    };

    const order = await orderService.createOrder(userId, {
      shippingAddressId,
      shippingAddress,
      paymentMethod,
      notes,
    });

    return successResponse(res, order, 'Order created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel order
 * POST /api/v1/orders/:orderId/cancel
 */
export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { orderId } = req.params;

    const order = await orderService.cancelOrder(userId, orderId);
    return successResponse(res, order, 'Order cancelled successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get shipping addresses
 * GET /api/v1/orders/addresses
 */
export const getShippingAddresses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const addresses = await orderService.getShippingAddresses(userId);
    return successResponse(res, addresses, 'Addresses retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create shipping address
 * POST /api/v1/orders/addresses
 */
export const createShippingAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const addressData = req.body as {
      fullName: string;
      phone: string;
      address: string;
      city: string;
      governorate: string;
      postalCode?: string;
      isDefault?: boolean;
    };

    const address = await orderService.createShippingAddress(userId, addressData);
    return successResponse(res, address, 'Address created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update shipping address
 * PUT /api/v1/orders/addresses/:addressId
 */
export const updateShippingAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { addressId } = req.params;
    const addressData = req.body as Record<string, unknown>;

    const address = await orderService.updateShippingAddress(userId, addressId, addressData);
    return successResponse(res, address, 'Address updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete shipping address
 * DELETE /api/v1/orders/addresses/:addressId
 */
export const deleteShippingAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { addressId } = req.params;

    await orderService.deleteShippingAddress(userId, addressId);
    return successResponse(res, null, 'Address deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Egyptian governorates with shipping costs
 * GET /api/v1/orders/governorates
 */
export const getGovernorates = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const governorates = orderService.getGovernorates();
    return successResponse(res, governorates, 'Governorates retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create order from auction win
 * POST /api/v1/orders/auction
 */
export const createAuctionOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { auctionId, shippingAddressId, shippingAddress, paymentMethod, notes } = req.body as {
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
      paymentMethod: PaymentMethod;
      notes?: string;
    };

    const order = await orderService.createAuctionOrder(userId, {
      auctionId,
      shippingAddressId,
      shippingAddress,
      paymentMethod,
      notes,
    });

    return successResponse(res, order, 'Auction order created successfully', 201);
  } catch (error) {
    next(error);
  }
};
