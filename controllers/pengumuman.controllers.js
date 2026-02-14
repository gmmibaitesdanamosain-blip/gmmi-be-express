import pool from '../config/db.js';
import { logActivity } from '../utils/activityLogger.js';
import fs from 'fs';

class PengumumanController {
    async getAll(req, res) {
        const logFile = 'debug_logs.txt';
        const log = (msg) => {
            try {
                fs.appendFileSync(logFile, `${new Date().toISOString()} - ${msg}\n`);
            } catch (err) { }
        };

        try {
            log(`getAll called simple. req.user: ${JSON.stringify(req.user)}`);

            const result = await pool.query('SELECT * FROM announcements');
            log(`Simple query returned ${result.rows.length} rows`);

            return res.status(200).json(result.rows);
        } catch (error) {
            log(`ERROR in getAll simple: ${error.message}`);
            return res.status(500).json({ success: false, message: 'Gagal mengambil data pengumuman' });
        }
    }

    async create(req, res) {
        try {
            const { isi, status } = req.body;
            const createdBy = req.user?.id;

            if (!isi) {
                return res.status(400).json({ success: false, message: 'Isi pengumuman harus diisi' });
            }

            const query = 'INSERT INTO announcements (isi, status, created_by) VALUES ($1, $2, $3) RETURNING *';
            const result = await pool.query(query, [isi, status || 'draft', createdBy]);

            await logActivity(req.user?.id, req.user?.nama, 'TAMBAH', 'PENGUMUMAN', `Membuat pengumuman baru`);

            return res.status(201).json({
                success: true,
                message: 'Pengumuman berhasil dibuat',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error in PengumumanController.create:', error);
            return res.status(500).json({ success: false, message: 'Gagal membuat pengumuman' });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { isi, status } = req.body;

            const query = 'UPDATE announcements SET isi = $1, status = $2 WHERE id = $3 RETURNING *';
            const result = await pool.query(query, [isi, status, id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Pengumuman tidak ditemukan' });
            }

            await logActivity(req.user?.id, req.user?.nama, 'UBAH', 'PENGUMUMAN', `Memperbarui pengumuman ID: ${id}`);

            return res.status(200).json({
                success: true,
                message: 'Pengumuman berhasil diperbarui',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error in PengumumanController.update:', error);
            return res.status(500).json({ success: false, message: 'Gagal memperbarui pengumuman' });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await pool.query('DELETE FROM announcements WHERE id = $1 RETURNING *', [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Pengumuman tidak ditemukan' });
            }

            await logActivity(req.user?.id, req.user?.nama, 'HAPUS', 'PENGUMUMAN', `Menghapus pengumuman ID: ${id}`);

            return res.status(200).json({
                success: true,
                message: 'Pengumuman berhasil dihapus'
            });
        } catch (error) {
            console.error('Error in PengumumanController.delete:', error);
            return res.status(500).json({ success: false, message: 'Gagal menghapus pengumuman' });
        }
    }
}

export default new PengumumanController();
