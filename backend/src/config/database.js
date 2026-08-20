const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Membuat pool koneksi agar lebih efisien dalam menangani banyak request
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Fungsi untuk mengecek koneksi saat server pertama kali jalan
const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Berhasil terhubung ke database MySQL [hci]');
    connection.release();
  } catch (error) {
    console.error('❌ Gagal terhubung ke database:', error.message);
  }
};

checkConnection();

module.exports = pool;