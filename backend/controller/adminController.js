import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Seller from "../model/sellerModel.js";
import Catalogue from "../model/catalogueModel.js";
import { Parser } from "json2csv";

dotenv.config();

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Missing credentials" });

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      return res.status(200).json({
        success: true,
        message: "Admin login successful",
        token,
      });
    }

    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPendingSellers = async (req, res) => {
  const sellers = await Seller.find({ status: "pending" });
  res.json(sellers);
};

export const verifySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await Seller.findById(sellerId);
    if (!seller)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });

    seller.status = "verified";
    await seller.save();

    res.json({ success: true, message: "Seller verified", seller });
  } catch (err) {
    console.error("Verify Seller Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllSellers = async (req, res) => {
  const sellers = await Seller.find().select("-password");
  res.json(sellers);
};

export const getAllCatalogues = async (req, res) => {
  const catalogues = await Catalogue.find().populate(
    "seller",
    "shopName email status sellerType"
  );
  res.json(catalogues);
};

export const blockSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const seller = await Seller.findById(sellerId);

    if (!seller)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });

    seller.status = "blocked";
    await seller.save();

    // Optionally: You could also archive or hide the seller's catalogues
    // await Catalogue.updateMany({ seller: sellerId }, { isActive: false });

    res.json({ success: true, message: "Seller blocked successfully", seller });
  } catch (err) {
    console.error("Block Seller Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const unblockSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const seller = await Seller.findById(sellerId);

    if (!seller)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });

    seller.status = "verified";
    await seller.save();

    res.json({
      success: true,
      message: "Seller unblocked successfully",
      seller,
    });
  } catch (err) {
    console.error("Unblock Seller Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Export Sellers to CSV
export const exportSellersCSV = async (req, res) => {
  try {
    const sellers = await Seller.find().select("-password");
    const parser = new Parser();
    const csv = parser.parse(sellers);

    res.header("Content-Type", "text/csv");
    res.attachment("sellers_report.csv");
    return res.send(csv);
  } catch (error) {
    console.error("CSV export error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to export sellers report" });
  }
};

// Export Catalogues to CSV
export const exportCataloguesCSV = async (req, res) => {
  try {
    const catalogues = await Catalogue.find().populate(
      "seller",
      "shopName email sellerType status"
    );

    const flatData = catalogues.map((cat) => ({
      catalogueId: cat._id,
      sellerName: cat.seller?.shopName || "",
      sellerEmail: cat.seller?.email || "",
      status: cat.seller?.status || "",
      sellerType: cat.seller?.sellerType || "",
      totalProducts: cat.products.length,
    }));

    const parser = new Parser();
    const csv = parser.parse(flatData);

    res.header("Content-Type", "text/csv");
    res.attachment("catalogues_report.csv");
    return res.send(csv);
  } catch (error) {
    console.error("CSV export error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to export catalogues report" });
  }
};
