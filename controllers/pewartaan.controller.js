import PewartaanService from '../services/pewartaan.service.js';
import { uploadFile, deleteFile } from '../config/appwrite.js';

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
            const { judul, tanggal_ibadah, hari, tempat_jemaat, ayat_firman, tema_khotbah, status } = req.body;

            if (!judul || judul.trim() === '') {
                return res.status(400).json({ success: false, message: 'Judul warta wajib diisi' });
            }
            if (!tanggal_ibadah) {
                return res.status(400).json({ success: false, message: 'Tanggal ibadah wajib diisi' });
            }

            let file_word_url = null, file_word_id = null;
            let file_pdf_url = null, file_pdf_id = null;

            // Handle file Word upload
            if (req.files?.file_word?.[0]) {
                const wordFile = req.files.file_word[0];
                const result = await uploadFile('pewartaan', wordFile);
                file_word_url = result.url;
                file_word_id = result.fileId;
            }

            // Handle file PDF upload
            if (req.files?.file_pdf?.[0]) {
                const pdfFile = req.files.file_pdf[0];
                const result = await uploadFile('pewartaan', pdfFile);
                file_pdf_url = result.url;
                file_pdf_id = result.fileId;
            }

            const result = await PewartaanService.create({
                judul, tanggal_ibadah, hari, tempat_jemaat,
                ayat_firman, tema_khotbah, status,
                file_word_url, file_word_id,
                file_pdf_url, file_pdf_id
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
            const { judul, tanggal_ibadah, hari, tempat_jemaat, ayat_firman, tema_khotbah, status } = req.body;

            // Get existing data for file cleanup
            const existing = await PewartaanService.getById(id);
            if (!existing) return res.status(404).json({ success: false, message: 'Pewartaan tidak ditemukan' });

            let file_word_url = undefined, file_word_id = undefined;
            let file_pdf_url = undefined, file_pdf_id = undefined;

            // Handle file Word upload - hapus file lama jika ada file baru
            if (req.files?.file_word?.[0]) {
                if (existing.file_word_url) {
                    await deleteFile('pewartaan', existing.file_word_url);
                }
                const result = await uploadFile('pewartaan', req.files.file_word[0]);
                file_word_url = result.url;
                file_word_id = result.fileId;
            }

            // Handle file PDF upload - hapus file lama jika ada file baru
            if (req.files?.file_pdf?.[0]) {
                if (existing.file_pdf_url) {
                    await deleteFile('pewartaan', existing.file_pdf_url);
                }
                const result = await uploadFile('pewartaan', req.files.file_pdf[0]);
                file_pdf_url = result.url;
                file_pdf_id = result.fileId;
            }

            await PewartaanService.update(id, {
                judul, tanggal_ibadah, hari, tempat_jemaat,
                ayat_firman, tema_khotbah, status,
                file_word_url, file_word_id,
                file_pdf_url, file_pdf_id
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

            // Hapus file dari Appwrite sebelum hapus dari DB
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
