import express from 'express';
import KeuanganController from '../controllers/keuangan.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { isSuperAdmin, isAdmin } from '../middlewares/role.middleware.js';

const router = express.Router();

// Summary route (public)
router.get('/summary', KeuanganController.getSummary);

// CRUD
router.get('/', KeuanganController.getAll);
router.post('/', authenticateToken, isAdmin, KeuanganController.create);
router.put('/:id', authenticateToken, isAdmin, KeuanganController.update);
router.delete('/:id', authenticateToken, isAdmin, KeuanganController.delete);

export default router;