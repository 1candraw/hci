const express = require('express');
const router = express.Router();
const sawController = require('../controllers/saw.controller');

// Endpoint hitung SAW: POST http://localhost:5000/api/saw
// ★ Publik — bisa diakses tamu (landing page) maupun user login
router.post('/', sawController.calculate);

module.exports = router;