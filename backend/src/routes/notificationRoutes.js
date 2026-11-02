const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  triggerManualCron
} = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);
router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.post('/trigger-cron', triggerManualCron);

module.exports = router;

