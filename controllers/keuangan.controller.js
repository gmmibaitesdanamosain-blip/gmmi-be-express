import KeuanganService from '../services/keuangan.service.js';
import { logActivity } from '../utils/activityLogger.js';

class KeuanganController {

    async getAll(req, res) {
        try {
            const result = await KeuanganService.getAll(req.query);
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            console.error('[GET /api/keuangan] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil data keuangan',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async getSummary(req, res) {
        try {
            const data = await KeuanganService.getSummary();
            return res.status(200).json({ success: true, data });
        } catch (error) {
            console.error('[GET /api/keuangan/summary] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil ringkasan',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async create(req, res) {
        try {
            const data = await KeuanganService.create({
                ...req.body,
                created_by: req.user?.id ?? null
            });
            await logActivity(
                req.user?.id, req.user?.nama,
                'TAMBAH', 'KEUANGAN',
                `Menambah ${req.body.tipe === 'saldo_awal' ? 'saldo awal' : 'transaksi'}: ${req.body.keterangan}`
            );
            return res.status(201).json({
                success: true,
                message: 'Transaksi berhasil disimpan',
                data
            });
        } catch (error) {
            console.error('[POST /api/keuangan] Error:', error);
            const statusCode = error.statusCode ?? 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Gagal menyimpan transaksi',
                error: process.env.NODE_ENV === 'development' && statusCode === 500
                    ? error.message : undefined
            });
        }
    }

    async update(req, res) {
        try {
            const id = req.params.id;
            const data = await KeuanganService.update(id, req.body);
            await logActivity(
                req.user?.id, req.user?.nama,
                'UBAH', 'KEUANGAN',
                `Memperbarui transaksi ID: ${id}`
            );
            return res.status(200).json({
                success: true,
                message: 'Transaksi berhasil diperbarui',
                data
            });
        } catch (error) {
            console.error('[PUT /api/keuangan] Error:', error);
            const statusCode = error.statusCode ?? 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Gagal memperbarui transaksi',
                error: process.env.NODE_ENV === 'development' && statusCode === 500
                    ? error.message : undefined
            });
        }
    }

    async delete(req, res) {
        try {
            const id = req.params.id;
            await KeuanganService.delete(id);
            await logActivity(
                req.user?.id, req.user?.nama,
                'HAPUS', 'KEUANGAN',
                `Menghapus transaksi ID: ${id}`
            );
            return res.status(200).json({
                success: true,
                message: 'Transaksi berhasil dihapus'
            });
        } catch (error) {
            console.error('[DELETE /api/keuangan] Error:', error);
            const statusCode = error.statusCode ?? 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Gagal menghapus transaksi',
                error: process.env.NODE_ENV === 'development' && statusCode === 500
                    ? error.message : undefined
            });
        }
    }

    async exportExcel(req, res) {
        try {
            const { workbook, filename } = await KeuanganService.export(req.query);

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${filename}"`
            );

            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error('[GET /api/keuangan/export] Error:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal mengekspor data keuangan',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

export default new KeuanganController();
