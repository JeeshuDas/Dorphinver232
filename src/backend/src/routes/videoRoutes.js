const express = require('express');
const { body } = require('express-validator');
const videoController = require('../controllers/videoController');
const { protect, optionalAuth } = require('../middlewares/auth');
const { uploadLimiter, searchLimiter } = require('../middlewares/rateLimiter');
const { uploadVideoWithThumbnail } = require('../middlewares/upload');
const validate = require('../middlewares/validator');

const router = express.Router();

// Validation rules
const uploadValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
  body('duration').isNumeric().withMessage('Duration must be a number'),
  body('category').isIn(['short', 'long']).withMessage('Category must be short or long'),
];

const updateValidation = [
  body('title').optional().trim().notEmpty().isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
];

const recordViewValidation = [
  body('watchDuration').isNumeric().withMessage('Watch duration must be a number'),
  body('completionPercentage').isNumeric().withMessage('Completion percentage must be a number'),
];

// Public routes
router.get('/feed', optionalAuth, videoController.getFeed);
router.get('/trending', videoController.getTrending);
router.get('/search', searchLimiter, videoController.searchVideos);
router.get('/:id', videoController.getVideo);
router.get('/user/:userId', videoController.getUserVideos);
router.post('/:id/view', optionalAuth, recordViewValidation, validate, videoController.recordView);

// Protected routes
router.post('/upload', protect, uploadLimiter, uploadVideoWithThumbnail, uploadValidation, validate, videoController.uploadVideo);
router.put('/:id', protect, updateValidation, validate, videoController.updateVideo);
router.delete('/:id', protect, videoController.deleteVideo);

module.exports = router;
