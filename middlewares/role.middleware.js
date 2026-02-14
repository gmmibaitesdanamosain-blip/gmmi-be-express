export const checkRole = (roles) => (req, res, next) => {
  const userRole = req.user.role;
  if (!roles.includes(userRole)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

// Middleware specifically for Super Admin access
export const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya Super Admin yang dapat mengakses fitur ini.'
    });
  }
  next();
};

