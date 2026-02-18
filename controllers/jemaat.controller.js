import JemaatService from '../services/jemaat.service.js';
import { logActivity } from '../utils/activityLogger.js';

class JemaatController {
    VALID_PEKERJAAN = [
        'Buruh', 'Petani', 'Nelayan', 'PNS', 'TNI / POLRI',
        'Guru / Dosen', 'Tenaga Kesehatan', 'Rohaniawan', 'Lainnya'
    ];

    // Menggunakan arrow function untuk auto-binding 'this'
    getAll = async (req, res) => {
        try {
            const data = await JemaatService.getAllJemaat(req.query);
            return res.json({ success: true, data });
        } catch (error) {
            console.error('[JemaatController.getAll] Error:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Gagal mengambil data jemaat'
            });
        }
    };

    create = async (req, res) => {
        try {
            const { pekerjaan, nama, sektor_id } = req.body;

            if (!nama?.trim()) {
                return res.status(400).json({ success: false, message: 'Nama jemaat wajib diisi' });
            }

            if (!sektor_id) {
                return res.status(400).json({ success: false, message: 'Sektor wajib dipilih' });
            }

            if (!pekerjaan || !this.VALID_PEKERJAAN.includes(pekerjaan)) {
                return res.status(400).json({
                    success: false,
                    message: `Pekerjaan tidak valid. Pilih: ${this.VALID_PEKERJAAN.join(', ')}`
                });
            }

            const jemaat = await JemaatService.createJemaat(req.body);

            await logActivity(req.user?.id, req.user?.nama, 'TAMBAH', 'JEMAAT', `Menambahkan jemaat: ${nama}`);

            return res.status(201).json({
                success: true,
                id: jemaat.id,
                message: 'Data jemaat berhasil ditambahkan'
            });
        } catch (error) {
            console.error('[JemaatController.create] Error:', error.message);
            return res.status(500).json({ success: false, message: 'Gagal menambah data jemaat' });
        }
    };

    update = async (req, res) => {
        try {
            const { id } = req.params;
            const { pekerjaan, nama } = req.body;

            if (pekerjaan && !this.VALID_PEKERJAAN.includes(pekerjaan)) {
                return res.status(400).json({ success: false, message: 'Pekerjaan tidak valid' });
            }

            await JemaatService.updateJemaat(id, req.body);
            await logActivity(req.user?.id, req.user?.nama, 'UBAH', 'JEMAAT', `Memperbarui data jemaat: ${nama || id}`);

            return res.json({ success: true, message: 'Data jemaat berhasil diperbarui' });
        } catch (error) {
            console.error('[JemaatController.update] Error:', error.message);
            return res.status(500).json({ success: false, message: 'Gagal memperbarui data jemaat' });
        }
    };

    delete = async (req, res) => {
        try {
            const { id } = req.params;
            await JemaatService.softDeleteJemaat(id);
            await logActivity(req.user?.id, req.user?.nama, 'HAPUS', 'JEMAAT', `Menghapus jemaat ID: ${id}`);
            return res.json({ success: true, message: 'Data jemaat berhasil dihapus' });
        } catch (error) {
            console.error('[JemaatController.delete] Error:', error.message);
            return res.status(500).json({ success: false, message: 'Gagal menghapus data jemaat' });
        }
    };

    getSectors = async (req, res) => {
        try {
            const data = await JemaatService.getAllSectors();
            return res.json({ success: true, data });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Gagal mengambil data sektor' });
        }
    };

    createSector = async (req, res) => {
        try {
            const { nama_sektor } = req.body;
            if (!nama_sektor) return res.status(400).json({ success: false, message: 'Nama sektor wajib diisi' });
            
            const data = await JemaatService.createSector(req.body);
            await logActivity(req.user?.id, req.user?.nama, 'TAMBAH', 'SEKTOR', `Menambahkan sektor: ${nama_sektor}`);
            return res.status(201).json({ success: true, data, message: 'Sektor berhasil ditambahkan' });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Gagal menambahkan sektor' });
        }
    };

    updateSector = async (req, res) => {
        try {
            const { id } = req.params;
            const data = await JemaatService.updateSector(id, req.body);
            return res.json({ success: true, data, message: 'Sektor berhasil diperbarui' });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Gagal memperbarui sektor' });
        }
    };

    deleteSector = async (req, res) => {
        try {
            const { id } = req.params;
            await JemaatService.deleteSector(id);
            return res.json({ success: true, message: 'Sektor berhasil dihapus' });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    };
}

export default new JemaatController();
