import CarbonTracking from '../models/CarbonTracking.js';
import User from '../models/User.js';
import { Leaderboard } from '../models/Leaderboard.js';

/**
 * Log carbon savings
 */
export async function logCarbonSaving(req, res) {
  try {
    const { category, activity, carbonSaved, unit, notes } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!category || !activity || carbonSaved === undefined) {
      return res.status(400).json({ error: 'Category, activity, and carbonSaved are required' });
    }

    if (carbonSaved < 0) {
      return res.status(400).json({ error: 'Carbon saved cannot be negative' });
    }

    const entry = new CarbonTracking({
      userId,
      category,
      activity,
      carbonSaved,
      unit: unit || 'kg',
      notes,
      impact: carbonSaved >= 50 ? 'high' : carbonSaved >= 20 ? 'medium' : 'low',
    });

    await entry.save();

    // Update user stats
    const user = await User.findById(userId);
    user.totalCarbonSaved += carbonSaved;
    user.points += Math.floor(carbonSaved * 10); // 10 points per kg
    await user.save();

    // Update leaderboard
    let leaderboard = await Leaderboard.findOne({ userId });
    if (!leaderboard) {
      leaderboard = new Leaderboard({ userId });
    }
    leaderboard.totalCarbonSaved += carbonSaved;
    leaderboard.totalPoints += user.points;
    leaderboard.lastActivityDate = new Date();
    await leaderboard.save();

    res.status(201).json({
      success: true,
      message: 'Carbon saving recorded',
      entry,
    });
  } catch (error) {
    console.error('Log carbon error:', error);
    res.status(500).json({ error: 'Failed to log carbon saving' });
  }
}

/**
 * Get user's carbon stats
 */
export async function getCarbonStats(req, res) {
  try {
    const userId = req.user.userId;
    const { year, month } = req.query;

    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const monthlySavings = await CarbonTracking.getMonthlySavings(
      userId,
      currentYear,
      currentMonth
    );

    const yearlySavings = await CarbonTracking.getYearlySavings(userId, currentYear);

    const entries = await CarbonTracking.find({ userId })
      .sort({ date: -1 })
      .limit(10);

    res.json({
      success: true,
      stats: {
        totalCarbonSaved: user.totalCarbonSaved,
        monthlyTarget: user.monthlyTarget,
        points: user.points,
        level: user.level,
        monthlySavings,
        yearlySavings,
        recentEntries: entries,
      },
    });
  } catch (error) {
    console.error('Get carbon stats error:', error);
    res.status(500).json({ error: 'Failed to fetch carbon stats' });
  }
}

/**
 * Get carbon tracking history
 */
export async function getCarbonHistory(req, res) {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, category, sortBy = 'date' } = req.query;

    const skip = (page - 1) * limit;
    const filter = { userId };

    if (category) {
      filter.category = category;
    }

    const entries = await CarbonTracking.find(filter)
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CarbonTracking.countDocuments(filter);

    res.json({
      success: true,
      data: entries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch carbon history' });
  }
}

/**
 * Delete carbon entry
 */
export async function deleteCarbonEntry(req, res) {
  try {
    const { entryId } = req.params;
    const userId = req.user.userId;

    const entry = await CarbonTracking.findById(entryId);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    if (entry.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await CarbonTracking.findByIdAndDelete(entryId);

    // Update user stats
    const user = await User.findById(userId);
    user.totalCarbonSaved = Math.max(0, user.totalCarbonSaved - entry.carbonSaved);
    await user.save();

    res.json({
      success: true,
      message: 'Entry deleted',
    });
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
}

export default {
  logCarbonSaving,
  getCarbonStats,
  getCarbonHistory,
  deleteCarbonEntry,
};
