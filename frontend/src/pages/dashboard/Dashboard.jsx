import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService } from '../../services/dashboard.service';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  Truck,
  ClipboardList,
  Clock,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Layers,
  ArrowUpRight,
  Package,
  Calendar,
  Sparkles,
} from 'lucide-react';

const STATUS_BADGE = {
  PENDING: { label: 'RFQ Baru (Pending)', bg: '#fef3c7', text: '#b45309', border: '#f59e0b' },
  MENUNGGU_APPROVAL: { label: 'Menunggu Approval', bg: '#e0e7ff', text: '#3730a3', border: '#818cf8' },
  APPROVED: { label: 'Disetujui (Menunggu DP)', bg: '#dcfce7', text: '#15803d', border: '#4ade80' },
  REJECTED: { label: 'Ditolak', bg: '#fee2e2', text: '#991b1b', border: '#f87171' },
  DP_DIBAYAR: { label: 'DP Masuk (Verifikasi)', bg: '#e0e7ff', text: '#4338ca', border: '#818cf8' },
  VERIFIKASI_DP_SALES: { label: 'DP Diverifikasi Sales', bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd' },
  PROSES_OPERASIONAL: { label: 'Proses PDI', bg: '#cffafe', text: '#0e7490', border: '#67e8f9' },
  SIAP_KIRIM: { label: 'PDI Lolos (Siap Kirim)', bg: '#dcfce7', text: '#15803d', border: '#86efac' },
  PENGIRIMAN: { label: 'Dalam Pengiriman', bg: '#fef9c3', text: '#a16207', border: '#facc15' },
  SELESAI: { label: 'Selesai (BAST Terbit)', bg: '#bbf7d0', text: '#166534', border: '#22c55e' },
};

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#06b6d4', '#ec4899'];

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const summary = await dashboardService.getSummary();
      setData(summary);
      setLastUpdated(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch pertama dan setup auto-polling realtime setiap 15 detik
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const stats = data?.statistik || {
    total_alat_berat: 0,
    total_alat_ready: 0,
    total_penawaran: 0,
    menunggu_aksi: 0,
    total_selesai: 0,
    total_pengguna: 0,
    total_revenue: 0,
  };

  const chartStatusData = data?.grafik_status && data.grafik_status.length > 0 
    ? data.grafik_status 
    : [
        { name: 'RFQ Baru (Pending)', jumlah: 0 },
        { name: 'Disetujui', jumlah: 0 },
        { name: 'Selesai', jumlah: 0 },
      ];

  const pieBrandData = data?.distribusi_brand && data.distribusi_brand.length > 0
    ? data.distribusi_brand
    : [{ name: 'Excavator', value: 1 }];

  const monthlyTrendData = data?.tren_bulanan && data.tren_bulanan.length > 0
    ? data.tren_bulanan
    : [
        { bulan: 'Bulan Ini', total_transaksi: stats.total_penawaran },
      ];

  const recentTransactions = data?.transaksi_terbaru || [];

  return (
    <div style={s.page}>
      {/* ── Header Dashboard & Realtime Bar ── */}
      <div style={s.header}>
        <div>
          <div style={s.liveBadge}>
            <span style={s.pulseDot} />
            <span style={s.liveText}>REALTIME MONITORING AKTIF (Setiap 15s)</span>
          </div>
          <h1 style={s.title}>
            Selamat Datang, {user?.name || user?.fullname || 'Pengguna'}!
          </h1>
          <p style={s.subtitle}>
            Pantau aktivitas pesanan RFQ, pergerakan unit alat berat, dan status transaksi secara langsung.
          </p>
        </div>

        <div style={s.headerActions}>
          <div style={s.timestampBox}>
            <Clock size={14} style={{ color: '#94a3b8' }} />
            <span>Update: <strong>{lastUpdated || 'Memuat...'} WIB</strong></span>
          </div>
          <button 
            onClick={() => fetchDashboardData(false)} 
            style={s.refreshBtn}
            disabled={refreshing}
            title="Refresh Data Sekarang"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
          </button>
        </div>
      </div>

      {/* ── Baris 1: 4 Kartu KPI Ringkasan ── */}
      <div style={s.kpiGrid}>
        {/* KPI 1: Total Pesanan RFQ */}
        <div style={{ ...s.kpiCard, borderLeft: '4px solid #f59e0b' }}>
          <div style={s.kpiHeader}>
            <span style={s.kpiLabel}>TOTAL TRANSAKSI / RFQ</span>
            <div style={{ ...s.kpiIconBox, backgroundColor: '#fef3c7', color: '#b45309' }}>
              <ClipboardList size={18} />
            </div>
          </div>
          <div style={s.kpiValueRow}>
            <span style={s.kpiNumber}>{stats.total_penawaran}</span>
            <span style={s.kpiUnit}>Dokumen</span>
          </div>
          <div style={s.kpiSubtext}>
            <TrendingUp size={13} style={{ color: '#10b981' }} />
            <span>Estimasi Nilai: Rp {(Number(stats.total_revenue || 0) / 1e6).toLocaleString('id-ID')} Jt</span>
          </div>
        </div>

        {/* KPI 2: Perlu Tindakan / Approval */}
        <div style={{ ...s.kpiCard, borderLeft: '4px solid #ef4444' }}>
          <div style={s.kpiHeader}>
            <span style={s.kpiLabel}>PERLU TINDAKAN (ACTION REQUIRED)</span>
            <div style={{ ...s.kpiIconBox, backgroundColor: '#fee2e2', color: '#dc2626' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={s.kpiValueRow}>
            <span style={{ ...s.kpiNumber, color: Number(stats.menunggu_aksi) > 0 ? '#dc2626' : '#0f172a' }}>
              {stats.menunggu_aksi}
            </span>
            <span style={s.kpiUnit}>Pesanan</span>
          </div>
          <div style={s.kpiSubtext}>
            <span>Menunggu approval / verifikasi DP</span>
          </div>
        </div>

        {/* KPI 3: Unit Excavator Ready */}
        <div style={{ ...s.kpiCard, borderLeft: '4px solid #10b981' }}>
          <div style={s.kpiHeader}>
            <span style={s.kpiLabel}>UNIT ALAT BERAT READY</span>
            <div style={{ ...s.kpiIconBox, backgroundColor: '#dcfce7', color: '#15803d' }}>
              <Truck size={18} />
            </div>
          </div>
          <div style={s.kpiValueRow}>
            <span style={s.kpiNumber}>{stats.total_alat_ready || stats.total_alat_berat}</span>
            <span style={s.kpiUnit}>Unit</span>
          </div>
          <div style={s.kpiSubtext}>
            <CheckCircle2 size={13} style={{ color: '#10b981' }} />
            <span>Total Unit: {stats.total_alat_berat} terdaftar di master</span>
          </div>
        </div>

        {/* KPI 4: Selesai & BAST Terbit */}
        <div style={{ ...s.kpiCard, borderLeft: '4px solid #3b82f6' }}>
          <div style={s.kpiHeader}>
            <span style={s.kpiLabel}>TRANSAKSI SELESAI (BAST)</span>
            <div style={{ ...s.kpiIconBox, backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div style={s.kpiValueRow}>
            <span style={s.kpiNumber}>{stats.total_selesai}</span>
            <span style={s.kpiUnit}>Unit Tiba</span>
          </div>
          <div style={s.kpiSubtext}>
            <span>Unit terverifikasi & diterima di lokasi</span>
          </div>
        </div>
      </div>

      {/* ── Baris 2: 2 Grafik Analytics Realtime ── */}
      <div style={s.chartsGrid}>
        {/* Grafik 1: Bar Chart Status Quotation */}
        <div style={s.chartCard}>
          <div style={s.chartHeader}>
            <div>
              <h3 style={s.chartTitle}>Distribusi Status Pesanan & Pipeline</h3>
              <p style={s.chartSub}>Jumlah quotation aktif pada setiap tahapan transaksi</p>
            </div>
            <span style={s.chartBadge}>Realtime</span>
          </div>

          <div style={{ width: '100%', height: 290 }}>
            <ResponsiveContainer>
              <BarChart data={chartStatusData} margin={{ top: 15, right: 15, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: '#e2e8f0' }} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: '600' }}
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ 
                    borderRadius: '10px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                    fontWeight: '700'
                  }} 
                />
                <Bar 
                  dataKey="jumlah" 
                  name="Jumlah Dokumen" 
                  fill="#f59e0b" 
                  radius={[6, 6, 0, 0]} 
                  barSize={34} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik 2: Donut Chart Distribusi Brand / Kategori */}
        <div style={s.chartCard}>
          <div style={s.chartHeader}>
            <div>
              <h3 style={s.chartTitle}>Distribusi Brand Alat Berat</h3>
              <p style={s.chartSub}>Komposisi inventori unit berdasarkan merek</p>
            </div>
            <span style={s.chartBadge}>Inventori</span>
          </div>

          <div style={{ width: '100%', height: 290 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieBrandData}
                  cx="50%"
                  cy="45%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieBrandData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px' 
                  }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Baris 3: Feed Transaksi & RFQ Terbaru Realtime ── */}
      <div style={s.recentCard}>
        <div style={s.recentHeader}>
          <div>
            <h3 style={s.chartTitle}>Pesanan & Pengajuan RFQ Terbaru (Live Feed)</h3>
            <p style={s.chartSub}>Daftar transaksi terkini dari pelanggan publik maupun internal</p>
          </div>
          <Link to="/transaksi" style={s.viewAllBtn}>
            <span>Lihat Semua Pesanan</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {recentTransactions.length > 0 ? (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr style={s.thRow}>
                  <th style={s.th}>NOMOR PESANAN</th>
                  <th style={s.th}>CUSTOMER / KONTRAKTOR</th>
                  <th style={s.th}>UNIT EXCAVATOR</th>
                  <th style={s.th}>SUMBER</th>
                  <th style={s.th}>ESTIMASI HARGA</th>
                  <th style={s.th}>STATUS TERKINI</th>
                  <th style={{ ...s.th, textAlign: 'right' }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((item) => {
                  const badge = STATUS_BADGE[item.status] || { label: item.status, bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
                  return (
                    <tr key={item.id} style={s.tr}>
                      <td style={s.tdNomor}>
                        <strong>{item.nomor_pemesanan}</strong>
                      </td>
                      <td style={s.td}>
                        <div style={s.custName}>{item.customer_name}</div>
                        <div style={s.custLoc}>{item.lokasi || '-'}</div>
                      </td>
                      <td style={s.td}>
                        <div style={s.unitName}>{item.unit_name}</div>
                        <div style={s.unitBrand}>{item.unit_brand || 'Excavator'}</div>
                      </td>
                      <td style={s.td}>
                        <span style={s.sourceTag}>
                          {item.sumber_pesanan === 'guest' ? '🌐 Guest RFQ' : '👤 Internal / Member'}
                        </span>
                      </td>
                      <td style={s.td}>
                        <strong style={{ color: '#059669' }}>
                          Rp {Number(item.nilai_transaksi || 0).toLocaleString('id-ID')}
                        </strong>
                      </td>
                      <td style={s.td}>
                        <span style={{
                          ...s.statusPill,
                          backgroundColor: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ ...s.td, textAlign: 'right' }}>
                        <Link to={`/transaksi/${item.id}`} style={s.detailLink}>
                          Buka Detail →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={s.emptyTransactions}>
            <Package size={36} style={{ color: '#94a3b8', marginBottom: '0.5rem' }} />
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
              Belum ada data transaksi yang tercatat di sistem.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const s = {
  page: {
    padding: '0 0 2rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.75rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  liveBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    padding: '0.2rem 0.65rem',
    borderRadius: '999px',
    marginBottom: '0.5rem',
  },
  pulseDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.25)',
  },
  liveText: {
    fontSize: '0.68rem',
    fontWeight: '800',
    color: '#065f46',
    letterSpacing: '0.8px',
  },
  title: {
    fontSize: '1.55rem',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 0.25rem',
    fontFamily: "'Outfit', sans-serif",
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: '0.88rem',
    color: '#64748b',
    margin: 0,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  timestampBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.78rem',
    color: '#64748b',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    padding: '0.5rem 0.8rem',
    borderRadius: '8px',
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.55rem 0.95rem',
    backgroundColor: '#0f172a',
    color: '#fbbf24',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)',
    transition: 'all 0.15s',
  },
  // KPI Grid
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '1.25rem',
    marginBottom: '1.75rem',
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '1.35rem 1.25rem',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  kpiLabel: {
    fontSize: '0.68rem',
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: '1px',
  },
  kpiIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '7px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.35rem',
    marginBottom: '0.4rem',
  },
  kpiNumber: {
    fontSize: '1.85rem',
    fontWeight: '900',
    color: '#0f172a',
    fontFamily: "'Outfit', sans-serif",
    lineHeight: 1,
  },
  kpiUnit: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    fontWeight: '600',
  },
  kpiSubtext: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.74rem',
    color: '#64748b',
    fontWeight: '600',
  },
  // Charts Grid
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1.35fr 1fr',
    gap: '1.5rem',
    marginBottom: '1.75rem',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.25rem',
  },
  chartTitle: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 0.15rem',
  },
  chartSub: {
    fontSize: '0.76rem',
    color: '#64748b',
    margin: 0,
  },
  chartBadge: {
    fontSize: '0.66rem',
    fontWeight: '800',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    letterSpacing: '0.5px',
  },
  // Recent Transactions Card
  recentCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
  },
  recentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
    paddingBottom: '0.85rem',
    borderBottom: '1px solid #f1f5f9',
  },
  viewAllBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#d97706',
    textDecoration: 'none',
  },
  tableWrap: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.84rem',
  },
  thRow: {
    borderBottom: '1.5px solid #e2e8f0',
  },
  th: {
    padding: '0.6rem 0.75rem',
    fontSize: '0.68rem',
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: '0.8px',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  tdNomor: {
    padding: '0.85rem 0.75rem',
    color: '#0f172a',
    fontFamily: 'monospace',
    fontSize: '0.88rem',
  },
  td: {
    padding: '0.85rem 0.75rem',
    color: '#334155',
  },
  custName: {
    fontWeight: '700',
    color: '#0f172a',
  },
  custLoc: {
    fontSize: '0.72rem',
    color: '#94a3b8',
    marginTop: '0.1rem',
  },
  unitName: {
    fontWeight: '700',
    color: '#0f172a',
  },
  unitBrand: {
    fontSize: '0.72rem',
    color: '#64748b',
  },
  sourceTag: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#475569',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
  },
  statusPill: {
    display: 'inline-block',
    fontSize: '0.7rem',
    fontWeight: '800',
    padding: '0.2rem 0.55rem',
    borderRadius: '6px',
    whiteSpace: 'nowrap',
  },
  detailLink: {
    display: 'inline-block',
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#2563eb',
    textDecoration: 'none',
    padding: '0.3rem 0.65rem',
    backgroundColor: '#eff6ff',
    borderRadius: '6px',
  },
  emptyTransactions: {
    textAlign: 'center',
    padding: '3rem 1rem',
  },
};

export default Dashboard;