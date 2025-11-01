import { useEffect } from 'react';
import { Wallet, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export default function WalletConnector() {
  const { connectWallet, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    return () => clearError();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Wallet className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2">Welcome to Instadojo</h1>
          <p className="text-gray-600 text-center mb-8">
            Connect your Starknet wallet to get started
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={connectWallet}
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-2">Supported Wallets:</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Argent X</li>
              <li>• Braavos</li>
            </ul>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            By connecting, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
