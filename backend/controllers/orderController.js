import Order from '../models/orderModel.js'; // Create if not exists
import stripe from 'stripe';
import Razorpay from 'razorpay';

const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY
});

export const placeOrder = async (req, res) => {
  try {
    const { items, address } = req.body;
    if (!items || !address) return res.status(400).json({ message: 'Missing order data' });

    const order = await Order.create({
      userId: req.user.id,
      items,
      address,
      status: 'placed'
    });

    res.status(201).json({ message: 'Order placed', orderId: order._id });
  } catch {
    res.status(500).json({ message: 'Failed to place order' });
  }
};

export const placeOrderStripe = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount,
      currency
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch {
    res.status(500).json({ message: 'Stripe failed' });
  }
};

export const verifyStripe = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const intent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);
    if (intent.status === 'succeeded') {
      return res.json({ success: true, message: 'Payment verified' });
    }
    res.status(400).json({ success: false, message: 'Payment failed' });
  } catch {
    res.status(500).json({ message: 'Stripe verification failed' });
  }
};

export const placeOrderRazorpay = async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`
    };
    const order = await razorpayInstance.orders.create(options);
    res.json(order);
  } catch {
    res.status(500).json({ message: 'Razorpay failed' });
  }
};

export const userOders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

export const payOnline = async (req, res) => {
  try {
    const { method, orderDetails } = req.body;
    if (!method || !orderDetails) return res.status(400).json({ message: 'Missing payment details' });

    // Mock
    res.status(200).json({ message: 'Payment initiated', method });
  } catch {
    res.status(500).json({ message: 'Payment failed' });
  }
};
