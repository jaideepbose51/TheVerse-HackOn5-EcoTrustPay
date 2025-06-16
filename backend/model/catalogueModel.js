import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  images: {
    type: [String],
    validate: {
      validator: val => val.length === 5,
      message: 'Exactly 5 images required.'
    }
  },
  sizes: [String],
  inStock: { type: Boolean, default: true },
  quantity: { type: Number, default: 0 },
  bestseller: { type: Boolean, default: false },
  date: { type: Date, default: Date.now } // ✅ corrected
});

const catalogueSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ["Electronics", "Clothing", "Home", "Beauty", "Fashion"]
  },
  subCategory: { type: String, required: true },
  date: { type: Date, default: Date.now }, // ✅ corrected
  products: [productSchema]
}, { timestamps: true });

export default mongoose.model('Catalogue', catalogueSchema);
