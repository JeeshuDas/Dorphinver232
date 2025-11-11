# Dorphin - Short Video App

A modern short-video application inspired by YouTube Shorts and Spotify's mini player, built with React and Tailwind CSS. Features smooth animations, glassmorphism effects, and a beautiful minimal design.

## Features

- **Home Screen** - Personalized video feed with trending content
- **Shorts Screen** - Vertical scrolling short-form videos
- **Full-Screen Player** - Immersive video viewing with engagement features
- **Search** - Discover videos and creators
- **Creator Profiles** - View creator details and their content
- **Mini Player** - Picture-in-picture video playback
- **Profile & Settings** - User account management
- **Video Upload** - Create and share your own content
- **Leaderboard** - See top creators and trending content

## Tech Stack

- React with TypeScript
- Tailwind CSS v4.0
- Motion/React (formerly Framer Motion) for animations
- Lucide React for icons
- Shadcn/ui component library
- Mock data for demo purposes

## Getting Started

This is a frontend-only application that uses mock data. Simply run:

```bash
npm install
npm start
```

The app will open in your browser at `http://localhost:3000`.

## Project Structure

```
/
├── App.tsx                 # Main application component with navigation
├── components/             # React components
│   ├── AuthScreen.tsx
│   ├── HomeScreen.tsx
│   ├── ShortsScreen.tsx
│   ├── FullScreenVideoPlayer.tsx
│   ├── SearchScreen.tsx
│   ├── CreatorProfileScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── LeaderboardScreen.tsx
│   ├── SettingsScreen.tsx
│   ├── MiniPlayer.tsx
│   ├── UploadVideoDialog.tsx
│   └── ui/                # Shadcn/ui components
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication state
├── providers/             # React providers
│   └── DataProvider.tsx   # Video data management
├── data/                  # Mock data
│   └── mockData.ts
├── types/                 # TypeScript types
│   └── index.ts
└── styles/
    └── globals.css        # Global styles and Tailwind config
```

## Key Features Explained

### Navigation System
- Stack-based navigation for smooth transitions
- iOS-inspired smooth animations
- Back button support with gesture hints

### Video Playback
- Full-screen immersive player
- Mini player for multitasking
- Like, comment, and share features

### User Experience
- Glassmorphism UI effects
- Smooth spring animations
- Responsive design
- Dark mode support

## Mock Data

The application currently runs with mock data for demonstration purposes. All interactions (likes, comments, follows, uploads) are stored in local state and will reset on page refresh.

## Future Enhancements

To make this a production app, you would need to add:
- Backend API for data persistence
- User authentication system
- Video hosting and streaming service
- Real-time updates for comments and reactions
- Analytics and recommendations

## License

MIT
