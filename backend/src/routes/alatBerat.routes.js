const express = require('express');
const router = express.Router();
const alatBeratController = require('../controllers/alatBerat.controller');

// Asumsi kamu punya middleware otentikasi untuk mengecek token JWT
// Ganti path-nya jika middleware-mu ada di folder lain
const { authenticate } = require('../middlewares/auth.middleware'); 

// GET semua data (bisa diakses publik atau harus login, sesuaikan kebutuhan)
router.get('/', authenticate, alatBeratController.getAlatBerat);

// POST tambah data (Wajib login agar ketahuan siapa yang input)
router.post('/', authenticate, alatBeratController.addAlatBerat);

// PUT persetujuan Manager (Hanya bisa diakses jika login)
router.put('/approve/:id', authenticate, alatBeratController.approveAlatBerat);

module.exports = router;