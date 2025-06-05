// routes/order.routes.js
const express = require("express");
const router = express.Router();
const {
  createOrderWithCustomer,
  getOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder,
  createPaymentLink, // Yeni eklenen endpoint
} = require("../controllers/order.controller");

const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// 🔓 Public: Müşteri sipariş oluşturur (formdan)
router.post("/", createOrderWithCustomer);

// Yeni endpoint: Ödeme linki oluştur (public)
router.post("/create-payment-link", createPaymentLink); // Ödeme linki oluşturma

// Ödeme callback'i: Shopier'den ödeme sonucu alındığında
//router.post("/payment-callback", paymentCallback); // Ödeme callback işlemi

// 🔐 Admin: Sipariş yönetimi
router.get("/", protect, authorizeRoles("admin"), getOrders);
router.get("/:id", protect, authorizeRoles("admin"), getOrder);
router.put("/:id/status", protect, authorizeRoles("admin"), updateOrderStatus);
router.delete("/:id", protect, authorizeRoles("admin"), deleteOrder);

module.exports = router;
