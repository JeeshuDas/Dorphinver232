const Video = require('../models/Video');
const User = require('../models/User');
const ViewHistory = require('../models/ViewHistory');
const { uploadToS3, deleteFromS3 } = require('../config/aws');
const logger = require('../config/logger');
const fs = require('fs').promises;

/**
 * Video Controller
 * Handles video operations
 */

/**
 * @route   POST /api/v1/videos/upload
 * @desc    Upload new video
 * @access  Private
 */
exports.uploadVideo = async (req, res, next) => {
  try {
    const { title, description, category, tags, hashtags, duration, allowComments, allowDuet } = req.body;

    if (!req.files || !req.files.video) {
      return res.status(400).json({
        success: false,
        message: 'Video file is required',
      });
    }

    const videoFile = req.files.video[0];
    const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null;

    // Upload video to S3
    const videoBuffer = await fs.readFile(videoFile.path);
    const videoUrl = await uploadToS3(videoBuffer, videoFile.filename, 'videos');

    // Upload thumbnail to S3
    let thumbnailUrl = '';
    if (thumbnailFile) {
      const thumbnailBuffer = await fs.readFile(thumbnailFile.path);
      thumbnailUrl = await uploadToS3(thumbnailBuffer, thumbnailFile.filename, 'thumbnails');
    }

    // Create video record
    const video = await Video.create({
      creator: req.user.id,
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration: parseInt(duration),
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      hashtags: hashtags ? hashtags.split(',').map(tag => tag.trim()) : [],
      fileSize: videoFile.size,
      allowComments: allowComments !== 'false',
      allowDuet: allowDuet !== 'false',
    });

    // Update user video count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { videosCount: 1 },
    });

    // Clean up temp files
    await fs.unlink(videoFile.path);
    if (thumbnailFile) await fs.unlink(thumbnailFile.path);

    logger.info(`✅ Video uploaded: ${video._id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        video: await video.populate('creator', 'displayName username avatar isVerified'),
      },
    });
  } catch (error) {
    logger.error(`Upload video error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   GET /api/v1/videos/feed
 * @desc    Get personalized video feed
 * @access  Public/Private (optional auth)
 */
exports.getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const category = req.query.category; // 'short' or 'long'

    let query = { isPublic: true, isActive: true, moderationStatus: 'approved' };

    if (category) {
      query.category = category;
    }

    // If user is logged in, personalize feed
    let videos;
    if (req.user) {
      // Get user's watch history
      const watchHistory = await ViewHistory.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .limit(50)
        .select('video');
      
      const watchedVideoIds = watchHistory.map(v => v.video);

      // Personalized feed based on recommendation score
      videos = await Video.find(query)
        .populate('creator', 'displayName username avatar isVerified followersCount')
        .sort({ recommendationScore: -1, publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    } else {
      // Anonymous users get trending videos
      videos = await Video.find(query)
        .populate('creator', 'displayName username avatar isVerified followersCount')
        .sort({ views: -1, likes: -1, publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    }

    const total = await Video.countDocuments(query);

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
    logger.error(`Get feed error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   GET /api/v1/videos/:id
 * @desc    Get single video
 * @access  Public
 */
exports.getVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('creator', 'displayName username avatar bio isVerified followersCount');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { video },
    });
  } catch (error) {
    logger.error(`Get video error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   PUT /api/v1/videos/:id
 * @desc    Update video
 * @access  Private (owner only)
 */
exports.updateVideo = async (req, res, next) => {
  try {
    let video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    // Check ownership
    if (video.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this video',
      });
    }

    const { title, description, tags, hashtags, allowComments, allowDuet, isPublic } = req.body;

    if (title) video.title = title;
    if (description) video.description = description;
    if (tags) video.tags = tags.split(',').map(tag => tag.trim());
    if (hashtags) video.hashtags = hashtags.split(',').map(tag => tag.trim());
    if (allowComments !== undefined) video.allowComments = allowComments;
    if (allowDuet !== undefined) video.allowDuet = allowDuet;
    if (isPublic !== undefined) video.isPublic = isPublic;

    await video.save();

    logger.info(`✅ Video updated: ${video._id}`);

    res.status(200).json({
      success: true,
      message: 'Video updated successfully',
      data: { video },
    });
  } catch (error) {
    logger.error(`Update video error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   DELETE /api/v1/videos/:id
 * @desc    Delete video
 * @access  Private (owner only)
 */
exports.deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    // Check ownership
    if (video.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this video',
      });
    }

    // Delete from S3
    // Extract file key from URL
    const videoKey = video.videoUrl.split('/').pop();
    await deleteFromS3(videoKey, 'videos');

    if (video.thumbnailUrl) {
      const thumbnailKey = video.thumbnailUrl.split('/').pop();
      await deleteFromS3(thumbnailKey, 'thumbnails');
    }

    // Delete video
    await video.deleteOne();

    // Update user video count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { videosCount: -1 },
    });

    logger.info(`✅ Video deleted: ${req.params.id}`);

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    logger.error(`Delete video error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   POST /api/v1/videos/:id/view
 * @desc    Record video view
 * @access  Public/Private (optional auth)
 */
exports.recordView = async (req, res, next) => {
  try {
    const { watchDuration, completionPercentage, sessionId, deviceType, platform } = req.body;

    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    // Create view history record
    await ViewHistory.create({
      user: req.user ? req.user.id : null,
      video: video._id,
      watchDuration: parseFloat(watchDuration),
      completionPercentage: parseFloat(completionPercentage),
      sessionId,
      deviceType,
      platform,
    });

    // Increment view count
    video.views += 1;

    // Update analytics
    video.analytics.totalWatchTime += parseFloat(watchDuration);
    video.analytics.averageWatchTime = video.analytics.totalWatchTime / video.views;
    
    if (parseFloat(completionPercentage) >= 90) {
      const completedViews = await ViewHistory.countDocuments({
        video: video._id,
        completionPercentage: { $gte: 90 },
      });
      video.analytics.completionRate = (completedViews / video.views) * 100;
    }

    await video.save();

    // Update user total views
    await User.findByIdAndUpdate(video.creator, {
      $inc: { totalViews: 1 },
    });

    res.status(200).json({
      success: true,
      message: 'View recorded',
    });
  } catch (error) {
    logger.error(`Record view error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   GET /api/v1/videos/user/:userId
 * @desc    Get user's videos
 * @access  Public
 */
exports.getUserVideos = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const videos = await Video.find({
      creator: req.params.userId,
      isPublic: true,
      isActive: true,
    })
      .populate('creator', 'displayName username avatar isVerified')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Video.countDocuments({
      creator: req.params.userId,
      isPublic: true,
      isActive: true,
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
    logger.error(`Get user videos error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   GET /api/v1/videos/search
 * @desc    Search videos
 * @access  Public
 */
exports.searchVideos = async (req, res, next) => {
  try {
    const { q, category, sortBy } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = { isPublic: true, isActive: true };

    // Text search
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
        { hashtags: { $in: [new RegExp(q, 'i')] } },
      ];
    }

    if (category) {
      query.category = category;
    }

    // Sort
    let sort = { publishedAt: -1 };
    if (sortBy === 'views') sort = { views: -1 };
    if (sortBy === 'likes') sort = { likes: -1 };
    if (sortBy === 'recent') sort = { publishedAt: -1 };

    const videos = await Video.find(query)
      .populate('creator', 'displayName username avatar isVerified')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Video.countDocuments(query);

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
    logger.error(`Search videos error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   GET /api/v1/videos/trending
 * @desc    Get trending videos
 * @access  Public
 */
exports.getTrending = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;

    let query = { isPublic: true, isActive: true };
    if (category) query.category = category;

    // Trending = high views in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    query.publishedAt = { $gte: sevenDaysAgo };

    const videos = await Video.find(query)
      .populate('creator', 'displayName username avatar isVerified')
      .sort({ views: -1, likes: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      data: { videos },
    });
  } catch (error) {
    logger.error(`Get trending error: ${error.message}`);
    next(error);
  }
};
