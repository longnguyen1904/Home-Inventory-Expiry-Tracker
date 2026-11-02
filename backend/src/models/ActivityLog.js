const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    default: null
  },
  actionType: {
    type: String,
    enum: ['CREATE', 'CONSUME', 'RESTOCK', 'UPDATE', 'DELETE', 'DISCARD'],
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);

