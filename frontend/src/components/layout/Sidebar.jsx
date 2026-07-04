import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <aside style={styles.sidebar}>
      <div style={styles.menuContainer}>
        <h3 style={styles.menuTitle}>Menu Utama</h3>
        <ul style={styles.menuList}>
          {/* Menu untuk semua orang */}
          <li>
            <Link to="/" style={location.pathname === '/' ? styles.activeLink : styles.link}>
              📊 Dashboard Analytics
            </Link>
          </li>
          <li>
            <Link to="/katalog" style={location.pathname === '/katalog' ? styles.activeLink : styles.link}>
              🚜 Katalog Alat Berat
            </Link>
          </li>
          
          {/* Menu khusus berdasarkan Role */}
          {(user?.role === 'Manager' || user?.role === 'Sales') && (
            <li>
              <Link to="/saw" style={location.pathname === '/saw' ? styles.activeLink : styles.link}>
                🧮 Analisis SAW
              </Link>
            </li>
          )}

          <li>
            <Link to="/transaksi" style={location.pathname === '/transaksi' ? styles.activeLink : styles.link}>
              📝 Transaksi & Quotation
            </Link>
          </li>

          <li>
            {/* Tambahkan ini di bawah menu transaksi atau laporan */}
            <Link to="/audit-log" style={location.pathname === '/audit-log' ? styles.activeLink : styles.link}>
              <span style={{ marginRight: '10px' }}>📋</span>
              Audit Log
                </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: { width: '250px', backgroundColor: '#1f2937', color: 'white', height: '100%', padding: '1rem 0' },
  menuContainer: { padding: '0 1rem' },
  menuTitle: { fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1px' },
  menuList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  link: { display: 'block', padding: '0.75rem 1rem', color: '#d1d5db', textDecoration: 'none', borderRadius: '6px', transition: 'background 0.2s' },
  activeLink: { display: 'block', padding: '0.75rem 1rem', color: 'white', textDecoration: 'none', backgroundColor: '#374151', borderRadius: '6px', fontWeight: 'bold' }
};

export default Sidebar;