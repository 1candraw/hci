const express = require('express');
const router = express.Router();
const sawController = require('../controllers/saw.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Endpoint hitung SAW: POST http://localhost:5000/api/saw
router.post('/', authenticate, sawController.calculate);

module.exports = router;