const Notification = require('../models/Notification');
const logger = require('../config/logger');

/**
 * Notification Controller
 * Handles user notifications
 */

/**
 * @route   GET /api/v1/notifications
 * @desc    Get user notifications
 * @access  Private
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type; // Optional filter by type

    let query = { recipient: req.user.id };
    if (type) {
      query.type = type;
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'displayName username avatar isVerified')
      .populate('video', 'title thumbnailUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error(`Get notifications error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   GET /api/v1/notifications/unread-count
 * @desc    Get count of unread notifications
 * @access  Private
 */
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    logger.error(`Get unread count error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   PUT /api/v1/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    // Check ownership
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification },
    });
  } catch (error) {
    logger.error(`Mark as read error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   PUT /api/v1/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true, readAt: Date.now() }
    );

    logger.info(`✅ All notifications marked as read for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    logger.error(`Mark all as read error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   DELETE /api/v1/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    // Check ownership
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    logger.error(`Delete notification error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   DELETE /api/v1/notifications
 * @desc    Delete all notifications
 * @access  Private
 */
exports.deleteAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });

    logger.info(`✅ All notifications deleted for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'All notifications deleted',
    });
  } catch (error) {
    logger.error(`Delete all notifications error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   PUT /api/v1/notifications/settings
 * @desc    Update notification preferences
 * @access  Private
 */
exports.updateSettings = async (req, res, next) => {
  try {
    const { likes, comments, follows, mentions } = req.body;

    const User = require('../models/User');
    const user = await User.findById(req.user.id);

    if (likes !== undefined) user.preferences.notifications.likes = likes;
    if (comments !== undefined) user.preferences.notifications.comments = comments;
    if (follows !== undefined) user.preferences.notifications.follows = follows;
    if (mentions !== undefined) user.preferences.notifications.mentions = mentions;

    await user.save();

    logger.info(`✅ Notification settings updated for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Notification settings updated',
      data: {
        preferences: user.preferences.notifications,
      },
    });
  } catch (error) {
    logger.error(`Update notification settings error: ${error.message}`);
    next(error);
  }
};
