import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Video } from '../types';
import { mockVideos } from '../data/mockData';
import { videoApi, userApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface DataContextType {
  videos: Video[];
  shorts: Video[];
  isLoading: boolean;
  isRefreshing: boolean;
  isSearching: boolean;
  searchResults: Video[];
  error: string | null;
  refetchVideos: () => Promise<void>;
  refetchShorts: () => Promise<void>;
  refreshAll: () => Promise<void>;
  searchVideos: (query: string) => Promise<void>;
  clearSearch: () => void;
  likeVideo: (videoId: string) => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  followedUsers: Set<string>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [videos, setVideos] = useState<Video[]>(mockVideos.filter(v => v.category === 'long'));
  const [shorts, setShorts] = useState<Video[]>(mockVideos.filter(v => v.category === 'short'));
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Video[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  // Fetch videos from backend
  const fetchVideos = async (showLoading: boolean = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const data = await videoApi.getFeed('long', 50, 0);
      if (data.videos && data.videos.length > 0) {
        setVideos(data.videos);
      } else {
        // Fallback to mock data if no backend videos
        setVideos(mockVideos.filter(v => v.category === 'long'));
      }
    } catch (err: any) {
      console.error('Error fetching videos:', err);
      setError(err.message);
      // Fallback to mock data on error
      setVideos(mockVideos.filter(v => v.category === 'long'));
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Fetch shorts from backend
  const fetchShorts = async (showLoading: boolean = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const data = await videoApi.getFeed('short', 50, 0);
      if (data.videos && data.videos.length > 0) {
        setShorts(data.videos);
      } else {
        // Fallback to mock data if no backend shorts
        setShorts(mockVideos.filter(v => v.category === 'short'));
      }
    } catch (err: any) {
      console.error('Error fetching shorts:', err);
      setError(err.message);
      // Fallback to mock data on error
      setShorts(mockVideos.filter(v => v.category === 'short'));
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Refresh all data
  const refreshAll = async () => {
    setIsRefreshing(true);
    await fetchVideos(false);
    await fetchShorts(false);
    setIsRefreshing(false);
  };

  // Initial data fetch
  useEffect(() => {
    fetchVideos();
    fetchShorts();
  }, []);

  // Search videos
  const searchVideos = async (query: string) => {
    if (query.trim() === '') {
      clearSearch();
      return;
    }

    setIsSearching(true);
    setError(null);
    try {
      const data = await videoApi.searchVideos(query);
      if (data.videos && data.videos.length > 0) {
        setSearchResults(data.videos);
      } else {
        setSearchResults([]);
      }
    } catch (err: any) {
      console.error('Error searching videos:', err);
      setError(err.message);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search results
  const clearSearch = () => {
    setSearchResults([]);
  };

  // Like a video
  const likeVideo = async (videoId: string) => {
    if (!isAuthenticated) {
      console.warn('Must be authenticated to like videos');
      return;
    }

    try {
      const result = await videoApi.likeVideo(videoId);
      
      // Update local state optimistically
      setVideos(prev => prev.map(v => 
        v.id === videoId ? { ...v, likes: result.likes } : v
      ));
      setShorts(prev => prev.map(v => 
        v.id === videoId ? { ...v, likes: result.likes } : v
      ));
    } catch (err: any) {
      console.error('Error liking video:', err);
      setError(err.message);
    }
  };

  // Follow a user
  const followUser = async (userId: string) => {
    if (!isAuthenticated) {
      console.warn('Must be authenticated to follow users');
      return;
    }

    try {
      await userApi.followUser(userId);
      
      setFollowedUsers(prev => {
        const newSet = new Set(prev);
        if (newSet.has(userId)) {
          newSet.delete(userId);
        } else {
          newSet.add(userId);
        }
        return newSet;
      });
    } catch (err: any) {
      console.error('Error following user:', err);
      setError(err.message);
    }
  };

  // Check if following a user
  const isFollowing = (userId: string) => {
    return followedUsers.has(userId);
  };

  const value = {
    videos,
    shorts,
    isLoading,
    isRefreshing,
    isSearching,
    searchResults,
    error,
    refetchVideos: fetchVideos,
    refetchShorts: fetchShorts,
    refreshAll,
    searchVideos,
    clearSearch,
    likeVideo,
    followUser,
    isFollowing,
    followedUsers,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};