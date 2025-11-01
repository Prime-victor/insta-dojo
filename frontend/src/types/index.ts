export interface User {
  walletAddress: string;
  username: string;
  avatar: string;
  bio: string;
  followerCount: number;
  followingCount: number;
  reputation: number;
  postCount: number;
  isVerified: boolean;
  createdAt: string;
}

export interface Media {
  type: 'image' | 'video';
  ipfsHash: string;
  url: string;
  thumbnailHash?: string;
  thumbnailUrl?: string;
}

export interface Post {
  _id: string;
  postId: string;
  authorAddress: string;
  content: string;
  contentHash: string;
  media: Media[];
  postType: 'text' | 'image' | 'video' | 'repost';
  likeCount: number;
  commentCount: number;
  repostCount: number;
  onChainTx: string;
  repostOf: string | null;
  timestamp: string;
  author?: User;
  isLiked?: boolean;
}

export interface Comment {
  _id: string;
  commentId: string;
  postId: string;
  authorAddress: string;
  content: string;
  contentHash: string;
  parentId: string | null;
  level: number;
  likeCount: number;
  replyCount: number;
  onChainTx: string;
  timestamp: string;
  author?: User;
  replies?: Comment[];
  isLiked?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
}

export type FeedType = 'basic' | 'personalized' | 'trending';
