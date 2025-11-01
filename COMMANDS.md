# Instadojo - Command Reference

Quick reference for all common commands.

## Backend Commands

### Setup
```bash
cd backend
npm install
cp .env.example .env
```

### Development
```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
```

### Docker
```bash
docker-compose up -d           # Start MongoDB + Redis
docker-compose down            # Stop services
docker-compose restart         # Restart services
docker-compose logs -f mongodb # View MongoDB logs
docker-compose logs -f redis   # View Redis logs
```

### Database
```bash
# Connect to MongoDB
mongosh "mongodb://admin:instadojo2024@localhost:27017/instadojo?authSource=admin"

# MongoDB shell commands
show dbs
use instadojo
show collections
db.users.find()
db.posts.find().limit(10)
db.users.countDocuments()
```

### Redis
```bash
# Connect to Redis
redis-cli -a instadojo2024

# Redis commands
PING
KEYS *
GET user:0x123...
FLUSHALL  # Clear all cache (use with caution!)
```

## Frontend Commands

### Setup
```bash
cd frontend
npm install
cp .env.example .env
```

### Development
```bash
npm run dev        # Start Vite dev server (http://localhost:5173)
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type checking
```

## Smart Contracts Commands

### Setup
```bash
cd contracts
```

### Build
```bash
scarb build        # Build with Scarb
sozo build         # Build with Sozo
```

### Local Deployment
```bash
# Terminal 1: Start Katana
katana --disable-fee

# Terminal 2: Deploy contracts
sozo migrate

# View world info
sozo world
```

### Testing
```bash
sozo test                      # Run all tests
sozo test test_create_profile  # Run specific test
```

### Testnet Deployment
```bash
# Deploy to Sepolia
sozo migrate --network sepolia

# Verify deployment
sozo world --network sepolia
```

## Full Stack Commands

### Start Everything (Development)

```bash
# Terminal 1: Backend services
cd backend
docker-compose up -d

# Terminal 2: Backend server
cd backend
npm run dev

# Terminal 3: Katana (local blockchain)
katana --disable-fee

# Terminal 4: Deploy contracts
cd contracts
sozo migrate

# Terminal 5: Frontend
cd frontend
npm run dev
```

### Stop Everything
```bash
# Stop backend services
cd backend
docker-compose down

# Ctrl+C in all other terminals
```

### Clean Everything
```bash
# Clean node_modules
rm -rf frontend/node_modules backend/node_modules
rm -rf frontend/package-lock.json backend/package-lock.json

# Clean build artifacts
rm -rf frontend/dist backend/dist

# Clean contract artifacts
rm -rf contracts/target contracts/Scarb.lock

# Clean MongoDB data (WARNING: deletes all data)
docker-compose down -v
```

## Git Commands

### Initial Setup
```bash
git init
git add .
git commit -m "Initial commit: Instadojo platform"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### Regular Workflow
```bash
git status
git add .
git commit -m "Add feature: <description>"
git push
```

## Troubleshooting Commands

### Check Services
```bash
# Check if ports are in use
lsof -i :3001  # Backend
lsof -i :5173  # Frontend
lsof -i :27017 # MongoDB
lsof -i :6379  # Redis
lsof -i :5050  # Katana

# Kill process on port
kill -9 <PID>
```

### Check Backend Health
```bash
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","timestamp":"...","uptime":123}
```

### Check Database Connection
```bash
# MongoDB
docker exec -it instadojo-mongodb mongosh -u admin -p instadojo2024

# Redis
docker exec -it instadojo-redis redis-cli -a instadojo2024
```

### View Logs
```bash
# Backend logs
tail -f backend/logs/combined.log
tail -f backend/logs/error.log

# Docker logs
docker-compose logs -f
```

### Restart Services
```bash
# Restart specific service
docker-compose restart mongodb
docker-compose restart redis

# Restart all services
docker-compose restart
```

## Useful Development Commands

### Backend API Testing
```bash
# Test user creation
curl -X POST http://localhost:3001/api/users/create \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x123abc...",
    "username": "testuser",
    "avatar": "",
    "bio": "Test bio",
    "signature": ["0x...", "0x..."],
    "message": "Create account: testuser"
  }'

# Get user
curl http://localhost:3001/api/users/0x123abc...

# Get basic feed
curl http://localhost:3001/api/feed/basic
```

### Database Queries
```javascript
// MongoDB - Count posts
db.posts.countDocuments({ isDeleted: false })

// MongoDB - Find user
db.users.findOne({ username: "alice" })

// MongoDB - Get recent posts
db.posts.find({ isDeleted: false })
  .sort({ timestamp: -1 })
  .limit(10)

// MongoDB - Clear collections (DEV ONLY)
db.posts.deleteMany({})
db.comments.deleteMany({})
db.likes.deleteMany({})
```

### Redis Cache Management
```bash
# View cached feeds
redis-cli -a instadojo2024
KEYS feed:*

# Clear specific cache
DEL feed:basic:0

# Clear all feed caches
KEYS feed:* | xargs redis-cli -a instadojo2024 DEL

# View cache TTL
TTL user:0x123...
```

## Production Commands

### Build for Production
```bash
# Frontend
cd frontend
npm run build
# Output in frontend/dist/

# Backend (if using TypeScript)
cd backend
npm run build
```

### Deploy with PM2
```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start src/server.js --name instadojo-api

# View logs
pm2 logs instadojo-api

# Restart
pm2 restart instadojo-api

# Stop
pm2 stop instadojo-api
```

### Environment Setup (Production)
```bash
# Backend
export NODE_ENV=production
export MONGODB_URI=mongodb+srv://...
export REDIS_URL=rediss://...

# Frontend
export VITE_API_URL=https://api.instadojo.com
export VITE_WS_URL=wss://api.instadojo.com
```

## Package Management

### Update Dependencies
```bash
# Check outdated packages
npm outdated

# Update all packages
npm update

# Update specific package
npm install package-name@latest

# Install security updates
npm audit fix
```

### Add New Package
```bash
# Frontend
cd frontend
npm install package-name

# Backend
cd backend
npm install package-name
```

## Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│                 Quick Commands                       │
├─────────────────────────────────────────────────────┤
│ Start Backend:   cd backend && npm run dev          │
│ Start Frontend:  cd frontend && npm run dev         │
│ Start Katana:    katana --disable-fee               │
│ Deploy Dojo:     cd contracts && sozo migrate       │
│ Start MongoDB:   docker-compose up -d               │
│ Backend API:     http://localhost:3001              │
│ Frontend:        http://localhost:5173              │
│ MongoDB:         mongodb://localhost:27017          │
│ Redis:           redis://localhost:6379             │
│ Katana:          http://localhost:5050              │
└─────────────────────────────────────────────────────┘
```

## Aliases (Optional)

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# Instadojo aliases
alias ij-backend="cd ~/instadojo/backend && npm run dev"
alias ij-frontend="cd ~/instadojo/frontend && npm run dev"
alias ij-katana="katana --disable-fee"
alias ij-migrate="cd ~/instadojo/contracts && sozo migrate"
alias ij-docker="cd ~/instadojo/backend && docker-compose"
alias ij-logs="tail -f ~/instadojo/backend/logs/combined.log"
alias ij-mongo="mongosh 'mongodb://admin:instadojo2024@localhost:27017/instadojo?authSource=admin'"
alias ij-redis="redis-cli -a instadojo2024"
```

Then:
```bash
source ~/.bashrc  # or ~/.zshrc
ij-backend       # Start backend
ij-frontend      # Start frontend
```
