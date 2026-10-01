const stockRequestRepo = require('../repositories/stockRequest.repository');
const alatBeratRepo = require('../repositories/alatBerat.repository');
const auditLogService = require('../services/auditlog.service');

// 1. Membuat Permohonan Penyesuaian Stok Baru (Role: Sales / Auth User)
// Endpoint: POST /api/stock-requests
const createRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { alat_berat_id, type, jumlah, alasan } = req.body;

    // Validasi input wajib
    if (!alat_berat_id) {
      return res.status(400).json({ success: false, message: 'ID alat berat wajib dipilih.' });
    }

    const validTypes = ['TAMBAH', 'KURANG', 'SET_STOK'];
    const normalizedType = (type || '').toUpperCase().trim();
    if (!validTypes.includes(normalizedType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tipe perubahan tidak valid. Pilih antara TAMBAH, KURANG, atau SET_STOK.' 
      });
    }

    const parsedJumlah = parseInt(jumlah, 10);
    if (isNaN(parsedJumlah) || parsedJumlah < 0 || (normalizedType !== 'SET_STOK' && parsedJumlah <= 0)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Jumlah unit harus berupa bilangan bulat positif (> 0).' 
      });
    }

    if (!alasan || !alasan.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Alasan permohonan perubahan stok wajib diisi.' 
      });
    }

    // Cek keberadaan unit alat berat
    const unit = await alatBeratRepo.findById(alat_berat_id);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit alat berat tidak ditemukan.' });
    }

    const currentStock = unit.stok !== undefined ? unit.stok : (unit.stock || 0);

    // Validasi jika tipe KURANG tapi jumlah melebihi stok yang ada
    if (normalizedType === 'KURANG' && parsedJumlah > currentStock) {
      return res.status(400).json({ 
        success: false, 
        message: `Jumlah pengurangan (${parsedJumlah}) melebihi stok yang tersedia saat ini (${currentStock} unit).` 
      });
    }

    // Simpan permohonan ke database (status default PENDING)
    const insertId = await stockRequestRepo.create({
      alat_berat_id,
      requested_by: userId,
      type: normalizedType,
      jumlah: parsedJumlah,
      alasan: alasan.trim()
    });

    // Catat ke audit log
    await auditLogService.logActivity(
      userId,
      'INSERT',
      'stock_requests',
      insertId,
      `Sales mengajukan permohonan penyesuaian stok (${normalizedType} ${parsedJumlah} unit) untuk ${unit.brand || ''} ${unit.model || ''} (ID #${unit.id}) - Alasan: ${alasan.trim()}`
    );

    res.status(201).json({
      success: true,
      message: 'Permohonan penyesuaian stok berhasil dikirim ke antrean Manager untuk disetujui.',
      data: {
        id: insertId,
        alat_berat_id,
        nama_alat: unit.name,
        type: normalizedType,
        jumlah: parsedJumlah,
        status: 'PENDING'
      }
    });

  } catch (error) {
    console.error('Error createRequest:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat permohonan penyesuaian stok.' });
  }
};

// 2. Melihat Daftar Permohonan Pending (Role: Manager)
// Endpoint: GET /api/stock-requests/pending
const getPendingRequests = async (req, res) => {
  try {
    const requests = await stockRequestRepo.findPending();
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar permohonan stok pending',
      data: requests,
      total_pending: requests.length
    });
  } catch (error) {
    console.error('Error getPendingRequests:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar permohonan stok.' });
  }
};

// 3. Melihat Riwayat Permohonan Milik Sendiri (Role: Sales / Auth User)
// Endpoint: GET /api/stock-requests/my
const getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await stockRequestRepo.findByRequestedBy(userId);
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil riwayat permohonan stok Anda',
      data: requests
    });
  } catch (error) {
    console.error('Error getMyRequests:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil riwayat permohonan stok.' });
  }
};

// 4. Melihat Semua Permohonan dengan opsi filter (Role: Manager / Internal)
// Endpoint: GET /api/stock-requests
const getAllRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const requests = await stockRequestRepo.findAll(status);
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil semua data permohonan stok',
      data: requests
    });
  } catch (error) {
    console.error('Error getAllRequests:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data permohonan stok.' });
  }
};

// 5. Menyetujui Permohonan Stok (Role: Manager)
// Endpoint: PUT /api/stock-requests/:id/approve
const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user.id;
    const userRole = req.user.role ? req.user.role.toLowerCase() : '';

    if (userRole !== 'manager') {
      return res.status(403).json({ 
        success: false, 
        message: 'Akses ditolak. Hanya Manager yang dapat menyetujui permohonan stok.' 
      });
    }

    const request = await stockRequestRepo.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Permohonan stok tidak ditemukan.' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ 
        success: false, 
        message: `Permohonan ini sudah diproses sebelumnya dengan status ${request.status}.` 
      });
    }

    const unit = await alatBeratRepo.findById(request.alat_berat_id);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Data alat berat terkait tidak ditemukan.' });
    }

    const currentStock = unit.stok !== undefined ? unit.stok : (unit.stock || 0);
    let newStock = currentStock;

    if (request.type === 'TAMBAH') {
      newStock = currentStock + request.jumlah;
    } else if (request.type === 'KURANG') {
      newStock = Math.max(0, currentStock - request.jumlah);
    } else if (request.type === 'SET_STOK') {
      newStock = Math.max(0, request.jumlah);
    }

    // 1. Update stok di tabel alat_berat
    await alatBeratRepo.updateStock(request.alat_berat_id, newStock);

    // 2. Update status permohonan jadi APPROVED
    await stockRequestRepo.updateStatus(id, 'APPROVED', managerId, null);

    // 3. Catat ke audit log
    await auditLogService.logActivity(
      managerId,
      'UPDATE',
      'stock_requests',
      id,
      `Manager menyetujui permohonan stok #${id} (${request.type} ${request.jumlah}) untuk ${unit.brand || ''} ${unit.model || ''}. Stok diperbarui dari ${currentStock} menjadi ${newStock} unit.`
    );

    res.status(200).json({
      success: true,
      message: `Permohonan penyesuaian stok disetujui! Stok unit ${unit.brand || ''} ${unit.model || ''} berhasil diperbarui menjadi ${newStock} unit.`,
      data: {
        id: request.id,
        alat_berat_id: request.alat_berat_id,
        stok_sebelumnya: currentStock,
        stok_baru: newStock,
        status: 'APPROVED'
      }
    });

  } catch (error) {
    console.error('Error approveRequest:', error);
    res.status(500).json({ success: false, message: 'Gagal menyetujui permohonan stok.' });
  }
};

// 6. Menolak Permohonan Stok (Role: Manager)
// Endpoint: PUT /api/stock-requests/:id/reject
const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user.id;
    const userRole = req.user.role ? req.user.role.toLowerCase() : '';

    if (userRole !== 'manager') {
      return res.status(403).json({ 
        success: false, 
        message: 'Akses ditolak. Hanya Manager yang dapat menolak permohonan stok.' 
      });
    }

    const request = await stockRequestRepo.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Permohonan stok tidak ditemukan.' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ 
        success: false, 
        message: `Permohonan ini sudah diproses sebelumnya dengan status ${request.status}.` 
      });
    }

    const rejectionReason = req.body.rejection_reason || req.body.alasan || req.body.alasan_penolakan || 'Ditolak oleh Manager';

    // Update status permohonan jadi REJECTED
    await stockRequestRepo.updateStatus(id, 'REJECTED', managerId, rejectionReason);

    // Catat ke audit log
    await auditLogService.logActivity(
      managerId,
      'UPDATE',
      'stock_requests',
      id,
      `Manager menolak permohonan stok #${id} (${request.type} ${request.jumlah}) untuk ${request.brand_alat || ''} ${request.model_alat || ''} - Alasan: ${rejectionReason}`
    );

    res.status(200).json({
      success: true,
      message: 'Permohonan penyesuaian stok berhasil ditolak.',
      data: {
        id: request.id,
        alat_berat_id: request.alat_berat_id,
        status: 'REJECTED',
        rejection_reason: rejectionReason
      }
    });

  } catch (error) {
    console.error('Error rejectRequest:', error);
    res.status(500).json({ success: false, message: 'Gagal menolak permohonan stok.' });
  }
};

module.exports = {
  createRequest,
  getPendingRequests,
  getMyRequests,
  getAllRequests,
  approveRequest,
  rejectRequest
};
