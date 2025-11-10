import { useState, useMemo } from 'react';
import { mockVideos } from '../data/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface LeaderboardScreenProps {
  onBack: () => void;
  onCreatorClick: (creatorId: string) => void;
}

interface CreatorStats {
  creator: string;
  creatorAvatar: string;
  totalViews: number;
}

export function LeaderboardScreen({ onBack, onCreatorClick }: LeaderboardScreenProps) {
  // Calculate creator stats
  const creatorStats = useMemo(() => {
    const statsMap = new Map<string, CreatorStats>();

    mockVideos.forEach(video => {
      const existing = statsMap.get(video.creator);
      
      if (existing) {
        existing.totalViews += video.views;
      } else {
        statsMap.set(video.creator, {
          creator: video.creator,
          creatorAvatar: video.creatorAvatar,
          totalViews: video.views,
        });
      }
    });

    const statsArray = Array.from(statsMap.values());
    return statsArray.sort((a, b) => b.totalViews - a.totalViews);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md z-20 px-1 py-5">
        <div className="flex items-center justify-between">
          <h1 style={{ fontFamily: 'Garet, sans-serif', fontSize: '2rem' }}>leaderboard</h1>
          <motion.button
            onClick={onBack}
            className="w-11 h-11 rounded-full flex items-center justify-center shadow-ios"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="px-1 pt-2 pb-8 space-y-2">
        {creatorStats.map((creator, index) => (
          <motion.div
            key={creator.creator}
            className="flex items-center gap-4 py-4 px-5 rounded-2xl shadow-ios cursor-pointer"
            style={{
              background: index < 3 
                ? 'rgba(163, 230, 53, 0.08)'
                : 'rgba(0, 0, 0, 0.15)',
              border: index < 3 
                ? '1px solid rgba(163, 230, 53, 0.2)'
                : '1px solid rgba(255, 255, 255, 0.05)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              delay: index * 0.03,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCreatorClick(creator.creator)}
          >
            {/* Rank */}
            <span className="text-2xl text-muted-foreground/40 w-8 shrink-0 text-center">
              {index + 1}
            </span>

            {/* Creator Avatar */}
            <div
              className="w-12 h-12 rounded-lg shrink-0 shadow-ios-sm"
              style={{ backgroundColor: creator.creatorAvatar }}
            />

            {/* Creator Name */}
            <div className="flex-1 min-w-0">
              <p className="truncate">{creator.creator}</p>
            </div>

            {/* Views */}
            <div className="text-right shrink-0">
              <p className="text-muted-foreground/60 text-sm">
                {formatNumber(creator.totalViews)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
