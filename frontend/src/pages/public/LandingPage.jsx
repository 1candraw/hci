import { useState, useEffect } from 'react';
import { guestService } from '../../services/guest.service';
import GuestRFQModal from '../../components/modals/GuestRFQModal';
import RFQSuccessModal from '../../components/modals/RFQSuccessModal';
import AlatBeratDetailModal from '../../components/modals/AlatBeratDetailModal';
import CompareAlatBeratModal from '../../components/modals/CompareAlatBeratModal';
import ComparisonDock from '../../components/common/ComparisonDock';
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
  Eye,
  Check,
  AlertCircle,
  Headphones,
  Globe,
  Radio,
  BookOpen,
  Cpu,
  PhoneCall,
  CheckCheck,
  Send
} from 'lucide-react';

const getLabelKepentingan = (v) =>
  ['', 'Sangat Rendah', 'Rendah', 'Cukup Penting', 'Penting', 'Sangat Penting'][v] || '';

const getBadgeStyle = (v) => {
  if (v >= 5) return { bg: '#ecfccb', text: '#365314', border: '#84cc16' };
  if (v >= 4) return { bg: '#e0e7ff', text: '#3730a3', border: '#818cf8' };
  if (v >= 3) return { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };
  return { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
};

const getMedalInfo = (i) => {
  if (i === 0) return { label: '#1 REKOMENDASI UTAMA', color: '#15803d', bg: '#ecfccb', border: '#84cc16' };
  if (i === 1) return { label: '#2 ALTERNATIF TERBAIK', color: '#334155', bg: '#f1f5f9', border: '#cbd5e1' };
  if (i === 2) return { label: '#3 PILIHAN KETIGA', color: '#854d0e', bg: '#fef9c3', border: '#fde047' };
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

  // ── Detail & Comparison State ──
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetailUnit, setSelectedDetailUnit] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // ── Active Service Tab State ──
  const [activeServicePillar, setActiveServicePillar] = useState(0);

  // ── RFQ Modal State ──
  const [rfqOpen, setRfqOpen] = useState(false);
  const [rfqItem, setRfqItem] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [nomorTracking, setNomorTracking] = useState('');

  useEffect(() => {
    fetchCatalog('Semua');
    fetchRanking();
    // eslint-disable-next-line
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

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

  const handleOpenDetail = (unit) => {
    setSelectedDetailUnit(unit);
    setDetailModalOpen(true);
  };

  const handleToggleCompare = (unit) => {
    const isAlready = compareList.some((item) => item.id === unit.id);
    if (isAlready) {
      setCompareList(compareList.filter((item) => item.id !== unit.id));
    } else {
      if (compareList.length >= 2) {
        showToast('Maksimal 2 unit alat berat yang dapat dibandingkan sekaligus. Hapus salah satu unit terlebih dahulu.');
        return;
      }
      setCompareList([...compareList, unit]);
    }
  };

  const handleRemoveCompare = (unitId) => {
    setCompareList(compareList.filter((item) => item.id !== unitId));
  };

  const handleClearCompare = () => {
    setCompareList([]);
  };

  const handleOpenCompareModal = () => {
    if (compareList.length >= 1) {
      setCompareModalOpen(true);
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

  // ── HEAVY CARE ID 5-Pillar Data ──
  const servicePillars = [
    {
      num: '01',
      title: 'Machine Lifecycle Support',
      tag: 'Pengadaan & Konsultasi',
      icon: <Truck size={24} style={{ color: '#74c02c' }} />,
      shortDesc: 'Pemilihan unit cerdas berbasis SAW, skema pembiayaan fleksibel, dan konsultasi kebutuhan proyek.',
      details: [
        'Analisis multi-kriteria berbasis SAW (Harga, Tenaga Mesin, Bucket, Kedalaman Gali, dan Bobot).',
        'Penawaran harga resmi (RFQ) transparan tanpa login untuk kontraktor & perusahaan.',
        'Fasilitas pembiayaan leasing dan cash bertahap dengan rekanan institusi keuangan terpercaya.',
        'Opsi program tukar tambah (Trade-In) dan buyback unit untuk efisiensi modal proyek.',
      ],
    },
    {
      num: '02',
      title: 'PDI & Rapid Maintenance',
      tag: 'Inspeksi & Servis Lapangan',
      icon: <Wrench size={24} style={{ color: '#74c02c' }} />,
      shortDesc: 'Uji fisik 6 komponen vital PDI sebelum kirim, teknisi mobile on-site, dan terbit BAST resmi.',
      details: [
        'Inspeksi Pre-Delivery Inspection (PDI) 6 titik vital: Mesin, Hidrolik, Undercarriage, Elektrikal, Kabin, dan Attachment.',
        'Layanan teknisi servis keliling (Mobile Service Unit) respons cepat dalam 24 jam ke lokasi proyek.',
        'Penerbitan Berita Acara Serah Terima (BAST) digital yang sah dan terarsip otomatis.',
        'Jadwal pemeliharaan berkala (Periodic Maintenance 250, 500, 1000, 2000 Jam Kerja).',
      ],
    },
    {
      num: '03',
      title: 'Genuine Spare Parts Center',
      tag: 'Suku Cadang Asli 24/7',
      icon: <Package size={24} style={{ color: '#74c02c' }} />,
      shortDesc: 'Jaringan gudang suku cadang original di seluruh regional Indonesia dengan jaminan ketersediaan cepat.',
      details: [
        'Jaminan 100% suku cadang original pabrikan (OEM Genuine Parts) dengan sertifikat keaslian.',
        'Pusat distribusi logistik suku cadang di Jakarta, Surabaya, Balikpapan, Medan, dan Makassar.',
        'Ketersediaan komponen fast-moving (Filter, Selang Hidrolik, Bucket Teeth, Seal Kit) ready stock.',
        'Pengiriman express darurat untuk meminimalkan downtime alat berat di site proyek.',
      ],
    },
    {
      num: '04',
      title: 'Operator & Technical Training',
      tag: 'Pelatihan & Sertifikasi',
      icon: <BookOpen size={24} style={{ color: '#74c02c' }} />,
      shortDesc: 'Pelatihan operator bersertifikat, instruksi keselamatan kerja K3, dan troubleshooting mandiri.',
      details: [
        'Pelatihan komprehensif pengoperasian unit excavator untuk operator proyek di lokasi kerja.',
        'Materi keselamatan kerja K3 dan optimalisasi efisiensi konsumsi bahan bakar.',
        'Panduan pemeliharaan harian (Daily Inspection Routine) dan indikator troubleshooting awal.',
        'Dukungan modul manual book digital dan video edukasi teknis dari tim instruktur bersertifikat.',
      ],
    },
    {
      num: '05',
      title: 'Smart IoT & Fleet Telematics',
      tag: 'Smart Cloud & Monitoring',
      icon: <Cpu size={24} style={{ color: '#74c02c' }} />,
      shortDesc: 'Pelacakan armada real-time, monitoring jam kerja (Hour Meter), dan diagnosis prediktif.',
      details: [
        'Integrasi telematika digital IoT untuk pelacakan lokasi GPS unit alat berat secara langsung.',
        'Pemantauan jam kerja mesin (Hour Meter Digital) dan efisiensi konsumsi bahan bakar per siklus.',
        'Deteksi dini malfungsi sistemik (Predictive Maintenance Alert) ke sistem pusat.',
        'Laporan analitik performa armada bulanan untuk manajemen operasional proyek kontraktor.',
      ],
    },
  ];

  return (
    <div style={s.page}>
      {/* ── 1. HEAVY CARE ID HERO SECTION ── */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroBadge}>
            <Sparkles size={14} style={{ color: '#74c02c' }} />
            <span>HEAVY CARE ID · FULL LIFECYCLE HEAVY MACHINERY SERVICES</span>
          </div>

          <h1 style={s.heroTitle}>
            Solusi Total Pengadaan & <br />
            <span style={s.heroAccent}>Layanan Purna Jual Alat Berat</span>
          </h1>

          <p style={s.heroSub}>
            Platform distribusi excavator dan layanan siklus penuh <strong>HEAVY CARE ID</strong> terintegrasi (Smart Cloud + Smart Control + Smart Maintenance). Didukung oleh algoritma rekomendasi SAW objektif, uji fisik PDI 6 titik vital, dan jaminan ketersediaan suku cadang resmi 24/7 di seluruh Indonesia.
          </p>

          <div style={s.heroActionGroup}>
            <a href="#katalog-section" style={s.heroPrimaryBtn}>
              <Truck size={16} />
              <span>Jelajahi Katalog Unit</span>
            </a>
            <a href="#services-section" style={s.heroSecondaryBtn}>
              <Wrench size={16} />
              <span>Layanan Purna Jual (5-Pillar)</span>
            </a>
            <a href="#saw-section" style={s.heroOutlineBtn}>
              <SlidersHorizontal size={16} />
              <span>Hitung Rekomendasi SAW</span>
            </a>
            <Link to="/tracking" style={s.heroTrackBtn}>
              <Package size={16} />
              <span>Lacak Pesanan</span>
            </Link>
          </div>

          {/* Quick Value Metrics Bar */}
          <div style={s.metricGrid}>
            {[
              { val: '100+ Unit', label: 'Ready Stock Armada', sub: 'Kelas 5 Ton Mini s/d 30+ Ton Heavy' },
              { val: '24/7 Service', label: 'Dukungan Teknisi On-Site', sub: 'Respon cepat servis di seluruh lokasi proyek' },
              { val: 'PDI 100%', label: 'Uji Fisik 6 Komponen Vital', sub: 'Sertifikasi kelaikan & penerbitan BAST resmi' },
              { val: 'Algoritma SAW', label: 'Rekomendasi Cerdas SPK', sub: 'Perangkingan objektif sesuai kriteria proyek' },
            ].map((m, idx) => (
              <div key={idx} style={s.metricCard}>
                <div style={s.metricVal}>{m.val}</div>
                <div style={s.metricLabel}>{m.label}</div>
                <div style={s.metricSub}>{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. THE 5-PILLAR HEAVY CARE ID SERVICES SECTION ── */}
      <section id="services-section" style={s.servicesSection}>
        <div style={s.sectionHeader}>
          <span style={s.sectionPill}>FULL LIFECYCLE SERVICE FRAMEWORK</span>
          <h2 style={s.sectionTitle}>Ekosistem Layanan Purna Jual HEAVY CARE ID</h2>
          <p style={s.sectionSub}>
            Kami mendampingi setiap tahap kepemilikan alat berat Anda — mulai dari konsultasi pemilihan unit, inspeksi kelaikan, servis berkala, hingga ketersediaan suku cadang resmi.
          </p>
        </div>

        {/* 5-Pillars Interactive Selector */}
        <div style={s.pillarTabs}>
          {servicePillars.map((p, idx) => (
            <button
              key={p.num}
              onClick={() => setActiveServicePillar(idx)}
              style={{
                ...s.pillarTabBtn,
                backgroundColor: activeServicePillar === idx ? '#0d141e' : '#ffffff',
                color: activeServicePillar === idx ? '#74c02c' : '#334155',
                borderColor: activeServicePillar === idx ? '#74c02c' : '#e2e8f0',
                boxShadow: activeServicePillar === idx ? '0 4px 16px rgba(116, 192, 44, 0.2)' : 'none',
              }}
            >
              <div style={s.pillarTabNum}>{p.num}</div>
              <div style={s.pillarTabTitle}>{p.title}</div>
            </button>
          ))}
        </div>

        {/* Active Pillar Showcase Detail Card */}
        <div style={s.pillarShowcaseCard}>
          <div style={s.pillarShowcaseHead}>
            <div style={s.pillarIconWrap}>
              {servicePillars[activeServicePillar].icon}
            </div>
            <div>
              <span style={s.pillarTagBadge}>{servicePillars[activeServicePillar].tag}</span>
              <h3 style={s.pillarShowcaseTitle}>
                {servicePillars[activeServicePillar].num}. {servicePillars[activeServicePillar].title}
              </h3>
              <p style={s.pillarShowcaseSub}>{servicePillars[activeServicePillar].shortDesc}</p>
            </div>
          </div>

          <div style={s.pillarDetailsGrid}>
            {servicePillars[activeServicePillar].details.map((point, pIdx) => (
              <div key={pIdx} style={s.pillarDetailItem}>
                <CheckCircle2 size={18} style={{ color: '#74c02c', flexShrink: 0, marginTop: '2px' }} />
                <span style={s.pillarDetailText}>{point}</span>
              </div>
            ))}
          </div>

          <div style={s.pillarShowcaseFooter}>
            <a href="#katalog-section" style={s.btnPillarAction}>
              <span>Ajukan Konsultasi Layanan Ini</span>
              <ChevronRight size={16} />
            </a>
            <div style={s.pillarHotlineText}>
              <Headphones size={15} style={{ color: '#74c02c' }} />
              <span>Butuh bantuan darurat? Hubungi Hotline Teknis: <strong>0812-6892-0766</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. KATALOG PRODUK EXCAVATOR ── */}
      <section id="katalog-section" style={s.catalogSection}>
        <div style={s.sectionHeader}>
          <span style={s.sectionPill}>LINI PRODUK & DISTRIBUSI</span>
          <h2 style={s.sectionTitle}>Katalog Unit Excavator HEAVY CARE ID & Heavy Machinery</h2>
          <p style={s.sectionSub}>
            Pilihan armada excavator baru berstandar pabrikan global dengan garansi resmi, inspeksi PDI ketat, dan kesiapan pengiriman cepat ke seluruh site proyek.
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
                  backgroundColor: catalogFilter === tab.id ? '#0d141e' : '#ffffff',
                  color: catalogFilter === tab.id ? '#74c02c' : '#475569',
                  borderColor: catalogFilter === tab.id ? '#0d141e' : '#e2e8f0',
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
              placeholder="Cari model unit (Liugong, Zoomlion, Develon, Lovol)..."
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
              Memuat katalog unit alat berat...
            </p>
          </div>
        ) : filteredCatalog.length > 0 ? (
          <div style={s.catalogGrid}>
            {filteredCatalog.map((unit) => {
              const isCompared = compareList.some((item) => item.id === unit.id);
              return (
                <div
                  key={unit.id}
                  style={{
                    ...s.catalogCard,
                    border: isCompared ? '2px solid #74c02c' : '1.5px solid #e2e8f0',
                    backgroundColor: isCompared ? '#fafdf5' : '#ffffff',
                    boxShadow: isCompared
                      ? '0 10px 28px -4px rgba(116, 192, 44, 0.25)'
                      : '0 4px 14px -2px rgba(13, 20, 30, 0.05)',
                  }}
                  onClick={() => handleOpenDetail(unit)}
                >
                  {/* Header Card / Image Preview */}
                  <div style={s.cardMediaWrap}>
                    {unit.image_url ? (
                      <img src={unit.image_url} alt={unit.name} style={s.cardImg} />
                    ) : (
                      <div style={s.cardImgPlaceholder}>
                        <Truck size={42} style={{ color: '#74c02c', opacity: 0.9 }} />
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.4rem', fontWeight: '700' }}>
                          {unit.brand} HEAVY MACHINERY
                        </span>
                      </div>
                    )}

                    {/* Bandingkan Toggle Button on Top Left of Media */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCompare(unit);
                      }}
                      style={{
                        ...s.cardCompareBtn,
                        backgroundColor: isCompared ? '#74c02c' : 'rgba(13, 20, 30, 0.85)',
                        color: isCompared ? '#0d141e' : '#ffffff',
                        borderColor: isCompared ? '#4d7c0f' : 'rgba(255, 255, 255, 0.2)',
                      }}
                      title={isCompared ? 'Hapus dari perbandingan' : 'Bandingkan unit ini (Maks. 2 unit)'}
                    >
                      {isCompared ? (
                        <>
                          <Check size={12} style={{ strokeWidth: 3 }} />
                          <span>Terpilih</span>
                        </>
                      ) : (
                        <>
                          <Scale size={12} />
                          <span>+ Bandingkan</span>
                        </>
                      )}
                    </button>

                    <div style={s.tonBadge}>
                      <span>Kelas {unit.kapasitas_ton || 5} Ton</span>
                    </div>
                  </div>

                  {/* Body Card */}
                  <div style={s.cardBody}>
                    <div style={s.brandRow}>
                      <span style={s.brandBadgeText}>{unit.brand || 'Excavator'}</span>
                      <span style={s.stockBadge}>
                        <CheckCircle2 size={12} style={{ color: '#15803d' }} />
                        <span>Ready Stock ({unit.stock || 1} Unit)</span>
                      </span>
                    </div>

                    <h3 style={s.cardUnitName}>
                      {unit.name && unit.name.trim() !== 'Excavator' ? unit.name : `${unit.brand} ${unit.model || ''}`}
                    </h3>
                    <p style={s.cardModelText}>Model: <strong>{unit.model || '-'}</strong></p>

                    {/* Tech Specs Grid */}
                    <div style={s.cardSpecsGrid}>
                      <div style={s.cardSpecItem}>
                        <Zap size={13} style={{ color: '#74c02c' }} />
                        <span style={s.cardSpecVal}>{unit.tenaga_mesin || '-'} HP</span>
                        <span style={s.cardSpecLab}>Tenaga</span>
                      </div>
                      <div style={s.cardSpecItem}>
                        <Layers size={13} style={{ color: '#3b82f6' }} />
                        <span style={s.cardSpecVal}>{unit.kapasitas_bucket || '-'} m³</span>
                        <span style={s.cardSpecLab}>Bucket</span>
                      </div>
                      <div style={s.cardSpecItem}>
                        <Maximize2 size={13} style={{ color: '#10b981' }} />
                        <span style={s.cardSpecVal}>{unit.kedalaman_gali || '-'} m</span>
                        <span style={s.cardSpecLab}>Kedalaman</span>
                      </div>
                      <div style={s.cardSpecItem}>
                        <Scale size={13} style={{ color: '#8b5cf6' }} />
                        <span style={s.cardSpecVal}>{unit.berat_operasional || unit.kapasitas_ton || '-'} Ton</span>
                        <span style={s.cardSpecLab}>Bobot</span>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div style={s.cardFooter}>
                      <div>
                        <span style={s.cardPriceLabel}>Harga Estimasi</span>
                        <div style={s.cardPriceVal}>
                          {unit.harga ? `Rp ${(Number(unit.harga) / 1e6).toLocaleString('id-ID')} Juta` : 'Hubungi Sales'}
                        </div>
                      </div>

                      <div style={s.cardBtnGroup}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(unit);
                          }}
                          style={s.cardDetailBtn}
                          title="Lihat spesifikasi lengkap unit"
                        >
                          <Eye size={13} />
                          <span>Detail</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRFQClick(unit);
                          }}
                          style={s.cardRfqBtn}
                          title="Ajukan penawaran harga resmi (RFQ)"
                        >
                          <FileText size={13} />
                          <span>RFQ</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={s.emptyState}>
            <Truck size={44} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} />
            <h4 style={{ color: '#0d141e', marginBottom: '0.4rem' }}>Tidak ada unit yang cocok</h4>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Coba ganti filter kelas tonase atau kata kunci pencarian Anda.
            </p>
          </div>
        )}
      </section>

      {/* ── 4. SISTEM PENDUKUNG KEPUTUSAN (SPK SAW) ── */}
      <section id="saw-section" style={s.sawSection}>
        <div style={s.sectionHeader}>
          <span style={s.sectionPill}>SISTEM PENDUKUNG KEPUTUSAN (SPK)</span>
          <h2 style={s.sectionTitle}>Konfigurasi Preferensi Proyek & Kalkulator SAW</h2>
          <p style={s.sectionSub}>
            Atur bobot kriteria teknis sesuai prioritas proyek Anda. Algoritma SAW akan menormalisasi matriks preferensi dan menghitung skor kelayakan unit tertinggi secara objektif.
          </p>
        </div>

        <div style={s.sawContainer}>
          {/* Left Form Panel */}
          <div style={s.formPanel}>
            <div style={s.panelHead}>
              <div style={s.panelHeadIcon}>
                <SlidersHorizontal size={20} style={{ color: '#15803d' }} />
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
                    { val: '5', label: 'Mini 5 Ton', sub: 'Perkotaan & Saluran Irigasi' },
                    { val: '20', label: 'Medium 20 Ton', sub: 'Konstruksi Umum & Cut-Fill' },
                    { val: '30', label: 'Heavy 30 Ton+', sub: 'Tambang & Quarry Berat' },
                  ].map((t) => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => setFilterTonase(t.val)}
                      style={{
                        ...s.tonaseBtn,
                        backgroundColor: filterTonase === t.val ? '#ecfccb' : '#ffffff',
                        borderColor: filterTonase === t.val ? '#84cc16' : '#e2e8f0',
                        boxShadow: filterTonase === t.val ? '0 2px 8px rgba(116, 192, 44, 0.2)' : 'none',
                      }}
                    >
                      <span style={{ fontWeight: '800', color: filterTonase === t.val ? '#14532d' : '#0d141e' }}>
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
                    ? `Ditemukan ${ranking.length} unit excavator yang diurutkan berdasarkan skor kelayakan tertinggi.`
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
                        border: idx === 0 ? '2px solid #74c02c' : '1px solid #e2e8f0',
                        boxShadow: idx === 0 ? '0 6px 20px -4px rgba(116, 192, 44, 0.2)' : '0 2px 8px rgba(13, 20, 30, 0.04)',
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
                          <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(item)}
                              style={s.cardDetailBtn}
                              title="Lihat detail lengkap spesifikasi unit"
                            >
                              <Eye size={14} />
                              <span>Detail</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRFQClick(item)}
                              style={{
                                ...s.rfqButton,
                                backgroundColor: idx === 0 ? '#74c02c' : '#0d141e',
                                color: idx === 0 ? '#0d141e' : '#ffffff',
                              }}
                            >
                              <FileText size={15} />
                              <span>Pesan</span>
                            </button>
                          </div>
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
                <h4 style={{ color: '#0d141e', marginBottom: '0.4rem' }}>Belum ada data untuk kelas ini</h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Pilih tonase 5 Ton, 20 Ton, atau 30 Ton lalu klik <strong>Hitung Rekomendasi</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 5. HEAVY CARE ID VISION SERVICE PHILOSOPHY & REGIONAL NETWORK ── */}
      <section id="network-section" style={s.networkSection}>
        <div style={s.networkInner}>
          <div style={s.sectionHeader}>
            <span style={{ ...s.sectionPill, backgroundColor: '#ecfccb', color: '#15803d', borderColor: '#d9f99d' }}>
              FILOSOFI LAYANAN GLOBAL
            </span>
            <h2 style={{ ...s.sectionTitle, color: '#f8fafc' }}>
              Komitmen Layanan "VISION" HEAVY CARE ID
            </h2>
            <p style={{ ...s.sectionSub, color: '#94a3b8' }}>
              Filosofi layanan berorientasi pelanggan yang memastikan kecepatan respon, kepastian suku cadang, dan keandalan operasional armada Anda.
            </p>
          </div>

          {/* VISION 6 Letters Grid */}
          <div style={s.visionGrid}>
            {[
              { letter: 'V', word: 'Value-Driven', desc: 'Memberikan nilai tambah investasi dan produktivitas maksimal pada operasional proyek Anda.' },
              { letter: 'I', word: 'Instant 24/7', desc: 'Respon cepat keluhan teknis dan pengiriman bantuan teknisi mobile dalam waktu 24 jam.' },
              { letter: 'S', word: 'Sincere Care', desc: 'Pendekatan kemitraan tulus untuk mendukung kelancaran proyek kontraktor dan perusahaan.' },
              { letter: 'I', word: 'Intelligent IoT', desc: 'Pemantauan berbasis telematika digital, hour meter digital, dan peringatan servis prediktif.' },
              { letter: 'O', word: 'Optimal Quality', desc: 'Standar uji kelaikan PDI 6 titik vital dan jaminan legalitas BAST serah terima unit.' },
              { letter: 'N', word: 'Networked Pool', desc: 'Jangkauan servis dan ketersediaan gudang suku cadang terintegrasi di seluruh pulau Indonesia.' },
            ].map((v) => (
              <div key={v.letter + v.word} style={s.visionCard}>
                <div style={s.visionLetter}>{v.letter}</div>
                <h4 style={s.visionWord}>{v.word}</h4>
                <p style={s.visionDesc}>{v.desc}</p>
              </div>
            ))}
          </div>

          {/* Regional Network Coverage in Indonesia */}
          <div style={s.coverageBox}>
            <div style={s.coverageHead}>
              <Globe size={22} style={{ color: '#74c02c' }} />
              <div>
                <h3 style={s.coverageTitle}>Cakupan Jaringan Servis & Pool Regional di Indonesia</h3>
                <p style={s.coverageSub}>Kesiapan pengiriman unit, teknisi mobile, dan suplai suku cadang resmi di seluruh pulau utama</p>
              </div>
            </div>
            <div style={s.coverageGrid}>
              {[
                { region: 'Pulau Sumatera', hub: 'Hub: Medan, Palembang, Pekanbaru', units: 'Pool Siap Kirim (Kelas 5T - 30T)' },
                { region: 'Jawa & Bali', hub: 'Hub: Jakarta, Surabaya, Semarang', units: 'Pusat Logistik & PDI Utama' },
                { region: 'Pulau Kalimantan', hub: 'Hub: Balikpapan, Samarinda, Banjarmasin', units: 'Spesialis Tambang & Konstruksi' },
                { region: 'Pulau Sulawesi', hub: 'Hub: Makassar, Manado, Kendari', units: 'Kesiapan Smelter & Infrastruktur' },
                { region: 'Maluku & Papua', hub: 'Hub: Jayapura, Sorong, Ambon', units: 'Dukungan Proyek Terpencil' },
              ].map((c, idx) => (
                <div key={idx} style={s.coverageItem}>
                  <div style={s.coverageRegion}>{c.region}</div>
                  <div style={s.coverageHub}>{c.hub}</div>
                  <div style={s.coverageUnits}>{c.units}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. QUICK INQUIRY / CONSULTATION SECTION ── */}
      <section style={s.inquirySection}>
        <div style={s.inquiryInner}>
          <div style={s.inquiryLeft}>
            <span style={s.inquiryPill}>KONSULTASI PENGADAAN & SERVIS</span>
            <h2 style={s.inquiryTitle}>Butuh Penawaran Resmi atau Jadwal Servis Alat Berat?</h2>
            <p style={s.inquiryDesc}>
              Hubungi tim spesialis HEAVY CARE ID kami sekarang. Kami siap membantu perhitungan kebutuhan armada, estimasi harga OTR, dan skema pembiayaan proyek Anda.
            </p>
            <div style={s.inquiryContactList}>
              <div style={s.inquiryContactItem}>
                <Headphones size={18} style={{ color: '#74c02c' }} />
                <div>
                  <strong>Hotline Servis 24/7</strong>
                  <p>+62 812-6892-0766 (WhatsApp Aktif)</p>
                </div>
              </div>
              <div style={s.inquiryContactItem}>
                <ShieldCheck size={18} style={{ color: '#74c02c' }} />
                <div>
                  <strong>Jaminan Resmi Pabrikan</strong>
                  <p>Suku Cadang Asli & Inspeksi PDI 100%</p>
                </div>
              </div>
            </div>
          </div>

          <div style={s.inquiryRight}>
            <div style={s.inquiryBox}>
              <h3 style={s.inquiryBoxTitle}>Ajukan Penawaran Cepat</h3>
              <p style={s.inquiryBoxSub}>Pilih unit dari katalog atau ajukan RFQ instan tanpa perlu login.</p>
              <a href="#katalog-section" style={s.btnInquirySubmit}>
                <FileText size={16} />
                <span>Pilih Unit & Ajukan RFQ Sekarang</span>
              </a>
              <Link to="/tracking" style={s.btnInquiryTrack}>
                <Package size={16} />
                <span>Lacak Status Pesanan Anda</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparison Floating Dock ── */}
      <ComparisonDock
        compareList={compareList}
        onRemove={handleRemoveCompare}
        onClear={handleClearCompare}
        onOpenCompare={handleOpenCompareModal}
      />

      {/* ── Modals ── */}
      <AlatBeratDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        unit={selectedDetailUnit}
        onRFQ={handleRFQClick}
        onToggleCompare={handleToggleCompare}
        isCompared={selectedDetailUnit ? compareList.some((u) => u.id === selectedDetailUnit.id) : false}
      />

      <CompareAlatBeratModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        units={compareList}
        onRFQ={handleRFQClick}
        onRemoveUnit={handleRemoveCompare}
      />

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

      {/* ── Floating Toast Alert ── */}
      {toastMessage && (
        <div style={s.toastContainer}>
          <AlertCircle size={18} style={{ color: '#74c02c', flexShrink: 0 }} />
          <span style={s.toastText}>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} style={s.toastCloseBtn} aria-label="Tutup Notifikasi">✕</button>
        </div>
      )}
    </div>
  );
};

const s = {
  page: {
    backgroundColor: '#f8fafc',
    color: '#0d141e',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // ── Hero Section ──
  hero: {
    backgroundColor: '#0d141e',
    backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(116, 192, 44, 0.22) 0%, rgba(13, 20, 30, 0) 70%)',
    borderBottom: '2px solid #1e293b',
    padding: '5rem 1.5rem 4.5rem',
  },
  heroInner: {
    maxWidth: '1240px',
    margin: '0 auto',
    textAlign: 'center',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#111827',
    border: '1.5px solid #1f2937',
    color: '#f8fafc',
    padding: '0.45rem 1.25rem',
    borderRadius: '999px',
    fontSize: '0.78rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    letterSpacing: '1px',
    marginBottom: '1.75rem',
    boxShadow: '0 0 25px rgba(116, 192, 44, 0.15)',
  },
  heroTitle: {
    fontSize: 'clamp(2.4rem, 5.2vw, 3.9rem)',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#f8fafc',
    lineHeight: '1.15',
    letterSpacing: '-0.04em',
    margin: '0 0 1.35rem',
  },
  heroAccent: {
    background: 'linear-gradient(135deg, #a3e635 0%, #74c02c 50%, #4d7c0f 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    maxWidth: '860px',
    margin: '0 auto 2.5rem',
    color: '#94a3b8',
    fontSize: '1.05rem',
    lineHeight: '1.75',
    fontWeight: '400',
  },
  heroActionGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.85rem',
    flexWrap: 'wrap',
    marginBottom: '3.5rem',
  },
  heroPrimaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.9rem 1.75rem',
    backgroundColor: '#74c02c',
    color: '#0d141e',
    borderRadius: '9px',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.98rem',
    textDecoration: 'none',
    boxShadow: '0 4px 16px rgba(116, 192, 44, 0.4)',
    transition: 'transform 0.15s',
  },
  heroSecondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.9rem 1.75rem',
    backgroundColor: '#111827',
    color: '#f8fafc',
    border: '1.5px solid #334155',
    borderRadius: '9px',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    fontSize: '0.98rem',
    textDecoration: 'none',
  },
  heroOutlineBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.9rem 1.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#cbd5e1',
    border: '1.5px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '9px',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    fontSize: '0.95rem',
    textDecoration: 'none',
  },
  heroTrackBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.9rem 1.5rem',
    backgroundColor: '#ffffff',
    color: '#0d141e',
    border: '1.5px solid #e2e8f0',
    borderRadius: '9px',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    fontSize: '0.95rem',
    textDecoration: 'none',
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '1rem',
    textAlign: 'left',
  },
  metricCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.75)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.2rem 1.35rem',
    backdropFilter: 'blur(8px)',
  },
  metricVal: {
    fontSize: '1.45rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#74c02c',
    marginBottom: '0.15rem',
  },
  metricLabel: {
    color: '#f8fafc',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.95rem',
    marginBottom: '0.2rem',
  },
  metricSub: {
    color: '#94a3b8',
    fontSize: '0.78rem',
    lineHeight: '1.4',
  },
  // ── Section Headers ──
  sectionHeader: {
    textAlign: 'center',
    maxWidth: '780px',
    margin: '0 auto 2.85rem',
  },
  sectionPill: {
    display: 'inline-block',
    padding: '0.3rem 0.95rem',
    backgroundColor: '#ecfccb',
    color: '#15803d',
    borderRadius: '999px',
    fontSize: '0.74rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    letterSpacing: '1.2px',
    marginBottom: '0.75rem',
    border: '1px solid #d9f99d',
  },
  sectionTitle: {
    fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#0d141e',
    margin: '0 0 0.75rem',
    letterSpacing: '-0.035em',
  },
  sectionSub: {
    color: '#64748b',
    fontSize: '0.98rem',
    lineHeight: '1.65',
    margin: 0,
  },
  // ── Services Section ──
  servicesSection: {
    padding: '4.5rem 1.5rem',
    maxWidth: '1320px',
    margin: '0 auto',
  },
  pillarTabs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '0.75rem',
    marginBottom: '1.75rem',
  },
  pillarTabBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    border: '1.5px solid',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  pillarTabNum: {
    fontSize: '1.35rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    lineHeight: 1,
    marginBottom: '0.35rem',
  },
  pillarTabTitle: {
    fontSize: '0.86rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    letterSpacing: '-0.2px',
  },
  pillarShowcaseCard: {
    backgroundColor: '#ffffff',
    border: '1.5px solid #e2e8f0',
    borderRadius: '16px',
    padding: '2.25rem',
    boxShadow: '0 8px 30px -4px rgba(13, 20, 30, 0.06)',
  },
  pillarShowcaseHead: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1.25rem',
    paddingBottom: '1.5rem',
    borderBottom: '1.5px solid #f1f5f9',
    marginBottom: '1.75rem',
  },
  pillarIconWrap: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    backgroundColor: '#ecfccb',
    border: '1.5px solid #d9f99d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pillarTagBadge: {
    display: 'inline-block',
    fontSize: '0.7rem',
    fontWeight: '800',
    color: '#15803d',
    backgroundColor: '#ecfccb',
    padding: '0.12rem 0.5rem',
    borderRadius: '4px',
    letterSpacing: '0.5px',
    marginBottom: '0.35rem',
    textTransform: 'uppercase',
  },
  pillarShowcaseTitle: {
    fontSize: '1.5rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#0d141e',
    margin: '0 0 0.35rem',
    letterSpacing: '-0.025em',
  },
  pillarShowcaseSub: {
    fontSize: '0.92rem',
    color: '#64748b',
    margin: 0,
    lineHeight: '1.6',
  },
  pillarDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.15rem',
    marginBottom: '2rem',
  },
  pillarDetailItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #eef2f6',
    borderRadius: '10px',
    padding: '1rem 1.15rem',
  },
  pillarDetailText: {
    fontSize: '0.86rem',
    color: '#334155',
    lineHeight: '1.55',
    fontWeight: '600',
  },
  pillarShowcaseFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    paddingTop: '1.25rem',
    borderTop: '1px solid #f1f5f9',
  },
  btnPillarAction: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.75rem 1.4rem',
    backgroundColor: '#0d141e',
    color: '#74c02c',
    borderRadius: '8px',
    textDecoration: 'none',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.9rem',
    boxShadow: '0 2px 10px rgba(13, 20, 30, 0.2)',
  },
  pillarHotlineText: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.84rem',
    color: '#475569',
  },
  // ── Catalog Section ──
  catalogSection: {
    padding: '4.5rem 1.5rem',
    maxWidth: '1320px',
    margin: '0 auto',
    borderTop: '1px solid #e2e8f0',
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
    fontFamily: "'Urbanist', sans-serif",
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
    color: '#0d141e',
    width: '100%',
  },
  catalogGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
    gap: '1.5rem',
  },
  catalogCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.15s, box-shadow 0.2s',
    cursor: 'pointer',
  },
  cardMediaWrap: {
    position: 'relative',
    height: '165px',
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
    backgroundColor: '#0d141e',
    color: '#74c02c',
    fontSize: '0.7rem',
    fontWeight: '800',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  },
  cardCompareBtn: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontSize: '0.7rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    padding: '0.25rem 0.6rem',
    borderRadius: '6px',
    border: '1px solid',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
    transition: 'all 0.15s ease',
    backdropFilter: 'blur(4px)',
    zIndex: 2,
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
    color: '#15803d',
    backgroundColor: '#ecfccb',
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
    color: '#0d141e',
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
    color: '#0d141e',
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
    gap: '0.5rem',
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
    color: '#15803d',
    letterSpacing: '-0.02em',
  },
  cardBtnGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  cardDetailBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.55rem 0.75rem',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '7px',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  cardRfqBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.55rem 0.85rem',
    backgroundColor: '#0d141e',
    color: '#74c02c',
    border: 'none',
    borderRadius: '7px',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.82rem',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(13, 20, 30, 0.2)',
    transition: 'all 0.15s',
  },
  // ── SAW Section ──
  sawSection: {
    padding: '4.5rem 1.5rem',
    maxWidth: '1320px',
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
    border: '1.5px solid #e2e8f0',
    borderRadius: '14px',
    padding: '1.6rem',
    boxShadow: '0 4px 16px -2px rgba(13, 20, 30, 0.05)',
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
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#ecfccb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelHeadTitle: {
    fontSize: '1.05rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '800',
    color: '#0d141e',
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
    color: '#15803d',
    backgroundColor: '#ecfccb',
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
    accentColor: '#74c02c',
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
    backgroundColor: '#0d141e',
    color: '#74c02c',
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
    boxShadow: '0 4px 12px rgba(13, 20, 30, 0.2)',
    transition: 'all 0.15s',
  },
  resultPanel: {
    backgroundColor: '#ffffff',
    border: '1.5px solid #e2e8f0',
    borderRadius: '14px',
    padding: '1.75rem',
    boxShadow: '0 4px 16px -2px rgba(13, 20, 30, 0.05)',
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
    color: '#0d141e',
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
    border: '3px solid #ecfccb',
    borderTop: '3px solid #74c02c',
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
    backgroundColor: '#74c02c',
    color: '#0d141e',
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
    color: '#0d141e',
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
    color: '#15803d',
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
    color: '#74c02c',
    marginBottom: '0.2rem',
  },
  specVal: {
    display: 'block',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.88rem',
    color: '#0d141e',
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
    color: '#15803d',
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
  // ── Network & VISION Section ──
  networkSection: {
    backgroundColor: '#0d141e',
    borderTop: '1px solid #1e293b',
    padding: '5rem 1.5rem',
  },
  networkInner: {
    maxWidth: '1320px',
    margin: '0 auto',
  },
  visionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
    marginBottom: '3rem',
  },
  visionCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.5rem 1.25rem',
    textAlign: 'center',
    backdropFilter: 'blur(6px)',
  },
  visionLetter: {
    fontSize: '2.5rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#74c02c',
    lineHeight: 1,
    marginBottom: '0.4rem',
  },
  visionWord: {
    fontSize: '0.98rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    color: '#f8fafc',
    marginBottom: '0.4rem',
  },
  visionDesc: {
    fontSize: '0.78rem',
    color: '#94a3b8',
    lineHeight: '1.45',
    margin: 0,
  },
  coverageBox: {
    backgroundColor: '#111827',
    border: '1.5px solid #1f2937',
    borderRadius: '16px',
    padding: '2rem',
  },
  coverageHead: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #1f2937',
  },
  coverageTitle: {
    fontSize: '1.15rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '800',
    color: '#f8fafc',
    margin: '0 0 0.15rem',
  },
  coverageSub: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    margin: 0,
  },
  coverageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
  },
  coverageItem: {
    backgroundColor: '#0d141e',
    border: '1px solid #1f2937',
    borderRadius: '10px',
    padding: '1.1rem 1.15rem',
  },
  coverageRegion: {
    fontSize: '0.92rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    color: '#74c02c',
    marginBottom: '0.2rem',
  },
  coverageHub: {
    fontSize: '0.78rem',
    color: '#f8fafc',
    fontWeight: '700',
    marginBottom: '0.2rem',
  },
  coverageUnits: {
    fontSize: '0.72rem',
    color: '#64748b',
  },
  // ── Inquiry Section ──
  inquirySection: {
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e2e8f0',
    padding: '4.5rem 1.5rem',
  },
  inquiryInner: {
    maxWidth: '1320px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '3rem',
    alignItems: 'center',
  },
  inquiryLeft: {},
  inquiryPill: {
    display: 'inline-block',
    padding: '0.3rem 0.85rem',
    backgroundColor: '#ecfccb',
    color: '#15803d',
    borderRadius: '999px',
    fontSize: '0.72rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    letterSpacing: '1px',
    marginBottom: '0.75rem',
  },
  inquiryTitle: {
    fontSize: 'clamp(1.8rem, 3.2vw, 2.3rem)',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#0d141e',
    margin: '0 0 1rem',
    letterSpacing: '-0.03em',
    lineHeight: '1.2',
  },
  inquiryDesc: {
    fontSize: '0.96rem',
    color: '#64748b',
    lineHeight: '1.7',
    marginBottom: '1.75rem',
  },
  inquiryContactList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inquiryContactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    fontSize: '0.86rem',
    color: '#0d141e',
  },
  inquiryRight: {},
  inquiryBox: {
    backgroundColor: '#0d141e',
    color: '#ffffff',
    borderRadius: '16px',
    padding: '2.25rem',
    boxShadow: '0 12px 35px -8px rgba(13, 20, 30, 0.4)',
    border: '1.5px solid #1f2937',
  },
  inquiryBoxTitle: {
    fontSize: '1.3rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '800',
    color: '#f8fafc',
    margin: '0 0 0.4rem',
  },
  inquiryBoxSub: {
    fontSize: '0.84rem',
    color: '#94a3b8',
    marginBottom: '1.75rem',
    lineHeight: '1.5',
  },
  btnInquirySubmit: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.45rem',
    width: '100%',
    padding: '0.85rem',
    backgroundColor: '#74c02c',
    color: '#0d141e',
    textDecoration: 'none',
    borderRadius: '9px',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.92rem',
    marginBottom: '0.75rem',
    boxShadow: '0 4px 14px rgba(116, 192, 44, 0.35)',
  },
  btnInquiryTrack: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.45rem',
    width: '100%',
    padding: '0.8rem',
    backgroundColor: '#111827',
    color: '#f8fafc',
    border: '1.5px solid #334155',
    textDecoration: 'none',
    borderRadius: '9px',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    fontSize: '0.88rem',
  },
  // ── Toast Container ──
  toastContainer: {
    position: 'fixed',
    top: '24px',
    right: '24px',
    zIndex: 99999,
    backgroundColor: '#0d141e',
    color: '#ffffff',
    padding: '0.85rem 1.25rem',
    borderRadius: '12px',
    border: '1.5px solid #74c02c',
    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    maxWidth: '420px',
    animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  toastText: {
    fontSize: '0.82rem',
    lineHeight: '1.4',
    color: '#f8fafc',
  },
  toastCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '0.2rem',
    fontSize: '0.85rem',
    fontWeight: '700',
    flexShrink: 0,
  },
};

export default LandingPage;
