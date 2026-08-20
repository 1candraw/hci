import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  ExternalLink,
  LogOut,
  Bell,
  Search,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname.startsWith('/transaksi')) return 'Daftar Pesanan & RFQ';
    if (location.pathname.startsWith('/katalog')) return 'Katalog Alat Berat';
    if (location.pathname.startsWith('/saw')) return 'Sistem Pendukung Keputusan (SAW)';
    if (location.pathname.startsWith('/master-alat-berat')) return 'Kelola Master Data Alat';
    if (location.pathname.startsWith('/audit-log')) return 'Audit Log Aktivitas';
    return 'Dashboard Utama';
  };

  const roleColor = {
    Manager:     { bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd' },
    Sales:       { bg: '#fef3c7', text: '#b45309', border: '#f59e0b' },
    Operasional: { bg: '#cffafe', text: '#0891b2', border: '#67e8f9' },
    Customer:    { bg: '#e0e7ff', text: '#3730a3', border: '#818cf8' },
  };
  const roleStyle = roleColor[user?.role] || { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };

  return (
    <nav style={s.nav}>
      {/* Kiri: Konteks Halaman & Breadcrumb */}
      <div style={s.left}>
        <span style={s.pageSubtitle}>INTERNAL CONSOLE</span>
        <h2 style={s.pageTitle}>{getPageTitle()}</h2>
      </div>

      {/* Kanan: Actions & User Menu */}
      <div style={s.right}>
        {/* Lacak Pesanan Publik */}
        <Link to="/tracking" style={s.publicTrackBtn} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={14} strokeWidth={2} />
          <span>Lacak Pesanan Publik</span>
        </Link>

        {/* Divider */}
        <div style={s.divider} />

        {/* User Card */}
        <div style={s.userCard}>
          <div style={{ ...s.avatar, backgroundColor: roleStyle.bg, color: roleStyle.text }}>
            {(user?.name || user?.fullname || 'U')[0].toUpperCase()}
          </div>
          <div style={s.userMeta}>
            <div style={s.userName}>{user?.name || user?.fullname || 'Pengguna'}</div>
            <div style={{ ...s.roleBadge, color: roleStyle.text, backgroundColor: roleStyle.bg }}>
              <ShieldCheck size={11} strokeWidth={2.5} style={{ marginRight: '3px' }} />
              {user?.role || 'Staff'}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button onClick={logout} style={s.logoutBtn} title="Keluar dari akun">
          <LogOut size={15} strokeWidth={2} />
          <span style={s.logoutText}>Keluar</span>
        </button>
      </div>
    </nav>
  );
};

const s = {
  nav: {
    height: '64px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #eef2f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.75rem',
    position: 'sticky',
    top: 0,
    zIndex: 90,
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  pageSubtitle: {
    fontSize: '0.65rem',
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: '1px',
    lineHeight: 1,
    marginBottom: '0.2rem',
  },
  pageTitle: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    lineHeight: 1.2,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.9rem',
  },
  publicTrackBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#475569',
    textDecoration: 'none',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '0.45rem 0.85rem',
    borderRadius: '7px',
    transition: 'all 0.15s ease',
  },
  divider: {
    width: '1px',
    height: '24px',
    backgroundColor: '#e2e8f0',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.3rem 0.6rem 0.3rem 0.3rem',
    borderRadius: '8px',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '0.88rem',
    border: '1px solid rgba(0,0,0,0.06)',
  },
  userMeta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  userName: {
    fontSize: '0.83rem',
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 1.2,
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.66rem',
    fontWeight: '800',
    padding: '0.08rem 0.4rem',
    borderRadius: '4px',
    marginTop: '0.15rem',
    lineHeight: 1.2,
  },
  logoutBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.8rem',
    backgroundColor: '#fff1f2',
    color: '#e11d48',
    border: '1px solid #ffe4e6',
    borderRadius: '7px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '700',
    transition: 'all 0.15s ease',
  },
  logoutText: {
    display: 'inline',
  },
};

export default Navbar;