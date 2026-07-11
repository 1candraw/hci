import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav style={styles.navbar}>
      <div style={styles.brand}>
        <strong>Heavy Care ID</strong>
      </div>
      <div style={styles.userMenu}>
        <span style={styles.userInfo}>
          Halo, {user?.name} ({user?.role})
        </span>
        <button onClick={logout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </nav>
  );
};

const styles = {
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' },
  brand: { fontSize: '1.25rem', color: '#2563eb' },
  userMenu: { display: 'flex', alignItems: 'center', gap: '1rem' },
  userInfo: { fontSize: '0.9rem', color: '#4b5563' },
  logoutBtn: { padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }
};

export default Navbar;