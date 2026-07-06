const db = require('../config/database'); 

// 1. Mengambil semua data (Bisa difilter berdasarkan tipe_katalog atau status_approval)
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

  query += " ORDER BY created_at DESC"; // Urutkan dari yang terbaru

  const [rows] = await db.query(query, queryParams);
  return rows;
};

// 2. Menambah data baru ke database (Oleh Sales atau Manager)
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

// 3. Memperbarui status persetujuan (Khusus Manager)
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
  create,
  updateStatus
};