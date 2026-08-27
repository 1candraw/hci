import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { transaksiService } from '../../services/transaksi.service';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Search,
  CheckCircle2,
  Edit,
  Eye
} from 'lucide-react';

const Transaksi = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); 
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTransaksi();
  }, []);

  const fetchTransaksi = async () => {
    try {
      setLoading(true);
      const result = await transaksiService.getAll();
      
      let dataArray = [];
      if (Array.isArray(result)) dataArray = result;
      else if (result?.data && Array.isArray(result.data)) dataArray = result.data;

      setQuotations(dataArray);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Terjadi kesalahan sistem saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Yakin ingin menyetujui dokumen penawaran harga ini?')) return;
    
    try {
      await transaksiService.updateStatus(id, 'APPROVED'); 
      alert('Dokumen penawaran harga berhasil disetujui!');
      fetchTransaksi(); 
    } catch (err) {
      alert(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': 
        return <span style={{ ...styles.badge, backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>Menunggu Penawaran</span>;
      case 'MENUNGGU_APPROVAL': 
        return <span style={{ ...styles.badge, backgroundColor: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe' }}>Menunggu Approval</span>;
      case 'APPROVED': 
        return <span style={{ ...styles.badge, backgroundColor: '#ecfccb', color: '#15803d', border: '1px solid #d9f99d' }}>Disetujui Manager</span>;
      case 'REJECTED': 
        return <span style={{ ...styles.badge, backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>Ditolak</span>;
      case 'DP_DIBAYAR': 
        return <span style={{ ...styles.badge, backgroundColor: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe' }}>Pembayaran Masuk</span>;
      case 'VERIFIKASI_DP_SALES': 
        return <span style={{ ...styles.badge, backgroundColor: '#ede9fe', color: '#6d28d9', border: '1px solid #ddd6fe' }}>Verifikasi Pembayaran</span>;
      case 'PROSES_OPERASIONAL': 
        return <span style={{ ...styles.badge, backgroundColor: '#cffafe', color: '#0891b2', border: '1px solid #a5f3fc' }}>Inspeksi PDI</span>;
      case 'SIAP_KIRIM': 
        return <span style={{ ...styles.badge, backgroundColor: '#ecfccb', color: '#15803d', border: '1px solid #84cc16' }}>Siap Kirim</span>;
      case 'PENGIRIMAN': 
      case 'PROSES_PENGIRIMAN': 
        return <span style={{ ...styles.badge, backgroundColor: '#fef9c3', color: '#a16207', border: '1px solid #fef08a' }}>Dalam Pengiriman</span>;
      case 'SELESAI': 
        return <span style={{ ...styles.badge, backgroundColor: '#bbf7d0', color: '#166534', border: '1px solid #86efac' }}>Selesai ✓</span>;
      default: 
        return <span style={{ ...styles.badge, backgroundColor: '#f1f5f9', color: '#475569' }}>{status || 'Draft'}</span>;
    }
  };

  const filteredQuotations = quotations.filter(item => {
    const q = searchQuery.toLowerCase();
    const docNo = (item.nomor_dokumen || item.nomor_pemesanan || '').toLowerCase();
    const cust = (item.perusahaan || item.nama_customer || '').toLowerCase();
    const unit = (item.nama_unit || item.nama_alat || '').toLowerCase();
    return docNo.includes(q) || cust.includes(q) || unit.includes(q);
  });

  return (
    <div style={styles.container}>
      {/* Header Halaman */}
      <div style={styles.header}>
        <div>
          <span style={styles.headerPill}>QUOTATION & ORDER MANAGEMENT</span>
          <h1 style={styles.title}>Manajemen Transaksi & RFQ</h1>
          <p style={styles.subtitle}>
            Kelola seluruh siklus pemesanan alat berat — mulai dari penawaran harga sales, approval manager, verifikasi DP, hingga surat jalan PDI.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={styles.searchWrap}>
            <Search size={15} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Cari no. pesanan, PIC, unit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {user?.role === 'Customer' && (
            <button onClick={() => navigate('/katalog')} style={styles.actionBtn}>
              + Buat Permintaan
            </button>
          )}
        </div>
      </div>

      {error && <div style={styles.errorBox}>⚠️ {error}</div>}
      
      <div style={styles.card}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <div className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTopColor: '#74c02c', borderRadius: '50%', margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: '700' }}>Mengambil data dokumen pesanan...</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>NO. DOKUMEN / RFQ</th>
                  <th style={styles.th}>CUSTOMER / PIC</th>
                  <th style={styles.th}>UNIT EXCAVATOR</th>
                  <th style={styles.th}>SUMBER</th>
                  <th style={styles.th}>TANGGAL</th>
                  <th style={styles.th}>STATUS PROGRES</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotations.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                      <ClipboardList size={32} style={{ color: '#94a3b8', marginBottom: '0.5rem' }} />
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '0.88rem' }}>Belum ada data pesanan yang sesuai.</p>
                    </td>
                  </tr>
                ) : (
                  filteredQuotations.map((item) => (
                    <tr key={item.id} style={styles.tr}>
                      <td style={styles.td}>
                        <strong style={{ color: '#0d141e', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                          {item.nomor_dokumen || item.nomor_pemesanan || `RFQ-#${item.id}`}
                        </strong>
                      </td>
                      <td style={styles.td}>
                        <strong style={{ color: '#0d141e' }}>{item.perusahaan || item.nama_customer || '-'}</strong>
                        {item.nama_customer && item.perusahaan && item.nama_customer !== item.perusahaan && (
                          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.1rem' }}>PIC: {item.nama_customer}</div>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: '700', color: '#0d141e' }}>{item.nama_unit || item.nama_alat || '-'}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: item.sumber_pesanan === 'guest' ? '#ecfccb' : '#f1f5f9',
                          color: item.sumber_pesanan === 'guest' ? '#15803d' : '#475569',
                          border: item.sumber_pesanan === 'guest' ? '1px solid #d9f99d' : '1px solid #e2e8f0',
                        }}>
                          {item.sumber_pesanan === 'guest' ? '🌐 Guest RFQ' : (item.sumber_pesanan ? item.sumber_pesanan.toUpperCase() : 'KATALOG')}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ color: '#475569', fontSize: '0.82rem' }}>
                          {item.tanggal || item.created_at ? new Date(item.tanggal || item.created_at).toLocaleDateString('id-ID') : '-'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {getStatusBadge(item.status)}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', alignItems: 'center' }}>
                          {user?.role === 'Manager' && item.status === 'MENUNGGU_APPROVAL' && (
                            <button onClick={() => handleApprove(item.id)} style={styles.approveBtn} title="Setujui Penawaran">
                              <CheckCircle2 size={13} />
                              <span>Approve</span>
                            </button>
                          )}
                          <button onClick={() => navigate(`/transaksi/${item.id}`)} style={styles.detailBtn}>
                            {user?.role === 'Sales' && item.status === 'PENDING' ? (
                              <>
                                <Edit size={13} />
                                <span>Input Harga</span>
                              </>
                            ) : (
                              <>
                                <Eye size={13} />
                                <span>Buka Detail</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
    color: '#64748b',
    letterSpacing: '1.2px',
    marginBottom: '0.2rem',
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
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    backgroundColor: '#f8fafc',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.45rem 0.85rem',
    minWidth: '260px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '0.84rem',
    color: '#0d141e',
    width: '100%',
  },
  actionBtn: { 
    padding: '0.65rem 1.25rem', 
    backgroundColor: '#0d141e', 
    color: '#74c02c', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.88rem',
    boxShadow: '0 4px 12px rgba(13, 20, 30, 0.25)',
  },
  errorBox: { 
    padding: '0.85rem 1rem', 
    backgroundColor: '#fee2e2', 
    color: '#991b1b', 
    borderRadius: '8px', 
    border: '1px solid #fca5a5',
    fontSize: '0.86rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1.5px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(13, 20, 30, 0.03)',
    overflow: 'hidden',
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
  badge: { 
    display: 'inline-block',
    padding: '0.2rem 0.55rem', 
    borderRadius: '5px', 
    fontSize: '0.72rem', 
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    whiteSpace: 'nowrap',
  },
  detailBtn: { 
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.4rem 0.8rem', 
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
  approveBtn: { 
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.4rem 0.8rem', 
    backgroundColor: '#ecfccb', 
    color: '#15803d', 
    border: '1px solid #84cc16', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontSize: '0.78rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
  }
};

export default Transaksi;