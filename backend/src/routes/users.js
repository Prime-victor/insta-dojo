import express from 'express';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import { validateWalletSignature } from '../middleware/auth.js';
import { validateRequest, userSchemas, followSchemas } from '../middleware/validation.js';
import { authLimiter, followLimiter } from '../middleware/rateLimiter.js';
import { dojoClient } from '../utils/dojo.js';
import { redisClient } from '../utils/redis.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

router.post('/create', authLimiter, validateRequest(userSchemas.create), validateWalletSignature, async (req, res) => {
  try {
    const { walletAddress, username, avatar, bio } = req.body;

    const existingUser = await User.findOne({
      $or: [
        { walletAddress: walletAddress.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this wallet address or username'
      });
    }

    const user = new User({
      walletAddress: walletAddress.toLowerCase(),
      username,
      avatar,
      bio
    });

    await user.save();

    await redisClient.set(`user:${walletAddress.toLowerCase()}`, JSON.stringify(user.toPublicJSON()), 3600);

    logger.info(`New user created: ${username} (${walletAddress})`);

    res.status(201).json({
      success: true,
      data: user.toPublicJSON()
    });
  } catch (error) {
    logger.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
});

router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const cacheKey = `user:${address.toLowerCase()}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: JSON.parse(cached)
      });
    }

    const user = await User.findOne({ walletAddress: address.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await redisClient.set(cacheKey, JSON.stringify(user.toPublicJSON()), 3600);

    res.json({
      success: true,
      data: user.toPublicJSON()
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

router.put('/:address', validateRequest(userSchemas.update), validateWalletSignature, async (req, res) => {
  try {
    const { address } = req.params;
    const { username, avatar, bio } = req.body;

    if (req.authenticatedAddress !== address.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const user = await User.findOne({ walletAddress: address.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          error: 'Username already taken'
        });
      }
      user.username = username;
    }

    if (avatar !== undefined) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    await redisClient.del(`user:${address.toLowerCase()}`);

    res.json({
      success: true,
      data: user.toPublicJSON()
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

router.get('/:address/followers', async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const followers = await Follow.find({ following: address.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();

    const followerAddresses = followers.map(f => f.follower);
    const users = await User.find({ walletAddress: { $in: followerAddresses } });

    res.json({
      success: true,
      data: users.map(u => u.toPublicJSON()),
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: await Follow.countDocuments({ following: address.toLowerCase() })
      }
    });
  } catch (error) {
    logger.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch followers'
    });
  }
});

router.get('/:address/following', async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const following = await Follow.find({ follower: address.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();

    const followingAddresses = following.map(f => f.following);
    const users = await User.find({ walletAddress: { $in: followingAddresses } });

    res.json({
      success: true,
      data: users.map(u => u.toPublicJSON()),
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: await Follow.countDocuments({ follower: address.toLowerCase() })
      }
    });
  } catch (error) {
    logger.error('Get following error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch following'
    });
  }
});

router.post('/follow', followLimiter, validateRequest(followSchemas.follow), validateWalletSignature, async (req, res) => {
  try {
    const { targetAddress, walletAddress } = req.body;

    if (walletAddress.toLowerCase() === targetAddress.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot follow yourself'
      });
    }

    const targetUser = await User.findOne({ walletAddress: targetAddress.toLowerCase() });
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'Target user not found'
      });
    }

    const existingFollow = await Follow.findOne({
      follower: walletAddress.toLowerCase(),
      following: targetAddress.toLowerCase()
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        error: 'Already following this user'
      });
    }

    const txResult = await dojoClient.submitFollowToChain(
      walletAddress.toLowerCase(),
      targetAddress.toLowerCase()
    );

    const follow = new Follow({
      follower: walletAddress.toLowerCase(),
      following: targetAddress.toLowerCase(),
      onChainTx: txResult.transactionHash
    });

    await follow.save();

    await User.updateOne(
      { walletAddress: walletAddress.toLowerCase() },
      { $inc: { followingCount: 1 } }
    );

    await User.updateOne(
      { walletAddress: targetAddress.toLowerCase() },
      { $inc: { followerCount: 1 } }
    );

    await redisClient.del(`user:${walletAddress.toLowerCase()}`);
    await redisClient.del(`user:${targetAddress.toLowerCase()}`);

    res.status(201).json({
      success: true,
      data: {
        follower: walletAddress.toLowerCase(),
        following: targetAddress.toLowerCase(),
        transactionHash: txResult.transactionHash
      }
    });
  } catch (error) {
    logger.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to follow user'
    });
  }
});

router.post('/unfollow', followLimiter, validateRequest(followSchemas.follow), validateWalletSignature, async (req, res) => {
  try {
    const { targetAddress, walletAddress } = req.body;

    const follow = await Follow.findOneAndDelete({
      follower: walletAddress.toLowerCase(),
      following: targetAddress.toLowerCase()
    });

    if (!follow) {
      return res.status(404).json({
        success: false,
        error: 'Follow relationship not found'
      });
    }

    await User.updateOne(
      { walletAddress: walletAddress.toLowerCase() },
      { $inc: { followingCount: -1 } }
    );

    await User.updateOne(
      { walletAddress: targetAddress.toLowerCase() },
      { $inc: { followerCount: -1 } }
    );

    await redisClient.del(`user:${walletAddress.toLowerCase()}`);
    await redisClient.del(`user:${targetAddress.toLowerCase()}`);

    res.json({
      success: true,
      message: 'Unfollowed successfully'
    });
  } catch (error) {
    logger.error('Unfollow user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unfollow user'
    });
  }
});

export default router;
