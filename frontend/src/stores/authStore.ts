import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  walletAddress: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  walletAddress: null,
  isConnected: false,
  isLoading: false,
  error: null,

  connectWallet: async () => {
    set({ isLoading: true, error: null });
    try {
      const starknet = (window as any).starknet;

      if (!starknet) {
        throw new Error('Starknet wallet not found. Please install Argent X or Braavos.');
      }

      await starknet.enable();

      if (!starknet.isConnected) {
        throw new Error('Failed to connect wallet');
      }

      const address = starknet.selectedAddress;

      set({
        walletAddress: address.toLowerCase(),
        isConnected: true,
        isLoading: false
      });

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/users/${address}`);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          set({ user: result.data });
        }
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to connect wallet',
        isLoading: false,
        isConnected: false
      });
    }
  },

  disconnectWallet: () => {
    set({
      user: null,
      walletAddress: null,
      isConnected: false,
      error: null
    });
  },

  setUser: (user: User | null) => {
    set({ user });
  },

  clearError: () => {
    set({ error: null });
  }
}));
