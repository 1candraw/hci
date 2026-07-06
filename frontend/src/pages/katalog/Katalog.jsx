import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { alatBeratService } from '../../services/alatBerat.service';

const Katalog = () => {
  const [alatBerat, setAlatBerat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. IDENTIFIKASI ROLE PENGGUNA
  // Sesuaikan baris ini dengan cara sistemmu menyimpan data login (misal dari Context Auth atau localStorage).
  // Contoh penggunaan asli: const userRole = localStorage.getItem('role') || 'customer';
  // Untuk pengetesan saat ini, saya set default-nya ke 'sales' agar tombolnya langsung terlihat.
  const [userRole, setUserRole] = useState('sales'); 

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
        
        {/* 2. LOGIKA PENYEMBUNYIAN TOMBOL (Hanya tampil untuk Sales & Manager) */}
        {(userRole === 'sales' || userRole === 'manager') && (
          // Asumsi path '/master-alat-berat' adalah route untuk halaman MasterAlatBerat.jsx yang kita buat tadi
          <Link to="/master-alat-berat" style={{ textDecoration: 'none' }}>
            <button style={styles.addBtn}>+ Tambah / Kelola Unit</button>
          </Link>
        )}
      </div>

      {/* --- MULAI BANNER REKOMENDASI SAW --- */}
      <div style={styles.banner}>
        <div>
          <h3 style={styles.bannerTitle}>Bingung Memilih Mesin yang Tepat? 🤔</h3>
          <p style={styles.bannerText}>
            Gunakan fitur asisten pintar kami untuk mendapatkan rekomendasi alat berat terbaik sesuai kebutuhan proyek Anda.
          </p>
        </div>
        
        <Link to="/saw">
          <button style={styles.bannerBtn}>
            Cari Mesin Terbaik ✨
          </button>
        </Link>
      </div>
      {/* --- SELESAI BANNER REKOMENDASI SAW --- */}

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

// Styling UI
const styles = {
  container: { padding: '1rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { margin: 0, color: '#1f2937' },
  addBtn: { padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  
  // Style Baru untuk Banner SAW
  banner: { backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
  bannerTitle: { margin: '0 0 0.5rem 0', color: '#1e3a8a', fontSize: '1.25rem' },
  bannerText: { margin: 0, color: '#3b82f6', fontSize: '0.9rem' },
  bannerBtn: { backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' },
  
  errorBox: { padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '1rem' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '1rem', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#4b5563', fontWeight: '600' },
  tr: { borderBottom: '1px solid #e5e7eb' },
  td: { padding: '1rem', color: '#374151' },
  actionBtn: { padding: '0.25rem 0.75rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }
};

export default Katalog;