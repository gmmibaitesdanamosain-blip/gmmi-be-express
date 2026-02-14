import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Public Warta (Approved only)
router.get('/warta', async (req, res) => {
    console.log('[DEBUG] GET /warta called');
    try {
        const result = await pool.query("SELECT * FROM pewartaan WHERE status = 'approved' ORDER BY tanggal_ibadah DESC LIMIT 5");
        console.log(`[DEBUG] Found ${result.rows.length} approved warta entries`);
        if (result.rows.length > 0) {
            console.log('[DEBUG] First entry:', result.rows[0]);
        }
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, data: [] });
    }
});

// Public Pengumuman (Published only)
router.get('/pengumuman', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM announcements WHERE status = 'publish' ORDER BY tanggal DESC LIMIT 5");
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, data: [] });
    }
});

// Public Jadwal
router.get('/jadwal', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM jadwal_pelayanan ORDER BY tanggal ASC LIMIT 5");
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, data: [] });
    }
});

// Public Arsip (Simplified)
router.get('/arsip', (req, res) => res.json([]));

router.get('/dashboard/statistik', async (req, res) => {
    try {
        const wartaCount = await pool.query('SELECT COUNT(*) FROM warta');
        const pengumumanCount = await pool.query('SELECT COUNT(*) FROM announcements');
        const jadwalCount = await pool.query('SELECT COUNT(*) FROM jadwal_pelayanan');
        const adminCount = await pool.query('SELECT COUNT(*) FROM admins');

        res.json({
            wartaCount: parseInt(wartaCount.rows[0].count),
            pengumumanCount: parseInt(pengumumanCount.rows[0].count),
            jadwalCount: parseInt(jadwalCount.rows[0].count),
            adminCount: parseInt(adminCount.rows[0].count)
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Gagal mengambil statistik' });
    }
});

export default router;
