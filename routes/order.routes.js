// routes/order.routes.js
const express = require('express');
const router = express.Router();
const {
  createOrderWithCustomer,
  getOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/order.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// 🔓 Public: Müşteri sipariş oluşturur (formdan)
router.post('/', createOrderWithCustomer);

// 🔐 Admin: Sipariş yönetimi
router.get('/', protect, authorizeRoles('admin'), getOrders);
router.get('/:id', protect, authorizeRoles('admin'), getOrder);
router.put('/:id/status', protect, authorizeRoles('admin'), updateOrderStatus);
router.delete('/:id', protect, authorizeRoles('admin'), deleteOrder);

module.exports = router;
