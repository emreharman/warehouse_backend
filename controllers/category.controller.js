// controllers/category.controller.js
const Category = require('../models/category.model');

// Tüm kategorileri getir
exports.getCategories = async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
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
  const { name, description } = req.body;
  const exists = await Category.findOne({ name });
  if (exists) return res.status(400).json({ message: 'Kategori zaten var' });

  const category = await Category.create({ name, description });
  res.status(201).json(category);
};

// Kategori güncelle
exports.updateCategory = async (req, res) => {
  const { name, description } = req.body;
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name, description },
    { new: true }
  );
  if (!category) return res.status(404).json({ message: 'Kategori bulunamadı' });
  res.json(category);
};

// Kategori sil
exports.deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ message: 'Kategori bulunamadı' });
  res.json({ message: 'Kategori silindi' });
};
