import { v2 as cloudinary } from "cloudinary";

const connectCloudinary = async () => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_KEY
        });

        // Simple check to validate config
        if (
            cloudinary.config().cloud_name &&
            cloudinary.config().api_key &&
            cloudinary.config().api_secret
        ) {
            console.log("✅ Cloudinary configured successfully.");
        } else {
            console.warn("⚠️ Cloudinary configuration seems incomplete.");
        }
    } catch (error) {
        console.error("❌ Error configuring Cloudinary:", error);
    }
};

export default connectCloudinary;
