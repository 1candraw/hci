import { useState } from 'react';
import { guestService } from '../../services/guest.service';

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
            <span style={s.headerTag}>FORMULIR PENAWARAN HARGA (RFQ)</span>
            <h2 style={s.headerTitle}>{namaAlat || 'Unit Excavator'}</h2>
          </div>
          <button onClick={onClose} style={s.closeBtn} aria-label="Tutup">✕</button>
        </div>

        {/* Info Banner */}
        <div style={s.infoBanner}>
          <span style={s.infoIcon}>📋</span>
          <div>
            <strong>Pengajuan Cepat Tanpa Perlu Mendaftar Akun.</strong>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>
              Tim Sales kami akan menghitung penawaran harga resmi dan menerbitkan Nomor Pelacakan untuk Anda.
            </p>
          </div>
        </div>

        {error && <div style={s.errorBox}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
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
              <label style={s.label}>Nama Perusahaan / Kontraktor (PT/CV) <span style={s.req}>*</span></label>
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
                placeholder="Contoh: budi@majujaya.com"
                required
              />
            </div>
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>Lokasi Proyek / Alamat Tujuan Pengiriman</label>
            <textarea
              style={{ ...s.input, height: '80px', resize: 'vertical' }}
              name="guest_location"
              value={form.guest_location}
              onChange={handleChange}
              placeholder="Contoh: Lokasi pertambangan di Kutai Barat, Kalimantan Timur..."
            />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>Opsi Skema Pembayaran</label>
            <select style={s.select} name="metode_pembayaran" value={form.metode_pembayaran} onChange={handleChange}>
              <option value="cash">💵 Pembayaran Tunai (Cash Bertahap)</option>
              <option value="leasing">🏢 Fasilitas Pembiayaan Leasing / Kredit</option>
            </select>
          </div>

          <div style={s.footer}>
            <button type="button" onClick={onClose} style={s.btnCancel} disabled={loading}>
              Batal
            </button>
            <button type="submit" style={s.btnSubmit} disabled={loading}>
              {loading ? (
                <span>⏳ Memproses RFQ...</span>
              ) : (
                <span>🚀 Kirim Pengajuan RFQ Resmi</span>
              )}
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
    inset: 0,
    background: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
  },
  modal: {
    background: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '640px',
    maxHeight: '92vh',
    overflowY: 'auto',
    boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.4)',
    border: '2px solid #e2e8f0',
    padding: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.25rem',
    borderBottom: '2px solid #f1f5f9',
    paddingBottom: '1rem',
  },
  headerTag: {
    display: 'inline-block',
    fontSize: '0.72rem',
    fontWeight: '800',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    letterSpacing: '1px',
    marginBottom: '0.3rem',
  },
  headerTitle: {
    margin: 0,
    fontSize: '1.35rem',
    color: '#0f172a',
    fontWeight: '900',
  },
  closeBtn: {
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    fontSize: '1rem',
    cursor: 'pointer',
    color: '#475569',
    flexShrink: 0,
    fontWeight: '700',
  },
  infoBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    padding: '0.85rem 1rem',
    fontSize: '0.88rem',
    color: '#0f172a',
    marginBottom: '1.25rem',
  },
  infoIcon: { fontSize: '1.2rem', flexShrink: 0 },
  errorBox: {
    background: '#fee2e2',
    color: '#991b1b',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    fontSize: '0.88rem',
    border: '1px solid #fca5a5',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1rem',
  },
  fieldGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.4rem',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#334155',
  },
  req: { color: '#dc2626' },
  input: {
    width: '100%',
    padding: '0.75rem 0.9rem',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '0.9rem',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
    backgroundColor: '#ffffff',
  },
  select: {
    width: '100%',
    padding: '0.75rem 0.9rem',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '0.9rem',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#ffffff',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.5rem',
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
    fontSize: '0.9rem',
  },
  btnSubmit: {
    padding: '0.75rem 1.8rem',
    background: '#0f172a',
    color: '#fbbf24',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '800',
    fontSize: '0.92rem',
    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.3)',
  },
};

export default GuestRFQModal;
