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
// controllers/order.controller.js
exports.createPaymentLink = async (req, res) => {
  const { customer, order, address } = req.body;

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
      status: order.status || "pre_payment", // Siparişin durumu
      platform_order_id: order.platform_order_id, // Siparişe platform_order_id'yi ekliyoruz
      totalPrice: order.totalPrice,
      address: address
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

    // Siparişe özel verileri Shopier API'sine ekliyoruz
    shopier.setBuyer({
      buyer_id_nr: existingCustomer?._id,
      product_name: "Özel Tasarım Ürün",
      buyer_name: existingCustomer?.name?.split(" ")?.[0],
      buyer_surname: existingCustomer?.name?.split(" ")?.[1],
      buyer_email: existingCustomer?.email,
      buyer_phone: existingCustomer?.phone,
      platform_order_id: order.platform_order_id,
    });

    shopier.setOrderBilling({
      billing_address: address?.line1,
      billing_city: address?.city,
      billing_country: address?.country,
      billing_postcode: address?.postalCode,
    });

    shopier.setOrderShipping({
      shipping_address: address?.line1,
      shipping_city: address?.city,
      shipping_country: address?.country,
      shipping_postcode: address?.postalCode,
    });

    // Total fiyatı Shopier'e gönderiyoruz
    const paymentPage = shopier.generatePaymentHTML(order?.totalPrice);

    // 5. Ödeme linkini frontend'e gönder
    res.status(201).json({
      order: newOrder,
      paymentLink: paymentPage, // Ödeme sayfası linkini frontend'e ilet
    });
  } catch (error) {
    console.error("Ödeme linki oluşturulurken hata:", error.message);
    res.status(500).json({ message: "Ödeme linki oluşturulamadı" });
  }
};

exports.shopierCallback = async (req, res) => {
  console.log("Callback Request Headers:", req.headers);
  console.log("Callback Request Body:", req.body);

  // Shopier API doğrulaması ve sipariş durumu kontrolü
  const shopier = new Shopier(
    process.env.SHOPIER_API_KEY,
    process.env.SHOPIER_API_SECRET
  );
  const callback = shopier.callback(req?.body);

  try {
    // Siparişi bul
    const order = await Order.findOne({ platform_order_id: callback.order_id });
    if (!order) return res.status(404).json({ message: "Sipariş bulunamadı" });

    // Ödeme durumu başarılı ise
    if (!!callback) {
      order.status = "pending"; // Ödeme başarılı
      await order.save();

      // Müşteriye ödeme onayı gönder
      if (true) {
        await sendEmail({
          to: "emrehrmn@gmail.com",
          subject: `Sipariş Ödeme Durumu – Ödeme Başarılı`,
          html: `<p>Siparişinizin ödemesi başarıyla alınmıştır. Sipariş No: #${order._id}</p>`,
        });
      }

      // Ödeme başarılı olduğunda iframe içinde gösterilecek JavaScript kodu
      return res.status(200).send(`
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 50px;
                background-color: #f9f9f9;
                color: #333;
              }
              h1 {
                color: green;
                font-size: 36px;
                margin-bottom: 20px;
              }
              p {
                font-size: 18px;
                margin-bottom: 30px;
              }
              .btn {
                background-color: #007bff;
                color: white;
                font-size: 16px;
                padding: 10px 20px;
                border-radius: 5px;
                text-decoration: none;
              }
              .btn:hover {
                background-color: #0056b3;
              }
            </style>
          </head>
          <body>
            <h1>Ödeme Başarılı!</h1>
            <p>Bizi tercih ettiğiniz için teşekkür ederiz.</p>
            <p>Siparişiniz başarıyla işleme alındı. Pop up'ı kapatarak alışverişinize devam edebilirsiniz.</p>
          </body>
        </html>
      `);
    } else {
      order.status = "failed"; // Ödeme başarısız
      await order.save();
      return res.status(400).send(`
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 50px;
                background-color: #f9f9f9;
                color: #333;
              }
              h1 {
                color: red;
                font-size: 36px;
                margin-bottom: 20px;
              }
              p {
                font-size: 18px;
                margin-bottom: 30px;
              }
              .btn {
                background-color: #007bff;
                color: white;
                font-size: 16px;
                padding: 10px 20px;
                border-radius: 5px;
                text-decoration: none;
              }
              .btn:hover {
                background-color: #0056b3;
              }
            </style>
          </head>
          <body>
            <h1>Ödeme Başarısız</h1>
            <p>Ödeme başarısız oldu. Lütfen tekrar deneyin.</p>
          </body>
        </html>
      `);
    }
  } catch (error) {
    console.error("Shopier callback işlenirken hata oluştu:", error.message);
    return res
      .status(500)
      .json({ message: "Hata oluştu, lütfen tekrar deneyin" });
  }
};
