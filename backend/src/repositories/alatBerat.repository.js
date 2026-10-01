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
  const stockVal = data.stok !== undefined ? data.stok : (data.stock || 0);
  const query = `
    INSERT INTO alat_berat 
    (tipe_katalog, name, brand, model, harga, tenaga_mesin, kapasitas_bucket, kedalaman_gali, berat_operasional, kapasitas_ton, stock, stok, description, image_url, status_approval, created_by, approved_by) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    data.tipe_katalog, data.name, data.brand, data.model, 
    data.harga || 0, data.tenaga_mesin || 0, data.kapasitas_bucket || 0, 
    data.kedalaman_gali || 0, data.berat_operasional || 0, data.kapasitas_ton || null, 
    stockVal, stockVal, data.description || null, data.image_url || null, 
    data.status_approval, data.created_by, data.approved_by || null
  ];

  const [result] = await db.query(query, values);
  return result.insertId;
};

const ALLOWED_UPDATE_COLUMNS = [
  'tipe_katalog', 'name', 'brand', 'model', 'harga', 'tenaga_mesin', 
  'kapasitas_bucket', 'kedalaman_gali', 'berat_operasional', 'kapasitas_ton', 
  'stock', 'stok', 'description', 'image_url', 'status_approval', 'approved_by'
];

// 4. Memperbarui seluruh data alat berat (Edit)
const update = async (id, data) => {
  let updateFields = [];
  let values = [];

  // Jika terdapat perubahan stok/stock, pastikan keduanya sinkron
  if (data.stok !== undefined && data.stock === undefined) {
    data.stock = data.stok;
  } else if (data.stock !== undefined && data.stok === undefined) {
    data.stok = data.stock;
  }

  // Looping objek data hanya untuk kolom yang valid
  for (const [key, value] of Object.entries(data)) {
    if (ALLOWED_UPDATE_COLUMNS.includes(key)) {
      updateFields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (updateFields.length === 0) return 0;

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

// 7. Update stok unit langsung (Hanya Manager)
const updateStock = async (id, newStock) => {
  const stockVal = Math.max(0, parseInt(newStock, 10) || 0);
  const query = `
    UPDATE alat_berat 
    SET stok = ?, stock = ? 
    WHERE id = ?
  `;
  const [result] = await db.query(query, [stockVal, stockVal, id]);
  return result.affectedRows;
};

// 8. Pengurangan stok otomatis saat transaksi disetujui / surat jalan terbit
const deductStock = async (id, amount = 1) => {
  const qty = parseInt(amount, 10) || 1;
  const query = `
    UPDATE alat_berat 
    SET 
      stok = GREATEST(0, stok - ?),
      stock = GREATEST(0, stock - ?)
    WHERE id = ? AND (stok >= ? OR stock >= ?)
  `;
  const [result] = await db.query(query, [qty, qty, id, qty, qty]);
  return result.affectedRows;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  updateStatus,
  updateStock,
  deductStock
};