# Dorphin API Quick Reference Card

## 🔗 Base URL
```
https://{PROJECT_ID}.supabase.co/functions/v1/make-server-148a8522
```

---

## 🔐 Authentication Header
```
Authorization: Bearer {ACCESS_TOKEN}
```

---

## 📋 Quick Reference

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | ❌ | Create account |
| POST | `/auth/signin` | ❌ | Sign in |
| GET | `/auth/me` | ✅ | Get current user |
| POST | `/auth/signout` | ✅ | Sign out |

### User Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/:userId` | ❌ | Get user profile |
| PUT | `/users/me` | ✅ | Update profile |
| GET | `/users/:userId/videos` | ❌ | Get user videos |
| POST | `/users/:userId/follow` | ✅ | Follow/unfollow |
| GET | `/users/:userId/following` | ✅ | Check follow status |
| GET | `/users/:userId/followers` | ❌ | Get followers |

### Video Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/videos/upload` | ✅ | Upload video |
| GET | `/videos/feed` | ❌ | Get video feed |
| GET | `/videos/:videoId` | ❌ | Get video details |
| DELETE | `/videos/:videoId` | ✅ | Delete video |
| POST | `/videos/:videoId/like` | ✅ | Like/unlike |
| GET | `/videos/:videoId/liked` | ✅ | Check like status |

### Comment Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/videos/:videoId/comments` | ✅ | Add comment |
| GET | `/videos/:videoId/comments` | ❌ | Get comments |

---

## 💻 Code Examples

### JavaScript/TypeScript

```javascript
// Sign up
await fetch(BASE_URL + '/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    displayName: 'John Doe'
  })
});

// Sign in
const { accessToken, user } = await fetch(BASE_URL + '/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
}).then(r => r.json());

// Get videos
const { videos } = await fetch(
  BASE_URL + '/videos/feed?category=short&limit=20'
).then(r => r.json());

// Like video
await fetch(BASE_URL + '/videos/VIDEO_ID/like', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Add comment
await fetch(BASE_URL + '/videos/VIDEO_ID/comments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ text: 'Great video!' })
});

// Upload video (FormData)
const formData = new FormData();
formData.append('video', videoFile);
formData.append('thumbnail', thumbnailFile);
formData.append('title', 'My Video');
formData.append('category', 'short');
formData.append('duration', '30');

await fetch(BASE_URL + '/videos/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});
```

### Python

```python
import requests

BASE_URL = "https://YOUR_PROJECT.supabase.co/functions/v1/make-server-148a8522"

# Sign up
response = requests.post(f"{BASE_URL}/auth/signup", json={
    "email": "user@example.com",
    "password": "password123",
    "displayName": "John Doe"
})

# Sign in
response = requests.post(f"{BASE_URL}/auth/signin", json={
    "email": "user@example.com",
    "password": "password123"
})
data = response.json()
access_token = data['accessToken']

# Get videos
response = requests.get(f"{BASE_URL}/videos/feed?category=all&limit=20")
videos = response.json()['videos']

# Like video
response = requests.post(
    f"{BASE_URL}/videos/VIDEO_ID/like",
    headers={"Authorization": f"Bearer {access_token}"}
)

# Add comment
response = requests.post(
    f"{BASE_URL}/videos/VIDEO_ID/comments",
    headers={
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    },
    json={"text": "Great video!"}
)
```

### cURL

```bash
# Sign up
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-148a8522/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "displayName": "John Doe"
  }'

# Sign in
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-148a8522/auth/signin \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Get videos
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-148a8522/videos/feed?category=all&limit=20

# Like video (with auth)
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-148a8522/videos/VIDEO_ID/like \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'

# Add comment
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-148a8522/videos/VIDEO_ID/comments \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"text": "Great video!"}'
```

---

## 📦 Request/Response Examples

### Sign Up
**Request:**
```json
POST /auth/signup
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe",
  "username": "johndoe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "username": "johndoe",
    "avatar": "#FF6B9D",
    "followers": 0,
    "following": 0
  }
}
```

### Get Video Feed
**Request:**
```
GET /videos/feed?category=short&limit=10&offset=0
```

**Response:**
```json
{
  "videos": [
    {
      "id": "video_123",
      "title": "Amazing Short",
      "creator": "John Doe",
      "thumbnail": "https://...",
      "videoUrl": "https://...",
      "duration": 30,
      "category": "short",
      "likes": 850,
      "comments": 120,
      "views": 5000
    }
  ],
  "total": 150,
  "hasMore": true
}
```

### Like Video
**Request:**
```
POST /videos/video_123/like
Authorization: Bearer {TOKEN}
```

**Response:**
```json
{
  "liked": true,
  "likes": 851
}
```

---

## 🎯 Query Parameters

### Video Feed
- `category`: `'all'` | `'short'` | `'long'` (default: `'all'`)
- `limit`: Number of videos (default: `20`)
- `offset`: Pagination offset (default: `0`)

### Comments
- `limit`: Number of comments (default: `50`)
- `offset`: Pagination offset (default: `0`)

---

## ⚠️ Error Responses

All errors return:
```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## 🔑 Data Models

### User
```typescript
{
  id: string
  email: string
  displayName: string
  username: string
  avatar: string
  bio: string
  followers: number
  following: number
  isVerified: boolean
  createdAt: string
}
```

### Video
```typescript
{
  id: string
  title: string
  description: string
  creator: string
  creatorId: string
  creatorAvatar: string
  thumbnail: string
  videoUrl: string
  duration: number
  category: 'short' | 'long'
  shortCategory?: string
  views: number
  likes: number
  comments: number
  uploadDate: string
}
```

### Comment
```typescript
{
  id: string
  videoId: string
  userId: string
  user: string
  avatar: string
  text: string
  time: string
  createdAt: string
}
```

---

## 🚀 Frontend Integration

### Using with Fetch
```javascript
const api = {
  baseUrl: 'https://PROJECT.supabase.co/functions/v1/make-server-148a8522',
  
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('access_token');
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
    
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(this.baseUrl + endpoint, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    return response.json();
  },
  
  // Auth
  signup: (email, password, displayName) => 
    api.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName })
    }),
  
  signin: (email, password) =>
    api.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  
  // Videos
  getFeed: (category = 'all', limit = 20, offset = 0) =>
    api.request(`/videos/feed?category=${category}&limit=${limit}&offset=${offset}`),
  
  likeVideo: (videoId) =>
    api.request(`/videos/${videoId}/like`, { method: 'POST' }),
  
  // Comments
  addComment: (videoId, text) =>
    api.request(`/videos/${videoId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text })
    }),
};
```

### Using with Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://PROJECT.supabase.co/functions/v1/make-server-148a8522',
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Usage
const { data } = await api.post('/auth/signup', {
  email: 'user@example.com',
  password: 'password123',
  displayName: 'John Doe'
});

const videos = await api.get('/videos/feed?category=all&limit=20');
```

---

## 📱 Mobile Integration

### React Native
```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
  },
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Get session
const { data: { session } } = await supabase.auth.getSession();
const accessToken = session?.access_token;

// Make API call
const response = await fetch(API_BASE + '/videos/feed', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### Flutter
```dart
import 'package:supabase_flutter/supabase_flutter.dart';

// Initialize
await Supabase.initialize(
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
);

final supabase = Supabase.instance.client;

// Sign in
await supabase.auth.signInWithPassword(
  email: 'user@example.com',
  password: 'password123',
);

// Get token
final session = supabase.auth.currentSession;
final accessToken = session?.accessToken;

// Make API call
final response = await http.get(
  Uri.parse('$API_BASE/videos/feed'),
  headers: {'Authorization': 'Bearer $accessToken'},
);
```

---

## 💡 Tips

1. **Store tokens securely** - Use localStorage/AsyncStorage/SecureStorage
2. **Handle 401 errors** - Redirect to login when unauthorized
3. **Use pagination** - Don't load all data at once
4. **Implement retries** - Handle network failures gracefully
5. **Cache responses** - Reduce API calls
6. **Show loading states** - Better UX
7. **Validate input** - Before sending to API
8. **Log errors** - For debugging

---

## 📚 Full Documentation

- **Complete API Docs**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Setup Guide**: [BACKEND_SETUP_GUIDE.md](./BACKEND_SETUP_GUIDE.md)
- **Mobile Integration**: [MOBILE_INTEGRATION_GUIDE.md](./MOBILE_INTEGRATION_GUIDE.md)

---

**🚀 Happy coding!**
