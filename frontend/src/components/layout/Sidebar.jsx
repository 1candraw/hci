import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Truck,
  ClipboardList,
  SlidersHorizontal,
  Wrench,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isCurrent = (path) => location.pathname === path;

  return (
    <aside style={styles.sidebar}>
      {/* Brand Header */}
      <div style={styles.brandHeader}>
        <div style={styles.brandIconBox}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 19L8 5H14L11 19H4Z" fill="#F59E0B" />
            <path d="M13 5L17 19H20L16 5H13Z" fill="#0F172A" />
            <circle cx="6" cy="19" r="2" fill="#0F172A" />
            <circle cx="11" cy="19" r="2" fill="#F59E0B" />
            <circle cx="18" cy="19" r="2" fill="#0F172A" />
          </svg>
        </div>
        <div>
          <div style={styles.brandTitle}>
            HEAVY<span style={styles.brandTitleAccent}>CARE</span>
          </div>
          <div style={styles.brandTag}>ENTERPRISE ERP</div>
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
                  <ShieldAlert size={18} strokeWidth={isCurrent('/audit-log') ? 2.2 : 1.75} style={isCurrent('/audit-log') ? styles.activeIcon : styles.icon} />
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
            <div style={styles.statusSubtitle}>MySQL · Live v2.4</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '250px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #eef2f6',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    flexShrink: 0,
    boxShadow: '2px 0 10px rgba(15, 23, 42, 0.02)',
  },
  brandHeader: {
    height: '64px',
    padding: '0 1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    borderBottom: '1px solid #f1f5f9',
  },
  brandIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: '1.05rem',
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: '-0.3px',
    lineHeight: 1.1,
  },
  brandTitleAccent: {
    color: '#d97706',
  },
  brandTag: {
    fontSize: '0.6rem',
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: '1.5px',
    marginTop: '0.1rem',
  },
  menuScrollArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem 0.85rem',
  },
  sectionHeading: {
    padding: '0.85rem 0.75rem 0.35rem',
    fontSize: '0.65rem',
    fontWeight: '800',
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
    borderRadius: '8px',
    fontSize: '0.86rem',
    fontWeight: '600',
    transition: 'all 0.15s ease',
  },
  activeLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.65rem 0.85rem',
    color: '#92400e',
    textDecoration: 'none',
    backgroundColor: '#fef3c7',
    border: '1px solid #fde68a',
    borderRadius: '8px',
    fontSize: '0.86rem',
    fontWeight: '700',
    boxShadow: '0 1px 3px rgba(245, 158, 11, 0.1)',
  },
  icon: {
    color: '#64748b',
    marginRight: '0.75rem',
    flexShrink: 0,
    transition: 'color 0.15s',
  },
  activeIcon: {
    color: '#d97706',
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
    color: '#d97706',
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
    backgroundColor: '#10b981',
    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
  },
  statusTitle: {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 1.2,
  },
  statusSubtitle: {
    fontSize: '0.68rem',
    color: '#94a3b8',
    lineHeight: 1.2,
  },
};

export default Sidebar;