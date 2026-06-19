import { Mission, MissionProgress } from '../models/Mission.js';
import User from '../models/User.js';

/**
 * Get all available missions
 */
export async function getAllMissions(req, res) {
  try {
    const { category, difficulty, page = 1, limit = 20 } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const skip = (page - 1) * limit;

    const missions = await Mission.find(filter)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Mission.countDocuments(filter);

    res.json({
      success: true,
      data: missions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get missions error:', error);
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
}

/**
 * Get mission details
 */
export async function getMissionDetails(req, res) {
  try {
    const { missionId } = req.params;

    const mission = await Mission.findById(missionId);
    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    res.json({
      success: true,
      data: mission,
    });
  } catch (error) {
    console.error('Get mission error:', error);
    res.status(500).json({ error: 'Failed to fetch mission' });
  }
}

/**
 * Start mission
 */
export async function startMission(req, res) {
  try {
    const { missionId } = req.params;
    const userId = req.user.userId;

    const mission = await Mission.findById(missionId);
    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    const existingProgress = await MissionProgress.findOne({ userId, missionId });
    if (existingProgress && existingProgress.status !== 'abandoned') {
      return res.status(409).json({ error: 'Mission already started' });
    }

    const progress = new MissionProgress({
      userId,
      missionId,
      status: 'in-progress',
    });

    await progress.save();

    mission.participants = (mission.participants || 0) + 1;
    await mission.save();

    res.status(201).json({
      success: true,
      message: 'Mission started',
      data: progress,
    });
  } catch (error) {
    console.error('Start mission error:', error);
    res.status(500).json({ error: 'Failed to start mission' });
  }
}

/**
 * Complete mission step
 */
export async function completeMissionStep(req, res) {
  try {
    const { missionId } = req.params;
    const { stepNumber } = req.body;
    const userId = req.user.userId;

    const progress = await MissionProgress.findOne({ userId, missionId });
    if (!progress) {
      return res.status(404).json({ error: 'Mission not started' });
    }

    const mission = await Mission.findById(missionId);
    const stepIndex = stepNumber - 1;

    if (stepIndex >= mission.steps.length) {
      return res.status(400).json({ error: 'Invalid step number' });
    }

    // Check if step already completed
    const alreadyCompleted = progress.stepsCompleted.some((s) => s.stepNumber === stepNumber);
    if (alreadyCompleted) {
      return res.status(409).json({ error: 'Step already completed' });
    }

    progress.stepsCompleted.push({
      stepNumber,
      completedAt: new Date(),
    });

    progress.progress = Math.round((progress.stepsCompleted.length / mission.steps.length) * 100);

    if (progress.progress === 100) {
      progress.status = 'completed';
      progress.completedAt = new Date();

      // Award rewards
      const user = await User.findById(userId);
      user.totalCarbonSaved += mission.carbonReward;
      user.points += mission.pointsReward;
      user.missionsCompleted += 1;

      progress.rewards = {
        claimed: true,
        carbonRewarded: mission.carbonReward,
        pointsRewarded: mission.pointsReward,
      };

      await user.save();
    }

    await progress.save();

    res.json({
      success: true,
      message: 'Step completed',
      data: progress,
    });
  } catch (error) {
    console.error('Complete step error:', error);
    res.status(500).json({ error: 'Failed to complete step' });
  }
}

/**
 * Get user's mission progress
 */
export async function getUserMissions(req, res) {
  try {
    const userId = req.user.userId;
    const { status = 'all', page = 1, limit = 10 } = req.query;

    const filter = { userId };
    if (status !== 'all') {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const missions = await MissionProgress.find(filter)
      .populate('missionId')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await MissionProgress.countDocuments(filter);

    res.json({
      success: true,
      data: missions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get user missions error:', error);
    res.status(500).json({ error: 'Failed to fetch user missions' });
  }
}

export default {
  getAllMissions,
  getMissionDetails,
  startMission,
  completeMissionStep,
  getUserMissions,
};
