// middleware/authSeller.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Seller from "../model/sellerModel.js";

dotenv.config();

const authSeller = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "seller") {
      return res.status(403).json({ success: false, message: "Unauthorized role" });
    }

    const seller = await Seller.findById(decoded.id).select("-password");
    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    req.seller = seller; // ✅ Attach seller to request
    next(); // ✅ Do not block here
  } catch (err) {
    console.error("Seller auth error:", err.message);
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default authSeller;
