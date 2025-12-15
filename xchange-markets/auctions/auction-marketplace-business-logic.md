# XCHANGE AUCTION MARKETPLACE - BUSINESS LOGIC & ALGORITHMS

## 🎯 CORE BIDDING ALGORITHMS

### 1. BID INCREMENT CALCULATION

The system automatically calculates minimum bid increments based on current price.

```javascript
/**
 * Calculate next minimum bid based on current price
 * Following eBay-style increment rules
 */
function calculateMinimumIncrement(currentPrice) {
  if (currentPrice < 1000) return 50;
  if (currentPrice < 5000) return 100;
  if (currentPrice < 10000) return 250;
  if (currentPrice < 25000) return 500;
  if (currentPrice < 50000) return 1000;
  if (currentPrice < 100000) return 2500;
  if (currentPrice < 250000) return 5000;
  if (currentPrice < 500000) return 10000;
  return 25000; // For very high values
}

/**
 * Example usage
 */
const currentPrice = 45000;
const increment = calculateMinimumIncrement(currentPrice); // 1000
const nextMinimumBid = currentPrice + increment; // 46000
```

---

### 2. PROXY BIDDING ALGORITHM

Automatic bidding system that bids on behalf of users up to their maximum amount.

```javascript
/**
 * Proxy Bid System
 * - User sets maximum amount they're willing to pay
 * - System automatically bids minimum increment when outbid
 * - Only reveals as much as needed to stay winning
 */

class ProxyBidHandler {
  constructor(auction) {
    this.auction = auction;
  }

  /**
   * Process a new bid with proxy bidding logic
   */
  async processNewBid(bidderId, bidAmount) {
    const currentWinner = await this.getCurrentWinner();
    const currentPrice = this.auction.currentPrice || this.auction.startingPrice;
    const increment = calculateMinimumIncrement(currentPrice);

    // Case 1: First bid
    if (!currentWinner) {
      return this.acceptBid(bidderId, bidAmount);
    }

    // Case 2: Bidder has active proxy
    const bidderProxy = await this.getActiveProxy(bidderId);
    const winnerProxy = await this.getActiveProxy(currentWinner.id);

    // Case 3: No proxies involved - simple bid
    if (!bidderProxy && !winnerProxy) {
      if (bidAmount >= currentPrice + increment) {
        return this.acceptBid(bidderId, bidAmount);
      }
      throw new Error('BID_TOO_LOW');
    }

    // Case 4: Both have proxies - automatic bidding war
    if (bidderProxy && winnerProxy) {
      return this.handleProxyWar(bidderProxy, winnerProxy, increment);
    }

    // Case 5: Only winner has proxy
    if (winnerProxy && !bidderProxy) {
      if (bidAmount > winnerProxy.maxAmount) {
        // New bidder wins
        return this.acceptBid(bidderId, bidAmount);
      } else {
        // Proxy auto-bids to match + increment
        const proxyBid = Math.min(bidAmount + increment, winnerProxy.maxAmount);
        return this.acceptBid(currentWinner.id, proxyBid, true);
      }
    }

    // Case 6: Only new bidder has proxy
    if (bidderProxy && !winnerProxy) {
      if (bidderProxy.maxAmount > currentPrice + increment) {
        const newBid = currentPrice + increment;
        return this.acceptBid(bidderId, newBid, true);
      }
      throw new Error('PROXY_MAX_TOO_LOW');
    }
  }

  /**
   * Handle two proxies competing
   */
  async handleProxyWar(proxy1, proxy2, increment) {
    const higher = proxy1.maxAmount > proxy2.maxAmount ? proxy1 : proxy2;
    const lower = proxy1.maxAmount <= proxy2.maxAmount ? proxy1 : proxy2;

    // The higher proxy wins at: lower's max + increment
    const winningBid = Math.min(
      lower.maxAmount + increment,
      higher.maxAmount
    );

    return this.acceptBid(higher.bidderId, winningBid, true);
  }

  /**
   * Accept and record a bid
   */
  async acceptBid(bidderId, amount, isAutoBid = false) {
    const bid = await prisma.bid.create({
      data: {
        auctionId: this.auction.id,
        bidderId,
        amount,
        isAutoBid,
        isWinning: true
      }
    });

    // Update previous winning bid
    await prisma.bid.updateMany({
      where: {
        auctionId: this.auction.id,
        isWinning: true,
        id: { not: bid.id }
      },
      data: { isWinning: false, isOutbid: true }
    });

    // Update auction
    await prisma.auction.update({
      where: { id: this.auction.id },
      data: {
        currentPrice: amount,
        currentWinnerId: bidderId,
        totalBids: { increment: 1 }
      }
    });

    return bid;
  }
}

/**
 * Example Proxy Bidding Scenario:
 * 
 * Current Price: 100,000 EGP
 * User A sets proxy max: 150,000 EGP
 * 
 * User B bids: 105,000 → System auto-bids 106,000 for User A
 * User B bids: 110,000 → System auto-bids 111,000 for User A
 * User B bids: 155,000 → User B wins (exceeded A's max)
 */
```

---

### 3. ANTI-SNIPER EXTENSION LOGIC

Prevents "sniping" by extending auction time when late bids arrive.

```javascript
/**
 * Anti-Sniper System
 * - If bid placed in last N minutes, extend by N minutes
 * - Max extensions to prevent infinite auctions
 * - All watchers notified of extension
 */

async function checkAndExtendAuction(auctionId, bidTimestamp) {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId }
  });

  if (!auction.extendOnBid) {
    return { extended: false };
  }

  const timeUntilEnd = auction.endTime - bidTimestamp;
  const extensionThreshold = auction.extensionMinutes * 60 * 1000; // Convert to ms

  // Check if bid is in extension window
  if (timeUntilEnd <= extensionThreshold) {
    // Check if max extensions reached
    if (auction.currentExtensions >= auction.maxExtensions) {
      return { 
        extended: false, 
        reason: 'MAX_EXTENSIONS_REACHED' 
      };
    }

    // Extend the auction
    const newEndTime = new Date(bidTimestamp.getTime() + extensionThreshold);
    
    await prisma.auction.update({
      where: { id: auctionId },
      data: {
        endTime: newEndTime,
        currentExtensions: { increment: 1 }
      }
    });

    // Notify all watchers via WebSocket
    emitAuctionExtended(auctionId, newEndTime);

    // Send push notifications
    await notifyWatchers(auctionId, {
      type: 'AUCTION_EXTENDED',
      message: `تم تمديد المزاد ${auction.extensionMinutes} دقائق إضافية`,
      newEndTime
    });

    return { 
      extended: true, 
      newEndTime,
      extensionsRemaining: auction.maxExtensions - auction.currentExtensions - 1
    };
  }

  return { extended: false };
}

/**
 * Example:
 * Auction ends at: 10:00 PM
 * Extension threshold: 2 minutes
 * Max extensions: 10
 * 
 * 9:58:30 PM - Bid placed → Extends to 10:02:00 PM (extension 1/10)
 * 10:01:00 PM - Bid placed → Extends to 10:03:00 PM (extension 2/10)
 * ... continues until max extensions or no more bids
 */
```

---

### 4. AUCTION END PROCESSOR

Background job that processes auction endings.

```javascript
/**
 * Auction End Processor
 * Runs every minute via cron job
 */

async function endExpiredAuctions() {
  const now = new Date();

  // Find all auctions that should end
  const expiredAuctions = await prisma.auction.findMany({
    where: {
      status: 'ACTIVE',
      endTime: { lte: now }
    },
    include: {
      bids: {
        where: { isWinning: true },
        include: { bidder: true }
      }
    }
  });

  for (const auction of expiredAuctions) {
    await processAuctionEnd(auction);
  }
}

async function processAuctionEnd(auction) {
  const winningBid = auction.bids[0];

  // Case 1: No bids
  if (!winningBid) {
    await prisma.auction.update({
      where: { id: auction.id },
      data: { 
        status: 'UNSOLD',
        endedAt: new Date()
      }
    });

    await notifySeller(auction.sellerId, {
      type: 'AUCTION_ENDED_NO_BIDS',
      auctionId: auction.id
    });

    return;
  }

  // Case 2: Reserve price not met
  if (auction.reservePrice && winningBid.amount < auction.reservePrice) {
    await prisma.auction.update({
      where: { id: auction.id },
      data: { 
        status: 'UNSOLD',
        endedAt: new Date()
      }
    });

    await notifySeller(auction.sellerId, {
      type: 'RESERVE_NOT_MET',
      auctionId: auction.id,
      highestBid: winningBid.amount,
      reservePrice: auction.reservePrice
    });

    // Refund all deposits
    await refundAllDeposits(auction.id);

    return;
  }

  // Case 3: Sold!
  const totalAmount = calculateTotalAmount(
    winningBid.amount,
    auction.itemType
  );

  await prisma.$transaction([
    // Update auction status
    prisma.auction.update({
      where: { id: auction.id },
      data: { 
        status: 'SOLD',
        endedAt: new Date()
      }
    }),

    // Create winner record
    prisma.auctionWinner.create({
      data: {
        auctionId: auction.id,
        winnerId: winningBid.bidderId,
        winningBidAmount: winningBid.amount,
        totalAmount: totalAmount.total,
        platformFee: totalAmount.platformFee,
        buyerPremium: totalAmount.buyerPremium,
        sellerPremium: totalAmount.sellerPremium,
        paymentDueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
        paymentStatus: 'PENDING'
      }
    }),

    // Create escrow hold
    prisma.escrowTransaction.create({
      data: {
        auctionId: auction.id,
        userId: winningBid.bidderId,
        amount: totalAmount.total,
        status: 'HELD',
        purpose: 'Auction payment hold'
      }
    })
  ]);

  // Notify winner
  await notifyWinner(winningBid.bidderId, auction, totalAmount);

  // Notify seller
  await notifySeller(auction.sellerId, {
    type: 'AUCTION_SOLD',
    auctionId: auction.id,
    winningBid: winningBid.amount,
    buyerName: winningBid.bidder.fullName
  });

  // Notify losers
  await notifyLosers(auction.id, winningBid.bidderId);

  // Refund non-winner deposits
  await refundNonWinnerDeposits(auction.id, winningBid.bidderId);
}
```

---

### 5. FEE CALCULATION

Platform fees based on category and price.

```javascript
/**
 * Calculate total fees for auction
 */
function calculateTotalAmount(winningBid, category) {
  const PLATFORM_FEES = {
    CARS: { buyer: 0.05, seller: 0.03 },
    REAL_ESTATE: { buyer: 0.02, seller: 0.01 },
    LUXURY_GOODS: { buyer: 0.10, seller: 0.05 },
    GOVERNMENT: { buyer: 0.02, seller: 0 }, // Government doesn't pay
    default: { buyer: 0.05, seller: 0.05 }
  };

  const fees = PLATFORM_FEES[category] || PLATFORM_FEES.default;

  const buyerPremium = winningBid * fees.buyer;
  const sellerPremium = winningBid * fees.seller;
  const platformFee = buyerPremium + sellerPremium;
  const total = winningBid + buyerPremium;

  return {
    winningBid,
    buyerPremium,
    sellerPremium,
    platformFee,
    total,
    sellerReceives: winningBid - sellerPremium
  };
}

/**
 * Example:
 * Winning bid: 200,000 EGP (Car)
 * Buyer premium: 10,000 EGP (5%)
 * Seller premium: 6,000 EGP (3%)
 * 
 * Buyer pays: 210,000 EGP
 * Seller receives: 194,000 EGP
 * Platform earns: 16,000 EGP
 */
```

---

### 6. FRAUD DETECTION ALGORITHM

Detect suspicious bidding patterns in real-time.

```javascript
/**
 * Fraud Detection System
 * Calculates suspicion score based on multiple factors
 */

class FraudDetector {
  async analyzeBid(bidData) {
    let suspicionScore = 0;
    const reasons = [];

    // 1. Check for shill bidding pattern
    const shillScore = await this.checkShillBidding(bidData);
    suspicionScore += shillScore;
    if (shillScore > 0) reasons.push('Shill bidding pattern detected');

    // 2. Device fingerprint matching
    const deviceScore = await this.checkDeviceFingerprint(bidData);
    suspicionScore += deviceScore;
    if (deviceScore > 0) reasons.push('Multiple accounts same device');

    // 3. Bidding velocity
    const velocityScore = await this.checkBiddingVelocity(bidData);
    suspicionScore += velocityScore;
    if (velocityScore > 0) reasons.push('Abnormal bidding speed');

    // 4. Bid pattern analysis
    const patternScore = await this.checkBidPattern(bidData);
    suspicionScore += patternScore;
    if (patternScore > 0) reasons.push('Suspicious bid pattern');

    // 5. IP address analysis
    const ipScore = await this.checkIPPattern(bidData);
    suspicionScore += ipScore;
    if (ipScore > 0) reasons.push('IP pattern suspicious');

    // Calculate severity
    let severity;
    if (suspicionScore < 30) severity = 'LOW';
    else if (suspicionScore < 60) severity = 'MEDIUM';
    else if (suspicionScore < 85) severity = 'HIGH';
    else severity = 'CRITICAL';

    // Log if suspicious
    if (suspicionScore >= 50) {
      await prisma.suspiciousActivity.create({
        data: {
          userId: bidData.bidderId,
          auctionId: bidData.auctionId,
          bidId: bidData.bidId,
          activityType: 'SUSPICIOUS_PATTERN',
          severity,
          description: reasons.join('; '),
          evidenceData: bidData.deviceInfo,
          fingerprint: bidData.deviceInfo.fingerprint,
          ipAddress: bidData.ipAddress
        }
      });
    }

    // Auto-suspend if critical
    if (suspicionScore >= 85) {
      await this.suspendUser(bidData.bidderId);
    }

    return { suspicionScore, severity, reasons };
  }

  /**
   * Check for shill bidding
   * - Same user repeatedly bidding on same seller
   * - Never winning
   * - Bids just to drive up price
   */
  async checkShillBidding(bidData) {
    const auction = await prisma.auction.findUnique({
      where: { id: bidData.auctionId }
    });

    // Count bids by this user on this seller's auctions
    const bidsOnSellerAuctions = await prisma.bid.count({
      where: {
        bidderId: bidData.bidderId,
        auction: { sellerId: auction.sellerId }
      }
    });

    // Count wins
    const wins = await prisma.auctionWinner.count({
      where: { winnerId: bidData.bidderId }
    });

    // High bid count with zero wins is suspicious
    if (bidsOnSellerAuctions > 20 && wins === 0) {
      return 40; // High score
    }

    if (bidsOnSellerAuctions > 10 && wins === 0) {
      return 20; // Medium score
    }

    return 0;
  }

  /**
   * Check device fingerprint
   * - Multiple accounts from same device
   */
  async checkDeviceFingerprint(bidData) {
    if (!bidData.deviceInfo?.fingerprint) return 0;

    const accounts = await prisma.bid.groupBy({
      by: ['bidderId'],
      where: {
        deviceInfo: {
          path: ['fingerprint'],
          equals: bidData.deviceInfo.fingerprint
        }
      }
    });

    // More than 2 accounts = suspicious
    if (accounts.length > 3) return 35;
    if (accounts.length > 2) return 20;
    return 0;
  }

  /**
   * Check bidding velocity
   * - Too many bids too quickly
   */
  async checkBiddingVelocity(bidData) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const recentBids = await prisma.bid.count({
      where: {
        bidderId: bidData.bidderId,
        createdAt: { gte: fiveMinutesAgo }
      }
    });

    // More than 10 bids in 5 minutes = bot?
    if (recentBids > 20) return 30;
    if (recentBids > 10) return 15;
    return 0;
  }
}
```

---

### 7. SEALED-BID AUCTION LOGIC

For sealed-bid (first-price) auctions.

```javascript
/**
 * Sealed-Bid Auction
 * - All bids hidden until auction ends
 * - Highest bid wins
 * - Winner pays their bid (not second-highest)
 */

async function placeSealedBid(auctionId, bidderId, amount) {
  // Verify auction is sealed-bid type
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId }
  });

  if (auction.auctionType !== 'SEALED_BID') {
    throw new Error('NOT_SEALED_BID_AUCTION');
  }

  // Create bid (not revealed)
  const bid = await prisma.bid.create({
    data: {
      auctionId,
      bidderId,
      amount,
      isWinning: false // Unknown until reveal
    }
  });

  // DO NOT update auction.currentPrice
  // DO NOT notify other bidders

  return {
    bidId: bid.id,
    message: 'عرضك تم تسجيله بنجاح. سيتم الإعلان عن الفائز عند انتهاء المزاد.'
  };
}

/**
 * Reveal sealed bids when auction ends
 */
async function revealSealedBids(auctionId) {
  const bids = await prisma.bid.findMany({
    where: { auctionId },
    orderBy: { amount: 'desc' }
  });

  if (bids.length === 0) {
    return { winner: null };
  }

  const winningBid = bids[0];

  // Mark winning bid
  await prisma.bid.update({
    where: { id: winningBid.id },
    data: { 
      isWinning: true,
      revealedAt: new Date()
    }
  });

  // Update auction
  await prisma.auction.update({
    where: { id: auctionId },
    data: {
      currentPrice: winningBid.amount,
      currentWinnerId: winningBid.bidderId
    }
  });

  // Notify all participants
  for (const bid of bids) {
    const isWinner = bid.id === winningBid.id;
    await notifyBidder(bid.bidderId, {
      type: isWinner ? 'WON_SEALED_AUCTION' : 'LOST_SEALED_AUCTION',
      auctionId,
      yourBid: bid.amount,
      winningBid: winningBid.amount
    });
  }

  return { winner: winningBid };
}
```

---

### 8. DEPOSIT CALCULATION

Automatically calculate required deposit based on rules.

```javascript
/**
 * Calculate deposit requirement
 */
function calculateDepositRequirement(auction) {
  const DEPOSIT_RULES = {
    CARS: { percentage: 0.10, min: 5000, max: 50000 },
    REAL_ESTATE: { percentage: 0.05, min: 20000, max: 200000 },
    GOVERNMENT: { percentage: 0.10, min: 10000, max: 100000 },
    default: { percentage: 0.05, min: 1000, max: 25000 }
  };

  const rules = DEPOSIT_RULES[auction.itemType] || DEPOSIT_RULES.default;

  let deposit = auction.startingPrice * rules.percentage;

  // Apply min/max
  deposit = Math.max(deposit, rules.min);
  deposit = Math.min(deposit, rules.max);

  return Math.round(deposit);
}

/**
 * Example:
 * Car auction starting at 200,000 EGP
 * Deposit: 200,000 * 0.10 = 20,000 EGP
 * (within min: 5,000, max: 50,000)
 */
```

---

## 🔐 SECURITY BEST PRACTICES

### Rate Limiting
```javascript
// Max 1 bid per 5 seconds per user per auction
const rateLimit = rateLimit({
  windowMs: 5 * 1000,
  max: 1,
  keyGenerator: (req) => `${req.user.id}:${req.params.auctionId}`
});

app.post('/auctions/:auctionId/bids', rateLimit, placeBidHandler);
```

### Optimistic Locking
```javascript
// Prevent race conditions with version field
await prisma.auction.update({
  where: { 
    id: auctionId,
    version: currentVersion
  },
  data: {
    currentPrice: newPrice,
    version: { increment: 1 }
  }
});
```

### Transaction Guarantees
```javascript
// Use Prisma transactions for atomic operations
await prisma.$transaction([
  prisma.bid.create({ ... }),
  prisma.auction.update({ ... }),
  prisma.escrowTransaction.create({ ... })
]);
```
