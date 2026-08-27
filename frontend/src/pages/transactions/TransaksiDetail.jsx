import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { transaksiService } from '../../services/transaksi.service';
import { generateQuotationPDF } from '../../utils/generateQuotationPDF';
import { generateBASTPDF } from '../../utils/generateBASTPDF';
import { generateInvoicePDF } from '../../utils/generateInvoicePDF';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Download
} from 'lucide-react';

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

  // -- Handler Konfirmasi Pembayaran (Customer) --
  const handleBayar = async () => {
    if (!window.confirm("Konfirmasi bahwa Anda telah melakukan pembayaran / transfer untuk pesanan ini?")) return;
    try {
      await transaksiService.updateStatus(id, 'DP_DIBAYAR');
      alert('Status berhasil diperbarui. Tim Sales kami akan memverifikasi mutasi pembayaran Anda.');
      fetchDetail();
    } catch (err) {
      alert(err || 'Gagal memperbarui status pembayaran.');
    }
  };

  // -- Handler Verifikasi Pembayaran oleh Sales --
  const handleVerifikasiSales = async () => {
    if (!window.confirm("Verifikasi bahwa dana pembayaran telah masuk ke rekening resmi perusahaan?")) return;
    setSubmitting(true);
    try {
      await transaksiService.updateStatus(id, 'VERIFIKASI_DP_SALES');
      alert("Pembayaran berhasil diverifikasi oleh Sales!");
      fetchDetail();
    } catch (err) {
      alert(err);
    } finally {
      setSubmitting(false);
    }
  };

  // -- Handler Approval Pembayaran oleh Manager (Teruskan ke Operasional) --
  const handleApproveManager = async () => {
    if (!window.confirm("Setujui pembayaran dan teruskan pesanan ke Tim Operasional untuk inspeksi PDI?")) return;
    setSubmitting(true);
    try {
      await transaksiService.updateStatus(id, 'PROSES_OPERASIONAL');
      alert("Pesanan berhasil diteruskan ke Tim Operasional!");
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
    if (!detail) {
      alert("Data transaksi tidak ditemukan.");
      return;
    }
    generateBASTPDF(detail);
  };

  if (loading) return (
    <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
      <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#74c02c', borderRadius: '50%', margin: '0 auto 1rem' }} />
      <p style={{ fontWeight: '700' }}>Memuat rincian pesanan...</p>
    </div>
  );
  if (!detail) return <div style={{ padding: '3rem', textAlign: 'center', color: '#dc2626' }}>Data pesanan tidak ditemukan.</div>;

  const totalAkhir = detail.harga_penawaran 
    ? Number(detail.harga_penawaran) + Number(detail.ongkos_kirim || 0) - Number(detail.diskon || 0)
    : null;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <button onClick={() => navigate('/transaksi')} style={styles.backBtn}>
            <ArrowLeft size={15} />
            <span>Kembali ke Daftar Pesanan</span>
          </button>
          <h1 style={styles.title}>
            Pesanan: {detail.nomor_dokumen || detail.nomor_pemesanan || 'QO-'+detail.id}
          </h1>
        </div>
        <div style={styles.badgeBesar}>
          {detail.status ? detail.status.replace(/_/g, ' ') : 'PENDING'}
        </div>
      </div>

      <div style={styles.grid}>
        {/* KOLOM KIRI: Informasi Dokumen & Rincian */}
        <div style={styles.leftCol}>
          {/* Card Info Pemesan */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Informasi Pemohon & Proyek</h3>
            <table style={styles.infoTable}>
              <tbody>
                <tr>
                  <td style={styles.tdLabel}>Sumber Dokumen</td>
                  <td>: <span style={{
                    fontWeight: '900', 
                    fontFamily: "'Urbanist', sans-serif",
                    color: detail.sumber_pesanan === 'guest' ? '#15803d' : '#0d141e'
                  }}>
                    {detail.sumber_pesanan === 'guest' ? '🌐 Guest RFQ (Portal Publik)' : '👤 Member Terdaftar'}
                  </span></td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>Nama Perusahaan</td>
                  <td>: <strong>{detail.perusahaan || detail.guest_company || '-'}</strong></td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>Nama PIC / Pemohon</td>
                  <td>: {detail.guest_name || detail.nama_customer || '-'}</td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>Nomor WhatsApp</td>
                  <td>: {detail.telepon_perusahaan || detail.guest_phone || '-'}</td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>Email Resmi</td>
                  <td>: {detail.email_perusahaan || detail.guest_email || '-'}</td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>Lokasi Site Proyek</td>
                  <td>: {detail.catatan || detail.guest_location || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Card Info Unit & Penawaran */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Rincian Unit & Kalkulasi Biaya</h3>
            <table style={styles.infoTable}>
              <tbody>
                <tr>
                  <td style={styles.tdLabel}>Unit Diminta</td>
                  <td>: <strong style={{ color: '#0d141e', fontSize: '1rem' }}>{detail.nama_unit}</strong></td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>Metode Pembayaran</td>
                  <td>: <strong style={{ color: (detail.metode_pembayaran === 'credit' || detail.metode_pembayaran === 'kredit' || detail.metode_pembayaran === 'leasing') ? '#b45309' : '#15803d' }}>
                    {(detail.metode_pembayaran === 'credit' || detail.metode_pembayaran === 'kredit' || detail.metode_pembayaran === 'leasing') ? 'KREDIT (TENOR 5 TAHUN / 60 BULAN)' : 'CASH / TUNAI (PELUNASAN 100%)'}
                  </strong></td>
                </tr>
                {detail.harga_penawaran ? (
                  <>
                    <tr>
                      <td style={styles.tdLabel}>Harga Penawaran Unit</td>
                      <td>: {formatRupiah(detail.harga_penawaran)}</td>
                    </tr>
                    <tr>
                      <td style={styles.tdLabel}>Ongkos Kirim Armada</td>
                      <td>: {formatRupiah(detail.ongkos_kirim)}</td>
                    </tr>
                    <tr>
                      <td style={styles.tdLabel}>Potongan Diskon</td>
                      <td>: <span style={{ color: '#dc2626' }}>- {formatRupiah(detail.diskon)}</span></td>
                    </tr>
                    <tr style={{ borderTop: '2px solid #e2e8f0' }}>
                      <td style={{ ...styles.tdLabel, fontWeight: '900', color: '#0d141e', paddingTop: '0.75rem' }}>Total Akhir (OTR)</td>
                      <td style={{ fontWeight: '900', color: '#15803d', fontSize: '1.25rem', fontFamily: "'Sora', sans-serif", paddingTop: '0.75rem' }}>
                        : {formatRupiah(totalAkhir)}
                      </td>
                    </tr>
                    {(detail.metode_pembayaran === 'credit' || detail.metode_pembayaran === 'kredit' || detail.metode_pembayaran === 'leasing') ? (
                      <>
                        <tr>
                          <td style={styles.tdLabel}>Pembayaran Awal (Uang Muka 20%)</td>
                          <td>: <strong style={{ color: '#15803d' }}>{formatRupiah(Math.round(totalAkhir * 0.2))}</strong></td>
                        </tr>
                        <tr>
                          <td style={styles.tdLabel}>Sisa Pokok Pembiayaan (80%)</td>
                          <td>: <span>{formatRupiah(Math.round(totalAkhir * 0.8))}</span></td>
                        </tr>
                        <tr>
                          <td style={styles.tdLabel}>Estimasi Angsuran (60 Bulan)</td>
                          <td>: <strong style={{ color: '#b45309' }}>{formatRupiah(Math.round((totalAkhir * 0.8) / 60))} / bulan</strong></td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td style={styles.tdLabel}>Skema Pelunasan</td>
                        <td>: <strong style={{ color: '#15803d' }}>Pelunasan Penuh 100% (Tanpa Angsuran)</strong></td>
                      </tr>
                    )}
                  </>
                ) : (
                  <tr>
                    <td style={styles.tdLabel}>Status Penawaran</td>
                    <td>: <span style={{ color: '#b45309', fontWeight: '800' }}>Belum diinput oleh Sales</span></td>
                  </tr>
                )}
              </tbody>
            </table>

            {detail.harga_penawaran && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  onClick={() => generateQuotationPDF(detail)}
                  style={{
                    width: '100%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#0d141e',
                    color: '#74c02c',
                    border: 'none',
                    borderRadius: '8px',
                    fontFamily: "'Urbanist', sans-serif",
                    fontWeight: '900',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(13, 20, 30, 0.25)',
                  }}
                >
                  <Download size={15} />
                  <span>Download Surat Penawaran Resmi (PDF)</span>
                </button>
              </div>
            )}
          </div>

          {/* Card BUKTI PEMBAYARAN */}
          {(detail.dp_bank_name || detail.dp_proof_url || ['DP_DIBAYAR', 'VERIFIKASI_DP_SALES', 'PROSES_OPERASIONAL', 'SIAP_KIRIM', 'PENGIRIMAN', 'SELESAI'].includes(detail.status)) && (
            <div style={{ ...styles.card, border: '1.5px solid #84cc16', backgroundColor: '#fafff5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1.5px solid #d9f99d', paddingBottom: '0.6rem' }}>
                <h3 style={{ ...styles.cardTitle, margin: 0, border: 'none', color: '#15803d' }}>
                  💳 Bukti Pembayaran
                </h3>
                <span style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontFamily: "'Urbanist', sans-serif",
                  fontWeight: '900',
                  backgroundColor: detail.status === 'DP_DIBAYAR' ? '#fef3c7' : '#ecfccb',
                  color: detail.status === 'DP_DIBAYAR' ? '#b45309' : '#15803d',
                  border: detail.status === 'DP_DIBAYAR' ? '1px solid #fde68a' : '1px solid #84cc16'
                }}>
                  {detail.status === 'DP_DIBAYAR' ? '⏳ Menunggu Verifikasi Sales' : '✅ Pembayaran Terverifikasi'}
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
                    <td>: <code style={{ backgroundColor: '#ecfccb', color: '#15803d', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>{detail.dp_account_number || '-'}</code></td>
                  </tr>
                  <tr>
                    <td style={styles.tdLabel}>Atas Nama</td>
                    <td>: <strong>{detail.dp_account_name || '-'}</strong></td>
                  </tr>
                  <tr>
                    <td style={styles.tdLabel}>Nominal Pembayaran</td>
                    <td>: <strong style={{ color: '#15803d', fontSize: '1.05rem', fontFamily: "'Sora', sans-serif" }}>
                      {formatRupiah(detail.dp_amount || ((detail.metode_pembayaran === 'credit' || detail.metode_pembayaran === 'kredit' || detail.metode_pembayaran === 'leasing') ? Math.round((totalAkhir || 0) * 0.2) : (totalAkhir || 0)))}
                    </strong></td>
                  </tr>
                  <tr>
                    <td style={styles.tdLabel}>Waktu Pembayaran</td>
                    <td>: {detail.dp_paid_at ? new Date(detail.dp_paid_at).toLocaleString('id-ID') : '-'}</td>
                  </tr>
                </tbody>
              </table>

              {detail.dp_proof_url && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #d9f99d', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.84rem', fontWeight: '800', color: '#334155', marginBottom: '0.5rem' }}>
                    Foto / Slip Bukti Pembayaran:
                  </p>
                  <a href={detail.dp_proof_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
                    <img 
                      src={detail.dp_proof_url} 
                      alt="Slip Bukti Pembayaran" 
                      style={{
                        maxWidth: '100%', 
                        maxHeight: '220px', 
                        borderRadius: '8px', 
                        border: '1.5px solid #cbd5e1', 
                        boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                        cursor: 'zoom-in'
                      }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </a>
                  <div style={{ marginTop: '0.5rem' }}>
                    <a 
                      href={detail.dp_proof_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{
                        fontSize: '0.82rem', 
                        color: '#15803d', 
                        fontWeight: '800',
                        textDecoration: 'none',
                        display: 'inline-block',
                        padding: '0.4rem 0.85rem',
                        backgroundColor: '#ecfccb',
                        borderRadius: '6px',
                        border: '1px solid #d9f99d'
                      }}
                    >
                      🔍 Buka Slip Ukuran Penuh di Tab Baru ↗
                    </a>
                  </div>
                </div>
              )}

              {['VERIFIKASI_DP_SALES', 'PROSES_OPERASIONAL', 'SIAP_KIRIM', 'PENGIRIMAN', 'SELESAI'].includes(detail.status) && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #d9f99d' }}>
                  <button
                    onClick={() => generateInvoicePDF(detail)}
                    style={{
                      width: '100%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      backgroundColor: '#15803d',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontFamily: "'Urbanist', sans-serif",
                      fontWeight: '900',
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(21, 128, 61, 0.25)',
                    }}
                  >
                    <Download size={15} />
                    <span>Download Invoice Resmi Pembayaran (PDF)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* KOLOM KANAN: Aksi Berdasarkan Role & Status */}
        <div style={styles.rightCol}>
          <div style={{ ...styles.card, borderTop: '4px solid #74c02c' }}>
            <h3 style={styles.cardTitle}>Panel Aksi & Status Workflow</h3>

            {/* 1. SALES: INPUT HARGA PENAWARAN */}
            {(user?.role === 'Sales' || user?.role === 'Admin') && detail.status === 'PENDING' && (
              <div>
                <div style={{ backgroundColor: '#ecfccb', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid #d9f99d' }}>
                  <h4 style={{ margin: '0 0 0.35rem', color: '#15803d' }}>📝 Form Penawaran Resmi Sales</h4>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#166534' }}>Tentukan harga penawaran OTR dan ajukan untuk disetujui Manager.</p>
                </div>
                <form onSubmit={handleKirimPenawaran}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Harga Unit (Rp) *</label>
                    <input 
                      type="number" 
                      style={styles.input} 
                      placeholder="Contoh: 1250000000"
                      value={hargaPenawaran}
                      onChange={(e) => setHargaPenawaran(e.target.value)}
                      required 
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Ongkos Kirim Armada (Rp)</label>
                    <input 
                      type="number" 
                      style={styles.input} 
                      placeholder="Contoh: 15000000"
                      value={ongkosKirim}
                      onChange={(e) => setOngkosKirim(e.target.value)} 
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Potongan Diskon (Rp)</label>
                    <input 
                      type="number" 
                      style={styles.input} 
                      placeholder="Contoh: 10000000"
                      value={diskon}
                      onChange={(e) => setDiskon(e.target.value)} 
                    />
                  </div>
                  <button type="submit" style={styles.btnPrimarySubmit} disabled={submitting}>
                    {submitting ? 'Mengirim...' : '🚀 Ajukan Penawaran ke Manager'}
                  </button>
                </form>
              </div>
            )}

            {/* 2. MANAGER: REVIEW PENAWARAN */}
            {(user?.role === 'Manager' || user?.role === 'Admin') && detail.status === 'MENUNGGU_APPROVAL' && (
              <div>
                <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid #fde68a' }}>
                  <h4 style={{ margin: '0 0 0.35rem', color: '#92400e' }}>⏳ Menunggu Persetujuan Manager</h4>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#78350f' }}>Periksa rincian kalkulasi harga yang diajukan Sales di sebelah kiri.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={() => handleReviewManager('approve')} 
                    style={{ ...styles.btnPrimarySubmit, backgroundColor: '#0d141e', color: '#74c02c', flex: 1 }}
                    disabled={submitting}
                  >
                    <CheckCircle2 size={16} />
                    <span>Setujui Penawaran</span>
                  </button>
                  <button 
                    onClick={() => handleReviewManager('reject')} 
                    style={{ ...styles.btnPrimarySubmit, backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', flex: 1 }}
                    disabled={submitting}
                  >
                    <XCircle size={16} />
                    <span>Tolak</span>
                  </button>
                </div>
              </div>
            )}

            {user?.role === 'Sales' && detail.status === 'MENUNGGU_APPROVAL' && (
              <div style={styles.alertCustomer}>
                <h4 style={{ margin: '0 0 0.35rem' }}>⏳ Penawaran Sedang Ditinjau</h4>
                <p style={{ fontSize: '0.86rem', margin: 0 }}>Penawaran harga telah diteruskan ke Manager dan sedang menunggu persetujuan.</p>
              </div>
            )}

            {/* 3. STATUS APPROVED */}
            {detail.status === 'APPROVED' && (
              <div>
                <div style={{ backgroundColor: '#ecfccb', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #d9f99d' }}>
                  <h4 style={{ margin: '0 0 0.35rem', color: '#15803d' }}>✅ Penawaran Disetujui!</h4>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#166534' }}>
                    {(detail.metode_pembayaran === 'credit' || detail.metode_pembayaran === 'kredit' || detail.metode_pembayaran === 'leasing')
                      ? 'Menunggu pembeli melakukan konfirmasi dan pengiriman bukti transfer Pembayaran Awal (Uang Muka 20%).'
                      : 'Menunggu pembeli melakukan konfirmasi dan pengiriman bukti transfer Pelunasan (Cash 100%).'}
                  </p>
                </div>
                {user?.role === 'Customer' && (
                  <button onClick={handleBayar} style={styles.btnPrimarySubmit}>
                    💳 Konfirmasi Pembayaran
                  </button>
                )}
              </div>
            )}

            {/* 4. SALES: VERIFIKASI PEMBAYARAN */}
            {(user?.role === 'Sales' || user?.role === 'Admin') && detail.status === 'DP_DIBAYAR' && (
              <div>
                <div style={{ backgroundColor: '#e0e7ff', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #c7d2fe' }}>
                  <h4 style={{ margin: '0 0 0.35rem', color: '#3730a3' }}>💳 Bukti Pembayaran Masuk!</h4>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#4338ca', lineHeight: '1.4' }}>
                    Pembeli telah mengirim slip transfer pembayaran. Cek data mutasi bank, lalu klik verifikasi.
                  </p>
                </div>
                <button onClick={handleVerifikasiSales} style={styles.btnPrimarySubmit} disabled={submitting}>
                  {submitting ? 'Memproses...' : '✅ Verifikasi Pembayaran Masuk'}
                </button>
              </div>
            )}

            {user?.role === 'Manager' && detail.status === 'DP_DIBAYAR' && (
              <div style={styles.alertCustomer}>
                <h4 style={{ margin: '0 0 0.35rem' }}>⏳ Menunggu Verifikasi Sales</h4>
                <p style={{ fontSize: '0.86rem', margin: 0 }}>Pembeli telah mengirimkan bukti pembayaran. Tim Sales sedang memvalidasi dana di rekening.</p>
              </div>
            )}

            {/* 5. MANAGER: APPROVE PEMBAYARAN KE OPERASIONAL */}
            {(user?.role === 'Manager' || user?.role === 'Admin') && detail.status === 'VERIFIKASI_DP_SALES' && (
              <div>
                <div style={{ backgroundColor: '#ecfccb', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #d9f99d' }}>
                  <h4 style={{ margin: '0 0 0.35rem', color: '#15803d' }}>📋 Pembayaran Telah Diverifikasi Sales</h4>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#166534', lineHeight: '1.4' }}>
                    Sales telah memvalidasi dana pembayaran. Klik tombol di bawah untuk menyetujui pelepasan unit ke Tim Operasional (PDI).
                  </p>
                </div>
                <button onClick={handleApproveManager} style={styles.btnPrimarySubmit} disabled={submitting}>
                  {submitting ? 'Memproses...' : '🚀 Setujui & Teruskan ke Operasional'}
                </button>
              </div>
            )}

            {user?.role === 'Sales' && detail.status === 'VERIFIKASI_DP_SALES' && (
              <div style={{ ...styles.alertCustomer, backgroundColor: '#ecfccb', color: '#15803d', border: '1px solid #d9f99d' }}>
                <h4 style={{ margin: '0 0 0.35rem' }}>✅ Pembayaran Telah Anda Verifikasi</h4>
                <p style={{ fontSize: '0.86rem', margin: 0 }}>Dokumen sedang menunggu approval dari Manager untuk memulai inspeksi PDI.</p>
              </div>
            )}

            {/* 6. OPERASIONAL: INSPEKSI PDI */}
            {(user?.role === 'Operasional' || user?.role === 'Admin') && detail.status === 'PROSES_OPERASIONAL' && (
              <div>
                <div style={{ backgroundColor: '#cffafe', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #a5f3fc' }}>
                  <h4 style={{ margin: '0 0 0.35rem', color: '#155e75' }}>🔧 Checklist Pre-Delivery Inspection (PDI)</h4>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#0e7490' }}>Pastikan seluruh 6 komponen vital lolos pengujian fisik.</p>
                </div>
                <form onSubmit={handleSelesaiPDI}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    {[
                      ['engine', 'Pemeriksaan Mesin / Engine'],
                      ['hydraulic', 'Sistem Hidrolik & Tekanan Pompa'],
                      ['bucket', 'Kondisi Bucket & Silinder Boom'],
                      ['body', 'Struktur Bodi, Kabin & Panel Kontrol'],
                      ['undercarriage', 'Undercarriage & Roller Track'],
                      ['accessories', 'Aksesoris, Lampu Kerja & Safety K3']
                    ].map(([key, label]) => (
                      <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={pdiCheck[key]} 
                          onChange={(e) => setPdiCheck({ ...pdiCheck, [key]: e.target.checked })}
                          style={{ accentColor: '#74c02c' }}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                  <button type="submit" style={styles.btnPrimarySubmit} disabled={submitting}>
                    {submitting ? 'Menyimpan...' : '✅ Selesaikan PDI → Siap Kirim'}
                  </button>
                </form>
              </div>
            )}

            {/* 7. OPERASIONAL: SURAT JALAN */}
            {(user?.role === 'Operasional' || user?.role === 'Admin') && detail.status === 'SIAP_KIRIM' && (
              <div>
                <div style={{ backgroundColor: '#ecfccb', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #d9f99d' }}>
                  <h4 style={{ margin: '0 0 0.35rem', color: '#15803d' }}>🚚 Penerbitan Surat Jalan & Pengiriman</h4>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#166534' }}>Isi data ekspedisi logistik untuk mengirimkan unit ke lokasi customer.</p>
                </div>
                <form onSubmit={handleSubmitDelivery}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Nama Driver / Ekspedisi *</label>
                    <input 
                      style={styles.input} 
                      placeholder="Contoh: Pak Joko (Trans Logistik)"
                      value={deliveryForm.driverName}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, driverName: e.target.value })}
                      required 
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Nomor Plat / Truk Trailer *</label>
                    <input 
                      style={styles.input} 
                      placeholder="Contoh: B 9876 XYZ"
                      value={deliveryForm.vehicleNumber}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, vehicleNumber: e.target.value })}
                      required 
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Alamat / Lokasi Tujuan *</label>
                    <textarea 
                      style={{ ...styles.input, height: '70px' }} 
                      placeholder="Alamat lengkap lokasi site..."
                      value={deliveryForm.destination}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, destination: e.target.value })}
                      required 
                    />
                  </div>
                  <button type="submit" style={styles.btnPrimarySubmit} disabled={submitting}>
                    {submitting ? 'Menerbitkan...' : '🚚 Terbitkan Surat Jalan & Kirim'}
                  </button>
                </form>
              </div>
            )}

            {/* 8. PENGIRIMAN */}
            {detail.status === 'PENGIRIMAN' && (
              <div>
                <div style={{ backgroundColor: '#fef9c3', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fef08a' }}>
                  <h4 style={{ margin: '0 0 0.35rem', color: '#713f12' }}>🚚 Unit Dalam Perjalanan</h4>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#854d0e' }}>Armada excavator sedang dalam perjalanan menuju lokasi proyek.</p>
                </div>
                <button onClick={handleTerimaUnit} style={styles.btnPrimarySubmit}>
                  📦 Konfirmasi Unit Tiba di Lokasi
                </button>
              </div>
            )}

            {/* 9. SELESAI */}
            {detail.status === 'SELESAI' && (
              <div style={{ backgroundColor: '#fafff5', color: '#15803d', padding: '1.5rem', borderRadius: '10px', border: '1.5px solid #d9f99d', textAlign: 'center' }}>
                <ShieldCheck size={36} style={{ color: '#74c02c', margin: '0 auto 0.5rem' }} />
                <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.15rem', fontFamily: "'Sora', sans-serif", fontWeight: '900' }}>Transaksi Selesai</h4>
                <p style={{ fontSize: '0.86rem', marginBottom: '1.25rem', color: '#166534' }}>
                  Unit telah diterima di lokasi proyek dan Berita Acara Serah Terima (BAST) resmi telah diterbitkan.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <button onClick={handleDownloadBAST} style={styles.btnPrimarySubmit}>
                    <Download size={16} />
                    <span>Download Dokumen BAST (PDF)</span>
                  </button>
                  <button
                    onClick={() => generateInvoicePDF(detail)}
                    style={{
                      ...styles.btnPrimarySubmit,
                      backgroundColor: '#15803d',
                      color: '#ffffff',
                    }}
                  >
                    <FileText size={16} />
                    <span>Download Invoice Resmi Pembayaran (PDF)</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
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
  backBtn: { 
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: 'none', 
    border: 'none', 
    color: '#15803d', 
    cursor: 'pointer', 
    marginBottom: '0.35rem', 
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800', 
    fontSize: '0.84rem' 
  },
  title: { 
    margin: 0, 
    fontSize: '1.4rem', 
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#0d141e',
    letterSpacing: '-0.03em',
  },
  badgeBesar: { 
    padding: '0.45rem 1rem', 
    borderRadius: '8px', 
    backgroundColor: '#ecfccb', 
    color: '#15803d', 
    border: '1px solid #84cc16',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900', 
    fontSize: '0.88rem',
    letterSpacing: '0.5px',
  },
  grid: { 
    display: 'grid', 
    gridTemplateColumns: '1.2fr 1fr', 
    gap: '1.5rem', 
    alignItems: 'start' 
  },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  rightCol: { position: 'sticky', top: '1.5rem' }, 
  card: { 
    backgroundColor: 'white', 
    padding: '1.5rem', 
    borderRadius: '16px', 
    boxShadow: '0 2px 8px rgba(13, 20, 30, 0.03)',
    border: '1.5px solid #e2e8f0',
  },
  cardTitle: { 
    margin: '0 0 1rem 0', 
    color: '#0d141e', 
    borderBottom: '1.5px solid #f1f5f9', 
    paddingBottom: '0.65rem', 
    fontSize: '1.05rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '800',
  },
  infoTable: { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' },
  tdLabel: { padding: '0.6rem 0', color: '#64748b', width: '170px', fontWeight: '700' },
  alertCustomer: { 
    backgroundColor: '#ecfccb', 
    color: '#15803d', 
    border: '1px solid #d9f99d',
    padding: '1rem', 
    borderRadius: '8px', 
    lineHeight: '1.5' 
  },
  inputGroup: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.35rem', fontSize: '0.84rem', fontWeight: '700', color: '#334155' },
  input: { 
    width: '100%', 
    padding: '0.7rem 0.85rem', 
    border: '1.5px solid #cbd5e1', 
    borderRadius: '8px', 
    boxSizing: 'border-box', 
    fontSize: '0.88rem',
    outline: 'none',
    backgroundColor: '#ffffff',
  },
  btnPrimarySubmit: { 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.45rem',
    width: '100%', 
    padding: '0.85rem', 
    backgroundColor: '#0d141e',
    color: '#74c02c', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900', 
    fontSize: '0.92rem',
    boxShadow: '0 4px 14px rgba(13, 20, 30, 0.25)',
  }
};

export default TransaksiDetail;