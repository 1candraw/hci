const db = require('../config/database');

const create = async (data) => {
  const { customer_id, alat_berat_id, catatan } = data;
  const [result] = await db.query(
    `INSERT INTO quotations (customer_id, alat_berat_id, catatan) VALUES (?, ?, ?)`,
    [customer_id, alat_berat_id, catatan]
  );
  return result.insertId;
};

const updateBySales = async (id, data) => {
  const { sales_id, harga_penawaran, ongkos_kirim, diskon } = data;
  await db.query(
    `UPDATE quotations 
     SET sales_id = ?, harga_penawaran = ?, ongkos_kirim = ?, diskon = ?, status = 'MENUNGGU_APPROVAL' 
     WHERE id = ?`,
    [sales_id, harga_penawaran, ongkos_kirim, diskon, id]
  );
};

const updateStatusByManager = async (id, data) => {
  const { manager_id, status } = data;
  await db.query(
    `UPDATE quotations SET manager_id = ?, status = ? WHERE id = ?`,
    [manager_id, status, id]
  );
};

const updateStatusByOperasional = async (id, status) => {
  await db.query(
    `UPDATE quotations SET status = ? WHERE id = ?`,
    [status, id]
  );
};

const findAll = async () => {
  // Melakukan JOIN agar data yang tampil lengkap dengan nama user dan nama alat
  const [rows] = await db.query(`
    SELECT q.*, u.fullname as customer_name, a.name as alat_name, a.brand 
    FROM quotations q
    JOIN users u ON q.customer_id = u.id
    JOIN alat_berat a ON q.alat_berat_id = a.id
    ORDER BY q.created_at DESC
  `);
  return rows;
};

module.exports = { create, updateBySales, updateStatusByManager, findAll, updateStatusByOperasional };