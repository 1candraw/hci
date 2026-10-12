import { useState, useEffect } from 'react';
import { sawService } from '../../services/saw.service';
import { useAuth } from '../../hooks/useAuth';
import { generateSAWPDF } from '../../utils/generateSAWPDF';
import FormPemesananModal from '../../components/forms/FormPemesananModal';
import AlatBeratDetailModal from '../../components/modals/AlatBeratDetailModal';
import {
  SlidersHorizontal,
  Download,
  Sparkles,
  Trophy,
  FileText,
  Truck,
  Eye
} from 'lucide-react';

const PRESET_SKENARIO = {
  pertambangan: {
    id: 'pertambangan',
    label: 'Pertambangan',
    sub: 'Fokus Tenaga Mesin (35%), Bucket (25%), & Kedalaman Gali (25%)',
    decimalWeights: { harga: 0.05, tenaga_mesin: 0.35, kapasitas_bucket: 0.25, kedalaman_gali: 0.25, berat_operasional: 0.10 },
    weights: {
      harga_weight: 1,
      tenaga_mesin_weight: 4,
      kapasitas_bucket_weight: 3,
      kedalaman_gali_weight: 3,
      berat_operasional_weight: 1,
    },
  },
  konstruksi: {
    id: 'konstruksi',
    label: 'Konstruksi',
    sub: 'Fokus Stabilitas Berat (25%), Bucket (25%), Tenaga (20%), & Kedalaman (20%)',
    decimalWeights: { harga: 0.10, tenaga_mesin: 0.20, kapasitas_bucket: 0.25, kedalaman_gali: 0.20, berat_operasional: 0.25 },
    weights: {
      harga_weight: 1,
      tenaga_mesin_weight: 2,
      kapasitas_bucket_weight: 3,
      kedalaman_gali_weight: 2,
      berat_operasional_weight: 3,
    },
  },
  perkebunan: {
    id: 'perkebunan',
    label: 'Perkebunan',
    sub: 'Fokus Kedalaman Gali (25%), Harga (20%), Tenaga (20%), & Bucket (20%)',
    decimalWeights: { harga: 0.20, tenaga_mesin: 0.20, kapasitas_bucket: 0.20, kedalaman_gali: 0.25, berat_operasional: 0.15 },
    weights: {
      harga_weight: 2,
      tenaga_mesin_weight: 2,
      kapasitas_bucket_weight: 2,
      kedalaman_gali_weight: 3,
      berat_operasional_weight: 2,
    },
  },
};

const Saw = () => {
  const { user } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default diarahkan ke kelas 5 Ton (sesuai unit aktif di database)
  const [filterTonase, setFilterTonase] = useState('5');
  const [activePreset, setActivePreset] = useState(null);

  const [bobot, setBobot] = useState({
    harga_weight: 2,
    tenaga_mesin_weight: 2,
    kapasitas_bucket_weight: 2,
    kedalaman_gali_weight: 2,
    berat_operasional_weight: 2,
  });

  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [orderItem, setOrderItem] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetailUnit, setSelectedDetailUnit] = useState(null);

  const handleOpenDetail = (unit) => {
    setSelectedDetailUnit(unit);
    setDetailModalOpen(true);
  };

  useEffect(() => {
    fetchRanking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectPreset = (presetId) => {
    setActivePreset(presetId);
    if (PRESET_SKENARIO[presetId]) {
      setBobot({ ...PRESET_SKENARIO[presetId].weights });
    }
  };

  const handleBobotChange = (e) => {
    setActivePreset(null);
    setBobot({
      ...bobot,
      [e.target.name]: parseInt(e.target.value)
    });
  };

  const getLabelKepentingan = (nilai) => {
    switch (nilai) {
      case 1: return "1 - Tidak Penting";
      case 2: return "2 - Cukup Penting";
      case 3: return "3 - Penting";
      case 4: return "4 - Sangat Penting";
      default: return "";
    }
  };

  const fetchRanking = async (e) => {
    if (e) e.preventDefault(); 
    
    try {
      setLoading(true);
      setError(''); 
      
      const payloadData = {
        filter_kapasitas: filterTonase,
        bobot_kriteria: bobot
      };
      
      const result = await sawService.getRekomendasi(payloadData);
      const dataArray = result?.data?.rekomendasi || [];

      if (dataArray.length === 0) {
         setError('Perhitungan selesai, tapi tidak ada data unit di kelas ini (Pastikan master data diset tipe_katalog = "saw").');
         setRanking([]);
      } else {
        const sortedData = [...dataArray].sort((a, b) => (b.skor_akhir || 0) - (a.skor_akhir || 0));
        setRanking(sortedData);
      }

    } catch (err) {
      console.error("Error SAW:", err);
      setError(typeof err === 'string' ? err : 'Gagal memproses kalkulasi SAW');
      setRanking([]);
    } finally {
      setLoading(false);
    }
  };

  const getMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return <span style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: '900', color: '#64748b' }}>#{index + 1}</span>;
  };

  const exportToPDF = () => {
    generateSAWPDF({
      ranking,
      filterTonase,
      bobot,
      activePreset,
      userInfo: user,
    });
  };

  const handleOrderClick = (mesin) => {
    const stock = Number(mesin.stok ?? mesin.stock ?? 1);
    if (stock <= 0) {
      alert('Maaf, stok unit ini sedang habis (0 unit). Silakan pilih unit rekomendasi lainnya.');
      return;
    }
    setOrderItem(mesin);
    setIsOrderOpen(true);
  };

  return (
    <div style={styles.container}>
      {/* Header Halaman */}
      <div style={styles.header}>
        <div>
          <span style={styles.headerPill}>SPK SIMPLE ADDITIVE WEIGHTING (SAW)</span>
          <h1 style={styles.title}>Kalkulator Rekomendasi Cerdas Unit</h1>
          <p style={styles.subtitle}>
            Sesuaikan bobot prioritas proyek Anda untuk mendapatkan perangkingan objektif unit alat berat paling efisien.
          </p>
        </div>
        <div>
          <button onClick={exportToPDF} style={styles.exportBtn} title="Download Hasil Perangkingan SAW (PDF)">
            <Download size={15} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      <div style={styles.contentWrapper}>
        {/* Panel Form Bobot */}
        <div style={styles.formPanel}>
          <div style={styles.panelHeader}>
            <SlidersHorizontal size={17} style={{ color: '#74c02c' }} />
            <h3 style={styles.sectionTitle}>Parameter Kriteria Proyek</h3>
          </div>
          
          <form onSubmit={fetchRanking}>
            {/* Kelas Tonase Box */}
            <div style={styles.tonaseBox}>
              <label style={styles.tonaseLabel}>
                PILIHAN KELAS TONASE
              </label>
              <select 
                value={filterTonase} 
                onChange={(e) => setFilterTonase(e.target.value)}
                style={styles.selectInput}
              >
                <option value="5">Kelas Mini (5 Ton)</option>
                <option value="20">Kelas Medium (20 Ton)</option>
                <option value="30">Kelas Heavy (30 Ton+)</option>
              </select>
            </div>

            {/* Skenario Sektor Proyek (Rekomendasi Pakar) */}
            <div style={{ marginTop: '1.15rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <span style={styles.subHeading}>SKENARIO SEKTOR (PRESET PAKAR)</span>
                <span style={{
                  fontSize: '0.68rem',
                  color: activePreset ? '#15803d' : '#64748b',
                  backgroundColor: activePreset ? '#ecfccb' : '#f1f5f9',
                  padding: '0.08rem 0.35rem',
                  borderRadius: '4px',
                  fontFamily: "'Urbanist', sans-serif",
                  fontWeight: '800'
                }}>
                  {activePreset ? `${PRESET_SKENARIO[activePreset].label}` : 'Mode Kustom'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.45rem' }}>
                {Object.values(PRESET_SKENARIO).map((p) => {
                  const isSelected = activePreset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: isSelected ? '1.5px solid #84cc16' : '1.5px solid #e2e8f0',
                        backgroundColor: isSelected ? '#ecfccb' : '#ffffff',
                        boxShadow: isSelected ? '0 2px 8px rgba(116, 192, 44, 0.2)' : 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontWeight: '800', fontSize: '0.85rem', color: isSelected ? '#14532d' : '#0d141e' }}>
                        {p.label}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.1rem' }}>
                        {p.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ margin: '1.25rem 0 0.85rem' }}>
              <span style={styles.subHeading}>BOBOT KEPENTINGAN KRITERIA (1 s/d 4)</span>
            </div>
            
            <div style={styles.inputGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Efisiensi Harga Beli (Cost)</label>
                <span style={styles.badge}>{getLabelKepentingan(bobot.harga_weight)}</span>
              </div>
              <input type="range" name="harga_weight" min="1" max="4" value={bobot.harga_weight} onChange={handleBobotChange} style={styles.slider} />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Tenaga Mesin / Horsepower (Benefit)</label>
                <span style={styles.badge}>{getLabelKepentingan(bobot.tenaga_mesin_weight)}</span>
              </div>
              <input type="range" name="tenaga_mesin_weight" min="1" max="4" value={bobot.tenaga_mesin_weight} onChange={handleBobotChange} style={styles.slider} />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Kapasitas Bucket m³ (Benefit)</label>
                <span style={styles.badge}>{getLabelKepentingan(bobot.kapasitas_bucket_weight)}</span>
              </div>
              <input type="range" name="kapasitas_bucket_weight" min="1" max="4" value={bobot.kapasitas_bucket_weight} onChange={handleBobotChange} style={styles.slider} />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Kedalaman Galian mm (Benefit)</label>
                <span style={styles.badge}>{getLabelKepentingan(bobot.kedalaman_gali_weight)}</span>
              </div>
              <input type="range" name="kedalaman_gali_weight" min="1" max="4" value={bobot.kedalaman_gali_weight} onChange={handleBobotChange} style={styles.slider} />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Berat Operasional Kg (Benefit)</label>
                <span style={styles.badge}>{getLabelKepentingan(bobot.berat_operasional_weight)}</span>
              </div>
              <input type="range" name="berat_operasional_weight" min="1" max="4" value={bobot.berat_operasional_weight} onChange={handleBobotChange} style={styles.slider} />
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              <Sparkles size={16} />
              <span>{loading ? 'Menghitung Matriks SAW...' : 'Hitung Rekomendasi Cerdas'}</span>
            </button>
          </form>
        </div>

        {/* Panel Hasil Peringkat */}
        <div style={styles.resultPanel}>
          <div style={{ ...styles.panelHeader, justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy size={18} style={{ color: '#74c02c' }} />
              <h3 style={styles.sectionTitle}>Hasil Peringkat & Skor Matriks</h3>
            </div>
            {ranking.length > 0 && (
              <button
                type="button"
                onClick={exportToPDF}
                style={styles.exportBtn}
                title="Download Hasil Perangkingan SAW (PDF)"
              >
                <Download size={15} />
                <span>Download PDF</span>
              </button>
            )}
          </div>
          
          {error && <div style={styles.errorBox}>⚠️ {error}</div>}
          
          {loading ? (
            <div style={styles.loadingBox}>
              <div className="animate-spin" style={{ width: '28px', height: '28px', border: '3px solid #e2e8f0', borderTopColor: '#74c02c', borderRadius: '50%', margin: '0 auto 0.75rem' }} />
              <p style={{ margin: 0, fontWeight: '700', color: '#475569' }}>Sistem sedang menghitung matriks normalisasi & perkalian bobot SAW...</p>
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, textAlign: 'center' }}>PERINGKAT</th>
                    <th style={styles.th}>UNIT EXCAVATOR</th>
                    <th style={styles.th}>SKOR AKHIR</th>
                    <th style={styles.th}>STATUS REKOMENDASI</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.length > 0 ? ranking.map((item, index) => (
                    <tr 
                      key={item.id || index} 
                      style={{ 
                        ...styles.tr, 
                        backgroundColor: index === 0 ? '#fafff5' : 'transparent',
                      }}
                    >
                      <td style={styles.tdActive}>
                        <span style={{ fontSize: '1.4rem' }}>{getMedal(index)}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            onClick={() => handleOpenDetail(item)}
                            style={styles.unitImgThumbWrap}
                            title="Klik untuk melihat foto & spesifikasi lengkap"
                          >
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name || item.nama_unit || 'Unit Excavator'}
                                style={styles.unitImgThumb}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  if (e.target.nextElementSibling) {
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              style={{
                                ...styles.unitImgPlaceholder,
                                display: item.image_url ? 'none' : 'flex',
                              }}
                            >
                              <Truck size={22} style={{ color: '#94a3b8' }} />
                            </div>
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <strong
                                onClick={() => handleOpenDetail(item)}
                                style={styles.unitNameClickable}
                              >
                                {item.name || item.nama_unit}
                              </strong>
                              {(Number(item.stok ?? item.stock ?? 1) <= 0) && (
                                <span style={styles.badgeOutOfStock}>
                                  Stok Habis
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                              {item.brand} · {item.model || 'OEM Unit'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: '800', marginTop: '3px' }}>
                              Rp {Number(item.harga || 0).toLocaleString('id-ID')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.scoreBadge,
                          backgroundColor: index === 0 ? '#0d141e' : '#f1f5f9',
                          color: index === 0 ? '#74c02c' : '#0d141e',
                          border: index === 0 ? '1px solid #74c02c' : '1px solid #cbd5e1',
                        }}>
                          {Number(item.skor_akhir || 0).toFixed(3)}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {index === 0 ? (
                          <span style={styles.badgeTop}>★ Paling Direkomendasikan</span>
                        ) : (
                          <span style={styles.badgeStandard}>Alternatif #{index + 1}</span>
                        )}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center', justifyContent: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(item)}
                            style={styles.detailBtn}
                            title="Lihat detail spesifikasi & foto unit"
                          >
                            <Eye size={13} />
                            <span>Detail</span>
                          </button>
                          {Number(item.stok ?? item.stock ?? 1) <= 0 ? (
                            <button 
                              disabled
                              style={{
                                ...styles.orderBtn,
                                backgroundColor: '#94a3b8',
                                color: '#ffffff',
                                cursor: 'not-allowed',
                                boxShadow: 'none'
                              }}
                            >
                              <span>Stok Habis</span>
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleOrderClick(item)} 
                              style={styles.orderBtn}
                            >
                              <FileText size={13} />
                              <span>Buat RFQ</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                        <SlidersHorizontal size={32} style={{ color: '#94a3b8', marginBottom: '0.5rem' }} />
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>
                          Belum ada hasil ranking. Silakan tentukan kelas tonase dan klik "Hitung Rekomendasi".
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Pemesanan */}
      <FormPemesananModal 
        isOpen={isOrderOpen}
        onClose={() => setIsOrderOpen(false)}
        alatBeratId={orderItem?.id || orderItem?.alat_berat_id}
        namaAlat={orderItem?.name || orderItem?.nama_unit}
        sumberPesanan="saw" 
        sawResultId={orderItem?.saw_result_id || null} 
      />

      {/* Modal Detail Alat Berat */}
      <AlatBeratDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        unit={selectedDetailUnit}
        onRFQ={(mesin) => {
          setDetailModalOpen(false);
          handleOrderClick(mesin);
        }}
      />
    </div>
  );
};

const styles = {
  container: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '1.5rem', 
    fontFamily: "'Plus Jakarta Sans', sans-serif" 
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    flexWrap: 'wrap', 
    gap: '1rem',
    backgroundColor: '#ffffff',
    padding: '1.4rem 1.75rem',
    borderRadius: '16px',
    border: '1.5px solid #e2e8f0',
    boxShadow: '0 4px 14px -2px rgba(13, 20, 30, 0.04)',
  },
  headerPill: {
    display: 'inline-block',
    fontSize: '0.68rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    color: '#15803d',
    backgroundColor: '#ecfccb',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    letterSpacing: '1px',
    marginBottom: '0.35rem',
  },
  title: { 
    margin: '0 0 0.25rem 0', 
    color: '#0d141e',
    fontSize: '1.4rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    letterSpacing: '-0.03em',
  },
  subtitle: { 
    margin: 0, 
    color: '#64748b', 
    fontSize: '0.86rem' 
  },
  exportBtn: { 
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.65rem 1.25rem', 
    backgroundColor: '#f8fafc',
    color: '#0d141e',
    border: '1.5px solid #cbd5e1', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.86rem',
  },
  contentWrapper: { 
    display: 'grid', 
    gridTemplateColumns: 'minmax(320px, 380px) 1fr', 
    gap: '1.5rem', 
    alignItems: 'flex-start' 
  },
  formPanel: { 
    backgroundColor: 'white', 
    padding: '1.5rem', 
    borderRadius: '16px', 
    boxShadow: '0 2px 8px rgba(13, 20, 30, 0.03)',
    border: '1.5px solid #e2e8f0',
  },
  resultPanel: { 
    backgroundColor: 'white', 
    padding: '1.5rem', 
    borderRadius: '16px', 
    boxShadow: '0 2px 8px rgba(13, 20, 30, 0.03)',
    border: '1.5px solid #e2e8f0',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.85rem',
    marginBottom: '1.25rem',
  },
  sectionTitle: { 
    margin: 0, 
    color: '#0d141e', 
    fontSize: '1.05rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '800',
  },
  tonaseBox: {
    backgroundColor: '#0d141e',
    padding: '1rem',
    borderRadius: '10px',
    border: '1.5px solid #1f2937',
  },
  tonaseLabel: {
    display: 'block',
    fontSize: '0.68rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    color: '#74c02c',
    letterSpacing: '1px',
    marginBottom: '0.45rem',
  },
  selectInput: { 
    width: '100%', 
    padding: '0.65rem 0.85rem', 
    borderRadius: '6px', 
    border: '1px solid #374151', 
    fontSize: '0.9rem', 
    outline: 'none', 
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    color: '#0d141e',
    fontWeight: '700',
  },
  subHeading: {
    display: 'block',
    fontSize: '0.68rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: '1px',
  },
  inputGroup: { marginBottom: '1.15rem' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' },
  label: { fontWeight: '700', color: '#334155', fontSize: '0.82rem' },
  badge: { 
    backgroundColor: '#ecfccb', 
    color: '#15803d', 
    border: '1px solid #d9f99d',
    padding: '0.12rem 0.45rem', 
    borderRadius: '4px', 
    fontSize: '0.7rem', 
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900' 
  },
  slider: { 
    width: '100%', 
    cursor: 'pointer',
    accentColor: '#74c02c',
  },
  submitBtn: { 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.45rem',
    width: '100%', 
    padding: '0.85rem', 
    backgroundColor: '#0d141e', 
    color: '#74c02c', 
    border: 'none', 
    borderRadius: '8px', 
    fontSize: '0.92rem', 
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900', 
    cursor: 'pointer', 
    marginTop: '1.25rem',
    boxShadow: '0 4px 14px rgba(13, 20, 30, 0.25)',
  },
  errorBox: { 
    padding: '0.85rem 1rem', 
    backgroundColor: '#fee2e2', 
    color: '#991b1b', 
    borderRadius: '8px', 
    border: '1px solid #fca5a5',
    marginBottom: '1rem',
    fontSize: '0.86rem',
  },
  loadingBox: { 
    padding: '3rem 1rem', 
    textAlign: 'center', 
    color: '#64748b', 
    backgroundColor: '#f8fafc', 
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
  },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { 
    padding: '0.85rem 1rem', 
    borderBottom: '1.5px solid #e2e8f0', 
    backgroundColor: '#f8fafc', 
    color: '#475569', 
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900', 
    fontSize: '0.72rem',
    letterSpacing: '0.8px',
  },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '1rem', color: '#334155', verticalAlign: 'middle', fontSize: '0.86rem' },
  tdActive: { padding: '1rem', textAlign: 'center', width: '70px', verticalAlign: 'middle' },
  scoreBadge: { 
    padding: '0.3rem 0.75rem', 
    borderRadius: '999px', 
    fontSize: '0.82rem', 
    fontFamily: 'monospace',
    fontWeight: '900' 
  },
  badgeTop: { 
    display: 'inline-block',
    padding: '0.25rem 0.6rem', 
    backgroundColor: '#ecfccb', 
    color: '#15803d', 
    border: '1px solid #84cc16',
    borderRadius: '5px', 
    fontSize: '0.74rem', 
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900' 
  },
  badgeStandard: {
    display: 'inline-block',
    padding: '0.25rem 0.6rem',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '5px',
    fontSize: '0.74rem',
    fontWeight: '700',
  },
  orderBtn: { 
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.45rem 0.85rem', 
    backgroundColor: '#0d141e', 
    color: '#74c02c', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontSize: '0.78rem', 
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900', 
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 6px rgba(13, 20, 30, 0.25)',
  },
  detailBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.45rem 0.75rem',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    border: '1.5px solid #cbd5e1',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  },
  unitImgThumbWrap: {
    position: 'relative',
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(13, 20, 30, 0.05)',
  },
  unitImgThumb: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  unitImgPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  unitNameClickable: {
    color: '#0d141e',
    fontSize: '0.94rem',
    cursor: 'pointer',
  },
  badgeOutOfStock: {
    fontSize: '0.68rem',
    fontWeight: '800',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '1px 6px',
    borderRadius: '4px',
  }
};

export default Saw;