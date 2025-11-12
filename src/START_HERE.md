# 🚀 START HERE - Quick Setup Guide

## ⚡ 2-Step Setup (Takes 2 minutes!)

### **Step 1: Start the Backend Server**

Open a terminal and run:

```bash
cd local-backend
npm install
npm start
```

✅ **You should see:**
```
🎬 ================================ 🎬
   DORPHIN LOCAL VIDEO BACKEND
🎬 ================================ 🎬

✅ Server running on: http://localhost:5000
📁 Uploads directory: /path/to/local-backend/uploads
🚀 Ready to accept video uploads!
```

### **Step 2: Start the Frontend App**

Open a **NEW** terminal (keep the backend running) and run:

```bash
npm install
npm start
```

✅ **Your app will open at:** `http://localhost:3000`

---

## 🎉 You're Done!

The yellow banner should disappear automatically, indicating the backend is connected!

### **Now you can:**
1. Click your **profile** (purple circle, top-right)
2. Click **"Upload Video"**
3. Select a video file
4. Watch it appear in your feed!

---

## 📋 What Just Happened?

- **Backend:** Running at `http://localhost:5000` (stores videos in `/local-backend/uploads/`)
- **Frontend:** Running at `http://localhost:3000` (your Dorphin app)
- **Connection:** App automatically connects to backend

---

## ❌ Troubleshooting

### **Yellow banner won't go away?**

1. Make sure backend is running (`npm start` in `/local-backend/`)
2. Check you see "Server running on: http://localhost:5000"
3. Refresh your browser

### **"Upload failed" error?**

- Backend not running → Start it with `cd local-backend && npm start`

### **Port 5000 already in use?**

Change the port in `/local-backend/server.js`:
```javascript
const PORT = 5001; // Change from 5000 to 5001
```

Then update in `/services/localBackendApi.ts`:
```typescript
const LOCAL_BACKEND_URL = 'http://localhost:5001';
```

---

## 📖 Full Documentation

- **[BACKEND_SETUP_INSTRUCTIONS.md](./BACKEND_SETUP_INSTRUCTIONS.md)** - Complete guide
- **[README.md](./README.md)** - Project overview
- **[/local-backend/README.md](./local-backend/README.md)** - API documentation

---

## 🎬 Ready to create!

Start uploading videos and building your own Dorphin experience! 🐬
