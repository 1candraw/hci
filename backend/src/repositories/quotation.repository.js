const db = require('../config/database');

const create = async (data) => {
  const query = `
    INSERT INTO quotations 
    (nomor_pemesanan, customer_id, alat_berat_id, sumber_pesanan, saw_result_id, metode_pembayaran, catatan, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')
  `;
  
  const values = [
    data.nomor_pemesanan,
    data.customer_id,
    data.alat_berat_id,
    data.sumber_pesanan || 'katalog',
    data.saw_result_id || null, // Terisi jika pesanan masuk dari hasil SAW
    data.metode_pembayaran || 'cash',
    data.catatan || null
  ];

  const [result] = await db.query(query, values);
  return result.insertId;
};

// +++ TAMBAHAN: Fungsi getAll dengan JOIN Tabel +++
const getAll = async () => {
  const query = `
    SELECT 
      q.id, 
      q.nomor_pemesanan, 
      q.status, 
      q.created_at,
      u.fullname AS nama_customer, 
      a.name AS nama_alat
    FROM quotations q
    LEFT JOIN users u ON q.customer_id = u.id
    LEFT JOIN alat_berat a ON q.alat_berat_id = a.id
    ORDER BY q.created_at DESC
  `;
  
  const [rows] = await db.query(query);
  return rows;
};

// Jangan lupa mengekspor getAll agar bisa dipakai di Controller
module.exports = {
  create,
  getAll
};