# Instadojo

A decentralized social media platform built on Starknet with the Dojo Engine.

## Overview

Instadojo combines the best features of Instagram and Twitter with Web3 technology:

- **Wallet-Based Identity**: Connect with Argent X or Braavos
- **On-Chain Verification**: Content hashes and social graph on Starknet
- **Decentralized Storage**: Media stored on IPFS
- **Real-Time Updates**: Live feed via WebSockets
- **Algorithmic Feeds**: Personalized and trending content

## Features

- Create text, image, and video posts
- Like and comment with threaded replies (3 levels)
- Follow users and build your social graph
- Earn reputation through engagement
- Real-time notifications
- Personalized and trending feeds

## Tech Stack

**Frontend:** React 18, TypeScript, TailwindCSS, Zustand, Socket.io-client
**Backend:** Express.js, MongoDB, Redis, Socket.io
**Blockchain:** Dojo Engine (Cairo), Starknet
**Storage:** IPFS for media files

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Redis 7+
- Dojo CLI
- Starknet wallet

### Installation

1. **Start Backend Services**
```bash
cd backend
docker-compose up -d
cp .env.example .env
npm install
npm run dev
```

2. **Deploy Dojo Contracts**
```bash
cd contracts
sozo build
katana --disable-fee  # In separate terminal
sozo migrate
```

3. **Start Frontend**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

4. **Connect Wallet**
- Visit http://localhost:5173
- Install Argent X or Braavos
- Connect your wallet
- Create your profile

## Documentation

- [Setup Guide](./docs/SETUP.md) - Detailed installation instructions
- [API Documentation](./docs/API.md) - REST API reference
- [Smart Contracts](./docs/SMART_CONTRACTS.md) - Dojo contracts guide

## Project Structure

```
instadojo/
├── frontend/          # React + TypeScript UI
├── backend/           # Express.js API server
├── contracts/         # Dojo smart contracts
└── docs/             # Documentation
```

## API Endpoints

- `POST /api/users/create` - Create profile
- `GET /api/feed/basic` - Get global feed
- `POST /api/posts` - Create post
- `POST /api/comments` - Add comment
- `POST /api/users/follow` - Follow user

See [API.md](./docs/API.md) for complete reference.

## Smart Contracts

Dojo components:
- **Profile** - User profiles and reputation
- **Post** - Content verification
- **Follow** - Social graph
- **Like** - Engagement tracking
- **Comment** - Comment verification

See [SMART_CONTRACTS.md](./docs/SMART_CONTRACTS.md) for details.

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and open a PR

## License

MIT License

## Support

- GitHub Issues: Report bugs and request features
- Documentation: Check the docs/ folder
- Discord: Join our community

---

Built with ❤️ using Dojo Engine and Starknet
