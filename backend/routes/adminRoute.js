import express from 'express';
import {
  adminLogin,
  getPendingSellers,
  verifySeller,
  getAllSellers,
  getAllCatalogues
} from '../controllers/adminController.js';
import authAdmin from '../middleware/adminAuth.js';


const adminRouter = express.Router();

// Login
adminRouter.post("/login", adminLogin);

// Seller Management
adminRouter.get("/sellers/pending", authAdmin, getPendingSellers);
adminRouter.put("/sellers/verify", authAdmin, verifySeller);
adminRouter.get("/sellers", authAdmin, getAllSellers);

// Catalogue Monitoring
adminRouter.get("/catalogues", authAdmin, getAllCatalogues);

export default adminRouter;
