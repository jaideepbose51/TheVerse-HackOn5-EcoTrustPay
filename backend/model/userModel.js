import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, default: "" },
    line2: { type: String, default: "" },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, default: "data:image/png;base64,..." },
    address: { type: addressSchema, default: () => ({}) },
    phone: { type: String, required: true },
    cart: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Catalogue.products",
          required: true,
        },
        catalogueId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Catalogue",
          required: true,
        },
        size: {
          type: String,
          default: "one-size",
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
