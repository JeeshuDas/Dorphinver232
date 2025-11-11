# Dorphin Backend API

Production-ready Node.js + Express + MongoDB backend for the Dorphin short-video platform.

## 🚀 Features

- **Authentication**: JWT + OAuth (Google/Apple)
- **Video Management**: Upload, feed, search, trending
- **Social Features**: Follow/unfollow, likes, comments, replies
- **Real-time Notifications**: Socket.IO integration
- **Analytics**: Video views, engagement tracking
- **Recommendation Algorithm**: Personalized feed
- **Cloud Storage**: AWS S3 integration for videos/images
- **Security**: Rate limiting, input validation, helmet, CORS
- **Production Ready**: Logging, error handling, compression

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (DB, AWS, Passport, Logger)
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Custom middlewares
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── scripts/         # Utility scripts (seed data)
│   └── server.js        # Main server file
├── uploads/temp/        # Temporary file uploads
├── logs/                # Application logs
├── .env                 # Environment variables
└── package.json
```

## 🛠️ Installation

### Prerequisites

- Node.js >= 18.0.0
- MongoDB (local or cloud)
- AWS S3 account (for video storage)
- Google OAuth credentials (optional)

### Setup Steps

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your credentials:
   - MongoDB URI
   - JWT secrets
   - AWS S3 credentials
   - OAuth credentials (optional)

3. **Start MongoDB** (if using local)
   ```bash
   mongod
   ```

4. **Seed the database** (optional - creates sample data)
   ```bash
   npm run seed
   ```
   
   This creates test users and videos. Test account:
   - Email: `alex@dorphin.app`
   - Password: `password123`

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

Server will run at `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication

#### Signup
```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe",
  "username": "johndoe"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Google OAuth
```http
GET /api/v1/auth/google
```

### Videos

#### Get Feed
```http
GET /api/v1/videos/feed?page=1&limit=20&category=short
```

#### Upload Video
```http
POST /api/v1/videos/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

video: <file>
thumbnail: <file>
title: "My Video"
description: "Description"
category: "short"
duration: 30
tags: "tag1,tag2,tag3"
```

#### Get Single Video
```http
GET /api/v1/videos/:id
```

#### Search Videos
```http
GET /api/v1/videos/search?q=sunset&sortBy=views
```

#### Get Trending
```http
GET /api/v1/videos/trending?category=short
```

### Comments

#### Get Comments
```http
GET /api/v1/comments/:videoId?page=1&limit=20
```

#### Create Comment
```http
POST /api/v1/comments/:videoId
Authorization: Bearer {token}
Content-Type: application/json

{
  "text": "Great video!",
  "parentComment": null
}
```

#### Get Replies
```http
GET /api/v1/comments/:commentId/replies
```

### Reactions

#### Toggle Video Like
```http
POST /api/v1/reactions/:videoId
Authorization: Bearer {token}
```

#### Get Liked Videos
```http
GET /api/v1/reactions/user/liked-videos
Authorization: Bearer {token}
```

### Follow System

#### Follow/Unfollow User
```http
POST /api/v1/follow/:creatorId
Authorization: Bearer {token}
```

#### Get Followers
```http
GET /api/v1/follow/:userId/followers
```

#### Get Following
```http
GET /api/v1/follow/:userId/following
```

#### Get Following Feed
```http
GET /api/v1/follow/feed/following
Authorization: Bearer {token}
```

### Notifications

#### Get Notifications
```http
GET /api/v1/notifications?page=1&limit=20
Authorization: Bearer {token}
```

#### Mark as Read
```http
PUT /api/v1/notifications/:id/read
Authorization: Bearer {token}
```

#### Mark All as Read
```http
PUT /api/v1/notifications/read-all
Authorization: Bearer {token}
```

### Users

#### Get User Profile
```http
GET /api/v1/users/:id
```

#### Search Users
```http
GET /api/v1/users/search?q=john
```

#### Get User Analytics
```http
GET /api/v1/users/:id/analytics
Authorization: Bearer {token}
```

## 🔐 Authentication

Protected routes require a JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get token by logging in or signing up.

## 🗄️ Database Models

- **User**: User profiles and authentication
- **Video**: Video content and metadata
- **Comment**: Comments and replies
- **Like**: Likes on videos and comments
- **Follow**: Follow relationships
- **Notification**: User notifications
- **ViewHistory**: Video view analytics

## 📊 Rate Limiting

- General API: 100 requests / 15 minutes
- Auth endpoints: 5 requests / 15 minutes
- Video upload: 10 uploads / hour
- Comments: 20 comments / 5 minutes

## 🔧 Environment Variables

See `.env.example` for all configuration options.

### Required Variables
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for signing JWT tokens
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_S3_BUCKET_NAME`: S3 bucket for videos

### Optional Variables
- `GOOGLE_CLIENT_ID`: For Google OAuth
- `GOOGLE_CLIENT_SECRET`: For Google OAuth
- `REDIS_URL`: For caching (recommended for production)

## 🚢 Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Use MongoDB Atlas or managed MongoDB
3. Configure AWS S3 buckets
4. Set strong JWT secrets
5. Enable Redis for caching
6. Configure proper CORS origins
7. Set up SSL/TLS
8. Configure logging and monitoring

### Deploy to Heroku

```bash
heroku create dorphin-api
heroku addons:create mongolab
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
git push heroku main
```

### Deploy to AWS/DigitalOcean

1. Set up Node.js environment
2. Install PM2: `npm install -g pm2`
3. Start with PM2: `pm2 start src/server.js --name dorphin-api`
4. Set up Nginx reverse proxy
5. Configure SSL with Let's Encrypt

## 🧪 Testing

```bash
npm test
```

## 📝 Logging

Logs are stored in `./logs/` directory:
- `error.log`: Error logs
- `combined.log`: All logs

## 🤝 Support

For issues or questions, contact the development team.

## 📄 License

MIT License
