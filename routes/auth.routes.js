// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');

// Kayıt
router.post('/register', register);

// Giriş
router.post('/login', login);

module.exports = router;
