const express = require('express');
const router = express.Router();
const { register, login, profile } = require('../controllers/authController');
const { googleLogin } = require('../controllers/googleAuthController');
const authMiddleware = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/profile', authMiddleware, profile);

module.exports = router;
