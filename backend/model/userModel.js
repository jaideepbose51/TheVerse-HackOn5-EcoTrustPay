import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  line1: { type: String, default: '' },
  line2: { type: String, default: '' }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, default: 'data:image/png;base64,...' },
  address: { type: addressSchema, default: () => ({}) },
  phone: { type: String, required: true },
  cart: [
  {
    productId: mongoose.Schema.Types.ObjectId,
    catalogueId: mongoose.Schema.Types.ObjectId,
    quantity: { type: Number, default: 1 }
  }
],
orders: [
  {
    products: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        catalogueId: mongoose.Schema.Types.ObjectId,
        quantity: Number
      }
    ],
    totalAmount: Number,
    status: { type: String, enum: ['paid', 'pending'], default: 'paid' },
    createdAt: { type: Date, default: Date.now }
  }
]

}, { timestamps: true });

export default mongoose.model('User', userSchema);
