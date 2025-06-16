import Catalogue from '../model/catalogueModel.js';
import Seller from '../model/sellerModel.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

export const createCatalogue = async (req, res) => {
  try {
    console.log("🔧 [createCatalogue] Entry point hit");

    const sellerId = req.user.id; // ✅ FIXED
    console.log("👤 Seller ID:", sellerId);

    console.log("📦 req.body:", req.body);
    console.log("📸 req.files:", req.files);

    if (!req.body.data) {
      console.warn("⚠️ Missing 'data' field in req.body");
      return res.status(400).json({ error: 'Missing catalogue data' });
    }

    let parsed;
    try {
      parsed = JSON.parse(req.body.data);
      console.log("✅ Parsed catalogue data:", parsed);
    } catch (err) {
      console.error("❌ Invalid JSON in req.body.data:", err.message);
      return res.status(400).json({ error: 'Invalid JSON format in "data"' });
    }

    const { name, category, subCategory, products } = parsed;

    if (!name || !category || !subCategory || !Array.isArray(products)) {
      console.warn("⚠️ Incomplete catalogue data");
      return res.status(400).json({ error: 'Incomplete catalogue data' });
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      console.error("❌ Seller not found in DB");
      return res.status(404).json({ error: 'Seller not found' });
    }

    if (seller.status !== 'verified') {
      console.warn("🔒 Seller is not verified yet");
      return res.status(403).json({ message: 'Seller not verified by admin yet' });
    }

    const imageFiles = req.files?.images;
    const expectedImageCount = products.length * 5;
    const receivedImageCount = imageFiles?.length || 0;
    console.log(`📸 Expected images: ${expectedImageCount}, Received: ${receivedImageCount}`);

    if (!imageFiles || receivedImageCount !== expectedImageCount) {
      return res.status(400).json({
        message: `Each product must have exactly 5 images. Received ${receivedImageCount} files for ${products.length} products.`,
      });
    }

    const processedProducts = await Promise.all(
      products.map(async (product, index) => {
        const start = index * 5;
        const productImages = imageFiles.slice(start, start + 5);
        console.log(`🖼️ Uploading 5 images for product[${index}]: ${product.title}`);

        const imageUrls = await Promise.all(
          productImages.map(file => uploadToCloudinary(file.buffer, 'catalogue_images'))
        );

        return {
          ...product,
          images: imageUrls,
        };
      })
    );

    const newCatalogue = await Catalogue.create({
      seller: sellerId,
      name,
      category,
      subCategory,
      products: processedProducts,
    });

    console.log("✅ Catalogue saved to DB:", newCatalogue._id);

    res.status(201).json({
      success: true,
      message: 'Catalogue created successfully',
      catalogue: newCatalogue,
    });

  } catch (err) {
    console.error('❌ Error in createCatalogue:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCatalogues = async (req, res) => {
  try {
    console.log("🔍 [getCatalogues] Entry point hit");

    const sellerId = req.user.id; // ✅ FIXED
    console.log("👤 Seller ID:", sellerId);

    const catalogues = await Catalogue.find({ seller: sellerId });
    console.log("📚 Found catalogues:", catalogues.length);

    res.status(200).json({
      success: true,
      message: "Seller catalogues retrieved",
      catalogues
    });
  } catch (err) {
    console.error("❌ Error in getCatalogues:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch catalogues",
      error: err.message
    });
  }
};
