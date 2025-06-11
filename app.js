const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const variantOptionRoutes = require("./routes/variantOption.routes");
const customerRoutes = require("./routes/customer.routes");
const customerAuthRoutes = require("./routes/customerAuth.routes"); // ✅ Yeni ek
const orderRoutes = require("./routes/order.routes");
const testRoutes = require("./routes/test.route");
const cartRoutes = require("./routes/cart.routes");

const app = express();

// Middleware
app.use(cors({
  origin: ['*'], // izin verilen domainleri belirtin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // izin verilen metodlar
  allowedHeaders: ['Content-Type', 'Authorization'], // izin verilen headerlar
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/variant-options", variantOptionRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/customers-auth", customerAuthRoutes); // ✅ Auth işlemleri için eklendi
app.use("/api/orders", orderRoutes);
app.use("/api", testRoutes);
app.use("/api/customer/cart", cartRoutes);

app.get("/", (req, res) => {
  res.send("Backoffice API çalışıyor 🚀");
});

module.exports = app;
