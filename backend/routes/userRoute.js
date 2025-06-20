import express from "express";
import validateObjectIds from "../middleware/validateObjectIds.js";
import {
  registerUser,
  loginUser,
  getUserProfile,
  addToCart,
  removeFromCart,
  placeOrder,
  getOrders,
  getCart,
  getAllProducts,
  getLatestProducts,
  getNearbyOrders,
  getUserEcoStats,
  addReview,
  getProductReviews,
} from "../controller/userController.js";
import authUser from "../middleware/authUser.js";

const userRouter = express.Router();

// 📦 Show all available products
userRouter.get("/", getAllProducts);

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", authUser, getUserProfile);

// 🛒 Cart routes
userRouter.post(
  "/cart/add",
  authUser,
  validateObjectIds(["productId", "catalogueId"]),
  addToCart
);

userRouter.get("/cart/get", authUser, getCart);
userRouter.post("/cart/remove", authUser, removeFromCart);

// 🧾 Order routes
userRouter.post("/order", authUser, placeOrder);
userRouter.get("/orders", authUser, getOrders);
userRouter.get("/products/latest", getLatestProducts);

// 🌱 Eco features
userRouter.get("/orders/nearby", authUser, getNearbyOrders);
userRouter.get("/eco-stats", authUser, getUserEcoStats);

// userRoute.js - Add these new routes
userRouter.post("/review", authUser, addReview);
userRouter.get("/reviews/product/:catalogueId/:productId", getProductReviews);

export default userRouter;
