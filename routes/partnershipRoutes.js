import express from "express";
import {
    submitApplication,
    getAllApplications,
    updateApplicationStatus
} from "../controllers/partnershipController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", submitApplication);
router.get("/", authMiddleware, adminMiddleware, getAllApplications);
router.patch("/:id", authMiddleware, adminMiddleware, updateApplicationStatus);

export default router;
