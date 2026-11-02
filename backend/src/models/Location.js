const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Tên vị trí là bắt buộc'],
    trim: true
  },
  icon: {
    type: String,
    default: 'medical-bag'
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure compound index
locationSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model('Location', locationSchema);

