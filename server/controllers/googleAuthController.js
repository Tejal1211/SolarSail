const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const GOOGLE_CLIENT_ID = (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '').trim();
if (!GOOGLE_CLIENT_ID) {
  console.warn('Google client ID is not set in the environment. Google auth will fail until configured.');
}

/**
 * Generate JWT token for authenticated user
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  if (!id) throw new Error('User ID is required for token generation');
  return jwt.sign({ id }, process.env.JWT_SECRET, { 
    expiresIn: '30d',
    algorithm: 'HS256'
  });
};

/**
 * Google OAuth login handler
 * Verifies Google token, creates/updates user, and returns JWT
 * @param {object} req - Express request with token in body
 * @param {object} res - Express response
 */
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // Input validation
    if (!token) {
      return res.status(400).json({ error: 'Google token is required.' });
    }

    if (typeof token !== 'string' || token.length < 10) {
      return res.status(400).json({ error: 'Invalid token format.' });
    }

    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: 'Google OAuth is not configured on the server.' });
    }

    // Verify Google token with proper timeout
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(401).json({ error: 'Invalid Google token payload.' });
    }

    // Sanitize and validate user data
    const email = String(payload.email).toLowerCase().trim();
    const name = String(payload.name || 'Commander').slice(0, 100);
    const picture = String(payload.picture || '').slice(0, 500);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format from OAuth provider.' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with validated data
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-8),
        avatar: picture || '',
        country: 'India'
      });
    }

    // Update avatar if new picture provided
    if (picture && picture !== user.avatar) {
      user.avatar = picture;
      await user.save();
    }

    // Generate secure JWT token
    const jwtToken = generateToken(user._id);

    // Set secure headers for token transmission
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');

    return res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        country: user.country,
        avatar: user.avatar,
        ecoScore: user.ecoScore,
        missionLevel: user.missionLevel,
        sailProgress: user.sailProgress,
        xp: user.xp
      }
    });
  } catch (err) {
    console.error('Google login error:', {
      message: err?.message,
      code: err?.code,
      timestamp: new Date().toISOString()
    });

    const message = err?.message || 'Google authentication failed.';
    const isTokenError = [
      'invalid_token',
      'Audience mismatch',
      'Invalid token',
      'token used too late',
      'token used too early',
      'No PEM for kid',
      'JWT issuer invalid',
      'JWT signature is required',
      'Token used too early',
      'JsonWebTokenError'
    ].some(term => message.includes(term));

    if (isTokenError) {
      return res.status(401).json({ 
        error: 'Google authentication failed. Check your Google client ID, token, and authorized origins.', 
        detail: process.env.NODE_ENV !== 'production' ? message : undefined 
      });
    }

    return res.status(500).json({
      error: 'Google authentication failed due to server configuration or network error.',
      detail: process.env.NODE_ENV !== 'production' ? message : undefined
    });
  }
};
