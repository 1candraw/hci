const express = require('express');
const router = express.Router();
const stockRequestController = require('../controllers/stockRequest.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// GET daftar permohonan pending (Manager)
router.get('/pending', authenticate, stockRequestController.getPendingRequests);

// GET riwayat permohonan saya (Sales)
router.get('/my', authenticate, stockRequestController.getMyRequests);

// GET semua permohonan (Manager / Internal)
router.get('/', authenticate, stockRequestController.getAllRequests);

// POST buat permohonan penyesuaian stok baru (Sales)
router.post('/', authenticate, stockRequestController.createRequest);

// PUT persetujuan permohonan stok (Manager)
router.put('/:id/approve', authenticate, stockRequestController.approveRequest);

// PUT penolakan permohonan stok (Manager)
router.put('/:id/reject', authenticate, stockRequestController.rejectRequest);

module.exports = router;
