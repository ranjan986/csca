import express from 'express';
import {
    getCertifications,
    getCertificationById,
    createCertification,
    updateCertification,
    deleteCertification
} from '../controllers/certificationController.js';
import authMiddleware, { admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getCertifications);
router.get('/:id', getCertificationById);

// Admin routes
router.post('/', authMiddleware, admin, createCertification);
router.put('/:id', authMiddleware, admin, updateCertification);
router.delete('/:id', authMiddleware, admin, deleteCertification);

export default router;
