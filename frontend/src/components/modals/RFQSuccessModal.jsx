import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Copy, Check, ArrowRight, Package } from 'lucide-react';

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
        {/* Top Zoomlion Green Strip */}
        <div style={s.topStrip} />

        {/* Icon Success */}
        <div style={s.iconWrap}>
          <div style={s.iconCircle}>
            <CheckCircle2 size={36} style={{ color: '#ffffff' }} />
          </div>
        </div>

        <h2 style={s.title}>RFQ Berhasil Diajukan! 🚜</h2>
        <p style={s.desc}>
          Permintaan penawaran harga Anda telah masuk ke sistem <strong>HEAVY CARE ID</strong>. Tim Sales & Technical Support akan memverifikasi spesifikasi dalam <strong>1×24 jam</strong>.
        </p>

        {/* Nomor Tracking Box */}
        <div style={s.trackBox}>
          <div style={s.trackLabel}>NOMOR PELACAKAN PESANAN</div>
          <div style={s.trackNumber}>{nomorTracking}</div>
          <button onClick={handleCopy} style={s.copyBtn}>
            {copied ? (
              <>
                <Check size={14} />
                <span>Berhasil Disalin!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Salin Nomor Pesanan</span>
              </>
            )}
          </button>
        </div>

        {/* Tip Box */}
        <div style={s.tip}>
          📌 <strong>Catatan:</strong> Simpan atau screenshot nomor ini. Anda dapat menggunakannya kapan saja di menu <strong>Lacak Pesanan</strong> untuk memantau proses PDI, surat jalan, dan pengiriman armada ke lokasi proyek.
        </div>

        {/* Actions */}
        <div style={s.actions}>
          <button onClick={onClose} style={s.btnClose}>
            Tutup
          </button>
          <button onClick={handleTrack} style={s.btnTrack}>
            <Package size={15} />
            <span>Buka Pelacakan Pesanan</span>
            <ArrowRight size={15} />
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
    background: 'rgba(13, 20, 30, 0.8)',
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
    maxWidth: '490px',
    padding: '2.5rem 2rem 2rem',
    textAlign: 'center',
    boxShadow: '0 30px 80px -15px rgba(13, 20, 30, 0.45)',
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
    backgroundColor: '#74c02c',
  },
  iconWrap: { marginBottom: '1.25rem' },
  iconCircle: {
    width: '68px',
    height: '68px',
    background: 'linear-gradient(135deg, #74c02c, #15803d)',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    boxShadow: '0 8px 24px rgba(116, 192, 44, 0.4)',
  },
  title: {
    margin: '0 0 0.6rem',
    fontSize: '1.45rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#0d141e',
  },
  desc: {
    margin: '0 0 1.5rem',
    fontSize: '0.88rem',
    color: '#475569',
    lineHeight: '1.6',
  },
  trackBox: {
    background: '#0d141e',
    borderRadius: '12px',
    padding: '1.4rem',
    marginBottom: '1.25rem',
    border: '2px solid #1f2937',
  },
  trackLabel: {
    fontSize: '0.7rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    fontWeight: '800',
    marginBottom: '0.4rem',
    fontFamily: "'Urbanist', sans-serif",
  },
  trackNumber: {
    fontSize: '1.75rem',
    fontWeight: '900',
    color: '#74c02c',
    letterSpacing: '2px',
    fontFamily: 'monospace',
    marginBottom: '0.85rem',
  },
  copyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.45rem 1.1rem',
    background: 'rgba(116, 192, 44, 0.15)',
    color: '#74c02c',
    border: '1.5px solid #74c02c',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: '800',
    fontFamily: "'Urbanist', sans-serif",
  },
  tip: {
    background: '#ecfccb',
    border: '1px solid #d9f99d',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    fontSize: '0.8rem',
    color: '#15803d',
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
    background: '#0d141e',
    color: '#74c02c',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.9rem',
    boxShadow: '0 4px 14px rgba(13, 20, 30, 0.3)',
  },
};

export default RFQSuccessModal;
