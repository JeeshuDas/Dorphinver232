const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { protect, optionalAuth } = require('../middlewares/auth');
const { searchLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validator');

const router = express.Router();

// Validation rules
const updateAvatarValidation = [
  body('avatar').trim().notEmpty().withMessage('Avatar URL is required').isURL(),
];

// Public routes
router.get('/search', searchLimiter, userController.searchUsers);
router.get('/leaderboard', userController.getLeaderboard);
router.get('/:id', optionalAuth, userController.getUserProfile);
router.get('/username/:username', optionalAuth, userController.getUserByUsername);

// Protected routes
router.get('/:id/analytics', protect, userController.getUserAnalytics);
router.put('/:id/avatar', protect, updateAvatarValidation, validate, userController.updateAvatar);

module.exports = router;
