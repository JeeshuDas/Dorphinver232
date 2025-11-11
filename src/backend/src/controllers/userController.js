const User = require('../models/User');
const Video = require('../models/Video');
const Follow = require('../models/Follow');
const logger = require('../config/logger');

/**
 * User Controller
 * Handles user profile and related operations
 */

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user profile
 * @access  Public
 */
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if current user follows this user
    let isFollowing = false;
    if (req.user) {
      const follow = await Follow.findOne({
        follower: req.user.id,
        following: user._id,
      });
      isFollowing = !!follow;
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        isFollowing,
      },
    });
  } catch (error) {
    logger.error(`Get user profile error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   GET /api/v1/users/username/:username
 * @desc    Get user by username
 * @access  Public
 */
exports.getUserByUsername = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if current user follows this user
    let isFollowing = false;
    if (req.user) {
      const follow = await Follow.findOne({
        follower: req.user.id,
        following: user._id,
      });
      isFollowing = !!follow;
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        isFollowing,
      },
    });
  } catch (error) {
    logger.error(`Get user by username error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   GET /api/v1/users/:id/analytics
 * @desc    Get user analytics
 * @access  Private (owner only)
 */
exports.getUserAnalytics = async (req, res, next) => {
  try {
    // Check ownership
    if (req.params.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these analytics',
      });
    }

    const user = await User.findById(req.params.id);

    // Get video analytics
    const videos = await Video.find({ creator: user._id });

    const analytics = {
      profile: {
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        videosCount: user.videosCount,
        totalViews: user.totalViews,
        totalLikes: user.totalLikes,
      },
      videos: {
        total: videos.length,
        totalViews: videos.reduce((sum, v) => sum + v.views, 0),
        totalLikes: videos.reduce((sum, v) => sum + v.likes, 0),
        totalComments: videos.reduce((sum, v) => sum + v.comments, 0),
        totalShares: videos.reduce((sum, v) => sum + v.shares, 0),
        averageViews: videos.length > 0 ? Math.round(videos.reduce((sum, v) => sum + v.views, 0) / videos.length) : 0,
        averageLikes: videos.length > 0 ? Math.round(videos.reduce((sum, v) => sum + v.likes, 0) / videos.length) : 0,
      },
      topVideos: videos
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)
        .map(v => ({
          id: v._id,
          title: v.title,
          views: v.views,
          likes: v.likes,
          comments: v.comments,
          thumbnailUrl: v.thumbnailUrl,
        })),
    };

    res.status(200).json({
      success: true,
      data: { analytics },
    });
  } catch (error) {
    logger.error(`Get user analytics error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   GET /api/v1/users/search
 * @desc    Search users
 * @access  Public
 */
exports.searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query required',
      });
    }

    const users = await User.find({
      $or: [
        { displayName: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
      ],
      isActive: true,
    })
      .select('displayName username avatar bio isVerified followersCount videosCount')
      .sort({ followersCount: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({
      $or: [
        { displayName: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
      ],
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error(`Search users error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   PUT /api/v1/users/:id/avatar
 * @desc    Update user avatar
 * @access  Private (owner only)
 */
exports.updateAvatar = async (req, res, next) => {
  try {
    // Check ownership
    if (req.params.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const { avatar } = req.body;

    const user = await User.findById(req.params.id);
    user.avatar = avatar;
    await user.save();

    logger.info(`✅ Avatar updated for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data: {
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    logger.error(`Update avatar error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   GET /api/v1/users/leaderboard
 * @desc    Get user leaderboard
 * @access  Public
 */
exports.getLeaderboard = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const sortBy = req.query.sortBy || 'followers'; // 'followers', 'views', 'likes'

    let sortField = {};
    if (sortBy === 'views') sortField = { totalViews: -1 };
    else if (sortBy === 'likes') sortField = { totalLikes: -1 };
    else sortField = { followersCount: -1 };

    const users = await User.find({ isActive: true })
      .select('displayName username avatar bio isVerified followersCount totalViews totalLikes videosCount')
      .sort(sortField)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: { users },
    });
  } catch (error) {
    logger.error(`Get leaderboard error: ${error.message}`);
    next(error);
  }
};
