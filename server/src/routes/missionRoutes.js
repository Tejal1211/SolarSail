import express from 'express';
import * as missionController from '../controllers/missionController.js';
import { authMiddleware, requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route GET /api/missions
 * @desc Get all available missions
 */
router.get('/', optionalAuth, missionController.getAllMissions);

/**
 * @route GET /api/missions/:missionId
 * @desc Get mission details
 */
router.get('/:missionId', missionController.getMissionDetails);

/**
 * @route POST /api/missions/:missionId/start
 * @desc Start a mission
 */
router.post(
  '/:missionId/start',
  authMiddleware,
  requireAuth,
  missionController.startMission
);

/**
 * @route POST /api/missions/:missionId/step
 * @desc Complete mission step
 */
router.post(
  '/:missionId/step',
  authMiddleware,
  requireAuth,
  missionController.completeMissionStep
);

/**
 * @route GET /api/missions/user/progress
 * @desc Get user's mission progress
 */
router.get(
  '/user/progress',
  authMiddleware,
  requireAuth,
  missionController.getUserMissions
);

export default router;
