const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../models/Product");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function verifyEcoClaim(req, res) {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);
    if (!product || !product.ecoClaim) {
      return res.status(404).json({
        success: false,
        message: "Product not found or not claimed eco-friendly",
      });
    }

    const imageUrl = product.images?.[0];
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Product image is required for verification",
      });
    }

    // Download image and convert to base64
    const base64Image = await fetchImageAsBase64(imageUrl);

    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
      "Does this product appear to be eco-friendly based on visible labels, symbols, packaging, or materials? Answer only 'yes' or 'no' and provide a confidence score out of 100.",
    ]);

    const text = result.response.text().toLowerCase();
    const isEco = text.includes("yes");
    const match = text.match(/(\d{1,3})/); // find confidence score
    const confidence = match ? parseInt(match[1]) : null;

    product.ecoVerified = isEco;
    if (confidence) product.ecoConfidence = confidence;
    await product.save();

    res.json({
      success: true,
      message: isEco
        ? "Eco claim verified successfully"
        : "Eco claim not verified",
      confidence,
    });
  } catch (error) {
    console.error("Eco verify error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// Utility: fetch image and convert to base64
async function fetchImageAsBase64(url) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

module.exports = { verifyEcoClaim };
