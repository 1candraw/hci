import { useAuth } from '../../hooks/useAuth';
import React, { useState, useEffect } from 'react';
import { alatBeratService } from '../../services/alatBerat.service'; 
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Truck,
  ShieldCheck,
  Search,
  Filter,
  Image as ImageIcon
} from 'lucide-react';

const MasterAlatBerat = () => {
  const { user } = useAuth();
  const currentUserRole = user?.role?.toLowerCase() || 'sales';
  const isManager = currentUserRole === 'manager';

  const [dataAlat, setDataAlat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const initialForm = {
    id: null,
    tipe_katalog: 'umum',
    name: '',
    brand: '',
    model: '',
    harga: '',
    tenaga_mesin: '',
    kapasitas_bucket: '',
    kedalaman_gali: '',
    berat_operasional: '',
    kapasitas_ton: '',
    stock: '',
    description: '',
    imageFile: null 
  };
  
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const result = await alatBeratService.getAll();
      setDataAlat(result.data || []);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setFormData({ ...formData, imageFile: file }); 
    }
  };

  const openAddModal = () => {
    setFormData(initialForm);
    setImagePreview(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setFormData({ ...item, imageFile: null }); 
    setImagePreview(item.image_url);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'imageFile' && key !== 'image_url' && formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });
      if (formData.imageFile) {
        submitData.append('imageFile', formData.imageFile);
      }

      setIsLoading(true);
      
      if (isEditing) {
        await alatBeratService.update(formData.id, submitData);
        alert(isManager ? 'Data berhasil diubah!' : 'Perubahan disimpan sebagai Draf (Menunggu Approve Manager)!');
      } else {
        await alatBeratService.create(submitData);
        alert(isManager ? 'Data berhasil disimpan!' : 'Draf unit berhasil dikirim ke Manager!');
      }

      setIsModalOpen(false);
      fetchData(); 
    } catch (error) {
      console.error("Error submit form:", error);
      alert(error.message || "Gagal menyimpan data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmMessage = isManager 
      ? "Yakin ingin MENGHAPUS data ini secara PERMANEN?" 
      : "Ajukan PENGHAPUSAN data ini ke Manager?";

    if (window.confirm(confirmMessage)) {
      try {
        await alatBeratService.delete(id);
        alert(isManager ? "Data terhapus permanen!" : "Pengajuan hapus telah dikirim ke Manager.");
        fetchData();
      } catch (error) {
        console.error("Gagal menghapus:", error);
        alert("Terjadi kesalahan saat memproses data.");
      }
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm("Yakin ingin menyetujui tindakan pada data ini?")) {
      try {
        await alatBeratService.approve(id);
        alert("Tindakan berhasil disetujui!");
        fetchData(); 
      } catch (error) {
        console.error("Gagal menyetujui:", error);
      }
    }
  };

  const filteredData = dataAlat.filter(item => {
    const q = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.brand?.toLowerCase().includes(q) ||
      item.model?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={styles.container}>
      {/* Header Halaman */}
      <div style={styles.header}>
        <div>
          <span style={styles.headerPill}>INVENTORY & MASTER DATA</span>
          <h1 style={styles.title}>Manajemen Master Alat Berat</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={styles.searchWrap}>
            <Search size={15} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Cari nama, merek, atau model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <button onClick={openAddModal} style={styles.addBtn}>
            <Plus size={16} />
            <span>Tambah Unit Baru</span>
          </button>
        </div>
      </div>

      <div style={styles.card}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <div className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTopColor: '#74c02c', borderRadius: '50%', margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: '700' }}>Memuat data unit dari server...</p>
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>UNIT & SPESIFIKASI</th>
                  <th style={styles.th}>KATALOG</th>
                  <th style={styles.th}>HARGA & KELAS</th>
                  <th style={styles.th}>STATUS APPROVAL</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.flexItem}>
                        {item.image_url ? (
                          <img src={item.image_url} alt="unit" style={styles.thumbnail} />
                        ) : (
                          <div style={styles.noThumbnail}>
                            <Truck size={20} style={{ color: '#94a3b8' }} />
                          </div>
                        )}
                        <div>
                          <strong style={{ color: '#0d141e', fontSize: '0.92rem' }}>{item.name}</strong><br/>
                          <span style={styles.textMuted}>{item.brand} · {item.model || '-'}</span>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={item.tipe_katalog === 'saw' ? styles.badgeSaw : styles.badgeUmum}>
                        {(item.tipe_katalog || 'umum').toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <strong style={{ color: '#15803d', fontFamily: "'Sora', sans-serif" }}>
                        Rp {Number(item.harga).toLocaleString('id-ID')}
                      </strong><br/>
                      <span style={styles.textMuted}>Kelas {item.kapasitas_ton || '-'} Ton</span>
                    </td>
                    <td style={styles.td}>
                      <span style={
                        item.status_approval === 'approved' ? styles.badgeApproved : 
                        item.status_approval === 'rejected' ? styles.badgeRejected : 
                        item.status_approval === 'pending_delete' ? styles.badgeDanger : styles.badgePending
                      }>
                        {(item.status_approval === 'pending_delete' ? 'HAPUS (PENDING)' : (item.status_approval || 'pending')).toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => openEditModal(item)} style={styles.btnEdit} title="Edit Data Unit">
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                        <button onClick={() => handleDelete(item.id)} style={styles.btnDelete} title="Hapus Unit">
                          <Trash2 size={13} />
                          <span>Hapus</span>
                        </button>
                        
                        {isManager && ['pending', 'pending_delete'].includes((item.status_approval || '').toLowerCase().trim()) && (
                          <button onClick={() => handleApprove(item.id)} style={styles.btnApprove} title="Setujui Data">
                            <CheckCircle2 size={13} />
                            <span>Approve</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL FORM TAMBAH / EDIT */}
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.modalTag}>HEAVY CARE ID · DATA INVENTORI</span>
                <h3 style={styles.modalTitle}>{isEditing ? 'Edit Data Alat Berat' : 'Tambah Unit Baru'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={styles.formContainer}>
              <div style={styles.grid2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tipe Penempatan Katalog</label>
                  <select name="tipe_katalog" value={formData.tipe_katalog} onChange={handleInputChange} style={styles.input}>
                    <option value="umum">Katalog Umum (Marketplace)</option>
                    <option value="saw">Katalog SAW (Kalkulator SPK)</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Foto Unit Alat Berat</label>
                  <input type="file" accept="image/jpeg, image/png, image/jpg" onChange={handleImageChange} style={styles.fileInput} />
                  {imagePreview && <img src={imagePreview} alt="Preview" style={styles.previewImg} />}
                </div>
              </div>
              
              <hr style={styles.divider} />
              
              <div style={styles.grid3}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nama Unit <span style={styles.req}>*</span></label>
                  <input required type="text" name="name" value={formData.name} onChange={handleInputChange} style={styles.input} placeholder="Contoh: Excavator SY215C" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Merek / Brand <span style={styles.req}>*</span></label>
                  <input required type="text" name="brand" value={formData.brand} onChange={handleInputChange} style={styles.input} placeholder="Contoh: Zoomlion / Sany" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nomor Model</label>
                  <input type="text" name="model" value={formData.model} onChange={handleInputChange} style={styles.input} placeholder="Contoh: ZE215E" />
                </div>
              </div>
              
              <hr style={styles.divider} />
              
              <div style={styles.grid3}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Harga Beli Resmi (Rp) {formData.tipe_katalog === 'saw' && <span style={styles.req}>*</span>}</label>
                  <input required={formData.tipe_katalog === 'saw'} type="number" name="harga" value={formData.harga} onChange={handleInputChange} style={styles.input} placeholder="1250000000" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tenaga Mesin (HP) {formData.tipe_katalog === 'saw' && <span style={styles.req}>*</span>}</label>
                  <input required={formData.tipe_katalog === 'saw'} type="number" name="tenaga_mesin" value={formData.tenaga_mesin} onChange={handleInputChange} style={styles.input} placeholder="150" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Kapasitas Bucket (m³) {formData.tipe_katalog === 'saw' && <span style={styles.req}>*</span>}</label>
                  <input required={formData.tipe_katalog === 'saw'} type="number" step="0.01" name="kapasitas_bucket" value={formData.kapasitas_bucket} onChange={handleInputChange} style={styles.input} placeholder="0.93" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Kedalaman Gali (mm) {formData.tipe_katalog === 'saw' && <span style={styles.req}>*</span>}</label>
                  <input required={formData.tipe_katalog === 'saw'} type="number" step="0.01" name="kedalaman_gali" value={formData.kedalaman_gali} onChange={handleInputChange} style={styles.input} placeholder="6600" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Berat Ops. (Kg) {formData.tipe_katalog === 'saw' && <span style={styles.req}>*</span>}</label>
                  <input required={formData.tipe_katalog === 'saw'} type="number" step="0.01" name="berat_operasional" value={formData.berat_operasional} onChange={handleInputChange} style={styles.input} placeholder="21500" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Kelas Tonase (Ton) {formData.tipe_katalog === 'saw' && <span style={styles.req}>*</span>}</label>
                  <select required={formData.tipe_katalog === 'saw'} name="kapasitas_ton" value={formData.kapasitas_ton} onChange={handleInputChange} style={styles.input}>
                    <option value="">-- Pilih Tonase --</option>
                    <option value="5">Mini (5 Ton)</option>
                    <option value="20">Medium (20 Ton)</option>
                    <option value="30">Heavy (30 Ton+)</option>
                  </select>
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Deskripsi & Keunggulan Mesin</label>
                <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} style={styles.input} placeholder="Tuliskan spesifikasi unggulan, attachment kompatibel, atau garansi..."></textarea>
              </div>
              
              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.btnCancel}>Batal</button>
                <button type="submit" disabled={isLoading} style={styles.btnSave}>
                  {isLoading ? 'Menyimpan...' : (isManager ? 'Simpan & Publikasikan' : 'Kirim Draf ke Manager')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  headerPill: {
    display: 'inline-block',
    fontSize: '0.68rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: '1.2px',
    marginBottom: '0.2rem',
  },
  title: { 
    margin: 0, 
    color: '#0d141e', 
    fontSize: '1.4rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    letterSpacing: '-0.03em',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    backgroundColor: '#f8fafc',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.45rem 0.85rem',
    minWidth: '260px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '0.84rem',
    color: '#0d141e',
    width: '100%',
  },
  addBtn: { 
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.65rem 1.25rem', 
    backgroundColor: '#0d141e', 
    color: '#74c02c', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.88rem',
    boxShadow: '0 4px 12px rgba(13, 20, 30, 0.25)',
  },
  card: { 
    backgroundColor: '#ffffff', 
    borderRadius: '16px', 
    boxShadow: '0 2px 8px rgba(13, 20, 30, 0.03)', 
    border: '1.5px solid #e2e8f0',
    overflow: 'hidden',
  },
  tableWrap: {
    overflowX: 'auto',
  },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { 
    padding: '0.85rem 1rem', 
    borderBottom: '1.5px solid #e2e8f0', 
    backgroundColor: '#f8fafc', 
    color: '#475569',
    fontSize: '0.72rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    letterSpacing: '0.8px',
  },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '1rem', color: '#334155', verticalAlign: 'middle', fontSize: '0.86rem' },
  flexItem: { display: 'flex', alignItems: 'center', gap: '0.85rem' },
  thumbnail: { width: '55px', height: '55px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' },
  noThumbnail: { width: '55px', height: '55px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  textMuted: { fontSize: '0.78rem', color: '#64748b' },
  badgeSaw: { backgroundColor: '#ecfccb', color: '#15803d', border: '1px solid #d9f99d', padding: '0.2rem 0.55rem', borderRadius: '5px', fontSize: '0.72rem', fontFamily: "'Urbanist', sans-serif", fontWeight: '900' },
  badgeUmum: { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '0.2rem 0.55rem', borderRadius: '5px', fontSize: '0.72rem', fontFamily: "'Urbanist', sans-serif", fontWeight: '900' },
  badgeApproved: { backgroundColor: '#ecfccb', color: '#15803d', border: '1px solid #84cc16', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.72rem', fontFamily: "'Urbanist', sans-serif", fontWeight: '900' },
  badgePending: { backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.72rem', fontFamily: "'Urbanist', sans-serif", fontWeight: '900' },
  badgeRejected: { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.72rem', fontFamily: "'Urbanist', sans-serif", fontWeight: '900' },
  badgeDanger: { backgroundColor: '#dc2626', color: 'white', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.72rem', fontFamily: "'Urbanist', sans-serif", fontWeight: '900' },
  btnEdit: { 
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.4rem 0.75rem', 
    backgroundColor: '#f8fafc', 
    border: '1.5px solid #cbd5e1', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    color: '#334155', 
    fontSize: '0.78rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800' 
  },
  btnDelete: { 
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.4rem 0.75rem', 
    backgroundColor: '#fee2e2', 
    border: '1px solid #fca5a5', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    color: '#991b1b', 
    fontSize: '0.78rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800' 
  },
  btnApprove: { 
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.4rem 0.85rem', 
    backgroundColor: '#0d141e', 
    color: '#74c02c', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900', 
    fontSize: '0.78rem',
    boxShadow: '0 2px 6px rgba(13, 20, 30, 0.25)',
  },
  modalOverlay: { 
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
    zIndex: 1000, 
    padding: '1.5rem' 
  },
  modalContent: { 
    backgroundColor: 'white', 
    borderRadius: '16px', 
    width: '100%', 
    maxWidth: '820px', 
    maxHeight: '90vh', 
    overflowY: 'auto', 
    boxShadow: '0 25px 60px rgba(13, 20, 30, 0.35)',
    border: '1.5px solid #e2e8f0',
  },
  modalHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    padding: '1.4rem 1.75rem', 
    borderBottom: '1px solid #f1f5f9', 
    position: 'sticky', 
    top: 0, 
    backgroundColor: 'white', 
    zIndex: 10 
  },
  modalTag: {
    display: 'inline-block',
    fontSize: '0.68rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    color: '#15803d',
    backgroundColor: '#ecfccb',
    padding: '0.12rem 0.45rem',
    borderRadius: '4px',
    marginBottom: '0.25rem',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#0d141e',
  },
  closeBtn: { 
    background: '#f8fafc', 
    border: '1px solid #e2e8f0', 
    borderRadius: '7px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer', 
    color: '#64748b' 
  },
  formContainer: { padding: '1.75rem' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' },
  formGroup: { marginBottom: '1rem' },
  label: { 
    display: 'block', 
    marginBottom: '0.4rem', 
    fontWeight: '700', 
    color: '#334155', 
    fontSize: '0.84rem' 
  },
  input: { 
    width: '100%', 
    padding: '0.65rem 0.8rem', 
    border: '1.5px solid #cbd5e1', 
    borderRadius: '7px', 
    fontSize: '0.88rem', 
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
  },
  fileInput: {
    fontSize: '0.84rem',
    color: '#475569',
  },
  req: { color: '#dc2626' },
  previewImg: { marginTop: '0.6rem', width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid #74c02c' },
  divider: { margin: '1.25rem 0', border: 'none', borderTop: '1px solid #f1f5f9' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' },
  btnCancel: { 
    padding: '0.7rem 1.3rem', 
    backgroundColor: '#f1f5f9', 
    color: '#475569', 
    border: 'none', 
    borderRadius: '7px', 
    cursor: 'pointer', 
    fontWeight: '700',
    fontSize: '0.86rem' 
  },
  btnSave: { 
    padding: '0.7rem 1.5rem', 
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

export default MasterAlatBerat;