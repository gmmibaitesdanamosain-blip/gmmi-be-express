import pool from '../config/db.js';

class ArsipController {
    async getArsip(req, res) {
        try {
            const { bulan, tahun } = req.query;
            if (!bulan || !tahun) {
                return res.status(400).json({ success: false, message: 'Bulan dan tahun harus diisi' });
            }

            const startDate = `${tahun}-${bulan.toString().padStart(2, '0')}-01`;
            const endDate = new Date(tahun, bulan, 0).toISOString().split('T')[0];

            // Fetch from announcements
            const announcements = await pool.query(
                "SELECT id, 'Pengumuman' as type, substring(isi from 1 for 100) as name, tanggal::text as date, 'N/A' as size FROM announcements WHERE tanggal BETWEEN $1 AND $2",
                [startDate, endDate]
            );

            // Fetch from warta
            const warta = await pool.query(
                "SELECT id, 'Warta Jemaat' as type, judul as name, tanggal::text as date, 'N/A' as size FROM warta WHERE tanggal BETWEEN $1 AND $2",
                [startDate, endDate]
            );

            // Fetch from jadwal
            const jadwal = await pool.query(
                "SELECT id, 'Jadwal Pelayanan' as type, judul as name, tanggal::text as date, 'N/A' as size FROM jadwal_pelayanan WHERE tanggal BETWEEN $1 AND $2",
                [startDate, endDate]
            );

            const result = [...announcements.rows, ...warta.rows, ...jadwal.rows].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            return res.status(200).json(result);
        } catch (error) {
            console.error('Error in ArsipController.getArsip:', error);
            return res.status(500).json({ success: false, message: 'Gagal mengambil data arsip' });
        }
    }
}

export default new ArsipController();
