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

  // -- Handler Sebelum Pengiriman --
  const handleKirimPenawaran = async (e) => { e.preventDefault(); await transaksiService.submitPenawaran(id, { harga_penawaran: Number(hargaPenawaran), ongkos_kirim: Number(ongkosKirim), diskon: diskon ? Number(diskon) : 0 }); fetchDetail(); };
  const handleReviewManager = async (action) => { await transaksiService.reviewPenawaran(id, action); fetchDetail(); };
  const handleBayarDP = async () => { /* Logic Midtrans Snap */ window.snap.pay(await (await transaksiService.payDP(id)).token, { onPending: async () => { await transaksiService.updateStatus(id, 'DP_DIBAYAR'); fetchDetail(); } }); };
  const handleVerifikasiSales = async () => { await transaksiService.updateStatus(id, 'VERIFIKASI_DP_SALES'); fetchDetail(); };
  const handleApproveManagerDP = async () => { await transaksiService.updateStatus(id, 'PROSES_OPERASIONAL'); fetchDetail(); };
  const handleSelesaiPDI = async () => { await transaksiService.submitPDI(id, pdiCheck); fetchDetail(); };
  const handleSubmitDelivery = async (e) => { e.preventDefault(); await transaksiService.submitDeliveryOrder(id, deliveryForm); fetchDetail(); };

  // +++ HANDLER BARU: KONFIRMASI TERIMA UNIT (CUSTOMER) +++
  const handleTerimaUnit = async () => {
    if (!window.confirm("Pastikan unit alat berat telah tiba di lokasi proyek Anda dan sesuai dengan pesanan. Lanjutkan konfirmasi terima unit?")) return;
    try {
      await transaksiService.receiveUnit(id);
      alert("Berhasil! Unit diterima dan Berita Acara Serah Terima (BAST) telah diterbitkan.");
      fetchDetail();
    } catch (error) {
      console.error(error);
      alert("Gagal melakukan konfirmasi penerimaan.");
    }
  };

  // +++ FUNGSI BARU: DOWNLOAD PDF BAST +++
  const handleDownloadBAST = () => {
    const doc = new jsPDF();
    
    // KOP Surat
    doc.setFontSize(22); doc.setTextColor(37, 99, 235); doc.setFont("helvetica", "bold");
    doc.text("HEAVY CARE.ID", 14, 22);
    doc.setFontSize(10); doc.setTextColor(100, 100, 100); doc.setFont("helvetica", "normal");
    doc.text("Penyedia Alat Berat Terpercaya & Berkualitas", 14, 28);
    doc.setLineWidth(0.5); doc.line(14, 38, 196, 38);

    // Judul Dokumen
    doc.setFontSize(14); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold");
    doc.text("BERITA ACARA SERAH TERIMA (BAST)", 105, 50, { align: "center" });

    // Isi BAST
    doc.setFontSize(11); doc.setFont("helvetica", "normal");
    doc.text("Pada hari ini, telah dilakukan serah terima unit alat berat dengan rincian sebagai berikut:", 14, 65);
    
    doc.text(`Nomor Pesanan      : ${detail.nomor_dokumen || 'QO-' + detail.id}`, 14, 75);
    doc.text(`Nama Customer      : ${detail.perusahaan}`, 14, 82);
    doc.text(`Unit Alat Berat         : ${detail.nama_unit}`, 14, 89);
    doc.text(`Metode Bayar         : ${detail.metode_pembayaran.toUpperCase()}`, 14, 96);
    
    // Status Diterima
    doc.setFont("helvetica", "bold");
    doc.text(`Status                       : DITERIMA DENGAN BAIK`, 14, 103);
    
    doc.setFont("helvetica", "normal");
    const pernyataan = "Pihak pembeli (Customer) menyatakan bahwa unit alat berat telah diterima di lokasi proyek dan telah diperiksa secara fisik dalam kondisi baik, serta kelengkapan aksesoris telah sesuai dengan Pre-Delivery Inspection (PDI) yang disepakati.";
    const splitPernyataan = doc.splitTextToSize(pernyataan, 180);
    doc.text(splitPernyataan, 14, 115);

    // Tanda Tangan
    doc.text("Pihak heavy care.id,", 30, 150);
    doc.text("(..........................................)", 25, 175);
    doc.setFont("helvetica", "bold");
    doc.text("Tim Logistik", 38, 182);

    doc.setFont("helvetica", "normal");
    doc.text("Pihak Pembeli (Customer),", 130, 150);
    doc.text("(..........................................)", 125, 175);
    doc.setFont("helvetica", "bold");
    doc.text(detail.perusahaan, 130, 182);

    doc.save(`BAST_${detail.nomor_dokumen || detail.id}.pdf`);
  };

  // -- Fungsi Download Lainnya --
  const handleDownloadKuitansiDP = () => { /* Dipersingkat */ alert("Download Kuitansi DP"); };
  const handleDownloadPDF = () => { /* Dipersingkat */ alert("Download Quotation"); };

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
        {/* KOLOM KIRI */}
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

        {/* KOLOM KANAN */}
        <div style={styles.rightCol}>
          <div style={{...styles.card, borderTop: '4px solid #2563eb'}}>
            <h3 style={styles.cardTitle}>Keterangan & Aksi</h3>
            
            {/* ====== 1. TAMPILAN CUSTOMER ====== */}
            {user?.role === 'Customer' && (
              <div>
                {/* Tracker Pengiriman */}
                {['DP_DIBAYAR', 'VERIFIKASI_DP_SALES', 'PROSES_OPERASIONAL', 'SIAP_KIRIM', 'PENGIRIMAN', 'SELESAI'].includes(detail.status) && (
                  <div style={{...styles.alertCustomer, backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', marginBottom: '1rem'}}>
                    <h4 style={{margin: '0 0 0.8rem 0', color: '#0f172a'}}>📍 Status Pemrosesan Unit</h4>
                    <ul style={{ paddingLeft: '0', margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <li>{['PROSES_OPERASIONAL', 'SIAP_KIRIM', 'PENGIRIMAN', 'SELESAI'].includes(detail.status) ? '✅' : '⏳'} Pengecekan Mesin (PDI)</li>
                      <li>{['SIAP_KIRIM', 'PENGIRIMAN', 'SELESAI'].includes(detail.status) ? '✅' : '⏳'} Unit Siap Dikirim</li>
                      <li>{['SELESAI'].includes(detail.status) ? '✅' : (detail.status === 'PENGIRIMAN' ? '🚚' : '⏳')} Pengiriman ke Lokasi Proyek</li>
                    </ul>
                  </div>
                )}

                {/* Konfirmasi Terima Unit */}
                {detail.status === 'PENGIRIMAN' && (
                  <div style={{...styles.alertCustomer, backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0'}}>
                    <h4 style={{margin: '0 0 0.5rem 0'}}>🚚 Unit Telah Sampai?</h4>
                    <p style={{fontSize: '0.9rem', marginBottom: '1rem'}}>Klik tombol di bawah ini jika alat berat telah tiba di lokasi Anda dan sesuai dengan pesanan.</p>
                    <button onClick={handleTerimaUnit} style={{...styles.btnAjukan, backgroundColor: '#059669'}}>
                      📦 Konfirmasi Terima Unit
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ====== 2. TAMPILAN OPERASIONAL ====== */}
            {(user?.role === 'Operasional' || user?.role === 'Admin') && (
              <div>
                {detail.status === 'PENGIRIMAN' && (
                   <div style={{...styles.alertCustomer, backgroundColor: '#fffbeb', color: '#92400e', border: '1px solid #fde68a'}}>
                     <h4 style={{margin: '0 0 0.5rem 0'}}>🚚 Menunggu Konfirmasi Customer</h4>
                     <p style={{fontSize: '0.9rem', margin: 0}}>Unit sedang dalam perjalanan. Customer harus menekan tombol <strong>Terima Unit</strong> di aplikasi mereka setelah alat berat tiba.</p>
                   </div>
                )}
              </div>
            )}

            {/* ====== 3. TRANSAKSI SELESAI (TAMPIL UNTUK SEMUA ROLE) ====== */}
            {detail.status === 'SELESAI' && (
              <div style={{...styles.alertCustomer, backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0'}}>
                <h4 style={{margin: '0 0 0.5rem 0'}}>🎉 Transaksi Selesai</h4>
                <p style={{fontSize: '0.9rem', marginBottom: '1rem'}}>
                  Unit alat berat telah diterima dengan baik oleh Customer. Dokumen Berita Acara Serah Terima (BAST) telah otomatis diterbitkan.
                </p>
                <button onClick={handleDownloadBAST} style={{...styles.btnAjukan, backgroundColor: '#16a34a'}}>
                  📄 Download Dokumen BAST
                </button>
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