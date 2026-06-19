import { Leaderboard } from '../models/Leaderboard.js';

/**
 * Get global leaderboard
 */
export async function getGlobalLeaderboard(req, res) {
  try {
    const { page = 1, limit = 50, period = 'all' } = req.query;
    const skip = (page - 1) * limit;

    let sortField = 'totalCarbonSaved';
    if (period === 'monthly') {
      sortField = 'monthlyCarbonSaved';
    }

    const leaderboard = await Leaderboard.find()
      .populate('userId', 'name avatar email')
      .sort({ [sortField]: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Leaderboard.countDocuments();

    res.json({
      success: true,
      data: leaderboard.map((entry, index) => ({
        rank: skip + index + 1,
        ...entry.toObject(),
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}

/**
 * Get user's leaderboard position
 */
export async function getUserRank(req, res) {
  try {
    const userId = req.user.userId;

    const userRank = await Leaderboard.findOne({ userId });

    if (!userRank) {
      return res.status(404).json({ error: 'User rank not found' });
    }

    // Get nearby users
    const nearby = await Leaderboard.find()
      .populate('userId', 'name avatar email')
      .sort({ totalCarbonSaved: -1 })
      .lean();

    const userIndex = nearby.findIndex((u) => u.userId._id.toString() === userId);

    const nearbyUsers = nearby.slice(
      Math.max(0, userIndex - 2),
      Math.min(nearby.length, userIndex + 3)
    );

    res.json({
      success: true,
      data: {
        userRank: userRank.rank,
        userTier: userRank.tier,
        totalCarbonSaved: userRank.totalCarbonSaved,
        points: userRank.totalPoints,
        nearbyUsers: nearbyUsers.map((u, idx) => ({
          rank: nearby.indexOf(u) + 1,
          name: u.userId.name,
          avatar: u.userId.avatar,
          carbonSaved: u.totalCarbonSaved,
          tier: u.tier,
        })),
      },
    });
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({ error: 'Failed to fetch user rank' });
  }
}

/**
 * Get top performers
 */
export async function getTopPerformers(req, res) {
  try {
    const { limit = 10 } = req.query;

    const topPerformers = await Leaderboard.getTopPerformers(parseInt(limit));

    res.json({
      success: true,
      data: topPerformers.map((performer, index) => ({
        rank: index + 1,
        name: performer.userId.name,
        avatar: performer.userId.avatar,
        carbonSaved: performer.totalCarbonSaved,
        points: performer.totalPoints,
        tier: performer.tier,
        streak: performer.streak,
      })),
    });
  } catch (error) {
    console.error('Get top performers error:', error);
    res.status(500).json({ error: 'Failed to fetch top performers' });
  }
}

/**
 * Update leaderboard rankings
 */
export async function updateRankings(req, res) {
  try {
    await Leaderboard.updateRankings();

    res.json({
      success: true,
      message: 'Leaderboard rankings updated',
    });
  } catch (error) {
    console.error('Update rankings error:', error);
    res.status(500).json({ error: 'Failed to update rankings' });
  }
}

export default {
  getGlobalLeaderboard,
  getUserRank,
  getTopPerformers,
  updateRankings,
};
