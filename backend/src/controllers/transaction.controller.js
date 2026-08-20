const db = require('../config/database'); // Sesuaikan dengan path file database kamu

// Mengambil semua data dari tabel quotations
const getAll = async (req, res) => {
  try {
    let query = `
      SELECT 
        q.id,
        COALESCE(q.nomor_pemesanan, CONCAT('Q-', LPAD(q.id, 3, '0'))) AS nomor_dokumen,
        COALESCE(q.guest_company, u.fullname, q.guest_name, 'Guest RFQ') AS perusahaan,
        COALESCE(q.guest_name, u.fullname, 'Guest') AS nama_customer,
        q.guest_phone,
        q.guest_email,
        a.name AS nama_unit,
        q.created_at AS tanggal,
        q.status,
        q.sumber_pesanan,
        q.metode_pembayaran,
        q.harga_penawaran,
        q.ongkos_kirim,
        q.diskon
      FROM quotations q
      LEFT JOIN users u ON q.customer_id = u.id
      LEFT JOIN alat_berat a ON q.alat_berat_id = a.id
    `;

    const params = [];
    if (req.user && req.user.role === 'Customer') {
      query += ` WHERE q.customer_id = ? `;
      params.push(req.user.id);
    }

    query += ` ORDER BY q.created_at DESC`;
    
    const [rows] = await db.query(query, params);
    
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