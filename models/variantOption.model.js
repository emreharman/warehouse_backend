const mongoose = require('mongoose');

const variantOptionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['color', 'size', 'quality', 'fit'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('VariantOption', variantOptionSchema);
