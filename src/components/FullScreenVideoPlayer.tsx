import { useState, useEffect } from 'react';
import { Video } from '../types';
import { Play, Pause, Volume2, VolumeX, X, MoreVertical, Maximize2, Minimize2, Heart, MessageCircle, Share2, SkipForward } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RelatedVideos } from './RelatedVideos';
import { getRelatedVideos } from '../data/mockData';

interface FullScreenVideoPlayerProps {
  video: Video;
  initialTime?: number;
  onClose: () => void;
  onCollapse: (video: Video, currentTime?: number) => void;
  onMenuClick: (video: Video) => void;
  onVideoClick: (video: Video) => void;
}

export function FullScreenVideoPlayer({ video, initialTime = 0, onClose, onCollapse, onMenuClick, onVideoClick }: FullScreenVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTime || (video.progress ? video.progress * video.duration : 0));
  const [showControls, setShowControls] = useState(true);
  const [isLandscape, setIsLandscape] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const relatedVideos = getRelatedVideos(video.id);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const progress = (currentTime / video.duration) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= video.duration) {
            setIsPlaying(false);
            return video.duration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, video.duration]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls && isPlaying) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls, isPlaying]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    setCurrentTime(percentage * video.duration);
  };

  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingProgress) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    setCurrentTime(percentage * video.duration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {isLandscape ? (
        // Landscape Mode - Full Screen (YouTube-style)
        <motion.div
          className="fixed inset-0"
          initial={{ rotate: 0 }}
          animate={{ rotate: 90 }}
          exit={{ rotate: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          onClick={() => setShowControls(true)}
        >
          {/* Video Content */}
          <div 
            className="absolute inset-0 flex items-center justify-center" 
            style={{ backgroundColor: video.thumbnail }}
          >
            <div className="text-white/30 text-8xl">▶</div>
          </div>

          {/* Controls Overlay - Landscape */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 1 }}
            animate={{ opacity: showControls ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLandscape(false);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0"
                >
                  <X className="w-4 h-4 text-white" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMenuClick(video);
                    }}
                    className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0"
                  >
                    <MoreVertical className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Center Play/Pause */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(!isPlaying);
                }}
                className="pointer-events-auto w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white" fill="white" />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                )}
              </motion.button>
            </div>

            {/* Right Side Actions */}
            <motion.div
              className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Collapse Button */}
              <CompactActionButton
                icon={<div className="text-sm">C</div>}
                label=""
                onClick={(e) => {
                  e.stopPropagation();
                  onCollapse(video, currentTime);
                }}
              />

              {/* Like Button */}
              <CompactActionButton
                icon={<Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />}
                label={formatNumber(video.likes || 234000)}
                onClick={(e) => {
                  e.stopPropagation();
                  setLiked(!liked);
                }}
              />

              {/* Comment Button */}
              <CompactActionButton
                icon={<MessageCircle className="w-4 h-4" />}
                label={formatNumber(video.comments || 1200)}
                onClick={(e) => e.stopPropagation()}
              />

              {/* Share Button */}
              <CompactActionButton
                icon={<Share2 className="w-4 h-4" />}
                label="Share"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pr-16">
              {/* Video Info - Minimized */}
              <motion.div
                className="mb-2 flex items-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="w-6 h-6 rounded-full shrink-0"
                  style={{ backgroundColor: video.creatorAvatar }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs truncate">{video.title}</p>
                  <p className="text-white/70 text-[10px] truncate">{video.creator}</p>
                </div>
              </motion.div>

              {/* Progress Bar */}
              <div
                className="h-1 bg-white/20 rounded-full mb-2 cursor-pointer relative group"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white text-xs">
                    {formatTime(currentTime)} / {formatTime(video.duration)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Play/Pause */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPlaying(!isPlaying);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm shrink-0"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isPlaying ? (
                      <Pause className="w-3 h-3 text-white" fill="white" />
                    ) : (
                      <Play className="w-3 h-3 text-white ml-0.5" fill="white" />
                    )}
                  </motion.button>

                  {/* Skip Forward */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentTime(Math.min(currentTime + 10, video.duration));
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm shrink-0"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SkipForward className="w-3 h-3 text-white" />
                  </motion.button>

                  {/* Volume */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm shrink-0"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isMuted ? (
                      <VolumeX className="w-3 h-3 text-white" />
                    ) : (
                      <Volume2 className="w-3 h-3 text-white" />
                    )}
                  </motion.button>

                  {/* Exit Fullscreen */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLandscape(false);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm shrink-0"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Minimize2 className="w-3 h-3 text-white" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        // Portrait Mode - 2/3 video + 1/3 playlist
        <div className="flex flex-col h-full">
          <motion.div
            className="relative"
            style={{ height: '66.66%' }}
            onClick={() => setShowControls(true)}
          >
            {/* Video Content */}
            <div 
              className="absolute inset-0 flex items-center justify-center" 
              style={{ backgroundColor: video.thumbnail }}
            >
              <div className="text-white/30 text-8xl">▶</div>
            </div>

            {/* Controls Overlay - Portrait */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 1 }}
              animate={{ opacity: showControls ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Top Bar */}
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMenuClick(video);
                      }}
                      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
                    >
                      <MoreVertical className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Center Play/Pause */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlaying(!isPlaying);
                  }}
                  className="pointer-events-auto w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isPlaying ? (
                    <Pause className="w-10 h-10 text-white" fill="white" />
                  ) : (
                    <Play className="w-10 h-10 text-white ml-2" fill="white" />
                  )}
                </motion.button>
              </div>

              {/* Right Side Actions */}
              <motion.div
                className="absolute right-4 bottom-32 flex flex-col gap-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Collapse Button */}
                <ActionButton
                  icon={<div className="text-2xl">C</div>}
                  label=""
                  onClick={(e) => {
                    e.stopPropagation();
                    onCollapse(video, currentTime);
                  }}
                />

                {/* Like Button */}
                <ActionButton
                  icon={<Heart className={`w-7 h-7 ${liked ? 'fill-red-500 text-red-500' : ''}`} />}
                  label={formatNumber(video.likes || 234000)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLiked(!liked);
                  }}
                />

                {/* Comment Button */}
                <ActionButton
                  icon={<MessageCircle className="w-7 h-7" />}
                  label={formatNumber(video.comments || 1200)}
                  onClick={(e) => e.stopPropagation()}
                />

                {/* Share Button */}
                <ActionButton
                  icon={<Share2 className="w-7 h-7" />}
                  label="Share"
                  onClick={(e) => e.stopPropagation()}
                />

                {/* Creator Info */}
                <div className="flex flex-col items-center gap-2 mt-2">
                  <div
                    className="w-12 h-12 rounded-full"
                    style={{ backgroundColor: video.creatorAvatar }}
                  />
                  <motion.button
                    className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Follow
                  </motion.button>
                </div>
              </motion.div>

              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                {/* Video Info */}
                <motion.div
                  className="mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-white mb-1">{video.title}</h3>
                  <p className="text-white/70 text-sm">{video.creator}</p>
                  <p className="text-white/70 text-sm">
                    {video.views.toLocaleString()} views • {video.uploadDate}
                  </p>
                </motion.div>

                {/* Progress Bar */}
                <div
                  className="h-1.5 bg-white/20 rounded-full mb-3 cursor-pointer relative group"
                  onClick={handleProgressClick}
                  onMouseDown={() => setIsDraggingProgress(true)}
                  onMouseUp={() => setIsDraggingProgress(false)}
                  onMouseMove={handleProgressDrag}
                  onMouseLeave={() => setIsDraggingProgress(false)}
                >
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full relative"
                    style={{ width: `${progress}%` }}
                  >
                    <motion.div 
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing"
                      initial={{ opacity: 0, scale: 0 }}
                      whileHover={{ opacity: 1, scale: 1.2 }}
                      animate={{ opacity: isDraggingProgress ? 1 : 0 }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0}
                      onDrag={(e: any) => {
                        const rect = (e.target as HTMLElement).closest('.group')?.getBoundingClientRect();
                        if (rect) {
                          const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                          setCurrentTime(percentage * video.duration);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(video.duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Play/Pause */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPlaying(!isPlaying);
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 text-white" fill="white" />
                      ) : (
                        <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                      )}
                    </motion.button>

                    {/* Skip Forward */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentTime(Math.min(currentTime + 10, video.duration));
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <SkipForward className="w-4 h-4 text-white" />
                    </motion.button>

                    {/* Volume */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMuted(!isMuted);
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-white" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-white" />
                      )}
                    </motion.button>

                    {/* Enter Fullscreen */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLandscape(true);
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Maximize2 className="w-4 h-4 text-white" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Related Videos - Portrait Only - Takes bottom 1/3 */}
          <motion.div
            className="flex-1 overflow-y-auto scrollbar-hide bg-black/95"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <RelatedVideos
              videos={relatedVideos}
              onVideoClick={onVideoClick}
            />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function ActionButton({ 
  icon, 
  label, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <motion.button
      className="flex flex-col items-center gap-1"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
    >
      <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white">
        {icon}
      </div>
      {label && <span className="text-white text-xs">{label}</span>}
    </motion.button>
  );
}

function CompactActionButton({ 
  icon, 
  label, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <motion.button
      className="flex flex-col items-center gap-0.5"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
    >
      <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white">
        {icon}
      </div>
      {label && <span className="text-white text-[9px] leading-tight">{label}</span>}
    </motion.button>
  );
}
