# Real-time Chat API Documentation

Complete API documentation for the Xchange Real-time Chat & Messaging System.

## Table of Contents

- [Overview](#overview)
- [WebSocket Connection](#websocket-connection)
- [Conversations](#conversations)
- [Messages](#messages)
- [Presence & Typing Indicators](#presence--typing-indicators)
- [Blocking](#blocking)
- [Statistics](#statistics)
- [WebSocket Events](#websocket-events)
- [Best Practices](#best-practices)

---

## Overview

The Real-time Chat System provides comprehensive messaging capabilities including:

- **Real-time Messaging**: Instant message delivery via WebSocket
- **Typing Indicators**: Real-time typing status
- **Online Presence**: User online/offline status
- **Read Receipts**: Message delivery and read status
- **Message Management**: Edit and delete messages
- **Blocking**: Block/unblock users
- **File Attachments**: Support for images and files
- **Conversation Context**: Link chats to items/transactions

### Features

✅ **Real-time WebSocket Communication**
✅ **Typing Indicators**
✅ **Online/Offline Presence**
✅ **Read Receipts & Message Status**
✅ **Edit & Delete Messages**
✅ **Block/Unblock Users**
✅ **File & Image Attachments**
✅ **Conversation Context (Items/Transactions)**

---

## WebSocket Connection

### Connect to WebSocket Server

**Endpoint:** `ws://your-domain.com` or `wss://your-domain.com` (production)

**Authentication:**

Include JWT token in connection:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Or via headers
const socket = io('http://localhost:3000', {
  extraHeaders: {
    Authorization: 'Bearer your-jwt-token'
  }
});
```

**Connection Events:**

```javascript
socket.on('connect', () => {
  console.log('Connected to chat server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from chat server');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
```

---

## Conversations

### 1. Get or Create Conversation

Get existing conversation or create new one between two users.

**Endpoint:** `POST /api/v1/chat/conversations`

**Authentication:** Required

**Request Body:**

```json
{
  "participant2Id": "uuid",
  "itemId": "uuid",
  "transactionId": "uuid"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Conversation retrieved successfully",
  "data": {
    "id": "uuid",
    "participant1Id": "uuid",
    "participant2Id": "uuid",
    "itemId": "uuid",
    "transactionId": null,
    "lastMessageAt": "2025-11-07T10:00:00.000Z",
    "lastMessageText": "Hello, is this still available?",
    "unreadCount1": 0,
    "unreadCount2": 3,
    "createdAt": "2025-11-05T10:00:00.000Z",
    "updatedAt": "2025-11-07T10:00:00.000Z",
    "messages": []
  }
}
```

---

### 2. Get User's Conversations

Get all conversations for the authenticated user.

**Endpoint:** `GET /api/v1/chat/conversations`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |

**Response:**

```json
{
  "success": true,
  "message": "Conversations retrieved successfully",
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "participant1Id": "uuid",
        "participant2Id": "uuid",
        "itemId": "uuid",
        "lastMessageAt": "2025-11-07T10:00:00.000Z",
        "lastMessageText": "Hello, is this still available?",
        "unreadCount": 3,
        "participant": {
          "id": "uuid",
          "fullName": "Ahmed Hassan",
          "avatar": "https://...",
          "userType": "BUSINESS"
        },
        "messages": [
          {
            "id": "uuid",
            "content": "Hello, is this still available?",
            "type": "TEXT",
            "senderId": "uuid",
            "createdAt": "2025-11-07T10:00:00.000Z",
            "isRead": false
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

---

### 3. Get Conversation by ID

Get detailed conversation information.

**Endpoint:** `GET /api/v1/chat/conversations/:id`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Conversation retrieved successfully",
  "data": {
    "id": "uuid",
    "participant1Id": "uuid",
    "participant2Id": "uuid",
    "itemId": "uuid",
    "lastMessageAt": "2025-11-07T10:00:00.000Z",
    "lastMessageText": "Hello",
    "messages": [
      {
        "id": "uuid",
        "content": "Hello, is this still available?",
        "type": "TEXT",
        "senderId": "uuid",
        "recipientId": "uuid",
        "status": "READ",
        "isRead": true,
        "readAt": "2025-11-07T10:05:00.000Z",
        "createdAt": "2025-11-07T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 4. Delete Conversation

Delete a conversation (and all its messages).

**Endpoint:** `DELETE /api/v1/chat/conversations/:id`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Conversation deleted successfully",
  "data": null
}
```

---

## Messages

### 1. Send Message (HTTP)

Send a message via HTTP API.

**Endpoint:** `POST /api/v1/chat/messages`

**Authentication:** Required

**Request Body:**

```json
{
  "conversationId": "uuid",
  "content": "Hello, is this still available?",
  "type": "TEXT",
  "attachments": ["https://..."],
  "itemId": "uuid",
  "offerId": "uuid"
}
```

**Message Types:**
- `TEXT` - Regular text message (default)
- `IMAGE` - Image message
- `FILE` - File attachment
- `ITEM` - Shared item/product
- `OFFER` - Offer/deal
- `SYSTEM` - System message

**Response:**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "id": "uuid",
    "conversationId": "uuid",
    "senderId": "uuid",
    "recipientId": "uuid",
    "content": "Hello, is this still available?",
    "type": "TEXT",
    "attachments": [],
    "status": "SENT",
    "isRead": false,
    "createdAt": "2025-11-07T10:00:00.000Z"
  }
}
```

---

### 2. Get Messages

Get messages in a conversation.

**Endpoint:** `GET /api/v1/chat/conversations/:conversationId/messages`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 50, max: 100) |
| before | date | Get messages before this date |
| after | date | Get messages after this date |

**Response:**

```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [
      {
        "id": "uuid",
        "content": "Hello",
        "type": "TEXT",
        "senderId": "uuid",
        "recipientId": "uuid",
        "status": "READ",
        "isRead": true,
        "readAt": "2025-11-07T10:05:00.000Z",
        "isEdited": false,
        "isDeleted": false,
        "createdAt": "2025-11-07T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 125,
      "totalPages": 3
    }
  }
}
```

---

### 3. Mark Messages as Read

Mark all unread messages in a conversation as read.

**Endpoint:** `POST /api/v1/chat/conversations/:conversationId/read`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Messages marked as read",
  "data": {
    "count": 3
  }
}
```

---

### 4. Edit Message

Edit a message (only sender can edit).

**Endpoint:** `PATCH /api/v1/chat/messages/:id`

**Authentication:** Required

**Request Body:**

```json
{
  "content": "Updated message content"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Message edited successfully",
  "data": {
    "id": "uuid",
    "content": "Updated message content",
    "isEdited": true,
    "editedAt": "2025-11-07T11:00:00.000Z",
    "createdAt": "2025-11-07T10:00:00.000Z"
  }
}
```

---

### 5. Delete Message

Delete a message (only sender can delete).

**Endpoint:** `DELETE /api/v1/chat/messages/:id`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Message deleted successfully",
  "data": null
}
```

**Note:** Deleted messages are soft-deleted (`isDeleted = true`), not removed from database.

---

## Presence & Typing Indicators

### 1. Get User Presence

Get online/offline status of a user.

**Endpoint:** `GET /api/v1/chat/presence/:userId`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Presence retrieved successfully",
  "data": {
    "userId": "uuid",
    "isOnline": true,
    "lastSeenAt": "2025-11-07T10:00:00.000Z",
    "socketId": "socket-id"
  }
}
```

---

### 2. Get Multiple User Presence

Get presence status for multiple users.

**Endpoint:** `POST /api/v1/chat/presence/multiple`

**Authentication:** Required

**Request Body:**

```json
{
  "userIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Presence retrieved successfully",
  "data": {
    "uuid1": {
      "isOnline": true,
      "lastSeenAt": null
    },
    "uuid2": {
      "isOnline": false,
      "lastSeenAt": "2025-11-07T09:00:00.000Z"
    },
    "uuid3": {
      "isOnline": true,
      "lastSeenAt": null
    }
  }
}
```

---

## Blocking

### 1. Block User

Block a user from sending messages.

**Endpoint:** `POST /api/v1/chat/block`

**Authentication:** Required

**Request Body:**

```json
{
  "blockedUserId": "uuid",
  "reason": "Spam messages"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User blocked successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "blockedUserId": "uuid",
    "reason": "Spam messages",
    "createdAt": "2025-11-07T10:00:00.000Z"
  }
}
```

---

### 2. Unblock User

Unblock a previously blocked user.

**Endpoint:** `DELETE /api/v1/chat/block/:userId`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "User unblocked successfully",
  "data": null
}
```

---

### 3. Get Blocked Users

Get list of all blocked users.

**Endpoint:** `GET /api/v1/chat/blocked`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Blocked users retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "blockedUserId": "uuid",
      "reason": "Spam messages",
      "createdAt": "2025-11-07T10:00:00.000Z"
    }
  ]
}
```

---

## Statistics

### 1. Get Unread Count

Get total unread message count across all conversations.

**Endpoint:** `GET /api/v1/chat/unread-count`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Unread count retrieved successfully",
  "data": {
    "count": 15
  }
}
```

---

### 2. Get Conversation Statistics

Get statistics for a specific conversation.

**Endpoint:** `GET /api/v1/chat/conversations/:conversationId/stats`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "totalMessages": 248,
    "unreadMessages": 5,
    "participants": ["uuid1", "uuid2"]
  }
}
```

---

## WebSocket Events

### Client → Server Events

#### 1. Send Message

```javascript
socket.emit('send_message', {
  conversationId: 'uuid',
  content: 'Hello!',
  type: 'TEXT',
  attachments: [],
  itemId: null,
  offerId: null
}, (response) => {
  if (response.success) {
    console.log('Message sent:', response.message);
  } else {
    console.error('Error:', response.error);
  }
});
```

#### 2. Mark as Read

```javascript
socket.emit('mark_as_read', {
  conversationId: 'uuid'
}, (response) => {
  console.log('Marked', response.count, 'messages as read');
});
```

#### 3. Edit Message

```javascript
socket.emit('edit_message', {
  messageId: 'uuid',
  content: 'Updated content'
}, (response) => {
  console.log('Message edited:', response.message);
});
```

#### 4. Delete Message

```javascript
socket.emit('delete_message', {
  messageId: 'uuid'
}, (response) => {
  console.log('Message deleted');
});
```

#### 5. Typing Indicator

```javascript
// Start typing
socket.emit('typing', {
  conversationId: 'uuid'
});

// Stop typing
socket.emit('stop_typing', {
  conversationId: 'uuid'
});
```

#### 6. Check Presence

```javascript
socket.emit('check_presence', {
  userIds: ['uuid1', 'uuid2']
}, (response) => {
  console.log('Presence:', response.presence);
});
```

### Server → Client Events

#### 1. New Message

```javascript
socket.on('new_message', (message) => {
  console.log('New message received:', message);
  // Update UI with new message
});
```

#### 2. Messages Read

```javascript
socket.on('messages_read', (data) => {
  console.log('User', data.userId, 'read', data.count, 'messages');
  // Update message status in UI
});
```

#### 3. Message Edited

```javascript
socket.on('message_edited', (message) => {
  console.log('Message was edited:', message);
  // Update message in UI
});
```

#### 4. User Typing

```javascript
socket.on('user_typing', (data) => {
  console.log('User', data.userId, 'is typing in conversation', data.conversationId);
  // Show typing indicator
});
```

#### 5. User Stopped Typing

```javascript
socket.on('user_stopped_typing', (data) => {
  console.log('User', data.userId, 'stopped typing');
  // Hide typing indicator
});
```

#### 6. Presence Update

```javascript
socket.on('presence_update', (data) => {
  console.log('User', data.userId, 'is now', data.isOnline ? 'online' : 'offline');
  // Update user status in UI
});
```

#### 7. Notification

```javascript
socket.on('notification', (notification) => {
  console.log('Notification received:', notification);
  // Show notification
});
```

---

## Best Practices

### For Frontend Implementation

1. **Reconnection Logic**:
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: userToken },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});
```

2. **Message Queue**: Queue messages while offline and send when reconnected

3. **Optimistic Updates**: Show messages immediately, confirm with server

4. **Typing Debounce**: Debounce typing indicator (send after 300ms of typing)

5. **Presence Polling**: Fallback to HTTP polling if WebSocket fails

### For Real-time Features

1. **Auto-Reconnect**: Handle reconnection gracefully
2. **Offline Queue**: Store messages offline and sync when online
3. **Typing Timeout**: Clear typing indicators after 5 seconds
4. **Read Receipts**: Send read receipts when conversation is in focus
5. **Notification Sound**: Play sound for new messages (with user permission)

### Security

1. **Validate Messages**: Sanitize message content on client and server
2. **Rate Limiting**: Limit messages per user per minute
3. **Block Check**: Check if users are blocked before allowing messages
4. **Authentication**: Always verify JWT token on WebSocket connection

---

## Example Implementation

### Complete Chat Flow

```javascript
// 1. Connect to WebSocket
const socket = io('http://localhost:3000', {
  auth: { token: userToken }
});

// 2. Listen for events
socket.on('connect', () => {
  console.log('Connected to chat');
});

socket.on('new_message', (message) => {
  // Add message to UI
  addMessageToUI(message);

  // Mark as read if conversation is open
  if (currentConversation === message.conversationId) {
    socket.emit('mark_as_read', {
      conversationId: message.conversationId
    });
  }
});

socket.on('user_typing', (data) => {
  if (currentConversation === data.conversationId) {
    showTypingIndicator(data.userId);
  }
});

socket.on('presence_update', (data) => {
  updateUserStatus(data.userId, data.isOnline);
});

// 3. Send message
function sendMessage(conversationId, content) {
  socket.emit('send_message', {
    conversationId,
    content,
    type: 'TEXT'
  }, (response) => {
    if (response.success) {
      addMessageToUI(response.message);
    } else {
      showError(response.error);
    }
  });
}

// 4. Handle typing
let typingTimeout;
inputField.addEventListener('input', () => {
  socket.emit('typing', { conversationId: currentConversation });

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('stop_typing', { conversationId: currentConversation });
  }, 1000);
});

// 5. Cleanup
socket.on('disconnect', () => {
  console.log('Disconnected from chat');
  showOfflineIndicator();
});
```

---

## Summary

The Real-time Chat System provides:

- ✅ **15 HTTP API Endpoints** for chat management
- ✅ **6 WebSocket Client Events** for real-time actions
- ✅ **7 WebSocket Server Events** for real-time updates
- ✅ **Real-time Messaging** with instant delivery
- ✅ **Typing Indicators** for better UX
- ✅ **Online Presence** tracking
- ✅ **Read Receipts** and message status
- ✅ **Message Management** (edit/delete)
- ✅ **Blocking System** for safety
- ✅ **File Attachments** support

This system provides enterprise-grade real-time messaging comparable to WhatsApp, Telegram, and other major chat platforms.
