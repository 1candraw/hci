import { useAuth } from '../../hooks/useAuth'; // Sesuaikan letak import ini jika berbeda
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();

  // Data Dummy untuk Kartu Ringkasan
  const summaryStats = {
    totalAlat: 12,
    totalPenawaran: 28,
    menungguApproval: 3,
    totalCustomer: 45
  };

  // Data Dummy untuk Grafik Batang (Status Dokumen)
  const chartData = [
    { name: 'Pending', jumlah: 5 },
    { name: 'Menunggu Approval', jumlah: 3 },
    { name: 'Approved', jumlah: 8 },
    { name: 'Pengiriman', jumlah: 2 },
    { name: 'Selesai', jumlah: 10 },
  ];

  // Data Dummy untuk Grafik Lingkaran (Kategori Alat)
  const pieData = [
    { name: 'Excavator', value: 8 },
    { name: 'Bulldozer', value: 2 },
    { name: 'Wheel Loader', value: 2 },
  ];
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Selamat Datang, {user?.fullname || 'Pengguna'}! 👋</h2>
        <p style={styles.subtitle}>Ringkasan aktivitas sistem heavy care.id hari ini.</p>
      </div>

      {/* Baris 1: Kartu Ringkasan */}
      <div style={styles.cardsWrapper}>
        <div style={{ ...styles.card, borderLeft: '4px solid #3b82f6' }}>
          <h3 style={styles.cardTitle}>Total Alat Berat</h3>
          <p style={styles.cardNumber}>{summaryStats.totalAlat} <span style={styles.cardUnit}>Unit</span></p>
        </div>
        <div style={{ ...styles.card, borderLeft: '4px solid #10b981' }}>
          <h3 style={styles.cardTitle}>Total Penawaran</h3>
          <p style={styles.cardNumber}>{summaryStats.totalPenawaran} <span style={styles.cardUnit}>Dokumen</span></p>
        </div>
        <div style={{ ...styles.card, borderLeft: '4px solid #f59e0b' }}>
          <h3 style={styles.cardTitle}>Menunggu Approval</h3>
          <p style={styles.cardNumber}>{summaryStats.menungguApproval} <span style={styles.cardUnit}>Dokumen</span></p>
        </div>
        <div style={{ ...styles.card, borderLeft: '4px solid #8b5cf6' }}>
          <h3 style={styles.cardTitle}>Total Pelanggan</h3>
          <p style={styles.cardNumber}>{summaryStats.totalCustomer} <span style={styles.cardUnit}>User</span></p>
        </div>
      </div>

      {/* Baris 2: Grafik Analytics */}
      <div style={styles.chartsWrapper}>
        
        {/* Grafik Batang */}
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>Statistik Status Quotation</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="jumlah" name="Jumlah Dokumen" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik Lingkaran */}
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>Distribusi Kategori Alat</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

// Styling
const styles = {
  container: { padding: '1.5rem' },
  header: { marginBottom: '2rem' },
  title: { margin: '0 0 0.5rem 0', color: '#1f2937', fontSize: '1.8rem' },
  subtitle: { margin: 0, color: '#6b7280' },
  cardsWrapper: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
  card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  cardTitle: { margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.9rem', fontWeight: '600' },
  cardNumber: { margin: 0, color: '#111827', fontSize: '2rem', fontWeight: 'bold' },
  cardUnit: { fontSize: '1rem', color: '#9ca3af', fontWeight: 'normal' },
  chartsWrapper: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' },
  chartBox: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  chartTitle: { margin: '0 0 1.5rem 0', color: '#374151', fontSize: '1.1rem' }
};

export default Dashboard;