import express from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import { redisClient } from '../utils/redis.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

router.get('/basic', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const cacheKey = `feed:basic:${offset}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: JSON.parse(cached).data,
        pagination: JSON.parse(cached).pagination,
        cached: true
      });
    }

    const posts = await Post.find({ isDeleted: false })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();

    const authorAddresses = [...new Set(posts.map(p => p.authorAddress))];
    const authors = await User.find({ walletAddress: { $in: authorAddresses } });

    const authorsMap = {};
    authors.forEach(author => {
      authorsMap[author.walletAddress] = author.toPublicJSON();
    });

    const enrichedPosts = posts.map(post => ({
      ...post,
      author: authorsMap[post.authorAddress] || null
    }));

    const response = {
      data: enrichedPosts,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: await Post.countDocuments({ isDeleted: false })
      }
    };

    await redisClient.set(cacheKey, JSON.stringify(response), 300);

    res.json({
      success: true,
      ...response
    });
  } catch (error) {
    logger.error('Get basic feed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feed'
    });
  }
});

router.get('/personalized/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    const cacheKey = `feed:personalized:${address}:${offset}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: JSON.parse(cached).data,
        pagination: JSON.parse(cached).pagination,
        cached: true
      });
    }

    const following = await Follow.find({ follower: address.toLowerCase() })
      .limit(1000)
      .lean();

    const followingAddresses = following.map(f => f.following);

    if (followingAddresses.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: 0
        }
      });
    }

    const posts = await Post.find({
      authorAddress: { $in: followingAddresses },
      isDeleted: false
    })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit) * 3)
      .lean();

    const postsWithScores = posts.map(post => {
      const ageInHours = (Date.now() - post.timestamp.getTime()) / (1000 * 60 * 60);
      const timeDecay = Math.pow(ageInHours + 2, 1.8);
      const score = (post.likeCount * 2 + post.commentCount * 3) / timeDecay;

      return { ...post, engagementScore: score };
    });

    postsWithScores.sort((a, b) => b.engagementScore - a.engagementScore);

    const rankedPosts = postsWithScores
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    const authorAddresses = [...new Set(rankedPosts.map(p => p.authorAddress))];
    const authors = await User.find({ walletAddress: { $in: authorAddresses } });

    const authorsMap = {};
    authors.forEach(author => {
      authorsMap[author.walletAddress] = author.toPublicJSON();
    });

    const enrichedPosts = rankedPosts.map(post => {
      const { engagementScore, ...postData } = post;
      return {
        ...postData,
        author: authorsMap[post.authorAddress] || null
      };
    });

    const response = {
      data: enrichedPosts,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: postsWithScores.length
      }
    };

    await redisClient.set(cacheKey, JSON.stringify(response), 180);

    res.json({
      success: true,
      ...response
    });
  } catch (error) {
    logger.error('Get personalized feed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch personalized feed'
    });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const { limit = 20, timeframe = 24 } = req.query;
    const cacheKey = `feed:trending:${timeframe}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: JSON.parse(cached),
        cached: true
      });
    }

    const timeframeMs = parseInt(timeframe) * 60 * 60 * 1000;
    const since = new Date(Date.now() - timeframeMs);

    const posts = await Post.find({
      isDeleted: false,
      timestamp: { $gte: since }
    })
      .limit(parseInt(limit) * 5)
      .lean();

    const postsWithScores = posts.map(post => {
      const ageInHours = (Date.now() - post.timestamp.getTime()) / (1000 * 60 * 60);
      const timeDecay = Math.pow(ageInHours + 2, 1.8);
      const score = (post.likeCount * 2 + post.commentCount * 3 + post.repostCount * 2) / timeDecay;

      return { ...post, trendingScore: score };
    });

    postsWithScores.sort((a, b) => b.trendingScore - a.trendingScore);

    const trendingPosts = postsWithScores.slice(0, parseInt(limit));

    const authorAddresses = [...new Set(trendingPosts.map(p => p.authorAddress))];
    const authors = await User.find({ walletAddress: { $in: authorAddresses } });

    const authorsMap = {};
    authors.forEach(author => {
      authorsMap[author.walletAddress] = author.toPublicJSON();
    });

    const enrichedPosts = trendingPosts.map(post => {
      const { trendingScore, ...postData } = post;
      return {
        ...postData,
        author: authorsMap[post.authorAddress] || null
      };
    });

    await redisClient.set(cacheKey, JSON.stringify(enrichedPosts), 600);

    res.json({
      success: true,
      data: enrichedPosts
    });
  } catch (error) {
    logger.error('Get trending feed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending feed'
    });
  }
});

export default router;
