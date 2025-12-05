# Real-Time Barter Matching System

## Overview

The Real-Time Barter Matching System provides instant notifications when new barter opportunities are discovered, replacing the previous cron-based approach (15-minute intervals) with event-driven architecture for immediate feedback.

## Architecture

### Event-Driven Flow

```
User Creates/Updates Item
        ↓
  Item Service emits event
        ↓
  Real-Time Matching Service
        ↓
  Find cycles involving new item
        ↓
  WebSocket notifications to users
```

### Components

#### 1. Event Emitter (`src/events/item.events.ts`)

- **ItemEventEmitter**: Central event bus for item-related events
- **Event Types**:
  - `item:created` - Fired when a new item is created
  - `item:updated` - Fired when item is updated
  - `item:deleted` - Fired when item is deleted

#### 2. Real-Time Matching Service (`src/services/realtime-matching.service.ts`)

- **Core Functions**:
  - `initializeWebSocket()` - Sets up WebSocket server
  - `startRealtimeMatching()` - Registers event listeners
  - `handleItemCreated()` - Processes new items
  - `handleItemUpdated()` - Processes updated items
  - `notifyParticipants()` - Sends notifications to matched users

- **Configuration**:
  - Min match score for notification: **60%**
  - Max notifications per event: **5**
  - Cache duration: **5 minutes**

#### 3. Item Service Integration (`src/services/item.service.ts`)

- Emits events after:
  - Creating an item
  - Updating an item
  - Deleting an item

#### 4. WebSocket Server (`src/app.ts`)

- Socket.IO server integrated with Express
- CORS configuration matches REST API
- User-specific rooms for targeted notifications

## How It Works

### 1. Item Creation Flow

```typescript
// User creates item via API
POST /api/v1/items

// Item service creates item in database
const item = await prisma.item.create({ ... })

// Event emitted
itemEvents.emitItemCreated({
  itemId: item.id,
  userId: item.sellerId,
  categoryId: item.categoryId,
  hasBarterPreferences: true,
  timestamp: new Date()
})

// Real-time matching service handles event
handleItemCreated(payload)
  → findMatchesForUser(userId, itemId)
  → Filter high-quality matches (≥60%)
  → notifyParticipants()
    → Create database notifications
    → Emit WebSocket events to user rooms
```

### 2. Client Connection

```typescript
// Frontend connects to WebSocket
const socket = io('ws://localhost:3000', {
  auth: {
    userId: currentUser.id
  }
})

// Listen for match notifications
socket.on('match:found', (notification) => {
  console.log('New match found!', notification)
  // Show notification to user
})
```

### 3. Notification Format

```typescript
interface MatchNotification {
  type: 'new_match' | 'updated_match'
  opportunityId: string
  participantCount: number
  averageMatchScore: number
  participants: string[]
  userItems: {
    itemId: string
    itemTitle: string
  }[]
  timestamp: Date
}
```

## API Endpoints

### Real-Time Matching Stats

```
GET /api/v1/barter/realtime/stats
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "cacheValid": false,
    "isProcessing": false,
    "websocketConnected": true,
    "connectedClients": 5
  }
}
```

### Manual Trigger (Testing)

```
POST /api/v1/barter/realtime/trigger/:itemId
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "matchCount": 3,
    "notificationsSent": 2
  },
  "message": "Found 3 matches, sent 2 notifications"
}
```

## Fallback Strategy

The system maintains the existing cron-based matcher (`barterMatcher.job.ts`) as a fallback:

- **Real-time matching**: Instant notifications on item changes
- **Batch matching**: Runs every 15 minutes to catch edge cases
- **Lock cleanup**: Runs every 5 minutes (unchanged)

This dual approach ensures:
1. **Fast user experience** - Instant notifications (real-time)
2. **Reliability** - Batch job catches missed events
3. **Consistency** - Both use same matching algorithm

## Performance Considerations

### Incremental Matching

Instead of rebuilding the entire graph on every event:

1. **Targeted search**: Only find cycles involving the new/updated item
2. **Result limit**: Max 10 potential cycles per trigger
3. **Score filtering**: Only notify for 60%+ matches
4. **Duplicate prevention**: Check for recent notifications (1 hour cooldown)

### Scalability

- **User rooms**: WebSocket clients join user-specific rooms
- **Targeted broadcasts**: Only notify affected users
- **Processing lock**: Prevents concurrent processing
- **Cache invalidation**: Lightweight cache management

## Testing

### Local Testing

1. **Start server**:
   ```bash
   npm run dev
   ```

2. **Check stats**:
   ```bash
   curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/v1/barter/realtime/stats
   ```

3. **Create item** (triggers real-time matching):
   ```bash
   curl -X POST http://localhost:3000/api/v1/items \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "iPhone 13",
       "description": "Like new condition",
       "categoryId": "...",
       "condition": "LIKE_NEW",
       "estimatedValue": 5000,
       "desiredCategoryId": "...",
       "desiredKeywords": "laptop macbook"
     }'
   ```

4. **Connect WebSocket client**:
   ```javascript
   const socket = io('ws://localhost:3000', {
     auth: { userId: 'user-id' }
   })

   socket.on('match:found', console.log)
   ```

## Monitoring

### Server Logs

```
[RealTimeMatching] Client connected: abc123
[RealTimeMatching] User user-123 joined their notification room
[RealTimeMatching] Processing new item: item-456 by user user-123
[RealTimeMatching] Found 3 potential matches
[RealTimeMatching] Sent 2 notifications
[RealTimeMatching] Sent notification to user user-789: OPP-1234567890-user-123
```

### Metrics to Track

- Connected WebSocket clients
- Events processed per minute
- Notifications sent per event
- Average processing time
- Cache hit rate

## Future Enhancements

1. **Redis pub/sub**: Scale across multiple server instances
2. **Rate limiting**: Prevent notification spam
3. **Personalized thresholds**: User-configurable match score
4. **ML-based scoring**: Improve match quality over time
5. **Push notifications**: Integrate with mobile apps
6. **Email digests**: Daily summary of missed matches

## Troubleshooting

### No notifications received

1. Check WebSocket connection:
   ```javascript
   socket.on('connect', () => console.log('Connected'))
   socket.on('disconnect', () => console.log('Disconnected'))
   ```

2. Verify user joined room:
   ```
   GET /api/v1/barter/realtime/stats
   ```

3. Check server logs for processing errors

### Duplicate notifications

- 1-hour cooldown prevents duplicates
- Check `createdAt` timestamp in database

### Performance issues

- Monitor `isProcessing` flag in stats
- Check for event listener leaks
- Review notification count per event
