import { Request, Response, NextFunction } from 'express';
import * as cartService from '../services/cart.service';
import { successResponse } from '../utils/response';

/**
 * Get user's cart
 * GET /api/v1/cart
 */
export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const cart = await cartService.getCart(userId);
    return successResponse(res, cart, 'Cart retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Add item to cart
 * POST /api/v1/cart/items
 */
export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { listingId, quantity } = req.body;
    const cart = await cartService.addToCart(userId, listingId, quantity);
    return successResponse(res, cart, 'Item added to cart', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update cart item quantity
 * PUT /api/v1/cart/items/:listingId
 */
export const updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { listingId } = req.params;
    const { quantity } = req.body;
    const cart = await cartService.updateCartItemQuantity(userId, listingId, quantity);
    return successResponse(res, cart, 'Cart item updated');
  } catch (error) {
    next(error);
  }
};

/**
 * Remove item from cart
 * DELETE /api/v1/cart/items/:listingId
 */
export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { listingId } = req.params;
    const cart = await cartService.removeFromCart(userId, listingId);
    return successResponse(res, cart, 'Item removed from cart');
  } catch (error) {
    next(error);
  }
};

/**
 * Clear cart
 * DELETE /api/v1/cart
 */
export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const cart = await cartService.clearCart(userId);
    return successResponse(res, cart, 'Cart cleared');
  } catch (error) {
    next(error);
  }
};

/**
 * Get cart total
 * GET /api/v1/cart/total
 */
export const getCartTotal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const total = await cartService.getCartTotal(userId);
    return successResponse(res, total, 'Cart total retrieved');
  } catch (error) {
    next(error);
  }
};
