const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { register, login, verifyOTP } = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Local Auth Routes
router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);

// Google OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: false,
  }),
  (req, res) => {
    const user = req.user;

    // JWT generate
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Frontend redirect with token
    res.redirect(
      `${process.env.CLIENT_URL}/oauth-success?token=${token}`
    );
  }
);

// GET LOGGED IN USER 
router.get("/me", auth, async (req, res) => {
  
  res.json(req.user);
});

module.exports = router;
