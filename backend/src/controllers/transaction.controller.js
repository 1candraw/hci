const db = require('../config/database'); // Sesuaikan dengan path file database kamu

// Mengambil semua data dari tabel quotations
const getAll = async (req, res) => {
  try {
    // Kita gabungkan (JOIN) tabel quotations dengan users dan alat_berat
    const query = `
      SELECT 
        q.id,
        CONCAT('Q-', LPAD(q.id, 3, '0')) AS nomor_dokumen,
        u.fullname AS perusahaan,
        a.name AS nama_unit,
        q.created_at AS tanggal,
        q.status
      FROM quotations q
      JOIN users u ON q.customer_id = u.id
      JOIN alat_berat a ON q.alat_berat_id = a.id
      ORDER BY q.created_at DESC
    `;
    
    const [rows] = await db.query(query);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error("Error get transaksi:", error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data transaksi' });
  }
};

// Memperbarui status di tabel quotations
const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.query('UPDATE quotations SET status = ? WHERE id = ?', [status, id]);
    res.json({
      success: true,
      message: 'Status quotation berhasil diperbarui'
    });
  } catch (error) {
    console.error("Error update status:", error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui status' });
  }
};

module.exports = {
  getAll,
  updateStatus
};