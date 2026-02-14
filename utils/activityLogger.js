import pool from '../config/db.js';

/**
 * Logs an administrative activity to the database.
 * @param {number} adminId - ID of the admin performing the action.
 * @param {string} adminNama - Name of the admin performing the action.
 * @param {string} aksi - Type of action (TAMBAH, UBAH, HAPUS, LOGIN, etc).
 * @param {string} modul - Relevant module (JEMAAT, KEUANGAN, etc).
 * @param {string} detail - Description of the action.
 */
export const logActivity = async (adminId, adminNama, aksi, modul, detail) => {
    try {
        const queryText = `
            INSERT INTO aktivitas (admin_id, admin_nama, aksi, modul, detail)
            VALUES ($1, $2, $3, $4, $5)
        `;
        const values = [adminId, adminNama, aksi, modul, detail];
        await pool.query(queryText, values);
    } catch (err) {
        console.error('Error logging activity:', err.message);
        // Note: We don't throw error here to avoid breaking the main operation if logging fails
    }
};

export default logActivity;
