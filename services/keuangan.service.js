import ExcelJS from 'exceljs';
import KeuanganRepository from '../repositories/keuangan.repository.js';

// Nama bulan dalam Bahasa Indonesia
const BULAN_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function formatTanggalId(d) {
    const dt = new Date(d);
    return `${dt.getUTCDate()} ${BULAN_ID[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`;
}

function toNum(val) {
    return Number(val ?? 0);
}

class KeuanganService {

    // ─── GET /api/keuangan ──────────────────────────────────────────
    async getAll(filters = {}) {
        const { startDate, endDate } = filters;

        const where = {};
        if (startDate || endDate) {
            where.tanggal = {};
            if (startDate) where.tanggal.gte = new Date(startDate);
            if (endDate)   where.tanggal.lte = new Date(endDate);
        }

        const rows = await KeuanganRepository.findMany({
            where,
            orderBy: [{ tanggal: 'asc' }, { created_at: 'asc' }]
        });

        let totalKasMasuk   = 0;
        let totalKasKeluar  = 0;
        let totalBankDebit  = 0;
        let totalBankKredit = 0;

        const data = rows.map(row => {
            totalKasMasuk   += toNum(row.kas_penerimaan);
            totalKasKeluar  += toNum(row.kas_pengeluaran);
            totalBankDebit  += toNum(row.bank_debit);
            totalBankKredit += toNum(row.bank_kredit);

            return {
                id:              row.id,
                tanggal:         row.tanggal,
                keterangan:      row.keterangan,
                tipe:            row.tipe,
                kas_penerimaan:  toNum(row.kas_penerimaan),
                kas_pengeluaran: toNum(row.kas_pengeluaran),
                saldo_kas:       toNum(row.saldo_kas),
                bank_debit:      toNum(row.bank_debit),
                bank_kredit:     toNum(row.bank_kredit),
                saldo_bank:      toNum(row.saldo_bank),
                created_at:      row.created_at,
                updated_at:      row.updated_at
            };
        });

        const lastRow = data[data.length - 1];

        return {
            data,
            summary: {
                saldo_akhir_kas:   lastRow ? lastRow.saldo_kas   : 0,
                saldo_akhir_bank:  lastRow ? lastRow.saldo_bank  : 0,
                total_kas_masuk:   totalKasMasuk,
                total_kas_keluar:  totalKasKeluar,
                total_bank_debit:  totalBankDebit,
                total_bank_kredit: totalBankKredit
            }
        };
    }

    // ─── GET /api/keuangan/summary ──────────────────────────────────
    async getSummary() {
        const summary = await KeuanganRepository.aggregate({
            where: { tipe: 'transaksi' },
            _sum: {
                kas_penerimaan:  true,
                kas_pengeluaran: true,
                bank_debit:      true,
                bank_kredit:     true
            }
        });

        const kasIn   = toNum(summary._sum.kas_penerimaan);
        const kasOut  = toNum(summary._sum.kas_pengeluaran);
        const bankIn  = toNum(summary._sum.bank_debit);
        const bankOut = toNum(summary._sum.bank_kredit);

        // Saldo akhir dari baris terakhir (stored running balance)
        const lastRows = await KeuanganRepository.findMany({
            orderBy: [{ tanggal: 'desc' }, { created_at: 'desc' }],
            take: 1
        });
        const lastRow = lastRows[0] ?? null;

        return {
            totalIncome:  kasIn  + bankIn,
            totalExpense: kasOut + bankOut,
            balance:      (kasIn + bankIn) - (kasOut + bankOut),
            details: {
                saldo_kas:  lastRow ? toNum(lastRow.saldo_kas)  : kasIn  - kasOut,
                saldo_bank: lastRow ? toNum(lastRow.saldo_bank) : bankIn - bankOut
            }
        };
    }

    // ─── POST /api/keuangan ─────────────────────────────────────────
    async create(body) {
        const {
            tanggal,
            keterangan,
            tipe = 'transaksi',
            kas_penerimaan  = 0,
            kas_pengeluaran = 0,
            bank_debit      = 0,
            bank_kredit     = 0,
            created_by      = null
        } = body;

        // Validasi tipe
        if (!['transaksi', 'saldo_awal'].includes(tipe)) {
            const err = new Error('Tipe tidak valid. Gunakan "transaksi" atau "saldo_awal".');
            err.statusCode = 400;
            throw err;
        }

        // Validasi duplikat saldo_awal pada tanggal yang sama
        if (tipe === 'saldo_awal') {
            const existing = await KeuanganRepository.countSaldoAwal(tanggal);
            if (existing > 0) {
                const err = new Error('Saldo awal untuk periode ini sudah ada.');
                err.statusCode = 400;
                throw err;
            }
        }

        let saldo_kas, saldo_bank;

        if (tipe === 'saldo_awal') {
            // Saldo awal: nilai langsung dari input
            saldo_kas  = toNum(kas_penerimaan);
            saldo_bank = toNum(bank_debit);
        } else {
            // Transaksi biasa: lanjutkan dari saldo baris terakhir sebelum/pada tanggal ini
            const prev   = await KeuanganRepository.findLastUpToDate(new Date(tanggal));
            const prevKas  = prev ? toNum(prev.saldo_kas)  : 0;
            const prevBank = prev ? toNum(prev.saldo_bank) : 0;
            saldo_kas  = prevKas  + toNum(kas_penerimaan)  - toNum(kas_pengeluaran);
            saldo_bank = prevBank + toNum(bank_debit)      - toNum(bank_kredit);
        }

        return KeuanganRepository.create({
            tanggal,
            keterangan,
            tipe,
            kas_penerimaan:  toNum(kas_penerimaan),
            kas_pengeluaran: toNum(kas_pengeluaran),
            saldo_kas,
            bank_debit:  toNum(bank_debit),
            bank_kredit: toNum(bank_kredit),
            saldo_bank,
            created_by
        });
    }

    // ─── PUT /api/keuangan/:id ──────────────────────────────────────
    async update(id, data) {
        return KeuanganRepository.update(id, data);
    }

    // ─── DELETE /api/keuangan/:id ───────────────────────────────────
    async delete(id) {
        const row = await KeuanganRepository.findById(id);
        if (!row) {
            const err = new Error('Transaksi tidak ditemukan.');
            err.statusCode = 404;
            throw err;
        }

        await KeuanganRepository.delete(id);

        // Recalculate semua baris dari tanggal baris yang dihapus ke atas
        await this._recalculateFrom(row.tanggal);
    }

    /**
     * Recalculate running balance untuk semua baris mulai dari `fromDate` ke atas.
     * Ambil saldo terakhir sebelum `fromDate` sebagai titik awal.
     */
    async _recalculateFrom(fromDate) {
        const rows = await KeuanganRepository.findFromDate(fromDate);
        if (rows.length === 0) return;

        const prev   = await KeuanganRepository.findLastBeforeDate(fromDate);
        let saldoKas  = prev ? toNum(prev.saldo_kas)  : 0;
        let saldoBank = prev ? toNum(prev.saldo_bank) : 0;

        for (const row of rows) {
            if (row.tipe === 'saldo_awal') {
                // Saldo awal selalu reset, tidak bergantung pada baris sebelumnya
                saldoKas  = toNum(row.kas_penerimaan);
                saldoBank = toNum(row.bank_debit);
            } else {
                saldoKas  = saldoKas  + toNum(row.kas_penerimaan)  - toNum(row.kas_pengeluaran);
                saldoBank = saldoBank + toNum(row.bank_debit)       - toNum(row.bank_kredit);
            }
            await KeuanganRepository.updateSaldo(row.id, saldoKas, saldoBank);
        }
    }

    // ─── GET /api/keuangan/export ───────────────────────────────────
    async export(filters = {}) {
        const { startDate, endDate } = filters;

        const where = {};
        if (startDate || endDate) {
            where.tanggal = {};
            if (startDate) where.tanggal.gte = new Date(startDate);
            if (endDate)   where.tanggal.lte = new Date(endDate);
        }

        const rows = await KeuanganRepository.findMany({
            where,
            orderBy: [{ tanggal: 'asc' }, { created_at: 'asc' }]
        });

        // ── Buat workbook ─────────────────────────────────────────
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'GMMI';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Laporan Keuangan');

        // ── Definisi kolom ────────────────────────────────────────
        sheet.columns = [
            { header: 'TANGGAL',      key: 'tanggal',         width: 22 },
            { header: 'KETERANGAN',   key: 'keterangan',      width: 38 },
            { header: 'KAS (MASUK)',  key: 'kas_penerimaan',  width: 18 },
            { header: 'KAS (KELUAR)', key: 'kas_pengeluaran', width: 18 },
            { header: 'SALDO KAS',    key: 'saldo_kas',       width: 18 },
            { header: 'BANK (DEBIT)', key: 'bank_debit',      width: 18 },
            { header: 'BANK (KREDIT)',key: 'bank_kredit',     width: 18 },
            { header: 'SALDO BANK',   key: 'saldo_bank',      width: 18 }
        ];

        // ── Style baris header (row 1) ────────────────────────────
        const headerRow = sheet.getRow(1);
        headerRow.height = 22;
        headerRow.eachCell(cell => {
            cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1e3a5f' } };
            cell.font      = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border    = {
                top:    { style: 'thin' }, bottom: { style: 'thin' },
                left:   { style: 'thin' }, right:  { style: 'thin' }
            };
        });

        // ── Format angka (rupiah tanpa simbol Rp) ─────────────────
        const numFmt = '#,##0';

        // ── Akumulator untuk baris TOTAL ──────────────────────────
        let totKasMasuk = 0, totKasKeluar = 0;
        let totBankDebit = 0, totBankKredit = 0;
        let lastSaldoKas = 0, lastSaldoBank = 0;

        // ── Isi baris data ────────────────────────────────────────
        for (const row of rows) {
            const isSaldoAwal  = row.tipe === 'saldo_awal';
            const kasPenerimaan  = toNum(row.kas_penerimaan);
            const kasPengeluaran = toNum(row.kas_pengeluaran);
            const saldoKas       = toNum(row.saldo_kas);
            const bankDebit      = toNum(row.bank_debit);
            const bankKredit     = toNum(row.bank_kredit);
            const saldoBank      = toNum(row.saldo_bank);

            totKasMasuk  += kasPenerimaan;
            totKasKeluar += kasPengeluaran;
            totBankDebit  += bankDebit;
            totBankKredit += bankKredit;
            lastSaldoKas  = saldoKas;
            lastSaldoBank = saldoBank;

            const dataRow = sheet.addRow({
                tanggal:         formatTanggalId(row.tanggal),
                keterangan:      isSaldoAwal ? 'SALDO AWAL' : (row.keterangan ?? ''),
                kas_penerimaan:  kasPenerimaan,
                kas_pengeluaran: kasPengeluaran,
                saldo_kas:       saldoKas,
                bank_debit:      bankDebit,
                bank_kredit:     bankKredit,
                saldo_bank:      saldoBank
            });

            // Format angka
            ['kas_penerimaan', 'kas_pengeluaran', 'saldo_kas',
             'bank_debit', 'bank_kredit', 'saldo_bank'].forEach(key => {
                dataRow.getCell(key).numFmt = numFmt;
            });

            // Kolom saldo: bold
            dataRow.getCell('saldo_kas').font  = { bold: true };
            dataRow.getCell('saldo_bank').font = { bold: true };

            // Baris saldo_awal: background kuning, italic
            if (isSaldoAwal) {
                dataRow.eachCell(cell => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9C4' } };
                    cell.font = { ...(cell.font ?? {}), italic: true };
                });
                // Terapkan ulang bold saldo setelah override font
                dataRow.getCell('saldo_kas').font  = { bold: true, italic: true };
                dataRow.getCell('saldo_bank').font = { bold: true, italic: true };
            }
        }

        // ── Baris TOTAL ───────────────────────────────────────────
        const totalRow = sheet.addRow({
            tanggal:         'TOTAL',
            keterangan:      '',
            kas_penerimaan:  totKasMasuk,
            kas_pengeluaran: totKasKeluar,
            saldo_kas:       lastSaldoKas,
            bank_debit:      totBankDebit,
            bank_kredit:     totBankKredit,
            saldo_bank:      lastSaldoBank
        });

        totalRow.eachCell(cell => {
            cell.font   = { bold: true };
            cell.numFmt = numFmt;
            cell.border = {
                top:    { style: 'medium' },
                bottom: { style: 'thin' },
                left:   { style: 'thin' },
                right:  { style: 'thin' }
            };
        });
        totalRow.getCell('tanggal').numFmt = '@'; // pastikan "TOTAL" tidak diformat angka

        // ── Nama file ─────────────────────────────────────────────
        const labelStart = startDate ?? 'awal';
        const labelEnd   = endDate   ?? 'akhir';
        const filename   = `Laporan_Keuangan_GMMI_${labelStart}_${labelEnd}.xlsx`;

        return { workbook, filename };
    }
}

export default new KeuanganService();
