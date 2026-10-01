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
        a.name AS nama_alat,
        a.brand AS brand_alat,
        a.brand,
        a.model AS model_alat,
        a.model,
        a.tipe_katalog,
        a.kapasitas_ton,
        a.tenaga_mesin,
        a.kapasitas_bucket,
        a.kedalaman_gali,
        a.berat_operasional,
        a.harga AS harga_unit,
        a.image_url,
        a.description AS deskripsi_unit,
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

const alatBeratRepo = require('../repositories/alatBerat.repository');
const auditLogService = require('../services/auditlog.service');

// Memperbarui status di tabel quotations
const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM quotations WHERE id = ?', [id]);
    const quotation = rows[0];
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Data quotation tidak ditemukan' });
    }

    // Auto-Deduct Stock saat status berubah ke PROSES_OPERASIONAL atau PENGIRIMAN
    const postDeductStatuses = ['PROSES_OPERASIONAL', 'SIAP_KIRIM', 'PENGIRIMAN', 'SELESAI'];
    const willTriggerDeduction = (status === 'PROSES_OPERASIONAL' || status === 'PENGIRIMAN') && !postDeductStatuses.includes(quotation.status);

    if (willTriggerDeduction) {
      const unit = await alatBeratRepo.findById(quotation.alat_berat_id);
      const unitStock = unit ? (unit.stok !== undefined ? unit.stok : (unit.stock || 0)) : 0;
      if (unitStock <= 0) {
        return res.status(400).json({ success: false, message: 'Stok unit tidak mencukupi' });
      }

      const deducted = await alatBeratRepo.deductStock(quotation.alat_berat_id, 1);
      if (deducted === 0) {
        return res.status(400).json({ success: false, message: 'Stok unit tidak mencukupi' });
      }

      if (req.user?.id) {
        await auditLogService.logActivity(
          req.user.id,
          'UPDATE',
          'alat_berat',
          quotation.alat_berat_id,
          `Pengurangan stok otomatis (1 unit) untuk transaksi #${quotation.nomor_pemesanan || id} (Status -> ${status})`
        );
      }
    }

    await db.query('UPDATE quotations SET status = ? WHERE id = ?', [status, id]);
    res.json({
      success: true,
      message: 'Status quotation berhasil diperbarui'
    });
  } catch (error) {
    console.error("Error update status:", error);
    res.status(500).json({ success: false, message: error.message || 'Gagal memperbarui status' });
  }
};

module.exports = {
  getAll,
  updateStatus
};