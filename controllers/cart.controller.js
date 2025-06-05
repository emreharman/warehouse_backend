const Cart = require('../models/cart.model');

// 🛒 GET /api/cart – Sepeti getir
// Kullanım: GET /api/cart (Authorization: Bearer <token>)
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.customer._id });
    if (!cart) return res.status(200).json({ items: [], totalPrice: 0 });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Sepet alınamadı' });
  }
};

// ➕ POST /api/cart – Sepete ürün ekle
// Kullanım: POST /api/cart (Authorization: Bearer <token>)
// req.body örneği:
// {
//   "item": {
//     "productType": "t",
//     "selectedVariant": {
//       "color": "siyah",
//       "size": "M",
//       "quality": "premium",
//       "fit": "regular",
//       "price": 249
//     },
//     "quantity": 2,
//     "designFiles": ["https://cdn.supabase.io/..."],
//     "designMeta": {
//       "side": "front",
//       "size": "medium",
//       "position": "center",
//       "pixelPosition": { "x": 100, "y": 80 },
//       "fileName": "design.png",
//       "finalDesign": "https://cdn.supabase.io/..."
//     }
//   }
// }
exports.addToCart = async (req, res) => {
  const { item } = req.body;

  try {
    let cart = await Cart.findOne({ customer: req.customer._id });
    const itemTotal = item?.price * item.quantity || 0;

    if (!cart) {
      // Yeni sepet oluştur
      cart = await Cart.create({
        customer: req.customer._id,
        items: [item],
        totalPrice: itemTotal
      });
    } else {
      // Var olan sepete ekle
      cart.items.push(item);
      cart.totalPrice += itemTotal;
      await cart.save();
    }

    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Ürün sepete eklenemedi' });
  }
};

// ❌ DELETE /api/cart/:itemId – Sepetten ürün kaldır (index'e göre)
// Kullanım: DELETE /api/cart/0 (Authorization: Bearer <token>)
exports.removeFromCart = async (req, res) => {
  const { itemId } = req.params;

  try {
    const cart = await Cart.findOne({ customer: req.customer._id });
    if (!cart) return res.status(404).json({ message: 'Sepet bulunamadı' });

    cart.items.splice(itemId, 1);
    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + (item.selectedVariant?.price || 0) * item.quantity,
      0
    );

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Sepet güncellenemedi' });
  }
};

// 🧹 DELETE /api/cart – Sepeti temizle
// Kullanım: DELETE /api/cart (Authorization: Bearer <token>)
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.customer._id });
    if (!cart) return res.status(404).json({ message: 'Sepet bulunamadı' });

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.json({ message: 'Sepet temizlendi' });
  } catch (error) {
    res.status(500).json({ message: 'Sepet temizlenemedi' });
  }
};
