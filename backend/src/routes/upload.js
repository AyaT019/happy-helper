import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { requireAdmin } from "../middleware/auth.middleware.js";

export const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "demo", // fallback for testing if no env
  api_key: process.env.CLOUDINARY_API_KEY || "123456",
  api_secret: process.env.CLOUDINARY_API_SECRET || "123456"
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "happy_helper_uploads",
    allowedFormats: ["jpg", "png", "jpeg", "webp", "gif"],
    transformation: [{ width: 800, height: 800, crop: "limit" }]
  }
});

const upload = multer({ storage: storage });

router.post("/", requireAdmin, upload.single("image"), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }
    res.json({ url: req.file.path });
  } catch (err) {
    next(err);
  }
});
