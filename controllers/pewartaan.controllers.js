import pool from '../config/db.js';
import ExcelJS from 'exceljs';
import notificationService from '../services/notification.service.js';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, ImageRun } from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PewartaanController {
    async create(req, res) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const {
                judul, tanggal_ibadah, hari, tempat_jemaat, ayat_firman, tema_khotbah, status,
                tata_ibadah, pokok_doa, jemaat_ultah, jemaat_sakit, pemulihan, lansia,
                info_ibadah, pelayanan_sektor, pelayanan_kategorial
            } = req.body;

            const rootQuery = `
                INSERT INTO pewartaan (judul, tanggal_ibadah, hari, tempat_jemaat, ayat_firman, tema_khotbah, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            `;
            const rootRes = await client.query(rootQuery, [
                judul, tanggal_ibadah, hari, tempat_jemaat, ayat_firman, tema_khotbah, status || 'draft'
            ]);
            const pewartaanId = rootRes.rows[0].id;

            // Helper to insert related data
            const insertRelated = async (table, columns, data) => {
                if (!data || !data.length) return;
                for (const item of data) {
                    const cols = ['pewartaan_id', ...columns];
                    const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
                    const values = [pewartaanId, ...columns.map(col => item[col])];
                    await client.query(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`, values);
                }
            };

            await insertRelated('pewartaan_tata_ibadah', ['urutan', 'nama_bagian', 'keterangan', 'judul_pujian', 'isi_konten'], tata_ibadah);
            await insertRelated('pewartaan_pokok_doa', ['kategori', 'keterangan'], pokok_doa);
            await insertRelated('pewartaan_jemaat_ultah', ['tanggal', 'nama_jemaat', 'keterangan'], jemaat_ultah);
            await insertRelated('pewartaan_jemaat_sakit', ['nama_jemaat', 'keterangan'], jemaat_sakit);
            await insertRelated('pewartaan_pemulihan', ['nama_jemaat', 'keterangan'], pemulihan);
            await insertRelated('pewartaan_lansia', ['nama_jemaat', 'keterangan'], lansia);
            await insertRelated('pewartaan_info_ibadah', ['tanggal', 'jam', 'jenis_ibadah', 'pemimpin', 'sektor'], info_ibadah);
            await insertRelated('pewartaan_pelayanan_sektor', ['nomor_sektor', 'tempat', 'pemimpin', 'liturgos', 'nomor_hp'], pelayanan_sektor);
            await insertRelated('pewartaan_pelayanan_kategorial', ['tanggal_waktu', 'kategori_pelayanan', 'tempat', 'pemimpin', 'liturgos_petugas'], pelayanan_kategorial);

            await client.query('COMMIT');

            if (status === 'approved') {
                await this.triggerNotifications(pewartaanId);
            }

            res.status(201).json({ success: true, message: 'Pewartaan berhasil dibuat', id: pewartaanId });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error in PewartaanController.create:', error);
            res.status(500).json({ success: false, message: 'Gagal membuat pewartaan', error: error.message });
        } finally {
            client.release();
        }
    }

    async update(req, res) {
        const client = await pool.connect();
        try {
            const { id } = req.params;
            await client.query('BEGIN');
            const {
                judul, tanggal_ibadah, hari, tempat_jemaat, ayat_firman, tema_khotbah, status,
                tata_ibadah, pokok_doa, jemaat_ultah, jemaat_sakit, pemulihan, lansia,
                info_ibadah, pelayanan_sektor, pelayanan_kategorial
            } = req.body;

            await client.query(`
                UPDATE pewartaan
                SET judul = $1, tanggal_ibadah = $2, hari = $3, tempat_jemaat = $4, ayat_firman = $5, tema_khotbah = $6, status = $7, updated_at = CURRENT_TIMESTAMP
                WHERE id = $8
            `, [judul, tanggal_ibadah, hari, tempat_jemaat, ayat_firman, tema_khotbah, status, id]);

            // Clear existing related data
            const tables = [
                'pewartaan_tata_ibadah', 'pewartaan_pokok_doa', 'pewartaan_jemaat_ultah',
                'pewartaan_jemaat_sakit', 'pewartaan_pemulihan', 'pewartaan_lansia',
                'pewartaan_info_ibadah', 'pewartaan_pelayanan_sektor', 'pewartaan_pelayanan_kategorial'
            ];
            for (const table of tables) {
                await client.query(`DELETE FROM ${table} WHERE pewartaan_id = $1`, [id]);
            }

            // Helper to insert related data
            const insertRelated = async (table, columns, data) => {
                if (!data || !data.length) return;
                for (const item of data) {
                    const cols = ['pewartaan_id', ...columns];
                    const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
                    const values = [id, ...columns.map(col => item[col])];
                    await client.query(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`, values);
                }
            };

            await insertRelated('pewartaan_tata_ibadah', ['urutan', 'nama_bagian', 'keterangan', 'judul_pujian', 'isi_konten'], tata_ibadah);
            await insertRelated('pewartaan_pokok_doa', ['kategori', 'keterangan'], pokok_doa);
            await insertRelated('pewartaan_jemaat_ultah', ['tanggal', 'nama_jemaat', 'keterangan'], jemaat_ultah);
            await insertRelated('pewartaan_jemaat_sakit', ['nama_jemaat', 'keterangan'], jemaat_sakit);
            await insertRelated('pewartaan_pemulihan', ['nama_jemaat', 'keterangan'], pemulihan);
            await insertRelated('pewartaan_lansia', ['nama_jemaat', 'keterangan'], lansia);
            await insertRelated('pewartaan_info_ibadah', ['tanggal', 'jam', 'jenis_ibadah', 'pemimpin', 'sektor'], info_ibadah);
            await insertRelated('pewartaan_pelayanan_sektor', ['nomor_sektor', 'tempat', 'pemimpin', 'liturgos', 'nomor_hp'], pelayanan_sektor);
            await insertRelated('pewartaan_pelayanan_kategorial', ['tanggal_waktu', 'kategori_pelayanan', 'tempat', 'pemimpin', 'liturgos_petugas'], pelayanan_kategorial);

            await client.query('COMMIT');

            if (status === 'approved') {
                await this.triggerNotifications(id);
            }

            res.json({ success: true, message: 'Pewartaan berhasil diperbarui' });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error in PewartaanController.update:', error);
            res.status(500).json({ success: false, message: 'Gagal memperbarui pewartaan', error: error.message });
        } finally {
            client.release();
        }
    }

    async getAll(req, res) {
        try {
            const result = await pool.query('SELECT * FROM pewartaan ORDER BY tanggal_ibadah DESC, created_at DESC');
            res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Error in PewartaanController.getAll:', error);
            res.status(500).json({ success: false, message: 'Gagal mengambil data' });
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const root = await pool.query('SELECT * FROM pewartaan WHERE id = $1', [id]);
            if (!root.rows.length) return res.status(404).json({ success: false, message: 'Pewartaan tidak ditemukan' });

            const data = root.rows[0];
            const tables = [
                { name: 'tata_ibadah', table: 'pewartaan_tata_ibadah', order: 'urutan' },
                { name: 'pokok_doa', table: 'pewartaan_pokok_doa' },
                { name: 'jemaat_ultah', table: 'pewartaan_jemaat_ultah', order: 'tanggal' },
                { name: 'jemaat_sakit', table: 'pewartaan_jemaat_sakit' },
                { name: 'pemulihan', table: 'pewartaan_pemulihan' },
                { name: 'lansia', table: 'pewartaan_lansia' },
                { name: 'info_ibadah', table: 'pewartaan_info_ibadah', order: 'tanggal, jam' },
                { name: 'pelayanan_sektor', table: 'pewartaan_pelayanan_sektor' },
                { name: 'pelayanan_kategorial', table: 'pewartaan_pelayanan_kategorial', order: 'tanggal_waktu' }
            ];

            for (const t of tables) {
                const query = `SELECT * FROM ${t.table} WHERE pewartaan_id = $1 ${t.order ? `ORDER BY ${t.order}` : ''}`;
                const resTable = await pool.query(query, [id]);
                data[t.name] = resTable.rows;
            }

            res.json({ success: true, data });
        } catch (error) {
            console.error('Error in PewartaanController.getById:', error);
            res.status(500).json({ success: false, message: 'Gagal mengambil detail pewartaan' });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            await pool.query('DELETE FROM pewartaan WHERE id = $1', [id]);
            res.json({ success: true, message: 'Pewartaan berhasil dihapus' });
        } catch (error) {
            console.error('Error in PewartaanController.delete:', error);
            res.status(500).json({ success: false, message: 'Gagal menghapus pewartaan' });
        }
    }

    async exportExcel(req, res) {
        try {
            const { id } = req.params;
            // Fetch ALL data similar to getById but without res.json
            const root = await pool.query('SELECT * FROM pewartaan WHERE id = $1', [id]);
            if (!root.rows.length) return res.status(404).json({ success: false, message: 'Pewartaan tidak ditemukan' });

            const data = root.rows[0];
            const sections = [
                { name: 'Tata Ibadah', table: 'pewartaan_tata_ibadah', cols: ['urutan', 'nama_bagian', 'keterangan', 'judul_pujian', 'isi_konten'] },
                { name: 'Pokok Doa', table: 'pewartaan_pokok_doa', cols: ['kategori', 'keterangan'] },
                { name: 'Jemaat Ultah', table: 'pewartaan_jemaat_ultah', cols: ['tanggal', 'nama_jemaat', 'keterangan'] },
                { name: 'Jemaat Sakit', table: 'pewartaan_jemaat_sakit', cols: ['nama_jemaat', 'keterangan'] },
                { name: 'Pemulihan', table: 'pewartaan_pemulihan', cols: ['nama_jemaat', 'keterangan'] },
                { name: 'Lansia', table: 'pewartaan_lansia', cols: ['nama_jemaat', 'keterangan'] },
                { name: 'Info Ibadah', table: 'pewartaan_info_ibadah', cols: ['tanggal', 'jam', 'jenis_ibadah', 'pemimpin', 'sektor'] },
                { name: 'Pelayanan Sektor', table: 'pewartaan_pelayanan_sektor', cols: ['nomor_sektor', 'tempat', 'pemimpin', 'liturgos'] },
                { name: 'Pelayanan Kategorial', table: 'pewartaan_pelayanan_kategorial', cols: ['tanggal_waktu', 'kategori_pelayanan', 'tempat', 'pemimpin', 'liturgos_petugas'] }
            ];

            const workbook = new ExcelJS.Workbook();

            for (const section of sections) {
                const sheet = workbook.addWorksheet(section.name);
                sheet.columns = section.cols.map(col => ({ header: col.replace('_', ' ').toUpperCase(), key: col, width: 20 }));
                const rows = await pool.query(`SELECT * FROM ${section.table} WHERE pewartaan_id = $1`, [id]);
                sheet.addRows(rows.rows);
                sheet.getRow(1).font = { bold: true };
            }

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=Warta_${data.judul.replace(/\s+/g, '_')}.xlsx`);
            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error('Error in exportExcel:', error);
            res.status(500).send('Error generating Excel');
        }
    }

    async exportWord(req, res) {
        try {
            const { id } = req.params;
            const root = await pool.query('SELECT * FROM pewartaan WHERE id = $1', [id]);
            if (!root.rows.length) return res.status(404).send('Pewartaan not found');
            const data = root.rows[0];

            // For Word, we'll fetch sections and build a document
            // This is a simplified version, can be expanded for full pro layout
            const fetchTable = async (table) => (await pool.query(`SELECT * FROM ${table} WHERE pewartaan_id = $1`, [id])).rows;

            const tataIbadah = await fetchTable('pewartaan_tata_ibadah');
            const pokokDoa = await fetchTable('pewartaan_pokok_doa');
            const infoIbadah = await fetchTable('pewartaan_info_ibadah');

            const doc = new Document({
                sections: [{
                    properties: {},
                    children: [
                        new Paragraph({
                            children: [
                                new ImageRun({
                                    data: fs.readFileSync(path.join(__dirname, '../../../gmmi-frontend/public/img/kop surat copy.png')),
                                    transformation: {
                                        width: 600,
                                        height: 150,
                                    },
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                        }),
                        new Paragraph({ text: data.judul, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
                        new Paragraph({ text: `${data.hari}, ${new Date(data.tanggal_ibadah).toLocaleDateString('id-ID')}`, alignment: AlignmentType.CENTER }),
                        new Paragraph({ text: data.tempat_jemaat, alignment: AlignmentType.CENTER }),
                        new Paragraph({ text: '' }),
                        new Paragraph({ text: 'AYAT FIRMAN:', heading: HeadingLevel.HEADING_2 }),
                        new Paragraph({ text: data.ayat_firman }),
                        new Paragraph({ text: 'TEMA:', heading: HeadingLevel.HEADING_2 }),
                        new Paragraph({ text: data.tema_khotbah }),
                        new Paragraph({ text: '' }),
                        new Paragraph({ text: 'TATA IBADAH', heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
                        ...tataIbadah.flatMap(item => [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: `${item.urutan}. ${item.nama_bagian}`, bold: true }),
                                    new TextRun({ text: item.keterangan ? ` (${item.keterangan})` : '', italic: true })
                                ]
                            }),
                            item.judul_pujian ? new Paragraph({ text: `Nyanyian: ${item.judul_pujian}`, indent: { left: 720 } }) : null,
                            item.isi_konten ? new Paragraph({ text: item.isi_konten, indent: { left: 720 } }) : null,
                            new Paragraph({ text: '' })
                        ]).filter(Boolean),
                        new Paragraph({ text: 'POKOK DOA', heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
                        ...pokokDoa.map(item => new Paragraph({ text: `• ${item.kategori}: ${item.keterangan}` })),
                        new Paragraph({ text: '' }),
                        new Paragraph({ text: 'INFORMASI IBADAH', heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [
                                new TableRow({
                                    children: ['Tanggal', 'Jam', 'Jenis', 'Pemimpin', 'Sektor'].map(h => new TableCell({ children: [new Paragraph({ text: h, bold: true })] }))
                                }),
                                ...infoIbadah.map(item => new TableRow({
                                    children: [
                                        new Date(item.tanggal).toLocaleDateString('id-ID'),
                                        item.jam,
                                        item.jenis_ibadah,
                                        item.pemimpin,
                                        item.sektor
                                    ].map(text => new TableCell({ children: [new Paragraph({ text: text || '' })] }))
                                }))
                            ]
                        })
                    ]
                }]
            });

            const buffer = await Packer.toBuffer(doc);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename=Warta_${data.id}.docx`);
            res.send(buffer);
        } catch (error) {
            console.error('Error in exportWord:', error);
            res.status(500).send('Error generating Word document');
        }
    }
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['approved', 'rejected', 'pending', 'draft'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Status tidak valid' });
            }

            const query = 'UPDATE pewartaan SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
            const result = await pool.query(query, [status, id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Pewartaan tidak ditemukan' });
            }

            if (status === 'approved') {
                await this.triggerNotifications(id);
            }

            res.json({ success: true, message: `Status pewartaan berhasil diubah menjadi ${status}`, data: result.rows[0] });
        } catch (error) {
            console.error('Error in PewartaanController.updateStatus:', error);
            res.status(500).json({ success: false, message: 'Gagal memperbarui status pewartaan' });
        }
    }

    async triggerNotifications(pewartaanId) {
        try {
            // Fetch sektor info to send notification
            const sektorRes = await pool.query('SELECT * FROM pewartaan_pelayanan_sektor WHERE pewartaan_id = $1', [pewartaanId]);
            const wartaRes = await pool.query('SELECT * FROM pewartaan WHERE id = $1', [pewartaanId]);

            if (sektorRes.rows.length > 0 && wartaRes.rows.length > 0) {
                const wartaData = wartaRes.rows[0];
                for (const sektor of sektorRes.rows) {
                    if (sektor.nomor_hp) {
                        await notificationService.sendWartaSektorNotification(sektor.nomor_hp, {
                            nomor_sektor: sektor.nomor_sektor,
                            tempat: sektor.tempat,
                            pemimpin: sektor.pemimpin,
                            liturgos: sektor.liturgos,
                            judul_warta: wartaData.judul,
                            tanggal: wartaData.tanggal_ibadah
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error triggering notifications:', error);
        }
    }
}

export default new PewartaanController();
