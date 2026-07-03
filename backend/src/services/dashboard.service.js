const dashboardRepository = require('../repositories/dashboard.repository');
const sawService = require('./saw.service');

const getDashboardSummary = async () => {
  // 1. Ambil angka statistik dasar
  const stats = await dashboardRepository.getStats();

  // 2. Ambil 3 rekomendasi alat berat terbaik dari perhitungan SAW
  let topRekomendasi = [];
  try {
    const sawData = await sawService.getRecommendations();
    
    // Perbaikan: Tambahkan parameter 'index' di dalam .map()
    topRekomendasi = sawData.rekomendasi.slice(0, 3).map((item, index) => ({
      peringkat: index + 1, // Sekarang urutannya pasti benar (1, 2, 3)
      nama: item.name,
      skor: item.skor_akhir
    }));
  } catch (error) {
    console.error("Info: Belum ada data SAW untuk ditampilkan di dashboard.");
  }

  // 3. Kembalikan semua data dalam satu paket rapi
  return {
    statistik: stats,
    top_unggulan: topRekomendasi
  };
};

module.exports = { getDashboardSummary };