// models/order.model.js
const mongoose = require('mongoose');

const selectedVariantSchema = new mongoose.Schema({
  color: String,
  size: String,
  quality: String,
  fit: String,
  price: Number,
  discount: Number
});

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false // custom siparişlerde null olabilir
  },
  selectedVariant: selectedVariantSchema,
  quantity: { type: Number, default: 1 },
  designFiles: [String] // CDN URL’leri
});

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    type: {
      type: String,
      enum: ['custom', 'standard'],
      default: 'custom'
    },
    items: [orderItemSchema],
    note: { type: String },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    totalPrice: Number,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
