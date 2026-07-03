const db = require('../config/database');

const getStats = async () => {
  // Mengambil total alat berat
  const [[alatBerat]] = await db.query('SELECT COUNT(*) as total FROM alat_berat');
  
  // Mengambil total kategori
  const [[kategori]] = await db.query('SELECT COUNT(*) as total FROM kategori_alat');
  
  // Mengambil total user (karyawan & customer)
  const [[users]] = await db.query('SELECT COUNT(*) as total FROM users');

  return {
    total_alat_berat: alatBerat.total,
    total_kategori: kategori.total,
    total_pengguna: users.total
  };
};

module.exports = { getStats };