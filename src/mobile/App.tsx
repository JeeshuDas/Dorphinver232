import React, { useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Video } from './src/types';
import HomeScreen from './src/screens/HomeScreen';
import ShortsScreen from './src/screens/ShortsScreen';
import FullScreenVideoPlayer from './src/screens/FullScreenVideoPlayer';
import ProfileScreen from './src/screens/ProfileScreen';
import CreatorProfileScreen from './src/screens/CreatorProfileScreen';
import SearchScreen from './src/screens/SearchScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import { MiniPlayer } from './src/components/MiniPlayer';

export type RootStackParamList = {
  Home: undefined;
  Shorts: { categoryId?: string; startIndex?: number };
  Video: { video: Video };
  Profile: undefined;
  Creator: { creatorId: string };
  Search: undefined;
  Leaderboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [miniPlayerVideo, setMiniPlayerVideo] = useState<Video | null>(null);
  const [userVideos, setUserVideos] = useState<Video[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>({});
  const [userAvatar, setUserAvatar] = useState('UQ');
  const [userDisplayName, setUserDisplayName] = useState('Your Profile');
  const [userBio, setUserBio] = useState('');
  const [followedCreators, setFollowedCreators] = useState<Set<string>>(
    new Set(['animezone', 'musicworld', 'comedyclub', 'gamerpro', 'foodiechannel', 'djmaster', 'viralcontent'])
  );
  const [showShorts, setShowShorts] = useState(true);
  const [shortsLimit, setShortsLimit] = useState(7);
  const [videoComments, setVideoComments] = useState<Record<string, Array<{
    id: string;
    user: string;
    avatar: string;
    text: string;
    time: string;
  }>>>({});
  const [reactedVideos, setReactedVideos] = useState<Set<string>>(new Set());

  const handleCollapseVideo = useCallback((video: Video, currentTime?: number) => {
    if (currentTime !== undefined) {
      setVideoProgress(prev => ({ ...prev, [video.id]: currentTime }));
    }
    setMiniPlayerVideo(video);
  }, []);

  const handleUploadVideo = useCallback((video: Video) => {
    setUserVideos(prev => [video, ...prev]);
  }, []);

  const handleDeleteVideo = useCallback((videoId: string) => {
    setUserVideos(prev => prev.filter(v => v.id !== videoId));
  }, []);

  const handleFollowCreator = useCallback((creatorId: string) => {
    setFollowedCreators(prev => {
      const newSet = new Set(prev);
      if (newSet.has(creatorId)) {
        newSet.delete(creatorId);
      } else {
        newSet.add(creatorId);
      }
      return newSet;
    });
  }, []);

  const handleAddComment = useCallback((videoId: string, text: string) => {
    const newComment = {
      id: Date.now().toString(),
      user: userDisplayName,
      avatar: '#FF6B9D',
      text,
      time: 'just now'
    };
    
    setVideoComments(prev => ({
      ...prev,
      [videoId]: [newComment, ...(prev[videoId] || [])]
    }));
  }, [userDisplayName]);

  const handleReactToVideo = useCallback((videoId: string) => {
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: isDarkMode ? '#000' : '#fff' }
          }}
        >
          <Stack.Screen name="Home">
            {(props) => (
              <HomeScreen
                {...props}
                userVideos={userVideos}
                followedCreators={followedCreators}
                onFollowCreator={handleFollowCreator}
                showShorts={showShorts}
                shortsLimit={shortsLimit}
                reactedVideos={reactedVideos}
                onReact={handleReactToVideo}
                comments={videoComments}
                onAddComment={handleAddComment}
                userAvatar={userAvatar}
              />
            )}
          </Stack.Screen>
          
          <Stack.Screen name="Shorts">
            {(props) => (
              <ShortsScreen
                {...props}
                userVideos={userVideos}
                followedCreators={followedCreators}
                onFollowCreator={handleFollowCreator}
                reactedVideos={reactedVideos}
                onReact={handleReactToVideo}
                comments={videoComments}
                onAddComment={handleAddComment}
                onCollapse={handleCollapseVideo}
              />
            )}
          </Stack.Screen>
          
          <Stack.Screen name="Video">
            {(props) => (
              <FullScreenVideoPlayer
                {...props}
                followedCreators={followedCreators}
                onFollowCreator={handleFollowCreator}
                comments={videoComments}
                onAddComment={handleAddComment}
                reactedVideos={reactedVideos}
                onReact={handleReactToVideo}
                onCollapse={handleCollapseVideo}
              />
            )}
          </Stack.Screen>
          
          <Stack.Screen name="Profile">
            {(props) => (
              <ProfileScreen
                {...props}
                userVideos={userVideos}
                onUpload={handleUploadVideo}
                onDelete={handleDeleteVideo}
                isDarkMode={isDarkMode}
                onThemeToggle={() => setIsDarkMode(!isDarkMode)}
                userAvatar={userAvatar}
                onAvatarChange={setUserAvatar}
                userDisplayName={userDisplayName}
                onDisplayNameChange={setUserDisplayName}
                userBio={userBio}
                onBioChange={setUserBio}
                showShorts={showShorts}
                onShowShortsToggle={setShowShorts}
                shortsLimit={shortsLimit}
                onShortsLimitChange={setShortsLimit}
              />
            )}
          </Stack.Screen>
          
          <Stack.Screen name="Creator">
            {(props) => (
              <CreatorProfileScreen
                {...props}
                followedCreators={followedCreators}
                onFollowCreator={handleFollowCreator}
              />
            )}
          </Stack.Screen>
          
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        </Stack.Navigator>
        
        {miniPlayerVideo && (
          <MiniPlayer
            video={miniPlayerVideo}
            onClose={() => setMiniPlayerVideo(null)}
            onExpand={(video) => {
              setMiniPlayerVideo(null);
              // Navigate to appropriate screen based on video category
            }}
          />
        )}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
