import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: false }, // Changed to not required
  description: String,
  price: { type: Number, required: false }, // Changed to not required
  images: {
    type: [String],
    validate: {
      validator: function (val) {
        // Only validate if images exist, but don't require exactly 5 for reviews
        return !val || val.length === 0 || val.length === 5;
      },
      message: "Must have exactly 5 images if provided",
    },
  },
  reviews: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      rating: { type: Number, required: true, min: 1, max: 5 },
      title: { type: String, required: true, maxlength: 100 },
      comment: { type: String, required: true, maxlength: 500 },
      images: [String],
      sellerReply: {
        text: String,
        repliedAt: Date,
      },
      isVerifiedPurchase: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  sizes: [String],
  inStock: { type: Boolean, default: true },
  quantity: { type: Number, default: 0 },
  bestseller: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
});

const catalogueSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    name: { type: String, required: false }, // Changed to not required
    category: {
      type: String,
      enum: ["Electronics", "Clothing", "Home", "Beauty", "Fashion"],
    },
    subCategory: { type: String, required: false }, // Changed to not required
    date: { type: Date, default: Date.now },
    products: [productSchema],
  },
  { timestamps: true }
);

// Add this middleware to skip validation when only reviews are being updated
catalogueSchema.pre("save", function (next) {
  if (this.isModified("products.$*.reviews")) {
    this.$ignore("products.$*.name");
    this.$ignore("products.$*.price");
    this.$ignore("products.$*.images");
    this.$ignore("name");
    this.$ignore("subCategory");
  }
  next();
});

export default mongoose.model("Catalogue", catalogueSchema);
