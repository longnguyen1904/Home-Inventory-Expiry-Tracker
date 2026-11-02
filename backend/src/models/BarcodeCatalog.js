const mongoose = require('mongoose');

const barcodeCatalogSchema = new mongoose.Schema({
  barcode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
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
  categoryType: {
    type: String,
    enum: ['MEDICINE', 'FOOD', 'COSMETIC', 'OTHER'],
    default: 'MEDICINE'
  },
  unit: {
    type: String,
    default: 'hộp'
  },
  imageUrl: {
    type: String,
    default: ''
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

module.exports = mongoose.model('BarcodeCatalog', barcodeCatalogSchema);

