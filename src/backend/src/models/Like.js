const mongoose = require('mongoose');

/**
 * Like Model Schema
 * Represents likes on videos and comments
 */

const likeSchema = new mongoose.Schema(
  {
    // User who liked
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    // Target of like (video or comment)
    targetType: {
      type: String,
      enum: ['Video', 'Comment'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    
    // Video reference for analytics (even if liking a comment)
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
likeSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });
likeSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
likeSchema.index({ user: 1, createdAt: -1 });
likeSchema.index({ video: 1, createdAt: -1 });

module.exports = mongoose.model('Like', likeSchema);
