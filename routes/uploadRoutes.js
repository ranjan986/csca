import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Config Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Config Storage (Auto detects image vs video)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Explicitly set resource_type for videos, otherwise 'auto' or 'image'
        const isVideo = file.mimetype.startsWith('video');
        return {
            folder: "csca-platform-uploads",
            resource_type: isVideo ? "video" : "image",
            allowed_formats: ["jpg", "png", "jpeg", "mp4", "mov", "webm", "mkv"],
        };
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post("/", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    // Cloudinary returns the path in user-friendly way
    res.json({
        url: req.file.path,
        type: req.file.mimetype.startsWith("video") ? "video" : "image",
    });
});

export default router;
