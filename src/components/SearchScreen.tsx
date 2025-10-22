import { useState, useMemo } from 'react';
import { Video } from '../types';
import { mockVideos } from '../data/mockData';
import { Search, X } from 'lucide-react';
import { motion } from 'motion/react';

interface SearchScreenProps {
  onVideoClick: (video: Video) => void;
}

export function SearchScreen({ onVideoClick }: SearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
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
      {/* Search Bar */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos and creators..."
            className="w-full pl-10 pr-10 py-3 bg-muted text-foreground rounded-full outline-none focus:ring-2 ring-ring placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="p-4">
        {searchQuery && (
          <p className="mb-4 text-muted-foreground">
            {filteredVideos.length} results for "{searchQuery}"
          </p>
        )}

        <div className="space-y-3">
          {filteredVideos.map((video) => (
            <motion.div
              key={video.id}
              className="flex gap-3 cursor-pointer group"
              onClick={() => onVideoClick(video)}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              {/* Thumbnail */}
              <div
                className="w-40 h-24 rounded-xl shrink-0 relative overflow-hidden shadow-ios"
                style={{ backgroundColor: video.thumbnail }}
              >
                {video.progress !== undefined && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div 
                      className="h-full bg-red-500"
                      style={{ width: `${video.progress * 100}%` }}
                    />
                  </div>
                )}
                
                {/* Duration Badge */}
                <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 backdrop-blur-sm rounded text-white text-xs">
                  {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="line-clamp-2 group-hover:text-primary transition-colors leading-tight mb-2">
                  {video.title}
                </h4>
                
                {/* Creator Info with Avatar */}
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-5 h-5 rounded-full shrink-0 shadow-ios-sm"
                    style={{ backgroundColor: video.creatorAvatar }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-muted-foreground text-sm leading-tight">
                      {video.creator}
                    </p>
                    <p className="text-muted-foreground text-xs leading-tight">
                      {formatViews(video.views)} views
                    </p>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-xs">
                  {video.uploadDate}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredVideos.length === 0 && searchQuery && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No videos found for "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
