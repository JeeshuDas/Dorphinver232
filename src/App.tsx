import { useState, useEffect, useCallback, useRef } from 'react';
import { Video } from './types';
import { HomeScreen } from './components/HomeScreen';
import { ShortsScreen } from './components/ShortsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { SearchScreen } from './components/SearchScreen';
import { CreatorProfileScreen } from './components/CreatorProfileScreen';
import { MiniPlayer } from './components/MiniPlayer';
import { FullScreenVideoPlayer } from './components/FullScreenVideoPlayer';
import { VideoDetailsDialog } from './components/VideoDetailsDialog';
import { Search, Mic, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import logoImage from 'figma:asset/88f9fb54f06bdddc900357dfa9aed256720e2d56.png';

type Screen = 'home' | 'shorts' | 'search' | 'profile' | 'video' | 'creator';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [miniPlayerVideo, setMiniPlayerVideo] = useState<Video | null>(null);
  const [fullScreenVideo, setFullScreenVideo] = useState<Video | null>(null);
  const [shortsStartIndex, setShortsStartIndex] = useState(0);
  const [shortsCategoryId, setShortsCategoryId] = useState<string | undefined>(undefined);
  const [selectedVideoDetails, setSelectedVideoDetails] = useState<Video | null>(null);
  const [userVideos, setUserVideos] = useState<Video[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>({});
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);
  const [userAvatar, setUserAvatar] = useState('UQ');
  const [followedCreators, setFollowedCreators] = useState<Set<string>>(new Set(['creator-1', 'creator-2', 'creator-3', 'creator-4', 'creator-5']));
  const [showShorts, setShowShorts] = useState(true);
  const [shortsLimit, setShortsLimit] = useState(7);
  const progressUpdateTimeoutRef = useRef<NodeJS.Timeout>();

  // Apply theme class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleCollapseVideo = (video: Video, currentTime?: number) => {
    if (currentTime !== undefined) {
      setVideoProgress({ ...videoProgress, [video.id]: currentTime });
    }
    setMiniPlayerVideo(video);
    setCurrentScreen('home');
    setFullScreenVideo(null);
  };

  const handleExpandMiniPlayer = () => {
    if (miniPlayerVideo) {
      if (miniPlayerVideo.category === 'short') {
        setCurrentScreen('shorts');
      } else {
        setFullScreenVideo(miniPlayerVideo);
        setCurrentScreen('video');
      }
      setMiniPlayerVideo(null);
    }
  };

  const handleVideoClick = (video: Video) => {
    if (video.category === 'long') {
      setFullScreenVideo(video);
      setCurrentScreen('video');
    } else if (video.category === 'short') {
      // Find the index of this short in the shorts list
      import('./data/mockData').then(({ shortsVideos }) => {
        const index = shortsVideos.findIndex(v => v.id === video.id);
        setShortsStartIndex(index >= 0 ? index : 0);
        setShortsCategoryId(undefined); // No specific category, show all shorts
        setCurrentScreen('shorts');
      });
    }
  };

  const handleShortClick = (categoryId: string, startIndex: number) => {
    setShortsCategoryId(categoryId);
    setShortsStartIndex(startIndex);
    setCurrentScreen('shorts');
  };

  const handleUploadVideo = (video: Video) => {
    setUserVideos([video, ...userVideos]);
  };

  const handleDeleteVideo = (videoId: string) => {
    setUserVideos(userVideos.filter(v => v.id !== videoId));
  };

  const handleCreatorClick = (creatorId: string) => {
    setSelectedCreatorId(creatorId);
    setCurrentScreen('creator');
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
      {/* Header */}
      <AnimatePresence>
        {currentScreen !== 'shorts' && currentScreen !== 'video' && currentScreen !== 'creator' && currentScreen !== 'home' && (
          <motion.header 
            className="shrink-0 flex items-center justify-between px-4 py-3 backdrop-blur-ios bg-background/80 z-10"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Left Side */}
            <div className="flex items-center gap-3">
              <AnimatePresence>
                {(currentScreen === 'search' || currentScreen === 'profile') && (
                  <motion.button
                    onClick={() => setCurrentScreen('home')}
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
              {currentScreen !== 'profile' && (
                <motion.img 
                  src={logoImage} 
                  alt="Dorphin" 
                  className="w-10 h-10 rounded-full shadow-ios-sm" 
                  whileHover={{ scale: 1.05 }}
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
                    onClick={() => setCurrentScreen('search')}
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

            {/* Screen Titles */}
            {currentScreen === 'search' && (
              <motion.h2 
                className="flex-1 mx-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                Search
              </motion.h2>
            )}

            {/* Right Icons */}
            {currentScreen !== 'profile' && (
              <div className="flex items-center gap-3">
                <motion.button
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-ios text-sm"
                  onClick={() => setCurrentScreen('profile')}
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
                onProfileClick={() => setCurrentScreen('profile')}
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
                onClose={() => setCurrentScreen('home')}
                categoryId={shortsCategoryId}
                startIndex={shortsStartIndex}
                followedCreators={followedCreators}
                onFollowCreator={handleFollowCreator}
              />
            </motion.div>
          )}

          {currentScreen === 'video' && fullScreenVideo && (
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
                video={fullScreenVideo}
                initialTime={videoProgress[fullScreenVideo.id]}
                onClose={() => {
                  setFullScreenVideo(null);
                  setCurrentScreen('home');
                }}
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
              <SearchScreen onVideoClick={handleVideoClick} />
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

          {currentScreen === 'creator' && selectedCreatorId && (
            <motion.div
              key={`creator-${selectedCreatorId}`}
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
                creatorId={selectedCreatorId}
                onBack={() => {
                  setSelectedCreatorId(null);
                  setCurrentScreen('home');
                }}
                onVideoClick={handleVideoClick}
                followedCreators={followedCreators}
                onFollowCreator={handleFollowCreator}
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
