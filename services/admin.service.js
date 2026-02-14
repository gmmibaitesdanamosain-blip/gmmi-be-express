import pool from '../config/db.js';
import fs from 'fs';

const logToFile = (msg) => {
    fs.appendFileSync('debug.log', `${new Date().toISOString()} - SERVICE: ${msg}\n`);
};

class AdminService {
    async registerAdmin({ nama, email, password, role }) {
        logToFile(`Registering admin: ${nama}, ${email}, ${role}`);

        // 1. Validasi role
        const validRoles = ['super_admin', 'admin_majelis'];
        if (!validRoles.includes(role)) {
            logToFile(`Invalid role: ${role}`);
            throw new Error('Role tidak valid. Harus super_admin atau admin_majelis.');
        }

        // 2. Cek apakah email sudah terdaftar
        try {
            const existingUser = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
            if (existingUser.rows.length > 0) {
                logToFile(`Email already exists: ${email}`);
                throw new Error('Email sudah terdaftar.');
            }
        } catch (dbError) {
            logToFile(`DB Error check: ${dbError.message}`);
            throw dbError;
        }

        // 3. Simpan data ke tabel admins
        const query = `
      INSERT INTO admins (nama, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nama, email, role
    `;
        const values = [nama, email, password, role];

        try {
            const result = await pool.query(query, values);
            logToFile('Insert Successful');
            return result.rows[0];
        } catch (dbError) {
            logToFile(`DB Error insert: ${dbError.message}`);
            throw dbError;
        }
    }

    async loginAdmin({ email, password }) {
        // 1. Cari admin berdasarkan email
        const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            throw new Error('Email atau password salah.');
        }

        const admin = result.rows[0];

        // 2. Verifikasi password (plaintext sesuai permintaan)
        if (admin.password_hash !== password) {
            throw new Error('Email atau password salah.');
        }

        const { password_hash, ...adminData } = admin;
        return adminData;
    }

    async getAllAdmins() {
        // Select all admins, explicitly casting is_active to boolean if needed (though PG does it automatically)
        const query = 'SELECT id, nama, email, role, is_active FROM admins ORDER BY id ASC';
        const result = await pool.query(query);
        return result.rows;
    }
}

export default new AdminService();
