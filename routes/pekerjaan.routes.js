import express from 'express';
import {
    getAllPekerjaan,
    getPekerjaanById,
    createPekerjaan,
    updatePekerjaan,
    deletePekerjaan
} from '../controllers/pekerjaan.controllers.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes (bisa diakses siapa saja yang sudah login)
router.get('/', authenticateToken, getAllPekerjaan);
router.get('/:id', authenticateToken, getPekerjaanById);

// Admin only routes
router.post('/', authenticateToken, createPekerjaan);
router.put('/:id', authenticateToken, updatePekerjaan);
router.delete('/:id', authenticateToken, deletePekerjaan);

export default router;
