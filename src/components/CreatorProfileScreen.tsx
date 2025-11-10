import { useState } from 'react';
import { Video } from '../types';
import { VideoCard } from './VideoCard';
import { ArrowLeft, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  {
    id: 'creator-vid-4',
    title: 'Daily Vlog',
    creator: 'Creator Alpha',
    creatorAvatar: '#7B2CBF',
    thumbnail: '#FFB6D9',
    duration: 280,
    views: 980000,
    likes: 38000,
    comments: 950,
    uploadDate: '2 weeks ago',
    category: 'long',
  },
  {
    id: 'creator-short-1',
    title: 'Quick Tip #1',
    creator: 'Creator Alpha',
    creatorAvatar: '#7B2CBF',
    thumbnail: '#FF85A1',
    duration: 45,
    views: 2500000,
    likes: 120000,
    comments: 3200,
    uploadDate: '1 day ago',
    category: 'short',
  },
  {
    id: 'creator-short-2',
    title: 'Funny Moment',
    creator: 'Creator Alpha',
    creatorAvatar: '#7B2CBF',
    thumbnail: '#B8A9FF',
    duration: 30,
    views: 3200000,
    likes: 150000,
    comments: 4100,
    uploadDate: '3 days ago',
    category: 'short',
  },
  {
    id: 'creator-short-3',
    title: 'Life Hack',
    creator: 'Creator Alpha',
    creatorAvatar: '#7B2CBF',
    thumbnail: '#A0E7FF',
    duration: 38,
    views: 1800000,
    likes: 85000,
    comments: 2200,
    uploadDate: '4 days ago',
    category: 'short',
  },
  {
    id: 'creator-short-4',
    title: 'Daily Routine',
    creator: 'Creator Alpha',
    creatorAvatar: '#7B2CBF',
    thumbnail: '#FFD9A0',
    duration: 52,
    views: 2100000,
    likes: 95000,
    comments: 2800,
    uploadDate: '6 days ago',
    category: 'short',
  },
  {
    id: 'creator-short-5',
    title: 'Quick Recipe',
    creator: 'Creator Alpha',
    creatorAvatar: '#7B2CBF',
    thumbnail: '#C9FFB8',
    duration: 41,
    views: 1500000,
    likes: 72000,
    comments: 1900,
    uploadDate: '1 week ago',
    category: 'short',
  },
  {
    id: 'creator-short-6',
    title: 'Dance Move',
    creator: 'Creator Alpha',
    creatorAvatar: '#7B2CBF',
    thumbnail: '#FFB8E6',
    duration: 28,
    views: 4100000,
    likes: 180000,
    comments: 5200,
    uploadDate: '1 week ago',
    category: 'short',
  },
];

export function CreatorProfileScreen({ creatorId, onBack, onVideoClick, followedCreators, onFollowCreator }: CreatorProfileScreenProps) {
  const [activeTab, setActiveTab] = useState<'longs' | 'shorts'>('longs');
  const creator = mockCreatorData[creatorId as keyof typeof mockCreatorData] || mockCreatorData['creator-1'];
  const isFollowing = followedCreators.has(creatorId);

  // Filter videos based on active tab
  const filteredVideos = mockVideos.filter(video => 
    activeTab === 'longs' ? video.category === 'long' : video.category === 'short'
  );

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-ios bg-background/80 px-4 py-3 flex items-center gap-3">
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
            className="w-24 h-24 rounded-lg shadow-ios-lg"
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

      {/* Tab Selector */}
      <div className="px-4 pb-3">
        <div className="relative bg-muted rounded-xl p-1 flex gap-1">
          {/* Sliding Background */}
          <motion.div
            className="absolute top-1 bottom-1 bg-background rounded-lg shadow-ios-sm"
            initial={false}
            animate={{
              left: activeTab === 'longs' ? '4px' : '50%',
              right: activeTab === 'longs' ? '50%' : '4px',
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />

          {/* Longs Tab */}
          <button
            onClick={() => setActiveTab('longs')}
            className="relative z-10 flex-1 py-2 px-4 rounded-lg text-sm transition-colors"
          >
            <span className={activeTab === 'longs' ? 'text-foreground' : 'text-muted-foreground'}>
              Longs
            </span>
          </button>

          {/* Shorts Tab */}
          <button
            onClick={() => setActiveTab('shorts')}
            className="relative z-10 flex-1 py-2 px-4 rounded-lg text-sm transition-colors"
          >
            <span className={activeTab === 'shorts' ? 'text-foreground' : 'text-muted-foreground'}>
              Shorts
            </span>
          </button>
        </div>
      </div>

      {/* Videos Grid - 2 columns for longs, 3 for shorts */}
      <div className="px-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              mass: 0.8
            }}
          >
            <div className={`grid ${activeTab === 'longs' ? 'grid-cols-2' : 'grid-cols-3'} gap-[3px]`}>
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  className={`relative overflow-hidden cursor-pointer ${
                    activeTab === 'longs' ? 'aspect-square' : 'aspect-[9/16]'
                  }`}
                  onClick={() => onVideoClick(video)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 25,
                    delay: index * 0.03
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Thumbnail */}
                  {video.thumbnail.startsWith('#') || video.thumbnail.startsWith('rgb') ? (
                    <div 
                      className="absolute inset-0 w-full h-full"
                      style={{ backgroundColor: video.thumbnail }}
                    />
                  ) : (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  
                  {/* Views overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-end p-2">
                    <p className="text-white text-xs">{formatNumber(video.views)} views</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredVideos.length === 0 && (
              <motion.div 
                className="text-center py-16 text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p>No {activeTab} yet</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
