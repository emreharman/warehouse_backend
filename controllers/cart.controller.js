const Cart = require("../models/cart.model");
const { Product } = require("../models/product.model");

// Sepete ürün eklemek için controller
exports.addToCart = async (req, res) => {
  const { item } = req.body;

  try {
    // 1. Sepeti bul (eğer yoksa yeni sepet oluştur)
    let cart = await Cart.findOne({ customer: req?.customer?._id });

    if (!cart) {
      cart = new Cart({
        customer: req?.customer?._id,
        items: [],
        totalPrice: 0,
      });
    }
    
    cart.items.push(item);
    // 4. Toplam fiyatı güncelle
    cart.totalPrice = cart.items.reduce((total, item) => {
      const itemPrice = item.price || 0; // Ürün fiyatını al
      return total + itemPrice * item.quantity;
    }, 0);

    // 5. Sepeti kaydet
    await cart.save();

    res.status(200).json(cart);
  } catch (err) {
    console.error("Sepet güncellenirken hata oluştu:", err);
    res.status(500).json({ message: "Sepet güncellenirken bir hata oluştu" });
  }
};

// Sepetten ürün silmek için controller
exports.removeFromCart = async (req, res) => {
  const item = req.body;
  const customer=req.customer
  try {
    // 1. Sepeti bul
    let cart = await Cart.findOne({ customer: customer?._id });
    if (!cart) {
      return res.status(404).json({ message: "Sepet bulunamadı" });
    }

    // 2. Ürünü sepetteki ürünler arasından sil
    
    const itemIndex = cart.items.findIndex((i) => i.id === item.id);

    if (itemIndex < 0) {
      return res.status(404).json({ message: "Sepette bu ürün bulunmuyor" });
    }

    cart.items.splice(itemIndex, 1);

    // 4. Sepeti kaydet
    await cart.save();

    res.status(200).json(cart);
  } catch (err) {
    console.error("Sepetten ürün silinirken hata oluştu:", err);
    res
      .status(500)
      .json({ message: "Sepetten ürün silinirken bir hata oluştu" });
  }
};

// Sepeti getir (customer'a ait)
exports.getCart = async (req, res) => {


  try {
    // 1. Sepeti bul
    const cart = await Cart.findOne({ customer: req?.customer?._id });
    
    if (!cart) {
      return res.status(404).json({ message: "Sepet bulunamadı" });
    }

    res.status(200).json(cart);
  } catch (err) {
    console.error("Sepet getirilirken hata oluştu:", err);
    res.status(500).json({ message: "Sepet getirilirken bir hata oluştu" });
  }
};

// 🧹 DELETE /api/cart – Sepeti temizle
// Kullanım: DELETE /api/cart (Authorization: Bearer <token>)
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.customer._id });
    if (!cart) return res.status(404).json({ message: "Sepet bulunamadı" });

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.json({ message: "Sepet temizlendi" });
  } catch (error) {
    res.status(500).json({ message: "Sepet temizlenemedi" });
  }
};
