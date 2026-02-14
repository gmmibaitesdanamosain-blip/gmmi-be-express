import pool from '../config/db.js';

class CarouselController {
    async getAll(req, res) {
        try {
            // Check if table exists first to avoid vague errors
            const tableCheck = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'carousel_slides'
                );
            `);

            if (!tableCheck.rows[0].exists) {
                console.warn("Table 'carousel_slides' does not exist.");
                return res.json({ success: true, data: [] });
            }

            const query = 'SELECT * FROM carousel_slides WHERE is_active = true ORDER BY order_index ASC, created_at DESC';
            const result = await pool.query(query);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Error in CarouselController.getAll detailed:', error.message, error.stack);
            res.status(500).json({ success: false, message: 'Gagal mengambil data carousel', error: error.message });
        }
    }

    async getAllAdmin(req, res) {
        try {
            const query = 'SELECT * FROM carousel_slides ORDER BY order_index ASC, created_at DESC';
            const result = await pool.query(query);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Error in CarouselController.getAllAdmin:', error);
            res.status(500).json({ success: false, message: 'Gagal mengambil data carousel admin' });
        }
    }

    async create(req, res) {
        try {
            const { title, subtitle, quote, badge, cta_text, cta_link, order_index, is_active } = req.body;
            const image_url = req.file ? `/uploads/thumbnails/${req.file.filename}` : req.body.image_url;

            if (!image_url) {
                return res.status(400).json({ success: false, message: 'Gambar wajib diunggah' });
            }

            const query = `
                INSERT INTO carousel_slides (title, subtitle, quote, badge, image_url, cta_text, cta_link, order_index, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `;
            const values = [
                title,
                subtitle,
                quote,
                badge,
                image_url,
                cta_text,
                cta_link,
                parseInt(order_index) || 0,
                is_active === 'true' || is_active === true
            ];

            const result = await pool.query(query, values);
            res.status(201).json({ success: true, message: 'Carousel slide berhasil dibuat', data: result.rows[0] });
        } catch (error) {
            console.error('Error in CarouselController.create:', error);
            res.status(500).json({ success: false, message: 'Gagal membuat carousel slide' });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { title, subtitle, quote, badge, cta_text, cta_link, order_index, is_active } = req.body;

            let query = `
                UPDATE carousel_slides 
                SET title = $1, subtitle = $2, quote = $3, badge = $4, cta_text = $5, cta_link = $6, order_index = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP
            `;
            const values = [
                title,
                subtitle,
                quote,
                badge,
                cta_text,
                cta_link,
                parseInt(order_index) || 0,
                is_active === 'true' || is_active === true
            ];

            if (req.file) {
                const image_url = `/uploads/thumbnails/${req.file.filename}`;
                query += `, image_url = $9 WHERE id = $10 RETURNING *`;
                values.push(image_url, id);
            } else {
                query += ` WHERE id = $9 RETURNING *`;
                values.push(id);
            }

            const result = await pool.query(query, values);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Carousel slide tidak ditemukan' });
            }

            res.json({ success: true, message: 'Carousel slide berhasil diperbarui', data: result.rows[0] });
        } catch (error) {
            console.error('Error in CarouselController.update:', error);
            res.status(500).json({ success: false, message: 'Gagal memperbarui carousel slide' });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await pool.query('DELETE FROM carousel_slides WHERE id = $1 RETURNING *', [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Carousel slide tidak ditemukan' });
            }

            res.json({ success: true, message: 'Carousel slide berhasil dihapus' });
        } catch (error) {
            console.error('Error in CarouselController.delete:', error);
            res.status(500).json({ success: false, message: 'Gagal menghapus carousel slide' });
        }
    }
}

export default new CarouselController();
