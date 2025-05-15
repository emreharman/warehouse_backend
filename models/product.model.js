const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: String, // opsiyonel özet: "Siyah / L / Premium / Oversize"
  attributes: {
    color: String,     // örn: Siyah, Beyaz
    size: String,      // örn: S, M, L, XL
    quality: String,   // örn: Standart, Premium
    fit: String        // örn: Normal, Oversize
  },
  price: Number,
  stock: Number,
  discount: {
    type: Number, // yüzdelik indirim: 20 = %20
    default: 0
  }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true }, // "T-shirt - Logo Baskı"
  description: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  images: [String], // CDN'den görsel URL'leri
  variants: [variantSchema],
  tags: [String], // opsiyonel: "erkek", "minimal", "beyaz", vs.
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
