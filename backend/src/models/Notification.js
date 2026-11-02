const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: [true, 'Tiêu đề thông báo là bắt buộc']
  },
  message: {
    type: String,
    required: [true, 'Nội dung thông báo là bắt buộc']
  },
  type: {
    type: String,
    enum: ['EXPIRY_WARNING', 'EXPIRED', 'SYSTEM'],
    default: 'EXPIRY_WARNING'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
});

notificationSchema.index({ userId: 1, isRead: 1, sentAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

