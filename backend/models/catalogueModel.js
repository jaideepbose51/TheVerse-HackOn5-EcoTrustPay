import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  images: {
    type: [String],
    required: true,
    validate: {
      validator: function (val) {
        return Array.isArray(val) && val.length === 5;
      },
      message: 'Each product must have exactly 5 images.'
    }
  },
  sizes: { type: [String] },
  inStock: { type: Boolean, default: true },
  quantity: { type: Number, default: 0 },
  bestseller: { type: Boolean, default: false },
  date: { type: Number, required: true }
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
    enum: ['electronics', 'fashion', 'home', 'books', 'beauty', 'sports'],
    required: true
  },
  subCategory: { type: String, required: true },
  products: [productSchema]
}, { timestamps: true });

export default mongoose.model('Catalogue', catalogueSchema);
