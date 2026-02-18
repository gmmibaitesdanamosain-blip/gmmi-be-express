import JemaatService from '../services/jemaat.service.js';
import { logActivity } from '../utils/activityLogger.js';

class JemaatController {
    static VALID_PEKERJAAN = [
        'Buruh', 'Petani', 'Nelayan', 'PNS', 'TNI / POLRI',
        'Guru / Dosen', 'Tenaga Kesehatan', 'Rohaniawan', 'Lainnya'
    ];

    async getAll(req, res) {
        try {
            console.log('[GET /api/jemaat] Request received');
            console.log('[GET /api/jemaat] Query params:', req.query);

            const data = await JemaatService.getAllJemaat(req.query);

            console.log(`[GET /api/jemaat] Success - Found ${data.length} jemaat`);
            res.json({ success: true, data });
        } catch (error) {
            console.error('[GET /api/jemaat] Error:', error);
            console.error('[GET /api/jemaat] Error stack:', error.stack);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil data jemaat',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async create(req, res) {
        try {
            console.log('[POST /api/jemaat] Request received');
            console.log('[POST /api/jemaat] User:', req.user);
            console.log('[POST /api/jemaat] Request body:', JSON.stringify(req.body, null, 2));

            const { pekerjaan, nama, sektor_id } = req.body;

            // Validasi nama
            if (!nama || nama.trim() === '') {
                console.error('[POST /api/jemaat] Validation error: nama is required');
                return res.status(400).json({
                    success: false,
                    message: 'Nama jemaat wajib diisi'
                });
            }

            // Validasi sektor
            if (!sektor_id) {
                console.error('[POST /api/jemaat] Validation error: sektor_id is required');
                return res.status(400).json({
                    success: false,
                    message: 'Sektor wajib dipilih'
                });
            }

            // Validasi pekerjaan
            if (!pekerjaan || !JemaatController.VALID_PEKERJAAN.includes(pekerjaan)) {
                console.error('[POST /api/jemaat] Validation error: invalid pekerjaan:', pekerjaan);
                return res.status(400).json({
                    success: false,
                    message: 'Pekerjaan tidak valid. Pilih salah satu: ' + JemaatController.VALID_PEKERJAAN.join(', ')
                });
            }

            console.log('[POST /api/jemaat] Creating jemaat...');
            const jemaat = await JemaatService.createJemaat(req.body);
            console.log('[POST /api/jemaat] Jemaat created with ID:', jemaat.id);

            await logActivity(req.user?.id, req.user?.nama, 'TAMBAH', 'JEMAAT', `Menambahkan jemaat baru: ${nama}`);

            res.status(201).json({
                success: true,
                id: jemaat.id,
                message: 'Data jemaat berhasil ditambahkan'
            });
        } catch (error) {
            console.error('[POST /api/jemaat] Error:', error);
            console.error('[POST /api/jemaat] Error message:', error.message);
            console.error('[POST /api/jemaat] Error stack:', error.stack);
            res.status(500).json({
                success: false,
                message: 'Gagal menambah data jemaat',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { pekerjaan, nama } = req.body;

            if (!pekerjaan || !JemaatController.VALID_PEKERJAAN.includes(pekerjaan)) {
                return res.status(400).json({ success: false, error: 'Pekerjaan tidak valid' });
            }

            await JemaatService.updateJemaat(id, req.body);

            await logActivity(req.user?.id, req.user?.nama, 'UBAH', 'JEMAAT', `Memperbarui data jemaat: ${nama}`);

            res.json({ success: true, message: 'Data jemaat berhasil diperbarui' });
        } catch (error) {
            console.error('Error in JemaatController.update:', error);
            res.status(500).json({ success: false, message: 'Gagal memperbarui data jemaat', error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            await JemaatService.softDeleteJemaat(id);
            await logActivity(req.user?.id, req.user?.nama, 'HAPUS', 'JEMAAT', `Menghapus jemaat ID: ${id}`);
            res.json({ success: true, message: 'Data jemaat berhasil dihapus (soft delete)' });
        } catch (error) {
            console.error('Error in JemaatController.delete:', error);
            res.status(500).json({ success: false, message: 'Gagal menghapus data jemaat' });
        }
    }

    async getSectors(req, res) {
        try {
            const data = await JemaatService.getAllSectors();
            res.json({ success: true, data });
        } catch (error) {
            console.error('Error in JemaatController.getSectors:', error);
            res.status(500).json({ success: false, message: 'Gagal mengambil data sektor' });
        }
    }

    async createSector(req, res) {
        try {
            const { nama_sektor } = req.body;
            if (!nama_sektor) {
                return res.status(400).json({ success: false, message: 'Nama sektor wajib diisi' });
            }
            const data = await JemaatService.createSector(req.body);
            await logActivity(req.user?.id, req.user?.nama, 'TAMBAH', 'SEKTOR', `Menambahkan sektor baru: ${nama_sektor}`);
            res.status(201).json({ success: true, data, message: 'Sektor berhasil ditambahkan' });
        } catch (error) {
            console.error('Error in JemaatController.createSector:', error);
            res.status(500).json({ success: false, message: 'Gagal menambahkan sektor' });
        }
    }

    async updateSector(req, res) {
        try {
            const { id } = req.params;
            const data = await JemaatService.updateSector(id, req.body);
            res.json({ success: true, data, message: 'Sektor berhasil diperbarui' });
        } catch (error) {
            console.error('Error in JemaatController.updateSector:', error);
            res.status(500).json({ success: false, message: 'Gagal memperbarui sektor' });
        }
    }

    async deleteSector(req, res) {
        try {
            const { id } = req.params;
            await JemaatService.deleteSector(id);
            res.json({ success: true, message: 'Sektor berhasil dihapus' });
        } catch (error) {
            console.error('Error in JemaatController.deleteSector:', error);
            res.status(500).json({ success: false, message: error.message || 'Gagal menghapus sektor' });
        }
    }
}

export default new JemaatController();
