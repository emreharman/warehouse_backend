// controllers/order.controller.js
const axios = require("axios");
const { Order } = require("../models/order.model");
const Customer = require("../models/customer.model");
const sendEmail = require("../utils/sendEmail"); // ✅ Mail gönderici yardımcı fonksiyon
const crypto = require("crypto-js");
const { Shopier } = require("shopier-api");

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
      status: order.status || "pre_payment",
    });

    // 3. Siparişi müşteriye kaydet
    existingCustomer.orders = existingCustomer.orders || [];
    existingCustomer.orders.push(newOrder._id);
    await existingCustomer.save();

    // 4. Müşteriye mail gönder
    // ✅ Müşteri maili
    if (existingCustomer.email) {
      await sendEmail({
        to: existingCustomer.email,
        subject: `#${newOrder._id} numaralı siparişiniz alındı`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Siparişiniz Alındı 🎉</h2>
            <p>Merhaba <strong>${
              existingCustomer.name || "Müşterimiz"
            }</strong>,</p>
            <p>#${newOrder._id} numaralı siparişiniz başarıyla alınmıştır.</p>
            <p><strong>Toplam:</strong> ${newOrder.totalPrice} ₺</p>
            <p><strong>Durum:</strong> ${newOrder.status}</p>
            <p><strong>Not:</strong> ${newOrder.note || "-"}</p>
            <hr />
            <p style="font-size: 13px; color: #888;">ModTee Store</p>
          </div>
        `,
      });
    }

    // 5. Admin'lere mail gönder
    // ✅ Admin maili
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
    for (const adminEmail of adminEmails) {
      await sendEmail({
        to: adminEmail,
        subject: `Yeni Sipariş Oluştu – #${newOrder._id}`,
        html: `
         <div style="font-family: Arial, sans-serif; color: #333;">
           <h2>Yeni Sipariş 🎯</h2>
           <p><strong>Müşteri:</strong> ${existingCustomer.name}</p>
           <p><strong>Telefon:</strong> ${existingCustomer.phone}</p>
           <p><strong>E-posta:</strong> ${existingCustomer.email}</p>
           <p><strong>Sipariş No:</strong> #${newOrder._id}</p>
           <p><strong>Toplam Tutar:</strong> ${newOrder.totalPrice} ₺</p>
           <p><strong>Not:</strong> ${newOrder.note || "-"}</p>
           <hr />
           <p style="font-size: 13px; color: #888;">Kontrol için panele giriş yapabilirsiniz.</p>
         </div>
       `,
      });
    }

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Sipariş oluşturma hatası:", error.message);
    res.status(500).json({ message: "Sipariş oluşturulamadı" });
  }
};

// ✅ Siparişleri getir (admin)
exports.getOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("customer")
    .populate("items.product");
  res.json(orders);
};

// ✅ Tek siparişi getir
exports.getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("customer")
    .populate("items.product");

  if (!order) return res.status(404).json({ message: "Sipariş bulunamadı" });
  res.json(order);
};

// ✅ Sipariş durumu güncelle (admin)
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  if (typeof status !== "string") {
    return res.status(400).json({ message: "Status string olmalı" });
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status }, // status burada artık string
    { new: true }
  ).populate("customer");

  if (!order) {
    return res.status(404).json({ message: "Sipariş bulunamadı" });
  }

  // ✅ Müşteriye durumu bildir
  if (order.customer?.email) {
    await sendEmail({
      to: order.customer.email,
      subject: `Sipariş durumunuz güncellendi – ${status}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>📦 Sipariş Durumu Güncellendi</h2>
          <p>Merhaba <strong>${
            order.customer.name || "Müşterimiz"
          }</strong>,</p>
          <p>#${
            order._id
          } numaralı siparişinizin durumu <strong>${status}</strong> olarak güncellendi.</p>
          <hr />
          <p style="font-size: 13px; color: #888;">Bizi tercih ettiğiniz için teşekkür ederiz.</p>
        </div>
      `,
    });
  }

  res.json(order);
};

// ✅ Siparişi sil (admin)
exports.deleteOrder = async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) return res.status(404).json({ message: "Sipariş bulunamadı" });
  res.json({ message: "Sipariş silindi" });
};

// controllers/order.controller.js

// Ödeme linkini oluşturmak için yeni endpoint
exports.createPaymentLink = async (req, res) => {
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
      status: order.status || "pre_payment",
    });

    // 3. Siparişi müşteriye kaydet
    existingCustomer.orders = existingCustomer.orders || [];
    existingCustomer.orders.push(newOrder._id);
    await existingCustomer.save();

    // 4. Ödeme linkini oluştur (Shopier API ile)
    const shopier = new Shopier(
      process.env.SHOPIER_API_KEY,
      process.env.SHOPIER_API_SECRET
    );
    shopier.setBuyer({
      buyer_id_nr: "010101",
      product_name: "Test",
      buyer_name: "Emre",
      buyer_surname: "Harman",
      buyer_email: "mail@mail.com",
      buyer_phone: "05555555555",
    });
    shopier.setOrderBilling({
      billing_address: "Kennedy Caddesi No:2592",
      billing_city: "Istanbul",
      billing_country: "Türkiye",
      billing_postcode: "34000",
    });
    shopier.setOrderShipping({
      shipping_address: "Kennedy Caddesi No:2592",
      shipping_city: "Istanbul",
      shipping_country: "Türkiye",
      shipping_postcode: "34000",
    });
    const paymentPage = shopier.generatePaymentHTML(15);
    //const paymentLink = await createShopierPaymentLink(newOrder);

    // 5. Ödeme linkini frontend'e gönder
    res.status(201).json({
      order: newOrder,
      paymentLink: paymentPage, // Ödeme linkini frontend'e ilet
    });
  } catch (error) {
    console.error("Ödeme linki oluşturulurken hata:", error.message);
    res.status(500).json({ message: "Ödeme linki oluşturulamadı" });
  }
};

exports.shopierCallback = async (req, res) => {
  const { platform_order_id, signature, status, random_nr } = req.body;
  const shopier = new Shopier(
    process.env.SHOPIER_API_KEY,
    process.env.SHOPIER_API_SECRET
  );

  const callback = shopier.callback(req.body, process.env.SHOPIER_API_SECRET);


  try {
    // Siparişi bul
    const order = await Order.findById(platform_order_id);
    if (!order) return res.status(404).json({ message: "Sipariş bulunamadı" });

    // Ödeme durumu başarılı ise
    if (status === "success") {
      order.status = "paid"; // Ödeme başarılı
      await order.save();
      
      // Müşteriye ödeme onayı gönder (isteğe bağlı)
      if (order.customer?.email) {
        await sendEmail({
          to: order.customer.email,
          subject: `Sipariş Ödeme Durumu – ${status}`,
          html: `<p>Siparişinizin ödemesi başarıyla alınmıştır. Sipariş No: #${order._id}</p>`,
        });
      }

      res.status(200).json({ message: "Ödeme başarılı" });
    } else {
      // Ödeme başarısız ise
      order.status = "failed"; // Ödeme başarısız
      await order.save();
      res.status(400).json({ message: "Ödeme başarısız" });
    }
  } catch (error) {
    console.error("Shopier callback işlenirken hata oluştu:", error.message);
    res.status(500).json({ message: "Hata oluştu, lütfen tekrar deneyin" });
  }
};

// Shopier ile ödeme linki oluşturulması için bir yardımcı fonksiyon
async function createShopierPaymentLink(order) {
  try {
    const shopierData = {
      API_key: process.env.SHOPIER_API_KEY, // .env dosyasından alıyoruz
      website_index: 1, // Web sitesi indexi
      platform_order_id: order._id,
      product_name: "Test", // Siparişin adı
      buyer_name: order.customer.firstName,
      buyer_surname: order.customer.lastName,
      buyer_email: order.customer.email,
      buyer_phone: order.customer.phone,
      total_order_value: order.totalPrice,
      currency: "TRY",
      signature: generateSignature(order), // İmzayı hesapla
    };

    // Shopier ödeme linki oluşturma isteği
    const paymentLinkResponse = await axios.post(
      "https://www.shopier.com/ShowProduct/api_pay4.php",
      shopierData
    );

    // Ödeme linkini döndür
    return paymentLinkResponse.data.payment_url;
  } catch (error) {
    console.log("error?.response", error?.response)?.data;
  }
}

// İmzayı hesaplama fonksiyonu
function generateSignature(order) {
  const data = order._id + order.totalPrice + process.env.SHOPIER_API_KEY;

  const signature = crypto.HmacSHA256(data, process.env.SHOPIER_API_SECRET);

  console.log("Raw Signature (WordArray):", signature);

  const base64Signature = signature.toString(crypto.enc.Base64);

  console.log("Base64 Signature:", base64Signature);

  return base64Signature;
}
