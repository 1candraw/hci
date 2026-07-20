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

module.exports = {
  create
};