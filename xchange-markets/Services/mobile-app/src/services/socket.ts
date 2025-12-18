// ============================================
// Socket Service - Real-time Communication
// ============================================

import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../constants/config';

type EventHandler = (...args: any[]) => void;

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Connect to socket server
  connect(userId: string): void {
    if (this.socket?.connected && this.userId === userId) {
      return; // Already connected with same user
    }

    this.userId = userId;
    this.disconnect(); // Disconnect existing connection

    this.socket = io(SOCKET_URL, {
      auth: { userId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.setupListeners();
  }

  // Disconnect from socket server
  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.userId = null;
    this.reconnectAttempts = 0;
  }

  // Setup core socket listeners
  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;

      // Re-register all event handlers after reconnect
      this.eventHandlers.forEach((handlers, event) => {
        handlers.forEach((handler) => {
          this.socket?.on(event, handler);
        });
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    // Handle reconnection
    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });
  }

  // Subscribe to an event
  on(event: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)?.add(handler);

    if (this.socket?.connected) {
      this.socket.on(event, handler);
    }
  }

  // Unsubscribe from an event
  off(event: string, handler: EventHandler): void {
    this.eventHandlers.get(event)?.delete(handler);

    if (this.socket) {
      this.socket.off(event, handler);
    }
  }

  // Emit an event
  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected. Event not emitted:', event);
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // ============================
  // Booking Events
  // ============================

  // Join booking room for real-time updates
  joinBookingRoom(bookingId: string): void {
    this.emit('join_booking', { bookingId });
  }

  // Leave booking room
  leaveBookingRoom(bookingId: string): void {
    this.emit('leave_booking', { bookingId });
  }

  // Send booking status update
  sendBookingStatusUpdate(bookingId: string, status: string): void {
    this.emit('booking_status_update', { bookingId, status });
  }

  // Subscribe to booking updates
  onBookingUpdate(handler: (data: any) => void): void {
    this.on('booking_updated', handler);
  }

  // Unsubscribe from booking updates
  offBookingUpdate(handler: (data: any) => void): void {
    this.off('booking_updated', handler);
  }

  // ============================
  // Chat Events
  // ============================

  // Join chat room
  joinChatRoom(chatId: string): void {
    this.emit('join_chat', { chatId });
  }

  // Leave chat room
  leaveChatRoom(chatId: string): void {
    this.emit('leave_chat', { chatId });
  }

  // Send chat message
  sendChatMessage(chatId: string, message: string, attachments?: string[]): void {
    this.emit('chat_message', { chatId, message, attachments });
  }

  // Subscribe to new messages
  onNewMessage(handler: (data: any) => void): void {
    this.on('new_message', handler);
  }

  // Unsubscribe from messages
  offNewMessage(handler: (data: any) => void): void {
    this.off('new_message', handler);
  }

  // Send typing indicator
  sendTyping(chatId: string, isTyping: boolean): void {
    this.emit('typing', { chatId, isTyping });
  }

  // Subscribe to typing events
  onTyping(handler: (data: { chatId: string; userId: string; isTyping: boolean }) => void): void {
    this.on('user_typing', handler);
  }

  // ============================
  // Location Tracking Events
  // ============================

  // Update provider location
  updateProviderLocation(latitude: number, longitude: number): void {
    this.emit('location_update', { latitude, longitude });
  }

  // Subscribe to provider location updates (for customer)
  onProviderLocation(handler: (data: { providerId: string; latitude: number; longitude: number }) => void): void {
    this.on('provider_location', handler);
  }

  // Unsubscribe from provider location
  offProviderLocation(handler: (data: any) => void): void {
    this.off('provider_location', handler);
  }

  // ============================
  // Notification Events
  // ============================

  // Subscribe to notifications
  onNotification(handler: (data: any) => void): void {
    this.on('notification', handler);
  }

  // Unsubscribe from notifications
  offNotification(handler: (data: any) => void): void {
    this.off('notification', handler);
  }

  // ============================
  // Express Service Events
  // ============================

  // Subscribe to express booking requests
  onExpressRequest(handler: (data: any) => void): void {
    this.on('express_request', handler);
  }

  // Respond to express request
  respondToExpressRequest(requestId: string, accepted: boolean): void {
    this.emit('express_response', { requestId, accepted });
  }
}

// Export singleton instance
export const socketService = new SocketService();
