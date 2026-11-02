const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  consumeItem,
  restockItem
} = require('../controllers/itemController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);
router.get('/', getItems);
router.get('/:id', getItemById);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.patch('/:id/consume', consumeItem);
router.patch('/:id/restock', restockItem);

module.exports = router;
