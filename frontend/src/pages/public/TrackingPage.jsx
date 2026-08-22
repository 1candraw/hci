import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { guestService } from '../../services/guest.service';

const STEPS = [
  { label: 'Pengajuan RFQ', desc: 'Permintaan Diterima' },
  { label: 'Penawaran Sales', desc: 'Ditinjau & Disetujui' },
  { label: 'Pembayaran DP', desc: 'Verifikasi Mutasi' },
  { label: 'Inspeksi PDI', desc: 'Pengecekan Fisik Unit' },
  { label: 'Pengiriman', desc: 'Armada & Surat Jalan' },
  { label: 'Selesai & BAST', desc: 'Unit Tiba di Lokasi' },
];

const getStatusBadge = (status) => {
  const map = {
    PENDING: { label: 'Menunggu Penawaran Sales', bg: '#fef3c7', text: '#b45309', border: '#f59e0b' },
    MENUNGGU_APPROVAL: { label: 'Menunggu Approval Manager', bg: '#e0e7ff', text: '#3730a3', border: '#818cf8' },
    APPROVED: { label: 'Penawaran Disetujui — Menunggu DP', bg: '#dcfce7', text: '#15803d', border: '#4ade80' },
    REJECTED: { label: 'Penawaran Ditolak', bg: '#fee2e2', text: '#991b1b', border: '#f87171' },
    DP_DIBAYAR: { label: 'Bukti DP Dikirim — Verifikasi Sales', bg: '#e0e7ff', text: '#4338ca', border: '#818cf8' },
    VERIFIKASI_DP_SALES: { label: 'DP Terverifikasi — Approval Manager', bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd' },
    PROSES_OPERASIONAL: { label: 'Proses PDI (Inspeksi Unit)', bg: '#cffafe', text: '#0e7490', border: '#67e8f9' },
    SIAP_KIRIM: { label: 'PDI Lolos — Unit Siap Dikirim', bg: '#dcfce7', text: '#15803d', border: '#86efac' },
    PENGIRIMAN: { label: 'Unit Dalam Perjalanan', bg: '#fef9c3', text: '#a16207', border: '#facc15' },
    SELESAI: { label: 'Transaksi Selesai (BAST Terbit)', bg: '#bbf7d0', text: '#166534', border: '#22c55e' },
  };
  return map[status] || { label: status, bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
};

const TrackingPage = () => {
  const [searchParams] = useSearchParams();
  const [nomorInput, setNomorInput] = useState(searchParams.get('nomor') || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setError('Masukkan nomor pesanan terlebih dahulu.');
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

  const badge = data ? getStatusBadge(data.status) : null;
  const activeStep = data ? (data.step_index ?? 0) : 0;

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* ── Header Konsol Lacak ── */}
        <div style={s.hero}>
          <span style={s.heroPill}>PELACAKAN MANDIRI (SELF-SERVICE TRACKING)</span>
          <h1 style={s.heroTitle}>Lacak Status Pesanan & Pengiriman Unit</h1>
          <p style={s.heroSub}>
            Masukkan nomor pemesanan resmi Anda (contoh: <code>HC-202608-XXXX</code> atau <code>PO-202607-XXXX</code>) untuk memantau status secara realtime.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} style={s.searchForm}>
            <div style={s.searchWrap}>
              <span style={s.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Masukkan Nomor Pesanan (HC-... / PO-...)"
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
              <span>⚠️ {error}</span>
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
                <p style={s.orderUnit}>Unit: <strong>{data.nama_alat}</strong> ({data.brand_alat || 'Excavator'})</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={s.statusSubLabel}>STATUS TERKINI</span>
                <div style={{
                  ...s.statusBadge,
                  backgroundColor: badge.bg,
                  color: badge.text,
                  border: `1.5px solid ${badge.border}`
                }}>
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
                        <div style={{
                          ...s.connector,
                          backgroundColor: idx <= activeStep ? '#10b981' : '#e2e8f0',
                        }} />
                      )}
                      <div style={{
                        ...s.stepCircle,
                        backgroundColor: isDone ? '#10b981' : (isCurrent ? '#f59e0b' : '#ffffff'),
                        color: isDone || isCurrent ? '#ffffff' : '#64748b',
                        borderColor: isDone ? '#059669' : (isCurrent ? '#d97706' : '#cbd5e1'),
                        boxShadow: isCurrent ? '0 0 0 4px rgba(245, 158, 11, 0.25)' : 'none',
                      }}>
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <div style={s.stepTextWrap}>
                        <span style={{
                          ...s.stepLabel,
                          color: isDone ? '#059669' : (isCurrent ? '#b45309' : '#64748b'),
                          fontWeight: isCurrent || isDone ? '800' : '600',
                        }}>
                          {step.label}
                        </span>
                        <span style={s.stepSub}>{step.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2 Kolom Rincian & Aksi */}
            <div style={s.cols}>
              {/* Kolom Kiri: Detail Pesanan */}
              <div style={s.detailCard}>
                <h3 style={s.cardTitle}>Informasi Rincian Pesanan</h3>
                <div style={s.infoList}>
                  <div style={s.infoRow}>
                    <span style={s.infoLabel}>Tipe Pengadaan</span>
                    <span style={s.infoVal}>{data.sumber_pesanan === 'guest' ? '🌐 Guest RFQ' : 'Pelanggan Terdaftar'}</span>
                  </div>
                  <div style={s.infoRow}>
                    <span style={s.infoLabel}>Nama Perusahaan / PIC</span>
                    <span style={s.infoVal}>{data.guest_company || data.nama_customer || '-'}</span>
                  </div>
                  <div style={s.infoRow}>
                    <span style={s.infoLabel}>Kontak WhatsApp</span>
                    <span style={s.infoVal}>{data.guest_phone || data.phone_customer || '-'}</span>
                  </div>
                  <div style={s.infoRow}>
                    <span style={s.infoLabel}>Lokasi Proyek / Catatan</span>
                    <span style={s.infoVal}>{data.guest_location || data.catatan || '-'}</span>
                  </div>

                  <div style={s.divider} />

                  <div style={s.infoRow}>
                    <span style={s.infoLabel}>Unit Excavator</span>
                    <span style={{ ...s.infoVal, fontWeight: '800', color: '#0f172a' }}>{data.nama_alat}</span>
                  </div>
                  {data.harga_penawaran && (
                    <>
                      <div style={s.infoRow}>
                        <span style={s.infoLabel}>Harga Penawaran Unit</span>
                        <span style={s.infoVal}>Rp {Number(data.harga_penawaran).toLocaleString('id-ID')}</span>
                      </div>
                      <div style={s.infoRow}>
                        <span style={s.infoLabel}>Ongkos Kirim Armada</span>
                        <span style={s.infoVal}>Rp {Number(data.ongkos_kirim || 0).toLocaleString('id-ID')}</span>
                      </div>
                      {Number(data.diskon || 0) > 0 && (
                        <div style={s.infoRow}>
                          <span style={s.infoLabel}>Potongan Diskon</span>
                          <span style={{ ...s.infoVal, color: '#dc2626' }}>- Rp {Number(data.diskon).toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      <div style={{ ...s.infoRow, paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                        <span style={{ ...s.infoLabel, fontWeight: '800', color: '#0f172a' }}>Total Nilai Transaksi</span>
                        <span style={{ ...s.infoVal, fontWeight: '900', color: '#059669', fontSize: '1.1rem' }}>
                          Rp {Number(data.total_akhir).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Kolom Kanan: Aksi Sesuai Status */}
              <div style={s.actionCard}>
                <h3 style={s.cardTitle}>Status Pemrosesan & Aksi</h3>

                {/* PENDING / MENUNGGU_APPROVAL */}
                {['PENDING', 'MENUNGGU_APPROVAL'].includes(data.status) && (
                  <div style={s.pendingBox}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⏳</div>
                    <h4 style={s.actionBoxTitle}>Penawaran Sedang Disiapkan</h4>
                    <p style={s.actionBoxText}>
                      Tim Sales & Management kami sedang menyiapkan rincian harga terbaik dan ketersediaan armada ke lokasi Anda.
                    </p>
                  </div>
                )}

                {/* APPROVED → Form konfirmasi DP */}
                {data.status === 'APPROVED' && (
                  <DPConfirmForm 
                    nomor={data.nomor_pemesanan || data.id} 
                    totalAkhir={data.total_akhir} 
                    onSuccess={() => handleSearch(null, data.nomor_pemesanan)} 
                  />
                )}

                {/* DP_DIBAYAR → Menunggu verifikasi Sales */}
                {data.status === 'DP_DIBAYAR' && (
                  <div style={s.infoStateBox}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💳</div>
                    <h4 style={{ ...s.actionBoxTitle, color: '#1e40af' }}>Bukti DP Telah Terkirim</h4>
                    <p style={s.actionBoxText}>
                      Bukti transfer uang muka (DP) Anda telah tersimpan dan sedang diverifikasi oleh Tim Sales HeavyCare ID.
                    </p>
                    {data.dp_bank_name && (
                      <div style={s.dpSummary}>
                        <div>Bank: <strong>{data.dp_bank_name}</strong></div>
                        <div>Rek: <strong>{data.dp_account_number}</strong></div>
                        <div>A/n: <strong>{data.dp_account_name}</strong></div>
                        {data.dp_proof_url && (
                          <a href={data.dp_proof_url} target="_blank" rel="noopener noreferrer" style={s.viewSlipBtn}>
                            🔍 Lihat File Slip Transfer
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* VERIFIKASI_DP_SALES → Menunggu approval Manager */}
                {data.status === 'VERIFIKASI_DP_SALES' && (
                  <div style={{ ...s.infoStateBox, backgroundColor: '#ede9fe', borderColor: '#c4b5fd' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
                    <h4 style={{ ...s.actionBoxTitle, color: '#5b21b6' }}>DP Terverifikasi oleh Sales</h4>
                    <p style={s.actionBoxText}>
                      Pembayaran DP Anda telah dinyatakan valid. Menunggu pelepasan surat perintah kerja (PDI) oleh Manager.
                    </p>
                  </div>
                )}

                {/* PROSES_OPERASIONAL → Inspeksi PDI */}
                {data.status === 'PROSES_OPERASIONAL' && (
                  <div style={{ ...s.infoStateBox, backgroundColor: '#cffafe', borderColor: '#67e8f9' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔧</div>
                    <h4 style={{ ...s.actionBoxTitle, color: '#0e7490' }}>Unit dalam Tahap Inspeksi (PDI)</h4>
                    <p style={s.actionBoxText}>
                      Tim Mekanik & Operasional kami sedang melakukan checklist uji fungsi mesin, hidrolik, dan aksesoris.
                    </p>
                  </div>
                )}

                {/* SIAP_KIRIM → Unit Siap Dikirim */}
                {data.status === 'SIAP_KIRIM' && (
                  <div style={{ ...s.infoStateBox, backgroundColor: '#dcfce7', borderColor: '#86efac' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📦</div>
                    <h4 style={{ ...s.actionBoxTitle, color: '#15803d' }}>PDI Lolos — Unit Siap Diberangkatkan</h4>
                    <p style={s.actionBoxText}>
                      Surat jalan dan armada trailer sedang dipersiapkan untuk pengiriman ke alamat proyek Anda.
                    </p>
                  </div>
                )}

                {/* PENGIRIMAN → Konfirmasi terima unit */}
                {data.status === 'PENGIRIMAN' && (
                  <ReceiveUnitBox 
                    quotationId={data.nomor_pemesanan || data.id} 
                    onSuccess={() => handleSearch(null, data.nomor_pemesanan)} 
                  />
                )}

                {/* SELESAI */}
                {data.status === 'SELESAI' && (
                  <div style={s.doneBox}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
                    <h4 style={{ ...s.actionBoxTitle, color: '#166534', fontSize: '1.2rem' }}>Transaksi Selesai!</h4>
                    <p style={s.actionBoxText}>
                      Unit alat berat telah berhasil tiba di lokasi proyek dan Berita Acara Serah Terima (BAST) telah diterbitkan.
                    </p>
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
              Masukkan nomor pemesanan yang Anda peroleh saat submit RFQ di kolom pencarian di atas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Sub-komponen: Form Konfirmasi DP (Clean Industrial) ──
const DPConfirmForm = ({ nomor, totalAkhir, onSuccess }) => {
  const [form, setForm] = useState({ bank: '', no_rek: '', nama_pemilik: '', slip: null });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [previewUrl, setPreviewUrl] = useState('');

  const dpAmount = totalAkhir ? Math.round(totalAkhir * 0.1) : null;

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
      if (dpAmount) formData.append('amount', dpAmount);
      formData.append('proof_file', form.slip);

      await guestService.submitDPProof(nomor, formData);
      setMsg({ type: 'success', text: '✅ Bukti pembayaran DP berhasil dikirim! Tim Sales akan segera memverifikasi.' });
      setTimeout(onSuccess, 1800);
    } catch (err) {
      setMsg({ type: 'error', text: typeof err === 'string' ? err : 'Gagal mengirim bukti pembayaran. Coba lagi.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s2.dpBox}>
      <h4 style={s2.dpTitle}>💳 Konfirmasi Pembayaran DP (10%)</h4>
      
      {dpAmount && (
        <div style={s2.dpAmountBox}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Kewajiban DP (10%)</span>
          <span style={s2.dpAmountVal}>Rp {dpAmount.toLocaleString('id-ID')}</span>
        </div>
      )}

      <div style={s2.rekCard}>
        <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: '800', marginBottom: '0.2rem' }}>
          REKENING TUJUAN TRANSFER:
        </div>
        <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: '700' }}>
          Bank Central Asia (BCA) · <strong>1234-5678-90</strong>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#475569' }}>
          a/n PT Heavy Care Indonesia
        </div>
      </div>

      {msg.text && (
        <div style={{
          ...s2.alertBox,
          backgroundColor: msg.type === 'success' ? '#dcfce7' : '#fee2e2',
          borderColor: msg.type === 'success' ? '#86efac' : '#fca5a5',
          color: msg.type === 'success' ? '#15803d' : '#991b1b'
        }}>
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
          {loading ? '⏳ Mengunggah Bukti...' : '🚀 Kirim Bukti Pembayaran DP'}
        </button>
      </form>
    </div>
  );
};

// ── Sub-komponen: Terima Unit ──
const ReceiveUnitBox = ({ quotationId, onSuccess }) => {
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
      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🚚</div>
      <h4 style={{ ...s2.dpTitle, color: '#0f172a', textAlign: 'center' }}>Unit Sedang Dalam Perjalanan</h4>
      <p style={{ fontSize: '0.88rem', color: '#64748b', textAlign: 'center', marginBottom: '1.25rem' }}>
        Apakah unit excavator telah tiba di lokasi proyek dan sesuai dengan pesanan Anda?
      </p>

      {msg.text && (
        <div style={{
          ...s2.alertBox,
          backgroundColor: msg.type === 'success' ? '#dcfce7' : '#fee2e2',
          borderColor: msg.type === 'success' ? '#86efac' : '#fca5a5',
          color: msg.type === 'success' ? '#15803d' : '#991b1b',
          marginBottom: '1rem'
        }}>
          {msg.text}
        </div>
      )}

      <button onClick={handleReceive} style={s2.receiveBtn} disabled={loading}>
        {loading ? '⏳ Memproses...' : '📦 Konfirmasi Unit Diterima di Lokasi'}
      </button>
    </div>
  );
};

const s = {
  page: {
    backgroundColor: '#f8fafc',
    minHeight: 'calc(100vh - 120px)',
    padding: '3rem 1.5rem 5rem',
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  heroPill: {
    display: 'inline-block',
    padding: '0.3rem 0.85rem',
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
  },
  heroSub: {
    color: '#64748b',
    fontSize: '0.98rem',
    maxWidth: '650px',
    margin: '0 auto 2rem',
  },
  searchForm: {
    maxWidth: '620px',
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
    gap: '0.5rem',
  },
  searchIcon: { fontSize: '1.2rem' },
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
    padding: '0.8rem 1.6rem',
    backgroundColor: '#0d141e',
    color: '#74c02c',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '0.95rem',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(13, 20, 30, 0.3)',
  },
  errorBox: {
    maxWidth: '620px',
    margin: '1rem auto 0',
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    color: '#991b1b',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    fontSize: '0.88rem',
  },
  // Results
  resultWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  statusCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
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
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '1.75rem 2rem',
    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '1.5rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #f1f5f9',
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
    gridTemplateColumns: '1.1fr 1fr',
    gap: '1.5rem',
    alignItems: 'flex-start',
  },
  detailCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
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
  divider: {
    borderBottom: '1px solid #f1f5f9',
    margin: '0.5rem 0',
  },
  actionCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '1.75rem',
    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
  },
  pendingBox: {
    textAlign: 'center',
    padding: '2rem 1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
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
    padding: '2rem 1rem',
    backgroundColor: '#f0fdf4',
    border: '1.5px solid #bbf7d0',
    borderRadius: '12px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '5rem 2rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
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
