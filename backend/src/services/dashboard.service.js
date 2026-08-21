const dashboardRepository = require('../repositories/dashboard.repository');
const sawService = require('./saw.service');

const getDashboardSummary = async () => {
  // 1. Ambil seluruh data statistik realtime dari database
  const [
    stats,
    statusDist,
    brandDist,
    tonaseDist,
    recentTransactions,
    monthlyTrend,
  ] = await Promise.all([
    dashboardRepository.getStats(),
    dashboardRepository.getStatusDistribution(),
    dashboardRepository.getBrandDistribution(),
    dashboardRepository.getTonaseDistribution(),
    dashboardRepository.getRecentTransactions(),
    dashboardRepository.getMonthlyTrend(),
  ]);

  // 2. Ambil 3 rekomendasi alat berat terbaik dari perhitungan SAW jika ada
  let topRekomendasi = [];
  try {
    const sawData = await sawService.getRecommendations();
    if (sawData && sawData.rekomendasi) {
      topRekomendasi = sawData.rekomendasi.slice(0, 3).map((item, index) => ({
        peringkat: index + 1,
        nama: item.name || item.nama_unit,
        brand: item.brand,
        skor: Number(item.skor_akhir || 0).toFixed(4),
        harga: item.harga,
      }));
    }
  } catch (error) {
    // Silent fallback jika belum ada data SAW
  }

  // 3. Kembalikan data lengkap untuk konsol analitik realtime
  return {
    statistik: stats,
    grafik_status: statusDist,
    distribusi_brand: brandDist,
    distribusi_tonase: tonaseDist,
    transaksi_terbaru: recentTransactions,
    tren_bulanan: monthlyTrend,
    top_unggulan: topRekomendasi,
    last_updated: new Date().toISOString(),
  };
};

module.exports = { getDashboardSummary };