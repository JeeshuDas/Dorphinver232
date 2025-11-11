const mongoose = require('mongoose');

/**
 * Follow Model Schema
 * Represents follow relationships between users
 */

const followSchema = new mongoose.Schema(
  {
    // User who is following
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    // User being followed
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    // Notifications
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate follows
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Index for efficient queries
followSchema.index({ follower: 1, createdAt: -1 });
followSchema.index({ following: 1, createdAt: -1 });

// Prevent self-follow
followSchema.pre('save', function (next) {
  if (this.follower.equals(this.following)) {
    const error = new Error('Users cannot follow themselves');
    return next(error);
  }
  next();
});

module.exports = mongoose.model('Follow', followSchema);
