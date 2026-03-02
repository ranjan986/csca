import express from 'express';
import { getIndustrySectors, createIndustrySector, updateIndustrySector, deleteIndustrySector } from '../controllers/industryController.js';
import authMiddleware, { admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getIndustrySectors);
router.post('/', authMiddleware, admin, createIndustrySector);
router.put('/:id', authMiddleware, admin, updateIndustrySector);
router.delete('/:id', authMiddleware, admin, deleteIndustrySector);

export default router;
