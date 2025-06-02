const mongoose = require("mongoose");
const { orderItemSchema } = require("./order.model"); // burası önemli

const cartSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      unique: true
    },
    items: [orderItemSchema], // burada tekrar tanımlamıyoruz
    note: String,
    totalPrice: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
