# 🎬 Dorphin Local Backend - START HERE

## 🚀 Quick Start (3 Steps)

### **1. Install Dependencies**
```bash
cd local-backend
npm install
```

### **2. Start Server**
```bash
npm start
```

### **3. Test It Works**
Open in browser: `http://localhost:5000/health`

Or double-click: `test-upload.html`

---

## 📁 What's Included

| File | Purpose |
|------|---------|
| `server.js` | Main Express server with all routes |
| `package.json` | Dependencies and scripts |
| `test-upload.html` | Beautiful web UI to test uploads |
| `SETUP.md` | Detailed installation guide |
| `INTEGRATION_GUIDE.md` | How to connect to Dorphin app |
| `README.md` | Complete API documentation |

---

## 🎯 What You Can Do

✅ Upload videos to your PC  
✅ List all uploaded videos  
✅ Delete videos  
✅ View storage statistics  
✅ Stream videos via URL  
✅ Upload multiple videos at once  
✅ Works with React, React Native, or any frontend  

---

## 📡 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Check server status |
| POST | `/upload` | Upload single video |
| POST | `/upload-multiple` | Upload multiple videos |
| GET | `/videos` | List all videos |
| DELETE | `/videos/:filename` | Delete specific video |
| GET | `/storage-info` | Get storage statistics |

---

## 💡 Example Upload

```javascript
const formData = new FormData();
formData.append('video', videoFile);

const response = await fetch('http://localhost:5000/upload', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
console.log('Video URL:', data.fileUrl);
```

**Response:**
```json
{
  "success": true,
  "fileUrl": "http://localhost:5000/uploads/myvideo_1699876543210_123456789.mp4",
  "filename": "myvideo_1699876543210_123456789.mp4",
  "size": 15728640,
  "uploadedAt": "2025-11-12T10:30:00.000Z"
}
```

---

## 🧪 Test With Web UI

1. **Start server:** `npm start`
2. **Open:** `test-upload.html` (double-click)
3. **Click:** "Check Server Status" ✅
4. **Upload:** Drag & drop or click to select video
5. **Watch:** Video appears in list below!

---

## 📱 Use With Mobile App

If testing on physical device (not emulator):

1. Find your PC's IP:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. Update your frontend:
   ```javascript
   const API_URL = 'http://192.168.1.100:5000'; // Your PC's IP
   ```

3. Make sure mobile and PC are on same Wi-Fi

---

## 🔧 Common Issues

### **Port 5000 already in use?**
```bash
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### **Can't connect from mobile?**
- Use PC's IP, not `localhost`
- Ensure same Wi-Fi network
- Check firewall allows port 5000

### **Upload fails?**
- Check file is valid video
- Max size: 500MB
- Allowed formats: MP4, MOV, AVI, MKV, WebM

---

## 📚 Documentation

- **Complete API docs:** See `README.md`
- **Setup guide:** See `SETUP.md`
- **Integration guide:** See `INTEGRATION_GUIDE.md`

---

## ✨ Features

🎬 **Upload videos** - Up to 500MB each  
📁 **Local storage** - Saved in `/uploads` folder  
🔗 **Direct URLs** - Videos accessible via HTTP  
🌐 **CORS enabled** - Works with any frontend  
🚀 **Fast** - Local network = instant uploads  
💾 **Unlimited** - Only limited by your PC's storage  
🔒 **Private** - Videos stay on your PC  
🎨 **Beautiful test UI** - Easy to test and debug  

---

## 🎯 Next Steps

1. ✅ Start server (`npm start`)
2. 🧪 Test with `test-upload.html`
3. 📖 Read `INTEGRATION_GUIDE.md` to connect your app
4. 🎬 Start uploading videos!

---

## 📊 Server Logs

When server is running, you'll see:

```
🎬 ================================ 🎬
   DORPHIN LOCAL VIDEO BACKEND
🎬 ================================ 🎬

✅ Server running on: http://localhost:5000
📁 Uploads directory: /path/to/uploads
🔗 Health check: http://localhost:5000/health
📤 Upload endpoint: http://localhost:5000/upload
📋 List videos: http://localhost:5000/videos
💾 Storage info: http://localhost:5000/storage-info

🚀 Ready to accept video uploads!
```

**Uploads appear as:**
```
✅ Video uploaded successfully: myvideo_1699876543210_123456789.mp4
📦 File size: 15.00 MB
```

---

## 🎉 Ready to Go!

Everything you need is set up and ready to use!

**Your local video backend is production-ready for development and testing.**

Questions? Check the documentation files or the code comments - everything is explained! 

Happy uploading! 🚀
