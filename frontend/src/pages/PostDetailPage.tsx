import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader, Send } from 'lucide-react';
import Header from '../components/layout/Header';
import PostCard from '../components/posts/PostCard';
import { Post, Comment } from '../types';
import { getComments, createComment } from '../utils/api';
import { createContentHash, shortenAddress } from '../utils/web3';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const { isConnected } = useAuthStore();
  const { addNotification } = useUiStore();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPost();
      loadComments();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}`);
      const result = await response.json();
      if (result.success && result.data) {
        setPost(result.data);
      }
    } catch (error) {
      console.error('Failed to load post:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const result = await getComments(postId!);
      if (result.success && result.data) {
        setComments(result.data);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !postId) return;

    setIsSubmitting(true);
    try {
      const contentHash = createContentHash(commentText, []);
      const result = await createComment(postId, commentText, contentHash);

      if (result.success && result.data) {
        setComments([...comments, result.data]);
        setCommentText('');
        addNotification('success', 'Comment posted');
      } else {
        addNotification('error', result.error || 'Failed to post comment');
      }
    } catch (error: any) {
      addNotification('error', error.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderComment = (comment: Comment) => (
    <div key={comment.commentId} className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start gap-3 mb-2">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
          {comment.author?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">
              {comment.author?.username || shortenAddress(comment.authorAddress)}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(comment.timestamp).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-12 mt-3 space-y-3">
          {comment.replies.map(reply => renderComment(reply))}
        </div>
      )}
    </div>
  );

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

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">Post not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-4">
          <PostCard post={post} />

          {isConnected && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full min-h-[80px] resize-none focus:outline-none"
                disabled={isSubmitting}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !commentText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Comment
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-lg font-bold">Comments ({comments.length})</h3>
            {comments.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No comments yet</p>
            ) : (
              comments.map(comment => renderComment(comment))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
