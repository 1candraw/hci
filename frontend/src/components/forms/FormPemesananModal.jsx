import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { quotationService } from '../../services/quotation.service';
import { FileText, X, ShieldCheck } from 'lucide-react';

const FormPemesananModal = ({ 
  isOpen, 
  onClose, 
  alatBeratId, 
  namaAlat, 
  sumberPesanan, 
  sawResultId 
}) => {
  const [metodePembayaran, setMetodePembayaran] = useState('cash');
  const [catatan, setCatatan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pesan, setPesan] = useState({ type: '', text: '' });
  
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setPesan({ type: '', text: '' });

    try {
      const payload = {
        alat_berat_id: alatBeratId,
        sumber_pesanan: sumberPesanan,
        saw_result_id: sawResultId || null,
        metode_pembayaran: metodePembayaran,
        catatan: catatan
      };

      const result = await quotationService.create(payload);
      
      setPesan({ type: 'success', text: result.message || 'Permintaan penawaran berhasil dikirim ke antrean Sales!' });
      
      setTimeout(() => {
        setCatatan('');
        onClose();
        setPesan({ type: '', text: '' });
        navigate('/transaksi'); 
      }, 1500);

    } catch (error) {
      setPesan({ type: 'error', text: error.toString() });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div>
            <span style={styles.headerTag}>HEAVY CARE ID · PEMBUATAN DOKUMEN RFQ</span>
            <h3 style={styles.headerTitle}>Ajukan Penawaran Harga</h3>
          </div>
          <button onClick={onClose} style={styles.closeBtn}><X size={17} /></button>
        </div>

        <div style={styles.unitSummary}>
          <ShieldCheck size={18} style={{ color: '#74c02c', flexShrink: 0 }} />
          <div style={{ fontSize: '0.86rem', color: '#0d141e' }}>
            Unit Terpilih: <strong>{namaAlat}</strong>
          </div>
        </div>

        {pesan.text && (
          <div style={{
            ...styles.alert,
            backgroundColor: pesan.type === 'success' ? '#ecfccb' : '#fee2e2',
            color: pesan.type === 'success' ? '#15803d' : '#991b1b',
            border: pesan.type === 'success' ? '1px solid #d9f99d' : '1px solid #fca5a5'
          }}>
            {pesan.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Rencana Metode Pembayaran</label>
            <select 
              style={styles.select}
              value={metodePembayaran}
              onChange={(e) => setMetodePembayaran(e.target.value)}
            >
              <option value="cash">Cash / Pembayaran Langsung</option>
              <option value="leasing">Leasing / Skema Pembiayaan Alat Berat</option>
              <option value="termin">Termin Proyek Bertahap</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Lokasi Site & Catatan Kebutuhan Proyek *</label>
            <textarea 
              style={styles.textarea}
              placeholder="Contoh: Pengiriman unit ke lokasi tambang pasir Kec. Muara Enim, butuh jadwal PDI minggu depan."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              required
            ></textarea>
          </div>

          <div style={styles.footer}>
            <button 
              type="button" 
              onClick={onClose}
              style={styles.btnCancel}
              disabled={isLoading}
            >
              Batal
            </button>
            <button 
              type="submit" 
              style={styles.btnSubmit}
              disabled={isLoading}
            >
              <FileText size={15} />
              <span>{isLoading ? 'Memproses...' : 'Kirim Permintaan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0,
    backgroundColor: 'rgba(13, 20, 30, 0.78)',
    backdropFilter: 'blur(5px)',
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 9999,
    padding: '1.5rem'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '1.75rem',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 25px 60px rgba(13, 20, 30, 0.35)',
    border: '1.5px solid #e2e8f0',
  },
  header: {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: '1rem',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.75rem'
  },
  headerTag: {
    display: 'inline-block',
    fontSize: '0.66rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    color: '#15803d',
    backgroundColor: '#ecfccb',
    padding: '0.1rem 0.45rem',
    borderRadius: '4px',
    marginBottom: '0.25rem',
    letterSpacing: '0.5px',
  },
  headerTitle: {
    margin: 0,
    fontSize: '1.2rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#0d141e',
  },
  closeBtn: {
    background: '#f8fafc', 
    border: '1px solid #e2e8f0',
    borderRadius: '7px',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b', 
    cursor: 'pointer'
  },
  unitSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    marginBottom: '1.25rem',
  },
  alert: {
    padding: '0.75rem 0.85rem', 
    borderRadius: '8px', 
    marginBottom: '1rem', 
    fontSize: '0.86rem',
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: '1rem'
  },
  label: {
    display: 'block', 
    marginBottom: '0.35rem',
    fontSize: '0.82rem', 
    fontWeight: '700', 
    color: '#334155'
  },
  select: {
    width: '100%', 
    padding: '0.65rem 0.8rem',
    border: '1.5px solid #cbd5e1', 
    borderRadius: '8px',
    fontSize: '0.88rem', 
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
  },
  textarea: {
    width: '100%', 
    padding: '0.65rem 0.8rem',
    border: '1.5px solid #cbd5e1', 
    borderRadius: '8px',
    fontSize: '0.88rem', 
    boxSizing: 'border-box',
    height: '95px', 
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
  },
  footer: {
    display: 'flex', 
    justifyContent: 'flex-end', 
    gap: '0.75rem',
    marginTop: '1.25rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f1f5f9',
  },
  btnCancel: {
    padding: '0.65rem 1.25rem', 
    backgroundColor: '#f1f5f9',
    color: '#475569', 
    border: 'none', 
    borderRadius: '7px',
    cursor: 'pointer', 
    fontWeight: '700',
    fontSize: '0.86rem',
  },
  btnSubmit: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.65rem 1.4rem', 
    backgroundColor: '#0d141e',
    color: '#74c02c', 
    border: 'none', 
    borderRadius: '7px',
    cursor: 'pointer', 
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.88rem',
    boxShadow: '0 4px 12px rgba(13, 20, 30, 0.25)'
  }
};

export default FormPemesananModal;