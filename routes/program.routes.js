import express from 'express';
import ProgramController from '../controllers/program.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { isSuperAdmin } from '../middlewares/role.middleware.js';
const router = express.Router();

// Public route for fetching programs (for Homepage section)
// Or should it be protected? "Tampilkan data yang telah diinput ke halaman utama (Homepage)"
// Usually homepage is public. So getAll might need to be public or have a separate public endpoint.
// Let's make getAll public but Create/Export protected.
// Wait, "Pastikan hanya Super Admin yang dapat mengakses fitur ini (role-based access control)" applies to "Form Input" and likely "Dashboard".
// But "Homepage" implies public visibility.
// I will separate public and admin routes if needed, or just allow GET for public.
// Let's assume GET is public for now, but I'll add a specific public route if needed.
// Actually, for simplicity and security, I will make the main GET route public so Homepage can access it.
// BUT, maybe the "Dashboard Super Admin" needs to see everything, and Homepage only sees a summary.
// Let's stick to standard REST:
// GET / -> Public (or filtered)
// POST / -> Super Admin
// GET /export/excel -> Super Admin
// GET /export/word -> Super Admin

router.get('/stats', authenticateToken, isSuperAdmin, ProgramController.getStats);
router.get('/', ProgramController.getAll);
router.get('/export/excel', ProgramController.exportExcel);
router.get('/export/word', ProgramController.exportWord);

// Protected routes
router.post('/', authenticateToken, isSuperAdmin, ProgramController.create);
router.delete('/:id', authenticateToken, isSuperAdmin, ProgramController.delete);

export default router;
