const Follow = require('../models/Follow');
const User = require('../models/User');
const Notification = require('../models/Notification');
const logger = require('../config/logger');

/**
 * Follow Controller
 * Handles follow/unfollow operations
 */

/**
 * @route   POST /api/v1/follow/:creatorId
 * @desc    Follow/unfollow a user
 * @access  Private
 */
exports.toggleFollow = async (req, res, next) => {
  try {
    const creatorId = req.params.creatorId;

    // Check if creator exists
    const creator = await User.findById(creatorId);
    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Can't follow yourself
    if (creatorId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself',
      });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: req.user.id,
      following: creatorId,
    });

    if (existingFollow) {
      // Unfollow
      await existingFollow.deleteOne();

      // Update counts
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { followingCount: -1 },
      });
      await User.findByIdAndUpdate(creatorId, {
        $inc: { followersCount: -1 },
      });

      logger.info(`✅ User unfollowed: ${req.user.email} unfollowed ${creator.email}`);

      return res.status(200).json({
        success: true,
        message: 'Unfollowed successfully',
        data: {
          following: false,
        },
      });
    }

    // Follow
    await Follow.create({
      follower: req.user.id,
      following: creatorId,
    });

    // Update counts
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { followingCount: 1 },
    });
    await User.findByIdAndUpdate(creatorId, {
      $inc: { followersCount: 1 },
    });

    // Create notification
    await Notification.create({
      recipient: creatorId,
      sender: req.user.id,
      type: 'follow',
      message: `${req.user.displayName} started following you`,
    });

    logger.info(`✅ User followed: ${req.user.email} followed ${creator.email}`);

    res.status(200).json({
      success: true,
      message: 'Followed successfully',
      data: {
        following: true,
      },
    });
  } catch (error) {
    logger.error(`Toggle follow error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   GET /api/v1/follow/:userId/status
 * @desc    Check if current user follows another user
 * @access  Private
 */
exports.getFollowStatus = async (req, res, next) => {
  try {
    const follow = await Follow.findOne({
      follower: req.user.id,
      following: req.params.userId,
    });

    res.status(200).json({
      success: true,
      data: {
        following: !!follow,
      },
    });
  } catch (error) {
    logger.error(`Get follow status error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   GET /api/v1/follow/:userId/followers
 * @desc    Get user's followers
 * @access  Public
 */
exports.getFollowers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const follows = await Follow.find({ following: req.params.userId })
      .populate('follower', 'displayName username avatar bio isVerified followersCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const followers = follows.map(f => f.follower);

    const total = await Follow.countDocuments({ following: req.params.userId });

    res.status(200).json({
      success: true,
      data: {
        followers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error(`Get followers error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   GET /api/v1/follow/:userId/following
 * @desc    Get users that a user is following
 * @access  Public
 */
exports.getFollowing = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const follows = await Follow.find({ follower: req.params.userId })
      .populate('following', 'displayName username avatar bio isVerified followersCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const following = follows.map(f => f.following);

    const total = await Follow.countDocuments({ follower: req.params.userId });

    res.status(200).json({
      success: true,
      data: {
        following,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error(`Get following error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   GET /api/v1/follow/feed
 * @desc    Get feed from followed users
 * @access  Private
 */
exports.getFollowingFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get users that current user follows
    const follows = await Follow.find({ follower: req.user.id }).select('following');
    const followingIds = follows.map(f => f.following);

    if (followingIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          videos: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
          },
        },
      });
    }

    // Get videos from followed users
    const Video = require('../models/Video');
    const videos = await Video.find({
      creator: { $in: followingIds },
      isPublic: true,
      isActive: true,
    })
      .populate('creator', 'displayName username avatar isVerified')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Video.countDocuments({
      creator: { $in: followingIds },
      isPublic: true,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: {
        videos,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error(`Get following feed error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   DELETE /api/v1/follow/:creatorId
 * @desc    Unfollow a user (alternative endpoint)
 * @access  Private
 */
exports.unfollow = async (req, res, next) => {
  try {
    const follow = await Follow.findOneAndDelete({
      follower: req.user.id,
      following: req.params.creatorId,
    });

    if (!follow) {
      return res.status(404).json({
        success: false,
        message: 'Not following this user',
      });
    }

    // Update counts
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { followingCount: -1 },
    });
    await User.findByIdAndUpdate(req.params.creatorId, {
      $inc: { followersCount: -1 },
    });

    res.status(200).json({
      success: true,
      message: 'Unfollowed successfully',
    });
  } catch (error) {
    logger.error(`Unfollow error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   GET /api/v1/follow/suggestions
 * @desc    Get suggested users to follow
 * @access  Private
 */
exports.getSuggestions = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get users current user is already following
    const follows = await Follow.find({ follower: req.user.id }).select('following');
    const followingIds = follows.map(f => f.following.toString());
    followingIds.push(req.user.id); // Exclude self

    // Get suggested users (popular users not being followed)
    const suggestions = await User.find({
      _id: { $nin: followingIds },
      isActive: true,
    })
      .select('displayName username avatar bio isVerified followersCount videosCount')
      .sort({ followersCount: -1, totalViews: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      data: { suggestions },
    });
  } catch (error) {
    logger.error(`Get suggestions error: ${error.message}`);
    next(error);
  }
};
