import { useAuth } from '../../hooks/useAuth';
import { useState, useEffect } from 'react';
import { alatBeratService } from '../../services/alatBerat.service'; 
import { stockRequestService } from '../../services/stockRequest.service';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Truck,
  Search,
  PackagePlus,
  Layers,
  Clock,
  Check,
  XCircle,
  AlertTriangle,
  History,
  SlidersHorizontal
} from 'lucide-react';

const MasterAlatBerat = () => {
  const { user } = useAuth();
  const currentUserRole = user?.role?.toLowerCase() || 'sales';
  const isManager = currentUserRole === 'manager';
  const isSales = currentUserRole === 'sales';

  // State Utama
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'requests'
  const [dataAlat, setDataAlat] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Tambah / Edit Unit
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
    stok: '',
    description: '',
    imageFile: null 
  };
  const [formData, setFormData] = useState(initialForm);

  // Modal Pengajuan Penyesuaian Stok (Sales)
  const [isStockReqModalOpen, setIsStockReqModalOpen] = useState(false);
  const [stockReqForm, setStockReqForm] = useState({
    alat_berat_id: '',
    type: 'TAMBAH',
    jumlah: 1,
    alasan: ''
  });

  // Modal Edit Stok Langsung (Manager)
  const [isDirectStockModalOpen, setIsDirectStockModalOpen] = useState(false);
  const [directStockTarget, setDirectStockTarget] = useState(null);
  const [directStockValue, setDirectStockValue] = useState(0);

  // Modal Tolak Permohonan Stok (Manager)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchData();
    fetchStockRequests();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const result = await alatBeratService.getAll();
      setDataAlat(result.data || []);
    } catch (error) {
      console.error("Gagal mengambil data alat berat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStockRequests = async () => {
    try {
      setIsLoadingRequests(true);
      if (isManager) {
        const result = await stockRequestService.getPending();
        setPendingRequests(result.data || []);
      } else {
        const result = await stockRequestService.getMy();
        setMyRequests(result.data || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data permintaan stok:", error);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // --- HANDLER MODAL CRUD UNIT ---
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
    setFormData({ 
      ...item, 
      imageFile: null,
      stock: item.stok !== undefined ? item.stok : (item.stock || 0),
      stok: item.stok !== undefined ? item.stok : (item.stock || 0)
    }); 
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

  // --- HANDLER MODAL PERMOHONAN STOK (SALES) ---
  const openStockReqModal = (presetUnitId = '') => {
    setStockReqForm({
      alat_berat_id: presetUnitId || (dataAlat[0]?.id || ''),
      type: 'TAMBAH',
      jumlah: 1,
      alasan: ''
    });
    setIsStockReqModalOpen(true);
  };

  const handleStockReqSubmit = async (e) => {
    e.preventDefault();
    if (!stockReqForm.alat_berat_id) {
      alert("Silakan pilih unit alat berat.");
      return;
    }
    if (Number(stockReqForm.jumlah) <= 0) {
      alert("Jumlah penyesuaian harus lebih besar dari 0.");
      return;
    }
    if (!stockReqForm.alasan.trim()) {
      alert("Alasan permohonan wajib diisi.");
      return;
    }

    try {
      setIsLoading(true);
      await stockRequestService.create(stockReqForm);
      alert("Permohonan penyesuaian stok berhasil dikirim ke antrean Manager!");
      setIsStockReqModalOpen(false);
      fetchStockRequests();
    } catch (error) {
      alert(error.toString() || "Gagal mengirim permohonan stok.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLER EDIT STOK LANGSUNG (MANAGER) ---
  const openDirectStockModal = (unit) => {
    setDirectStockTarget(unit);
    const current = unit.stok !== undefined ? unit.stok : (unit.stock || 0);
    setDirectStockValue(current);
    setIsDirectStockModalOpen(true);
  };

  const handleDirectStockSubmit = async (e) => {
    e.preventDefault();
    if (directStockValue < 0) {
      alert("Stok tidak boleh bernilai negatif.");
      return;
    }

    try {
      setIsLoading(true);
      await alatBeratService.updateStock(directStockTarget.id, directStockValue);
      alert(`Stok unit ${directStockTarget.brand || ''} ${directStockTarget.model || ''} berhasil diperbarui menjadi ${directStockValue} unit!`);
      setIsDirectStockModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.toString() || "Gagal memperbarui stok.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLER APPROVE & REJECT PERMINTAAN STOK (MANAGER) ---
  const handleApproveStockReq = async (reqId) => {
    if (!window.confirm("Setujui permohonan penyesuaian stok ini? Stok unit akan otomatis disesuaikan.")) return;
    try {
      setIsLoading(true);
      const res = await stockRequestService.approve(reqId);
      alert(res.message || "Permohonan stok disetujui!");
      fetchStockRequests();
      fetchData();
    } catch (error) {
      alert(error.toString() || "Gagal menyetujui permohonan stok.");
    } finally {
      setIsLoading(false);
    }
  };

  const openRejectModal = (reqId) => {
    setRejectTargetId(reqId);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleRejectStockReq = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert("Harap masukkan alasan penolakan.");
      return;
    }

    try {
      setIsLoading(true);
      await stockRequestService.reject(rejectTargetId, rejectionReason.trim());
      alert("Permohonan stok berhasil ditolak.");
      setIsRejectModalOpen(false);
      fetchStockRequests();
    } catch (error) {
      alert(error.toString() || "Gagal menolak permohonan stok.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter Search
  const filteredData = dataAlat.filter(item => {
    const q = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.brand?.toLowerCase().includes(q) ||
      item.model?.toLowerCase().includes(q)
    );
  });

  // Helper Badge Visual Stok
  const renderStockBadge = (stockVal) => {
    const qty = parseInt(stockVal !== undefined ? stockVal : 0, 10);
    if (qty > 2) {
      return (
        <span style={styles.stockBadgeGreen}>
          <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '0.95rem' }}>{qty}</span> Unit
        </span>
      );
    } else if (qty >= 1) {
      return (
        <span style={styles.stockBadgeYellow}>
          <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '0.95rem' }}>{qty}</span> Unit (Menipis)
        </span>
      );
    } else {
      return (
        <span style={styles.stockBadgeGray}>
          <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '0.95rem' }}>0</span> Unit (Habis)
        </span>
      );
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Halaman */}
      <div style={styles.header}>
        <div>
          <span style={styles.headerPill}>INVENTORY & STOCK CONTROL</span>
          <h1 style={styles.title}>Manajemen Aset & Stok Alat Berat</h1>
          <p style={styles.subtitle}>
            Pantau ketersediaan armada, kelola persetujuan kuota unit, dan lakukan penyesuaian stok secara terintegrasi.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Tombol Ajukan Penyesuaian Stok (Role Sales) */}
          {isSales && (
            <button onClick={() => openStockReqModal()} style={styles.stockReqBtn}>
              <PackagePlus size={16} />
              <span>Ajukan Penyesuaian Stok</span>
            </button>
          )}

          {/* Tombol Tambah Unit Baru */}
          <button onClick={openAddModal} style={styles.addBtn}>
            <Plus size={16} />
            <span>Tambah Unit Baru</span>
          </button>
        </div>
      </div>

      {/* TAB NAVIGATION: DAFTAR ALAT vs PERMINTAAN STOK */}
      <div style={styles.tabBar}>
        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'inventory' ? styles.tabBtnActive : {})
          }}
        >
          <Truck size={16} />
          <span>Daftar Unit Alat Berat ({dataAlat.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('requests');
            fetchStockRequests();
          }}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'requests' ? styles.tabBtnActive : {})
          }}
        >
          {isManager ? (
            <>
              <Clock size={16} />
              <span>Permintaan Stok</span>
              {pendingRequests.length > 0 && (
                <span style={styles.badgePendingCount}>
                  {pendingRequests.length} Pending
                </span>
              )}
            </>
          ) : (
            <>
              <History size={16} />
              <span>Riwayat Pengajuan Stok Saya</span>
              {myRequests.length > 0 && (
                <span style={styles.badgeMyCount}>
                  {myRequests.length}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* KONTEN TAB 1: DAFTAR ALAT BERAT */}
      {activeTab === 'inventory' && (
        <div style={styles.card}>
          {/* Search & Sub-header */}
          <div style={styles.tableTopBar}>
            <div style={styles.searchWrap}>
              <Search size={15} style={{ color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Cari nama, merek, atau model unit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Menampilkan <strong>{filteredData.length}</strong> unit
            </div>
          </div>

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
                    <th style={styles.th}>STOK TERSEDIA</th>
                    <th style={styles.th}>STATUS APPROVAL</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        Tidak ada unit alat berat yang sesuai dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => {
                      const currentStock = item.stok !== undefined ? item.stok : (item.stock || 0);
                      return (
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
                          
                          {/* KOLOM STOK TERSEDIA DENGAN VISUAL BADGE */}
                          <td style={styles.td}>
                            {renderStockBadge(currentStock)}
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
                          
                          {/* KOLOM AKSI */}
                          <td style={styles.td}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                              
                              {/* Action Role Manager: Edit Stok Langsung */}
                              {isManager && (
                                <button 
                                  onClick={() => openDirectStockModal(item)} 
                                  style={styles.btnDirectStock} 
                                  title="Ubah Stok Unit Seketika (VIP Manager)"
                                >
                                  <Layers size={13} />
                                  <span>Edit Stok</span>
                                </button>
                              )}

                              {/* Action Role Sales: Ajukan Stok untuk unit ini */}
                              {isSales && (
                                <button 
                                  onClick={() => openStockReqModal(item.id)} 
                                  style={styles.btnStockReqUnit} 
                                  title="Ajukan Perubahan Stok untuk Unit Ini"
                                >
                                  <PackagePlus size={13} />
                                  <span>Ajukan Stok</span>
                                </button>
                              )}

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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* KONTEN TAB 2: PERMINTAAN STOK (MANAGER APPROVAL / SALES HISTORY) */}
      {activeTab === 'requests' && (
        <div style={styles.card}>
          <div style={styles.requestsHeader}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: "'Sora', sans-serif", color: '#0d141e' }}>
                {isManager ? 'Antrean Approval Permohonan Stok Unit' : 'Riwayat Pengajuan Penyesuaian Stok Anda'}
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                {isManager 
                  ? 'Tinjau dan proses permohonan penambahan / pengurangan stok yang diajukan oleh tim Sales.'
                  : 'Pantau status permohonan penyesuaian stok yang telah Anda kirimkan ke Manager.'}
              </p>
            </div>
            {isSales && (
              <button onClick={() => openStockReqModal()} style={styles.stockReqBtn}>
                <PackagePlus size={15} />
                <span>+ Buat Permohonan Baru</span>
              </button>
            )}
          </div>

          {isLoadingRequests ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <div className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTopColor: '#74c02c', borderRadius: '50%', margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: '700' }}>Memuat daftar permohonan stok...</p>
            </div>
          ) : isManager ? (
            /* TABEL VIEW MANAGER (PENDING REQUESTS) */
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>UNIT ALAT BERAT</th>
                    <th style={styles.th}>SALES PEMOHON</th>
                    <th style={styles.th}>JENIS PENYESUAIAN</th>
                    <th style={styles.th}>STOK SAAT INI</th>
                    <th style={styles.th}>ALASAN PERMOHONAN</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>AKSI APPROVAL</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        <CheckCircle2 size={36} style={{ color: '#10b981', margin: '0 auto 0.5rem' }} />
                        <p style={{ margin: 0, fontWeight: '700', color: '#0d141e' }}>Semua Permohonan Stok Telah Diproses</p>
                        <span style={{ fontSize: '0.82rem' }}>Tidak ada permohonan stok yang berstatus pending saat ini.</span>
                      </td>
                    </tr>
                  ) : (
                    pendingRequests.map((req) => (
                      <tr key={req.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.flexItem}>
                            {req.image_url ? (
                              <img src={req.image_url} alt="unit" style={styles.thumbnail} />
                            ) : (
                              <div style={styles.noThumbnail}>
                                <Truck size={20} style={{ color: '#94a3b8' }} />
                              </div>
                            )}
                            <div>
                              <strong style={{ color: '#0d141e', fontSize: '0.9rem' }}>{req.nama_alat}</strong><br/>
                              <span style={styles.textMuted}>{req.brand_alat} · {req.model_alat || '-'}</span>
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <strong style={{ color: '#0d141e' }}>{req.requester_name}</strong><br/>
                          <span style={styles.textMuted}>{new Date(req.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={
                            req.type === 'TAMBAH' ? styles.typeBadgeTambah :
                            req.type === 'KURANG' ? styles.typeBadgeKurang : styles.typeBadgeSet
                          }>
                            {req.type === 'TAMBAH' ? `+ ${req.jumlah} Unit (TAMBAH)` :
                             req.type === 'KURANG' ? `- ${req.jumlah} Unit (KURANG)` :
                             `SET JADI ${req.jumlah} Unit`}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#334155' }}>
                            {req.stok_sekarang !== undefined ? req.stok_sekarang : (req.stock_sekarang || 0)} Unit
                          </span>
                        </td>
                        <td style={{ ...styles.td, maxWidth: '280px' }}>
                          <p style={{ margin: 0, fontSize: '0.84rem', color: '#334155', fontStyle: 'italic' }}>
                            "{req.alasan}"
                          </p>
                        </td>
                        <td style={styles.td}>
                          {/* TOMBOL SETUJUI (HIJAU) DAN TOLAK (MERAH) BERDAMPINGAN */}
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleApproveStockReq(req.id)}
                              style={styles.btnApproveStock}
                              title="Setujui permohonan stok ini"
                            >
                              <Check size={14} />
                              <span>Setujui</span>
                            </button>
                            <button
                              onClick={() => openRejectModal(req.id)}
                              style={styles.btnRejectStock}
                              title="Tolak permohonan stok ini"
                            >
                              <XCircle size={14} />
                              <span>Tolak</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* TABEL VIEW SALES (MY REQUESTS HISTORY) */
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>UNIT ALAT BERAT</th>
                    <th style={styles.th}>TANGGAL PENGAJUAN</th>
                    <th style={styles.th}>JENIS & NOMINAL</th>
                    <th style={styles.th}>ALASAN PERMOHONAN</th>
                    <th style={styles.th}>STATUS APPROVAL</th>
                    <th style={styles.th}>CATATAN REVIEW</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        <p style={{ margin: 0, fontWeight: '700', color: '#0d141e' }}>Belum Ada Riwayat Permohonan</p>
                        <span style={{ fontSize: '0.82rem' }}>Klik tombol "+ Buat Permohonan Baru" untuk mengajukan penyesuaian stok unit ke Manager.</span>
                      </td>
                    </tr>
                  ) : (
                    myRequests.map((req) => (
                      <tr key={req.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.flexItem}>
                            {req.image_url ? (
                              <img src={req.image_url} alt="unit" style={styles.thumbnail} />
                            ) : (
                              <div style={styles.noThumbnail}>
                                <Truck size={20} style={{ color: '#94a3b8' }} />
                              </div>
                            )}
                            <div>
                              <strong style={{ color: '#0d141e', fontSize: '0.9rem' }}>{req.nama_alat}</strong><br/>
                              <span style={styles.textMuted}>{req.brand_alat} · {req.model_alat || '-'}</span>
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontSize: '0.84rem', color: '#475569' }}>
                            {new Date(req.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={
                            req.type === 'TAMBAH' ? styles.typeBadgeTambah :
                            req.type === 'KURANG' ? styles.typeBadgeKurang : styles.typeBadgeSet
                          }>
                            {req.type === 'TAMBAH' ? `+ ${req.jumlah} Unit (TAMBAH)` :
                             req.type === 'KURANG' ? `- ${req.jumlah} Unit (KURANG)` :
                             `SET JADI ${req.jumlah} Unit`}
                          </span>
                        </td>
                        <td style={{ ...styles.td, maxWidth: '240px' }}>
                          <span style={{ fontSize: '0.84rem', color: '#334155' }}>{req.alasan}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={
                            req.status === 'APPROVED' ? styles.badgeApproved :
                            req.status === 'REJECTED' ? styles.badgeRejected : styles.badgePending
                          }>
                            {req.status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {req.reviewer_name && (
                            <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block' }}>
                              Oleh: <strong>{req.reviewer_name}</strong>
                            </span>
                          )}
                          {req.rejection_reason && (
                            <span style={{ fontSize: '0.78rem', color: '#991b1b', fontStyle: 'italic' }}>
                              Alasan: {req.rejection_reason}
                            </span>
                          )}
                          {!req.reviewer_name && !req.rejection_reason && (
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Menunggu tinjauan Manager</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL FORM AJUKAN PENYESUAIAN STOK (ROLE: SALES) */}
      {/* ==================================================== */}
      {isStockReqModalOpen && (
        <div style={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsStockReqModalOpen(false)}>
          <div style={{ ...styles.modalContent, maxWidth: '580px' }}>
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.modalTag}>WORKFLOW PERMOHONAN STOK</span>
                <h3 style={styles.modalTitle}>Ajukan Penyesuaian Stok Unit</h3>
              </div>
              <button onClick={() => setIsStockReqModalOpen(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStockReqSubmit} style={styles.formContainer}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Pilih Unit Alat Berat <span style={styles.req}>*</span></label>
                <select
                  required
                  value={stockReqForm.alat_berat_id}
                  onChange={(e) => setStockReqForm({ ...stockReqForm, alat_berat_id: e.target.value })}
                  style={styles.input}
                >
                  <option value="">-- Pilih Unit --</option>
                  {dataAlat.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.brand} {u.model || ''}) — Stok Saat Ini: {u.stok !== undefined ? u.stok : (u.stock || 0)} Unit
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.grid2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Jenis Penyesuaian <span style={styles.req}>*</span></label>
                  <select
                    value={stockReqForm.type}
                    onChange={(e) => setStockReqForm({ ...stockReqForm, type: e.target.value })}
                    style={styles.input}
                  >
                    <option value="TAMBAH">TAMBAH (Unit Masuk / Restock)</option>
                    <option value="KURANG">KURANG (Unit Rusak / Alokasi Khusus)</option>
                    <option value="SET_STOK">SET_STOK (Set Ulang Total Stok)</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Jumlah Unit (Nominal) <span style={styles.req}>*</span></label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={stockReqForm.jumlah}
                    onChange={(e) => setStockReqForm({ ...stockReqForm, jumlah: e.target.value })}
                    style={styles.input}
                    placeholder="Contoh: 3"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Alasan Permohonan Penyesuaian <span style={styles.req}>*</span></label>
                <textarea
                  required
                  rows="3"
                  value={stockReqForm.alasan}
                  onChange={(e) => setStockReqForm({ ...stockReqForm, alasan: e.target.value })}
                  style={styles.input}
                  placeholder="Jelaskan dasar permohonan perubahan stok (contoh: Kedatangan 3 unit baru dari supplier / revisi fisik opname)..."
                />
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setIsStockReqModalOpen(false)} style={styles.btnCancel}>Batal</button>
                <button type="submit" disabled={isLoading} style={styles.btnSave}>
                  {isLoading ? 'Mengirim...' : 'Kirim Permohonan ke Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL EDIT STOK LANGSUNG (ROLE: MANAGER) */}
      {/* ==================================================== */}
      {isDirectStockModalOpen && directStockTarget && (
        <div style={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsDirectStockModalOpen(false)}>
          <div style={{ ...styles.modalContent, maxWidth: '480px' }}>
            <div style={styles.modalHeader}>
              <div>
                <span style={{ ...styles.modalTag, backgroundColor: '#fef3c7', color: '#b45309' }}>VIP MANAGER ACTION</span>
                <h3 style={styles.modalTitle}>Edit Stok Langsung</h3>
              </div>
              <button onClick={() => setIsDirectStockModalOpen(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDirectStockSubmit} style={styles.formContainer}>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <strong style={{ color: '#0d141e', fontSize: '0.95rem' }}>{directStockTarget.name}</strong>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Brand: {directStockTarget.brand} · Model: {directStockTarget.model || '-'}
                </p>
                <div style={{ marginTop: '0.5rem', fontSize: '0.84rem' }}>
                  Stok saat ini: <strong style={{ color: '#15803d', fontFamily: 'monospace' }}>{directStockTarget.stok !== undefined ? directStockTarget.stok : (directStockTarget.stock || 0)} Unit</strong>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nilai Stok Baru (Tersedia) <span style={styles.req}>*</span></label>
                <input
                  required
                  type="number"
                  min="0"
                  value={directStockValue}
                  onChange={(e) => setDirectStockValue(parseInt(e.target.value, 10) || 0)}
                  style={{ ...styles.input, fontSize: '1.1rem', fontWeight: '800', fontFamily: 'monospace' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem', display: 'block' }}>
                  *Perubahan ini langsung berlaku seketika di katalog publik tanpa melalui approval workflow.
                </span>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setIsDirectStockModalOpen(false)} style={styles.btnCancel}>Batal</button>
                <button type="submit" disabled={isLoading} style={styles.btnSave}>
                  {isLoading ? 'Menyimpan...' : 'Simpan Stok Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL TOLAK PERMOHONAN STOK (ROLE: MANAGER) */}
      {/* ==================================================== */}
      {isRejectModalOpen && (
        <div style={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsRejectModalOpen(false)}>
          <div style={{ ...styles.modalContent, maxWidth: '480px' }}>
            <div style={styles.modalHeader}>
              <div>
                <span style={{ ...styles.modalTag, backgroundColor: '#fee2e2', color: '#991b1b' }}>PENOLAKAN PERMOHONAN</span>
                <h3 style={styles.modalTitle}>Tolak Permohonan Stok</h3>
              </div>
              <button onClick={() => setIsRejectModalOpen(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRejectStockReq} style={styles.formContainer}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Alasan Penolakan <span style={styles.req}>*</span></label>
                <textarea
                  required
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  style={styles.input}
                  placeholder="Tuliskan catatan alasan penolakan permohonan stok ini..."
                />
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setIsRejectModalOpen(false)} style={styles.btnCancel}>Batal</button>
                <button type="submit" disabled={isLoading} style={{ ...styles.btnSave, backgroundColor: '#dc2626', color: '#ffffff' }}>
                  {isLoading ? 'Memproses...' : 'Konfirmasi Tolak Permohonan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL FORM TAMBAH / EDIT UNIT LENGKAP */}
      {/* ==================================================== */}
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

              {/* Input Stok untuk Tambah Baru / Manager */}
              {(!isEditing || isManager) && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Stok Unit Awal {isManager ? '(Bisa Diubah Langsung)' : '(Stok Awal)'}
                  </label>
                  <input 
                    type="number" 
                    min="0" 
                    name="stock" 
                    value={formData.stock} 
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value, stok: e.target.value })} 
                    style={styles.input} 
                    placeholder="Contoh: 5" 
                  />
                  {!isManager && (
                    <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                      *Catatan: Perubahan stok setelah unit dibuat hanya dapat diajukan via menu Permohonan Penyesuaian Stok.
                    </span>
                  )}
                </div>
              )}
              
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
  subtitle: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.85rem',
    color: '#64748b'
  },
  tabBar: {
    display: 'flex',
    gap: '0.6rem',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '0.2rem'
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.65rem 1.15rem',
    borderRadius: '8px 8px 0 0',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    fontSize: '0.88rem',
    transition: 'all 0.15s ease',
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    color: '#0d141e',
    boxShadow: '0 -2px 8px rgba(13, 20, 30, 0.04)',
    borderBottom: '3px solid #74c02c',
    color: '#15803d'
  },
  badgePendingCount: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
    border: '1px solid #fde68a',
    borderRadius: '20px',
    padding: '0.1rem 0.5rem',
    fontSize: '0.72rem',
    fontWeight: '900'
  },
  badgeMyCount: {
    backgroundColor: '#e2e8f0',
    color: '#334155',
    borderRadius: '20px',
    padding: '0.1rem 0.5rem',
    fontSize: '0.72rem',
    fontWeight: '900'
  },
  tableTopBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #f1f5f9',
    flexWrap: 'wrap',
    gap: '0.75rem'
  },
  requestsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #f1f5f9',
    flexWrap: 'wrap',
    gap: '0.75rem'
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
  stockReqBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.65rem 1.15rem',
    backgroundColor: '#ecfccb',
    color: '#15803d',
    border: '1.5px solid #84cc16',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.86rem',
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
  
  // Visual Badges Stok Sesuai Aturan Ketat
  stockBadgeGreen: {
    backgroundColor: '#ecfdf5',
    color: '#047857',
    border: '1px solid #a7f3d0',
    padding: '0.3rem 0.65rem',
    borderRadius: '6px',
    fontSize: '0.82rem',
    fontWeight: '700',
    display: 'inline-block'
  },
  stockBadgeYellow: {
    backgroundColor: '#fffbeb',
    color: '#b45309',
    border: '1px solid #fde68a',
    padding: '0.3rem 0.65rem',
    borderRadius: '6px',
    fontSize: '0.82rem',
    fontWeight: '700',
    display: 'inline-block'
  },
  stockBadgeGray: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    border: '1px solid #cbd5e1',
    padding: '0.3rem 0.65rem',
    borderRadius: '6px',
    fontSize: '0.82rem',
    fontWeight: '700',
    display: 'inline-block'
  },

  // Type Badges
  typeBadgeTambah: {
    backgroundColor: '#ecfccb',
    color: '#15803d',
    border: '1px solid #d9f99d',
    padding: '0.25rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.78rem',
    fontWeight: '800',
    fontFamily: "'Urbanist', sans-serif"
  },
  typeBadgeKurang: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
    padding: '0.25rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.78rem',
    fontWeight: '800',
    fontFamily: "'Urbanist', sans-serif"
  },
  typeBadgeSet: {
    backgroundColor: '#e0e7ff',
    color: '#3730a3',
    border: '1px solid #c7d2fe',
    padding: '0.25rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.78rem',
    fontWeight: '800',
    fontFamily: "'Urbanist', sans-serif"
  },

  badgeSaw: { backgroundColor: '#ecfccb', color: '#15803d', border: '1px solid #d9f99d', padding: '0.2rem 0.55rem', borderRadius: '5px', fontSize: '0.72rem', fontFamily: "'Urbanist', sans-serif", fontWeight: '900' },
  badgeUmum: { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '0.2rem 0.55rem', borderRadius: '5px', fontSize: '0.72rem', fontFamily: "'Urbanist', sans-serif", fontWeight: '900' },
  badgeApproved: { backgroundColor: '#ecfccb', color: '#15803d', border: '1px solid #84cc16', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.72rem', fontFamily: "'Urbanist', sans-serif", fontWeight: '900' },
  badgePending: { backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.72rem', fontFamily: "'Urbanist', sans-serif", fontWeight: '900' },
  badgeRejected: { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.72rem', fontFamily: "'Urbanist', sans-serif", fontWeight: '900' },
  badgeDanger: { backgroundColor: '#dc2626', color: 'white', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.72rem', fontFamily: "'Urbanist', sans-serif", fontWeight: '900' },

  btnDirectStock: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.4rem 0.75rem',
    backgroundColor: '#0d141e',
    color: '#74c02c',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800'
  },
  btnStockReqUnit: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.4rem 0.75rem',
    backgroundColor: '#ecfccb',
    color: '#15803d',
    border: '1px solid #84cc16',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800'
  },
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
  btnApproveStock: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.45rem 0.85rem',
    backgroundColor: '#15803d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    fontSize: '0.8rem',
    boxShadow: '0 2px 6px rgba(21, 128, 61, 0.2)'
  },
  btnRejectStock: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.45rem 0.85rem',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    fontSize: '0.8rem',
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
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' },
  formGroup: { marginBottom: '1.1rem' },
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