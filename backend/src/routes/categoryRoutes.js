const express = require('express');
const router = express.Router();
const { getCategories, createCategory } = require('../controllers/categoryController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getCategories);
router.post('/', protect, createCategory);

module.exports = router;

