import { Video } from '../types';
import { motion } from 'motion/react';

interface ShortCardProps {
  video: Video;
  onClick: () => void;
}

export function ShortCard({ video, onClick }: ShortCardProps) {
  return (
    <motion.div
      className="relative rounded-lg overflow-hidden cursor-pointer shrink-0 group shadow-ios"
      style={{ width: '180px', height: '320px' }}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
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

      {/* Creator Avatar + Title - Always Visible */}
      <div className="absolute bottom-0 left-0 right-0 p-3 gradient-overlay-bottom">
        <div className="flex items-center gap-2">
          {/* Creator Avatar */}
          <div 
            className="w-6 h-6 rounded-sm shrink-0 shadow-ios-sm"
            style={{ backgroundColor: video.creatorAvatar }}
          />
          {/* Title */}
          <p className="text-white text-sm line-clamp-2 leading-tight drop-shadow-lg" style={{ fontWeight: 500 }}>
            {video.title}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
