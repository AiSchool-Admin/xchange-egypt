# XCHANGE AUCTION MARKETPLACE - COMPLEX ALGORITHMS

## Table of Contents
1. [Proxy Bidding Algorithm](#1-proxy-bidding-algorithm)
2. [Bid Increment Calculation](#2-bid-increment-calculation)
3. [Anti-Sniper Extension Logic](#3-anti-sniper-extension-logic)
4. [Fraud Detection - Shill Bidding](#4-fraud-detection---shill-bidding)
5. [Sealed-Bid Auction Logic](#5-sealed-bid-auction-logic)
6. [Auction Scoring & Ranking](#6-auction-scoring--ranking)
7. [Dynamic Fee Calculation](#7-dynamic-fee-calculation)
8. [Reputation System](#8-reputation-system)

---

## 1. Proxy Bidding Algorithm

### Overview
Proxy bidding allows users to set a maximum bid, and the system automatically bids on their behalf up to that maximum, using only the minimum necessary to stay ahead.

### Algorithm Logic

```javascript
/**
 * Handle incoming bid with proxy bidding support
 * 
 * @param {string} auctionId - Auction ID
 * @param {string} bidderId - User placing bid
 * @param {number} amount - Bid amount
 * @param {boolean} isProxyBid - Whether this is setting a proxy max
 * @returns {object} - Bid result
 */
async function placeBid(auctionId, bidderId, amount, isProxyBid = false) {
  // 1. Get auction and validate
  const auction = await getAuctionWithLock(auctionId);
  
  if (auction.status !== 'ACTIVE') {
    throw new Error('Auction is not active');
  }
  
  if (auction.sellerId === bidderId) {
    throw new Error('Cannot bid on your own auction');
  }
  
  // 2. Calculate minimum required bid
  const minimumBid = calculateNextMinimumBid(auction.currentPrice, auction.startingPrice);
  
  if (!isProxyBid && amount < minimumBid) {
    throw new Error(`Bid must be at least ${minimumBid}`);
  }
  
  // 3. Get current proxy bids
  const currentProxies = await prisma.autoProxyBid.findMany({
    where: { auctionId, isActive: true },
    orderBy: { maxAmount: 'desc' }
  });
  
  // 4. If this is a proxy bid, create/update it
  if (isProxyBid) {
    await upsertProxyBid(auctionId, bidderId, amount);
  }
  
  // 5. Run proxy bidding simulation
  const result = await simulateProxyBidding(
    auction,
    currentProxies,
    { bidderId, amount, isProxyBid }
  );
  
  // 6. Create the actual bid(s)
  for (const bid of result.bidsToCreate) {
    await prisma.bid.create({
      data: {
        auctionId,
        bidderId: bid.bidderId,
        amount: bid.amount,
        isProxyBid: bid.isProxy,
        isAutoBid: bid.isAuto
      }
    });
  }
  
  // 7. Update auction
  await prisma.auction.update({
    where: { id: auctionId },
    data: {
      currentPrice: result.finalPrice,
      currentWinnerId: result.winnerId,
      totalBids: { increment: result.bidsToCreate.length },
      uniqueBidders: await getUniqueBidderCount(auctionId)
    }
  });
  
  // 8. Check for anti-sniper extension
  await checkAntiSniperExtension(auctionId);
  
  // 9. Broadcast update
  await broadcastBidUpdate(auctionId, result);
  
  // 10. Notify outbid users
  await notifyOutbidUsers(auctionId, result.winnerId);
  
  return result;
}

/**
 * Core proxy bidding simulation
 * 
 * This determines what the final price should be based on all proxy bids
 */
async function simulateProxyBidding(auction, currentProxies, newBid) {
  const bidsToCreate = [];
  let currentPrice = auction.currentPrice || auction.startingPrice;
  
  // Add new bid to simulation
  const allBids = [...currentProxies];
  if (newBid.isProxyBid) {
    allBids.push({
      bidderId: newBid.bidderId,
      maxAmount: newBid.amount,
      isActive: true
    });
  }
  
  // Sort by max amount (highest first)
  allBids.sort((a, b) => b.maxAmount - a.maxAmount);
  
  if (allBids.length === 0) {
    // Direct bid with no proxies
    return {
      finalPrice: newBid.amount,
      winnerId: newBid.bidderId,
      bidsToCreate: [{
        bidderId: newBid.bidderId,
        amount: newBid.amount,
        isProxy: false,
        isAuto: false
      }]
    };
  }
  
  // Get top 2 bidders
  const topBidder = allBids[0];
  const secondBidder = allBids[1];
  
  if (!secondBidder) {
    // Only one proxy bidder
    const finalPrice = Math.max(
      currentPrice,
      auction.startingPrice,
      calculateNextMinimumBid(currentPrice, auction.startingPrice)
    );
    
    // Bid at minimum required
    if (topBidder.maxAmount >= finalPrice) {
      bidsToCreate.push({
        bidderId: topBidder.bidderId,
        amount: finalPrice,
        isProxy: true,
        isAuto: true
      });
      
      return {
        finalPrice,
        winnerId: topBidder.bidderId,
        bidsToCreate
      };
    } else {
      throw new Error('Proxy bid too low');
    }
  }
  
  // Two or more bidders - competitive scenario
  // Top bidder should bid just enough to beat second bidder
  const increment = calculateBidIncrement(secondBidder.maxAmount);
  let targetPrice = secondBidder.maxAmount + increment;
  
  // But not more than their max
  targetPrice = Math.min(targetPrice, topBidder.maxAmount);
  
  // And at least the minimum required
  const minimumRequired = calculateNextMinimumBid(currentPrice, auction.startingPrice);
  targetPrice = Math.max(targetPrice, minimumRequired);
  
  if (topBidder.maxAmount >= targetPrice) {
    bidsToCreate.push({
      bidderId: topBidder.bidderId,
      amount: targetPrice,
      isProxy: true,
      isAuto: true
    });
    
    return {
      finalPrice: targetPrice,
      winnerId: topBidder.bidderId,
      bidsToCreate
    };
  }
  
  // Top bidder's max is not enough
  // Second bidder wins at top bidder's max + increment
  const secondWinPrice = Math.min(
    topBidder.maxAmount + increment,
    secondBidder.maxAmount
  );
  
  bidsToCreate.push({
    bidderId: secondBidder.bidderId,
    amount: secondWinPrice,
    isProxy: true,
    isAuto: true
  });
  
  return {
    finalPrice: secondWinPrice,
    winnerId: secondBidder.bidderId,
    bidsToCreate
  };
}
```

### Example Scenarios

**Scenario 1: Simple Proxy**
- Starting price: 10,000 EGP
- User A sets proxy max: 15,000 EGP
- **Result:** User A bids 10,000 (minimum to start)

**Scenario 2: Two Proxies**
- Current: 10,000 EGP
- User A proxy max: 15,000 EGP
- User B proxy max: 12,000 EGP
- **Result:** User A bids 12,500 (User B's max + increment)

**Scenario 3: Outbid Proxy**
- User A proxy max: 15,000 EGP (current winner at 12,000)
- User B places direct bid: 16,000 EGP
- **Result:** User B wins at 16,000

---

## 2. Bid Increment Calculation

### Dynamic Increment Table

```javascript
/**
 * Calculate bid increment based on current price
 * Following eBay-style increments
 */
function calculateBidIncrement(currentPrice) {
  const increments = [
    { max: 499, increment: 5 },
    { max: 999, increment: 10 },
    { max: 2499, increment: 25 },
    { max: 4999, increment: 50 },
    { max: 9999, increment: 100 },
    { max: 24999, increment: 250 },
    { max: 49999, increment: 500 },
    { max: 99999, increment: 1000 },
    { max: 249999, increment: 2500 },
    { max: 499999, increment: 5000 },
    { max: Infinity, increment: 10000 }
  ];
  
  for (const tier of increments) {
    if (currentPrice <= tier.max) {
      return tier.increment;
    }
  }
  
  return 10000; // Default for very high prices
}

/**
 * Calculate next minimum bid
 */
function calculateNextMinimumBid(currentPrice, startingPrice) {
  if (!currentPrice) {
    return startingPrice;
  }
  
  const increment = calculateBidIncrement(currentPrice);
  return currentPrice + increment;
}
```

### Examples
- Current: 450 EGP → Next minimum: 455 EGP (increment: 5)
- Current: 2,000 EGP → Next minimum: 2,025 EGP (increment: 25)
- Current: 50,000 EGP → Next minimum: 51,000 EGP (increment: 1,000)

---

## 3. Anti-Sniper Extension Logic

### Purpose
Prevent "sniping" where bidders wait until the last seconds to bid, giving no time for others to respond.

### Algorithm

```javascript
/**
 * Check if auction should be extended due to late bid
 */
async function checkAntiSniperExtension(auctionId) {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId }
  });
  
  if (!auction.extendOnBid) {
    return false; // Feature disabled
  }
  
  const now = new Date();
  const endTime = new Date(auction.endTime);
  const minutesRemaining = (endTime - now) / 1000 / 60;
  
  // Check if we're in the extension window (last 2 minutes)
  if (minutesRemaining <= 2 && minutesRemaining > 0) {
    // Check if we haven't exceeded max extensions
    if (auction.currentExtensions < auction.maxExtensions) {
      const newEndTime = new Date(endTime.getTime() + auction.extensionMinutes * 60000);
      
      await prisma.auction.update({
        where: { id: auctionId },
        data: {
          endTime: newEndTime,
          currentExtensions: auction.currentExtensions + 1
        }
      });
      
      // Broadcast extension
      io.to(`auction_${auctionId}`).emit('auction_extended', {
        auctionId,
        newEndTime,
        extensionCount: auction.currentExtensions + 1,
        message: `المزاد تم تمديده ${auction.extensionMinutes} دقيقة إضافية`
      });
      
      // Notify watchers
      await notifyWatchlistUsers(auctionId, 'AUCTION_EXTENDED');
      
      return true;
    } else {
      // Max extensions reached
      await notifyWatchlistUsers(auctionId, 'AUCTION_ENDING_FINAL');
    }
  }
  
  return false;
}
```

### Configuration Examples

| Auction Type | Threshold | Extension Time | Max Extensions |
|-------------|-----------|----------------|----------------|
| Cars | 2 min | 2 min | 10 |
| Real Estate | 5 min | 5 min | 5 |
| Electronics | 1 min | 1 min | 15 |
| High-Value (>1M) | 10 min | 10 min | 3 |

---

## 4. Fraud Detection - Shill Bidding

### Overview
Shill bidding is when the seller (or accomplices) bid on their own auction to artificially inflate the price.

### Detection Algorithm

```javascript
/**
 * Analyze auction for shill bidding patterns
 * 
 * Returns suspicion score (0-100)
 */
async function analyzeForShillBidding(auctionId) {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: {
      seller: true,
      bids: {
        include: { bidder: true },
        orderBy: { createdAt: 'asc' }
      }
    }
  });
  
  let suspicionScore = 0;
  const flags = [];
  
  // 1. Check for same device fingerprints
  const fingerprintMap = {};
  auction.bids.forEach(bid => {
    if (!fingerprintMap[bid.fingerprint]) {
      fingerprintMap[bid.fingerprint] = [];
    }
    fingerprintMap[bid.fingerprint].push(bid.bidderId);
  });
  
  for (const [fp, userIds] of Object.entries(fingerprintMap)) {
    const uniqueUsers = new Set(userIds);
    if (uniqueUsers.size > 1) {
      suspicionScore += 30;
      flags.push({
        type: 'SAME_DEVICE',
        severity: 'HIGH',
        details: `${uniqueUsers.size} users from same device`
      });
    }
  }
  
  // 2. Check bidding patterns
  const bidderStats = {};
  auction.bids.forEach(bid => {
    if (!bidderStats[bid.bidderId]) {
      bidderStats[bid.bidderId] = {
        count: 0,
        totalAmount: 0,
        winCount: 0,
        bidTimes: []
      };
    }
    
    bidderStats[bid.bidderId].count++;
    bidderStats[bid.bidderId].totalAmount += bid.amount;
    bidderStats[bid.bidderId].bidTimes.push(new Date(bid.createdAt));
    
    if (bid.isWinning) {
      bidderStats[bid.bidderId].winCount = 0; // Never actually wins
    }
  });
  
  // 3. Identify suspicious bidders
  for (const [bidderId, stats] of Object.entries(bidderStats)) {
    // Red flag: Many bids but never wins
    if (stats.count >= 5 && stats.winCount === 0) {
      suspicionScore += 20;
      flags.push({
        type: 'BID_SHIELD',
        severity: 'MEDIUM',
        details: `User ${bidderId}: ${stats.count} bids, never won`
      });
    }
    
    // Red flag: Bidding pattern too regular
    if (stats.bidTimes.length >= 3) {
      const intervals = [];
      for (let i = 1; i < stats.bidTimes.length; i++) {
        const interval = (stats.bidTimes[i] - stats.bidTimes[i-1]) / 1000;
        intervals.push(interval);
      }
      
      const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
      const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length;
      
      if (variance < 10) { // Very consistent intervals
        suspicionScore += 15;
        flags.push({
          type: 'ROBOTIC_PATTERN',
          severity: 'MEDIUM',
          details: `User ${bidderId}: Too consistent bid timing`
        });
      }
    }
  }
  
  // 4. Check for bidder-seller relationship
  const bidderHistory = await prisma.bid.groupBy({
    by: ['bidderId'],
    where: {
      auction: { sellerId: auction.sellerId },
      bidderId: { in: Object.keys(bidderStats) }
    },
    _count: true
  });
  
  for (const history of bidderHistory) {
    if (history._count > 3) {
      suspicionScore += 25;
      flags.push({
        type: 'REPEAT_BIDDER',
        severity: 'HIGH',
        details: `User ${history.bidderId}: ${history._count} bids on seller's auctions`
      });
    }
  }
  
  // 5. Create alert if score is high
  if (suspicionScore >= 50) {
    await prisma.suspiciousActivity.create({
      data: {
        auctionId,
        activityType: 'SHILL_BIDDING',
        severity: suspicionScore >= 75 ? 'CRITICAL' : 'HIGH',
        description: `Shill bidding detected (score: ${suspicionScore})`,
        evidenceData: { flags, score: suspicionScore }
      }
    });
  }
  
  return { score: suspicionScore, flags };
}
```

### Detection Patterns

| Pattern | Description | Weight |
|---------|-------------|--------|
| Same Device | Multiple accounts from same fingerprint | 30 |
| Bid Shielding | Many bids, never wins | 20 |
| Repeat Bidder | Frequent bidder on seller's items | 25 |
| Robotic Pattern | Too consistent timing | 15 |
| Low Trust New Account | <30 days old, low activity | 10 |

**Action Thresholds:**
- 0-30: Monitor
- 31-50: Flag for review
- 51-75: Suspend bidding privileges
- 76-100: Suspend account + void bids

---

## 5. Sealed-Bid Auction Logic

### Overview
In sealed-bid auctions, all bids are secret until the auction ends. The highest bidder wins.

### Algorithm

```javascript
/**
 * Place sealed bid
 */
async function placeSealedBid(auctionId, bidderId, amount) {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId }
  });
  
  if (auction.auctionType !== 'SEALED_BID') {
    throw new Error('This is not a sealed-bid auction');
  }
  
  if (auction.status !== 'ACTIVE') {
    throw new Error('Auction is not active');
  }
  
  // Check if user already bid (one bid only)
  const existingBid = await prisma.bid.findFirst({
    where: { auctionId, bidderId }
  });
  
  if (existingBid) {
    throw new Error('You can only bid once in sealed auctions');
  }
  
  // Create sealed bid (not revealed)
  await prisma.bid.create({
    data: {
      auctionId,
      bidderId,
      amount,
      isWinning: false, // Unknown until reveal
      revealedAt: null
    }
  });
  
  // Update auction stats (but not current price!)
  await prisma.auction.update({
    where: { id: auctionId },
    data: {
      totalBids: { increment: 1 },
      uniqueBidders: { increment: 1 }
    }
  });
  
  return { success: true, message: 'Bid placed successfully (sealed)' };
}

/**
 * Reveal bids when auction ends
 */
async function revealSealedBids(auctionId) {
  const bids = await prisma.bid.findMany({
    where: { auctionId },
    orderBy: { amount: 'desc' }
  });
  
  if (bids.length === 0) {
    return { winner: null, message: 'No bids placed' };
  }
  
  // Highest bid wins
  const winningBid = bids[0];
  
  // Mark all bids as revealed
  await prisma.bid.updateMany({
    where: { auctionId },
    data: { revealedAt: new Date() }
  });
  
  // Mark winner
  await prisma.bid.update({
    where: { id: winningBid.id },
    data: { isWinning: true }
  });
  
  // Update auction
  await prisma.auction.update({
    where: { id: auctionId },
    data: {
      status: winningBid.amount >= (auction.reservePrice || 0) ? 'SOLD' : 'UNSOLD',
      currentPrice: winningBid.amount,
      currentWinnerId: winningBid.bidderId
    }
  });
  
  return {
    winner: winningBid.bidderId,
    winningAmount: winningBid.amount,
    totalBids: bids.length,
    allBids: bids.map(b => ({
      bidder: maskBidderName(b.bidderId),
      amount: b.amount
    }))
  };
}
```

---

## 6. Auction Scoring & Ranking

### Purpose
Determine which auctions to feature, recommend, or show as "hot".

### Algorithm

```javascript
/**
 * Calculate auction hotness score
 * 
 * Used for "Hot Auctions" section
 */
function calculateAuctionScore(auction) {
  let score = 0;
  
  // 1. Bid activity (40 points max)
  const bidsPerHour = auction.totalBids / ((Date.now() - auction.startTime) / 3600000);
  score += Math.min(bidsPerHour * 2, 40);
  
  // 2. Time pressure (30 points max)
  const hoursRemaining = (auction.endTime - Date.now()) / 3600000;
  if (hoursRemaining <= 1) {
    score += 30;
  } else if (hoursRemaining <= 6) {
    score += 20;
  } else if (hoursRemaining <= 24) {
    score += 10;
  }
  
  // 3. Price movement (20 points max)
  const priceGain = (auction.currentPrice - auction.startingPrice) / auction.startingPrice;
  score += Math.min(priceGain * 100, 20);
  
  // 4. Engagement (10 points max)
  const engagementRate = (auction.watchlistCount + auction.totalBids) / auction.viewCount;
  score += Math.min(engagementRate * 100, 10);
  
  return Math.round(score);
}

/**
 * Get recommended auctions for user
 */
async function getRecommendedAuctions(userId, limit = 10) {
  // 1. Get user's past bidding categories
  const userBids = await prisma.bid.findMany({
    where: { bidderId: userId },
    include: { auction: true }
  });
  
  const categoryWeights = {};
  userBids.forEach(bid => {
    const cat = bid.auction.itemType;
    categoryWeights[cat] = (categoryWeights[cat] || 0) + 1;
  });
  
  // 2. Get active auctions
  const auctions = await prisma.auction.findMany({
    where: { status: 'ACTIVE' },
    include: { seller: true }
  });
  
  // 3. Score each auction
  const scored = auctions.map(auction => {
    let score = calculateAuctionScore(auction);
    
    // Boost score for preferred categories
    const categoryBoost = (categoryWeights[auction.itemType] || 0) * 5;
    score += categoryBoost;
    
    // Boost for trusted sellers
    if (auction.seller.trustLevel === 'PROFESSIONAL') {
      score += 10;
    }
    
    return { auction, score };
  });
  
  // 4. Sort and return top
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.auction);
}
```

---

## 7. Dynamic Fee Calculation

### Fee Structure

```javascript
/**
 * Calculate all fees for auction
 */
function calculateAuctionFees(finalPrice, auctionCategory) {
  const fees = {
    sellerPremium: 0,
    buyerPremium: 0,
    platformTotal: 0,
    sellerReceives: 0,
    buyerPays: 0
  };
  
  // Seller premium (graduated)
  if (finalPrice <= 50000) {
    fees.sellerPremium = finalPrice * 0.05; // 5%
  } else if (finalPrice <= 200000) {
    fees.sellerPremium = 2500 + (finalPrice - 50000) * 0.04; // 5% first 50K, then 4%
  } else {
    fees.sellerPremium = 2500 + 6000 + (finalPrice - 200000) * 0.03; // Then 3%
  }
  
  // Buyer premium (flat for now, can be graduated)
  fees.buyerPremium = finalPrice * 0.03; // 3%
  
  // Cap buyer premium
  fees.buyerPremium = Math.min(fees.buyerPremium, 15000);
  
  // Category-specific adjustments
  if (auctionCategory === 'REAL_ESTATE') {
    fees.sellerPremium = finalPrice * 0.02; // Lower for real estate
    fees.buyerPremium = finalPrice * 0.02;
  } else if (auctionCategory === 'GOVERNMENT') {
    fees.sellerPremium = 0; // No seller fee for government
    fees.buyerPremium = finalPrice * 0.05; // Higher buyer fee
  }
  
  fees.platformTotal = fees.sellerPremium + fees.buyerPremium;
  fees.sellerReceives = finalPrice - fees.sellerPremium;
  fees.buyerPays = finalPrice + fees.buyerPremium;
  
  return fees;
}
```

### Fee Table

| Category | Seller Premium | Buyer Premium | Notes |
|----------|---------------|---------------|-------|
| Cars | 3-5% | 3% (max 15K) | Graduated |
| Real Estate | 2% | 2% | Flat |
| Electronics | 5% | 3% | Flat |
| Luxury Goods | 5% | 5% | Flat |
| Government | 0% | 5% | No seller fee |

---

## 8. Reputation System

### Score Calculation

```javascript
/**
 * Calculate user's auction reputation (0-100)
 */
async function calculateUserReputation(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      reviewsReceived: true,
      auctions: true
    }
  });
  
  let score = 0;
  
  // 1. Completion rate (40 points)
  const completionRate = user.totalAuctionsWon > 0
    ? (user.totalAuctionsWon / (user.totalAuctionsWon + user.totalAuctionsLost))
    : 0;
  score += completionRate * 40;
  
  // 2. Average rating (30 points)
  if (user.reviewsReceived.length > 0) {
    const avgRating = user.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / user.reviewsReceived.length;
    score += (avgRating / 5) * 30;
  }
  
  // 3. Payment speed (20 points)
  if (user.averagePaymentTime) {
    // Ideal: <24 hours = full points
    // 24-48 hours = 15 points
    // 48-72 hours = 10 points
    // >72 hours = 5 points
    if (user.averagePaymentTime <= 24) {
      score += 20;
    } else if (user.averagePaymentTime <= 48) {
      score += 15;
    } else if (user.averagePaymentTime <= 72) {
      score += 10;
    } else {
      score += 5;
    }
  }
  
  // 4. Volume bonus (10 points)
  const totalTransactions = user.totalAuctionsWon + user.auctions.length;
  if (totalTransactions >= 100) {
    score += 10;
  } else if (totalTransactions >= 50) {
    score += 7;
  } else if (totalTransactions >= 20) {
    score += 5;
  } else if (totalTransactions >= 5) {
    score += 3;
  }
  
  // Update in database
  await prisma.user.update({
    where: { id: userId },
    data: { auctionReputation: Math.round(score) }
  });
  
  return Math.round(score);
}
```

### Trust Level Progression

```javascript
async function updateUserTrustLevel(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  let newTrustLevel = user.trustLevel;
  
  const totalTransactions = user.totalAuctionsWon + user.totalAuctionsSold;
  
  if (user.nationalIdVerified && totalTransactions >= 50 && user.auctionReputation >= 90) {
    newTrustLevel = 'PROFESSIONAL';
  } else if (user.nationalIdVerified && totalTransactions >= 10 && user.auctionReputation >= 80) {
    newTrustLevel = 'TRUSTED';
  } else if (user.nationalIdVerified) {
    newTrustLevel = 'VERIFIED';
  }
  
  if (newTrustLevel !== user.trustLevel) {
    await prisma.user.update({
      where: { id: userId },
      data: { trustLevel: newTrustLevel }
    });
    
    // Notify user of upgrade
    await sendNotification(userId, {
      type: 'TRUST_LEVEL_UPGRADE',
      message: `تهانينا! تم ترقيتك إلى مستوى ${newTrustLevel}`
    });
  }
}
```

---

## Performance Considerations

### Database Indexes
```sql
-- Critical indexes for performance
CREATE INDEX idx_auction_status_endtime ON auctions(status, end_time);
CREATE INDEX idx_bid_auction_amount ON bids(auction_id, amount DESC);
CREATE INDEX idx_bid_bidder_created ON bids(bidder_id, created_at DESC);
CREATE INDEX idx_proxy_auction_active ON auto_proxy_bids(auction_id, is_active);
```

### Caching Strategy
- **Auction Details:** 5 minutes TTL
- **Bid History:** 1 minute TTL
- **User Reputation:** 1 hour TTL
- **Auction List:** 2 minutes TTL

### Rate Limiting
- **Place Bid:** 1 per 5 seconds per auction
- **View Auction:** 100 per minute
- **Search:** 20 per minute
