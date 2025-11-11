# Dorphin Backend Setup Guide

## Overview

This guide will help you set up and connect the Dorphin Supabase backend with your frontend application.

## Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React App)   │
└────────┬────────┘
         │
         │ HTTPS API Calls
         ▼
┌─────────────────────────────────┐
│   Supabase Edge Function        │
│   (Hono Server)                 │
│   /make-server-148a8522/*       │
└────┬────────────────────────┬───┘
     │                        │
     ▼                        ▼
┌────────────┐        ┌──────────────┐
│   Auth     │        │   Storage    │
│  (Users)   │        │   (Videos)   │
└────────────┘        └──────────────┘
     │
     ▼
┌─────────────────┐
│  Key-Value DB   │
│  (App Data)     │
└─────────────────┘
```

---

## What's Already Set Up

The following components are pre-configured and ready to use:

✅ **Backend Server** (`/supabase/functions/server/index.tsx`)
- Complete REST API with all endpoints
- Authentication middleware
- Error handling and logging

✅ **Frontend Integration**
- Supabase client (`/utils/supabase/client.ts`)
- API service (`/services/api.ts`)
- Auth context (`/contexts/AuthContext.tsx`)
- Data provider (`/providers/DataProvider.tsx`)

✅ **Storage Buckets**
- Automatically created on server startup
- Private buckets with signed URL access

✅ **Environment Variables**
- Supabase credentials already configured
- No additional setup required

---

## Backend is Ready!

The backend is **already running** and integrated with your app. Here's what you can do immediately:

### 1. Test the Backend

Open your browser console and run:

```javascript
// Health check
fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-148a8522/health')
  .then(r => r.json())
  .then(console.log);
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-11-11T12:00:00Z"
}
```

---

### 2. Create Your First Account

Use the **Login button** in the app to create an account:

1. Click "Login" in the top-right corner
2. Switch to "Sign Up" tab
3. Enter your details:
   - Email: `demo@dorphin.com`
   - Password: `password123`
   - Display Name: `Demo User`
   - Username: `demo_user` (optional)
4. Click "Sign Up"

The account is created instantly (email confirmation is auto-enabled for prototyping).

---

### 3. Upload Your First Video

Once logged in:

1. Go to your **Profile** (click your avatar)
2. Click **"Upload Video"**
3. Fill in the details:
   - Title: "My First Video"
   - Description: "Testing video upload"
   - Category: Long or Short
   - Duration: 120 seconds
4. Select video and thumbnail files
5. Click **"Upload"**

The video will be uploaded to Supabase Storage and metadata stored in the database.

---

## How Authentication Works

### Sign Up Flow
```
User fills form → Frontend calls API
                       ↓
              Backend creates user in Supabase Auth
                       ↓
              Backend stores profile in KV store
                       ↓
              Returns user profile + success message
                       ↓
              Frontend auto-signs in user
                       ↓
              User is authenticated ✓
```

### Sign In Flow
```
User enters credentials → Frontend calls API
                               ↓
                    Backend validates with Supabase Auth
                               ↓
                    Returns access token + user profile
                               ↓
                    Frontend stores token in localStorage
                               ↓
                    All API calls use this token
```

### Persistent Sessions
- Sessions are stored in localStorage
- Automatically restored on page reload
- Token is included in all authenticated API calls

---

## How Video Upload Works

### Upload Flow
```
User selects files → Frontend creates FormData
                          ↓
                  Calls /videos/upload endpoint
                          ↓
              Backend receives video + thumbnail
                          ↓
              Uploads to Supabase Storage
                          ↓
              Creates signed URLs (1 year expiry)
                          ↓
              Stores metadata in KV store
                          ↓
              Returns video object to frontend
                          ↓
              Frontend displays video ✓
```

---

## Database Structure

The backend uses a key-value store with structured keys:

### User Storage
```
Key: user:{userId}
Value: {
  id: "uuid",
  email: "user@example.com",
  displayName: "John Doe",
  username: "johndoe",
  avatar: "#FF6B9D",
  bio: "Content creator",
  followers: 1250,
  following: 384,
  isVerified: false,
  createdAt: "2025-11-11T12:00:00Z"
}
```

### Video Storage
```
Key: video:{videoId}
Value: {
  id: "video_123",
  title: "My Video",
  description: "Description",
  creator: "John Doe",
  creatorId: "uuid",
  creatorAvatar: "#FF6B9D",
  thumbnail: "https://...",
  videoUrl: "https://...",
  videoPath: "userId/videoId.mp4",
  thumbnailPath: "userId/videoId_thumb.jpg",
  duration: 120,
  category: "long",
  views: 1500,
  likes: 250,
  comments: 45,
  uploadDate: "2025-11-11T10:00:00Z",
  createdAt: "2025-11-11T10:00:00Z"
}
```

### Interaction Storage
```
Like:    like:{userId}:{videoId}
Comment: comment:{videoId}:{commentId}
Follow:  follow:{followerId}:{followingId}
```

### Indexes
```
User videos:  user:{userId}:videos = [videoId1, videoId2, ...]
All shorts:   videos:shorts = [videoId1, videoId2, ...]
All longs:    videos:long = [videoId1, videoId2, ...]
Video comments: video:{videoId}:comments = [commentId1, commentId2, ...]
```

---

## Storage Buckets

Three private buckets are automatically created:

1. **`make-148a8522-dorphin-videos`**
   - Stores video files
   - Path format: `{userId}/{videoId}.mp4`

2. **`make-148a8522-dorphin-thumbnails`**
   - Stores thumbnail images
   - Path format: `{userId}/{videoId}_thumb.jpg`

3. **`make-148a8522-dorphin-profiles`**
   - Reserved for profile pictures
   - Path format: `{userId}/avatar.jpg`

**Note:** All buckets are private. Files are accessed via signed URLs with 1-year expiration.

---

## API Usage Examples

### Using the API Service

The frontend includes a complete API service at `/services/api.ts`:

```typescript
import api from './services/api';

// Authentication
const { user, accessToken } = await api.auth.signin(email, password);
await api.auth.signup(email, password, displayName);
await api.auth.signout();
const user = await api.auth.getCurrentUser();

// Videos
const video = await api.video.uploadVideo(videoFile, thumbnailFile, metadata);
const { videos, total } = await api.video.getFeed('short', 20, 0);
const video = await api.video.getVideo(videoId);
await api.video.deleteVideo(videoId);
const { liked, likes } = await api.video.likeVideo(videoId);

// Comments
const comment = await api.comment.addComment(videoId, text);
const { comments, total } = await api.comment.getComments(videoId);

// Users
const user = await api.user.getProfile(userId);
const updated = await api.user.updateProfile({ bio: "New bio" });
const videos = await api.user.getUserVideos(userId);
const { following, followers } = await api.user.followUser(userId);
const isFollowing = await api.user.checkFollowing(userId);

// Health Check
const status = await api.healthCheck();
```

### Direct API Calls

You can also make direct API calls:

```javascript
// With authentication
const response = await fetch(
  'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-148a8522/videos/feed',
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  }
);
const data = await response.json();

// Without authentication (public endpoints)
const response = await fetch(
  'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-148a8522/health'
);
const data = await response.json();
```

---

## Using with Auth Context

The auth context provides easy access to user state:

```typescript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, signup, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await login('demo@dorphin.com', 'password123');
      console.log('Logged in!');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user.displayName}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

---

## Using with Data Provider

The data provider handles video fetching and interactions:

```typescript
import { useData } from './providers/DataProvider';

function VideoFeed() {
  const { 
    videos, 
    isLoading, 
    error,
    likeVideo,
    followUser,
    refetchVideos 
  } = useData();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {videos.map(video => (
        <div key={video.id}>
          <h3>{video.title}</h3>
          <button onClick={() => likeVideo(video.id)}>
            Like ({video.likes})
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Testing the Backend

### 1. Test Authentication

```javascript
// Test signup
const response = await fetch(
  'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-148a8522/auth/signup',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Test User',
      username: 'testuser'
    })
  }
);
const data = await response.json();
console.log(data);

// Test signin
const signInResponse = await fetch(
  'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-148a8522/auth/signin',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    })
  }
);
const signInData = await signInResponse.json();
console.log('Access Token:', signInData.accessToken);
```

### 2. Test Video Feed

```javascript
const response = await fetch(
  'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-148a8522/videos/feed?category=all&limit=10'
);
const data = await response.json();
console.log('Videos:', data.videos);
console.log('Total:', data.total);
```

### 3. Test Like Video

```javascript
const accessToken = 'your_access_token_here';
const videoId = 'video_123';

const response = await fetch(
  `https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-148a8522/videos/${videoId}/like`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);
const data = await response.json();
console.log('Liked:', data.liked, 'Total likes:', data.likes);
```

---

## Environment Variables

The following environment variables are already configured in the Figma Make environment:

```bash
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Note:** You don't need to create or modify these. They're automatically provided.

---

## Troubleshooting

### "Unauthorized" Error
- **Cause:** Missing or invalid access token
- **Solution:** Ensure you're including the Authorization header with a valid token
- **Check:** localStorage for 'supabase.auth.token'

### "Video upload failed"
- **Cause:** File size too large or invalid format
- **Solution:** Check file size limits and format (MP4 recommended)
- **Check:** Browser console for detailed error messages

### "Failed to fetch"
- **Cause:** Network error or CORS issue
- **Solution:** Check your internet connection and browser console
- **Check:** Network tab in DevTools for failed requests

### Videos not showing
- **Cause:** No videos uploaded yet
- **Solution:** Upload some videos or check that mock data fallback is working
- **Check:** `/videos/feed` endpoint returns videos

### Session not persisting
- **Cause:** localStorage cleared or cookies disabled
- **Solution:** Enable localStorage and cookies in browser
- **Check:** Browser privacy settings

---

## Performance Optimization

### Caching
The app uses mock data as fallback when:
- Backend is slow or unavailable
- No videos have been uploaded yet
- Network errors occur

### Pagination
All list endpoints support pagination:
```javascript
// Get next page
const page2 = await api.video.getFeed('all', 20, 20); // limit=20, offset=20
```

### Signed URLs
Video URLs are valid for 1 year. In production, you would:
1. Check URL expiration
2. Refresh URLs when needed
3. Implement a background job to refresh expiring URLs

---

## Security Best Practices

### Client-Side
✅ Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code
✅ Always use `SUPABASE_ANON_KEY` for client-side Supabase calls
✅ Store access tokens securely in localStorage
✅ Validate user input before sending to API

### Server-Side
✅ Validate all inputs
✅ Require authentication for sensitive operations
✅ Check user ownership before allowing modifications
✅ Log all errors with context

---

## Next Steps

1. **Create Test Accounts**
   - Sign up with different emails
   - Test follow/unfollow functionality

2. **Upload Test Videos**
   - Upload both short and long videos
   - Test different file formats

3. **Test Interactions**
   - Like/unlike videos
   - Add comments
   - Follow creators

4. **Monitor Logs**
   - Open browser console
   - Check for any errors or warnings
   - All API calls are logged

5. **Explore Advanced Features**
   - Implement search functionality
   - Add video recommendations
   - Build notification system

---

## API Reference

For complete API documentation, see:
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Full endpoint reference
- **[/services/api.ts](./services/api.ts)** - Frontend API implementation

---

## Support

The backend is fully functional and integrated. If you encounter any issues:

1. Check the browser console for detailed error messages
2. Review the API documentation
3. Test with the health check endpoint
4. Verify your authentication token is valid

All errors include contextual information to help with debugging!

---

## Summary

✨ **You're all set!** The Dorphin backend is:

- ✅ Running and accessible
- ✅ Integrated with your frontend
- ✅ Ready for user signups
- ✅ Ready for video uploads
- ✅ Handling likes, comments, and follows
- ✅ Using secure authentication
- ✅ Storing files in Supabase Storage

**Start by creating an account and uploading your first video!** 🚀
