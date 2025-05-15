const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// 🔓 Public (giriş gerektirmez)
router.get('/', getCategories);
router.get('/:id', getCategory);

// 🔐 Protected: Yalnızca admin/editor
router.post('/', protect, authorizeRoles('admin', 'editor'), createCategory);
router.put('/:id', protect, authorizeRoles('admin', 'editor'), updateCategory);
router.delete('/:id', protect, authorizeRoles('admin'), deleteCategory);

module.exports = router;
