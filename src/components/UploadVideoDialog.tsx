import { useState, useRef, useEffect } from 'react';
import { Video } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Film, Check, Image as ImageIcon, Maximize2, Minimize2, Move, ZoomIn } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';

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

type UploadStep = 'select' | 'frame' | 'details' | 'uploading' | 'success';

export function UploadVideoDialog({ open, onClose, onUpload }: UploadVideoDialogProps) {
  const [step, setStep] = useState<UploadStep>('select');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Video frame adjustment states
  const [frameMode, setFrameMode] = useState<'fit' | 'fill'>('fill');
  const [zoom, setZoom] = useState(1);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, initialX: 0, initialY: 0 });
  
  // Thumbnail frame adjustment states
  const [thumbnailFrameMode, setThumbnailFrameMode] = useState<'fit' | 'fill'>('fill');
  const [thumbnailZoom, setThumbnailZoom] = useState(1);
  const [thumbnailPositionX, setThumbnailPositionX] = useState(0);
  const [thumbnailPositionY, setThumbnailPositionY] = useState(0);
  const [isThumbnailDragging, setIsThumbnailDragging] = useState(false);
  const [thumbnailDragStart, setThumbnailDragStart] = useState({ x: 0, y: 0, initialX: 0, initialY: 0 });
  const [showThumbnailAdjuster, setShowThumbnailAdjuster] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      setStep('frame');
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
        setShowThumbnailAdjuster(true); // Open adjuster when thumbnail is loaded
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag handlers for video positioning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      initialX: positionX,
      initialY: positionY
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setPositionX(dragStart.initialX + deltaX);
    setPositionY(dragStart.initialY + deltaY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX,
      y: touch.clientY,
      initialX: positionX,
      initialY: positionY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;
    setPositionX(dragStart.initialX + deltaX);
    setPositionY(dragStart.initialY + deltaY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Drag handlers for thumbnail positioning
  const handleThumbnailMouseDown = (e: React.MouseEvent) => {
    setIsThumbnailDragging(true);
    setThumbnailDragStart({
      x: e.clientX,
      y: e.clientY,
      initialX: thumbnailPositionX,
      initialY: thumbnailPositionY
    });
  };

  const handleThumbnailMouseMove = (e: React.MouseEvent) => {
    if (!isThumbnailDragging) return;
    const deltaX = e.clientX - thumbnailDragStart.x;
    const deltaY = e.clientY - thumbnailDragStart.y;
    setThumbnailPositionX(thumbnailDragStart.initialX + deltaX);
    setThumbnailPositionY(thumbnailDragStart.initialY + deltaY);
  };

  const handleThumbnailMouseUp = () => {
    setIsThumbnailDragging(false);
  };

  // Touch handlers for thumbnail on mobile
  const handleThumbnailTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsThumbnailDragging(true);
    setThumbnailDragStart({
      x: touch.clientX,
      y: touch.clientY,
      initialX: thumbnailPositionX,
      initialY: thumbnailPositionY
    });
  };

  const handleThumbnailTouchMove = (e: React.TouchEvent) => {
    if (!isThumbnailDragging) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - thumbnailDragStart.x;
    const deltaY = touch.clientY - thumbnailDragStart.y;
    setThumbnailPositionX(thumbnailDragStart.initialX + deltaX);
    setThumbnailPositionY(thumbnailDragStart.initialY + deltaY);
  };

  const handleThumbnailTouchEnd = () => {
    setIsThumbnailDragging(false);
  };

  const handleUpload = async () => {
    if (!videoFile || !title.trim()) return;
    
    setStep('uploading');
    setUploadProgress(10);
    
    const newVideo: Video = {
      id: Date.now().toString(),
      title: title.trim(),
      creator: 'You',
      creatorId: 'demo-user',
      creatorAvatar: generateRandomColor(),
      thumbnail: thumbnailPreview || '',
      videoUrl: videoFile ? URL.createObjectURL(videoFile) : '',
      duration: 0,
      uploadDate: new Date().toISOString().split('T')[0],
      category: 'long',
      views: '0',
      likes: 0,
      comments: 0,
      description: description.trim(),
      frameSettings: {
        mode: frameMode,
        zoom,
        positionX,
        positionY
      },
      thumbnailFrameSettings: thumbnailPreview ? {
        mode: thumbnailFrameMode,
        zoom: thumbnailZoom,
        positionX: thumbnailPositionX,
        positionY: thumbnailPositionY
      } : undefined
    };
    
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
      await onUpload(newVideo, videoFile, thumbnailFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setStep('success');
      
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setStep('details');
    }
  };

  const handleClose = () => {
    setStep('select');
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setTitle('');
    setDescription('');
    setUploadProgress(0);
    setFrameMode('fill');
    setZoom(1);
    setPositionX(0);
    setPositionY(0);
    onClose();
  };

  const generateRandomColor = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getVideoTransform = () => {
    if (frameMode === 'fit') {
      return {
        transform: `scale(${zoom})`,
        objectFit: 'contain' as const
      };
    }
    return {
      transform: `scale(${zoom}) translate(${positionX / zoom}px, ${positionY / zoom}px)`,
      objectFit: 'cover' as const
    };
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
            className="bg-card border border-border rounded-xl max-w-lg w-full shadow-ios-xl overflow-hidden max-h-[95vh] flex flex-col"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={ultraSmoothSpring}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border shrink-0">
              <h3 className="text-foreground flex items-center gap-2 text-base sm:text-lg">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
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
            <div className="p-4 sm:p-6 overflow-y-auto scrollbar-hide flex-1">
              <AnimatePresence mode="wait">
                {/* Step 1: Select Video File */}
                {step === 'select' && (
                  <motion.div
                    key="select"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={smoothSpring}
                    className="space-y-6"
                  >
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

                {/* Step 2: Frame Adjustment */}
                {step === 'frame' && (
                  <motion.div
                    key="frame"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={smoothSpring}
                    className="space-y-4"
                  >
                    {/* File Info */}
                    <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Film className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{videoFile?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Adjust how your video fits in the frame
                        </p>
                      </div>
                    </div>

                    {/* Square Video Preview Container */}
                    <div className="space-y-2">
                      <Label className="text-foreground flex items-center gap-2">
                        <Move className="w-4 h-4" />
                        Preview Frame (1:1)
                      </Label>
                      <div
                        ref={containerRef}
                        className="relative w-full aspect-square bg-black rounded-xl overflow-hidden cursor-move select-none border-2 border-border"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        <video
                          ref={videoRef}
                          className="w-full h-full"
                          src={videoPreviewUrl || ''}
                          muted
                          loop
                          autoPlay
                          playsInline
                          style={getVideoTransform()}
                        />
                        
                        {/* Drag Hint Overlay */}
                        {!isDragging && frameMode === 'fill' && (
                          <motion.div
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 0 }}
                            transition={{ delay: 2, duration: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none"
                          >
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                              <p className="text-white text-sm flex items-center gap-2">
                                <Move className="w-4 h-4" />
                                Drag to reposition
                              </p>
                            </div>
                          </motion.div>
                        )}

                        {/* Active Drag Indicator */}
                        {isDragging && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full"
                          >
                            <p className="text-white text-xs flex items-center gap-1.5">
                              <Move className="w-3 h-3" />
                              Moving
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Frame Mode Toggle */}
                    <div className="space-y-2">
                      <Label className="text-foreground">Frame Mode</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          onClick={() => {
                            setFrameMode('fit');
                            setPositionX(0);
                            setPositionY(0);
                          }}
                          className={`relative flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                            frameMode === 'fit'
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-card hover:border-muted-foreground/30'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={smoothSpring}
                        >
                          <Minimize2 className="w-5 h-5 text-primary" />
                          <div className="flex-1 text-left">
                            <p className="text-sm text-foreground">Fit</p>
                            <p className="text-xs text-muted-foreground">Show entire video</p>
                          </div>
                          {frameMode === 'fit' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                            >
                              <Check className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </motion.button>

                        <motion.button
                          onClick={() => setFrameMode('fill')}
                          className={`relative flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                            frameMode === 'fill'
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-card hover:border-muted-foreground/30'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={smoothSpring}
                        >
                          <Maximize2 className="w-5 h-5 text-primary" />
                          <div className="flex-1 text-left">
                            <p className="text-sm text-foreground">Fill</p>
                            <p className="text-xs text-muted-foreground">Fill the frame</p>
                          </div>
                          {frameMode === 'fill' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                            >
                              <Check className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </motion.button>
                      </div>
                    </div>

                    {/* Zoom Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-foreground flex items-center gap-2">
                          <ZoomIn className="w-4 h-4" />
                          Zoom
                        </Label>
                        <span className="text-sm text-muted-foreground">{zoom.toFixed(1)}x</span>
                      </div>
                      <Slider
                        value={[zoom]}
                        onValueChange={(values) => setZoom(values[0])}
                        min={1}
                        max={3}
                        step={0.1}
                        className="cursor-pointer"
                      />
                    </div>

                    {/* Reset Button */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setZoom(1);
                        setPositionX(0);
                        setPositionY(0);
                      }}
                      className="w-full"
                    >
                      Reset to Default
                    </Button>

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
                        onClick={() => setStep('details')}
                        className="flex-1"
                      >
                        Next
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Video Details */}
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
                        <Film className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{videoFile?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Long Video • {(videoFile!.size / (1024 * 1024)).toFixed(2)} MB
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

                      {/* Thumbnail Frame Adjuster */}
                      {thumbnailPreview && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ 
                            opacity: showThumbnailAdjuster ? 1 : 0,
                            height: showThumbnailAdjuster ? 'auto' : 0
                          }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 p-4 rounded-xl bg-muted/30 border border-border space-y-3">
                            {/* Adjuster Header */}
                            <div className="flex items-center justify-between">
                              <Label className="text-foreground text-sm flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                Adjust Thumbnail Frame
                              </Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowThumbnailAdjuster(!showThumbnailAdjuster)}
                                className="h-7 text-xs"
                              >
                                {showThumbnailAdjuster ? 'Hide' : 'Show'}
                              </Button>
                            </div>

                            {/* Square Thumbnail Preview */}
                            <div
                              ref={thumbnailContainerRef}
                              className="relative w-full aspect-square bg-black rounded-xl overflow-hidden cursor-move select-none border-2 border-border"
                              onMouseDown={handleThumbnailMouseDown}
                              onMouseMove={handleThumbnailMouseMove}
                              onMouseUp={handleThumbnailMouseUp}
                              onMouseLeave={handleThumbnailMouseUp}
                              onTouchStart={handleThumbnailTouchStart}
                              onTouchMove={handleThumbnailTouchMove}
                              onTouchEnd={handleThumbnailTouchEnd}
                            >
                              {/* Blurred Background for Fit Mode */}
                              {thumbnailFrameMode === 'fit' && (
                                <div 
                                  className="absolute inset-0 w-full h-full blur-3xl scale-110 opacity-40"
                                  style={{
                                    backgroundImage: `url(${thumbnailPreview})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                  }}
                                />
                              )}

                              <img
                                src={thumbnailPreview}
                                alt="Thumbnail preview"
                                className="w-full h-full"
                                style={{
                                  objectFit: thumbnailFrameMode === 'fit' ? 'contain' : 'cover',
                                  transform: thumbnailFrameMode === 'fill' 
                                    ? `scale(${thumbnailZoom}) translate(${thumbnailPositionX / thumbnailZoom}px, ${thumbnailPositionY / thumbnailZoom}px)`
                                    : `scale(${thumbnailZoom})`,
                                }}
                              />

                              {/* Drag Hint */}
                              {!isThumbnailDragging && thumbnailFrameMode === 'fill' && (
                                <motion.div
                                  initial={{ opacity: 1 }}
                                  animate={{ opacity: 0 }}
                                  transition={{ delay: 2, duration: 0.5 }}
                                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none"
                                >
                                  <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                                    <p className="text-white text-xs flex items-center gap-1.5">
                                      <Move className="w-3 h-3" />
                                      Drag to reposition
                                    </p>
                                  </div>
                                </motion.div>
                              )}

                              {/* Active Drag Indicator */}
                              {isThumbnailDragging && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm px-2.5 py-1 rounded-full"
                                >
                                  <p className="text-white text-[10px] flex items-center gap-1">
                                    <Move className="w-2.5 h-2.5" />
                                    Moving
                                  </p>
                                </motion.div>
                              )}
                            </div>

                            {/* Frame Mode Toggle */}
                            <div className="grid grid-cols-2 gap-2">
                              <motion.button
                                onClick={() => {
                                  setThumbnailFrameMode('fit');
                                  setThumbnailPositionX(0);
                                  setThumbnailPositionY(0);
                                }}
                                className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-xs ${
                                  thumbnailFrameMode === 'fit'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border bg-card hover:border-muted-foreground/30'
                                }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Minimize2 className="w-4 h-4 text-primary" />
                                <span className="text-foreground">Fit</span>
                                {thumbnailFrameMode === 'fit' && (
                                  <Check className="w-3 h-3 text-primary ml-auto" />
                                )}
                              </motion.button>

                              <motion.button
                                onClick={() => setThumbnailFrameMode('fill')}
                                className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-xs ${
                                  thumbnailFrameMode === 'fill'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border bg-card hover:border-muted-foreground/30'
                                }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Maximize2 className="w-4 h-4 text-primary" />
                                <span className="text-foreground">Fill</span>
                                {thumbnailFrameMode === 'fill' && (
                                  <Check className="w-3 h-3 text-primary ml-auto" />
                                )}
                              </motion.button>
                            </div>

                            {/* Zoom Slider */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <Label className="text-foreground text-xs flex items-center gap-1.5">
                                  <ZoomIn className="w-3 h-3" />
                                  Zoom
                                </Label>
                                <span className="text-xs text-muted-foreground">{thumbnailZoom.toFixed(1)}x</span>
                              </div>
                              <Slider
                                value={[thumbnailZoom]}
                                onValueChange={(values) => setThumbnailZoom(values[0])}
                                min={1}
                                max={3}
                                step={0.1}
                                className="cursor-pointer"
                              />
                            </div>

                            {/* Reset Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setThumbnailZoom(1);
                                setThumbnailPositionX(0);
                                setThumbnailPositionY(0);
                              }}
                              className="w-full text-xs h-8"
                            >
                              Reset Thumbnail Frame
                            </Button>
                          </div>
                        </motion.div>
                      )}
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

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setStep('frame')}
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

                {/* Step 4: Uploading */}
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

                {/* Step 5: Success */}
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