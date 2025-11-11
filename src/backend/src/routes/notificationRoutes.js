const express = require('express');
const { body } = require('express-validator');
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validator');

const router = express.Router();

// Validation rules
const updateSettingsValidation = [
  body('likes').optional().isBoolean(),
  body('comments').optional().isBoolean(),
  body('follows').optional().isBoolean(),
  body('mentions').optional().isBoolean(),
];

// All routes are protected
router.use(protect);

// Routes
router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);
router.delete('/', notificationController.deleteAllNotifications);
router.put('/settings', updateSettingsValidation, validate, notificationController.updateSettings);

module.exports = router;
