const mongoose = require('mongoose');

/**
 * Notification Model Schema
 * Represents user notifications for various activities
 */

const notificationSchema = new mongoose.Schema(
  {
    // Recipient
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    // Sender (who triggered the notification)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Notification type
    type: {
      type: String,
      enum: ['like', 'comment', 'follow', 'mention', 'reply', 'share'],
      required: true,
      index: true,
    },
    
    // Related content
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
    
    // Notification message
    message: {
      type: String,
      required: true,
    },
    
    // Status
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    
    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

// TTL index - auto-delete notifications older than 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

// Mark as read
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);
