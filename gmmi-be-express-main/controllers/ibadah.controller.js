import IbadahService from '../services/ibadah.service.js';

class IbadahController {
    async getAll(req, res) {
        try {
            const data = await IbadahService.getAll();
            // Match legacy format for frontend compatibility
            const formatted = data.map(item => ({
                id: item.id,
                judul: item.kegiatan,
                tanggal: item.tanggal ? item.tanggal.toISOString().split('T')[0] : null,
                waktu: item.jam_mulai ? item.jam_mulai.toISOString().split('T')[1].substring(0, 5) : null,
                lokasi: item.lokasi,
                penanggung_jawab: item.penanggung_jawab,
                status: item.status
            }));

            return res.status(200).json({
                success: true,
                data: formatted
            });
        } catch (error) {
            console.error('[GET /api/ibadah] Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Gagal mengambil data jadwal',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async create(req, res) {
        try {
            const { judul, tanggal, waktu } = req.body;
            if (!judul || !tanggal || !waktu) {
                return res.status(400).json({ success: false, message: 'Judul, tanggal, dan waktu harus diisi' });
            }

            const data = await IbadahService.create(req.body);

            return res.status(201).json({
                success: true,
                message: 'Jadwal berhasil dibuat',
                data: {
                    id: data.id,
                    judul: data.kegiatan,
                    tanggal: data.tanggal.toISOString().split('T')[0],
                    waktu: data.jam_mulai.toISOString().split('T')[1].substring(0, 5),
                    lokasi: data.lokasi,
                    penanggung_jawab: data.penanggung_jawab,
                    status: data.status
                }
            });
        } catch (error) {
            console.error('[POST /api/ibadah] Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Gagal membuat jadwal',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const data = await IbadahService.update(id, req.body);

            return res.status(200).json({
                success: true,
                message: 'Jadwal berhasil diperbarui',
                data: {
                    id: data.id,
                    judul: data.kegiatan,
                    tanggal: data.tanggal.toISOString().split('T')[0],
                    waktu: data.jam_mulai.toISOString().split('T')[1].substring(0, 5),
                    lokasi: data.lokasi,
                    penanggung_jawab: data.penanggung_jawab,
                    status: data.status
                }
            });
        } catch (error) {
            console.error('[PUT /api/ibadah/:id] Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Gagal memperbarui jadwal',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            await IbadahService.delete(id);
            return res.status(200).json({
                success: true,
                message: 'Jadwal berhasil dihapus'
            });
        } catch (error) {
            console.error('[DELETE /api/ibadah/:id] Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Gagal menghapus jadwal',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

export default new IbadahController();
