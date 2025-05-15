// routes/customer.routes.js
const express = require('express');
const router = express.Router();
const {
  createCustomer,
  getCustomers,
  getCustomer,
  getCustomerByPhone,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customer.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// 🔓 Public: Sipariş formu gibi yerlerde
router.get('/by-phone/:phone', getCustomerByPhone);

// 🔐 Admin panel işlemleri
router.post('/', protect, authorizeRoles('admin'), createCustomer);
router.get('/', protect, authorizeRoles('admin'), getCustomers);
router.get('/:id', protect, authorizeRoles('admin'), getCustomer);
router.put('/:id', protect, authorizeRoles('admin'), updateCustomer);
router.delete('/:id', protect, authorizeRoles('admin'), deleteCustomer);

module.exports = router;
