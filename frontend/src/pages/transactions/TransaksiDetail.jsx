import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { transaksiService } from '../../services/transaksi.service'; // Sesuaikan path

const TransaksiDetail = () => {
  const { id } = useParams(); // Mengambil ID dari URL
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State untuk Sales
  const [hargaPenawaran, setHargaPenawaran] = useState('');
  const [ongkosKirim, setOngkosKirim] = useState('');
  const [diskon, setDiskon] = useState('');

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await transaksiService.getById(id);
      setDetail(data);
      // Jika nanti data harga sudah ada di DB, kita set ke state di sini
    } catch (error) {
      alert('Gagal mengambil data detail pesanan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
  };

 // +++ UBAH FUNGSI INI +++
  const handleKirimPenawaran = async (e) => {
    e.preventDefault();
    
    // Validasi sederhana: Pastikan harga dan ongkir tidak kosong
    if (!hargaPenawaran || !ongkosKirim) {
      alert("Harga Penawaran dan Ongkos Kirim wajib diisi!");
      return;
    }

    try {
      // 1. Siapkan data yang akan dikirim ke Backend
      const payload = {
        harga_penawaran: Number(hargaPenawaran),
        ongkos_kirim: Number(ongkosKirim),
        diskon: diskon ? Number(diskon) : 0
      };

      // 2. Panggil service untuk menembak API
      await transaksiService.submitPenawaran(id, payload);

      // 3. Beri notifikasi sukses
      alert('Berhasil! Harga penawaran telah diteruskan ke Manager untuk dievaluasi.');

      // 4. Refresh data detail pesanan agar status di layar otomatis berubah!
      fetchDetail(); 

    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat mengirim penawaran. Coba lagi.');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Memuat rincian pesanan...</div>;
  if (!detail) return <div style={{ padding: '2rem' }}>Data tidak ditemukan</div>;

  return (
    <div style={styles.container}>
      {/* Header Halaman */}
      <div style={styles.header}>
        <div>
          <button onClick={() => navigate('/transaksi')} style={styles.backBtn}>← Kembali</button>
          <h2 style={styles.title}>Detail Pesanan: {detail.nomor_dokumen}</h2>
          <p style={styles.subtitle}>Dibuat pada: {new Date(detail.tanggal).toLocaleString('id-ID')}</p>
        </div>
        <span style={styles.badgeBesar}>{detail.status}</span>
      </div>

      <div style={styles.grid}>
        {/* KOLOM KIRI: Informasi Lengkap (Lebar 60%) */}
        <div style={styles.leftCol}>
          {/* Card Info Perusahaan */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Informasi Pelanggan</h3>
            <table style={styles.infoTable}>
              <tbody>
                <tr><td style={styles.tdLabel}>Perusahaan</td><td>: <strong>{detail.perusahaan}</strong></td></tr>
                <tr><td style={styles.tdLabel}>Email</td><td>: {detail.email_perusahaan || '-'}</td></tr>
                <tr><td style={styles.tdLabel}>Telepon</td><td>: {detail.telepon_perusahaan || '-'}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Card Info Unit */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Spesifikasi Permintaan</h3>
            <table style={styles.infoTable}>
              <tbody>
                <tr><td style={styles.tdLabel}>Unit Diminta</td><td>: <strong>{detail.nama_unit}</strong></td></tr>
                <tr><td style={styles.tdLabel}>Harga Dasar Unit</td><td>: {formatRupiah(detail.harga_unit)}</td></tr>
                <tr><td style={styles.tdLabel}>Metode Pembayaran</td><td>: {detail.metode_pembayaran.toUpperCase()}</td></tr>
                <tr><td style={styles.tdLabel}>Sumber Pesanan</td><td>: {detail.sumber_pesanan.toUpperCase()}</td></tr>
              </tbody>
            </table>
            
            <div style={{ marginTop: '1rem' }}>
              <p style={styles.tdLabel}><strong>Catatan / Lokasi Proyek:</strong></p>
              <div style={styles.catatanBox}>{detail.catatan || 'Tidak ada catatan khusus.'}</div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Panel Aksi sesuai Role (Lebar 40%) */}
        <div style={styles.rightCol}>
          <div style={{...styles.card, borderTop: '4px solid #2563eb'}}>
            <h3 style={styles.cardTitle}>Panel Aksi & Kalkulasi</h3>
            
            {/* TAMPILAN JIKA CUSTOMER */}
            {user?.role === 'Customer' && (
              <div style={styles.alertCustomer}>
                Saat ini pesanan Anda sedang ditinjau oleh tim Sales kami. Kami akan segera menghubungi Anda atau memperbarui harga penawaran di halaman ini.
              </div>
            )}

            {/* TAMPILAN JIKA SALES (Dan status masih PENDING) */}
            {(user?.role === 'Sales' || user?.role === 'Admin') && detail.status === 'PENDING' && (
              <form onSubmit={handleKirimPenawaran}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Harga Penawaran Final (Rp)</label>
                  <input type="number" required style={styles.input} placeholder={detail.harga_unit}
                         value={hargaPenawaran} onChange={(e) => setHargaPenawaran(e.target.value)} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Estimasi Ongkos Kirim (Rp)</label>
                  <input type="number" required style={styles.input} placeholder="Contoh: 15000000"
                         value={ongkosKirim} onChange={(e) => setOngkosKirim(e.target.value)} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Diskon Khusus (Rp)</label>
                  <input type="number" style={styles.input} placeholder="Contoh: 5000000"
                         value={diskon} onChange={(e) => setDiskon(e.target.value)} />
                </div>
                
                <hr style={{margin: '1.5rem 0', borderColor: '#e5e7eb'}} />
                
                <button type="submit" style={styles.btnAjukan}>
                  Simpan & Ajukan ke Manager
                </button>
              </form>
            )}

            {/* TAMPILAN JIKA MANAGER */}
            {user?.role === 'Manager' && detail.status === 'MENUNGGU_APPROVAL' && (
              <div>
                <p>Sales telah mengajukan harga. Mohon periksa rincian di bawah:</p>
                {/* Nanti di sini kita tampilkan rincian hitungan dari Sales */}
                <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                  <button style={{...styles.btnAjukan, backgroundColor: '#10b981', flex: 1}}>Setujui (Approve)</button>
                  <button style={{...styles.btnAjukan, backgroundColor: '#ef4444', flex: 1}}>Tolak</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- STYLING ---
const styles = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  backBtn: { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '0.5rem', fontWeight: 'bold' },
  title: { margin: '0 0 0.5rem 0', fontSize: '1.75rem', color: '#1f2937' },
  subtitle: { margin: 0, color: '#6b7280' },
  badgeBesar: { padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#d97706', fontWeight: 'bold', fontSize: '1.1rem' },
  
  grid: { display: 'grid', gridTemplateColumns: '6fr 4fr', gap: '2rem', alignItems: 'start' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  rightCol: { position: 'sticky', top: '2rem' }, // Membuat panel aksi tetap di layar saat di-scroll
  
  card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  cardTitle: { margin: '0 0 1.25rem 0', color: '#374151', borderBottom: '2px solid #f3f4f6', paddingBottom: '0.5rem' },
  
  infoTable: { width: '100%', borderCollapse: 'collapse' },
  tdLabel: { padding: '0.75rem 0', color: '#6b7280', width: '180px' },
  catatanBox: { backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '6px', border: '1px dashed #d1d5db', color: '#374151', lineHeight: '1.5' },
  
  alertCustomer: { backgroundColor: '#eff6ff', color: '#1e40af', padding: '1rem', borderRadius: '6px', lineHeight: '1.5' },
  
  inputGroup: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold', color: '#374151' },
  input: { width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' },
  
  btnAjukan: { width: '100%', padding: '0.85rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }
};

export default TransaksiDetail;