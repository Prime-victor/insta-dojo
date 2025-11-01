import { ApiResponse, User, Post, Comment } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function getWalletSignature(message: string) {
  const starknet = (window as any).starknet;

  if (!starknet || !starknet.isConnected) {
    throw new Error('Wallet not connected');
  }

  const signature = await starknet.account.signMessage({
    types: {
      Message: [{ name: 'message', type: 'felt' }]
    },
    primaryType: 'Message',
    domain: { name: 'Instadojo', version: '1' },
    message: { message }
  });

  return signature;
}

export async function createUser(username: string, avatar: string, bio: string): Promise<ApiResponse<User>> {
  const starknet = (window as any).starknet;
  const walletAddress = starknet.selectedAddress || starknet.account.address;

  const message = `Create account: ${username}`;
  const signature = await getWalletSignature(message);

  const response = await fetch(`${API_URL}/api/users/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddress,
      username,
      avatar,
      bio,
      signature,
      message
    })
  });

  return response.json();
}

export async function updateUser(username?: string, avatar?: string, bio?: string): Promise<ApiResponse<User>> {
  const starknet = (window as any).starknet;
  const walletAddress = starknet.selectedAddress || starknet.account.address;

  const message = `Update profile: ${Date.now()}`;
  const signature = await getWalletSignature(message);

  const response = await fetch(`${API_URL}/api/users/${walletAddress}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      avatar,
      bio,
      walletAddress,
      signature,
      message
    })
  });

  return response.json();
}

export async function getUser(address: string): Promise<ApiResponse<User>> {
  const response = await fetch(`${API_URL}/api/users/${address}`);
  return response.json();
}

export async function followUser(targetAddress: string): Promise<ApiResponse<any>> {
  const starknet = (window as any).starknet;
  const walletAddress = starknet.selectedAddress || starknet.account.address;

  const message = `Follow: ${targetAddress}`;
  const signature = await getWalletSignature(message);

  const response = await fetch(`${API_URL}/api/users/follow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      targetAddress,
      walletAddress,
      signature,
      message
    })
  });

  return response.json();
}

export async function unfollowUser(targetAddress: string): Promise<ApiResponse<any>> {
  const starknet = (window as any).starknet;
  const walletAddress = starknet.selectedAddress || starknet.account.address;

  const message = `Unfollow: ${targetAddress}`;
  const signature = await getWalletSignature(message);

  const response = await fetch(`${API_URL}/api/users/unfollow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      targetAddress,
      walletAddress,
      signature,
      message
    })
  });

  return response.json();
}

export async function createPost(
  content: string,
  contentHash: string,
  media: any[],
  postType: string
): Promise<ApiResponse<Post>> {
  const starknet = (window as any).starknet;
  const walletAddress = starknet.selectedAddress || starknet.account.address;

  const message = `Create post: ${contentHash}`;
  const signature = await getWalletSignature(message);

  const response = await fetch(`${API_URL}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
      contentHash,
      media,
      postType,
      walletAddress,
      signature,
      message
    })
  });

  return response.json();
}

export async function deletePost(postId: string): Promise<ApiResponse<any>> {
  const starknet = (window as any).starknet;
  const walletAddress = starknet.selectedAddress || starknet.account.address;

  const message = `Delete post: ${postId}`;
  const signature = await getWalletSignature(message);

  const response = await fetch(`${API_URL}/api/posts/${postId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddress,
      signature,
      message
    })
  });

  return response.json();
}

export async function likePost(postId: string): Promise<ApiResponse<any>> {
  const starknet = (window as any).starknet;
  const walletAddress = starknet.selectedAddress || starknet.account.address;

  const message = `Like post: ${postId}`;
  const signature = await getWalletSignature(message);

  const response = await fetch(`${API_URL}/api/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddress,
      signature,
      message
    })
  });

  return response.json();
}

export async function unlikePost(postId: string): Promise<ApiResponse<any>> {
  const starknet = (window as any).starknet;
  const walletAddress = starknet.selectedAddress || starknet.account.address;

  const message = `Unlike post: ${postId}`;
  const signature = await getWalletSignature(message);

  const response = await fetch(`${API_URL}/api/posts/${postId}/like`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddress,
      signature,
      message
    })
  });

  return response.json();
}

export async function createComment(
  postId: string,
  content: string,
  contentHash: string,
  parentId?: string
): Promise<ApiResponse<Comment>> {
  const starknet = (window as any).starknet;
  const walletAddress = starknet.selectedAddress || starknet.account.address;

  const message = `Comment: ${contentHash}`;
  const signature = await getWalletSignature(message);

  const response = await fetch(`${API_URL}/api/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      postId,
      content,
      contentHash,
      parentId: parentId || null,
      walletAddress,
      signature,
      message
    })
  });

  return response.json();
}

export async function getComments(postId: string): Promise<ApiResponse<Comment[]>> {
  const response = await fetch(`${API_URL}/api/comments/post/${postId}`);
  return response.json();
}
