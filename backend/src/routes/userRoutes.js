const express = require('express');
const router = express.Router();
const { getProfile, updateSettings, updateProfile, changePassword } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/settings', updateSettings);
router.put('/change-password', changePassword);

module.exports = router;

