import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useState, useEffect } from 'react';
import { sawService } from '../../services/saw.service';
import FormPemesananModal from '../../components/forms/FormPemesananModal';

const Saw = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default langsung diarahkan ke kelas 20 Ton
  const [filterTonase, setFilterTonase] = useState('20');

  const [bobot, setBobot] = useState({
    harga_weight: 3,
    tenaga_mesin_weight: 3,
    kapasitas_bucket_weight: 3,
    kedalaman_gali_weight: 3,
    berat_operasional_weight: 3,
  });

  // +++ TAMBAHAN: State untuk mengontrol modal pesanan +++
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [orderItem, setOrderItem] = useState(null);

  useEffect(() => {
    fetchRanking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBobotChange = (e) => {
    setBobot({
      ...bobot,
      [e.target.name]: parseInt(e.target.value)
    });
  };

  const getLabelKepentingan = (nilai) => {
    switch (nilai) {
      case 1: return "Sangat Tidak Penting";
      case 2: return "Tidak Penting";
      case 3: return "Cukup Penting";
      case 4: return "Penting";
      case 5: return "Sangat Penting";
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
      
      // Menembak ke backend melalui service
      const result = await sawService.getRekomendasi(payloadData);
      
      // Mengambil array rekomendasi dari struktur response backend
      const dataArray = result?.data?.rekomendasi || [];

      if (dataArray.length === 0) {
         setError('Perhitungan berhasil, tapi tidak ada data mesin di kelas ini (Pastikan data di database sudah diset tipe_katalog = "saw").');
         setRanking([]);
      } else {
        const sortedData = [...dataArray].sort((a, b) => (b.skor_akhir || 0) - (a.skor_akhir || 0));
        setRanking(sortedData);
      }

    } catch (err) {
      console.error("Error SAW:", err);
      setError(typeof err === 'string' ? err : 'Gagal memproses data SAW');
      setRanking([]);
    } finally {
      setLoading(false);
    }
  };

  const getMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return <span style={{ paddingLeft: '8px', color: '#6b7280' }}>{index + 1}</span>;
  };

  const exportToPDF = () => {
    if (ranking.length === 0) {
      alert("Tidak ada data untuk diekspor!");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Laporan Hasil Analisis Rekomendasi Alat Berat (SAW)", 14, 15);
    doc.setFontSize(11);
    doc.setTextColor(100);
    // Teks PDF sudah dirapikan menyesuaikan spesifikasi tonase
    doc.text(`Sistem Pendukung Keputusan - Kelas: ${filterTonase} Ton`, 14, 22);
    
    const tanggalCetak = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${tanggalCetak}`, 14, 28);

    const tableColumn = ["Peringkat", "Nama Unit", "Merek", "Kategori", "Skor Akhir"];
    const tableRows = [];

    ranking.forEach((item, index) => {
      const rowData = [
        index + 1,
        item.nama_unit || item.name || '-',
        item.brand || '-',
        item.kategori || 'Excavator',
        Number(item.skor_akhir || 0).toFixed(3)
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246] } 
    });

    doc.save(`Laporan_Rekomendasi_${filterTonase}Ton.pdf`);
  };

  // +++ TAMBAHAN: Handler saat tombol Pesan ditekan +++
  const handleOrderClick = (mesin) => {
    setOrderItem(mesin);
    setIsOrderOpen(true);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Temukan Excavator yang Tepat</h2>
          <p style={styles.subtitle}>Tentukan kebutuhan proyek Anda, kemudian biarkan kami membantu menemukan excavator yang paling sesuai</p>
        </div>
        <div>
          <button onClick={exportToPDF} style={{ ...styles.actionBtn, backgroundColor: '#ef4444' }}>
            Export PDF
          </button>
        </div>
      </div>

      <div style={styles.contentWrapper}>
        <div style={styles.formPanel}>
          <h3 style={styles.sectionTitle}>Tentukan Spesifikasi</h3>
          <form onSubmit={fetchRanking}>
            
            <div style={{...styles.inputGroup, backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '6px', border: '1px solid #bfdbfe'}}>
              <label style={{...styles.label, display: 'block', marginBottom: '0.5rem', color: '#1e3a8a'}}>
                Kelas Alat
              </label>
              <select 
                value={filterTonase} 
                onChange={(e) => setFilterTonase(e.target.value)}
                style={styles.selectInput}
              >
                <option value="5">Kelas 5 Ton (Mini)</option>
                <option value="20">Kelas 20 Ton (Medium)</option>
                <option value="30">Kelas 30 Ton (Big)</option>
              </select>
            </div>

            <h3 style={{...styles.sectionTitle, marginTop: '1.5rem'}}>Tentukan Prioritas</h3>
            
            <div style={styles.inputGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Harga Unit</label>
                <span style={styles.badge}>{getLabelKepentingan(bobot.harga_weight)}</span>
              </div>
              <input type="range" name="harga_weight" min="1" max="5" value={bobot.harga_weight} onChange={handleBobotChange} style={styles.slider} />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Tenaga Mesin</label>
                <span style={styles.badge}>{getLabelKepentingan(bobot.tenaga_mesin_weight)}</span>
              </div>
              <input type="range" name="tenaga_mesin_weight" min="1" max="5" value={bobot.tenaga_mesin_weight} onChange={handleBobotChange} style={styles.slider} />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Kapasitas Bucket</label>
                <span style={styles.badge}>{getLabelKepentingan(bobot.kapasitas_bucket_weight)}</span>
              </div>
              <input type="range" name="kapasitas_bucket_weight" min="1" max="5" value={bobot.kapasitas_bucket_weight} onChange={handleBobotChange} style={styles.slider} />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Kedalaman Galian</label>
                <span style={styles.badge}>{getLabelKepentingan(bobot.kedalaman_gali_weight)}</span>
              </div>
              <input type="range" name="kedalaman_gali_weight" min="1" max="5" value={bobot.kedalaman_gali_weight} onChange={handleBobotChange} style={styles.slider} />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Berat Operasional</label>
                <span style={styles.badge}>{getLabelKepentingan(bobot.berat_operasional_weight)}</span>
              </div>
              <input type="range" name="berat_operasional_weight" min="1" max="5" value={bobot.berat_operasional_weight} onChange={handleBobotChange} style={styles.slider} />
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Menganalisis...' : 'Hitung Rekomendasi'}
            </button>
          </form>
        </div>

        <div style={styles.resultPanel}>
          <h3 style={styles.sectionTitle}>Hasil Peringkat</h3>
          
          {error && <div style={styles.errorBox}>{error}</div>}
          
          {loading ? (
            <div style={styles.loadingBox}>Sistem sedang melakukan kalkulasi matriks SAW...</div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Peringkat</th>
                    <th style={styles.th}>Nama Unit</th>
                    <th style={styles.th}>Skor</th>
                    <th style={styles.th}>Status</th>
                    {/* +++ TAMBAHAN: Kolom Aksi +++ */}
                    <th style={styles.th}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.length > 0 ? ranking.map((item, index) => (
                    <tr key={item.id || index} style={{ ...styles.tr, backgroundColor: index < 3 ? '#f0fdf4' : 'transparent' }}>
                      <td style={styles.tdActive}>
                        <span style={{ fontSize: '1.5rem' }}>{getMedal(index)}</span>
                      </td>
                      <td style={styles.td}>
                        <strong>{item.name || item.nama_unit}</strong><br/>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{item.brand} - {item.model || 'Excavator'}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.scoreBadge}>
                          {Number(item.skor_akhir || 0).toFixed(3)}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {index === 0 && <span style={styles.badgeTop}>Direkomendasikan</span>}
                      </td>
                      {/* +++ TAMBAHAN: Tombol Pesan +++ */}
                      <td style={styles.td}>
                        <button 
                          onClick={() => handleOrderClick(item)} 
                          style={styles.orderBtn}
                        >
                          Pesan
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                        Tidak ada data yang ditampilkan. Silakan pilih kelas tonase dan klik hitung.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* +++ TAMBAHAN: Render Modal Pemesanan di sini +++ */}
      <FormPemesananModal 
        isOpen={isOrderOpen}
        onClose={() => setIsOrderOpen(false)}
        // Menggunakan id atau alat_berat_id tergantung format JSON dari backend
        alatBeratId={orderItem?.id || orderItem?.alat_berat_id}
        namaAlat={orderItem?.name || orderItem?.nama_unit}
        sumberPesanan="saw" 
        sawResultId={orderItem?.saw_result_id || null} 
      />

    </div>
  );
};

const styles = {
  container: { padding: '1.5rem', backgroundColor: '#f9fafb', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  title: { margin: '0 0 0.5rem 0', color: '#1f2937' },
  subtitle: { margin: 0, color: '#6b7280', fontSize: '0.95rem' },
  actionBtn: { padding: '0.6rem 1.2rem', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  contentWrapper: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' },
  formPanel: { flex: '1 1 350px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  resultPanel: { flex: '2 1 600px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  sectionTitle: { margin: '0 0 1.5rem 0', color: '#374151', fontSize: '1.2rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' },
  selectInput: { width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', cursor: 'pointer' },
  inputGroup: { marginBottom: '1.2rem' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' },
  label: { fontWeight: '600', color: '#4b5563', fontSize: '0.9rem' },
  badge: { backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' },
  slider: { width: '100%', cursor: 'pointer' },
  submitBtn: { width: '100%', padding: '0.8rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' },
  errorBox: { padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '1rem' },
  loadingBox: { padding: '2rem', textAlign: 'center', color: '#6b7280', backgroundColor: '#f3f4f6', borderRadius: '6px' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '1rem', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#4b5563', fontWeight: '600', fontSize: '0.9rem' },
  tr: { borderBottom: '1px solid #e5e7eb', transition: 'background 0.2s' },
  td: { padding: '1rem', color: '#374151', verticalAlign: 'middle' },
  tdActive: { padding: '1rem', textAlign: 'center', width: '70px', verticalAlign: 'middle' },
  scoreBadge: { padding: '0.25rem 0.75rem', backgroundColor: '#1f2937', color: 'white', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 'bold' },
  badgeTop: { padding: '0.25rem 0.5rem', backgroundColor: '#10b981', color: 'white', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' },
  // +++ TAMBAHAN: Style untuk tombol pesan +++
  orderBtn: { padding: '0.4rem 0.8rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap' }
};

export default Saw;