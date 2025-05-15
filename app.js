// app.js
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const variantOptionRoutes = require('./routes/variantOption.routes');
const customerRoutes = require('./routes/customer.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes); // ✅ Category route eklendi
app.use('/api/products', productRoutes);
app.use('/api/variant-options', variantOptionRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.send('Backoffice API çalışıyor 🚀');
});

module.exports = app;
