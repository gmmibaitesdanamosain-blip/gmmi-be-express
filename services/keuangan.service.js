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

/** Normalise query-param date: undefined / null / "" / "null" / "undefined" → null */
function parseDate(val) {
    if (!val || val === 'null' || val === 'undefined') return null;
    return new Date(val);
}

// ── Excel style constants ────────────────────────────────────────────────────
const ARGB_NAVY      = 'FF1e3a5f';
const ARGB_WHITE     = 'FFFFFFFF';
const ARGB_DARK_GRAY = 'FF424242';
const ARGB_YELLOW    = 'FFFFF9C4';
const NUM_FMT        = '#,##0';

const MONEY_COLS_DETAIL   = ['kas_penerimaan', 'kas_pengeluaran', 'saldo_kas', 'bank_debit', 'bank_kredit', 'saldo_bank'];
const MONEY_COLS_SUMMARY  = ['kas_penerimaan', 'kas_pengeluaran', 'bank_debit', 'bank_kredit', 'saldo_kas', 'saldo_bank'];

function applyHeaderStyle(row) {
    row.height = 22;
    row.eachCell(cell => {
        cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: ARGB_NAVY } };
        cell.font      = { color: { argb: ARGB_WHITE }, bold: true, size: 11 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border    = {
            top: { style: 'thin' }, bottom: { style: 'thin' },
            left: { style: 'thin' }, right:  { style: 'thin' }
        };
    });
}

function applyTotalStyle(row, moneyCols) {
    row.eachCell(cell => {
        cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: ARGB_DARK_GRAY } };
        cell.font   = { bold: true, color: { argb: ARGB_WHITE } };
        cell.border = {
            top: { style: 'medium' }, bottom: { style: 'thin' },
            left: { style: 'thin' },  right:  { style: 'thin' }
        };
    });
    moneyCols.forEach(col => { row.getCell(col).numFmt = NUM_FMT; });
}

// ── Sheet 1: Detail Transaksi ────────────────────────────────────────────────
function buildDetailSheet(workbook, rows) {
    const sheet = workbook.addWorksheet('Detail Transaksi');

    sheet.columns = [
        { header: 'NO',           key: 'no',              width: 6  },
        { header: 'TANGGAL',      key: 'tanggal',         width: 22 },
        { header: 'KETERANGAN',   key: 'keterangan',      width: 38 },
        { header: 'KAS MASUK',    key: 'kas_penerimaan',  width: 18 },
        { header: 'KAS KELUAR',   key: 'kas_pengeluaran', width: 18 },
        { header: 'SALDO KAS',    key: 'saldo_kas',       width: 18 },
        { header: 'BANK DEBIT',   key: 'bank_debit',      width: 18 },
        { header: 'BANK KREDIT',  key: 'bank_kredit',     width: 18 },
        { header: 'SALDO BANK',   key: 'saldo_bank',      width: 18 }
    ];

    applyHeaderStyle(sheet.getRow(1));

    let totKasMasuk = 0, totKasKeluar = 0;
    let totBankDebit = 0, totBankKredit = 0;
    let lastSaldoKas = 0, lastSaldoBank = 0;

    rows.forEach((row, idx) => {
        const isSaldoAwal    = row.tipe === 'saldo_awal';
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
            no:              idx + 1,
            tanggal:         formatTanggalId(row.tanggal),
            keterangan:      isSaldoAwal ? 'SALDO AWAL' : (row.keterangan ?? ''),
            kas_penerimaan:  kasPenerimaan,
            kas_pengeluaran: kasPengeluaran,
            saldo_kas:       saldoKas,
            bank_debit:      bankDebit,
            bank_kredit:     bankKredit,
            saldo_bank:      saldoBank
        });

        MONEY_COLS_DETAIL.forEach(col => { dataRow.getCell(col).numFmt = NUM_FMT; });
        dataRow.getCell('saldo_kas').font  = { bold: true };
        dataRow.getCell('saldo_bank').font = { bold: true };

        if (isSaldoAwal) {
            dataRow.eachCell(cell => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ARGB_YELLOW } };
                cell.font = { ...(cell.font ?? {}), italic: true };
            });
            // Terapkan ulang bold saldo setelah override font
            dataRow.getCell('saldo_kas').font  = { bold: true, italic: true };
            dataRow.getCell('saldo_bank').font = { bold: true, italic: true };
        }
    });

    const totalRow = sheet.addRow({
        no:              '',
        tanggal:         'TOTAL',
        keterangan:      '',
        kas_penerimaan:  totKasMasuk,
        kas_pengeluaran: totKasKeluar,
        saldo_kas:       lastSaldoKas,
        bank_debit:      totBankDebit,
        bank_kredit:     totBankKredit,
        saldo_bank:      lastSaldoBank
    });
    applyTotalStyle(totalRow, MONEY_COLS_DETAIL);
    totalRow.getCell('tanggal').numFmt = '@';
}

// ── Sheet 2: Ringkasan Per Minggu ────────────────────────────────────────────

/** Kembalikan tanggal Senin dari minggu yang sama sebagai string YYYY-MM-DD (UTC). */
function getMondayKey(tanggal) {
    const d   = new Date(tanggal);
    const day = d.getUTCDay();                      // 0=Min, 1=Sen, ..., 6=Sab
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() + diffToMonday);
    return monday.toISOString().slice(0, 10);
}

function formatPeriodeMinggu(mondayStr) {
    const monday = new Date(mondayStr + 'T00:00:00Z');
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);

    const d1 = monday.getUTCDate();
    const m1 = BULAN_ID[monday.getUTCMonth()];
    const y1 = monday.getUTCFullYear();
    const d2 = sunday.getUTCDate();
    const m2 = BULAN_ID[sunday.getUTCMonth()];
    const y2 = sunday.getUTCFullYear();

    if (y1 === y2 && monday.getUTCMonth() === sunday.getUTCMonth()) {
        return `${d1}–${d2} ${m1} ${y1}`;
    }
    if (y1 === y2) {
        return `${d1} ${m1} – ${d2} ${m2} ${y1}`;
    }
    return `${d1} ${m1} ${y1} – ${d2} ${m2} ${y2}`;
}

function buildWeeklySheet(workbook, rows) {
    const sheet = workbook.addWorksheet('Ringkasan Per Minggu');

    sheet.columns = [
        { header: 'PERIODE MINGGU',   key: 'periode',         width: 28 },
        { header: 'KAS MASUK',        key: 'kas_penerimaan',  width: 18 },
        { header: 'KAS KELUAR',       key: 'kas_pengeluaran', width: 18 },
        { header: 'BANK DEBIT',       key: 'bank_debit',      width: 18 },
        { header: 'BANK KREDIT',      key: 'bank_kredit',     width: 18 },
        { header: 'SALDO KAS AKHIR',  key: 'saldo_kas',       width: 18 },
        { header: 'SALDO BANK AKHIR', key: 'saldo_bank',      width: 18 }
    ];

    applyHeaderStyle(sheet.getRow(1));

    // Grup berurutan — Map mempertahankan insertion order
    const weekMap = new Map();
    for (const row of rows) {
        const wk = getMondayKey(row.tanggal);
        if (!weekMap.has(wk)) {
            weekMap.set(wk, { kasMasuk: 0, kasKeluar: 0, bankDebit: 0, bankKredit: 0, saldoKas: 0, saldoBank: 0 });
        }
        const g = weekMap.get(wk);
        g.kasMasuk  += toNum(row.kas_penerimaan);
        g.kasKeluar += toNum(row.kas_pengeluaran);
        g.bankDebit  += toNum(row.bank_debit);
        g.bankKredit += toNum(row.bank_kredit);
        // Baris terakhir dalam minggu → saldo akhir minggu itu
        g.saldoKas  = toNum(row.saldo_kas);
        g.saldoBank = toNum(row.saldo_bank);
    }

    let totKasMasuk = 0, totKasKeluar = 0;
    let totBankDebit = 0, totBankKredit = 0;
    let lastSaldoKas = 0, lastSaldoBank = 0;

    for (const [wk, g] of weekMap) {
        totKasMasuk  += g.kasMasuk;
        totKasKeluar += g.kasKeluar;
        totBankDebit  += g.bankDebit;
        totBankKredit += g.bankKredit;
        lastSaldoKas  = g.saldoKas;
        lastSaldoBank = g.saldoBank;

        const dataRow = sheet.addRow({
            periode:         formatPeriodeMinggu(wk),
            kas_penerimaan:  g.kasMasuk,
            kas_pengeluaran: g.kasKeluar,
            bank_debit:      g.bankDebit,
            bank_kredit:     g.bankKredit,
            saldo_kas:       g.saldoKas,
            saldo_bank:      g.saldoBank
        });
        MONEY_COLS_SUMMARY.forEach(col => { dataRow.getCell(col).numFmt = NUM_FMT; });
        dataRow.getCell('saldo_kas').font  = { bold: true };
        dataRow.getCell('saldo_bank').font = { bold: true };
    }

    const totalRow = sheet.addRow({
        periode:         'TOTAL',
        kas_penerimaan:  totKasMasuk,
        kas_pengeluaran: totKasKeluar,
        bank_debit:      totBankDebit,
        bank_kredit:     totBankKredit,
        saldo_kas:       lastSaldoKas,
        saldo_bank:      lastSaldoBank
    });
    applyTotalStyle(totalRow, MONEY_COLS_SUMMARY);
    totalRow.getCell('periode').numFmt = '@';
}

// ── Sheet 3: Ringkasan Per Bulan ─────────────────────────────────────────────
function buildMonthlySheet(workbook, rows) {
    const sheet = workbook.addWorksheet('Ringkasan Per Bulan');

    sheet.columns = [
        { header: 'BULAN',            key: 'bulan',           width: 20 },
        { header: 'KAS MASUK',        key: 'kas_penerimaan',  width: 18 },
        { header: 'KAS KELUAR',       key: 'kas_pengeluaran', width: 18 },
        { header: 'BANK DEBIT',       key: 'bank_debit',      width: 18 },
        { header: 'BANK KREDIT',      key: 'bank_kredit',     width: 18 },
        { header: 'SALDO KAS AKHIR',  key: 'saldo_kas',       width: 18 },
        { header: 'SALDO BANK AKHIR', key: 'saldo_bank',      width: 18 }
    ];

    applyHeaderStyle(sheet.getRow(1));

    const monthMap = new Map();
    for (const row of rows) {
        const dt  = new Date(row.tanggal);
        const yr  = dt.getUTCFullYear();
        const mo  = dt.getUTCMonth();
        const mk  = `${yr}-${String(mo + 1).padStart(2, '0')}`;
        if (!monthMap.has(mk)) {
            monthMap.set(mk, {
                label: `${BULAN_ID[mo]} ${yr}`,
                kasMasuk: 0, kasKeluar: 0, bankDebit: 0, bankKredit: 0, saldoKas: 0, saldoBank: 0
            });
        }
        const g = monthMap.get(mk);
        g.kasMasuk  += toNum(row.kas_penerimaan);
        g.kasKeluar += toNum(row.kas_pengeluaran);
        g.bankDebit  += toNum(row.bank_debit);
        g.bankKredit += toNum(row.bank_kredit);
        g.saldoKas  = toNum(row.saldo_kas);
        g.saldoBank = toNum(row.saldo_bank);
    }

    let totKasMasuk = 0, totKasKeluar = 0;
    let totBankDebit = 0, totBankKredit = 0;
    let lastSaldoKas = 0, lastSaldoBank = 0;

    for (const [, g] of monthMap) {
        totKasMasuk  += g.kasMasuk;
        totKasKeluar += g.kasKeluar;
        totBankDebit  += g.bankDebit;
        totBankKredit += g.bankKredit;
        lastSaldoKas  = g.saldoKas;
        lastSaldoBank = g.saldoBank;

        const dataRow = sheet.addRow({
            bulan:           g.label,
            kas_penerimaan:  g.kasMasuk,
            kas_pengeluaran: g.kasKeluar,
            bank_debit:      g.bankDebit,
            bank_kredit:     g.bankKredit,
            saldo_kas:       g.saldoKas,
            saldo_bank:      g.saldoBank
        });
        MONEY_COLS_SUMMARY.forEach(col => { dataRow.getCell(col).numFmt = NUM_FMT; });
        dataRow.getCell('saldo_kas').font  = { bold: true };
        dataRow.getCell('saldo_bank').font = { bold: true };
    }

    const totalRow = sheet.addRow({
        bulan:           'TOTAL',
        kas_penerimaan:  totKasMasuk,
        kas_pengeluaran: totKasKeluar,
        bank_debit:      totBankDebit,
        bank_kredit:     totBankKredit,
        saldo_kas:       lastSaldoKas,
        saldo_bank:      lastSaldoBank
    });
    applyTotalStyle(totalRow, MONEY_COLS_SUMMARY);
    totalRow.getCell('bulan').numFmt = '@';
}

// ── Sheet 4: Ringkasan Per Tahun ─────────────────────────────────────────────
function buildYearlySheet(workbook, rows) {
    const sheet = workbook.addWorksheet('Ringkasan Per Tahun');

    sheet.columns = [
        { header: 'TAHUN',            key: 'tahun',           width: 12 },
        { header: 'KAS MASUK',        key: 'kas_penerimaan',  width: 18 },
        { header: 'KAS KELUAR',       key: 'kas_pengeluaran', width: 18 },
        { header: 'BANK DEBIT',       key: 'bank_debit',      width: 18 },
        { header: 'BANK KREDIT',      key: 'bank_kredit',     width: 18 },
        { header: 'SALDO KAS AKHIR',  key: 'saldo_kas',       width: 18 },
        { header: 'SALDO BANK AKHIR', key: 'saldo_bank',      width: 18 }
    ];

    applyHeaderStyle(sheet.getRow(1));

    const yearMap = new Map();
    for (const row of rows) {
        const yk = String(new Date(row.tanggal).getUTCFullYear());
        if (!yearMap.has(yk)) {
            yearMap.set(yk, { kasMasuk: 0, kasKeluar: 0, bankDebit: 0, bankKredit: 0, saldoKas: 0, saldoBank: 0 });
        }
        const g = yearMap.get(yk);
        g.kasMasuk  += toNum(row.kas_penerimaan);
        g.kasKeluar += toNum(row.kas_pengeluaran);
        g.bankDebit  += toNum(row.bank_debit);
        g.bankKredit += toNum(row.bank_kredit);
        g.saldoKas  = toNum(row.saldo_kas);
        g.saldoBank = toNum(row.saldo_bank);
    }

    let totKasMasuk = 0, totKasKeluar = 0;
    let totBankDebit = 0, totBankKredit = 0;
    let lastSaldoKas = 0, lastSaldoBank = 0;

    for (const [yk, g] of yearMap) {
        totKasMasuk  += g.kasMasuk;
        totKasKeluar += g.kasKeluar;
        totBankDebit  += g.bankDebit;
        totBankKredit += g.bankKredit;
        lastSaldoKas  = g.saldoKas;
        lastSaldoBank = g.saldoBank;

        const dataRow = sheet.addRow({
            tahun:           yk,
            kas_penerimaan:  g.kasMasuk,
            kas_pengeluaran: g.kasKeluar,
            bank_debit:      g.bankDebit,
            bank_kredit:     g.bankKredit,
            saldo_kas:       g.saldoKas,
            saldo_bank:      g.saldoBank
        });
        MONEY_COLS_SUMMARY.forEach(col => { dataRow.getCell(col).numFmt = NUM_FMT; });
        dataRow.getCell('saldo_kas').font  = { bold: true };
        dataRow.getCell('saldo_bank').font = { bold: true };
    }

    const totalRow = sheet.addRow({
        tahun:           'TOTAL',
        kas_penerimaan:  totKasMasuk,
        kas_pengeluaran: totKasKeluar,
        bank_debit:      totBankDebit,
        bank_kredit:     totBankKredit,
        saldo_kas:       lastSaldoKas,
        saldo_bank:      lastSaldoBank
    });
    applyTotalStyle(totalRow, MONEY_COLS_SUMMARY);
    totalRow.getCell('tahun').numFmt = '@';
}

// ────────────────────────────────────────────────────────────────────────────
class KeuanganService {

    // ─── GET /api/keuangan ──────────────────────────────────────────
    async getAll(filters = {}) {
        const start = parseDate(filters.startDate);
        const end   = parseDate(filters.endDate);

        const where = {};
        if (start || end) {
            where.tanggal = {};
            if (start) where.tanggal.gte = start;
            if (end)   where.tanggal.lte = end;
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
        const start = parseDate(filters.startDate);
        const end   = parseDate(filters.endDate);

        const where = {};
        if (start || end) {
            where.tanggal = {};
            if (start) where.tanggal.gte = start;
            if (end)   where.tanggal.lte = end;
        }

        const rows = await KeuanganRepository.findMany({
            where,
            orderBy: [{ tanggal: 'asc' }, { created_at: 'asc' }]
        });

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'GMMI';
        workbook.created = new Date();

        buildDetailSheet(workbook, rows);
        buildWeeklySheet(workbook, rows);
        buildMonthlySheet(workbook, rows);
        buildYearlySheet(workbook, rows);

        const hasFilter  = start || end;
        const labelStart = filters.startDate;
        const labelEnd   = filters.endDate;
        const filename   = hasFilter
            ? `Laporan_Keuangan_GMMI_${labelStart}_${labelEnd}.xlsx`
            : 'Laporan_Keuangan_GMMI_Semua.xlsx';

        return { workbook, filename };
    }
}

export default new KeuanganService();
