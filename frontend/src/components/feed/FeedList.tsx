import { useEffect } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import { useFeedStore } from '../../stores/feedStore';
import PostCard from '../posts/PostCard';

export default function FeedList() {
  const { posts, loading, error, hasMore, fetchFeed } = useFeedStore();

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchFeed(undefined, true);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-800">Error loading feed</p>
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => fetchFeed()}
            className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No posts yet. Be the first to post!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.postId} post={post} />
      ))}

      {hasMore && (
        <div className="flex justify-center py-4">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
