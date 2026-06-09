const db = require('../config/database');

const findAll = async (tipe_katalog) => {
  let query = 'SELECT * FROM alat_berat';
  const params = [];

  // Jika ada filter tipe_katalog ('saw' atau 'umum')
  if (tipe_katalog) {
    query += ' WHERE tipe_katalog = ?';
    params.push(tipe_katalog);
  }

  const [rows] = await db.query(query, params);
  return rows;
};

const create = async (data) => {
  const {
    kategori_id, tipe_katalog, name, brand, model,
    harga, tenaga_mesin, kapasitas_bucket, kedalaman_gali,
    berat_operasional, stock, description
  } = data;

  const [result] = await db.query(
    `INSERT INTO alat_berat 
    (kategori_id, tipe_katalog, name, brand, model, harga, tenaga_mesin, kapasitas_bucket, kedalaman_gali, berat_operasional, stock, description) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [kategori_id, tipe_katalog, name, brand, model, harga, tenaga_mesin, kapasitas_bucket, kedalaman_gali, berat_operasional, stock, description]
  );
  
  return result.insertId;
};

module.exports = {
  findAll,
  create
};