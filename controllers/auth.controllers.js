import AdminService from '../services/admin.service.js';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password harus diisi.'
      });
    }

    const admin = await AdminService.loginAdmin({ email, password });

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role, name: admin.nama },
      process.env.JWT_SECRET || 'gmmi_secret_key',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      token,
      user: {
        id: admin.id,
        name: admin.nama,
        email: admin.email,
        role: admin.role,
        password: admin.password_hash
      }
    });
  } catch (error) {
    console.error('Error in auth.login:', error.message);
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

export const me = async (req, res) => {
  try {
    const result = await AdminService.getAllAdmins();
    const admin = result.find(a => a.id === req.user.id);

    // Fetch specifically to get password_hash since getAllAdmins hides it
    const fullAdminRes = await pool.query('SELECT password_hash FROM admins WHERE id = $1', [req.user.id]);
    const password = fullAdminRes.rows[0]?.password_hash;

    return res.status(200).json({
      success: true,
      user: {
        ...req.user,
        password
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};