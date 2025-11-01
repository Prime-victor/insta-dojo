import { create } from 'ipfs-http-client';
import { logger } from './logger.js';

class IPFSClient {
  constructor() {
    this.client = null;
    this.gateway = 'https://ipfs.io/ipfs/';
  }

  async initialize() {
    try {
      const apiUrl = process.env.IPFS_API_URL || 'https://api.web3.storage';
      const token = process.env.IPFS_API_TOKEN;

      if (token) {
        this.client = create({
          url: apiUrl,
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        logger.info('IPFS Client initialized with Web3.Storage');
      } else {
        this.client = create({ url: 'http://localhost:5001' });
        logger.info('IPFS Client initialized with local node');
      }
    } catch (error) {
      logger.error('Failed to initialize IPFS client:', error);
      throw error;
    }
  }

  async uploadFile(file) {
    try {
      if (!this.client) await this.initialize();

      const result = await this.client.add(file);
      return {
        hash: result.path,
        url: `${this.gateway}${result.path}`,
        size: result.size
      };
    } catch (error) {
      logger.error('Failed to upload file to IPFS:', error);
      throw error;
    }
  }

  async uploadJSON(data) {
    try {
      if (!this.client) await this.initialize();

      const json = JSON.stringify(data);
      const result = await this.client.add(json);
      return {
        hash: result.path,
        url: `${this.gateway}${result.path}`,
        size: result.size
      };
    } catch (error) {
      logger.error('Failed to upload JSON to IPFS:', error);
      throw error;
    }
  }

  async uploadMultiple(files) {
    try {
      if (!this.client) await this.initialize();

      const uploads = await Promise.all(
        files.map(file => this.uploadFile(file))
      );
      return uploads;
    } catch (error) {
      logger.error('Failed to upload multiple files to IPFS:', error);
      throw error;
    }
  }

  getUrl(hash) {
    return `${this.gateway}${hash}`;
  }

  async pin(hash) {
    try {
      if (!this.client) await this.initialize();
      await this.client.pin.add(hash);
      logger.info(`Pinned ${hash} to IPFS`);
      return true;
    } catch (error) {
      logger.error(`Failed to pin ${hash}:`, error);
      return false;
    }
  }
}

export const ipfsClient = new IPFSClient();
