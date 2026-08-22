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
  Headphones,
  Wrench,
  Globe,
  Award,
  Sparkles,
  FileText
} from 'lucide-react';

const PublicLayout = () => {
  const navigate = useNavigate();

  return (
    <div style={s.wrapper}>
      {/* ── 1. HEAVY CARE ID TOP ANNOUNCEMENT & GLOBAL HOTLINE BAR ── */}
      <div style={s.topBar}>
        <div style={s.topBarInner}>
          <div style={s.topBarLeft}>
            <span style={s.zoomlionBadge}>HEAVY CARE ID</span>
            <span style={s.topBarText}>
              Platform Layanan Purna Jual & Distribusi Alat Berat Nasional (Smart Cloud · Smart Control · Smart Maintenance)
            </span>
          </div>
          <div style={s.topBarRight}>
            <div style={s.topItem}>
              <Headphones size={13} style={{ color: '#74c02c' }} />
              <span>Hotline 24/7: <strong>+62 812-6892-0766</strong></span>
            </div>
            <span style={s.topDivider}>|</span>
            <div style={s.topItem}>
              <Globe size={13} style={{ color: '#94a3b8' }} />
              <span>Indonesia Service Network</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. HEAVY CARE ID HEADER NAVBAR ── */}
      <header style={s.header}>
        <div style={s.headerInner}>
          {/* Brand Logo */}
          <Link to="/" style={s.logo}>
            <div style={s.logoIconWrap}>
              <span style={s.logoSymbol}>H</span>
            </div>
            <div>
              <div style={s.logoText}>
                HEAVY<span style={s.logoAccent}>CARE</span><span style={{ color: '#74c02c' }}>.ID</span>
              </div>
              <div style={s.logoTagline}>EQUIPMENT & MACHINERY DISTRIBUTION</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav style={s.nav}>
            <Link to="/" style={s.navLink}>Beranda</Link>
            <a href="/#services-section" style={s.navLink}>Layanan</a>
            <a href="/#katalog-section" style={s.navLink}>Produk</a>
            <a href="/#saw-section" style={s.navLink}>Rekomendasi</a>
            <a href="/#network-section" style={s.navLink}>Lokasi</a>

            <Link to="/tracking" style={s.navLinkTrack}>
              <Package size={14} strokeWidth={2.2} />
              <span>Lacak</span>
            </Link>

            <a href="/#katalog-section" style={s.btnInquiryNav}>
              <FileText size={14} />
              <span>Pesan</span>
            </a>

            <button onClick={() => navigate('/login')} style={s.loginBtn} title="Masuk ke Portal Internal">
              <LogIn size={14} strokeWidth={2.2} />
              <span>Login</span>
            </button>
          </nav>
        </div>
      </header>

      {/* ── 3. MAIN PAGE CONTENT ── */}
      <main style={s.main}>
        <Outlet />
      </main>

      {/* ── 4. HEAVY CARE ID CORPORATE INDUSTRIAL FOOTER ── */}
      <footer style={s.footer}>
        <div style={s.footerTop}>
          <div style={s.footerInner}>
            {/* Col 1: Brand & Service Guarantee */}
            <div style={s.footerCol}>
              <div style={{ ...s.logoText, color: '#f8fafc', fontSize: '1.3rem', marginBottom: '0.6rem' }}>
                HEAVY<span style={{ color: '#74c02c' }}>CARE</span>.ID
              </div>
              <p style={s.footerDesc}>
                Penyedia solusi distribusi excavator dan alat berat terkemuka di Indonesia. Didukung oleh ekosistem layanan purna jual <strong>HEAVY CARE ID</strong> terintegrasi (Smart Cloud + Smart Control + Smart Maintenance), ketersediaan suku cadang resmi 24/7, dan jaminan inspeksi PDI 6 titik vital.
              </p>
              <div style={s.badgePDI}>
                <ShieldCheck size={16} style={{ color: '#74c02c' }} />
                <span>VISION Philosophy · Inspeksi PDI Ketat · Terbit BAST Resmi</span>
              </div>
            </div>

            {/* Col 2: Full Lifecycle Services */}
            <div style={s.footerCol}>
              <h4 style={s.footerColTitle}>Layanan Siklus Penuh</h4>
              <ul style={s.footerList}>
                <li><a href="/#services-section" style={s.footerLink}>01. Machine Lifecycle Support</a></li>
                <li><a href="/#services-section" style={s.footerLink}>02. PDI & Rapid Maintenance</a></li>
                <li><a href="/#services-section" style={s.footerLink}>03. Genuine Spare Parts Center</a></li>
                <li><a href="/#services-section" style={s.footerLink}>04. Operator & Technical Training</a></li>
                <li><a href="/#services-section" style={s.footerLink}>05. Smart IoT & Fleet Telematics</a></li>
              </ul>
            </div>

            {/* Col 3: Kategori Produk & Akses Cepat */}
            <div style={s.footerCol}>
              <h4 style={s.footerColTitle}>Produk & Akses Cepat</h4>
              <ul style={s.footerList}>
                <li><a href="/#katalog-section" style={s.footerLink}>Mini Excavator (Kelas 5 Ton)</a></li>
                <li><a href="/#katalog-section" style={s.footerLink}>Medium Excavator (Kelas 20 Ton)</a></li>
                <li><a href="/#katalog-section" style={s.footerLink}>Heavy Excavator (Kelas 30 Ton+)</a></li>
                <li>
                  <Link to="/tracking" style={s.footerLink}>
                    <Package size={13} style={{ color: '#74c02c' }} />
                    <span>Lacak Status Pesanan Mandiri</span>
                  </Link>
                </li>
                <li>
                  <Link to="/login" style={s.footerLink}>
                    <LogIn size={13} style={{ color: '#74c02c' }} />
                    <span>Portal Login Sales & Manager</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Jaringan Kontak & Hotline Darurat */}
            <div style={s.footerCol}>
              <h4 style={s.footerColTitle}>Hotline & Jaringan Pool</h4>
              <div style={s.footerContact}>
                <div style={s.contactRow}>
                  <MapPin size={15} style={s.contactIcon} />
                  <span>Kawasan Industri Alat Berat & Pergudangan Logistik, Jl. Pelabuhan Raya No. 88, Jakarta Utara</span>
                </div>
                <div style={s.contactRow}>
                  <Headphones size={15} style={s.contactIcon} />
                  <span>Hotline Servis 24/7: <strong>0812-6892-0766</strong></span>
                </div>
                <div style={s.contactRow}>
                  <Mail size={15} style={s.contactIcon} />
                  <span>service@heavycare.id · sales@heavycare.id</span>
                </div>
                <div style={s.contactRow}>
                  <Clock size={15} style={s.contactIcon} />
                  <span>Pool & Technical Support: Senin - Sabtu (24 Jam On-Call)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div style={s.footerBottom}>
          <div style={s.footerBottomInner}>
            <p style={s.footerCopy}>
              © {new Date().getFullYear()} PT Heavy Care Indonesia. Seluruh Hak Cipta Dilindungi.
            </p>
            <p style={s.footerSubCopy}>
              Platform Layanan Purna Jual & Pengadaan Alat Berat Berbasis Algoritma Rekomendasi SAW
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
    color: '#0d141e',
  },
  topBar: {
    backgroundColor: '#0d141e',
    color: '#94a3b8',
    fontSize: '0.78rem',
    borderBottom: '1px solid #1e293b',
    padding: '0.45rem 0',
  },
  topBarInner: {
    maxWidth: '1320px',
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
  zoomlionBadge: {
    backgroundColor: '#74c02c',
    color: '#0d141e',
    fontWeight: '900',
    fontSize: '0.66rem',
    fontFamily: "'Urbanist', sans-serif",
    padding: '0.15rem 0.55rem',
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
    gap: '1rem',
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
    boxShadow: '0 2px 12px rgba(13, 20, 30, 0.04)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: '1320px',
    margin: '0 auto',
    padding: '0 1.5rem',
    height: '70px',
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
  logoIconWrap: {
    width: '38px',
    height: '38px',
    backgroundColor: '#0d141e',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #74c02c',
    boxShadow: '0 0 12px rgba(116, 192, 44, 0.3)',
  },
  logoSymbol: {
    color: '#74c02c',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    fontSize: '1.25rem',
    lineHeight: 1,
  },
  logoText: {
    fontSize: '1.25rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#0d141e',
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
  },
  logoAccent: {
    color: '#74c02c',
  },
  logoTagline: {
    fontSize: '0.58rem',
    fontWeight: '800',
    fontFamily: "'Urbanist', sans-serif",
    color: '#64748b',
    letterSpacing: '1.5px',
    marginTop: '0.1rem',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.15rem',
  },
  navLink: {
    color: '#334155',
    textDecoration: 'none',
    fontSize: '0.88rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '700',
    padding: '0.4rem 0.55rem',
    transition: 'color 0.15s',
  },
  navLinkTrack: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    color: '#15803d',
    textDecoration: 'none',
    fontSize: '0.84rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    padding: '0.45rem 0.85rem',
    backgroundColor: '#ecfccb',
    border: '1px solid #d9f99d',
    borderRadius: '7px',
  },
  btnInquiryNav: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 1.05rem',
    backgroundColor: '#74c02c',
    color: '#0d141e',
    textDecoration: 'none',
    borderRadius: '8px',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.86rem',
    boxShadow: '0 2px 10px rgba(116, 192, 44, 0.35)',
    transition: 'transform 0.15s',
  },
  loginBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 0.95rem',
    backgroundColor: '#0d141e',
    color: '#ffffff',
    border: '1px solid #334155',
    borderRadius: '8px',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    fontSize: '0.84rem',
    cursor: 'pointer',
  },
  main: {
    flex: 1,
  },
  footer: {
    backgroundColor: '#0d141e',
    color: '#cbd5e1',
    borderTop: '3px solid #74c02c',
    marginTop: 'auto',
  },
  footerTop: {
    padding: '4rem 1.5rem 3rem',
  },
  footerInner: {
    maxWidth: '1320px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2.5rem',
  },
  footerCol: {},
  footerColTitle: {
    color: '#f8fafc',
    fontSize: '0.95rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    marginBottom: '1.1rem',
    borderLeft: '3px solid #74c02c',
    paddingLeft: '0.6rem',
    letterSpacing: '0.5px',
  },
  footerDesc: {
    fontSize: '0.84rem',
    color: '#94a3b8',
    lineHeight: '1.7',
    marginBottom: '1.25rem',
  },
  badgePDI: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.74rem',
    fontWeight: '700',
    backgroundColor: '#111827',
    color: '#f8fafc',
    padding: '0.5rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid #1f2937',
  },
  footerList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
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
    gap: '0.85rem',
    fontSize: '0.84rem',
    color: '#94a3b8',
  },
  contactRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.55rem',
    lineHeight: '1.5',
  },
  contactIcon: {
    color: '#74c02c',
    flexShrink: 0,
    marginTop: '2px',
  },
  footerBottom: {
    borderTop: '1px solid #1e293b',
    backgroundColor: '#070b10',
    padding: '1.35rem 1.5rem',
  },
  footerBottomInner: {
    maxWidth: '1320px',
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
