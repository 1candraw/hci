const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotation.controller');
const { authenticate } = require('../middlewares/auth.middleware'); 

// POST ajukan pesanan baru (Endpoint: /api/quotations)
router.post('/', authenticate, quotationController.createQuotation);

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

module.exports = router;