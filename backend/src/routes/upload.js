import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { requireAdmin } from "../middleware/auth.middleware.js";

export const router = express.Router();

// ── Cloudinary config — all values are mandatory ───────────────────────────────
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn("WARNING: Cloudinary env vars are not set. Image upload endpoint will be disabled.");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "happy_helper_uploads",
    allowedFormats: ["jpg", "png", "jpeg", "webp", "gif"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

// 5 MB file size cap
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP and GIF images are allowed"));
    }
  },
});

router.post("/", requireAdmin, (req, res, next) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return res.status(503).json({ error: "Image upload is not configured on the server" });
  }
  upload.single("image")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ error: "Image must be 5 MB or smaller" });
      }
      return next(err);
    }
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }
    res.json({ url: req.file.path });
  });
});
