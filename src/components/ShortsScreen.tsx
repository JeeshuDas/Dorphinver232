import { useState, useEffect } from 'react';
import { Video } from '../types';
import { shortsCategories } from '../data/mockData';
import { Smile, MessageCircle, Send, MoreVertical, X } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';

interface ShortsScreenProps {
  onCollapse: (video: Video) => void;
  onMenuClick: (video: Video) => void;
  onClose: () => void;
  categoryId?: string;
  startIndex?: number;
  followedCreators: Set<string>;
  onFollowCreator: (creatorId: string) => void;
}

export function ShortsScreen({ onCollapse, onMenuClick, onClose, categoryId, startIndex = 0, followedCreators, onFollowCreator }: ShortsScreenProps) {
  // Get shorts from the specific category or all shorts
  const shortsArray = categoryId
    ? shortsCategories.find(c => c.id === categoryId)?.shorts || []
    : shortsCategories.flatMap(c => c.shorts);

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [direction, setDirection] = useState(0);

  const currentVideo = shortsArray[currentIndex];

  const handleSwipe = (offset: number, velocity: number) => {
    if (Math.abs(velocity) > 500 || Math.abs(offset) > 100) {
      if (offset > 0 && currentIndex > 0) {
        setDirection(-1);
        setCurrentIndex(currentIndex - 1);
      } else if (offset < 0 && currentIndex < shortsArray.length - 1) {
        setDirection(1);
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 left-4 z-50 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center shadow-ios"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{ y: direction > 0 ? '100%' : '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: direction > 0 ? '-100%' : '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, info: PanInfo) => handleSwipe(info.offset.y, info.velocity.y)}
          className="absolute inset-0"
        >
          <ShortVideo 
            video={currentVideo} 
            onCollapse={onCollapse}
            onMenuClick={onMenuClick}
            followedCreators={followedCreators}
            onFollowCreator={onFollowCreator}
          />
        </motion.div>
      </AnimatePresence>

      {/* Swipe Indicator */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
        {currentIndex + 1} / {shortsArray.length}
      </div>
    </div>
  );
}

function ShortVideo({ 
  video, 
  onCollapse,
  onMenuClick,
  followedCreators,
  onFollowCreator
}: { 
  video: Video;
  onCollapse: (video: Video) => void;
  onMenuClick: (video: Video) => void;
  followedCreators: Set<string>;
  onFollowCreator: (creatorId: string) => void;
}) {
  const [liked, setLiked] = useState(false);
  
  // Map creator names to IDs
  const getCreatorId = (creatorName: string): string => {
    // For names like "creator account 1" -> "creator-1"
    const match = creatorName.match(/(\d+)/);
    if (match) {
      return `creator-${match[1]}`;
    }
    // For names like "Music Creator 1" -> "music-creator-1"
    return creatorName.toLowerCase().replace(/\s+/g, '-');
  };
  
  const creatorId = getCreatorId(video.creator);
  const isFollowing = followedCreators.has(creatorId);

  return (
    <div className="relative h-full w-full" style={{ backgroundColor: video.thumbnail }}>
      {/* Video Content Area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white/30 text-6xl">▶</div>
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-24 flex flex-col gap-6">
        {/* Collapse Button */}
        <ActionButton
          icon={
            <div className="text-2xl">C</div>
          }
          label=""
          onClick={() => onCollapse(video)}
        />

        {/* React Button */}
        <ActionButton
          icon={<Smile className={`w-7 h-7 ${liked ? 'fill-red-500 text-red-500' : ''}`} />}
          label="234K"
          onClick={() => setLiked(!liked)}
        />

        {/* Comment Button */}
        <ActionButton
          icon={<MessageCircle className="w-7 h-7" />}
          label="1.2K"
        />

        {/* Send Button */}
        <ActionButton
          icon={<Send className="w-7 h-7" />}
          label="Share"
        />
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-4 left-4 right-20">
        <div className="flex items-center gap-3 mb-2">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: video.creatorAvatar }}
          />
          <div>
            <p className="text-white">{video.creator}</p>
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFollowCreator(creatorId);
              }}
              className={`mt-1 px-4 py-1 rounded-full text-sm shadow-ios-sm transition-colors ${
                isFollowing 
                  ? 'bg-white/30 backdrop-blur-ios text-white border border-white/40' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              layout
            >
              {isFollowing ? 'Following' : 'Follow'}
            </motion.button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-orange-400"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: video.duration, ease: 'linear' }}
          />
        </div>

        {/* Duration */}
        <div className="flex justify-between items-center mt-1">
          <span className="text-white/70 text-sm">{video.title}</span>
          <span className="text-white/70 text-sm">0:{video.duration.toString().padStart(2, '0')}</span>
        </div>
      </div>

      {/* Three Dots Menu */}
      <button
        onClick={() => onMenuClick(video)}
        className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
      >
        <MoreVertical className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}

function ActionButton({ 
  icon, 
  label, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      className="flex flex-col items-center gap-1"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
    >
      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white">
        {icon}
      </div>
      {label && <span className="text-white text-xs">{label}</span>}
    </motion.button>
  );
}
