import rateLimit from 'express-rate-limit';
import { redisClient } from '../utils/redis.js';

export const createRateLimiter = (windowMs, maxRequests) => {
  return rateLimit({
    windowMs: windowMs || 15 * 60 * 1000,
    max: maxRequests || 100,
    message: {
      success: false,
      error: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded'
      });
    }
  });
};

export const apiLimiter = createRateLimiter(15 * 60 * 1000, 100);
export const authLimiter = createRateLimiter(15 * 60 * 1000, 5);
export const postLimiter = createRateLimiter(60 * 60 * 1000, 20);
export const commentLimiter = createRateLimiter(60 * 60 * 1000, 50);
export const followLimiter = createRateLimiter(60 * 60 * 1000, 30);

export const customRateLimiter = async (req, res, next) => {
  try {
    const identifier = req.authenticatedAddress || req.ip;
    const key = `ratelimit:${identifier}:${req.path}`;

    const current = await redisClient.get(key);

    if (current && parseInt(current) >= 100) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded'
      });
    }

    const newCount = current ? parseInt(current) + 1 : 1;
    await redisClient.set(key, newCount.toString(), 900);

    next();
  } catch (error) {
    next();
  }
};
