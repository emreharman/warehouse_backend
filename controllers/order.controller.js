// controllers/order.controller.js
const Order = require('../models/order.model');
const Customer = require('../models/customer.model');

// ✅ Sipariş oluştur (müşteriyle birlikte)
exports.createOrderWithCustomer = async (req, res) => {
  const { customer, order } = req.body;

  try {
    let existingCustomer = await Customer.findOne({ phone: customer.phone });

    // Yeni müşteri oluştur
    if (!existingCustomer) {
      existingCustomer = await Customer.create(customer);
    }

    // Siparişi oluştur
    const newOrder = await Order.create({
      ...order,
      customer: existingCustomer._id
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Sipariş oluşturma hatası:', error.message);
    res.status(500).json({ message: 'Sipariş oluşturulamadı' });
  }
};

// ✅ Siparişleri getir (admin)
exports.getOrders = async (req, res) => {
  const orders = await Order.find().populate('customer').populate('items.product');
  res.json(orders);
};

// ✅ Tek siparişi getir
exports.getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer')
    .populate('items.product');

  if (!order) return res.status(404).json({ message: 'Sipariş bulunamadı' });
  res.json(order);
};

// ✅ Sipariş durumu güncelle (admin)
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!order) return res.status(404).json({ message: 'Sipariş bulunamadı' });
  res.json(order);
};

// ✅ Siparişi sil (admin)
exports.deleteOrder = async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) return res.status(404).json({ message: 'Sipariş bulunamadı' });
  res.json({ message: 'Sipariş silindi' });
};
