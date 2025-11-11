const Comment = require('../models/Comment');
const Video = require('../models/Video');
const Notification = require('../models/Notification');
const logger = require('../config/logger');

/**
 * Comment Controller
 * Handles comment operations
 */

/**
 * @route   GET /api/v1/comments/:videoId
 * @desc    Get comments for a video
 * @access  Public
 */
exports.getComments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get top-level comments (no parent)
    const comments = await Comment.find({
      video: req.params.videoId,
      parentComment: null,
      isDeleted: false,
    })
      .populate('user', 'displayName username avatar isVerified')
      .populate({
        path: 'replyCount',
      })
      .sort({ likes: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({
      video: req.params.videoId,
      parentComment: null,
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      data: {
        comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error(`Get comments error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   GET /api/v1/comments/:commentId/replies
 * @desc    Get replies to a comment
 * @access  Public
 */
exports.getReplies = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const replies = await Comment.find({
      parentComment: req.params.commentId,
      isDeleted: false,
    })
      .populate('user', 'displayName username avatar isVerified')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({
      parentComment: req.params.commentId,
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      data: {
        replies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error(`Get replies error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   POST /api/v1/comments/:videoId
 * @desc    Create new comment
 * @access  Private
 */
exports.createComment = async (req, res, next) => {
  try {
    const { text, parentComment } = req.body;

    // Check if video exists
    const video = await Video.findById(req.params.videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    // Check if comments are allowed
    if (!video.allowComments) {
      return res.status(403).json({
        success: false,
        message: 'Comments are disabled for this video',
      });
    }

    // Create comment
    const comment = await Comment.create({
      video: req.params.videoId,
      user: req.user.id,
      text,
      parentComment: parentComment || null,
    });

    // Increment video comment count
    video.comments += 1;
    await video.save();

    // Populate user info
    await comment.populate('user', 'displayName username avatar isVerified');

    // Create notification for video creator (if not commenting on own video)
    if (video.creator.toString() !== req.user.id) {
      await Notification.create({
        recipient: video.creator,
        sender: req.user.id,
        type: parentComment ? 'reply' : 'comment',
        video: video._id,
        comment: comment._id,
        message: parentComment
          ? `${req.user.displayName} replied to your comment`
          : `${req.user.displayName} commented on your video`,
      });
    }

    // If reply, notify parent comment author
    if (parentComment) {
      const parentCommentDoc = await Comment.findById(parentComment);
      if (parentCommentDoc && parentCommentDoc.user.toString() !== req.user.id) {
        await Notification.create({
          recipient: parentCommentDoc.user,
          sender: req.user.id,
          type: 'reply',
          video: video._id,
          comment: comment._id,
          message: `${req.user.displayName} replied to your comment`,
        });
      }
    }

    logger.info(`✅ Comment created: ${comment._id} on video ${video._id}`);

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: { comment },
    });
  } catch (error) {
    logger.error(`Create comment error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   PUT /api/v1/comments/:id
 * @desc    Update comment
 * @access  Private (owner only)
 */
exports.updateComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check ownership
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment',
      });
    }

    comment.text = text;
    comment.isEdited = true;
    comment.editedAt = Date.now();

    await comment.save();

    logger.info(`✅ Comment updated: ${comment._id}`);

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: { comment },
    });
  } catch (error) {
    logger.error(`Update comment error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   DELETE /api/v1/comments/:id
 * @desc    Delete comment
 * @access  Private (owner only)
 */
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check ownership
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }

    // Soft delete
    comment.isDeleted = true;
    comment.text = '[deleted]';
    await comment.save();

    // Decrement video comment count
    await Video.findByIdAndUpdate(comment.video, {
      $inc: { comments: -1 },
    });

    logger.info(`✅ Comment deleted: ${req.params.id}`);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    logger.error(`Delete comment error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   POST /api/v1/comments/:id/like
 * @desc    Like a comment
 * @access  Private
 */
exports.likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    comment.likes += 1;
    await comment.save();

    res.status(200).json({
      success: true,
      message: 'Comment liked',
      data: { likes: comment.likes },
    });
  } catch (error) {
    logger.error(`Like comment error: ${error.message}`);
    next(error);
  }
};
