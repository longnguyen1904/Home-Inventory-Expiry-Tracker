const express = require('express');
const router = express.Router();
const {
  lookupBarcode,
  addBarcodeToCatalog,
  getSampleBarcodes
} = require('../controllers/barcodeController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);
router.get('/samples', getSampleBarcodes);
router.get('/lookup/:code', lookupBarcode);
router.post('/', addBarcodeToCatalog);

module.exports = router;

