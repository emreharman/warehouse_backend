const Cart = require("../models/cart.model");
const { Product } = require("../models/product.model");

// Sepete ürün eklemek için controller
exports.addToCart = async (req, res) => {
  //const { customerId, productId, quantity, variant, note } = req.body;
  console.log(req.body);
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

    // 2. Ürünü bul
    /* const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    } */

    // 3. Sepete ürün ekle (varsa miktarını güncelle)
    /* const itemIndex = cart.items.findIndex(
      (item) => item.id === productId && JSON.stringify(item.selectedVariant) === JSON.stringify(variant)
    ); */

    /* if (itemIndex >= 0) {
      // Eğer ürün varsa, miktarını güncelle
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Yeni ürün ekle
      const newItem = {
        product: productId,
        productType: product.type, // Örneğin tişört, hoodie vb.
        selectedVariant: variant,
        quantity: quantity,
        designFiles: [],
        designMeta: {},
        note: note || "",
      };
      cart.items.push(newItem);
    } */
    console.log("newItem",item);
    
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
  const {item } = req.body;
  const customer=req.customer
  console.log(req.body);
  

  try {
    // 1. Sepeti bul
    let cart = await Cart.findOne({ customer: customer?._id });
    if (!cart) {
      return res.status(404).json({ message: "Sepet bulunamadı" });
    }

    // 2. Ürünü sepetteki ürünler arasından sil
    const itemIndex = cart.items.findIndex((item) => item.id === item.id);

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
