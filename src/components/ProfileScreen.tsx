import { useState } from 'react';
import { Video } from '../types';
import { Upload, Trash2, X, Heart, Eye, Settings, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SettingsScreen } from './SettingsScreen';
import { userProfile } from '../data/mockData';

interface ProfileScreenProps {
  userVideos: Video[];
  onUpload: (video: Video) => void;
  onDelete: (videoId: string) => void;
  onVideoClick: (video: Video) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  userAvatar?: string;
  onAvatarChange?: (avatar: string) => void;
}

export function ProfileScreen({ userVideos, onUpload, onDelete, onVideoClick, isDarkMode, onThemeToggle, userAvatar: externalAvatar, onAvatarChange }: ProfileScreenProps) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const userAvatar = externalAvatar || userProfile.avatar;
  
  const handleAvatarChange = (newAvatar: string) => {
    if (onAvatarChange) {
      onAvatarChange(newAvatar);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Calculate total views from all user videos
  const totalViews = userVideos.reduce((sum, video) => sum + video.views, 0);

  if (showSettings) {
    return (
      <SettingsScreen
        onBack={() => setShowSettings(false)}
        isDarkMode={isDarkMode}
        onThemeToggle={onThemeToggle}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-6 bg-background">
      <div className="p-4">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6">
          <motion.div 
            className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl shrink-0 cursor-pointer group shadow-ios"
            onClick={() => setShowAvatarPicker(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {userAvatar}
            <motion.div 
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              whileHover={{ opacity: 1 }}
            >
              <Camera className="w-6 h-6 text-white" />
            </motion.div>
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-foreground">{userProfile.displayName}</h2>
              <button
                onClick={() => setShowSettings(true)}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
            <p className="text-muted-foreground mb-3">@{userProfile.username}</p>
            
            {/* Follower Stats */}
            <div className="flex gap-6">
              <div>
                <p className="text-foreground">{formatNumber(userProfile.followers)}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
              <div>
                <p className="text-foreground">{formatNumber(userProfile.following)}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
              <div>
                <p className="text-foreground">{formatNumber(totalViews)}</p>
                <p className="text-sm text-muted-foreground">Views</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <Button
          onClick={() => setShowUploadDialog(true)}
          className="w-full mb-6"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Video
        </Button>

        {/* Videos Vertical List */}
        <div>
          <h3 className="mb-6 text-foreground">Your Videos ({userVideos.length})</h3>
          <div className="space-y-4">
            {userVideos.map((video) => (
              <motion.div 
                key={video.id} 
                className="relative group flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 p-3 rounded-2xl hover:bg-muted/30 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                {/* Video Thumbnail */}
                <div className="relative shrink-0 w-full sm:w-auto">
                  <div
                    className="w-full sm:w-32 h-20 rounded-xl overflow-hidden relative border border-border shadow-ios cursor-pointer hover:shadow-ios-lg transition-shadow"
                    style={{ backgroundColor: video.thumbnail }}
                    onClick={() => onVideoClick(video)}
                  >
                    {/* Play Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                      <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-ios">
                        <div className="w-0 h-0 border-l-[10px] border-l-black border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent ml-1"></div>
                      </div>
                    </div>
                    
                    {/* Delete Button */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(video.id);
                      }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-ios z-10"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </motion.button>
                  </div>
                </div>
                
                {/* Stats and Info Container */}
                <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center gap-4 sm:gap-5 w-full">
                  {/* Views */}
                  <div className="flex flex-col items-start justify-center min-w-[70px]">
                    <div className="text-xl sm:text-2xl text-foreground" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                      {formatNumber(video.views)}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Views</div>
                  </div>
                  
                  {/* Likes */}
                  {video.likes !== undefined && (
                    <div className="flex flex-col items-start justify-center min-w-[70px]">
                      <div className="text-xl sm:text-2xl text-foreground" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                        {formatNumber(video.likes)}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Likes</div>
                    </div>
                  )}
                  
                  {/* Title and Date - Takes remaining space */}
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <h4 className="text-foreground line-clamp-1 mb-1 leading-tight">{video.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span>{video.uploadDate}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 bg-muted rounded-full">
                        {video.category === 'short' ? 'Short' : 'Long'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {userVideos.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No videos uploaded yet</p>
              <p className="text-sm mt-2">Start creating amazing content!</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Dialog */}
      <AnimatePresence>
        {showUploadDialog && (
          <UploadDialog
            onClose={() => setShowUploadDialog(false)}
            onUpload={(video) => {
              onUpload(video);
              setShowUploadDialog(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-2 text-foreground">Delete Video?</h3>
              <p className="text-muted-foreground mb-6">
                This action cannot be undone. Are you sure you want to delete this video?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    onDelete(deleteConfirm);
                    setDeleteConfirm(null);
                  }}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar Picker */}
      <AnimatePresence>
        {showAvatarPicker && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAvatarPicker(false)}
          >
            <motion.div
              className="bg-card border border-border rounded-3xl p-6 max-w-sm w-full shadow-ios-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-foreground">Choose Avatar</h3>
                <motion.button 
                  onClick={() => setShowAvatarPicker(false)} 
                  className="text-muted-foreground hover:text-foreground transition-colors w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                  whileHover={{ scale: 1.05, backgroundColor: "var(--accent)" }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-foreground mb-3 block">Emoji / Text Avatar</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {['😊', '🎨', '🚀', '⭐', '🎵', '🎬', '📸', '✨', '🔥', '💎', '🌟', '🎯'].map((emoji) => (
                      <motion.button
                        key={emoji}
                        onClick={() => {
                          handleAvatarChange(emoji);
                          setShowAvatarPicker(false);
                        }}
                        className={`aspect-square rounded-2xl flex items-center justify-center text-2xl shadow-ios ${
                          userAvatar === emoji 
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' 
                            : 'bg-muted hover:bg-accent'
                        }`}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-foreground mb-3 block">Custom Text (2 chars)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., AB"
                      maxLength={2}
                      className="bg-background text-foreground border-border text-center uppercase"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const value = (e.target as HTMLInputElement).value.toUpperCase().slice(0, 2);
                          if (value.length >= 1) {
                            handleAvatarChange(value);
                            setShowAvatarPicker(false);
                          }
                        }
                      }}
                    />
                    <Button
                      onClick={(e) => {
                        const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                        const value = input.value.toUpperCase().slice(0, 2);
                        if (value.length >= 1) {
                          handleAvatarChange(value);
                          setShowAvatarPicker(false);
                        }
                      }}
                      variant="outline"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UploadDialog({
  onClose,
  onUpload,
}: {
  onClose: () => void;
  onUpload: (video: Video) => void;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'short' | 'long'>('short');
  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    if (!title) return;

    setUploading(true);
    
    // Simulate upload
    setTimeout(() => {
      const newVideo: Video = {
        id: Date.now().toString(),
        title,
        creator: 'user_account',
        creatorAvatar: '#9D4EDD',
        thumbnail: '#' + Math.floor(Math.random()*16777215).toString(16),
        duration: category === 'short' ? 30 : 300,
        views: 0,
        likes: 0,
        comments: 0,
        uploadDate: new Date().toISOString().split('T')[0],
        category,
        shortCategory: category === 'short' ? 'comedy' : undefined,
      };
      
      onUpload(newVideo);
      setUploading(false);
    }, 1500);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-foreground">Upload Video</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-foreground">Video Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title..."
              className="mt-1 bg-background text-foreground border-border"
            />
          </div>

          <div>
            <Label className="text-foreground">Category Type</Label>
            <Select value={category} onValueChange={(v: 'short' | 'long') => setCategory(v)}>
              <SelectTrigger className="mt-1 bg-background text-foreground border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short Video</SelectItem>
                <SelectItem value="long">Long Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!title || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
