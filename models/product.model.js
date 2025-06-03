const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  name: String,
  attributes: {
    color: String,
    size: String,
    quality: String,
    fit: String,
  },
  discount: {
    type: Number,
    default: 0,
  },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    type: {
      type: String,
      enum: ["t", "h", "c", "o"], // t: tişört, h: hoodie, c: çocuk, o: diğer
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    images: [String],
    variants: [variantSchema],
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    tags: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
