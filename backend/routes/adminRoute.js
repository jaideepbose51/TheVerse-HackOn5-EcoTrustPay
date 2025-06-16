import express from 'express';
import {
  adminLogin,
  getPendingSellers,
  verifySeller,
  getAllSellers,
  getAllCatalogues,
  blockSeller,
  unblockSeller,
  exportSellersCSV,
  exportCataloguesCSV
} from '../controller/adminController.js';
import authAdmin from '../middleware/authAdmin.js';

const adminRouter = express.Router();

adminRouter.post("/login", adminLogin);

adminRouter.get("/sellers/pending", authAdmin, getPendingSellers);
adminRouter.get("/sellers", authAdmin, getAllSellers);
adminRouter.put("/sellers/verify/:sellerId", authAdmin, verifySeller);
adminRouter.put("/sellers/block/:sellerId", authAdmin, blockSeller);
adminRouter.put("/sellers/unblock/:sellerId", authAdmin, unblockSeller);

adminRouter.get("/catalogues", authAdmin, getAllCatalogues);

adminRouter.get("/reports/sellers", authAdmin, exportSellersCSV);
adminRouter.get("/reports/catalogues", authAdmin, exportCataloguesCSV);

export default adminRouter;
