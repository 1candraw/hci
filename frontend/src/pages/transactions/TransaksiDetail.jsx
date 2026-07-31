import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { transaksiService } from '../../services/transaksi.service'; // Sesuaikan path

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

  // --- FUNGSI SALES: KIRIM PENAWARAN AWAL ---
  const handleKirimPenawaran = async (e) => {
    e.preventDefault();
    if (!hargaPenawaran || !ongkosKirim) {
      alert("Harga Penawaran dan Ongkos Kirim wajib diisi!");
      return;
    }
    try {
      const payload = {
        harga_penawaran: Number(hargaPenawaran),
        ongkos_kirim: Number(ongkosKirim),
        diskon: diskon ? Number(diskon) : 0
      };
      await transaksiService.submitPenawaran(id, payload);
      alert('Berhasil! Harga penawaran telah diteruskan ke Manager untuk dievaluasi.');
      fetchDetail(); 
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat mengirim penawaran. Coba lagi.');
    }
  };

  // --- FUNGSI MANAGER: REVIEW PENAWARAN AWAL ---
  const handleReviewManager = async (action) => {
    const confirmText = action === 'approve' ? 'menyetujui' : 'menolak';
    if (!window.confirm(`Apakah Anda yakin ingin ${confirmText} penawaran ini?`)) return;
    try {
      await transaksiService.reviewPenawaran(id, action);
      alert(`Penawaran berhasil di-${action}!`);
      fetchDetail(); 
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat memproses review.');
    }
  };

  // --- FUNGSI CUSTOMER: BAYAR DP VIA MIDTRANS ---
  const handleBayarDP = async () => {
    try {
      const response = await transaksiService.payDP(id);
      window.snap.pay(response.token, {
        onSuccess: async function(result){
          alert("Pembayaran Berhasil! Bukti TF (Kuitansi) telah diteruskan ke tim Sales.");
          try {
            await transaksiService.updateStatus(id, 'DP_DIBAYAR');
            fetchDetail(); 
          } catch (err) { console.error(err); }
        },
        onPending: async function(result){
          // Trik Demo Skripsi
          alert("Virtual Account dibuat! (Simulasi Skripsi: Anggap DP langsung dilunasi dan Bukti TF masuk ke sistem).");
          try {
            await transaksiService.updateStatus(id, 'DP_DIBAYAR');
            fetchDetail(); 
          } catch (err) { console.error(err); }
        },
        onError: function(result){ alert("Pembayaran gagal!"); },
        onClose: function(){ alert('Anda menutup halaman pembayaran.'); }
      });
    } catch (error) {
      console.error(error);
      alert('Gagal memuat halaman pembayaran.');
    }
  };

  // --- FUNGSI SALES: VERIFIKASI BUKTI TF DP ---
  const handleVerifikasiSales = async () => {
    if (!window.confirm("Pastikan Anda sudah mengecek Bukti TF. Konfirmasi verifikasi DP?")) return;
    try {
      await transaksiService.updateStatus(id, 'VERIFIKASI_DP_SALES');
      alert("Berhasil! Bukti TF dan status telah diteruskan ke Manager untuk Final Approval.");
      fetchDetail();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat memverifikasi DP.");
    }
  };

  // --- FUNGSI MANAGER: APPROVE BUKTI TF DP -> MASUK OPERASIONAL ---
  const handleApproveManagerDP = async () => {
    if (!window.confirm("Approve Bukti TF ini dan teruskan unit ke tim Operasional untuk dicek?")) return;
    try {
      await transaksiService.updateStatus(id, 'PROSES_OPERASIONAL');
      alert("Berhasil! Pesanan sekarang resmi ditangani tim Operasional.");
      fetchDetail();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyetujui DP.");
    }
  };

  // --- FUNGSI BERSAMA: DOWNLOAD BUKTI TF / KUITANSI DP (PDF) ---
  const handleDownloadKuitansiDP = () => {
    const doc = new jsPDF();
    
    // Hitung ulang DP 10% dari total akhir
    const totalAkhir = Number(detail.harga_penawaran) + Number(detail.ongkos_kirim) - Number(detail.diskon);
    const dpAmount = Math.round(totalAkhir * 0.1); 

    // --- 1. KOP SURAT ---
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Biru
    doc.setFont("helvetica", "bold");
    doc.text("HEAVY CARE.ID", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text("Penyedia Alat Berat Terpercaya & Berkualitas", 14, 28);
    doc.text("Sistem Pembayaran Terintegrasi Midtrans", 14, 33);

    // Garis pemisah kop surat
    doc.setLineWidth(0.5);
    doc.line(14, 38, 196, 38);

    // --- 2. JUDUL DOKUMEN ---
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("KUITANSI PEMBAYARAN UANG MUKA (DP)", 105, 50, { align: "center" });

    // --- 3. ISI KUITANSI ---
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    doc.text(`Telah terima dari     : ${detail.perusahaan}`, 14, 65);
    doc.text(`Uang sejumlah       : ${formatRupiah(dpAmount)}`, 14, 75);
    doc.text(`Untuk Pembayaran : Uang Muka (DP 10%) Pesanan ${detail.nama_unit}`, 14, 85);
    doc.text(`Nomor Pesanan       : ${detail.nomor_dokumen || 'QO-' + detail.id}`, 14, 95);
    doc.text(`Metode Bayar         : Otomatis via Midtrans (LUNAS)`, 14, 105);

    // --- 4. KOTAK JUMLAH UANG ---
    doc.setFillColor(239, 246, 255); // Background biru muda
    doc.rect(14, 115, 80, 15, 'F');
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text(formatRupiah(dpAmount), 54, 125, { align: "center" });

    // --- 5. TANDA TANGAN (AUTO-GENERATED) ---
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`Jakarta, ${new Date().toLocaleDateString('id-ID')}`, 140, 130);
    doc.text("Diverifikasi Oleh,", 147, 137);
    
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text("Sistem Pembayaran Auto", 137, 152);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Manajemen heavy care.id", 137, 160);

    // --- 6. EKSEKUSI SAVE PDF ---
    doc.save(`Kuitansi_DP_${detail.nomor_dokumen || detail.id}.pdf`);
  };

  // --- FUNGSI CUSTOMER: DOWNLOAD PDF QUOTATION ---
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const totalAkhir = Number(detail.harga_penawaran) + Number(detail.ongkos_kirim) - Number(detail.diskon);

    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.setFont("helvetica", "bold");
    doc.text("HEAVY CARE.ID", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text("Penyedia Alat Berat Terpercaya & Berkualitas", 14, 28);
    doc.text("Email: admin@heavycare.id | Telp: (021) 1234-5678", 14, 33);

    doc.setLineWidth(0.5);
    doc.line(14, 38, 196, 38);

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("SURAT PENAWARAN HARGA (QUOTATION)", 105, 50, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Nomor Dokumen : ${detail.nomor_dokumen || 'QO-' + detail.id}`, 14, 65);
    doc.text(`Tanggal       : ${new Date(detail.tanggal).toLocaleDateString('id-ID')}`, 14, 71);
    
    doc.text("Kepada Yth:", 130, 65);
    doc.setFont("helvetica", "bold");
    doc.text(detail.perusahaan, 130, 71);
    doc.setFont("helvetica", "normal");
    doc.text(detail.telepon_perusahaan || '-', 130, 77);

    autoTable(doc, {
      startY: 90,
      head: [['No', 'Deskripsi Unit Alat Berat', 'Metode Bayar', 'Harga Dasar']],
      body: [
        ['1', detail.nama_unit, detail.metode_pembayaran.toUpperCase(), formatRupiah(detail.harga_penawaran)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }, 
      styles: { fontSize: 10, cellPadding: 4 }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.text("Rincian Kalkulasi Biaya:", 14, finalY);
    doc.setFont("helvetica", "normal");
    doc.text("Harga Penawaran Unit", 14, finalY + 8);
    doc.text(`: ${formatRupiah(detail.harga_penawaran)}`, 70, finalY + 8);
    doc.text("Estimasi Ongkos Kirim", 14, finalY + 14);
    doc.text(`: ${formatRupiah(detail.ongkos_kirim)}`, 70, finalY + 14);
    doc.text("Diskon Khusus", 14, finalY + 20);
    doc.text(`: - ${formatRupiah(detail.diskon)}`, 70, finalY + 20);
    doc.line(70, finalY + 23, 120, finalY + 23);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text("GRAND TOTAL", 14, finalY + 30);
    doc.text(`: ${formatRupiah(totalAkhir)}`, 70, finalY + 30);
    doc.setTextColor(0, 0, 0);
    doc.text("Catatan Tambahan / Lokasi Proyek:", 14, finalY + 45);
    doc.setFont("helvetica", "normal");
    
    const splitCatatan = doc.splitTextToSize(`- ${detail.catatan || 'Sesuai kesepakatan awal.'}`, 180);
    doc.text(splitCatatan, 14, finalY + 52);
    doc.text("Hormat Kami,", 145, finalY + 80);
    doc.setFont("helvetica", "bold");
    doc.text("Manajemen heavy care.id", 135, finalY + 105);

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
          <p style={styles.subtitle}>Dibuat pada: {new Date(detail.tanggal).toLocaleString('id-ID')}</p>
        </div>
        <span style={styles.badgeBesar}>{detail.status}</span>
      </div>

      <div style={styles.grid}>
        {/* KOLOM KIRI */}
        <div style={styles.leftCol}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Informasi Pelanggan</h3>
            <table style={styles.infoTable}>
              <tbody>
                <tr><td style={styles.tdLabel}>Perusahaan</td><td>: <strong>{detail.perusahaan}</strong></td></tr>
                <tr><td style={styles.tdLabel}>Email</td><td>: {detail.email_perusahaan || '-'}</td></tr>
                <tr><td style={styles.tdLabel}>Telepon</td><td>: {detail.telepon_perusahaan || '-'}</td></tr>
              </tbody>
            </table>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Spesifikasi Permintaan</h3>
            <table style={styles.infoTable}>
              <tbody>
                <tr><td style={styles.tdLabel}>Unit Diminta</td><td>: <strong>{detail.nama_unit}</strong></td></tr>
                <tr><td style={styles.tdLabel}>Harga Dasar Unit</td><td>: {formatRupiah(detail.harga_unit)}</td></tr>
                <tr><td style={styles.tdLabel}>Metode Pembayaran</td><td>: {detail.metode_pembayaran.toUpperCase()}</td></tr>
                <tr><td style={styles.tdLabel}>Sumber Pesanan</td><td>: {detail.sumber_pesanan.toUpperCase()}</td></tr>
              </tbody>
            </table>
            <div style={{ marginTop: '1rem' }}>
              <p style={styles.tdLabel}><strong>Catatan / Lokasi Proyek:</strong></p>
              <div style={styles.catatanBox}>{detail.catatan || 'Tidak ada catatan khusus.'}</div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN */}
        <div style={styles.rightCol}>
          <div style={{...styles.card, borderTop: '4px solid #2563eb'}}>
            <h3 style={styles.cardTitle}>Keterangan & Aksi</h3>
            
            {/* ====== 1. TAMPILAN CUSTOMER ====== */}
            {user?.role === 'Customer' && (
              <div>
                {detail.status === 'PENDING' && <div style={styles.alertCustomer}>Saat ini pesanan Anda sedang ditinjau oleh tim Sales kami.</div>}
                {detail.status === 'MENUNGGU_APPROVAL' && <div style={{...styles.alertCustomer, backgroundColor: '#fef3c7', color: '#b45309'}}>Sales sedang memproses penawaran.</div>}
                {detail.status === 'APPROVED' && (
                  <div style={{...styles.alertCustomer, backgroundColor: '#ecfdf5', color: '#065f46'}}>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '1.05rem' }}><strong>Penawaran Anda sudah siap!</strong></p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <button onClick={handleDownloadPDF} style={{...styles.btnAjukan, backgroundColor: '#10b981'}}>📄 Download Penawaran</button>
                      <button onClick={handleBayarDP} style={{...styles.btnAjukan, backgroundColor: '#2563eb'}}>💳 Bayar via Midtrans</button>
                    </div>
                  </div>
                )}
                {/* SETELAH BAYAR DP */}
                {['DP_DIBAYAR', 'VERIFIKASI_DP_SALES', 'PROSES_OPERASIONAL'].includes(detail.status) && (
                  <div style={{...styles.alertCustomer, backgroundColor: '#eff6ff', color: '#1d4ed8'}}>
                    <p><strong>Pembayaran DP Berhasil!</strong></p>
                    <p style={{fontSize: '0.9rem', marginBottom: '1rem'}}>Status saat ini: <strong>{detail.status.replace(/_/g, ' ')}</strong></p>
                    <button onClick={handleDownloadKuitansiDP} style={{...styles.btnAjukan, backgroundColor: '#3b82f6'}}>
                      ⬇️ Download Bukti TF DP
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ====== 2. TAMPILAN SALES ====== */}
            {(user?.role === 'Sales' || user?.role === 'Admin') && (
              <div>
                {detail.status === 'PENDING' && (
                  <form onSubmit={handleKirimPenawaran}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Harga Penawaran Final (Rp)</label>
                      <input type="number" required style={styles.input} placeholder={detail.harga_unit} value={hargaPenawaran} onChange={(e) => setHargaPenawaran(e.target.value)} />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Estimasi Ongkos Kirim (Rp)</label>
                      <input type="number" required style={styles.input} placeholder="Contoh: 15000000" value={ongkosKirim} onChange={(e) => setOngkosKirim(e.target.value)} />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Diskon Khusus (Rp)</label>
                      <input type="number" style={styles.input} placeholder="Contoh: 5000000" value={diskon} onChange={(e) => setDiskon(e.target.value)} />
                    </div>
                    <hr style={{margin: '1.5rem 0', borderColor: '#e5e7eb'}} />
                    <button type="submit" style={styles.btnAjukan}>Simpan & Ajukan ke Manager</button>
                  </form>
                )}

                {/* BUKTI TF MASUK KE SALES */}
                {detail.status === 'DP_DIBAYAR' && (
                  <div style={{...styles.alertCustomer, backgroundColor: '#fef3c7', color: '#b45309'}}>
                    <p><strong>Menunggu Verifikasi:</strong> Customer telah melakukan pembayaran DP. Silakan cek Bukti TF di bawah ini.</p>
                    <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
                      <button onClick={handleDownloadKuitansiDP} style={{...styles.btnAjukan, backgroundColor: '#3b82f6', flex: 1}}>
                        Bukti Transfer
                      </button>
                      <button onClick={handleVerifikasiSales} style={{...styles.btnAjukan, backgroundColor: '#d97706', flex: 1}}>
                        Verifikasi 
                      </button>
                    </div>
                  </div>
                )}
                {['VERIFIKASI_DP_SALES', 'PROSES_OPERASIONAL'].includes(detail.status) && (
                  <div style={styles.alertCustomer}>DP sudah diverifikasi. Pesanan sedang diproses di tahap selanjutnya.</div>
                )}
              </div>
            )}

            {/* ====== 3. TAMPILAN MANAGER ====== */}
            {user?.role === 'Manager' && (
              <div>
                {/* APPROVE HARGA AWAL */}
                {detail.status === 'MENUNGGU_APPROVAL' && (
                  <div>
                    <p>Sales telah mengajukan harga. Mohon periksa rincian di bawah:</p>
                    <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '6px', border: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#4b5563' }}>Harga Penawaran:</span><strong>{formatRupiah(detail.harga_penawaran)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#4b5563' }}>Ongkos Kirim:</span><strong>{formatRupiah(detail.ongkos_kirim)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: '#ef4444' }}>Diskon:</span><strong style={{ color: '#ef4444' }}>- {formatRupiah(detail.diskon)}</strong>
                      </div>
                      <hr style={{ borderColor: '#d1d5db', margin: '0.5rem 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '1.1rem' }}>
                        <span style={{ fontWeight: 'bold', color: '#1f2937' }}>Total Akhir:</span>
                        <strong style={{ color: '#2563eb' }}>{formatRupiah(Number(detail.harga_penawaran) + Number(detail.ongkos_kirim) - Number(detail.diskon))}</strong>
                      </div>
                    </div>
                    <div style={{display: 'flex', gap: '1rem'}}>
                      <button onClick={() => handleReviewManager('approve')} style={{...styles.btnAjukan, backgroundColor: '#10b981', flex: 1}}>✓ Setujui (Approve)</button>
                      <button onClick={() => handleReviewManager('reject')} style={{...styles.btnAjukan, backgroundColor: '#ef4444', flex: 1}}>✕ Tolak</button>
                    </div>
                  </div>
                )}

                {/* BUKTI TF MASUK KE MANAGER UNTUK FINAL APPROVAL */}
                {detail.status === 'VERIFIKASI_DP_SALES' && (
                  <div style={{...styles.alertCustomer, backgroundColor: '#ecfdf5', color: '#065f46'}}>
                    <p><strong>Persetujuan Akhir:</strong> Sales telah memverifikasi Bukti TF (DP). Silakan periksa kembali sebelum meneruskan ke Operasional.</p>
                    <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem', flexDirection: 'column'}}>
                      <button onClick={handleDownloadKuitansiDP} style={{...styles.btnAjukan, backgroundColor: '#3b82f6'}}>
                        📄 Lihat Bukti TF (Kuitansi DP)
                      </button>
                      <button onClick={handleApproveManagerDP} style={{...styles.btnAjukan, backgroundColor: '#059669'}}>
                        ✓ Approve DP & Teruskan ke Operasional
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ====== 4. TAMPILAN OPERASIONAL ====== */}
            {detail.status === 'PROSES_OPERASIONAL' && (
              <div style={{...styles.alertCustomer, backgroundColor: '#f3f4f6', color: '#1f2937', marginTop: '1rem', border: '2px dashed #9ca3af'}}>
                <strong>🚧 Halaman Operasional 🚧</strong>
                <p style={{fontSize: '0.9rem', marginTop: '0.5rem'}}>
                  DP telah disetujui. Unit sedang melalui proses Pre-Delivery Inspection (PDI) oleh tim Mekanik dan Operasional untuk persiapan pengiriman.
                </p>
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
  subtitle: { margin: 0, color: '#6b7280' },
  badgeBesar: { padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#d97706', fontWeight: 'bold', fontSize: '1.1rem' },
  grid: { display: 'grid', gridTemplateColumns: '6fr 4fr', gap: '2rem', alignItems: 'start' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  rightCol: { position: 'sticky', top: '2rem' }, 
  card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  cardTitle: { margin: '0 0 1.25rem 0', color: '#374151', borderBottom: '2px solid #f3f4f6', paddingBottom: '0.5rem' },
  infoTable: { width: '100%', borderCollapse: 'collapse' },
  tdLabel: { padding: '0.75rem 0', color: '#6b7280', width: '180px' },
  catatanBox: { backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '6px', border: '1px dashed #d1d5db', color: '#374151', lineHeight: '1.5' },
  alertCustomer: { backgroundColor: '#eff6ff', color: '#1e40af', padding: '1rem', borderRadius: '6px', lineHeight: '1.5' },
  inputGroup: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold', color: '#374151' },
  input: { width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' },
  btnAjukan: { width: '100%', padding: '0.85rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }
};

export default TransaksiDetail;