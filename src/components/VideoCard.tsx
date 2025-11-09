import { Video } from '../types';
import { motion } from 'motion/react';

interface VideoCardProps {
  video: Video;
  onVideoClick?: (video: Video) => void;
  onMenuClick?: (video: Video) => void;
}

export function VideoCard({ video, onVideoClick }: VideoCardProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="shrink-0" style={{ width: '280px' }}>
      <motion.div
        className="relative rounded-lg overflow-hidden cursor-pointer group shadow-ios"
        style={{ width: '280px', height: '160px' }}
        onClick={() => onVideoClick?.(video)}
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
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

        {/* Duration Badge - Top Right */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-lg text-white text-xs shadow-ios-sm">
          {formatDuration(video.duration)}
        </div>

        {/* Continue Watching Progress Indicator */}
        {video.progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div 
              className="h-full bg-red-500"
              style={{ width: `${video.progress * 100}%` }}
            />
          </div>
        )}

        {/* Creator Avatar + Title - Always Visible */}
        <div className="absolute bottom-0 left-0 right-0 p-3 gradient-overlay-bottom">
          <div className="flex items-center gap-2">
            {/* Creator Avatar */}
            <div 
              className="w-7 h-7 rounded-full shrink-0 shadow-ios-sm"
              style={{ backgroundColor: video.creatorAvatar }}
            />
            {/* Title */}
            <p className="text-white text-sm line-clamp-2 leading-tight drop-shadow-lg" style={{ fontWeight: 500 }}>
              {video.title}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
