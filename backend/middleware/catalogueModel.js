// catalogueModel.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
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
  ecoClaim: {
    source: String,
    label: String,
    confidence: Number,
    verifiedAt: Date,
  },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },
  sellerName: String,
  isActive: { type: Boolean, default: true },
});

const catalogueSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    products: [productSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Catalogue", catalogueSchema);
