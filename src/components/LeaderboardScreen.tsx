import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Trophy, ArrowLeft } from 'lucide-react';
import { Video } from '../types';
import { mockVideos } from '../data/mockData';

const smoothSpring = {
  type: "spring" as const,
  stiffness: 260,
  damping: 28,
  mass: 0.8
};

interface VideoWithScore extends Video {
  score: number;
  rank: number;
}

interface LeaderboardScreenProps {
  onBack?: () => void;
  onCreatorClick?: (creatorId: string) => void;
  onVideoClick?: (video: Video) => void;
}

// Calculate video score using the weighted formula
const calculateScore = (video: Video): number => {
  const watchTime = video.watchTime || 0;
  const likes = video.likes || 0;
  const views = typeof video.views === 'string' ? parseInt(video.views.replace(/,/g, '')) : video.views;
  
  // score = (0.5 * watchTime) + (0.3 * likes) + (0.1 * views)
  const score = (0.5 * watchTime) + (0.3 * likes) + (0.1 * views);
  return score;
};

// Get rank styling for top 3
const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return {
        bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
        border: 'border-yellow-500/40',
        text: 'text-yellow-500',
        glow: 'shadow-[0_0_20px_rgba(255,215,0,0.3)]'
      };
    case 2:
      return {
        bg: 'bg-gradient-to-r from-gray-400/10 to-gray-500/10',
        border: 'border-gray-400/30',
        text: 'text-gray-400',
        glow: 'shadow-[0_0_15px_rgba(192,192,192,0.2)]'
      };
    case 3:
      return {
        bg: 'bg-gradient-to-r from-orange-500/10 to-orange-700/10',
        border: 'border-orange-500/30',
        text: 'text-orange-500',
        glow: 'shadow-[0_0_15px_rgba(205,127,50,0.2)]'
      };
    default:
      return {
        bg: '',
        border: 'border-border',
        text: 'text-foreground',
        glow: ''
      };
  }
};

export function LeaderboardScreen({ onBack, onCreatorClick, onVideoClick }: LeaderboardScreenProps) {
  // Calculate scores and sort videos
  const rankedVideos = useMemo(() => {
    const videosWithScores: VideoWithScore[] = mockVideos
      .filter(v => v.category === 'long')
      .map(video => ({
        ...video,
        score: calculateScore(video)
      }))
      .sort((a, b) => b.score - a.score)
      .map((video, index) => ({
        ...video,
        rank: index + 1
      }))
      .slice(0, 100); // Show top 100
    
    return videosWithScores;
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="shrink-0 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <motion.button
                onClick={onBack}
                className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            )}
            <div className="flex items-center gap-2.5 flex-1">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-foreground truncate">Leaderboard</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Top videos by engagement</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Leaderboard List */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-24">
          <div className="space-y-2 sm:space-y-3">
            {rankedVideos.map((video, index) => {
              const rankStyle = getRankStyle(video.rank);
              const isTopThree = video.rank <= 3;

              return (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02, ...smoothSpring }}
                  onClick={() => onVideoClick?.(video)}
                  className={`group relative bg-card border rounded-xl sm:rounded-2xl overflow-hidden transition-all cursor-pointer ${
                    rankStyle.border
                  } ${isTopThree ? rankStyle.glow : ''} hover:scale-[1.01] active:scale-[0.99]`}
                >
                  {/* Top 3 Background */}
                  {isTopThree && (
                    <div className={`absolute inset-0 ${rankStyle.bg}`} />
                  )}

                  <div className="relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
                    {/* Rank Badge */}
                    <div className="shrink-0">
                      {isTopThree ? (
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${
                          video.rank === 1 ? 'from-yellow-400 to-yellow-600' :
                          video.rank === 2 ? 'from-gray-300 to-gray-500' :
                          'from-orange-400 to-orange-700'
                        } flex flex-col items-center justify-center shadow-lg`}>
                          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white mb-0.5" />
                          <span className="text-[10px] sm:text-xs font-bold text-white">{video.rank}</span>
                        </div>
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-muted flex items-center justify-center">
                          <span className="text-base sm:text-lg font-bold text-muted-foreground">
                            {video.rank}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-black shrink-0 border border-border/50">
                      {video.thumbnailFrameSettings?.mode === 'fit' && (
                        <div 
                          className="absolute inset-0 w-full h-full blur-3xl scale-110 opacity-40"
                          style={{
                            backgroundImage: `url(${video.thumbnail})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        />
                      )}
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full"
                        style={{
                          objectFit: video.thumbnailFrameSettings?.mode === 'fit' ? 'contain' : 'cover',
                          transform: video.thumbnailFrameSettings?.mode === 'fill' 
                            ? `scale(${video.thumbnailFrameSettings.zoom || 1}) translate(${(video.thumbnailFrameSettings.positionX || 0) / (video.thumbnailFrameSettings.zoom || 1)}px, ${(video.thumbnailFrameSettings.positionY || 0) / (video.thumbnailFrameSettings.zoom || 1)}px)`
                            : `scale(${video.thumbnailFrameSettings?.zoom || 1})`,
                        }}
                      />
                    </div>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base text-foreground line-clamp-1 mb-0.5 sm:mb-1">
                        {video.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-1 line-clamp-1">{video.creator}</p>
                      
                      {/* Stats - Minimal */}
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                        <span>{formatNumber(typeof video.views === 'string' ? parseInt(video.views.replace(/,/g, '')) : video.views)} views</span>
                        <span>•</span>
                        <span>{formatNumber(video.likes || 0)} likes</span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="shrink-0 text-right">
                      <div className={`text-base sm:text-xl font-bold ${
                        isTopThree ? rankStyle.text : 'text-foreground'
                      }`}>
                        {(video.score / 1000000).toFixed(1)}M
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">score</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}