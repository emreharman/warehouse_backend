const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      unique: true,
    },
    items: [
      {
        id: { type: String, required: true }, // Özel tasarım ID'si, örneğin: custom-123456789
        name: { type: String, required: true }, // Ürün ismi
        image: { type: String, required: true }, // Ürün görseli URL'si
        price: { type: Number, required: true }, // Ürün fiyatı
        quantity: { type: Number, required: true }, // Ürün adedi
        selectedVariant: {
          type: Map,
          of: String,
          required: false,
          default: {},
        }, // Varyant bilgileri (örneğin renk, beden)
      },
    ], // Burada her bir öğe objedir
    note: String, // Sepet notu (isteğe bağlı)
    totalPrice: Number, // Toplam sepet fiyatı
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
