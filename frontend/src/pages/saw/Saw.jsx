import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useState, useEffect } from 'react';
import { sawService } from '../../services/saw.service';

const Saw = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      setLoading(true);
      setError(''); 
      const result = await sawService.getRekomendasi();
      
      let dataArray = [];
      if (result && result.data && Array.isArray(result.data.rekomendasi)) {
        dataArray = result.data.rekomendasi;
      }

      if (dataArray.length === 0) {
         setError('Perhitungan berhasil, tapi tidak ada data mesin yang dikembalikan.');
      } else {
        const sortedData = [...dataArray].sort((a, b) => (b.skor_akhir || 0) - (a.skor_akhir || 0));
        setRanking(sortedData);
      }

    } catch (err) {
      console.error("Error SAW:", err);
      setError(typeof err === 'string' ? err : 'Gagal memproses data SAW');
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

  // FUNGSI INI SEKARANG SUDAH DI DALAM KOMPONEN SAW
  const exportToPDF = () => {
    if (ranking.length === 0) {
      alert("Tidak ada data untuk diekspor!");
      return;
    }

    const doc = new jsPDF();
    
    // Judul Dokumen
    doc.setFontSize(16);
    doc.text("Laporan Hasil Analisis Rekomendasi Alat Berat (SAW)", 14, 15);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text("Sistem Pendukung Keputusan - heavy care.id", 14, 22);
    
    // Tanggal Cetak
    const tanggalCetak = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${tanggalCetak}`, 14, 28);

    // Menyiapkan Data Tabel
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

    // Menggambar Tabel
   autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246] } 
    });

    // Simpan File
    doc.save("Laporan_Rekomendasi_AlatBerat.pdf");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Analisis Rekomendasi (SAW)</h2>
          <p style={styles.subtitle}>Sistem Pendukung Keputusan Pemilihan Alat Berat</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportToPDF} style={{ ...styles.refreshBtn, backgroundColor: '#ef4444' }}>
            📄 Export PDF
          </button>
          <button onClick={fetchRanking} style={styles.refreshBtn}>
            🔄 Hitung Ulang
          </button>
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {loading && <p>Sistem sedang melakukan kalkulasi matriks SAW...</p>}

      {!loading && !error && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Peringkat</th>
                <th style={styles.th}>Nama Unit</th>
                <th style={styles.th}>Merek</th>
                <th style={styles.th}>Kategori</th>
                <th style={styles.th}>Skor Preferensi (Vi)</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((item, index) => (
                <tr key={item.id} style={{ ...styles.tr, backgroundColor: index < 3 ? '#f0fdf4' : 'transparent' }}>
                  <td style={styles.tdActive}>
                    <span style={{ fontSize: '1.5rem' }}>{getMedal(index)}</span>
                  </td>
                  <td style={styles.td}><strong>{item.name || item.nama_unit}</strong></td>
                  <td style={styles.td}>{item.brand}</td>
                  <td style={styles.td}>{item.kategori || 'Excavator'}</td>
                  <td style={styles.td}>
                    <span style={styles.scoreBadge}>
                      {Number(item.skor_akhir).toFixed(3)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {index === 0 && <span style={styles.badgeTop}>Sangat Direkomendasikan</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { margin: '0 0 0.5rem 0', color: '#1f2937' },
  subtitle: { margin: 0, color: '#6b7280', fontSize: '0.9rem' },
  refreshBtn: { padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  errorBox: { padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '1rem' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '1rem', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#4b5563', fontWeight: '600' },
  tr: { borderBottom: '1px solid #e5e7eb', transition: 'background 0.2s' },
  td: { padding: '1rem', color: '#374151', verticalAlign: 'middle' },
  tdActive: { padding: '1rem', textAlign: 'center', width: '80px', verticalAlign: 'middle' },
  scoreBadge: { padding: '0.25rem 0.75rem', backgroundColor: '#1f2937', color: 'white', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 'bold' },
  badgeTop: { padding: '0.25rem 0.5rem', backgroundColor: '#10b981', color: 'white', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }
};

export default Saw;