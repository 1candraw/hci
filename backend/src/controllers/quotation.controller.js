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

// +++ TAMBAHAN: Fungsi untuk mengambil semua data (untuk tabel Transaksi) +++
const getAllQuotations = async (req, res) => {
  try {
    const quotations = await quotationRepo.getAll();
    res.status(200).json(quotations);
  } catch (error) {
    console.error('Error getAllQuotations:', error);
    res.status(500).json({ message: 'Gagal mengambil data transaksi', error: error.message });
  }
};

// +++ TAMBAHAN: Fungsi untuk mengambil 1 spesifik data (untuk halaman Detail) +++
const getById = async (req, res) => {
  try {
    const id = req.params.id;
    const quotation = await quotationRepo.getById(id);

    if (!quotation) {
      return res.status(404).json({ message: 'Data pesanan tidak ditemukan' });
    }

    res.status(200).json(quotation);
  } catch (error) {
    console.error('Error getById:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil detail', error: error.message });
  }
};

// +++ TAMBAHAN: Fungsi untuk menangani request dari form Sales +++
const submitPenawaran = async (req, res) => {

  console.log("=== API SUBMIT PENAWARAN TERPANGGIL ===");
  console.log("Data diterima:", req.body);
  try {
    const id = req.params.id; // ID pesanan dari URL
    const sales_id = req.user.id; // ID Sales yang sedang login (dari token)
    
    const { harga_penawaran, ongkos_kirim, diskon } = req.body;

    // Susun data untuk dikirim ke Repository
    const updateData = {
      harga_penawaran: harga_penawaran || 0,
      ongkos_kirim: ongkos_kirim || 0,
      diskon: diskon || 0,
      sales_id: sales_id
    };

    const affectedRows = await quotationRepo.updatePenawaran(id, updateData);

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Data pesanan tidak ditemukan atau gagal diupdate' });
    }

    res.status(200).json({ message: 'Penawaran berhasil diajukan ke Manager!' });
  } catch (error) {
    console.error('Error submitPenawaran:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan penawaran', error: error.message });
  }
};

module.exports = {
  createQuotation,
  getAllQuotations, // Export fungsi ini
  getById,           // Export fungsi ini
  submitPenawaran    // Export fungsi ini
};