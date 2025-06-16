import Seller from "../model/sellerModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ------------------- Registration -------------------
const sellerRegisterSchema = z.object({
  shopName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10).max(15),
  sellerType: z.enum(["branded", "unbranded"]),
});

export const registerSeller = async (req, res) => {
  try {
    const validated = sellerRegisterSchema.parse(req.body);
    const exists = await Seller.findOne({ email: validated.email });
    if (exists)
      return res
        .status(400)
        .json({ success: false, message: "Seller already exists" });

    const hashedPassword = await bcrypt.hash(validated.password, 10);
    const seller = new Seller({ ...validated, password: hashedPassword });
    await seller.save();

    const token = jwt.sign(
      { id: seller._id, role: "seller" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Seller registered",
      token: `Bearer ${token}`,
      seller: {
        id: seller._id,
        shopName: seller.shopName,
        email: seller.email,
        sellerType: seller.sellerType,
        status: seller.status,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// ------------------- Login -------------------
export const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;
    const seller = await Seller.findOne({ email });
    if (!seller)
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, seller.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: seller._id, role: "seller" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token: `Bearer ${token}`,
      seller: {
        id: seller._id,
        shopName: seller.shopName,
        email: seller.email,
        sellerType: seller.sellerType,
        status: seller.status,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

// ------------------- Get Seller Profile -------------------
export const getSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.user.id).select("-password");
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    res.json(seller);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Advanced Details -------------------
export const addAdvancedSellerDetails = async (req, res) => {
  try {
    const seller = await Seller.findById(req.user.id);
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    const { sellerType, categories, sellsBrands, gstNumber, sourceDetails } =
      req.body;

    const uploadGroup = async (groupName) => {
      const files = req.files?.[groupName] || [];
      if (!files.length) throw new Error(`No files uploaded for ${groupName}`);

      const urls = [];
      for (let i = 0; i < files.length; i++) {
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const url = await uploadToCloudinary(
              files[i].buffer,
              "seller-docs"
            );
            urls.push(url);
            break;
          } catch (err) {
            if (attempt === 3)
              throw new Error(`Upload failed for ${groupName} file ${i + 1}`);
          }
        }
      }
      return urls;
    };

    const [shopImages, brandAssociations, purchaseBills] = await Promise.all([
      uploadGroup("shopImages"),
      uploadGroup("brandAssociations"),
      uploadGroup("purchaseBills"),
    ]);

    seller.sellerType = sellerType;
    seller.categories = Array.isArray(categories) ? categories : [categories];
    seller.sellsBrands = sellsBrands === "true";

    if (sellerType === "branded") {
      seller.brandDocuments = {
        gstNumber,
        sourceDetails,
        shopImages,
        brandAssociations,
        purchaseBills,
      };
    }

    seller.status = "pending";
    await seller.save();

    res.status(200).json({
      message:
        "Advanced seller details submitted successfully. Awaiting admin verification.",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to submit advanced seller details",
      error: err.message,
    });
  }
};

// ------------------- Add Product -------------------
const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  price: z.preprocess((val) => Number(val), z.number().positive()),
  category: z.string().min(2),
  subCategory: z.string().min(2).optional(),
  sizes: z.preprocess(
    (val) => (typeof val === "string" ? JSON.parse(val) : val),
    z.array(z.string()).optional()
  ),
  bestseller: z.preprocess(
    (val) => val === "true" || val === true,
    z.boolean().optional()
  ),
});

export const addProduct = async (req, res) => {
  try {
    const validated = productSchema.parse(req.body);

    const imagesFiles = [
      ...(req.files?.image1 || []),
      ...(req.files?.image2 || []),
      ...(req.files?.image3 || []),
      ...(req.files?.image4 || []),
    ].filter(Boolean);

    if (imagesFiles.length === 0)
      return res
        .status(400)
        .json({
          success: false,
          message: "At least one product image is required",
        });

    if (imagesFiles.length > 4)
      return res
        .status(400)
        .json({ success: false, message: "Maximum 4 product images allowed" });

    const imageUrls = [];
    for (let i = 0; i < imagesFiles.length; i++) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const url = await uploadToCloudinary(
            imagesFiles[i].buffer,
            "product-images"
          );
          imageUrls.push(url);
          break;
        } catch (error) {
          if (attempt === 3) throw new Error(`Failed to upload image ${i + 1}`);
        }
      }
    }

    const seller = await Seller.findById(req.user.id);
    if (!seller)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });

    seller.products.push({
      ...validated,
      images: imageUrls,
      createdAt: new Date(),
    });
    await seller.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      products: seller.products,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ------------------- Get Own Seller's Products -------------------
export const getSellerProducts = async (req, res) => {
  try {
    const seller = await Seller.findById(req.user.id);
    if (!seller)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });

    res.status(200).json({
      success: true,
      products: seller.products,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------- Public Product List -------------------
export const listAllProducts = async (req, res) => {
  try {
    const sellers = await Seller.find({ status: "verified" }).select(
      "products"
    );
    const allProducts = sellers.flatMap((s) =>
      s.products.map((p) => ({ ...p.toObject(), sellerId: s._id }))
    );

    res.status(200).json({
      success: true,
      products: allProducts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
