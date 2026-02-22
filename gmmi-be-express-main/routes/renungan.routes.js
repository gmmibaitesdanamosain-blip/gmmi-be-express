
import express from 'express';
import RenunganController from '../controllers/renungan.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { isSuperAdmin, isAdmin } from '../middlewares/role.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

// Public routes
router.get('/', RenunganController.getAll);
router.get('/:id', RenunganController.getById);

// Admin routes (Protected + Admin/SuperAdmin)
router.post('/', authenticateToken, isAdmin, upload.single('gambar'), (req, res) => RenunganController.create(req, res));
router.put('/:id', authenticateToken, isAdmin, upload.single('gambar'), (req, res) => RenunganController.update(req, res));
router.delete('/:id', authenticateToken, isAdmin, RenunganController.delete);

export default router;
