import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Server, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { BackendStartupGuide } from './BackendStartupGuide';

interface BackendStatusBannerProps {
  isConnected: boolean;
}

export function BackendStatusBanner({ isConnected }: BackendStatusBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Auto-dismiss if connected
  useEffect(() => {
    if (isConnected) {
      setIsDismissed(true);
    }
  }, [isConnected]);

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {!isConnected && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/95 backdrop-blur-sm shadow-lg"
        >
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <AlertCircle className="w-5 h-5 text-yellow-900 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">
                    Backend Server Not Started
                  </p>
                  <p className="text-xs text-yellow-800">
                    Start the backend to enable video uploads. Click "Show Fix" for instructions →
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDetails(!showDetails)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-700 h-8 text-xs"
                >
                  {showDetails ? 'Hide' : 'Show'} Fix
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsDismissed(true)}
                  className="text-yellow-900 hover:bg-yellow-600/20 h-8 px-2"
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* Detailed Instructions */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 pt-3 border-t border-yellow-600/30 overflow-hidden"
                >
                  <BackendStartupGuide />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}