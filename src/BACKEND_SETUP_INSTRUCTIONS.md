# 🚀 Dorphin Local Backend Setup Guide

## ✅ Backend Integration Complete!

Your Dorphin app is now configured to use a **local Node.js backend** instead of Supabase. Videos will be uploaded to your PC and stored in the `/local-backend/uploads/` folder.

---

## 📋 Quick Start (2 Steps)

### **Step 1: Start the Local Backend**

Open a terminal and run:

```bash
cd local-backend
npm install
npm start
```

You should see:
```
🎬 ================================ 🎬
   DORPHIN LOCAL VIDEO BACKEND
🎬 ================================ 🎬

✅ Server running on: http://localhost:5000
📁 Uploads directory: /path/to/your/local-backend/uploads
🔗 Health check: http://localhost:5000/health
📤 Upload endpoint: http://localhost:5000/upload
📋 List videos: http://localhost:5000/videos
💾 Storage info: http://localhost:5000/storage-info

🚀 Ready to accept video uploads!
```

### **Step 2: Start the Dorphin App**

In a **new terminal** (keep the backend running), run:

```bash
npm start
```

Your app will open at `http://localhost:3000` and automatically connect to the local backend!

---

## 🎥 How to Upload Videos

1. **Open the app** at http://localhost:3000
2. **Click your profile** (top-right purple circle)
3. **Click "Upload Video"** button
4. **Select a video file** (MP4, MOV, AVI, etc. - max 500MB)
5. **Fill in details** (title, description, category)
6. **Click "Upload Video"**

Your video will be:
- ✅ Uploaded to `/local-backend/uploads/`
- ✅ Accessible at `http://localhost:5000/uploads/filename.mp4`
- ✅ Saved in the app (persists in localStorage)
- ✅ Displayed in your profile and feed

---

## 📁 What Changed?

### **Before (Supabase Cloud):**
- Videos uploaded to cloud storage
- Required Supabase account
- Limited free tier

### **Now (Local Backend):**
- ✅ Videos saved to `/local-backend/uploads/` on your PC
- ✅ No cloud account needed
- ✅ Unlimited storage (your hard drive)
- ✅ Works offline
- ✅ Fast uploads (local network)

---

## 🔍 Files Modified

### **New Files:**
- `/services/localBackendApi.ts` - Local backend API client
- `/local-backend/.gitignore` - Git ignore for uploads folder

### **Updated Files:**
- `/App.tsx` - Uses `localBackendApi` for uploads
- `/providers/DataProvider.tsx` - Fetches videos from local backend
- `/components/UploadVideoDialog.tsx` - (unchanged, works with new backend)

---

## 💾 Data Persistence

Your videos are stored in **two places**:

1. **Video Files:** `/local-backend/uploads/filename.mp4`
   - The actual video files on your hard drive

2. **Metadata:** Browser's `localStorage`
   - Video titles, descriptions, categories, etc.
   - Syncs with backend on app startup

**Important:** If you delete a video from the backend folder manually, it won't show in the app after refresh. Use the app's delete button instead!

---

## 🧪 Test the Backend Separately

Want to test video uploads without the full app?

1. Start the backend: `cd local-backend && npm start`
2. Open: `local-backend/test-upload.html` in your browser
3. Drag & drop a video to upload
4. See it appear in `/local-backend/uploads/`

---

## 🔄 How It Works

```
┌─────────────────┐
│  Dorphin App    │
│ (localhost:3000)│
└────────┬────────┘
         │
         │ HTTP Requests
         ▼
┌─────────────────┐
│ Express Server  │
│ (localhost:5000)│
└────────┬────────┘
         │
         │ Saves files
         ▼
┌─────────────────┐
│ /uploads/ folder│
│ (your PC)       │
└─────────────────┘
```

### **Upload Flow:**
1. User selects video in app
2. App sends video to `POST http://localhost:5000/upload`
3. Backend saves to `/local-backend/uploads/video_12345.mp4`
4. Backend returns URL: `http://localhost:5000/uploads/video_12345.mp4`
5. App stores metadata in localStorage
6. Video appears in feed!

---

## ❓ Troubleshooting

### **Problem: "Upload failed" error**

**Solution:** Make sure the backend is running:
```bash
cd local-backend
npm start
```

You should see "Server running on: http://localhost:5000"

---

### **Problem: Videos don't appear after upload**

**Check:**
1. Is the backend running? (`npm start` in `/local-backend/`)
2. Are videos in `/local-backend/uploads/`?
3. Open browser console (F12) - any errors?

**Fix:**
```bash
# Restart both backend and frontend
# Terminal 1:
cd local-backend
npm start

# Terminal 2:
npm start
```

---

### **Problem: "File too large" error**

**Cause:** Video is over 500MB

**Solution:** Compress the video or update the limit in `/local-backend/server.js`:

```javascript
// Change line 85:
limits: {
  fileSize: 1000 * 1024 * 1024, // 1GB instead of 500MB
}
```

Then restart the backend.

---

### **Problem: Videos lost after browser refresh**

**Cause:** localStorage was cleared

**Solution:** Videos files still exist in `/local-backend/uploads/`. The app will re-sync metadata on next startup if you refresh the page.

---

## 🎯 Features Working

✅ **Upload Videos** - Save to local folder
✅ **View Videos** - Stream from `localhost:5000`
✅ **Delete Videos** - Remove from folder & localStorage
✅ **Search Videos** - By title/description
✅ **Like Videos** - Stored in localStorage
✅ **Comments** - Stored in localStorage
✅ **Follow System** - Stored in localStorage
✅ **Mock User** - Auto "logged in" as Demo User

---

## 📝 Next Steps

Want to enhance your backend? Check out:

- `/local-backend/README.md` - Full API documentation
- `/local-backend/INTEGRATION_GUIDE.md` - Advanced integration
- `/local-backend/COMPARISON.md` - Local vs Cloud comparison

---

## 🎉 You're All Set!

Your Dorphin app now uses a **local backend** for video storage!

**Start creating:**
1. Terminal 1: `cd local-backend && npm start`
2. Terminal 2: `npm start`
3. Upload your first video! 🎬

---

**Need help?** Check the console logs (F12 in browser) for detailed error messages.
