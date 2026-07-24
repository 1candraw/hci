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
        return <span style={{...styles.badge, backgroundColor: '#fef3c7', color: '#d97706'}}>Menunggu Harga</span>;
      case 'MENUNGGU_APPROVAL': 
        return <span style={{...styles.badge, backgroundColor: '#dbeafe', color: '#2563eb'}}>Menunggu Approval</span>;
      case 'APPROVED': 
        return <span style={{...styles.badge, backgroundColor: '#d1fae5', color: '#059669'}}>Disetujui</span>;
      case 'PROSES_PENGIRIMAN': 
        return <span style={{...styles.badge, backgroundColor: '#e0e7ff', color: '#4338ca'}}>Proses Pengiriman</span>;
      default: 
        return <span style={styles.badge}>{status || 'Draft'}</span>;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Manajemen Transaksi & Quotation</h2>
          <p style={styles.subtitle}>Kelola permintaan penawaran harga alat berat</p>
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
                <th style={styles.th}>Perusahaan</th>
                <th style={styles.th}>Unit Diminta</th>
                <th style={styles.th}>Tanggal</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {quotations.length === 0 ? (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '1rem'}}>Belum ada data transaksi</td></tr>
              ) : (
                quotations.map((item) => (
                  <tr key={item.id} style={styles.tr}>
                    <td style={styles.td}><strong>{item.nomor_dokumen || item.id}</strong></td>
                    <td style={styles.td}>{item.perusahaan || '-'}</td>
                    <td style={styles.td}>{item.nama_unit || '-'}</td>
                    <td style={styles.td}>{item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : '-'}</td>
                    <td style={styles.td}>{getStatusBadge(item.status)}</td>
                    <td style={styles.td}>
                      {user?.role === 'Manager' && item.status === 'MENUNGGU_APPROVAL' && (
                        <button onClick={() => handleApprove(item.id)} style={styles.approveBtn}>
                          ✅ Approve
                        </button>
                      )}
                      <button onClick={() => navigate(`/transaksi/${item.id}`)} 
                        style={styles.detailBtn}>Detail</button>
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