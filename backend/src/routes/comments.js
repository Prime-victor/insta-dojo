import express from 'express';
import { nanoid } from 'nanoid';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Like from '../models/Like.js';
import { validateWalletSignature } from '../middleware/auth.js';
import { validateRequest, commentSchemas } from '../middleware/validation.js';
import { commentLimiter } from '../middleware/rateLimiter.js';
import { dojoClient } from '../utils/dojo.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

router.post('/', commentLimiter, validateRequest(commentSchemas.create), validateWalletSignature, async (req, res) => {
  try {
    const { postId, content, contentHash, parentId } = req.body;
    const authorAddress = req.authenticatedAddress;

    const post = await Post.findOne({ postId, isDeleted: false });
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    let level = 0;
    if (parentId) {
      const parentComment = await Comment.findOne({ commentId: parentId, isDeleted: false });
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          error: 'Parent comment not found'
        });
      }
      level = parentComment.level + 1;

      if (level > 3) {
        return res.status(400).json({
          success: false,
          error: 'Maximum nesting level (3) exceeded'
        });
      }
    }

    const txResult = await dojoClient.submitPostToChain(
      authorAddress,
      contentHash,
      0
    );

    const comment = new Comment({
      commentId: nanoid(),
      postId,
      authorAddress,
      content,
      contentHash,
      parentId: parentId || null,
      level,
      onChainTx: txResult.transactionHash
    });

    await comment.save();

    await Post.updateOne({ postId }, { $inc: { commentCount: 1 } });

    if (parentId) {
      await Comment.updateOne({ commentId: parentId }, { $inc: { replyCount: 1 } });
    }

    const postAuthor = await User.findOne({ walletAddress: post.authorAddress });
    if (postAuthor) {
      await User.updateOne(
        { walletAddress: post.authorAddress },
        { $inc: { reputation: 3 } }
      );
    }

    const commentAuthor = await User.findOne({ walletAddress: authorAddress });

    logger.info(`New comment created: ${comment.commentId} on post ${postId}`);

    res.status(201).json({
      success: true,
      data: {
        ...comment.toObject(),
        author: commentAuthor ? commentAuthor.toPublicJSON() : null
      }
    });
  } catch (error) {
    logger.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create comment'
    });
  }
});

router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const comments = await Comment.find({
      postId,
      isDeleted: false
    })
      .sort({ timestamp: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();

    const authorAddresses = [...new Set(comments.map(c => c.authorAddress))];
    const authors = await User.find({ walletAddress: { $in: authorAddresses } });

    const authorsMap = {};
    authors.forEach(author => {
      authorsMap[author.walletAddress] = author.toPublicJSON();
    });

    const enrichedComments = comments.map(comment => ({
      ...comment,
      author: authorsMap[comment.authorAddress] || null
    }));

    const organizedComments = organizeComments(enrichedComments);

    res.json({
      success: true,
      data: organizedComments,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: await Comment.countDocuments({ postId, isDeleted: false })
      }
    });
  } catch (error) {
    logger.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comments'
    });
  }
});

function organizeComments(comments) {
  const commentMap = {};
  const rootComments = [];

  comments.forEach(comment => {
    commentMap[comment.commentId] = { ...comment, replies: [] };
  });

  comments.forEach(comment => {
    if (comment.parentId && commentMap[comment.parentId]) {
      commentMap[comment.parentId].replies.push(commentMap[comment.commentId]);
    } else if (!comment.parentId) {
      rootComments.push(commentMap[comment.commentId]);
    }
  });

  return rootComments;
}

router.post('/:id/like', validateWalletSignature, async (req, res) => {
  try {
    const { id } = req.params;
    const userAddress = req.authenticatedAddress;

    const comment = await Comment.findOne({ commentId: id, isDeleted: false });
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    const existingLike = await Like.findOne({
      userAddress,
      targetId: id,
      targetType: 'comment'
    });

    if (existingLike) {
      return res.status(400).json({
        success: false,
        error: 'Already liked this comment'
      });
    }

    const txResult = await dojoClient.submitLikeToChain(userAddress, id, 'comment');

    const like = new Like({
      userAddress,
      targetId: id,
      targetType: 'comment',
      onChainTx: txResult.transactionHash
    });

    await like.save();

    await Comment.updateOne({ commentId: id }, { $inc: { likeCount: 1 } });

    res.status(201).json({
      success: true,
      data: {
        liked: true,
        likeCount: comment.likeCount + 1
      }
    });
  } catch (error) {
    logger.error('Like comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like comment'
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
      targetType: 'comment'
    });

    if (!like) {
      return res.status(404).json({
        success: false,
        error: 'Like not found'
      });
    }

    const comment = await Comment.findOne({ commentId: id });
    if (comment) {
      await Comment.updateOne({ commentId: id }, { $inc: { likeCount: -1 } });
    }

    res.json({
      success: true,
      data: {
        liked: false,
        likeCount: Math.max(0, (comment?.likeCount || 1) - 1)
      }
    });
  } catch (error) {
    logger.error('Unlike comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unlike comment'
    });
  }
});

export default router;
