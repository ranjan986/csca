import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import {
    getAllResults,
    submitExamResult,
    getMyHistory,
    deleteResult,
    updateResult,
    getCertificateData
} from "../controllers/resultController.js";

const router = express.Router();

// @route   GET /api/results/all
// @desc    Get all exam results (Admin only)
// @access  Private/Admin
router.get("/all", authMiddleware, adminMiddleware, getAllResults);

// @route   POST /api/results/submit
// @desc    Submit exam and calculate score
// @access  Private
router.post("/submit", authMiddleware, submitExamResult);

// @route   GET /api/results/my-history
// @desc    Get current user's exam history
// @access  Private
router.get("/my-history", authMiddleware, getMyHistory);

// @route   GET /api/results/:id/certificate
// @desc    Get certificate data for passed exam
// @access  Private
router.get("/:id/certificate", authMiddleware, getCertificateData);

// @route   DELETE /api/results/:id
// @desc    Delete a result
// @access  Private/Admin
router.delete("/:id", authMiddleware, adminMiddleware, deleteResult);

// @route   PUT /api/results/:id
// @desc    Update a result (Score/Status)
// @access  Private/Admin
router.put("/:id", authMiddleware, adminMiddleware, updateResult);

export default router;
