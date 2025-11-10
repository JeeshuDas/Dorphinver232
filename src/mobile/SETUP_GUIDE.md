# Dorphin Mobile - Complete Setup Guide

This guide will walk you through setting up, running, and deploying the Dorphin mobile app.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
1. **Node.js** (v16 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

2. **npm or Yarn**
   - Comes with Node.js
   - Verify: `npm --version`

3. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

### For iOS Development (Mac only)
4. **Xcode** (latest version)
   - Download from Mac App Store
   - Install Command Line Tools: `xcode-select --install`

5. **CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

### For Android Development
6. **Android Studio**
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK (API 31 or higher)
   - Set up Android Emulator

### For Testing on Physical Devices
7. **Expo Go App**
   - iOS: Download from App Store
   - Android: Download from Google Play Store

---

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
cd mobile
npm install
```

### Step 2: Start Development Server
```bash
npm start
```

### Step 3: Run on Device
Choose one of the following:

**Option A: Physical Device**
1. Install Expo Go on your phone
2. Scan the QR code displayed in terminal
3. App will load on your device

**Option B: iOS Simulator (Mac only)**
1. Press `i` in the terminal
2. iOS Simulator will launch automatically

**Option C: Android Emulator**
1. Start Android Emulator from Android Studio
2. Press `a` in the terminal
3. App will install and launch

---

## 📱 Detailed Setup Instructions

### iOS Setup (Mac only)

1. **Install Xcode:**
   - Open App Store
   - Search "Xcode"
   - Install (this takes a while)

2. **Configure Xcode:**
   ```bash
   sudo xcode-select --switch /Applications/Xcode.app
   sudo xcodebuild -license accept
   ```

3. **Install iOS Simulator:**
   - Open Xcode
   - Preferences → Components
   - Download desired iOS versions

4. **Run on Simulator:**
   ```bash
   npm start
   # Then press 'i' when Metro bundler starts
   ```

### Android Setup

1. **Install Android Studio:**
   - Download from [developer.android.com/studio](https://developer.android.com/studio)
   - Run installer with default settings

2. **Configure Android SDK:**
   - Open Android Studio
   - More Actions → SDK Manager
   - Install Android SDK Platform 31 or higher
   - Install Android SDK Build-Tools

3. **Set Environment Variables:**
   
   **macOS/Linux** (add to `~/.bash_profile` or `~/.zshrc`):
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

   **Windows** (System Properties → Environment Variables):
   ```
   ANDROID_HOME = C:\Users\YourUsername\AppData\Local\Android\Sdk
   PATH = %ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator
   ```

4. **Create Virtual Device:**
   - Open Android Studio
   - More Actions → Virtual Device Manager
   - Create Device → Select Pixel 5
   - Download System Image (API 31+)
   - Finish and Launch Emulator

5. **Run on Emulator:**
   ```bash
   npm start
   # Then press 'a' when Metro bundler starts
   ```

---

## 🔧 Development Workflow

### Starting the App
```bash
# Start Metro bundler
npm start

# Start with cache cleared
npm start -- --clear

# Start in production mode
npm start -- --no-dev --minify
```

### Running on Devices
```bash
# iOS
npm run ios

# Android
npm run android

# Web (for quick testing)
npm run web
```

### Debugging

**Enable Debug Mode:**
- iOS: Cmd + D in Simulator
- Android: Cmd/Ctrl + M in Emulator
- Physical Device: Shake device

**Debug Menu Options:**
- Reload: Refresh the app
- Debug Remote JS: Opens Chrome DevTools
- Show Inspector: Inspect elements
- Show Perf Monitor: Check performance

**React Native Debugger:**
```bash
# Install
brew install --cask react-native-debugger

# Use standalone app for better debugging
```

---

## 📦 Project Structure Explained

```
mobile/
├── App.tsx                 # Root component with navigation setup
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
├── babel.config.js        # Babel configuration
├── tsconfig.json          # TypeScript configuration
│
└── src/
    ├── screens/           # Full-page screens
    │   ├── HomeScreen.tsx
    │   ├── ShortsScreen.tsx
    │   ├── FullScreenVideoPlayer.tsx
    │   ├── ProfileScreen.tsx
    │   ├── CreatorProfileScreen.tsx
    │   ├── SearchScreen.tsx
    │   └── LeaderboardScreen.tsx
    │
    ├── components/        # Reusable UI components
    │   ├── VideoCard.tsx
    │   ├── ShortsRow.tsx
    │   └── MiniPlayer.tsx
    │
    ├── constants/         # App-wide constants
    │   └── theme.ts       # Colors, spacing, typography
    │
    ├── data/             # Mock data and API placeholders
    │   └── mockData.ts
    │
    └── types/            # TypeScript type definitions
        └── index.ts
```

---

## 🎨 Customization Guide

### Changing Colors

Edit `src/constants/theme.ts`:

```typescript
export const COLORS = {
  primary: '#FF6B9D',        // Change main accent color
  secondary: '#A855F7',      // Change secondary color
  background: '#000000',     // Change background
  text: '#FFFFFF',           // Change text color
  // ... more colors
};
```

### Adding New Fonts

1. **Download fonts** (e.g., from Google Fonts)
2. **Create assets folder:**
   ```bash
   mkdir -p assets/fonts
   ```
3. **Add fonts to folder**
4. **Load in App.tsx:**
   ```typescript
   import { useFonts } from 'expo-font';
   
   const [fontsLoaded] = useFonts({
     'CustomFont-Regular': require('./assets/fonts/CustomFont-Regular.ttf'),
     'CustomFont-Bold': require('./assets/fonts/CustomFont-Bold.ttf'),
   });
   ```

### Modifying Animations

All animations use React Native Reanimated. Example:

```typescript
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withSpring 
} from 'react-native-reanimated';

// In component
const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }]
}));

// Trigger animation
scale.value = withSpring(1.2);
```

---

## 🔌 API Integration

### Setting Up API Calls

1. **Install axios:**
   ```bash
   npm install axios
   ```

2. **Create API service** (`src/services/api.ts`):
   ```typescript
   import axios from 'axios';
   
   const API_BASE_URL = 'https://your-api.com/api';
   
   export const api = axios.create({
     baseURL: API_BASE_URL,
     timeout: 10000,
   });
   
   export const fetchVideos = async () => {
     const response = await api.get('/videos');
     return response.data;
   };
   
   export const uploadVideo = async (videoData: FormData) => {
     const response = await api.post('/videos', videoData, {
       headers: { 'Content-Type': 'multipart/form-data' }
     });
     return response.data;
   };
   ```

3. **Use in components:**
   ```typescript
   import { fetchVideos } from '../services/api';
   
   useEffect(() => {
     const loadVideos = async () => {
       try {
         const videos = await fetchVideos();
         setVideos(videos);
       } catch (error) {
         console.error('Failed to load videos:', error);
       }
     };
     loadVideos();
   }, []);
   ```

### Adding Authentication

1. **Install AsyncStorage:**
   ```bash
   expo install @react-native-async-storage/async-storage
   ```

2. **Create auth service** (`src/services/auth.ts`):
   ```typescript
   import AsyncStorage from '@react-native-async-storage/async-storage';
   
   export const saveToken = async (token: string) => {
     await AsyncStorage.setItem('authToken', token);
   };
   
   export const getToken = async () => {
     return await AsyncStorage.getItem('authToken');
   };
   
   export const removeToken = async () => {
     await AsyncStorage.removeItem('authToken');
   };
   ```

3. **Add to API calls:**
   ```typescript
   api.interceptors.request.use(async (config) => {
     const token = await getToken();
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   ```

---

## 🚢 Building for Production

### Using Expo Build Service (Recommended)

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Configure EAS:**
   ```bash
   eas build:configure
   ```

3. **Build for iOS:**
   ```bash
   eas build --platform ios
   ```

4. **Build for Android:**
   ```bash
   eas build --platform android
   ```

### Building Locally

**iOS (requires Mac):**
```bash
expo build:ios
```

**Android:**
```bash
expo build:android
```

### Creating Release APK/IPA

**Android APK:**
```bash
eas build --platform android --profile preview
```

**iOS IPA:**
```bash
eas build --platform ios --profile preview
```

---

## 📲 Deploying to App Stores

### iOS App Store

1. **Prerequisites:**
   - Apple Developer Account ($99/year)
   - App Store Connect access
   - Valid certificates and provisioning profiles

2. **Build for App Store:**
   ```bash
   eas build --platform ios --profile production
   ```

3. **Submit to App Store:**
   ```bash
   eas submit --platform ios
   ```

4. **Manual Submission:**
   - Download IPA from EAS
   - Upload via Xcode or Transporter
   - Fill out App Store Connect metadata
   - Submit for review

### Google Play Store

1. **Prerequisites:**
   - Google Play Developer Account ($25 one-time)
   - Signed APK or AAB
   - App assets (screenshots, descriptions)

2. **Build for Play Store:**
   ```bash
   eas build --platform android --profile production
   ```

3. **Submit to Play Store:**
   ```bash
   eas submit --platform android
   ```

4. **Manual Submission:**
   - Download AAB from EAS
   - Upload to Google Play Console
   - Fill out store listing
   - Submit for review

---

## 🐛 Common Issues & Solutions

### Issue: Metro bundler won't start
```bash
# Solution: Clear cache
npx react-native start --reset-cache
```

### Issue: iOS build fails
```bash
# Solution: Clean and rebuild
cd ios && pod install && cd ..
npm run ios
```

### Issue: Android emulator not detected
```bash
# Solution: List devices and restart adb
adb devices
adb kill-server
adb start-server
```

### Issue: Videos not playing
- Check network connection
- Verify video URLs are HTTPS
- Test URLs in browser first
- Check device permissions

### Issue: Slow performance
- Test on physical device (simulators are slower)
- Enable Hermes (already enabled in newer Expo)
- Optimize images and videos
- Use FlatList instead of ScrollView for long lists

---

## 📊 Performance Optimization

### Image Optimization
```typescript
// Use appropriate image sizes
<Image
  source={{ uri: imageUrl }}
  style={{ width: 100, height: 100 }}
  resizeMode="cover"
  // Cache images
  defaultSource={require('./placeholder.png')}
/>
```

### List Optimization
```typescript
// Use FlatList with proper optimization
<FlatList
  data={videos}
  renderItem={renderVideo}
  keyExtractor={(item) => item.id}
  // Performance props
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={10}
  windowSize={10}
/>
```

### Video Optimization
```typescript
// Pause videos when not visible
<Video
  source={{ uri: videoUrl }}
  shouldPlay={isVisible}
  // Use appropriate quality
  resizeMode={ResizeMode.CONTAIN}
/>
```

---

## 🧪 Testing

### Unit Testing
```bash
# Install testing libraries
npm install --save-dev @testing-library/react-native jest

# Run tests
npm test
```

### E2E Testing with Detox
```bash
# Install Detox
npm install --save-dev detox

# Run E2E tests
detox test
```

---

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Expo Video](https://docs.expo.dev/versions/latest/sdk/video/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

---

## 💡 Tips & Best Practices

1. **Use TypeScript** - Catch errors early
2. **Follow naming conventions** - PascalCase for components
3. **Keep components small** - Single responsibility
4. **Use hooks properly** - Follow rules of hooks
5. **Optimize renders** - Use React.memo and useMemo
6. **Handle errors** - Always use try-catch
7. **Test on real devices** - Simulators != real performance
8. **Monitor bundle size** - Keep app size small
9. **Use lazy loading** - Load content as needed
10. **Document your code** - Future you will thank you

---

## 🆘 Getting Help

If you encounter issues:

1. Check this guide first
2. Search [Expo Forums](https://forums.expo.dev/)
3. Check [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)
4. Read error messages carefully
5. Enable debug mode and check logs

---

## ✅ Production Checklist

Before deploying to production:

- [ ] Test on both iOS and Android
- [ ] Test on different screen sizes
- [ ] Optimize images and videos
- [ ] Remove console.logs
- [ ] Enable error tracking (Sentry)
- [ ] Add analytics (Firebase)
- [ ] Test offline functionality
- [ ] Verify app permissions
- [ ] Check app size
- [ ] Test on slow networks
- [ ] Review app store guidelines
- [ ] Prepare marketing materials
- [ ] Create privacy policy
- [ ] Set up crash reporting

---

Good luck with your Dorphin mobile app! 🐬
