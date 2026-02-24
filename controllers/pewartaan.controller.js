import PewartaanService from '../services/pewartaan.service.js';
import { deleteFile } from '../config/appwrite.js';

class PewartaanController {
    async getAll(req, res) {
        try {
            const data = await PewartaanService.getAll();
            res.json({ success: true, data });
        } catch (error) {
            console.error('Error in PewartaanController.getAll:', error);
            res.status(500).json({ success: false, message: 'Gagal mengambil data pewartaan', error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const data = await PewartaanService.getById(req.params.id);
            if (!data) return res.status(404).json({ success: false, message: 'Pewartaan tidak ditemukan' });
            res.json({ success: true, data });
        } catch (error) {
            console.error('Error in PewartaanController.getById:', error);
            res.status(500).json({ success: false, message: 'Gagal mengambil detail pewartaan', error: error.message });
        }
    }

    async create(req, res) {
        try {
            const {
                judul, tanggal_ibadah, hari, tempat_jemaat,
                ayat_firman, tema_khotbah, status,
                file_word_url, file_word_id,
                file_pdf_url, file_pdf_id
            } = req.body;

            if (!judul || judul.trim() === '') {
                return res.status(400).json({ success: false, message: 'Judul warta wajib diisi' });
            }
            if (!tanggal_ibadah) {
                return res.status(400).json({ success: false, message: 'Tanggal ibadah wajib diisi' });
            }

            const result = await PewartaanService.create({
                judul, tanggal_ibadah, hari, tempat_jemaat,
                ayat_firman, tema_khotbah, status,
                file_word_url: file_word_url || null,
                file_word_id: file_word_id || null,
                file_pdf_url: file_pdf_url || null,
                file_pdf_id: file_pdf_id || null
            });

            res.status(201).json({
                success: true,
                message: 'Pewartaan berhasil dibuat',
                id: result.id,
                data: result
            });
        } catch (error) {
            console.error('Error in PewartaanController.create:', error);
            res.status(500).json({ success: false, message: 'Gagal membuat pewartaan', error: error.message });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const {
                judul, tanggal_ibadah, hari, tempat_jemaat,
                ayat_firman, tema_khotbah, status,
                file_word_url, file_word_id,
                file_pdf_url, file_pdf_id
            } = req.body;

            const existing = await PewartaanService.getById(id);
            if (!existing) return res.status(404).json({ success: false, message: 'Pewartaan tidak ditemukan' });

            await PewartaanService.update(id, {
                judul, tanggal_ibadah, hari, tempat_jemaat,
                ayat_firman, tema_khotbah, status,
                file_word_url: file_word_url !== undefined ? file_word_url : existing.file_word_url,
                file_word_id: file_word_id !== undefined ? file_word_id : existing.file_word_id,
                file_pdf_url: file_pdf_url !== undefined ? file_pdf_url : existing.file_pdf_url,
                file_pdf_id: file_pdf_id !== undefined ? file_pdf_id : existing.file_pdf_id
            });

            res.json({ success: true, message: 'Pewartaan berhasil diperbarui' });
        } catch (error) {
            console.error('Error in PewartaanController.update:', error);
            res.status(500).json({ success: false, message: 'Gagal memperbarui pewartaan', error: error.message });
        }
    }

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['approved', 'rejected', 'pending', 'draft'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Status tidak valid' });
            }

            const data = await PewartaanService.updateStatus(id, status);
            res.json({ success: true, message: `Status berhasil diubah menjadi ${status}`, data });
        } catch (error) {
            console.error('Error in PewartaanController.updateStatus:', error);
            res.status(500).json({ success: false, message: 'Gagal memperbarui status pewartaan', error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;

            const existing = await PewartaanService.getById(id);
            if (existing) {
                if (existing.file_word_url) await deleteFile('pewartaan', existing.file_word_url);
                if (existing.file_pdf_url) await deleteFile('pewartaan', existing.file_pdf_url);
            }

            await PewartaanService.delete(id);
            res.json({ success: true, message: 'Pewartaan berhasil dihapus' });
        } catch (error) {
            console.error('Error in PewartaanController.delete:', error);
            res.status(500).json({ success: false, message: 'Gagal menghapus pewartaan', error: error.message });
        }
    }
}

export default new PewartaanController();
