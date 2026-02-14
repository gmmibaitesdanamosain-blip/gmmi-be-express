import pool from '../config/db.js';

class WartaController {
    async getAll(req, res) {
        try {
            // Check if table exists
            const tableCheck = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'pewartaan'
                );
            `);

            if (!tableCheck.rows[0].exists) {
                console.warn("Table 'pewartaan' does not exist.");
                return res.json({ data: [], totalPages: 0, currentPage: 1, totalItems: 0 });
            }

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            // Get count of approved pewartaan
            const countResult = await pool.query(
                "SELECT COUNT(*) FROM pewartaan WHERE status = 'approved'"
            );
            const totalItems = parseInt(countResult.rows[0].count);

            // Get approved pewartaan ordered by tanggal_ibadah descending
            const result = await pool.query(
                `SELECT id, judul, tanggal_ibadah, tempat_jemaat, tema_khotbah, ayat_firman, hari, status, created_at, updated_at
                 FROM pewartaan 
                 WHERE status = 'approved'
                 ORDER BY tanggal_ibadah DESC, created_at DESC 
                 LIMIT $1 OFFSET $2`,
                [limit, offset]
            );

            return res.status(200).json({
                data: result.rows,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
                totalItems
            });
        } catch (error) {
            console.error('Error in WartaController.getAll:', error.message);
            return res.status(500).json({ success: false, message: 'Gagal mengambil data warta', error: error.message });
        }
    }

    async create(req, res) {
        try {
            const { judul, tanggal, isi, status, files } = req.body;
            if (!judul || !tanggal) {
                return res.status(400).json({ success: false, message: 'Judul dan tanggal harus diisi' });
            }

            // Get thumbnail path from uploaded file
            const thumbnailPath = req.file ? `/uploads/thumbnails/${req.file.filename}` : null;

            const query = `
                INSERT INTO warta (judul, tanggal, isi, status, thumbnail, files)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            const result = await pool.query(query, [
                judul,
                tanggal || new Date(),
                isi,
                status || 'draft',
                thumbnailPath,
                files || []
            ]);

            return res.status(201).json({
                success: true,
                message: 'Warta berhasil dibuat',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error in WartaController.create:', error);
            return res.status(500).json({ success: false, message: 'Gagal membuat warta' });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { judul, tanggal, isi, status, files } = req.body;

            // Get current warta to check for existing thumbnail
            const currentWarta = await pool.query('SELECT thumbnail FROM warta WHERE id = $1', [id]);

            if (currentWarta.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Warta tidak ditemukan' });
            }

            // Determine thumbnail path
            let thumbnailPath = currentWarta.rows[0].thumbnail; // Keep existing by default
            if (req.file) {
                // New file uploaded, use new path
                thumbnailPath = `/uploads/thumbnails/${req.file.filename}`;

                // TODO: Optionally delete old thumbnail file here if needed
                // This would require importing fs and path modules
            }

            const query = `
                UPDATE warta
                SET judul = $1, tanggal = $2, isi = $3, status = $4, thumbnail = $5, files = $6
                WHERE id = $7
                RETURNING *
            `;
            const result = await pool.query(query, [judul, tanggal, isi, status, thumbnailPath, files, id]);

            return res.status(200).json({
                success: true,
                message: 'Warta berhasil diperbarui',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error in WartaController.update:', error);
            return res.status(500).json({ success: false, message: 'Gagal memperbarui warta' });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await pool.query('DELETE FROM warta WHERE id = $1 RETURNING *', [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Warta tidak ditemukan' });
            }

            return res.status(200).json({
                success: true,
                message: 'Warta berhasil dihapus'
            });
        } catch (error) {
            console.error('Error in WartaController.delete:', error);
            return res.status(500).json({ success: false, message: 'Gagal menghapus warta' });
        }
    }
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['approved', 'rejected', 'pending'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Status tidak valid' });
            }

            const query = 'UPDATE warta SET status = $1 WHERE id = $2 RETURNING *';
            const result = await pool.query(query, [status, id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Warta tidak ditemukan' });
            }

            return res.status(200).json({
                success: true,
                message: `Status warta berhasil diubah menjadi ${status}`,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error in WartaController.updateStatus:', error);
            return res.status(500).json({ success: false, message: 'Gagal memperbarui status warta' });
        }
    }
}

export default new WartaController();
