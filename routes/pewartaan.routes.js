import express from 'express';
import PewartaanController from '../controllers/pewartaan.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { isSuperAdmin, isAdmin } from '../middlewares/role.middleware.js';
const router = express.Router();
// Public / Auth Member (can be read by all authenticated users if needed, or just admin)
router.get('/', authenticateToken, PewartaanController.getAll);
router.get('/:id', authenticateToken, PewartaanController.getById);
// Export (Direct Link)
router.get('/:id/export/excel', authenticateToken, PewartaanController.exportExcel);
router.get('/:id/export/word', authenticateToken, PewartaanController.exportWord);
// Admin and Super Admin
router.post('/', authenticateToken, isAdmin, PewartaanController.create);
router.put('/:id', authenticateToken, isAdmin, PewartaanController.update);
router.delete('/:id', authenticateToken, isAdmin, PewartaanController.delete);
router.patch('/:id/status', authenticateToken, isAdmin, PewartaanController.updateStatus);
export default router;

