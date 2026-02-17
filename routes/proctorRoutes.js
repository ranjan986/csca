import express from 'express';
import ProctorSession from '../models/ProctorSession.js';
import User from '../models/User.js'; // Ensure we can populate user details
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Upload Snapshot
router.post('/upload-snapshot', authMiddleware, async (req, res) => {
    try {
        const { examId, snapshot } = req.body;
        const userId = req.user.id;

        if (!examId || !snapshot) {
            return res.status(400).json({ message: 'Missing examId or snapshot' });
        }

        // upsert: true -> create if not exists, update if exists
        const session = await ProctorSession.findOneAndUpdate(
            { userId, examId },
            { lastSnapshot: snapshot, lastUpdated: Date.now() },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: 'Snapshot uploaded', sessionId: session._id });
    } catch (error) {
        console.error('Snapshot upload error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Active Sessions for an Exam (Admin only)
router.get('/exam/:examId', authMiddleware, async (req, res) => {
    try {
        // Optional: Check if req.user.role === 'admin'

        const sessions = await ProctorSession.find({ examId: req.params.examId })
            .populate('userId', 'firstName lastName email')
            .sort({ lastUpdated: -1 });

        res.status(200).json(sessions);
    } catch (error) {
        console.error('Fetch sessions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
