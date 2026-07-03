const dashboardRepository = require('../repositories/dashboard.repository');
const sawService = require('./saw.service'); // Kita panggil lagi otak SAW-nya

const getDashboardSummary = async () => {
  // 1. Ambil angka statistik dasar
  const stats = await dashboardRepository.getStats();

  // 2. Ambil 3 rekomendasi alat berat terbaik dari perhitungan SAW
  let topRekomendasi = [];
  try {
    const sawData = await sawService.getRecommendations();
    // Gunakan fungsi .slice(0, 3) untuk mengambil juara 1, 2, dan 3 saja
    topRekomendasi = sawData.rekomendasi.slice(0, 3).map(item => ({
      peringkat: topRekomendasi.length + 1, // Penomoran otomatis
      nama: item.name,
      skor: item.skor_akhir
    }));
  } catch (error) {
    // Jika data SAW belum cukup, biarkan array topRekomendasi kosong 
    // agar dashboard tidak ikut error/crash
    console.error("Info: Belum ada data SAW untuk ditampilkan di dashboard.");
  }

  // 3. Kembalikan semua data dalam satu paket rapi
  return {
    statistik: stats,
    top_unggulan: topRekomendasi
  };
};

module.exports = { getDashboardSummary };