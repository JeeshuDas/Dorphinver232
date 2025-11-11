import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Video } from '../types';
import { mockVideos } from '../data/mockData';

interface DataContextType {
  videos: Video[];
  shorts: Video[];
  isLoading: boolean;
  error: string | null;
  refetchVideos: () => Promise<void>;
  refetchShorts: () => Promise<void>;
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
  const [videos, setVideos] = useState<Video[]>(mockVideos.filter(v => v.category === 'long'));
  const [shorts, setShorts] = useState<Video[]>(mockVideos.filter(v => v.category === 'short'));
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  // Mock fetch videos
  const fetchVideos = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    setVideos(mockVideos.filter(v => v.category === 'long'));
  };

  // Mock fetch shorts
  const fetchShorts = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    setShorts(mockVideos.filter(v => v.category === 'short'));
  };

  // Mock like a video
  const likeVideo = async (videoId: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setVideos(prev => prev.map(v => 
      v.id === videoId ? { ...v, likes: v.likes + 1 } : v
    ));
    setShorts(prev => prev.map(v => 
      v.id === videoId ? { ...v, likes: v.likes + 1 } : v
    ));
  };

  // Mock follow a user
  const followUser = async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setFollowedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  // Check if following a user
  const isFollowing = (userId: string) => {
    return followedUsers.has(userId);
  };

  const value = {
    videos,
    shorts,
    isLoading,
    error,
    refetchVideos: fetchVideos,
    refetchShorts: fetchShorts,
    likeVideo,
    followUser,
    isFollowing,
    followedUsers,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
