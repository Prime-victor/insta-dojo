# Instadojo Smart Contracts

Dojo Engine smart contracts for on-chain verification and social graph.

## Overview

Instadojo uses Dojo Engine (Cairo) to store critical data on-chain while keeping media and metadata off-chain for efficiency.

## Components

### Profile

Stores user profile information on-chain.

```cairo
struct Profile {
    address: ContractAddress,
    username: felt252,
    avatar_hash: felt252,
    bio: felt252,
    follower_count: u32,
    following_count: u32,
    reputation: u32,
    post_count: u32,
    created_at: u64,
}
```

**On-Chain:** Username, reputation, counts, timestamps
**Off-Chain:** Full bio text, avatar images

### Post

Stores post verification data.

```cairo
struct Post {
    post_id: felt252,
    author: ContractAddress,
    content_hash: felt252,
    post_type: u8,
    timestamp: u64,
    like_count: u32,
    comment_count: u32,
    is_deleted: bool,
}
```

**On-Chain:** Content hash (for verification), author, timestamp
**Off-Chain:** Actual content, media files

### Follow

Tracks follow relationships.

```cairo
struct Follow {
    follower: ContractAddress,
    following: ContractAddress,
    timestamp: u64,
}
```

### Like

Tracks likes on posts and comments.

```cairo
struct Like {
    user: ContractAddress,
    target_id: felt252,
    target_type: u8,
    timestamp: u64,
}
```

### Comment

Stores comment verification data.

```cairo
struct Comment {
    comment_id: felt252,
    post_id: felt252,
    author: ContractAddress,
    content_hash: felt252,
    parent_id: felt252,
    level: u8,
    timestamp: u64,
    like_count: u32,
}
```

## Systems

### Profile System

**create_profile**
```cairo
fn create_profile(
    ref world: IWorldDispatcher,
    username: felt252,
    avatar_hash: felt252,
    bio: felt252
)
```

Creates a new user profile. Can only be called once per address.

**update_profile**
```cairo
fn update_profile(
    ref world: IWorldDispatcher,
    username: felt252,
    avatar_hash: felt252,
    bio: felt252
)
```

Updates existing profile. Only callable by profile owner.

### Post System

**create_post**
```cairo
fn create_post(
    ref world: IWorldDispatcher,
    post_id: felt252,
    content_hash: felt252,
    post_type: u8
)
```

Records post creation on-chain. Increments user post count and reputation.

**delete_post**
```cairo
fn delete_post(
    ref world: IWorldDispatcher,
    post_id: felt252
)
```

Marks post as deleted. Only callable by post author.

**like_post**
```cairo
fn like_post(
    ref world: IWorldDispatcher,
    post_id: felt252
)
```

Records a like. Increments post like count and author reputation.

**unlike_post**
```cairo
fn unlike_post(
    ref world: IWorldDispatcher,
    post_id: felt252
)
```

Removes a like. Decrements counts.

### Follow System

**follow**
```cairo
fn follow(
    ref world: IWorldDispatcher,
    target: ContractAddress
)
```

Creates follow relationship. Updates both users' follower/following counts.

**unfollow**
```cairo
fn unfollow(
    ref world: IWorldDispatcher,
    target: ContractAddress
)
```

Removes follow relationship. Updates counts.

## Deployment

### Prerequisites

- Dojo CLI installed
- Katana running (local) or Starknet RPC URL (testnet/mainnet)

### Local Deployment

```bash
cd contracts

# Build contracts
sozo build

# Start Katana (in separate terminal)
katana --disable-fee

# Deploy to Katana
sozo migrate
```

### Testnet Deployment

```bash
# Configure testnet in Scarb.toml
[tool.dojo.env]
rpc_url = "https://api.cartridge.gg/x/starknet/sepolia"
account_address = "0x..."
private_key = "0x..."

# Deploy
sozo migrate --network sepolia
```

### Mainnet Deployment

```bash
# Configure mainnet in Scarb.toml
[tool.dojo.env]
rpc_url = "https://api.cartridge.gg/x/starknet/mainnet"
account_address = "0x..."
private_key = "0x..."

# Deploy
sozo migrate --network mainnet
```

## Integration

### Frontend Integration

```typescript
import { Provider, Contract } from 'starknet';

const provider = new Provider({
  nodeUrl: 'http://localhost:5050'
});

// Read profile
const profile = await provider.callContract({
  contractAddress: worldAddress,
  entrypoint: 'get',
  calldata: [userAddress, 'Profile']
});
```

### Backend Integration

The backend uses the Dojo client wrapper:

```javascript
import { dojoClient } from './utils/dojo.js';

// Submit post to chain
const tx = await dojoClient.submitPostToChain(
  authorAddress,
  contentHash,
  postType
);
```

## Content Verification

### Creating Content Hash

```typescript
import { hash } from 'starknet';

function createContentHash(content: string, media: any[]): string {
  const data = JSON.stringify({
    content,
    media,
    timestamp: Date.now()
  });
  return hash.computeHashOnElements([data]);
}
```

### Verifying Content

1. Retrieve content hash from chain
2. Hash the off-chain content
3. Compare hashes

```typescript
const chainHash = await getPostHashFromChain(postId);
const localHash = createContentHash(content, media);

if (chainHash === localHash) {
  console.log('Content verified!');
}
```

## Reputation System

Users earn reputation through engagement:

- Create post: +5 reputation
- Receive like: +2 reputation
- Receive comment: +3 reputation

Reputation is used for:
- Ranking in trending feeds
- Future features (verified badges, etc.)

## Gas Optimization

To minimize gas costs:

1. **Batch Operations**: Group multiple actions when possible
2. **Off-Chain Data**: Store large data off-chain, only hashes on-chain
3. **Lazy Updates**: Update counts periodically rather than per-action
4. **Efficient Types**: Use u32 instead of u256 where possible

## Security Considerations

### Access Control

- Only profile owner can update profile
- Only post author can delete post
- Signature verification for all write operations

### Anti-Spam

- Rate limiting in backend
- Reputation thresholds for certain actions
- Maximum comment nesting (3 levels)

### Data Validation

- Username length limits
- Content hash verification
- Timestamp validation
- Prevent self-following

## Testing

```bash
cd contracts

# Run tests
sozo test

# Specific test
sozo test test_create_profile
```

## Upgrading Contracts

Dojo contracts are upgradeable:

```bash
# Update contract code
vim src/systems.cairo

# Rebuild
sozo build

# Upgrade
sozo migrate --upgrade
```

## Events

Contracts emit events for important state changes:

```cairo
#[event]
fn ProfileCreated(address: ContractAddress, username: felt252);

#[event]
fn PostCreated(post_id: felt252, author: ContractAddress);

#[event]
fn FollowCreated(follower: ContractAddress, following: ContractAddress);
```

Listen to events in frontend:

```typescript
provider.on('ProfileCreated', (event) => {
  console.log('New profile:', event);
});
```

## Resources

- [Dojo Book](https://book.dojoengine.org/)
- [Cairo Documentation](https://book.cairo-lang.org/)
- [Starknet Documentation](https://docs.starknet.io/)
