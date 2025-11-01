import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

class SocketClient {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return this.socket;

    this.socket = io(WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return this.socket;
  }

  authenticate(walletAddress: string) {
    if (this.socket?.connected) {
      this.socket.emit('authenticate', { walletAddress });
    }
  }

  subscribeToFeed(feedType: string) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe:feed', { feedType });
    }
  }

  subscribeToPost(postId: string) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe:post', { postId });
    }
  }

  unsubscribeFromPost(postId: string) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe:post', { postId });
    }
  }

  onNewPost(callback: (post: any) => void) {
    if (this.socket) {
      this.socket.on('feed:newPost', callback);
    }
  }

  onPostUpdate(callback: (update: any) => void) {
    if (this.socket) {
      this.socket.on('post:updated', callback);
    }
  }

  onNewComment(callback: (comment: any) => void) {
    if (this.socket) {
      this.socket.on('comment:new', callback);
    }
  }

  onNotification(callback: (notification: any) => void) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketClient = new SocketClient();
