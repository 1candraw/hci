const db = require('../config/database'); 

/**
 * Mengambil data alat berat dari database
 * @param {string} tipeKatalog - Kategori sistem (misal: 'saw' atau 'umum')
 * @param {string} filterKapasitas - 'Semua', '5', '20', atau '30'
 */
const findAll = async (tipeKatalog, filterKapasitas) => {
  // Query disesuaikan persis dengan kolom di tabel alat_berat milikmu
  let query = `
    SELECT 
      id, 
      name, 
      brand, 
      model,
      harga, 
      tenaga_mesin, 
      kapasitas_bucket, 
      kedalaman_gali, 
      berat_operasional, 
      kapasitas_ton 
    FROM alat_berat 
    WHERE tipe_katalog = ?
  `;
  
  // Parameter pertama pasti 'saw' sesuai lemparan dari service
  const queryParams = [tipeKatalog]; 

  // Terapkan Filter Tonase (jika user memilih kelas spesifik)
  if (filterKapasitas && filterKapasitas !== 'Semua') {
    query += " AND kapasitas_ton = ?";
    queryParams.push(filterKapasitas);
  }

  // Eksekusi query
  const [rows] = await db.query(query, queryParams);
  return rows;
};

module.exports = {
  findAll
};