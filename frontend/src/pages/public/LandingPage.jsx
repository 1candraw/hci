import { useState, useEffect } from 'react';
import { guestService } from '../../services/guest.service';
import GuestRFQModal from '../../components/modals/GuestRFQModal';
import RFQSuccessModal from '../../components/modals/RFQSuccessModal';
import { Link } from 'react-router-dom';
import {
  Truck,
  BarChart3,
  Wrench,
  FileCheck,
  SlidersHorizontal,
  Package,
  MessageSquare,
  Sparkles,
  Zap,
  Layers,
  Maximize2,
  Scale,
  FileText,
  Award,
  Search,
  CheckCircle2,
  ArrowDown,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

const getLabelKepentingan = (v) =>
  ['', 'Sangat Rendah', 'Rendah', 'Cukup Penting', 'Penting', 'Sangat Penting'][v] || '';

const getBadgeStyle = (v) => {
  if (v >= 5) return { bg: '#fef3c7', text: '#b45309', border: '#f59e0b' };
  if (v >= 4) return { bg: '#e0e7ff', text: '#3730a3', border: '#818cf8' };
  if (v >= 3) return { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };
  return { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
};

const getMedalInfo = (i) => {
  if (i === 0) return { label: '#1 REKOMENDASI UTAMA', color: '#b45309', bg: '#fef3c7', border: '#f59e0b' };
  if (i === 1) return { label: '#2 ALTERNATIF TERBAIK', color: '#334155', bg: '#f1f5f9', border: '#cbd5e1' };
  if (i === 2) return { label: '#3 PILIHAN KETIGA', color: '#78350f', bg: '#fef2f2', border: '#fca5a5' };
  return { label: `PERINGKAT #${i + 1}`, color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' };
};

const LandingPage = () => {
  // ── SAW State ──
  const [ranking, setRanking] = useState([]);
  const [loadingCalc, setLoadingCalc] = useState(false);
  const [filterTonase, setFilterTonase] = useState('5');
  const [bobot, setBobot] = useState({
    harga_weight: 4,
    tenaga_mesin_weight: 4,
    kapasitas_bucket_weight: 3,
    kedalaman_gali_weight: 3,
    berat_operasional_weight: 3,
  });
  const [errorSAW, setErrorSAW] = useState('');

  // ── Catalog State ──
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState('Semua');
  const [catalogSearch, setCatalogSearch] = useState('');

  // ── Modal State ──
  const [rfqOpen, setRfqOpen] = useState(false);
  const [rfqItem, setRfqItem] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [nomorTracking, setNomorTracking] = useState('');

  useEffect(() => {
    fetchCatalog('Semua');
    fetchRanking();
    // eslint-disable-next-line
  }, []);

  const fetchCatalog = async (kapasitas) => {
    setCatalogLoading(true);
    try {
      const params = {};
      if (kapasitas && kapasitas !== 'Semua') {
        params.kapasitas = kapasitas;
      }
      const data = await guestService.getCatalog(params);
      setCatalog(data || []);
    } catch (err) {
      console.error('Fetch catalog error:', err);
      setCatalog([]);
    } finally {
      setCatalogLoading(false);
    }
  };

  const handleFilterCatalog = (ton) => {
    setCatalogFilter(ton);
    fetchCatalog(ton);
  };

  const fetchRanking = async (e) => {
    if (e) e.preventDefault();
    setLoadingCalc(true);
    setErrorSAW('');
    try {
      const result = await guestService.getSAWRecommendation({
        filter_kapasitas: filterTonase,
        bobot_kriteria: bobot,
      });
      const data = result?.data?.rekomendasi || [];
      setRanking([...data].sort((a, b) => (b.skor_akhir || 0) - (a.skor_akhir || 0)));
    } catch (err) {
      setErrorSAW(typeof err === 'string' ? err : 'Gagal memproses rekomendasi SAW.');
      setRanking([]);
    } finally {
      setLoadingCalc(false);
    }
  };

  const handleRFQClick = (item) => {
    setRfqItem(item);
    setRfqOpen(true);
  };

  const handleRFQSuccess = (nomor) => {
    setNomorTracking(nomor);
    setSuccessOpen(true);
  };

  // Filter search katalog
  const filteredCatalog = catalog.filter((item) => {
    const q = catalogSearch.toLowerCase();
    const name = (item.name || '').toLowerCase();
    const brand = (item.brand || '').toLowerCase();
    const model = (item.model || '').toLowerCase();
    return name.includes(q) || brand.includes(q) || model.includes(q);
  });

  return (
    <div style={s.page}>
      {/* ── 1. HERO SECTION ── */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroBadge}>
            <SlidersHorizontal size={14} style={{ color: '#f59e0b' }} />
            <span>PLATFORM DISTRIBUSI & PENAWARAN HARGA ALAT BERAT B2B</span>
          </div>

          <h1 style={s.heroTitle}>
            Solusi Pengadaan <span style={s.heroAccent}>Excavator Proyek</span><br />
            Berbasis Rekomendasi Cerdas (Metode SAW)
          </h1>

          <p style={s.heroSub}>
            Optimalkan investasi alat berat Anda dengan analisis multi-kriteria transparan (Harga, Tenaga Mesin, Kapasitas Bucket, dan Kedalaman Gali). Dapatkan penawaran resmi (RFQ) tanpa login dan lacak progres pengiriman secara mandiri.
          </p>

          <div style={s.heroActionGroup}>
            <a href="#katalog-section" style={s.heroPrimaryBtn}>
              <Truck size={16} />
              <span>Lihat Katalog Unit</span>
            </a>
            <a href="#saw-section" style={s.heroSecondaryBtn}>
              <Sparkles size={16} />
              <span>Hitung Rekomendasi SAW</span>
            </a>
            <Link to="/tracking" style={s.heroTrackBtn}>
              <Package size={16} />
              <span>Lacak Pesanan</span>
            </Link>
          </div>

          {/* Value Pillars Bar */}
          <div style={s.pillarGrid}>
            {[
              { icon: <Truck size={22} style={{ color: '#f59e0b' }} />, title: '100+ Unit Siap Kerja', desc: 'Kelas 5 Ton Mini hingga 30+ Ton Heavy' },
              { icon: <BarChart3 size={22} style={{ color: '#60a5fa' }} />, title: 'Algoritma SAW Cerdas', desc: 'Perankingan objektif sesuai bobot kriteria' },
              { icon: <Wrench size={22} style={{ color: '#34d399' }} />, title: 'Inspeksi PDI Resmi', desc: 'Uji fisik 6 komponen vital sebelum kirim' },
              { icon: <FileCheck size={22} style={{ color: '#fbbf24' }} />, title: 'Penerbitan BAST Resmi', desc: 'Legalitas transaksi terjamin & transparan' },
            ].map((p, idx) => (
              <div key={idx} style={s.pillarCard}>
                <div style={s.pillarIcon}>{p.icon}</div>
                <div>
                  <div style={s.pillarTitle}>{p.title}</div>
                  <div style={s.pillarDesc}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. KATALOG ALAT BERAT SECTION ── */}
      <section id="katalog-section" style={s.catalogSection}>
        <div style={s.sectionHeader}>
          <span style={s.sectionPill}>KATALOG PRODUK TERSEDIA</span>
          <h2 style={s.sectionTitle}>Lini Unit Excavator HeavyCare ID</h2>
          <p style={s.sectionSub}>
            Pilihan excavator baru dari merek terkemuka dunia dengan garansi resmi pabrikan, inspeksi PDI ketat, dan kesiapan pengiriman ke seluruh lokasi proyek.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div style={s.catalogToolbar}>
          {/* Category Tabs */}
          <div style={s.categoryTabs}>
            {[
              { id: 'Semua', label: 'Semua Kelas' },
              { id: '5', label: 'Mini 5 Ton' },
              { id: '20', label: 'Medium 20 Ton' },
              { id: '30', label: 'Heavy 30 Ton+' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleFilterCatalog(tab.id)}
                style={{
                  ...s.catTabBtn,
                  backgroundColor: catalogFilter === tab.id ? '#0f172a' : '#ffffff',
                  color: catalogFilter === tab.id ? '#fbbf24' : '#475569',
                  borderColor: catalogFilter === tab.id ? '#0f172a' : '#e2e8f0',
                  fontWeight: catalogFilter === tab.id ? '800' : '600',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={s.catalogSearchBox}>
            <Search size={16} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Cari merek (Liugong, Develon, Lovol, Shantui)..."
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              style={s.catalogSearchInput}
            />
          </div>
        </div>

        {/* Catalog Grid */}
        {catalogLoading ? (
          <div style={s.loadingContainer}>
            <div style={s.spinner} />
            <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: '600' }}>
              Memuat katalog unit excavator...
            </p>
          </div>
        ) : filteredCatalog.length > 0 ? (
          <div style={s.catalogGrid}>
            {filteredCatalog.map((unit) => (
              <div key={unit.id} style={s.catalogCard}>
                {/* Header Card / Image Preview */}
                <div style={s.cardMediaWrap}>
                  {unit.image_url ? (
                    <img src={unit.image_url} alt={unit.name} style={s.cardImg} />
                  ) : (
                    <div style={s.cardImgPlaceholder}>
                      <Truck size={42} style={{ color: '#f59e0b', opacity: 0.85 }} />
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.4rem', fontWeight: '700' }}>
                        {unit.brand} HEAVY MACHINERY
                      </span>
                    </div>
                  )}
                  <div style={s.tonBadge}>
                    <span>Kelas {unit.kapasitas_ton || 5} Ton</span>
                  </div>
                </div>

                {/* Body Card */}
                <div style={s.cardBody}>
                  <div style={s.brandRow}>
                    <span style={s.brandBadgeText}>{unit.brand || 'Excavator'}</span>
                    <span style={s.stockBadge}>
                      <CheckCircle2 size={12} style={{ color: '#10b981' }} />
                      <span>Ready Stock ({unit.stock || 1} Unit)</span>
                    </span>
                  </div>

                  <h3 style={s.cardUnitName}>
                    {unit.name && unit.name.trim() !== 'Excavator' ? unit.name : `${unit.brand} ${unit.model || ''}`}
                  </h3>
                  <p style={s.cardModelText}>Model: <strong>{unit.model || '-'}</strong></p>

                  {/* Tech Specs */}
                  <div style={s.cardSpecsGrid}>
                    <div style={s.cardSpecItem}>
                      <Zap size={13} style={{ color: '#f59e0b' }} />
                      <span style={s.cardSpecVal}>{unit.tenaga_mesin || '-'} HP</span>
                      <span style={s.cardSpecLab}>Tenaga</span>
                    </div>
                    <div style={s.cardSpecItem}>
                      <Layers size={13} style={{ color: '#f59e0b' }} />
                      <span style={s.cardSpecVal}>{unit.kapasitas_bucket || '-'} m³</span>
                      <span style={s.cardSpecLab}>Bucket</span>
                    </div>
                    <div style={s.cardSpecItem}>
                      <Maximize2 size={13} style={{ color: '#f59e0b' }} />
                      <span style={s.cardSpecVal}>{unit.kedalaman_gali || '-'} m</span>
                      <span style={s.cardSpecLab}>Kedalaman</span>
                    </div>
                    <div style={s.cardSpecItem}>
                      <Scale size={13} style={{ color: '#f59e0b' }} />
                      <span style={s.cardSpecVal}>{unit.berat_operasional || unit.kapasitas_ton || '-'} Ton</span>
                      <span style={s.cardSpecLab}>Bobot</span>
                    </div>
                  </div>

                  {/* Price & RFQ Button */}
                  <div style={s.cardFooter}>
                    <div>
                      <span style={s.cardPriceLabel}>Harga Estimasi</span>
                      <div style={s.cardPriceVal}>
                        {unit.harga ? `Rp ${(Number(unit.harga) / 1e6).toLocaleString('id-ID')} Juta` : 'Hubungi Sales'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRFQClick(unit)}
                      style={s.cardRfqBtn}
                    >
                      <FileText size={14} />
                      <span>Ajukan RFQ</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={s.emptyState}>
            <Truck size={44} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} />
            <h4 style={{ color: '#0f172a', marginBottom: '0.4rem' }}>Tidak ada unit yang cocok</h4>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Coba ganti filter kelas tonase atau kata kunci pencarian Anda.
            </p>
          </div>
        )}
      </section>

      {/* ── 3. SAW CALCULATOR & RECOMMENDATION SECTION ── */}
      <section id="saw-section" style={s.sawSection}>
        <div style={s.sectionHeader}>
          <span style={s.sectionPill}>SISTEM PENDUKUNG KEPUTUSAN (SPK)</span>
          <h2 style={s.sectionTitle}>Konfigurasi Preferensi & Rekomendasi SAW</h2>
          <p style={s.sectionSub}>
            Atur bobot kriteria teknis sesuai prioritas proyek Anda. Algoritma SAW akan menormalisasi dan menghitung skor kelayakan tertinggi secara otomatis.
          </p>
        </div>

        <div style={s.sawContainer}>
          {/* Left Form Panel */}
          <div style={s.formPanel}>
            <div style={s.panelHead}>
              <div style={s.panelHeadIcon}>
                <SlidersHorizontal size={20} style={{ color: '#b45309' }} />
              </div>
              <div>
                <h3 style={s.panelHeadTitle}>Parameter Kriteria Proyek</h3>
                <p style={s.panelHeadSub}>Geser slider 1-5 (1: Rendah, 5: Sangat Penting)</p>
              </div>
            </div>

            <form onSubmit={fetchRanking}>
              {/* Kelas Tonase */}
              <div style={s.fieldGroup}>
                <label style={s.fieldLabel}>
                  <span>Kelas Excavator (Tonase)</span>
                  <span style={s.fieldRequired}>*Wajib</span>
                </label>
                <div style={s.tonaseGrid}>
                  {[
                    { val: '5', label: 'Mini 5 Ton', sub: 'Proyek Perkotaan & Saluran' },
                    { val: '20', label: 'Medium 20 Ton', sub: 'Konstruksi Umum & Tanah' },
                    { val: '30', label: 'Heavy 30 Ton+', sub: 'Tambang & Quarry Berat' },
                  ].map((t) => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => setFilterTonase(t.val)}
                      style={{
                        ...s.tonaseBtn,
                        backgroundColor: filterTonase === t.val ? '#fef3c7' : '#ffffff',
                        borderColor: filterTonase === t.val ? '#f59e0b' : '#e2e8f0',
                        boxShadow: filterTonase === t.val ? '0 2px 8px rgba(245, 158, 11, 0.15)' : 'none',
                      }}
                    >
                      <span style={{ fontWeight: '800', color: filterTonase === t.val ? '#b45309' : '#0f172a' }}>
                        {t.label}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.1rem' }}>
                        {t.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={s.formDivider} />

              {/* Sliders */}
              {[
                { key: 'harga_weight', label: 'Harga Beli Unit', desc: 'Prioritaskan harga paling ekonomis (Cost Criteria)' },
                { key: 'tenaga_mesin_weight', label: 'Tenaga Mesin (Horsepower)', desc: 'Daya dorong & produktivitas di medan berat' },
                { key: 'kapasitas_bucket_weight', label: 'Kapasitas Bucket (m³)', desc: 'Volume muat material per siklus kerja' },
                { key: 'kedalaman_gali_weight', label: 'Kedalaman Galian Maksimal (m)', desc: 'Kemampuan penggalian fondasi dalam' },
                { key: 'berat_operasional_weight', label: 'Stabilitas & Berat Operasional (Ton)', desc: 'Keseimbangan dan traksi di tanah labil' },
              ].map(({ key, label, desc }) => {
                const bStyle = getBadgeStyle(bobot[key]);
                return (
                  <div key={key} style={s.sliderGroup}>
                    <div style={s.sliderHeader}>
                      <span style={s.sliderLabel}>{label}</span>
                      <span style={{
                        ...s.sliderBadge,
                        backgroundColor: bStyle.bg,
                        color: bStyle.text,
                        borderColor: bStyle.border
                      }}>
                        Tingkat: {bobot[key]} · {getLabelKepentingan(bobot[key])}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={bobot[key]}
                      onChange={(e) => setBobot({ ...bobot, [key]: +e.target.value })}
                      style={s.sliderInput}
                    />
                    <span style={s.sliderDesc}>{desc}</span>
                  </div>
                );
              })}

              <button type="submit" disabled={loadingCalc} style={s.submitBtn}>
                <Sparkles size={16} />
                <span>{loadingCalc ? 'Menghitung Matriks SAW...' : 'Hitung Rekomendasi Unit Terbaik'}</span>
              </button>
            </form>
          </div>

          {/* Right Result Panel */}
          <div style={s.resultPanel}>
            <div style={s.resultHeader}>
              <div>
                <h3 style={s.resultTitle}>
                  Hasil Perangkingan SAW — Kelas {filterTonase} Ton
                </h3>
                <p style={s.resultSub}>
                  {ranking.length > 0
                    ? `Ditemukan ${ranking.length} unit excavator yang diurutkan berdasarkan skor tertinggi.`
                    : 'Pilih kelas tonase dan klik "Hitung Rekomendasi" untuk melihat peringkat.'}
                </p>
              </div>
            </div>

            {errorSAW && (
              <div style={s.errorBox}>
                <span>{errorSAW}</span>
              </div>
            )}

            {loadingCalc && (
              <div style={s.loadingContainer}>
                <div style={s.spinner} />
                <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: '600' }}>
                  Memproses normalisasi matriks SAW & kalkulasi preferensi...
                </p>
              </div>
            )}

            {!loadingCalc && ranking.length > 0 && (
              <div style={s.unitGrid}>
                {ranking.map((item, idx) => {
                  const medal = getMedalInfo(idx);
                  return (
                    <div 
                      key={item.id || idx} 
                      style={{
                        ...s.unitCard,
                        border: idx === 0 ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                        boxShadow: idx === 0 ? '0 6px 20px -4px rgba(245, 158, 11, 0.15)' : '0 2px 8px rgba(15, 23, 42, 0.04)',
                      }}
                    >
                      {/* Top Ribbon */}
                      <div style={{
                        ...s.ribbonBar,
                        backgroundColor: medal.bg,
                        borderColor: medal.border,
                        color: medal.color,
                      }}>
                        <Award size={16} />
                        <span style={s.ribbonText}>{medal.label}</span>
                        {idx === 0 && <span style={s.topScoreTag}>SKOR TERTINGGI</span>}
                      </div>

                      <div style={s.unitBody}>
                        {/* Unit Info */}
                        <div style={s.unitInfoRow}>
                          <div>
                            <h4 style={s.unitName}>{item.name || item.nama_unit || 'Excavator Unit'}</h4>
                            <p style={s.unitBrand}>Brand: <strong>{item.brand}</strong> · Model: {item.model || 'Standard'}</p>
                          </div>
                          <div style={s.scoreBox}>
                            <span style={s.scoreLabel}>SKOR SAW</span>
                            <span style={s.scoreNumber}>{Number(item.skor_akhir || 0).toFixed(4)}</span>
                          </div>
                        </div>

                        {/* Specs Grid */}
                        <div style={s.specsGrid}>
                          <div style={s.specBox}>
                            <Zap size={15} style={s.specIcon} />
                            <span style={s.specVal}>{item.tenaga_mesin || '-'} HP</span>
                            <span style={s.specLab}>Tenaga Mesin</span>
                          </div>
                          <div style={s.specBox}>
                            <Layers size={15} style={s.specIcon} />
                            <span style={s.specVal}>{item.kapasitas_bucket || '-'} m³</span>
                            <span style={s.specLab}>Bucket</span>
                          </div>
                          <div style={s.specBox}>
                            <Maximize2 size={15} style={s.specIcon} />
                            <span style={s.specVal}>{item.kedalaman_gali || '-'} m</span>
                            <span style={s.specLab}>Kedalaman</span>
                          </div>
                          <div style={s.specBox}>
                            <Scale size={15} style={s.specIcon} />
                            <span style={s.specVal}>{item.berat_operasional || item.kapasitas_ton || '-'} Ton</span>
                            <span style={s.specLab}>Tonase</span>
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div style={s.unitFooter}>
                          <div>
                            <span style={s.priceLabel}>Estimasi Harga Unit</span>
                            <div style={s.priceValue}>
                              {item.harga ? `Rp ${(Number(item.harga) / 1e6).toLocaleString('id-ID')} Jt` : 'Hubungi Sales'}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRFQClick(item)}
                            style={{
                              ...s.rfqButton,
                              backgroundColor: idx === 0 ? '#f59e0b' : '#0f172a',
                              color: idx === 0 ? '#0f172a' : '#ffffff',
                            }}
                          >
                            <FileText size={15} />
                            <span>Ajukan Penawaran (RFQ)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loadingCalc && ranking.length === 0 && !errorSAW && (
              <div style={s.emptyState}>
                <Truck size={44} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} />
                <h4 style={{ color: '#0f172a', marginBottom: '0.4rem' }}>Belum ada data untuk kelas ini</h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Pilih tonase 5 Ton, 20 Ton, atau 30 Ton lalu klik <strong>Hitung Rekomendasi</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 4. WORKFLOW STEPS SECTION ── */}
      <section style={s.workflowSection}>
        <div style={s.workflowInner}>
          <div style={s.workflowHeader}>
            <span style={s.sectionPill}>ALUR PENGADAAN MUDAH</span>
            <h2 style={s.sectionTitle}>Bagaimana Alur Pemesanan di HeavyCare ID?</h2>
            <p style={s.sectionSub}>Proses terstruktur dari penentuan kriteria hingga unit tiba di lokasi proyek.</p>
          </div>

          <div style={s.stepGrid}>
            {[
              { num: '01', title: 'Pilih Unit / Atur SAW', desc: 'Jelajahi katalog unit ready stock atau hitung rekomendasi sesuai bobot prioritas proyek.' },
              { num: '02', title: 'Ajukan RFQ (Guest/Member)', desc: 'Isi data PIC & lokasi proyek untuk menerima penawaran harga resmi dari Sales.' },
              { num: '03', title: 'Pembayaran DP & PDI', desc: 'Transfer uang muka (DP 10%) dan tim mekanik melakukan Pre-Delivery Inspection fisik.' },
              { num: '04', title: 'Pengiriman & Terbit BAST', desc: 'Unit dikirim ke lokasi proyek dan Berita Acara Serah Terima otomatis diterbitkan.' },
            ].map((st) => (
              <div key={st.num} style={s.stepCard}>
                <div style={s.stepNum}>{st.num}</div>
                <h4 style={s.stepCardTitle}>{st.title}</h4>
                <p style={s.stepCardDesc}>{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modals ── */}
      <GuestRFQModal
        isOpen={rfqOpen}
        onClose={() => setRfqOpen(false)}
        alatBeratId={rfqItem?.id || rfqItem?.alat_berat_id}
        namaAlat={rfqItem?.name && rfqItem.name.trim() !== 'Excavator' ? rfqItem.name : `${rfqItem?.brand || ''} ${rfqItem?.model || ''}`}
        onSuccess={handleRFQSuccess}
      />
      <RFQSuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        nomorTracking={nomorTracking}
      />
    </div>
  );
};

const s = {
  page: {
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  hero: {
    backgroundColor: '#0f172a',
    backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.18) 0%, rgba(15,23,42,0) 70%)',
    borderBottom: '2px solid #e2e8f0',
    padding: '4.5rem 1.5rem 4rem',
  },
  heroInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    color: '#f8fafc',
    padding: '0.45rem 1.1rem',
    borderRadius: '999px',
    fontSize: '0.78rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    letterSpacing: '1px',
    marginBottom: '1.75rem',
    boxShadow: '0 0 20px rgba(245, 158, 11, 0.12)',
  },
  heroTitle: {
    fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#f8fafc',
    lineHeight: '1.16',
    letterSpacing: '-0.04em',
    margin: '0 0 1.25rem',
  },
  heroAccent: {
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    maxWidth: '820px',
    margin: '0 auto 2.25rem',
    color: '#94a3b8',
    fontSize: '1.05rem',
    lineHeight: '1.7',
    fontWeight: '400',
  },
  heroActionGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.85rem',
    flexWrap: 'wrap',
    marginBottom: '3.25rem',
  },
  heroPrimaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.9rem 1.75rem',
    backgroundColor: '#f59e0b',
    color: '#0f172a',
    borderRadius: '9px',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.98rem',
    textDecoration: 'none',
    boxShadow: '0 4px 16px rgba(245,158,11,0.35)',
    transition: 'transform 0.15s',
  },
  heroSecondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.9rem 1.75rem',
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    border: '1.5px solid #334155',
    borderRadius: '9px',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    fontSize: '0.98rem',
    textDecoration: 'none',
    transition: 'all 0.15s',
  },
  heroTrackBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.9rem 1.5rem',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    border: '1.5px solid #e2e8f0',
    borderRadius: '9px',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    fontSize: '0.95rem',
    textDecoration: 'none',
  },
  pillarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '1rem',
    textAlign: 'left',
  },
  pillarCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.1rem 1.25rem',
    backdropFilter: 'blur(8px)',
  },
  pillarIcon: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarTitle: {
    color: '#f8fafc',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.95rem',
    marginBottom: '0.15rem',
    letterSpacing: '-0.2px',
  },
  pillarDesc: {
    color: '#94a3b8',
    fontSize: '0.78rem',
    lineHeight: '1.35',
  },
  // Section Header
  sectionHeader: {
    textAlign: 'center',
    maxWidth: '750px',
    margin: '0 auto 2.75rem',
  },
  sectionPill: {
    display: 'inline-block',
    padding: '0.3rem 0.85rem',
    backgroundColor: '#fef3c7',
    color: '#b45309',
    borderRadius: '999px',
    fontSize: '0.74rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    letterSpacing: '1.2px',
    marginBottom: '0.75rem',
    border: '1px solid #fde68a',
  },
  sectionTitle: {
    fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 0.75rem',
    letterSpacing: '-0.035em',
  },
  sectionSub: {
    color: '#64748b',
    fontSize: '0.98rem',
    lineHeight: '1.65',
    margin: 0,
  },
  // ── Catalog Section ──
  catalogSection: {
    padding: '4.5rem 1.5rem 3.5rem',
    maxWidth: '1280px',
    margin: '0 auto',
  },
  catalogToolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '2rem',
  },
  categoryTabs: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  catTabBtn: {
    padding: '0.55rem 1.15rem',
    borderRadius: '8px',
    border: '1.5px solid',
    fontSize: '0.86rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  catalogSearchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#ffffff',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.5rem 0.85rem',
    minWidth: '280px',
  },
  catalogSearchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '0.86rem',
    color: '#0f172a',
    width: '100%',
  },
  catalogGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  catalogCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 4px 14px -2px rgba(15, 23, 42, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.15s, box-shadow 0.2s',
  },
  cardMediaWrap: {
    position: 'relative',
    height: '160px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #f1f5f9',
    overflow: 'hidden',
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardImgPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  tonBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: '#0f172a',
    color: '#fbbf24',
    fontSize: '0.7rem',
    fontWeight: '800',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  },
  cardBody: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  brandRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.4rem',
  },
  brandBadgeText: {
    fontSize: '0.72rem',
    fontWeight: '800',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  stockBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#15803d',
  },
  cardUnitName: {
    fontSize: '1.15rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 0.2rem',
    letterSpacing: '-0.02em',
  },
  cardModelText: {
    fontSize: '0.8rem',
    color: '#64748b',
    margin: '0 0 0.85rem',
  },
  cardSpecsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.4rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '0.6rem 0.4rem',
    marginBottom: '1rem',
    border: '1px solid #f1f5f9',
  },
  cardSpecItem: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  cardSpecVal: {
    fontSize: '0.82rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    color: '#0f172a',
    marginTop: '0.1rem',
  },
  cardSpecLab: {
    fontSize: '0.62rem',
    color: '#64748b',
  },
  cardFooter: {
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '0.85rem',
    borderTop: '1px solid #f1f5f9',
  },
  cardPriceLabel: {
    display: 'block',
    fontSize: '0.66rem',
    color: '#64748b',
    fontWeight: '600',
  },
  cardPriceVal: {
    fontSize: '1.08rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#059669',
    letterSpacing: '-0.02em',
  },
  cardRfqBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.6rem 1.1rem',
    backgroundColor: '#0f172a',
    color: '#fbbf24',
    border: 'none',
    borderRadius: '8px',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.84rem',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.2)',
    transition: 'all 0.15s',
  },
  // ── SAW Section ──
  sawSection: {
    padding: '4.5rem 1.5rem',
    maxWidth: '1280px',
    margin: '0 auto',
    borderTop: '1px solid #e2e8f0',
  },
  sawContainer: {
    display: 'grid',
    gridTemplateColumns: '370px 1fr',
    gap: '1.75rem',
    alignItems: 'flex-start',
  },
  formPanel: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '1.6rem',
    boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
    position: 'sticky',
    top: '80px',
  },
  panelHead: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    marginBottom: '1.2rem',
    paddingBottom: '0.85rem',
    borderBottom: '1px solid #f1f5f9',
  },
  panelHeadIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    backgroundColor: '#fef3c7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelHeadTitle: {
    fontSize: '1.05rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 0.15rem',
    letterSpacing: '-0.02em',
  },
  panelHeadSub: {
    fontSize: '0.72rem',
    color: '#64748b',
    margin: 0,
  },
  fieldGroup: {
    marginBottom: '1.15rem',
  },
  fieldLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '0.5rem',
  },
  fieldRequired: {
    fontSize: '0.68rem',
    color: '#d97706',
    backgroundColor: '#fef3c7',
    padding: '0.08rem 0.35rem',
    borderRadius: '4px',
  },
  tonaseGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '0.45rem',
  },
  tonaseBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    border: '1.5px solid #e2e8f0',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s',
  },
  formDivider: {
    borderBottom: '1px solid #f1f5f9',
    margin: '1.1rem 0',
  },
  sliderGroup: {
    marginBottom: '1.1rem',
  },
  sliderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.35rem',
  },
  sliderLabel: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#1e293b',
  },
  sliderBadge: {
    fontSize: '0.68rem',
    fontWeight: '800',
    padding: '0.12rem 0.45rem',
    borderRadius: '5px',
    border: '1px solid #e2e8f0',
  },
  sliderInput: {
    width: '100%',
    cursor: 'pointer',
    accentColor: '#f59e0b',
  },
  sliderDesc: {
    display: 'block',
    fontSize: '0.7rem',
    color: '#64748b',
    marginTop: '0.2rem',
    lineHeight: '1.3',
  },
  submitBtn: {
    width: '100%',
    marginTop: '0.85rem',
    padding: '0.85rem',
    backgroundColor: '#0f172a',
    color: '#fbbf24',
    border: 'none',
    borderRadius: '9px',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.94rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.45rem',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
    transition: 'all 0.15s',
  },
  resultPanel: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '1.75rem',
    boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
    minHeight: '460px',
  },
  resultHeader: {
    marginBottom: '1.25rem',
    paddingBottom: '0.85rem',
    borderBottom: '1px solid #f1f5f9',
  },
  resultTitle: {
    fontSize: '1.2rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 0.25rem',
    letterSpacing: '-0.02em',
  },
  resultSub: {
    fontSize: '0.82rem',
    color: '#64748b',
    margin: 0,
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    color: '#991b1b',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    fontSize: '0.85rem',
    marginBottom: '1.15rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4.5rem 2rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #fef3c7',
    borderTop: '3px solid #f59e0b',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  unitGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.15rem',
  },
  unitCard: {
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    transition: 'transform 0.15s, box-shadow 0.2s',
  },
  ribbonBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.55rem 1.15rem',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '0.76rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    letterSpacing: '0.5px',
  },
  ribbonText: {
    letterSpacing: '0.5px',
  },
  topScoreTag: {
    marginLeft: 'auto',
    backgroundColor: '#f59e0b',
    color: '#0f172a',
    fontSize: '0.62rem',
    fontWeight: '900',
    padding: '0.12rem 0.45rem',
    borderRadius: '4px',
    letterSpacing: '0.8px',
  },
  unitBody: {
    padding: '1.15rem 1.25rem',
  },
  unitInfoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.1rem',
  },
  unitName: {
    fontSize: '1.2rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 0.2rem',
    letterSpacing: '-0.02em',
  },
  unitBrand: {
    fontSize: '0.82rem',
    color: '#64748b',
    margin: 0,
  },
  scoreBox: {
    textAlign: 'right',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '7px',
    padding: '0.35rem 0.65rem',
  },
  scoreLabel: {
    display: 'block',
    fontSize: '0.62rem',
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: '0.8px',
  },
  scoreNumber: {
    fontSize: '1.05rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '800',
    color: '#b45309',
  },
  specsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.65rem',
    marginBottom: '1.15rem',
  },
  specBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #f1f5f9',
    borderRadius: '7px',
    padding: '0.55rem 0.65rem',
    textAlign: 'center',
  },
  specIcon: {
    color: '#f59e0b',
    marginBottom: '0.2rem',
  },
  specVal: {
    display: 'block',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.88rem',
    color: '#0f172a',
  },
  specLab: {
    display: 'block',
    fontSize: '0.66rem',
    color: '#64748b',
    marginTop: '0.1rem',
  },
  unitFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '0.85rem',
    borderTop: '1px solid #f1f5f9',
    flexWrap: 'wrap',
    gap: '0.85rem',
  },
  priceLabel: {
    display: 'block',
    fontSize: '0.7rem',
    color: '#64748b',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: '1.2rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#059669',
    letterSpacing: '-0.02em',
  },
  rfqButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.65rem 1.25rem',
    border: 'none',
    borderRadius: '8px',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.88rem',
    cursor: 'pointer',
    transition: 'transform 0.1s',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3.5rem 2rem',
  },
  workflowSection: {
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e2e8f0',
    padding: '4rem 1.5rem',
  },
  workflowInner: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  workflowHeader: {
    textAlign: 'center',
    maxWidth: '700px',
    margin: '0 auto 2.5rem',
  },
  stepGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '1.25rem',
  },
  stepCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.6rem 1.35rem',
    position: 'relative',
    transition: 'transform 0.15s',
  },
  stepNum: {
    fontSize: '2rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#f59e0b',
    lineHeight: 1,
    marginBottom: '0.6rem',
  },
  stepCardTitle: {
    fontSize: '1.02rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: '0.4rem',
    letterSpacing: '-0.2px',
  },
  stepCardDesc: {
    fontSize: '0.82rem',
    color: '#64748b',
    lineHeight: '1.55',
    margin: 0,
  },
};

export default LandingPage;
