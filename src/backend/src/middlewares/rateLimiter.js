const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per IP
 */

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
    });
  },
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many login attempts, please try again in 15 minutes.',
    });
  },
});

// Upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: {
    success: false,
    message: 'Upload limit reached, please try again later.',
  },
  handler: (req, res) => {
    logger.warn(`Upload rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'You have reached the upload limit. Please try again in an hour.',
    });
  },
});

// Comment rate limiter
const commentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 comments per 5 minutes
  message: {
    success: false,
    message: 'Too many comments, please slow down.',
  },
});

// Search rate limiter
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: {
    success: false,
    message: 'Too many search requests, please try again later.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  commentLimiter,
  searchLimiter,
};
