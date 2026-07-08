import { useAuth } from '../../hooks/useAuth';
import React, { useState, useEffect } from 'react';
import { alatBeratService } from '../../services/alatBerat.service'; 

const MasterAlatBerat = () => {
  // Mengambil data user asli dari sistem otentikasi
  const { user } = useAuth();
  
  // Kita jadikan huruf kecil semua agar seragam (pasti menghasilkan: 'manager' atau 'sales')
  const currentUserRole = user?.role?.toLowerCase() || 'sales';
  const isManager = currentUserRole === 'manager';

  const [dataAlat, setDataAlat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

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

  // Mengambil data asli dari database saat komponen dimuat
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
      alert("Gagal memuat data dari server.");
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
        alert("Fungsi edit segera hadir!");
      } else {
        await alatBeratService.create(submitData);
        // Perbaikan: Pengecekan menggunakan huruf kecil 'manager'
        alert(isManager ? 'Data VIP berhasil disimpan!' : 'Draf berhasil dikirim ke Manager!');
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

  const handleApprove = async (id) => {
    if (window.confirm("Yakin ingin menyetujui data alat berat ini agar tampil di Katalog?")) {
      try {
        await alatBeratService.approve(id);
        alert("Data berhasil disetujui!");
        fetchData(); 
      } catch (error) {
        console.error("Gagal menyetujui:", error);
        alert("Terjadi kesalahan saat menyetujui data.");
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Manajemen Data Alat Berat</h2>
          <p style={styles.subtitle}>Kelola inventaris dan spesifikasi mesin untuk katalog pelanggan.</p>
        </div>
        <div>
          <button onClick={openAddModal} style={styles.addBtn}>+ Tambah Unit</button>
        </div>
      </div>

      <div style={styles.card}>
        {isLoading ? (
          <p style={{textAlign: 'center', padding: '2rem'}}>Memuat data dari server...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Unit</th>
                <th style={styles.th}>Katalog</th>
                <th style={styles.th}>Harga & Kelas</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataAlat.length === 0 ? (
                <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>Belum ada data alat berat.</td></tr>
              ) : dataAlat.map((item) => (
                <tr key={item.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.flexItem}>
                      {item.image_url ? (
                        <img src={item.image_url} alt="unit" style={styles.thumbnail} />
                      ) : (
                        <div style={{...styles.thumbnail, backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>No Img</div>
                      )}
                      <div>
                        <strong>{item.name}</strong><br/>
                        <span style={styles.textMuted}>{item.brand} - {item.model}</span>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={item.tipe_katalog === 'saw' ? styles.badgeSaw : styles.badgeUmum}>
                      {(item.tipe_katalog || 'umum').toUpperCase()}
                    </span>
                  </td>
                  <td style={styles.td}>
                    Rp {Number(item.harga).toLocaleString('id-ID')}<br/>
                    <span style={styles.textMuted}>Kelas: {item.kapasitas_ton || '-'} Ton</span>
                  </td>
                  <td style={styles.td}>
                    <span style={
                      item.status_approval === 'approved' ? styles.badgeApproved : 
                      item.status_approval === 'rejected' ? styles.badgeRejected : styles.badgePending
                    }>
                      {(item.status_approval || 'pending').toUpperCase()}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => openEditModal(item)} style={styles.btnEdit}>✏️ Edit</button>
                    
                    {/* TOMBOL APPROVAL KHUSUS MANAGER (Perbaikan: Menggunakan isManager dan case-insensitive check) */}
                    {isManager && (item.status_approval || 'pending').toLowerCase().trim() === 'pending' && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <button 
                          onClick={() => handleApprove(item.id)} 
                          style={styles.btnApprove} 
                          title="Setujui Data"
                        >
                          ✅ Approve
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL FORM TAMBAH / EDIT */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>{isEditing ? 'Edit Data Alat Berat' : 'Tambah Unit Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}>✖</button>
            </div>
            
            <form onSubmit={handleSubmit} style={styles.formContainer}>
              <div style={styles.grid2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tipe Katalog</label>
                  <select name="tipe_katalog" value={formData.tipe_katalog} onChange={handleInputChange} style={styles.input}>
                    <option value="umum">Katalog Umum (Spesifikasi Bebas)</option>
                    <option value="saw">Katalog SAW (Spesifikasi Wajib Lengkap)</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Foto Unit (Max 2MB)</label>
                  <input type="file" accept="image/jpeg, image/png, image/jpg" onChange={handleImageChange} style={styles.input} />
                  {imagePreview && <img src={imagePreview} alt="Preview" style={styles.previewImg} />}
                </div>
              </div>

              <hr style={styles.divider} />

              <div style={styles.grid3}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nama Unit <span style={styles.req}>*</span></label>
                  <input required type="text" name="name" value={formData.name} onChange={handleInputChange} style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Merek <span style={styles.req}>*</span></label>
                  <input required type="text" name="brand" value={formData.brand} onChange={handleInputChange} style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Model</label>
                  <input type="text" name="model" value={formData.model} onChange={handleInputChange} style={styles.input} />
                </div>
              </div>

              <hr style={styles.divider} />

              <div style={styles.infoBox}>
                ℹ️ Jika memilih Tipe Katalog <b>SAW</b>, seluruh angka spesifikasi di bawah ini wajib diisi dengan akurat.
              </div>
              
              <div style={styles.grid3}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Harga (Rp) {formData.tipe_katalog === 'saw' && <span style={styles.req}>*</span>}</label>
                  <input required={formData.tipe_katalog === 'saw'} type="number" name="harga" value={formData.harga} onChange={handleInputChange} style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tenaga Mesin (HP) {formData.tipe_katalog === 'saw' && <span style={styles.req}>*</span>}</label>
                  <input required={formData.tipe_katalog === 'saw'} type="number" name="tenaga_mesin" value={formData.tenaga_mesin} onChange={handleInputChange} style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Kapasitas Bucket (m³) {formData.tipe_katalog === 'saw' && <span style={styles.req}>*</span>}</label>
                  <input required={formData.tipe_katalog === 'saw'} type="number" step="0.01" name="kapasitas_bucket" value={formData.kapasitas_bucket} onChange={handleInputChange} style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Kedalaman Gali (mm) {formData.tipe_katalog === 'saw' && <span style={styles.req}>*</span>}</label>
                  <input required={formData.tipe_katalog === 'saw'} type="number" step="0.01" name="kedalaman_gali" value={formData.kedalaman_gali} onChange={handleInputChange} style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Berat Ops. (Kg) {formData.tipe_katalog === 'saw' && <span style={styles.req}>*</span>}</label>
                  <input required={formData.tipe_katalog === 'saw'} type="number" step="0.01" name="berat_operasional" value={formData.berat_operasional} onChange={handleInputChange} style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Kelas Tonase (Ton) {formData.tipe_katalog === 'saw' && <span style={styles.req}>*</span>}</label>
                  <select required={formData.tipe_katalog === 'saw'} name="kapasitas_ton" value={formData.kapasitas_ton} onChange={handleInputChange} style={styles.input}>
                    <option value="">-- Pilih Kelas --</option>
                    <option value="5">5 Ton</option>
                    <option value="20">20 Ton</option>
                    <option value="30">30 Ton</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Deskripsi Singkat</label>
                <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} style={styles.input}></textarea>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.btnCancel}>Batal</button>
                <button type="submit" disabled={isLoading} style={styles.btnSave}>
                  {isLoading ? 'Menyimpan...' : (isManager ? 'Simpan & Setujui (VIP)' : 'Simpan Draf (Pending)')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- STYLING ---
const styles = {
  container: { padding: '2rem', backgroundColor: '#f3f4f6', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  title: { margin: 0, color: '#1f2937' },
  subtitle: { margin: 0, color: '#6b7280', fontSize: '0.9rem' },
  addBtn: { padding: '0.6rem 1.2rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '1rem', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#4b5563' },
  tr: { borderBottom: '1px solid #e5e7eb' },
  td: { padding: '1rem', color: '#374151', verticalAlign: 'middle' },
  flexItem: { display: 'flex', alignItems: 'center', gap: '1rem' },
  thumbnail: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb' },
  textMuted: { fontSize: '0.85rem', color: '#6b7280' },
  badgeSaw: { backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' },
  badgeUmum: { backgroundColor: '#f3f4f6', color: '#4b5563', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' },
  badgeApproved: { backgroundColor: '#d1fae5', color: '#065f46', padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' },
  badgePending: { backgroundColor: '#fef3c7', color: '#92400e', padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' },
  badgeRejected: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' },
  btnEdit: { padding: '0.4rem 0.8rem', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', color: '#374151' },
  btnApprove: { padding: '0.4rem 0.8rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' },
  modalContent: { backgroundColor: 'white', borderRadius: '8px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' },
  formContainer: { padding: '1.5rem' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
  formGroup: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.9rem' },
  input: { width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' },
  req: { color: '#ef4444' },
  previewImg: { marginTop: '0.5rem', width: '100px', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px dashed #9ca3af' },
  divider: { margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e5e7eb' },
  infoBox: { backgroundColor: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '1rem', color: '#1e3a8a', fontSize: '0.85rem', marginBottom: '1rem', borderRadius: '0 6px 6px 0' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' },
  btnCancel: { padding: '0.6rem 1.2rem', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  btnSave: { padding: '0.6rem 1.2rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};

export default MasterAlatBerat;