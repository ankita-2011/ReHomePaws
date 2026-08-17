import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const isCloudinaryAvailable = async () => {
  try {
    await cloudinary.api.ping();
    return true;
  } catch (err) {
    console.error("Cloudinary health check failed:", err.message);
    return false;
  }
};

export default cloudinary;
