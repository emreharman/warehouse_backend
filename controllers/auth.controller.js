// controllers/auth.controller.js
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// JWT token oluştur
const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Kullanıcı Kaydı
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "E-posta zaten kayıtlı" });

    const user = await User.create({ name, email, password, role });
    const token = generateToken(user);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: "Kayıt sırasında hata oluştu" });
  }
};

// Kullanıcı Girişi
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Geçersiz e-posta ya da şifre" });
    }

    const token = generateToken(user);

    // Şifreyi frontend'e göndermeyelim
    user.password = undefined;

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Giriş sırasında hata oluştu" });
  }
};
