const mongoose = require('mongoose');

/**
 * Video Model Schema
 * Represents video content in the Dorphin platform
 */

const videoSchema = new mongoose.Schema(
  {
    // Creator
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    // Video Information
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    
    // Media URLs
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
    },
    thumbnailUrl: {
      type: String,
      required: [true, 'Thumbnail URL is required'],
    },
    
    // Video Metadata
    duration: {
      type: Number, // Duration in seconds
      required: true,
      min: [1, 'Duration must be at least 1 second'],
      max: [300, 'Duration cannot exceed 300 seconds (5 minutes)'],
    },
    width: {
      type: Number,
      default: 1080,
    },
    height: {
      type: Number,
      default: 1920,
    },
    orientation: {
      type: String,
      enum: ['portrait', 'landscape', 'square'],
      default: 'portrait',
    },
    fileSize: {
      type: Number, // Size in bytes
    },
    format: {
      type: String,
      enum: ['mp4', 'mov', 'avi', 'webm'],
      default: 'mp4',
    },
    
    // Category and Tags
    category: {
      type: String,
      enum: ['short', 'long'],
      required: true,
      index: true,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    hashtags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    
    // Engagement Metrics
    views: {
      type: Number,
      default: 0,
      index: true,
    },
    likes: {
      type: Number,
      default: 0,
      index: true,
    },
    comments: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    
    // Analytics
    analytics: {
      totalWatchTime: {
        type: Number, // Total watch time in seconds
        default: 0,
      },
      averageWatchTime: {
        type: Number, // Average watch time in seconds
        default: 0,
      },
      completionRate: {
        type: Number, // Percentage of users who watched till end
        default: 0,
        min: 0,
        max: 100,
      },
      engagementRate: {
        type: Number, // (likes + comments + shares) / views * 100
        default: 0,
      },
      retentionCurve: [{
        timestamp: Number, // Second in video
        percentage: Number, // Percentage of viewers still watching
      }],
    },
    
    // Visibility Settings
    isPublic: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    
    // Content Moderation
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'approved',
      index: true,
    },
    flagCount: {
      type: Number,
      default: 0,
    },
    
    // Settings
    allowComments: {
      type: Boolean,
      default: true,
    },
    allowDuet: {
      type: Boolean,
      default: true,
    },
    allowDownload: {
      type: Boolean,
      default: true,
    },
    
    // Location (optional)
    location: {
      name: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
        },
        coordinates: [Number], // [longitude, latitude]
      },
    },
    
    // Recommendation Score (calculated)
    recommendationScore: {
      type: Number,
      default: 0,
      index: true,
    },
    
    // Timestamps
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for performance
videoSchema.index({ creator: 1, createdAt: -1 });
videoSchema.index({ category: 1, publishedAt: -1 });
videoSchema.index({ views: -1, likes: -1 });
videoSchema.index({ recommendationScore: -1 });
videoSchema.index({ tags: 1 });
videoSchema.index({ hashtags: 1 });
videoSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for like-to-view ratio
videoSchema.virtual('likeRatio').get(function () {
  if (this.views === 0) return 0;
  return ((this.likes / this.views) * 100).toFixed(2);
});

// Virtual for formatted view count
videoSchema.virtual('viewsFormatted').get(function () {
  if (this.views >= 1000000) {
    return (this.views / 1000000).toFixed(1) + 'M';
  } else if (this.views >= 1000) {
    return (this.views / 1000).toFixed(1) + 'K';
  }
  return this.views.toString();
});

// Method to calculate recommendation score
videoSchema.methods.calculateRecommendationScore = function () {
  const weightViews = parseFloat(process.env.RECOMMENDATION_WEIGHT_VIEWS) || 0.3;
  const weightLikes = parseFloat(process.env.RECOMMENDATION_WEIGHT_LIKES) || 0.4;
  const weightComments = parseFloat(process.env.RECOMMENDATION_WEIGHT_COMMENTS) || 0.2;
  const weightShares = parseFloat(process.env.RECOMMENDATION_WEIGHT_SHARES) || 0.1;
  
  const normalizedViews = Math.log10(this.views + 1);
  const normalizedLikes = Math.log10(this.likes + 1);
  const normalizedComments = Math.log10(this.comments + 1);
  const normalizedShares = Math.log10(this.shares + 1);
  
  // Recency factor (newer videos get boosted)
  const daysSincePublished = (Date.now() - this.publishedAt) / (1000 * 60 * 60 * 24);
  const recencyFactor = Math.max(0, 1 - daysSincePublished / 30); // Decays over 30 days
  
  const score = (
    weightViews * normalizedViews +
    weightLikes * normalizedLikes +
    weightComments * normalizedComments +
    weightShares * normalizedShares
  ) * (1 + recencyFactor * 0.5);
  
  this.recommendationScore = score;
  return score;
};

// Update engagement rate
videoSchema.methods.updateEngagementRate = function () {
  if (this.views === 0) {
    this.analytics.engagementRate = 0;
  } else {
    const totalEngagements = this.likes + this.comments + this.shares;
    this.analytics.engagementRate = ((totalEngagements / this.views) * 100).toFixed(2);
  }
};

// Pre-save hook to update metrics
videoSchema.pre('save', function (next) {
  if (this.isModified('views') || this.isModified('likes') || this.isModified('comments')) {
    this.calculateRecommendationScore();
    this.updateEngagementRate();
  }
  next();
});

module.exports = mongoose.model('Video', videoSchema);
