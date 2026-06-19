import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';

/**
 * Generate JWT token
 */
export function generateToken(userId, email) {
  return jwt.sign(
    { userId, email },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRE }
  );
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password) {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false; // Has uppercase
  if (!/[a-z]/.test(password)) return false; // Has lowercase
  if (!/[0-9]/.test(password)) return false; // Has number
  return true;
}

/**
 * Sanitize user data for response
 */
export function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.__v;
  return obj;
}

/**
 * Format error response
 */
export function formatErrorResponse(error, statusCode = 500) {
  return {
    success: false,
    error: error.message || 'An error occurred',
    statusCode,
  };
}

/**
 * Format success response
 */
export function formatSuccessResponse(data, message = 'Success', statusCode = 200) {
  return {
    success: true,
    message,
    data,
    statusCode,
  };
}

/**
 * Calculate carbon impact level
 */
export function calculateImpactLevel(carbonSaved) {
  if (carbonSaved >= 50) return 'high';
  if (carbonSaved >= 20) return 'medium';
  return 'low';
}

/**
 * Generate achievement unlock notification
 */
export function generateAchievementNotification(achievement, user) {
  return {
    type: 'achievement_unlocked',
    title: `🏆 Achievement Unlocked!`,
    message: `${user.name}, you've unlocked: ${achievement.title}`,
    achievement: {
      id: achievement._id,
      title: achievement.title,
      icon: achievement.icon,
      rarity: achievement.rarity,
    },
  };
}

export default {
  generateToken,
  verifyToken,
  isValidEmail,
  isValidPassword,
  sanitizeUser,
  formatErrorResponse,
  formatSuccessResponse,
  calculateImpactLevel,
  generateAchievementNotification,
};
