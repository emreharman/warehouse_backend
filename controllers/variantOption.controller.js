// controllers/variantOption.controller.js
const VariantOption = require('../models/variantOption.model');

// 🔓 Public listeleme (aktif olanlar)
exports.getActiveOptions = async (req, res) => {
  const options = await VariantOption.find({ active: true });
  const grouped = {
    color: [],
    size: [],
    quality: [],
    fit: []
  };

  options.forEach(opt => {
    grouped[opt.type].push(opt.name);
  });

  res.json(grouped);
};

// 🔐 Tümünü listele (admin)
exports.getAllOptions = async (req, res) => {
  const options = await VariantOption.find().sort({ type: 1, name: 1 });
  res.json(options);
};

// ✅ Ekleme
exports.createOption = async (req, res) => {
  const { type, name, active } = req.body;

  const exists = await VariantOption.findOne({ type, name });
  if (exists) return res.status(400).json({ message: 'Bu seçenek zaten mevcut' });

  const option = await VariantOption.create({ type, name, active });
  res.status(201).json(option);
};

// ✅ Güncelleme
exports.updateOption = async (req, res) => {
  const option = await VariantOption.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!option) return res.status(404).json({ message: 'Seçenek bulunamadı' });
  res.json(option);
};

// ✅ Silme (soft delete gibi)
exports.deleteOption = async (req, res) => {
  const option = await VariantOption.findByIdAndDelete(req.params.id);
  if (!option) return res.status(404).json({ message: 'Seçenek bulunamadı' });
  res.json({ message: 'Seçenek silindi' });
};
