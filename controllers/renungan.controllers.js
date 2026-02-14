
import pool from '../config/db.js';

const RenunganController = {
    // Get all renungan
    getAll: async (req, res) => {
        try {
            // Check if table exists
            const tableCheck = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'renungan_mingguan'
                );
            `);

            if (!tableCheck.rows[0].exists) {
                console.warn("Table 'renungan_mingguan' does not exist.");
                return res.json([]);
            }

            const result = await pool.query('SELECT * FROM renungan_mingguan ORDER BY tanggal DESC');
            res.json(result.rows);
        } catch (err) {
            console.error('Error in RenunganController.getAll:', err.message);
            res.status(500).json({ error: 'Internal Server Error', details: err.message });
        }
    },

    // Get single renungan by ID
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await pool.query('SELECT * FROM renungan_mingguan WHERE id = $1', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Renungan not found' });
            }
            res.json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    // Create new renungan
    create: async (req, res) => {
        try {
            const { judul, isi, tanggal } = req.body;
            const gambar = req.file ? `/uploads/${req.file.filename}` : null;

            const result = await pool.query(
                'INSERT INTO renungan_mingguan (judul, isi, tanggal, gambar) VALUES ($1, $2, $3, $4) RETURNING *',
                [judul, isi, tanggal, gambar]
            );
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    // Update renungan
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { judul, isi, tanggal } = req.body;
            let gambar = req.body.gambar; // If passing existing image url or null

            if (req.file) {
                gambar = `/uploads/${req.file.filename}`;
            }

            const result = await pool.query(
                'UPDATE renungan_mingguan SET judul = $1, isi = $2, tanggal = $3, gambar = COALESCE($4, gambar) WHERE id = $5 RETURNING *',
                [judul, isi, tanggal, gambar, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Renungan not found' });
            }
            res.json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    // Delete renungan
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await pool.query('DELETE FROM renungan_mingguan WHERE id = $1 RETURNING *', [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Renungan not found' });
            }
            res.json({ message: 'Renungan deleted successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

export default RenunganController;
