const Customer = require('../models/customer.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// JWT token üret
const generateToken = (customer) => {
  return jwt.sign(
    {
      _id: customer._id,
      name: customer.name,
      email: customer.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ✅ Kayıt
exports.register = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const exists = await Customer.findOne({ email });
    if (exists) return res.status(400).json({ message: 'E-posta zaten kayıtlı' });

    const customer = await Customer.create({ name, email, phone, password });
    const token = generateToken(customer);

    res.status(201).json({
      token,
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Kayıt işlemi başarısız' });
  }
};

// ✅ Giriş
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const customer = await Customer.findOne({ email });
    if (!customer || !(await customer.matchPassword(password))) {
      return res.status(401).json({ message: 'Geçersiz e-posta ya da şifre' });
    }

    const token = generateToken(customer);
    res.json({
      token,
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Giriş işlemi başarısız' });
  }
};

// ✅ Şifremi Unuttum
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(404).json({ message: 'Müşteri bulunamadı' });

    const token = crypto.randomBytes(32).toString('hex');
    customer.resetToken = token;
    customer.resetTokenExpires = Date.now() + 1000 * 60 * 30; // 30 dakika
    await customer.save();

    // Buraya mail gönderme işlemi entegre edebilirsin.
    res.json({ message: 'Şifre sıfırlama bağlantısı gönderildi.', token });
  } catch (error) {
    res.status(500).json({ message: 'Şifre sıfırlama işlemi başarısız' });
  }
};

// ✅ Şifre Yenileme
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const customer = await Customer.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!customer) return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş token' });

    customer.password = newPassword;
    customer.resetToken = undefined;
    customer.resetTokenExpires = undefined;
    await customer.save();

    res.json({ message: 'Şifre başarıyla güncellendi' });
  } catch (error) {
    res.status(500).json({ message: 'Şifre güncellenemedi' });
  }
};

// ✅ Profil Güncelle
exports.updateProfile = async (req, res) => {
  const customerId = req.customer._id;

  try {
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: 'Müşteri bulunamadı' });

    const { name, phone, email, password } = req.body;

    if (name) customer.name = name;
    if (phone) customer.phone = phone;
    if (email) customer.email = email;
    if (password) customer.password = password;

    await customer.save();

    res.json({
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
    });
  } catch (error) {
    res.status(500).json({ message: 'Profil güncellenemedi' });
  }
};

// ✅ Adres Ekle
exports.addAddress = async (req, res) => {
  const customerId = req.customer._id;
  const { label, line1, city, postalCode, country } = req.body;

  try {
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: 'Müşteri bulunamadı' });

    customer.addresses.push({ label, line1, city, postalCode, country });
    await customer.save();

    res.json(customer.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Adres eklenemedi' });
  }
};

// ✅ Adres Güncelle
exports.updateAddress = async (req, res) => {
  const customerId = req.customer._id;
  const addressId = req.params.id;
  const updatedData = req.body;

  try {
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: 'Müşteri bulunamadı' });

    const address = customer.addresses.id(addressId);
    if (!address) return res.status(404).json({ message: 'Adres bulunamadı' });

    Object.assign(address, updatedData);
    await customer.save();

    res.json(customer.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Adres güncellenemedi' });
  }
};

// ✅ Adres Sil
exports.deleteAddress = async (req, res) => {
  const customerId = req.customer._id;
  const addressId = req.params.id;

  try {
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: 'Müşteri bulunamadı' });

    customer.addresses = customer.addresses.filter((addr) => addr._id.toString() !== addressId);
    await customer.save();

    res.json(customer.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Adres silinemedi' });
  }
};

// ✅ Me (profil verilerini getir)
exports.getProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id);
    if (!customer) return res.status(404).json({ message: 'Müşteri bulunamadı' });

    res.json({
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      addresses: customer.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: 'Bilgiler alınamadı' });
  }
};
