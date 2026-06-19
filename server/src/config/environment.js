import dotenv from 'dotenv';

dotenv.config();

/**
 * Environment Configuration
 * Validates and provides access to environment variables
 */
export const config = {
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/solarsail',

  // Authentication
  JWT_SECRET: process.env.JWT_SECRET || 'your_secret_key_change_in_production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  VITE_GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID,

  // Google Gemini API
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

/**
 * Validate critical environment variables
 */
export function validateConfig() {
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
  
  if (config.NODE_ENV === 'production') {
    requiredVars.push('GOOGLE_CLIENT_ID', 'GEMINI_API_KEY');
  }

  const missing = requiredVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
    if (config.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  console.log(`✓ Environment configuration loaded for ${config.NODE_ENV}`);
}

export default config;
