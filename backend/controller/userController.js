import User from '../model/userModel.js';
import Catalogue from '../model/catalogueModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// 🔐 Zod validation schemas
const passwordSchema = z.string()
  .min(8, 'Minimum 8 characters')
  .regex(/[A-Z]/, 'At least one uppercase letter')
  .regex(/[a-z]/, 'At least one lowercase letter')
  .regex(/[0-9]/, 'At least one digit');

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: passwordSchema,
  phone: z.string().min(10)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// ✅ Register
export const registerUser = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await User.findOne({ email: data.email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    data.password = await bcrypt.hash(data.password, 10);
    const user = await User.create(data);

    res.status(201).json({ message: 'Registered successfully', userId: user._id });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Invalid input' });
  }
};

// ✅ Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token: `Bearer ${token}`
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// 🛒 Add to Cart
export const addToCart = async (req, res) => {
  try {
    const { productId, catalogueId, quantity } = req.body;
    if (!productId || !catalogueId || !quantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(req.user.id);
    const existing = user.cart.find(item =>
      item.productId.toString() === productId && item.catalogueId.toString() === catalogueId
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      user.cart.push({ productId, catalogueId, quantity });
    }

    await user.save();
    res.status(200).json({ message: "Added to cart", cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: "Error adding to cart", error: err.message });
  }
};

// ❌ Remove from Cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId, catalogueId } = req.body;

    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(item =>
      !(item.productId.toString() === productId && item.catalogueId.toString() === catalogueId)
    );

    await user.save();
    res.status(200).json({ message: "Removed from cart", cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: "Error removing from cart", error: err.message });
  }
};

// ✅ Place Order
export const placeOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.cart.length) return res.status(400).json({ message: "Cart is empty" });

    let total = 0;

    for (const item of user.cart) {
      const catalogue = await Catalogue.findById(item.catalogueId);
      const product = catalogue?.products.id(item.productId);
      if (!product) return res.status(404).json({ message: "Product not found" });
      total += product.price * item.quantity;
    }

    const order = {
      products: user.cart.map(item => ({
        productId: item.productId,
        catalogueId: item.catalogueId,
        quantity: item.quantity
      })),
      totalAmount: total,
      status: 'paid'
    };

    user.orders.push(order);
    user.cart = [];
    await user.save();

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Order failed", error: err.message });
  }
};

// 📦 Get All Orders
export const getOrders = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ orders: user.orders });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve orders", error: err.message });
  }
};

// ✅ Get all products from all catalogues
export const getAllProducts = async (req, res) => {
  try {
    const catalogues = await Catalogue.find().populate('seller', 'name'); // populate seller if needed

    const allProducts = [];

    catalogues.forEach(catalogue => {
      catalogue.products.forEach(product => {
        allProducts.push({
          productId: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          images: product.images,
          sizes: product.sizes,
          inStock: product.inStock,
          quantity: product.quantity,
          bestseller: product.bestseller,
          addedOn: product.date,
          category: catalogue.category,
          subCategory: catalogue.subCategory,
          catalogueId: catalogue._id,
          sellerId: catalogue.seller._id,
          sellerName: catalogue.seller.name,
        });
      });
    });

    res.json(allProducts);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};