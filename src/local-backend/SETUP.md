# 🚀 Setup Guide - Dorphin Local Backend

Follow these steps to get your local video backend running in under 5 minutes!

---

## ✅ Prerequisites

Make sure you have **Node.js** installed (version 18 or higher):

```bash
node --version
```

If not installed, download from: https://nodejs.org/

---

## 📦 Installation Steps

### **Step 1: Navigate to Directory**

```bash
cd local-backend
```

### **Step 2: Install Dependencies**

```bash
npm install
```

This will install:
- ✅ Express (web server)
- ✅ Multer (file uploads)
- ✅ CORS (cross-origin requests)

### **Step 3: Start Server**

```bash
npm start
```

You should see:

```
🎬 ================================ 🎬
   DORPHIN LOCAL VIDEO BACKEND
🎬 ================================ 🎬

✅ Server running on: http://localhost:5000
📁 Uploads directory: /path/to/local-backend/uploads
🔗 Health check: http://localhost:5000/health
📤 Upload endpoint: http://localhost:5000/upload
📋 List videos: http://localhost:5000/videos
💾 Storage info: http://localhost:5000/storage-info

🚀 Ready to accept video uploads!
```

### **Step 4: Test Server**

Open browser and visit:
```
http://localhost:5000/health
```

Or open the test page:
```
local-backend/test-upload.html
```
(Just double-click the file!)

---

## 🎯 Verify Installation

### ✅ Checklist

- [ ] `npm install` completed without errors
- [ ] Server started successfully on port 5000
- [ ] `/uploads` folder created automatically
- [ ] Health check returns `{ "status": "running" }`
- [ ] Test upload page opens in browser

---

## 🧪 Quick Test

### **Option 1: Use Test Page (Easiest)**

1. Double-click `test-upload.html`
2. Click "Check Server Status" (should show ✅)
3. Click upload area and select a video
4. Watch it upload!

### **Option 2: Use curl**

```bash
# Test health
curl http://localhost:5000/health

# Upload a video
curl -X POST http://localhost:5000/upload \
  -F "video=@/path/to/your/video.mp4"

# List videos
curl http://localhost:5000/videos
```

### **Option 3: Use Postman**

1. Open Postman
2. POST to `http://localhost:5000/upload`
3. Body → form-data
4. Key: `video` (type: File)
5. Select video file
6. Send!

---

## 🔧 Troubleshooting

### **Problem: Port 5000 already in use**

**Solution:** Kill the process or change the port

**macOS/Linux:**
```bash
lsof -ti:5000 | xargs kill -9
```

**Windows:**
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

Or edit `server.js` and change:
```javascript
const PORT = 5000; // Change to 3000, 8000, etc.
```

---

### **Problem: npm install fails**

**Solution:** Clear cache and retry

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

### **Problem: Cannot access from mobile device**

**Solution:** Use your PC's local IP instead of localhost

1. Find your PC's IP:

**macOS/Linux:**
```bash
ifconfig | grep inet
```

**Windows:**
```cmd
ipconfig
```

2. Update frontend URL:
```javascript
const API_URL = 'http://192.168.1.100:5000'; // Use your PC's IP
```

3. Make sure firewall allows port 5000

---

### **Problem: CORS error**

**Solution:** Server should already have CORS enabled. If still getting errors:

1. Check server logs for CORS messages
2. Verify server is running on correct port
3. Make sure frontend is making requests to correct URL

---

## 📱 Connect Frontend

### **React/React Native**

Update your upload function to use local backend:

```javascript
const API_URL = 'http://localhost:5000'; // or your PC's IP for mobile

const uploadVideo = async (videoFile) => {
  const formData = new FormData();
  formData.append('video', videoFile);
  
  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('✅ Video URL:', data.fileUrl);
    return data.fileUrl;
  }
};
```

---

## 🎉 Success Indicators

When everything works correctly, you should:

✅ See server logs for every request  
✅ Upload videos and get `fileUrl` in response  
✅ Access videos at `http://localhost:5000/uploads/filename.mp4`  
✅ List all videos via GET `/videos`  
✅ Delete videos via DELETE `/videos/:filename`  
✅ Check storage info via GET `/storage-info`  

---

## 📚 Next Steps

1. ✅ Server is running
2. 📤 Test upload with test page
3. 🔗 Connect your frontend app
4. 🎬 Start uploading videos!

---

## 🆘 Need Help?

Common issues:

| Issue | Solution |
|-------|----------|
| Server won't start | Check if port 5000 is free |
| Upload fails | Check file is a valid video |
| Can't access from mobile | Use PC's IP, not localhost |
| Files too large | Increase limit in server.js |
| CORS error | Verify server is running with CORS enabled |

---

## 🎯 Production Notes

⚠️ **This backend is for local development only!**

For production deployment:
- Add authentication
- Use cloud storage (AWS S3, Cloudinary, etc.)
- Add HTTPS
- Implement rate limiting
- Add file validation/scanning
- Use environment variables for config

---

**Ready to upload? Let's go! 🚀**
