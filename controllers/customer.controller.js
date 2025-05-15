// controllers/customer.controller.js
const Customer = require('../models/customer.model');

// ✅ 1. Yeni müşteri oluştur
exports.createCustomer = async (req, res) => {
  const { name, phone, email, addresses } = req.body;

  try {
    const exists = await Customer.findOne({ phone });
    if (exists) return res.status(400).json({ message: 'Bu telefonla kayıtlı müşteri zaten var' });

    const customer = await Customer.create({ name, phone, email, addresses });
    res.status(201).json(customer);
  } catch (error) {
    console.error('Müşteri oluşturma hatası:', error.message);
    res.status(500).json({ message: 'Müşteri oluşturulamadı' });
  }
};

// ✅ 2. Tüm müşterileri getir (panelde listelerken)
exports.getCustomers = async (req, res) => {
  const customers = await Customer.find().sort({ createdAt: -1 });
  res.json(customers);
};

// ✅ 3. Tek müşteri getir
exports.getCustomer = async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).json({ message: 'Müşteri bulunamadı' });
  res.json(customer);
};

// ✅ 4. Telefonla müşteri getir (sipariş formu için)
exports.getCustomerByPhone = async (req, res) => {
  const customer = await Customer.findOne({ phone: req.params.phone });
  if (!customer) return res.status(404).json({ message: 'Müşteri bulunamadı' });
  res.json(customer);
};

// ✅ 5. Müşteri güncelle
exports.updateCustomer = async (req, res) => {
  const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Müşteri bulunamadı' });
  res.json(updated);
};

// ✅ 6. Müşteri sil
exports.deleteCustomer = async (req, res) => {
  const deleted = await Customer.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Müşteri bulunamadı' });
  res.json({ message: 'Müşteri silindi' });
};
