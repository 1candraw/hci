const db = require('../config/database');

// 1. Menambahkan permohonan stok baru (Sales)
const create = async (data) => {
  const query = `
    INSERT INTO stock_requests 
    (alat_berat_id, requested_by, type, jumlah, alasan, status) 
    VALUES (?, ?, ?, ?, ?, 'PENDING')
  `;
  const values = [
    data.alat_berat_id,
    data.requested_by,
    data.type,
    data.jumlah,
    data.alasan
  ];

  const [result] = await db.query(query, values);
  return result.insertId;
};

// 2. Mengambil detail permohonan berdasarkan ID
const findById = async (id) => {
  const query = `
    SELECT 
      sr.*,
      a.name AS nama_alat,
      a.brand AS brand_alat,
      a.model AS model_alat,
      a.stok AS stok_sekarang,
      a.stock AS stock_sekarang,
      a.image_url,
      u.fullname AS requester_name,
      u.email AS requester_email,
      mgr.fullname AS reviewer_name,
      mgr.email AS reviewer_email
    FROM stock_requests sr
    JOIN alat_berat a ON sr.alat_berat_id = a.id
    JOIN users u ON sr.requested_by = u.id
    LEFT JOIN users mgr ON sr.reviewed_by = mgr.id
    WHERE sr.id = ?
  `;
  const [rows] = await db.query(query, [id]);
  return rows[0] || null;
};

// 3. Mengambil daftar permohonan yang berstatus PENDING (Untuk antrean Manager)
const findPending = async () => {
  const query = `
    SELECT 
      sr.*,
      a.name AS nama_alat,
      a.brand AS brand_alat,
      a.model AS model_alat,
      a.stok AS stok_sekarang,
      a.stock AS stock_sekarang,
      a.image_url,
      u.fullname AS requester_name,
      u.email AS requester_email
    FROM stock_requests sr
    JOIN alat_berat a ON sr.alat_berat_id = a.id
    JOIN users u ON sr.requested_by = u.id
    WHERE sr.status = 'PENDING'
    ORDER BY sr.created_at DESC
  `;
  const [rows] = await db.query(query);
  return rows;
};

// 4. Mengambil riwayat permohonan milik user tertentu (Sales)
const findByRequestedBy = async (userId) => {
  const query = `
    SELECT 
      sr.*,
      a.name AS nama_alat,
      a.brand AS brand_alat,
      a.model AS model_alat,
      a.stok AS stok_sekarang,
      a.stock AS stock_sekarang,
      a.image_url,
      mgr.fullname AS reviewer_name
    FROM stock_requests sr
    JOIN alat_berat a ON sr.alat_berat_id = a.id
    LEFT JOIN users mgr ON sr.reviewed_by = mgr.id
    WHERE sr.requested_by = ?
    ORDER BY sr.created_at DESC
  `;
  const [rows] = await db.query(query, [userId]);
  return rows;
};

// 5. Mengambil semua permohonan (dengan opsi filter status)
const findAll = async (statusFilter) => {
  let query = `
    SELECT 
      sr.*,
      a.name AS nama_alat,
      a.brand AS brand_alat,
      a.model AS model_alat,
      a.stok AS stok_sekarang,
      a.stock AS stock_sekarang,
      a.image_url,
      u.fullname AS requester_name,
      mgr.fullname AS reviewer_name
    FROM stock_requests sr
    JOIN alat_berat a ON sr.alat_berat_id = a.id
    JOIN users u ON sr.requested_by = u.id
    LEFT JOIN users mgr ON sr.reviewed_by = mgr.id
  `;
  const params = [];

  if (statusFilter && statusFilter !== 'ALL') {
    query += ` WHERE sr.status = ?`;
    params.push(statusFilter);
  }

  query += ` ORDER BY sr.created_at DESC`;

  const [rows] = await db.query(query, params);
  return rows;
};

// 6. Memperbarui status persetujuan / penolakan
const updateStatus = async (id, status, reviewedBy, rejectionReason = null) => {
  const query = `
    UPDATE stock_requests 
    SET 
      status = ?, 
      reviewed_by = ?, 
      rejection_reason = ?,
      updated_at = NOW() 
    WHERE id = ?
  `;
  const [result] = await db.query(query, [status, reviewedBy, rejectionReason, id]);
  return result.affectedRows;
};

// 7. Menghitung jumlah permohonan pending
const countPending = async () => {
  const [rows] = await db.query(`SELECT COUNT(*) AS total FROM stock_requests WHERE status = 'PENDING'`);
  return rows[0]?.total || 0;
};

module.exports = {
  create,
  findById,
  findPending,
  findByRequestedBy,
  findAll,
  updateStatus,
  countPending
};
