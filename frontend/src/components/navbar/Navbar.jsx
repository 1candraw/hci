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
    if (location.pathname.startsWith('/profile') || location.pathname.startsWith('/pengaturan-profil')) return 'Pengaturan Profil Akun';
    return 'Dashboard Utama';
  };

  const roleColor = {
    Manager:     { bg: '#0d141e', text: '#74c02c', border: '#1f2937' },
    Sales:       { bg: '#ecfccb', text: '#15803d', border: '#d9f99d' },
    Operasional: { bg: '#cffafe', text: '#0891b2', border: '#67e8f9' },
    Customer:    { bg: '#e0e7ff', text: '#3730a3', border: '#818cf8' },
  };
  const roleStyle = roleColor[user?.role] || { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };

  return (
    <nav style={s.nav}>
      {/* Kiri: Konteks Halaman & Breadcrumb */}
      <div style={s.left}>
        <span style={s.pageSubtitle}>INTERNAL MANAGEMENT CONSOLE</span>
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

        {/* User Card (Klik untuk ke Pengaturan Profil) */}
        <Link to="/profile" style={s.userCardLink} title="Buka Pengaturan Profil">
          <div style={{ ...s.avatar, backgroundColor: roleStyle.bg, color: roleStyle.text }}>
            {(user?.fullname || user?.name || 'U')[0].toUpperCase()}
          </div>
          <div style={s.userMeta}>
            <div style={s.userName}>{user?.fullname || user?.name || 'Pengguna'}</div>
            <div style={{ ...s.roleBadge, color: roleStyle.text, backgroundColor: roleStyle.bg }}>
              <ShieldCheck size={11} strokeWidth={2.5} style={{ marginRight: '3px' }} />
              {user?.role || 'Staff'}
            </div>
          </div>
        </Link>

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
    height: '68px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
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
    fontSize: '0.66rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: '1px',
    lineHeight: 1,
    marginBottom: '0.25rem',
  },
  pageTitle: {
    fontSize: '1.15rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '800',
    color: '#0d141e',
    margin: 0,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
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
    fontSize: '0.82rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    color: '#15803d',
    textDecoration: 'none',
    backgroundColor: '#ecfccb',
    border: '1px solid #d9f99d',
    padding: '0.45rem 0.85rem',
    borderRadius: '7px',
    transition: 'all 0.15s ease',
  },
  divider: {
    width: '1px',
    height: '24px',
    backgroundColor: '#e2e8f0',
  },
  userCardLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.35rem 0.65rem',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'background 0.15s ease',
    cursor: 'pointer',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    fontSize: '0.88rem',
    border: '1px solid rgba(0,0,0,0.06)',
  },
  userMeta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  userName: {
    fontSize: '0.84rem',
    fontWeight: '800',
    color: '#0d141e',
    lineHeight: 1.2,
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.66rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
    marginTop: '0.15rem',
    lineHeight: 1.2,
    letterSpacing: '0.5px',
  },
  logoutBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.85rem',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    borderRadius: '7px',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    transition: 'all 0.15s ease',
  },
  logoutText: {
    display: 'inline',
  },
};

export default Navbar;