# Instadojo API Documentation

Complete REST API reference for Instadojo backend.

## Base URL

```
http://localhost:3001/api
```

## Authentication

Most endpoints require Starknet wallet signature authentication.

### Request Format

```json
{
  "walletAddress": "0x123...",
  "signature": ["0x...", "0x..."],
  "message": "Action description",
  ...other fields
}
```

## Users

### Create User

```
POST /users/create
```

**Request:**
```json
{
  "walletAddress": "0x123abc...",
  "username": "alice",
  "avatar": "QmXxx...",
  "bio": "Web3 enthusiast",
  "signature": ["0x...", "0x..."],
  "message": "Create account: alice"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x123abc...",
    "username": "alice",
    "avatar": "QmXxx...",
    "bio": "Web3 enthusiast",
    "followerCount": 0,
    "followingCount": 0,
    "reputation": 0,
    "postCount": 0,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### Get User

```
GET /users/:address
```

**Response:**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x123abc...",
    "username": "alice",
    ...
  }
}
```

### Update User

```
PUT /users/:address
```

**Request:**
```json
{
  "username": "alice_updated",
  "avatar": "QmYxx...",
  "bio": "Updated bio",
  "walletAddress": "0x123abc...",
  "signature": ["0x...", "0x..."],
  "message": "Update profile: 1234567890"
}
```

### Get Followers

```
GET /users/:address/followers?limit=50&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "walletAddress": "0x456def...",
      "username": "bob",
      ...
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 150
  }
}
```

### Get Following

```
GET /users/:address/following?limit=50&offset=0
```

### Follow User

```
POST /users/follow
```

**Request:**
```json
{
  "targetAddress": "0x456def...",
  "walletAddress": "0x123abc...",
  "signature": ["0x...", "0x..."],
  "message": "Follow: 0x456def..."
}
```

### Unfollow User

```
POST /users/unfollow
```

## Posts

### Create Post

```
POST /posts
```

**Request:**
```json
{
  "content": "Hello Instadojo!",
  "contentHash": "0xabc123...",
  "media": [
    {
      "type": "image",
      "ipfsHash": "QmXxx...",
      "url": "https://ipfs.io/ipfs/QmXxx..."
    }
  ],
  "postType": "image",
  "walletAddress": "0x123abc...",
  "signature": ["0x...", "0x..."],
  "message": "Create post: 0xabc123..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "postId": "abc123",
    "authorAddress": "0x123abc...",
    "content": "Hello Instadojo!",
    "contentHash": "0xabc123...",
    "media": [...],
    "postType": "image",
    "likeCount": 0,
    "commentCount": 0,
    "timestamp": "2024-01-15T10:00:00.000Z",
    "onChainTx": "0xtx123...",
    "author": {
      "username": "alice",
      ...
    }
  }
}
```

### Get Post

```
GET /posts/:id
```

### Delete Post

```
DELETE /posts/:id
```

**Request:**
```json
{
  "walletAddress": "0x123abc...",
  "signature": ["0x...", "0x..."],
  "message": "Delete post: abc123"
}
```

### Get User Posts

```
GET /posts/user/:address?limit=20&offset=0
```

### Like Post

```
POST /posts/:id/like
```

### Unlike Post

```
DELETE /posts/:id/like
```

## Feed

### Get Basic Feed

Global chronological feed.

```
GET /feed/basic?limit=20&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "postId": "abc123",
      "authorAddress": "0x123abc...",
      "content": "Hello world!",
      ...
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 1000
  }
}
```

### Get Personalized Feed

Feed from followed users, ranked by engagement.

```
GET /feed/personalized/:address?limit=20&offset=0
```

**Algorithm:**
```
score = (likes × 2 + comments × 3) / (time_decay)
time_decay = (age_in_hours + 2) ^ 1.8
```

### Get Trending Feed

Top posts by engagement in last 24 hours.

```
GET /feed/trending?limit=20&timeframe=24
```

## Comments

### Create Comment

```
POST /comments
```

**Request:**
```json
{
  "postId": "abc123",
  "content": "Great post!",
  "contentHash": "0xdef456...",
  "parentId": null,
  "walletAddress": "0x123abc...",
  "signature": ["0x...", "0x..."],
  "message": "Comment: 0xdef456..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "commentId": "xyz789",
    "postId": "abc123",
    "authorAddress": "0x123abc...",
    "content": "Great post!",
    "contentHash": "0xdef456...",
    "parentId": null,
    "level": 0,
    "likeCount": 0,
    "replyCount": 0,
    "timestamp": "2024-01-15T10:00:00.000Z",
    "onChainTx": "0xtx456...",
    "author": {
      "username": "alice",
      ...
    }
  }
}
```

### Get Post Comments

```
GET /comments/post/:postId?limit=50&offset=0
```

Returns threaded comments with nested replies.

### Like Comment

```
POST /comments/:id/like
```

### Unlike Comment

```
DELETE /comments/:id/like
```

## WebSocket Events

Connect to `ws://localhost:3001`

### Client Events

**Authenticate:**
```js
socket.emit('authenticate', { walletAddress: '0x123...' });
```

**Subscribe to Feed:**
```js
socket.emit('subscribe:feed', { feedType: 'basic' });
```

**Subscribe to Post:**
```js
socket.emit('subscribe:post', { postId: 'abc123' });
```

**Unsubscribe from Post:**
```js
socket.emit('unsubscribe:post', { postId: 'abc123' });
```

### Server Events

**New Post:**
```js
socket.on('feed:newPost', (post) => {
  console.log('New post:', post);
});
```

**Post Updated:**
```js
socket.on('post:updated', (update) => {
  console.log('Post updated:', update);
});
```

**New Comment:**
```js
socket.on('comment:new', (comment) => {
  console.log('New comment:', comment);
});
```

**Notification:**
```js
socket.on('notification', (notification) => {
  console.log('Notification:', notification);
});
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": ["Validation error 1", "Validation error 2"]
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Server Error

## Rate Limits

- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- Post creation: 20 posts per hour
- Comments: 50 comments per hour
- Follow/Unfollow: 30 actions per hour

## CORS

Configured to allow requests from:
- `http://localhost:5173` (development)
- Production domains (when deployed)
