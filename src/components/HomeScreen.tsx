import { useRef, useState, useEffect } from 'react';
import { Video } from '../types';
import { mockVideos } from '../data/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../providers/DataProvider';
import { useAuth } from '../contexts/AuthContext';
import { Smile, MessageCircle, Send, Menu, Play, Heart, Share2, Link, Download, Facebook, Instagram, Twitter, Trophy, Search, User, Check, LogIn } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { SmileyIcon } from './SmileyIcon';
import { toast } from 'sonner@2.0.3';
import { copyToClipboard } from '../utils/clipboard';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HomeScreenProps {
  onVideoClick: (video: Video) => void;
  onShortClick: (categoryId: string, index: number) => void;
  onCreatorClick: (creatorId: string) => void;
  followedCreators: Set<string>;
  onFollowCreator?: (creatorId: string) => void;
  onProfileClick?: () => void;
  onLeaderboardClick?: () => void;
  onSearchClick?: () => void;
  onShowAuthScreen?: () => void;
  onLogoClick?: () => void;
  showShorts?: boolean;
  shortsLimit?: number;
  currentUserId?: string;
  reactedVideos?: Set<string>;
  onReact?: (videoId: string) => void;
  comments?: Record<string, Array<{id: string; user: string; avatar: string; text: string; time: string}>>;
  onAddComment?: (videoId: string, text: string) => void;
  userAvatar?: string;
  userVideos?: Video[];
}

export function HomeScreen({ 
  onVideoClick, 
  onShortClick, 
  onCreatorClick, 
  followedCreators,
  onFollowCreator, 
  onProfileClick, 
  onLeaderboardClick, 
  onSearchClick, 
  onShowAuthScreen,
  onLogoClick,
  showShorts = true, 
  shortsLimit = 25,
  currentUserId = 'user_account',
  reactedVideos = new Set(),
  onReact,
  comments = {},
  onAddComment,
  userAvatar = 'UP',
  userVideos = []
}: HomeScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  
  // Drag scroll for followed creators
  const followedScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!followedScrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - followedScrollRef.current.offsetLeft);
    setScrollLeft(followedScrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !followedScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - followedScrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    followedScrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };
  
  // Get data from API or fallback to mock
  const { isAuthenticated } = useAuth();
  const { videos: apiVideos, shorts: apiShorts, isLoading, isRefreshing } = useData();
  
  // Get all long videos and shorts
  // Use API data if authenticated, otherwise use mock data
  const userLongVideos = userVideos.filter(v => v.category === 'long');
  const mockLongVideos = mockVideos.filter(v => v.category === 'long');
  const apiLongVideos = isAuthenticated && apiVideos.length > 0 ? apiVideos : [];
  const longVideos = apiLongVideos.length > 0 ? [...userLongVideos, ...apiLongVideos] : [...userLongVideos, ...mockLongVideos];
  
  const userShortsVideos = userVideos.filter(v => v.category === 'short');
  const mockShortsVideos = mockVideos.filter(v => v.category === 'short');
  const apiShortsVideos = isAuthenticated && apiShorts.length > 0 ? apiShorts : [];
  const shortsVideos = (apiShortsVideos.length > 0 ? [...userShortsVideos, ...apiShortsVideos] : [...userShortsVideos, ...mockShortsVideos]).slice(0, shortsLimit);

  // Get unique creators from videos
  const allCreators = Array.from(new Map(
    mockVideos.map(v => [v.creator, { name: v.creator, avatar: v.creatorAvatar, id: v.creator.toLowerCase().replace(/\s+/g, '-') }])
  ).values());

  // Filter to show only followed creators
  const followedCreatorsList = allCreators.filter(c => followedCreators.has(c.id));

  return (
    <div ref={containerRef} className="h-full overflow-y-auto scrollbar-hide bg-background">
      {/* Refresh Indicator */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg"
            style={{
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-white text-sm">Refreshing feed...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between px-1 py-4 sticky top-0 bg-background/80 backdrop-blur-md z-20">
        <h1 className="cursor-pointer" style={{ fontFamily: 'Garet, sans-serif', fontSize: '2rem' }} onClick={onLogoClick}>dorphin</h1>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={onSearchClick}
            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-ios"
            style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Search className="w-4.5 h-4.5 text-muted-foreground" />
          </motion.button>
          <motion.button
            onClick={onLeaderboardClick}
            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-ios"
            style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Trophy className="w-4.5 h-4.5 text-muted-foreground" />
          </motion.button>
          {!isAuthenticated ? (
            <motion.button
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-ios flex items-center gap-2"
              onClick={onShowAuthScreen}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <LogIn className="w-4 h-4" />
              <span className="text-sm">Login</span>
            </motion.button>
          ) : (
            <motion.button
              onClick={onProfileClick}
              className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-400 to-pink-500 shadow-ios flex items-center justify-center overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {userAvatar && (userAvatar.startsWith('http://') || userAvatar.startsWith('https://') || userAvatar.startsWith('data:image/')) ? (
                <ImageWithFallback
                  src={userAvatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-sm">{userAvatar}</span>
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Followed Creators */}
      {followedCreatorsList.length > 0 && (
        <div className="px-1 mb-2">
          <div 
            ref={followedScrollRef}
            className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{ userSelect: 'none' }}
          >
            {followedCreatorsList.map((creator, index) => (
              <motion.button
                key={creator.id}
                onClick={(e) => {
                  if (!isDragging) {
                    onCreatorClick(creator.id);
                  }
                }}
                className="shrink-0"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: index * 0.05,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Avatar className="w-[100px] h-[100px] rounded-md shadow-ios">
                  <AvatarFallback 
                    className="rounded-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${creator.avatar}, ${creator.avatar}dd)`,
                    }}
                  >
                    <User className="w-8 h-8 text-white/80" />
                  </AvatarFallback>
                </Avatar>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* First Square Video */}
      <div className="px-1 mb-3 flex justify-center">
        <SquareVideoCard 
          video={longVideos[0]} 
          onVideoClick={onVideoClick} 
          index={0}
          containerRef={containerRef}
          currentlyPlayingId={currentlyPlayingId}
          setCurrentlyPlayingId={setCurrentlyPlayingId}
          currentUserId={currentUserId}
          hasReacted={reactedVideos.has(longVideos[0].id)}
          onReact={onReact}
          comments={comments[longVideos[0].id] || []}
          onAddComment={onAddComment}
          followedCreators={followedCreators}
          onFollowCreator={onFollowCreator}
        />
      </div>

      {/* Shorts Row */}
      {showShorts && (
        <div className="px-1 pb-3">
          <ShortsScrollRow shorts={shortsVideos} onVideoClick={onVideoClick} />
        </div>
      )}

      {/* More Square Videos */}
      {longVideos.slice(1).map((video, index) => (
        <div key={video.id} className="px-1 mb-3 flex justify-center">
          <SquareVideoCard 
            video={video} 
            onVideoClick={onVideoClick} 
            index={index + 1}
            containerRef={containerRef}
            currentlyPlayingId={currentlyPlayingId}
            setCurrentlyPlayingId={setCurrentlyPlayingId}
            currentUserId={currentUserId}
            hasReacted={reactedVideos.has(video.id)}
            onReact={onReact}
            comments={comments[video.id] || []}
            onAddComment={onAddComment}
            followedCreators={followedCreators}
            onFollowCreator={onFollowCreator}
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
  setCurrentlyPlayingId,
  currentUserId = 'user_account',
  hasReacted = false,
  onReact,
  comments = [],
  onAddComment,
  followedCreators,
  onFollowCreator
}: { 
  video: Video; 
  onVideoClick: (video: Video) => void; 
  index: number;
  containerRef: React.RefObject<HTMLDivElement>;
  currentlyPlayingId: string | null;
  setCurrentlyPlayingId: (id: string | null) => void;
  currentUserId?: string;
  hasReacted?: boolean;
  onReact?: (videoId: string) => void;
  comments?: Array<{id: string; user: string; avatar: string; text: string; time: string}>;
  onAddComment?: (videoId: string, text: string) => void;
  followedCreators?: Set<string>;
  onFollowCreator?: (creatorId: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<'details' | 'comments' | 'share' | null>(null);
  const [justReacted, setJustReacted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const prevReactedRef = useRef(hasReacted);

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
      className="relative w-full aspect-square rounded overflow-hidden shadow-ios-lg cursor-pointer max-w-[500px]"
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
      {/* Thumbnail (shown behind video or when not playing) */}
      {video.thumbnail && (
        <img
          src={video.thumbnail}
          alt={video.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Video Element */}
      {video.videoUrl && (
        <video
          ref={videoRef}
          data-video-id={video.id}
          className="absolute inset-0 w-full h-full object-cover"
          src={video.videoUrl}
          loop
          playsInline
          style={{ opacity: isPlaying ? 1 : 0 }}
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

      {/* Overlays - Centered in video, above action bar */}
      <AnimatePresence>
        {activeOverlay === 'details' && (
          <div className="absolute inset-x-0 top-0 bottom-20 flex items-center justify-center pointer-events-auto z-[5]">
            <HomeDetailsOverlay 
              video={video} 
              formatNumber={formatNumber}
              followedCreators={followedCreators}
              onFollowCreator={onFollowCreator}
              currentUserId={currentUserId}
            />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeOverlay === 'comments' && (
          <div className="absolute inset-x-0 top-0 bottom-20 flex items-center justify-center pointer-events-auto z-[5]">
            <HomeCommentsOverlay 
              video={video} 
              formatNumber={formatNumber}
              comments={comments}
              onAddComment={onAddComment}
            />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeOverlay === 'share' && (
          <div className="absolute inset-x-0 top-0 bottom-20 flex items-center justify-center pointer-events-auto z-[5]">
            <HomeShareOverlay video={video} />
          </div>
        )}
      </AnimatePresence>

      {/* Action Bar - Bottom of video */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto z-[5]"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: (showControls || !isPlaying) ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 35, mass: 0.6 }}
      >
        {/* Premium Glassmorphic Action Bar */}
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
              if (onReact) {
                onReact(video.id);
              }
            }}
          >
            {hasReacted ? (
              <SmileyIcon className="w-6 h-6" color="#EAB308" animated={justReacted} />
            ) : (
              <Smile className="w-6 h-6" />
            )}
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
      className="relative shrink-0 rounded overflow-hidden shadow-ios cursor-pointer"
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
      {/* Thumbnail */}
      {video.thumbnail && (
        <img
          src={video.thumbnail}
          alt={video.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Video */}
      {video.videoUrl && (
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-0"
          src={video.videoUrl}
          loop
          muted
          playsInline
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
function HomeDetailsOverlay({ 
  video, 
  formatNumber,
  followedCreators,
  onFollowCreator,
  currentUserId
}: { 
  video: Video; 
  formatNumber: (num: number) => string;
  followedCreators?: Set<string>;
  onFollowCreator?: (creatorId: string) => void;
  currentUserId?: string;
}) {
  const creatorId = video.creatorId || video.creator.toLowerCase().replace(/\s+/g, '-');
  const isFollowing = followedCreators?.has(creatorId) || false;
  const isOwnVideo = creatorId === currentUserId;

  return (
    <motion.div
      className="w-[85%] max-w-[420px]"
      style={{ aspectRatio: '8/7' }}
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
            className="w-14 h-14 rounded-lg mb-2 shadow-ios"
            style={{ backgroundColor: video.creatorAvatar }}
          />
          <p className="text-white text-sm">{video.creator}</p>
          {!isOwnVideo && onFollowCreator && (
            <Button
              size="sm"
              variant={isFollowing ? "secondary" : "default"}
              onClick={(e) => {
                e.stopPropagation();
                onFollowCreator(creatorId);
              }}
              className="mt-2 w-full"
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
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

function HomeCommentsOverlay({ 
  video, 
  formatNumber,
  comments,
  onAddComment 
}: { 
  video: Video; 
  formatNumber: (num: number) => string;
  comments: Array<{id: string; user: string; avatar: string; text: string; time: string}>;
  onAddComment?: (videoId: string, text: string) => void;
}) {
  const [newComment, setNewComment] = useState('');
  
  const mockComments = [
    { id: '1', user: 'Alex Chen', avatar: '#8B5CF6', text: 'This is amazing! 🔥', time: '2h' },
    { id: '2', user: 'Sarah Kim', avatar: '#EC4899', text: 'Love the creativity!', time: '5h' },
  ];

  const displayComments = comments.length > 0 ? comments : mockComments;

  const handlePostComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (newComment.trim() && onAddComment) {
      onAddComment(video.id, newComment.trim());
      setNewComment('');
    }
  };

  return (
    <motion.div
      className="w-[85%] max-w-[420px]"
      style={{ aspectRatio: '8/7' }}
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 20, opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 35, mass: 0.6 }}
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
        <h3 className="text-white mb-4 text-center flex items-center justify-center gap-2 text-sm">
          <MessageCircle className="w-5 h-5" />
          Comments ({displayComments.length})
        </h3>

        {/* Comments List */}
        <div className="space-y-2 mb-3 overflow-y-auto flex-1 scrollbar-hide">
          {displayComments.map((comment) => (
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
                <p className="text-white/70 text-xs leading-relaxed">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Comment */}
        <div className="flex gap-2 pt-2 border-t border-white/10">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 min-h-[35px] max-h-[45px] bg-white/5 border-white/10 text-white text-xs placeholder:text-white/40 resize-none"
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
  const [copied, setCopied] = useState(false);

  const handleShare = async (platform: string) => {
    const videoUrl = `${window.location.origin}/?video=${video.id}`;
    const text = `Check out "${video.title}" by ${video.creator}`;
    
    switch (platform) {
      case 'copy':
        {
          const copySuccess = await copyToClipboard(videoUrl);
          if (copySuccess) {
            setCopied(true);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
          } else {
            toast.error('Failed to copy link');
          }
        }
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + videoUrl)}`, '_blank');
        toast.success('Opening WhatsApp...');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(videoUrl)}`, '_blank');
        toast.success('Opening Twitter...');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`, '_blank');
        toast.success('Opening Facebook...');
        break;
      case 'instagram':
        {
          const igSuccess = await copyToClipboard(videoUrl);
          if (igSuccess) {
            toast.info('Link copied! Share it on Instagram');
          } else {
            toast.error('Failed to copy link');
          }
        }
        break;
      case 'download':
        if (video.videoUrl) {
          try {
            const a = document.createElement('a');
            a.href = video.videoUrl;
            a.download = `${video.title}.mp4`;
            a.click();
            toast.success('Download started!');
          } catch (err) {
            toast.error('Download not available');
          }
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
      className="w-[85%] max-w-[420px]"
      style={{ aspectRatio: '8/7' }}
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
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.8 }}
              onClick={(e) => {
                e.stopPropagation();
                handleShare(option.id);
              }}
            >
              <div 
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ backgroundColor: option.color + '20' }}
              >
                <option.icon className="w-6 h-6" style={{ color: option.color }} />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}