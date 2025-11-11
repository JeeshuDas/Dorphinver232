const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * File Upload Middleware
 * Handles multipart/form-data uploads using Multer
 */

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Temporary storage before uploading to S3
    cb(null, 'uploads/temp');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter for videos
const videoFilter = (req, file, cb) => {
  const allowedFormats = (process.env.ALLOWED_VIDEO_FORMATS || 'mp4,mov,avi,webm').split(',');
  const ext = path.extname(file.originalname).toLowerCase().slice(1);

  if (allowedFormats.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid video format. Allowed formats: ${allowedFormats.join(', ')}`), false);
  }
};

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedFormats = (process.env.ALLOWED_IMAGE_FORMATS || 'jpg,jpeg,png,gif,webp').split(',');
  const ext = path.extname(file.originalname).toLowerCase().slice(1);

  if (allowedFormats.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid image format. Allowed formats: ${allowedFormats.join(', ')}`), false);
  }
};

// Video upload configuration
const uploadVideo = multer({
  storage: storage,
  fileFilter: videoFilter,
  limits: {
    fileSize: (parseInt(process.env.MAX_VIDEO_SIZE_MB) || 100) * 1024 * 1024, // Default 100MB
  },
});

// Image upload configuration
const uploadImage = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: (parseInt(process.env.MAX_IMAGE_SIZE_MB) || 5) * 1024 * 1024, // Default 5MB
  },
});

// Multiple files upload
const uploadMultiple = multer({
  storage: storage,
  limits: {
    fileSize: (parseInt(process.env.MAX_VIDEO_SIZE_MB) || 100) * 1024 * 1024,
    files: 5, // Max 5 files at once
  },
});

module.exports = {
  uploadVideo: uploadVideo.single('video'),
  uploadThumbnail: uploadImage.single('thumbnail'),
  uploadAvatar: uploadImage.single('avatar'),
  uploadMultiple: uploadMultiple.array('files', 5),
  uploadVideoWithThumbnail: uploadMultiple.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
};
