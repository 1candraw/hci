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

  // Form State untuk Sales
  const [hargaPenawaran, setHargaPenawaran] = useState('');
  const [ongkosKirim, setOngkosKirim] = useState('');
  const [diskon, setDiskon] = useState('');

  // +++ STATE BARU UNTUK PDI OPERASIONAL +++
  const [pdiCheck, setPdiCheck] = useState({
    engine: false,
    hydraulic: false,
    bucket: false,
    body: false,
    undercarriage: false,
    accessories: false,
    notes: ''
  });

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setPdiCheck(prev => ({ ...prev, [name]: checked }));
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await transaksiService.getById(id);
      setDetail(data);
    } catch (error) {
      alert('Gagal mengambil data detail pesanan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
  };

  // --- FUNGSI SALES: KIRIM PENAWARAN ---
  const handleKirimPenawaran = async (e) => {
    e.preventDefault();
    if (!hargaPenawaran || !ongkosKirim) return alert("Harga Penawaran dan Ongkos Kirim wajib diisi!");
    try {
      await transaksiService.submitPenawaran(id, { harga_penawaran: Number(hargaPenawaran), ongkos_kirim: Number(ongkosKirim), diskon: diskon ? Number(diskon) : 0 });
      alert('Berhasil! Harga penawaran diteruskan ke Manager.');
      fetchDetail(); 
    } catch (error) { console.error(error); alert('Terjadi kesalahan.'); }
  };

  // --- FUNGSI MANAGER: REVIEW PENAWARAN ---
  const handleReviewManager = async (action) => {
    if (!window.confirm(`Yakin ingin ${action === 'approve' ? 'menyetujui' : 'menolak'} penawaran ini?`)) return;
    try {
      await transaksiService.reviewPenawaran(id, action);
      alert(`Penawaran berhasil di-${action}!`);
      fetchDetail(); 
    } catch (error) { console.error(error); }
  };

  // --- FUNGSI CUSTOMER: BAYAR DP (MIDTRANS) ---
  const handleBayarDP = async () => {
    try {
      const response = await transaksiService.payDP(id);
      window.snap.pay(response.token, {
        onSuccess: async function(){
          alert("Pembayaran Berhasil!");
          await transaksiService.updateStatus(id, 'DP_DIBAYAR'); fetchDetail(); 
        },
        onPending: async function(){
          alert("Virtual Account dibuat! (Simulasi: Anggap DP lunas).");
          await transaksiService.updateStatus(id, 'DP_DIBAYAR'); fetchDetail(); 
        },
        onError: function(){ alert("Pembayaran gagal!"); },
        onClose: function(){ alert('Anda menutup halaman pembayaran.'); }
      });
    } catch (error) { console.error(error); }
  };

  // --- FUNGSI SALES & MANAGER: VERIFIKASI DP ---
  const handleVerifikasiSales = async () => {
    if (!window.confirm("Verifikasi DP?")) return;
    try { await transaksiService.updateStatus(id, 'VERIFIKASI_DP_SALES'); fetchDetail(); } catch (error) { console.error(error); }
  };

  const handleApproveManagerDP = async () => {
    if (!window.confirm("Approve DP dan teruskan ke Operasional?")) return;
    try { await transaksiService.updateStatus(id, 'PROSES_OPERASIONAL'); fetchDetail(); } catch (error) { console.error(error); }
  };

  // --- FUNGSI OPERASIONAL: PDI SELESAI ---
  const handleSelesaiPDI = async () => {
    // Validasi sederhana: Pastikan minimal ada 1 yang dicentang
    const isAnyChecked = Object.values(pdiCheck).some(val => val === true);
    if (!isAnyChecked && !pdiCheck.notes) {
      if (!window.confirm("Anda belum mencentang apapun. Yakin ingin melanjutkan?")) return;
    } else {
      if (!window.confirm("Konfirmasi bahwa Pre-Delivery Inspection (PDI) selesai dan unit siap dikirim?")) return;
    }

    try {
      // Mengirim data PDI ke Backend yang baru kamu buat
      await transaksiService.submitPDI(id, pdiCheck);
      alert("Berhasil! Data inspeksi tersimpan dan unit sekarang berstatus Siap Kirim.");
      fetchDetail();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat memproses PDI. Cek console untuk detailnya.");
    }
  };

  // --- FUNGSI BERSAMA: DOWNLOAD KUITANSI DP ---
  const handleDownloadKuitansiDP = () => {
    const doc = new jsPDF();
    const totalAkhir = Number(detail.harga_penawaran) + Number(detail.ongkos_kirim) - Number(detail.diskon);
    const dpAmount = Math.round(totalAkhir * 0.1); 

    doc.setFontSize(22); doc.setTextColor(37, 99, 235); doc.setFont("helvetica", "bold");
    doc.text("HEAVY CARE.ID", 14, 22);
    doc.setFontSize(10); doc.setTextColor(100, 100, 100); doc.setFont("helvetica", "normal");
    doc.text("Penyedia Alat Berat Terpercaya", 14, 28);
    doc.setLineWidth(0.5); doc.line(14, 38, 196, 38);

    doc.setFontSize(16); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold");
    doc.text("KUITANSI PEMBAYARAN UANG MUKA (DP)", 105, 50, { align: "center" });

    doc.setFontSize(11); doc.setFont("helvetica", "normal");
    doc.text(`Telah terima dari  : ${detail.perusahaan}`, 14, 65);
    doc.text(`Uang sejumlah      : ${formatRupiah(dpAmount)}`, 14, 75);
    doc.text(`Untuk Pembayaran   : DP 10% Pesanan ${detail.nama_unit}`, 14, 85);
    doc.text(`Nomor Pesanan      : ${detail.nomor_dokumen || 'QO-' + detail.id}`, 14, 95);

    doc.setFillColor(239, 246, 255); doc.rect(14, 105, 80, 15, 'F');
    doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(37, 99, 235);
    doc.text(formatRupiah(dpAmount), 54, 115, { align: "center" });

    doc.setFontSize(11); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "normal");
    doc.text(`Jakarta, ${new Date().toLocaleDateString('id-ID')}`, 140, 130);
    doc.text("Manajemen heavy care.id", 137, 160);
    doc.save(`Kuitansi_DP_${detail.nomor_dokumen || detail.id}.pdf`);
  };

  // --- FUNGSI CUSTOMER: DOWNLOAD PDF QUOTATION ---
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const totalAkhir = Number(detail.harga_penawaran) + Number(detail.ongkos_kirim) - Number(detail.diskon);

    doc.setFontSize(22); doc.setTextColor(37, 99, 235); doc.setFont("helvetica", "bold");
    doc.text("HEAVY CARE.ID", 14, 22);
    doc.setFontSize(10); doc.setTextColor(100, 100, 100); doc.setFont("helvetica", "normal");
    doc.text("Penyedia Alat Berat Terpercaya & Berkualitas", 14, 28);
    doc.setLineWidth(0.5); doc.line(14, 38, 196, 38);

    doc.setFontSize(14); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold");
    doc.text("SURAT PENAWARAN HARGA (QUOTATION)", 105, 50, { align: "center" });

    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`Nomor Dokumen : ${detail.nomor_dokumen || 'QO-' + detail.id}`, 14, 65);
    doc.text(`Tanggal       : ${new Date(detail.tanggal).toLocaleDateString('id-ID')}`, 14, 71);
    doc.text("Kepada Yth:", 130, 65); doc.setFont("helvetica", "bold");
    doc.text(detail.perusahaan, 130, 71); doc.setFont("helvetica", "normal");
    
    autoTable(doc, {
      startY: 90,
      head: [['No', 'Deskripsi Unit Alat Berat', 'Metode Bayar', 'Harga Dasar']],
      body: [['1', detail.nama_unit, detail.metode_pembayaran.toUpperCase(), formatRupiah(detail.harga_penawaran)]],
      theme: 'grid', headStyles: { fillColor: [37, 99, 235] }, styles: { fontSize: 10, cellPadding: 4 }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold"); doc.text("Rincian Kalkulasi Biaya:", 14, finalY);
    doc.setFont("helvetica", "normal");
    doc.text("Harga Penawaran Unit", 14, finalY + 8); doc.text(`: ${formatRupiah(detail.harga_penawaran)}`, 70, finalY + 8);
    doc.text("Estimasi Ongkos Kirim", 14, finalY + 14); doc.text(`: ${formatRupiah(detail.ongkos_kirim)}`, 70, finalY + 14);
    doc.text("Diskon Khusus", 14, finalY + 20); doc.text(`: - ${formatRupiah(detail.diskon)}`, 70, finalY + 20);
    doc.line(70, finalY + 23, 120, finalY + 23);
    doc.setFont("helvetica", "bold"); doc.setTextColor(37, 99, 235);
    doc.text("GRAND TOTAL", 14, finalY + 30); doc.text(`: ${formatRupiah(totalAkhir)}`, 70, finalY + 30);
    
    doc.save(`Quotation_${detail.nomor_dokumen || detail.id}.pdf`);
  };

  if (loading) return <div style={{ padding: '2rem' }}>Memuat rincian pesanan...</div>;
  if (!detail) return <div style={{ padding: '2rem' }}>Data tidak ditemukan</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <button onClick={() => navigate('/transaksi')} style={styles.backBtn}>← Kembali</button>
          <h2 style={styles.title}>Detail Pesanan: {detail.nomor_dokumen}</h2>
        </div>
        <span style={styles.badgeBesar}>{detail.status.replace(/_/g, ' ')}</span>
      </div>

      <div style={styles.grid}>
        {/* KOLOM KIRI (Info Pelanggan & Unit) */}
        <div style={styles.leftCol}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Informasi Pesanan</h3>
            <table style={styles.infoTable}>
              <tbody>
                <tr><td style={styles.tdLabel}>Perusahaan</td><td>: <strong>{detail.perusahaan}</strong></td></tr>
                <tr><td style={styles.tdLabel}>Unit Diminta</td><td>: <strong>{detail.nama_unit}</strong></td></tr>
                <tr><td style={styles.tdLabel}>Harga Dasar</td><td>: {formatRupiah(detail.harga_unit)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* KOLOM KANAN (Aksi & Tracker) */}
        <div style={styles.rightCol}>
          <div style={{...styles.card, borderTop: '4px solid #2563eb'}}>
            <h3 style={styles.cardTitle}>Keterangan & Aksi</h3>
            
            {/* ====== 1. TAMPILAN CUSTOMER ====== */}
            {user?.role === 'Customer' && (
              <div>
                {detail.status === 'PENDING' && <div style={styles.alertCustomer}>Saat ini pesanan Anda sedang ditinjau oleh tim Sales.</div>}
                {detail.status === 'APPROVED' && (
                  <div style={{...styles.alertCustomer, backgroundColor: '#ecfdf5', color: '#065f46'}}>
                    <p style={{ margin: '0 0 1rem 0' }}><strong>Penawaran Anda sudah siap!</strong></p>
                    <button onClick={handleBayarDP} style={{...styles.btnAjukan, backgroundColor: '#2563eb'}}>💳 Bayar DP via Midtrans</button>
                  </div>
                )}
                {['DP_DIBAYAR', 'VERIFIKASI_DP_SALES', 'PROSES_OPERASIONAL', 'SIAP_KIRIM'].includes(detail.status) && (
                  <div>
                    <button onClick={handleDownloadKuitansiDP} style={{...styles.btnAjukan, backgroundColor: '#3b82f6', marginBottom: '1rem'}}>
                      ⬇️ Download Kuitansi DP
                    </button>
                    
                    {/* ORDER TRACKER */}
                    <div style={{...styles.alertCustomer, backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1'}}>
                      <h4 style={{margin: '0 0 0.8rem 0', color: '#0f172a'}}>📍 Status Pemrosesan Unit</h4>
                      <ul style={{ paddingLeft: '0', margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>{['PROSES_OPERASIONAL', 'SIAP_KIRIM'].includes(detail.status) ? '✅' : '⏳'} Pengecekan Mesin (PDI)</li>
                        <li>{['SIAP_KIRIM'].includes(detail.status) ? '✅' : '⏳'} Unit Siap Dikirim</li>
                        <li style={{ color: '#94a3b8' }}>⏳ Pengiriman ke Lokasi Proyek</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ====== 2. TAMPILAN OPERASIONAL ====== */}
            {(user?.role === 'Operasional' || user?.role === 'Admin') && detail.status === 'PROSES_OPERASIONAL' && (
              <div style={{...styles.alertCustomer, backgroundColor: '#f5f3ff', color: '#4c1d95', border: '1px solid #ddd6fe'}}>
                <h4 style={{margin: '0 0 0.5rem 0'}}>🛠️ Form Pre-Delivery Inspection (PDI)</h4>
                <p style={{fontSize: '0.9rem', marginBottom: '1rem'}}>Lakukan pengecekan fisik unit sebelum dikirim ke Customer.</p>
                
                {/* Form Checklist Dinamis */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem', backgroundColor: '#fff', padding: '1rem', borderRadius: '6px' }}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#334155'}}>
                    <input type="checkbox" name="engine" checked={pdiCheck.engine} onChange={handleCheckboxChange} style={{width: '1.2rem', height: '1.2rem'}} /> Mesin & Oli dalam kondisi prima
                  </label>
                  <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#334155'}}>
                    <input type="checkbox" name="hydraulic" checked={pdiCheck.hydraulic} onChange={handleCheckboxChange} style={{width: '1.2rem', height: '1.2rem'}} /> Sistem Hidrolik & Elektrikal berfungsi normal
                  </label>
                  <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#334155'}}>
                    <input type="checkbox" name="bucket" checked={pdiCheck.bucket} onChange={handleCheckboxChange} style={{width: '1.2rem', height: '1.2rem'}} /> Bucket / Attachment terpasang dengan baik
                  </label>
                  <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#334155'}}>
                    <input type="checkbox" name="body" checked={pdiCheck.body} onChange={handleCheckboxChange} style={{width: '1.2rem', height: '1.2rem'}} /> Body / Eksterior bebas cacat berat
                  </label>
                  <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#334155'}}>
                    <input type="checkbox" name="undercarriage" checked={pdiCheck.undercarriage} onChange={handleCheckboxChange} style={{width: '1.2rem', height: '1.2rem'}} /> Undercarriage (Rantai/Track) kencang
                  </label>
                  <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#334155'}}>
                    <input type="checkbox" name="accessories" checked={pdiCheck.accessories} onChange={handleCheckboxChange} style={{width: '1.2rem', height: '1.2rem'}} /> Kelengkapan Aksesoris disiapkan
                  </label>
                  
                  <div style={{ marginTop: '0.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#334155' }}>Catatan Tambahan (Opsional):</label>
                    <textarea 
                      rows="3" 
                      value={pdiCheck.notes}
                      onChange={(e) => setPdiCheck({...pdiCheck, notes: e.target.value})}
                      placeholder="Misal: Cat tergores sedikit di bagian belakang..."
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <button onClick={handleSelesaiPDI} style={{...styles.btnAjukan, backgroundColor: '#8b5cf6'}}>
                  ✓ PDI Selesai & Unit Siap Kirim
                </button>
              </div>
            )}

            {/* ====== 3. KETERANGAN GLOBAL (Jika sudah melewati tahap Ops) ====== */}
            {['SIAP_KIRIM'].includes(detail.status) && user?.role !== 'Customer' && (
              <div style={{...styles.alertCustomer, backgroundColor: '#ecfdf5', color: '#065f46'}}>
                <strong>✓ Tahap Operasional Selesai!</strong> Unit sudah berstatus Siap Kirim dan menunggu jadwal pengiriman.
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

// --- STYLING ---
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
  btnAjukan: { width: '100%', padding: '0.85rem', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }
};

export default TransaksiDetail;