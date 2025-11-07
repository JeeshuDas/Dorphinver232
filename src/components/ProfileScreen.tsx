import { useState } from 'react';
import { Video } from '../types';
import { Settings, Moon, Sun, Eye, EyeOff, Upload } from 'lucide-react';
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
  const userAvatar = externalAvatar || userProfile.avatar;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const totalViews = userVideos.reduce((sum, video) => sum + video.views, 0);

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-6 bg-background">
      <div className="p-6">
        {/* Minimal Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white mb-4 shadow-ios">
            <span className="text-2xl">{userAvatar}</span>
          </div>
          
          <h2 className="text-foreground mb-1">{userProfile.displayName}</h2>
          <p className="text-sm text-muted-foreground mb-4">@{userProfile.username}</p>
          
          {/* Stats */}
          <div className="flex gap-8 mb-6">
            <div className="text-center">
              <p className="text-foreground">{formatNumber(userProfile.followers)}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-foreground">{formatNumber(userProfile.following)}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
            <div className="text-center">
              <p className="text-foreground">{formatNumber(totalViews)}</p>
              <p className="text-xs text-muted-foreground">Views</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={() => setShowUploadDialog(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-ios"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.8 }}
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm">Upload</span>
            </motion.button>
            
            <motion.button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-muted hover:bg-accent transition-colors shadow-ios"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.8 }}
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Settings</span>
            </motion.button>
          </div>
        </div>

        {/* Videos Grid */}
        <div>
          <h3 className="mb-4 text-foreground">Videos ({userVideos.length})</h3>
          <div className="grid grid-cols-3 gap-2">
            {userVideos.map((video) => (
              <motion.div
                key={video.id}
                className="relative aspect-[9/16] rounded-lg overflow-hidden cursor-pointer shadow-ios"
                style={{ backgroundColor: video.thumbnail }}
                onClick={() => onVideoClick(video)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Views overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white text-xs">{formatNumber(video.views)} views</p>
                </div>
              </motion.div>
            ))}
          </div>

          {userVideos.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No videos yet</p>
            </div>
          )}
        </div>
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
              className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-ios-xl"
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="text-muted-foreground">✕</span>
                </motion.button>
              </div>

              <div className="space-y-6">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isDarkMode ? (
                      <Moon className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Sun className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <Label className="text-foreground">Dark Mode</Label>
                      <p className="text-xs text-muted-foreground">Toggle app theme</p>
                    </div>
                  </div>
                  <Switch checked={isDarkMode} onCheckedChange={onThemeToggle} />
                </div>

                {/* Show/Hide Shorts */}
                {onShowShortsToggle && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {showShorts ? (
                        <Eye className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div>
                        <Label className="text-foreground">Show Shorts</Label>
                        <p className="text-xs text-muted-foreground">Display shorts in feed</p>
                      </div>
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
