const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

/**
 * Auth Controller
 * Handles user authentication operations
 */

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

/**
 * @route   POST /api/v1/auth/signup
 * @desc    Register new user
 * @access  Public
 */
exports.signup = async (req, res, next) => {
  try {
    const { email, password, displayName, username } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      displayName,
      username,
    });

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    logger.info(`✅ New user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.getPublicProfile(),
        token,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error(`Signup error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if account is banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Account has been banned',
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    logger.info(`✅ User logged in: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.getPublicProfile(),
        token,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    // Generate new tokens
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    logger.error(`Refresh token error: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
    });
  }
};

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    logger.error(`Get me error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   PUT /api/v1/auth/update-profile
 * @desc    Update user profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { displayName, username, bio, avatar } = req.body;

    const user = await User.findById(req.user.id);

    if (displayName) user.displayName = displayName;
    if (username) user.username = username;
    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;

    await user.save();

    logger.info(`✅ Profile updated: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   PUT /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`✅ Password changed: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    logger.error(`Change password error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   GET /api/v1/auth/google
 * @desc    Google OAuth login
 * @access  Public
 */
exports.googleAuth = (req, res, next) => {
  // Handled by Passport middleware
};

/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
exports.googleCallback = async (req, res, next) => {
  try {
    // Generate tokens
    const token = generateToken(req.user._id);
    const refreshToken = generateRefreshToken(req.user._id);

    // Redirect to frontend with tokens
    const clientUrl = process.env.CLIENT_URL;
    res.redirect(`${clientUrl}/auth/success?token=${token}&refreshToken=${refreshToken}`);
  } catch (error) {
    logger.error(`Google callback error: ${error.message}`);
    res.redirect(`${process.env.CLIENT_URL}/auth/error`);
  }
};

/**
 * @route   DELETE /api/v1/auth/delete-account
 * @desc    Delete user account
 * @access  Private
 */
exports.deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);

    logger.info(`✅ Account deleted: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    logger.error(`Delete account error: ${error.message}`);
    next(error);
  }
};
