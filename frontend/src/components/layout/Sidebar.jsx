import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Truck,
  ClipboardList,
  SlidersHorizontal,
  Wrench,
  ChevronRight,
  Activity,
  UserCog
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isCurrent = (path) => location.pathname === path || (path === '/profile' && location.pathname === '/pengaturan-profil');

  return (
    <aside style={styles.sidebar}>
      {/* Brand Header */}
      <div style={styles.brandHeader}>
        <div style={styles.brandIconBox}>
          <span style={styles.brandLetter}>H</span>
        </div>
        <div>
          <div style={styles.brandTitle}>
            HEAVY<span style={styles.brandTitleAccent}>CARE</span><span style={{ color: '#74c02c' }}>.ID</span>
          </div>
          <div style={styles.brandTag}>INTERNAL ENTERPRISE</div>
        </div>
      </div>

      {/* Nav Menu */}
      <div style={styles.menuScrollArea}>
        <div style={styles.sectionHeading}>
          <span>MENU UTAMA</span>
        </div>

        <ul style={styles.menuList}>
          <li>
            <Link to="/dashboard" style={isCurrent('/dashboard') ? styles.activeLink : styles.link}>
              <LayoutDashboard size={18} strokeWidth={isCurrent('/dashboard') ? 2.2 : 1.75} style={isCurrent('/dashboard') ? styles.activeIcon : styles.icon} />
              <span style={styles.linkText}>Dashboard</span>
              {isCurrent('/dashboard') && <ChevronRight size={14} style={styles.chevron} />}
            </Link>
          </li>
          <li>
            <Link to="/katalog" style={isCurrent('/katalog') ? styles.activeLink : styles.link}>
              <Truck size={18} strokeWidth={isCurrent('/katalog') ? 2.2 : 1.75} style={isCurrent('/katalog') ? styles.activeIcon : styles.icon} />
              <span style={styles.linkText}>Katalog Unit</span>
              {isCurrent('/katalog') && <ChevronRight size={14} style={styles.chevron} />}
            </Link>
          </li>
          <li>
            <Link to="/transaksi" style={isCurrent('/transaksi') ? styles.activeLink : styles.link}>
              <ClipboardList size={18} strokeWidth={isCurrent('/transaksi') ? 2.2 : 1.75} style={isCurrent('/transaksi') ? styles.activeIcon : styles.icon} />
              <span style={styles.linkText}>Daftar Pesanan (RFQ)</span>
              {isCurrent('/transaksi') && <ChevronRight size={14} style={styles.chevron} />}
            </Link>
          </li>
          <li>
            <Link to="/saw" style={isCurrent('/saw') ? styles.activeLink : styles.link}>
              <SlidersHorizontal size={18} strokeWidth={isCurrent('/saw') ? 2.2 : 1.75} style={isCurrent('/saw') ? styles.activeIcon : styles.icon} />
              <span style={styles.linkText}>Rekomendasi SAW</span>
              {isCurrent('/saw') && <ChevronRight size={14} style={styles.chevron} />}
            </Link>
          </li>
          <li>
            <Link to="/profile" style={isCurrent('/profile') ? styles.activeLink : styles.link}>
              <UserCog size={18} strokeWidth={isCurrent('/profile') ? 2.2 : 1.75} style={isCurrent('/profile') ? styles.activeIcon : styles.icon} />
              <span style={styles.linkText}>Pengaturan Profil</span>
              {isCurrent('/profile') && <ChevronRight size={14} style={styles.chevron} />}
            </Link>
          </li>
        </ul>

        {/* INVENTORY & MANAGEMENT */}
        {(user?.role === 'Manager' || user?.role === 'Sales') && (
          <>
            <div style={styles.sectionHeading}>
              <span>MANAJEMEN ALAT</span>
            </div>
            <ul style={styles.menuList}>
              <li>
                <Link to="/master-alat-berat" style={isCurrent('/master-alat-berat') ? styles.activeLink : styles.link}>
                  <Wrench size={18} strokeWidth={isCurrent('/master-alat-berat') ? 2.2 : 1.75} style={isCurrent('/master-alat-berat') ? styles.activeIcon : styles.icon} />
                  <span style={styles.linkText}>Kelola Master Unit</span>
                  {isCurrent('/master-alat-berat') && <ChevronRight size={14} style={styles.chevron} />}
                </Link>
              </li>
            </ul>
          </>
        )}

        {/* SECURITY & AUDIT */}
        {(user?.role === 'Manager' || user?.role === 'Operasional') && (
          <>
            <div style={styles.sectionHeading}>
              <span>SISTEM & AUDIT</span>
            </div>
            <ul style={styles.menuList}>
              <li>
                <Link to="/audit-log" style={isCurrent('/audit-log') ? styles.activeLink : styles.link}>
                  <Activity size={18} strokeWidth={isCurrent('/audit-log') ? 2.2 : 1.75} style={isCurrent('/audit-log') ? styles.activeIcon : styles.icon} />
                  <span style={styles.linkText}>Audit Log Aktivitas</span>
                  {isCurrent('/audit-log') && <ChevronRight size={14} style={styles.chevron} />}
                </Link>
              </li>
            </ul>
          </>
        )}
      </div>

      {/* Footer Info Box */}
      <div style={styles.sidebarFooter}>
        <div style={styles.statusBox}>
          <div style={styles.statusDot} />
          <div>
            <div style={styles.statusTitle}>Sistem Terhubung</div>
            <div style={styles.statusSubtitle}>MySQL · Live Realtime</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '256px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    flexShrink: 0,
    boxShadow: '2px 0 12px rgba(13, 20, 30, 0.03)',
  },
  brandHeader: {
    height: '68px',
    padding: '0 1.35rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    borderBottom: '1px solid #f1f5f9',
  },
  brandIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '9px',
    backgroundColor: '#0d141e',
    border: '2px solid #74c02c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 10px rgba(116, 192, 44, 0.25)',
  },
  brandLetter: {
    color: '#74c02c',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    fontSize: '1.15rem',
    lineHeight: 1,
  },
  brandTitle: {
    fontSize: '1.08rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#0d141e',
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
  },
  brandTitleAccent: {
    color: '#74c02c',
  },
  brandTag: {
    fontSize: '0.6rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: '1.5px',
    marginTop: '0.1rem',
  },
  menuScrollArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.15rem 0.85rem',
  },
  sectionHeading: {
    padding: '0.85rem 0.75rem 0.35rem',
    fontSize: '0.66rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
  },
  menuList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.65rem 0.85rem',
    color: '#475569',
    textDecoration: 'none',
    borderRadius: '9px',
    fontSize: '0.86rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '700',
    transition: 'all 0.15s ease',
  },
  activeLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.65rem 0.85rem',
    color: '#15803d',
    textDecoration: 'none',
    backgroundColor: '#ecfccb',
    border: '1.5px solid #d9f99d',
    borderRadius: '9px',
    fontSize: '0.86rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    boxShadow: '0 2px 8px rgba(116, 192, 44, 0.15)',
  },
  icon: {
    color: '#64748b',
    marginRight: '0.75rem',
    flexShrink: 0,
    transition: 'color 0.15s',
  },
  activeIcon: {
    color: '#15803d',
    marginRight: '0.75rem',
    flexShrink: 0,
  },
  linkText: {
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chevron: {
    color: '#15803d',
    marginLeft: 'auto',
  },
  sidebarFooter: {
    padding: '1rem',
    borderTop: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc',
  },
  statusBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#74c02c',
    boxShadow: '0 0 0 3px rgba(116, 192, 44, 0.25)',
  },
  statusTitle: {
    fontSize: '0.78rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    color: '#0d141e',
    lineHeight: 1.2,
  },
  statusSubtitle: {
    fontSize: '0.68rem',
    color: '#64748b',
    lineHeight: 1.2,
  },
};

export default Sidebar;