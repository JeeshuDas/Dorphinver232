const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

/**
 * Protect routes - Requires valid JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please provide a valid token.',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Token is invalid.',
        });
      }

      // Check if user is active
      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated.',
        });
      }

      // Check if user is banned
      if (req.user.isBanned) {
        return res.status(403).json({
          success: false,
          message: 'Account has been banned.',
        });
      }

      // Update last active
      req.user.lastActive = Date.now();
      await req.user.save({ validateBeforeSave: false });

      next();
    } catch (error) {
      logger.error(`Token verification failed: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired.',
      });
    }
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    });
  }
};

/**
 * Optional Auth - Adds user to request if token is valid, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
      } catch (error) {
        // Token invalid but continue without user
        logger.warn(`Optional auth - Invalid token: ${error.message}`);
      }
    }

    next();
  } catch (error) {
    logger.error(`Optional auth middleware error: ${error.message}`);
    next();
  }
};

/**
 * Authorize roles - Restricts access to specific user roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route.`,
      });
    }

    next();
  };
};

/**
 * Check if user owns resource
 */
const checkOwnership = (resourceKey = 'user') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized.',
        });
      }

      // Get resource from request params or body
      const resourceId = req.params[resourceKey] || req.body[resourceKey];

      if (resourceId && resourceId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this resource.',
        });
      }

      next();
    } catch (error) {
      logger.error(`Ownership check error: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Server error during ownership check.',
      });
    }
  };
};

module.exports = {
  protect,
  optionalAuth,
  authorize,
  checkOwnership,
};
