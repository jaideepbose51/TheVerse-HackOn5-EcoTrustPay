import express from 'express'
import { registerUser, login, getProfile } from "../controllers/userController.js"

const userRouter = express.Router()

userRouter.post("/register", registerUser);
userRouter.post("/login", login);
// userRouter.get("/get-profile", authUser, getProfile);

// cartRouter.post('/get', authUser, getUserCart)
// cartRouter.post('/add', authUser, addToCart)
// cartRouter.post('/update', authUser, updateCart)

// // Payment Features
// orderRouter.post('/place', authUser, placeOrder)
// orderRouter.post('/stripe', authUser, placeOrderStripe)
// orderRouter.post('/razorpay', authUser, placeOrderRazorpay)

// // User Feature
// orderRouter.post('/userorders', authUser, userOders)

// //verify payment
// orderRouter.post('/verifyStripe', authUser, verifyStripe)
// userRouter.post("/pay-online",authUser,payOnline);

export default userRouter