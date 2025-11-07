import { useRef, useState, useEffect } from 'react';
import { Video } from '../types';
import { mockVideos } from '../data/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, MessageCircle, Send, Menu, Play, Heart, Share2 } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

interface HomeScreenProps {
  onVideoClick: (video: Video) => void;
  onShortClick: (categoryId: string, index: number) => void;
  onCreatorClick: (creatorId: string) => void;
  followedCreators: Set<string>;
  onProfileClick?: () => void;
  showShorts?: boolean;
  shortsLimit?: number;
}

export function HomeScreen({ onVideoClick, onShortClick, onCreatorClick, followedCreators, onProfileClick, showShorts = true, shortsLimit = 25 }: HomeScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  
  // Get all long videos and shorts
  const longVideos = mockVideos.filter(v => v.category === 'long');
  const shortsVideos = mockVideos.filter(v => v.category === 'short').slice(0, shortsLimit);

  return (
    <div ref={containerRef} className="h-full overflow-y-auto scrollbar-hide bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <h1 className="cursor-pointer" style={{ fontFamily: 'Garet, sans-serif', fontSize: '2rem' }} onClick={() => window.location.reload()}>dorphin</h1>
        <motion.button
          onClick={onProfileClick}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 shadow-ios"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
      </div>

      {/* First Square Video */}
      <div className="px-4 mb-6 flex justify-center">
        <SquareVideoCard 
          video={longVideos[0]} 
          onVideoClick={onVideoClick} 
          index={0}
          containerRef={containerRef}
          currentlyPlayingId={currentlyPlayingId}
          setCurrentlyPlayingId={setCurrentlyPlayingId}
        />
      </div>

      {/* Shorts Row */}
      {showShorts && (
        <div className="px-4 pb-6">
          <ShortsScrollRow shorts={shortsVideos} onVideoClick={onVideoClick} />
        </div>
      )}

      {/* More Square Videos */}
      {longVideos.slice(1).map((video, index) => (
        <div key={video.id} className="px-4 mb-6 flex justify-center">
          <SquareVideoCard 
            video={video} 
            onVideoClick={onVideoClick} 
            index={index + 1}
            containerRef={containerRef}
            currentlyPlayingId={currentlyPlayingId}
            setCurrentlyPlayingId={setCurrentlyPlayingId}
          />
        </div>
      ))}
    </div>
  );
}

function SquareVideoCard({ 
  video, 
  onVideoClick, 
  index,
  containerRef,
  currentlyPlayingId,
  setCurrentlyPlayingId
}: { 
  video: Video; 
  onVideoClick: (video: Video) => void; 
  index: number;
  containerRef: React.RefObject<HTMLDivElement>;
  currentlyPlayingId: string | null;
  setCurrentlyPlayingId: (id: string | null) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [reacted, setReacted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<'details' | 'comments' | 'share' | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const card = cardRef.current;
    const container = containerRef.current;

    if (!video || !card || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Video is centered, play it
            setCurrentlyPlayingId(video.dataset.videoId || null);
          }
        });
      },
      {
        root: container,
        threshold: [0.5],
        rootMargin: '-100px 0px -100px 0px'
      }
    );

    observer.observe(card);

    return () => {
      observer.disconnect();
    };
  }, [containerRef, setCurrentlyPlayingId]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Stop autoplay - only play when user interacts
    if (currentlyPlayingId !== video.id) {
      videoElement.pause();
      setIsPlaying(false);
    }
  }, [currentlyPlayingId, video.id]);

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
      setIsPlaying(false);
    } else {
      setCurrentlyPlayingId(video.id);
      videoElement.play();
      setIsPlaying(true);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative w-full aspect-square rounded-xl overflow-hidden shadow-ios-lg cursor-pointer max-w-[500px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 28,
        mass: 0.8,
        delay: index * 0.04
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        setShowControls(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowControls(false);
      }}
      onClick={() => onVideoClick(video)}
    >
      {/* Video Element */}
      {video.videoUrl ? (
        <video
          ref={videoRef}
          data-video-id={video.id}
          className="absolute inset-0 w-full h-full object-cover"
          src={video.videoUrl}
          loop
          playsInline
        />
      ) : (
        <div 
          className="absolute inset-0" 
          style={{ backgroundColor: video.thumbnail }}
        />
      )}

      {/* Play/Pause Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: !isPlaying ? 1 : 0.8, opacity: !isPlaying ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.8 }}
          className="pointer-events-auto"
          onClick={togglePlayPause}
        >
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-ios"
            style={{
              background: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <Play className="w-10 h-10 text-white" fill="white" />
          </div>
        </motion.div>
      </div>

      {/* Bottom Section: Overlay Content + Action Bar */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-auto max-w-[90%]"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: showControls ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 35, mass: 0.6 }}
      >
        {/* Video Details Overlay */}
        <AnimatePresence>
          {activeOverlay === 'details' && (
            <HomeDetailsOverlay video={video} formatNumber={formatNumber} />
          )}
        </AnimatePresence>

        {/* Comments Overlay */}
        <AnimatePresence>
          {activeOverlay === 'comments' && (
            <HomeCommentsOverlay video={video} formatNumber={formatNumber} />
          )}
        </AnimatePresence>

        {/* Share Overlay */}
        <AnimatePresence>
          {activeOverlay === 'share' && (
            <HomeShareOverlay video={video} />
          )}
        </AnimatePresence>

        {/* Premium Glassmorphic Action Bar - Always visible */}
        <div
          className="flex items-center gap-5 px-7 py-3.5 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)'
          }}
        >
          <motion.button
            className="text-white/90 hover:text-white transition-colors"
            whileHover={{ scale: 1.12, y: -3 }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              setReacted(!reacted);
            }}
          >
            <Smile className={`w-6 h-6 ${reacted ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </motion.button>
          <motion.button
            className="text-white/90 hover:text-white transition-colors"
            whileHover={{ scale: 1.12, y: -3 }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveOverlay(activeOverlay === 'comments' ? null : 'comments');
            }}
          >
            <MessageCircle className={`w-6 h-6 transition-colors duration-200 ${activeOverlay === 'comments' ? 'text-blue-400' : ''}`} />
          </motion.button>
          <motion.button
            className="text-white/90 hover:text-white transition-colors"
            whileHover={{ scale: 1.12, y: -3 }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveOverlay(activeOverlay === 'share' ? null : 'share');
            }}
          >
            <Send className={`w-6 h-6 transition-colors duration-200 ${activeOverlay === 'share' ? 'text-blue-400' : ''}`} />
          </motion.button>
          <motion.button
            className="text-white/90 hover:text-white transition-colors"
            whileHover={{ scale: 1.12, y: -3 }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveOverlay(activeOverlay === 'details' ? null : 'details');
            }}
          >
            <Menu className={`w-6 h-6 transition-colors duration-200 ${activeOverlay === 'details' ? 'text-blue-400' : ''}`} />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ShortsScrollRow({ shorts, onVideoClick }: { shorts: Video[]; onVideoClick: (video: Video) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={scrollRef}
      className="flex gap-3 overflow-x-auto scrollbar-hide select-none"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {shorts.map((short, index) => (
        <ShortCard key={short.id} video={short} index={index} onVideoClick={onVideoClick} />
      ))}
    </div>
  );
}

function ShortCard({ video, index, onVideoClick }: { video: Video; index: number; onVideoClick: (video: Video) => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative shrink-0 rounded-lg overflow-hidden shadow-ios cursor-pointer"
      style={{
        width: 'calc((100vw - 2rem) * 0.6)',
        maxWidth: '300px',
        aspectRatio: '0.6',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        delay: index * 0.05
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onVideoClick(video)}
      whileTap={{ scale: 0.98 }}
    >
      {/* Video or Thumbnail */}
      {video.videoUrl ? (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={video.videoUrl}
          loop
          muted
          playsInline
        />
      ) : (
        <div 
          className="absolute inset-0" 
          style={{ backgroundColor: video.thumbnail }}
        />
      )}

      {/* Play Icon on Hover */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: isHovered ? 1 : 0.8, opacity: isHovered ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Play className="w-12 h-12 text-white/80" fill="white" />
        </motion.div>
      </div>
    </motion.div>
  );
}

// Overlay Components for HomeScreen
function HomeDetailsOverlay({ video, formatNumber }: { video: Video; formatNumber: (num: number) => string }) {
  return (
    <motion.div
      className="w-64 aspect-square"
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 20, opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 35, mass: 0.6 }}
    >
      <div 
        className="rounded-2xl p-5 shadow-2xl mb-3 h-full flex flex-col"
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
            className="w-14 h-14 rounded-full mb-2 shadow-ios"
            style={{ backgroundColor: video.creatorAvatar }}
          />
          <p className="text-white text-sm">{video.creator}</p>
        </div>

        {/* Video Title */}
        <div className="mb-auto">
          <h3 className="text-white text-sm text-center mb-2">{video.title}</h3>
          <p className="text-white/60 text-xs text-center leading-relaxed line-clamp-3">
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

function HomeCommentsOverlay({ video, formatNumber }: { video: Video; formatNumber: (num: number) => string }) {
  const [newComment, setNewComment] = useState('');
  
  const mockComments = [
    { id: 1, user: 'Alex Chen', avatar: '#8B5CF6', text: 'This is amazing! 🔥', likes: 42, time: '2h' },
    { id: 2, user: 'Sarah Kim', avatar: '#EC4899', text: 'Love the creativity!', likes: 28, time: '5h' },
  ];

  return (
    <motion.div
      className="w-64 aspect-square"
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 20, opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 35, mass: 0.6 }}
    >
      <div 
        className="rounded-2xl p-5 shadow-2xl mb-3 h-full flex flex-col"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        }}
      >
        <h3 className="text-white text-sm mb-3 text-center flex items-center justify-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Comments
        </h3>

        {/* Comments List */}
        <div className="space-y-2 mb-3 overflow-y-auto flex-1 scrollbar-hide">
          {mockComments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <div 
                className="w-7 h-7 rounded-full shrink-0"
                style={{ backgroundColor: comment.avatar }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <p className="text-white text-xs truncate">{comment.user}</p>
                  <span className="text-white/40 text-[10px]">{comment.time}</span>
                </div>
                <p className="text-white/70 text-xs">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Comment */}
        <div className="flex gap-2 pt-2 border-t border-white/10">
          <Textarea
            placeholder="Comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 min-h-[35px] max-h-[50px] bg-white/5 border-white/10 text-white text-xs placeholder:text-white/40"
            onClick={(e) => e.stopPropagation()}
          />
          <Button 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              setNewComment('');
            }}
            className="shrink-0 h-[35px] self-end"
          >
            Post
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function HomeShareOverlay({ video }: { video: Video }) {
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
      className="w-64 aspect-square"
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 20, opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 35, mass: 0.6 }}
    >
      <div 
        className="rounded-2xl p-5 shadow-2xl mb-3 h-full flex flex-col"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        }}
      >
        <h3 className="text-white text-sm mb-4 text-center flex items-center justify-center gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </h3>

        {/* Share Options Grid */}
        <div className="grid grid-cols-3 gap-3 flex-1 content-start">
          {shareOptions.map((option) => (
            <motion.button
              key={option.id}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.8 }}
              onClick={(e) => {
                e.stopPropagation();
                // Handle share action
              }}
            >
              <div 
                className="text-2xl w-11 h-11 rounded-full flex items-center justify-center"
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
