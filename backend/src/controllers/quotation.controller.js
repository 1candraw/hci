const quotationRepo = require('../repositories/quotation.repository');

const createQuotation = async (req, res) => {
  try {
    // 1. Ambil ID Customer dari token JWT yang sedang login
    const customer_id = req.user.id; 
    
    // 2. Tangkap data dari form React
    const { alat_berat_id, sumber_pesanan, saw_result_id, metode_pembayaran, catatan } = req.body;

    // 3. Generate Nomor Pemesanan Unik ala Enterprise (Contoh: PO-202607-A8F2)
    const date = new Date();
    const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const nomor_pemesanan = `PO-${yearMonth}-${randomStr}`;

    // 4. Susun data untuk dilempar ke Repository
    const newQuotation = {
      nomor_pemesanan,
      customer_id,
      alat_berat_id,
      sumber_pesanan,
      saw_result_id,
      metode_pembayaran,
      catatan
    };

    // 5. Simpan ke database
    const insertId = await quotationRepo.create(newQuotation);

    res.status(201).json({
      message: 'Pemesanan berhasil diajukan',
      data: { id: insertId, nomor_pemesanan }
    });

  } catch (error) {
    console.error('Error createQuotation:', error);
    res.status(500).json({ message: 'Gagal mengajukan pemesanan', error: error.message });
  }
};

module.exports = {
  createQuotation
};