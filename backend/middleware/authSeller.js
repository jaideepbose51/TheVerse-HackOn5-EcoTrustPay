import jwt from 'jsonwebtoken';
import Seller from '../models/sellerModel.js';

export const authSeller = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const seller = await Seller.findById(decoded.id);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    if (seller.status !== 'verified') {
      return res.status(403).json({ message: "Seller not verified by admin" });
    }

    req.user = { id: seller._id }; // Attach seller ID for use in controllers
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
