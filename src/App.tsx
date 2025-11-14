import { useState, useEffect, useCallback, useRef } from 'react';
import { Video, Comment } from './types';
import { HomeScreen } from './components/HomeScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { SearchScreen } from './components/SearchScreen';
import { CreatorProfileScreen } from './components/CreatorProfileScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { MiniPlayer } from './components/MiniPlayer';
import { FullScreenVideoPlayer } from './components/FullScreenVideoPlayer';
import { VideoDetailsDialog } from './components/VideoDetailsDialog';
import { Search, Mic, ArrowLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './providers/DataProvider';
import logoImage from 'figma:asset/88f9fb54f06bdddc900357dfa9aed256720e2d56.png';

type Screen = 'home' | 'search' | 'profile' | 'video' | 'creator' | 'leaderboard';

interface NavigationStackEntry {
  screen: Screen;
  data?: {
    creatorId?: string;
    video?: Video;
  };
  scrollPosition?: number;
}

function AppContent() {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const { refreshAll, isRefreshing, searchVideos, clearSearch, searchResults, isSearching, isBackendConnected } = useData();
  
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [navigationStack, setNavigationStack] = useState<NavigationStackEntry[]>([{ screen: 'home' }]);
  const currentScreen = navigationStack[navigationStack.length - 1]?.screen || 'home';
  const currentData = navigationStack[navigationStack.length - 1]?.data;
  
  const [miniPlayerVideo, setMiniPlayerVideo] = useState<Video | null>(null);
  const [selectedVideoDetails, setSelectedVideoDetails] = useState<Video | null>(null);
  const [userVideos, setUserVideos] = useState<Video[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>({});
  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userAvatar, setUserAvatar] = useState(user?.avatar || user?.displayName?.slice(0, 2).toUpperCase() || 'UQ');
  const [userDisplayName, setUserDisplayName] = useState(user?.displayName || 'Your Profile');
  const [userBio, setUserBio] = useState(user?.bio || '');
  const [followedCreators, setFollowedCreators] = useState<Set<string>>(new Set(['animezone', 'musicworld', 'comedyclub', 'gamerpro', 'foodiechannel', 'djmaster', 'viralcontent']));
  const [videoComments, setVideoComments] = useState<Record<string, Array<Comment>>>({});
  const [reactedVideos, setReactedVideos] = useState<Set<string>>(new Set());
  const [watchHistory, setWatchHistory] = useState<Array<{ videoId: string; timestamp: number; lastWatchedAt: Date }>>([
    // Demo watch history data
    { videoId: '1', timestamp: 300, lastWatchedAt: new Date('2025-11-14T10:30:00') },
    { videoId: '3', timestamp: 1200, lastWatchedAt: new Date('2025-11-14T09:15:00') },
    { videoId: '5', timestamp: 450, lastWatchedAt: new Date('2025-11-13T16:20:00') },
    { videoId: '9', timestamp: 600, lastWatchedAt: new Date('2025-11-13T14:45:00') },
    { videoId: '2', timestamp: 800, lastWatchedAt: new Date('2025-11-12T11:30:00') },
    { videoId: '4', timestamp: 1000, lastWatchedAt: new Date('2025-11-12T08:00:00') },
  ]);
  const progressUpdateTimeoutRef = useRef<NodeJS.Timeout>();
  const screenContainerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Update user data when authentication state changes
  useEffect(() => {
    if (user) {
      setUserAvatar(user.avatar || user.displayName?.slice(0, 2).toUpperCase() || 'U');
      setUserDisplayName(user.displayName || user.username || 'User');
      setUserBio(user.bio || '');
      
      // No backend - just use empty user videos
      setUserVideos([]);
    } else {
      // Clear user videos when logged out
      setUserVideos([]);
    }
  }, [user]);

  // Save current scroll position before navigating
  const saveScrollPosition = useCallback(() => {
    setNavigationStack(prev => {
      if (prev.length === 0) return prev;
      
      const currentEntry = prev[prev.length - 1];
      const wrapper = screenContainerRefs.current[currentEntry.screen];
      
      if (!wrapper) return prev;
      
      // Find the first scrollable child
      const scrollable = wrapper.querySelector('[class*="overflow-y-auto"], [class*="overflow-auto"]') as HTMLElement;
      const scrollTop = scrollable?.scrollTop || 0;
      
      const newStack = [...prev];
      newStack[newStack.length - 1] = {
        ...newStack[newStack.length - 1],
        scrollPosition: scrollTop
      };
      
      return newStack;
    });
  }, []);

  // Navigation functions
  const navigateTo = useCallback((screen: Screen, data?: NavigationStackEntry['data']) => {
    saveScrollPosition();
    setNavigationStack(prev => [...prev, { screen, data }]);
    // Clear search query when leaving search screen
    if (screen !== 'search') {
      setSearchQuery('');
    }
    // Close any open video details when navigating
    setSelectedVideoDetails(null);
  }, [saveScrollPosition]);

  const navigateBack = useCallback(() => {
    saveScrollPosition();
    setNavigationStack(prev => {
      if (prev.length > 1) {
        const newStack = prev.slice(0, -1);
        // Clear search query when leaving search screen
        if (prev[prev.length - 1].screen === 'search') {
          setSearchQuery('');
        }
        return newStack;
      }
      return prev;
    });
    // Close any open video details when navigating back
    setSelectedVideoDetails(null);
  }, [saveScrollPosition]);

  const navigateHome = useCallback(async () => {
    // Prevent redundant refresh if already refreshing
    if (isRefreshing) {
      console.log('⏳ Already refreshing, skipping...');
      return;
    }

    const wasOnHome = currentScreen === 'home';
    
    saveScrollPosition();
    setNavigationStack([{ screen: 'home' }]);
    setSearchQuery('');
    // Close any open video details when navigating home
    setSelectedVideoDetails(null);
    
    // Refresh feed and scroll to top
    console.log('🔄 Refreshing feed...');
    await refreshAll();
    
    // Scroll to top after refresh
    if (wasOnHome || !wasOnHome) {
      setTimeout(() => {
        const wrapper = screenContainerRefs.current['home'];
        if (wrapper) {
          const scrollable = wrapper.querySelector('[class*=\"overflow-y-auto\"], [class*=\"overflow-auto\"]') as HTMLElement;
          if (scrollable) {
            scrollable.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      }, 100);
    }
  }, [saveScrollPosition, refreshAll, isRefreshing, currentScreen]);

  const canGoBack = navigationStack.length > 1;

  /**
   * Navigation Stack Behavior:
   * - navigateTo(screen, data): Push new screen to stack
   * - navigateBack(): Pop current screen, return to previous
   * - navigateHome(): Clear stack, return to home
   * - ESC key: Go back (except in video/shorts)
   * - Browser back button: Go back in stack
   * - Logo click: Return to home (clears stack)
   * - Back arrow: Navigate to previous screen in stack
   * 
   * Scroll Restoration:
   * - Scroll positions are saved in the navigation stack
   * - When navigating back, scroll position is restored
   * - Works by finding scrollable elements (overflow-y-auto/overflow-auto)
   */

  // Restore scroll position when navigating back
  useEffect(() => {
    const currentEntry = navigationStack[navigationStack.length - 1];
    if (currentEntry?.scrollPosition !== undefined) {
      // Use multiple requestAnimationFrame and a small timeout to ensure animations complete
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            const wrapper = screenContainerRefs.current[currentEntry.screen];
            if (wrapper) {
              // Find the first scrollable child (with overflow-y-auto or overflow-auto)
              const scrollable = wrapper.querySelector('[class*="overflow-y-auto"], [class*="overflow-auto"]') as HTMLElement;
              if (scrollable) {
                scrollable.scrollTop = currentEntry.scrollPosition;
              }
            }
          }, 50); // Small delay to ensure content is rendered
        });
      });
    }
  }, [currentScreen]);

  // Apply theme class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle keyboard navigation (ESC to go back)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canGoBack) {
        // Don't navigate back if we're in fullscreen video
        if (currentScreen !== 'video') {
          navigateBack();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGoBack, currentScreen, navigateBack]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      if (canGoBack) {
        navigateBack();
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Push initial state
    window.history.pushState(null, '', window.location.href);

    return () => window.removeEventListener('popstate', handlePopState);
  }, [canGoBack, navigateBack]);

  const handleCollapseVideo = (video: Video, currentTime?: number) => {
    if (currentTime !== undefined) {
      setVideoProgress({ ...videoProgress, [video.id]: currentTime });
    }
    setMiniPlayerVideo(video);
    navigateHome();
  };

  const handleExpandMiniPlayer = () => {
    if (miniPlayerVideo) {
      navigateTo('video', { video: miniPlayerVideo });
      setMiniPlayerVideo(null);
    }
  };

  const handleVideoClick = (video: Video) => {
    navigateTo('video', { video });
  };

  const handleUploadVideo = async (video: Video, videoFile?: File, thumbnailFile?: File): Promise<void> => {
    // Mock upload - just add video to local state
    console.log('🎬 [APP] Mock upload (no backend):', video.title);
    
    // If no video file, just add the video object
    setUserVideos([video, ...userVideos]);
    
    const { toast } = await import('sonner@2.0.3');
    toast.success('Video added (mock - no backend)');
  };

  const handleDeleteVideo = (videoId: string) => {
    setUserVideos(userVideos.filter(v => v.id !== videoId));
  };

  const handleCreatorClick = (creatorId: string) => {
    navigateTo('creator', { creatorId });
  };

  const handleProgressUpdate = useCallback((videoId: string, time: number) => {
    // Debounce progress updates to avoid excessive re-renders
    if (progressUpdateTimeoutRef.current) {
      clearTimeout(progressUpdateTimeoutRef.current);
    }
    progressUpdateTimeoutRef.current = setTimeout(() => {
      setVideoProgress(prev => ({ ...prev, [videoId]: time }));
    }, 500);
  }, []);

  const handleNextVideo = useCallback(() => {
    if (!miniPlayerVideo) return;
    
    // Import mockVideos to get next video
    import('./data/mockData').then(({ mockVideos }) => {
      const longVideos = mockVideos.filter(v => v.category === 'long');
      const currentIndex = longVideos.findIndex(v => v.id === miniPlayerVideo.id);
      const nextVideo = longVideos[(currentIndex + 1) % longVideos.length];
      setMiniPlayerVideo(nextVideo);
    });
  }, [miniPlayerVideo]);

  const handleFollowCreator = async (creatorId: string) => {
    // Optimistic update
    setFollowedCreators(prev => {
      const newSet = new Set(prev);
      if (newSet.has(creatorId)) {
        newSet.delete(creatorId);
      } else {
        newSet.add(creatorId);
      }
      return newSet;
    });

    // Follow is already toggled via optimistic update
  };

  const handleAddComment = useCallback(async (videoId: string, text: string, parentId?: string) => {
    const tempId = Date.now().toString();
    const newComment: Comment = {
      id: tempId,
      videoId,
      userId: user?.id || 'user_account',
      user: userDisplayName,
      avatar: user?.avatar || '#FF6B9D',
      text,
      time: 'just now',
      createdAt: new Date().toISOString(),
      parentId,
    };
    
    // Optimistic update
    setVideoComments(prev => {
      const existingComments = prev[videoId] || [];
      
      if (parentId) {
        // If it's a reply, add it to the parent's replies array
        const addReplyToComment = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [newComment, ...(comment.replies || [])]
              };
            } else if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: addReplyToComment(comment.replies)
              };
            }
            return comment;
          });
        };
        
        return {
          ...prev,
          [videoId]: addReplyToComment(existingComments)
        };
      } else {
        // If it's a top-level comment, add to the beginning
        return {
          ...prev,
          [videoId]: [newComment, ...existingComments]
        };
      }
    });
  }, [userDisplayName, user]);

  const handleReactToVideo = useCallback(async (videoId: string) => {
    // Optimistic update
    setReactedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  }, []);

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex flex-col">
      {/* Navigation Stack Depth Indicator (Development) */}
      {process.env.NODE_ENV === 'development' && navigationStack.length > 1 && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
          <div className="bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
            Stack: {navigationStack.length} | {navigationStack.map(s => s.screen).join(' → ')}
          </div>
        </div>
      )}
      
      {/* Header */}
      <AnimatePresence>
        {currentScreen !== 'video' && currentScreen !== 'creator' && currentScreen !== 'home' && currentScreen !== 'leaderboard' && (
          <motion.header 
            className="shrink-0 flex items-center justify-between px-4 py-3 backdrop-blur-ios bg-background/80 z-20"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Left Side */}
            <div className="flex items-center gap-3">
              <AnimatePresence>
                {canGoBack && currentScreen !== 'home' && (
                  <motion.button
                    onClick={navigateBack}
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-smooth active:scale-95 shadow-ios-sm"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </motion.button>
                )}
              </AnimatePresence>
              {currentScreen !== 'profile' && currentScreen !== 'search' && (
                <motion.img 
                  src={logoImage} 
                  alt="Dorphin" 
                  className="w-10 h-10 rounded-full shadow-ios-sm cursor-pointer" 
                  onClick={navigateHome}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
            </div>

            {/* Search Bar (visible on home screen) */}
            {currentScreen === 'home' && (
              <motion.div
                className="flex-1 max-w-xl mx-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
              >
                <div className="bg-muted backdrop-blur-ios-light rounded-full px-4 py-2.5 flex items-center gap-2 shadow-ios-sm">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <span 
                    className="text-muted-foreground flex-1 cursor-pointer"
                    onClick={() => navigateTo('search')}
                  >
                    {isVoiceSearchActive ? 'Listening...' : 'Search...'}
                  </span>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsVoiceSearchActive(!isVoiceSearchActive);
                      setTimeout(() => setIsVoiceSearchActive(false), 2000);
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      isVoiceSearchActive 
                        ? 'bg-red-500/20 text-red-500' 
                        : 'hover:bg-accent'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Mic className={`w-4 h-4 ${isVoiceSearchActive ? 'animate-pulse' : ''}`} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Search Screen - Full Search Bar */}
            {currentScreen === 'search' && (
              <motion.div
                className="flex-1 mx-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
              >
                <div className="bg-muted backdrop-blur-ios-light rounded-full px-4 py-2.5 flex items-center gap-2 shadow-ios-sm relative">
                  <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    autoFocus
                  />
                  {searchQuery && (
                    <motion.button
                      onClick={() => setSearchQuery('')}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-accent transition-all shrink-0"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Right Icons - Profile Button */}
            {currentScreen !== 'profile' && currentScreen !== 'search' && (
              <div className="flex items-center gap-3">
                <motion.button
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-ios text-sm"
                  onClick={() => navigateTo('profile')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {userAvatar}
                </motion.button>
              </div>
            )}
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative bg-background">
        <AnimatePresence mode="wait">
          {currentScreen === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                opacity: { duration: 0.2 }
              }}
              className="h-full bg-background"
              ref={(el) => { screenContainerRefs.current['home'] = el; }}
            >
              <HomeScreen 
                onVideoClick={handleVideoClick}
                onCreatorClick={handleCreatorClick}
                followedCreators={followedCreators}
                onFollowCreator={handleFollowCreator}
                onProfileClick={() => navigateTo('profile')}
                onLeaderboardClick={() => navigateTo('leaderboard')}
                onSearchClick={() => navigateTo('search')}
                onShowAuthScreen={() => setShowAuthScreen(true)}
                onLogoClick={navigateHome}
                currentUserId="user_account"
                reactedVideos={reactedVideos}
                onReact={handleReactToVideo}
                comments={videoComments}
                onAddComment={handleAddComment}
                userAvatar={userAvatar}
                userVideos={userVideos}
                watchHistory={watchHistory}
              />
            </motion.div>
          )}

          {currentScreen === 'video' && currentData?.video && (
            <motion.div
              key={`video-${currentData.video.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="h-full bg-background"
            >
              <FullScreenVideoPlayer
                key={currentData.video.id}
                video={currentData.video}
                initialTime={videoProgress[currentData.video.id]}
                onClose={navigateBack}
                onCollapse={handleCollapseVideo}
                onMenuClick={setSelectedVideoDetails}
                onVideoClick={handleVideoClick}
                followedCreators={followedCreators}
                onFollowCreator={handleFollowCreator}
                currentUserId="user_account"
                comments={videoComments[currentData.video.id] || []}
                onAddComment={(text, parentId) => handleAddComment(currentData.video.id, text, parentId)}
                hasReacted={reactedVideos.has(currentData.video.id)}
                onReact={() => handleReactToVideo(currentData.video.id)}
              />
            </motion.div>
          )}

          {currentScreen === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                opacity: { duration: 0.2 }
              }}
              className="h-full bg-background"
              ref={(el) => { screenContainerRefs.current['search'] = el; }}
            >
              <SearchScreen 
                onVideoClick={handleVideoClick} 
                onBack={navigateBack}
                searchQuery={searchQuery}
              />
            </motion.div>
          )}

          {currentScreen === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                opacity: { duration: 0.2 }
              }}
              className="h-full bg-background"
              ref={(el) => { screenContainerRefs.current['profile'] = el; }}
            >
              <ProfileScreen
                userVideos={userVideos}
                onUpload={handleUploadVideo}
                onDelete={handleDeleteVideo}
                onVideoClick={handleVideoClick}
                isDarkMode={isDarkMode}
                onThemeToggle={() => setIsDarkMode(!isDarkMode)}
                userAvatar={userAvatar}
                onAvatarChange={setUserAvatar}
                userDisplayName={userDisplayName}
                onDisplayNameChange={setUserDisplayName}
                userBio={userBio}
                onBioChange={setUserBio}
              />
            </motion.div>
          )}

          {currentScreen === 'creator' && currentData?.creatorId && (
            <motion.div
              key={`creator-${currentData.creatorId}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                opacity: { duration: 0.2 }
              }}
              className="h-full bg-background"
              ref={(el) => { screenContainerRefs.current['creator'] = el; }}
            >
              <CreatorProfileScreen
                creatorId={currentData.creatorId}
                onBack={navigateBack}
                onVideoClick={handleVideoClick}
                followedCreators={followedCreators}
                onFollowCreator={handleFollowCreator}
              />
            </motion.div>
          )}

          {currentScreen === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                opacity: { duration: 0.2 }
              }}
              className="h-full bg-background"
              ref={(el) => { screenContainerRefs.current['leaderboard'] = el; }}
            >
              <LeaderboardScreen
                onBack={navigateBack}
                onCreatorClick={handleCreatorClick}
                onVideoClick={handleVideoClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mini Player */}
      <AnimatePresence>
        {miniPlayerVideo && currentScreen !== 'video' && (
          <MiniPlayer
            video={miniPlayerVideo}
            initialTime={videoProgress[miniPlayerVideo.id] || 0}
            onClose={() => setMiniPlayerVideo(null)}
            onExpand={handleExpandMiniPlayer}
            onProgressUpdate={(time) => handleProgressUpdate(miniPlayerVideo.id, time)}
            onNext={handleNextVideo}
          />
        )}
      </AnimatePresence>

      {/* Video Details Dialog */}
      <VideoDetailsDialog
        video={selectedVideoDetails}
        onClose={() => setSelectedVideoDetails(null)}
        followedCreators={followedCreators}
        onFollowCreator={handleFollowCreator}
        currentUserId="user_account"
      />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}