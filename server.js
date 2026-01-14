require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const path = require("path");

const connectDB = require("./config/db");
require("./config/passport");

const app = express();

// DB
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(
  session({
    secret: "passportsecret",
    resave: false,
    saveUninitialized: false,
  })
);

//Staic Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
