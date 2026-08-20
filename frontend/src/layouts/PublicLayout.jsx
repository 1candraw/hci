import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  PhoneCall,
  Clock,
  Package,
  LogIn,
  SlidersHorizontal,
  ShieldCheck,
  Truck,
  MapPin,
  Mail,
  ChevronRight,
} from 'lucide-react';

const PublicLayout = () => {
  const navigate = useNavigate();

  return (
    <div style={s.wrapper}>
      {/* ── Top Announcement / Hotline Bar ── */}
      <div style={s.topBar}>
        <div style={s.topBarInner}>
          <div style={s.topBarLeft}>
            <span style={s.hazardBadge}>HEAVY CARE ID</span>
            <span style={s.topBarText}>Platform Distribusi & Penawaran Harga Alat Berat B2B Nasional</span>
          </div>
          <div style={s.topBarRight}>
            <div style={s.topItem}>
              <PhoneCall size={13} style={{ color: '#f59e0b' }} />
              <span>Hotline: <strong>+62 812-6892-0766</strong></span>
            </div>
            <span style={s.topDivider}>|</span>
            <div style={s.topItem}>
              <Clock size={13} style={{ color: '#94a3b8' }} />
              <span>Sen - Sab: 08:00 - 17:00 WIB</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Header / Navbar Publik ── */}
      <header style={s.header}>
        <div style={s.headerInner}>
          {/* Logo */}
          <Link to="/" style={s.logo}>
            <div style={s.logoBadge}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 19L8 5H14L11 19H4Z" fill="#F59E0B" />
                <path d="M13 5L17 19H20L16 5H13Z" fill="#0F172A" />
                <circle cx="6" cy="19" r="2" fill="#0F172A" />
                <circle cx="11" cy="19" r="2" fill="#F59E0B" />
                <circle cx="18" cy="19" r="2" fill="#0F172A" />
              </svg>
            </div>
            <div>
              <div style={s.logoText}>
                HEAVY<span style={s.logoAccent}>CARE</span><span style={s.logoSub}>.ID</span>
              </div>
              <div style={s.logoTagline}>EQUIPMENT & MACHINERY</div>
            </div>
          </Link>

          {/* Nav Links */}
          <nav style={s.nav}>
            <Link to="/" style={s.navLink}>Beranda</Link>
            <a href="/#katalog-section" style={s.navLink}>Katalog Unit</a>
            <a href="/#saw-section" style={s.navLink}>Kalkulator SAW</a>
            <Link to="/tracking" style={s.navLinkTrack}>
              <Package size={15} strokeWidth={2.2} />
              <span>Lacak Pesanan</span>
            </Link>
            <button onClick={() => navigate('/login')} style={s.loginBtn}>
              <LogIn size={15} strokeWidth={2.2} />
              <span>Portal Internal</span>
            </button>
          </nav>
        </div>
      </header>

      {/* ── Konten Utama ── */}
      <main style={s.main}>
        <Outlet />
      </main>

      {/* ── Footer Industri ── */}
      <footer style={s.footer}>
        <div style={s.footerTop}>
          <div style={s.footerInner}>
            {/* Col 1: Brand Info */}
            <div style={s.footerCol}>
              <div style={{ ...s.logoText, color: '#f8fafc', fontSize: '1.25rem', marginBottom: '0.6rem' }}>
                HEAVY<span style={s.logoAccent}>CARE</span>.ID
              </div>
              <p style={s.footerDesc}>
                Penyedia solusi pengadaan dan distribusi excavator terpercaya untuk proyek konstruksi, infrastruktur, perkebunan, dan pertambangan di seluruh Indonesia.
              </p>
              <div style={s.badgePDI}>
                <ShieldCheck size={14} style={{ color: '#f59e0b' }} />
                <span>Bergaransi Resmi · Inspeksi PDI Ketat · BAST Lengkap</span>
              </div>
            </div>

            {/* Col 2: Kategori Unit */}
            <div style={s.footerCol}>
              <h4 style={s.footerColTitle}>Kategori Excavator</h4>
              <ul style={s.footerList}>
                <li>Mini Excavator (Kelas 5 Ton)</li>
                <li>Medium Excavator (Kelas 20 Ton)</li>
                <li>Heavy Excavator (Kelas 30 Ton+)</li>
                <li>Attachment & Spareparts Resmi</li>
              </ul>
            </div>

            {/* Col 3: Layanan & Akses */}
            <div style={s.footerCol}>
              <h4 style={s.footerColTitle}>Layanan Pelanggan</h4>
              <ul style={s.footerList}>
                <li>
                  <Link to="/tracking" style={s.footerLink}>
                    <Package size={14} />
                    <span>Pelacakan Pesanan Mandiri</span>
                  </Link>
                </li>
                <li>
                  <a href="/#saw-section" style={s.footerLink}>
                    <SlidersHorizontal size={14} />
                    <span>Kalkulator SAW Pemilihan Unit</span>
                  </a>
                </li>
                <li>
                  <Link to="/login" style={s.footerLink}>
                    <LogIn size={14} />
                    <span>Portal Login Sales & Manager</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Kontak Kantor */}
            <div style={s.footerCol}>
              <h4 style={s.footerColTitle}>Hubungi Kami</h4>
              <div style={s.footerContact}>
                <div style={s.contactRow}>
                  <MapPin size={15} style={s.contactIcon} />
                  <span>Kawasan Industri & Pergudangan Logistik, Jl. Raya Pelabuhan No. 88, Jakarta Utara</span>
                </div>
                <div style={s.contactRow}>
                  <Mail size={15} style={s.contactIcon} />
                  <span>sales@heavycare.id</span>
                </div>
                <div style={s.contactRow}>
                  <PhoneCall size={15} style={s.contactIcon} />
                  <span>WhatsApp: 0812-6892-0766</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={s.footerBottom}>
          <div style={s.footerBottomInner}>
            <p style={s.footerCopy}>
              © {new Date().getFullYear()} PT Heavy Care Indonesia. Hak Cipta Dilindungi.
            </p>
            <p style={s.footerSubCopy}>
              Sistem Pendukung Keputusan Pengadaan Alat Berat Menggunakan Metode Simple Additive Weighting (SAW)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const s = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
  },
  topBar: {
    backgroundColor: '#0f172a',
    color: '#94a3b8',
    fontSize: '0.78rem',
    borderBottom: '1px solid #1e293b',
    padding: '0.45rem 0',
  },
  topBarInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  hazardBadge: {
    backgroundColor: '#f59e0b',
    color: '#0f172a',
    fontWeight: '900',
    fontSize: '0.65rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    letterSpacing: '1px',
  },
  topBarText: {
    color: '#cbd5e1',
    fontWeight: '500',
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.9rem',
  },
  topItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    color: '#cbd5e1',
  },
  topDivider: {
    color: '#334155',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 1.5rem',
    height: '68px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
  },
  logoBadge: {
    width: '40px',
    height: '40px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1.5px solid #e2e8f0',
  },
  logoText: {
    fontSize: '1.3rem',
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: '-0.5px',
    lineHeight: 1.1,
  },
  logoAccent: {
    color: '#d97706',
  },
  logoSub: {
    color: '#f59e0b',
    fontSize: '0.9rem',
  },
  logoTagline: {
    fontSize: '0.6rem',
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: '2px',
    marginTop: '0.1rem',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  navLink: {
    color: '#475569',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    padding: '0.4rem 0.6rem',
    transition: 'color 0.15s',
  },
  navLinkTrack: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    color: '#92400e',
    textDecoration: 'none',
    fontSize: '0.88rem',
    fontWeight: '700',
    padding: '0.45rem 0.95rem',
    backgroundColor: '#fef3c7',
    border: '1px solid #fde68a',
    borderRadius: '8px',
    transition: 'all 0.15s',
  },
  loginBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '0.88rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  main: {
    flex: 1,
  },
  footer: {
    backgroundColor: '#0f172a',
    color: '#cbd5e1',
    borderTop: '3px solid #f59e0b',
    marginTop: 'auto',
  },
  footerTop: {
    padding: '3.5rem 1.5rem 2.5rem',
  },
  footerInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '2.5rem',
  },
  footerCol: {},
  footerColTitle: {
    color: '#f8fafc',
    fontSize: '0.95rem',
    fontWeight: '800',
    marginBottom: '1rem',
    borderLeft: '3px solid #f59e0b',
    paddingLeft: '0.5rem',
  },
  footerDesc: {
    fontSize: '0.84rem',
    color: '#94a3b8',
    lineHeight: '1.7',
    marginBottom: '1rem',
  },
  badgePDI: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    fontSize: '0.74rem',
    fontWeight: '700',
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #334155',
  },
  footerList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    fontSize: '0.84rem',
    color: '#94a3b8',
  },
  footerLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    color: '#cbd5e1',
    textDecoration: 'none',
    transition: 'color 0.15s',
  },
  footerContact: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    fontSize: '0.84rem',
    color: '#94a3b8',
  },
  contactRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    lineHeight: '1.5',
  },
  contactIcon: {
    color: '#f59e0b',
    flexShrink: 0,
    marginTop: '2px',
  },
  footerBottom: {
    borderTop: '1px solid #1e293b',
    backgroundColor: '#090d16',
    padding: '1.25rem 1.5rem',
  },
  footerBottomInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  footerCopy: {
    fontSize: '0.78rem',
    color: '#64748b',
  },
  footerSubCopy: {
    fontSize: '0.72rem',
    color: '#475569',
  },
};

export default PublicLayout;
