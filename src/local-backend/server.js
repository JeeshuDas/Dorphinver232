// Import required packages using ESM syntax
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get __dirname equivalent in ESM (needed for path resolution)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = 5000; // Server will run on port 5000

// ==================== MIDDLEWARE SETUP ====================

// Enable CORS to allow requests from any origin (React, React Native, etc.)
app.use(cors({
  origin: '*', // Allow all origins (you can restrict this to specific domains in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON request bodies
app.use(express.json());

// Serve uploaded files statically from /uploads directory
// This allows videos to be accessed at: http://localhost:5000/uploads/filename.mp4
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== STORAGE CONFIGURATION ====================

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created /uploads directory');
}

// Configure Multer storage
const storage = multer.diskStorage({
  // Define where to save uploaded files
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save to /uploads folder
  },
  
  // Define how to name uploaded files
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp_randomstring_originalname.ext
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname); // Get file extension
    const nameWithoutExt = path.basename(file.originalname, ext); // Get filename without extension
    cb(null, `${nameWithoutExt}_${uniqueSuffix}${ext}`);
  }
});

// File filter to only allow video files
const fileFilter = (req, file, cb) => {
  // List of allowed video MIME types
  const allowedTypes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/webm',
    'video/3gpp',
    'video/x-flv'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Invalid file type. Only video files are allowed.'), false); // Reject file
  }
};

// Initialize Multer with configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // Max file size: 500MB
  }
});

// ==================== ROUTES ====================

// Health check route - confirms server is running
app.get('/health', (req, res) => {
  res.json({ 
    status: 'running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: '🚀 Dorphin Local Backend is healthy!'
  });
});

// Upload video route
app.post('/upload', upload.single('video'), (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No video file provided',
      });
    }

    // Get server URL (use req.protocol and req.get('host') for dynamic URL)
    const serverUrl = `http://localhost:${PORT}`;
    
    // Build file URL
    const fileUrl = `${serverUrl}/uploads/${req.file.filename}`;
    
    // Log successful upload
    console.log('✅ Video uploaded successfully:', req.file.filename);
    console.log('📦 File size:', (req.file.size / 1024 / 1024).toFixed(2), 'MB');
    
    // Return success response with file URL
    res.json({
      success: true,
      message: 'Video uploaded successfully',
      fileUrl: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to upload video',
      details: error.message,
    });
  }
});

// Upload multiple videos route (bonus feature)
app.post('/upload-multiple', upload.array('videos', 10), (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No video files provided',
      });
    }

    const serverUrl = `http://localhost:${PORT}`;
    
    // Map uploaded files to response format
    const uploadedFiles = req.files.map(file => ({
      fileUrl: `${serverUrl}/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    }));
    
    console.log(`✅ ${req.files.length} videos uploaded successfully`);
    
    res.json({
      success: true,
      message: `${req.files.length} videos uploaded successfully`,
      files: uploadedFiles,
      uploadedAt: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('❌ Multiple upload error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to upload videos',
      details: error.message,
    });
  }
});

// Get list of all uploaded videos
app.get('/videos', (req, res) => {
  try {
    // Read all files from uploads directory
    const files = fs.readdirSync(uploadsDir);
    
    // Filter only video files and map to response format
    const serverUrl = `http://localhost:${PORT}`;
    const videos = files
      .filter(file => {
        // Check if file is a video based on extension
        const ext = path.extname(file).toLowerCase();
        return ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.3gp'].includes(ext);
      })
      .map(filename => {
        const filePath = path.join(uploadsDir, filename);
        const stats = fs.statSync(filePath);
        
        return {
          filename: filename,
          fileUrl: `${serverUrl}/uploads/${filename}`,
          size: stats.size,
          uploadedAt: stats.birthtime,
          modifiedAt: stats.mtime,
        };
      })
      .sort((a, b) => b.uploadedAt - a.uploadedAt); // Sort by upload date (newest first)
    
    res.json({
      success: true,
      count: videos.length,
      videos: videos,
    });
    
  } catch (error) {
    console.error('❌ Error fetching videos:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch videos',
      details: error.message,
    });
  }
});

// Delete video route
app.delete('/videos/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }
    
    // Delete file
    fs.unlinkSync(filePath);
    
    console.log('🗑️  Video deleted:', filename);
    
    res.json({
      success: true,
      message: 'Video deleted successfully',
      filename: filename,
    });
    
  } catch (error) {
    console.error('❌ Delete error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete video',
      details: error.message,
    });
  }
});

// Get storage info
app.get('/storage-info', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    
    // Calculate total storage used
    let totalSize = 0;
    files.forEach(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    });
    
    res.json({
      success: true,
      totalFiles: files.length,
      totalSizeBytes: totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      totalSizeGB: (totalSize / 1024 / 1024 / 1024).toFixed(2),
      uploadsPath: uploadsDir,
    });
    
  } catch (error) {
    console.error('❌ Storage info error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get storage info',
      details: error.message,
    });
  }
});

// ==================== ERROR HANDLING ====================

// Handle Multer errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    // Multer-specific errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        details: 'Maximum file size is 500MB',
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files',
        details: 'Maximum 10 files allowed per upload',
      });
    }
    
    return res.status(400).json({
      success: false,
      error: 'Upload error',
      details: error.message,
    });
  }
  
  // Handle other errors
  if (error) {
    console.error('❌ Server error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
  
  next();
});

// Handle 404 - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log('');
  console.log('🎬 ================================ 🎬');
  console.log('   DORPHIN LOCAL VIDEO BACKEND');
  console.log('🎬 ================================ 🎬');
  console.log('');
  console.log(`✅ Server running on: http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📤 Upload endpoint: http://localhost:${PORT}/upload`);
  console.log(`📋 List videos: http://localhost:${PORT}/videos`);
  console.log(`💾 Storage info: http://localhost:${PORT}/storage-info`);
  console.log('');
  console.log('🚀 Ready to accept video uploads!');
  console.log('');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT signal received: closing HTTP server');
  process.exit(0);
});
