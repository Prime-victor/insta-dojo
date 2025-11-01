# Instadojo - Decentralized Social Media Platform

Instadojo is a Web3-native social media platform built on Starknet using the Dojo Engine. It combines the best features of Instagram and Twitter with blockchain-based identity and content verification.

## Features

- **Wallet-Based Authentication**: Connect with Argent X or Braavos wallets
- **On-Chain Verification**: Content hashes and interactions recorded on Starknet
- **IPFS Storage**: Decentralized media storage
- **Real-Time Updates**: Live feed updates via Socket.io
- **Personalized Feeds**: Algorithm-based content ranking
- **Threaded Comments**: Up to 3 levels of nested replies
- **Follow System**: Build your social graph
- **Reputation System**: Earn reputation through engagement

## Tech Stack

### Frontend
- React 18 + TypeScript
- TailwindCSS for styling
- Zustand for state management
- React Router for navigation
- Socket.io-client for real-time
- Starknet.js for wallet integration

### Backend
- Node.js + Express.js
- MongoDB for data storage
- Redis for caching
- Socket.io for WebSockets
- IPFS for media storage

### Blockchain
- Dojo Engine (Cairo)
- Starknet for on-chain verification

## Project Structure

```
instadojo/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/          # Route pages
│   │   ├── stores/         # Zustand stores
│   │   ├── utils/          # Helper functions
│   │   └── types/          # TypeScript types
│   └── package.json
├── backend/                 # Express API
│   ├── src/
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth & validation
│   │   ├── sockets/        # WebSocket handlers
│   │   └── utils/          # Utilities
│   ├── docker-compose.yml  # MongoDB + Redis
│   └── package.json
├── contracts/               # Dojo smart contracts
│   ├── src/
│   │   ├── components.cairo
│   │   ├── systems.cairo
│   │   └── tests.cairo
│   └── Scarb.toml
└── docs/                    # Documentation
```

## Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Redis 7+
- Dojo CLI
- Starknet wallet (Argent X or Braavos)

### Installation

1. Clone the repository
2. Set up backend services
3. Deploy Dojo contracts
4. Start the frontend

## API Endpoints

See [API.md](./API.md) for complete API documentation.

## Smart Contracts

See [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) for contract documentation.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License
