const midtransClient = require('midtrans-client');
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

//Fungsi untuk mengambil semua data (untuk tabel Transaksi)
const getAllQuotations = async (req, res) => {
  try {
    const quotations = await quotationRepo.getAll();
    res.status(200).json(quotations);
  } catch (error) {
    console.error('Error getAllQuotations:', error);
    res.status(500).json({ message: 'Gagal mengambil data transaksi', error: error.message });
  }
};

//Fungsi untuk mengambil 1 spesifik data (untuk halaman Detail)
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

//Fungsi untuk menangani request dari form Sales
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

//Fungsi untuk Manager menyetujui atau menolak pesanan
const reviewPenawaran = async (req, res) => {
  try {
    const id = req.params.id;
    const manager_id = req.user.id; // Ambil ID Manager dari token
    const { action } = req.body; // Isinya nanti 'approve' atau 'reject'

    // Tentukan status berdasarkan aksi Manager
    let statusFinal = '';
    if (action === 'approve') {
      statusFinal = 'APPROVED';
    } else if (action === 'reject') {
      statusFinal = 'REJECTED';
    } else {
      return res.status(400).json({ message: 'Aksi tidak valid' });
    }

    const affectedRows = await quotationRepo.updateStatusManager(id, statusFinal, manager_id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Data pesanan tidak ditemukan' });
    }

    res.status(200).json({ message: `Pesanan berhasil di-${action}!` });
  } catch (error) {
    console.error('Error reviewPenawaran:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memproses review', error: error.message });
  }
};

//Fungsi untuk membuat token pembayaran Midtrans (DP)
const createPaymentToken = async (req, res) => {
  try {
    const id = req.params.id;
    
    // 1. Ambil data pesanan dari database
    const detail = await quotationRepo.getById(id);
    if (!detail) {
      return res.status(404).json({ message: 'Data pesanan tidak ditemukan' });
    }

    // 2. Hitung jumlah DP (Uang Muka) -> Misalnya kita set 10% dari Total Final
    const totalAkhir = Number(detail.harga_penawaran) + Number(detail.ongkos_kirim) - Number(detail.diskon);
    const dpAmount = Math.round(totalAkhir * 0.1); // DP 10% (dibulatkan agar tidak ada desimal)

    // 3. Konfigurasi koneksi ke Midtrans
    let snap = new midtransClient.Snap({
      isProduction: false, // Wajib false karena kita masih pakai mode Sandbox
      serverKey: process.env.MIDTRANS_SERVER_KEY
    });

    // 4. Siapkan parameter pesanan (struk digital)
    let parameter = {
      "transaction_details": {
        // Order ID harus unik, jadi kita gabung nomor pesanan + timestamp detik ini
        "order_id": `DP-${detail.nomor_dokumen}-${Date.now()}`,
        "gross_amount": dpAmount // Tagihan yang harus dibayar
      },
      "customer_details": {
        "first_name": detail.perusahaan,
        "email": detail.email_perusahaan || "customer@heavycare.id",
        "phone": detail.telepon_perusahaan || "0800000000"
      }
    };

    // 5. Tembak ke Midtrans untuk minta Token
    const transaction = await snap.createTransaction(parameter);
    
    // 6. Kembalikan tokennya ke Frontend React
    res.status(200).json({ 
      token: transaction.token, 
      dp_amount: dpAmount 
    });

  } catch (error) {
    console.error('Error createPaymentToken:', error);
    res.status(500).json({ message: 'Gagal membuat token pembayaran', error: error.message });
  }
};

// +++ TAMBAHKAN FUNGSI INI +++
const updateStatusPesanan = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body; // Status baru yang akan dikirim dari React

    const affectedRows = await quotationRepo.updateStatus(id, status);
    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Data pesanan tidak ditemukan' });
    }

    res.status(200).json({ message: `Status berhasil diubah menjadi ${status}` });
  } catch (error) {
    console.error('Error updateStatusPesanan:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

// +++ TAMBAHKAN FUNGSI INI +++
const submitChecklistPDI = async (req, res) => {
  try {
    const id = req.params.id; // ID Quotation
    const operatorId = req.user.id; // Mengambil ID dari user yang sedang login (Operasional)
    const checklistData = req.body;

    // 1. Simpan data PDI ke tabel unit_checklists
    await quotationRepo.submitPDI(id, operatorId, checklistData);

    // 2. Ubah status pesanan menjadi SIAP_KIRIM
    await quotationRepo.updateStatus(id, 'SIAP_KIRIM');

    res.status(200).json({ message: 'PDI selesai, Unit Siap Dikirim!' });
  } catch (error) {
    console.error('Error submitChecklistPDI:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

// +++ TAMBAHKAN FUNGSI INI DI CONTROLLER +++
const createDeliveryOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const deliveryData = req.body; 

    // 1. Simpan data pengiriman
    await quotationRepo.submitDeliveryOrder(id, deliveryData);

    // 2. Ubah status menjadi PENGIRIMAN
    await quotationRepo.updateStatus(id, 'PENGIRIMAN');

    res.status(200).json({ message: 'Surat Jalan berhasil diterbitkan, Unit dalam perjalanan!' });
  } catch (error) {
    console.error('Error createDeliveryOrder:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

// +++ TAMBAHKAN FUNGSI INI DI BAWAH +++
const receiveUnit = async (req, res) => {
  try {
    const id = req.params.id;
    await quotationRepo.confirmDelivery(id);
    res.status(200).json({ message: 'Unit berhasil diterima. Status menjadi SELESAI.' });
  } catch (error) {
    console.error('Error receiveUnit:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};
// Pastikan receiveUnit diekspor

// ★ GUEST RFQ: Endpoint publik tanpa token JWT
const createGuestQuotation = async (req, res) => {
  try {
    const { alat_berat_id, metode_pembayaran, guest_name, guest_company, guest_phone, guest_email, guest_location } = req.body;

    // Validasi field wajib
    if (!alat_berat_id || !guest_name || !guest_company || !guest_phone || !guest_email) {
      return res.status(400).json({ message: 'Field wajib: alat_berat_id, guest_name, guest_company, guest_phone, guest_email' });
    }

    // Generate nomor RFQ format HC-YYYYMM-XXXX
    const date = new Date();
    const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const nomor_pemesanan = `HC-${yearMonth}-${randomStr}`;

    const newGuest = {
      nomor_pemesanan,
      alat_berat_id,
      metode_pembayaran: metode_pembayaran || 'cash',
      guest_name,
      guest_company,
      guest_phone,
      guest_email,
      guest_location: guest_location || null,
    };

    const insertId = await quotationRepo.createGuest(newGuest);

    res.status(201).json({
      message: 'RFQ berhasil diajukan! Simpan nomor tracking Anda.',
      data: { id: insertId, nomor_pemesanan }
    });
  } catch (error) {
    console.error('Error createGuestQuotation:', error);
    res.status(500).json({ message: 'Gagal mengajukan RFQ', error: error.message });
  }
};

// ★ TRACKING PUBLIK: Cek status pesanan tanpa login
const trackQuotation = async (req, res) => {
  try {
    const { nomor } = req.params;
    if (!nomor) return res.status(400).json({ message: 'Nomor pesanan wajib diisi' });

    const quotation = await quotationRepo.getByNomor(nomor.trim().toUpperCase());
    if (!quotation) {
      return res.status(404).json({ message: 'Nomor pesanan tidak ditemukan. Pastikan nomor yang Anda masukkan benar.' });
    }

    // Map status ke step index (0-based) untuk visual stepper
    const STATUS_STEP_MAP = {
      'PENDING':              0,
      'MENUNGGU_APPROVAL':    1,
      'APPROVED':             1,
      'REJECTED':             1,
      'DP_DIBAYAR':           2,
      'VERIFIKASI_DP_SALES':  2,
      'PROSES_OPERASIONAL':   3,
      'SIAP_KIRIM':           3,
      'PENGIRIMAN':           4,
      'SELESAI':              5,
    };

    const stepIndex = STATUS_STEP_MAP[quotation.status] ?? 0;

    // Hitung total jika sudah ada penawaran
    const totalAkhir = quotation.harga_penawaran
      ? Number(quotation.harga_penawaran) + Number(quotation.ongkos_kirim || 0) - Number(quotation.diskon || 0)
      : null;

    res.status(200).json({
      ...quotation,
      step_index: stepIndex,
      total_akhir: totalAkhir,
    });
  } catch (error) {
    console.error('Error trackQuotation:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat melacak pesanan', error: error.message });
  }
};

// ★ BUKTI BAYAR DP: Upload slip dan data rekening pengirim (support ID atau nomor_pemesanan)
const uploadDPProof = async (req, res) => {
  try {
    const { identifier } = req.params;
    const { bank_name, account_number, account_name, amount } = req.body;

    let proof_url = null;
    if (req.file) {
      proof_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const quotation = await quotationRepo.getByNomor(identifier);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }

    // Hitung DP otomatis jika amount tidak dikirim (10% dari total akhir)
    const totalAkhir = quotation.harga_penawaran 
      ? Number(quotation.harga_penawaran) + Number(quotation.ongkos_kirim || 0) - Number(quotation.diskon || 0)
      : 0;
    const dpAmount = amount ? Number(amount) : Math.round(totalAkhir * 0.1);

    const dpData = {
      bank_name: bank_name || req.body.bank,
      account_number: account_number || req.body.no_rek,
      account_name: account_name || req.body.nama_pemilik || quotation.guest_name || quotation.nama_customer || '-',
      proof_url: proof_url,
      amount: dpAmount,
    };

    const affected = await quotationRepo.saveDPPayment(identifier, dpData);
    if (affected === 0) {
      return res.status(404).json({ success: false, message: 'Gagal memperbarui data pembayaran DP' });
    }

    res.status(200).json({
      success: true,
      message: 'Bukti pembayaran DP berhasil dikirim! Tim Sales kami akan memverifikasi pembayaran Anda.',
      data: {
        ...dpData,
        status: 'DP_DIBAYAR'
      }
    });
  } catch (error) {
    console.error('Error uploadDPProof:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memproses bukti pembayaran', error: error.message });
  }
};

module.exports = {
  createQuotation,
  getAllQuotations, 
  getById,           
  submitPenawaran,    
  reviewPenawaran,    
  createPaymentToken,
  updateStatusPesanan,
  submitChecklistPDI,
  createDeliveryOrder,
  receiveUnit,
  createGuestQuotation,
  trackQuotation,
  uploadDPProof,
};