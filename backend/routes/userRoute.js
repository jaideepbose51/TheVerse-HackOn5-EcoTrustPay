import express from "express";
import validateObjectIds from "../middleware/validateObjectIds.js"; // Changed to default import
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
} from "../controller/userController.js";
import authUser from "../middleware/authUser.js";

const userRouter = express.Router();

// 📦 Show all available products
userRouter.get("/", getAllProducts);

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", authUser, getUserProfile);

// 🛒 Cart routes - Updated to use the middleware
userRouter.post(
  "/cart/add",
  authUser,
  validateObjectIds(["productId", "catalogueId"]), // Now using default import
  addToCart
);

userRouter.get("/cart/get", authUser, getCart);
userRouter.post("/cart/remove", authUser, removeFromCart);

// 🧾 Order routes
userRouter.post("/order", authUser, placeOrder);
userRouter.get("/orders", authUser, getOrders);
userRouter.get("/products/latest", getLatestProducts);

export default userRouter;
