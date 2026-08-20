import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RFQSuccessModal = ({ isOpen, onClose, nomorTracking }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !nomorTracking) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(nomorTracking);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement('textarea');
      el.value = nomorTracking;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleTrack = () => {
    onClose();
    navigate(`/tracking?nomor=${encodeURIComponent(nomorTracking)}`);
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        {/* Top Gold Accent Strip */}
        <div style={s.topStrip} />

        {/* Icon Success */}
        <div style={s.iconWrap}>
          <div style={s.iconCircle}>✓</div>
        </div>

        <h2 style={s.title}>RFQ Berhasil Diajukan! 🚜</h2>
        <p style={s.desc}>
          Permintaan penawaran harga Anda telah masuk ke sistem kami. Tim Sales akan memvalidasi spesifikasi dalam <strong>1×24 jam</strong>.
        </p>

        {/* Nomor Tracking Box */}
        <div style={s.trackBox}>
          <div style={s.trackLabel}>NOMOR PELACAKAN PESANAN</div>
          <div style={s.trackNumber}>{nomorTracking}</div>
          <button onClick={handleCopy} style={s.copyBtn}>
            {copied ? '✓ Berhasil Disalin!' : '📋 Salin Nomor Pesanan'}
          </button>
        </div>

        {/* Tip Box */}
        <div style={s.tip}>
          📌 <strong>Catatan:</strong> Simpan atau screenshot nomor ini. Anda dapat menggunakannya kapan saja di halaman <strong>Lacak Pesanan</strong> untuk memantau proses PDI, pembayaran DP, dan surat jalan pengiriman.
        </div>

        {/* Actions */}
        <div style={s.actions}>
          <button onClick={onClose} style={s.btnClose}>
            Tutup
          </button>
          <button onClick={handleTrack} style={s.btnTrack}>
            <span>📦</span> Buka Halaman Pelacakan →
          </button>
        </div>
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
    zIndex: 10000,
    padding: '1rem',
  },
  modal: {
    background: '#ffffff',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '480px',
    padding: '2.5rem 2rem 2rem',
    textAlign: 'center',
    boxShadow: '0 30px 80px -15px rgba(15, 23, 42, 0.4)',
    border: '2px solid #e2e8f0',
    position: 'relative',
    overflow: 'hidden',
  },
  topStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    backgroundColor: '#f59e0b',
  },
  iconWrap: { marginBottom: '1.25rem' },
  iconCircle: {
    width: '68px',
    height: '68px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    color: '#ffffff',
    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
    fontWeight: '900',
  },
  title: {
    margin: '0 0 0.6rem',
    fontSize: '1.45rem',
    fontWeight: '900',
    color: '#0f172a',
  },
  desc: {
    margin: '0 0 1.5rem',
    fontSize: '0.88rem',
    color: '#475569',
    lineHeight: '1.6',
  },
  trackBox: {
    background: '#0f172a',
    borderRadius: '12px',
    padding: '1.4rem',
    marginBottom: '1.25rem',
    border: '2px solid #1e293b',
  },
  trackLabel: {
    fontSize: '0.7rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    fontWeight: '800',
    marginBottom: '0.4rem',
  },
  trackNumber: {
    fontSize: '1.75rem',
    fontWeight: '900',
    color: '#fbbf24',
    letterSpacing: '2px',
    fontFamily: 'monospace',
    marginBottom: '0.85rem',
  },
  copyBtn: {
    padding: '0.45rem 1.1rem',
    background: 'rgba(251, 191, 36, 0.15)',
    color: '#fbbf24',
    border: '1.5px solid #f59e0b',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: '700',
    transition: 'all 0.2s',
  },
  tip: {
    background: '#fef3c7',
    border: '1px solid #fde68a',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    fontSize: '0.8rem',
    color: '#92400e',
    textAlign: 'left',
    marginBottom: '1.5rem',
    lineHeight: '1.5',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
  },
  btnClose: {
    flex: 1,
    padding: '0.8rem',
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.88rem',
  },
  btnTrack: {
    flex: 2,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    padding: '0.8rem',
    background: '#0f172a',
    color: '#fbbf24',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '800',
    fontSize: '0.9rem',
    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.3)',
  },
};

export default RFQSuccessModal;
