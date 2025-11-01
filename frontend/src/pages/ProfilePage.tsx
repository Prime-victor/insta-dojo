import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Calendar, Link as LinkIcon, Loader } from 'lucide-react';
import Header from '../components/layout/Header';
import PostCard from '../components/posts/PostCard';
import { User, Post } from '../types';
import { getUser } from '../utils/api';
import { shortenAddress } from '../utils/web3';
import { useAuthStore } from '../stores/authStore';
import { followUser, unfollowUser } from '../utils/api';
import { useUiStore } from '../stores/uiStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ProfilePage() {
  const { address } = useParams<{ address: string }>();
  const { walletAddress } = useAuthStore();
  const { addNotification } = useUiStore();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const isOwnProfile = walletAddress?.toLowerCase() === address?.toLowerCase();

  useEffect(() => {
    if (address) {
      loadProfile();
      loadPosts();
    }
  }, [address]);

  const loadProfile = async () => {
    try {
      const result = await getUser(address!);
      if (result.success && result.data) {
        setUser(result.data);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/posts/user/${address}`);
      const result = await response.json();
      if (result.success) {
        setPosts(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

  const handleFollow = async () => {
    if (!address || isFollowLoading) return;

    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        const result = await unfollowUser(address);
        if (result.success) {
          setIsFollowing(false);
          if (user) {
            setUser({ ...user, followerCount: user.followerCount - 1 });
          }
          addNotification('success', 'Unfollowed user');
        }
      } else {
        const result = await followUser(address);
        if (result.success) {
          setIsFollowing(true);
          if (user) {
            setUser({ ...user, followerCount: user.followerCount + 1 });
          }
          addNotification('success', 'Following user');
        }
      }
    } catch (error: any) {
      addNotification('error', error.message || 'Failed to follow/unfollow');
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600" />

          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-16 mb-4">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-4 border-white flex items-center justify-center text-white text-4xl font-bold">
                {user.username[0].toUpperCase()}
              </div>

              {!isOwnProfile && walletAddress && (
                <button
                  onClick={handleFollow}
                  disabled={isFollowLoading}
                  className={`mt-20 px-6 py-2 rounded-lg font-medium transition ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isFollowLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>

            <h1 className="text-2xl font-bold mb-1">{user.username}</h1>
            <p className="text-gray-600 mb-3">{shortenAddress(user.walletAddress)}</p>

            {user.bio && <p className="text-gray-800 mb-4">{user.bio}</p>}

            <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
              <div>
                <span className="font-bold text-gray-900">{user.postCount}</span> Posts
              </div>
              <div>
                <span className="font-bold text-gray-900">{user.followerCount}</span> Followers
              </div>
              <div>
                <span className="font-bold text-gray-900">{user.followingCount}</span> Following
              </div>
              <div>
                <span className="font-bold text-gray-900">{user.reputation}</span> Reputation
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No posts yet</p>
            </div>
          ) : (
            posts.map(post => <PostCard key={post.postId} post={post} />)
          )}
        </div>
      </main>
    </div>
  );
}
