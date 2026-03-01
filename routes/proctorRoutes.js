import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    uploadSnapshot,
    getActiveSessions,
    uploadIdSnapshot,
    verifyId,
    getMySession
} from '../controllers/proctorController.js';

const router = express.Router();

// Upload Snapshot
router.post('/upload-snapshot', authMiddleware, uploadSnapshot);

// Get Active Sessions for an Exam (Admin only)
router.get('/exam/:examId', authMiddleware, getActiveSessions);

// Upload ID Snapshot
router.post('/upload-id', authMiddleware, uploadIdSnapshot);

// Verify ID (Admin only)
router.patch('/verify-id', authMiddleware, verifyId);

// Get My Session (Student)
router.get('/my-session/:examId/:attemptId', authMiddleware, getMySession);

export default router;
