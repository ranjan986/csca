import express from 'express';
import {
    getResources,
    getAllResources,
    createResource,
    updateResource,
    deleteResource
} from '../controllers/resourceController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getResources);

// Protected Admin routes
router.get('/admin', authMiddleware, adminMiddleware, getAllResources);
router.post('/', authMiddleware, adminMiddleware, createResource);
router.put('/:id', authMiddleware, adminMiddleware, updateResource);
router.delete('/:id', authMiddleware, adminMiddleware, deleteResource);

export default router;
