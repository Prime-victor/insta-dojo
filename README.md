
# **Instadojo**
A Web3-native decentralized social media platform powered by **Dojo Engine**, **React**, **Express**, **MongoDB**, **IPFS**, and **Starknet wallets**.  
Think Instagram/Twitter — **on-chain**, censorship-resistant, and creator-aligned.

---

## 🚀 Introduction
Instadojo reimagines social platforms by shifting identity, content verification, and reputation **on-chain**, while storing large media **off-chain** on IPFS.

This hybrid architecture enables:

✅ Cryptographic identity  
✅ Tamper-proof timestamps  
✅ Verifiable content authorship  
✅ Incentivized engagement  
✅ Community-driven moderation

All while keeping a smooth, familiar Web2 UX.

---

## 🎯 Key Features
- 🔐 Wallet-based authentication (Starknet)
- 👤 On-chain profiles + off-chain metadata
- 📝 Text/image/video content
- 💬 Threaded comments (3-level nesting)
- ❤️ Likes, shares, reposts
- 📰 Real-time feed (Socket.io)
- 👥 On-chain follow/unfollow graph
- 🎖 User reputation scoring
- 🌐 Personalized feed ranking
- 🔗 Content hash verification

---

## 🧬 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, TailwindCSS, Zustand |
| Backend | Node.js, Express.js, Socket.io |
| Web3 | Dojo Engine (Cairo/Sozo), Starknet wallets |
| Database | MongoDB (off-chain metadata) |
| Cache/Sessions | Redis |
| Storage | IPFS via Infura + Cloudflare R2 CDN |
| Real-time | WebSockets |

---

## 🏗 High-Level Architecture
```

Frontend (React/TS) ↔ Express API ↔ MongoDB/Redis
↓
Dojo Engine
↓
IPFS Storage

```

---

## 📁 Repository Structure
```

instadojo/
├── contracts/                # Dojo/Cairo smart contracts
│   ├── Scarb.toml
│   ├── scripts/
│   └── src/
├── backend/
│   ├── src/
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express routes
│   │   ├── middleware/       # Auth & validation
│   │   ├── services/         # Business logic
│   │   ├── sockets/          # WebSocket handlers
│   │   └── utils/            # Dojo/IPFS helpers
│   ├── docker-compose.yml
│   └── ecosystem.config.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── types/
│   │   └── utils/
│   └── tailwind.config.js
└── docs/
├── API.md
├── DEPLOYMENT.md
└── SMART_CONTRACTS.md

```

---

## 👤 User System
- Wallet-based auth via Dojo (Starknet)
- Profiles: username, avatar (IPFS), bio
- On-chain follow/unfollow
- Reputation engine

---

## 📝 Post System
Posts include:
- Text, image, video
- Content hashes stored on-chain
- Engagement metadata tracked off-chain
- IPFS media storage

---

## 📰 Feed System
- Global feed (reverse chronological)
- Personalized feed using ranking formula:

```

score = (likes × 2 + comments × 3) / time_decay

```

Delivered via WebSockets.

---

## 💬 Comment System
- Threaded (max depth 3)
- On-chain authorship proof
- Engagement metrics tracked

---

## 🔧 Backend API Endpoints

### Users
```

POST   /api/users/create
GET    /api/users/:address
PUT    /api/users/:address
GET    /api/users/:address/followers
GET    /api/users/:address/following
POST   /api/users/follow
POST   /api/users/unfollow

```

### Posts
```

POST   /api/posts
GET    /api/posts/:id
GET    /api/posts/user/:address
DELETE /api/posts/:id

```

### Feed
```

GET    /api/feed/basic
GET    /api/feed/personalized/:address
WS     /ws/feed

```

### Comments
```

POST   /api/comments
GET    /api/comments/post/:postId

````

---

## ⚙️ Middleware
- `validateWalletSignature` (Dojo sign-in)
- `rateLimiting`
- `logging`
- `cors`
- `authGuard`

---

## 🗃 Database Models

### User
```ts
walletAddress, username, avatar, bio, followerCount, followingCount, createdAt
````

### Post

```ts
authorAddress, media, contentHash, likeCount, timestamp, onChainTx
```

---

## ⛓ Dojo Engine Components (Cairo)

```cairo
#[component]
struct Profile {
    username: felt252,
    avatar: felt252,
    bio: felt252,
    follower_count: u32,
    following_count: u32,
    reputation: u32,
}
```

```cairo
#[component]
struct Post {
    author: ContractAddress,
    content_hash: felt252,
    post_type: u8,
    timestamp: u64,
    like_count: u32,
}
```

---

## 🧪 On-Chain Systems

* `create_post`
* `follow_user`
* `like_post`
* anti-spam throttling

---

## 🛠 Local Development Setup

### Prerequisites

* Node.js 18+
* Docker & Docker Compose
* MongoDB 6+
* Redis 7+
* Dojo CLI
* Starknet wallet extension

---

### 1️⃣ Contracts

```bash
cd contracts
scarb build
sozo build
sozo migrate
```

---

### 2️⃣ Backend

```bash
cd backend
npm install
cp .env.example .env
docker-compose up -d
npm run dev
```

---

### 3️⃣ Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## 🔑 Environment Variables

```
# Backend
MONGODB_URI=mongodb://localhost:27017/instadojo
REDIS_URL=redis://localhost:6379
DOJO_RPC_URL=http://localhost:5050

# IPFS
VITE_INFURA_PROJECT_ID=...
VITE_INFURA_PROJECT_SECRET=...

# Frontend
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

---

## 🎁 Bonus Features (Optional)

* NFT-minted posts
* On-chain tipping
* Content staking
* Achievement badges
* Cross-chain identity linking
* DAO-driven moderation

---

## 📊 Performance Goals

| Metric      | Target      |
| ----------- | ----------- |
| Feed load   | < 2 seconds |
| API latency | < 500ms     |
| Onboarding  | < 3 minutes |
| Uptime      | 99.9%       |

---

## 🔐 Security Considerations

* Signature-based auth
* Rate limiting
* On-chain author verification
* Sybil resistance via reputation

---

## 🏁 Roadmap

* [ ] Direct messaging (encrypted)
* [ ] Tokenized tipping
* [ ] React Native mobile app
* [ ] ZK-filtered feeds
* [ ] Advanced ranking engine

---

## 🤝 Contributing

Happy to accept:

* Bug fixes
* UI improvements
* Contract optimizations
* Feed algorithm tweaks

Before PR:

```bash
npm run lint
npm run test
```

---

## 📜 License

MIT — build, remix, fork.

---

## ⭐ Support Decentralized Social

Star the repo to support the movement:

👉 [https://github.com/Prime-victor/insta-dojo](https://github.com/Prime-victor/insta-dojo)

---

## 🧵 Need Help?

Open an issue or DM the maintainer.

```
