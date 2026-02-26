import express from 'express';
import KeuanganController from '../controllers/keuangan.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/role.middleware.js';

const router = express.Router();

// ─── Public (tidak perlu login) ────────────────────────────────────────────
// Summary tetap public agar bisa ditampilkan di halaman publik
router.get('/summary', KeuanganController.getSummary);

// ─── Perlu login (role apa pun yang sudah terautentikasi) ──────────────────
router.get('/',        authenticateToken, KeuanganController.getAll);
router.get('/export',  authenticateToken, KeuanganController.exportExcel);

// ─── Perlu login + role super_admin / admin_majelis ────────────────────────
router.post('/',      authenticateToken, isAdmin, KeuanganController.create);
router.put('/:id',    authenticateToken, isAdmin, KeuanganController.update);
router.delete('/:id', authenticateToken, isAdmin, KeuanganController.delete);

export default router;
