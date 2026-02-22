import PekerjaanService from '../services/pekerjaan.service.js';

class PekerjaanController {
    async getAll(req, res) {
        try {
            const data = await PekerjaanService.getAll();
            return res.status(200).json({ success: true, data });
        } catch (error) {
            console.error('[GET /api/pekerjaan] Error:', error);
            res.status(500).json({ success: false, message: 'Gagal mengambil data pekerjaan' });
        }
    }

    async getById(req, res) {
        try {
            const data = await PekerjaanService.getById(req.params.id);
            if (!data) return res.status(404).json({ success: false, message: 'Pekerjaan tidak ditemukan' });
            return res.status(200).json({ success: true, data });
        } catch (error) {
            console.error('[GET /api/pekerjaan/:id] Error:', error);
            res.status(500).json({ success: false, message: 'Gagal mengambil data pekerjaan' });
        }
    }

    async create(req, res) {
        try {
            const { nama_pekerjaan } = req.body;
            if (!nama_pekerjaan || nama_pekerjaan.trim() === '') {
                return res.status(400).json({ success: false, message: 'Nama pekerjaan harus diisi' });
            }
            const data = await PekerjaanService.create(nama_pekerjaan);
            return res.status(201).json({ success: true, data, message: 'Pekerjaan berhasil ditambahkan' });
        } catch (error) {
            if (error.code === 'P2002') return res.status(400).json({ success: false, message: 'Pekerjaan sudah ada' });
            console.error('[POST /api/pekerjaan] Error:', error);
            res.status(500).json({ success: false, message: 'Gagal menambahkan pekerjaan' });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { nama_pekerjaan } = req.body;
            if (!nama_pekerjaan || nama_pekerjaan.trim() === '') {
                return res.status(400).json({ success: false, message: 'Nama pekerjaan harus diisi' });
            }
            const data = await PekerjaanService.update(id, nama_pekerjaan);
            return res.status(200).json({ success: true, data, message: 'Pekerjaan berhasil diperbarui' });
        } catch (error) {
            if (error.code === 'P2002') return res.status(400).json({ success: false, message: 'Pekerjaan sudah ada' });
            console.error('[PUT /api/pekerjaan/:id] Error:', error);
            res.status(500).json({ success: false, message: 'Gagal memperbarui pekerjaan' });
        }
    }

    async delete(req, res) {
        try {
            await PekerjaanService.delete(req.params.id);
            return res.status(200).json({ success: true, message: 'Pekerjaan berhasil dihapus' });
        } catch (error) {
            console.error('[DELETE /api/pekerjaan/:id] Error:', error);
            return res.status(400).json({ success: false, message: error.message });
        }
    }
}

export default new PekerjaanController();
