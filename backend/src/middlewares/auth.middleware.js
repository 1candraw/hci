const jwtConfig = require('../config/jwt');

const authenticate = (req, res, next) => {
  // Token biasanya dikirim di header dengan format: "Bearer <token_acak>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ 
      success: false, 
      message: 'Akses ditolak. Token JWT tidak ditemukan.' 
    });
  }

  try {
    // Verifikasi token
    const decoded = jwtConfig.verifyToken(token);
    
    // Simpan data user (termasuk ID dan Role) ke dalam request agar bisa dibaca oleh controller
    req.user = decoded; 
    
    next(); // Silakan lanjut ke proses berikutnya
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token tidak valid atau sudah kedaluwarsa. Silakan login ulang.' 
    });
  }
};

module.exports = { authenticate };