const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs').promises;
const logger = require('./logger');

/**
 * AWS S3 Configuration
 * Handles file uploads to S3 buckets or local storage
 */

// Check if AWS credentials are configured
const AWS_ENABLED = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

let s3;
if (AWS_ENABLED) {
  // Configure AWS SDK
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
  s3 = new AWS.S3();
  logger.info('✅ AWS S3 configured for file storage');
} else {
  logger.warn('⚠️  AWS S3 not configured. Using local file storage for development.');
}

/**
 * Upload file to S3 or local storage
 * @param {Buffer} file - File buffer
 * @param {string} fileName - File name
 * @param {string} bucketType - 'videos' | 'thumbnails' | 'avatars'
 * @returns {Promise<string>} - URL of uploaded file
 */
const uploadToS3 = async (file, fileName, bucketType = 'videos') => {
  try {
    if (AWS_ENABLED) {
      // Upload to AWS S3
      const bucketMap = {
        videos: process.env.AWS_S3_BUCKET_NAME,
        thumbnails: process.env.AWS_S3_BUCKET_THUMBNAILS,
        avatars: process.env.AWS_S3_BUCKET_AVATARS,
      };

      const bucket = bucketMap[bucketType];

      const params = {
        Bucket: bucket,
        Key: fileName,
        Body: file,
        ACL: 'public-read',
        ContentType: bucketType === 'videos' ? 'video/mp4' : 'image/jpeg',
      };

      const result = await s3.upload(params).promise();
      logger.info(`✅ File uploaded to S3: ${result.Location}`);
      return result.Location;
    } else {
      // Save to local storage (development)
      const uploadDir = path.join(__dirname, '../../uploads', bucketType);
      
      // Create directory if it doesn't exist
      await fs.mkdir(uploadDir, { recursive: true });
      
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, file);
      
      // Return a URL (served by express.static)
      const url = `http://localhost:${process.env.PORT || 5000}/uploads/${bucketType}/${fileName}`;
      logger.info(`✅ File saved locally: ${url}`);
      return url;
    }
  } catch (error) {
    logger.error(`❌ Upload failed: ${error.message}`);
    throw new Error('File upload failed');
  }
};

/**
 * Delete file from S3 or local storage
 * @param {string} fileKey - S3 file key or filename
 * @param {string} bucketType - 'videos' | 'thumbnails' | 'avatars'
 */
const deleteFromS3 = async (fileKey, bucketType = 'videos') => {
  try {
    if (AWS_ENABLED) {
      // Delete from AWS S3
      const bucketMap = {
        videos: process.env.AWS_S3_BUCKET_NAME,
        thumbnails: process.env.AWS_S3_BUCKET_THUMBNAILS,
        avatars: process.env.AWS_S3_BUCKET_AVATARS,
      };

      const bucket = bucketMap[bucketType];

      const params = {
        Bucket: bucket,
        Key: fileKey,
      };

      await s3.deleteObject(params).promise();
      logger.info(`✅ File deleted from S3: ${fileKey}`);
    } else {
      // Delete from local storage
      const filePath = path.join(__dirname, '../../uploads', bucketType, fileKey);
      await fs.unlink(filePath);
      logger.info(`✅ File deleted locally: ${fileKey}`);
    }
  } catch (error) {
    logger.error(`❌ Deletion failed: ${error.message}`);
    throw new Error('File deletion failed');
  }
};

/**
 * Get signed URL for private files
 * @param {string} fileKey - S3 file key
 * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
 */
const getSignedUrl = (fileKey, expiresIn = 3600) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileKey,
    Expires: expiresIn,
  };

  return s3.getSignedUrl('getObject', params);
};

module.exports = {
  s3,
  uploadToS3,
  deleteFromS3,
  getSignedUrl,
};
