const authorize = (allowedRoles) => {
  return (req, res, next) => {
    // req.user didapatkan dari proses auth.middleware.js sebelumnya
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Hanya role [${allowedRoles.join(', ')}] yang diizinkan.`
      });
    }
    next();
  };
};

module.exports = { authorize };