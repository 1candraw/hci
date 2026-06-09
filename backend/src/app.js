const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const alatBeratRoutes = require('./routes/alatBerat.routes');

const app = express();

// Middleware dasar
app.use(cors()); // Mengizinkan React berkomunikasi dengan API ini
app.use(express.json()); // Agar bisa membaca format JSON dari request body
app.use(express.urlencoded({ extended: true })); // Untuk membaca form data

// Test Route dasar untuk memastikan API jalan
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Heavy Care ID API' });
});

// Nanti semua routes (auth, saw, transaksi) akan di-import di sini
app.use('/api/auth', authRoutes);
app.use('/api/alat-berat', alatBeratRoutes);

module.exports = app;