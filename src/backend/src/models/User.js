const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Model Schema
 * Represents users in the Dorphin platform
 */

const userSchema = new mongoose.Schema(
  {
    // Authentication
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    
    // Profile Information
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
      maxlength: [50, 'Display name cannot exceed 50 characters'],
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      match: [/^[a-zA-Z0-9_]{3,20}$/, 'Username must be 3-20 characters, alphanumeric and underscores only'],
    },
    avatar: {
      type: String,
      default: 'https://ui-avatars.com/api/?background=random&name=User',
    },
    bio: {
      type: String,
      maxlength: [200, 'Bio cannot exceed 200 characters'],
      default: '',
    },
    
    // OAuth
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    appleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'apple'],
      default: 'local',
    },
    
    // Verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    
    // Social Stats
    followersCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
    videosCount: {
      type: Number,
      default: 0,
    },
    totalViews: {
      type: Number,
      default: 0,
    },
    totalLikes: {
      type: Number,
      default: 0,
    },
    
    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false, // Blue checkmark for verified accounts
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    
    // Settings
    isPrivate: {
      type: Boolean,
      default: false,
    },
    allowComments: {
      type: Boolean,
      default: true,
    },
    allowDuet: {
      type: Boolean,
      default: true,
    },
    
    // Preferences
    preferences: {
      notifications: {
        likes: { type: Boolean, default: true },
        comments: { type: Boolean, default: true },
        follows: { type: Boolean, default: true },
        mentions: { type: Boolean, default: true },
      },
      privacy: {
        showLikedVideos: { type: Boolean, default: true },
        showFollowing: { type: Boolean, default: true },
      },
    },
    
    // Last Activity
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ followersCount: -1 });
userSchema.index({ totalViews: -1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  next();
});

// Generate username from email if not provided
userSchema.pre('save', function (next) {
  if (!this.username && this.email) {
    const baseUsername = this.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
    this.username = baseUsername + Math.floor(Math.random() * 1000);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile
userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    displayName: this.displayName,
    username: this.username,
    avatar: this.avatar,
    bio: this.bio,
    followersCount: this.followersCount,
    followingCount: this.followingCount,
    videosCount: this.videosCount,
    totalViews: this.totalViews,
    totalLikes: this.totalLikes,
    isVerified: this.isVerified,
    createdAt: this.createdAt,
  };
};

// Virtual for formatted follower count
userSchema.virtual('followersFormatted').get(function () {
  if (this.followersCount >= 1000000) {
    return (this.followersCount / 1000000).toFixed(1) + 'M';
  } else if (this.followersCount >= 1000) {
    return (this.followersCount / 1000).toFixed(1) + 'K';
  }
  return this.followersCount.toString();
});

module.exports = mongoose.model('User', userSchema);
