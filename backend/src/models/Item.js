const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
    index: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Tên vật phẩm là bắt buộc'],
    trim: true,
    index: 'text'
  },
  barcode: {
    type: String,
    trim: true,
    default: '',
    index: true
  },
  brand: {
    type: String,
    default: '',
    trim: true
  },
  activeIngredient: {
    type: String,
    default: '',
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 0
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  unit: {
    type: String,
    required: [true, 'Đơn vị tính là bắt buộc'],
    default: 'hộp'
  },
  mfgDate: {
    type: Date,
    default: null
  },
  expiryDate: {
    type: Date,
    required: [true, 'Ngày hết hạn là bắt buộc'],
    index: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  note: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['GOOD', 'EXPIRING_SOON', 'EXPIRED'],
    default: 'GOOD',
    index: true
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes
itemSchema.index({ userId: 1, isArchived: 1, expiryDate: 1 });
itemSchema.index({ userId: 1, locationId: 1 });
itemSchema.index({ userId: 1, categoryId: 1 });

// Virtual to calculate dynamic daysRemaining
itemSchema.virtual('daysRemaining').get(function () {
  if (!this.expiryDate) return 0;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const exp = new Date(this.expiryDate);
  const expDay = new Date(exp.getFullYear(), exp.getMonth(), exp.getDate());
  const diffTime = expDay.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Calculate status before saving
itemSchema.pre('save', function (next) {
  if (this.expiryDate) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const exp = new Date(this.expiryDate);
    const expDay = new Date(exp.getFullYear(), exp.getMonth(), exp.getDate());
    const diffDays = Math.ceil((expDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      this.status = 'EXPIRED';
    } else if (diffDays <= 30) {
      this.status = 'EXPIRING_SOON';
    } else {
      this.status = 'GOOD';
    }
  }
  next();
});

module.exports = mongoose.model('Item', itemSchema);

