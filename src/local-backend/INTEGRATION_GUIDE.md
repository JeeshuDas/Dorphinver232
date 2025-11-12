# 🔌 Integration Guide - Connect Dorphin to Local Backend

This guide shows you how to connect your Dorphin app to the local Node.js backend instead of Supabase.

---

## 🎯 Overview

**Current Setup:** Dorphin → Supabase (cloud storage)  
**New Setup:** Dorphin → Local Backend (PC storage)

Benefits:
- ✅ No Supabase account needed
- ✅ Unlimited free storage on your PC
- ✅ Faster uploads (local network)
- ✅ Complete control over data
- ✅ Works offline

---

## 📝 Step-by-Step Integration

### **Step 1: Start Local Backend**

```bash
cd local-backend
npm install
npm start
```

Verify server is running:
```
http://localhost:5000/health
```

---

### **Step 2: Update Frontend Configuration**

Create a new config file for the local backend:

**File: `/utils/local-backend.ts`**

```typescript
// Local backend configuration
export const LOCAL_BACKEND = {
  // Use localhost for web, or your PC's IP for mobile devices
  API_URL: 'http://localhost:5000',
  // For React Native on physical device, use your PC's local IP:
  // API_URL: 'http://192.168.1.100:5000', // Replace with your PC's IP
};

// Upload video to local backend
export const uploadToLocalBackend = async (videoFile: File | Blob, metadata: {
  title: string;
  description?: string;
  category: 'short' | 'long';
  shortCategory?: string;
  duration?: number;
}) => {
  const formData = new FormData();
  formData.append('video', videoFile);
  
  try {
    console.log('📤 Uploading to local backend...');
    
    const response = await fetch(`${LOCAL_BACKEND.API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Upload successful!', data.fileUrl);
      
      // Return video object in Dorphin's expected format
      return {
        id: data.filename.replace(/\.[^/.]+$/, ''), // Remove extension
        title: metadata.title,
        description: metadata.description || '',
        creator: 'Demo User', // Replace with actual user
        creatorId: 'demo-user-id',
        creatorAvatar: '#8b5cf6',
        thumbnail: '', // Generate thumbnail if needed
        videoUrl: data.fileUrl,
        videoPath: data.filename,
        duration: metadata.duration || 0,
        category: metadata.category,
        shortCategory: metadata.shortCategory,
        views: 0,
        likes: 0,
        comments: 0,
        uploadDate: data.uploadedAt,
        createdAt: data.uploadedAt,
      };
    } else {
      throw new Error(data.error || 'Upload failed');
    }
  } catch (error) {
    console.error('❌ Upload error:', error);
    throw error;
  }
};

// Fetch all videos from local backend
export const fetchLocalVideos = async () => {
  try {
    const response = await fetch(`${LOCAL_BACKEND.API_URL}/videos`);
    const data = await response.json();
    
    if (data.success) {
      // Convert to Dorphin's video format
      return data.videos.map((video: any) => ({
        id: video.filename.replace(/\.[^/.]+$/, ''),
        title: video.filename, // You might want to store metadata separately
        videoUrl: video.fileUrl,
        thumbnail: '',
        duration: 0,
        views: 0,
        likes: 0,
        uploadDate: video.uploadedAt,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error fetching videos:', error);
    return [];
  }
};

// Delete video from local backend
export const deleteLocalVideo = async (filename: string) => {
  try {
    const response = await fetch(`${LOCAL_BACKEND.API_URL}/videos/${filename}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('❌ Delete error:', error);
    return false;
  }
};
```

---

### **Step 3: Update Upload Screen**

Modify your upload logic to use the local backend:

**Example: Update video upload function**

```typescript
import { uploadToLocalBackend } from './utils/local-backend';

// Replace your existing upload function with this
const handleUploadVideo = async () => {
  if (!videoUri) return;
  
  setIsUploading(true);
  setUploadProgress(0);
  
  try {
    // Get video file (implementation depends on your framework)
    const videoFile = await getVideoFile(videoUri); // Your implementation
    
    // Upload to local backend
    const uploadedVideo = await uploadToLocalBackend(videoFile, {
      title: title,
      description: description,
      category: category,
      shortCategory: shortCategory,
      duration: videoDuration,
    });
    
    console.log('✅ Video uploaded:', uploadedVideo);
    
    // Navigate to success screen or update UI
    navigation.navigate('Home');
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    alert('Upload failed. Please try again.');
  } finally {
    setIsUploading(false);
  }
};
```

---

### **Step 4: Update Video Feed**

Fetch videos from local backend instead of Supabase:

```typescript
import { fetchLocalVideos } from './utils/local-backend';

// In your feed component
useEffect(() => {
  const loadVideos = async () => {
    setLoading(true);
    
    try {
      const videos = await fetchLocalVideos();
      setVideos(videos);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };
  
  loadVideos();
}, []);
```

---

### **Step 5: Handle Video Playback**

Videos are served directly from the local backend:

```tsx
<video 
  src={video.videoUrl} 
  controls 
  autoPlay
  style={{ width: '100%', height: '100%' }}
/>

{/* React Native */}
<Video
  source={{ uri: video.videoUrl }}
  style={{ width: '100%', height: '100%' }}
  useNativeControls
  resizeMode="cover"
/>
```

---

## 🔄 Hybrid Approach (Optional)

You can support both Supabase and local backend:

```typescript
// config.ts
export const CONFIG = {
  USE_LOCAL_BACKEND: true, // Toggle between local and Supabase
};

// upload.ts
import { CONFIG } from './config';
import { uploadToLocalBackend } from './utils/local-backend';
import { uploadToSupabase } from './utils/supabase-upload';

const uploadVideo = async (videoFile: File, metadata: any) => {
  if (CONFIG.USE_LOCAL_BACKEND) {
    return await uploadToLocalBackend(videoFile, metadata);
  } else {
    return await uploadToSupabase(videoFile, metadata);
  }
};
```

---

## 📱 Mobile Device Configuration

If testing on a **physical mobile device** (not emulator):

### **1. Find Your PC's Local IP**

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```cmd
ipconfig | findstr IPv4
```

Example output: `192.168.1.100`

### **2. Update API_URL**

```typescript
// utils/local-backend.ts
export const LOCAL_BACKEND = {
  API_URL: 'http://192.168.1.100:5000', // Use your PC's IP
};
```

### **3. Ensure Same Network**

- Mobile device and PC must be on same Wi-Fi network
- Firewall must allow port 5000
- Server must be running

---

## 🧪 Testing

### **Test 1: Health Check**

```typescript
const checkBackend = async () => {
  try {
    const response = await fetch('http://localhost:5000/health');
    const data = await response.json();
    console.log('Backend status:', data.status); // Should be 'running'
  } catch (error) {
    console.error('Backend not reachable:', error);
  }
};
```

### **Test 2: Upload**

```typescript
const testUpload = async () => {
  const testFile = new File(['test'], 'test.mp4', { type: 'video/mp4' });
  
  try {
    const result = await uploadToLocalBackend(testFile, {
      title: 'Test Video',
      category: 'short',
    });
    
    console.log('✅ Upload test passed:', result);
  } catch (error) {
    console.error('❌ Upload test failed:', error);
  }
};
```

### **Test 3: Fetch Videos**

```typescript
const testFetch = async () => {
  try {
    const videos = await fetchLocalVideos();
    console.log('✅ Fetch test passed. Videos:', videos.length);
  } catch (error) {
    console.error('❌ Fetch test failed:', error);
  }
};
```

---

## 🔐 Metadata Storage

The local backend only stores video files, not metadata (title, description, etc.).

**Option 1: Store metadata in localStorage (Web)**

```typescript
const saveVideoMetadata = (videoId: string, metadata: any) => {
  const videos = JSON.parse(localStorage.getItem('videos') || '[]');
  videos.push({ id: videoId, ...metadata });
  localStorage.setItem('videos', JSON.stringify(videos));
};
```

**Option 2: Store metadata in AsyncStorage (React Native)**

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const saveVideoMetadata = async (videoId: string, metadata: any) => {
  const videos = JSON.parse(await AsyncStorage.getItem('videos') || '[]');
  videos.push({ id: videoId, ...metadata });
  await AsyncStorage.setItem('videos', JSON.stringify(videos));
};
```

**Option 3: Add metadata endpoint to backend**

Extend `server.js` to save metadata in a JSON file or SQLite database.

---

## 🎯 Complete Example

Here's a full working example:

```typescript
// LocalVideoUploader.tsx
import React, { useState } from 'react';
import { uploadToLocalBackend } from './utils/local-backend';

export const LocalVideoUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    
    try {
      const result = await uploadToLocalBackend(file, {
        title: 'My Video',
        category: 'short',
      });
      
      setVideoUrl(result.videoUrl);
      alert('✅ Upload successful!');
    } catch (error) {
      alert('❌ Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <input 
        type="file" 
        accept="video/*" 
        onChange={handleUpload}
        disabled={uploading}
      />
      
      {uploading && <p>Uploading...</p>}
      
      {videoUrl && (
        <video src={videoUrl} controls style={{ width: 400 }} />
      )}
    </div>
  );
};
```

---

## ✅ Checklist

Before going live with local backend:

- [ ] Backend server is running on port 5000
- [ ] Health check endpoint returns success
- [ ] Test upload works
- [ ] Videos are accessible via URL
- [ ] Mobile devices can reach backend (if using)
- [ ] Firewall allows port 5000
- [ ] Frontend config updated with correct API_URL
- [ ] Video playback works in app

---

## 🚨 Important Notes

1. **Local backend only works when server is running**
   - Videos won't load if server is off
   - Great for development, not for production

2. **Mobile devices need PC's IP address**
   - Don't use `localhost` on mobile
   - Use your PC's local network IP

3. **No persistence across machines**
   - Videos only stored on your PC
   - Not accessible from other devices unless server is exposed

4. **For production, use cloud storage**
   - Supabase, AWS S3, Cloudinary, etc.
   - Better reliability and scalability

---

## 🎉 Done!

Your Dorphin app is now connected to the local backend! Videos upload to your PC and can be played back immediately.

**Enjoy unlimited free local storage! 🚀**
