import express from 'express';
import JemaatController from '../controllers/jemaat.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { isSuperAdmin, isAdmin } from '../middlewares/role.middleware.js';

const router = express.Router();

// Public endpoint for autocomplete (no authentication required)
router.get('/', JemaatController.getAll);
router.post('/', authenticateToken, isAdmin, JemaatController.create);
router.put('/:id', authenticateToken, isAdmin, JemaatController.update);
router.delete('/:id', authenticateToken, isAdmin, JemaatController.delete);
router.get('/sectors', authenticateToken, JemaatController.getSectors);
router.post('/sectors', authenticateToken, isAdmin, JemaatController.createSector);
router.put('/sectors/:id', authenticateToken, isAdmin, JemaatController.updateSector);
router.delete('/sectors/:id', authenticateToken, isAdmin, JemaatController.deleteSector);

export default router;
