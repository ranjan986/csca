import express from "express";
import Exam from "../models/Exam.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// @route   POST /api/exams
// @desc    Create a new exam
// @access  Private/Admin
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { title, description, duration, totalQuestions, category, price, questions } = req.body;

        const exam = await Exam.create({
            title,
            description,
            duration,
            totalQuestions,
            category,
            price,
            questions,
            createdBy: req.user.id
        });

        res.status(201).json(exam);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/exams
// @desc    Get all exams
// @access  Public
router.get("/", async (req, res) => {
    try {
        const exams = await Exam.find().sort({ createdAt: -1 });
        res.json(exams);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/exams/:id
// @desc    Get single exam
// @access  Public
router.get("/:id", async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ message: "Exam not found" });
        res.json(exam);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/exams/:id
// @desc    Update an exam
// @access  Private/Admin
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ message: "Exam not found" });

        const updatedExam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedExam);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   DELETE /api/exams/:id
// @desc    Delete an exam
// @access  Private/Admin
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ message: "Exam not found" });

        await Exam.findByIdAndDelete(req.params.id);
        res.json({ message: "Exam removed" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PATCH /api/exams/:id/status
// @desc    Toggle active status
// @access  Private/Admin
router.patch("/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ message: "Exam not found" });

        exam.isActive = !exam.isActive;
        await exam.save();
        res.json({ message: `Exam is now ${exam.isActive ? 'active' : 'inactive'}`, isActive: exam.isActive });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
