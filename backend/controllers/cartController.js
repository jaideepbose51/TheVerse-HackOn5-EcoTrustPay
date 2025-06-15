import User from '../models/userModel.js';

// 🛒 Get Cart
export const getUserCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ cart: user.cartData || {} });
  } catch {
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
};

// 🛒 Add to Cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ message: 'Product ID is required' });

    const user = await User.findById(req.user.id);
    user.cartData[productId] = (user.cartData[productId] || 0) + quantity;
    await user.save();

    res.json({ message: 'Added to cart', cart: user.cartData });
  } catch {
    res.status(500).json({ message: 'Failed to add to cart' });
  }
};

// 🛒 Update Cart
export const updateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || quantity < 0) return res.status(400).json({ message: 'Invalid input' });

    const user = await User.findById(req.user.id);
    if (quantity === 0) delete user.cartData[productId];
    else user.cartData[productId] = quantity;

    await user.save();
    res.json({ message: 'Cart updated', cart: user.cartData });
  } catch {
    res.status(500).json({ message: 'Failed to update cart' });
  }
};
