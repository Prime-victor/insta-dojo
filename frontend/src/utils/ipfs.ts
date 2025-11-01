import { create } from 'ipfs-http-client';

const IPFS_GATEWAY = import.meta.env.VITE_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';

let ipfsClient: any = null;

async function getClient() {
  if (!ipfsClient) {
    ipfsClient = create({ url: 'https://ipfs.infura.io:5001/api/v0' });
  }
  return ipfsClient;
}

export async function uploadToIPFS(file: File): Promise<{ hash: string; url: string }> {
  try {
    const client = await getClient();
    const added = await client.add(file);

    return {
      hash: added.path,
      url: `${IPFS_GATEWAY}${added.path}`
    };
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error('Failed to upload to IPFS');
  }
}

export async function uploadMultipleToIPFS(files: File[]): Promise<Array<{ hash: string; url: string }>> {
  try {
    const uploads = await Promise.all(files.map(file => uploadToIPFS(file)));
    return uploads;
  } catch (error) {
    console.error('Multiple IPFS upload error:', error);
    throw new Error('Failed to upload files to IPFS');
  }
}

export function getIPFSUrl(hash: string): string {
  return `${IPFS_GATEWAY}${hash}`;
}
