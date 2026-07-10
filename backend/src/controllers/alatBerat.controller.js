const alatBeratRepo = require('../repositories/alatBerat.repository');

// 1. Mendapatkan daftar alat berat
const getAlatBerat = async (req, res) => {
  try {
    const { tipe, kapasitas, status } = req.query; 
    const data = await alatBeratRepo.findAll(tipe, kapasitas, status);
    
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data alat berat',
      data: data
    });
  } catch (error) {
    console.error("Error getAlatBerat:", error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
};

// 2. Menambahkan alat berat baru (Create)
const addAlatBerat = async (req, res) => {
  try {
    const dataInput = req.body;
    
    if (req.file) {
      dataInput.image_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }
    
    const userId = req.user.id; 
    const userRole = req.user.role ? req.user.role.toLowerCase() : ''; 

    if (userRole === 'manager') {
      dataInput.status_approval = 'approved';
      dataInput.created_by = userId;
      dataInput.approved_by = userId; 
    } else {
      dataInput.status_approval = 'pending';
      dataInput.created_by = userId;
      dataInput.approved_by = null;
    }

    const newId = await alatBeratRepo.create(dataInput);

    res.status(201).json({
      success: true,
      message: userRole === 'manager' 
        ? 'Data berhasil disimpan dan langsung disetujui (VIP).' 
        : 'Data berhasil disimpan sebagai draf (Menunggu persetujuan Manager).',
      insertId: newId
    });

  } catch (error) {
    console.error("Error addAlatBerat:", error);
    res.status(500).json({ success: false, message: 'Gagal menyimpan data.' });
  }
};

// 3. Mengubah alat berat (Update)
const updateAlatBerat = async (req, res) => {
  try {
    const { id } = req.params;
    const dataInput = req.body;
    
    if (req.file) {
      dataInput.image_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const userRole = req.user.role ? req.user.role.toLowerCase() : ''; 

    // Logika Maker-Checker untuk Edit
    if (userRole === 'manager') {
      dataInput.status_approval = 'approved';
      dataInput.approved_by = req.user.id;
    } else {
      // Jika Sales yang edit, status turun kasta kembali ke 'pending'
      dataInput.status_approval = 'pending';
      dataInput.approved_by = null; 
    }

    const affectedRows = await alatBeratRepo.update(id, dataInput);
    
    if (affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }

    res.status(200).json({ 
      success: true, 
      message: userRole === 'manager' 
        ? 'Data VIP berhasil diubah!' 
        : 'Perubahan disimpan sebagai Draf (Menunggu Approve Manager)!' 
    });

  } catch (error) {
    console.error("Error updateAlatBerat:", error);
    res.status(500).json({ success: false, message: 'Gagal mengubah data.' });
  }
};

// 4. Menghapus alat berat (Delete)
const deleteAlatBerat = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role ? req.user.role.toLowerCase() : '';

    if (userRole === 'manager') {
      // Jalur VIP: Manager langsung hapus permanen dari database
      const affectedRows = await alatBeratRepo.remove(id);
      if (affectedRows === 0) return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
      
      return res.status(200).json({ success: true, message: 'Data terhapus permanen.' });
    } else {
      // Jalur Biasa: Sales hanya mengajukan penghapusan (Soft Delete)
      const affectedRows = await alatBeratRepo.updateStatus(id, 'pending_delete', null);
      if (affectedRows === 0) return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
      
      return res.status(200).json({ success: true, message: 'Pengajuan hapus telah dikirim ke Manager.' });
    }

  } catch (error) {
    console.error("Error deleteAlatBerat:", error);
    res.status(500).json({ success: false, message: 'Gagal memproses penghapusan data.' });
  }
};

// 5. Manager Menyetujui Data (Smart Approve)
const approveAlatBerat = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user.id;
    const userRole = req.user.role ? req.user.role.toLowerCase() : '';

    if (userRole !== 'manager') {
      return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Manager yang dapat memberikan persetujuan.' });
    }

    // Cek dulu apa status data saat ini (Apakah pending biasa atau pending hapus?)
    const item = await alatBeratRepo.findById(id);
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }

    if (item.status_approval === 'pending_delete') {
      // Jika yang diapprove adalah pengajuan hapus, maka hapus permanen dari DB
      await alatBeratRepo.remove(id);
      return res.status(200).json({ success: true, message: 'Penghapusan disetujui. Data telah dihapus permanen.' });
    } else {
      // Jika yang diapprove adalah pengajuan tambah/edit, ubah status jadi approved
      await alatBeratRepo.updateStatus(id, 'approved', managerId);
      return res.status(200).json({ success: true, message: 'Data alat berat berhasil disetujui dan masuk ke Katalog.' });
    }

  } catch (error) {
    console.error("Error approveAlatBerat:", error);
    res.status(500).json({ success: false, message: 'Gagal menyetujui data.' });
  }
};

module.exports = {
  getAlatBerat,
  addAlatBerat,
  updateAlatBerat,
  deleteAlatBerat,
  approveAlatBerat
};