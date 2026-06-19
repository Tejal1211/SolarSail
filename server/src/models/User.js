import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    avatar: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      select: false,
      minlength: [8, 'Password must be at least 8 characters'],
    },
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio must not exceed 500 characters'],
    },
    
    // Carbon Tracking Stats
    totalCarbonSaved: {
      type: Number,
      default: 0,
      min: 0,
    },
    monthlyTarget: {
      type: Number,
      default: 10,
      min: 0,
    },

    // Gamification
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    achievements: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Achievement',
      },
    ],
    missionsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },

    // Account Management
    isActive: {
      type: Boolean,
      default: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },

    // Preferences
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      leaderboardPublic: { type: Boolean, default: true },
      theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
    },
  },
  {
    timestamps: true,
    indexes: [{ email: 1 }, { googleId: 1 }],
  }
);

/**
 * Hash password before saving if modified
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare password method
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcryptjs.compare(candidatePassword, this.password);
};

/**
 * Hide sensitive data when converting to JSON
 */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
