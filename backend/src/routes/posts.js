import express from 'express';
import { nanoid } from 'nanoid';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Like from '../models/Like.js';
import { validateWalletSignature } from '../middleware/auth.js';
import { validateRequest, postSchemas } from '../middleware/validation.js';
import { postLimiter } from '../middleware/rateLimiter.js';
import { dojoClient } from '../utils/dojo.js';
import { redisClient } from '../utils/redis.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

router.post('/', postLimiter, validateRequest(postSchemas.create), validateWalletSignature, async (req, res) => {
  try {
    const { content, contentHash, media, postType, repostOf } = req.body;
    const authorAddress = req.authenticatedAddress;

    const user = await User.findOne({ walletAddress: authorAddress });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (repostOf) {
      const originalPost = await Post.findOne({ postId: repostOf, isDeleted: false });
      if (!originalPost) {
        return res.status(404).json({
          success: false,
          error: 'Original post not found'
        });
      }
      await Post.updateOne({ postId: repostOf }, { $inc: { repostCount: 1 } });
    }

    const txResult = await dojoClient.submitPostToChain(
      authorAddress,
      contentHash,
      postType === 'text' ? 0 : postType === 'image' ? 1 : 2
    );

    const post = new Post({
      postId: nanoid(),
      authorAddress,
      content,
      contentHash,
      media: media || [],
      postType,
      repostOf: repostOf || null,
      onChainTx: txResult.transactionHash
    });

    await post.save();

    await User.updateOne(
      { walletAddress: authorAddress },
      { $inc: { postCount: 1, reputation: 5 } }
    );

    await redisClient.del(`feed:basic:0`);
    await redisClient.del(`feed:personalized:${authorAddress}`);

    logger.info(`New post created: ${post.postId} by ${authorAddress}`);

    res.status(201).json({
      success: true,
      data: {
        ...post.toObject(),
        author: user.toPublicJSON()
      }
    });
  } catch (error) {
    logger.error('Create post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create post'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findOne({ postId: id, isDeleted: false });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const author = await User.findOne({ walletAddress: post.authorAddress });

    res.json({
      success: true,
      data: {
        ...post.toObject(),
        author: author ? author.toPublicJSON() : null
      }
    });
  } catch (error) {
    logger.error('Get post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch post'
    });
  }
});

router.delete('/:id', validateWalletSignature, async (req, res) => {
  try {
    const { id } = req.params;
    const userAddress = req.authenticatedAddress;

    const post = await Post.findOne({ postId: id, isDeleted: false });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    if (post.authorAddress !== userAddress) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    post.isDeleted = true;
    await post.save();

    await User.updateOne(
      { walletAddress: userAddress },
      { $inc: { postCount: -1 } }
    );

    await redisClient.del(`feed:basic:0`);
    await redisClient.del(`feed:personalized:${userAddress}`);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    logger.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete post'
    });
  }
});

router.get('/user/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const posts = await Post.find({
      authorAddress: address.toLowerCase(),
      isDeleted: false
    })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();

    const author = await User.findOne({ walletAddress: address.toLowerCase() });

    const enrichedPosts = posts.map(post => ({
      ...post,
      author: author ? author.toPublicJSON() : null
    }));

    res.json({
      success: true,
      data: enrichedPosts,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: await Post.countDocuments({
          authorAddress: address.toLowerCase(),
          isDeleted: false
        })
      }
    });
  } catch (error) {
    logger.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user posts'
    });
  }
});

router.post('/:id/like', validateWalletSignature, async (req, res) => {
  try {
    const { id } = req.params;
    const userAddress = req.authenticatedAddress;

    const post = await Post.findOne({ postId: id, isDeleted: false });
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const existingLike = await Like.findOne({
      userAddress,
      targetId: id,
      targetType: 'post'
    });

    if (existingLike) {
      return res.status(400).json({
        success: false,
        error: 'Already liked this post'
      });
    }

    const txResult = await dojoClient.submitLikeToChain(userAddress, id, 'post');

    const like = new Like({
      userAddress,
      targetId: id,
      targetType: 'post',
      onChainTx: txResult.transactionHash
    });

    await like.save();

    await Post.updateOne({ postId: id }, { $inc: { likeCount: 1 } });

    await User.updateOne(
      { walletAddress: post.authorAddress },
      { $inc: { reputation: 2 } }
    );

    res.status(201).json({
      success: true,
      data: {
        liked: true,
        likeCount: post.likeCount + 1
      }
    });
  } catch (error) {
    logger.error('Like post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like post'
    });
  }
});

router.delete('/:id/like', validateWalletSignature, async (req, res) => {
  try {
    const { id } = req.params;
    const userAddress = req.authenticatedAddress;

    const like = await Like.findOneAndDelete({
      userAddress,
      targetId: id,
      targetType: 'post'
    });

    if (!like) {
      return res.status(404).json({
        success: false,
        error: 'Like not found'
      });
    }

    const post = await Post.findOne({ postId: id });
    if (post) {
      await Post.updateOne({ postId: id }, { $inc: { likeCount: -1 } });

      await User.updateOne(
        { walletAddress: post.authorAddress },
        { $inc: { reputation: -2 } }
      );
    }

    res.json({
      success: true,
      data: {
        liked: false,
        likeCount: Math.max(0, (post?.likeCount || 1) - 1)
      }
    });
  } catch (error) {
    logger.error('Unlike post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unlike post'
    });
  }
});

export default router;
