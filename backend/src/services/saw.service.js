const alatBeratRepository = require('../repositories/alatBerat.repository');
const { calculateSAW } = require('../utils/sawCalculator');
// Tambahkan import koneksi database kamu di sini (sesuaikan path-nya)
// Contoh: const db = require('../config/database'); 
const db = require('../config/database'); 

const getRecommendations = async ({ userId, filterKapasitas, normalizedWeights, rawWeights }) => {
  // 1. Ambil data alat berat kategori 'saw' yang SUDAH DIFILTER berdasarkan kelas/tonase
  // Nanti kita akan perbarui repository ini agar bisa menerima filterKapasitas
  const alternatives = await alatBeratRepository.findAll('saw', filterKapasitas);
  
  if (alternatives.length === 0) {
    throw new Error('Tidak ada data mesin yang sesuai dengan kelas kapasitas tersebut.');
  }

  // 2. Tentukan bobot. Jika frontend mengirim data (normalizedWeights ada isinya), gunakan itu. 
  // Jika kosong, gunakan default 
  const weights = normalizedWeights || {
    c1: 0.30, // Bobot Harga 30%
    c2: 0.20, // Bobot Tenaga Mesin 20%
    c3: 0.20, // Bobot Kapasitas Bucket 20%
    c4: 0.15, // Bobot Kedalaman Gali 15%
    c5: 0.15  // Bobot Berat Operasional 15%
  };

  // 3. Jalankan kalkulator SAW (Otak Matematika)
  const rankedResults = calculateSAW(alternatives, weights);
  
  // =========================================================================
  // 4. PROSES PENYIMPANAN RIWAYAT (REKAM JEJAK) KE DATABASE
  // =========================================================================
  let sessionId = null;

  try {
    // Siapkan data bobot mentah (skala 1-5). Jika kosong, asumsikan nilai tengah (3)
    const sessionWeights = rawWeights || {
      harga_weight: 3, tenaga_mesin_weight: 3, kapasitas_bucket_weight: 3, 
      kedalaman_gali_weight: 3, berat_operasional_weight: 3
    };

    // A. Simpan data sesi ke tabel saw_sessions
    const querySession = `
      INSERT INTO saw_sessions 
      (user_id, harga_weight, tenaga_mesin_weight, kapasitas_bucket_weight, kedalaman_gali_weight, berat_operasional_weight)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [sessionResult] = await db.query(querySession, [
      userId || null, 
      sessionWeights.harga_weight, 
      sessionWeights.tenaga_mesin_weight, 
      sessionWeights.kapasitas_bucket_weight, 
      sessionWeights.kedalaman_gali_weight, 
      sessionWeights.berat_operasional_weight
    ]);
    sessionId = sessionResult.insertId;

    // B. Simpan data peringkat mesin ke tabel saw_results
    const queryResults = `
      INSERT INTO saw_results (saw_session_id, alat_berat_id, score, ranking)
      VALUES ?
    `;
    
    // Siapkan array multi-dimensi untuk bulk insert
    const resultValues = rankedResults.map((mesin, index) => [
      sessionId,
      mesin.id,
      mesin.skor_akhir, // Pastikan utils kalkulatormu menghasilkan key 'skor_akhir'
      index + 1 // Ranking
    ]);

    if (resultValues.length > 0) {
      await db.query(queryResults, [resultValues]);
    }
  } catch (dbError) {
    console.error("Gagal menyimpan riwayat SAW ke database:", dbError);
    // Catatan: Kita tidak melempar error (throw) di sini agar jika DB riwayat gagal, 
    // user tetap bisa melihat hasil kalkulasinya di layar.
  }
  
  // 5. Kembalikan data lengkap ke Controller
  return {
    session_id: sessionId,
    bobot_yang_digunakan: weights,
    rekomendasi: rankedResults
  };
};

module.exports = { getRecommendations };