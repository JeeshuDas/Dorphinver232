const express = require('express');
const { param } = require('express-validator');
const followController = require('../controllers/followController');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validator');

const router = express.Router();

// Validation rules
const userIdValidation = [
  param('creatorId').isMongoId().withMessage('Invalid user ID'),
];

// Routes
router.post('/:creatorId', protect, userIdValidation, validate, followController.toggleFollow);
router.delete('/:creatorId', protect, userIdValidation, validate, followController.unfollow);
router.get('/:userId/status', protect, followController.getFollowStatus);
router.get('/:userId/followers', followController.getFollowers);
router.get('/:userId/following', followController.getFollowing);
router.get('/feed/following', protect, followController.getFollowingFeed);
router.get('/suggestions/users', protect, followController.getSuggestions);

module.exports = router;
