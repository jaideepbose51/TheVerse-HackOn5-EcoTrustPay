// config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

const connectCloudinary = async () => {
    try {
        const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
            console.warn("⚠️ Cloudinary environment variables are missing or incomplete.");
            return;
        }

        cloudinary.config({
            cloud_name: CLOUDINARY_CLOUD_NAME,
            api_key: CLOUDINARY_API_KEY,
            api_secret: CLOUDINARY_API_SECRET,
        });

        console.log("✅ Cloudinary configured successfully.");
    } catch (error) {
        console.error("❌ Error configuring Cloudinary:", error);
    }
};

export default connectCloudinary;
