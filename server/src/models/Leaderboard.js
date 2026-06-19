import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    rank: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCarbonSaved: {
      type: Number,
      default: 0,
      min: 0,
      index: -1,
    },
    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
      index: -1,
    },
    monthlyRank: {
      type: Number,
      default: 0,
    },
    monthlyCarbonSaved: {
      type: Number,
      default: 0,
      min: 0,
    },
    streak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActivityDate: {
      type: Date,
      default: null,
    },
    badges: [String],
    region: String,
    tier: {
      type: String,
      enum: ['novice', 'explorer', 'champion', 'legend'],
      default: 'novice',
    },
  },
  {
    timestamps: true,
    indexes: [
      { totalCarbonSaved: -1 },
      { totalPoints: -1 },
      { monthlyRank: 1 },
    ],
  }
);

/**
 * Update leaderboard rankings
 */
leaderboardSchema.statics.updateRankings = async function () {
  const leaderboards = await this.find().sort({ totalCarbonSaved: -1 });

  for (let i = 0; i < leaderboards.length; i++) {
    leaderboards[i].rank = i + 1;

    // Assign tier based on rank
    if (i < 10) leaderboards[i].tier = 'legend';
    else if (i < 100) leaderboards[i].tier = 'champion';
    else if (i < 1000) leaderboards[i].tier = 'explorer';
    else leaderboards[i].tier = 'novice';

    await leaderboards[i].save();
  }
};

/**
 * Get top performers
 */
leaderboardSchema.statics.getTopPerformers = async function (limit = 10) {
  return this.find()
    .sort({ totalCarbonSaved: -1 })
    .limit(limit)
    .populate('userId', 'name avatar email');
};

export const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

/**
 * Achievement Schema
 */
const achievementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Achievement title is required'],
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Achievement description is required'],
    },
    icon: String,
    criteria: {
      type: String,
      enum: [
        'carbon_milestone',
        'mission_complete',
        'streak',
        'daily_login',
        'community',
        'first_carbon',
      ],
      required: true,
    },
    threshold: {
      type: Number,
      required: true,
      min: 0,
    },
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      default: 'common',
    },
    pointsReward: {
      type: Number,
      default: 10,
      min: 0,
    },
  },
  {
    timestamps: true,
    indexes: [{ criteria: 1 }, { rarity: 1 }],
  }
);

export const Achievement = mongoose.model('Achievement', achievementSchema);
