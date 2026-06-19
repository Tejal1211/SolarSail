import express from 'express';
import * as authController from '../controllers/authController.js';
import { authMiddleware, requireAuth, optionalAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/security.js';

const router = express.Router();

/**
 * @route POST /api/auth/google
 * @desc Google OAuth callback
 */
router.post('/google', authLimiter, authController.googleAuthCallback);

/**
 * @route POST /api/auth/signup
 * @desc Local signup
 */
router.post('/signup', authLimiter, authController.signup);

/**
 * @route POST /api/auth/login
 * @desc Local login
 */
router.post('/login', authLimiter, authController.login);

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 */
router.get('/me', authMiddleware, requireAuth, authController.getCurrentUser);

/**
 * @route PUT /api/auth/profile
 * @desc Update user profile
 */
router.put('/profile', authMiddleware, requireAuth, authController.updateProfile);

export default router;
