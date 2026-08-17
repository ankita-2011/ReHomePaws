import multer from "multer";
import { isCloudinaryAvailable } from "../config/cloudinary.js";
import path from "path";
import fs from "fs";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG, and WebP images are allowed."));
  }
  cb(null, true);
};

// In‑memory storage for Cloudinary uploads
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter,
});

// Disk storage for local fallback
const diskUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = process.env.UPLOADS_DIR || "uploads";
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${unique}${ext}`);
    },
  }),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter,
});

const upload = async (req, res, next) => {
  const cloudinaryOk = await isCloudinaryAvailable();
  const handler = cloudinaryOk ? memoryUpload : diskUpload;
  return handler.array("images", 4)(req, res, next);
};

export default upload;