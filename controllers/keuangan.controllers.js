import pool from '../config/db.js';
import ExcelJS from 'exceljs';
import { logActivity } from '../utils/activityLogger.js';

class KeuanganController {
    // Get all transactions with running balance
    async getAll(req, res) {
        try {
            const { startDate, endDate } = req.query;

            let query = `SELECT * FROM laporan_keuangan WHERE 1=1 `;
            const params = [];

            if (startDate) {
                params.push(startDate);
                query += `AND tanggal >= $${params.length} `;
            }
            if (endDate) {
                params.push(endDate);
                query += `AND tanggal <= $${params.length} `;
            }

            query += `ORDER BY tanggal ASC, created_at ASC`;

            const result = await pool.query(query, params);

            // Calculate running balance
            let saldoKas = 0;
            let saldoBank = 0;

            // Fetch running balance BEFORE startDate if filtering
            if (startDate) {
                const prevBalance = await pool.query(`
                    SELECT 
                        SUM(kas_penerimaan - kas_pengeluaran) as kas_balance,
                        SUM(bank_debit - bank_kredit) as bank_balance
                    FROM laporan_keuangan 
                    WHERE tanggal < $1
                `, [startDate]);

                saldoKas = parseFloat(prevBalance.rows[0].kas_balance || 0);
                saldoBank = parseFloat(prevBalance.rows[0].bank_balance || 0);
            }

            const data = result.rows.map(row => {
                saldoKas += parseFloat(row.kas_penerimaan || 0) - parseFloat(row.kas_pengeluaran || 0);
                saldoBank += parseFloat(row.bank_debit || 0) - parseFloat(row.bank_kredit || 0);

                return {
                    ...row,
                    saldo_kas: saldoKas,
                    saldo_bank: saldoBank
                };
            });

            // Summary for the response
            const summary = {
                total_kas_penerimaan: data.reduce((sum, row) => sum + parseFloat(row.kas_penerimaan || 0), 0),
                total_kas_pengeluaran: data.reduce((sum, row) => sum + parseFloat(row.kas_pengeluaran || 0), 0),
                saldo_akhir_kas: saldoKas,
                total_bank_debit: data.reduce((sum, row) => sum + parseFloat(row.bank_debit || 0), 0),
                total_bank_kredit: data.reduce((sum, row) => sum + parseFloat(row.bank_kredit || 0), 0),
                saldo_akhir_bank: saldoBank
            };

            return res.json({
                success: true,
                data,
                summary
            });

        } catch (error) {
            console.error('Error fetching finance:', error);
            res.status(500).json({ message: 'Gagal mengambil data keuangan' });
        }
    }

    // Get Summary (Legacy support or quick View)
    async getSummary(req, res) {
        try {
            const result = await pool.query(`
                SELECT 
                    SUM(kas_penerimaan) as total_kas_in,
                    SUM(kas_pengeluaran) as total_kas_out,
                    SUM(bank_debit) as total_bank_in,
                    SUM(bank_kredit) as total_bank_out
                FROM laporan_keuangan
            `);

            const kasIn = parseFloat(result.rows[0].total_kas_in || 0);
            const kasOut = parseFloat(result.rows[0].total_kas_out || 0);
            const bankIn = parseFloat(result.rows[0].total_bank_in || 0);
            const bankOut = parseFloat(result.rows[0].total_bank_out || 0);

            return res.json({
                success: true,
                data: {
                    totalIncome: kasIn + bankIn,
                    totalExpense: kasOut + bankOut,
                    balance: (kasIn + bankIn) - (kasOut + bankOut),
                    details: {
                        saldo_kas: kasIn - kasOut,
                        saldo_bank: bankIn - bankOut
                    }
                }
            });
        } catch (error) {
            console.error('Error getting summary:', error);
            res.status(500).json({ message: 'Gagal mengambil ringkasan' });
        }
    }

    // Create new transaction
    async create(req, res) {
        try {
            const { tanggal, keterangan, kas_penerimaan, kas_pengeluaran, bank_debit, bank_kredit } = req.body;

            const newTx = await pool.query(
                `INSERT INTO laporan_keuangan (tanggal, keterangan, kas_penerimaan, kas_pengeluaran, bank_debit, bank_kredit) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [tanggal, keterangan, kas_penerimaan || 0, kas_pengeluaran || 0, bank_debit || 0, bank_kredit || 0]
            );

            await logActivity(req.user?.id, req.user?.nama, 'TAMBAH', 'KEUANGAN', `Menambah transaksi: ${keterangan}`);

            res.status(201).json(newTx.rows[0]);
        } catch (error) {
            console.error('Error creating transaction:', error);
            res.status(500).json({ message: 'Gagal menyimpan transaksi' });
        }
    }

    // Update transaction
    async update(req, res) {
        try {
            const { id } = req.params;
            const { tanggal, keterangan, kas_penerimaan, kas_pengeluaran, bank_debit, bank_kredit } = req.body;

            const updatedTx = await pool.query(
                `UPDATE laporan_keuangan 
                 SET tanggal = $1, keterangan = $2, kas_penerimaan = $3, kas_pengeluaran = $4, bank_debit = $5, bank_kredit = $6, updated_at = NOW()
                 WHERE id = $7 RETURNING *`,
                [tanggal, keterangan, kas_penerimaan || 0, kas_pengeluaran || 0, bank_debit || 0, bank_kredit || 0, id]
            );

            if (updatedTx.rowCount === 0) {
                return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
            }

            await logActivity(req.user?.id, req.user?.nama, 'UBAH', 'KEUANGAN', `Memperbarui transaksi ID: ${id}`);

            res.json(updatedTx.rows[0]);
        } catch (error) {
            console.error('Error updating transaction:', error);
            res.status(500).json({ message: 'Gagal memperbarui transaksi' });
        }
    }

    // Delete transaction
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedTx = await pool.query('DELETE FROM laporan_keuangan WHERE id = $1 RETURNING *', [id]);

            if (deletedTx.rowCount === 0) {
                return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
            }

            await logActivity(req.user?.id, req.user?.nama, 'HAPUS', 'KEUANGAN', `Menghapus transaksi ID: ${id}`);

            res.json({ message: 'Transaksi berhasil dihapus' });
        } catch (error) {
            console.error('Error deleting transaction:', error);
            res.status(500).json({ message: 'Gagal menghapus transaksi' });
        }
    }

    // Export to Excel
    async exportExcel(req, res) {
        try {
            const { startDate, endDate } = req.query; // Optional filter

            let query = `SELECT * FROM laporan_keuangan WHERE 1=1 `;
            const params = [];
            if (startDate) { params.push(startDate); query += `AND tanggal >= $${params.length} `; }
            if (endDate) { params.push(endDate); query += `AND tanggal <= $${params.length} `; }
            query += `ORDER BY tanggal ASC, created_at ASC`;

            const result = await pool.query(query, params);

            // Calculate running balance
            let currentSaldoKas = 0;
            let currentSaldoBank = 0;

            if (startDate) {
                const prev = await pool.query(`
                    SELECT SUM(kas_penerimaan - kas_pengeluaran) as k, SUM(bank_debit - bank_kredit) as b 
                    FROM laporan_keuangan WHERE tanggal < $1`, [startDate]);
                currentSaldoKas = parseFloat(prev.rows[0].k || 0);
                currentSaldoBank = parseFloat(prev.rows[0].b || 0);
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Laporan Keuangan');

            // 1. Add Title
            worksheet.mergeCells('A1:H1');
            const titleCell = worksheet.getCell('A1');
            titleCell.value = 'LAPORAN KEUANGAN GMMI PUSAT';
            titleCell.font = { name: 'Arial Black', size: 16, bold: true };
            titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
            worksheet.getRow(1).height = 30;

            if (startDate || endDate) {
                worksheet.mergeCells('A2:H2');
                const periodCell = worksheet.getCell('A2');
                periodCell.value = `Periode: ${startDate || '-'} s/d ${endDate || '-'}`;
                periodCell.alignment = { horizontal: 'center' };
            }

            // 2. Define Headers
            const headerRow = 4;
            const columns = [
                { header: 'Tanggal', key: 'tanggal', width: 15 },
                { header: 'Keterangan', key: 'keterangan', width: 45 },
                { header: 'Kas (Masuk)', key: 'kas_in', width: 18, style: { numFmt: '#,##0' } },
                { header: 'Kas (Keluar)', key: 'kas_out', width: 18, style: { numFmt: '#,##0' } },
                { header: 'Saldo Kas', key: 'saldo_kas', width: 18, style: { numFmt: '#,##0', font: { bold: true } } },
                { header: 'Bank (Debit)', key: 'bank_in', width: 18, style: { numFmt: '#,##0' } },
                { header: 'Bank (Kredit)', key: 'bank_out', width: 18, style: { numFmt: '#,##0' } },
                { header: 'Saldo Bank', key: 'saldo_bank', width: 18, style: { numFmt: '#,##0', font: { bold: true } } },
            ];

            worksheet.getRow(headerRow).values = columns.map(c => c.header);
            worksheet.columns = columns;

            // 3. Add Rows
            let totalKasIn = 0;
            let totalKasOut = 0;
            let totalBankIn = 0;
            let totalBankOut = 0;

            result.rows.forEach(row => {
                const kin = parseFloat(row.kas_penerimaan) || 0;
                const kout = parseFloat(row.kas_pengeluaran) || 0;
                const bin = parseFloat(row.bank_debit) || 0;
                const bout = parseFloat(row.bank_kredit) || 0;

                totalKasIn += kin;
                totalKasOut += kout;
                totalBankIn += bin;
                totalBankOut += bout;

                currentSaldoKas += (kin - kout);
                currentSaldoBank += (bin - bout);

                worksheet.addRow({
                    tanggal: new Date(row.tanggal),
                    keterangan: row.keterangan,
                    kas_in: kin || null,
                    kas_out: kout || null,
                    saldo_kas: currentSaldoKas,
                    bank_in: bin || null,
                    bank_out: bout || null,
                    saldo_bank: currentSaldoBank
                });
            });

            // 4. Add Totals Row
            const totalRow = worksheet.addRow({
                tanggal: '',
                keterangan: 'TOTAL',
                kas_in: totalKasIn,
                kas_out: totalKasOut,
                saldo_kas: currentSaldoKas,
                bank_in: totalBankIn,
                bank_out: totalBankOut,
                saldo_bank: currentSaldoBank
            });
            totalRow.font = { bold: true };
            totalRow.eachCell((cell, colNumber) => {
                if (colNumber > 2) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }; // Yellow for totals
            });

            // 5. Final Styling
            worksheet.getRow(headerRow).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            worksheet.getRow(headerRow).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } }; // Navy blue header

            // Add borders to all data cells
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber >= headerRow) {
                    row.eachCell({ includeEmpty: true }, (cell) => {
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        };
                    });
                }
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=Laporan_Keuangan_GMMI.xlsx');

            await workbook.xlsx.write(res);
            res.end();

        } catch (error) {
            console.error('Error export excel:', error);
            res.status(500).send('Gagal export excel');
        }
    }
}

export default new KeuanganController();