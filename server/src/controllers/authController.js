import User from '../models/User.js';
import { generateToken, isValidEmail, isValidPassword, sanitizeUser } from '../utils/helpers.js';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/environment.js';

const googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);

/**
 * Google OAuth callback
 */
export async function googleAuthCallback(req, res, next) {
  try {
    const { tokenId } = req.body;

    if (!tokenId) {
      return res.status(400).json({ error: 'Token ID is required' });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokenId,
      audience: config.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();

    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Google' });
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        googleId: ticket.getUserId(),
        email,
        name: name || email.split('@')[0],
        avatar: picture,
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = ticket.getUserId();
      await user.save();
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.email);

    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Google authentication failed' });
  }
}

/**
 * Local signup
 */
export async function signup(req, res, next) {
  try {
    const { email, name, password } = req.body;

    // Validate input
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Email, name, and password are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters with uppercase, lowercase, and numbers',
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Create user
    const user = new User({ email, name, password });
    await user.save();

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.email);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
}

/**
 * Local login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.email);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser(req, res, next) {
  try {
    const user = await User.findById(req.user.userId).populate('achievements');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

/**
 * Update user profile
 */
export async function updateProfile(req, res, next) {
  try {
    const { name, bio, preferences } = req.body;
    const userId = req.user.userId;

    const allowedUpdates = ['name', 'bio', 'preferences'];
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

export default {
  googleAuthCallback,
  signup,
  login,
  getCurrentUser,
  updateProfile,
};
