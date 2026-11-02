const express = require('express');
const router = express.Router();
const { getStatistics } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);
router.get('/statistics', getStatistics);

module.exports = router;

