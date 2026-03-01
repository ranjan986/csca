import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import {
    createExam,
    getAllExams,
    getExamById,
    updateExam,
    deleteExam,
    toggleExamStatus
} from "../controllers/examController.js";

const router = express.Router();

// @route   POST /api/exams
// @desc    Create a new exam
// @access  Private/Admin
router.post("/", authMiddleware, adminMiddleware, createExam);

// @route   GET /api/exams
// @desc    Get all exams
// @access  Public
router.get("/", getAllExams);

// @route   GET /api/exams/:id
// @desc    Get single exam
// @access  Public
router.get("/:id", getExamById);

// @route   PUT /api/exams/:id
// @desc    Update an exam
// @access  Private/Admin
router.put("/:id", authMiddleware, adminMiddleware, updateExam);

// @route   DELETE /api/exams/:id
// @desc    Delete an exam
// @access  Private/Admin
router.delete("/:id", authMiddleware, adminMiddleware, deleteExam);

// @route   PATCH /api/exams/:id/status
// @desc    Toggle active status
// @access  Private/Admin
router.patch("/:id/status", authMiddleware, adminMiddleware, toggleExamStatus);

export default router;
