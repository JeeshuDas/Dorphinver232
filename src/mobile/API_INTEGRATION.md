# API Integration Guide for Dorphin Mobile

This document provides examples for connecting the Dorphin mobile app to a backend API.

## 📋 Overview

The app currently uses mock data stored in `src/data/mockData.ts`. This guide shows how to replace mock data with real API calls.

---

## 🔧 Setup

### 1. Install Dependencies

```bash
npm install axios
npm install @react-native-async-storage/async-storage
```

### 2. Create API Service

Create `src/services/api.ts`:

```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.dorphin.com';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (logout user)
      await AsyncStorage.removeItem('authToken');
      // Navigate to login screen
    }
    return Promise.reject(error);
  }
);
```

---

## 🎬 Video API Endpoints

### Get All Videos

```typescript
// src/services/videoService.ts
import { api } from './api';
import { Video } from '../types';

export const getVideos = async (
  category?: 'short' | 'long',
  page: number = 1,
  limit: number = 20
): Promise<Video[]> => {
  try {
    const response = await api.get('/videos', {
      params: { category, page, limit }
    });
    return response.data.videos;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};
```

### Get Single Video

```typescript
export const getVideo = async (videoId: string): Promise<Video> => {
  try {
    const response = await api.get(`/videos/${videoId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching video:', error);
    throw error;
  }
};
```

### Upload Video

```typescript
export const uploadVideo = async (videoData: {
  title: string;
  category: 'short' | 'long';
  file: any;
  thumbnail?: any;
}): Promise<Video> => {
  try {
    const formData = new FormData();
    formData.append('title', videoData.title);
    formData.append('category', videoData.category);
    formData.append('video', {
      uri: videoData.file.uri,
      type: 'video/mp4',
      name: 'video.mp4',
    });
    
    if (videoData.thumbnail) {
      formData.append('thumbnail', {
        uri: videoData.thumbnail.uri,
        type: 'image/jpeg',
        name: 'thumbnail.jpg',
      });
    }

    const response = await api.post('/videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
};
```

### Delete Video

```typescript
export const deleteVideo = async (videoId: string): Promise<void> => {
  try {
    await api.delete(`/videos/${videoId}`);
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
};
```

### Like/Unlike Video

```typescript
export const likeVideo = async (videoId: string): Promise<void> => {
  try {
    await api.post(`/videos/${videoId}/like`);
  } catch (error) {
    console.error('Error liking video:', error);
    throw error;
  }
};

export const unlikeVideo = async (videoId: string): Promise<void> => {
  try {
    await api.delete(`/videos/${videoId}/like`);
  } catch (error) {
    console.error('Error unliking video:', error);
    throw error;
  }
};
```

---

## 👤 User API Endpoints

### Authentication

```typescript
// src/services/authService.ts
import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    // Save token
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    return { token, user };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (
  email: string,
  password: string,
  displayName: string
) => {
  try {
    const response = await api.post('/auth/register', {
      email,
      password,
      displayName,
    });
    const { token, user } = response.data;
    
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    return { token, user };
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};
```

### Get User Profile

```typescript
export const getUserProfile = async (userId: string) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};
```

### Update User Profile

```typescript
export const updateUserProfile = async (updates: {
  displayName?: string;
  bio?: string;
  avatar?: any;
}) => {
  try {
    const formData = new FormData();
    
    if (updates.displayName) {
      formData.append('displayName', updates.displayName);
    }
    if (updates.bio) {
      formData.append('bio', updates.bio);
    }
    if (updates.avatar) {
      formData.append('avatar', {
        uri: updates.avatar.uri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      });
    }

    const response = await api.patch('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};
```

---

## 💬 Comments API

```typescript
// src/services/commentService.ts
import { api } from './api';

export const getComments = async (videoId: string) => {
  try {
    const response = await api.get(`/videos/${videoId}/comments`);
    return response.data.comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const addComment = async (videoId: string, text: string) => {
  try {
    const response = await api.post(`/videos/${videoId}/comments`, { text });
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const deleteComment = async (videoId: string, commentId: string) => {
  try {
    await api.delete(`/videos/${videoId}/comments/${commentId}`);
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};
```

---

## 🔔 Follow/Unfollow API

```typescript
// src/services/followService.ts
import { api } from './api';

export const followUser = async (userId: string) => {
  try {
    await api.post(`/users/${userId}/follow`);
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

export const unfollowUser = async (userId: string) => {
  try {
    await api.delete(`/users/${userId}/follow`);
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

export const getFollowers = async (userId: string) => {
  try {
    const response = await api.get(`/users/${userId}/followers`);
    return response.data.followers;
  } catch (error) {
    console.error('Error fetching followers:', error);
    throw error;
  }
};

export const getFollowing = async (userId: string) => {
  try {
    const response = await api.get(`/users/${userId}/following`);
    return response.data.following;
  } catch (error) {
    console.error('Error fetching following:', error);
    throw error;
  }
};
```

---

## 🔍 Search API

```typescript
// src/services/searchService.ts
import { api } from './api';

export const searchVideos = async (query: string) => {
  try {
    const response = await api.get('/search/videos', {
      params: { q: query }
    });
    return response.data.videos;
  } catch (error) {
    console.error('Error searching videos:', error);
    throw error;
  }
};

export const searchUsers = async (query: string) => {
  try {
    const response = await api.get('/search/users', {
      params: { q: query }
    });
    return response.data.users;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};
```

---

## 🏆 Leaderboard API

```typescript
// src/services/leaderboardService.ts
import { api } from './api';

export const getTopCreators = async (limit: number = 10) => {
  try {
    const response = await api.get('/leaderboard/creators', {
      params: { limit }
    });
    return response.data.creators;
  } catch (error) {
    console.error('Error fetching top creators:', error);
    throw error;
  }
};

export const getTrendingVideos = async (limit: number = 10) => {
  try {
    const response = await api.get('/leaderboard/videos', {
      params: { limit }
    });
    return response.data.videos;
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    throw error;
  }
};
```

---

## 🎯 Usage in Components

### HomeScreen with API

```typescript
// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { getVideos } from '../services/videoService';

export default function HomeScreen() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const fetchedVideos = await getVideos('long');
      setVideos(fetchedVideos);
      setError(null);
    } catch (err) {
      setError('Failed to load videos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadVideos} />;
  }

  return (
    <ScrollView>
      {videos.map(video => (
        <VideoCard key={video.id} video={video} />
      ))}
    </ScrollView>
  );
}
```

### Like Button with API

```typescript
// src/components/LikeButton.tsx
import { likeVideo, unlikeVideo } from '../services/videoService';

function LikeButton({ videoId, initialLiked }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    try {
      setLoading(true);
      
      if (liked) {
        await unlikeVideo(videoId);
        setLiked(false);
      } else {
        await likeVideo(videoId);
        setLiked(true);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // Revert state on error
      setLiked(!liked);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity onPress={handleLike} disabled={loading}>
      <Icon 
        name={liked ? 'heart' : 'heart-outline'} 
        color={liked ? COLORS.primary : COLORS.text}
      />
    </TouchableOpacity>
  );
}
```

---

## 📤 File Upload with Progress

```typescript
import axios from 'axios';

export const uploadVideoWithProgress = async (
  videoFile: any,
  onProgress: (progress: number) => void
) => {
  const formData = new FormData();
  formData.append('video', {
    uri: videoFile.uri,
    type: 'video/mp4',
    name: 'video.mp4',
  });

  try {
    const response = await api.post('/videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};
```

---

## 🔄 Real-time Updates with WebSocket

```typescript
// src/services/websocket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectWebSocket = (token: string) => {
  socket = io('wss://api.dorphin.com', {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('WebSocket connected');
  });

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected');
  });

  return socket;
};

export const subscribeToComments = (
  videoId: string,
  callback: (comment: any) => void
) => {
  if (!socket) return;

  socket.emit('join-video', videoId);
  socket.on(`video:${videoId}:comment`, callback);
};

export const unsubscribeFromComments = (videoId: string) => {
  if (!socket) return;

  socket.emit('leave-video', videoId);
  socket.off(`video:${videoId}:comment`);
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

---

## 🔐 Environment Variables

Create `.env` file:

```env
API_BASE_URL=https://api.dorphin.com
WS_URL=wss://api.dorphin.com
SENTRY_DSN=your-sentry-dsn
FIREBASE_API_KEY=your-firebase-key
```

Use in code:

```typescript
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3000';
```

Configure in `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "https://api.dorphin.com",
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

---

## 🧪 Testing API Calls

```typescript
// __tests__/services/videoService.test.ts
import { getVideos } from '../src/services/videoService';
import { api } from '../src/services/api';

jest.mock('../src/services/api');

describe('VideoService', () => {
  it('should fetch videos', async () => {
    const mockVideos = [{ id: '1', title: 'Test Video' }];
    (api.get as jest.Mock).mockResolvedValue({ data: { videos: mockVideos } });

    const videos = await getVideos();
    
    expect(videos).toEqual(mockVideos);
    expect(api.get).toHaveBeenCalledWith('/videos', expect.any(Object));
  });
});
```

---

## 📊 Error Handling Best Practices

```typescript
// src/utils/errorHandler.ts
import { AxiosError } from 'axios';
import { Alert } from 'react-native';

export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error
    const status = error.response.status;
    const message = error.response.data?.message || 'An error occurred';
    
    switch (status) {
      case 400:
        Alert.alert('Invalid Request', message);
        break;
      case 401:
        Alert.alert('Unauthorized', 'Please login again');
        // Navigate to login
        break;
      case 403:
        Alert.alert('Forbidden', 'You don\'t have permission');
        break;
      case 404:
        Alert.alert('Not Found', 'Resource not found');
        break;
      case 500:
        Alert.alert('Server Error', 'Please try again later');
        break;
      default:
        Alert.alert('Error', message);
    }
  } else if (error.request) {
    // No response received
    Alert.alert('Network Error', 'Please check your connection');
  } else {
    // Other errors
    Alert.alert('Error', error.message);
  }
};
```

---

## 🚀 Quick Reference

### GET Request
```typescript
const data = await api.get('/endpoint');
```

### POST Request
```typescript
const data = await api.post('/endpoint', { key: 'value' });
```

### PUT Request
```typescript
const data = await api.put('/endpoint/id', { key: 'value' });
```

### DELETE Request
```typescript
await api.delete('/endpoint/id');
```

### With Query Parameters
```typescript
const data = await api.get('/endpoint', {
  params: { page: 1, limit: 10 }
});
```

### With Headers
```typescript
const data = await api.get('/endpoint', {
  headers: { 'Custom-Header': 'value' }
});
```

---

This guide provides a complete foundation for API integration. Adjust endpoints and data structures to match your backend API specification.
