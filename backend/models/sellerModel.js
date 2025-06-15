import mongoose from 'mongoose';

// Sub-schema for Address
const addressSchema = new mongoose.Schema({
  line1: { type: String, default: '' },
  line2: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  pincode: { type: String, default: '' }
}, { _id: false });

// Sub-schema for Brand Documents
const brandDocumentsSchema = new mongoose.Schema({
  shopImages: { type: [String], default: [] },
  brandAssociations: { type: [String], default: [] },
  purchaseBills: { type: [String], default: [] },
  gstNumber: {
    type: String,
    validate: {
      validator: function (v) {
        return this.sellerType === 'branded' ? !!v : true;
      },
      message: 'GST Number is required for branded sellers'
    }
  },
  sourceDetails: { type: String, default: '' }
}, { _id: false });

// Seller Schema
const sellerSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '0000000000' },
  address: { type: addressSchema, default: () => ({}) },

  // Seller Details
  sellerType: {
    type: String,
    enum: ['branded', 'unbranded'],
    required: true
  },
  categories: {
    type: [String],
    enum: ['electronics', 'fashion', 'home', 'books', 'beauty', 'sports'], // Extendable
    default: []
  },
  sellsBrands: { type: Boolean, default: false },

  // Branded Seller Specifics
  brandDocuments: { type: brandDocumentsSchema, default: () => ({}) },

  // Seller Status
  status: {
    type: String,
    enum: ['pending', 'verified', 'blocked'],
    default: 'pending'
  }
}, { timestamps: true });


export default mongoose.model('Seller', sellerSchema);
