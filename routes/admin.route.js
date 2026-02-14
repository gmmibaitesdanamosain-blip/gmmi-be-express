import express from 'express';
import AdminController from '../controllers/admin.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { isSuperAdmin } from '../middlewares/role.middleware.js';

const router = express.Router();

router.post('/login', AdminController.login);
router.get('/', authenticateToken, isSuperAdmin, AdminController.getAdmins);
router.get('/summary', authenticateToken, AdminController.getSummary);

// Admin account operations
router.put('/:id', authenticateToken, isSuperAdmin, AdminController.updateAdmin);
router.patch('/:id/status', authenticateToken, isSuperAdmin, AdminController.toggleAdminStatus);
router.post('/reset-password', authenticateToken, isSuperAdmin, AdminController.resetAdminPassword);
router.post('/change-password', authenticateToken, AdminController.changePassword); // User can change their own

export default router;
