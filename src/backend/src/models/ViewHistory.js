const mongoose = require('mongoose');

/**
 * ViewHistory Model Schema
 * Tracks video views for analytics and recommendations
 */

const viewHistorySchema = new mongoose.Schema(
  {
    // User (optional - can track anonymous views)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    
    // Video viewed
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
      index: true,
    },
    
    // Watch metrics
    watchDuration: {
      type: Number, // Seconds watched
      required: true,
      min: 0,
    },
    completionPercentage: {
      type: Number, // Percentage of video watched
      required: true,
      min: 0,
      max: 100,
    },
    
    // Session info
    sessionId: {
      type: String,
      index: true,
    },
    deviceType: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'unknown'],
      default: 'unknown',
    },
    platform: {
      type: String,
      enum: ['web', 'ios', 'android', 'unknown'],
      default: 'unknown',
    },
    
    // Location (IP-based)
    country: String,
    city: String,
    
    // Metadata
    referrer: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for analytics
viewHistorySchema.index({ video: 1, createdAt: -1 });
viewHistorySchema.index({ user: 1, createdAt: -1 });
viewHistorySchema.index({ user: 1, video: 1 });
viewHistorySchema.index({ createdAt: -1 });

// TTL index - auto-delete view history older than 90 days
viewHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('ViewHistory', viewHistorySchema);
