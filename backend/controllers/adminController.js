import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Seller from '../models/sellerModel.js';
import Catalogue from '../models/catalogueModel.js';
dotenv.config();

export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Missing credentials" });
        }

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: "1d" });

            return res.status(200).json({
                success: true,
                message: "Admin login successful",
                token: `Bearer ${token}`
            });
        }

        return res.status(401).json({ success: false, message: "Invalid credentials" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get all pending sellers
export const getPendingSellers = async (req, res) => {
  const sellers = await Seller.find({ status: 'pending' });
  res.json(sellers);
};

// Verify a seller
export const verifySeller = async (req, res) => {
  const { sellerId } = req.body;
  const seller = await Seller.findById(sellerId);
  if (!seller) return res.status(404).json({ message: "Seller not found" });

  seller.status = 'verified';
  await seller.save();

  res.json({ message: "Seller verified", seller });
};

// ✅ Get all sellers (any status)
export const getAllSellers = async (req, res) => {
  const sellers = await Seller.find().select('-password');
  res.json(sellers);
};

// ✅ Get all catalogues with seller info
export const getAllCatalogues = async (req, res) => {
  const catalogues = await Catalogue.find()
    .populate('seller', 'shopName email status sellerType') // Just key fields
    .exec();

  res.json(catalogues);
};
