import { hash } from 'starknet';

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export function createContentHash(content: string, media: any[] = []): string {
  const data = JSON.stringify({ content, media, timestamp: Date.now() });
  return hash.computeHashOnElements([data]);
}

export async function isWalletConnected(): Promise<boolean> {
  const starknet = (window as any).starknet;
  return !!(starknet && starknet.isConnected);
}

export async function getWalletAddress(): Promise<string | null> {
  const starknet = (window as any).starknet;
  if (!starknet || !starknet.isConnected) return null;

  try {
    return starknet.selectedAddress || starknet.account.address;
  } catch {
    return null;
  }
}

export function isValidStarknetAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{1,64}$/.test(address);
}
