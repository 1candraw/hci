const db = require('../config/database');

// 1. Ambil ringkasan statistik angka utama (Metrics Realtime)
const getStats = async () => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM alat_berat) AS total_alat_berat,
      (SELECT COUNT(*) FROM alat_berat WHERE status_approval = 'approved') AS total_alat_ready,
      (SELECT COUNT(*) FROM quotations) AS total_penawaran,
      (SELECT COUNT(*) FROM quotations WHERE status IN ('PENDING', 'MENUNGGU_APPROVAL', 'DP_DIBAYAR', 'VERIFIKASI_DP_SALES')) AS menunggu_aksi,
      (SELECT COUNT(*) FROM quotations WHERE status = 'SELESAI') AS total_selesai,
      (SELECT COUNT(*) FROM quotations WHERE status = 'PENGIRIMAN') AS total_pengiriman,
      (SELECT COUNT(*) FROM users) AS total_pengguna,
      (
        SELECT COALESCE(SUM(COALESCE(harga_penawaran, 0) + COALESCE(ongkos_kirim, 0) - COALESCE(diskon, 0)), 0) 
        FROM quotations 
        WHERE status IN ('DP_DIBAYAR', 'VERIFIKASI_DP_SALES', 'PROSES_OPERASIONAL', 'SIAP_KIRIM', 'PENGIRIMAN', 'SELESAI')
      ) AS total_revenue
  `;
  const [rows] = await db.query(query);
  return rows[0];
};

// 2. Ambil distribusi status quotation (Untuk Bar / Area Chart Realtime)
const getStatusDistribution = async () => {
  const query = `
    SELECT 
      status, 
      COUNT(*) AS jumlah 
    FROM quotations 
    GROUP BY status
  `;
  const [rows] = await db.query(query);

  // Mapping ke label yang ramah pengguna
  const statusLabels = {
    PENDING: 'RFQ Baru (Pending)',
    MENUNGGU_APPROVAL: 'Menunggu Approval',
    APPROVED: 'Disetujui (Menunggu DP)',
    REJECTED: 'Ditolak',
    DP_DIBAYAR: 'DP Masuk',
    VERIFIKASI_DP_SALES: 'Verifikasi DP Sales',
    PROSES_OPERASIONAL: 'Inspeksi PDI',
    SIAP_KIRIM: 'Siap Kirim',
    PENGIRIMAN: 'Dalam Pengiriman',
    SELESAI: 'Selesai (BAST)',
  };

  return rows.map((r) => ({
    status: r.status,
    name: statusLabels[r.status] || r.status,
    jumlah: Number(r.jumlah),
  }));
};

// 3. Ambil distribusi unit berdasarkan Brand & Kategori (Untuk Pie / Donut Chart Realtime)
const getBrandDistribution = async () => {
  const query = `
    SELECT 
      COALESCE(brand, 'Lainnya') AS name, 
      COUNT(*) AS value 
    FROM alat_berat 
    GROUP BY brand
  `;
  const [rows] = await db.query(query);
  return rows.map((r) => ({
    name: r.name,
    value: Number(r.value),
  }));
};

// 4. Ambil distribusi unit berdasarkan Kelas Tonase
const getTonaseDistribution = async () => {
  const query = `
    SELECT 
      CONCAT('Kelas ', COALESCE(kapasitas_ton, 5), ' Ton') AS name, 
      COUNT(*) AS value 
    FROM alat_berat 
    GROUP BY kapasitas_ton
  `;
  const [rows] = await db.query(query);
  return rows.map((r) => ({
    name: r.name,
    value: Number(r.value),
  }));
};

// 5. Ambil 5 Transaksi / RFQ Terbaru (Live Feed Realtime)
const getRecentTransactions = async () => {
  const query = `
    SELECT 
      q.id,
      COALESCE(q.nomor_pemesanan, CONCAT('Q-', LPAD(q.id, 3, '0'))) AS nomor_pemesanan,
      COALESCE(q.guest_company, u.fullname, q.guest_name, 'Guest RFQ') AS customer_name,
      COALESCE(q.guest_location, q.catatan, '-') AS lokasi,
      a.name AS unit_name,
      a.brand AS unit_brand,
      q.status,
      q.sumber_pesanan,
      COALESCE(q.harga_penawaran, a.harga, 0) AS nilai_transaksi,
      q.created_at
    FROM quotations q
    LEFT JOIN users u ON q.customer_id = u.id
    LEFT JOIN alat_berat a ON q.alat_berat_id = a.id
    ORDER BY q.created_at DESC
    LIMIT 6
  `;
  const [rows] = await db.query(query);
  return rows;
};

// 6. Tren Transaksi Bulanan (6 Bulan Terakhir)
const getMonthlyTrend = async () => {
  const query = `
    SELECT 
      DATE_FORMAT(created_at, '%b %Y') AS bulan,
      COUNT(*) AS total_transaksi,
      COALESCE(SUM(COALESCE(harga_penawaran, 0)), 0) AS total_nilai
    FROM quotations
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b %Y')
    ORDER BY DATE_FORMAT(created_at, '%Y-%m') ASC
  `;
  const [rows] = await db.query(query);
  return rows;
};

module.exports = {
  getStats,
  getStatusDistribution,
  getBrandDistribution,
  getTonaseDistribution,
  getRecentTransactions,
  getMonthlyTrend,
};