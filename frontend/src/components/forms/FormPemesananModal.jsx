import React, { useState } from 'react';
// Import useNavigate dari react-router-dom untuk fungsi redirect
import { useNavigate } from 'react-router-dom'; 
import { quotationService } from '../../services/quotation.service';

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
  
  // Inisialisasi fungsi navigasi
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
      
      setPesan({ type: 'success', text: result.message || 'Pesanan berhasil dikirim!' });
      
      setTimeout(() => {
        setCatatan('');
        onClose();
        setPesan({ type: '', text: '' });
        
        // Arahkan user ke halaman transaksi setelah 2 detik
        navigate('/transaksi'); 
      }, 2000);

    } catch (error) {
      setPesan({ type: 'error', text: error.toString() });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937' }}>Ajukan Penawaran</h2>
          <button onClick={onClose} style={styles.closeBtn}>&times;</button>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '1rem' }}>
          Anda akan memesan: <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{namaAlat}</span>
        </p>

        {pesan.text && (
          <div style={{
            ...styles.alert,
            backgroundColor: pesan.type === 'success' ? '#d1fae5' : '#fee2e2',
            color: pesan.type === 'success' ? '#047857' : '#b91c1c'
          }}>
            {pesan.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Metode Pembayaran</label>
            <select 
              style={styles.input}
              value={metodePembayaran}
              onChange={(e) => setMetodePembayaran(e.target.value)}
            >
              <option value="cash">Cash / Tunai Keras</option>
              <option value="leasing">Leasing / Kredit</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Catatan Proyek (Lokasi & Kebutuhan)</label>
            <textarea 
              style={{ ...styles.input, height: '100px', resize: 'vertical' }}
              placeholder="Contoh: Tolong penawaran harga terbaik beserta biaya kirim ke proyek tambang di daerah Samarinda."
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
              {isLoading ? 'Memproses...' : 'Kirim Permintaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- STYLING MODAL ---
const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 9999,
    padding: '1rem'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '1rem',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '0.5rem'
  },
  closeBtn: {
    background: 'none', border: 'none',
    fontSize: '1.5rem', color: '#6b7280', cursor: 'pointer'
  },
  alert: {
    padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem'
  },
  inputGroup: {
    marginBottom: '1rem'
  },
  label: {
    display: 'block', marginBottom: '0.5rem',
    fontSize: '0.9rem', fontWeight: 'bold', color: '#374151'
  },
  input: {
    width: '100%', padding: '0.75rem',
    border: '1px solid #d1d5db', borderRadius: '6px',
    fontSize: '0.95rem', boxSizing: 'border-box'
  },
  footer: {
    display: 'flex', justifyContent: 'flex-end', gap: '0.5rem',
    marginTop: '1.5rem'
  },
  btnCancel: {
    padding: '0.6rem 1.2rem', backgroundColor: '#f3f4f6',
    color: '#4b5563', border: 'none', borderRadius: '6px',
    cursor: 'pointer', fontWeight: 'bold'
  },
  btnSubmit: {
    padding: '0.6rem 1.2rem', backgroundColor: '#2563eb',
    color: 'white', border: 'none', borderRadius: '6px',
    cursor: 'pointer', fontWeight: 'bold'
  }
};

export default FormPemesananModal;