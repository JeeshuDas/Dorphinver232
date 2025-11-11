import { useState } from 'react';
import { Video } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Film, Zap, Check, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';

interface UploadVideoDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (video: Video, videoFile?: File, thumbnailFile?: File) => Promise<void>;
}

// Butter smooth spring config
const smoothSpring = {
  type: "spring" as const,
  stiffness: 260,
  damping: 28,
  mass: 0.8
};

const ultraSmoothSpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 35,
  mass: 0.6
};

type UploadStep = 'select' | 'details' | 'uploading' | 'success';

export function UploadVideoDialog({ open, onClose, onUpload }: UploadVideoDialogProps) {
  const [step, setStep] = useState<UploadStep>('select');
  const [videoType, setVideoType] = useState<'long' | 'short'>('long');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shortCategory, setShortCategory] = useState<'comedy' | 'music' | 'dance' | 'educational' | 'lifestyle'>('comedy');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setStep('details');
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnailFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!videoFile || !title.trim()) return;
    
    // Move to uploading step
    setStep('uploading');
    setUploadProgress(10);
    
    const newVideo: Video = {
      id: Date.now().toString(),
      title: title.trim(),
      creator: 'You',
      creatorAvatar: generateRandomColor(),
      thumbnail: thumbnailPreview || '',
      videoUrl: videoFile ? URL.createObjectURL(videoFile) : '',
      duration: 0, // Will be calculated by video player
      uploadDate: new Date().toISOString().split('T')[0],
      category: videoType,
      views: 0,
      likes: 0,
      comments: 0,
      description: description.trim(),
      shortCategory: videoType === 'short' ? shortCategory : undefined,
    };
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);
    
    try {
      // Call the upload handler (which calls the backend)
      await onUpload(newVideo, videoFile, thumbnailFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setStep('success');
      
      // Auto close after success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setStep('details');
      // Error will be shown by toast in parent component
    }
  };

  const handleClose = () => {
    setStep('select');
    setVideoFile(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setTitle('');
    setDescription('');
    setUploadProgress(0);
    onClose();
  };

  const generateRandomColor = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-card border border-border rounded-xl max-w-lg w-full shadow-ios-xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={ultraSmoothSpring}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-foreground flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Video
              </h3>
              <motion.button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                transition={smoothSpring}
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* Step 1: Select Video Type & File */}
                {step === 'select' && (
                  <motion.div
                    key="select"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={smoothSpring}
                    className="space-y-6"
                  >
                    {/* Video Type Selection */}
                    <div className="space-y-3">
                      <Label className="text-foreground">Video Type</Label>
                      <RadioGroup value={videoType} onValueChange={(value: 'long' | 'short') => setVideoType(value)}>
                        <div className="grid grid-cols-2 gap-3">
                          <motion.label
                            className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              videoType === 'long'
                                ? 'border-primary bg-primary/5'
                                : 'border-border bg-card hover:border-muted-foreground/30'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={smoothSpring}
                          >
                            <RadioGroupItem value="long" id="long" className="sr-only" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Film className="w-5 h-5 text-primary" />
                                <span className="text-foreground">Long Video</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Regular length content</p>
                            </div>
                            {videoType === 'long' && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={smoothSpring}
                              >
                                <Check className="w-5 h-5 text-primary" />
                              </motion.div>
                            )}
                          </motion.label>

                          <motion.label
                            className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              videoType === 'short'
                                ? 'border-primary bg-primary/5'
                                : 'border-border bg-card hover:border-muted-foreground/30'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={smoothSpring}
                          >
                            <RadioGroupItem value="short" id="short" className="sr-only" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Zap className="w-5 h-5 text-yellow-500" />
                                <span className="text-foreground">Short</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Quick, engaging clips</p>
                            </div>
                            {videoType === 'short' && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={smoothSpring}
                              >
                                <Check className="w-5 h-5 text-primary" />
                              </motion.div>
                            )}
                          </motion.label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-3">
                      <Label className="text-foreground">Select Video File</Label>
                      <label className="block">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <motion.div
                          className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={smoothSpring}
                        >
                          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-foreground mb-1">Click to select video</p>
                          <p className="text-xs text-muted-foreground">MP4, MOV, AVI up to 500MB</p>
                        </motion.div>
                      </label>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Video Details */}
                {step === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={smoothSpring}
                    className="space-y-4"
                  >
                    {/* File Info */}
                    <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {videoType === 'long' ? (
                          <Film className="w-5 h-5 text-primary" />
                        ) : (
                          <Zap className="w-5 h-5 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{videoFile?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {videoType === 'long' ? 'Long Video' : 'Short'} • {(videoFile!.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    {/* Thumbnail Upload */}
                    <div className="space-y-2">
                      <Label className="text-foreground">Thumbnail Image</Label>
                      <label className="block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailSelect}
                          className="hidden"
                        />
                        <motion.div
                          className="border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary transition-colors"
                          whileTap={{ scale: 0.98 }}
                          transition={smoothSpring}
                        >
                          {thumbnailPreview ? (
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-16 h-16 rounded-lg bg-cover bg-center shrink-0"
                                style={{ backgroundImage: `url(${thumbnailPreview})` }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground truncate">{thumbnailFile?.name}</p>
                                <p className="text-xs text-muted-foreground">Click to change</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-foreground">Add thumbnail</p>
                                <p className="text-xs text-muted-foreground">JPG, PNG up to 10MB</p>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </label>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-foreground">Title *</Label>
                      <Input
                        id="title"
                        placeholder="Give your video a catchy title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-background"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-foreground">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Tell viewers about your video..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="bg-background resize-none"
                      />
                    </div>

                    {/* Short Category (only for shorts) */}
                    {videoType === 'short' && (
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-foreground">Category</Label>
                        <Select value={shortCategory} onValueChange={(value: any) => setShortCategory(value)}>
                          <SelectTrigger id="category" className="bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="comedy">🎭 Comedy</SelectItem>
                            <SelectItem value="music">🎵 Music</SelectItem>
                            <SelectItem value="dance">💃 Dance</SelectItem>
                            <SelectItem value="educational">📚 Educational</SelectItem>
                            <SelectItem value="lifestyle">✨ Lifestyle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setStep('select')}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleUpload}
                        disabled={!title.trim()}
                        className="flex-1"
                      >
                        Upload Video
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Uploading */}
                {step === 'uploading' && (
                  <motion.div
                    key="uploading"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={smoothSpring}
                    className="space-y-6 py-8"
                  >
                    <div className="text-center">
                      <motion.div
                        className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Upload className="w-8 h-8 text-primary" />
                      </motion.div>
                      <h4 className="text-foreground mb-2">Uploading your video...</h4>
                      <p className="text-sm text-muted-foreground mb-4">{Math.round(uploadProgress)}% complete</p>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Success */}
                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={smoothSpring}
                    className="space-y-6 py-8 text-center"
                  >
                    <motion.div
                      className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ ...smoothSpring, delay: 0.1 }}
                    >
                      <Check className="w-8 h-8 text-green-500" />
                    </motion.div>
                    <div>
                      <h4 className="text-foreground mb-2">Upload Complete! 🎉</h4>
                      <p className="text-sm text-muted-foreground">Your video has been uploaded successfully</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}