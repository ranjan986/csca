import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    getActiveCourses,
    getMyCourses,
    getCourseDetails,
    getCourseContent,
    enrollFreeCourse,
    createCourse,
    updateCourse,
    deleteCourse
} from '../controllers/courseController.js';

const router = express.Router();

// --- Public Routes ---
router.get('/', getActiveCourses);
router.get('/my-courses', authMiddleware, getMyCourses);
router.get('/:id', getCourseDetails);

// --- Protected Routes (Enrolled Users) ---
router.get('/:id/content', authMiddleware, getCourseContent);
router.post('/:id/enroll-free', authMiddleware, enrollFreeCourse);

// --- Admin Routes ---
router.post('/', authMiddleware, createCourse);
router.put('/:id', authMiddleware, updateCourse);
router.delete('/:id', authMiddleware, deleteCourse);

export default router;
