import pool from '../config/db.js';
import { logActivity } from '../utils/activityLogger.js';

class JemaatController {
    // Daftar pekerjaan yang valid sesuai constraint CHECK di database
    static VALID_PEKERJAAN = [
        'Buruh',
        'Petani',
        'Nelayan',
        'PNS',
        'TNI / POLRI',
        'Guru / Dosen',
        'Tenaga Kesehatan',
        'Rohaniawan',
        'Lainnya'
    ];

    // Get all members with filters and search
    async getAll(req, res) {
        try {
            const { sektor_id, pendidikan, kategorial, search } = req.query;
            let query = `
                SELECT 
                    j.*, 
                    s.nama_sektor, 
                    s.no_hp as no_hp_sektor,
                    s.alamat as alamat_sektor,
                    js.bpts, js.sidi, js.nikah, js.meninggal
                FROM jemaat j
                JOIN sectors s ON j.sektor_id = s.id
                LEFT JOIN jemaat_sakramen js ON js.jemaat_id = j.id
                WHERE j.deleted_at IS NULL
            `;
            const params = [];

            if (sektor_id) {
                params.push(sektor_id);
                query += ` AND j.sektor_id = $${params.length}`;
            }

            if (pendidikan) {
                params.push(pendidikan);
                query += ` AND j.pendidikan_terakhir = $${params.length}`;
            }

            if (kategorial) {
                params.push(`%${kategorial}%`);
                query += ` AND j.kategorial LIKE $${params.length}`;
            }

            if (search) {
                params.push(`%${search.toLowerCase()}%`);
                query += ` AND LOWER(j.nama) LIKE $${params.length}`;
            }

            query += ' ORDER BY j.nama ASC';

            const result = await pool.query(query, params);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Error in JemaatController.getAll:', error);
            res.status(500).json({ success: false, message: 'Gagal mengambil data jemaat' });
        }
    }

    // Create a new member
    async create(req, res) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const {
                nama, sektor_id, pendidikan_terakhir, pekerjaan,
                kategorial, keterangan, sakramen,
                jenis_kelamin, tempat_lahir, tanggal_lahir
            } = req.body;

            // Validasi backend untuk pekerjaan
            if (!pekerjaan || pekerjaan.trim() === '') {
                return res.status(400).json({
                    success: false,
                    error: 'Pekerjaan wajib diisi'
                });
            }

            if (!JemaatController.VALID_PEKERJAAN.includes(pekerjaan)) {
                return res.status(400).json({
                    success: false,
                    error: 'Pekerjaan tidak valid'
                });
            }

            const jemaatQuery = `
                INSERT INTO jemaat (nama, sektor_id, pendidikan_terakhir, pekerjaan, kategorial, keterangan, jenis_kelamin, tempat_lahir, tanggal_lahir)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id
            `;
            const jemaatRes = await client.query(jemaatQuery, [
                nama, sektor_id, pendidikan_terakhir, pekerjaan, kategorial, keterangan,
                jenis_kelamin, tempat_lahir, tanggal_lahir
            ]);
            const jemaatId = jemaatRes.rows[0].id;

            const sakramenQuery = `
                INSERT INTO jemaat_sakramen (jemaat_id, bpts, sidi, nikah, meninggal)
                VALUES ($1, $2, $3, $4, $5)
            `;
            await client.query(sakramenQuery, [
                jemaatId,
                sakramen?.bpts || false,
                sakramen?.sidi || false,
                sakramen?.nikah || false,
                sakramen?.meninggal || false
            ]);

            await client.query('COMMIT');

            await logActivity(req.user?.id, req.user?.nama, 'TAMBAH', 'JEMAAT', `Menambahkan jemaat baru: ${nama}`);

            res.status(201).json({ success: true, id: jemaatId, message: 'Data jemaat berhasil ditambahkan' });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error in JemaatController.create:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal menambah data jemaat',
                error: error.message
            });
        } finally {
            client.release();
        }
    }

    // Update member data
    async update(req, res) {
        const client = await pool.connect();
        try {
            const { id } = req.params;
            await client.query('BEGIN');
            const {
                nama, sektor_id, pendidikan_terakhir, pekerjaan,
                kategorial, keterangan, sakramen,
                jenis_kelamin, tempat_lahir, tanggal_lahir
            } = req.body;

            // Validasi backend untuk pekerjaan
            if (!pekerjaan || pekerjaan.trim() === '') {
                return res.status(400).json({
                    success: false,
                    error: 'Pekerjaan wajib diisi'
                });
            }

            if (!JemaatController.VALID_PEKERJAAN.includes(pekerjaan)) {
                return res.status(400).json({
                    success: false,
                    error: 'Pekerjaan tidak valid'
                });
            }

            const jemaatUpdate = `
                UPDATE jemaat
                SET nama = $1, sektor_id = $2, pendidikan_terakhir = $3, 
                    pekerjaan = $4, kategorial = $5, keterangan = $6,
                    jenis_kelamin = $7, tempat_lahir = $8, tanggal_lahir = $9
                WHERE id = $10
            `;
            await client.query(jemaatUpdate, [
                nama, sektor_id, pendidikan_terakhir, pekerjaan, kategorial, keterangan,
                jenis_kelamin, tempat_lahir, tanggal_lahir, id
            ]);

            const sakramenUpdate = `
                UPDATE jemaat_sakramen
                SET bpts = $1, sidi = $2, nikah = $3, meninggal = $4, updated_at = CURRENT_TIMESTAMP
                WHERE jemaat_id = $5
            `;
            const sakramenRes = await client.query(sakramenUpdate, [
                sakramen?.bpts || false,
                sakramen?.sidi || false,
                sakramen?.nikah || false,
                sakramen?.meninggal || false,
                id
            ]);

            // If no sakramen row exists, insert one (edge case)
            if (sakramenRes.rowCount === 0) {
                await client.query(`
                    INSERT INTO jemaat_sakramen (jemaat_id, bpts, sidi, nikah, meninggal)
                    VALUES ($1, $2, $3, $4, $5)
                `, [
                    id,
                    sakramen?.bpts || false,
                    sakramen?.sidi || false,
                    sakramen?.nikah || false,
                    sakramen?.meninggal || false
                ]);
            }

            await client.query('COMMIT');

            await logActivity(req.user?.id, req.user?.nama, 'UBAH', 'JEMAAT', `Memperbarui data jemaat: ${nama}`);

            res.json({ success: true, message: 'Data jemaat berhasil diperbarui' });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error in JemaatController.update:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal memperbarui data jemaat',
                error: error.message
            });
        } finally {
            client.release();
        }
    }

    // Soft delete member
    async delete(req, res) {
        try {
            const { id } = req.params;
            await pool.query('UPDATE jemaat SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

            await logActivity(req.user?.id, req.user?.nama, 'HAPUS', 'JEMAAT', `Menghapus jemaat ID: ${id}`);

            res.json({ success: true, message: 'Data jemaat berhasil dihapus (soft delete)' });
        } catch (error) {
            console.error('Error in JemaatController.delete:', error);
            res.status(500).json({ success: false, message: 'Gagal menghapus data jemaat' });
        }
    }

    // Get all sectors for dropdown
    async getSectors(req, res) {
        try {
            const result = await pool.query('SELECT id, nama_sektor, no_hp, alamat FROM sectors ORDER BY nama_sektor ASC');
            res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Error in JemaatController.getSectors:', error);
            res.status(500).json({ success: false, message: 'Gagal mengambil data sektor' });
        }
    }

    // Create new sector
    async createSector(req, res) {
        try {
            const { nama_sektor, no_hp, alamat } = req.body;
            if (!nama_sektor) {
                return res.status(400).json({ success: false, message: 'Nama sektor wajib diisi' });
            }

            const result = await pool.query(
                'INSERT INTO sectors (nama_sektor, no_hp, alamat) VALUES ($1, $2, $3) RETURNING *',
                [nama_sektor, no_hp, alamat]
            );

            await logActivity(req.user?.id, req.user?.nama, 'TAMBAH', 'SEKTOR', `Menambahkan sektor baru: ${nama_sektor}`);

            res.status(201).json({ success: true, data: result.rows[0], message: 'Sektor berhasil ditambahkan' });
        } catch (error) {
            console.error('Error in JemaatController.createSector:', error);
            res.status(500).json({ success: false, message: 'Gagal menambahkan sektor' });
        }
    }

    // Update sector
    async updateSector(req, res) {
        try {
            const { id } = req.params;
            const { nama_sektor, no_hp, alamat } = req.body;

            const result = await pool.query(
                'UPDATE sectors SET nama_sektor = $1, no_hp = $2, alamat = $3 WHERE id = $4 RETURNING *',
                [nama_sektor, no_hp, alamat, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Sektor tidak ditemukan' });
            }

            res.json({ success: true, data: result.rows[0], message: 'Sektor berhasil diperbarui' });
        } catch (error) {
            console.error('Error in JemaatController.updateSector:', error);
            res.status(500).json({ success: false, message: 'Gagal memperbarui sektor' });
        }
    }

    // Delete sector
    async deleteSector(req, res) {
        try {
            const { id } = req.params;

            // Optional: Check if sector has members
            const checkMembers = await pool.query('SELECT COUNT(*) FROM jemaat WHERE sektor_id = $1 AND deleted_at IS NULL', [id]);
            if (parseInt(checkMembers.rows[0].count) > 0) {
                return res.status(400).json({ success: false, message: 'Sektor tidak dapat dihapus karena masih memiliki jemaat aktif' });
            }

            const result = await pool.query('DELETE FROM sectors WHERE id = $1 RETURNING *', [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Sektor tidak ditemukan' });
            }

            res.json({ success: true, message: 'Sektor berhasil dihapus' });
        } catch (error) {
            console.error('Error in JemaatController.deleteSector:', error);
            res.status(500).json({ success: false, message: 'Gagal menghapus sektor' });
        }
    }
}

export default new JemaatController();
