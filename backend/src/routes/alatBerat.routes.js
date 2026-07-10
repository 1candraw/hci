const express = require('express');
const router = express.Router();

// 1. Controller
const alatBeratController = require('../controllers/alatBerat.controller');

// 2. Middleware Auth (Pastikan ini hanya dipanggil satu kali)
const { authenticate } = require('../middlewares/auth.middleware'); 

// 3. Middleware Multer (Untuk Upload Gambar)
const upload = require('../middlewares/upload.middleware');

// --- DAFTAR ROUTING ---

// GET semua data
router.get('/', authenticate, alatBeratController.getAlatBerat);

// POST tambah data (Sisipkan upload.single('imageFile') untuk menangkap gambar)
router.post('/', authenticate, upload.single('imageFile'), alatBeratController.addAlatBerat);

// PUT ubah data (Membutuhkan upload.single untuk berjaga-jaga jika gambar ikut diedit)
router.put('/:id', authenticate, upload.single('imageFile'), alatBeratController.updateAlatBerat);

// DELETE hapus data
router.delete('/:id', authenticate, alatBeratController.deleteAlatBerat);

// PUT persetujuan Manager (Approve)
router.put('/approve/:id', authenticate, alatBeratController.approveAlatBerat);

module.exports = router;