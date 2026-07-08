const alatBeratRepo = require('../repositories/alatBerat.repository');

// 1. Mendapatkan daftar alat berat
const getAlatBerat = async (req, res) => {
  try {
    // Tangkap filter dari query URL (misal: ?status=pending)
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

// 2. Menambahkan alat berat baru (Logika Multi-Tier Approval & Upload Gambar)
const addAlatBerat = async (req, res) => {
  try {
    const dataInput = req.body;
    
    // --- TAMBAHAN UNTUK MULTER ---
    // Jika ada file gambar yang diupload, kita buatkan URL statisnya
    if (req.file) {
      // Hasilnya akan otomatis menjadi seperti: http://localhost:5000/uploads/alatberat-12345.jpg
      dataInput.image_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }
    // -----------------------------
    
    // CATATAN PENTING: req.user didapat dari middleware otentikasi (JWT) yang kamu buat
    const userId = req.user.id; 
    const userRole = req.user.role ? req.user.role.toLowerCase() : ''; // Asumsi: 'sales' atau 'manager'

    // Tentukan status persetujuan berdasarkan role
    if (userRole === 'manager') {
      // Jalur VIP: Manager yang input, otomatis Approved
      dataInput.status_approval = 'approved';
      dataInput.created_by = userId;
      dataInput.approved_by = userId; 
    } else {
      // Jalur Biasa: Sales yang input, masuk daftar antrean (Pending)
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

// 3. Manager Menyetujui Data (Approve)
const approveAlatBerat = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user.id;
    const userRole = req.user.role ? req.user.role.toLowerCase() : '';

    if (userRole !== 'manager') {
      return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Manager yang dapat memberikan persetujuan.' });
    }

    const affectedRows = await alatBeratRepo.updateStatus(id, 'approved', managerId);
    
    if (affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }

    res.status(200).json({ success: true, message: 'Data alat berat berhasil disetujui.' });
  } catch (error) {
    console.error("Error approveAlatBerat:", error);
    res.status(500).json({ success: false, message: 'Gagal menyetujui data.' });
  }
};

module.exports = {
  getAlatBerat,
  addAlatBerat,
  approveAlatBerat
};