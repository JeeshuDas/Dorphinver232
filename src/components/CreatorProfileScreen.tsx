import { useState } from 'react';
import { Video } from '../types';
import { VideoCard } from './VideoCard';
import { ArrowLeft, Settings } from 'lucide-react';
import { motion } from 'motion/react';

interface CreatorProfileScreenProps {
  creatorId: string;
  onBack: () => void;
  onVideoClick: (video: Video) => void;
  followedCreators: Set<string>;
  onFollowCreator: (creatorId: string) => void;
}

const mockCreatorData = {
  'creator-1': {
    name: 'Creator Alpha',
    username: '@creatoralpha',
    avatar: '#7B2CBF',
    followers: 2500000,
    following: 150,
    videos: 234,
    bio: 'Creating amazing content every day! 🎬',
  },
  'creator-2': {
    name: 'Creator Beta',
    username: '@creatorbeta',
    avatar: '#9D4EDD',
    followers: 1800000,
    following: 120,
    videos: 189,
    bio: 'Your daily dose of entertainment ✨',
  },
  'creator-3': {
    name: 'Creator Gamma',
    username: '@creatorgamma',
    avatar: '#C77DFF',
    followers: 3200000,
    following: 200,
    videos: 456,
    bio: 'Making the internet a better place 🌟',
  },
  'creator-4': {
    name: 'Creator Delta',
    username: '@creatordelta',
    avatar: '#E0AAFF',
    followers: 1200000,
    following: 95,
    videos: 158,
    bio: 'Bringing smiles to your feed 😊',
  },
  'creator-5': {
    name: 'Creator Epsilon',
    username: '@creatorepsilon',
    avatar: '#FF6FD8',
    followers: 980000,
    following: 78,
    videos: 112,
    bio: 'Living life one video at a time 🎥',
  },
};

const mockVideos: Video[] = [
  {
    id: 'creator-vid-1',
    title: 'Amazing Content Here',
    creator: 'Creator Alpha',
    creatorAvatar: '#7B2CBF',
    thumbnail: '#FF6B9D',
    duration: 320,
    views: 1200000,
    likes: 45000,
    comments: 1200,
    uploadDate: '2 days ago',
    category: 'long',
  },
  {
    id: 'creator-vid-2',
    title: 'Behind the Scenes',
    creator: 'Creator Alpha',
    creatorAvatar: '#7B2CBF',
    thumbnail: '#9D6CFF',
    duration: 180,
    views: 850000,
    likes: 32000,
    comments: 890,
    uploadDate: '5 days ago',
    category: 'long',
  },
  {
    id: 'creator-vid-3',
    title: 'Tutorial & Tips',
    creator: 'Creator Alpha',
    creatorAvatar: '#7B2CBF',
    thumbnail: '#6BCFFF',
    duration: 420,
    views: 2100000,
    likes: 78000,
    comments: 2300,
    uploadDate: '1 week ago',
    category: 'long',
  },
];

export function CreatorProfileScreen({ creatorId, onBack, onVideoClick, followedCreators, onFollowCreator }: CreatorProfileScreenProps) {
  const creator = mockCreatorData[creatorId as keyof typeof mockCreatorData] || mockCreatorData['creator-1'];
  const isFollowing = followedCreators.has(creatorId);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-ios bg-background/80 px-4 py-3 flex items-center gap-3">
        <motion.button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shadow-ios-sm"
          whileHover={{ scale: 1.05, backgroundColor: "var(--accent)" }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <h2 className="flex-1">{creator.name}</h2>
      </div>

      {/* Profile Header */}
      <div className="px-4 py-6">
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <motion.div
            className="w-24 h-24 rounded-full shadow-ios-lg"
            style={{ backgroundColor: creator.avatar }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />

          {/* Stats */}
          <div className="flex-1 flex gap-6 mt-2">
            <div className="flex flex-col items-center">
              <div className="text-xl">{formatNumber(creator.followers)}</div>
              <div className="text-sm text-muted-foreground mb-2.5">Followers</div>
              
              {/* Follow Button - Positioned under Followers */}
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  onFollowCreator(creatorId);
                }}
                className={`px-5 py-1.5 rounded-full text-sm shadow-ios-sm transition-colors ${
                  isFollowing 
                    ? 'bg-muted text-foreground' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                }`}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                layout
              >
                {isFollowing ? 'Following' : 'Follow'}
              </motion.button>
            </div>
            
            <div className="text-center">
              <div className="text-xl">{formatNumber(creator.following)}</div>
              <div className="text-sm text-muted-foreground">Following</div>
            </div>
            <div className="text-center">
              <div className="text-xl">{creator.videos}</div>
              <div className="text-sm text-muted-foreground">Videos</div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <p className="text-muted-foreground">{creator.username}</p>
          <p className="mt-2">{creator.bio}</p>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="px-4 pb-6">
        <h3 className="mb-4">Videos</h3>
        <div className="grid grid-cols-1 gap-4">
          {mockVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 25,
                delay: index * 0.1
              }}
            >
              <VideoCard
                video={video}
                onVideoClick={onVideoClick}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
