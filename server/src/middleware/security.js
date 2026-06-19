import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from '../config/environment.js';

/**
 * Security headers middleware using Helmet
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  noSniff: true,
  xssFilter: true,
  frameguard: { action: 'deny' },
});

/**
 * Rate limiting for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => config.NODE_ENV === 'test',
});

/**
 * Rate limiting for general API endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => config.NODE_ENV === 'test',
});

/**
 * CORS configuration
 */
export const corsConfig = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      config.CLIENT_URL,
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

/**
 * Validate JSON payload
 */
export function validateJsonPayload(req, res, next) {
  if (req.headers['content-type']?.includes('application/json')) {
    const contentLength = parseInt(req.headers['content-length'] || 0);
    if (contentLength > 10 * 1024 * 1024) {
      // 10MB limit
      return res.status(413).json({ error: 'Payload too large' });
    }
  }
  next();
}

/**
 * Sanitize user input
 */
export function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        // Remove potential XSS vectors
        req.body[key] = req.body[key]
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .trim();
      }
    });
  }
  next();
}

export default {
  securityHeaders,
  authLimiter,
  apiLimiter,
  corsConfig,
  validateJsonPayload,
  sanitizeInput,
};
