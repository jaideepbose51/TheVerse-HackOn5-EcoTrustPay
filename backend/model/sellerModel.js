import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
  },
  { _id: false }
);

const brandDocumentsSchema = new mongoose.Schema(
  {
    shopImages: [String],
    brandAssociations: [String],
    purchaseBills: [String],
    gstNumber: {
      type: String,
      required: function () {
        return this.sellerType === "branded";
      },
    },
    sourceDetails: String,
  },
  { _id: false }
);

const ecoClaimSchema = new mongoose.Schema(
  {
    source: String, // "AI", "Manual"
    label: String, // e.g., "Recyclable", "Organic"
    confidence: Number, // 0–1 float
    verifiedAt: Date,
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: Number,
    category: String,
    subCategory: String,
    sizes: [String],
    bestseller: { type: Boolean, default: false },
    images: [String],
    createdAt: { type: Date, default: Date.now },

    ecoVerified: { type: Boolean, default: false },
    ecoClaim: { type: ecoClaimSchema, default: {} },
  },
  { _id: true }
);

const sellerSchema = new mongoose.Schema(
  {
    shopName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    address: { type: addressSchema, default: {} },

    sellerType: {
      type: String,
      enum: ["branded", "unbranded"],
      required: true,
    },
    categories: {
      type: [String],
      enum: ["electronics", "fashion", "home", "books", "beauty", "sports"],
      default: [],
    },
    sellsBrands: { type: Boolean, default: false },

    brandDocuments: { type: brandDocumentsSchema, default: {} },

    status: {
      type: String,
      enum: ["pending", "verified", "blocked"],
      default: "pending",
    },

    products: [productSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Seller", sellerSchema);
