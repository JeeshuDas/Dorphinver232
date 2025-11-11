const express = require('express');
const { body, param } = require('express-validator');
const commentController = require('../controllers/commentController');
const { protect } = require('../middlewares/auth');
const { commentLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validator');

const router = express.Router();

// Validation rules
const createCommentValidation = [
  param('videoId').isMongoId().withMessage('Invalid video ID'),
  body('text').trim().notEmpty().withMessage('Comment text is required').isLength({ max: 500 }),
  body('parentComment').optional().isMongoId().withMessage('Invalid parent comment ID'),
];

const updateCommentValidation = [
  body('text').trim().notEmpty().withMessage('Comment text is required').isLength({ max: 500 }),
];

// Routes
router.get('/:videoId', commentController.getComments);
router.get('/:commentId/replies', commentController.getReplies);

// Protected routes
router.post('/:videoId', protect, commentLimiter, createCommentValidation, validate, commentController.createComment);
router.put('/:id', protect, updateCommentValidation, validate, commentController.updateComment);
router.delete('/:id', protect, commentController.deleteComment);
router.post('/:id/like', protect, commentController.likeComment);

module.exports = router;
