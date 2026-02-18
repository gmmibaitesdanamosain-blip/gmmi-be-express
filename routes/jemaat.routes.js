import express from 'express';
import JemaatController from '../controllers/jemaat.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/role.middleware.js';

const router = express.Router();
router.get('/', JemaatController.getAll);
router.get('/sectors', authenticateToken, JemaatController.getSectors);
router.post('/', authenticateToken, isAdmin, JemaatController.create);
router.put('/:id', authenticateToken, isAdmin, JemaatController.update);
router.delete('/:id', authenticateToken, isAdmin, JemaatController.delete);
router.post('/sectors', authenticateToken, isAdmin, JemaatController.createSector);
router.put('/sectors/:id', authenticateToken, isAdmin, JemaatController.updateSector);
router.delete('/sectors/:id', authenticateToken, isAdmin, JemaatController.deleteSector);

export default router;
