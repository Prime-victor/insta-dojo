import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { socketClient } from './utils/socket';
import { useFeedStore } from './stores/feedStore';
import WalletConnector from './components/wallet/WalletConnector';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import PostDetailPage from './pages/PostDetailPage';

function App() {
  const { isConnected, walletAddress } = useAuthStore();
  const { addPost, updatePost } = useFeedStore();

  useEffect(() => {
    if (isConnected && walletAddress) {
      const socket = socketClient.connect();
      socketClient.authenticate(walletAddress);
      socketClient.subscribeToFeed('basic');

      socketClient.onNewPost((post) => {
        addPost(post);
      });

      socketClient.onPostUpdate((update) => {
        updatePost(update.postId, update);
      });

      return () => {
        socketClient.disconnect();
      };
    }
  }, [isConnected, walletAddress]);

  if (!isConnected) {
    return (
      <BrowserRouter>
        <WalletConnector />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FeedPage />} />
        <Route path="/profile/:address" element={<ProfilePage />} />
        <Route path="/post/:postId" element={<PostDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
