import pool from '../config/db.js';

// GET all pekerjaan
export const getAllPekerjaan = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, nama_pekerjaan FROM pekerjaan ORDER BY nama_pekerjaan ASC'
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching pekerjaan:', error);
        res.status(500).json({
            success: false,
            error: 'Gagal mengambil data pekerjaan'
        });
    }
};

// GET single pekerjaan by ID
export const getPekerjaanById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT id, nama_pekerjaan FROM pekerjaan WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Pekerjaan tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching pekerjaan:', error);
        res.status(500).json({
            success: false,
            error: 'Gagal mengambil data pekerjaan'
        });
    }
};

// CREATE new pekerjaan (untuk super admin)
export const createPekerjaan = async (req, res) => {
    try {
        const { nama_pekerjaan } = req.body;

        if (!nama_pekerjaan || nama_pekerjaan.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Nama pekerjaan harus diisi'
            });
        }

        const result = await pool.query(
            'INSERT INTO pekerjaan (nama_pekerjaan) VALUES ($1) RETURNING *',
            [nama_pekerjaan.trim()]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Pekerjaan berhasil ditambahkan'
        });
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({
                success: false,
                error: 'Pekerjaan sudah ada'
            });
        }
        console.error('Error creating pekerjaan:', error);
        res.status(500).json({
            success: false,
            error: 'Gagal menambahkan pekerjaan'
        });
    }
};

// UPDATE pekerjaan (untuk super admin)
export const updatePekerjaan = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_pekerjaan } = req.body;

        if (!nama_pekerjaan || nama_pekerjaan.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Nama pekerjaan harus diisi'
            });
        }

        const result = await pool.query(
            'UPDATE pekerjaan SET nama_pekerjaan = $1 WHERE id = $2 RETURNING *',
            [nama_pekerjaan.trim(), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Pekerjaan tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: result.rows[0],
            message: 'Pekerjaan berhasil diperbarui'
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({
                success: false,
                error: 'Pekerjaan sudah ada'
            });
        }
        console.error('Error updating pekerjaan:', error);
        res.status(500).json({
            success: false,
            error: 'Gagal memperbarui pekerjaan'
        });
    }
};

// DELETE pekerjaan (untuk super admin)
export const deletePekerjaan = async (req, res) => {
    try {
        const { id } = req.params;

        // Cek apakah pekerjaan sedang digunakan
        const checkUsage = await pool.query(
            'SELECT COUNT(*) FROM jemaat WHERE pekerjaan_id = $1',
            [id]
        );

        if (parseInt(checkUsage.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                error: 'Pekerjaan tidak dapat dihapus karena sedang digunakan oleh jemaat'
            });
        }

        const result = await pool.query(
            'DELETE FROM pekerjaan WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Pekerjaan tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'Pekerjaan berhasil dihapus'
        });
    } catch (error) {
        console.error('Error deleting pekerjaan:', error);
        res.status(500).json({
            success: false,
            error: 'Gagal menghapus pekerjaan'
        });
    }
};
