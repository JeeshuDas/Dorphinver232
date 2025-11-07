import { useState, useEffect, useRef } from 'react';
import { Video } from '../types';
import { Smile, MessageCircle, Send, Menu, X, Heart, Share2, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface FullScreenVideoPlayerProps {
  video: Video;
  initialTime?: number;
  onClose: () => void;
  onCollapse: (video: Video, currentTime?: number) => void;
  onMenuClick: (video: Video) => void;
  onVideoClick: (video: Video) => void;
  followedCreators?: Set<string>;
  onFollowCreator?: (creatorId: string) => void;
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

export function FullScreenVideoPlayer({ 
  video, 
  initialTime = 0, 
  onClose, 
  followedCreators = new Set(),
  onFollowCreator
}: FullScreenVideoPlayerProps) {
  const [reacted, setReacted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [activeOverlay, setActiveOverlay] = useState<OverlayType>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const creatorId = video.creatorId || `creator-${video.id}`;
  const isFollowing = followedCreators.has(creatorId);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.currentTime = initialTime;
      videoElement.play().catch(() => {
        // Auto-play prevented
      });

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
    }
  }, [initialTime]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls && !activeOverlay) {
      timeout = setTimeout(() => setShowControls(false), 2500);
    }
    return () => clearTimeout(timeout);
  }, [showControls, activeOverlay]);

  const handleInteraction = () => {
    if (!activeOverlay) {
      setShowControls(true);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleFollowToggle = () => {
    if (onFollowCreator) {
      onFollowCreator(creatorId);
    }
  };

  const toggleOverlay = (type: OverlayType) => {
    setActiveOverlay(activeOverlay === type ? null : type);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    updateProgressFromEvent(e);
  };

  const handleProgressBarDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    updateProgressFromEvent(e);
  };

  const handleProgressBarDrag = (e: MouseEvent) => {
    if (isDragging) {
      updateProgressFromEvent(e as any);
    }
  };

  const handleProgressBarDragEnd = () => {
    setIsDragging(false);
  };

  const updateProgressFromEvent = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
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
  };

  // Handle global mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleProgressBarDrag);
      window.addEventListener('mouseup', handleProgressBarDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleProgressBarDrag);
        window.removeEventListener('mouseup', handleProgressBarDragEnd);
      };
    }
  }, [isDragging]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = (e: React.MouseEvent) => {
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
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={handleInteraction}
      onMouseMove={handleInteraction}
      onTouchStart={handleInteraction}
    >
      {/* Video Content */}
      {video.videoUrl ? (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-contain"
          src={video.videoUrl}
          loop
          playsInline
          controls={false}
        />
      ) : (
        <div 
          className="absolute inset-0 flex items-center justify-center" 
          style={{ backgroundColor: video.thumbnail }}
        >
          <div className="text-white/30 text-9xl">▶</div>
        </div>
      )}

      {/* Close Button - Top Left - Always visible */}
      <div className="absolute top-6 left-6 z-50 pointer-events-auto">
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
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

      {/* Controls Overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >

        {/* Play/Pause Button - Center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <motion.button
            onClick={togglePlayPause}
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-ios"
            style={{
              background: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: showControls ? 1 : 0.8, opacity: showControls ? 1 : 0 }}
            whileHover={{ scale: 1.08, backgroundColor: 'rgba(0, 0, 0, 0.55)' }}
            whileTap={{ scale: 0.92 }}
            transition={smoothSpring}
          >
            {isPlaying ? (
              <Pause className="w-10 h-10 text-white" fill="white" />
            ) : (
              <Play className="w-10 h-10 text-white" fill="white" />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Bottom Section: Overlay Content + Action Bar - Always visible */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-3 pb-8 px-6 pointer-events-auto">
          {/* Video Details Overlay */}
          <AnimatePresence>
            {activeOverlay === 'details' && (
              <DetailsOverlay 
                video={video} 
                isFollowing={isFollowing}
                onFollowToggle={handleFollowToggle}
                formatNumber={formatNumber}
              />
            )}
          </AnimatePresence>

          {/* Comments Overlay */}
          <AnimatePresence>
            {activeOverlay === 'comments' && (
              <CommentsOverlay video={video} formatNumber={formatNumber} />
            )}
          </AnimatePresence>

          {/* Share Overlay */}
          <AnimatePresence>
            {activeOverlay === 'share' && (
              <ShareOverlay video={video} />
            )}
          </AnimatePresence>

          {/* Premium Glassmorphic Action Bar - Always visible */}
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
              onClick={(e) => {
                e.stopPropagation();
                setReacted(!reacted);
              }}
            >
              <Smile 
                className={`w-7 h-7 transition-colors duration-200 ${reacted ? 'fill-yellow-400 text-yellow-400' : 'text-white/90'}`}
              />
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
  );
}

// Details Overlay Component
function DetailsOverlay({ 
  video, 
  isFollowing, 
  onFollowToggle, 
  formatNumber 
}: { 
  video: Video; 
  isFollowing: boolean; 
  onFollowToggle: () => void; 
  formatNumber: (num: number) => string;
}) {
  return (
    <motion.div
      className="w-80 aspect-square"
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 20, opacity: 0, scale: 0.95 }}
      transition={ultraSmoothSpring}
    >
      <div 
        className="rounded-2xl p-6 shadow-2xl mb-3 h-full flex flex-col"
        style={{
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        {/* Creator Info */}
        <div className="flex flex-col items-center text-center mb-5">
          <div 
            className="w-16 h-16 rounded-full mb-3 shadow-ios"
            style={{ backgroundColor: video.creatorAvatar }}
          />
          <p className="text-white">{video.creator}</p>
          <Button
            size="sm"
            variant={isFollowing ? "secondary" : "default"}
            onClick={(e) => {
              e.stopPropagation();
              onFollowToggle();
            }}
            className="mt-3 w-full"
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        </div>

        {/* Video Title */}
        <div className="mb-auto">
          <h3 className="text-white text-center mb-2">{video.title}</h3>
          <p className="text-white/60 text-sm text-center leading-relaxed line-clamp-3">
            {video.description || `An amazing video by ${video.creator}.`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">👁️</span>
            <span className="text-white/80 text-sm">{formatNumber(video.views)}</span>
          </div>
          {video.likes !== undefined && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl">❤️</span>
              <span className="text-white/80 text-sm">{formatNumber(video.likes)}</span>
            </div>
          )}
          {video.comments !== undefined && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl">💬</span>
              <span className="text-white/80 text-sm">{formatNumber(video.comments)}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Comments Overlay Component
function CommentsOverlay({ video, formatNumber }: { video: Video; formatNumber: (num: number) => string }) {
  const [newComment, setNewComment] = useState('');
  
  // Mock comments data
  const mockComments = [
    { id: 1, user: 'Alex Chen', avatar: '#8B5CF6', text: 'This is amazing! 🔥', likes: 42, time: '2h' },
    { id: 2, user: 'Sarah Kim', avatar: '#EC4899', text: 'Love the creativity!', likes: 28, time: '5h' },
    { id: 3, user: 'Mike Johnson', avatar: '#10B981', text: 'Can\'t stop watching', likes: 15, time: '1d' },
  ];

  return (
    <motion.div
      className="w-80 aspect-square"
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 20, opacity: 0, scale: 0.95 }}
      transition={ultraSmoothSpring}
    >
      <div 
        className="rounded-2xl p-6 shadow-2xl mb-3 h-full flex flex-col"
        style={{
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <h3 className="text-white mb-4 text-center flex items-center justify-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comments
        </h3>

        {/* Comments List */}
        <div className="space-y-3 mb-4 overflow-y-auto flex-1 scrollbar-hide">
          {mockComments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <div 
                className="w-8 h-8 rounded-full shrink-0"
                style={{ backgroundColor: comment.avatar }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-white text-sm truncate">{comment.user}</p>
                  <span className="text-white/40 text-xs">{comment.time}</span>
                </div>
                <p className="text-white/70 text-sm">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Comment */}
        <div className="flex gap-2 pt-3 border-t border-white/10">
          <Textarea
            placeholder="Comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 min-h-[40px] max-h-[60px] bg-white/5 border-white/10 text-white placeholder:text-white/40 text-sm"
            onClick={(e) => e.stopPropagation()}
          />
          <Button 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              setNewComment('');
            }}
            className="shrink-0 self-end"
          >
            Post
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Share Overlay Component
function ShareOverlay({ video }: { video: Video }) {
  const shareOptions = [
    { id: 'copy', icon: '🔗', color: '#3B82F6' },
    { id: 'whatsapp', icon: '💬', color: '#10B981' },
    { id: 'twitter', icon: '🐦', color: '#1DA1F2' },
    { id: 'facebook', icon: '👥', color: '#4267B2' },
    { id: 'instagram', icon: '📷', color: '#E4405F' },
    { id: 'download', icon: '⬇️', color: '#8B5CF6' },
  ];

  return (
    <motion.div
      className="w-80 aspect-square"
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 20, opacity: 0, scale: 0.95 }}
      transition={ultraSmoothSpring}
    >
      <div 
        className="rounded-2xl p-6 shadow-2xl mb-3 h-full flex flex-col"
        style={{
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <h3 className="text-white mb-6 text-center flex items-center justify-center gap-2">
          <Share2 className="w-5 h-5" />
          Share
        </h3>

        {/* Share Options Grid */}
        <div className="grid grid-cols-3 gap-4 flex-1 content-start">
          {shareOptions.map((option) => (
            <motion.button
              key={option.id}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl"
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
                // Handle share action
              }}
            >
              <div 
                className="text-3xl w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: option.color + '20' }}
              >
                {option.icon}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
