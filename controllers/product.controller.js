const Product = require('../models/product.model');

// ✅ Tüm ürünleri getir
exports.getProducts = async (req, res) => {
  const products = await Product.find().populate('category');
  res.json(products);
};

// ✅ Tek ürün getir
exports.getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');
  if (!product) return res.status(404).json({ message: 'Ürün bulunamadı' });
  res.json(product);
};

// ✅ Ürün oluştur
exports.createProduct = async (req, res) => {
  const {
    name,
    description,
    category,
    price,
    stock,
    type,
    images,
    variants,
    tags
  } = req.body;

  const product = await Product.create({
    name,
    description,
    category,
    price,
    stock,
    type, // ❗️ Buraya da eklenmeli
    images,
    variants,
    tags,
    createdBy: req.user._id
  });

  res.status(201).json(product);
};

// ✅ Ürün güncelle
exports.updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).populate('category');

  if (!product) return res.status(404).json({ message: 'Ürün bulunamadı' });
  res.json(product);
};

// ✅ Ürün sil
exports.deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Ürün bulunamadı' });
  res.json({ message: 'Ürün silindi' });
};
