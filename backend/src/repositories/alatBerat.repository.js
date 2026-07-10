const db = require('../config/database'); 

// 1. Mengambil semua data
const findAll = async (tipeKatalog, filterKapasitas, statusApproval) => {
  let query = `SELECT * FROM alat_berat WHERE 1=1`;
  const queryParams = [];

  if (tipeKatalog && tipeKatalog !== 'semua') {
    query += " AND tipe_katalog = ?";
    queryParams.push(tipeKatalog);
  }

  if (filterKapasitas && filterKapasitas !== 'Semua') {
    query += " AND kapasitas_ton = ?";
    queryParams.push(filterKapasitas);
  }

  if (statusApproval) {
    query += " AND status_approval = ?";
    queryParams.push(statusApproval);
  }

  query += " ORDER BY created_at DESC"; 

  const [rows] = await db.query(query, queryParams);
  return rows;
};

// 2. Mengambil 1 data spesifik (Untuk mengecek status)
const findById = async (id) => {
  const [rows] = await db.query("SELECT * FROM alat_berat WHERE id = ?", [id]);
  return rows[0]; 
};

// 3. Menambah data baru 
const create = async (data) => {
  const query = `
    INSERT INTO alat_berat 
    (tipe_katalog, name, brand, model, harga, tenaga_mesin, kapasitas_bucket, kedalaman_gali, berat_operasional, kapasitas_ton, stock, description, image_url, status_approval, created_by, approved_by) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    data.tipe_katalog, data.name, data.brand, data.model, 
    data.harga || 0, data.tenaga_mesin || 0, data.kapasitas_bucket || 0, 
    data.kedalaman_gali || 0, data.berat_operasional || 0, data.kapasitas_ton || null, 
    data.stock || 0, data.description || null, data.image_url || null, 
    data.status_approval, data.created_by, data.approved_by || null
  ];

  const [result] = await db.query(query, values);
  return result.insertId;
};

// 4. Memperbarui seluruh data alat berat (Edit)
const update = async (id, data) => {
  // Kita buat query dinamis agar field yang kosong/tidak diubah tetap aman
  let updateFields = [];
  let values = [];

  // Looping objek data untuk menyusun field yang akan di-update
  for (const [key, value] of Object.entries(data)) {
    // Abaikan field yang tidak boleh di-update secara langsung
    if (!['id', 'created_at', 'updated_at', 'created_by'].includes(key)) {
      updateFields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (updateFields.length === 0) return 0; // Tidak ada yang di-update

  const query = `UPDATE alat_berat SET ${updateFields.join(', ')} WHERE id = ?`;
  values.push(id);

  const [result] = await db.query(query, values);
  return result.affectedRows;
};

// 5. Menghapus data permanen (Hard Delete)
const remove = async (id) => {
  await db.query(`DELETE FROM saw_results WHERE alat_berat_id = ?`, [id]);
  const query = `DELETE FROM alat_berat WHERE id = ?`;
  const [result] = await db.query(query, [id]);
  return result.affectedRows;
};

// 6. Memperbarui status persetujuan
const updateStatus = async (id, status, managerId) => {
  const query = `
    UPDATE alat_berat 
    SET status_approval = ?, approved_by = ? 
    WHERE id = ?
  `;
  const [result] = await db.query(query, [status, managerId, id]);
  return result.affectedRows;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  updateStatus
};