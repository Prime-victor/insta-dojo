# Instadojo Setup Guide

Complete guide to setting up and running Instadojo locally.

## Prerequisites

### Required Software
- **Node.js** 18+ and npm
- **MongoDB** 6+
- **Redis** 7+
- **Dojo CLI** (Sozo)
- **Starknet Wallet** (Argent X or Braavos browser extension)

### Install Dojo CLI

```bash
curl -L https://install.dojoengine.org | bash
dojoup
```

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/instadojo.git
cd instadojo
```

## Step 2: Backend Setup

### 2.1 Start MongoDB and Redis

Using Docker Compose:

```bash
cd backend
docker-compose up -d
```

This starts:
- MongoDB on port 27017
- Redis on port 6379

### 2.2 Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` and configure:

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://admin:instadojo2024@localhost:27017/instadojo?authSource=admin
REDIS_URL=redis://:instadojo2024@localhost:6379
DOJO_RPC_URL=http://localhost:5050
IPFS_API_TOKEN=your_web3_storage_token
```

### 2.3 Install Dependencies

```bash
npm install
```

### 2.4 Start Backend Server

```bash
npm run dev
```

Backend runs on http://localhost:3001

## Step 3: Dojo Contracts Setup

### 3.1 Build Contracts

```bash
cd contracts
scarb build
```

### 3.2 Start Local Katana Node

```bash
katana --disable-fee
```

Katana runs on http://localhost:5050

### 3.3 Deploy Contracts

In a new terminal:

```bash
cd contracts
sozo build
sozo migrate
```

Note the deployed world address for later use.

## Step 4: Frontend Setup

### 4.1 Configure Environment

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_DOJO_RPC_URL=http://localhost:5050
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

### 4.2 Install Dependencies

```bash
npm install
```

### 4.3 Start Development Server

```bash
npm run dev
```

Frontend runs on http://localhost:5173

## Step 5: Connect Wallet

1. Install Argent X or Braavos extension
2. Create/import a wallet
3. Switch to localhost network in wallet settings:
   - Network: Custom
   - RPC URL: http://localhost:5050
   - Chain ID: KATANA

4. Visit http://localhost:5173
5. Click "Connect Wallet"
6. Create your profile

## Verification

### Check Backend Health

```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": 123
}
```

### Check MongoDB

```bash
mongosh "mongodb://admin:instadojo2024@localhost:27017/instadojo?authSource=admin"
```

```js
show dbs
use instadojo
show collections
```

### Check Redis

```bash
redis-cli -a instadojo2024
PING
```

Should return: `PONG`

### Check Dojo World

```bash
cd contracts
sozo world
```

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup.

## Troubleshooting

### Port Already in Use

If ports 3001, 5050, 27017, or 6379 are in use:

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>
```

### MongoDB Connection Error

Ensure MongoDB is running:
```bash
docker ps | grep mongo
```

Restart if needed:
```bash
docker-compose restart mongodb
```

### Wallet Connection Fails

1. Check wallet is on localhost network
2. Ensure Katana is running
3. Clear browser cache
4. Try different wallet

### IPFS Upload Fails

Get free Web3.Storage token:
1. Visit https://web3.storage
2. Sign up for free account
3. Create API token
4. Add to backend `.env`

## Getting Help

- Documentation: [docs/](./README.md)
- Issues: GitHub Issues
- Discord: [Join our server]
