// routes/order.routes.js
const express = require("express");
const router = express.Router();
const {
  createOrderWithCustomer,
  getOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder,
  createPaymentLink,
  shopierCallback,
  getCustomerOrders,
  getCustomerOrder
} = require("../controllers/order.controller");

const { protect } = require("../middlewares/auth.middleware");
const { protectCustomer } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require("../middlewares/role.middleware");

// 🔓 Public: Müşteri sipariş oluşturur (formdan)
router.post("/", createOrderWithCustomer);

// 🔐 Customer: Müşteri sadece kendi siparişlerine erişebilir
router.get("/my-orders", protectCustomer, getCustomerOrders); // Müşteri sadece kendi siparişlerini görebilir
router.get("/my-orders/:id", protectCustomer, getCustomerOrder); // Müşteri sadece kendi siparişini görebilir

// Yeni endpoint: Ödeme linki oluştur (public)
router.post("/create-payment-link", createPaymentLink); // Ödeme linki oluşturma
// Geri dönüş URL'si: Shopier'den ödeme durumu bilgilerini almak için (callback)
router.post("/shopier-callback", shopierCallback); // Shopier'den gelen callback

// 🔐 Admin: Sipariş yönetimi
router.get("/", protect, authorizeRoles("admin"), getOrders);
router.get("/:id", protect, authorizeRoles("admin"), getOrder);
router.put("/:id/status", protect, authorizeRoles("admin"), updateOrderStatus);
router.delete("/:id", protect, authorizeRoles("admin"), deleteOrder);

module.exports = router;
