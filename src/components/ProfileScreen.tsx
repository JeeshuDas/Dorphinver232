import { useState, useRef, useMemo } from 'react';
import { Video } from '../types';
import { Settings, User, Upload as UploadIcon, Edit2, Check, X, Trash2, Camera, Link as LinkIcon, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { userProfile } from '../data/mockData';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { UploadVideoDialog } from './UploadVideoDialog';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProfileScreenProps {
  userVideos: Video[];
  onUpload: (video: Video) => void;
  onDelete: (videoId: string) => void;
  onVideoClick: (video: Video) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  userAvatar?: string;
  onAvatarChange?: (avatar: string) => void;
  userDisplayName?: string;
  onDisplayNameChange?: (name: string) => void;
  userBio?: string;
  onBioChange?: (bio: string) => void;
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
  userDisplayName: externalDisplayName,
  onDisplayNameChange,
  userBio: externalBio,
  onBioChange
}: ProfileScreenProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDisplayName, setEditedDisplayName] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userAvatar = externalAvatar || userProfile.avatar;
  const userDisplayName = externalDisplayName || userProfile.displayName;
  const userBio = externalBio || '';

  // Show all user videos
  const filteredVideos = userVideos;

  // Calculate monthly score from user's videos (demo)
  const monthlyScore = useMemo(() => {
    // Get current month's videos
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    let totalScore = 0;
    
    for (const video of userVideos) {
      // Check if video was uploaded this month (simplified - using mock data)
      const watchTime = video.watchTime || 0;
      const likes = video.likes || 0;
      const views = typeof video.views === 'string' ? parseInt(video.views.replace(/,/g, '')) : (video.views || 0);
      
      // Calculate score using formula: 0.5*watchTime + 0.3*likes + 0.1*views
      const videoScore = (0.5 * watchTime) + (0.3 * likes) + (0.1 * views);
      totalScore += videoScore;
    }
    
    return totalScore;
  }, [userVideos]);

  // Calculate average view count
  const avgViews = useMemo(() => {
    if (userVideos.length === 0) return 0;
    
    const totalViews = userVideos.reduce((sum, video) => {
      const views = typeof video.views === 'string' ? parseInt(video.views.replace(/,/g, '')) : (video.views || 0);
      return sum + views;
    }, 0);
    
    return totalViews / userVideos.length;
  }, [userVideos]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleStartEdit = () => {
    setEditedDisplayName(userDisplayName);
    setEditedBio(userBio);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (onDisplayNameChange && editedDisplayName.trim()) {
      onDisplayNameChange(editedDisplayName.trim());
    }
    if (onBioChange) {
      onBioChange(editedBio);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (onAvatarChange) {
          onAvatarChange(result);
        }
        setShowAvatarDialog(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (avatarUrl.trim() && onAvatarChange) {
      onAvatarChange(avatarUrl.trim());
      setShowAvatarDialog(false);
      setAvatarUrl('');
    }
  };

  const handleRemoveAvatar = () => {
    if (onAvatarChange) {
      // Reset to initials
      const initials = userDisplayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      onAvatarChange(initials);
      setShowAvatarDialog(false);
    }
  };

  const isImageUrl = (str: string) => {
    return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:image/');
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide bg-background">
      {/* Header Section */}
      <div className="p-4">
        {!isEditing && (
          <div className="flex items-center gap-4 mb-4">
            {/* Profile Avatar */}
            <div className="relative shrink-0">
              <div 
                className="w-20 h-20 rounded-xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white shadow-ios overflow-hidden"
              >
                {isImageUrl(userAvatar) ? (
                  <ImageWithFallback
                    src={userAvatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">{userAvatar}</span>
                )}
              </div>
            </div>

            {/* Name and Username */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl truncate">{userDisplayName}</h2>
              <p className="text-sm text-muted-foreground">@{userDisplayName.toLowerCase().replace(/\s+/g, '')}</p>
            </div>

            {/* Action Buttons */}
            <motion.button
              onClick={handleStartEdit}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors shrink-0"
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Edit2 className="w-4.5 h-4.5 text-foreground" />
            </motion.button>
            <motion.button
              onClick={() => setShowUploadDialog(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors shrink-0"
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <UploadIcon className="w-5 h-5 text-foreground" />
            </motion.button>
            <motion.button
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors shrink-0"
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Settings className="w-6 h-6 text-foreground" />
            </motion.button>
          </div>
        )}

        {isEditing && (
          <div className="flex items-start gap-3 mb-4">
            {/* Profile Avatar */}
            <div className="relative shrink-0">
              <div 
                className="w-[72px] h-[72px] rounded-lg bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white shadow-ios overflow-hidden"
              >
                {isImageUrl(userAvatar) ? (
                  <ImageWithFallback
                    src={userAvatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">{userAvatar}</span>
                )}
              </div>
              
              {/* Edit Avatar Button - shown when editing */}
              <motion.button
                onClick={() => setShowAvatarDialog(true)}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-ios hover:scale-105 transition-transform"
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Camera className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="space-y-2">
                <Input
                  value={editedDisplayName}
                  onChange={(e) => setEditedDisplayName(e.target.value)}
                  placeholder="Display name"
                  className="h-8"
                />
                <Textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  placeholder="Bio (optional)"
                  className="min-h-[60px] max-h-[80px] text-sm resize-none"
                />
              </div>
            </div>

            {/* Edit/Save/Cancel Buttons */}
            <motion.button
              onClick={handleSaveEdit}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Check className="w-5 h-5 text-green-500" />
            </motion.button>
            <motion.button
              onClick={handleCancelEdit}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <X className="w-5 h-5 text-red-500" />
            </motion.button>
          </div>
        )}

        {/* Bio and Stats - only shown when not editing */}
        {!isEditing && (
          <div>
            {userBio && (
              <p className="mb-5 text-muted-foreground">{userBio}</p>
            )}
            
            {/* Stats: Follower Count, Score & Avg Views */}
            <div 
              className="grid grid-cols-3 gap-4 py-4 rounded-xl"
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex flex-col items-center gap-1 relative">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="text-2xl">{formatNumber(userProfile.followers)}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Followers</span>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
              </div>
              
              <div className="flex flex-col items-center gap-1 relative">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-2xl">{formatNumber(monthlyScore)}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Score</span>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <div className="w-5 h-5 flex items-center justify-center">
                  <span className="text-lg">👁️</span>
                </div>
                <span className="text-2xl">{formatNumber(avgViews)}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Avg Views</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Videos Grid */}
      <div className="px-2">
        <AnimatePresence mode="wait">
          <motion.div
            key="videos"
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
            <div className="grid grid-cols-2 gap-[3px]">
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  className="relative overflow-hidden cursor-pointer group aspect-square"
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
                  <div onClick={() => onVideoClick(video)} className="absolute inset-0">
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
                    
                    {/* Views overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-2">
                      <p className="text-white text-xs">{formatNumber(video.views)} views</p>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <motion.button
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-red-500/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(video.id);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </motion.button>
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
                <p>No videos yet</p>
                <p className="text-sm mt-2">Tap Upload to add your first video</p>
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
        onUpload={(video, videoFile, thumbnailFile) => {
          onUpload(video, videoFile, thumbnailFile);
          setShowUploadDialog(false);
        }}
      />

      {/* Delete Confirmation Dialog */}
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
              className="bg-background rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-foreground mb-2">Delete Video?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                This action cannot be undone. The video will be permanently deleted.
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

      {/* Avatar Edit Dialog */}
      <AnimatePresence>
        {showAvatarDialog && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-ios flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowAvatarDialog(false);
              setAvatarUrl('');
            }}
          >
            <motion.div
              className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-ios-xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-foreground">Change Profile Picture</h3>
                <motion.button
                  onClick={() => {
                    setShowAvatarDialog(false);
                    setAvatarUrl('');
                  }}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Current Avatar Preview */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white shadow-ios overflow-hidden">
                  {isImageUrl(userAvatar) ? (
                    <ImageWithFallback
                      src={userAvatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">{userAvatar}</span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {/* Upload from Device */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="w-full shadow-ios"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadIcon className="w-4 h-4 mr-2" />
                    Upload from Device
                  </Button>
                </div>

                {/* Enter URL */}
                <div className="space-y-2">
                  <Label>Or enter image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleUrlSubmit();
                        }
                      }}
                    />
                    <Button
                      onClick={handleUrlSubmit}
                      disabled={!avatarUrl.trim()}
                      className="shrink-0"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Remove Avatar */}
                {isImageUrl(userAvatar) && (
                  <Button
                    variant="destructive"
                    className="w-full shadow-ios"
                    onClick={handleRemoveAvatar}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Picture (Use Initials)
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}