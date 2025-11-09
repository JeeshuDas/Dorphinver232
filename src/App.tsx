import { useState, useEffect, useCallback, useRef } from 'react';
import { Video } from './types';
import { HomeScreen } from './components/HomeScreen';
import { ShortsScreen } from './components/ShortsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { SearchScreen } from './components/SearchScreen';
import { CreatorProfileScreen } from './components/CreatorProfileScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { MiniPlayer } from './components/MiniPlayer';
import { FullScreenVideoPlayer } from './components/FullScreenVideoPlayer';
import { VideoDetailsDialog } from './components/VideoDetailsDialog';
import { Search, Mic, ArrowLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import logoImage from 'figma:asset/88f9fb54f06bdddc900357dfa9aed256720e2d56.png';

type Screen = 'home' | 'shorts' | 'search' | 'profile' | 'video' | 'creator' | 'leaderboard';

interface NavigationStackEntry {
  screen: Screen;
  data?: {
    creatorId?: string;
    video?: Video;
    shortsCategoryId?: string;
    shortsStartIndex?: number;
  };
}

export default function App() {
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
  const [userAvatar, setUserAvatar] = useState('UQ');
  const [followedCreators, setFollowedCreators] = useState<Set<string>>(new Set(['animezone', 'musicworld', 'comedyclub', 'gamerpro', 'foodiechannel', 'djmaster', 'viralcontent']));
  const [showShorts, setShowShorts] = useState(true);
  const [shortsLimit, setShortsLimit] = useState(7);
  const progressUpdateTimeoutRef = useRef<NodeJS.Timeout>();

  // Navigation functions
  const navigateTo = useCallback((screen: Screen, data?: NavigationStackEntry['data']) => {
    setNavigationStack(prev => [...prev, { screen, data }]);
    // Clear search query when leaving search screen
    if (screen !== 'search') {
      setSearchQuery('');
    }
  }, []);

  const navigateBack = useCallback(() => {
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
  }, []);

  const navigateHome = useCallback(() => {
    setNavigationStack([{ screen: 'home' }]);
    setSearchQuery('');
  }, []);

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
   */

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
        // Don't navigate back if we're in fullscreen video or shorts
        if (currentScreen !== 'video' && currentScreen !== 'shorts') {
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
      if (miniPlayerVideo.category === 'short') {
        // Find the index for the short video
        import('./data/mockData').then(({ shortsVideos }) => {
          const userShorts = userVideos.filter(v => v.category === 'short');
          const userIndex = userShorts.findIndex(v => v.id === miniPlayerVideo.id);
          
          let startIndex = 0;
          if (userIndex >= 0) {
            startIndex = userIndex;
          } else {
            const mockIndex = shortsVideos.findIndex(v => v.id === miniPlayerVideo.id);
            startIndex = mockIndex >= 0 ? userShorts.length + mockIndex : 0;
          }
          
          navigateTo('shorts', { shortsStartIndex: startIndex });
        });
      } else {
        navigateTo('video', { video: miniPlayerVideo });
      }
      setMiniPlayerVideo(null);
    }
  };

  const handleVideoClick = (video: Video) => {
    if (video.category === 'long') {
      navigateTo('video', { video });
    } else if (video.category === 'short') {
      // Find the index of this short in the shorts list
      import('./data/mockData').then(({ shortsVideos }) => {
        // First check user videos for shorts
        const userShorts = userVideos.filter(v => v.category === 'short');
        const userIndex = userShorts.findIndex(v => v.id === video.id);
        
        let startIndex = 0;
        if (userIndex >= 0) {
          // Found in user videos
          startIndex = userIndex;
        } else {
          // Check mock shorts
          const mockIndex = shortsVideos.findIndex(v => v.id === video.id);
          startIndex = mockIndex >= 0 ? userShorts.length + mockIndex : 0;
        }
        
        navigateTo('shorts', { shortsStartIndex: startIndex });
      });
    }
  };

  const handleShortClick = (categoryId: string, startIndex: number) => {
    navigateTo('shorts', { shortsCategoryId: categoryId, shortsStartIndex: startIndex });
  };

  const handleUploadVideo = (video: Video) => {
    setUserVideos([video, ...userVideos]);
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
    import('./data/mockData').then(({ mockVideos, shortsVideos }) => {
      if (miniPlayerVideo.category === 'short') {
        const currentIndex = shortsVideos.findIndex(v => v.id === miniPlayerVideo.id);
        const nextVideo = shortsVideos[(currentIndex + 1) % shortsVideos.length];
        setMiniPlayerVideo(nextVideo);
      } else {
        const longVideos = mockVideos.filter(v => v.category === 'long');
        const currentIndex = longVideos.findIndex(v => v.id === miniPlayerVideo.id);
        const nextVideo = longVideos[(currentIndex + 1) % longVideos.length];
        setMiniPlayerVideo(nextVideo);
      }
    });
  }, [miniPlayerVideo]);

  const handleFollowCreator = (creatorId: string) => {
    setFollowedCreators(prev => {
      const newSet = new Set(prev);
      if (newSet.has(creatorId)) {
        newSet.delete(creatorId);
      } else {
        newSet.add(creatorId);
      }
      return newSet;
    });
  };

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
        {currentScreen !== 'shorts' && currentScreen !== 'video' && currentScreen !== 'creator' && currentScreen !== 'home' && currentScreen !== 'leaderboard' && (
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

            {/* Right Icons */}
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
            >
              <HomeScreen 
                onVideoClick={handleVideoClick}
                onShortClick={handleShortClick}
                onCreatorClick={handleCreatorClick}
                followedCreators={followedCreators}
                onProfileClick={() => navigateTo('profile')}
                onLeaderboardClick={() => navigateTo('leaderboard')}
                onSearchClick={() => navigateTo('search')}
                showShorts={showShorts}
                shortsLimit={shortsLimit}
              />
            </motion.div>
          )}

          {currentScreen === 'shorts' && (
            <motion.div
              key="shorts"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                opacity: { duration: 0.2 }
              }}
              className="h-full bg-background"
            >
              <ShortsScreen 
                onCollapse={handleCollapseVideo}
                onMenuClick={setSelectedVideoDetails}
                onClose={navigateBack}
                categoryId={currentData?.shortsCategoryId}
                startIndex={currentData?.shortsStartIndex || 0}
                followedCreators={followedCreators}
                onFollowCreator={handleFollowCreator}
                userVideos={userVideos}
              />
            </motion.div>
          )}

          {currentScreen === 'video' && currentData?.video && (
            <motion.div
              key="video"
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
                video={currentData.video}
                initialTime={videoProgress[currentData.video.id]}
                onClose={navigateBack}
                onCollapse={handleCollapseVideo}
                onMenuClick={setSelectedVideoDetails}
                onVideoClick={handleVideoClick}
                followedCreators={followedCreators}
                onFollowCreator={handleFollowCreator}
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
                showShorts={showShorts}
                onShowShortsToggle={setShowShorts}
                shortsLimit={shortsLimit}
                onShortsLimitChange={setShortsLimit}
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
            >
              <LeaderboardScreen
                onBack={navigateBack}
                onCreatorClick={handleCreatorClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mini Player */}
      <AnimatePresence>
        {miniPlayerVideo && currentScreen !== 'shorts' && currentScreen !== 'video' && (
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
      />
    </div>
  );
}
