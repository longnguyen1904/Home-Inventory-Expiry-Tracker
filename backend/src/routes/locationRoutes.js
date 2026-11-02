const express = require('express');
const router = express.Router();
const {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation
} = require('../controllers/locationController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);
router.get('/', getLocations);
router.post('/', createLocation);
router.put('/:id', updateLocation);
router.delete('/:id', deleteLocation);

module.exports = router;

