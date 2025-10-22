import { useRef, useState } from 'react';
import { Category, Video } from '../types';
import { VideoCard } from './VideoCard';
import { ShortsRow } from './ShortsRow';
import { categories, categoryTags, shortsCategories } from '../data/mockData';
import { motion } from 'motion/react';

interface HomeScreenProps {
  onVideoClick: (video: Video) => void;
  onShortClick: (categoryId: string, index: number) => void;
  onCreatorClick: (creatorId: string) => void;
  followedCreators: Set<string>;
}

export function HomeScreen({ onVideoClick, onShortClick, onCreatorClick, followedCreators }: HomeScreenProps) {
  const allCreators = [
    { id: 'creator-1', name: 'Creator Alpha', avatar: '#7B2CBF', gradient: '#7B2CBF, #5A189A' },
    { id: 'creator-2', name: 'Creator Beta', avatar: '#9D4EDD', gradient: '#9D4EDD, #7B2CBF' },
    { id: 'creator-3', name: 'Creator Gamma', avatar: '#C77DFF', gradient: '#C77DFF, #9D4EDD' },
    { id: 'creator-4', name: 'Creator Delta', avatar: '#E0AAFF', gradient: '#E0AAFF, #C77DFF' },
    { id: 'creator-5', name: 'Creator Epsilon', avatar: '#FF6FD8', gradient: '#FF6FD8, #E0AAFF' },
  ];
  
  // Filter to show only followed creators
  const creators = allCreators.filter(c => followedCreators.has(c.id));

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-6 bg-background">
      {/* Followed Creator Accounts */}
      {creators.length > 0 && (
        <div className="px-4 py-4">
          <h3 className="mb-3 text-sm text-muted-foreground">Following</h3>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {creators.map((creator, index) => (
            <motion.button
              key={creator.id}
              onClick={() => onCreatorClick(creator.id)}
              className="shrink-0 flex flex-col items-center gap-2 group"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 25,
                delay: index * 0.05
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-full shadow-ios-lg"
                  style={{
                    background: `linear-gradient(135deg, ${creator.gradient})`
                  }}
                />
                <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm" />
              </div>
              <span className="text-xs max-w-[64px] truncate">{creator.name.split(' ')[1]}</span>
            </motion.button>
          ))}
          </div>
        </div>
      )}

      {/* Comedy & Meme Shorts */}
      {shortsCategories[0] && (
        <ShortsRow
          category={shortsCategories[0]}
          onShortClick={onShortClick}
        />
      )}

      {/* Video Categories - First Batch */}
      <div className="space-y-6 px-4 mb-6">
        {categories.slice(0, 2).map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            onVideoClick={onVideoClick}
          />
        ))}
      </div>

      {/* Music Shorts */}
      {shortsCategories[1] && (
        <ShortsRow
          category={shortsCategories[1]}
          onShortClick={onShortClick}
        />
      )}

      {/* Video Categories - Second Batch */}
      <div className="space-y-6 px-4 mb-6">
        {categories.slice(2, 4).map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            onVideoClick={onVideoClick}
          />
        ))}
      </div>

      {/* Dance Shorts */}
      {shortsCategories[2] && (
        <ShortsRow
          category={shortsCategories[2]}
          onShortClick={onShortClick}
        />
      )}

      {/* Video Categories - Remaining */}
      <div className="space-y-6 px-4">
        {categories.slice(4).map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            onVideoClick={onVideoClick}
          />
        ))}
      </div>
    </div>
  );
}

function CategorySection({ 
  category, 
  onVideoClick
}: { 
  category: Category;
  onVideoClick: (video: Video) => void;
}) {
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
    <div>
      <h2 className="mb-3">{category.name}</h2>

      {/* Videos Scroll Container - with safe spacing for hover animations */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide select-none pt-2 -mt-2 pb-4"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {category.videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onVideoClick={onVideoClick}
          />
        ))}
      </div>
    </div>
  );
}
