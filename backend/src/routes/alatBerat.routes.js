const express = require('express');
const router = express.Router();
const alatBeratController = require('../controllers/alatBerat.controller');

// Import Middleware keamanan yang sudah kita buat sebelumnya
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// Endpoint melihat katalog (Terbuka untuk umum / tanpa middleware auth)
router.get('/', alatBeratController.getAll);

// Endpoint menambah katalog (HANYA untuk Sales dan Manager)
router.post(
  '/', 
  authenticate, 
  authorize(['Sales', 'Manager']), 
  alatBeratController.create
);

module.exports = router;