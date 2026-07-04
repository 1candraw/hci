import { useState, useEffect } from 'react';
import { alatBeratService } from '../../services/alatBerat.service';

const Katalog = () => {
  const [alatBerat, setAlatBerat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // useEffect akan otomatis dijalankan saat halaman pertama kali dibuka
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await alatBeratService.getAll();
      setAlatBerat(result.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Katalog Alat Berat</h2>
        <button style={styles.addBtn}>+ Tambah Unit</button>
      </div>

      {/* Tampilan jika error atau loading */}
      {error && <div style={styles.errorBox}>{error}</div>}
      {loading && <p>Memuat data mesin dari server...</p>}

      {/* Tabel Data */}
      {!loading && !error && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>No</th>
                <th style={styles.th}>Nama Unit</th>
                <th style={styles.th}>Merek</th>
                <th style={styles.th}>Kategori</th>
                <th style={styles.th}>Harga Dasar</th>
                <th style={styles.th}>Kapasitas (Ton)</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {alatBerat.map((item, index) => (
                <tr key={item.id} style={styles.tr}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}><strong>{item.name}</strong></td>
                  <td style={styles.td}>{item.brand}</td>
                  <td style={styles.td}>{item.kategori}</td>
                  <td style={styles.td}>
                    Rp {new Intl.NumberFormat('id-ID').format(item.harga)}
                  </td>
                  <td style={styles.td}>{item.kapasitas_ton}</td>
                  <td style={styles.td}>
                    <button style={styles.actionBtn}>Detail</button>
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

// Styling UI (Mirip dengan CSS)
const styles = {
  container: { padding: '1rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { margin: 0, color: '#1f2937' },
  addBtn: { padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  errorBox: { padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '1rem' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '1rem', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#4b5563', fontWeight: '600' },
  tr: { borderBottom: '1px solid #e5e7eb' },
  td: { padding: '1rem', color: '#374151' },
  actionBtn: { padding: '0.25rem 0.75rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }
};

export default Katalog;