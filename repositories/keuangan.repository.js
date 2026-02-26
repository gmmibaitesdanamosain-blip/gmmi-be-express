import prisma from '../config/prisma.js';

class KeuanganRepository {
    // ─── Generic query ────────────────────────────────────────────
    async findMany(args) {
        return prisma.laporan_keuangan.findMany(args);
    }

    async aggregate(args) {
        return prisma.laporan_keuangan.aggregate(args);
    }

    async findById(id) {
        return prisma.laporan_keuangan.findUnique({ where: { id } });
    }

    // ─── Running-balance helpers ───────────────────────────────────

    /**
     * Ambil baris terakhir dengan tanggal <= tanggal yang diberikan.
     * Dipakai saat INSERT untuk menentukan saldo sebelumnya.
     */
    async findLastUpToDate(tanggal) {
        return prisma.laporan_keuangan.findFirst({
            where: { tanggal: { lte: tanggal } },
            orderBy: [{ tanggal: 'desc' }, { created_at: 'desc' }]
        });
    }

    /**
     * Ambil baris terakhir dengan tanggal < tanggal (strictly before).
     * Dipakai sebagai titik awal saat recalculate setelah DELETE.
     */
    async findLastBeforeDate(tanggal) {
        return prisma.laporan_keuangan.findFirst({
            where: { tanggal: { lt: tanggal } },
            orderBy: [{ tanggal: 'desc' }, { created_at: 'desc' }]
        });
    }

    /**
     * Ambil semua baris dari tanggal tertentu ke atas, urut ASC.
     * Dipakai untuk recalculate running balance setelah DELETE.
     */
    async findFromDate(tanggal) {
        return prisma.laporan_keuangan.findMany({
            where: { tanggal: { gte: tanggal } },
            orderBy: [{ tanggal: 'asc' }, { created_at: 'asc' }]
        });
    }

    /**
     * Cek apakah sudah ada baris saldo_awal pada tanggal tertentu.
     */
    async countSaldoAwal(tanggal) {
        return prisma.laporan_keuangan.count({
            where: { tanggal: new Date(tanggal), tipe: 'saldo_awal' }
        });
    }

    // ─── CRUD ─────────────────────────────────────────────────────
    async create(data) {
        return prisma.laporan_keuangan.create({
            data: {
                tanggal:         new Date(data.tanggal),
                keterangan:      data.keterangan ?? '',
                tipe:            data.tipe ?? 'transaksi',
                kas_penerimaan:  Number(data.kas_penerimaan  ?? 0),
                kas_pengeluaran: Number(data.kas_pengeluaran ?? 0),
                saldo_kas:       Number(data.saldo_kas       ?? 0),
                bank_debit:      Number(data.bank_debit      ?? 0),
                bank_kredit:     Number(data.bank_kredit     ?? 0),
                saldo_bank:      Number(data.saldo_bank      ?? 0),
                created_by:      data.created_by ?? null
            }
        });
    }

    async update(id, data) {
        const payload = {};
        if (data.tanggal         !== undefined) payload.tanggal         = new Date(data.tanggal);
        if (data.keterangan      !== undefined) payload.keterangan      = data.keterangan;
        if (data.tipe            !== undefined) payload.tipe            = data.tipe;
        if (data.kas_penerimaan  !== undefined) payload.kas_penerimaan  = Number(data.kas_penerimaan);
        if (data.kas_pengeluaran !== undefined) payload.kas_pengeluaran = Number(data.kas_pengeluaran);
        if (data.saldo_kas       !== undefined) payload.saldo_kas       = Number(data.saldo_kas);
        if (data.bank_debit      !== undefined) payload.bank_debit      = Number(data.bank_debit);
        if (data.bank_kredit     !== undefined) payload.bank_kredit     = Number(data.bank_kredit);
        if (data.saldo_bank      !== undefined) payload.saldo_bank      = Number(data.saldo_bank);
        payload.updated_at = new Date();

        return prisma.laporan_keuangan.update({ where: { id }, data: payload });
    }

    async updateSaldo(id, saldo_kas, saldo_bank) {
        return prisma.laporan_keuangan.update({
            where: { id },
            data: { saldo_kas, saldo_bank, updated_at: new Date() }
        });
    }

    async delete(id) {
        return prisma.laporan_keuangan.delete({ where: { id } });
    }
}

export default new KeuanganRepository();
