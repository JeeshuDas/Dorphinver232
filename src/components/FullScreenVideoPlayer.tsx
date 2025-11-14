import { useState, useEffect, useRef } from 'react';
import { Video, Comment } from '../types';
import { Smile, MessageCircle, Send, Menu, X, Heart, Share2, Play, Pause, Link, Download, Facebook, Instagram, Twitter, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { SmileyIcon } from './SmileyIcon';
import { copyToClipboard } from '../utils/clipboard';
import { CommentThread } from './CommentThread';

interface FullScreenVideoPlayerProps {
  video: Video;
  initialTime?: number;
  onClose: () => void;
  onCollapse: (video: Video, currentTime?: number) => void;
  onMenuClick: (video: Video) => void;
  onVideoClick: (video: Video) => void;
  followedCreators?: Set<string>;
  onFollowCreator?: (creatorId: string) => void;
  currentUserId?: string;
  comments?: Comment[];
  onAddComment?: (text: string, parentId?: string) => void;
  hasReacted?: boolean;
  onReact?: () => void;
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
  onFollowCreator,
  currentUserId = 'user_account',
  comments = [],
  onAddComment,
  hasReacted = false,
  onReact
}: FullScreenVideoPlayerProps) {
  const [showControls, setShowControls] = useState(true);
  const [activeOverlay, setActiveOverlay] = useState<OverlayType>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
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

  const handleActionBarInteraction = () => {
    // Always show controls for 2.5s after any action bar interaction
    setShowControls(true);
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

  const handleProgressBarTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    updateProgressFromTouchEvent(e);
  };

  const handleProgressBarDrag = (e: MouseEvent) => {
    if (isDragging) {
      updateProgressFromEvent(e as any);
    }
  };

  const handleProgressBarTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      updateProgressFromTouchEvent(e as any);
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

  const updateProgressFromTouchEvent = (e: React.TouchEvent<HTMLDivElement> | TouchEvent) => {
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
  };

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
      className="fixed inset-0 bg-black z-50 overflow-hidden flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={handleInteraction}
      onMouseMove={handleInteraction}
      onTouchStart={handleInteraction}
    >
      {/* Square Video Container */}
      <div className="relative w-full max-w-[600px] aspect-square">
        {/* Blurred Background for Fit Mode */}
        {video.frameSettings?.mode === 'fit' && video.videoUrl && (
          <div 
            className="absolute inset-0 w-full h-full blur-3xl scale-110 opacity-40"
            style={{
              backgroundImage: `url(${video.thumbnail || ''})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}

        {/* Video Content */}
        {video.videoUrl ? (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full"
            src={video.videoUrl}
            loop
            playsInline
            controls={false}
            style={{
              objectFit: video.frameSettings?.mode === 'fit' ? 'contain' : 'cover',
              transform: video.frameSettings?.mode === 'fill' 
                ? `scale(${video.frameSettings.zoom || 1}) translate(${(video.frameSettings.positionX || 0) / (video.frameSettings.zoom || 1)}px, ${(video.frameSettings.positionY || 0) / (video.frameSettings.zoom || 1)}px)`
                : `scale(${video.frameSettings?.zoom || 1})`,
            }}
          />
        ) : (
          <div 
            className="absolute inset-0 flex items-center justify-center" 
            style={{ backgroundColor: video.thumbnail }}
          >
            <div className="text-white/30 text-9xl">▶</div>
          </div>
        )}
      </div>

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

      {/* Bottom Section: Overlay Content + Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-2.5 pb-8 px-6 pointer-events-none z-[5]">
          {/* Video Details Overlay */}
          <AnimatePresence>
            {activeOverlay === 'details' && (
              <div className="pointer-events-auto">
                <DetailsOverlay 
                  video={video} 
                  isFollowing={isFollowing}
                  onFollowToggle={handleFollowToggle}
                  formatNumber={formatNumber}
                  currentUserId={currentUserId}
                />
              </div>
            )}
          </AnimatePresence>

          {/* Comments Overlay */}
          <AnimatePresence>
            {activeOverlay === 'comments' && (
              <div className="pointer-events-auto">
                <CommentsOverlay 
                  video={video} 
                  formatNumber={formatNumber}
                  comments={comments}
                  onAddComment={onAddComment}
                />
              </div>
            )}
          </AnimatePresence>

          {/* Share Overlay */}
          <AnimatePresence>
            {activeOverlay === 'share' && (
              <div className="pointer-events-auto">
                <ShareOverlay video={video} />
              </div>
            )}
          </AnimatePresence>

          {/* Action Bar and Progress Bar - Auto-hide after 2.5s */}
          <motion.div
            className="flex flex-col items-center gap-3 pointer-events-auto"
            initial={{ opacity: 1, y: 0 }}
            animate={{ 
              opacity: showControls || !isPlaying ? 1 : 0,
              y: showControls || !isPlaying ? 0 : 20
            }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
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
                onClick={(e) => {
                  e.stopPropagation();
                  if (onReact) {
                    onReact();
                  }
                  handleActionBarInteraction();
                }}
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
                  handleActionBarInteraction();
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
                  handleActionBarInteraction();
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
                  handleActionBarInteraction();
                }}
              >
                <Menu className={`w-7 h-7 transition-colors duration-200 ${activeOverlay === 'details' ? 'text-blue-400' : 'text-white/90'}`} />
              </motion.button>
            </div>

            {/* Interactive Progress Bar */}
            <div className="w-full flex justify-center -mx-6 px-1">
              <div 
                ref={progressBarRef}
                className="relative h-11 rounded-lg cursor-pointer overflow-hidden w-full"
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
          </motion.div>
        </div>
      </motion.div>
  );
}

// Details Overlay Component
function DetailsOverlay({ 
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
}) {
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
            {video.description || `An amazing video by ${video.creator}.`}
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
}

// Comments Overlay Component
function CommentsOverlay({ 
  video, 
  formatNumber, 
  comments,
  onAddComment 
}: { 
  video: Video; 
  formatNumber: (num: number) => string;
  comments: Comment[];
  onAddComment?: (text: string, parentId?: string) => void;
}) {
  const [newComment, setNewComment] = useState('');
  
  // Mock nested comments for empty state
  const mockComments: Comment[] = [
    { 
      id: '1', 
      videoId: video.id,
      userId: 'user1',
      user: 'Alex Chen', 
      avatar: '#8B5CF6', 
      text: 'This is amazing! 🔥', 
      time: '2h',
      createdAt: new Date().toISOString(),
      replies: [
        {
          id: '1-1',
          videoId: video.id,
          userId: 'user2',
          user: 'Sarah Kim',
          avatar: '#EC4899',
          text: 'I totally agree!',
          time: '1h',
          createdAt: new Date().toISOString(),
          parentId: '1'
        }
      ]
    },
    { 
      id: '2', 
      videoId: video.id,
      userId: 'user3',
      user: 'Mike Johnson', 
      avatar: '#10B981', 
      text: 'Can\'t stop watching', 
      time: '1d',
      createdAt: new Date().toISOString(),
    },
  ];

  const displayComments = comments.length > 0 ? comments : mockComments;

  const handlePostComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (newComment.trim() && onAddComment) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  const handleReply = (parentId: string, text: string) => {
    if (onAddComment) {
      onAddComment(text, parentId);
    }
  };

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

        {/* Comments List with nested threads */}
        <div className="space-y-3 mb-3 overflow-y-auto flex-1 scrollbar-hide">
          {displayComments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              onReply={handleReply}
            />
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
}

// Share Overlay Component
function ShareOverlay({ video }: { video: Video }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (platform: string) => {
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
  };

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
}