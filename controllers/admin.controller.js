import AdminService from '../services/admin.service.js';
import pool from '../config/db.js';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { logActivity } from '../utils/activityLogger.js';

const logToFile = (msg) => {
    fs.appendFileSync('debug.log', `${new Date().toISOString()} - ${msg}\n`);
};

class AdminController {
    async register(req, res) {
        try {
            logToFile('--- Register Attempt ---');
            logToFile(`Body: ${JSON.stringify(req.body)}`);

            const { nama, email, password, role } = req.body;

            // Validasi input minimal
            if (!nama || !email || !password || !role) {
                logToFile('Validation Failed: Missing fields');
                return res.status(400).json({
                    success: false,
                    message: `Semua field harus diisi. Nama: ${!!nama}, Email: ${!!email}, Pass: ${!!password}, Role: ${!!role}`
                });
            }

            const newAdmin = await AdminService.registerAdmin({ nama, email, password, role });

            await logActivity(req.user?.id, req.user?.nama, 'TAMBAH', 'ADMIN', `Mendaftarkan admin baru: ${nama} (${role})`);

            logToFile('Registration Success');
            return res.status(201).json({
                success: true,
                message: 'Registrasi admin berhasil.',
                data: newAdmin
            });
        } catch (error) {
            logToFile(`Error: ${error.message}`);
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email dan password harus diisi.'
                });
            }

            const admin = await AdminService.loginAdmin({ email, password });

            // Generate JWT Token
            const token = jwt.sign(
                { id: admin.id, email: admin.email, role: admin.role, nama: admin.nama },
                process.env.JWT_SECRET || 'gmmi_secret_key',
                { expiresIn: '24h' }
            );

            await logActivity(admin.id, admin.nama, 'LOGIN', 'AUTH', `Admin ${admin.nama} melakukan login`);

            return res.status(200).json({
                success: true,
                message: 'Login berhasil.',
                data: {
                    token,
                    user: {
                        id: admin.id,
                        nama: admin.nama,
                        email: admin.email,
                        role: admin.role
                    }
                }
            });
        } catch (error) {
            console.error('Error in AdminController.login:', error.message);
            return res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }

    async getSummary(req, res) {
        try {
            // Stats from core tables
            let pewartaanCount = { rows: [{ count: 0 }] };
            let activePewartaan = { rows: [{ count: 0 }] };
            let pengumumanCount = { rows: [{ count: 0 }] };
            let agendaCount = { rows: [{ count: 0 }] };
            let programCount = { rows: [{ count: 0 }] };
            let renunganCount = { rows: [{ count: 0 }] };

            try {
                pewartaanCount = await pool.query('SELECT COUNT(*) FROM pewartaan');
                activePewartaan = await pool.query("SELECT COUNT(*) FROM pewartaan WHERE status = 'approved'");
            } catch (e) { console.error("Error counting Pewartaan:", e.message); }

            try {
                pengumumanCount = await pool.query('SELECT COUNT(*) FROM announcements');
            } catch (e) { console.error("Error counting Announcements:", e.message); }

            try {
                agendaCount = await pool.query("SELECT COUNT(*) FROM agenda WHERE status = 'aktif'");
            } catch (e) { console.error("Error counting Agenda:", e.message); }

            try {
                programCount = await pool.query('SELECT COUNT(*) FROM program_kegiatan_gereja');
            } catch (e) { console.error("Error counting Program:", e.message); }

            try {
                renunganCount = await pool.query('SELECT COUNT(*) FROM renungan_mingguan');
            } catch (e) { console.error("Error counting Renungan:", e.message); }

            // Finance stats (laporan_keuangan table)
            let income = 0;
            let expense = 0;
            try {
                const finRes = await pool.query(`
                    SELECT 
                        SUM(COALESCE(kas_penerimaan,0) + COALESCE(bank_debit,0)) as total_income,
                        SUM(COALESCE(kas_pengeluaran,0) + COALESCE(bank_kredit,0)) as total_expense
                    FROM laporan_keuangan
                `);
                income = parseInt(finRes.rows[0].total_income) || 0;
                expense = parseInt(finRes.rows[0].total_expense) || 0;
            } catch (err) {
                console.error("Error fetching finance stats:", err.message);
            }

            // Arsip count (arsip_bulanan table)
            let archives = 0;
            try {
                const arsipRes = await pool.query('SELECT COUNT(*) FROM arsip_bulanan');
                archives = parseInt(arsipRes.rows[0].count) || 0;
            } catch (err) {
                // Ignore if table missing
            }

            // Fetch Recent Transactions
            let recentFinance = [];
            try {
                const finResRecent = await pool.query("SELECT id, tanggal, keterangan, (kas_penerimaan + bank_debit) as masuk, (kas_pengeluaran + bank_kredit) as keluar FROM laporan_keuangan ORDER BY tanggal DESC, created_at DESC LIMIT 5");
                recentFinance = finResRecent.rows;
            } catch (err) { console.error("Error fetching recent finance:", err.message); }

            // Fetch Upcoming Agenda
            let upcomingAgendaItems = [];
            try {
                const upcomingRes = await pool.query("SELECT id, kegiatan, tanggal, jam_mulai, lokasi FROM agenda WHERE tanggal >= CURRENT_DATE AND status = 'aktif' ORDER BY tanggal ASC, jam_mulai ASC LIMIT 5");
                upcomingAgendaItems = upcomingRes.rows.map(item => ({
                    ...item,
                    tanggal: item.tanggal
                }));
            } catch (e) { console.error("Error fetching Upcoming Agenda:", e.message); }

            // Fetch actual activity logs from the "aktivitas" table
            let activities = [];
            try {
                const actRes = await pool.query('SELECT *, created_at as date FROM aktivitas ORDER BY created_at DESC LIMIT 10');
                activities = actRes.rows.map(act => {
                    const date = new Date(act.date);
                    const now = new Date();
                    const diffMs = now.getTime() - date.getTime();
                    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffDays = Math.floor(diffHrs / 24);

                    let timeAgo = '';
                    if (diffHrs < 1) timeAgo = 'Baru saja';
                    else if (diffHrs < 24) timeAgo = `${diffHrs} jam yang lalu`;
                    else if (diffDays === 1) timeAgo = 'Kemarin';
                    else timeAgo = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

                    return {
                        id: act.id,
                        type: act.modul.toLowerCase(),
                        title: `${act.admin_nama || 'System'} ${act.aksi.toLowerCase()} ${act.modul.toLowerCase()}: ${act.detail}`,
                        date: act.date,
                        time: timeAgo
                    };
                });
            } catch (err) {
                console.error("Error fetching activity logs:", err.message);
            }

            // Calculate balance for simplified view
            const balance = income - expense;

            // Additional Master Data Counts
            let jemaatCount = { rows: [{ count: 0 }] };
            let sectorCount = { rows: [{ count: 0 }] };
            let adminCount = { rows: [{ count: 0 }] };

            try {
                jemaatCount = await pool.query('SELECT COUNT(*) FROM jemaat WHERE deleted_at IS NULL');
            } catch (e) {
                console.error("Error counting Jemaat:", e.message);
            }

            try {
                sectorCount = await pool.query('SELECT COUNT(*) FROM sectors');
            } catch (e) {
                console.error("Error counting Sectors:", e.message);
            }

            try {
                adminCount = await pool.query('SELECT COUNT(*) FROM admins');
            } catch (e) {
                console.error("Error counting Admins:", e.message);
            }

            const responseData = {
                totalPewartaan: parseInt(pewartaanCount.rows[0].count),
                activePewartaan: parseInt(activePewartaan.rows[0].count),
                totalAnnouncements: parseInt(pengumumanCount.rows[0].count),
                totalAgenda: parseInt(agendaCount.rows[0].count),
                totalProgram: parseInt(programCount.rows[0].count),
                totalRenungan: parseInt(renunganCount.rows[0].count),

                // Aliases for Admin Majelis Dashboard
                totalWarta: parseInt(pewartaanCount.rows[0].count),
                upcomingServices: parseInt(agendaCount.rows[0].count),
                totalPrograms: parseInt(programCount.rows[0].count),
                activePrograms: parseInt(programCount.rows[0].count), // Simplified for now
                lastUpdateAnnouncements: new Date().toLocaleDateString('id-ID'),
                lastUpdateWarta: new Date().toLocaleDateString('id-ID'),
                lastUpdateJadwal: new Date().toLocaleDateString('id-ID'),

                // New Fields
                totalJemaat: parseInt(jemaatCount.rows[0].count) || 0,
                totalSectors: parseInt(sectorCount.rows[0].count) || 0,
                totalAdmins: parseInt(adminCount.rows[0].count) || 0,

                income,
                expense,
                startBalance: balance,
                archives,
                recentActivities: activities,
                recentFinance,
                upcomingAgenda: upcomingAgendaItems
            };

            // Enhanced Statistics (Lazy loaded if needed, but here we include common stats)
            // 1. Education Stats grouped by Sector
            try {
                const eduRes = await pool.query(`
                    SELECT s.nama_sektor as sector, j.pendidikan_terakhir as education, COUNT(*) as count
                    FROM jemaat j
                    LEFT JOIN sectors s ON j.sektor_id = s.id
                    WHERE j.deleted_at IS NULL
                    GROUP BY s.nama_sektor, j.pendidikan_terakhir
                `);
                responseData.educationStats = eduRes.rows;
            } catch (e) {
                console.error("Error fetching Education Stats:", e.message);
                responseData.educationStats = [];
            }

            // 2. Kategorial Stats grouped by Sector
            try {
                const katRes = await pool.query(`
                    SELECT s.nama_sektor as sector, j.kategorial as category, COUNT(*) as count
                    FROM jemaat j
                    LEFT JOIN sectors s ON j.sektor_id = s.id
                    WHERE j.deleted_at IS NULL
                    GROUP BY s.nama_sektor, j.kategorial
                `);
                responseData.kategorialStats = katRes.rows;
            } catch (e) {
                console.error("Error fetching Kategorial Stats:", e.message);
                responseData.kategorialStats = [];
            }

            // 3. Sakramen Stats grouped by Sector
            try {
                const sakRes = await pool.query(`
                    SELECT s.nama_sektor as sector, js.jenis_sakramen as sacrament, COUNT(*) as count
                    FROM jemaat_sakramen js
                    JOIN jemaat j ON js.jemaat_id = j.id
                    LEFT JOIN sectors s ON j.sektor_id = s.id
                    WHERE j.deleted_at IS NULL
                    GROUP BY s.nama_sektor, js.jenis_sakramen
                `);
                responseData.sakramenStats = sakRes.rows;
            } catch (e) {
                console.error("Error fetching Sakramen Stats:", e.message);
                responseData.sakramenStats = [];
            }

            // 4. List of Sectors for filtering
            try {
                const secList = await pool.query(`SELECT id, nama_sektor FROM sectors ORDER BY nama_sektor ASC`);
                responseData.sectorsList = secList.rows;
            } catch (e) {
                responseData.sectorsList = [];
            }

            return res.json(responseData);

        } catch (error) {
            console.error('Error in getSummary:', error);
            res.status(500).json({ message: 'Gagal mengambil ringkasan data' });
        }
    }

    async getAdmins(req, res) {
        try {
            const admins = await AdminService.getAllAdmins();

            // Map DB fields to Frontend expected fields
            const mappedAdmins = admins.map(admin => ({
                id: admin.id,
                name: admin.nama,
                email: admin.email,
                role: admin.role,
                isActive: admin.is_active
            }));

            return res.json(mappedAdmins);
        } catch (error) {
            console.error('Error in getAdmins:', error);
            return res.status(500).json({ message: 'Gagal mengambil data admin' });
        }
    }

    async updateAdmin(req, res) {
        try {
            const { id } = req.params;
            const { name, email, role } = req.body;

            const query = `
                UPDATE admins 
                SET nama = $1, email = $2, role = $3, updated_at = CURRENT_TIMESTAMP
                WHERE id = $4
                RETURNING id, nama, email, role
            `;
            const result = await pool.query(query, [name, email, role, id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Admin tidak ditemukan' });
            }

            return res.json({ success: true, data: result.rows[0] });
        } catch (error) {
            console.error('Error in updateAdmin:', error);
            return res.status(500).json({ success: false, message: 'Gagal memperbarui admin' });
        }
    }

    async toggleAdminStatus(req, res) {
        try {
            const { id } = req.params;
            const { isActive } = req.body;

            const query = 'UPDATE admins SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, is_active';
            const result = await pool.query(query, [isActive, id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Admin tidak ditemukan' });
            }

            return res.json({ success: true, data: result.rows[0] });
        } catch (error) {
            console.error('Error in toggleAdminStatus:', error);
            return res.status(500).json({ success: false, message: 'Gagal mengubah status admin' });
        }
    }

    async resetAdminPassword(req, res) {
        try {
            const { id } = req.body;
            const defaultPassword = 'GMMI1234'; // Plaintext password

            const query = 'UPDATE admins SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id';
            const result = await pool.query(query, [defaultPassword, id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Admin tidak ditemukan' });
            }

            await logActivity(req.user?.id, req.user?.nama, 'UBAH', 'ADMIN', `Mereset password admin ID: ${id}`);

            return res.json({ success: true, message: 'Password berhasil direset ke GMMI1234' });
        } catch (error) {
            console.error('Error in resetAdminPassword:', error);
            return res.status(500).json({ success: false, message: 'Gagal mereset password' });
        }
    }

    async changePassword(req, res) {
        try {
            const { id } = req.body; // In a real app, this should come from req.user.id (JWT)
            const { currentPassword, newPassword } = req.body;

            // 1. Check if admin exists and password matches
            const adminRes = await pool.query('SELECT * FROM admins WHERE id = $1', [id]);
            if (adminRes.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Admin tidak ditemukan' });
            }

            const admin = adminRes.rows[0];
            if (admin.password_hash !== currentPassword) {
                return res.status(400).json({ success: false, message: 'Password lama salah' });
            }

            // 2. Update to new password
            await pool.query('UPDATE admins SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newPassword, id]);

            await logActivity(id, admin.nama, 'UBAH', 'ADMIN', `Admin ${admin.nama} mengubah password sendiri`);

            return res.json({ success: true, message: 'Password berhasil diubah' });
        } catch (error) {
            console.error('Error in changePassword:', error);
            return res.status(500).json({ success: false, message: 'Gagal mengubah password' });
        }
    }
}

export default new AdminController();
