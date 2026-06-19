import express from 'express';
import * as leaderboardController from '../controllers/leaderboardController.js';
import { optionalAuth, authMiddleware, requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route GET /api/leaderboard/global
 * @desc Get global leaderboard
 */
router.get('/global', leaderboardController.getGlobalLeaderboard);

/**
 * @route GET /api/leaderboard/top
 * @desc Get top performers
 */
router.get('/top', leaderboardController.getTopPerformers);

/**
 * @route GET /api/leaderboard/user-rank
 * @desc Get user's leaderboard rank
 */
router.get(
  '/user-rank',
  authMiddleware,
  requireAuth,
  leaderboardController.getUserRank
);

/**
 * @route POST /api/leaderboard/update-rankings
 * @desc Update leaderboard rankings (admin)
 */
router.post('/update-rankings', leaderboardController.updateRankings);

export default router;
