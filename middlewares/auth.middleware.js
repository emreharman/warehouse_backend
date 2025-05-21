// middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Customer = require("../models/customer.model");

const protect = async (req, res, next) => {
  let token;

  // Token varsa ve Bearer ile başlıyorsa
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Token'ı çöz
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Kullanıcıyı isteğe ekle (şifre hariç)
      req.user = await User.findById(decoded._id).select("-password");
      next();
    } catch (error) {
      console.error("Token doğrulama hatası:", error.message);
      return res
        .status(401)
        .json({ message: "Yetkisiz erişim - token geçersiz" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Yetkisiz erişim - token yok" });
  }
};

const protectCustomer = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token eksik" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.customer = await Customer.findById(decoded._id).select("-password");
    next();
  } catch (err) {
    res.status(401).json({ message: "Token geçersiz" });
  }
};

module.exports = { protect, protectCustomer };
