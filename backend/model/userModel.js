import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, default: "" },
    line2: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zipCode: { type: String, default: "" },
    country: { type: String, default: "" },
  },
  { _id: false }
);

const orderProductSchema = new mongoose.Schema(
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
    quantity: {
      type: Number,
      required: true,
    },
    size: {
      type: String,
      default: "one-size",
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    products: [orderProductSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    address: {
      type: addressSchema,
      required: true,
    },
    ecoPoints: {
      type: Number,
      default: 0,
    },
    co2Saved: {
      type: Number,
      default: 0,
    },
    isGroupOrder: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, default: "data:image/png;base64,..." },
    address: { type: addressSchema, default: () => ({}) },
    phone: { type: String, required: true },
    reviews: [
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
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: { type: String, required: true, maxlength: 100 },
        comment: { type: String, required: true, maxlength: 500 },
        images: [String],
        createdAt: { type: Date, default: Date.now },
      },
    ],
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
    orders: [orderSchema],
    totalEcoPoints: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Update totalEcoPoints before saving
userSchema.pre("save", function (next) {
  if (this.isModified("orders")) {
    this.totalEcoPoints = this.orders.reduce(
      (total, order) => total + (order.ecoPoints || 0),
      0
    );
  }
  next();
});

export default mongoose.model("User", userSchema);
