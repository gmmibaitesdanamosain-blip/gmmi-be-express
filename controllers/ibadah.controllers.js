import pool from '../config/db.js';

class JadwalController {
    async getAll(req, res) {
        try {
            // Only return active schedules for public view, but Super Admin might want all.
            // Since this endpoint is used by both, let's return all active ones by default, or handle query params?
            // The previous implementation filtered by status='aktif'.
            // The Super Admin frontend receives all?
            // "const upcomingAgenda = agendaList.filter(j => j.status === 'aktif')" in frontend suggests backend returns all?
            // But previous backend code: "WHERE status = 'aktif'".
            // If backend filters by active, then Super Admin only sees active ones.
            // Maybe Super Admin wants to see 'selesai' too?
            // Let's remove the filter for now to let frontend handle it, OR check if query param exists.

            // The frontend Super Admin does fetching via `getAgenda()`.
            // The frontend User View via `getJadwal()`.
            // Both hit `/api/jadwal`.

            // Let's modify to return all for now, as Super Admin has status chips for 'aktif' and 'selesai'.

            const result = await pool.query(
                `SELECT 
                    id, 
                    kegiatan as judul, 
                    to_char(tanggal, 'YYYY-MM-DD') as tanggal, 
                    to_char(jam_mulai, 'HH24:MI') as waktu, 
                    lokasi, 
                    penanggung_jawab, 
                    status 
                FROM agenda 
                ORDER BY tanggal DESC, jam_mulai DESC`
            );
            return res.status(200).json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('Error in JadwalController.getAll:', error);
            return res.status(500).json({ success: false, message: 'Gagal mengambil data jadwal' });
        }
    }

    async create(req, res) {
        try {
            const { judul, tanggal, waktu, lokasi, penanggung_jawab, status } = req.body;
            if (!judul || !tanggal || !waktu) {
                return res.status(400).json({ success: false, message: 'Judul, tanggal, dan waktu harus diisi' });
            }

            const query = `
                INSERT INTO agenda (kegiatan, tanggal, jam_mulai, lokasi, penanggung_jawab, status)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING 
                    id, 
                    kegiatan as judul, 
                    to_char(tanggal, 'YYYY-MM-DD') as tanggal, 
                    to_char(jam_mulai, 'HH24:MI') as waktu, 
                    lokasi, 
                    penanggung_jawab, 
                    status
            `;
            const result = await pool.query(query, [
                judul,
                tanggal,
                waktu,
                lokasi,
                penanggung_jawab,
                status || 'aktif'
            ]);

            return res.status(201).json({
                success: true,
                message: 'Jadwal berhasil dibuat',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error in JadwalController.create:', error);
            return res.status(500).json({ success: false, message: 'Gagal membuat jadwal' });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { judul, tanggal, waktu, lokasi, penanggung_jawab, status } = req.body;

            const query = `
                UPDATE agenda
                SET kegiatan = $1, tanggal = $2, jam_mulai = $3, lokasi = $4, penanggung_jawab = $5, status = $6, updated_at = NOW()
                WHERE id = $7
                RETURNING 
                    id, 
                    kegiatan as judul, 
                    to_char(tanggal, 'YYYY-MM-DD') as tanggal, 
                    to_char(jam_mulai, 'HH24:MI') as waktu, 
                    lokasi, 
                    penanggung_jawab, 
                    status
            `;
            const result = await pool.query(query, [judul, tanggal, waktu, lokasi, penanggung_jawab, status, id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
            }

            return res.status(200).json({
                success: true,
                message: 'Jadwal berhasil diperbarui',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error in JadwalController.update:', error);
            return res.status(500).json({ success: false, message: 'Gagal memperbarui jadwal' });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await pool.query('DELETE FROM agenda WHERE id = $1 RETURNING id', [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
            }

            return res.status(200).json({
                success: true,
                message: 'Jadwal berhasil dihapus'
            });
        } catch (error) {
            console.error('Error in JadwalController.delete:', error);
            return res.status(500).json({ success: false, message: 'Gagal menghapus jadwal' });
        }
    }
}

export default new JadwalController();
