import express from 'express';
import PewartaanController from '../controllers/pewartaan.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/role.middleware.js';

const router = express.Router();

// Public
router.get('/', authenticateToken, PewartaanController.getAll);
router.get('/:id', authenticateToken, PewartaanController.getById);

// Admin & Super Admin
router.post('/', authenticateToken, isAdmin, PewartaanController.create);
router.put('/:id', authenticateToken, isAdmin, PewartaanController.update);
router.patch('/:id/status', authenticateToken, isAdmin, PewartaanController.updateStatus);
router.delete('/:id', authenticateToken, isAdmin, PewartaanController.delete);

export default router;
