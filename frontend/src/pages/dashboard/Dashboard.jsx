import { useAuth } from '../../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.greeting}>Selamat datang kembali, {user?.name}! 👋</h2>
        <p style={styles.subtitle}>Berikut adalah ringkasan sistem heavy care.id hari ini.</p>
      </div>

      {/* Kartu Ringkasan (Summary Cards) */}
      <div style={styles.cardContainer}>
        <div style={{ ...styles.card, borderTop: '4px solid #3b82f6' }}>
          <h3 style={styles.cardTitle}>Total Alat Berat</h3>
          <p style={styles.cardNumber}>24 Unit</p>
        </div>
        <div style={{ ...styles.card, borderTop: '4px solid #10b981' }}>
          <h3 style={styles.cardTitle}>Quotation Aktif</h3>
          <p style={styles.cardNumber}>8 Dokumen</p>
        </div>
        <div style={{ ...styles.card, borderTop: '4px solid #f59e0b' }}>
          <h3 style={styles.cardTitle}>Menunggu Approval</h3>
          <p style={styles.cardNumber}>3 Permintaan</p>
        </div>
        <div style={{ ...styles.card, borderTop: '4px solid #ef4444' }}>
          <h3 style={styles.cardTitle}>Proses Pengiriman</h3>
          <p style={styles.cardNumber}>2 Unit</p>
        </div>
      </div>

      {/* Area Aktivitas / Log */}
      <div style={styles.bottomSection}>
        <div style={styles.activityBox}>
          <h3 style={styles.sectionTitle}>Aktivitas Terbaru</h3>
          <ul style={styles.activityList}>
            <li style={styles.activityItem}>
              <span style={styles.dotManager}></span> Manager menyetujui Quotation #102
              <span style={styles.time}>10 mnt lalu</span>
            </li>
            <li style={styles.activityItem}>
              <span style={styles.dotSales}></span> Sales memperbarui harga Excavator PC200
              <span style={styles.time}>1 jam lalu</span>
            </li>
            <li style={styles.activityItem}>
              <span style={styles.dotCust}></span> Budi Pelanggan mengajukan permintaan baru
              <span style={styles.time}>3 jam lalu</span>
            </li>
          </ul>
        </div>

        <div style={styles.infoBox}>
          <h3 style={styles.sectionTitle}>Status Sistem</h3>
          <div style={styles.statusItem}>
            <span>Koneksi Database</span>
            <span style={styles.badgeGreen}>Online</span>
          </div>
          <div style={styles.statusItem}>
            <span>Algoritma SAW</span>
            <span style={styles.badgeGreen}>Aktif</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styling UI
const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  header: { marginBottom: '0.5rem' },
  greeting: { fontSize: '1.5rem', color: '#1f2937', margin: '0 0 0.5rem 0' },
  subtitle: { color: '#6b7280', margin: 0 },
  
  cardContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' },
  card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  cardTitle: { fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0', fontWeight: '600' },
  cardNumber: { fontSize: '1.875rem', color: '#111827', margin: 0, fontWeight: 'bold' },

  bottomSection: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' },
  activityBox: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  infoBox: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  sectionTitle: { fontSize: '1.125rem', color: '#374151', margin: '0 0 1.25rem 0' },
  
  activityList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' },
  activityItem: { display: 'flex', alignItems: 'center', fontSize: '0.9rem', color: '#4b5563' },
  dotManager: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', marginRight: '10px' },
  dotSales: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6', marginRight: '10px' },
  dotCust: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b', marginRight: '10px' },
  time: { marginLeft: 'auto', fontSize: '0.8rem', color: '#9ca3af' },

  statusItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb', fontSize: '0.9rem', color: '#4b5563' },
  badgeGreen: { backgroundColor: '#d1fae5', color: '#065f46', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }
};

export default Dashboard;