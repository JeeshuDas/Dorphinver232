import { useState } from 'react';
import { Video } from '../types';
import { Settings, User, Upload as UploadIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { userProfile } from '../data/mockData';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { UploadVideoDialog } from './UploadVideoDialog';

interface ProfileScreenProps {
  userVideos: Video[];
  onUpload: (video: Video) => void;
  onDelete: (videoId: string) => void;
  onVideoClick: (video: Video) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  userAvatar?: string;
  onAvatarChange?: (avatar: string) => void;
  showShorts?: boolean;
  onShowShortsToggle?: (show: boolean) => void;
  shortsLimit?: number;
  onShortsLimitChange?: (limit: number) => void;
}

export function ProfileScreen({ 
  userVideos, 
  onUpload, 
  onDelete, 
  onVideoClick, 
  isDarkMode, 
  onThemeToggle, 
  userAvatar: externalAvatar, 
  onAvatarChange,
  showShorts = true,
  onShowShortsToggle,
  shortsLimit = 25,
  onShortsLimitChange
}: ProfileScreenProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'longs' | 'shorts'>('longs');
  const userAvatar = externalAvatar || userProfile.avatar;

  // Filter videos based on active tab
  const filteredVideos = userVideos.filter(video => 
    activeTab === 'longs' ? video.category === 'long' : video.category === 'short'
  );

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide bg-background">
      {/* Header Section */}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          {/* Profile Avatar */}
          <div 
            className="w-[72px] h-[72px] rounded-lg bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white shadow-ios shrink-0"
          >
            <span className="text-2xl">{userAvatar}</span>
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-foreground mb-1 truncate">{userProfile.displayName}</h2>
            
            {/* Follower Count */}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="text-sm">{formatNumber(userProfile.followers)}</span>
            </div>
          </div>

          {/* Upload Button */}
          <motion.button
            onClick={() => setShowUploadDialog(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <UploadIcon className="w-5 h-5 text-foreground" />
          </motion.button>

          {/* Settings Button */}
          <motion.button
            onClick={() => setShowSettings(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Settings className="w-6 h-6 text-foreground" />
          </motion.button>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="px-4 pb-3">
        <div className="relative bg-muted rounded-xl p-1 flex gap-1">
          {/* Sliding Background */}
          <motion.div
            className="absolute top-1 bottom-1 bg-background rounded-lg shadow-ios-sm"
            initial={false}
            animate={{
              left: activeTab === 'longs' ? '4px' : '50%',
              right: activeTab === 'longs' ? '50%' : '4px',
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />

          {/* Longs Tab */}
          <button
            onClick={() => setActiveTab('longs')}
            className="relative z-10 flex-1 py-2 px-4 rounded-lg text-sm transition-colors"
          >
            <span className={activeTab === 'longs' ? 'text-foreground' : 'text-muted-foreground'}>
              Longs
            </span>
          </button>

          {/* Shorts Tab */}
          <button
            onClick={() => setActiveTab('shorts')}
            className="relative z-10 flex-1 py-2 px-4 rounded-lg text-sm transition-colors"
          >
            <span className={activeTab === 'shorts' ? 'text-foreground' : 'text-muted-foreground'}>
              Shorts
            </span>
          </button>
        </div>
      </div>

      {/* Videos Grid - 3 columns */}
      <div className="px-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              mass: 0.8
            }}
          >
            <div className="grid grid-cols-3 gap-[3px]">
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  className={`relative overflow-hidden cursor-pointer ${
                    activeTab === 'longs' ? 'aspect-square' : 'aspect-[9/16]'
                  }`}
                  onClick={() => onVideoClick(video)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 25,
                    delay: index * 0.03
                  }}
                  whileTap={{ scale: 0.98 }}
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
                  
                  {/* Optional: Views overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-end p-2">
                    <p className="text-white text-xs">{formatNumber(video.views)} views</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredVideos.length === 0 && (
              <motion.div 
                className="text-center py-16 text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p>No {activeTab} yet</p>
                <p className="text-sm mt-2">Tap Upload to add your first {activeTab === 'longs' ? 'long video' : 'short'}</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-ios-xl max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-foreground">Settings</h3>
                <motion.button
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="text-muted-foreground">✕</span>
                </motion.button>
              </div>

              <div className="space-y-6">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Dark Mode</Label>
                    <p className="text-xs text-muted-foreground">Toggle app theme</p>
                  </div>
                  <Switch checked={isDarkMode} onCheckedChange={onThemeToggle} />
                </div>

                {/* Show/Hide Shorts */}
                {onShowShortsToggle && (
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-foreground">Show Shorts</Label>
                      <p className="text-xs text-muted-foreground">Display shorts in feed</p>
                    </div>
                    <Switch 
                      checked={showShorts} 
                      onCheckedChange={onShowShortsToggle} 
                    />
                  </div>
                )}

                {/* Shorts Limit Slider */}
                {onShortsLimitChange && showShorts && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-foreground">Shorts Scroll Limit</Label>
                      <p className="text-xs text-muted-foreground">
                        Maximum shorts per row: {shortsLimit}
                      </p>
                    </div>
                    <Slider
                      value={[shortsLimit]}
                      onValueChange={(value) => onShortsLimitChange(value[0])}
                      min={5}
                      max={25}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5</span>
                      <span>25</span>
                    </div>
                  </div>
                )}

                {/* Additional Settings Placeholder */}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    More settings coming soon
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Video Dialog */}
      <UploadVideoDialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onUpload={(video) => {
          onUpload(video);
          setShowUploadDialog(false);
        }}
      />
    </div>
  );
}
