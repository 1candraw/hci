import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { transaksiService } from '../../services/transaksi.service';
import { useNavigate } from 'react-router-dom';

const Transaksi = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); 
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Memanggil data dari database saat halaman dibuka
  useEffect(() => {
    fetchTransaksi();
  }, []);

  const fetchTransaksi = async () => {
    try {
      setLoading(true);
      const result = await transaksiService.getAll();
      
      // Penyesuaian struktur data (seperti di SAW tadi)
      let dataArray = [];
      if (Array.isArray(result)) dataArray = result;
      else if (result?.data && Array.isArray(result.data)) dataArray = result.data;
      
      // +++ TAMBAHKAN BARIS INI UNTUK MENGINTIP DATA +++
      console.log("DATA TRANSAKSI DARI BACKEND:", dataArray);

      setQuotations(dataArray);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk Manager mengubah status menjadi "Disetujui"
  const handleApprove = async (id) => {
    if (!window.confirm('Yakin ingin menyetujui dokumen ini?')) return;
    
    try {
      // Ubah ke APPROVED
      await transaksiService.updateStatus(id, 'APPROVED'); 
      alert('Dokumen berhasil disetujui!');
      fetchTransaksi(); 
    } catch (err) {
      alert(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': 
        return <span style={{...styles.badge, backgroundColor: '#fef3c7', color: '#d97706'}}>Menunggu Penawaran</span>;
      case 'MENUNGGU_APPROVAL': 
        return <span style={{...styles.badge, backgroundColor: '#dbeafe', color: '#2563eb'}}>Menunggu Approval</span>;
      case 'APPROVED': 
        return <span style={{...styles.badge, backgroundColor: '#d1fae5', color: '#059669'}}>Disetujui Manager</span>;
      case 'REJECTED': 
        return <span style={{...styles.badge, backgroundColor: '#fee2e2', color: '#dc2626'}}>Ditolak</span>;
      case 'DP_DIBAYAR': 
        return <span style={{...styles.badge, backgroundColor: '#e0e7ff', color: '#4338ca'}}>DP Dibayar</span>;
      case 'VERIFIKASI_DP_SALES': 
        return <span style={{...styles.badge, backgroundColor: '#ede9fe', color: '#7c3aed'}}>Verifikasi DP</span>;
      case 'PROSES_OPERASIONAL': 
        return <span style={{...styles.badge, backgroundColor: '#cffafe', color: '#0891b2'}}>Inspeksi PDI</span>;
      case 'SIAP_KIRIM': 
        return <span style={{...styles.badge, backgroundColor: '#dcfce7', color: '#16a34a'}}>Siap Kirim</span>;
      case 'PENGIRIMAN': 
      case 'PROSES_PENGIRIMAN': 
        return <span style={{...styles.badge, backgroundColor: '#fef9c3', color: '#a16207'}}>Dalam Pengiriman</span>;
      case 'SELESAI': 
        return <span style={{...styles.badge, backgroundColor: '#bbf7d0', color: '#15803d'}}>Selesai ✓</span>;
      default: 
        return <span style={styles.badge}>{status || 'Draft'}</span>;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Manajemen Transaksi & Pesanan</h2>
          <p style={styles.subtitle}>Kelola semua permintaan penawaran harga alat berat (Customer & Guest RFQ)</p>
        </div>
        {user?.role === 'Customer' && (
          <button onClick={() => navigate('/katalog')} style={styles.actionBtn}>
            + Buat Permintaan
          </button>
        )}
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {loading && <p>Mengambil data dokumen...</p>}

      {!loading && !error && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>No. Dokumen</th>
                <th style={styles.th}>Customer / PIC</th>
                <th style={styles.th}>Unit Diminta</th>
                <th style={styles.th}>Sumber</th>
                <th style={styles.th}>Tanggal</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {quotations.length === 0 ? (
                <tr><td colSpan="7" style={{textAlign: 'center', padding: '2rem', color: '#6b7280'}}>Belum ada data pesanan masuk</td></tr>
              ) : (
                quotations.map((item) => (
                  <tr key={item.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong style={{color: '#1e40af'}}>{item.nomor_dokumen || item.nomor_pemesanan || item.id}</strong>
                    </td>
                    <td style={styles.td}>
                      <strong>{item.perusahaan || item.nama_customer || '-'}</strong>
                      {item.nama_customer && item.perusahaan && item.nama_customer !== item.perusahaan && (
                        <div style={{fontSize: '0.8rem', color: '#6b7280'}}>PIC: {item.nama_customer}</div>
                      )}
                    </td>
                    <td style={styles.td}>{item.nama_unit || item.nama_alat || '-'}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: item.sumber_pesanan === 'guest' ? '#fef3c7' : '#f3f4f6',
                        color: item.sumber_pesanan === 'guest' ? '#b45309' : '#4b5563'
                      }}>
                        {item.sumber_pesanan === 'guest' ? '🌐 Guest RFQ' : (item.sumber_pesanan ? item.sumber_pesanan.toUpperCase() : 'KATALOG')}
                      </span>
                    </td>
                    <td style={styles.td}>{item.tanggal || item.created_at ? new Date(item.tanggal || item.created_at).toLocaleDateString('id-ID') : '-'}</td>
                    <td style={styles.td}>{getStatusBadge(item.status)}</td>
                    <td style={styles.td}>
                      {user?.role === 'Manager' && item.status === 'MENUNGGU_APPROVAL' && (
                        <button onClick={() => handleApprove(item.id)} style={styles.approveBtn}>
                          ✅ Approve
                        </button>
                      )}
                      <button onClick={() => navigate(`/transaksi/${item.id}`)} 
                        style={styles.detailBtn}>
                        {user?.role === 'Sales' && item.status === 'PENDING' ? '✏ Input Harga' : 'Detail'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Styling UI
const styles = {
  container: { padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { margin: '0 0 0.5rem 0', color: '#1f2937' },
  subtitle: { margin: 0, color: '#6b7280', fontSize: '0.9rem' },
  actionBtn: { padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  errorBox: { padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '1rem' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '1rem', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#4b5563', fontWeight: '600' },
  tr: { borderBottom: '1px solid #e5e7eb' },
  td: { padding: '1rem', color: '#374151', verticalAlign: 'middle' },
  badge: { padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: '#f3f4f6', color: '#374151' },
  detailBtn: { padding: '0.25rem 0.75rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem', marginLeft: '0.5rem' },
  approveBtn: { padding: '0.25rem 0.75rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }
};

export default Transaksi;