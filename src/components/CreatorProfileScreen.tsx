import { useState, useEffect, useMemo } from 'react';
import { Video } from '../types';
import { VideoCard } from './VideoCard';
import { ArrowLeft, Settings, Loader2, User, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { mockVideos as allMockVideos } from '../data/mockData';

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
    realCreatorNames: ['AnimeZone', 'AnimeEdits', 'MangaReviews'], // Map to actual video creators
  },
  'creator-2': {
    name: 'Creator Beta',
    username: '@creatorbeta',
    avatar: '#9D4EDD',
    followers: 1800000,
    following: 120,
    videos: 189,
    bio: 'Your daily dose of entertainment ✨',
    realCreatorNames: ['MusicWorld', 'DJMaster', 'IndieMusicHub', 'MusicTeacher'],
  },
  'creator-3': {
    name: 'Creator Gamma',
    username: '@creatorgamma',
    avatar: '#C77DFF',
    followers: 3200000,
    following: 200,
    videos: 456,
    bio: 'Making the internet a better place 🌟',
    realCreatorNames: ['ComedyClub', 'MemeLord', 'ViralContent'],
  },
  'creator-4': {
    name: 'Creator Delta',
    username: '@creatordelta',
    avatar: '#E0AAFF',
    followers: 1200000,
    following: 95,
    videos: 158,
    bio: 'Bringing smiles to your feed 😊',
    realCreatorNames: ['GamerPro', 'GamersUnited', 'NeonGamer'],
  },
  'creator-5': {
    name: 'Creator Epsilon',
    username: '@creatorepsilon',
    avatar: '#FF6FD8',
    followers: 980000,
    following: 78,
    videos: 112,
    bio: 'Living life one video at a time 🎥',
    realCreatorNames: ['FoodieChannel', 'BakeMaster'],
  },
};

export function CreatorProfileScreen({ creatorId, onBack, onVideoClick, followedCreators, onFollowCreator }: CreatorProfileScreenProps) {
  const { isAuthenticated } = useAuth();
  const [creator, setCreator] = useState(mockCreatorData[creatorId as keyof typeof mockCreatorData] || mockCreatorData['creator-1']);
  const [videos, setVideos] = useState<Video[]>(allMockVideos);
  const [isLoading, setIsLoading] = useState(false);
  const isFollowing = followedCreators.has(creatorId);

  // Use mock data - no backend calls
  useEffect(() => {
    // Get the creator data
    const creatorData = mockCreatorData[creatorId as keyof typeof mockCreatorData] || mockCreatorData['creator-1'];
    setCreator(creatorData);
    
    // Filter videos by this creator's real names from mock data
    const creatorVideos = allMockVideos.filter(v => creatorData.realCreatorNames.includes(v.creator));
    setVideos(creatorVideos);
  }, [creatorId]);

  // Show all videos
  const filteredVideos = videos;

  // Calculate monthly score from creator's videos (demo)
  const monthlyScore = useMemo(() => {
    let totalScore = 0;
    
    for (const video of videos) {
      const watchTime = video.watchTime || video.duration || 0;
      const likes = video.likes || 0;
      const views = typeof video.views === 'string' ? parseInt(video.views.replace(/,/g, '')) : (video.views || 0);
      
      // Calculate score using formula: 0.5*watchTime + 0.3*likes + 0.1*views
      const videoScore = (0.5 * watchTime) + (0.3 * likes) + (0.1 * views);
      totalScore += videoScore;
    }
    
    return totalScore;
  }, [videos]);

  // Calculate average view count
  const avgViews = useMemo(() => {
    if (videos.length === 0) return 0;
    
    const totalViews = videos.reduce((sum, video) => {
      const views = typeof video.views === 'string' ? parseInt(video.views.replace(/,/g, '')) : (video.views || 0);
      return sum + views;
    }, 0);
    
    return totalViews / videos.length;
  }, [videos]);

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
        {isLoading && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
      </div>

      {/* Profile Header */}
      <div className="px-4 py-6">
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar */}
          <motion.div
            className="w-20 h-20 rounded-xl shadow-ios-lg shrink-0"
            style={{ backgroundColor: creator.avatar }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />

          {/* Name and Username */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl truncate">{creator.name}</h2>
            <p className="text-sm text-muted-foreground">{creator.username}</p>
          </div>

          {/* Follow Button */}
          <motion.button
            onClick={(e) => {
              e.preventDefault();
              onFollowCreator(creatorId);
            }}
            className={`px-6 py-2 rounded-full text-sm shadow-ios-sm transition-colors shrink-0 ${
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

        {/* Bio */}
        <p className="mb-5 text-muted-foreground">{creator.bio}</p>
        
        {/* Stats: Follower Count, Score & Avg Views */}
        <div 
          className="grid grid-cols-3 gap-4 py-4 rounded-xl"
          style={{
            background: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex flex-col items-center gap-1 relative">
            <User className="w-5 h-5 text-muted-foreground" />
            <span className="text-2xl">{formatNumber(creator.followers)}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Followers</span>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          </div>
          
          <div className="flex flex-col items-center gap-1 relative">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-2xl">{formatNumber(monthlyScore)}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Score</span>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <div className="w-5 h-5 flex items-center justify-center">
              <span className="text-lg">👁️</span>
            </div>
            <span className="text-2xl">{formatNumber(avgViews)}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Avg Views</span>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="px-2">
        <AnimatePresence mode="wait">
          <motion.div
            key="videos"
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
            <div className="grid grid-cols-2 gap-[3px]">
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  className="relative overflow-hidden cursor-pointer aspect-square"
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
                <p>No videos yet</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}