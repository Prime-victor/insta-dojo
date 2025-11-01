import { FeedType } from '../../types';
import { useFeedStore } from '../../stores/feedStore';
import { useAuthStore } from '../../stores/authStore';

export default function FeedSelector() {
  const { feedType, setFeedType, fetchFeed } = useFeedStore();
  const { isConnected } = useAuthStore();

  const handleFeedChange = (type: FeedType) => {
    setFeedType(type);
    fetchFeed(type);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-1 flex gap-1">
      <button
        onClick={() => handleFeedChange('basic')}
        className={`flex-1 px-4 py-2 rounded-md font-medium transition ${
          feedType === 'basic'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        Latest
      </button>

      {isConnected && (
        <button
          onClick={() => handleFeedChange('personalized')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition ${
            feedType === 'personalized'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Following
        </button>
      )}

      <button
        onClick={() => handleFeedChange('trending')}
        className={`flex-1 px-4 py-2 rounded-md font-medium transition ${
          feedType === 'trending'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        Trending
      </button>
    </div>
  );
}
