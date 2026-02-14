import express from 'express';
import FinanceController from '../controllers/finance.controller.js';
// Add Auth Middleware if needed, assuming user role checks are done here or globally
// import { verifyToken, isAdmin } from '../middleware/authMiddleware.js'; 

const router = express.Router();

router.get('/', FinanceController.getAll);
router.post('/', FinanceController.create);
router.put('/:id', FinanceController.update);
router.delete('/:id', FinanceController.delete);
router.get('/export', FinanceController.exportExcel);

export default router;
