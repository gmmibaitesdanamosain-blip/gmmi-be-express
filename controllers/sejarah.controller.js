import pool from '../config/db.js';

const SejarahController = {
    // Get latest Sejarah (usually there is only one history or a list of milestones)
    getAll: async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM sejarah ORDER BY tanggal_peristiwa ASC');
            res.json(result.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    },

    // Create new Sejarah entry
    create: async (req, res) => {
        try {
            const { judul, tanggal_peristiwa, deskripsi } = req.body;
            let gambar_url = req.body.gambar_url;

            if (req.file) {
                gambar_url = `/uploads/thumbnails/${req.file.filename}`;
            }

            const newSejarah = await pool.query(
                'INSERT INTO sejarah (judul, tanggal_peristiwa, deskripsi, gambar_url) VALUES ($1, $2, $3, $4) RETURNING *',
                [judul, tanggal_peristiwa, deskripsi, gambar_url]
            );
            res.json(newSejarah.rows[0]);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    },

    // Update Sejarah entry
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { judul, tanggal_peristiwa, deskripsi } = req.body;
            let gambar_url = req.body.gambar_url;

            if (req.file) {
                gambar_url = `/uploads/thumbnails/${req.file.filename}`;
            }

            // Construct specific query based on whether image is updated
            let query, values;
            if (gambar_url) {
                query = 'UPDATE sejarah SET judul = $1, tanggal_peristiwa = $2, deskripsi = $3, gambar_url = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *';
                values = [judul, tanggal_peristiwa, deskripsi, gambar_url, id];
            } else {
                query = 'UPDATE sejarah SET judul = $1, tanggal_peristiwa = $2, deskripsi = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *';
                values = [judul, tanggal_peristiwa, deskripsi, id];
            }

            const updatedSejarah = await pool.query(query, values);

            if (updatedSejarah.rows.length === 0) {
                return res.status(404).json({ message: "Sejarah not found" });
            }

            res.json(updatedSejarah.rows[0]);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    },

    // Delete Sejarah entry
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const deleteSejarah = await pool.query('DELETE FROM sejarah WHERE id = $1 RETURNING *', [id]);

            if (deleteSejarah.rows.length === 0) {
                return res.status(404).json({ message: "Sejarah not found" });
            }

            res.json({ message: "Sejarah deleted successfully" });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
};

export default SejarahController;
