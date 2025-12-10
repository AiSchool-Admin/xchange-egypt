import { NotFoundError, BadRequestError } from '../utils/errors';
import prisma from '../lib/prisma';

/**
 * Get or create cart for user
 */
export const getOrCreateCart = async (userId: string) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
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
                  seller: {
                    select: {
                      id: true,
                      fullName: true,
                      avatar: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
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
                    seller: {
                      select: {
                        id: true,
                        fullName: true,
                        avatar: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  return cart;
};

/**
 * Get cart for user
 */
export const getCart = async (userId: string) => {
  const cart = await getOrCreateCart(userId);

  // Calculate totals
  const subtotal = cart.items.reduce((sum, item) => {
    return sum + (item.listing.price || 0) * item.quantity;
  }, 0);

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    ...cart,
    subtotal,
    itemCount,
    // Aliases for frontend compatibility
    totalPrice: subtotal,
    totalItems: itemCount,
  };
};

/**
 * Add item to cart
 * Accepts either listingId or itemId (for backward compatibility and flexibility)
 */
export const addToCart = async (userId: string, listingIdOrItemId: string, quantity: number = 1) => {
  let listing;

  // First try to find as a listing
  listing = await prisma.listing.findUnique({
    where: { id: listingIdOrItemId },
    include: {
      item: true,
    },
  });

  // If not found as listing, try to find as an item and get its DIRECT_SALE listing
  if (!listing) {
    const item = await prisma.item.findUnique({
      where: { id: listingIdOrItemId },
      include: {
        listings: {
          where: {
            listingType: 'DIRECT_SALE',
            status: 'ACTIVE',
          },
          take: 1,
        },
      },
    });

    if (item && item.listings.length > 0) {
      listing = await prisma.listing.findUnique({
        where: { id: item.listings[0].id },
        include: {
          item: true,
        },
      });
    }
  }

  if (!listing) {
    throw new NotFoundError('Item or listing not found');
  }

  if (listing.status !== 'ACTIVE') {
    throw new BadRequestError('This item is no longer available');
  }

  if (listing.listingType !== 'DIRECT_SALE') {
    throw new BadRequestError('Only direct sale items can be added to cart');
  }

  // Can't add own items to cart
  if (listing.userId === userId) {
    throw new BadRequestError('You cannot add your own items to cart');
  }

  // Get or create cart
  const cart = await getOrCreateCart(userId);

  // Check if item already in cart
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_listingId: {
        cartId: cart.id,
        listingId: listing.id,
      },
    },
  });

  if (existingItem) {
    // Update quantity
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    // Add new item
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        listingId: listing.id,
        quantity,
      },
    });
  }

  return getCart(userId);
};

/**
 * Update cart item quantity
 */
export const updateCartItemQuantity = async (userId: string, listingId: string, quantity: number) => {
  if (quantity < 1) {
    throw new BadRequestError('Quantity must be at least 1');
  }

  const cart = await getOrCreateCart(userId);

  const cartItem = await prisma.cartItem.findUnique({
    where: {
      cartId_listingId: {
        cartId: cart.id,
        listingId,
      },
    },
  });

  if (!cartItem) {
    throw new NotFoundError('Item not found in cart');
  }

  await prisma.cartItem.update({
    where: { id: cartItem.id },
    data: { quantity },
  });

  return getCart(userId);
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (userId: string, listingId: string) => {
  const cart = await getOrCreateCart(userId);

  const cartItem = await prisma.cartItem.findUnique({
    where: {
      cartId_listingId: {
        cartId: cart.id,
        listingId,
      },
    },
  });

  if (!cartItem) {
    throw new NotFoundError('Item not found in cart');
  }

  await prisma.cartItem.delete({
    where: { id: cartItem.id },
  });

  return getCart(userId);
};

/**
 * Clear cart
 */
export const clearCart = async (userId: string) => {
  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return getCart(userId);
};

/**
 * Get cart total
 */
export const getCartTotal = async (userId: string) => {
  const cart = await getCart(userId);

  return {
    subtotal: cart.subtotal,
    itemCount: cart.itemCount,
    items: cart.items.map(item => ({
      listingId: item.listingId,
      title: item.listing.item.title,
      price: item.listing.price,
      quantity: item.quantity,
      total: (item.listing.price || 0) * item.quantity,
    })),
  };
};
