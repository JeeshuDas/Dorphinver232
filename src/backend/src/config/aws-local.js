const path = require('path');
const fs = require('fs').promises;
const logger = require('./logger');

/**
 * Local File Storage (Development Alternative to AWS S3)
 * Use this for development if you don't want to set up AWS S3
 * 
 * To use this instead of AWS:
 * 1. Rename this file to aws.js (backup the original first)
 * 2. Add static file serving in server.js
 * 3. Restart the backend
 */

/**
 * Upload file to local storage
 * @param {Buffer} file - File buffer
 * @param {string} fileName - File name
 * @param {string} bucketType - 'videos' | 'thumbnails' | 'avatars'
 * @returns {Promise<string>} - URL of uploaded file
 */
const uploadToS3 = async (file, fileName, bucketType = 'videos') => {
  try {
    const uploadDir = path.join(__dirname, '../../uploads', bucketType);
    
    // Create directory if it doesn't exist
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, file);
    
    // Return a URL (this will be served by express.static)
    const url = `http://localhost:${process.env.PORT || 5000}/uploads/${bucketType}/${fileName}`;
    logger.info(`✅ File saved locally: ${url}`);
    return url;
  } catch (error) {
    logger.error(`❌ Local upload failed: ${error.message}`);
    throw new Error('File upload failed');
  }
};

/**
 * Delete file from local storage
 * @param {string} fileKey - File name
 * @param {string} bucketType - 'videos' | 'thumbnails' | 'avatars'
 */
const deleteFromS3 = async (fileKey, bucketType = 'videos') => {
  try {
    const filePath = path.join(__dirname, '../../uploads', bucketType, fileKey);
    await fs.unlink(filePath);
    logger.info(`✅ File deleted locally: ${fileKey}`);
  } catch (error) {
    logger.error(`❌ Local deletion failed: ${error.message}`);
    throw new Error('File deletion failed');
  }
};

/**
 * Get signed URL (not needed for local storage)
 */
const getSignedUrl = (fileKey, expiresIn = 3600) => {
  // For local storage, just return the public URL
  return `http://localhost:${process.env.PORT || 5000}/uploads/videos/${fileKey}`;
};

module.exports = {
  uploadToS3,
  deleteFromS3,
  getSignedUrl,
};
