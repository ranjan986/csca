import express from 'express';
import { getCareers, createCareer, updateCareer, deleteCareer } from '../controllers/careerController.js';
import authMiddleware, { admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getCareers);
router.post('/', authMiddleware, admin, createCareer);
router.put('/:id', authMiddleware, admin, updateCareer);
router.delete('/:id', authMiddleware, admin, deleteCareer);

export default router;
