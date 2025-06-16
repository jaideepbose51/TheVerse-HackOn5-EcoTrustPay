import express from 'express';
import {
  registerSeller,
  loginSeller,
  getSellerProfile,
  addAdvancedSellerDetails,
  createCatalogue,
  getCatalogues
} from '../controllers/sellerController.js';
import multer from 'multer';
import { authSeller } from '../middleware/authSeller.js';

const sellerRouter = express.Router();
const upload = multer({ dest: 'uploads/' });

// Auth Routes
sellerRouter.post('/register', registerSeller);
sellerRouter.post('/login', loginSeller);
sellerRouter.get('/profile', authSeller, getSellerProfile);

// Add Advanced Info
sellerRouter.put('/details', authSeller, addAdvancedSellerDetails);

// Catalogue Routes
sellerRouter.post('/catalogue', authSeller, upload.array('images', 50), createCatalogue);
sellerRouter.get('/catalogue', authSeller, getCatalogues);

export default sellerRouter;
