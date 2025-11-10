# Dorphin Mobile App

A fully functional cross-platform mobile app built with React Native (Expo) that replicates the Dorphin short-video platform design.

## Features

- ✅ **Home Feed** - Vertically scrollable video feed with auto-play preview
- ✅ **Shorts Player** - Full-screen vertical swipe shorts experience
- ✅ **Video Player** - Full-screen landscape video player
- ✅ **Profile Screen** - User profile with stats and video management
- ✅ **Creator Profiles** - Browse creator pages and follow/unfollow
- ✅ **Search** - Search videos and creators
- ✅ **Leaderboard** - Top creators and trending videos
- ✅ **Mini Player** - Collapsible glassmorphic mini player
- ✅ **Smooth Animations** - iOS-style spring animations and haptic feedback
- ✅ **Dark Mode** - Beautiful dark theme throughout
- ✅ **Responsive Layout** - Optimized for both iOS and Android

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Native Stack)
- **Video**: Expo AV & Expo Video
- **Animations**: React Native Reanimated & Animated API
- **Gestures**: React Native Gesture Handler
- **UI Effects**: Expo Blur (Glassmorphism)
- **Haptics**: Expo Haptics
- **Icons**: React Native Vector Icons (Ionicons)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Studio (for Android development)
- Expo Go app on your physical device (optional)

## Installation

1. **Navigate to the mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on your preferred platform:**
   - Press `i` for iOS Simulator (Mac only)
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your phone

## Project Structure

```
mobile/
├── App.tsx                          # Main app entry with navigation
├── app.json                         # Expo configuration
├── package.json                     # Dependencies
├── src/
│   ├── screens/                     # All screen components
│   │   ├── HomeScreen.tsx          # Main feed
│   │   ├── ShortsScreen.tsx        # Vertical shorts player
│   │   ├── FullScreenVideoPlayer.tsx # Long video player
│   │   ├── ProfileScreen.tsx       # User profile
│   │   ├── CreatorProfileScreen.tsx # Creator pages
│   │   ├── SearchScreen.tsx        # Search interface
│   │   └── LeaderboardScreen.tsx   # Trending leaderboard
│   ├── components/                  # Reusable components
│   │   ├── VideoCard.tsx           # Video card component
│   │   ├── ShortsRow.tsx           # Horizontal shorts scroll
│   │   └── MiniPlayer.tsx          # Collapsible mini player
│   ├── constants/
│   │   └── theme.ts                # Colors, spacing, typography
│   ├── data/
│   │   └── mockData.ts             # Sample video data
│   └── types/
│       └── index.ts                # TypeScript interfaces
```

## Design Features

### Animations
- Spring animations for all transitions
- Haptic feedback on interactions
- Smooth scroll performance
- iOS-level micro-interactions

### Styling
- Glassmorphism effects with blur
- Consistent color system
- Premium shadows and borders
- Responsive typography

### Video Features
- Auto-play in feed
- Full-screen players (portrait & landscape)
- Swipe navigation for shorts
- Play/pause controls
- Progress tracking
- Mini player for background playback

### Interactive Elements
- Like/react with animated hearts
- Comment system with overlays
- Share functionality
- Follow/unfollow creators
- Video upload (placeholder)
- Delete videos

## Key Screens

### Home Screen
- Followed creators horizontal scroll
- Square video cards with auto-play preview
- Shorts row with thumbnails
- Action bar (like, comment, share)
- Infinite scroll feed

### Shorts Screen
- Full-screen vertical video player
- Swipe up/down to navigate
- Action buttons on right side
- Creator info overlay
- Looping playback
- Follow button

### Video Player
- Landscape/portrait support
- Tap to show/hide controls
- Creator info at bottom
- Action bar with glassmorphic design
- Back navigation

### Profile Screen
- Avatar and stats (videos, followers, following)
- Edit profile button
- Video grid layout
- Settings (dark mode toggle)
- Upload functionality

## Customization

### Theme Colors
Edit `src/constants/theme.ts` to customize colors:
```typescript
export const COLORS = {
  primary: '#FF6B9D',      // Primary accent
  secondary: '#A855F7',    // Secondary accent
  background: '#000000',   // Background color
  // ... more colors
};
```

### Mock Data
Edit `src/data/mockData.ts` to add/modify video content:
```typescript
export const mockVideos: Video[] = [
  {
    id: '1',
    title: 'Your Video Title',
    creator: 'Creator Name',
    // ... more properties
  },
];
```

## API Integration

The app is designed with placeholder data structures that match expected API response formats. To connect to real APIs:

1. **Create an API service:**
   ```typescript
   // src/services/api.ts
   export const fetchVideos = async () => {
     const response = await fetch('YOUR_API_ENDPOINT/videos');
     return response.json();
   };
   ```

2. **Replace mock data with API calls:**
   ```typescript
   // In HomeScreen.tsx
   useEffect(() => {
     fetchVideos().then(setVideos);
   }, []);
   ```

3. **Add authentication:**
   ```typescript
   // Use AsyncStorage for tokens
   import AsyncStorage from '@react-native-async-storage/async-storage';
   ```

## Performance Optimization

- Videos are lazy-loaded in feed
- Thumbnails are cached automatically
- FlatList with optimized rendering
- Video players pause when off-screen
- Debounced search input
- Memoized components

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

### Using EAS Build (Recommended)
```bash
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

## Troubleshooting

**Videos not playing:**
- Check network connection
- Verify video URLs are accessible
- iOS requires HTTPS for remote videos

**Animations laggy:**
- Enable Hermes (enabled by default in newer Expo)
- Test on physical device (simulator performance may vary)

**Build errors:**
- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Future Enhancements

- [ ] Video upload from camera/gallery
- [ ] Real-time comments with WebSocket
- [ ] Push notifications
- [ ] Video editing features
- [ ] Stories/Reels
- [ ] Live streaming
- [ ] In-app purchases
- [ ] Analytics dashboard
- [ ] Content moderation
- [ ] Social sharing integrations

## License

This is a prototype application for demonstration purposes.

## Support

For questions or issues, please refer to:
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation Docs](https://reactnavigation.org/)
- [React Native Docs](https://reactnative.dev/)
