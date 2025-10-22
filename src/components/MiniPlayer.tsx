import { useState, useEffect } from 'react';
import { Video } from '../types';
import { Play, Pause, SkipForward, X } from 'lucide-react';
import { motion, PanInfo } from 'motion/react';

interface MiniPlayerProps {
  video: Video;
  initialTime?: number;
  onClose: () => void;
  onExpand: () => void;
  onProgressUpdate?: (time: number) => void;
  onNext?: () => void;
}

export function MiniPlayer({ video, initialTime = 0, onClose, onExpand, onProgressUpdate, onNext }: MiniPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(initialTime);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev >= video.duration ? 0 : prev + 1;
          if (onProgressUpdate) {
            onProgressUpdate(newTime);
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, video.duration, onProgressUpdate]);

  const progress = (currentTime / video.duration) * 100;

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y < -50) {
      onExpand();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    setCurrentTime(percentage * video.duration);
  };

  const getVideoColor = (thumbnail: string) => {
    // Extract color from thumbnail or use default
    return thumbnail;
  };

  return (
    <motion.div
      className="fixed left-4 right-4 z-50 rounded-3xl overflow-hidden cursor-pointer shadow-ios-xl"
      style={{ 
        bottom: '16px',
      }}
      initial={{ y: 120, scale: 0.9, opacity: 0 }}
      animate={{ y: 0, scale: 1, opacity: 1 }}
      exit={{ y: 120, scale: 0.9, opacity: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 30,
        opacity: { duration: 0.2 }
      }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      onClick={onExpand}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Enhanced Glassmorphism Effect */}
      <div 
        className="absolute inset-0" 
        style={{
          background: `linear-gradient(135deg, ${getVideoColor(video.thumbnail)}35 0%, ${getVideoColor(video.thumbnail)}20 100%)`,
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
        }} 
      />
      
      {/* Frosted Glass Overlay with Reflections */}
      <div 
        className="absolute inset-0" 
        style={{
          background: `
            linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.15) 100%),
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.3), transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.15), transparent 40%)
          `,
        }} 
      />
      
      {/* Subtle Border for Glass Effect */}
      <div className="absolute inset-0 rounded-3xl border border-white/20" />
      
      {/* Content */}
      <div className="relative">
        {/* Drag Handle */}
        <div className="w-full flex justify-center pt-3 pb-2">
          <motion.div 
            className="w-12 h-1.5 bg-white/60 rounded-full"
            whileHover={{ width: 48 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        </div>

        <div className="px-5 pb-5 pt-2">
          <div className="flex items-center gap-3">
            {/* Thumbnail */}
            <motion.div
              className="w-14 h-14 rounded-2xl shrink-0 shadow-ios"
              style={{ backgroundColor: video.thumbnail }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />

            {/* Video Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white truncate drop-shadow-sm">{video.title}</p>
              <p className="text-white/90 text-sm truncate drop-shadow-sm">{video.creator}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(!isPlaying);
                }}
                className="w-11 h-11 rounded-full bg-white/30 backdrop-blur-ios-light flex items-center justify-center shadow-ios border border-white/20"
                whileHover={{ scale: 1.08, backgroundColor: "rgba(255, 255, 255, 0.4)" }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white drop-shadow" fill="white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5 drop-shadow" fill="white" />
                )}
              </motion.button>

              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onNext) {
                    onNext();
                  }
                }}
                className="w-11 h-11 rounded-full bg-white/30 backdrop-blur-ios-light flex items-center justify-center shadow-ios border border-white/20"
                whileHover={{ scale: 1.08, backgroundColor: "rgba(255, 255, 255, 0.4)" }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <SkipForward className="w-5 h-5 text-white drop-shadow" />
              </motion.button>

              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-11 h-11 rounded-full bg-white/30 backdrop-blur-ios-light flex items-center justify-center shadow-ios border border-white/20"
                whileHover={{ scale: 1.08, backgroundColor: "rgba(255, 255, 255, 0.4)" }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <X className="w-5 h-5 text-white drop-shadow" />
              </motion.button>
            </div>
          </div>

          {/* Progress Bar */}
          <motion.div
            className="mt-4 h-2 bg-white/30 rounded-full cursor-pointer relative group"
            onClick={handleProgressClick}
            whileHover={{ height: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <motion.div
              className="h-full bg-white rounded-full relative shadow-ios-sm"
              style={{ width: `${progress}%` }}
            >
              <motion.div 
                className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-ios"
                initial={{ opacity: 0, scale: 0 }}
                whileHover={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
