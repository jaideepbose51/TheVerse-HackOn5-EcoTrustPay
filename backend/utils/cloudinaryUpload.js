import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

export const uploadToCloudinary = async (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Cloudinary upload timed out'));
    }, 15000); // 15 seconds

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image'  // ✅ images only
      },
      (err, result) => {
        clearTimeout(timeout);
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
};
