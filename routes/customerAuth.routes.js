const express = require('express');
const router = express.Router();
const customerAuthController = require('../controllers/customerAuth.controller');
const { protectCustomer } = require('../middlewares/auth.middleware');

// Auth işlemleri
router.post('/register', customerAuthController.register);
router.post('/login', customerAuthController.login);
router.post('/forgot-password', customerAuthController.forgotPassword);
router.post('/reset-password', customerAuthController.resetPassword);

// Profil işlemleri
router.get('/me', protectCustomer, customerAuthController.getProfile);
router.put('/me', protectCustomer, customerAuthController.updateProfile);

// Adres işlemleri
router.post('/addresses', protectCustomer, customerAuthController.addAddress);
router.put('/addresses/:id', protectCustomer, customerAuthController.updateAddress);
router.delete('/addresses/:id', protectCustomer, customerAuthController.deleteAddress);

module.exports = router;
