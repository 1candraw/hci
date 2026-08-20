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
      COALESCE(q.nomor_pemesanan, CONCAT('Q-', LPAD(q.id, 3, '0'))) AS nomor_dokumen,
      q.nomor_pemesanan, 
      q.status, 
      q.created_at,
      q.created_at AS tanggal,
      q.sumber_pesanan,
      q.metode_pembayaran,
      COALESCE(q.guest_company, u.fullname, q.guest_name, 'Guest RFQ') AS perusahaan,
      COALESCE(q.guest_name, u.fullname, 'Guest') AS nama_customer, 
      q.guest_phone,
      q.guest_email,
      a.name AS nama_alat,
      a.name AS nama_unit
    FROM quotations q
    LEFT JOIN users u ON q.customer_id = u.id
    LEFT JOIN alat_berat a ON q.alat_berat_id = a.id
    ORDER BY q.created_at DESC
  `;
  
  const [rows] = await db.query(query);
  return rows;
};

//Fungsi getById dengan rincian lengkap untuk halaman Detail +++
const getById = async (id) => {
  const isNumeric = !isNaN(id) && !isNaN(parseFloat(id));
  const query = `
    SELECT 
      q.id, 
      COALESCE(q.nomor_pemesanan, CONCAT('Q-', LPAD(q.id, 3, '0'))) AS nomor_dokumen, 
      q.nomor_pemesanan,
      q.status, 
      q.created_at AS tanggal,
      q.metode_pembayaran,
      COALESCE(q.catatan, q.guest_location, '-') AS catatan,
      q.sumber_pesanan,
      q.harga_penawaran, 
      q.ongkos_kirim,    
      q.diskon,
      q.guest_name,
      q.guest_company,
      q.guest_phone,
      q.guest_email,
      q.guest_location,
      q.dp_bank_name,
      q.dp_account_number,
      q.dp_account_name,
      q.dp_proof_url,
      q.dp_amount,
      q.dp_paid_at,
      COALESCE(q.guest_company, u.fullname, q.guest_name, 'Guest RFQ') AS perusahaan, 
      COALESCE(q.guest_email, u.email, '-') AS email_perusahaan,
      COALESCE(q.guest_phone, u.phone, '-') AS telepon_perusahaan,
      COALESCE(q.guest_name, u.fullname, 'Guest') AS nama_customer,
      a.name AS nama_unit,
      a.harga AS harga_unit 
    FROM quotations q
    LEFT JOIN users u ON q.customer_id = u.id
    LEFT JOIN alat_berat a ON q.alat_berat_id = a.id
    WHERE ${isNumeric ? 'q.id = ?' : 'q.nomor_pemesanan = ?'}
  `;
  
  const [rows] = await db.query(query, [id]);
  return rows[0]; 
};

//Fungsi untuk Sales menginput harga dan meneruskan ke Manager +++
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

// TAMBAHKAN FUNGSI BARU INI UNTUK MANAGER ---
const updateStatusManager = async (id, status, manager_id) => {
  const query = `
    UPDATE quotations 
    SET status = ?, manager_id = ? 
    WHERE id = ?
  `;
  
  const [result] = await db.query(query, [status, manager_id, id]);
  return result.affectedRows;
};

// +++ TAMBAHKAN FUNGSI INI +++
const updateStatus = async (id, status) => {
  const query = `UPDATE quotations SET status = ? WHERE id = ?`;
  const [result] = await db.query(query, [status, id]);
  return result.affectedRows;
};

// +++ TAMBAHKAN FUNGSI INI +++
const submitPDI = async (quotationId, operatorId, data) => {
  const { engine, hydraulic, bucket, body, undercarriage, accessories, notes } = data;
  
  const query = `
    INSERT INTO unit_checklists 
    (quotation_id, operator_id, engine_check, hydraulic_check, bucket_check, body_check, undercarriage_check, accessories_check, notes) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const [result] = await db.query(query, [
    quotationId, 
    operatorId, 
    engine ? 1 : 0, 
    hydraulic ? 1 : 0, 
    bucket ? 1 : 0, 
    body ? 1 : 0, 
    undercarriage ? 1 : 0, 
    accessories ? 1 : 0, 
    notes || ''
  ]);
  
  return result.insertId;
};

// +++ TAMBAHKAN FUNGSI INI DI REPOSITORY +++
const submitDeliveryOrder = async (quotationId, data) => {
  const { driverName, vehicleNumber, destination } = data;
  
  // Membuat nomor surat jalan otomatis (Contoh: SJ-202608-1234)
  const date = new Date();
  const sjNumber = `SJ-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000)}`;

  const query = `
    INSERT INTO delivery_orders 
    (quotation_id, surat_jalan_number, driver_name, vehicle_number, destination) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  const [result] = await db.query(query, [quotationId, sjNumber, driverName, vehicleNumber, destination]);
  return result.insertId;
};

// +++ TAMBAHKAN FUNGSI INI DI BAWAH +++
const confirmDelivery = async (quotationId) => {
  const isNumeric = !isNaN(quotationId) && !isNaN(parseFloat(quotationId));
  
  let actualId = quotationId;
  if (!isNumeric) {
    const [rows] = await db.query('SELECT id FROM quotations WHERE nomor_pemesanan = ?', [quotationId]);
    if (rows.length > 0) {
      actualId = rows[0].id;
    }
  }

  // 1. Catat bahwa barang sudah diterima (Timestamp otomatis)
  const updateDeliveryQuery = `
    UPDATE delivery_orders 
    SET received_by_customer = 1, received_at = NOW() 
    WHERE quotation_id = ?
  `;
  await db.query(updateDeliveryQuery, [actualId]);
  
  // 2. Ubah status pesanan menjadi SELESAI
  const updateStatusQuery = `
    UPDATE quotations 
    SET status = 'SELESAI' 
    WHERE id = ?
  `;
  await db.query(updateStatusQuery, [actualId]);
  
  return true;
};
// Pastikan confirmDelivery diekspor

// ★ GUEST RFQ: Simpan pemesanan tamu tanpa customer_id
const createGuest = async (data) => {
  const query = `
    INSERT INTO quotations 
    (nomor_pemesanan, alat_berat_id, sumber_pesanan, metode_pembayaran,
     guest_name, guest_company, guest_phone, guest_email, guest_location, status)
    VALUES (?, ?, 'guest', ?, ?, ?, ?, ?, ?, 'PENDING')
  `;
  const values = [
    data.nomor_pemesanan,
    data.alat_berat_id,
    data.metode_pembayaran || 'cash',
    data.guest_name,
    data.guest_company,
    data.guest_phone,
    data.guest_email,
    data.guest_location || null,
  ];
  const [result] = await db.query(query, values);
  return result.insertId;
};

// ★ TRACKING PUBLIK: Cari pesanan berdasarkan nomor pemesanan
const getByNomor = async (nomor) => {
  const isNumeric = !isNaN(nomor) && !isNaN(parseFloat(nomor));
  const query = `
    SELECT 
      q.id,
      q.nomor_pemesanan,
      q.status,
      q.sumber_pesanan,
      q.metode_pembayaran,
      q.harga_penawaran,
      q.ongkos_kirim,
      q.diskon,
      q.catatan,
      q.guest_name,
      q.guest_company,
      q.guest_phone,
      q.guest_email,
      q.guest_location,
      q.dp_bank_name,
      q.dp_account_number,
      q.dp_account_name,
      q.dp_proof_url,
      q.dp_amount,
      q.dp_paid_at,
      q.created_at,
      q.updated_at,
      a.name    AS nama_alat,
      a.brand   AS brand_alat,
      a.model   AS model_alat,
      a.image_url,
      u.fullname AS nama_customer,
      u.email   AS email_customer,
      u.phone   AS phone_customer,
      d.surat_jalan_number,
      d.driver_name,
      d.vehicle_number,
      d.destination,
      d.received_by_customer,
      d.received_at
    FROM quotations q
    LEFT JOIN alat_berat a  ON q.alat_berat_id = a.id
    LEFT JOIN users u       ON q.customer_id   = u.id
    LEFT JOIN delivery_orders d ON d.quotation_id = q.id
    WHERE ${isNumeric ? 'q.id = ?' : 'q.nomor_pemesanan = ?'}
    LIMIT 1
  `;
  const [rows] = await db.query(query, [nomor]);
  return rows[0] || null;
};

// ★ SIMPAN PEMBAYARAN DP DENGAN BUKTI TRANSFER
const saveDPPayment = async (identifier, data) => {
  const isNumeric = !isNaN(identifier) && !isNaN(parseFloat(identifier));
  const query = isNumeric
    ? `UPDATE quotations SET dp_bank_name = ?, dp_account_number = ?, dp_account_name = ?, dp_proof_url = ?, dp_amount = ?, dp_paid_at = NOW(), status = 'DP_DIBAYAR' WHERE id = ?`
    : `UPDATE quotations SET dp_bank_name = ?, dp_account_number = ?, dp_account_name = ?, dp_proof_url = ?, dp_amount = ?, dp_paid_at = NOW(), status = 'DP_DIBAYAR' WHERE nomor_pemesanan = ?`;

  const [result] = await db.query(query, [
    data.bank_name || null,
    data.account_number || null,
    data.account_name || null,
    data.proof_url || null,
    data.amount || null,
    identifier
  ]);
  return result.affectedRows;
};

// Jangan lupa mengekspor getById
module.exports = {
  create,
  getAll,
  getById,
  updatePenawaran,
  updateStatusManager,
  updateStatus,
  submitPDI,
  submitDeliveryOrder,
  confirmDelivery,
  createGuest,
  getByNomor,
  saveDPPayment,
};