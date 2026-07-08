import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { alatBeratService } from '../../services/alatBerat.service';

const Katalog = () => {
  const [alatBerat, setAlatBerat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State untuk fitur Compare & Detail
  const [compareList, setCompareList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); // Untuk menyimpan data mesin yang sedang dilihat detailnya
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await alatBeratService.getAll({ status: 'approved' });
      setAlatBerat(result.data);
    } catch (err) {
      setError(err.message || 'Gagal mengambil data');
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
        alert('Maksimal hanya 2 mesin yang bisa dibandingkan sekaligus!');
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
    setIsCompareOpen(true); // Buka pop-up komparasi
  };

  // --- HANDLER FITUR DETAIL ---
  const handleDetailClick = (mesin) => {
    setSelectedItem(mesin);
    setIsDetailOpen(true);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Katalog Alat Berat</h2>
      </div>

      <div style={styles.banner}>
        <div>
          <h3 style={styles.bannerTitle}>Bingung Memilih Mesin yang Tepat? 🤔</h3>
          <p style={styles.bannerText}>Gunakan fitur asisten pintar kami untuk mendapatkan rekomendasi alat berat terbaik.</p>
        </div>
        <Link to="/saw">
          <button style={styles.bannerBtn}>Cari Mesin Terbaik ✨</button>
        </Link>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {loading && <p style={{textAlign: 'center', padding: '2rem'}}>Memuat etalase mesin...</p>}

      {/* GRID MARKETPLACE */}
      {!loading && !error && (
        <div style={styles.gridContainer}>
          {alatBerat.map((item) => {
            const isSelected = compareList.some(comp => comp.id === item.id);
            return (
              <div key={item.id} style={{...styles.card, border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb'}}>
                <div style={styles.imageBox}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} style={styles.image} />
                  ) : (
                    <div style={styles.noImage}>Tidak ada foto</div>
                  )}
                  <span style={styles.brandBadge}>{item.brand}</span>
                </div>

                <div style={styles.infoBox}>
                  <h3 style={styles.itemName}>{item.name}</h3>
                  <p style={styles.itemModel}>Model: {item.model || '-'}</p>
                  <div style={styles.priceTag}>Rp {Number(item.harga).toLocaleString('id-ID')}</div>
                  <div style={styles.specsRow}>
                    <span style={styles.specBadge}>⚖️ {item.kapasitas_ton || '-'} Ton</span>
                    <span style={styles.specBadge}>⚙️ {item.tenaga_mesin || '-'} HP</span>
                  </div>
                </div>

                <div style={styles.actionBox}>
                  <label style={styles.compareLabel}>
                    <input 
                      type="checkbox" checked={isSelected} onChange={() => handleCompareToggle(item)} style={{cursor: 'pointer'}}
                    />
                    Bandingkan
                  </label>
                  <button onClick={() => handleDetailClick(item)} style={styles.detailBtn}>Detail Unit</button>
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
              <span style={{fontWeight: 'bold'}}>Siap Dibandingkan ({compareList.length}/2):</span>
              <p style={{margin: '0.2rem 0 0 0', fontSize: '0.85rem'}}>
                {compareList.map(item => item.name).join(' VS ')}
              </p>
            </div>
            <button 
              onClick={handleBandingkanSekarang}
              style={{...styles.compareExecuteBtn, opacity: compareList.length === 2 ? 1 : 0.5}}
            >
              Bandingkan Sekarang
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL POP-UP DETAIL UNIT --- */}
      {isDetailOpen && selectedItem && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>Detail Spesifikasi Unit</h3>
              <button onClick={() => setIsDetailOpen(false)} style={styles.closeBtn}>✖</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.detailGrid}>
                <div style={styles.detailImageBox}>
                  {selectedItem.image_url ? (
                    <img src={selectedItem.image_url} alt="Detail" style={styles.detailImage} />
                  ) : (
                    <div style={styles.detailNoImage}>Gambar tidak tersedia</div>
                  )}
                </div>
                <div>
                  <h2 style={{marginTop: 0, marginBottom: '0.5rem'}}>{selectedItem.name}</h2>
                  <h3 style={{color: '#ea580c', marginTop: 0}}>Rp {Number(selectedItem.harga).toLocaleString('id-ID')}</h3>
                  <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>{selectedItem.description || 'Tidak ada deskripsi.'}</p>
                  
                  <table style={styles.specTable}>
                    <tbody>
                      <tr><td style={styles.specLabel}>Merek</td><td style={styles.specValue}>{selectedItem.brand}</td></tr>
                      <tr><td style={styles.specLabel}>Model</td><td style={styles.specValue}>{selectedItem.model || '-'}</td></tr>
                      <tr><td style={styles.specLabel}>Kelas Tonase</td><td style={styles.specValue}>{selectedItem.kapasitas_ton || '-'} Ton</td></tr>
                      <tr><td style={styles.specLabel}>Tenaga Mesin</td><td style={styles.specValue}>{selectedItem.tenaga_mesin || '-'} HP</td></tr>
                      <tr><td style={styles.specLabel}>Kapasitas Bucket</td><td style={styles.specValue}>{selectedItem.kapasitas_bucket || '-'} m³</td></tr>
                      <tr><td style={styles.specLabel}>Kedalaman Gali</td><td style={styles.specValue}>{selectedItem.kedalaman_gali || '-'} mm</td></tr>
                      <tr><td style={styles.specLabel}>Berat Operasional</td><td style={styles.specValue}>{selectedItem.berat_operasional || '-'} Kg</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL POP-UP KOMPARASI --- */}
      {isCompareOpen && compareList.length === 2 && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modalContent, maxWidth: '900px'}}>
            <div style={styles.modalHeader}>
              <h3>Perbandingan Alat Berat</h3>
              <button onClick={() => setIsCompareOpen(false)} style={styles.closeBtn}>✖</button>
            </div>
            <div style={styles.modalBody}>
              <table style={styles.compareTable}>
                <thead>
                  <tr>
                    <th style={{...styles.cTh, width: '25%'}}>Spesifikasi</th>
                    <th style={{...styles.cTh, width: '37.5%', textAlign: 'center'}}>
                      <div style={styles.compareImgBox}>
                        {compareList[0].image_url ? <img src={compareList[0].image_url} alt="img1" style={styles.cImg}/> : 'No Img'}
                      </div>
                      {compareList[0].name}
                    </th>
                    <th style={{...styles.cTh, width: '37.5%', textAlign: 'center'}}>
                      <div style={styles.compareImgBox}>
                        {compareList[1].image_url ? <img src={compareList[1].image_url} alt="img2" style={styles.cImg}/> : 'No Img'}
                      </div>
                      {compareList[1].name}
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
                    <td style={styles.cTdLabel}>Harga</td>
                    <td style={{...styles.cTdValue, color: '#ea580c', fontWeight: 'bold'}}>Rp {Number(compareList[0].harga).toLocaleString('id-ID')}</td>
                    <td style={{...styles.cTdValue, color: '#ea580c', fontWeight: 'bold'}}>Rp {Number(compareList[1].harga).toLocaleString('id-ID')}</td>
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
                    <td style={styles.cTdLabel}>Berat Ops.</td>
                    <td style={styles.cTdValue}>{compareList[0].berat_operasional || '-'} Kg</td>
                    <td style={styles.cTdValue}>{compareList[1].berat_operasional || '-'} Kg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- STYLING UI ---
const styles = {
  container: { padding: '1rem', backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: '100px' },
  header: { marginBottom: '1.5rem' },
  title: { margin: 0, color: '#1f2937', fontSize: '1.5rem' },
  banner: { backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
  bannerTitle: { margin: '0 0 0.5rem 0', color: '#1e3a8a', fontSize: '1.25rem' },
  bannerText: { margin: 0, color: '#3b82f6', fontSize: '0.9rem' },
  bannerBtn: { backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)' },
  errorBox: { padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '1rem' },
  gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' },
  card: { backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', transition: 'transform 0.2s', position: 'relative' },
  imageBox: { width: '100%', height: '180px', backgroundColor: '#f3f4f6', position: 'relative' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  noImage: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontStyle: 'italic' },
  brandBadge: { position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' },
  infoBox: { padding: '1rem', flex: 1 },
  itemName: { margin: '0 0 0.2rem 0', fontSize: '1.1rem', color: '#1f2937' },
  itemModel: { margin: '0 0 0.8rem 0', fontSize: '0.85rem', color: '#6b7280' },
  priceTag: { fontSize: '1.15rem', fontWeight: 'bold', color: '#ea580c', marginBottom: '1rem' },
  specsRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  specBadge: { backgroundColor: '#f3f4f6', color: '#4b5563', padding: '0.3rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid #e5e7eb' },
  actionBox: { padding: '1rem', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  compareLabel: { fontSize: '0.85rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.4rem' },
  detailBtn: { padding: '0.4rem 0.8rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' },
  floatingDock: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#1f2937', color: 'white', padding: '1rem 2rem', zIndex: 1000, boxShadow: '0 -4px 10px rgba(0,0,0,0.1)' },
  dockContent: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  compareExecuteBtn: { backgroundColor: '#3b82f6', color: 'white', padding: '0.6rem 1.5rem', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' },
  
  // MODAL STYLES
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '1rem' },
  modalContent: { backgroundColor: 'white', borderRadius: '8px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 15px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 1.5rem', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' },
  modalBody: { padding: '1.5rem' },
  
  // Detail Unit Styles
  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' },
  detailImageBox: { width: '100%', height: '250px', backgroundColor: '#f3f4f6', borderRadius: '8px', overflow: 'hidden' },
  detailImage: { width: '100%', height: '100%', objectFit: 'contain' },
  detailNoImage: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' },
  specTable: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  specLabel: { padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb', color: '#6b7280', width: '40%' },
  specValue: { padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb', color: '#1f2937', fontWeight: '600', textAlign: 'right' },

  // Compare Styles
  compareTable: { width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' },
  cTh: { padding: '1rem', backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb', color: '#374151' },
  cTr: { borderBottom: '1px solid #e5e7eb' },
  cTdLabel: { padding: '0.8rem', backgroundColor: '#f9fafb', fontWeight: 'bold', color: '#4b5563' },
  cTdValue: { padding: '0.8rem', textAlign: 'center', color: '#1f2937' },
  compareImgBox: { width: '80px', height: '60px', margin: '0 auto 0.5rem auto', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' },
  cImg: { width: '100%', height: '100%', objectFit: 'cover' }
};

export default Katalog;