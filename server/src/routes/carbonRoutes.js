import express from 'express';
import * as carbonController from '../controllers/carbonController.js';
import { authMiddleware, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware, requireAuth);

/**
 * @route POST /api/carbon/log
 * @desc Log carbon savings
 */
router.post('/log', carbonController.logCarbonSaving);

/**
 * @route GET /api/carbon/stats
 * @desc Get carbon stats
 */
router.get('/stats', carbonController.getCarbonStats);

/**
 * @route GET /api/carbon/history
 * @desc Get carbon tracking history
 */
router.get('/history', carbonController.getCarbonHistory);

/**
 * @route DELETE /api/carbon/:entryId
 * @desc Delete carbon entry
 */
router.delete('/:entryId', carbonController.deleteCarbonEntry);

export default router;
