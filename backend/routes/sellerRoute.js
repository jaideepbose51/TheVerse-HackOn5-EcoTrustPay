// sellerRoute.js
import express from 'express';
import multer from 'multer';
import {
  registerSeller,
  loginSeller,
  getSellerProfile,
  addAdvancedSellerDetails
} from '../controller/sellerController.js';
import {
  createCatalogue,
  getCatalogues
} from '../controller/catalogueController.js';
import { isSeller } from '../middleware/auth.js';

const router = express.Router();

// ✅ One single multer instance for everything
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Seller docs upload (advanced details)
const sellerDocsUpload = upload.fields([
  { name: 'shopImages', maxCount: 5 },
  { name: 'brandAssociations', maxCount: 5 },
  { name: 'purchaseBills', maxCount: 5 }
]);

// 🔁 Routes
router.post('/register', registerSeller);
router.post('/login', loginSeller);
router.get('/profile', isSeller, getSellerProfile);
router.put('/details', isSeller, sellerDocsUpload, addAdvancedSellerDetails);

router.use((req, res, next) => {
  console.log('🧪 Incoming content-type:', req.headers['content-type']);
  next();
});


// ✅ Catalogue upload
router.post(
  '/catalogue',
  isSeller,
  upload.fields([{ name: 'images', maxCount: 50 }]),
  createCatalogue
);

router.get('/catalogue', isSeller, getCatalogues);

export default router;
