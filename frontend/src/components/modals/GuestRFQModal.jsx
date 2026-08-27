import { useState } from 'react';
import { guestService } from '../../services/guest.service';
import { FileText, X, ShieldCheck } from 'lucide-react';

const GuestRFQModal = ({ isOpen, onClose, alatBeratId, namaAlat, onSuccess }) => {
  const [form, setForm] = useState({
    guest_name: '',
    guest_company: '',
    guest_phone: '',
    guest_email: '',
    guest_location: '',
    metode_pembayaran: 'cash',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await guestService.submitRFQ({
        alat_berat_id: alatBeratId,
        ...form,
      });
      onSuccess(result.data.nomor_pemesanan);
      onClose();
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Gagal mengirim RFQ. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <span style={s.headerTag}>HEAVY CARE ID · FORMULIR RFQ RESMI</span>
            <h2 style={s.headerTitle}>{namaAlat || 'Unit Excavator'}</h2>
          </div>
          <button onClick={onClose} style={s.closeBtn} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        {/* Info Banner */}
        <div style={s.infoBanner}>
          <ShieldCheck size={20} style={{ color: '#74c02c', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Pengajuan Penawaran Cepat & Transparan.</strong>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>
              Tim Sales & Technical Support akan menghitung penawaran harga resmi (skema Cash atau Kredit Angsuran 5 Tahun) serta menerbitkan Nomor Pelacakan untuk Anda.
            </p>
          </div>
        </div>

        {error && <div style={s.errorBox}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.grid2}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Nama PIC / Pemohon <span style={s.req}>*</span></label>
              <input
                style={s.input}
                name="guest_name"
                value={form.guest_name}
                onChange={handleChange}
                placeholder="Contoh: Ir. Budi Santoso"
                required
              />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Nama Perusahaan (PT / CV / Kontraktor) <span style={s.req}>*</span></label>
              <input
                style={s.input}
                name="guest_company"
                value={form.guest_company}
                onChange={handleChange}
                placeholder="Contoh: PT Maju Jaya Konstruksi"
                required
              />
            </div>
          </div>

          <div style={s.grid2}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Nomor WhatsApp Aktif <span style={s.req}>*</span></label>
              <input
                style={s.input}
                name="guest_phone"
                type="tel"
                value={form.guest_phone}
                onChange={handleChange}
                placeholder="Contoh: 08123456789"
                required
              />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Alamat Email Perusahaan <span style={s.req}>*</span></label>
              <input
                style={s.input}
                name="guest_email"
                type="email"
                value={form.guest_email}
                onChange={handleChange}
                placeholder="Contoh: procurement@majujaya.com"
                required
              />
            </div>
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>Lokasi Proyek / Pengiriman Unit <span style={s.req}>*</span></label>
            <input
              style={s.input}
              name="guest_location"
              value={form.guest_location}
              onChange={handleChange}
              placeholder="Contoh: Site Tambang Pasir, Kec. Muara Enim, Sumatera Selatan"
              required
            />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>Rencana Metode Pembayaran</label>
            <select
              style={s.select}
              name="metode_pembayaran"
              value={form.metode_pembayaran}
              onChange={handleChange}
            >
              <option value="cash">Cash / Tunai (Pelunasan Penuh Tanpa Angsuran)</option>
              <option value="credit">Credit / Kredit (Uang Muka + Angsuran 5 Tahun / 60 Bulan)</option>
            </select>
          </div>

          <div style={s.footer}>
            <button type="button" onClick={onClose} style={s.btnCancel}>
              Batal
            </button>
            <button type="submit" disabled={loading} style={s.btnSubmit}>
              <FileText size={16} />
              <span>{loading ? 'Mengirim Pengajuan...' : 'Kirim Penawaran (RFQ)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const s = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13, 20, 30, 0.78)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1.5rem',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '680px',
    boxShadow: '0 25px 60px -15px rgba(13, 20, 30, 0.45)',
    border: '1.5px solid #e2e8f0',
    padding: '2rem',
    animation: 'slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.25rem',
  },
  headerTag: {
    display: 'inline-block',
    fontSize: '0.7rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    color: '#15803d',
    backgroundColor: '#ecfccb',
    padding: '0.12rem 0.5rem',
    borderRadius: '4px',
    letterSpacing: '0.8px',
    marginBottom: '0.35rem',
  },
  headerTitle: {
    fontSize: '1.35rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#0d141e',
    margin: 0,
  },
  closeBtn: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#64748b',
  },
  infoBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    background: '#fafdf5',
    border: '1.5px solid #d9f99d',
    borderRadius: '10px',
    padding: '0.85rem 1rem',
    fontSize: '0.86rem',
    color: '#0d141e',
    marginBottom: '1.25rem',
  },
  errorBox: {
    background: '#fee2e2',
    color: '#991b1b',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    fontSize: '0.88rem',
    border: '1px solid #fca5a5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  fieldGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.35rem',
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#334155',
  },
  req: { color: '#dc2626' },
  input: {
    width: '100%',
    padding: '0.7rem 0.85rem',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '0.88rem',
    outline: 'none',
    fontFamily: 'inherit',
    backgroundColor: '#ffffff',
  },
  select: {
    width: '100%',
    padding: '0.7rem 0.85rem',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '0.88rem',
    outline: 'none',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.25rem',
    paddingTop: '1.25rem',
    borderTop: '1px solid #f1f5f9',
  },
  btnCancel: {
    padding: '0.75rem 1.4rem',
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.88rem',
  },
  btnSubmit: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.75rem 1.6rem',
    background: '#0d141e',
    color: '#74c02c',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.92rem',
    boxShadow: '0 4px 14px rgba(13, 20, 30, 0.3)',
  },
};

export default GuestRFQModal;
