const alatBeratRepository = require('../repositories/alatBerat.repository');
const { calculateSAW } = require('../utils/sawCalculator');

const getRecommendations = async (customWeights) => {
  // 1. Ambil data alat berat kategori 'saw'
  const alternatives = await alatBeratRepository.findAll('saw');
  
  if (alternatives.length === 0) {
    throw new Error('Belum ada data alat berat dengan tipe katalog "saw" di database.');
  }

  // 2. Tentukan bobot default jika user tidak mengirimkan bobot dari frontend
  // Total penjumlahan c1 sampai c5 wajib bernilai 1
  const weights = customWeights || {
    c1: 0.30, // Bobot Harga 30%
    c2: 0.20, // Bobot Tenaga Mesin 20%
    c3: 0.20, // Bobot Kapasitas Bucket 20%
    c4: 0.15, // Bobot Kedalaman Gali 15%
    c5: 0.15  // Bobot Berat Operasional 15%
  };

  // 3. Jalankan kalkulator SAW dengan 5 kriteria
  const rankedResults = calculateSAW(alternatives, weights);
  
  return {
    bobot_yang_digunakan: weights,
    rekomendasi: rankedResults
  };
};

module.exports = { getRecommendations };