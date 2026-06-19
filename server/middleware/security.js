/**
 * Security Middleware Configuration
 * Implements CSRF protection, rate limiting, and security headers
 */
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');

// CSRF Protection middleware
const csrfProtection = csrf({ cookie: false });

// Rate limiting for authentication endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req, res) => {
    return req.ip || req.connection.remoteAddress;
  }
});

// Rate limiting for API endpoints (prevent abuse)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per minute
  message: 'Too many API requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

module.exports = {
  csrfProtection,
  authLimiter,
  apiLimiter
};
