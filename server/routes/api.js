const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/leaderboard', authMiddleware, (req, res) => {
  res.json({ leaderboard: [] });
});

module.exports = router;
