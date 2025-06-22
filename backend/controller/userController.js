import User from "../model/userModel.js";
import Catalogue from "../model/catalogueModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import mongoose from "mongoose";

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

// ✅ Get Cart
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

// ✅ Add to Cart
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

// ✅ Remove from Cart
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

export const placeOrder = async (req, res) => {
  try {
    const { isGroupOrder = false, address, products } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "No products in order" });
    }

    // Validate address structure
    if (!address || !address.line1 || !address.city || !address.zipCode) {
      return res.status(400).json({ message: "Invalid address format" });
    }

    let total = 0;
    let ecoPoints = 0;
    let co2Saved = 0;
    const orderProducts = [];

    // Process each product
    for (const item of products) {
      const catalogue = await Catalogue.findById(item.catalogueId);
      if (!catalogue) {
        return res.status(404).json({
          message: `Catalogue not found for product ${item.productId}`,
        });
      }

      const product = catalogue.products.id(item.productId);
      if (!product) {
        return res.status(404).json({
          message: `Product ${item.productId} not found in catalogue`,
        });
      }

      // Validate stock
      if (!product.inStock) {
        return res.status(400).json({
          message: `Product ${product.name} is out of stock`,
        });
      }

      // Calculate values
      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      if (product.ecoVerified) {
        ecoPoints += Math.round(itemTotal * 0.1); // 1 point per ₹10
        co2Saved += (product.co2Savings || 0) * item.quantity;
      }

      orderProducts.push({
        productId: item.productId,
        catalogueId: item.catalogueId,
        quantity: item.quantity,
        size: item.size || "one-size",
      });
    }

    // Group order bonus
    if (isGroupOrder) {
      ecoPoints += 50;
      co2Saved += 0.5;
    }

    // Create order
    const order = {
      products: orderProducts,
      totalAmount: total,
      status: "paid",
      address, // Store validated address
      ecoPoints,
      co2Saved,
      isGroupOrder,
      createdAt: new Date(),
    };

    // Save to user
    user.orders.push(order);
    user.cart = [];
    await user.save();

    res.status(201).json({
      message: "Order placed successfully",
      order,
      ecoPoints,
      co2Saved,
    });
  } catch (err) {
    console.error("Order processing error:", err);
    res.status(500).json({
      message: "Order processing failed",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
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

// ✅ Get Nearby Group Orders
export const getNearbyOrders = async (req, res) => {
  try {
    // In a real app, we'd use geolocation or zipcode to find nearby orders
    // For demo, we'll return a mock response for orders within the last 24 hours

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const nearbyOrders = await User.aggregate([
      { $unwind: "$orders" },
      {
        $match: {
          "orders.createdAt": { $gte: twentyFourHoursAgo },
          "orders.isGroupOrder": false, // Only show individual orders that could be grouped
        },
      },
      { $sample: { size: 3 } }, // Get 3 random orders for demo
      {
        $project: {
          _id: 0,
          orderId: "$orders._id",
          products: "$orders.products",
          createdAt: "$orders.createdAt",
          zipCode: "$address.zipCode", // Assuming address has zipCode
        },
      },
    ]);

    if (nearbyOrders.length > 0) {
      // Calculate potential savings if user joins this order
      const potentialSavings = {
        co2Savings: 0.5, // 0.5kg CO2 saved by combining deliveries
        deliveryTimeReduction: 1, // 1 day faster delivery
      };

      res.json({
        available: true,
        details: {
          orders: nearbyOrders,
          potentialSavings,
          zipCode: nearbyOrders[0].zipCode, // Show first order's zipcode
        },
      });
    } else {
      res.json({ available: false });
    }
  } catch (err) {
    console.error("Error finding nearby orders:", err);
    res.status(500).json({ message: "Error checking for group orders" });
  }
};

// ✅ Get User Eco Stats
export const getUserEcoStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const stats = {
      totalEcoPoints: 0,
      totalCO2Saved: 0,
      groupOrderCO2: 0,
      orders: [],
    };

    user.orders.forEach((order) => {
      stats.totalEcoPoints += order.ecoPoints || 0;
      stats.totalCO2Saved += order.co2Saved || 0;

      if (order.isGroupOrder) {
        stats.groupOrderCO2 += 0.5; // Additional savings for group orders
      }

      stats.orders.push({
        id: order._id,
        date: order.createdAt,
        points: order.ecoPoints,
        co2Product: order.co2Saved,
        co2Group: order.isGroupOrder ? 0.5 : 0,
        isGroupOrder: order.isGroupOrder,
        status: order.status,
      });
    });

    // Calculate reward tier
    stats.rewardTier =
      stats.totalEcoPoints >= 200
        ? "Eco Champion"
        : stats.totalEcoPoints >= 100
        ? "Eco Saver"
        : stats.totalEcoPoints >= 50
        ? "Eco Starter"
        : "New Eco User";

    res.json(stats);
  } catch (err) {
    console.error("Error getting eco stats:", err);
    res.status(500).json({ message: "Error fetching eco stats" });
  }
};

// Updated getAllProducts function
export const getAllProducts = async (req, res) => {
  try {
    const catalogues = await Catalogue.find().populate({
      path: "seller",
      select: "name status", // Include status in the populated data
      match: { status: "verified" }, // Only include verified sellers
    });

    const allProducts = [];

    catalogues.forEach((catalogue) => {
      // Skip if seller is not populated (meaning seller is not verified)
      if (!catalogue.seller) return;

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
          ecoVerified: product.ecoVerified,
          co2Savings: product.co2Savings || 0,
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
      {
        $lookup: {
          from: "sellers",
          localField: "seller",
          foreignField: "_id",
          as: "sellerData",
        },
      },
      { $unwind: "$sellerData" },
      { $match: { "sellerData.status": "verified" } }, // Only include verified sellers
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
          sellerName: "$sellerData.shopName",
        },
      },
    ]);

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
// userController.js - Add these new controller functions

export const addReview = async (req, res) => {
  try {
    const { productId, catalogueId, rating, title, comment } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!productId || !catalogueId || !rating || !title || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user has purchased the product
    const user = await User.findById(userId);
    const hasPurchased = user.orders.some((order) =>
      order.products.some(
        (p) =>
          p.productId.toString() === productId &&
          p.catalogueId.toString() === catalogueId
      )
    );

    if (!hasPurchased) {
      return res.status(403).json({
        message: "You must purchase the product before reviewing",
      });
    }

    // Check for existing review
    const catalogue = await Catalogue.findOne({
      _id: catalogueId,
      "products._id": productId,
    });

    if (!catalogue) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = catalogue.products.id(productId);
    const hasReviewed = product.reviews.some(
      (r) => r.userId.toString() === userId
    );

    if (hasReviewed) {
      return res.status(400).json({
        message: "You've already reviewed this product",
      });
    }

    // Create new review
    const newReview = {
      userId,
      rating,
      title,
      comment,
      isVerifiedPurchase: true,
      createdAt: new Date(),
    };

    // Add to product reviews
    product.reviews.push(newReview);

    // Save without validating the entire catalogue
    await catalogue.save({ validateBeforeSave: false });

    // Also add to user's review history
    user.reviews.push({
      productId,
      catalogueId,
      rating,
      title,
      comment,
      createdAt: new Date(),
    });
    await user.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: newReview,
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({
      message: "Failed to add review",
      error: error.message,
    });
  }
};

// Get product reviews
export const getProductReviews = async (req, res) => {
  try {
    const { productId, catalogueId } = req.params;

    const catalogue = await Catalogue.findOne({
      _id: catalogueId,
      "products._id": productId,
    }).populate("products.reviews.userId", "name");

    if (!catalogue) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = catalogue.products.id(productId);
    const reviews = product.reviews.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({
      message: "Failed to get reviews",
      error: error.message,
    });
  }
};
