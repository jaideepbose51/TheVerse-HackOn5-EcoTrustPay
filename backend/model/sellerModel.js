import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  line1: String,
  line2: String,
  city: String,
  state: String,
  pincode: String
}, { _id: false });

const brandDocumentsSchema = new mongoose.Schema({
  shopImages: [String],
  brandAssociations: [String],
  purchaseBills: [String],
  gstNumber: {
    type: String,
    required: function () { return this.sellerType === 'branded'; }
  },
  sourceDetails: String
}, { _id: false });

const sellerSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  address: { type: addressSchema, default: {} },

  sellerType: {
    type: String,
    enum: ['branded', 'unbranded'],
    required: true
  },
  categories: {
    type: [String],
    enum: ['electronics', 'fashion', 'home', 'books', 'beauty', 'sports'],
    default: []
  },
  sellsBrands: { type: Boolean, default: false },

  brandDocuments: { type: brandDocumentsSchema, default: {} },

  status: {
    type: String,
    enum: ['pending', 'verified', 'blocked'],
    default: 'pending'
  }
}, { timestamps: true });

export default mongoose.model('Seller', sellerSchema);
