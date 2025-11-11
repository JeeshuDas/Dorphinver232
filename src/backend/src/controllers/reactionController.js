const Like = require('../models/Like');
const Video = require('../models/Video');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const logger = require('../config/logger');

/**
 * Reaction Controller
 * Handles likes/reactions on videos and comments
 */

/**
 * @route   POST /api/v1/reactions/:videoId
 * @desc    Like/unlike a video
 * @access  Private
 */
exports.toggleVideoLike = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    // Check if already liked
    const existingLike = await Like.findOne({
      user: req.user.id,
      targetType: 'Video',
      targetId: req.params.videoId,
    });

    if (existingLike) {
      // Unlike - remove like
      await existingLike.deleteOne();

      // Decrement like count
      video.likes = Math.max(0, video.likes - 1);
      await video.save();

      // Update user total likes
      await User.findByIdAndUpdate(video.creator, {
        $inc: { totalLikes: -1 },
      });

      logger.info(`✅ Video unliked: ${video._id} by ${req.user.email}`);

      return res.status(200).json({
        success: true,
        message: 'Video unliked',
        data: {
          liked: false,
          likes: video.likes,
        },
      });
    }

    // Like - create new like
    await Like.create({
      user: req.user.id,
      targetType: 'Video',
      targetId: req.params.videoId,
      video: video._id,
    });

    // Increment like count
    video.likes += 1;
    await video.save();

    // Update user total likes
    await User.findByIdAndUpdate(video.creator, {
      $inc: { totalLikes: 1 },
    });

    // Create notification (if not liking own video)
    if (video.creator.toString() !== req.user.id) {
      await Notification.create({
        recipient: video.creator,
        sender: req.user.id,
        type: 'like',
        video: video._id,
        message: `${req.user.displayName} liked your video`,
      });
    }

    logger.info(`✅ Video liked: ${video._id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Video liked',
      data: {
        liked: true,
        likes: video.likes,
      },
    });
  } catch (error) {
    logger.error(`Toggle video like error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   POST /api/v1/reactions/comment/:commentId
 * @desc    Like/unlike a comment
 * @access  Private
 */
exports.toggleCommentLike = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check if already liked
    const existingLike = await Like.findOne({
      user: req.user.id,
      targetType: 'Comment',
      targetId: req.params.commentId,
    });

    if (existingLike) {
      // Unlike
      await existingLike.deleteOne();

      comment.likes = Math.max(0, comment.likes - 1);
      await comment.save();

      return res.status(200).json({
        success: true,
        message: 'Comment unliked',
        data: {
          liked: false,
          likes: comment.likes,
        },
      });
    }

    // Like
    await Like.create({
      user: req.user.id,
      targetType: 'Comment',
      targetId: req.params.commentId,
      video: comment.video,
    });

    comment.likes += 1;
    await comment.save();

    // Create notification (if not liking own comment)
    if (comment.user.toString() !== req.user.id) {
      await Notification.create({
        recipient: comment.user,
        sender: req.user.id,
        type: 'like',
        video: comment.video,
        comment: comment._id,
        message: `${req.user.displayName} liked your comment`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Comment liked',
      data: {
        liked: true,
        likes: comment.likes,
      },
    });
  } catch (error) {
    logger.error(`Toggle comment like error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   GET /api/v1/reactions/video/:videoId/status
 * @desc    Check if user liked a video
 * @access  Private
 */
exports.getVideoLikeStatus = async (req, res, next) => {
  try {
    const like = await Like.findOne({
      user: req.user.id,
      targetType: 'Video',
      targetId: req.params.videoId,
    });

    res.status(200).json({
      success: true,
      data: {
        liked: !!like,
      },
    });
  } catch (error) {
    logger.error(`Get video like status error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   GET /api/v1/reactions/user/liked-videos
 * @desc    Get user's liked videos
 * @access  Private
 */
exports.getUserLikedVideos = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const likes = await Like.find({
      user: req.user.id,
      targetType: 'Video',
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'targetId',
        model: 'Video',
        populate: {
          path: 'creator',
          select: 'displayName username avatar isVerified',
        },
      });

    // Filter out deleted videos
    const videos = likes
      .filter(like => like.targetId)
      .map(like => like.targetId);

    const total = await Like.countDocuments({
      user: req.user.id,
      targetType: 'Video',
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
    logger.error(`Get user liked videos error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   DELETE /api/v1/reactions/:videoId
 * @desc    Unlike a video (alternative endpoint)
 * @access  Private
 */
exports.unlikeVideo = async (req, res, next) => {
  try {
    const like = await Like.findOneAndDelete({
      user: req.user.id,
      targetType: 'Video',
      targetId: req.params.videoId,
    });

    if (!like) {
      return res.status(404).json({
        success: false,
        message: 'Like not found',
      });
    }

    // Decrement video like count
    await Video.findByIdAndUpdate(req.params.videoId, {
      $inc: { likes: -1 },
    });

    res.status(200).json({
      success: true,
      message: 'Video unliked',
    });
  } catch (error) {
    logger.error(`Unlike video error: ${error.message}`);
    next(error);
  }
};
