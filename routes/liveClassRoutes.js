import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    createLiveClass,
    getAllLiveClasses,
    updateLiveClassStatus,
    deleteLiveClass,
    getCourseLiveClass
} from '../controllers/liveClassController.js';

const router = express.Router();

// Admin: Create/schedule a live class
router.post('/', authMiddleware, createLiveClass);

// Admin: Get all live classes
router.get('/all', authMiddleware, getAllLiveClasses);

// Admin: Update status (start / end a class)
router.patch('/:id/status', authMiddleware, updateLiveClassStatus);

// Admin: Delete a live class
router.delete('/:id', authMiddleware, deleteLiveClass);

// Student/Auth: Get active or upcoming live class for a specific course
router.get('/course/:courseId', authMiddleware, getCourseLiveClass);

export default router;
