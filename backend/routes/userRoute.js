import express from "express";
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
} from "../controller/userController.js";
import authUser from "../middleware/authUser.js";

const userRouter = express.Router();

// 📦 Show all available products
userRouter.get("/", getAllProducts);

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", authUser, getUserProfile);

// 🛒 Cart routes
userRouter.post("/cart/add", authUser, addToCart);
userRouter.get("/cart/get", authUser, getCart);
userRouter.post("/cart/remove", authUser, removeFromCart);

// 🧾 Order routes
userRouter.post("/order", authUser, placeOrder);
userRouter.get("/orders", authUser, getOrders);

export default userRouter;
