// routes/variantOption.routes.js
const express = require('express');
const router = express.Router();
const {
  getActiveOptions,
  getAllOptions,
  createOption,
  updateOption,
  deleteOption
} = require('../controllers/variantOption.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// 🔓 Public (müşteriler vs. seçenekleri alır)
router.get('/public', getActiveOptions);

// 🔐 Admin (yönetim paneli için)
router.get('/', protect, authorizeRoles('admin'), getAllOptions);
router.post('/', protect, authorizeRoles('admin'), createOption);
router.put('/:id', protect, authorizeRoles('admin'), updateOption);
router.delete('/:id', protect, authorizeRoles('admin'), deleteOption);

module.exports = router;
