import express from "express";
import multer from "multer";
import {
  registerSeller,
  loginSeller,
  getSellerProfile,
  getSellerProducts,
  addAdvancedSellerDetails,
  addProduct,
  listAllProducts,
  verifyEcoClaim, // Add this import
  getSellerById,
  getSellerReviews,
  replyToReview,
} from "../controller/sellerController.js";
import { isSeller } from "../middleware/auth.js";

const router = express.Router();

// Use memory storage for file uploads (RAM)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Advanced seller details upload (docs)
const sellerDocsUpload = upload.fields([
  { name: "shopImages", maxCount: 5 },
  { name: "brandAssociations", maxCount: 5 },
  { name: "purchaseBills", maxCount: 5 },
]);

// Product image upload (up to 4 images)
const productImagesUpload = upload.fields([
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
  { name: "image4", maxCount: 1 },
]);

// Authenticated seller routes
router.post("/register", registerSeller);
router.post("/login", loginSeller);
router.get("/profile", isSeller, getSellerProfile);
router.put("/details", isSeller, sellerDocsUpload, addAdvancedSellerDetails);
router.post("/product/add", isSeller, productImagesUpload, addProduct);
router.get("/products", isSeller, getSellerProducts);
router.post("/product/verify-eco/:id", isSeller, verifyEcoClaim); // Add this route
router.get("/profile/:id", getSellerById); // Public or protected, your choice

// Public product listing route
router.get("/product/public", listAllProducts);

// sellerRoute.js - Add these new routes
router.post(
  "/review/reply/:catalogueId/:productId/:reviewId",
  isSeller,
  replyToReview
);
router.get("/reviews", isSeller, getSellerReviews);

export default router;
