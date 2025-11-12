# 🎬 Dorphin Local Video Backend

A local Node.js + Express backend with Multer for uploading and serving video files from your PC.

---

## 🚀 Quick Start

### 1. **Install Dependencies**

```bash
cd local-backend
npm install
```

This installs:
- **express** - Web server framework
- **multer** - File upload middleware
- **cors** - Cross-Origin Resource Sharing
- **nodemon** (dev) - Auto-restart on file changes

### 2. **Start Server**

```bash
npm start
```

Or for development (auto-restart):

```bash
npm run dev
```

### 3. **Verify Server is Running**

Open in browser:
```
http://localhost:5000/health
```

You should see:
```json
{
  "status": "running",
  "timestamp": "2025-11-12T...",
  "uptime": 1.234,
  "message": "🚀 Dorphin Local Backend is healthy!"
}
```

✅ **Server is ready!**

---

## 📡 API Endpoints

### **1. Health Check**
```http
GET http://localhost:5000/health
```

**Response:**
```json
{
  "status": "running",
  "timestamp": "2025-11-12T10:30:00.000Z",
  "uptime": 123.45
}
```

---

### **2. Upload Single Video**
```http
POST http://localhost:5000/upload
Content-Type: multipart/form-data

Body:
  video: <file>
```

**Example with curl:**
```bash
curl -X POST http://localhost:5000/upload \
  -F "video=@/path/to/video.mp4"
```

**Response:**
```json
{
  "success": true,
  "message": "Video uploaded successfully",
  "fileUrl": "http://localhost:5000/uploads/myvideo_1699876543210_123456789.mp4",
  "filename": "myvideo_1699876543210_123456789.mp4",
  "originalName": "myvideo.mp4",
  "size": 15728640,
  "mimeType": "video/mp4",
  "uploadedAt": "2025-11-12T10:30:00.000Z"
}
```

---

### **3. Upload Multiple Videos**
```http
POST http://localhost:5000/upload-multiple
Content-Type: multipart/form-data

Body:
  videos: <file[]>  (max 10 files)
```

**Response:**
```json
{
  "success": true,
  "message": "3 videos uploaded successfully",
  "files": [
    {
      "fileUrl": "http://localhost:5000/uploads/video1_...",
      "filename": "video1_...",
      "originalName": "video1.mp4",
      "size": 12345678,
      "mimeType": "video/mp4"
    },
    // ... more files
  ],
  "uploadedAt": "2025-11-12T10:30:00.000Z"
}
```

---

### **4. Get All Videos**
```http
GET http://localhost:5000/videos
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "videos": [
    {
      "filename": "awesome_video_1699876543210_123456789.mp4",
      "fileUrl": "http://localhost:5000/uploads/awesome_video_1699876543210_123456789.mp4",
      "size": 15728640,
      "uploadedAt": "2025-11-12T10:30:00.000Z",
      "modifiedAt": "2025-11-12T10:30:00.000Z"
    },
    // ... more videos
  ]
}
```

---

### **5. Delete Video**
```http
DELETE http://localhost:5000/videos/:filename
```

**Example:**
```bash
curl -X DELETE http://localhost:5000/videos/myvideo_1699876543210_123456789.mp4
```

**Response:**
```json
{
  "success": true,
  "message": "Video deleted successfully",
  "filename": "myvideo_1699876543210_123456789.mp4"
}
```

---

### **6. Storage Info**
```http
GET http://localhost:5000/storage-info
```

**Response:**
```json
{
  "success": true,
  "totalFiles": 12,
  "totalSizeBytes": 523456789,
  "totalSizeMB": "499.23",
  "totalSizeGB": "0.49",
  "uploadsPath": "/path/to/local-backend/uploads"
}
```

---

## 🎯 Frontend Integration

### **React/React Native Example**

```javascript
// Upload video from frontend
const uploadVideo = async (videoFile) => {
  const formData = new FormData();
  formData.append('video', videoFile);
  
  try {
    const response = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Upload successful!');
      console.log('Video URL:', result.fileUrl);
      return result.fileUrl;
    } else {
      console.error('❌ Upload failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Upload error:', error);
  }
};

// Fetch all videos
const fetchVideos = async () => {
  try {
    const response = await fetch('http://localhost:5000/videos');
    const data = await response.json();
    
    if (data.success) {
      console.log('Videos:', data.videos);
      return data.videos;
    }
  } catch (error) {
    console.error('Error fetching videos:', error);
  }
};
```

### **React Native Example (Expo)**

```javascript
import * as DocumentPicker from 'expo-document-picker';

const pickAndUploadVideo = async () => {
  // Pick video file
  const result = await DocumentPicker.getDocumentAsync({
    type: 'video/*',
  });
  
  if (result.type === 'success') {
    const formData = new FormData();
    formData.append('video', {
      uri: result.uri,
      type: 'video/mp4',
      name: result.name,
    });
    
    // Upload to local backend
    const response = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const data = await response.json();
    console.log('Upload result:', data);
  }
};
```

---

## 📁 Project Structure

```
local-backend/
├── server.js           # Main Express server with all routes
├── package.json        # Dependencies and scripts
├── .gitignore         # Git ignore rules
├── README.md          # This file
└── uploads/           # Uploaded videos stored here (auto-created)
    ├── video1_timestamp_random.mp4
    ├── video2_timestamp_random.mp4
    └── ...
```

---

## 🛡️ Features

✅ **Express.js** - Fast, minimalist web framework  
✅ **Multer** - Efficient file upload handling  
✅ **CORS Enabled** - Works with any frontend (React, React Native, etc.)  
✅ **Static File Serving** - Videos accessible via URL  
✅ **File Validation** - Only accepts video files  
✅ **Size Limits** - Max 500MB per file  
✅ **Unique Filenames** - Prevents naming conflicts  
✅ **Error Handling** - Comprehensive error responses  
✅ **ESM Syntax** - Modern import/export  
✅ **Multiple Uploads** - Upload up to 10 videos at once  
✅ **List Videos** - Get all uploaded videos  
✅ **Delete Videos** - Remove videos from storage  
✅ **Storage Info** - Check total storage used  

---

## ⚙️ Configuration

### **Change Port**

Edit `server.js`:
```javascript
const PORT = 5000; // Change to your desired port
```

### **Change Upload Size Limit**

Edit `server.js`:
```javascript
limits: {
  fileSize: 500 * 1024 * 1024, // 500MB - change this value
}
```

### **Change Uploads Directory**

Edit `server.js`:
```javascript
const uploadsDir = path.join(__dirname, 'uploads'); // Change 'uploads' to your folder name
```

### **Add More Video Formats**

Edit `server.js` fileFilter:
```javascript
const allowedTypes = [
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/webm',
  'video/3gpp',
  'video/x-flv',
  'video/YOUR_FORMAT_HERE', // Add more
];
```

---

## 🧪 Testing

### **Test with Postman**

1. Open Postman
2. Create new POST request to `http://localhost:5000/upload`
3. Set Body type to `form-data`
4. Add key `video` with type `File`
5. Select a video file
6. Send request

### **Test with curl**

```bash
# Upload video
curl -X POST http://localhost:5000/upload \
  -F "video=@/path/to/your/video.mp4"

# List videos
curl http://localhost:5000/videos

# Delete video
curl -X DELETE http://localhost:5000/videos/filename.mp4

# Storage info
curl http://localhost:5000/storage-info
```

---

## 🚨 Error Codes

| Code | Error | Description |
|------|-------|-------------|
| 400 | No video file provided | `video` field missing in request |
| 400 | Invalid file type | File is not a video |
| 400 | File too large | File exceeds 500MB limit |
| 404 | Video not found | Video doesn't exist in uploads |
| 500 | Internal server error | Server crash or unexpected error |

---

## 🔧 Troubleshooting

### **EADDRINUSE: Port 5000 already in use**

Kill the process using port 5000:

**macOS/Linux:**
```bash
lsof -ti:5000 | xargs kill -9
```

**Windows:**
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

Or change the port in `server.js`.

---

### **CORS Error from Frontend**

Make sure the server is running and CORS is enabled. Check console for:
```
Access-Control-Allow-Origin: *
```

If using React Native on physical device, replace `localhost` with your PC's IP:
```javascript
const SERVER_URL = 'http://192.168.1.100:5000'; // Your PC's local IP
```

---

### **Uploads Folder Not Created**

The server automatically creates the `/uploads` folder on startup. If it doesn't exist, create it manually:

```bash
mkdir uploads
```

---

## 📊 Performance

- **Concurrent Uploads**: Handles multiple simultaneous uploads
- **Memory Efficient**: Uses streaming for large files
- **Fast**: Local storage = instant access
- **Scalable**: Can handle hundreds of videos

---

## 🔐 Security Notes

⚠️ **This is for local development only!**

For production, you should:
- Add authentication/authorization
- Validate file types more strictly
- Add rate limiting
- Use HTTPS
- Implement proper access control
- Scan files for malware

---

## 📝 License

MIT License - Feel free to use this in your projects!

---

## 🎉 Success!

Your local video backend is ready! Upload videos from your Dorphin app and they'll be stored on your PC.

**Next Steps:**
1. Connect your frontend to `http://localhost:5000`
2. Test video upload
3. View videos in your app using the returned `fileUrl`

Happy coding! 🚀
