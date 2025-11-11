const express = require('express');
const { body } = require('express-validator');
const passport = require('passport');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validator');

const router = express.Router();

// Validation rules
const signupValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('displayName').trim().notEmpty().withMessage('Display name is required'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileValidation = [
  body('displayName').optional().trim().notEmpty(),
  body('username').optional().trim().isLength({ min: 3, max: 20 }),
  body('bio').optional().trim().isLength({ max: 200 }),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

// Routes
router.post('/signup', authLimiter, signupValidation, validate, authController.signup);
router.post('/login', authLimiter, loginValidation, validate, authController.login);
router.post('/refresh', authController.refreshToken);

// OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), authController.googleCallback);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/update-profile', protect, updateProfileValidation, validate, authController.updateProfile);
router.put('/change-password', protect, changePasswordValidation, validate, authController.changePassword);
router.delete('/delete-account', protect, authController.deleteAccount);

module.exports = router;
