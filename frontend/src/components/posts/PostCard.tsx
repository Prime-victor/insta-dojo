import { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Post } from '../../types';
import { shortenAddress } from '../../utils/web3';
import { likePost, unlikePost, deletePost } from '../../utils/api';
import { useAuthStore } from '../../stores/authStore';
import { useFeedStore } from '../../stores/feedStore';
import { useUiStore } from '../../stores/uiStore';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { walletAddress } = useAuthStore();
  const { updatePost, removePost } = useFeedStore();
  const { addNotification } = useUiStore();
  const [showMenu, setShowMenu] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const isOwnPost = walletAddress?.toLowerCase() === post.authorAddress.toLowerCase();

  const handleLike = async () => {
    if (isLiking || !walletAddress) return;

    setIsLiking(true);
    try {
      if (post.isLiked) {
        const result = await unlikePost(post.postId);
        if (result.success) {
          updatePost(post.postId, {
            isLiked: false,
            likeCount: post.likeCount - 1
          });
        }
      } else {
        const result = await likePost(post.postId);
        if (result.success) {
          updatePost(post.postId, {
            isLiked: true,
            likeCount: post.likeCount + 1
          });
        }
      }
    } catch (error: any) {
      addNotification('error', error.message || 'Failed to like post');
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const result = await deletePost(post.postId);
      if (result.success) {
        removePost(post.postId);
        addNotification('success', 'Post deleted');
      } else {
        addNotification('error', result.error || 'Failed to delete post');
      }
    } catch (error: any) {
      addNotification('error', error.message || 'Failed to delete post');
    }
    setShowMenu(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <Link
          to={`/profile/${post.authorAddress}`}
          className="flex items-center gap-3 hover:opacity-80 transition"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
            {post.author?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-semibold">{post.author?.username || shortenAddress(post.authorAddress)}</p>
            <p className="text-sm text-gray-500">{formatTimestamp(post.timestamp)}</p>
          </div>
        </Link>

        {isOwnPost && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg hover:bg-gray-100"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Link to={`/post/${post.postId}`} className="block mb-3">
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>

        {post.media.length > 0 && (
          <div className={`mt-3 grid gap-2 ${post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {post.media.map((media, idx) => (
              <div key={idx} className="rounded-lg overflow-hidden bg-gray-100">
                {media.type === 'image' ? (
                  <img
                    src={media.url}
                    alt="Post media"
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <video src={media.url} controls className="w-full h-auto" />
                )}
              </div>
            ))}
          </div>
        )}
      </Link>

      <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
        <button
          onClick={handleLike}
          disabled={isLiking || !walletAddress}
          className={`flex items-center gap-2 transition ${
            post.isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
          }`}
        >
          <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{post.likeCount}</span>
        </button>

        <Link
          to={`/post/${post.postId}`}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{post.commentCount}</span>
        </Link>

        <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
