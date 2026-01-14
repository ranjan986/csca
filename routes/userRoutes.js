const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");

const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();


// UPDATE PROFILE
router.put("/update", auth, async (req, res) => {
  const { firstName, lastName } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// CHANGE PASSWORD 
router.put("/change-password", auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// IMAGE UPLOAD 
const storage = multer.diskStorage({
  destination: "uploads/profiles",
  filename: (req, file, cb) => {
    cb(null, `${req.user._id}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image")) {
      cb(new Error("Only images allowed"));
    }
    cb(null, true);
  },
});

router.post("/upload-image", auth, upload.single("image"), async (req, res) => {
  try {
    const imagePath = `/uploads/profiles/${req.file.filename}`;

    await User.findByIdAndUpdate(req.user._id, {
      profileImage: imagePath,
    });

    res.json({ profileImage: imagePath });
  } catch (err) {
    res.status(500).json({ message: "Image upload failed" });
  }
});

module.exports = router;
