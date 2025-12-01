import { AuctionStatus, BidStatus, ListingType, ListingStatus, ItemStatus } from '@prisma/client';
import { CreateAuctionInput, UpdateAuctionInput, PlaceBidInput, ListAuctionsQuery } from '../validations/auction.validation';
import { AppError } from '../middleware/errorHandler';
import prisma from '../lib/prisma';

/**
 * Create a new auction
 */
export const createAuction = async (userId: string, data: CreateAuctionInput) => {
  // 1. Verify item exists and belongs to user
  const item = await prisma.item.findUnique({
    where: { id: data.itemId },
    include: { listings: true },
  });

  if (!item) {
    throw new AppError('Item not found', 404);
  }

  if (item.sellerId !== userId) {
    throw new AppError('You can only create auctions for your own items', 403);
  }

  if (item.status !== ItemStatus.ACTIVE) {
    throw new AppError('Item must be active to create an auction', 400);
  }

  // 2. Check if item already has an active listing
  const hasActiveListing = item.listings.some(
    (listing) => listing.status === ListingStatus.ACTIVE
  );

  if (hasActiveListing) {
    throw new AppError('Item already has an active listing', 400);
  }

  // 3. Create listing and auction in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create listing
    const listing = await tx.listing.create({
      data: {
        itemId: data.itemId,
        userId,
        listingType: ListingType.AUCTION,
        price: data.startingPrice,
        startDate: data.startTime,
        endDate: data.endTime,
        status: data.startTime > new Date() ? ListingStatus.ACTIVE : ListingStatus.ACTIVE,
      },
    });

    // Create auction
    const auction = await tx.auction.create({
      data: {
        listingId: listing.id,
        startingPrice: data.startingPrice,
        currentPrice: data.startingPrice,
        buyNowPrice: data.buyNowPrice,
        reservePrice: data.reservePrice,
        minBidIncrement: data.minBidIncrement,
        startTime: data.startTime,
        endTime: data.endTime,
        autoExtend: data.autoExtend,
        extensionMinutes: data.extensionMinutes,
        extensionThreshold: data.extensionThreshold,
        maxExtensions: data.maxExtensions,
        status: data.startTime > new Date() ? AuctionStatus.SCHEDULED : AuctionStatus.ACTIVE,
      },
      include: {
        listing: {
          include: {
            item: {
              include: {
                category: true,
                seller: {
                  select: {
                    id: true,
                    fullName: true,
                    businessName: true,
                    rating: true,
                    totalReviews: true,
                  },
                },
              },
            },
          },
        },
        bids: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            bidder: {
              select: {
                id: true,
                fullName: true,
                businessName: true,
              },
            },
          },
        },
      },
    });

    return auction;
  });

  return result;
};

/**
 * Get auction by ID
 */
export const getAuctionById = async (auctionId: string, userId?: string) => {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: {
      listing: {
        include: {
          item: {
            include: {
              category: true,
              seller: {
                select: {
                  id: true,
                  fullName: true,
                  businessName: true,
                  avatar: true,
                  rating: true,
                  totalReviews: true,
                  governorate: true,
                },
              },
            },
          },
        },
      },
      bids: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          bidder: {
            select: {
              id: true,
              fullName: true,
              businessName: true,
            },
          },
        },
      },
      winningBid: {
        include: {
          bidder: {
            select: {
              id: true,
              fullName: true,
              businessName: true,
            },
          },
        },
      },
    },
  });

  if (!auction) {
    throw new AppError('Auction not found', 404);
  }

  // Increment views
  await prisma.auction.update({
    where: { id: auctionId },
    data: { views: { increment: 1 } },
  });

  // Check if auction should be ended
  await checkAndEndAuction(auctionId);

  // Hide max auto-bid amounts for other users
  const sanitizedBids = auction.bids.map((bid) => {
    if (userId && bid.bidderId !== userId) {
      return { ...bid, maxAutoBid: null };
    }
    return bid;
  });

  return { ...auction, bids: sanitizedBids };
};

/**
 * List auctions with filters
 */
export const listAuctions = async (query: ListAuctionsQuery) => {
  const {
    status,
    categoryId,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 20,
  } = query;

  const where: any = {
    status: status || { in: [AuctionStatus.SCHEDULED, AuctionStatus.ACTIVE] },
  };

  if (categoryId) {
    where.listing = {
      item: {
        categoryId,
      },
    };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.currentPrice = {};
    if (minPrice !== undefined) where.currentPrice.gte = minPrice;
    if (maxPrice !== undefined) where.currentPrice.lte = maxPrice;
  }

  // Build order by
  let orderBy: any;
  switch (sortBy) {
    case 'price':
      orderBy = { currentPrice: sortOrder };
      break;
    case 'endTime':
      orderBy = { endTime: sortOrder };
      break;
    case 'bids':
      orderBy = { totalBids: sortOrder };
      break;
    default:
      orderBy = { createdAt: sortOrder };
  }

  const [auctions, total] = await Promise.all([
    prisma.auction.findMany({
      where,
      include: {
        listing: {
          include: {
            item: {
              include: {
                category: true,
                seller: {
                  select: {
                    id: true,
                    fullName: true,
                    businessName: true,
                    rating: true,
                  },
                },
              },
            },
          },
        },
        bids: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auction.count({ where }),
  ]);

  return {
    auctions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Place a bid on an auction
 */
export const placeBid = async (auctionId: string, userId: string, data: PlaceBidInput) => {
  // 1. Get auction with lock
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: {
      listing: {
        include: {
          item: true,
        },
      },
      bids: {
        where: { bidderId: userId },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!auction) {
    throw new AppError('Auction not found', 404);
  }

  // 2. Validate auction status and timing
  if (auction.status !== AuctionStatus.ACTIVE) {
    throw new AppError('Auction is not active', 400);
  }

  const now = new Date();
  if (now < auction.startTime) {
    throw new AppError('Auction has not started yet', 400);
  }

  if (now > auction.endTime) {
    throw new AppError('Auction has ended', 400);
  }

  // 3. Validate bid amount
  if (auction.listing.item.sellerId === userId) {
    throw new AppError('You cannot bid on your own auction', 400);
  }

  const minimumBid = auction.currentPrice + auction.minBidIncrement;
  if (data.bidAmount < minimumBid) {
    throw new AppError(
      `Bid must be at least ${minimumBid} (current price + minimum increment)`,
      400
    );
  }

  // 4. Handle auto-bidding logic
  const isAutoBid = !!data.maxAutoBid;
  let actualBidAmount = data.bidAmount;

  if (isAutoBid) {
    // Get highest competing bid
    const highestBid = await prisma.auctionBid.findFirst({
      where: {
        auctionId,
        bidderId: { not: userId },
        status: { in: [BidStatus.ACTIVE, BidStatus.WINNING] },
      },
      orderBy: { bidAmount: 'desc' },
    });

    if (highestBid) {
      // Calculate optimal bid to beat the highest bid
      actualBidAmount = Math.min(
        highestBid.bidAmount + auction.minBidIncrement,
        data.maxAutoBid!
      );

      // If we can't beat the highest bid with our max, bid our max
      if (actualBidAmount < highestBid.bidAmount) {
        actualBidAmount = data.maxAutoBid!;
      }
    }
  }

  // 5. Create bid in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Mark previous bids as OUTBID
    await tx.auctionBid.updateMany({
      where: {
        auctionId,
        status: { in: [BidStatus.ACTIVE, BidStatus.WINNING] },
      },
      data: { status: BidStatus.OUTBID },
    });

    // Create new bid
    const newBid = await tx.auctionBid.create({
      data: {
        auctionId,
        listingId: auction.listingId,
        bidderId: userId,
        bidAmount: actualBidAmount,
        previousBid: auction.bids[0]?.bidAmount || null,
        isAutoBid,
        maxAutoBid: data.maxAutoBid,
        status: BidStatus.WINNING,
      },
      include: {
        bidder: {
          select: {
            id: true,
            fullName: true,
            businessName: true,
          },
        },
      },
    });

    // Update auction
    const uniqueBidders = await tx.auctionBid.findMany({
      where: { auctionId },
      distinct: ['bidderId'],
      select: { bidderId: true },
    });

    const updatedAuction = await tx.auction.update({
      where: { id: auctionId },
      data: {
        currentPrice: actualBidAmount,
        totalBids: { increment: 1 },
        uniqueBidders: uniqueBidders.length,
      },
    });

    // Check if we need to extend auction
    const minutesUntilEnd = (auction.endTime.getTime() - now.getTime()) / (1000 * 60);
    if (
      auction.autoExtend &&
      minutesUntilEnd <= auction.extensionThreshold &&
      updatedAuction.timesExtended < auction.maxExtensions
    ) {
      const newEndTime = new Date(auction.endTime.getTime() + auction.extensionMinutes * 60 * 1000);
      await tx.auction.update({
        where: { id: auctionId },
        data: {
          endTime: newEndTime,
          timesExtended: { increment: 1 },
        },
      });
    }

    return newBid;
  });

  return result;
};

/**
 * Buy now (instant purchase)
 */
export const buyNow = async (auctionId: string, userId: string) => {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: {
      listing: {
        include: {
          item: true,
        },
      },
    },
  });

  if (!auction) {
    throw new AppError('Auction not found', 404);
  }

  if (!auction.buyNowPrice) {
    throw new AppError('This auction does not have a buy now option', 400);
  }

  if (auction.status !== AuctionStatus.ACTIVE) {
    throw new AppError('Auction is not active', 400);
  }

  if (auction.listing.item.sellerId === userId) {
    throw new AppError('You cannot buy your own item', 400);
  }

  // Complete the auction immediately
  const result = await prisma.$transaction(async (tx) => {
    // Create final bid
    const winningBid = await tx.auctionBid.create({
      data: {
        auctionId,
        listingId: auction.listingId,
        bidderId: userId,
        bidAmount: auction.buyNowPrice!,
        status: BidStatus.WON,
      },
    });

    // Update auction
    await tx.auction.update({
      where: { id: auctionId },
      data: {
        status: AuctionStatus.COMPLETED,
        winnerId: userId,
        winningBidId: winningBid.id,
        actualEndTime: new Date(),
        currentPrice: auction.buyNowPrice!,
      },
    });

    // Update listing
    await tx.listing.update({
      where: { id: auction.listingId },
      data: { status: ListingStatus.COMPLETED },
    });

    // Update item
    await tx.item.update({
      where: { id: auction.listing.itemId },
      data: { status: ItemStatus.SOLD },
    });

    // Mark other bids as LOST
    await tx.auctionBid.updateMany({
      where: {
        auctionId,
        id: { not: winningBid.id },
      },
      data: { status: BidStatus.LOST },
    });

    // Create transaction
    const transaction = await tx.transaction.create({
      data: {
        listingId: auction.listingId,
        buyerId: userId,
        sellerId: auction.listing.item.sellerId,
        transactionType: 'AUCTION',
        amount: auction.buyNowPrice!,
        paymentStatus: 'PENDING',
        deliveryStatus: 'PENDING',
      },
    });

    return { auction, winningBid, transaction };
  });

  return result;
};

/**
 * Cancel auction (seller only, before any bids)
 */
export const cancelAuction = async (auctionId: string, userId: string, reason?: string) => {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: {
      listing: {
        include: {
          item: true,
        },
      },
    },
  });

  if (!auction) {
    throw new AppError('Auction not found', 404);
  }

  if (auction.listing.item.sellerId !== userId) {
    throw new AppError('You can only cancel your own auctions', 403);
  }

  if (auction.status === AuctionStatus.COMPLETED || auction.status === AuctionStatus.ENDED) {
    throw new AppError('Cannot cancel a completed or ended auction', 400);
  }

  if (auction.totalBids > 0) {
    throw new AppError('Cannot cancel auction with existing bids', 400);
  }

  await prisma.$transaction([
    prisma.auction.update({
      where: { id: auctionId },
      data: { status: AuctionStatus.CANCELLED },
    }),
    prisma.listing.update({
      where: { id: auction.listingId },
      data: { status: ListingStatus.CANCELLED },
    }),
  ]);

  return { message: 'Auction cancelled successfully', reason };
};

/**
 * End auction and determine winner
 */
export const endAuction = async (auctionId: string) => {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: {
      listing: {
        include: {
          item: true,
        },
      },
      bids: {
        where: { status: BidStatus.WINNING },
        orderBy: { bidAmount: 'desc' },
        take: 1,
      },
    },
  });

  if (!auction) {
    throw new AppError('Auction not found', 404);
  }

  if (auction.status === AuctionStatus.COMPLETED) {
    throw new AppError('Auction already completed', 400);
  }

  const winningBid = auction.bids[0];

  // Check if reserve price was met
  if (auction.reservePrice && (!winningBid || winningBid.bidAmount < auction.reservePrice)) {
    // Reserve not met - end auction without winner
    await prisma.$transaction([
      prisma.auction.update({
        where: { id: auctionId },
        data: {
          status: AuctionStatus.ENDED,
          actualEndTime: new Date(),
        },
      }),
      prisma.listing.update({
        where: { id: auction.listingId },
        data: { status: ListingStatus.EXPIRED },
      }),
      prisma.auctionBid.updateMany({
        where: { auctionId },
        data: { status: BidStatus.LOST },
      }),
    ]);

    return { message: 'Auction ended - reserve price not met', hasWinner: false };
  }

  if (!winningBid) {
    // No bids - end auction
    await prisma.$transaction([
      prisma.auction.update({
        where: { id: auctionId },
        data: {
          status: AuctionStatus.ENDED,
          actualEndTime: new Date(),
        },
      }),
      prisma.listing.update({
        where: { id: auction.listingId },
        data: { status: ListingStatus.EXPIRED },
      }),
    ]);

    return { message: 'Auction ended - no bids received', hasWinner: false };
  }

  // Complete auction with winner
  const result = await prisma.$transaction(async (tx) => {
    await tx.auction.update({
      where: { id: auctionId },
      data: {
        status: AuctionStatus.COMPLETED,
        winnerId: winningBid.bidderId,
        winningBidId: winningBid.id,
        actualEndTime: new Date(),
      },
    });

    await tx.listing.update({
      where: { id: auction.listingId },
      data: { status: ListingStatus.COMPLETED },
    });

    await tx.item.update({
      where: { id: auction.listing.itemId },
      data: { status: ItemStatus.SOLD },
    });

    await tx.auctionBid.update({
      where: { id: winningBid.id },
      data: { status: BidStatus.WON },
    });

    await tx.auctionBid.updateMany({
      where: {
        auctionId,
        id: { not: winningBid.id },
      },
      data: { status: BidStatus.LOST },
    });

    const transaction = await tx.transaction.create({
      data: {
        listingId: auction.listingId,
        buyerId: winningBid.bidderId,
        sellerId: auction.listing.item.sellerId,
        transactionType: 'AUCTION',
        amount: winningBid.bidAmount,
        paymentStatus: 'PENDING',
        deliveryStatus: 'PENDING',
      },
    });

    return { winningBid, transaction };
  });

  return {
    message: 'Auction completed successfully',
    hasWinner: true,
    winner: result.winningBid,
    transaction: result.transaction,
  };
};

/**
 * Check and end auction if time has passed
 */
export const checkAndEndAuction = async (auctionId: string) => {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
  });

  if (!auction) return;

  const now = new Date();
  if (
    auction.status === AuctionStatus.ACTIVE &&
    now > auction.endTime
  ) {
    await endAuction(auctionId);
  }
};

/**
 * Get auction bids
 */
export const getAuctionBids = async (auctionId: string, page: number = 1, limit: number = 50) => {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
  });

  if (!auction) {
    throw new AppError('Auction not found', 404);
  }

  const [bids, total] = await Promise.all([
    prisma.auctionBid.findMany({
      where: { auctionId },
      include: {
        bidder: {
          select: {
            id: true,
            fullName: true,
            businessName: true,
            rating: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auctionBid.count({ where: { auctionId } }),
  ]);

  return {
    bids,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get my auctions
 */
export const getMyAuctions = async (userId: string, status?: AuctionStatus) => {
  const where: any = {
    listing: {
      item: {
        sellerId: userId,
      },
    },
  };

  if (status) {
    where.status = status;
  }

  const auctions = await prisma.auction.findMany({
    where,
    include: {
      listing: {
        include: {
          item: {
            include: {
              category: true,
            },
          },
        },
      },
      bids: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return auctions;
};

/**
 * Get my bids
 */
export const getMyBids = async (userId: string) => {
  const bids = await prisma.auctionBid.findMany({
    where: { bidderId: userId },
    include: {
      auction: {
        include: {
          listing: {
            include: {
              item: {
                include: {
                  category: true,
                  seller: {
                    select: {
                      id: true,
                      fullName: true,
                      businessName: true,
                      rating: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Group by auction
  const bidsByAuction = bids.reduce((acc: any, bid) => {
    const auctionId = bid.auctionId;
    if (!acc[auctionId]) {
      acc[auctionId] = {
        auction: bid.auction,
        bids: [],
        latestBid: bid,
        totalBids: 0,
      };
    }
    acc[auctionId].bids.push(bid);
    acc[auctionId].totalBids++;
    return acc;
  }, {});

  return Object.values(bidsByAuction);
};

/**
 * Update auction (limited fields, before auction starts)
 */
export const updateAuction = async (
  auctionId: string,
  userId: string,
  data: UpdateAuctionInput
) => {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: {
      listing: {
        include: {
          item: true,
        },
      },
    },
  });

  if (!auction) {
    throw new AppError('Auction not found', 404);
  }

  if (auction.listing.item.sellerId !== userId) {
    throw new AppError('You can only update your own auctions', 403);
  }

  if (auction.status === AuctionStatus.ACTIVE && auction.totalBids > 0) {
    throw new AppError('Cannot update auction with existing bids', 400);
  }

  const updatedAuction = await prisma.auction.update({
    where: { id: auctionId },
    data,
    include: {
      listing: {
        include: {
          item: {
            include: {
              category: true,
              seller: {
                select: {
                  id: true,
                  fullName: true,
                  businessName: true,
                  rating: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return updatedAuction;
};
