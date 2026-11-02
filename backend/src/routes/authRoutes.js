const express = require('express');
const router = express.Router();
const { register, login, updateFcmToken } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/fcm-token', protect, updateFcmToken);

module.exports = router;

