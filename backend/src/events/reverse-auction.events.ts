/**
 * Reverse Auction Event Emitter
 *
 * Event-driven architecture for reverse auction notifications
 * Emits events when reverse auctions are created, bid on, or completed
 */

import { EventEmitter } from 'events';

// Event types
export enum ReverseAuctionEventType {
  REVERSE_AUCTION_CREATED = 'reverse_auction:created',
  REVERSE_AUCTION_BID_PLACED = 'reverse_auction:bid_placed',
  REVERSE_AUCTION_ENDED = 'reverse_auction:ended',
  REVERSE_AUCTION_AWARDED = 'reverse_auction:awarded',
  REVERSE_AUCTION_CANCELLED = 'reverse_auction:cancelled',
}

// Event payload interfaces
export interface ReverseAuctionCreatedPayload {
  auctionId: string;
  buyerId: string;
  title: string;
  description: string;
  categoryId: string;
  condition?: string;
  targetPrice?: number;
  maxBudget?: number;
  governorate?: string;
  city?: string;
  district?: string;
  marketType?: string;
  startDate: Date;
  endDate: Date;
  timestamp: Date;
}

export interface ReverseAuctionBidPayload {
  auctionId: string;
  bidId: string;
  sellerId: string;
  buyerId: string;
  bidAmount: number;
  previousLowestBid?: number;
  isNewLowest: boolean;
  timestamp: Date;
}

export interface ReverseAuctionEndedPayload {
  auctionId: string;
  buyerId: string;
  winnerId?: string;
  winningBidAmount?: number;
  totalBids: number;
  timestamp: Date;
}

// Create event emitter instance
class ReverseAuctionEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);
  }

  /**
   * Emit reverse auction created event
   */
  emitAuctionCreated(payload: ReverseAuctionCreatedPayload): void {
    this.emit(ReverseAuctionEventType.REVERSE_AUCTION_CREATED, payload);
  }

  /**
   * Emit bid placed event
   */
  emitBidPlaced(payload: ReverseAuctionBidPayload): void {
    this.emit(ReverseAuctionEventType.REVERSE_AUCTION_BID_PLACED, payload);
  }

  /**
   * Emit auction ended event
   */
  emitAuctionEnded(payload: ReverseAuctionEndedPayload): void {
    this.emit(ReverseAuctionEventType.REVERSE_AUCTION_ENDED, payload);
  }

  /**
   * Listen for reverse auction created events
   */
  onAuctionCreated(listener: (payload: ReverseAuctionCreatedPayload) => void): void {
    this.on(ReverseAuctionEventType.REVERSE_AUCTION_CREATED, listener);
  }

  /**
   * Listen for bid placed events
   */
  onBidPlaced(listener: (payload: ReverseAuctionBidPayload) => void): void {
    this.on(ReverseAuctionEventType.REVERSE_AUCTION_BID_PLACED, listener);
  }

  /**
   * Listen for auction ended events
   */
  onAuctionEnded(listener: (payload: ReverseAuctionEndedPayload) => void): void {
    this.on(ReverseAuctionEventType.REVERSE_AUCTION_ENDED, listener);
  }
}

// Export singleton instance
export const reverseAuctionEvents = new ReverseAuctionEventEmitter();
