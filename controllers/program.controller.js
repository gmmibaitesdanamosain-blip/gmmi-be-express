import pool from '../config/db.js';
import ExcelJS from 'exceljs';
import { logActivity } from '../utils/activityLogger.js';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, TextRun, AlignmentType, HeadingLevel, ImageRun } from 'docx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProgramController {
    // Get statistics for dashboard
    async getStats(req, res) {
        try {
            const totalQuery = 'SELECT COUNT(*) as total FROM program_kegiatan_gereja';
            const byBidangQuery = `
                SELECT bidang, COUNT(*) as count 
                FROM program_kegiatan_gereja 
                GROUP BY bidang 
                ORDER BY count DESC
            `;

            const [totalResult, byBidangResult] = await Promise.all([
                pool.query(totalQuery),
                pool.query(byBidangQuery)
            ]);

            return res.status(200).json({
                success: true,
                data: {
                    total: parseInt(totalResult.rows[0].total),
                    byBidang: byBidangResult.rows
                }
            });
        } catch (error) {
            console.error('Error in ProgramController.getStats:', error);
            return res.status(500).json({ success: false, message: 'Gagal mengambil statistik program' });
        }
    }

    // Get all programs with optional filtering
    async getAll(req, res) {
        try {
            const { bidang, startDate, endDate } = req.query;
            let query = 'SELECT * FROM program_kegiatan_gereja WHERE 1=1';
            const params = [];
            let paramIndex = 1;

            if (bidang) {
                query += ` AND bidang = $${paramIndex}`;
                params.push(bidang);
                paramIndex++;
            }

            if (startDate && endDate) {
                query += ` AND created_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
                params.push(startDate, endDate);
                paramIndex += 2;
            }

            query += ' ORDER BY created_at DESC';

            const result = await pool.query(query, params);
            return res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error in ProgramController.getAll:', error);
            return res.status(500).json({ success: false, message: 'Gagal mengambil data program' });
        }
    }

    // Create new program
    async create(req, res) {
        try {
            const { bidang, sub_bidang, nama_program, jenis_kegiatan, volume, waktu_pelaksanaan, rencana_biaya, keterangan } = req.body;

            // Validation
            if (!bidang || !nama_program || !jenis_kegiatan || !waktu_pelaksanaan) {
                return res.status(400).json({
                    success: false,
                    message: 'Bidang, Nama Program, Jenis Kegiatan, dan Waktu Pelaksanaan wajib diisi'
                });
            }

            // Validate sub_bidang for Penatalayanan
            if (bidang === 'Penatalayanan' && !sub_bidang) {
                return res.status(400).json({
                    success: false,
                    message: 'Sub Bidang wajib diisi untuk Bidang Penatalayanan'
                });
            }

            const query = `
                INSERT INTO program_kegiatan_gereja 
                (bidang, sub_bidang, nama_program, jenis_kegiatan, volume, waktu_pelaksanaan, rencana_biaya, keterangan) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                RETURNING *
            `;

            const values = [
                bidang,
                sub_bidang || null,
                nama_program,
                jenis_kegiatan,
                volume || 1,
                waktu_pelaksanaan,
                rencana_biaya || 0,
                keterangan || null
            ];

            const result = await pool.query(query, values);

            await logActivity(req.user?.id, req.user?.nama, 'TAMBAH', 'PROGRAM', `Menambahkan program baru: ${nama_program}`);

            return res.status(201).json({
                success: true,
                message: 'Program berhasil ditambahkan',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error in ProgramController.create:', error);
            return res.status(500).json({ success: false, message: 'Gagal menambahkan program' });
        }
    }

    // Export to Excel
    async exportExcel(req, res) {
        try {
            const { bidang } = req.query;
            let query = 'SELECT * FROM program_kegiatan_gereja';
            const params = [];

            if (bidang) {
                query += ' WHERE bidang = $1';
                params.push(bidang);
            }
            query += ' ORDER BY bidang ASC, created_at DESC';

            const result = await pool.query(query, params);
            const programs = result.rows;

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Program Kerja');

            // Add Header Section
            // 1. Logo
            const logoPath = path.join(__dirname, '../assets/logo-gmmi.png');
            if (fs.existsSync(logoPath)) {
                const logoId = workbook.addImage({
                    filename: logoPath,
                    extension: 'png',
                });
                worksheet.addImage(logoId, 'A1:A3');
            }

            // 2. Title
            const currentYear = new Date().getFullYear();
            const title = `PROGRAM dan KEGIATAN GEREJA MASEHI MUSAFIR INDONESIA JEMAAT Baitesda, TAHUN ${currentYear}`;

            worksheet.mergeCells('B2:I2');
            const titleCell = worksheet.getCell('B2');
            titleCell.value = title;
            titleCell.font = { bold: true, size: 14, color: { argb: 'FF000000' } };
            titleCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

            // Spacer row
            worksheet.addRow([]);

            // 3. Table Headers (Now at row 5)
            const headerRow = worksheet.addRow(['No', 'Bidang', 'Sub Bidang', 'Nama Program', 'Jenis Kegiatan', 'Volume', 'Waktu', 'Biaya (Rp)', 'Keterangan']);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF1E3A8A' } // GMMI Navy
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            worksheet.columns = [
                { key: 'no', width: 5 },
                { key: 'bidang', width: 20 },
                { key: 'sub_bidang', width: 20 },
                { key: 'nama_program', width: 30 },
                { key: 'jenis_kegiatan', width: 40 },
                { key: 'volume', width: 10 },
                { key: 'waktu_pelaksanaan', width: 20 },
                { key: 'rencana_biaya', width: 20 },
                { key: 'keterangan', width: 30 }
            ];

            programs.forEach((prog, index) => {
                const row = worksheet.addRow({
                    no: index + 1,
                    bidang: prog.bidang,
                    sub_bidang: prog.sub_bidang || '-',
                    nama_program: prog.nama_program,
                    jenis_kegiatan: prog.jenis_kegiatan,
                    volume: prog.volume,
                    waktu_pelaksanaan: prog.waktu_pelaksanaan,
                    rencana_biaya: parseFloat(prog.rencana_biaya || 0),
                    keterangan: prog.keterangan || '-'
                });

                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                    if (cell.col === 8) { // Biaya column
                        cell.numFmt = '#,##0';
                    }
                });
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=Program_Kerja_GMMI_${currentYear}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error('Error in ProgramController.exportExcel:', error);
            res.status(500).json({ success: false, message: 'Gagal export Excel' });
        }
    }

    // Export to Word
    async exportWord(req, res) {
        try {
            const { bidang } = req.query;
            let query = 'SELECT * FROM program_kegiatan_gereja';
            const params = [];

            if (bidang) {
                query += ' WHERE bidang = $1';
                params.push(bidang);
            }
            query += ' ORDER BY bidang ASC, created_at DESC';

            const result = await pool.query(query, params);
            const programs = result.rows;

            const currentYear = new Date().getFullYear();
            const titleTitle = `PROGRAM dan KEGIATAN GEREJA MASEHI MUSAFIR INDONESIA JEMAAT Baitesda, TAHUN ${currentYear}`;

            // Define table rows
            const tableRows = [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ text: "No", style: "strong" })] }),
                        new TableCell({ children: [new Paragraph({ text: "Bidang", style: "strong" })] }),
                        new TableCell({ children: [new Paragraph({ text: "Sub Bidang", style: "strong" })] }),
                        new TableCell({ children: [new Paragraph({ text: "Nama Program", style: "strong" })] }),
                        new TableCell({ children: [new Paragraph({ text: "Kegiatan", style: "strong" })] }),
                        new TableCell({ children: [new Paragraph({ text: "Vol", style: "strong" })] }),
                        new TableCell({ children: [new Paragraph({ text: "Waktu", style: "strong" })] }),
                        new TableCell({ children: [new Paragraph({ text: "Biaya", style: "strong" })] }),
                        new TableCell({ children: [new Paragraph({ text: "Keterangan", style: "strong" })] }),
                    ],
                }),
            ];

            programs.forEach((prog, index) => {
                tableRows.push(
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph(String(index + 1))] }),
                            new TableCell({ children: [new Paragraph(prog.bidang || "-")] }),
                            new TableCell({ children: [new Paragraph(prog.sub_bidang || "-")] }),
                            new TableCell({ children: [new Paragraph(prog.nama_program || "-")] }),
                            new TableCell({ children: [new Paragraph(prog.jenis_kegiatan || "-")] }),
                            new TableCell({ children: [new Paragraph(String(prog.volume || 1))] }),
                            new TableCell({ children: [new Paragraph(prog.waktu_pelaksanaan || "-")] }),
                            new TableCell({ children: [new Paragraph(`Rp ${parseFloat(prog.rencana_biaya || 0).toLocaleString('id-ID', { minimumFractionDigits: 0 })}`)] }),
                            new TableCell({ children: [new Paragraph(prog.keterangan || "-")] }),
                        ],
                    })
                );
            });

            const logoPath = path.join(__dirname, '../assets/logo-gmmi.png');
            let children = [];

            // Header Section (using a table for logo on left, text on right)
            const headerCells = [];

            if (fs.existsSync(logoPath)) {
                headerCells.push(
                    new TableCell({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new ImageRun({
                                        data: fs.readFileSync(logoPath),
                                        transformation: {
                                            width: 80,
                                            height: 80,
                                        },
                                    }),
                                ],
                            }),
                        ],
                        borders: { top: { style: 'none' }, bottom: { style: 'none' }, left: { style: 'none' }, right: { style: 'none' } },
                        width: { size: 15, type: WidthType.PERCENTAGE },
                        verticalAlign: AlignmentType.CENTER,
                    })
                );
            }

            headerCells.push(
                new TableCell({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: titleTitle,
                                    bold: true,
                                    size: 28, // Heading size equivalent
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                        }),
                    ],
                    borders: { top: { style: 'none' }, bottom: { style: 'none' }, left: { style: 'none' }, right: { style: 'none' } },
                    width: { size: 85, type: WidthType.PERCENTAGE },
                    verticalAlign: AlignmentType.CENTER,
                })
            );

            children.push(
                new Table({
                    rows: [
                        new TableRow({
                            children: headerCells,
                        }),
                    ],
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: { top: { style: 'none' }, bottom: { style: 'none' }, left: { style: 'none' }, right: { style: 'none' }, insideHorizontal: { style: 'none' }, insideVertical: { style: 'none' } },
                })
            );

            children.push(new Paragraph({ text: "" })); // Spacer

            children.push(
                new Table({
                    rows: tableRows,
                    width: { size: 100, type: WidthType.PERCENTAGE },
                })
            );

            const doc = new Document({
                sections: [{
                    properties: {},
                    children: children,
                }],
            });

            const buffer = await Packer.toBuffer(doc);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename=Program_Kerja_GMMI_${currentYear}.docx`);
            res.send(buffer);
        } catch (error) {
            console.error('Error in ProgramController.exportWord:', error);
            res.status(500).json({ success: false, message: 'Gagal export Word' });
        }
    }
    // Delete program
    async delete(req, res) {
        try {
            const { id } = req.params;
            const query = 'DELETE FROM program_kegiatan_gereja WHERE id = $1 RETURNING *';
            const result = await pool.query(query, [id]);

            if (result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Program tidak ditemukan'
                });
            }

            await logActivity(req.user?.id, req.user?.nama, 'HAPUS', 'PROGRAM', `Menghapus program ID: ${id}`);

            return res.status(200).json({
                success: true,
                message: 'Program berhasil dihapus',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error in ProgramController.delete:', error);
            return res.status(500).json({ success: false, message: 'Gagal menghapus program' });
        }
    }
}

export default new ProgramController();
