const mongoose = require("mongoose");
const {orderItemSchema} = require("../models/order.model");

const cartSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      unique: true,
    },
    items: [], // Burada her bir öğe objedir
    note: String, // Sepet notu (isteğe bağlı)
    totalPrice: Number, // Toplam sepet fiyatı
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
