import { hash, ec, num, Provider, Contract } from 'starknet';

class DojoClient {
  constructor() {
    this.provider = null;
    this.worldAddress = process.env.DOJO_WORLD_ADDRESS || '';
  }

  async initialize() {
    const rpcUrl = process.env.DOJO_RPC_URL || 'http://localhost:5050';
    this.provider = new Provider({ nodeUrl: rpcUrl });
  }

  verifySignature(messageHash, signature, publicKey) {
    try {
      const msgHash = num.toBigInt(messageHash);
      const sig = signature.map(s => num.toBigInt(s));
      const pubKey = num.toBigInt(publicKey);

      return ec.starkCurve.verify(sig, msgHash, pubKey);
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  async createContentHash(content, media = []) {
    const data = JSON.stringify({ content, media, timestamp: Date.now() });
    return hash.computeHashOnElements([data]);
  }

  async verifyWalletOwnership(walletAddress, signature, message) {
    try {
      const messageHash = hash.computeHashOnElements([message]);
      return this.verifySignature(messageHash, signature, walletAddress);
    } catch (error) {
      console.error('Wallet verification failed:', error);
      return false;
    }
  }

  async getProfile(walletAddress) {
    try {
      if (!this.provider) await this.initialize();
      return null;
    } catch (error) {
      console.error('Failed to get profile:', error);
      return null;
    }
  }

  async submitPostToChain(authorAddress, contentHash, postType) {
    try {
      if (!this.provider) await this.initialize();

      return {
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        status: 'pending'
      };
    } catch (error) {
      console.error('Failed to submit post to chain:', error);
      throw error;
    }
  }

  async submitFollowToChain(followerAddress, targetAddress) {
    try {
      if (!this.provider) await this.initialize();

      return {
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        status: 'pending'
      };
    } catch (error) {
      console.error('Failed to submit follow to chain:', error);
      throw error;
    }
  }

  async submitLikeToChain(userAddress, targetId, targetType) {
    try {
      if (!this.provider) await this.initialize();

      return {
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        status: 'pending'
      };
    } catch (error) {
      console.error('Failed to submit like to chain:', error);
      throw error;
    }
  }
}

export const dojoClient = new DojoClient();
