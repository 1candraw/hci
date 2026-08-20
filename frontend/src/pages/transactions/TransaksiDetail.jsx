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

  // Form states Sales
  const [hargaPenawaran, setHargaPenawaran] = useState('');
  const [ongkosKirim, setOngkosKirim] = useState('');
  const [diskon, setDiskon] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form states PDI (Operasional)
  const [pdiCheck, setPdiCheck] = useState({
    engine: true, hydraulic: true, bucket: true, 
    body: true, undercarriage: true, accessories: true, notes: ''
  });

  // Form states Delivery Order (Operasional)
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
        if (data.harga_penawaran) setHargaPenawaran(data.harga_penawaran);
        if (data.ongkos_kirim) setOngkosKirim(data.ongkos_kirim);
        if (data.diskon) setDiskon(data.diskon);
        setDeliveryForm(prev => ({
          ...prev, 
          destination: data.guest_location || data.catatan || data.perusahaan || ''
        }));
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

  // -- Handler Sales Kirim Penawaran --
  const handleKirimPenawaran = async (e) => {
    e.preventDefault();
    if (!hargaPenawaran || Number(hargaPenawaran) <= 0) {
      alert("Harap masukkan harga penawaran yang valid.");
      return;
    }
    setSubmitting(true);
    try {
      await transaksiService.submitPenawaran(id, {
        harga_penawaran: Number(hargaPenawaran),
        ongkos_kirim: Number(ongkosKirim) || 0,
        diskon: diskon ? Number(diskon) : 0
      });
      alert('Penawaran harga berhasil diajukan ke Manager!');
      fetchDetail();
    } catch (err) {
      alert(err);
    } finally {
      setSubmitting(false);
    }
  };

  // -- Handler Manager Review Penawaran --
  const handleReviewManager = async (action) => {
    const confirmMsg = action === 'approve' 
      ? 'Setujui penawaran harga ini untuk diteruskan ke customer?' 
      : 'Tolak penawaran harga ini?';
    if (!window.confirm(confirmMsg)) return;

    setSubmitting(true);
    try {
      await transaksiService.reviewPenawaran(id, action);
      alert(`Pesanan berhasil di-${action === 'approve' ? 'setujui' : 'tolak'}!`);
      fetchDetail();
    } catch (err) {
      alert(err);
    } finally {
      setSubmitting(false);
    }
  };

  // -- Handler Bayar DP (Customer) --
  const handleBayarDP = async () => {
    try {
      const res = await transaksiService.payDP(id);
      if (res?.token && window.snap) {
        window.snap.pay(res.token, {
          onSuccess: async () => { await transaksiService.updateStatus(id, 'DP_DIBAYAR'); fetchDetail(); },
          onPending: async () => { await transaksiService.updateStatus(id, 'DP_DIBAYAR'); fetchDetail(); },
          onError: () => alert('Pembayaran gagal')
        });
      } else {
        await transaksiService.updateStatus(id, 'DP_DIBAYAR');
        alert('Status diubah menjadi DP DIBAYAR.');
        fetchDetail();
      }
    } catch {
      await transaksiService.updateStatus(id, 'DP_DIBAYAR');
      fetchDetail();
    }
  };

  // -- Handler Verifikasi DP oleh Sales --
  const handleVerifikasiSales = async () => {
    if (!window.confirm("Verifikasi bahwa pembayaran DP telah masuk ke rekening perusahaan?")) return;
    setSubmitting(true);
    try {
      await transaksiService.updateStatus(id, 'VERIFIKASI_DP_SALES');
      alert("Pembayaran DP terverifikasi oleh Sales!");
      fetchDetail();
    } catch (err) {
      alert(err);
    } finally {
      setSubmitting(false);
    }
  };

  // -- Handler Approval DP oleh Manager (Teruskan ke Operasional) --
  const handleApproveManagerDP = async () => {
    if (!window.confirm("Teruskan pesanan ke Tim Operasional untuk inspeksi PDI?")) return;
    setSubmitting(true);
    try {
      await transaksiService.updateStatus(id, 'PROSES_OPERASIONAL');
      alert("Pesanan diteruskan ke Tim Operasional!");
      fetchDetail();
    } catch (err) {
      alert(err);
    } finally {
      setSubmitting(false);
    }
  };

  // -- Handler PDI Selesai (Operasional) --
  const handleSelesaiPDI = async (e) => {
    e.preventDefault();
    if (!window.confirm("Pastikan semua checklist inspeksi unit telah selesai. Lanjutkan?")) return;
    setSubmitting(true);
    try {
      await transaksiService.submitPDI(id, pdiCheck);
      alert("PDI selesai! Unit siap dikirim.");
      fetchDetail();
    } catch (err) {
      alert(err);
    } finally {
      setSubmitting(false);
    }
  };

  // -- Handler Kirim Unit / Terbitkan Surat Jalan (Operasional) --
  const handleSubmitDelivery = async (e) => {
    e.preventDefault();
    if (!deliveryForm.driverName || !deliveryForm.vehicleNumber || !deliveryForm.destination) {
      alert("Harap lengkapi data pengiriman (Nama Driver, No. Kendaraan, Tujuan).");
      return;
    }
    setSubmitting(true);
    try {
      await transaksiService.submitDeliveryOrder(id, deliveryForm);
      alert("Surat Jalan berhasil diterbitkan! Unit dalam perjalanan.");
      fetchDetail();
    } catch (err) {
      alert(err);
    } finally {
      setSubmitting(false);
    }
  };

  // -- Handler Konfirmasi Terima Unit (Customer) --
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

  // -- Handler Download BAST PDF --
  const handleDownloadBAST = () => {
    const doc = new jsPDF();
    doc.setFontSize(22); doc.setTextColor(37, 99, 235); doc.setFont("helvetica", "bold");
    doc.text("HEAVY CARE.ID", 14, 22);
    doc.setFontSize(10); doc.setTextColor(100, 100, 100); doc.setFont("helvetica", "normal");
    doc.text("Penyedia Alat Berat Terpercaya & Berkualitas", 14, 28);
    doc.setLineWidth(0.5); doc.line(14, 38, 196, 38);

    doc.setFontSize(14); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold");
    doc.text("BERITA ACARA SERAH TERIMA (BAST)", 105, 50, { align: "center" });

    doc.setFontSize(11); doc.setFont("helvetica", "normal");
    doc.text("Pada hari ini, telah dilakukan serah terima unit alat berat dengan rincian sebagai berikut:", 14, 65);
    
    doc.text(`Nomor Pesanan      : ${detail.nomor_dokumen || 'QO-' + detail.id}`, 14, 75);
    doc.text(`Nama Customer      : ${detail.perusahaan || detail.guest_name || '-'}`, 14, 82);
    doc.text(`Unit Alat Berat         : ${detail.nama_unit}`, 14, 89);
    doc.text(`Metode Bayar         : ${(detail.metode_pembayaran || 'CASH').toUpperCase()}`, 14, 96);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Status                       : DITERIMA DENGAN BAIK`, 14, 103);
    
    doc.setFont("helvetica", "normal");
    const pernyataan = "Pihak pembeli menyatakan bahwa unit alat berat telah diterima di lokasi proyek dan telah diperiksa secara fisik dalam kondisi baik, serta kelengkapan aksesoris telah sesuai dengan Pre-Delivery Inspection (PDI) yang disepakati.";
    const splitPernyataan = doc.splitTextToSize(pernyataan, 180);
    doc.text(splitPernyataan, 14, 115);

    doc.text("Pihak HeavyCare ID,", 30, 150);
    doc.text("(..........................................)", 25, 175);
    doc.setFont("helvetica", "bold");
    doc.text("Tim Logistik", 38, 182);

    doc.setFont("helvetica", "normal");
    doc.text("Pihak Pembeli,", 130, 150);
    doc.text("(..........................................)", 125, 175);
    doc.setFont("helvetica", "bold");
    doc.text(detail.perusahaan || detail.guest_name || 'Customer', 130, 182);

    doc.save(`BAST_${detail.nomor_dokumen || detail.id}.pdf`);
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Memuat rincian pesanan...</div>;
  if (!detail) return <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>Data pesanan tidak ditemukan.</div>;

  const totalAkhir = detail.harga_penawaran 
    ? Number(detail.harga_penawaran) + Number(detail.ongkos_kirim || 0) - Number(detail.diskon || 0)
    : null;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <button onClick={() => navigate('/transaksi')} style={styles.backBtn}>← Kembali ke Daftar Pesanan</button>
          <h2 style={styles.title}>Pesanan: {detail.nomor_dokumen || detail.nomor_pemesanan || 'QO-'+detail.id}</h2>
        </div>
        <span style={styles.badgeBesar}>{detail.status ? detail.status.replace(/_/g, ' ') : 'PENDING'}</span>
      </div>

      <div style={styles.grid}>
        {/* KOLOM KIRI: Informasi Dokumen & Rincian */}
        <div style={styles.leftCol}>
          {/* Card Info Pemesan */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Informasi Pemesan</h3>
            <table style={styles.infoTable}>
              <tbody>
                <tr>
                  <td style={styles.tdLabel}>Tipe / Sumber</td>
                  <td>: <span style={{
                    fontWeight: 'bold', 
                    color: detail.sumber_pesanan === 'guest' ? '#d97706' : '#2563eb'
                  }}>
                    {detail.sumber_pesanan === 'guest' ? '🌐 Guest RFQ (Tanpa Akun)' : 'Pelanggan Terdaftar'}
                  </span></td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>Perusahaan</td>
                  <td>: <strong>{detail.perusahaan || detail.guest_company || '-'}</strong></td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>Nama PIC / Kontak</td>
                  <td>: {detail.guest_name || detail.nama_customer || '-'}</td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>Telepon / WhatsApp</td>
                  <td>: {detail.telepon_perusahaan || detail.guest_phone || '-'}</td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>Email</td>
                  <td>: {detail.email_perusahaan || detail.guest_email || '-'}</td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>Lokasi / Catatan</td>
                  <td>: {detail.catatan || detail.guest_location || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Card Info Unit & Penawaran */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Rincian Unit & Harga</h3>
            <table style={styles.infoTable}>
              <tbody>
                <tr>
                  <td style={styles.tdLabel}>Unit Diminta</td>
                  <td>: <strong style={{color: '#1e3a8a'}}>{detail.nama_unit}</strong></td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>Metode Pembayaran</td>
                  <td>: {(detail.metode_pembayaran || 'cash').toUpperCase()}</td>
                </tr>
                {detail.harga_penawaran ? (
                  <>
                    <tr>
                      <td style={styles.tdLabel}>Harga Penawaran</td>
                      <td>: {formatRupiah(detail.harga_penawaran)}</td>
                    </tr>
                    <tr>
                      <td style={styles.tdLabel}>Ongkos Kirim</td>
                      <td>: {formatRupiah(detail.ongkos_kirim)}</td>
                    </tr>
                    <tr>
                      <td style={styles.tdLabel}>Diskon</td>
                      <td>: <span style={{color: '#dc2626'}}>- {formatRupiah(detail.diskon)}</span></td>
                    </tr>
                    <tr style={{borderTop: '2px solid #e5e7eb'}}>
                      <td style={{...styles.tdLabel, fontWeight: 'bold', color: '#0f172a', paddingTop: '0.75rem'}}>Total Akhir</td>
                      <td style={{fontWeight: 'bold', color: '#059669', fontSize: '1.2rem', paddingTop: '0.75rem'}}>: {formatRupiah(totalAkhir)}</td>
                    </tr>
                    <tr>
                      <td style={styles.tdLabel}>Kewajiban DP (10%)</td>
                      <td>: <strong style={{color: '#d97706'}}>{formatRupiah(Math.round(totalAkhir * 0.1))}</strong></td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td style={styles.tdLabel}>Status Penawaran</td>
                    <td>: <span style={{color: '#d97706', fontWeight: 'bold'}}>Belum diinput oleh Sales</span></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Card BUKTI PEMBAYARAN DP (Muncul jika ada data DP atau status pembayaran) */}
          {(detail.dp_bank_name || detail.dp_proof_url || ['DP_DIBAYAR', 'VERIFIKASI_DP_SALES', 'PROSES_OPERASIONAL', 'SIAP_KIRIM', 'PENGIRIMAN', 'SELESAI'].includes(detail.status)) && (
            <div style={{...styles.card, border: '2px solid #93c5fd', backgroundColor: '#f8fafc'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem'}}>
                <h3 style={{...styles.cardTitle, margin: 0, border: 'none', color: '#1e40af'}}>
                  💳 Bukti Pembayaran DP (Uang Muka)
                </h3>
                <span style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  backgroundColor: detail.status === 'DP_DIBAYAR' ? '#fef3c7' : '#dcfce7',
                  color: detail.status === 'DP_DIBAYAR' ? '#b45309' : '#15803d'
                }}>
                  {detail.status === 'DP_DIBAYAR' ? '⏳ Menunggu Verifikasi Sales' : '✅ DP Terverifikasi'}
                </span>
              </div>

              <table style={styles.infoTable}>
                <tbody>
                  <tr>
                    <td style={styles.tdLabel}>Bank Pengirim</td>
                    <td>: <strong>{detail.dp_bank_name || '-'}</strong></td>
                  </tr>
                  <tr>
                    <td style={styles.tdLabel}>Nomor Rekening</td>
                    <td>: <code style={{backgroundColor: '#e2e8f0', padding: '0.1rem 0.4rem', borderRadius: '4px'}}>{detail.dp_account_number || '-'}</code></td>
                  </tr>
                  <tr>
                    <td style={styles.tdLabel}>Atas Nama</td>
                    <td>: <strong>{detail.dp_account_name || '-'}</strong></td>
                  </tr>
                  <tr>
                    <td style={styles.tdLabel}>Nominal Transfer</td>
                    <td>: <strong style={{color: '#059669', fontSize: '1.05rem'}}>{formatRupiah(detail.dp_amount || (totalAkhir ? Math.round(totalAkhir * 0.1) : 0))}</strong></td>
                  </tr>
                  <tr>
                    <td style={styles.tdLabel}>Waktu Transfer</td>
                    <td>: {detail.dp_paid_at ? new Date(detail.dp_paid_at).toLocaleString('id-ID') : '-'}</td>
                  </tr>
                </tbody>
              </table>

              {/* Preview Slip Transfer */}
              {detail.dp_proof_url && (
                <div style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', textAlign: 'center'}}>
                  <p style={{fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.5rem'}}>
                    Foto / File Slip Bukti Transfer:
                  </p>
                  <a href={detail.dp_proof_url} target="_blank" rel="noopener noreferrer" style={{display: 'inline-block'}}>
                    <img 
                      src={detail.dp_proof_url} 
                      alt="Slip Bukti Pembayaran DP" 
                      style={{
                        maxWidth: '100%', 
                        maxHeight: '220px', 
                        borderRadius: '8px', 
                        border: '2px solid #cbd5e1', 
                        boxShadow: '0 4px 6px rgba(0,0,0,0.08)',
                        cursor: 'zoom-in'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </a>
                  <div style={{marginTop: '0.5rem'}}>
                    <a 
                      href={detail.dp_proof_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{
                        fontSize: '0.82rem', 
                        color: '#2563eb', 
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        display: 'inline-block',
                        padding: '0.35rem 0.75rem',
                        backgroundColor: '#eff6ff',
                        borderRadius: '6px',
                        border: '1px solid #bfdbfe'
                      }}
                    >
                      🔍 Buka Slip Ukuran Penuh / PDF di Tab Baru ↗
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* KOLOM KANAN: Aksi Berdasarkan Role & Status */}
        <div style={styles.rightCol}>
          <div style={{...styles.card, borderTop: '4px solid #2563eb'}}>
            <h3 style={styles.cardTitle}>Panel Aksi & Status</h3>

            {/* 1. SALES: INPUT HARGA PENAWARAN (Saat Status PENDING) */}
            {(user?.role === 'Sales' || user?.role === 'Admin') && detail.status === 'PENDING' && (
              <div>
                <div style={{backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid #bfdbfe'}}>
                  <h4 style={{margin: '0 0 0.4rem', color: '#1e40af'}}>📝 Form Penawaran Sales</h4>
                  <p style={{margin: 0, fontSize: '0.85rem', color: '#3b82f6'}}>Masukkan rincian harga penawaran untuk diajukan ke Manager.</p>
                </div>
                <form onSubmit={handleKirimPenawaran}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Harga Unit (Rp) *</label>
                    <input 
                      type="number" 
                      style={styles.input} 
                      placeholder="Contoh: 500000000"
                      value={hargaPenawaran}
                      onChange={(e) => setHargaPenawaran(e.target.value)}
                      required 
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Ongkos Kirim (Rp)</label>
                    <input 
                      type="number" 
                      style={styles.input} 
                      placeholder="Contoh: 15000000"
                      value={ongkosKirim}
                      onChange={(e) => setOngkosKirim(e.target.value)} 
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Diskon (Rp)</label>
                    <input 
                      type="number" 
                      style={styles.input} 
                      placeholder="Contoh: 5000000"
                      value={diskon}
                      onChange={(e) => setDiskon(e.target.value)} 
                    />
                  </div>
                  <button type="submit" style={{...styles.btnAjukan, backgroundColor: '#2563eb'}} disabled={submitting}>
                    {submitting ? 'Mengirim...' : '🚀 Ajukan ke Manager'}
                  </button>
                </form>
              </div>
            )}

            {/* 2. MANAGER: REVIEW PENAWARAN (Saat Status MENUNGGU_APPROVAL) */}
            {(user?.role === 'Manager' || user?.role === 'Admin') && detail.status === 'MENUNGGU_APPROVAL' && (
              <div>
                <div style={{backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid #fde68a'}}>
                  <h4 style={{margin: '0 0 0.4rem', color: '#92400e'}}>⏳ Menunggu Persetujuan Manager</h4>
                  <p style={{margin: 0, fontSize: '0.85rem', color: '#78350f'}}>Periksa rincian harga yang diajukan oleh Sales di sebelah kiri.</p>
                </div>
                <div style={{display: 'flex', gap: '0.75rem'}}>
                  <button 
                    onClick={() => handleReviewManager('approve')} 
                    style={{...styles.btnAjukan, backgroundColor: '#10b981', flex: 1}}
                    disabled={submitting}
                  >
                    ✅ Setujui Penawaran
                  </button>
                  <button 
                    onClick={() => handleReviewManager('reject')} 
                    style={{...styles.btnAjukan, backgroundColor: '#ef4444', flex: 1}}
                    disabled={submitting}
                  >
                    ❌ Tolak
                  </button>
                </div>
              </div>
            )}

            {/* SALES MELIHAT STATUS MENUNGGU APPROVAL */}
            {user?.role === 'Sales' && detail.status === 'MENUNGGU_APPROVAL' && (
              <div style={styles.alertCustomer}>
                <h4 style={{margin: '0 0 0.5rem'}}>⏳ Penawaran Sedang Ditinjau</h4>
                <p style={{fontSize: '0.88rem', margin: 0}}>Penawaran harga telah diteruskan ke Manager dan sedang menunggu persetujuan.</p>
              </div>
            )}

            {/* 3. CUSTOMER / GUEST: BAYAR DP (Saat Status APPROVED) */}
            {detail.status === 'APPROVED' && (
              <div>
                <div style={{backgroundColor: '#d1fae5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #a7f3d0'}}>
                  <h4 style={{margin: '0 0 0.4rem', color: '#065f46'}}>✅ Penawaran Disetujui!</h4>
                  <p style={{margin: 0, fontSize: '0.88rem', color: '#047857'}}>Menunggu pembeli melakukan konfirmasi dan pengiriman bukti pembayaran DP.</p>
                </div>
                {user?.role === 'Customer' && (
                  <button onClick={handleBayarDP} style={{...styles.btnAjukan, backgroundColor: '#2563eb'}}>
                    💳 Konfirmasi / Bayar DP (10%)
                  </button>
                )}
              </div>
            )}

            {/* 4. SALES: VERIFIKASI PEMBAYARAN DP (Saat Status DP_DIBAYAR) */}
            {(user?.role === 'Sales' || user?.role === 'Admin') && detail.status === 'DP_DIBAYAR' && (
              <div>
                <div style={{backgroundColor: '#e0e7ff', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #c7d2fe'}}>
                  <h4 style={{margin: '0 0 0.4rem', color: '#3730a3'}}>💳 Bukti Bayar DP Masuk!</h4>
                  <p style={{margin: 0, fontSize: '0.88rem', color: '#4338ca', lineHeight: '1.4'}}>
                    Pembeli telah mengunggah bukti transfer DP. Silakan cek rincian & slip transfer di sebelah kiri, lalu klik verifikasi.
                  </p>
                </div>
                <button onClick={handleVerifikasiSales} style={{...styles.btnAjukan, backgroundColor: '#4f46e5'}} disabled={submitting}>
                  {submitting ? 'Memproses...' : '✅ Verifikasi Pembayaran DP Masuk'}
                </button>
              </div>
            )}

            {/* MANAGER MELIHAT STATUS DP_DIBAYAR */}
            {user?.role === 'Manager' && detail.status === 'DP_DIBAYAR' && (
              <div style={styles.alertCustomer}>
                <h4 style={{margin: '0 0 0.5rem'}}>⏳ Menunggu Verifikasi Sales</h4>
                <p style={{fontSize: '0.88rem', margin: 0}}>Pembeli telah mengirimkan bukti bayar DP. Tim Sales sedang melakukan verifikasi mutasi bank.</p>
              </div>
            )}

            {/* 5. MANAGER: APPROVE DP & TERUSKAN KE OPERASIONAL (Saat Status VERIFIKASI_DP_SALES) */}
            {(user?.role === 'Manager' || user?.role === 'Admin') && detail.status === 'VERIFIKASI_DP_SALES' && (
              <div>
                <div style={{backgroundColor: '#ede9fe', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #ddd6fe'}}>
                  <h4 style={{margin: '0 0 0.4rem', color: '#5b21b6'}}>📋 DP Telah Diverifikasi Sales</h4>
                  <p style={{margin: 0, fontSize: '0.88rem', color: '#6d28d9', lineHeight: '1.4'}}>
                    Sales telah memvalidasi dana DP. Klik tombol di bawah untuk menyetujui pelepasan unit ke Tim Operasional (PDI).
                  </p>
                </div>
                <button onClick={handleApproveManagerDP} style={{...styles.btnAjukan, backgroundColor: '#7c3aed'}} disabled={submitting}>
                  {submitting ? 'Memproses...' : '🚀 Setujui DP & Teruskan ke Operasional'}
                </button>
              </div>
            )}

            {/* SALES MELIHAT STATUS VERIFIKASI_DP_SALES */}
            {user?.role === 'Sales' && detail.status === 'VERIFIKASI_DP_SALES' && (
              <div style={{...styles.alertCustomer, backgroundColor: '#ede9fe', color: '#5b21b6'}}>
                <h4 style={{margin: '0 0 0.5rem'}}>✅ DP Telah Anda Verifikasi</h4>
                <p style={{fontSize: '0.88rem', margin: 0}}>Dokumen sedang menunggu approval dari Manager untuk memulai inspeksi PDI.</p>
              </div>
            )}

            {/* 6. OPERASIONAL: INSPEKSI PDI (Saat Status PROSES_OPERASIONAL) */}
            {(user?.role === 'Operasional' || user?.role === 'Admin') && detail.status === 'PROSES_OPERASIONAL' && (
              <div>
                <div style={{backgroundColor: '#cffafe', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #a5f3fc'}}>
                  <h4 style={{margin: '0 0 0.4rem', color: '#155e75'}}>🔧 Checklist Pre-Delivery Inspection (PDI)</h4>
                  <p style={{margin: 0, fontSize: '0.85rem', color: '#0e7490'}}>Centang semua komponen yang telah lolos inspeksi fisik.</p>
                </div>
                <form onSubmit={handleSelesaiPDI}>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem'}}>
                    {[
                      ['engine', 'Pemeriksaan Mesin / Engine'],
                      ['hydraulic', 'Sistem Hidrolik & Selang'],
                      ['bucket', 'Kondisi Bucket & Silinder'],
                      ['body', 'Struktur Bodi & Kabin'],
                      ['undercarriage', 'Undercarriage & Track'],
                      ['accessories', 'Aksesoris & Lampu Kerja']
                    ].map(([key, label]) => (
                      <label key={key} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer'}}>
                        <input 
                          type="checkbox" 
                          checked={pdiCheck[key]} 
                          onChange={(e) => setPdiCheck({...pdiCheck, [key]: e.target.checked})}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <button type="submit" style={{...styles.btnAjukan, backgroundColor: '#0891b2'}} disabled={submitting}>
                    {submitting ? 'Menyimpan...' : '✅ Selesaikan PDI → Siap Kirim'}
                  </button>
                </form>
              </div>
            )}

            {/* 7. OPERASIONAL: TERBITKAN SURAT JALAN (Saat Status SIAP_KIRIM) */}
            {(user?.role === 'Operasional' || user?.role === 'Admin') && detail.status === 'SIAP_KIRIM' && (
              <div>
                <div style={{backgroundColor: '#dcfce7', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #bbf7d0'}}>
                  <h4 style={{margin: '0 0 0.4rem', color: '#166534'}}>🚚 Penerbitan Surat Jalan & Pengiriman</h4>
                  <p style={{margin: 0, fontSize: '0.85rem', color: '#15803d'}}>Isi data logistik untuk mengirimkan unit ke lokasi customer.</p>
                </div>
                <form onSubmit={handleSubmitDelivery}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Nama Driver / Ekspedisi *</label>
                    <input 
                      style={styles.input} 
                      placeholder="Contoh: Pak Joko (Trans Logistik)"
                      value={deliveryForm.driverName}
                      onChange={(e) => setDeliveryForm({...deliveryForm, driverName: e.target.value})}
                      required 
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Nomor Plat / Truk Trailer *</label>
                    <input 
                      style={styles.input} 
                      placeholder="Contoh: B 9876 XYZ"
                      value={deliveryForm.vehicleNumber}
                      onChange={(e) => setDeliveryForm({...deliveryForm, vehicleNumber: e.target.value})}
                      required 
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Alamat / Lokasi Tujuan *</label>
                    <textarea 
                      style={{...styles.input, height: '70px'}} 
                      placeholder="Alamat lengkap proyek..."
                      value={deliveryForm.destination}
                      onChange={(e) => setDeliveryForm({...deliveryForm, destination: e.target.value})}
                      required 
                    />
                  </div>
                  <button type="submit" style={{...styles.btnAjukan, backgroundColor: '#16a34a'}} disabled={submitting}>
                    {submitting ? 'Menerbitkan...' : '🚚 Terbitkan Surat Jalan & Kirim'}
                  </button>
                </form>
              </div>
            )}

            {/* 8. PENGIRIMAN & KONFIRMASI TERIMA UNIT */}
            {detail.status === 'PENGIRIMAN' && (
              <div>
                <div style={{backgroundColor: '#fef9c3', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fde047'}}>
                  <h4 style={{margin: '0 0 0.4rem', color: '#713f12'}}>🚚 Unit Dalam Perjalanan</h4>
                  <p style={{margin: 0, fontSize: '0.88rem', color: '#854d0e'}}>Unit alat berat sedang dikirim ke lokasi proyek.</p>
                </div>
                <button onClick={handleTerimaUnit} style={{...styles.btnAjukan, backgroundColor: '#059669'}}>
                  📦 Konfirmasi Unit Tiba di Lokasi
                </button>
              </div>
            )}

            {/* 9. TRANSAKSI SELESAI */}
            {detail.status === 'SELESAI' && (
              <div style={{backgroundColor: '#f0fdf4', color: '#166534', padding: '1.25rem', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'center'}}>
                <h4 style={{margin: '0 0 0.5rem 0', fontSize: '1.1rem'}}>🎉 Transaksi Selesai</h4>
                <p style={{fontSize: '0.9rem', marginBottom: '1rem', color: '#15803d'}}>
                  Unit telah diterima di lokasi proyek dan BAST resmi telah diterbitkan.
                </p>
                <button onClick={handleDownloadBAST} style={{...styles.btnAjukan, backgroundColor: '#16a34a'}}>
                  📄 Download Dokumen BAST (PDF)
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

// Styling UI
const styles = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  backBtn: { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' },
  title: { margin: '0 0 0.5rem 0', fontSize: '1.75rem', color: '#1f2937' },
  badgeBesar: { padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#d97706', fontWeight: 'bold', fontSize: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: '6fr 4fr', gap: '2rem', alignItems: 'start' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  rightCol: { position: 'sticky', top: '2rem' }, 
  card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  cardTitle: { margin: '0 0 1.25rem 0', color: '#374151', borderBottom: '2px solid #f3f4f6', paddingBottom: '0.5rem', fontSize: '1.1rem' },
  infoTable: { width: '100%', borderCollapse: 'collapse' },
  tdLabel: { padding: '0.65rem 0', color: '#6b7280', width: '180px', fontSize: '0.9rem' },
  alertCustomer: { backgroundColor: '#eff6ff', color: '#1e40af', padding: '1rem', borderRadius: '6px', lineHeight: '1.5' },
  inputGroup: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 'bold', color: '#374151' },
  input: { width: '100%', padding: '0.7rem', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box', fontSize: '0.9rem' },
  btnAjukan: { width: '100%', padding: '0.85rem', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' }
};

export default TransaksiDetail;