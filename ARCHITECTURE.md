# Instadojo Architecture

Complete technical architecture documentation.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│   React + TypeScript + TailwindCSS + Zustand + Socket.io   │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/WebSocket
                     │
┌────────────────────▼────────────────────────────────────────┐
│                      Backend API                            │
│          Express.js + MongoDB + Redis + Socket.io           │
└───────┬─────────────────────────────────┬───────────────────┘
        │                                 │
        │                                 │
        ▼                                 ▼
┌───────────────┐                  ┌─────────────────┐
│ Dojo Engine   │                  │  IPFS Storage   │
│   (Cairo)     │                  │  (Web3.Storage) │
│   Starknet    │                  │                 │
└───────────────┘                  └─────────────────┘
```

## Data Flow

### Creating a Post

1. User composes post with media in frontend
2. Media files uploaded to IPFS
3. Content hash generated from content + media hashes
4. Transaction signed with Starknet wallet
5. Post sent to backend API with signature
6. Backend verifies signature
7. Backend submits content hash to Dojo contracts
8. Post saved to MongoDB with on-chain tx hash
9. WebSocket broadcast to connected clients
10. Post appears in real-time feeds

### Following a User

1. User clicks "Follow" button
2. Transaction signed with wallet
3. Follow request sent to backend
4. Backend verifies signature
5. Backend submits to Dojo follow system
6. Follow relationship saved to MongoDB
7. User counts updated in MongoDB and on-chain
8. WebSocket notification to target user

## Database Schema

### MongoDB Collections

**users**
```javascript
{
  _id: ObjectId,
  walletAddress: String (indexed),
  username: String (unique, indexed),
  avatar: String,
  bio: String,
  followerCount: Number,
  followingCount: Number,
  reputation: Number,
  postCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

**posts**
```javascript
{
  _id: ObjectId,
  postId: String (unique, indexed),
  authorAddress: String (indexed),
  content: String,
  contentHash: String (indexed),
  media: [{
    type: String,
    ipfsHash: String,
    url: String
  }],
  postType: String,
  likeCount: Number,
  commentCount: Number,
  repostCount: Number,
  onChainTx: String,
  timestamp: Date (indexed),
  isDeleted: Boolean
}
```

**comments**
```javascript
{
  _id: ObjectId,
  commentId: String (unique, indexed),
  postId: String (indexed),
  authorAddress: String,
  content: String,
  contentHash: String,
  parentId: String (indexed),
  level: Number,
  likeCount: Number,
  replyCount: Number,
  onChainTx: String,
  timestamp: Date,
  isDeleted: Boolean
}
```

**follows**
```javascript
{
  _id: ObjectId,
  follower: String (indexed),
  following: String (indexed),
  onChainTx: String,
  createdAt: Date
}
// Compound index on [follower, following]
```

**likes**
```javascript
{
  _id: ObjectId,
  userAddress: String (indexed),
  targetId: String (indexed),
  targetType: String, // 'post' or 'comment'
  onChainTx: String,
  createdAt: Date
}
// Compound index on [userAddress, targetId, targetType]
```

### Redis Cache Keys

```
user:{walletAddress}           # User profile data (1 hour TTL)
feed:basic:{offset}            # Basic feed cache (5 min TTL)
feed:personalized:{address}    # Personalized feed (3 min TTL)
feed:trending:{timeframe}      # Trending feed (10 min TTL)
ratelimit:{identifier}:{path}  # Rate limiting (15 min TTL)
```

## Smart Contracts

### Dojo Components

**Profile Component**
```cairo
struct Profile {
    address: ContractAddress,        // Primary key
    username: felt252,               // Max 31 chars
    avatar_hash: felt252,            // IPFS hash
    bio: felt252,                    // Truncated
    follower_count: u32,
    following_count: u32,
    reputation: u32,
    post_count: u32,
    created_at: u64,
}
```

**Post Component**
```cairo
struct Post {
    post_id: felt252,                // Primary key
    author: ContractAddress,
    content_hash: felt252,           // SHA256
    post_type: u8,                   // 0=text, 1=image, 2=video
    timestamp: u64,
    like_count: u32,
    comment_count: u32,
    is_deleted: bool,
}
```

### Why On-Chain vs Off-Chain

**On-Chain (Dojo):**
- Content hashes (for verification)
- User addresses and usernames
- Follower/following relationships
- Like counts and timestamps
- Reputation scores

**Off-Chain (MongoDB):**
- Full post content
- Media files (stored on IPFS)
- Long-form bio text
- Real-time interaction data
- Search indexes

**Rationale:** Balance between data integrity (on-chain) and performance/cost (off-chain).

## API Architecture

### Middleware Stack

```
Request
  ↓
CORS Middleware
  ↓
Helmet (Security)
  ↓
Compression
  ↓
Body Parser
  ↓
Rate Limiter
  ↓
Logger
  ↓
Auth Validator
  ↓
Request Validator
  ↓
Route Handler
  ↓
Response
```

### Authentication Flow

1. Client signs message with Starknet wallet
2. Message format: "Action: {context}"
3. Client sends: { walletAddress, signature, message, ...data }
4. Backend verifies signature using starknet.js
5. If valid, attach authenticatedAddress to request
6. Continue to route handler

### Error Handling

All API responses follow consistent format:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Human-readable message",
  "details": ["Validation error 1", "..."]
}
```

## Frontend Architecture

### Component Hierarchy

```
App
├── BrowserRouter
│   ├── WalletConnector (if not connected)
│   └── Routes (if connected)
│       ├── FeedPage
│       │   ├── Header
│       │   ├── FeedSelector
│       │   ├── FeedList
│       │   │   └── PostCard[]
│       │   └── PostComposer (modal)
│       ├── ProfilePage
│       │   ├── Header
│       │   ├── ProfileCard
│       │   └── PostCard[]
│       └── PostDetailPage
│           ├── Header
│           ├── PostCard
│           ├── CommentComposer
│           └── CommentThread[]
```

### State Management

**Zustand Stores:**

1. **authStore** - User authentication state
   - user, walletAddress, isConnected
   - connectWallet(), disconnectWallet()

2. **feedStore** - Feed data and operations
   - posts[], feedType, loading
   - fetchFeed(), addPost(), updatePost()

3. **uiStore** - UI state
   - modals, notifications, theme
   - openModal(), addNotification()

### Real-Time Updates

**Socket.io Integration:**

```typescript
// Connect on auth
socketClient.connect();
socketClient.authenticate(walletAddress);

// Subscribe to feeds
socketClient.subscribeToFeed('basic');

// Listen for updates
socketClient.onNewPost((post) => {
  feedStore.addPost(post);
});
```

## Performance Optimization

### Caching Strategy

1. **Redis Cache**
   - Feed results cached for 3-10 minutes
   - User profiles cached for 1 hour
   - Invalidate on updates

2. **Browser Cache**
   - Media files from IPFS cached indefinitely
   - API responses cached per React Query defaults

3. **Database Indexes**
   - All foreign keys indexed
   - Compound indexes on common queries
   - Text indexes for search

### Feed Algorithm

**Personalized Feed:**

```javascript
const timeDecay = Math.pow(ageInHours + 2, 1.8);
const score = (likes * 2 + comments * 3) / timeDecay;
```

Factors:
- Recent posts weighted higher
- Comments worth more than likes
- Time decay prevents old viral posts dominating
- Only shows posts from followed users

**Trending Feed:**

Same algorithm but:
- Limited to last 24 hours
- Applied to all posts (not just following)
- Includes repost count in score

## Security

### Authentication

- All write operations require wallet signature
- Signatures verified server-side
- No JWT tokens needed (wallet = identity)

### Authorization

- Users can only modify their own content
- Profile updates restricted to owner
- Post deletion restricted to author

### Rate Limiting

```javascript
const limits = {
  general: 100/15min,
  auth: 5/15min,
  posts: 20/hour,
  comments: 50/hour,
  follows: 30/hour
};
```

### Input Validation

- All inputs validated with Joi schemas
- Content length limits enforced
- File types restricted (images/videos only)
- Maximum file sizes (10MB per file)

### XSS Protection

- All user content sanitized
- React automatically escapes JSX
- Content-Security-Policy headers

## Scalability

### Horizontal Scaling

**Backend:**
- Stateless API servers (can add more instances)
- Sticky sessions for WebSocket connections
- Load balancer distributes traffic

**Database:**
- MongoDB replica set for read scaling
- Sharding by user address for write scaling
- Redis cluster for cache scaling

### Vertical Scaling

**Immediate Optimizations:**
- Increase MongoDB memory
- Add Redis memory for larger cache
- Upgrade API server resources

### Future Improvements

1. **CDN Integration**
   - Cloudflare R2 for media caching
   - Edge caching for static assets

2. **Microservices**
   - Separate feed service
   - Separate notification service
   - Separate media processing

3. **Queue System**
   - Bull/BullMQ for background jobs
   - Async processing of uploads
   - Delayed notification delivery

## Monitoring

### Metrics to Track

1. **API Performance**
   - Response times per endpoint
   - Error rates
   - Request volume

2. **Database Performance**
   - Query execution times
   - Connection pool usage
   - Index efficiency

3. **User Metrics**
   - Active users
   - Post creation rate
   - Engagement rates

### Logging

```javascript
// Winston logger with levels:
- error: Errors and exceptions
- warn: Warnings
- info: Important events
- http: API requests
- debug: Detailed debugging
```

Logs stored in:
- `logs/error.log` - Errors only
- `logs/combined.log` - All logs

## Deployment

### Development

```bash
# Backend
cd backend && npm run dev

# Contracts
katana --disable-fee
cd contracts && sozo migrate

# Frontend
cd frontend && npm run dev
```

### Production

1. **Backend**: PM2 process manager
2. **Frontend**: Vite build + Nginx
3. **Contracts**: Deploy to Starknet mainnet
4. **Database**: MongoDB Atlas or managed instance
5. **Cache**: Redis Cloud or managed instance

### Environment Variables

**Backend:**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
REDIS_URL=rediss://...
DOJO_RPC_URL=https://...
IPFS_API_TOKEN=...
```

**Frontend:**
```env
VITE_API_URL=https://api.instadojo.com
VITE_WS_URL=wss://api.instadojo.com
VITE_DOJO_MAINNET_RPC=https://...
```

## Testing Strategy

### Unit Tests
- Utility functions
- State management stores
- Validators

### Integration Tests
- API endpoints
- Database operations
- Smart contract functions

### E2E Tests
- User flows (Playwright/Cypress)
- Wallet connection
- Post creation flow
- Comment flow

## Future Enhancements

1. **NFT Posts**: Mint posts as NFTs
2. **Tipping**: Send tokens to creators
3. **Badges**: Achievement system
4. **Search**: Full-text post/user search
5. **Notifications**: Push notifications
6. **Direct Messages**: Encrypted DMs
7. **Groups**: Community features
8. **Mobile App**: React Native version
