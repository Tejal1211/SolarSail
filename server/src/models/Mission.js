import mongoose from 'mongoose';

const missionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Mission title is required'],
      maxlength: [100, 'Title must not exceed 100 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Mission description is required'],
      maxlength: [500, 'Description must not exceed 500 characters'],
    },
    category: {
      type: String,
      enum: ['transportation', 'electricity', 'food', 'water', 'waste', 'lifestyle'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    carbonReward: {
      type: Number,
      required: [true, 'Carbon reward is required'],
      min: [0, 'Carbon reward cannot be negative'],
    },
    pointsReward: {
      type: Number,
      required: [true, 'Points reward is required'],
      min: [0, 'Points reward cannot be negative'],
    },
    duration: {
      type: String,
      enum: ['1-day', '1-week', '1-month', 'ongoing'],
      default: '1-week',
    },
    steps: [
      {
        stepNumber: Number,
        description: String,
        tips: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    participants: {
      type: Number,
      default: 0,
      min: 0,
    },
    successRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
    indexes: [{ category: 1 }, { difficulty: 1 }, { isActive: 1 }],
  }
);

const missionProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    missionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mission',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'abandoned'],
      default: 'not-started',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    stepsCompleted: [
      {
        stepNumber: Number,
        completedAt: { type: Date, default: Date.now },
      },
    ],
    completedAt: {
      type: Date,
      default: null,
    },
    rewards: {
      claimed: { type: Boolean, default: false },
      carbonRewarded: { type: Number, default: 0 },
      pointsRewarded: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    indexes: [{ userId: 1, missionId: 1 }, { userId: 1, status: 1 }],
  }
);

export const Mission = mongoose.model('Mission', missionSchema);
export const MissionProgress = mongoose.model('MissionProgress', missionProgressSchema);
