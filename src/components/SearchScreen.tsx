import { useMemo } from 'react';
import { Video } from '../types';
import { mockVideos } from '../data/mockData';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';

interface SearchScreenProps {
  onVideoClick: (video: Video) => void;
  onBack?: () => void;
  searchQuery: string;
}

export function SearchScreen({ onVideoClick, searchQuery }: SearchScreenProps) {
  
  const formatViews = (views: number) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views.toString();
  };

  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return mockVideos;
    
    const query = searchQuery.toLowerCase();
    return mockVideos.filter(
      (video) =>
        video.title.toLowerCase().includes(query) ||
        video.creator.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-6 bg-background">
      {/* Results */}
      <div className="px-6 pt-2 pb-8">
        {searchQuery && (
          <p className="mb-4 text-muted-foreground/60 text-sm">
            {filteredVideos.length} results
          </p>
        )}

        <div className="space-y-2.5">
          {filteredVideos.map((video) => (
            <motion.div
              key={video.id}
              className="flex gap-3.5 cursor-pointer rounded-2xl p-2.5 shadow-ios"
              style={{
                background: 'rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
              onClick={() => onVideoClick(video)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {/* Thumbnail */}
              <div
                className="w-36 h-20 rounded-xl shrink-0 relative overflow-hidden shadow-ios-sm"
                style={{ backgroundColor: video.thumbnail }}
              >
                {/* Duration Badge */}
                <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-xs" style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}>
                  {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                <h4 className="line-clamp-2 leading-snug mb-1.5">
                  {video.title}
                </h4>
                
                {/* Creator Info with Avatar */}
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-4 h-4 rounded-full shrink-0 shadow-ios-sm"
                    style={{ backgroundColor: video.creatorAvatar }}
                  />
                  <p className="text-muted-foreground/70 text-sm truncate">
                    {video.creator}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredVideos.length === 0 && searchQuery && (
          <div className="text-center py-16 text-muted-foreground/50">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">no results</p>
          </div>
        )}
      </div>
    </div>
  );
}
