import pool from '../config/db.js';
import ExcelJS from 'exceljs';

class FinanceController {
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

            return res.json({
                data,
                summary: startDate ? {
                    opening_kas: parseFloat(saldoKas) - (parseFloat(data[data.length - 1]?.saldo_kas || 0) - parseFloat(data[0]?.saldo_kas || 0)), // Approx logic, simplified below
                    opening_bank: parseFloat(saldoBank) - (parseFloat(data[data.length - 1]?.saldo_bank || 0) - parseFloat(data[0]?.saldo_bank || 0))
                } : null
            });

        } catch (error) {
            console.error('Error fetching finance:', error);
            res.status(500).json({ message: 'Gagal mengambil data keuangan' });
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

            // Fetch data (similar to getAll logic but streamlined)
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

            // Create Workbook
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Laporan Keuangan');

            // Headers
            worksheet.columns = [
                { header: 'Tanggal', key: 'tanggal', width: 15 },
                { header: 'Keterangan', key: 'keterangan', width: 40 },
                { header: 'Kas (Masuk)', key: 'kas_in', width: 15, style: { numFmt: '#,##0' } },
                { header: 'Kas (Keluar)', key: 'kas_out', width: 15, style: { numFmt: '#,##0' } },
                { header: 'Saldo Kas', key: 'saldo_kas', width: 15, style: { numFmt: '#,##0', font: { bold: true } } },
                { header: 'Bank (Debit)', key: 'bank_in', width: 15, style: { numFmt: '#,##0' } },
                { header: 'Bank (Kredit)', key: 'bank_out', width: 15, style: { numFmt: '#,##0' } },
                { header: 'Saldo Bank', key: 'saldo_bank', width: 15, style: { numFmt: '#,##0', font: { bold: true } } },
            ];

            // Add Rows
            result.rows.forEach(row => {
                currentSaldoKas += (parseFloat(row.kas_penerimaan) - parseFloat(row.kas_pengeluaran));
                currentSaldoBank += (parseFloat(row.bank_debit) - parseFloat(row.bank_kredit));

                worksheet.addRow({
                    tanggal: new Date(row.tanggal),
                    keterangan: row.keterangan,
                    kas_in: parseFloat(row.kas_penerimaan) || null,
                    kas_out: parseFloat(row.kas_pengeluaran) || null,
                    saldo_kas: currentSaldoKas,
                    bank_in: parseFloat(row.bank_debit) || null,
                    bank_out: parseFloat(row.bank_kredit) || null,
                    saldo_bank: currentSaldoBank
                });
            });

            // Styling Header
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };

            // Response
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

export default new FinanceController();
