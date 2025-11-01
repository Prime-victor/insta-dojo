import Header from '../components/layout/Header';
import FeedSelector from '../components/feed/FeedSelector';
import FeedList from '../components/feed/FeedList';
import PostComposer from '../components/posts/PostComposer';

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PostComposer />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-4">
          <FeedSelector />
          <FeedList />
        </div>
      </main>
    </div>
  );
}
