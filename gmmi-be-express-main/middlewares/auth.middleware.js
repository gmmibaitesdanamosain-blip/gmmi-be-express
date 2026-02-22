import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token tidak ditemukan. Silakan login kembali.'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'gmmi_secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Token tidak valid atau kadaluarsa.'
            });
        }
        req.user = user;
        next();
    });
};
