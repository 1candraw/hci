import React, { useState, useEffect } from 'react';

const MasterAlatBerat = () => {
  // SIMULASI ROLE: Ganti-ganti antara 'sales' dan 'manager' untuk melihat perbedaan UI
  const [currentUserRole, setCurrentUserRole] = useState('sales');

  const [dataAlat, setDataAlat] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // State Form disesuaikan persis dengan tabel database-mu
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
    status_approval: 'pending' // Default saat ditambah
  };
  const [formData, setFormData] = useState(initialForm);

  // Data Dummy untuk simulasi UI
  useEffect(() => {
    setDataAlat([
      {
        id: 1, name: 'Excavator PC200', brand: 'Komatsu', model: 'PC200-8', tipe_katalog: 'saw', 
        harga: 1200000000, kapasitas_ton: 20, status_approval: 'approved', image_url: 'https://via.placeholder.com/80'
      },
      {
        id: 2, name: 'Mini Excavator 305', brand: 'Caterpillar', model: '305E2', tipe_katalog: 'umum', 
        harga: 500000000, kapasitas_ton: 5, status_approval: 'pending', image_url: 'https://via.placeholder.com/80'
      }
    ]);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simulasi preview gambar lokal
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
    setFormData(item);
    setImagePreview(item.image_url);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logika Frontend: Jika Manager yang simpan, otomatis approved. Jika Sales, pending.
    const finalStatus = currentUserRole === 'manager' ? 'approved' : 'pending';
    
    console.log("Data Siap Dikirim ke API:", { ...formData, status_approval: finalStatus });
    alert(`Data berhasil disimpan dengan status: ${finalStatus.toUpperCase()}`);
    setIsModalOpen(false);
  };

  const handleApprove = (id) => {
    alert(`Menyetujui data ID: ${id}`);
    // Nanti panggil API: axios.put(`/api/alat-berat/approve/${id}`)
  };

  const handleReject = (id) => {
    alert(`Menolak data ID: ${id}`);
    // Nanti panggil API: axios.put(`/api/alat-berat/reject/${id}`)
  };

  return (
    <div style={styles.container}>
      {/* HEADER & SIMULASI ROLE */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Manajemen Data Alat Berat</h2>
          <p style={styles.subtitle}>Kelola inventaris dan spesifikasi mesin untuk katalog pelanggan.</p>
        </div>
        <div style={styles.roleToggleBox}>
          <span style={styles.roleText}>Login sebagai: </span>
          <select 
            value={currentUserRole} 
            onChange={(e) => setCurrentUserRole(e.target.value)}
            style={styles.roleSelect}
          >
            <option value="sales">Sales (Draft & Pending)</option>
            <option value="manager">Manager (Approval & VIP)</option>
          </select>
          <button onClick={openAddModal} style={styles.addBtn}>+ Tambah Unit</button>
        </div>
      </div>

      {/* TABEL DATA */}
      <div style={styles.card}>
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
            {dataAlat.map((item) => (
              <tr key={item.id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={styles.flexItem}>
                    <img src={item.image_url} alt="excavator" style={styles.thumbnail} />
                    <div>
                      <strong>{item.name}</strong><br/>
                      <span style={styles.textMuted}>{item.brand} - {item.model}</span>
                    </div>
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={item.tipe_katalog === 'saw' ? styles.badgeSaw : styles.badgeUmum}>
                    {item.tipe_katalog.toUpperCase()}
                  </span>
                </td>
                <td style={styles.td}>
                  Rp {Number(item.harga).toLocaleString('id-ID')}<br/>
                  <span style={styles.textMuted}>Kelas: {item.kapasitas_ton} Ton</span>
                </td>
                <td style={styles.td}>
                  <span style={
                    item.status_approval === 'approved' ? styles.badgeApproved : 
                    item.status_approval === 'rejected' ? styles.badgeRejected : styles.badgePending
                  }>
                    {item.status_approval.toUpperCase()}
                  </span>
                </td>
                <td style={styles.td}>
                  <button onClick={() => openEditModal(item)} style={styles.btnEdit}>✏️ Edit</button>
                  
                  {/* TOMBOL APPROVAL KHUSUS MANAGER */}
                  {currentUserRole === 'manager' && item.status_approval === 'pending' && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleApprove(item.id)} style={styles.btnApprove}>✅</button>
                      <button onClick={() => handleReject(item.id)} style={styles.btnReject}>❌</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
              {/* Seksi 1: Gambar & Katalog */}
              <div style={styles.grid2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tipe Katalog</label>
                  <select name="tipe_katalog" value={formData.tipe_katalog} onChange={handleInputChange} style={styles.input}>
                    <option value="umum">Katalog Umum (Spesifikasi Bebas)</option>
                    <option value="saw">Katalog SAW (Spesifikasi Wajib Lengkap)</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Foto Unit</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} style={styles.input} />
                  {imagePreview && <img src={imagePreview} alt="Preview" style={styles.previewImg} />}
                </div>
              </div>

              <hr style={styles.divider} />

              {/* Seksi 2: Info Dasar */}
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

              {/* Seksi 3: Spesifikasi Teknis (Wajib untuk SAW) */}
              <div style={styles.infoBox}>
                ℹ️ Jika memilih Tipe Katalog <b>SAW</b>, seluruh angka spesifikasi di bawah ini wajib diisi dengan akurat untuk kebutuhan perhitungan algoritma.
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
                <button type="submit" style={styles.btnSave}>
                  {currentUserRole === 'manager' ? 'Simpan & Setujui (VIP)' : 'Simpan Draf (Pending)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- STYLING (Tetap menggunakan arsitektur inline yang seragam) ---
const styles = {
  container: { padding: '2rem', backgroundColor: '#f3f4f6', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  title: { margin: 0, color: '#1f2937' },
  subtitle: { margin: 0, color: '#6b7280', fontSize: '0.9rem' },
  roleToggleBox: { backgroundColor: '#e0e7ff', padding: '0.8rem 1.2rem', borderRadius: '8px', border: '1px solid #a5b4fc', display: 'flex', alignItems: 'center', gap: '1rem' },
  roleText: { fontWeight: 'bold', color: '#3730a3', fontSize: '0.9rem' },
  roleSelect: { padding: '0.5rem', borderRadius: '4px', border: '1px solid #c7d2fe', outline: 'none' },
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
  btnApprove: { padding: '0.4rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  btnReject: { padding: '0.4rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
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