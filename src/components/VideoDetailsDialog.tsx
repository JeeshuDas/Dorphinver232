import { Video } from '../types';
import { X, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';

interface VideoDetailsDialogProps {
  video: Video | null;
  onClose: () => void;
}

export function VideoDetailsDialog({ video, onClose }: VideoDetailsDialogProps) {
  if (!video) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-ios flex items-end sm:items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        onClick={onClose}
      >
        <motion.div
          className="bg-card backdrop-blur-ios border border-border rounded-t-3xl sm:rounded-3xl p-6 max-w-md w-full shadow-ios-xl"
          initial={{ y: '100%', scale: 0.95, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: '100%', scale: 0.95, opacity: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 400, 
            damping: 30,
            opacity: { duration: 0.2 }
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3>Video Details</h3>
            <motion.button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
              whileHover={{ scale: 1.1, backgroundColor: "var(--accent)" }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Video Thumbnail */}
          <motion.div
            className="w-full aspect-video rounded-xl mb-4 shadow-ios"
            style={{ backgroundColor: video.thumbnail }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />

          {/* Video Info */}
          <div className="space-y-3 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Title</p>
              <p>{video.title}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Creator</p>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: video.creatorAvatar }}
                />
                <p>{video.creator}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Upload Date</p>
                <p>{video.uploadDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Views</p>
                <p>{video.views.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p>
                  {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="capitalize">{video.category}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Button
              variant="destructive"
              className="w-full shadow-ios"
              onClick={() => {
                alert('Video reported. Thank you for helping keep Dorphin safe!');
                onClose();
              }}
            >
              <Flag className="w-4 h-4 mr-2" />
              Report Video
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
