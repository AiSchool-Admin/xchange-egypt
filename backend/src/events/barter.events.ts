/**
 * Barter Event Emitter
 *
 * Event-driven architecture for barter matching and notifications
 * Emits events when barter offers are created, updated, accepted, or rejected
 */

import { EventEmitter } from 'events';

// Event types
export enum BarterEventType {
  BARTER_OFFER_CREATED = 'barter:offer_created',
  BARTER_OFFER_UPDATED = 'barter:offer_updated',
  BARTER_OFFER_ACCEPTED = 'barter:offer_accepted',
  BARTER_OFFER_REJECTED = 'barter:offer_rejected',
  BARTER_OFFER_CANCELLED = 'barter:offer_cancelled',
  BARTER_ITEM_REQUEST_CREATED = 'barter:item_request_created',
}

// Event payload interfaces
export interface BarterOfferCreatedPayload {
  offerId: string;
  initiatorId: string;
  recipientId?: string;
  isOpenOffer: boolean;
  offeredItemIds: string[];
  categoryIds: string[];
  governorate?: string;
  city?: string;
  district?: string;
  marketType?: string;
  timestamp: Date;
}

export interface BarterItemRequestCreatedPayload {
  requestId: string;
  offerId: string;
  initiatorId: string;
  description: string;
  categoryId?: string;
  subcategoryId?: string;
  subSubcategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  keywords: string[];
  governorate?: string;
  timestamp: Date;
}

export interface BarterOfferStatusPayload {
  offerId: string;
  initiatorId: string;
  recipientId?: string;
  status: string;
  timestamp: Date;
}

// Create event emitter instance
class BarterEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);
  }

  /**
   * Emit barter offer created event
   */
  emitOfferCreated(payload: BarterOfferCreatedPayload): void {
    this.emit(BarterEventType.BARTER_OFFER_CREATED, payload);
  }

  /**
   * Emit item request created event (demand side)
   */
  emitItemRequestCreated(payload: BarterItemRequestCreatedPayload): void {
    this.emit(BarterEventType.BARTER_ITEM_REQUEST_CREATED, payload);
  }

  /**
   * Emit barter offer accepted event
   */
  emitOfferAccepted(payload: BarterOfferStatusPayload): void {
    this.emit(BarterEventType.BARTER_OFFER_ACCEPTED, payload);
  }

  /**
   * Emit barter offer rejected event
   */
  emitOfferRejected(payload: BarterOfferStatusPayload): void {
    this.emit(BarterEventType.BARTER_OFFER_REJECTED, payload);
  }

  /**
   * Listen for barter offer created events
   */
  onOfferCreated(listener: (payload: BarterOfferCreatedPayload) => void): void {
    this.on(BarterEventType.BARTER_OFFER_CREATED, listener);
  }

  /**
   * Listen for item request created events
   */
  onItemRequestCreated(listener: (payload: BarterItemRequestCreatedPayload) => void): void {
    this.on(BarterEventType.BARTER_ITEM_REQUEST_CREATED, listener);
  }

  /**
   * Listen for barter offer accepted events
   */
  onOfferAccepted(listener: (payload: BarterOfferStatusPayload) => void): void {
    this.on(BarterEventType.BARTER_OFFER_ACCEPTED, listener);
  }

  /**
   * Listen for barter offer rejected events
   */
  onOfferRejected(listener: (payload: BarterOfferStatusPayload) => void): void {
    this.on(BarterEventType.BARTER_OFFER_REJECTED, listener);
  }
}

// Export singleton instance
export const barterEvents = new BarterEventEmitter();
