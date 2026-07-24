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
    data.saw_result_id || null, 
    data.metode_pembayaran || 'cash',
    data.catatan || null
  ];

  const [result] = await db.query(query, values);
  return result.insertId;
};

// Fungsi getAll dengan JOIN Tabel 
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

// +++ TAMBAHAN: Fungsi getById dengan rincian lengkap untuk halaman Detail +++
const getById = async (id) => {
  const query = `
    SELECT 
      q.id, 
      q.nomor_pemesanan AS nomor_dokumen, 
      q.status, 
      q.created_at AS tanggal,
      q.metode_pembayaran,
      q.catatan,
      q.sumber_pesanan,
      u.fullname AS perusahaan, 
      u.email AS email_perusahaan,
      u.phone AS telepon_perusahaan,
      a.name AS nama_unit,
      a.harga AS harga_unit 
    FROM quotations q
    LEFT JOIN users u ON q.customer_id = u.id
    LEFT JOIN alat_berat a ON q.alat_berat_id = a.id
    WHERE q.id = ?
  `;
  
  const [rows] = await db.query(query, [id]);
  return rows[0]; 
};

// +++ TAMBAHAN: Fungsi untuk Sales menginput harga dan meneruskan ke Manager +++
const updatePenawaran = async (id, data) => {
  const query = `
    UPDATE quotations 
    SET 
      harga_penawaran = ?, 
      ongkos_kirim = ?, 
      diskon = ?, 
      sales_id = ?, 
      status = 'MENUNGGU_APPROVAL'
    WHERE id = ?
  `;
  
  const values = [
    data.harga_penawaran,
    data.ongkos_kirim,
    data.diskon,
    data.sales_id,
    id
  ];

  const [result] = await db.query(query, values);
  return result.affectedRows; // Mengembalikan jumlah baris yang berhasil diubah
};

// Jangan lupa mengekspor getById
module.exports = {
  create,
  getAll,
  getById,
  updatePenawaran
};