import { logger } from '../utils/logger.js';

export class FeedSocketHandler {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map();
  }

  initialize() {
    this.io.on('connection', (socket) => {
      logger.info(`Socket connected: ${socket.id}`);

      socket.on('authenticate', (data) => {
        const { walletAddress } = data;
        if (walletAddress) {
          this.connectedUsers.set(socket.id, walletAddress.toLowerCase());
          socket.join(`user:${walletAddress.toLowerCase()}`);
          logger.info(`User authenticated: ${walletAddress}`);
        }
      });

      socket.on('subscribe:feed', (data) => {
        const { feedType } = data;
        socket.join(`feed:${feedType}`);
        logger.debug(`Socket ${socket.id} subscribed to feed:${feedType}`);
      });

      socket.on('subscribe:post', (data) => {
        const { postId } = data;
        socket.join(`post:${postId}`);
        logger.debug(`Socket ${socket.id} subscribed to post:${postId}`);
      });

      socket.on('unsubscribe:post', (data) => {
        const { postId } = data;
        socket.leave(`post:${postId}`);
        logger.debug(`Socket ${socket.id} unsubscribed from post:${postId}`);
      });

      socket.on('disconnect', () => {
        const walletAddress = this.connectedUsers.get(socket.id);
        if (walletAddress) {
          this.connectedUsers.delete(socket.id);
          logger.info(`User disconnected: ${walletAddress}`);
        }
        logger.info(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  broadcastNewPost(post, author) {
    this.io.to('feed:basic').emit('feed:newPost', {
      ...post,
      author
    });
    logger.debug(`Broadcasted new post: ${post.postId}`);
  }

  broadcastPostUpdate(postId, update) {
    this.io.to(`post:${postId}`).emit('post:updated', {
      postId,
      ...update
    });
    logger.debug(`Broadcasted post update: ${postId}`);
  }

  broadcastNewComment(comment, author) {
    this.io.to(`post:${comment.postId}`).emit('comment:new', {
      ...comment,
      author
    });
    logger.debug(`Broadcasted new comment on post: ${comment.postId}`);
  }

  notifyUser(walletAddress, notification) {
    this.io.to(`user:${walletAddress.toLowerCase()}`).emit('notification', notification);
    logger.debug(`Sent notification to user: ${walletAddress}`);
  }

  broadcastLike(targetId, targetType, likeData) {
    this.io.to(`post:${targetId}`).emit('like:updated', {
      targetId,
      targetType,
      ...likeData
    });
  }

  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }
}
