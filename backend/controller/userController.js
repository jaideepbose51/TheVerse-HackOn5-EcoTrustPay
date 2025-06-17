import User from "../model/userModel.js";
import Catalogue from "../model/catalogueModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { z } from "zod";

// 🔐 Zod validation schemas
const passwordSchema = z
  .string()
  .min(8, "Minimum 8 characters")
  .regex(/[A-Z]/, "At least one uppercase letter")
  .regex(/[a-z]/, "At least one lowercase letter")
  .regex(/[0-9]/, "At least one digit");

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: passwordSchema,
  phone: z.string().min(10),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// ✅ Register — returns token too
export const registerUser = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await User.findOne({ email: data.email });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    data.password = await bcrypt.hash(data.password, 10);
    const user = await User.create(data);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "Registered successfully",
      token: `Bearer ${token}`,
    });
  } catch (err) {
    res.status(400).json({ message: err.message || "Invalid input" });
  }
};

// ✅ Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

const getUserCart = async (authToken) => {
  try {
    const res = await axios.get(`${backendUrl}/api/user/cart/get`, {
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
      timeout: 5000, // Add timeout
    });

    if (res.data?.success) {
      setCartItems(res.data.cartData || {});
    } else {
      throw new Error(res.data?.message || "Invalid cart data format");
    }
  } catch (err) {
    console.error("Get cart error:", err);

    // Handle specific error cases
    if (err.response?.status === 401) {
      toast.error("Session expired. Please login again");
      setToken("");
      localStorage.removeItem("token");
    } else if (err.response?.status === 404) {
      setCartItems({}); // Empty cart if not found
    } else {
      toast.error("Failed to load cart. Please refresh the page");
    }

    // Fallback to empty cart
    setCartItems({});
  }
};

export const getCart = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Return empty cart if no items
    if (!user.cart || user.cart.length === 0) {
      return res.status(200).json({ success: true, cartData: {} });
    }

    // Transform cart data
    const cartData = {};
    for (const item of user.cart) {
      if (!cartData[item.productId]) {
        cartData[item.productId] = {};
      }
      cartData[item.productId][item.size || "one-size"] = item.quantity;
    }

    res.status(200).json({ success: true, cartData });
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to get cart",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const {
      productId,
      catalogueId,
      quantity = 1,
      size = "one-size",
    } = req.body;

    // Validate required fields
    if (!productId || !catalogueId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: productId and catalogueId",
      });
    }

    // Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId format",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(catalogueId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid catalogueId format",
      });
    }

    // Verify user exists
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify catalogue exists
    const catalogue = await Catalogue.findById(catalogueId);
    if (!catalogue) {
      return res.status(404).json({
        success: false,
        message: "Catalogue not found",
      });
    }

    // Verify product exists in catalogue
    const product = catalogue.products.id(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found in catalogue",
      });
    }

    // Check stock availability
    if (!product.inStock) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    // Validate size if product has sizes
    if (
      product.sizes &&
      product.sizes.length > 0 &&
      !product.sizes.includes(size)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid size selection",
        availableSizes: product.sizes,
      });
    }

    // Find existing cart item
    const existingItemIndex = user.cart.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.catalogueId.toString() === catalogueId &&
        item.size === size
    );

    // Update or add cart item
    if (existingItemIndex >= 0) {
      user.cart[existingItemIndex].quantity += quantity;
    } else {
      user.cart.push({
        productId: new mongoose.Types.ObjectId(productId),
        catalogueId: new mongoose.Types.ObjectId(catalogueId),
        quantity,
        size,
        addedAt: new Date(),
      });
    }

    // Save changes
    const savedUser = await user.save();

    // Prepare response
    const cartData = {};
    savedUser.cart.forEach((item) => {
      const pid = item.productId.toString();
      if (!cartData[pid]) {
        cartData[pid] = {};
      }
      cartData[pid][item.size] = item.quantity;
    });

    return res.status(200).json({
      success: true,
      message: "Added to cart successfully",
      cartData,
    });
  } catch (err) {
    console.error("Add to cart error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId, catalogueId } = req.body;

    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(
      (item) =>
        !(
          item.productId.toString() === productId &&
          item.catalogueId.toString() === catalogueId
        )
    );

    await user.save();
    res.status(200).json({ message: "Removed from cart", cart: user.cart });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error removing from cart", error: err.message });
  }
};

// ✅ Place Order
export const placeOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.cart.length)
      return res.status(400).json({ message: "Cart is empty" });

    let total = 0;

    for (const item of user.cart) {
      const catalogue = await Catalogue.findById(item.catalogueId);
      const product = catalogue?.products.id(item.productId);
      if (!product)
        return res.status(404).json({ message: "Product not found" });
      total += product.price * item.quantity;
    }

    const order = {
      products: user.cart.map((item) => ({
        productId: item.productId,
        catalogueId: item.catalogueId,
        quantity: item.quantity,
      })),
      totalAmount: total,
      status: "paid",
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
    res
      .status(500)
      .json({ message: "Failed to retrieve orders", error: err.message });
  }
};

// Updated getAllProducts function
export const getAllProducts = async (req, res) => {
  try {
    const catalogues = await Catalogue.find().populate("seller", "name");
    //Error
    const allProducts = [];

    catalogues.forEach((catalogue) => {
      catalogue.products.forEach((product) => {
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
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

// Add this to your userController.js
export const getLatestProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const catalogues = await Catalogue.aggregate([
      { $unwind: "$products" },
      { $sort: { "products.createdAt": -1 } },
      { $limit: limit },
      {
        $project: {
          _id: "$products._id",
          name: "$products.name",
          price: "$products.price",
          images: "$products.images",
          ecoVerified: "$products.ecoVerified",
          createdAt: "$products.createdAt",
          sellerId: "$seller",
          category: "$category",
          subCategory: "$subCategory",
        },
      },
    ]);

    // Populate seller info
    await Catalogue.populate(catalogues, {
      path: "sellerId",
      select: "shopName",
    });

    res.json({
      success: true,
      count: catalogues.length,
      products: catalogues,
    });
  } catch (err) {
    console.error("Error fetching latest products:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch latest products",
    });
  }
};
