import Seller from "../model/sellerModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Catalogue from "../model/catalogueModel.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to fetch image as base64
const fetchImageAsBase64 = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error("Error fetching image:", error);
    throw new Error("Failed to process product image");
  }
};

// ------------------- Eco Verification -------------------
export const verifyEcoClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await Seller.findById(req.user.id);
    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    const product = seller.products.id(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (!product.images || product.images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Product must have at least one image for verification",
      });
    }

    // Get the first product image
    const imageUrl = product.images[0];
    const imageBase64 = await fetchImageAsBase64(imageUrl);

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepare the prompt
    const prompt = `
      Analyze this product image and determine if the product appears to be eco-friendly based on:
      1. Materials used (recycled, organic, sustainable)
      2. Packaging (minimal, biodegradable, recyclable)
      3. Any visible eco-labels or certifications
      4. Overall environmental impact impression

      Respond in this exact JSON format only:
      {
        "isEcoFriendly": boolean,
        "confidence": number (0-1),
        "reason": string (brief explanation),
        "potentialLabels": array of strings (suggested eco-labels if applicable)
      }
    `;

    // Generate content
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64.split(",")[1], // Remove the data URL prefix
        },
      },
    ]);

    const response = await result.response;
    let text = response.text();

    // Clean the response text to ensure valid JSON
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let ecoAssessment;
    try {
      ecoAssessment = JSON.parse(text);
    } catch (err) {
      console.error("Failed to parse AI response:", text);
      return res.status(500).json({
        success: false,
        message: "Failed to parse AI assessment",
        rawResponse: text,
      });
    }

    // Validate the response structure
    if (
      typeof ecoAssessment.isEcoFriendly !== "boolean" ||
      typeof ecoAssessment.confidence !== "number" ||
      typeof ecoAssessment.reason !== "string"
    ) {
      throw new Error("Invalid AI response format");
    }

    // Update the product
    product.ecoVerified = ecoAssessment.isEcoFriendly;
    product.ecoClaim = {
      source: "AI",
      label: ecoAssessment.potentialLabels?.[0] || "Eco-friendly",
      confidence: ecoAssessment.confidence,
      verifiedAt: new Date(),
    };

    await seller.save();

    res.status(200).json({
      success: true,
      message: "Eco verification completed",
      isEcoFriendly: ecoAssessment.isEcoFriendly,
      reason: ecoAssessment.reason,
      confidence: ecoAssessment.confidence,
    });
  } catch (err) {
    console.error("Eco verification error:", err);
    res.status(500).json({
      success: false,
      message: "Eco verification failed",
      error: err.message,
    });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const sellerId = req.user.id;

    // 1. Find seller and verify product ownership
    const seller = await Seller.findOne({
      _id: sellerId,
      "products._id": productId,
    });

    if (!seller) {
      return res
        .status(404)
        .json({ message: "Product not found for this seller" });
    }

    // 2. Get the product object from seller's product list
    const product = seller.products.find((p) => p._id.toString() === productId);

    if (!product) {
      return res.status(404).json({ message: "Product details not found" });
    }

    // 3. Search through all catalogues and find matching product reviews
    const catalogues = await Catalogue.find({}).populate(
      "products.reviews.userId",
      "name"
    );

    const matchingReviews = [];

    catalogues.forEach((catalogue) => {
      const matchedProduct = catalogue.products.find(
        (p) => p.name === product.name
      );

      if (matchedProduct?.reviews?.length) {
        matchingReviews.push(
          ...matchedProduct.reviews.map((r) => ({
            ...r.toObject(),
            productName: product.name,
            productImages: product.images,
            catalogueId: catalogue._id,
          }))
        );
      }
    });

    // 4. Return the matching reviews
    res.status(200).json({
      success: true,
      reviews: matchingReviews.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
      productDetails: {
        name: product.name,
        price: product.price,
        mainImage: product.images?.[0] || null,
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get reviews",
      error: error.message,
    });
  }
};

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
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    if (!req.body.sellerType || !req.body.categories) {
      return res.status(400).json({
        success: false,
        message: "Seller type and categories are required",
      });
    }

    // Process files
    const processFiles = async (files) => {
      if (!files || files.length === 0) return [];
      const uploadResults = [];

      for (const file of files) {
        try {
          const url = await uploadToCloudinary(file.buffer, "seller-docs");
          uploadResults.push(url);
        } catch (error) {
          console.error("File upload error:", error);
          throw new Error(`Failed to upload file: ${file.originalname}`);
        }
      }

      return uploadResults;
    };

    const [shopImages, brandAssociations, purchaseBills] = await Promise.all([
      processFiles(req.files?.shopImages),
      processFiles(req.files?.brandAssociations),
      processFiles(req.files?.purchaseBills),
    ]);

    // Normalize and validate categories
    let categoriesRaw = req.body.categories;
    let categories = [];

    if (Array.isArray(categoriesRaw)) {
      categories = categoriesRaw;
    } else if (typeof categoriesRaw === "string") {
      try {
        const parsed = JSON.parse(categoriesRaw);
        categories = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        categories = [categoriesRaw]; // Fallback if not JSON
      }
    }

    const allowedCategories = ["fashion", "electronics", "grocery"]; // ✅ Your enum list here
    for (const category of categories) {
      if (!allowedCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category: ${category}`,
        });
      }
    }

    seller.sellerType = req.body.sellerType;
    seller.categories = categories;
    seller.sellsBrands = req.body.sellsBrands === "true";

    if (seller.sellerType === "branded") {
      if (!req.body.gstNumber || !req.body.sourceDetails) {
        return res.status(400).json({
          success: false,
          message:
            "GST number and source details are required for branded sellers",
        });
      }

      seller.brandDocuments = {
        gstNumber: req.body.gstNumber,
        sourceDetails: req.body.sourceDetails,
        shopImages,
        brandAssociations,
        purchaseBills,
        registrationDate: new Date(),
      };
    } else {
      seller.unbrandedDocuments = {
        shopImages,
        purchaseBills,
        registrationDate: new Date(),
      };
    }

    seller.businessAddress = req.body.businessAddress || "";
    seller.businessDescription = req.body.businessDescription || "";
    seller.yearsInBusiness = req.body.yearsInBusiness || 0;
    seller.website = req.body.website || "";
    seller.socialMediaLinks = req.body.socialMediaLinks || {};
    seller.status = "pending";
    seller.verificationSubmittedAt = new Date();

    await seller.save();

    res.status(200).json({
      success: true,
      message: "Verification submitted successfully",
      nextSteps:
        "Your documents are under review. You'll be notified via email.",
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during verification",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
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
  sizes: z.preprocess((val) => {
    if (Array.isArray(val)) return val;
    if (val === "One Size") return ["One Size"];
    try {
      return typeof val === "string" ? JSON.parse(val) : val;
    } catch {
      return [val]; // Fallback to array with the value
    }
  }, z.array(z.string()).optional()),
  bestseller: z.preprocess(
    (val) => val === "true" || val === true,
    z.boolean().optional()
  ),
});

export const addProduct = async (req, res) => {
  try {
    const baseValidated = productSchema.parse(req.body);
    const ecoClaim = req.body.ecoClaim ? JSON.parse(req.body.ecoClaim) : null;
    const ecoVerified =
      req.body.ecoVerified === "true" || req.body.ecoVerified === true;

    const imagesFiles = [
      ...(req.files?.image1 || []),
      ...(req.files?.image2 || []),
      ...(req.files?.image3 || []),
      ...(req.files?.image4 || []),
    ].filter(Boolean);

    if (imagesFiles.length === 0)
      return res.status(400).json({
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

    // ✅ Verified check added here
    if (seller.status !== "verified") {
      console.warn("🔒 Seller is not verified yet");
      return res.status(403).json({
        success: false,
        message: "Seller not verified by admin yet",
      });
    }

    const newProduct = {
      ...baseValidated,
      images: imageUrls,
      ecoVerified,
      createdAt: new Date(),
      isActive: true,
      sellerId: seller._id,
      sellerName: seller.shopName,
    };

    if (ecoClaim) {
      newProduct.ecoClaim = {
        source: ecoClaim.source,
        label: ecoClaim.label,
        confidence: ecoClaim.confidence,
        verifiedAt: ecoClaim.verifiedAt || new Date(),
      };
    }

    seller.products.push(newProduct);
    await seller.save();

    const catalogueProduct = {
      ...newProduct,
      seller: seller._id,
      category: baseValidated.category,
      subCategory: baseValidated.subCategory,
    };

    await Catalogue.findOneAndUpdate(
      { seller: seller._id },
      { $push: { products: catalogueProduct } },
      { upsert: true, new: true }
    );

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
    const sellers = await Seller.find({ status: "verified" }).select("products");
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

export const getSellerById = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id).select("-password");
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    res.status(200).json({
      success: true,
      seller,
    });
  } catch (error) {
    console.error("Error fetching seller by ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// sellerController.js - Add these new controller functions

// Seller replies to a review
export const replyToReview = async (req, res) => {
  try {
    const { catalogueId, productId, reviewId } = req.params;
    const { replyText } = req.body;
    const sellerId = req.user.id;

    // Verify the seller owns the product
    const catalogue = await Catalogue.findOne({
      _id: catalogueId,
      seller: sellerId,
      "products._id": productId,
    });

    if (!catalogue) {
      return res.status(404).json({
        message: "Product not found or you don't have permission",
      });
    }

    const product = catalogue.products.id(productId);
    const review = product.reviews.id(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Add seller reply
    review.sellerReply = {
      text: replyText,
      repliedAt: new Date(),
    };

    await catalogue.save();

    res.status(200).json({
      success: true,
      message: "Reply added successfully",
      review,
    });
  } catch (error) {
    console.error("Reply to review error:", error);
    res.status(500).json({
      message: "Failed to add reply",
      error: error.message,
    });
  }
};

export const getSellerReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const sellerId = req.user.id;

    // Get all catalogues for this seller with populated reviews
    const catalogues = await Catalogue.find({ seller: sellerId })
      .populate("products.reviews.userId", "name")
      .select("products");

    // Extract reviews for the specific product if productId is provided
    let reviews = [];

    catalogues.forEach((catalogue) => {
      catalogue.products.forEach((product) => {
        // If productId is specified, only get reviews for that product
        if (!productId || product._id.toString() === productId) {
          product.reviews.forEach((review) => {
            reviews.push({
              ...review.toObject(),
              productId: product._id,
              productName: product.name,
              productImages: product.images,
              catalogueId: catalogue._id,
            });
          });
        }
      });
    });

    // Sort by newest first
    reviews.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Get seller reviews error:", error);
    res.status(500).json({
      message: "Failed to get reviews",
      error: error.message,
    });
  }
};
