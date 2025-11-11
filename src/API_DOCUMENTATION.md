# Dorphin Backend API Documentation

## Overview

The Dorphin backend is built using:
- **Supabase** for authentication, storage, and realtime features
- **Hono** web framework running on Supabase Edge Functions
- **Key-Value Store** for all application data
- **Supabase Storage** for video files, thumbnails, and profile images

Base URL: `https://{PROJECT_ID}.supabase.co/functions/v1/make-server-148a8522`

## Authentication

Most endpoints require authentication. Include the access token in the Authorization header:

```
Authorization: Bearer {ACCESS_TOKEN}
```

---

## API Endpoints

### Authentication

#### 1. Sign Up
Create a new user account.

**Endpoint:** `POST /auth/signup`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "displayName": "John Doe",
  "username": "johndoe" // optional
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
    "bio": "",
    "followers": 0,
    "following": 0,
    "isVerified": false,
    "createdAt": "2025-11-11T12:00:00Z"
  },
  "message": "Account created successfully"
}
```

---

#### 2. Sign In
Authenticate a user and get access token.

**Endpoint:** `POST /auth/signin`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "username": "johndoe",
    "avatar": "#FF6B9D",
    "bio": "",
    "followers": 0,
    "following": 0,
    "isVerified": false
  }
}
```

---

#### 3. Get Current User
Get the authenticated user's profile.

**Endpoint:** `GET /auth/me`

**Headers:** Requires authentication

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "username": "johndoe",
    "avatar": "#FF6B9D",
    "bio": "Content creator",
    "followers": 1250,
    "following": 384,
    "isVerified": true
  }
}
```

---

#### 4. Sign Out
Sign out the current user.

**Endpoint:** `POST /auth/signout`

**Headers:** Requires authentication

**Response:**
```json
{
  "message": "Signed out successfully"
}
```

---

### User Management

#### 5. Get User Profile
Get any user's public profile.

**Endpoint:** `GET /users/:userId`

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "displayName": "John Doe",
    "username": "johndoe",
    "avatar": "#FF6B9D",
    "bio": "Content creator",
    "followers": 1250,
    "following": 384,
    "isVerified": true
  }
}
```

---

#### 6. Update User Profile
Update the authenticated user's profile.

**Endpoint:** `PUT /users/me`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "displayName": "John Smith",
  "bio": "Updated bio",
  "avatar": "#00FF00"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Smith",
    "username": "johndoe",
    "avatar": "#00FF00",
    "bio": "Updated bio",
    "followers": 1250,
    "following": 384,
    "isVerified": true,
    "updatedAt": "2025-11-11T12:30:00Z"
  }
}
```

---

#### 7. Get User's Videos
Get all videos uploaded by a specific user.

**Endpoint:** `GET /users/:userId/videos`

**Response:**
```json
{
  "videos": [
    {
      "id": "video_123",
      "title": "My First Video",
      "creator": "John Doe",
      "creatorId": "uuid",
      "thumbnail": "https://...",
      "videoUrl": "https://...",
      "duration": 120,
      "category": "long",
      "views": 1500,
      "likes": 250,
      "comments": 45,
      "uploadDate": "2025-11-11T10:00:00Z"
    }
  ]
}
```

---

### Video Management

#### 8. Upload Video
Upload a new video with thumbnail.

**Endpoint:** `POST /videos/upload`

**Headers:** Requires authentication

**Content-Type:** `multipart/form-data`

**Form Data:**
- `video` (File): Video file
- `thumbnail` (File, optional): Thumbnail image
- `title` (string): Video title
- `description` (string, optional): Video description
- `category` ('short' | 'long'): Video category
- `shortCategory` (string, optional): Short category if category is 'short'
- `duration` (number): Video duration in seconds

**Response:**
```json
{
  "video": {
    "id": "video_123",
    "title": "My First Video",
    "description": "This is my first video",
    "creator": "John Doe",
    "creatorId": "uuid",
    "creatorAvatar": "#FF6B9D",
    "thumbnail": "https://...",
    "videoUrl": "https://...",
    "duration": 120,
    "category": "long",
    "views": 0,
    "likes": 0,
    "comments": 0,
    "uploadDate": "2025-11-11T12:00:00Z",
    "createdAt": "2025-11-11T12:00:00Z"
  }
}
```

---

#### 9. Get Video Feed
Get paginated list of videos.

**Endpoint:** `GET /videos/feed`

**Query Parameters:**
- `category` (string, optional): 'all' | 'short' | 'long' (default: 'all')
- `limit` (number, optional): Number of videos per page (default: 20)
- `offset` (number, optional): Pagination offset (default: 0)

**Example:** `GET /videos/feed?category=short&limit=10&offset=0`

**Response:**
```json
{
  "videos": [
    {
      "id": "video_123",
      "title": "Amazing Short",
      "creator": "John Doe",
      "creatorId": "uuid",
      "thumbnail": "https://...",
      "videoUrl": "https://...",
      "duration": 30,
      "category": "short",
      "shortCategory": "comedy",
      "views": 5000,
      "likes": 850,
      "comments": 120
    }
  ],
  "total": 150,
  "hasMore": true
}
```

---

#### 10. Get Video by ID
Get a specific video's details.

**Endpoint:** `GET /videos/:videoId`

**Response:**
```json
{
  "video": {
    "id": "video_123",
    "title": "My Video",
    "description": "Video description",
    "creator": "John Doe",
    "creatorId": "uuid",
    "thumbnail": "https://...",
    "videoUrl": "https://...",
    "duration": 120,
    "category": "long",
    "views": 1500,
    "likes": 250,
    "comments": 45,
    "uploadDate": "2025-11-11T10:00:00Z"
  }
}
```

---

#### 11. Delete Video
Delete a video (only by the creator).

**Endpoint:** `DELETE /videos/:videoId`

**Headers:** Requires authentication

**Response:**
```json
{
  "message": "Video deleted successfully"
}
```

---

### Likes

#### 12. Like/Unlike Video
Toggle like status on a video.

**Endpoint:** `POST /videos/:videoId/like`

**Headers:** Requires authentication

**Response:**
```json
{
  "liked": true,
  "likes": 251
}
```

---

#### 13. Check Like Status
Check if the current user has liked a video.

**Endpoint:** `GET /videos/:videoId/liked`

**Headers:** Requires authentication

**Response:**
```json
{
  "liked": true
}
```

---

### Comments

#### 14. Add Comment
Add a comment to a video.

**Endpoint:** `POST /videos/:videoId/comments`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "text": "Great video!"
}
```

**Response:**
```json
{
  "comment": {
    "id": "comment_123",
    "videoId": "video_123",
    "userId": "uuid",
    "user": "John Doe",
    "avatar": "#FF6B9D",
    "text": "Great video!",
    "time": "just now",
    "createdAt": "2025-11-11T12:00:00Z"
  }
}
```

---

#### 15. Get Comments
Get all comments for a video.

**Endpoint:** `GET /videos/:videoId/comments`

**Query Parameters:**
- `limit` (number, optional): Number of comments per page (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)

**Response:**
```json
{
  "comments": [
    {
      "id": "comment_123",
      "videoId": "video_123",
      "userId": "uuid",
      "user": "John Doe",
      "avatar": "#FF6B9D",
      "text": "Great video!",
      "time": "just now",
      "createdAt": "2025-11-11T12:00:00Z"
    }
  ],
  "total": 45,
  "hasMore": false
}
```

---

### Follow System

#### 16. Follow/Unfollow User
Toggle follow status for a user.

**Endpoint:** `POST /users/:targetUserId/follow`

**Headers:** Requires authentication

**Response:**
```json
{
  "following": true,
  "followers": 1251
}
```

---

#### 17. Check Follow Status
Check if the current user is following another user.

**Endpoint:** `GET /users/:targetUserId/following`

**Headers:** Requires authentication

**Response:**
```json
{
  "following": true
}
```

---

#### 18. Get User's Followers
Get list of user IDs following a specific user.

**Endpoint:** `GET /users/:userId/followers`

**Response:**
```json
{
  "followers": ["uuid1", "uuid2", "uuid3"]
}
```

---

### Health Check

#### 19. Health Check
Check if the server is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-11T12:00:00Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid auth token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Data Storage Schema

The backend uses a key-value store with the following key patterns:

### User Data
- `user:{userId}` - User profile
- `username:{username}` - Username to userId mapping
- `user:{userId}:videos` - Array of video IDs uploaded by user

### Video Data
- `video:{videoId}` - Video metadata
- `videos:shorts` - Array of all short video IDs
- `videos:long` - Array of all long video IDs
- `video:{videoId}:comments` - Array of comment IDs for video

### Interaction Data
- `like:{userId}:{videoId}` - Like relationship
- `comment:{videoId}:{commentId}` - Comment data
- `follow:{followerId}:{followingId}` - Follow relationship

---

## Supabase Storage Buckets

### Buckets
- `make-148a8522-dorphin-videos` - Video files (private)
- `make-148a8522-dorphin-thumbnails` - Thumbnail images (private)
- `make-148a8522-dorphin-profiles` - Profile images (private)

All files use signed URLs with 1-year expiration for access.

---

## Real-time Features

While the backend infrastructure supports Supabase Realtime, real-time subscriptions for likes, comments, and follows can be implemented by:

1. Subscribing to database changes via Supabase Realtime
2. Polling endpoints at regular intervals
3. Using WebSocket connections for live updates

**Example (Supabase Realtime):**
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Subscribe to new comments (would require custom implementation)
// This is a placeholder - actual implementation would use database triggers
```

---

## Rate Limiting

Currently, the API does not implement rate limiting. In production, consider:
- Rate limiting by IP address
- Rate limiting by user ID
- Different limits for authenticated vs. anonymous requests

---

## Security Considerations

1. **Authentication**: All sensitive operations require valid JWT tokens
2. **Authorization**: Users can only modify their own content
3. **Storage**: All storage buckets are private; access via signed URLs only
4. **Input Validation**: All inputs should be validated on the client side
5. **CORS**: Enabled for all origins (configure for production)

---

## Future Enhancements

Potential improvements for production deployment:

1. **Search**: Full-text search for videos and users
2. **Recommendations**: Algorithm-based video feed
3. **Notifications**: Push notifications for likes, comments, follows
4. **Analytics**: View tracking and engagement metrics
5. **Moderation**: Content reporting and moderation tools
6. **Monetization**: Premium features and creator payouts
7. **CDN**: Content delivery network for videos
8. **Transcoding**: Automatic video quality optimization

---

## Support

For issues or questions:
- Check the console logs for detailed error messages
- All errors are logged with contextual information
- Review the frontend API service (`/services/api.ts`) for implementation examples
