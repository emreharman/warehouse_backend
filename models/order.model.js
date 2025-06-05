const mongoose = require('mongoose');

// Alt şema: Ürün varyantı bilgileri
const selectedVariantSchema = new mongoose.Schema({
  color: String,
  size: String,
  quality: String,
  fit: String,
  price: Number,
  discount: Number
}, { _id: false });

// Alt şema: Tasarım metaverisi
const designMetaSchema = new mongoose.Schema({
  side: { type: String, enum: ['front', 'back'] },
  size: { type: String, enum: ['small', 'medium', 'large'] },
  position: { type: String, enum: ['topLeft', 'center', 'topRight'] },
  pixelPosition: {
    x: Number,
    y: Number
  },
  fileName: String,
  finalDesign: String // canvas export edilmiş tasarım görseli (CDN URL)
}, { _id: false });

// Alt şema: Sipariş kalemi
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false // custom siparişlerde olmayabilir
  },
  productType: { type: String },
  selectedVariant: selectedVariantSchema,
  quantity: { type: Number, default: 1 },
  designFiles: [String], // CDN URL'leri
  designMeta: designMetaSchema,
  note: { type: String },
}, { _id: false });

// Ana sipariş şeması
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
      enum: [
        'pre_payment',   // ödeme bekleniyor
        'pending',       // ödeme alındı, işleme alınacak
        'in_progress',   // üretim sürecinde
        'shipped',       // kargoya verildi
        'delivered',     // teslim edildi
        'cancelled'      // iptal edildi
      ],
      default: 'pre_payment'
    },
    totalPrice: Number,
    platform_order_id: { 
      type: String, 
      required: true, // Siparişin platform_order_id'si zorunlu
      unique: true    // Benzersiz olması sağlanır
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = {
  Order: mongoose.model('Order', orderSchema),
  orderItemSchema // bunu da dışa aktar
};
