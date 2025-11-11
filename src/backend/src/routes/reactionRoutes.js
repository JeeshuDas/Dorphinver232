const express = require('express');
const { param } = require('express-validator');
const reactionController = require('../controllers/reactionController');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validator');

const router = express.Router();

// Validation rules
const videoIdValidation = [
  param('videoId').isMongoId().withMessage('Invalid video ID'),
];

const commentIdValidation = [
  param('commentId').isMongoId().withMessage('Invalid comment ID'),
];

// Routes
router.post('/:videoId', protect, videoIdValidation, validate, reactionController.toggleVideoLike);
router.post('/comment/:commentId', protect, commentIdValidation, validate, reactionController.toggleCommentLike);
router.get('/video/:videoId/status', protect, reactionController.getVideoLikeStatus);
router.get('/user/liked-videos', protect, reactionController.getUserLikedVideos);
router.delete('/:videoId', protect, videoIdValidation, validate, reactionController.unlikeVideo);

module.exports = router;
