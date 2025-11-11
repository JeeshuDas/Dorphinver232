# Dorphin Backend - Mobile App Integration Guide

This guide explains how to integrate the Dorphin backend with React Native, Flutter, or any mobile application.

---

## 🎯 Overview

The Dorphin backend provides a REST API that can be consumed by any mobile app. This guide covers:
- Setting up API communication
- Handling authentication
- Uploading videos from mobile
- Managing user sessions
- Best practices for mobile apps

---

## 🔗 API Base URL

Your backend API is accessible at:

```
https://{YOUR_PROJECT_ID}.supabase.co/functions/v1/make-server-148a8522
```

Replace `{YOUR_PROJECT_ID}` with your actual Supabase project ID.

---

## 📱 React Native Integration

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js axios
# or
yarn add @supabase/supabase-js axios
```

### 2. Create API Service

Create `src/services/api.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
const API_BASE = 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-148a8522';

// Create Supabase client with React Native storage
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Get auth token
const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || SUPABASE_ANON_KEY;
};

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAuthToken();
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
};

// Auth API
export const auth = {
  async signUp(email: string, password: string, displayName: string) {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
  },

  async signIn(email: string, password: string) {
    const data = await apiRequest('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Supabase client will handle session storage automatically
    await supabase.auth.setSession({
      access_token: data.accessToken,
      refresh_token: data.refreshToken,
    });
    
    return data;
  },

  async signOut() {
    await apiRequest('/auth/signout', { method: 'POST' });
    await supabase.auth.signOut();
  },

  async getCurrentUser() {
    return apiRequest('/auth/me');
  },
};

// Video API
export const video = {
  async uploadVideo(videoUri: string, thumbnailUri: string, metadata: any) {
    const formData = new FormData();
    
    // Add video file
    formData.append('video', {
      uri: videoUri,
      type: 'video/mp4',
      name: 'video.mp4',
    } as any);
    
    // Add thumbnail file
    if (thumbnailUri) {
      formData.append('thumbnail', {
        uri: thumbnailUri,
        type: 'image/jpeg',
        name: 'thumbnail.jpg',
      } as any);
    }
    
    // Add metadata
    formData.append('title', metadata.title);
    formData.append('description', metadata.description || '');
    formData.append('category', metadata.category);
    formData.append('duration', metadata.duration.toString());
    
    if (metadata.shortCategory) {
      formData.append('shortCategory', metadata.shortCategory);
    }

    return apiRequest('/videos/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async getFeed(category = 'all', limit = 20, offset = 0) {
    return apiRequest(`/videos/feed?category=${category}&limit=${limit}&offset=${offset}`);
  },

  async likeVideo(videoId: string) {
    return apiRequest(`/videos/${videoId}/like`, { method: 'POST' });
  },

  async deleteVideo(videoId: string) {
    return apiRequest(`/videos/${videoId}`, { method: 'DELETE' });
  },
};

// Comment API
export const comment = {
  async addComment(videoId: string, text: string) {
    return apiRequest(`/videos/${videoId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  async getComments(videoId: string, limit = 50, offset = 0) {
    return apiRequest(`/videos/${videoId}/comments?limit=${limit}&offset=${offset}`);
  },
};

// User API
export const user = {
  async followUser(userId: string) {
    return apiRequest(`/users/${userId}/follow`, { method: 'POST' });
  },

  async getUserProfile(userId: string) {
    return apiRequest(`/users/${userId}`);
  },

  async updateProfile(updates: any) {
    return apiRequest('/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

export { supabase };
```

### 3. Create Auth Context

Create `src/contexts/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, supabase } from '../services/api';

interface User {
  id: string;
  email: string;
  displayName: string;
  username: string;
  avatar?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const userData = await auth.getCurrentUser();
          setUser(userData.user);
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          const userData = await auth.getCurrentUser();
          setUser(userData.user);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const data = await auth.signIn(email, password);
    setUser(data.user);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    await auth.signUp(email, password, displayName);
    await signIn(email, password);
  };

  const signOut = async () => {
    await auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 4. Use in Components

```typescript
import React from 'react';
import { View, Button, TextInput } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { video } from '../services/api';

export const HomeScreen = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const data = await video.getFeed('all', 20, 0);
      setVideos(data.videos);
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  };

  const handleLike = async (videoId: string) => {
    try {
      await video.likeVideo(videoId);
      await loadVideos(); // Refresh to show updated likes
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  return (
    <View>
      {isAuthenticated ? (
        <>
          <Text>Welcome, {user?.displayName}!</Text>
          <Button title="Sign Out" onPress={signOut} />
          {/* Render videos */}
        </>
      ) : (
        <Text>Please sign in</Text>
      )}
    </View>
  );
};
```

---

## 🦋 Flutter Integration

### 1. Add Dependencies

In `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  supabase_flutter: ^2.0.0
  http: ^1.1.0
  shared_preferences: ^2.2.0
```

### 2. Create API Service

Create `lib/services/api_service.dart`:

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';

class ApiService {
  static const String baseUrl = 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-148a8522';
  final SupabaseClient supabase;

  ApiService(this.supabase);

  Future<String> _getAuthToken() async {
    final session = supabase.auth.currentSession;
    return session?.accessToken ?? '';
  }

  Future<Map<String, dynamic>> _apiRequest(
    String endpoint,
    String method, {
    Map<String, dynamic>? body,
    bool requiresAuth = false,
  }) async {
    final token = requiresAuth ? await _getAuthToken() : '';
    
    final headers = {
      'Content-Type': 'application/json',
      if (requiresAuth) 'Authorization': 'Bearer $token',
    };

    final uri = Uri.parse('$baseUrl$endpoint');
    http.Response response;

    switch (method) {
      case 'GET':
        response = await http.get(uri, headers: headers);
        break;
      case 'POST':
        response = await http.post(uri, headers: headers, body: json.encode(body));
        break;
      case 'PUT':
        response = await http.put(uri, headers: headers, body: json.encode(body));
        break;
      case 'DELETE':
        response = await http.delete(uri, headers: headers);
        break;
      default:
        throw Exception('Unsupported HTTP method');
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return json.decode(response.body);
    } else {
      final error = json.decode(response.body);
      throw Exception(error['error'] ?? 'API request failed');
    }
  }

  // Auth
  Future<Map<String, dynamic>> signUp(String email, String password, String displayName) async {
    return await _apiRequest('/auth/signup', 'POST', body: {
      'email': email,
      'password': password,
      'displayName': displayName,
    });
  }

  Future<Map<String, dynamic>> signIn(String email, String password) async {
    final data = await _apiRequest('/auth/signin', 'POST', body: {
      'email': email,
      'password': password,
    });
    
    // Set session in Supabase client
    await supabase.auth.setSession(data['accessToken']);
    
    return data;
  }

  Future<void> signOut() async {
    await _apiRequest('/auth/signout', 'POST', requiresAuth: true);
    await supabase.auth.signOut();
  }

  // Videos
  Future<Map<String, dynamic>> getFeed({String category = 'all', int limit = 20, int offset = 0}) async {
    return await _apiRequest(
      '/videos/feed?category=$category&limit=$limit&offset=$offset',
      'GET',
    );
  }

  Future<Map<String, dynamic>> likeVideo(String videoId) async {
    return await _apiRequest('/videos/$videoId/like', 'POST', requiresAuth: true);
  }

  // Comments
  Future<Map<String, dynamic>> addComment(String videoId, String text) async {
    return await _apiRequest(
      '/videos/$videoId/comments',
      'POST',
      body: {'text': text},
      requiresAuth: true,
    );
  }

  Future<Map<String, dynamic>> getComments(String videoId, {int limit = 50, int offset = 0}) async {
    return await _apiRequest(
      '/videos/$videoId/comments?limit=$limit&offset=$offset',
      'GET',
    );
  }

  // Users
  Future<Map<String, dynamic>> followUser(String userId) async {
    return await _apiRequest('/users/$userId/follow', 'POST', requiresAuth: true);
  }

  Future<Map<String, dynamic>> getUserProfile(String userId) async {
    return await _apiRequest('/users/$userId', 'GET');
  }
}
```

### 3. Initialize Supabase

In `lib/main.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: 'https://YOUR_PROJECT_ID.supabase.co',
    anonKey: 'YOUR_ANON_KEY',
  );

  runApp(MyApp());
}

final supabase = Supabase.instance.client;
```

### 4. Use in Widgets

```dart
import 'package:flutter/material.dart';
import 'services/api_service.dart';

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final api = ApiService(supabase);
  List<dynamic> videos = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    loadVideos();
  }

  Future<void> loadVideos() async {
    try {
      final data = await api.getFeed();
      setState(() {
        videos = data['videos'];
        isLoading = false;
      });
    } catch (e) {
      print('Error loading videos: $e');
      setState(() => isLoading = false);
    }
  }

  Future<void> handleLike(String videoId) async {
    try {
      await api.likeVideo(videoId);
      await loadVideos(); // Refresh
    } catch (e) {
      print('Error liking video: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Center(child: CircularProgressIndicator());
    }

    return ListView.builder(
      itemCount: videos.length,
      itemBuilder: (context, index) {
        final video = videos[index];
        return ListTile(
          title: Text(video['title']),
          subtitle: Text('${video['likes']} likes'),
          trailing: IconButton(
            icon: Icon(Icons.favorite_border),
            onPress: () => handleLike(video['id']),
          ),
        );
      },
    );
  }
}
```

---

## 📹 Video Upload from Mobile

### React Native Video Upload

```typescript
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { video } from './services/api';

export const uploadVideo = async () => {
  // Pick video
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    allowsEditing: true,
    quality: 1,
  });

  if (result.canceled) return;

  const videoUri = result.assets[0].uri;
  
  // Generate thumbnail
  const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
    time: 1000,
  });

  // Upload
  try {
    const uploadedVideo = await video.uploadVideo(videoUri, thumbnailUri, {
      title: 'My Video',
      description: 'Video description',
      category: 'short',
      duration: result.assets[0].duration || 0,
    });
    
    console.log('Video uploaded:', uploadedVideo);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Flutter Video Upload

```dart
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;

Future<void> uploadVideo() async {
  final picker = ImagePicker();
  
  // Pick video
  final XFile? videoFile = await picker.pickVideo(source: ImageSource.gallery);
  if (videoFile == null) return;

  // Pick thumbnail
  final XFile? thumbnailFile = await picker.pickImage(source: ImageSource.gallery);
  
  // Create multipart request
  var request = http.MultipartRequest(
    'POST',
    Uri.parse('$baseUrl/videos/upload'),
  );
  
  // Add auth header
  final token = await _getAuthToken();
  request.headers['Authorization'] = 'Bearer $token';
  
  // Add files
  request.files.add(await http.MultipartFile.fromPath('video', videoFile.path));
  if (thumbnailFile != null) {
    request.files.add(await http.MultipartFile.fromPath('thumbnail', thumbnailFile.path));
  }
  
  // Add metadata
  request.fields['title'] = 'My Video';
  request.fields['description'] = 'Video description';
  request.fields['category'] = 'short';
  request.fields['duration'] = '30';
  
  // Send request
  try {
    final response = await request.send();
    if (response.statusCode == 200) {
      final responseData = await response.stream.bytesToString();
      print('Video uploaded: $responseData');
    } else {
      print('Upload failed: ${response.statusCode}');
    }
  } catch (e) {
    print('Upload error: $e');
  }
}
```

---

## 🔐 Authentication Best Practices

### Secure Token Storage

**React Native:**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Store token securely
await AsyncStorage.setItem('@auth_token', token);

// Retrieve token
const token = await AsyncStorage.getItem('@auth_token');
```

**Flutter:**
```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final storage = FlutterSecureStorage();

// Store token securely
await storage.write(key: 'auth_token', value: token);

// Retrieve token
final token = await storage.read(key: 'auth_token');
```

### Auto-Refresh Tokens

Both Supabase clients handle token refresh automatically when configured properly.

---

## 🎯 Best Practices

### 1. Error Handling

```typescript
try {
  const data = await video.getFeed();
  setVideos(data.videos);
} catch (error) {
  if (error.message.includes('Unauthorized')) {
    // Redirect to login
    navigation.navigate('Login');
  } else {
    // Show error toast
    showError(error.message);
  }
}
```

### 2. Loading States

```typescript
const [isLoading, setIsLoading] = useState(false);

const loadVideos = async () => {
  setIsLoading(true);
  try {
    const data = await video.getFeed();
    setVideos(data.videos);
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }
};
```

### 3. Pagination

```typescript
const [videos, setVideos] = useState([]);
const [offset, setOffset] = useState(0);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  if (!hasMore) return;
  
  const data = await video.getFeed('all', 20, offset);
  setVideos([...videos, ...data.videos]);
  setOffset(offset + 20);
  setHasMore(data.hasMore);
};
```

### 4. Optimistic Updates

```typescript
const handleLike = async (videoId: string) => {
  // Update UI immediately
  setVideos(videos.map(v => 
    v.id === videoId 
      ? { ...v, likes: v.likes + 1, liked: true }
      : v
  ));
  
  try {
    // Confirm with server
    await video.likeVideo(videoId);
  } catch (error) {
    // Revert on error
    setVideos(videos.map(v => 
      v.id === videoId 
        ? { ...v, likes: v.likes - 1, liked: false }
        : v
    ));
    showError('Failed to like video');
  }
};
```

---

## 📊 Performance Tips

1. **Cache API responses** - Use React Query or SWR
2. **Lazy load videos** - Load only visible items
3. **Compress uploads** - Reduce video file size before upload
4. **Prefetch data** - Load next page in background
5. **Use pagination** - Don't load all videos at once

---

## 🔍 Debugging

### Enable Network Logging

**React Native:**
```typescript
import { LogBox } from 'react-native';

// Log all API calls
const originalFetch = fetch;
global.fetch = (...args) => {
  console.log('API Request:', args[0]);
  return originalFetch(...args);
};
```

**Flutter:**
```dart
// Add http interceptor
class LoggingClient extends http.BaseClient {
  final http.Client _inner;

  LoggingClient(this._inner);

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    print('Request: ${request.method} ${request.url}');
    return _inner.send(request);
  }
}
```

---

## ✅ Checklist

Before deploying your mobile app:

- [ ] API base URL is correct
- [ ] Supabase credentials are configured
- [ ] Auth token is stored securely
- [ ] Error handling is implemented
- [ ] Loading states are shown
- [ ] Network errors are caught
- [ ] Video uploads are tested
- [ ] Pagination works correctly
- [ ] Session persistence works
- [ ] Sign out clears all data

---

## 📚 Additional Resources

- **API Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Setup Guide**: [BACKEND_SETUP_GUIDE.md](./BACKEND_SETUP_GUIDE.md)
- **Supabase Docs**: https://supabase.com/docs
- **React Native Supabase**: https://supabase.com/docs/guides/getting-started/tutorials/with-react-native
- **Flutter Supabase**: https://supabase.com/docs/guides/getting-started/tutorials/with-flutter

---

## 🎉 You're Ready!

Your mobile app can now:
- ✅ Authenticate users
- ✅ Upload and fetch videos
- ✅ Like and comment on videos
- ✅ Follow other users
- ✅ Manage user profiles

Happy coding! 🚀
