import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Video } from '../types';
import { shortsCategories } from '../data/mockData';
import { Smile, MessageCircle, Send, Menu, X, Heart, Share2, Play, Pause, Link, Download, Facebook, Instagram, Twitter, Check } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { SmileyIcon } from './SmileyIcon';
import { toast } from 'sonner@2.0.3';
import { copyToClipboard } from '../utils/clipboard';

interface ShortsScreenProps {
  onCollapse: (video: Video) => void;
  onMenuClick: (video: Video) => void;
  onClose: () => void;
  categoryId?: string;
  startIndex?: number;
  followedCreators: Set<string>;
  onFollowCreator: (creatorId: string) => void;
  userVideos?: Video[];
  currentUserId?: string;
  reactedVideos?: Set<string>;
  onReact?: (videoId: string) => void;
  comments?: Record<string, Array<{id: string; user: string; avatar: string; text: string; time: string}>>;
  onAddComment?: (videoId: string, text: string) => void;
}

// Butter smooth spring config
const smoothSpring = {
  type: "spring" as const,
  stiffness: 260,
  damping: 28,
  mass: 0.8
};

const ultraSmoothSpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 35,
  mass: 0.6
};

type OverlayType = 'details' | 'comments' | 'share' | null;

export function ShortsScreen({ 
  onClose, 
  categoryId, 
  startIndex = 0,
  followedCreators,
  onFollowCreator,
  userVideos = [],
  currentUserId = 'user_account',
  reactedVideos = new Set(),
  onReact,
  comments = {},
  onAddComment
}: ShortsScreenProps) {
  // Get shorts from the specific category or all shorts
  const mockShorts = categoryId
    ? shortsCategories.find(c => c.id === categoryId)?.shorts || []
    : shortsCategories.flatMap(c => c.shorts);
  
  // Filter user-uploaded shorts
  const userShorts = userVideos.filter(v => v.category === 'short');
  
  // Combine user shorts (first) with mock shorts
  const shortsArray = [...userShorts, ...mockShorts];

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [direction, setDirection] = useState(0);

  const currentVideo = shortsArray[currentIndex];

  const handleSwipe = useCallback((offset: number, velocity: number) => {
    if (Math.abs(velocity) > 500 || Math.abs(offset) > 100) {
      if (offset > 0 && currentIndex > 0) {
        setDirection(-1);
        setCurrentIndex(currentIndex - 1);
      } else if (offset < 0 && currentIndex < shortsArray.length - 1) {
        setDirection(1);
        setCurrentIndex(currentIndex + 1);
      }
    }
  }, [currentIndex, shortsArray.length]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{ y: direction > 0 ? '100%' : '-100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: direction > 0 ? '-100%' : '100%', opacity: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 260, 
            damping: 28,
            mass: 0.8
          }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          onDragEnd={(e, info: PanInfo) => handleSwipe(info.offset.y, info.velocity.y)}
          className="absolute inset-0"
        >
          <ShortVideo 
            video={currentVideo} 
            isActive={true} 
            followedCreators={followedCreators}
            onFollowCreator={onFollowCreator}
            currentUserId={currentUserId}
            hasReacted={reactedVideos.has(currentVideo.id)}
            onReact={onReact}
            comments={comments[currentVideo.id] || []}
            onAddComment={onAddComment}
          />
        </motion.div>
      </AnimatePresence>

      {/* Close Button - Top Left */}
      <div className="absolute top-6 left-6 z-50 pointer-events-auto">
        <motion.button
          onClick={onClose}
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-ios"
          style={{
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
          whileHover={{ scale: 1.08, backgroundColor: 'rgba(0, 0, 0, 0.55)' }}
          whileTap={{ scale: 0.92 }}
          transition={smoothSpring}
        >
          <X className="w-6 h-6 text-white" />
        </motion.button>
      </div>

      {/* Swipe Indicator - Top Center */}
      <motion.div 
        className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={ultraSmoothSpring}
      >
        <div 
          className="text-white/90 text-sm px-4 py-2 rounded-full"
          style={{
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          {currentIndex + 1} / {shortsArray.length}
        </div>
      </motion.div>
    </div>
  );
}

// Memoized ShortVideo component to prevent unnecessary re-renders
const ShortVideo = memo(({ 
  video, 
  isActive,
  followedCreators,
  onFollowCreator,
  currentUserId = 'user_account',
  hasReacted = false,
  onReact,
  comments = [],
  onAddComment
}: { 
  video: Video; 
  isActive: boolean;
  followedCreators: Set<string>;
  onFollowCreator: (creatorId: string) => void;
  currentUserId?: string;
  hasReacted?: boolean;
  onReact?: (videoId: string) => void;
  comments?: Array<{id: string; user: string; avatar: string; text: string; time: string}>;
  onAddComment?: (videoId: string, text: string) => void;
}) => {
  const [activeOverlay, setActiveOverlay] = useState<OverlayType>(null);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayPauseIcon, setShowPlayPauseIcon] = useState(false);
  const [justReacted, setJustReacted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const prevReactedRef = useRef(hasReacted);
  const creatorId = video.creatorId || `creator-${video.id}`;
  const isFollowing = followedCreators.has(creatorId);

  // Track when reaction changes
  useEffect(() => {
    if (hasReacted && !prevReactedRef.current) {
      setJustReacted(true);
      const timer = setTimeout(() => setJustReacted(false), 1000);
      return () => clearTimeout(timer);
    }
    prevReactedRef.current = hasReacted;
  }, [hasReacted]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isActive) {
      if (isPlaying) {
        videoElement.play().catch(() => {
          // Auto-play prevented
        });
      }
    } else {
      videoElement.pause();
      setIsPlaying(false);
    }

    // Update duration when loaded
    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
    };

    // Update current time
    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isActive, isPlaying]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls && !activeOverlay) {
      timeout = setTimeout(() => setShowControls(false), 2500);
    }
    return () => clearTimeout(timeout);
  }, [showControls, activeOverlay]);

  const handleInteraction = useCallback(() => {
    if (!activeOverlay) {
      setShowControls(true);
    }
  }, [activeOverlay]);

  const formatNumber = useCallback((num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }, []);

  const handleFollowToggle = useCallback(() => {
    onFollowCreator(creatorId);
  }, [onFollowCreator, creatorId]);

  const toggleOverlay = useCallback((type: OverlayType) => {
    setActiveOverlay(prev => prev === type ? null : type);
  }, []);

  const handleReaction = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReact) {
      // Use requestAnimationFrame to defer state update
      requestAnimationFrame(() => {
        onReact(video.id);
      });
    }
  }, [onReact, video.id]);

  // Define these functions first before they're used in other callbacks
  const updateProgressFromEvent = useCallback((e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    const progressBar = progressBarRef.current;
    const videoElement = videoRef.current;
    
    if (progressBar && videoElement && duration > 0) {
      const rect = progressBar.getBoundingClientRect();
      const clickX = (e as MouseEvent).clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = percentage * duration;
      
      videoElement.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [duration]);

  const updateProgressFromTouchEvent = useCallback((e: React.TouchEvent<HTMLDivElement> | TouchEvent) => {
    const progressBar = progressBarRef.current;
    const videoElement = videoRef.current;
    
    if (progressBar && videoElement && duration > 0) {
      const rect = progressBar.getBoundingClientRect();
      const touch = (e as TouchEvent).touches?.[0] || (e as React.TouchEvent<HTMLDivElement>).touches[0];
      const clickX = touch.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = percentage * duration;
      
      videoElement.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [duration]);

  const handleProgressBarClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    updateProgressFromEvent(e);
  }, [updateProgressFromEvent]);

  const handleProgressBarDragStart = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    updateProgressFromEvent(e);
  }, [updateProgressFromEvent]);

  const handleProgressBarTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    updateProgressFromTouchEvent(e);
  }, [updateProgressFromTouchEvent]);

  const handleProgressBarDrag = useCallback((e: MouseEvent) => {
    if (isDragging) {
      updateProgressFromEvent(e as any);
    }
  }, [isDragging, updateProgressFromEvent]);

  const handleProgressBarTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging) {
      updateProgressFromTouchEvent(e as any);
    }
  }, [isDragging, updateProgressFromTouchEvent]);

  const handleProgressBarDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle global mouse and touch events for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleProgressBarDrag);
      window.addEventListener('mouseup', handleProgressBarDragEnd);
      window.addEventListener('touchmove', handleProgressBarTouchMove);
      window.addEventListener('touchend', handleProgressBarDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleProgressBarDrag);
        window.removeEventListener('mouseup', handleProgressBarDragEnd);
        window.removeEventListener('touchmove', handleProgressBarTouchMove);
        window.removeEventListener('touchend', handleProgressBarDragEnd);
      };
    }
  }, [isDragging, handleProgressBarDrag, handleProgressBarDragEnd, handleProgressBarTouchMove]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const togglePlayPause = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
      setIsPlaying(false);
    } else {
      videoElement.play();
      setIsPlaying(true);
    }

    // Show play/pause icon feedback
    setShowPlayPauseIcon(true);
    setTimeout(() => setShowPlayPauseIcon(false), 500);
  }, [isPlaying]);

  return (
    <div 
      className="relative h-full w-full"
      onMouseMove={handleInteraction}
      onTouchStart={handleInteraction}
    >
      {/* Video Content */}
      {video.videoUrl ? (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-contain cursor-pointer bg-black z-10"
          src={video.videoUrl}
          loop
          playsInline
          onClick={togglePlayPause}
        />
      ) : (
        <div 
          className="absolute inset-0 cursor-pointer z-10" 
          onClick={togglePlayPause}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/30 text-9xl">▶</div>
          </div>
        </div>
      )}

      {/* Play/Pause Icon Feedback */}
      <AnimatePresence>
        {showPlayPauseIcon && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              {isPlaying ? (
                <Pause className="w-12 h-12 text-white fill-white" />
              ) : (
                <Play className="w-12 h-12 text-white fill-white" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Bar - Always visible at bottom */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 z-30 pb-8 px-6 pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="flex flex-col items-center gap-3 pointer-events-auto">
          {/* Premium Glassmorphic Action Bar */}
          <div
            className="flex items-center gap-6 px-8 py-4 rounded-full"
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)'
            }}
          >
            {/* React Button */}
            <motion.button
              className="flex flex-col items-center gap-1.5"
              whileHover={{ scale: 1.12, y: -3 }}
              whileTap={{ scale: 0.88 }}
              transition={smoothSpring}
              onClick={handleReaction}
            >
              {hasReacted ? (
                <SmileyIcon className="w-7 h-7" color="#EAB308" animated={justReacted} />
              ) : (
                <Smile className="w-7 h-7 text-white/90" />
              )}
            </motion.button>

            {/* Comment Button */}
            <motion.button
              className="flex flex-col items-center gap-1.5"
              whileHover={{ scale: 1.12, y: -3 }}
              whileTap={{ scale: 0.88 }}
              transition={smoothSpring}
              onClick={(e) => {
                e.stopPropagation();
                toggleOverlay('comments');
              }}
            >
              <MessageCircle className={`w-7 h-7 transition-colors duration-200 ${activeOverlay === 'comments' ? 'text-blue-400' : 'text-white/90'}`} />
            </motion.button>

            {/* Share Button */}
            <motion.button
              className="flex flex-col items-center gap-1.5"
              whileHover={{ scale: 1.12, y: -3 }}
              whileTap={{ scale: 0.88 }}
              transition={smoothSpring}
              onClick={(e) => {
                e.stopPropagation();
                toggleOverlay('share');
              }}
            >
              <Send className={`w-7 h-7 transition-colors duration-200 ${activeOverlay === 'share' ? 'text-blue-400' : 'text-white/90'}`} />
            </motion.button>

            {/* Menu Button */}
            <motion.button
              className="flex flex-col items-center gap-1.5"
              whileHover={{ scale: 1.12, y: -3 }}
              whileTap={{ scale: 0.88 }}
              transition={smoothSpring}
              onClick={(e) => {
                e.stopPropagation();
                toggleOverlay('details');
              }}
            >
              <Menu className={`w-7 h-7 transition-colors duration-200 ${activeOverlay === 'details' ? 'text-blue-400' : 'text-white/90'}`} />
            </motion.button>
          </div>

          {/* Interactive Progress Bar */}
          <div className="w-full max-w-[95%] px-6">
            <div 
              ref={progressBarRef}
              className="relative h-11 rounded-lg cursor-pointer overflow-hidden"
              style={{
                background: '#3d2753',
                border: '3px solid #2a1a3a',
              }}
              onClick={handleProgressBarClick}
              onMouseDown={handleProgressBarDragStart}
              onTouchStart={handleProgressBarTouchStart}
            >
              {/* Filled Progress */}
              <motion.div
                className="absolute inset-0 rounded-lg"
                style={{
                  background: '#a3e635',
                  width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                }}
                initial={false}
                transition={{ duration: 0.1 }}
              />
              
              {/* Time Display - Centered */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-white text-sm px-3 py-1 rounded-full" style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overlays - Positioned at bottom, no full-screen blocking */}
      <AnimatePresence>
        {activeOverlay === 'details' && (
          <div className="absolute bottom-[152px] left-0 right-0 flex justify-center px-6 z-40 pointer-events-none">
            <div className="pointer-events-auto">
              <DetailsOverlay 
                video={video} 
                isFollowing={isFollowing}
                onFollowToggle={handleFollowToggle}
                formatNumber={formatNumber}
                currentUserId={currentUserId}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeOverlay === 'comments' && (
          <div className="absolute bottom-[152px] left-0 right-0 flex justify-center px-6 z-40 pointer-events-none">
            <div className="pointer-events-auto">
              <CommentsOverlay 
                video={video} 
                formatNumber={formatNumber}
                comments={comments}
                onAddComment={onAddComment}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeOverlay === 'share' && (
          <div className="absolute bottom-[152px] left-0 right-0 flex justify-center px-6 z-40 pointer-events-none">
            <div className="pointer-events-auto">
              <ShareOverlay video={video} />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});

ShortVideo.displayName = 'ShortVideo';

// Shared Components - Memoized for performance
const DetailsOverlay = memo(({ 
  video, 
  isFollowing, 
  onFollowToggle, 
  formatNumber,
  currentUserId 
}: { 
  video: Video; 
  isFollowing: boolean; 
  onFollowToggle: () => void; 
  formatNumber: (num: number) => string;
  currentUserId: string;
}) => {
  const creatorId = video.creatorId || video.creator.toLowerCase().replace(/\s+/g, '-');
  const isOwnVideo = creatorId === currentUserId;

  return (
    <motion.div
      className="w-80 max-h-[70vh]"
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 20, opacity: 0, scale: 0.95 }}
      transition={ultraSmoothSpring}
    >
      <div 
        className="rounded-2xl p-5 shadow-2xl mb-3 flex flex-col overflow-y-auto max-h-[70vh]"
        style={{
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        {/* Creator Info */}
        <div className="flex flex-col items-center text-center mb-4">
          <div 
            className="w-14 h-14 rounded-lg mb-2 shadow-ios"
            style={{ backgroundColor: video.creatorAvatar }}
          />
          <p className="text-white text-sm">{video.creator}</p>
          {!isOwnVideo && (
            <Button
              size="sm"
              variant={isFollowing ? "secondary" : "default"}
              onClick={(e) => {
                e.stopPropagation();
                onFollowToggle();
              }}
              className="mt-2 w-full"
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>

        {/* Video Title */}
        <div className="mb-4">
          <h3 className="text-white text-center mb-1.5 text-sm">{video.title}</h3>
          <p className="text-white/60 text-xs text-center leading-relaxed line-clamp-4">
            {video.description || `An amazing short by ${video.creator}.`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-lg">👁️</span>
            <span className="text-white/80 text-xs">{formatNumber(video.views)}</span>
          </div>
          {video.likes !== undefined && (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-lg">❤️</span>
              <span className="text-white/80 text-xs">{formatNumber(video.likes)}</span>
            </div>
          )}
          {video.comments !== undefined && (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-lg">💬</span>
              <span className="text-white/80 text-xs">{formatNumber(video.comments)}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

DetailsOverlay.displayName = 'DetailsOverlay';

const CommentsOverlay = memo(({ 
  video, 
  formatNumber,
  comments,
  onAddComment 
}: { 
  video: Video; 
  formatNumber: (num: number) => string;
  comments: Array<{id: string; user: string; avatar: string; text: string; time: string}>;
  onAddComment?: (videoId: string, text: string) => void;
}) => {
  const [newComment, setNewComment] = useState('');
  
  const mockComments = [
    { id: '1', user: 'Alex Chen', avatar: '#8B5CF6', text: 'This is amazing! 🔥', time: '2h' },
    { id: '2', user: 'Sarah Kim', avatar: '#EC4899', text: 'Love the creativity!', time: '5h' },
    { id: '3', user: 'Mike Johnson', avatar: '#10B981', text: 'Can\'t stop watching', time: '1d' },
  ];

  const displayComments = comments.length > 0 ? comments : mockComments;

  const handlePostComment = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (newComment.trim() && onAddComment) {
      // Use requestAnimationFrame to defer state update
      requestAnimationFrame(() => {
        onAddComment(video.id, newComment.trim());
        setNewComment('');
      });
    }
  }, [newComment, onAddComment, video.id]);

  return (
    <motion.div
      className="w-80 max-h-[60vh]"
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 20, opacity: 0, scale: 0.95 }}
      transition={ultraSmoothSpring}
    >
      <div 
        className="rounded-2xl p-5 shadow-2xl mb-3 flex flex-col max-h-[60vh]"
        style={{
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <h3 className="text-white mb-3 text-center flex items-center justify-center gap-2 text-sm">
          <MessageCircle className="w-4 h-4" />
          Comments ({displayComments.length})
        </h3>

        {/* Comments List */}
        <div className="space-y-2.5 mb-3 overflow-y-auto flex-1 scrollbar-hide">
          {displayComments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <div 
                className="w-7 h-7 rounded-full shrink-0"
                style={{ backgroundColor: comment.avatar }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-white text-xs truncate">{comment.user}</p>
                  <span className="text-white/40 text-[10px]">{comment.time}</span>
                </div>
                <p className="text-white/70 text-xs leading-relaxed">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Comment */}
        <div className="flex gap-2 pt-2.5 border-t border-white/10">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 min-h-[40px] max-h-[60px] bg-white/5 border-white/10 text-white placeholder:text-white/40 text-xs resize-none"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handlePostComment(e as any);
              }
            }}
          />
          <Button 
            size="sm" 
            onClick={handlePostComment}
            disabled={!newComment.trim()}
            className="shrink-0 self-end h-[40px]"
          >
            Post
          </Button>
        </div>
      </div>
    </motion.div>
  );
});

CommentsOverlay.displayName = 'CommentsOverlay';

const ShareOverlay = memo(({ video }: { video: Video }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async (platform: string) => {
    const videoUrl = `${window.location.origin}/?video=${video.id}`;
    const text = `Check out "${video.title}" by ${video.creator}`;
    
    switch (platform) {
      case 'copy':
        const copySuccess = await copyToClipboard(videoUrl);
        if (copySuccess) {
          setCopied(true);
          toast.success('Link copied to clipboard!');
          setTimeout(() => setCopied(false), 2000);
        } else {
          toast.error('Failed to copy link');
        }
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + videoUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(videoUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`, '_blank');
        break;
      case 'instagram':
        const igSuccess = await copyToClipboard(videoUrl);
        if (igSuccess) {
          toast.info('Link copied! Share it on Instagram');
        } else {
          toast.error('Failed to copy link');
        }
        break;
      case 'download':
        if (video.videoUrl) {
          const a = document.createElement('a');
          a.href = video.videoUrl;
          a.download = `${video.title}.mp4`;
          a.click();
          toast.success('Download started!');
        }
        break;
    }
  }, [video.id, video.title, video.creator, video.videoUrl, copied]);

  const shareOptions = [
    { id: 'copy', icon: copied ? Check : Link, color: copied ? '#10B981' : '#3B82F6', label: 'Copy Link' },
    { id: 'whatsapp', icon: MessageCircle, color: '#25D366', label: 'WhatsApp' },
    { id: 'twitter', icon: Twitter, color: '#1DA1F2', label: 'Twitter' },
    { id: 'facebook', icon: Facebook, color: '#4267B2', label: 'Facebook' },
    { id: 'instagram', icon: Instagram, color: '#E4405F', label: 'Instagram' },
    { id: 'download', icon: Download, color: '#8B5CF6', label: 'Download' },
  ];

  return (
    <motion.div
      className="w-80 max-h-[60vh]"
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 20, opacity: 0, scale: 0.95 }}
      transition={ultraSmoothSpring}
    >
      <div 
        className="rounded-2xl p-5 shadow-2xl mb-3 flex flex-col"
        style={{
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <h3 className="text-white mb-4 text-center flex items-center justify-center gap-2 text-sm">
          <Share2 className="w-4 h-4" />
          Share
        </h3>

        {/* Share Options Grid */}
        <div className="grid grid-cols-3 gap-3">
          {shareOptions.map((option) => (
            <motion.button
              key={option.id}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl"
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}
              whileTap={{ scale: 0.95 }}
              transition={smoothSpring}
              onClick={(e) => {
                e.stopPropagation();
                handleShare(option.id);
              }}
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: option.color + '20' }}
              >
                <option.icon className="w-6 h-6" style={{ color: option.color }} />
              </div>
              <span className="text-white text-[10px]">{option.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
});

ShareOverlay.displayName = 'ShareOverlay';
