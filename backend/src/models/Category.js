const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null means system-wide default
  },
  name: {
    type: String,
    required: [true, 'Tên danh mục là bắt buộc'],
    trim: true
  },
  type: {
    type: String,
    enum: ['MEDICINE', 'FOOD', 'COSMETIC', 'OTHER'],
    required: true,
    default: 'MEDICINE'
  },
  icon: {
    type: String,
    default: 'pill'
  },
  color: {
    type: String,
    default: '#10B981'
  },
  isSystemDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Category', categorySchema);

