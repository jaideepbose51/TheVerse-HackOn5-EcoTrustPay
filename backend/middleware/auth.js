import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Seller from '../model/sellerModel.js';

dotenv.config();

export const isSeller = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'seller') {
      return res.status(403).json({ message: 'Access denied: Not a seller' });
    }

    const seller = await Seller.findById(decoded.id);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Attach seller info to req object
    req.user = { id: seller._id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token', error: err.message });
  }
};
