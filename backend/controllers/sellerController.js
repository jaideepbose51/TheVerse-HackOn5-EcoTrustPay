import Seller from '../models/sellerModel.js';
import Catalogue from '../models/catalogueModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Zod Schemas
const sellerRegisterSchema = z.object({
  shopName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10),
});

const advancedDetailsSchema = z.object({
  sellerType: z.enum(['branded', 'unbranded']),
  categories: z.array(z.enum(['electronics', 'fashion', 'home', 'books', 'beauty', 'sports'])),
  sellsBrands: z.boolean(),
  brandDocuments: z.object({
    shopImages: z.array(z.string()).optional(),
    brandAssociations: z.array(z.string()).optional(),
    purchaseBills: z.array(z.string()).optional(),
    gstNumber: z.string().optional(),
    sourceDetails: z.string().optional()
  }).optional()
});

// Register Seller
export const registerSeller = async (req, res) => {
  try {
    const validated = sellerRegisterSchema.parse(req.body);
    const existing = await Seller.findOne({ email: validated.email });
    if (existing) return res.status(400).json({ message: "Seller already exists" });

    const hashedPassword = await bcrypt.hash(validated.password, 10);
    const seller = new Seller({ ...validated, password: hashedPassword });
    await seller.save();

    res.status(201).json({ message: "Seller registered", id: seller._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Login Seller
export const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;
    const seller = await Seller.findOne({ email });
    if (!seller) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, seller.password);
    if (!match) return res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};

// Get Seller Profile
export const getSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.user.id).select('-password');
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    res.json(seller);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add Advanced Seller Details
export const addAdvancedSellerDetails = async (req, res) => {
  try {
    const validated = advancedDetailsSchema.parse(req.body);
    const updated = await Seller.findByIdAndUpdate(
      req.user.id,
      { ...validated },
      { new: true }
    );
    res.json({ message: "Advanced details updated", seller: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Create Catalogue with 5 Images Per Product
export const createCatalogue = async (req, res) => {
  try {
    const { name, category, subCategory, products } = JSON.parse(req.body.data);
    const files = req.files;

    const seller = await Seller.findById(req.user.id);
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    if (!seller.categories.includes(category)) {
      return res.status(403).json({ message: "Not allowed to list in this category" });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Products must be a non-empty array" });
    }

    if (!files || files.length !== products.length * 5) {
      return res.status(400).json({ message: "Each product must have exactly 5 images" });
    }

    const processedProducts = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const productImages = files.slice(i * 5, (i + 1) * 5);
      const uploadedUrls = [];

      for (const img of productImages) {
        const result = await cloudinary.uploader.upload(img.path, {
          folder: 'catalogue-products'
        });
        uploadedUrls.push(result.secure_url);
        fs.unlinkSync(img.path); // Clean up local file
      }

      processedProducts.push({
        ...product,
        images: uploadedUrls
      });
    }

    const newCatalogue = new Catalogue({
      seller: req.user.id,
      name,
      category,
      subCategory,
      products: processedProducts
    });

    await newCatalogue.save();
    res.status(201).json({ message: "Catalogue created", catalogue: newCatalogue });

  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Get All Catalogues for Seller
export const getCatalogues = async (req, res) => {
  try {
    const catalogues = await Catalogue.find({ seller: req.user.id });
    res.json(catalogues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
