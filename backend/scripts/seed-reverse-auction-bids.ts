/**
 * Seed script to create test bids for reverse auctions
 */

import prisma from '../src/lib/prisma';

async function seedReverseAuctionBids() {
  console.log('Finding active reverse auction...');

  // Find the active reverse auction
  const auction = await prisma.reverseAuction.findFirst({
    where: { status: 'ACTIVE' },
    include: { buyer: true }
  });

  if (!auction) {
    console.log('No active reverse auction found');
    return;
  }

  console.log(`Found auction: ${auction.title} (buyer: ${auction.buyer.fullName})`);
  console.log(`Max Budget: ${auction.maxBudget}`);

  // Find sellers (users who are not the buyer)
  const sellers = await prisma.user.findMany({
    where: {
      id: { not: auction.buyerId },
      isActive: true
    },
    take: 3
  });

  if (sellers.length === 0) {
    console.log('No sellers available');
    return;
  }

  console.log(`Found ${sellers.length} potential sellers`);

  // Create bids from different sellers
  const bidAmounts = [4500, 4200, 3800]; // Decreasing prices
  const conditions = ['GOOD', 'LIKE_NEW', 'NEW'];

  for (let i = 0; i < Math.min(sellers.length, 3); i++) {
    const seller = sellers[i];
    const bidAmount = bidAmounts[i];

    // Check if this seller already has a bid
    const existingBid = await prisma.reverseAuctionBid.findFirst({
      where: {
        reverseAuctionId: auction.id,
        sellerId: seller.id
      }
    });

    if (existingBid) {
      console.log(`Seller ${seller.fullName} already has a bid`);
      continue;
    }

    // Determine status based on bid amount (lowest is WINNING)
    const isLowest = i === bidAmounts.length - 1;

    const bid = await prisma.reverseAuctionBid.create({
      data: {
        reverseAuctionId: auction.id,
        sellerId: seller.id,
        bidAmount: bidAmount,
        itemCondition: conditions[i] as any,
        itemDescription: `عرض من ${seller.fullName} - نحاس خردة بحالة ${conditions[i] === 'NEW' ? 'جديدة' : conditions[i] === 'LIKE_NEW' ? 'شبه جديدة' : 'جيدة'}`,
        deliveryOption: 'DELIVERY',
        deliveryDays: 3 + i,
        deliveryCost: 50 + (i * 25),
        status: isLowest ? 'WINNING' : 'OUTBID',
        notes: `عرض تنافسي - التسليم خلال ${3 + i} أيام`
      }
    });

    console.log(`Created bid from ${seller.fullName}: ${bidAmount} EGP (${bid.status})`);
  }

  // Update auction stats
  const activeBids = await prisma.reverseAuctionBid.findMany({
    where: {
      reverseAuctionId: auction.id,
      status: { notIn: ['WITHDRAWN'] }
    }
  });

  const lowestBid = Math.min(...activeBids.map(b => b.bidAmount));
  const uniqueSellers = new Set(activeBids.map(b => b.sellerId)).size;

  await prisma.reverseAuction.update({
    where: { id: auction.id },
    data: {
      totalBids: activeBids.length,
      uniqueBidders: uniqueSellers,
      lowestBid: lowestBid
    }
  });

  console.log(`\nAuction updated: ${activeBids.length} bids, lowest: ${lowestBid} EGP`);
  console.log('Done!');
}

seedReverseAuctionBids()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
