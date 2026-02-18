import express from 'express';
import JadwalController from '../controllers/ibadah.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { isSuperAdmin, isAdmin } from '../middlewares/role.middleware.js';

const router = express.Router();

router.get('/', JadwalController.getAll);
router.post('/', authenticateToken, isAdmin, JadwalController.create);
router.put('/:id', authenticateToken, isAdmin, JadwalController.update);
router.delete('/:id', authenticateToken, isAdmin, JadwalController.delete);

export default router;
