import { create } from 'zustand';
import { Post, FeedType } from '../types';

interface FeedState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  feedType: FeedType;
  hasMore: boolean;
  offset: number;
  setFeedType: (type: FeedType) => void;
  fetchFeed: (type?: FeedType, append?: boolean) => Promise<void>;
  addPost: (post: Post) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  removePost: (postId: string) => void;
  reset: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  loading: false,
  error: null,
  feedType: 'basic',
  hasMore: true,
  offset: 0,

  setFeedType: (type: FeedType) => {
    set({ feedType: type, posts: [], offset: 0, hasMore: true });
  },

  fetchFeed: async (type?: FeedType, append = false) => {
    const state = get();
    const feedType = type || state.feedType;
    const offset = append ? state.offset : 0;

    if (state.loading) return;

    set({ loading: true, error: null });

    try {
      let url = `${API_URL}/api/feed/${feedType}`;
      if (feedType === 'personalized') {
        const walletAddress = (window as any).starknet?.account?.address;
        if (!walletAddress) {
          url = `${API_URL}/api/feed/basic`;
        } else {
          url = `${API_URL}/api/feed/personalized/${walletAddress}`;
        }
      }

      url += `?limit=20&offset=${offset}`;

      const response = await fetch(url);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch feed');
      }

      const newPosts = result.data || [];
      const hasMore = result.pagination
        ? offset + newPosts.length < result.pagination.total
        : newPosts.length === 20;

      set({
        posts: append ? [...state.posts, ...newPosts] : newPosts,
        loading: false,
        offset: offset + newPosts.length,
        hasMore,
        feedType
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch feed',
        loading: false
      });
    }
  },

  addPost: (post: Post) => {
    set((state) => ({
      posts: [post, ...state.posts]
    }));
  },

  updatePost: (postId: string, updates: Partial<Post>) => {
    set((state) => ({
      posts: state.posts.map(post =>
        post.postId === postId ? { ...post, ...updates } : post
      )
    }));
  },

  removePost: (postId: string) => {
    set((state) => ({
      posts: state.posts.filter(post => post.postId !== postId)
    }));
  },

  reset: () => {
    set({
      posts: [],
      loading: false,
      error: null,
      offset: 0,
      hasMore: true
    });
  }
}));
