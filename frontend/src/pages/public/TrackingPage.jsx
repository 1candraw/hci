import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { guestService } from '../../services/guest.service';
import { generateQuotationPDF } from '../../utils/generateQuotationPDF';
import { generateBASTPDF } from '../../utils/generateBASTPDF';
import { generateInvoicePDF } from '../../utils/generateInvoicePDF';
import {
  Search,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  PackageCheck
} from 'lucide-react';

const STEPS = [
  { label: 'Pengajuan RFQ', desc: 'Permintaan Diterima' },
  { label: 'Penawaran Sales', desc: 'Ditinjau & Disetujui' },
  { label: 'Konfirmasi Bayar', desc: 'Verifikasi Mutasi' },
  { label: 'Inspeksi PDI', desc: 'Pengecekan Fisik Unit' },
  { label: 'Pengiriman', desc: 'Armada & Surat Jalan' },
  { label: 'Selesai & BAST', desc: 'Unit Tiba di Lokasi' },
];

const getStatusBadge = (status) => {
  const map = {
    PENDING: { label: 'Menunggu Penawaran Sales', bg: '#fef3c7', text: '#b45309', border: '#f59e0b' },
    MENUNGGU_APPROVAL: { label: 'Menunggu Approval Manager', bg: '#e0e7ff', text: '#3730a3', border: '#818cf8' },
    APPROVED: { label: 'Penawaran Disetujui — Menunggu Pembayaran', bg: '#dcfce7', text: '#15803d', border: '#4ade80' },
    REJECTED: { label: 'Penawaran Ditolak', bg: '#fee2e2', text: '#991b1b', border: '#f87171' },
    DP_DIBAYAR: { label: 'Bukti Bayar Dikirim — Verifikasi Sales', bg: '#e0e7ff', text: '#4338ca', border: '#818cf8' },
    VERIFIKASI_DP_SALES: { label: 'Pembayaran Terverifikasi — Approval Manager', bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd' },
    PROSES_OPERASIONAL: { label: 'Proses PDI (Inspeksi Unit)', bg: '#cffafe', text: '#0e7490', border: '#67e8f9' },
    SIAP_KIRIM: { label: 'PDI Lolos — Unit Siap Dikirim', bg: '#dcfce7', text: '#15803d', border: '#86efac' },
    PENGIRIMAN: { label: 'Unit Dalam Perjalanan', bg: '#fef9c3', text: '#a16207', border: '#facc15' },
    SELESAI: { label: 'Transaksi Selesai (BAST Terbit)', bg: '#bbf7d0', text: '#166534', border: '#22c55e' },
  };
  return map[status] || { label: status, bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
};

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka || 0);
};

const TrackingPage = () => {
  const [searchParams] = useSearchParams();
  const [nomorInput, setNomorInput] = useState(searchParams.get('nomor') || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    const nomor = searchParams.get('nomor');
    if (nomor) {
      setNomorInput(nomor);
      handleSearch(null, nomor);
    }
    // eslint-disable-next-line
  }, []);

  const handleSearch = async (e, forcedNomor) => {
    if (e) e.preventDefault();
    const query = (forcedNomor || nomorInput).trim();
    if (!query) {
      setError('Masukkan nomor pemesanan atau RFQ terlebih dahulu.');
      return;
    }
    setLoading(true);
    setError('');
    setData(null);
    try {
      const result = await guestService.trackOrder(query);
      setData(result);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Pesanan tidak ditemukan. Periksa kembali nomor pesanan Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQuotationPDF = () => {
    if (!data) return;
    setDownloadingPdf(true);
    try {
      generateQuotationPDF(data);
    } catch (err) {
      console.error('Gagal generate PDF penawaran:', err);
      alert('Terjadi kesalahan saat mengunduh dokumen penawaran.');
    } finally {
      setTimeout(() => setDownloadingPdf(false), 800);
    }
  };

  const handleDownloadInvoicePDF = () => {
    if (!data) return;
    setDownloadingInvoice(true);
    try {
      generateInvoicePDF(data);
    } catch (err) {
      console.error('Gagal generate PDF invoice:', err);
      alert('Terjadi kesalahan saat mengunduh dokumen invoice.');
    } finally {
      setTimeout(() => setDownloadingInvoice(false), 800);
    }
  };

  const handleDownloadBAST = () => {
    if (!data) return;
    try {
      generateBASTPDF(data);
    } catch (err) {
      console.error('Gagal generate BAST:', err);
      alert('Gagal mengunduh dokumen BAST.');
    }
  };

  const isApprovedOrBeyond = [
    'APPROVED',
    'DP_DIBAYAR',
    'VERIFIKASI_DP_SALES',
    'PROSES_OPERASIONAL',
    'SIAP_KIRIM',
    'PENGIRIMAN',
    'SELESAI',
  ].includes(data?.status);

  const isPaymentVerifiedOrBeyond = [
    'VERIFIKASI_DP_SALES',
    'PROSES_OPERASIONAL',
    'SIAP_KIRIM',
    'PENGIRIMAN',
    'SELESAI',
  ].includes(data?.status);

  const badge = data ? getStatusBadge(data.status) : null;
  const activeStep = data ? data.step_index ?? 0 : 0;

  const totalAkhir = data?.harga_penawaran
    ? Number(data.harga_penawaran) + Number(data.ongkos_kirim || 0) - Number(data.diskon || 0)
    : null;

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* ── Header Konsol Lacak ── */}
        <div style={s.hero}>
          <span style={s.heroPill}>PELACAKAN MANDIRI (SELF-SERVICE TRACKING)</span>
          <h1 style={s.heroTitle}>Lacak Status Pesanan & Pengiriman Unit</h1>
          <p style={s.heroSub}>
            Pantau status penawaran harga, persetujuan manajemen, verifikasi DP, hingga pengiriman unit alat berat secara realtime.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} style={s.searchForm}>
            <div style={s.searchWrap}>
              <Search size={20} style={{ color: '#64748b', marginLeft: '0.25rem' }} />
              <input
                type="text"
                placeholder="Masukkan Nomor Pesanan (HC-2026... / PO-2026...)"
                value={nomorInput}
                onChange={(e) => setNomorInput(e.target.value.toUpperCase())}
                style={s.searchInput}
              />
              <button type="submit" disabled={loading} style={s.searchBtn}>
                {loading ? 'Mencari...' : 'Lacak Sekarang'}
              </button>
            </div>
          </form>

          {error && (
            <div style={s.errorBox}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ── Hasil Tracking ── */}
        {data && (
          <div style={s.resultWrap}>
            {/* Status Summary Banner */}
            <div style={s.statusCard}>
              <div style={s.statusCardLeft}>
                <span style={s.orderLabel}>NOMOR TRANSAKSI</span>
                <h2 style={s.orderNumber}>{data.nomor_pemesanan || 'QO-' + data.id}</h2>
                <p style={s.orderUnit}>
                  Unit: <strong>{data.nama_alat}</strong> {data.brand_alat ? `(${data.brand_alat} ${data.model_alat || ''})` : ''}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={s.statusSubLabel}>STATUS TERKINI</span>
                <div
                  style={{
                    ...s.statusBadge,
                    backgroundColor: badge.bg,
                    color: badge.text,
                    border: `1.5px solid ${badge.border}`,
                  }}
                >
                  {badge.label}
                </div>
              </div>
            </div>

            {/* Stepper Visual Konsol */}
            <div style={s.stepperCard}>
              <h3 style={s.cardTitle}>Progres Tahapan Transaksi</h3>
              <div style={s.stepper}>
                {STEPS.map((step, idx) => {
                  const isDone = idx < activeStep || data.status === 'SELESAI';
                  const isCurrent = idx === activeStep && data.status !== 'SELESAI';
                  return (
                    <div key={idx} style={s.stepItem}>
                      {idx > 0 && (
                        <div
                          style={{
                            ...s.connector,
                            backgroundColor: idx <= activeStep ? '#10b981' : '#e2e8f0',
                          }}
                        />
                      )}
                      <div
                        style={{
                          ...s.stepCircle,
                          backgroundColor: isDone ? '#10b981' : isCurrent ? '#f59e0b' : '#ffffff',
                          color: isDone || isCurrent ? '#ffffff' : '#64748b',
                          borderColor: isDone ? '#059669' : isCurrent ? '#d97706' : '#cbd5e1',
                          boxShadow: isCurrent ? '0 0 0 4px rgba(245, 158, 11, 0.25)' : 'none',
                        }}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <div style={s.stepTextWrap}>
                        <span
                          style={{
                            ...s.stepLabel,
                            color: isDone ? '#059669' : isCurrent ? '#b45309' : '#64748b',
                            fontWeight: isCurrent || isDone ? '800' : '600',
                          }}
                        >
                          {step.label}
                        </span>
                        <span style={s.stepSub}>{step.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── 2 Kolom Rincian & Aksi ── */}
            <div style={s.cols}>
              {/* KOLOM KIRI: Informasi Pemesan & Penawaran Resmi */}
              <div style={s.leftStack}>
                {/* 1. Card Info Pemohon */}
                <div style={s.detailCard}>
                  <h3 style={s.cardTitle}>Informasi Rincian Pesanan</h3>
                  <div style={s.infoList}>
                    <div style={s.infoRow}>
                      <span style={s.infoLabel}>Tipe Pengadaan</span>
                      <span style={s.infoVal}>{data.sumber_pesanan === 'guest' ? '🌐 Guest RFQ (Publik)' : '👤 Member Terdaftar'}</span>
                    </div>
                    <div style={s.infoRow}>
                      <span style={s.infoLabel}>Nama Perusahaan / Proyek</span>
                      <span style={{ ...s.infoVal, fontWeight: '700' }}>{data.guest_company || data.perusahaan || data.nama_customer || '-'}</span>
                    </div>
                    <div style={s.infoRow}>
                      <span style={s.infoLabel}>Nama PIC / Pemohon</span>
                      <span style={s.infoVal}>{data.guest_name || data.nama_customer || '-'}</span>
                    </div>
                    <div style={s.infoRow}>
                      <span style={s.infoLabel}>Kontak WhatsApp</span>
                      <span style={s.infoVal}>{data.guest_phone || data.phone_customer || '-'}</span>
                    </div>
                    <div style={s.infoRow}>
                      <span style={s.infoLabel}>Email Resmi</span>
                      <span style={s.infoVal}>{data.guest_email || data.email_customer || '-'}</span>
                    </div>
                    <div style={s.infoRow}>
                      <span style={s.infoLabel}>Lokasi Site Proyek</span>
                      <span style={s.infoVal}>{data.guest_location || data.catatan || '-'}</span>
                    </div>
                    <div style={s.infoRow}>
                      <span style={s.infoLabel}>Rencana Pembayaran</span>
                      <span style={{ ...s.infoVal, textTransform: 'uppercase' }}>{data.metode_pembayaran || 'CASH'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. CARD SURAT PENAWARAN HARGA RESMI (Muncul setelah Manager Approve) */}
                {isApprovedOrBeyond ? (
                  <div style={s.quotationCard}>
                    {/* Header Card Penawaran */}
                    <div style={s.quotationHeader}>
                      <div>
                        <div style={s.docBadge}>
                          <Sparkles size={13} style={{ color: '#15803d' }} />
                          <span>DOKUMEN PENAWARAN RESMI</span>
                        </div>
                        <h3 style={s.quotationTitle}>Surat Penawaran Harga (SPH)</h3>
                        <p style={s.quotationSub}>
                          Ref No: <strong>SPH/{data.nomor_pemesanan || data.id}</strong>
                        </p>
                      </div>
                      <div style={s.approvedPill}>
                        <CheckCircle2 size={16} />
                        <span>Disetujui Manajemen</span>
                      </div>
                    </div>

                    {/* Rincian Harga Penawaran */}
                    <div style={s.quotationBody}>
                      <div style={s.tableLike}>
                        <div style={s.tableRow}>
                          <div style={s.rowLeft}>
                            <span style={s.itemTitle}>Unit {data.nama_alat}</span>
                            <span style={s.itemSub}>Brand: {data.brand_alat || 'Excavator'} {data.model_alat || ''} (Ready Stock PDI)</span>
                          </div>
                          <div style={s.rowRight}>
                            <span style={s.priceVal}>{formatRupiah(data.harga_penawaran)}</span>
                          </div>
                        </div>

                        <div style={s.tableRow}>
                          <div style={s.rowLeft}>
                            <span style={s.itemTitle}>Ongkos Kirim & Mobilisasi Trailer</span>
                            <span style={s.itemSub}>Pengiriman langsung ke site proyek + Asuransi Logistik</span>
                          </div>
                          <div style={s.rowRight}>
                            <span style={s.priceVal}>{formatRupiah(data.ongkos_kirim || 0)}</span>
                          </div>
                        </div>

                        {Number(data.diskon || 0) > 0 && (
                          <div style={s.tableRow}>
                            <div style={s.rowLeft}>
                              <span style={{ ...s.itemTitle, color: '#dc2626' }}>Potongan Diskon Program</span>
                              <span style={s.itemSub}>Diskon khusus pengadaan unit</span>
                            </div>
                            <div style={s.rowRight}>
                              <span style={{ ...s.priceVal, color: '#dc2626' }}>- {formatRupiah(data.diskon)}</span>
                            </div>
                          </div>
                        )}

                        {/* Grand Total & Payment Scheme */}
                        {(() => {
                          const isCredit = (data.metode_pembayaran === 'credit' || data.metode_pembayaran === 'kredit' || data.metode_pembayaran === 'leasing');
                          const uangMuka = isCredit ? Math.round(totalAkhir * 0.2) : 0;
                          const cicilanBulanan = isCredit ? Math.round((totalAkhir * 0.8) / 60) : 0;

                          return (
                            <div style={s.totalRow}>
                              <div>
                                <span style={s.totalLabel}>TOTAL NILAI TRANSAKSI (GRAND TOTAL)</span>
                                {isCredit ? (
                                  <div style={{ marginTop: '0.35rem' }}>
                                    <span style={{ ...s.dpNotice, display: 'block', color: '#15803d' }}>
                                      Pembayaran Awal (Uang Muka 20%): <strong>{formatRupiah(uangMuka)}</strong>
                                    </span>
                                    <span style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: '800' }}>
                                      Estimasi Angsuran (60 Bulan / 5 Tahun): <strong>{formatRupiah(cicilanBulanan)} / bln</strong>
                                    </span>
                                  </div>
                                ) : (
                                  <div style={{ marginTop: '0.35rem' }}>
                                    <span style={{ ...s.dpNotice, color: '#15803d' }}>
                                      Skema: <strong>CASH / TUNAI (PELUNASAN PENUH 100%)</strong>
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div style={s.totalValWrap}>
                                <span style={s.totalValue}>{formatRupiah(totalAkhir)}</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Tombol Download PDF Penawaran */}
                      <div style={s.pdfDownloadWrap}>
                        <button
                          onClick={handleDownloadQuotationPDF}
                          disabled={downloadingPdf}
                          style={s.downloadQuotationBtn}
                        >
                          <Download size={18} />
                          <span>
                            {downloadingPdf ? 'Menyiapkan Dokumen PDF...' : 'Unduh Surat Penawaran Resmi (PDF)'}
                          </span>
                        </button>
                        <p style={s.pdfHint}>
                          📄 Dokumen resmi berkop PT Heavy Care Indonesia lengkap dengan rincian biaya, syarat pembayaran, & pengesahan manajemen.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* State ketika penawaran belum di-approve manager */
                  <div style={s.quotationPendingCard}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                    <h4 style={s.pendingTitle}>
                      {data.status === 'MENUNGGU_APPROVAL'
                        ? 'Penawaran Sedang Ditinjau Manajemen'
                        : 'Penawaran Harga Sedang Dihitung Sales'}
                    </h4>
                    <p style={s.pendingText}>
                      {data.status === 'MENUNGGU_APPROVAL'
                        ? 'Tim Sales telah mengajukan rincian harga. Rincian penawaran resmi beserta fitur Unduh PDF akan otomatis muncul di sini setelah Branch Manager menyetujuinya.'
                        : 'Tim Sales kami sedang memeriksa ketersediaan armada dan menghitung ongkos kirim ke lokasi proyek Anda.'}
                    </p>
                  </div>
                )}

                {/* 3. CARD INVOICE RESMI PEMBAYARAN (Muncul setelah Sales Verifikasi Pembayaran) */}
                {isPaymentVerifiedOrBeyond && (
                  <div style={{ ...s.quotationCard, border: '1.5px solid #84cc16', backgroundColor: '#ffffff', marginTop: '1.5rem' }}>
                    {/* Header Card Invoice */}
                    <div style={{ ...s.quotationHeader, borderBottom: '1.5px solid #ecfccb', paddingBottom: '0.85rem' }}>
                      <div>
                        <div style={{ ...s.docBadge, backgroundColor: '#ecfccb', color: '#15803d' }}>
                          <Sparkles size={13} style={{ color: '#15803d' }} />
                          <span>FAKTUR & INVOICE RESMI</span>
                        </div>
                        <h3 style={s.quotationTitle}>Invoice Pembayaran Sah</h3>
                        <p style={s.quotationSub}>
                          No. Invoice: <strong>INV/{data.nomor_pemesanan || data.id}</strong> · Ref SPH: <strong>SPH/{data.nomor_pemesanan || data.id}</strong>
                        </p>
                      </div>
                      <div style={{ ...s.approvedPill, backgroundColor: '#ecfccb', color: '#15803d', border: '1px solid #84cc16' }}>
                        <CheckCircle2 size={16} />
                        <span>{(data.metode_pembayaran === 'credit' || data.metode_pembayaran === 'kredit' || data.metode_pembayaran === 'leasing') ? 'Uang Muka Terverifikasi' : 'Lunas 100% (Verified)'}</span>
                      </div>
                    </div>

                    {/* Body Card Invoice */}
                    <div style={s.quotationBody}>
                      <div style={{
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        padding: '1rem 1.25rem',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        marginBottom: '1rem'
                      }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {(data.metode_pembayaran === 'credit' || data.metode_pembayaran === 'kredit' || data.metode_pembayaran === 'leasing') ? 'Pembayaran Awal Diterima (Uang Muka 20%)' : 'Nominal Pelunasan Diterima (Cash 100%)'}
                          </span>
                          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#15803d', fontFamily: "'Sora', sans-serif" }}>
                            {formatRupiah(data.dp_amount || ((data.metode_pembayaran === 'credit' || data.metode_pembayaran === 'kredit' || data.metode_pembayaran === 'leasing') ? Math.round(totalAkhir * 0.2) : totalAkhir))}
                          </div>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            Bank: <strong>{data.dp_bank_name || 'Transfer Bank'}</strong> ({data.dp_account_number || '-'}) a/n <strong>{data.dp_account_name || data.guest_name || '-'}</strong>
                          </span>
                        </div>

                        {(data.metode_pembayaran === 'credit' || data.metode_pembayaran === 'kredit' || data.metode_pembayaran === 'leasing') ? (
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: '800', textTransform: 'uppercase' }}>
                              Skema Angsuran (60 Bulan)
                            </span>
                            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#b45309', fontFamily: "'Sora', sans-serif" }}>
                              {formatRupiah(Math.round((totalAkhir * 0.8) / 60))} / bulan
                            </div>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Tenor 5 Tahun (Sisa Pokok 80%)</span>
                          </div>
                        ) : (
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: '800', textTransform: 'uppercase' }}>
                              Status Kewajiban
                            </span>
                            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#15803d', fontFamily: "'Sora', sans-serif" }}>
                              LUNAS PENUH (RP 0)
                            </div>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Tanpa Beban Cicilan</span>
                          </div>
                        )}
                      </div>

                      {/* Tombol Download PDF Invoice */}
                      <div style={s.pdfDownloadWrap}>
                        <button
                          onClick={handleDownloadInvoicePDF}
                          disabled={downloadingInvoice}
                          style={{ ...s.downloadQuotationBtn, backgroundColor: '#15803d', color: '#ffffff', boxShadow: '0 4px 14px rgba(21, 128, 61, 0.25)' }}
                        >
                          <Download size={18} />
                          <span>
                            {downloadingInvoice ? 'Menyiapkan Dokumen Invoice...' : 'Unduh Invoice Resmi Pembayaran (PDF)'}
                          </span>
                        </button>
                        <p style={s.pdfHint}>
                          📄 Faktur & bukti tanda terima sah berkop PT Heavy Care Indonesia lengkap dengan rincian skema ({ (data.metode_pembayaran === 'credit' || data.metode_pembayaran === 'kredit' || data.metode_pembayaran === 'leasing') ? 'Kredit 5 Tahun' : 'Cash 100%' }) & stempel verifikasi keuangan.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* KOLOM KANAN: Aksi Berdasarkan Status */}
              <div style={s.actionCard}>
                <h3 style={s.cardTitle}>Status Pemrosesan & Aksi</h3>

                {/* 1. PENDING / MENUNGGU_APPROVAL */}
                {['PENDING', 'MENUNGGU_APPROVAL'].includes(data.status) && (
                  <div style={s.pendingBox}>
                    <Clock size={40} style={{ color: '#f59e0b', margin: '0 auto 0.75rem' }} />
                    <h4 style={s.actionBoxTitle}>
                      {data.status === 'MENUNGGU_APPROVAL' ? 'Menunggu Approval Manager' : 'Menunggu Penawaran Sales'}
                    </h4>
                    <p style={s.actionBoxText}>
                      {data.status === 'MENUNGGU_APPROVAL'
                        ? 'Kalkulasi harga dari Sales telah diserahkan dan sedang dalam tahap review oleh Branch Manager. Silakan refresh halaman ini secara berkala.'
                        : 'Permintaan RFQ Anda sedang diproses oleh Tim Commercial HeavyCare ID dalam kurun waktu 1x24 jam kerja.'}
                    </p>
                  </div>
                )}

                {/* 2. APPROVED → Form konfirmasi pembayaran */}
                {data.status === 'APPROVED' && (
                  <PaymentConfirmForm
                    nomor={data.nomor_pemesanan || data.id}
                    totalAkhir={totalAkhir}
                    metodePembayaran={data.metode_pembayaran}
                    onSuccess={() => handleSearch(null, data.nomor_pemesanan)}
                  />
                )}

                {/* 3. DP_DIBAYAR → Menunggu verifikasi Sales */}
                {data.status === 'DP_DIBAYAR' && (
                  <div style={s.infoStateBox}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💳</div>
                    <h4 style={{ ...s.actionBoxTitle, color: '#1e40af' }}>Bukti Pembayaran Telah Terkirim</h4>
                    <p style={s.actionBoxText}>
                      Bukti transfer pembayaran Anda telah tersimpan dan sedang diverifikasi mutasi pembayarannya oleh Tim Sales & Finance.
                    </p>
                    {data.dp_bank_name && (
                      <div style={s.dpSummary}>
                        <div>Bank: <strong>{data.dp_bank_name}</strong></div>
                        <div>Rek: <strong>{data.dp_account_number}</strong></div>
                        <div>A/n: <strong>{data.dp_account_name}</strong></div>
                        <div>Nominal: <strong>{formatRupiah(data.dp_amount || ((data.metode_pembayaran === 'credit' || data.metode_pembayaran === 'kredit' || data.metode_pembayaran === 'leasing') ? Math.round(totalAkhir * 0.2) : totalAkhir))}</strong></div>
                        {data.dp_proof_url && (
                          <a href={data.dp_proof_url} target="_blank" rel="noopener noreferrer" style={s.viewSlipBtn}>
                            🔍 Lihat File Slip Transfer
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. VERIFIKASI_DP_SALES → Menunggu approval Manager untuk PDI */}
                {data.status === 'VERIFIKASI_DP_SALES' && (
                  <div style={{ ...s.infoStateBox, backgroundColor: '#ede9fe', borderColor: '#c4b5fd' }}>
                    <CheckCircle2 size={40} style={{ color: '#7c3aed', margin: '0 auto 0.75rem' }} />
                    <h4 style={{ ...s.actionBoxTitle, color: '#5b21b6' }}>Pembayaran Terverifikasi oleh Sales</h4>
                    <p style={s.actionBoxText}>
                      Pembayaran Anda telah dinyatakan valid. Menunggu pelepasan surat perintah kerja inspeksi (PDI) oleh Branch Manager.
                    </p>
                  </div>
                )}

                {/* 5. PROSES_OPERASIONAL → Inspeksi PDI */}
                {data.status === 'PROSES_OPERASIONAL' && (
                  <div style={{ ...s.infoStateBox, backgroundColor: '#cffafe', borderColor: '#67e8f9' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔧</div>
                    <h4 style={{ ...s.actionBoxTitle, color: '#0e7490' }}>Unit dalam Tahap Inspeksi (PDI)</h4>
                    <p style={s.actionBoxText}>
                      Tim Mekanik & Operasional kami sedang melakukan 6 titik checklist uji fungsi mesin, sistem hidrolik, bucket, undercarriage, dan kelengkapan safety.
                    </p>
                  </div>
                )}

                {/* 6. SIAP_KIRIM → Unit Siap Dikirim */}
                {data.status === 'SIAP_KIRIM' && (
                  <div style={{ ...s.infoStateBox, backgroundColor: '#dcfce7', borderColor: '#86efac' }}>
                    <PackageCheck size={40} style={{ color: '#15803d', margin: '0 auto 0.75rem' }} />
                    <h4 style={{ ...s.actionBoxTitle, color: '#15803d' }}>PDI Lolos — Unit Siap Diberangkatkan</h4>
                    <p style={s.actionBoxText}>
                      Surat jalan resmi dan armada truk trailer ekspedisi sedang dipersiapkan untuk pengiriman ke lokasi site proyek Anda.
                    </p>
                  </div>
                )}

                {/* 7. PENGIRIMAN → Konfirmasi terima unit */}
                {data.status === 'PENGIRIMAN' && (
                  <ReceiveUnitBox
                    quotationId={data.nomor_pemesanan || data.id}
                    suratJalanNumber={data.surat_jalan_number}
                    driverName={data.driver_name}
                    vehicleNumber={data.vehicle_number}
                    onSuccess={() => handleSearch(null, data.nomor_pemesanan)}
                  />
                )}

                {/* 8. SELESAI */}
                {data.status === 'SELESAI' && (
                  <div style={s.doneBox}>
                    <ShieldCheck size={48} style={{ color: '#15803d', margin: '0 auto 0.75rem' }} />
                    <h4 style={{ ...s.actionBoxTitle, color: '#166534', fontSize: '1.25rem' }}>Transaksi Selesai!</h4>
                    <p style={s.actionBoxText}>
                      Unit alat berat telah berhasil tiba di lokasi proyek dan Berita Acara Serah Terima (BAST) resmi telah diterbitkan.
                    </p>
                    <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <button onClick={handleDownloadBAST} style={s.downloadBastBtn}>
                        <Download size={16} />
                        <span>Download Berita Acara Serah Terima (BAST)</span>
                      </button>
                      <button onClick={handleDownloadQuotationPDF} style={s.downloadQuotationAltBtn}>
                        <FileText size={16} />
                        <span>Download Arsip Surat Penawaran (PDF)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!data && !loading && !error && (
          <div style={s.emptyState}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🚜</div>
            <h3 style={s.emptyTitle}>Lacak Pesanan Anda Secara Mandiri</h3>
            <p style={s.emptyText}>
              Masukkan nomor pemesanan yang Anda peroleh saat submit RFQ di kolom pencarian di atas untuk melihat status penawaran dan pengiriman.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Sub-komponen: Form Konfirmasi Pembayaran ──
const PaymentConfirmForm = ({ nomor, totalAkhir, metodePembayaran, onSuccess }) => {
  const [form, setForm] = useState({ bank: '', no_rek: '', nama_pemilik: '', slip: null });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [previewUrl, setPreviewUrl] = useState('');

  const isCredit = (metodePembayaran === 'credit' || metodePembayaran === 'kredit' || metodePembayaran === 'leasing');
  const targetAmount = totalAkhir
    ? (isCredit ? Math.round(totalAkhir * 0.2) : totalAkhir)
    : null;
  const cicilan = isCredit && totalAkhir ? Math.round((totalAkhir * 0.8) / 60) : 0;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, slip: file });
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bank || !form.no_rek || !form.nama_pemilik) {
      setMsg({ type: 'error', text: 'Harap lengkapi nama bank, no rekening, dan nama pemilik rekening.' });
      return;
    }
    if (!form.slip) {
      setMsg({ type: 'error', text: 'Harap lampirkan file bukti transfer (foto/PDF).' });
      return;
    }

    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('bank_name', form.bank);
      formData.append('account_number', form.no_rek);
      formData.append('account_name', form.nama_pemilik);
      if (targetAmount) formData.append('amount', targetAmount);
      formData.append('proof_file', form.slip);

      await guestService.submitDPProof(nomor, formData);
      setMsg({ type: 'success', text: '✅ Bukti pembayaran berhasil dikirim! Tim Sales akan segera memverifikasi mutasi.' });
      setTimeout(onSuccess, 1800);
    } catch (err) {
      setMsg({ type: 'error', text: typeof err === 'string' ? err : 'Gagal mengirim bukti pembayaran. Coba lagi.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s2.dpBox}>
      <h4 style={s2.dpTitle}>
        {isCredit ? '💳 Konfirmasi Pembayaran Awal (Uang Muka 20%)' : '💳 Konfirmasi Pembayaran Pelunasan (Cash 100%)'}
      </h4>

      {targetAmount && (
        <div style={s2.dpAmountBox}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {isCredit ? 'Kewajiban Pembayaran Awal (Uang Muka 20%)' : 'Total Tagihan Pelunasan Tunai (100%)'}
          </span>
          <span style={s2.dpAmountVal}>{formatRupiah(targetAmount)}</span>
          {isCredit && (
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#b45309', fontWeight: '700', marginTop: '0.25rem' }}>
              Sisa pokok pembiayaan diangsur 5 tahun (60 bulan) @ {formatRupiah(cicilan)} / bulan
            </span>
          )}
        </div>
      )}

      <div style={s2.rekCard}>
        <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: '800', marginBottom: '0.2rem' }}>
          REKENING TUJUAN TRANSFER RESMI:
        </div>
        <div style={{ fontSize: '0.92rem', color: '#0f172a', fontWeight: '800' }}>
          Bank Central Asia (BCA) · <code>1234-5678-90</code>
        </div>
        <div style={{ fontSize: '0.82rem', color: '#475569' }}>
          a/n <strong>PT Heavy Care Indonesia</strong>
        </div>
      </div>

      {msg.text && (
        <div
          style={{
            ...s2.alertBox,
            backgroundColor: msg.type === 'success' ? '#dcfce7' : '#fee2e2',
            borderColor: msg.type === 'success' ? '#86efac' : '#fca5a5',
            color: msg.type === 'success' ? '#15803d' : '#991b1b',
          }}
        >
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={s2.field}>
          <label style={s2.label}>Nama Bank Pengirim *</label>
          <input
            style={s2.input}
            placeholder="Contoh: BCA / Mandiri / BRI / BNI"
            value={form.bank}
            onChange={(e) => setForm({ ...form, bank: e.target.value })}
            required
          />
        </div>

        <div style={s2.field}>
          <label style={s2.label}>Nomor Rekening Pengirim *</label>
          <input
            style={s2.input}
            placeholder="Contoh: 1234567890"
            value={form.no_rek}
            onChange={(e) => setForm({ ...form, no_rek: e.target.value })}
            required
          />
        </div>

        <div style={s2.field}>
          <label style={s2.label}>Nama Pemilik Rekening (Atas Nama) *</label>
          <input
            style={s2.input}
            placeholder="Contoh: PT Konstruksi Jaya / Budi"
            value={form.nama_pemilik}
            onChange={(e) => setForm({ ...form, nama_pemilik: e.target.value })}
            required
          />
        </div>

        <div style={s2.field}>
          <label style={s2.label}>Upload File Bukti Transfer (Foto / PDF) *</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
            onChange={handleFileChange}
            style={s2.fileInput}
            required
          />
        </div>

        {previewUrl && (
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <img src={previewUrl} alt="Preview Bukti Transfer" style={s2.previewImg} />
          </div>
        )}

        <button type="submit" style={s2.submitBtn} disabled={loading}>
          {loading ? '⏳ Mengunggah Bukti...' : (isCredit ? '🚀 Kirim Bukti Pembayaran Awal' : '🚀 Kirim Bukti Pembayaran Lunas')}
        </button>
      </form>
    </div>
  );
};

// ── Sub-komponen: Terima Unit ──
const ReceiveUnitBox = ({ quotationId, suratJalanNumber, driverName, vehicleNumber, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleReceive = async () => {
    if (!window.confirm('Konfirmasi bahwa unit alat berat telah tiba di lokasi proyek Anda dan telah diperiksa dalam kondisi baik?')) return;
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      await guestService.confirmReceive(quotationId);
      setMsg({ type: 'success', text: '✅ Unit berhasil dikonfirmasi diterima! Dokumen BAST resmi telah otomatis diterbitkan.' });
      setTimeout(onSuccess, 1800);
    } catch (err) {
      setMsg({ type: 'error', text: typeof err === 'string' ? err : 'Gagal mengkonfirmasi penerimaan. Silakan coba lagi.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s2.receiveBox}>
      <Truck size={40} style={{ color: '#a16207', margin: '0 auto 0.5rem' }} />
      <h4 style={{ ...s2.dpTitle, color: '#0f172a', textAlign: 'center' }}>Unit Sedang Dalam Perjalanan</h4>
      <p style={{ fontSize: '0.88rem', color: '#64748b', textAlign: 'center', marginBottom: '1rem' }}>
        Armada trailer sedang mengangkut excavator menuju lokasi site proyek Anda.
      </p>

      {suratJalanNumber && (
        <div style={s2.deliveryDetail}>
          <div>No. Surat Jalan: <strong>{suratJalanNumber}</strong></div>
          {driverName && <div>Driver / Ekspedisi: <strong>{driverName}</strong></div>}
          {vehicleNumber && <div>Plat Truk: <strong>{vehicleNumber}</strong></div>}
        </div>
      )}

      {msg.text && (
        <div
          style={{
            ...s2.alertBox,
            backgroundColor: msg.type === 'success' ? '#dcfce7' : '#fee2e2',
            borderColor: msg.type === 'success' ? '#86efac' : '#fca5a5',
            color: msg.type === 'success' ? '#15803d' : '#991b1b',
            marginBottom: '1rem',
          }}
        >
          {msg.text}
        </div>
      )}

      <button onClick={handleReceive} style={s2.receiveBtn} disabled={loading}>
        {loading ? '⏳ Memproses...' : '📦 Konfirmasi Unit Telah Tiba di Lokasi'}
      </button>
    </div>
  );
};

const s = {
  page: {
    backgroundColor: '#f8fafc',
    minHeight: 'calc(100vh - 120px)',
    padding: '3rem 1.5rem 5rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  container: {
    maxWidth: '1140px',
    margin: '0 auto',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  heroPill: {
    display: 'inline-block',
    padding: '0.35rem 0.95rem',
    backgroundColor: '#ecfccb',
    color: '#15803d',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '800',
    letterSpacing: '1px',
    marginBottom: '0.75rem',
    border: '1px solid #84cc16',
  },
  heroTitle: {
    fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
    fontWeight: '900',
    color: '#0d141e',
    margin: '0 0 0.6rem',
    fontFamily: "'Sora', sans-serif",
  },
  heroSub: {
    color: '#64748b',
    fontSize: '0.98rem',
    maxWidth: '680px',
    margin: '0 auto 2rem',
    lineHeight: 1.5,
  },
  searchForm: {
    maxWidth: '640px',
    margin: '0 auto',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '2px solid #cbd5e1',
    borderRadius: '12px',
    padding: '0.4rem 0.5rem 0.4rem 1rem',
    boxShadow: '0 4px 14px rgba(13, 20, 30, 0.06)',
    gap: '0.75rem',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
    fontWeight: '700',
    color: '#0d141e',
    fontFamily: 'monospace',
    letterSpacing: '1px',
  },
  searchBtn: {
    padding: '0.85rem 1.75rem',
    backgroundColor: '#0d141e',
    color: '#74c02c',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '0.95rem',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(13, 20, 30, 0.3)',
    transition: 'all 0.2s',
  },
  errorBox: {
    maxWidth: '640px',
    margin: '1rem auto 0',
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    color: '#991b1b',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    fontSize: '0.88rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textAlign: 'left',
  },
  // Results
  resultWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  statusCard: {
    backgroundColor: '#ffffff',
    border: '1.5px solid #e2e8f0',
    borderRadius: '16px',
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  statusCardLeft: {},
  orderLabel: {
    fontSize: '0.72rem',
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: '1.5px',
  },
  orderNumber: {
    fontSize: '1.75rem',
    fontWeight: '900',
    color: '#0f172a',
    fontFamily: 'monospace',
    margin: '0.2rem 0',
  },
  orderUnit: {
    fontSize: '0.95rem',
    color: '#475569',
    margin: 0,
  },
  statusSubLabel: {
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: '1px',
    marginBottom: '0.3rem',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.45rem 1rem',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '0.88rem',
  },
  // Stepper
  stepperCard: {
    backgroundColor: '#ffffff',
    border: '1.5px solid #e2e8f0',
    borderRadius: '16px',
    padding: '1.75rem 2rem',
    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '1.25rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #f1f5f9',
    fontFamily: "'Sora', sans-serif",
  },
  stepper: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    overflowX: 'auto',
    paddingBottom: '0.5rem',
  },
  stepItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    flex: 1,
    minWidth: '100px',
  },
  connector: {
    position: 'absolute',
    top: '20px',
    left: '-50%',
    width: '100%',
    height: '4px',
    zIndex: 0,
  },
  stepCircle: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '0.95rem',
    border: '2px solid',
    zIndex: 1,
    transition: 'all 0.2s',
  },
  stepTextWrap: {
    textAlign: 'center',
    marginTop: '0.5rem',
  },
  stepLabel: {
    display: 'block',
    fontSize: '0.78rem',
    lineHeight: 1.2,
  },
  stepSub: {
    display: 'block',
    fontSize: '0.68rem',
    color: '#94a3b8',
    marginTop: '0.15rem',
  },
  // 2 Cols
  cols: {
    display: 'grid',
    gridTemplateColumns: '1.15fr 1fr',
    gap: '1.5rem',
    alignItems: 'flex-start',
  },
  leftStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  detailCard: {
    backgroundColor: '#ffffff',
    border: '1.5px solid #e2e8f0',
    borderRadius: '16px',
    padding: '1.75rem',
    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  infoLabel: {
    fontSize: '0.85rem',
    color: '#64748b',
    flexShrink: 0,
  },
  infoVal: {
    fontSize: '0.9rem',
    color: '#1e293b',
    fontWeight: '600',
    textAlign: 'right',
  },
  // Quotation Card (Approved)
  quotationCard: {
    backgroundColor: '#ffffff',
    border: '2px solid #74c02c',
    borderRadius: '16px',
    padding: '1.75rem',
    boxShadow: '0 8px 24px rgba(116, 192, 44, 0.12)',
    position: 'relative',
    overflow: 'hidden',
  },
  quotationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.25rem',
    paddingBottom: '1rem',
    borderBottom: '1.5px solid #e2e8f0',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  docBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.72rem',
    fontWeight: '900',
    color: '#15803d',
    backgroundColor: '#ecfccb',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    letterSpacing: '0.5px',
    marginBottom: '0.4rem',
  },
  quotationTitle: {
    margin: '0 0 0.2rem',
    fontSize: '1.2rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#0d141e',
  },
  quotationSub: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#64748b',
  },
  approvedPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 0.85rem',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: '800',
    border: '1px solid #86efac',
  },
  quotationBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  tableLike: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  tableRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.85rem 1rem',
    borderBottom: '1px solid #e2e8f0',
    gap: '1rem',
  },
  rowLeft: {
    display: 'flex',
    flexDirection: 'column',
  },
  itemTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#0f172a',
  },
  itemSub: {
    fontSize: '0.78rem',
    color: '#64748b',
  },
  rowRight: {
    textAlign: 'right',
  },
  priceVal: {
    fontSize: '0.92rem',
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: "'Sora', sans-serif",
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#ecfccb',
    borderTop: '2px solid #84cc16',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  totalLabel: {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: '900',
    color: '#166534',
    letterSpacing: '0.5px',
  },
  dpNotice: {
    display: 'block',
    fontSize: '0.82rem',
    color: '#15803d',
    marginTop: '0.15rem',
  },
  totalValWrap: {
    textAlign: 'right',
  },
  totalValue: {
    fontSize: '1.3rem',
    fontWeight: '900',
    color: '#15803d',
    fontFamily: "'Sora', sans-serif",
  },
  pdfDownloadWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  downloadQuotationBtn: {
    width: '100%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.6rem',
    padding: '0.95rem 1.5rem',
    backgroundColor: '#0d141e',
    color: '#74c02c',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(13, 20, 30, 0.25)',
    transition: 'all 0.2s',
  },
  pdfHint: {
    fontSize: '0.78rem',
    color: '#64748b',
    margin: 0,
    textAlign: 'center',
    lineHeight: 1.4,
  },
  // Quotation Pending Card
  quotationPendingCard: {
    backgroundColor: '#f8fafc',
    border: '1.5px dashed #cbd5e1',
    borderRadius: '16px',
    padding: '2rem 1.5rem',
    textAlign: 'center',
  },
  pendingTitle: {
    margin: '0 0 0.4rem',
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#0f172a',
  },
  pendingText: {
    margin: 0,
    fontSize: '0.86rem',
    color: '#64748b',
    lineHeight: 1.6,
    maxWidth: '480px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  // Action Card
  actionCard: {
    backgroundColor: '#ffffff',
    border: '1.5px solid #e2e8f0',
    borderRadius: '16px',
    padding: '1.75rem',
    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
  },
  pendingBox: {
    textAlign: 'center',
    padding: '2rem 1rem',
    backgroundColor: '#fffbeb',
    borderRadius: '12px',
    border: '1px solid #fef3c7',
  },
  actionBoxTitle: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 0.4rem',
  },
  actionBoxText: {
    fontSize: '0.88rem',
    color: '#64748b',
    lineHeight: 1.6,
    margin: 0,
  },
  infoStateBox: {
    padding: '1.5rem',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1.5px solid',
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  dpSummary: {
    marginTop: '1rem',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    fontSize: '0.85rem',
    textAlign: 'left',
    color: '#334155',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
    border: '1px solid #cbd5e1',
  },
  viewSlipBtn: {
    display: 'inline-block',
    marginTop: '0.5rem',
    padding: '0.4rem 0.8rem',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '700',
    textDecoration: 'none',
    textAlign: 'center',
  },
  doneBox: {
    textAlign: 'center',
    padding: '2rem 1.25rem',
    backgroundColor: '#f0fdf4',
    border: '1.5px solid #bbf7d0',
    borderRadius: '12px',
  },
  downloadBastBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.85rem 1.25rem',
    backgroundColor: '#15803d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '0.9rem',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(21, 128, 61, 0.25)',
  },
  downloadQuotationAltBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.75rem 1.25rem',
    backgroundColor: '#ffffff',
    color: '#0d141e',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '0.88rem',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '5rem 2rem',
    backgroundColor: '#ffffff',
    border: '1.5px solid #e2e8f0',
    borderRadius: '16px',
  },
  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 0.5rem',
  },
  emptyText: {
    fontSize: '0.92rem',
    color: '#64748b',
    margin: 0,
  },
};

const s2 = {
  dpBox: {
    backgroundColor: '#f8fafc',
    border: '1.5px solid #74c02c',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  dpTitle: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#0d141e',
    margin: '0 0 0.75rem',
  },
  dpAmountBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    padding: '0.6rem 0.85rem',
    borderRadius: '8px',
    marginBottom: '0.75rem',
  },
  dpAmountVal: {
    fontSize: '1.15rem',
    fontWeight: '900',
    color: '#15803d',
    fontFamily: "'Sora', sans-serif",
  },
  rekCard: {
    backgroundColor: '#ecfccb',
    border: '1px solid #d9f99d',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  alertBox: {
    padding: '0.65rem 0.85rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '600',
    border: '1px solid',
    marginBottom: '1rem',
  },
  field: {
    marginBottom: '0.75rem',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '0.25rem',
  },
  input: {
    width: '100%',
    padding: '0.65rem 0.75rem',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '0.88rem',
    outline: 'none',
  },
  fileInput: {
    fontSize: '0.85rem',
    color: '#475569',
  },
  previewImg: {
    maxHeight: '140px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  },
  submitBtn: {
    width: '100%',
    padding: '0.85rem',
    backgroundColor: '#0d141e',
    color: '#74c02c',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '0.92rem',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(13,20,30,0.3)',
  },
  receiveBox: {
    padding: '1.5rem 1rem',
    backgroundColor: '#f8fafc',
    border: '1.5px solid #cbd5e1',
    borderRadius: '12px',
  },
  deliveryDetail: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.65rem 0.85rem',
    fontSize: '0.82rem',
    color: '#334155',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    marginBottom: '1rem',
    textAlign: 'left',
  },
  receiveBtn: {
    width: '100%',
    padding: '0.85rem',
    backgroundColor: '#15803d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '0.95rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(21,128,61,0.3)',
  },
};

export default TrackingPage;
