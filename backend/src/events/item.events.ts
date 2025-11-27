/**
 * Item Event Emitter
 *
 * Event-driven architecture for real-time barter matching
 * Emits events when items are created, updated, or deleted
 */

import { EventEmitter } from 'events';

// Event types
export enum ItemEventType {
  ITEM_CREATED = 'item:created',
  ITEM_UPDATED = 'item:updated',
  ITEM_DELETED = 'item:deleted',
  BARTER_PREFERENCES_UPDATED = 'item:barter_preferences_updated',
}

// Event payload interfaces
export interface ItemCreatedPayload {
  itemId: string;
  userId: string;
  categoryId: string;
  hasBarterPreferences: boolean;
  timestamp: Date;
}

export interface ItemUpdatedPayload {
  itemId: string;
  userId: string;
  categoryId: string;
  changes: {
    category?: boolean;
    barterPreferences?: boolean;
    description?: boolean;
  };
  timestamp: Date;
}

export interface ItemDeletedPayload {
  itemId: string;
  userId: string;
  timestamp: Date;
}

// Create event emitter instance
class ItemEventEmitter extends EventEmitter {
  constructor() {
    super();
    // Increase max listeners for production scale
    this.setMaxListeners(100);
  }

  /**
   * Emit item created event
   */
  emitItemCreated(payload: ItemCreatedPayload): void {
    this.emit(ItemEventType.ITEM_CREATED, payload);
  }

  /**
   * Emit item updated event
   */
  emitItemUpdated(payload: ItemUpdatedPayload): void {
    this.emit(ItemEventType.ITEM_UPDATED, payload);
  }

  /**
   * Emit item deleted event
   */
  emitItemDeleted(payload: ItemDeletedPayload): void {
    this.emit(ItemEventType.ITEM_DELETED, payload);
  }

  /**
   * Listen for item created events
   */
  onItemCreated(listener: (payload: ItemCreatedPayload) => void): void {
    this.on(ItemEventType.ITEM_CREATED, listener);
  }

  /**
   * Listen for item updated events
   */
  onItemUpdated(listener: (payload: ItemUpdatedPayload) => void): void {
    this.on(ItemEventType.ITEM_UPDATED, listener);
  }

  /**
   * Listen for item deleted events
   */
  onItemDeleted(listener: (payload: ItemDeletedPayload) => void): void {
    this.on(ItemEventType.ITEM_DELETED, listener);
  }
}

// Export singleton instance
export const itemEvents = new ItemEventEmitter();
