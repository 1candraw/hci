import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { transaksiService } from '../../services/transaksi.service';

const TransaksiDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const [hargaPenawaran, setHargaPenawaran] = useState('');
  const [ongkosKirim, setOngkosKirim] = useState('');
  const [diskon, setDiskon] = useState('');

  const [pdiCheck, setPdiCheck] = useState({
    engine: false, hydraulic: false, bucket: false, 
    body: false, undercarriage: false, accessories: false, notes: ''
  });

  // +++ STATE BARU UNTUK FORM SURAT JALAN +++
  const [deliveryForm, setDeliveryForm] = useState({
    driverName: '', vehicleNumber: '', destination: ''
  });

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await transaksiService.getById(id);
      setDetail(data);
      // Set default alamat tujuan pengiriman dari catatan/perusahaan jika ada
      if (data) {
        setDeliveryForm(prev => ({...prev, destination: data.catatan || data.perusahaan || ''}));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
  };

  // -- Handler Sebelumnya (Sales & Manager & Midtrans) --
  const handleKirimPenawaran = async (e) => { /* ... */ };
  const handleReviewManager = async (action) => { /* ... */ };
  const handleBayarDP = async () => { /* ... */ };
  const handleVerifikasiSales = async () => { /* ... */ };
  const handleApproveManagerDP = async () => { /* ... */ };
  
  // -- Handler Operasional (PDI) --
  const handleSelesaiPDI = async () => {
    if (!window.confirm("Konfirmasi PDI selesai dan unit siap dikirim?")) return;
    try {
      await transaksiService.submitPDI(id, pdiCheck);
      alert("PDI Berhasil! Unit berstatus Siap Kirim.");
      fetchDetail();
    } catch (error) { console.error(error); }
  };

  // +++ HANDLER BARU: OPERASIONAL (SURAT JALAN) +++
  const handleSubmitDelivery = async (e) => {
    e.preventDefault();
    if (!deliveryForm.driverName || !deliveryForm.vehicleNumber || !deliveryForm.destination) {
      return alert("Semua informasi pengiriman wajib diisi!");
    }
    if (!window.confirm("Terbitkan Surat Jalan dan berangkatkan unit ke lokasi?")) return;

    try {
      await transaksiService.submitDeliveryOrder(id, deliveryForm);
      alert("Surat Jalan berhasil diterbitkan! Unit sedang dalam pengiriman.");
      fetchDetail();
    } catch (error) {
      console.error(error);
      alert("Gagal menerbitkan surat jalan.");
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Memuat rincian pesanan...</div>;
  if (!detail) return <div style={{ padding: '2rem' }}>Data tidak ditemukan</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <button onClick={() => navigate('/transaksi')} style={styles.backBtn}>← Kembali</button>
          <h2 style={styles.title}>Detail Pesanan: {detail.nomor_dokumen || 'QO-'+detail.id}</h2>
        </div>
        <span style={styles.badgeBesar}>{detail.status.replace(/_/g, ' ')}</span>
      </div>

      <div style={styles.grid}>
        <div style={styles.leftCol}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Informasi Pesanan</h3>
            <table style={styles.infoTable}>
              <tbody>
                <tr><td style={styles.tdLabel}>Perusahaan</td><td>: <strong>{detail.perusahaan}</strong></td></tr>
                <tr><td style={styles.tdLabel}>Unit Diminta</td><td>: <strong>{detail.nama_unit}</strong></td></tr>
                <tr><td style={styles.tdLabel}>Metode Pembayaran</td><td>: {detail.metode_pembayaran.toUpperCase()}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.rightCol}>
          <div style={{...styles.card, borderTop: '4px solid #2563eb'}}>
            <h3 style={styles.cardTitle}>Keterangan & Aksi</h3>
            
            {/* ====== 1. TAMPILAN CUSTOMER (TRACKER DI-UPDATE) ====== */}
            {user?.role === 'Customer' && (
              <div>
                {/* Status Awal (Disembunyikan untuk hemat tempat) */}
                
                {['DP_DIBAYAR', 'VERIFIKASI_DP_SALES', 'PROSES_OPERASIONAL', 'SIAP_KIRIM', 'PENGIRIMAN', 'SELESAI'].includes(detail.status) && (
                  <div>
                    {/* ORDER TRACKER DINAMIS */}
                    <div style={{...styles.alertCustomer, backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1'}}>
                      <h4 style={{margin: '0 0 0.8rem 0', color: '#0f172a'}}>📍 Status Pemrosesan Unit</h4>
                      <ul style={{ paddingLeft: '0', margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <li>
                          {['PROSES_OPERASIONAL', 'SIAP_KIRIM', 'PENGIRIMAN', 'SELESAI'].includes(detail.status) ? '✅' : '⏳'} Pengecekan Mesin (PDI)
                        </li>
                        <li>
                          {['SIAP_KIRIM', 'PENGIRIMAN', 'SELESAI'].includes(detail.status) ? '✅' : '⏳'} Unit Siap Dikirim
                        </li>
                        <li style={{ color: ['PENGIRIMAN', 'SELESAI'].includes(detail.status) ? '#0f172a' : '#94a3b8', fontWeight: detail.status === 'PENGIRIMAN' ? 'bold' : 'normal' }}>
                          {['PENGIRIMAN', 'SELESAI'].includes(detail.status) ? '🚚' : '⏳'} Pengiriman ke Lokasi Proyek
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ====== 2. TAMPILAN OPERASIONAL ====== */}
            {(user?.role === 'Operasional' || user?.role === 'Admin') && (
              <div>
                {/* BLOK 1: PDI CHECKLIST */}
                {detail.status === 'PROSES_OPERASIONAL' && (
                  <div style={{...styles.alertCustomer, backgroundColor: '#f5f3ff', color: '#4c1d95', border: '1px solid #ddd6fe'}}>
                    <h4 style={{margin: '0 0 0.5rem 0'}}>🛠️ Form PDI</h4>
                    {/* Ringkasan Form Checklist (Dipersingkat untuk space) */}
                    <div style={{ marginBottom: '1rem', backgroundColor: '#fff', padding: '1rem', borderRadius: '6px' }}>
                      <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><input type="checkbox" name="engine" onChange={(e) => setPdiCheck({...pdiCheck, engine: e.target.checked})} /> Mesin & Hidrolik Aman</label>
                      <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem'}}><input type="checkbox" name="body" onChange={(e) => setPdiCheck({...pdiCheck, body: e.target.checked})} /> Body & Undercarriage Aman</label>
                    </div>
                    <button onClick={handleSelesaiPDI} style={{...styles.btnAjukan, backgroundColor: '#8b5cf6'}}>✓ PDI Selesai</button>
                  </div>
                )}

                {/* BLOK 2: SURAT JALAN & PENGIRIMAN (BARU) */}
                {detail.status === 'SIAP_KIRIM' && (
                  <div style={{...styles.alertCustomer, backgroundColor: '#fffbeb', color: '#92400e', border: '1px solid #fde68a'}}>
                    <h4 style={{margin: '0 0 0.5rem 0'}}>🚚 Terbitkan Surat Jalan</h4>
                    <p style={{fontSize: '0.9rem', marginBottom: '1rem'}}>Unit siap. Masukkan data pengiriman (Delivery Order).</p>
                    
                    <form onSubmit={handleSubmitDelivery}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Nama Supir / Ekspedisi</label>
                        <input type="text" required style={styles.input} placeholder="Misal: Budi / PT Lintas Trans" value={deliveryForm.driverName} onChange={(e) => setDeliveryForm({...deliveryForm, driverName: e.target.value})} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Nomor Polisi Kendaraan (Truk)</label>
                        <input type="text" required style={styles.input} placeholder="B 1234 XYZ" value={deliveryForm.vehicleNumber} onChange={(e) => setDeliveryForm({...deliveryForm, vehicleNumber: e.target.value})} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Alamat Tujuan Proyek</label>
                        <textarea required rows="3" style={styles.input} placeholder="Alamat lengkap proyek..." value={deliveryForm.destination} onChange={(e) => setDeliveryForm({...deliveryForm, destination: e.target.value})} />
                      </div>
                      <button type="submit" style={{...styles.btnAjukan, backgroundColor: '#d97706', marginTop: '1rem'}}>
                        Kirim Unit Sekarang 🚀
                      </button>
                    </form>
                  </div>
                )}

                {/* BLOK 3: UNIT DALAM PERJALANAN */}
                {detail.status === 'PENGIRIMAN' && (
                   <div style={{...styles.alertCustomer, backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0'}}>
                     <h4 style={{margin: '0 0 0.5rem 0'}}>🚚 Menunggu Konfirmasi Customer</h4>
                     <p style={{fontSize: '0.9rem', margin: 0}}>Unit sedang dalam perjalanan. Customer harus menekan tombol <strong>Terima Unit</strong> di aplikasi mereka setelah alat berat tiba.</p>
                   </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

// --- STYLING (Tetap sama) ---
const styles = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  backBtn: { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '0.5rem', fontWeight: 'bold' },
  title: { margin: '0 0 0.5rem 0', fontSize: '1.75rem', color: '#1f2937' },
  badgeBesar: { padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#d97706', fontWeight: 'bold', fontSize: '1.1rem' },
  grid: { display: 'grid', gridTemplateColumns: '6fr 4fr', gap: '2rem', alignItems: 'start' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  rightCol: { position: 'sticky', top: '2rem' }, 
  card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  cardTitle: { margin: '0 0 1.25rem 0', color: '#374151', borderBottom: '2px solid #f3f4f6', paddingBottom: '0.5rem' },
  infoTable: { width: '100%', borderCollapse: 'collapse' },
  tdLabel: { padding: '0.75rem 0', color: '#6b7280', width: '180px' },
  alertCustomer: { backgroundColor: '#eff6ff', color: '#1e40af', padding: '1rem', borderRadius: '6px', lineHeight: '1.5' },
  inputGroup: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold', color: '#374151' },
  input: { width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' },
  btnAjukan: { width: '100%', padding: '0.85rem', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }
};

export default TransaksiDetail;