require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Video = require('../models/Video');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');
const Like = require('../models/Like');

const logger = require('../config/logger');

/**
 * Seed Script
 * Populates database with sample data for testing
 */

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dorphin';

// Sample data
const sampleUsers = [
  {
    email: 'alex@dorphin.app',
    password: 'password123',
    displayName: 'Alex Rivers',
    username: 'alexrivers',
    bio: '🎥 Content creator | Travel & Tech enthusiast',
    avatar: 'https://i.pravatar.cc/150?img=1',
    isVerified: true,
  },
  {
    email: 'sarah@dorphin.app',
    password: 'password123',
    displayName: 'Sarah Chen',
    username: 'sarahchen',
    bio: '✨ Digital artist & animator',
    avatar: 'https://i.pravatar.cc/150?img=5',
    isVerified: true,
  },
  {
    email: 'mike@dorphin.app',
    password: 'password123',
    displayName: 'Mike Johnson',
    username: 'mikej',
    bio: '🎮 Gaming content | Live streams daily',
    avatar: 'https://i.pravatar.cc/150?img=12',
    isVerified: false,
  },
  {
    email: 'emma@dorphin.app',
    password: 'password123',
    displayName: 'Emma Watson',
    username: 'emmaw',
    bio: '🎨 Creative director | Design tips',
    avatar: 'https://i.pravatar.cc/150?img=9',
    isVerified: true,
  },
  {
    email: 'david@dorphin.app',
    password: 'password123',
    displayName: 'David Park',
    username: 'davidpark',
    bio: '🏃 Fitness & wellness coach',
    avatar: 'https://i.pravatar.cc/150?img=15',
    isVerified: false,
  },
];

const sampleVideos = [
  {
    title: 'Amazing Sunset Timelapse',
    description: 'Captured this beautiful sunset over the ocean 🌅',
    category: 'short',
    duration: 30,
    tags: ['nature', 'sunset', 'timelapse'],
    hashtags: ['sunset', 'nature', 'beautiful'],
  },
  {
    title: 'Quick Cooking Tutorial',
    description: 'How to make the perfect pasta in 5 minutes! 🍝',
    category: 'short',
    duration: 45,
    tags: ['cooking', 'tutorial', 'food'],
    hashtags: ['cooking', 'foodie', 'recipe'],
  },
  {
    title: 'Travel Vlog: Tokyo Adventure',
    description: 'Exploring the streets of Tokyo! Day 1 of my Japan trip 🇯🇵',
    category: 'long',
    duration: 180,
    tags: ['travel', 'vlog', 'japan', 'tokyo'],
    hashtags: ['travel', 'tokyo', 'japan', 'adventure'],
  },
  {
    title: 'Morning Workout Routine',
    description: 'Get energized with this 10-minute morning workout 💪',
    category: 'short',
    duration: 60,
    tags: ['fitness', 'workout', 'health'],
    hashtags: ['fitness', 'workout', 'motivation'],
  },
  {
    title: 'Digital Art Process',
    description: 'Watch me create this character from scratch! 🎨',
    category: 'long',
    duration: 240,
    tags: ['art', 'digital', 'drawing'],
    hashtags: ['art', 'digitalart', 'creative'],
  },
];

const sampleComments = [
  'This is amazing! 🔥',
  'Love your content!',
  'Can you do a tutorial on this?',
  'Incredible work! 👏',
  'Where can I learn more about this?',
  'This inspired me so much!',
  'Great video as always!',
  'Mind blown 🤯',
  'Thanks for sharing!',
  'Subscribed!',
];

/**
 * Clear existing data
 */
const clearDatabase = async () => {
  await User.deleteMany({});
  await Video.deleteMany({});
  await Comment.deleteMany({});
  await Follow.deleteMany({});
  await Like.deleteMany({});
  logger.info('✅ Database cleared');
};

/**
 * Seed users
 */
const seedUsers = async () => {
  const users = [];
  
  for (const userData of sampleUsers) {
    const user = await User.create(userData);
    users.push(user);
  }
  
  logger.info(`✅ Created ${users.length} users`);
  return users;
};

/**
 * Seed videos
 */
const seedVideos = async (users) => {
  const videos = [];
  
  for (let i = 0; i < sampleVideos.length; i++) {
    const videoData = sampleVideos[i];
    const creator = users[i % users.length];
    
    const video = await Video.create({
      ...videoData,
      creator: creator._id,
      videoUrl: `https://storage.dorphin.app/videos/sample-${i + 1}.mp4`,
      thumbnailUrl: `https://picsum.photos/seed/${i + 1}/400/600`,
      views: Math.floor(Math.random() * 10000) + 1000,
      likes: Math.floor(Math.random() * 1000) + 100,
      comments: Math.floor(Math.random() * 100) + 10,
      shares: Math.floor(Math.random() * 50) + 5,
    });
    
    // Calculate recommendation score
    video.calculateRecommendationScore();
    await video.save();
    
    videos.push(video);
    
    // Update user stats
    creator.videosCount += 1;
    creator.totalViews += video.views;
    creator.totalLikes += video.likes;
    await creator.save();
  }
  
  logger.info(`✅ Created ${videos.length} videos`);
  return videos;
};

/**
 * Seed follows
 */
const seedFollows = async (users) => {
  const follows = [];
  
  // Create some follow relationships
  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < users.length; j++) {
      if (i !== j && Math.random() > 0.5) {
        try {
          const follow = await Follow.create({
            follower: users[i]._id,
            following: users[j]._id,
          });
          follows.push(follow);
          
          // Update counts
          users[i].followingCount += 1;
          users[j].followersCount += 1;
        } catch (error) {
          // Skip duplicate follows
        }
      }
    }
  }
  
  // Save updated user counts
  for (const user of users) {
    await user.save();
  }
  
  logger.info(`✅ Created ${follows.length} follow relationships`);
  return follows;
};

/**
 * Seed likes
 */
const seedLikes = async (users, videos) => {
  const likes = [];
  
  // Each user likes some random videos
  for (const user of users) {
    const videosToLike = videos.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    for (const video of videosToLike) {
      try {
        const like = await Like.create({
          user: user._id,
          targetType: 'Video',
          targetId: video._id,
          video: video._id,
        });
        likes.push(like);
      } catch (error) {
        // Skip duplicate likes
      }
    }
  }
  
  logger.info(`✅ Created ${likes.length} likes`);
  return likes;
};

/**
 * Seed comments
 */
const seedComments = async (users, videos) => {
  const comments = [];
  
  // Add comments to each video
  for (const video of videos) {
    const numComments = Math.floor(Math.random() * 5) + 3;
    
    for (let i = 0; i < numComments; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
      
      const comment = await Comment.create({
        video: video._id,
        user: randomUser._id,
        text: randomComment,
        likes: Math.floor(Math.random() * 50),
      });
      
      comments.push(comment);
    }
  }
  
  logger.info(`✅ Created ${comments.length} comments`);
  return comments;
};

/**
 * Main seed function
 */
const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    logger.info('✅ Connected to MongoDB');
    
    // Clear existing data
    await clearDatabase();
    
    // Seed data
    const users = await seedUsers();
    const videos = await seedVideos(users);
    await seedFollows(users);
    await seedLikes(users, videos);
    await seedComments(users, videos);
    
    logger.info(`
    ╔════════════════════════════════════════════════════════════╗
    ║                                                            ║
    ║   ✅ DATABASE SEEDED SUCCESSFULLY!                         ║
    ║                                                            ║
    ║   Users: ${users.length}                                              ║
    ║   Videos: ${videos.length}                                            ║
    ║                                                            ║
    ║   Test Account:                                            ║
    ║   Email: alex@dorphin.app                                  ║
    ║   Password: password123                                    ║
    ║                                                            ║
    ╚════════════════════════════════════════════════════════════╝
    `);
    
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Seed error: ${error.message}`);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
