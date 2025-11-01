import { dojoClient } from '../utils/dojo.js';
import { logger } from '../utils/logger.js';

export const validateWalletSignature = async (req, res, next) => {
  try {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
      return res.status(401).json({
        success: false,
        error: 'Missing authentication credentials'
      });
    }

    const isValid = await dojoClient.verifyWalletOwnership(
      walletAddress,
      signature,
      message
    );

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    req.authenticatedAddress = walletAddress.toLowerCase();
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const { walletAddress, signature, message } = req.body;

    if (walletAddress && signature && message) {
      const isValid = await dojoClient.verifyWalletOwnership(
        walletAddress,
        signature,
        message
      );

      if (isValid) {
        req.authenticatedAddress = walletAddress.toLowerCase();
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth error:', error);
    next();
  }
};

export const requireAuth = (req, res, next) => {
  if (!req.authenticatedAddress) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  next();
};
