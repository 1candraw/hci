const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotation.controller');
const { authenticate } = require('../middlewares/auth.middleware'); 
const upload = require('../middlewares/upload.middleware');

// POST ajukan pesanan baru (Endpoint: /api/quotations)
router.post('/', authenticate, quotationController.createQuotation);

// ★ PUBLIK: POST RFQ tamu tanpa login (Endpoint: /api/quotations/guest)
router.post('/guest', quotationController.createGuestQuotation);

// ★ PUBLIK: GET lacak pesanan by nomor (Endpoint: /api/quotations/track/:nomor)
router.get('/track/:nomor', quotationController.trackQuotation);

// ★ PUBLIK / USER: Upload bukti bayar DP (support ID atau nomor_pemesanan)
router.post('/:identifier/upload-dp', upload.single('proof_file'), quotationController.uploadDPProof);

// GET ambil semua pesanan untuk tabel transaksi (Endpoint: /api/quotations)
router.get('/', authenticate, quotationController.getAllQuotations);

// GET ambil detail pesanan berdasarkan ID (Endpoint: /api/quotations/:id)
router.get('/:id', authenticate, quotationController.getById);

// +++ TAMBAHAN: PUT submit penawaran oleh Sales +++
router.put('/:id/penawaran', authenticate, quotationController.submitPenawaran);

// PUT eksekusi dari Manager (Approve/Reject)
router.put('/:id/review', authenticate, quotationController.reviewPenawaran);

// POST request token Midtrans
router.post('/:id/pay-dp', authenticate, quotationController.createPaymentToken);

// PUT update status pesanan (fleksibel untuk berbagai tahapan)
router.put('/:id/status', authenticate, quotationController.updateStatusPesanan);

// POST submit form PDI oleh Operasional
router.post('/:id/pdi', authenticate, quotationController.submitChecklistPDI);

// POST terbitkan surat jalan oleh Operasional
router.post('/:id/delivery', authenticate, quotationController.createDeliveryOrder);

// PUT konfirmasi penerimaan unit oleh Customer / Guest (support ID atau Nomor Pemesanan)
router.put('/:id/receive', quotationController.receiveUnit);

module.exports = router;