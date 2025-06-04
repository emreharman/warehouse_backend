// controllers/category.controller.js
const Category = require('../models/category.model');
const Product = require('../models/product.model');

// Tüm kategorileri getir
exports.getCategories = async (req, res) => {
  const categories = await Category.find().sort({ displayOrder: 1, createdAt: -1 });
  res.json(categories);
};

// Tek kategori getir
exports.getCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: 'Kategori bulunamadı' });
  res.json(category);
};

// Kategori oluştur
exports.createCategory = async (req, res) => {
  const { name, description, displayOrder } = req.body;
  const exists = await Category.findOne({ name });
  if (exists) return res.status(400).json({ message: 'Kategori zaten var' });

  const category = await Category.create({ name, description, displayOrder });
  res.status(201).json(category);
};

// Kategori güncelle
exports.updateCategory = async (req, res) => {
  const { name, description, displayOrder } = req.body;
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name, description, displayOrder },
    { new: true }
  );
  if (!category) return res.status(404).json({ message: 'Kategori bulunamadı' });
  res.json(category);
};

// Kategori sil
exports.deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: 'Kategori bulunamadı' });

  // Kategoriyle ilişkili ürünlerin category alanını null yap
  await Product.updateMany(
    { category: category._id },
    { $unset: { category: "" } }
  );

  await category.deleteOne();

  res.json({ message: 'Kategori silindi ve ürün ilişkileri sıfırlandı' });
};
