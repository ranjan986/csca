import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export const uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    try {
        console.log(`Starting upload to Cloudinary: ${req.file.path}`);

        // Manual upload to Cloudinary with large file support
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "csca-platform-uploads",
            resource_type: "auto",
            chunk_size: 6000000, // 6MB chunks for large files
        });

        // Delete temp file
        fs.unlinkSync(req.file.path);

        res.json({
            url: result.secure_url,
            type: result.resource_type === "video" ? "video" :
                req.file.mimetype === "application/pdf" ? "pdf" : "image",
        });
    } catch (error) {
        console.error("Cloudinary upload error:", error);

        // Cleanup temp file on error
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ message: "Upload failed", error: error.message });
    }
};
