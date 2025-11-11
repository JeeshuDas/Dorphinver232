const mongoose = require('mongoose');

/**
 * Comment Model Schema
 * Represents comments and replies on videos
 */

const commentSchema = new mongoose.Schema(
  {
    // Reference to video
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
      index: true,
    },
    
    // Comment author
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    // Comment content
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    
    // Reply system (nested comments)
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
      index: true,
    },
    
    // Engagement
    likes: {
      type: Number,
      default: 0,
    },
    
    // Moderation
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    
    // Mentions
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
commentSchema.index({ video: 1, createdAt: -1 });
commentSchema.index({ user: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1, createdAt: 1 });
commentSchema.index({ likes: -1 });

// Virtual for reply count
commentSchema.virtual('replyCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
  count: true,
});

// Virtual for formatted time
commentSchema.virtual('timeAgo').get(function () {
  const seconds = Math.floor((Date.now() - this.createdAt) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  
  return 'Just now';
});

module.exports = mongoose.model('Comment', commentSchema);
