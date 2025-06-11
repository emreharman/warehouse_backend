const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
} = require('../controllers/cart.controller');

const { protectCustomer } = require('../middlewares/auth.middleware');

// 🔐 Protected: Sadece giriş yapmış müşteri erişebilir
router.get('/', protectCustomer, getCart); // Sepeti getir
router.post('/', protectCustomer, addToCart); // Ürün ekle
router.post('/delete', protectCustomer, removeFromCart); // Ürün çıkar (index)
router.delete('/', protectCustomer, clearCart); // Tüm sepeti temizle

module.exports = router;
