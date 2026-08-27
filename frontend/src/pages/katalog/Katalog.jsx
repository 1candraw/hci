import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { alatBeratService } from '../../services/alatBerat.service';
import FormPemesananModal from '../../components/forms/FormPemesananModal';
import {
  Truck,
  Search,
  Scale,
  FileText,
  ArrowRight,
  X,
  SlidersHorizontal
} from 'lucide-react';

const Katalog = () => {
  const [alatBerat, setAlatBerat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State untuk fitur Compare & Detail
  const [compareList, setCompareList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); 
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // State untuk modal pesanan
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [orderItem, setOrderItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await alatBeratService.getAll({ status: 'approved' });
      setAlatBerat(result.data);
    } catch (err) {
      setError(err.message || 'Gagal mengambil data katalog unit');
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER FITUR COMPARE ---
  const handleCompareToggle = (mesin) => {
    const isAlreadySelected = compareList.find(item => item.id === mesin.id);
    if (isAlreadySelected) {
      setCompareList(compareList.filter(item => item.id !== mesin.id));
    } else {
      if (compareList.length >= 2) {
        alert('Maksimal hanya 2 unit alat berat yang bisa dibandingkan sekaligus!');
        return;
      }
      setCompareList([...compareList, mesin]);
    }
  };

  const handleBandingkanSekarang = () => {
    if (compareList.length < 2) {
      alert('Pilih 2 mesin terlebih dahulu untuk dibandingkan.');
      return;
    }
    setIsCompareOpen(true); 
  };

  // --- HANDLER FITUR DETAIL ---
  const handleDetailClick = (mesin) => {
    setSelectedItem(mesin);
    setIsDetailOpen(true);
  };

  // --- HANDLER FITUR PESAN ---
  const handleOrderClick = (mesin) => {
    setOrderItem(mesin);
    setIsOrderOpen(true);
  };

  const filteredList = alatBerat.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.brand?.toLowerCase().includes(q) ||
      item.model?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={styles.container}>
      {/* Header Halaman */}
      <div style={styles.header}>
        <div>
          <span style={styles.headerPill}>HEAVY EQUIPMENT INVENTORY</span>
          <h1 style={styles.title}>Katalog Alat Berat & Excavator</h1>
        </div>
        
        {/* Search Bar */}
        <div style={styles.searchWrap}>
          <Search size={16} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Cari unit (Komatsu, Liugong, Zoomlion)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Smart Assistant Banner */}
      <div style={styles.banner}>
        <div>
          <span style={styles.bannerTag}>SISTEM PENDUKUNG KEPUTUSAN (SPK)</span>
          <h3 style={styles.bannerTitle}>Butuh Rekomendasi Unit Paling Efisien untuk Proyek?</h3>
          <p style={styles.bannerText}>
            Gunakan kalkulator algoritma Simple Additive Weighting (SAW) untuk perangkingan objektif berdasarkan bobot harga, kapasitas, dan tenaga mesin.
          </p>
        </div>
        <Link to="/saw" style={{ textDecoration: 'none' }}>
          <button style={styles.bannerBtn}>
            <SlidersHorizontal size={16} />
            <span>Hitung Rekomendasi SAW</span>
            <ArrowRight size={15} />
          </button>
        </Link>
      </div>

      {error && <div style={styles.errorBox}>⚠️ {error}</div>}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#74c02c', borderRadius: '50%', margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: '700' }}>Memuat etalase unit alat berat...</p>
        </div>
      )}

      {/* GRID MARKETPLACE */}
      {!loading && !error && (
        <div style={styles.gridContainer}>
          {filteredList.map((item) => {
            const isSelected = compareList.some(comp => comp.id === item.id);
            return (
              <div 
                key={item.id} 
                style={{
                  ...styles.card, 
                  borderColor: isSelected ? '#74c02c' : '#e2e8f0',
                  boxShadow: isSelected ? '0 0 0 2px rgba(116, 192, 44, 0.4)' : '0 2px 8px rgba(13, 20, 30, 0.04)'
                }}
              >
                <div style={styles.imageBox}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} style={styles.image} />
                  ) : (
                    <div style={styles.noImage}>
                      <Truck size={36} style={{ color: '#94a3b8', marginBottom: '0.4rem' }} />
                      <span>Foto Unit Standar OEM</span>
                    </div>
                  )}
                  <span style={styles.brandBadge}>{item.brand}</span>
                  <span style={styles.readyBadge}>Ready Stock</span>
                </div>

                <div style={styles.infoBox}>
                  <h3 style={styles.itemName}>{item.name}</h3>
                  <p style={styles.itemModel}>Model: {item.model || '-'}</p>
                  <div style={styles.priceTag}>Rp {Number(item.harga).toLocaleString('id-ID')}</div>
                  
                  <div style={styles.specsRow}>
                    <span style={styles.specBadge}>⚖️ {item.kapasitas_ton || '-'} Ton</span>
                    <span style={styles.specBadge}>⚙️ {item.tenaga_mesin || '-'} HP</span>
                    <span style={styles.specBadge}>🪣 {item.kapasitas_bucket || '0.8'} m³</span>
                  </div>
                </div>

                <div style={styles.actionBox}>
                  <label style={{ ...styles.compareLabel, color: isSelected ? '#15803d' : '#475569' }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => handleCompareToggle(item)} 
                      style={{ cursor: 'pointer', accentColor: '#74c02c' }}
                    />
                    <span>+ Bandingkan</span>
                  </label>
                  
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => handleDetailClick(item)} style={styles.detailBtn}>
                      Detail
                    </button>
                    <button onClick={() => handleOrderClick(item)} style={styles.orderBtn}>
                      <FileText size={13} />
                      <span>Buat RFQ</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FLOATING DOCK UNTUK COMPARE */}
      {compareList.length > 0 && (
        <div style={styles.floatingDock}>
          <div style={styles.dockContent}>
            <div>
              <span style={{ fontWeight: '900', color: '#74c02c', fontFamily: "'Urbanist', sans-serif" }}>
                SIAP DIBANDINGKAN ({compareList.length}/2):
              </span>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#f8fafc' }}>
                {compareList.map(item => item.name).join(' ⚔️ ')}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button 
                onClick={() => setCompareList([])} 
                style={styles.dockClearBtn}
              >
                Reset
              </button>
              <button 
                onClick={handleBandingkanSekarang}
                disabled={compareList.length < 2}
                style={{
                  ...styles.compareExecuteBtn, 
                  opacity: compareList.length === 2 ? 1 : 0.6,
                  cursor: compareList.length === 2 ? 'pointer' : 'not-allowed'
                }}
              >
                <Scale size={16} />
                <span>Bandingkan Sekarang (2 Unit)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL POP-UP DETAIL UNIT --- */}
      {isDetailOpen && selectedItem && (
        <div style={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsDetailOpen(false)}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.modalTag}>HEAVY CARE ID · SPESIFIKASI UNIT</span>
                <h3 style={styles.modalTitle}>{selectedItem.name}</h3>
              </div>
              <button onClick={() => setIsDetailOpen(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.detailGrid}>
                <div style={styles.detailImageBox}>
                  {selectedItem.image_url ? (
                    <img src={selectedItem.image_url} alt="Detail" style={styles.detailImage} />
                  ) : (
                    <div style={styles.detailNoImage}>
                      <Truck size={48} style={{ color: '#94a3b8' }} />
                      <span>Gambar Resmi OEM</span>
                    </div>
                  )}
                </div>
                <div>
                  <div style={styles.modalPriceBox}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>Estimasi Harga Beli Resmi</span>
                    <div style={styles.modalPriceText}>Rp {Number(selectedItem.harga).toLocaleString('id-ID')}</div>
                  </div>
                  <p style={{ color: '#475569', fontSize: '0.86rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                    {selectedItem.description || 'Unit alat berat baru berstandar pabrikan dengan dukungan purna jual HEAVY CARE ID dan inspeksi fisik PDI 6 titik vital.'}
                  </p>
                  
                  <table style={styles.specTable}>
                    <tbody>
                      <tr><td style={styles.specLabel}>Merek Pabrikan</td><td style={styles.specValue}>{selectedItem.brand}</td></tr>
                      <tr><td style={styles.specLabel}>Nomor Model</td><td style={styles.specValue}>{selectedItem.model || '-'}</td></tr>
                      <tr><td style={styles.specLabel}>Kelas Tonase</td><td style={styles.specValue}>{selectedItem.kapasitas_ton || '-'} Ton</td></tr>
                      <tr><td style={styles.specLabel}>Tenaga Mesin</td><td style={styles.specValue}>{selectedItem.tenaga_mesin || '-'} HP</td></tr>
                      <tr><td style={styles.specLabel}>Kapasitas Bucket</td><td style={styles.specValue}>{selectedItem.kapasitas_bucket || '-'} m³</td></tr>
                      <tr><td style={styles.specLabel}>Kedalaman Gali</td><td style={styles.specValue}>{selectedItem.kedalaman_gali || '-'} mm</td></tr>
                      <tr><td style={styles.specLabel}>Berat Operasional</td><td style={styles.specValue}>{selectedItem.berat_operasional || '-'} Kg</td></tr>
                    </tbody>
                  </table>

                  <button 
                    onClick={() => {
                      setIsDetailOpen(false);
                      handleOrderClick(selectedItem);
                    }} 
                    style={styles.orderBtnModal}
                  >
                    <FileText size={16} />
                    <span>Buat Pengajuan Penawaran (RFQ)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL POP-UP KOMPARASI --- */}
      {isCompareOpen && compareList.length === 2 && (
        <div style={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsCompareOpen(false)}>
          <div style={{ ...styles.modalContent, maxWidth: '850px' }}>
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.modalTag}>HEAVY CARE ID · ANALISIS KOMPARASI</span>
                <h3 style={styles.modalTitle}>Perbandingan Spesifikasi Teknis 2 Unit</h3>
              </div>
              <button onClick={() => setIsCompareOpen(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <table style={styles.compareTable}>
                <thead>
                  <tr>
                    <th style={{ ...styles.cTh, width: '26%' }}>Spesifikasi</th>
                    <th style={{ ...styles.cTh, width: '37%', textAlign: 'center' }}>
                      <div style={styles.compareImgBox}>
                        {compareList[0].image_url ? <img src={compareList[0].image_url} alt="img1" style={styles.cImg}/> : 'OEM Unit'}
                      </div>
                      <div style={{ fontWeight: '900', color: '#0d141e' }}>{compareList[0].name}</div>
                    </th>
                    <th style={{ ...styles.cTh, width: '37%', textAlign: 'center' }}>
                      <div style={styles.compareImgBox}>
                        {compareList[1].image_url ? <img src={compareList[1].image_url} alt="img2" style={styles.cImg}/> : 'OEM Unit'}
                      </div>
                      <div style={{ fontWeight: '900', color: '#0d141e' }}>{compareList[1].name}</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={styles.cTr}>
                    <td style={styles.cTdLabel}>Merek</td>
                    <td style={styles.cTdValue}>{compareList[0].brand}</td>
                    <td style={styles.cTdValue}>{compareList[1].brand}</td>
                  </tr>
                  <tr style={styles.cTr}>
                    <td style={styles.cTdLabel}>Model</td>
                    <td style={styles.cTdValue}>{compareList[0].model || '-'}</td>
                    <td style={styles.cTdValue}>{compareList[1].model || '-'}</td>
                  </tr>
                  <tr style={styles.cTr}>
                    <td style={styles.cTdLabel}>Harga Estimasi</td>
                    <td style={{ ...styles.cTdValue, color: '#15803d', fontWeight: '900' }}>Rp {Number(compareList[0].harga).toLocaleString('id-ID')}</td>
                    <td style={{ ...styles.cTdValue, color: '#15803d', fontWeight: '900' }}>Rp {Number(compareList[1].harga).toLocaleString('id-ID')}</td>
                  </tr>
                  <tr style={styles.cTr}>
                    <td style={styles.cTdLabel}>Kelas Tonase</td>
                    <td style={styles.cTdValue}>{compareList[0].kapasitas_ton || '-'} Ton</td>
                    <td style={styles.cTdValue}>{compareList[1].kapasitas_ton || '-'} Ton</td>
                  </tr>
                  <tr style={styles.cTr}>
                    <td style={styles.cTdLabel}>Tenaga Mesin</td>
                    <td style={styles.cTdValue}>{compareList[0].tenaga_mesin || '-'} HP</td>
                    <td style={styles.cTdValue}>{compareList[1].tenaga_mesin || '-'} HP</td>
                  </tr>
                  <tr style={styles.cTr}>
                    <td style={styles.cTdLabel}>Kapasitas Bucket</td>
                    <td style={styles.cTdValue}>{compareList[0].kapasitas_bucket || '-'} m³</td>
                    <td style={styles.cTdValue}>{compareList[1].kapasitas_bucket || '-'} m³</td>
                  </tr>
                  <tr style={styles.cTr}>
                    <td style={styles.cTdLabel}>Kedalaman Gali</td>
                    <td style={styles.cTdValue}>{compareList[0].kedalaman_gali || '-'} mm</td>
                    <td style={styles.cTdValue}>{compareList[1].kedalaman_gali || '-'} mm</td>
                  </tr>
                  <tr style={styles.cTr}>
                    <td style={styles.cTdLabel}>Berat Operasional</td>
                    <td style={styles.cTdValue}>{compareList[0].berat_operasional || '-'} Kg</td>
                    <td style={styles.cTdValue}>{compareList[1].berat_operasional || '-'} Kg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pemesanan */}
      <FormPemesananModal 
        isOpen={isOrderOpen}
        onClose={() => setIsOrderOpen(false)}
        alatBeratId={orderItem?.id}
        namaAlat={orderItem?.name}
        sumberPesanan="katalog" 
        sawResultId={null} 
      />
    </div>
  );
};

// --- STYLING UI ---
const styles = {
  container: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '1.5rem', 
    paddingBottom: '90px',
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
    color: '#64748b',
    letterSpacing: '1.2px',
    marginBottom: '0.2rem',
  },
  title: { 
    margin: 0, 
    color: '#0d141e', 
    fontSize: '1.4rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    letterSpacing: '-0.03em',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#f8fafc',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.45rem 0.85rem',
    minWidth: '280px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '0.86rem',
    color: '#0d141e',
    width: '100%',
  },
  banner: { 
    backgroundColor: '#0d141e', 
    border: '1.5px solid #1f2937', 
    borderRadius: '14px', 
    padding: '1.5rem 1.75rem', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    flexWrap: 'wrap', 
    gap: '1.25rem',
    boxShadow: '0 10px 25px -5px rgba(13, 20, 30, 0.2)',
  },
  bannerTag: {
    display: 'inline-block',
    fontSize: '0.68rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    color: '#74c02c',
    letterSpacing: '1px',
    marginBottom: '0.35rem',
  },
  bannerTitle: { 
    margin: '0 0 0.35rem 0', 
    color: '#f8fafc', 
    fontSize: '1.15rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '800',
  },
  bannerText: { 
    margin: 0, 
    color: '#94a3b8', 
    fontSize: '0.85rem',
    maxWidth: '680px',
    lineHeight: '1.5',
  },
  bannerBtn: { 
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    backgroundColor: '#74c02c', 
    color: '#0d141e', 
    padding: '0.75rem 1.4rem', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900', 
    fontSize: '0.88rem',
    boxShadow: '0 4px 14px rgba(116, 192, 44, 0.35)',
  },
  errorBox: { 
    padding: '0.85rem 1rem', 
    backgroundColor: '#fee2e2', 
    color: '#991b1b', 
    borderRadius: '8px', 
    border: '1px solid #fca5a5',
    fontSize: '0.86rem',
  },
  gridContainer: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
    gap: '1.25rem' 
  },
  card: { 
    backgroundColor: '#ffffff', 
    borderRadius: '14px', 
    overflow: 'hidden', 
    display: 'flex', 
    flexDirection: 'column', 
    border: '1.5px solid #e2e8f0',
    transition: 'all 0.2s',
  },
  imageBox: { 
    width: '100%', 
    height: '180px', 
    backgroundColor: '#f8fafc', 
    position: 'relative',
    borderBottom: '1px solid #f1f5f9',
  },
  image: { 
    width: '100%', 
    height: '100%', 
    objectFit: 'cover' 
  },
  noImage: { 
    width: '100%', 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    color: '#94a3b8', 
    fontSize: '0.78rem',
    fontWeight: '600',
  },
  brandBadge: { 
    position: 'absolute', 
    top: '10px', 
    left: '10px', 
    backgroundColor: '#0d141e', 
    color: '#74c02c', 
    padding: '0.2rem 0.55rem', 
    borderRadius: '5px', 
    fontSize: '0.72rem', 
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    letterSpacing: '0.5px',
  },
  readyBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: '#ecfccb',
    color: '#15803d',
    border: '1px solid #d9f99d',
    padding: '0.2rem 0.55rem',
    borderRadius: '5px',
    fontSize: '0.68rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
  },
  infoBox: { 
    padding: '1.15rem', 
    flex: 1 
  },
  itemName: { 
    margin: '0 0 0.2rem 0', 
    fontSize: '1.05rem', 
    fontFamily: "'Sora', sans-serif",
    fontWeight: '800',
    color: '#0d141e' 
  },
  itemModel: { 
    margin: '0 0 0.6rem 0', 
    fontSize: '0.8rem', 
    color: '#64748b' 
  },
  priceTag: { 
    fontSize: '1.15rem', 
    fontWeight: '900', 
    color: '#15803d', 
    marginBottom: '0.85rem',
    fontFamily: "'Sora', sans-serif",
  },
  specsRow: { 
    display: 'flex', 
    gap: '0.4rem', 
    flexWrap: 'wrap' 
  },
  specBadge: { 
    backgroundColor: '#f8fafc', 
    color: '#475569', 
    padding: '0.25rem 0.45rem', 
    borderRadius: '5px', 
    fontSize: '0.72rem', 
    fontWeight: '700',
    border: '1px solid #e2e8f0' 
  },
  actionBox: { 
    padding: '0.85rem 1.15rem', 
    borderTop: '1px solid #f1f5f9', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: '#fbfcfd',
  },
  compareLabel: { 
    fontSize: '0.78rem', 
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.35rem',
    cursor: 'pointer',
  },
  detailBtn: { 
    padding: '0.45rem 0.75rem', 
    backgroundColor: '#ffffff', 
    color: '#475569', 
    border: '1.5px solid #cbd5e1', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontSize: '0.78rem', 
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800' 
  },
  orderBtn: { 
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.45rem 0.85rem', 
    backgroundColor: '#0d141e', 
    color: '#74c02c', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontSize: '0.78rem', 
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    boxShadow: '0 2px 6px rgba(13, 20, 30, 0.25)',
  },
  orderBtnModal: { 
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.45rem',
    marginTop: '1.25rem', 
    padding: '0.85rem 1.5rem', 
    backgroundColor: '#0d141e', 
    color: '#74c02c', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '0.92rem', 
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900', 
    width: '100%', 
    boxShadow: '0 4px 14px rgba(13, 20, 30, 0.25)' 
  },
  floatingDock: { 
    position: 'fixed', 
    bottom: '15px', 
    left: '280px', 
    right: '30px', 
    backgroundColor: '#0d141e', 
    color: 'white', 
    padding: '0.85rem 1.5rem', 
    zIndex: 1000, 
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(13, 20, 30, 0.4)',
    border: '1.5px solid #1f2937',
  },
  dockContent: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  dockClearBtn: {
    padding: '0.5rem 0.9rem',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    border: '1px solid #374151',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    cursor: 'pointer',
  },
  compareExecuteBtn: { 
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#74c02c', 
    color: '#0d141e', 
    padding: '0.55rem 1.2rem', 
    border: 'none', 
    borderRadius: '6px', 
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900', 
    fontSize: '0.86rem',
    transition: '0.2s' 
  },
  modalOverlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(13, 20, 30, 0.78)', 
    backdropFilter: 'blur(5px)',
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 1100, 
    padding: '1.5rem' 
  },
  modalContent: { 
    backgroundColor: 'white', 
    borderRadius: '16px', 
    width: '100%', 
    maxWidth: '720px', 
    maxHeight: '90vh', 
    overflowY: 'auto', 
    boxShadow: '0 25px 60px rgba(13, 20, 30, 0.35)',
    border: '1.5px solid #e2e8f0',
  },
  modalHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    padding: '1.4rem 1.75rem', 
    borderBottom: '1px solid #f1f5f9', 
    position: 'sticky', 
    top: 0, 
    backgroundColor: 'white', 
    zIndex: 10 
  },
  modalTag: {
    display: 'inline-block',
    fontSize: '0.68rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    color: '#15803d',
    backgroundColor: '#ecfccb',
    padding: '0.12rem 0.45rem',
    borderRadius: '4px',
    marginBottom: '0.25rem',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#0d141e',
  },
  closeBtn: { 
    background: '#f8fafc', 
    border: '1px solid #e2e8f0', 
    borderRadius: '7px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer', 
    color: '#64748b' 
  },
  modalBody: { padding: '1.75rem' },
  detailGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
    gap: '1.5rem' 
  },
  detailImageBox: { 
    width: '100%', 
    height: '240px', 
    backgroundColor: '#f8fafc', 
    borderRadius: '10px', 
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
  },
  detailImage: { width: '100%', height: '100%', objectFit: 'contain' },
  detailNoImage: { 
    width: '100%', 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    color: '#94a3b8',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  modalPriceBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    marginBottom: '0.85rem',
  },
  modalPriceText: {
    fontSize: '1.35rem',
    fontWeight: '900',
    color: '#15803d',
    fontFamily: "'Sora', sans-serif",
    marginTop: '0.2rem',
  },
  specTable: { width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' },
  specLabel: { padding: '0.55rem 0', borderBottom: '1px solid #f1f5f9', color: '#64748b', width: '45%' },
  specValue: { padding: '0.55rem 0', borderBottom: '1px solid #f1f5f9', color: '#0d141e', fontWeight: '800', textAlign: 'right' },

  compareTable: { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' },
  cTh: { padding: '1rem', backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#0d141e' },
  cTr: { borderBottom: '1px solid #f1f5f9' },
  cTdLabel: { padding: '0.75rem', backgroundColor: '#f8fafc', fontWeight: '800', color: '#475569' },
  cTdValue: { padding: '0.75rem', textAlign: 'center', color: '#0d141e' },
  compareImgBox: { width: '90px', height: '65px', margin: '0 auto 0.5rem auto', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' },
  cImg: { width: '100%', height: '100%', objectFit: 'contain' }
};

export default Katalog;