import { Link } from 'react-router-dom';
import { Home, Bell, User, LogOut, Wallet, Menu } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { shortenAddress } from '../../utils/web3';

export default function Header() {
  const { isConnected, walletAddress, user, disconnectWallet } = useAuthStore();
  const { toggleSidebar, openPostComposer } = useUiStore();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
              <span className="text-xl font-bold">Instadojo</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
              <Home className="w-5 h-5" />
              <span>Feed</span>
            </Link>

            {isConnected && (
              <>
                <Link to="/notifications" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </Link>

                <Link
                  to={`/profile/${walletAddress}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                <button
                  onClick={openPostComposer}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Post
                </button>

                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <Wallet className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">
                    {user?.username || shortenAddress(walletAddress || '')}
                  </span>
                </div>

                <button
                  onClick={disconnectWallet}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  title="Disconnect"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => useAuthStore.getState().connectWallet()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
