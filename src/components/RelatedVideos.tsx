import { Video } from '../types';
import { motion } from 'motion/react';

interface RelatedVideosProps {
  videos: Video[];
  onVideoClick: (video: Video) => void;
}

export function RelatedVideos({ videos, onVideoClick }: RelatedVideosProps) {
  const formatViews = (views: number) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views.toString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm">
      <div className="p-4">
        <h3 className="text-white mb-4">Related Videos</h3>
        <div className="space-y-3">
          {videos.map((video) => (
            <motion.div
              key={video.id}
              className="flex gap-3 cursor-pointer"
              onClick={() => onVideoClick(video)}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              {/* Thumbnail */}
              <div
                className="w-40 h-24 rounded-xl shrink-0 relative overflow-hidden shadow-ios"
                style={{ backgroundColor: video.thumbnail }}
              >
                {/* Duration Badge - Bottom Right */}
                <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 backdrop-blur-sm rounded text-white text-xs">
                  {formatDuration(video.duration)}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white line-clamp-2 text-sm mb-2 leading-tight">{video.title}</p>
                
                {/* Creator Info with Avatar */}
                <div className="flex items-center gap-2">
                  <div 
                    className="w-5 h-5 rounded-sm shrink-0 shadow-ios-sm"
                    style={{ backgroundColor: video.creatorAvatar }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/90 text-xs leading-tight">{video.creator}</p>
                    <p className="text-white/60 text-xs leading-tight">{formatViews(video.views)} views</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
