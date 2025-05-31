// controllers/order.controller.js
const Order = require('../models/order.model');
const Customer = require('../models/customer.model');
const sendEmail = require('../utils/sendEmail'); // ✅ Mail gönderici yardımcı fonksiyon

// ✅ Sipariş oluştur (müşteriyle birlikte)
exports.createOrderWithCustomer = async (req, res) => {
  const { customer, order } = req.body;

  try {
    // 1. Müşteri bul veya oluştur
    let existingCustomer = await Customer.findOne({ phone: customer.phone });

    if (!existingCustomer) {
      existingCustomer = await Customer.create(customer);
    }

    // 2. Siparişi oluştur
    const newOrder = await Order.create({
      ...order,
      customer: existingCustomer._id,
      status: order.status || 'pre_payment'
    });

    // 3. Siparişi müşteriye kaydet
    existingCustomer.orders = existingCustomer.orders || [];
    existingCustomer.orders.push(newOrder._id);
    await existingCustomer.save();

    // 4. Müşteriye mail gönder
    if (existingCustomer.email) {
      await sendEmail({
        to: existingCustomer.email,
        subject: `#${newOrder._id} numaralı siparişiniz alındı`,
        text: `Merhaba ${existingCustomer.name || 'Müşterimiz'},\n\n#${newOrder._id} numaralı siparişiniz başarıyla alındı. Takip için bizimle iletişime geçebilirsiniz.\n\nTeşekkür ederiz.`
      });
    }

    // 5. Admin'lere mail gönder
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    for (const adminEmail of adminEmails) {
      await sendEmail({
        to: adminEmail,
        subject: `Yeni Sipariş Oluştu – #${newOrder._id}`,
        text: `Yeni bir sipariş oluşturuldu.\n\nMüşteri: ${existingCustomer.name}\nTelefon: ${existingCustomer.phone}\nE-posta: ${existingCustomer.email}\n\nSipariş No: #${newOrder._id}\nToplam Tutar: ${newOrder.totalPrice} TL\n\nDetaylar için panele giriş yapabilirsiniz.`
      });
    }

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Sipariş oluşturma hatası:', error.message);
    res.status(500).json({ message: 'Sipariş oluşturulamadı' });
  }
};


// ✅ Siparişleri getir (admin)
exports.getOrders = async (req, res) => {
  const orders = await Order.find()
    .populate('customer')
    .populate('items.product');
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

  if (typeof status !== 'string') {
    return res.status(400).json({ message: 'Status string olmalı' });
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status }, // status burada artık string
    { new: true }
  ).populate('customer');

  if (!order) {
    return res.status(404).json({ message: 'Sipariş bulunamadı' });
  }

  if (order.customer?.email) {
    await sendEmail({
      to: order.customer.email,
      subject: `Sipariş durumunuz güncellendi – ${status}`,
      text: `Merhaba ${order.customer.name || 'Müşterimiz'},\n\n#${order._id} numaralı siparişinizin durumu "${status}" olarak güncellendi.\n\nBizi tercih ettiğiniz için teşekkür ederiz.`
    });
  }

  res.json(order);
};


// ✅ Siparişi sil (admin)
exports.deleteOrder = async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) return res.status(404).json({ message: 'Sipariş bulunamadı' });
  res.json({ message: 'Sipariş silindi' });
};
