const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const alatBeratRoutes = require('./routes/alatBerat.routes');
const sawRoutes = require('./routes/saw.routes');
const reportRoutes = require('./routes/report.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const quotationRoutes = require('./routes/quotation.routes');
const transactionRoutes = require('./routes/transaction.routes');
const auditRoutes = require('./routes/audit.routes'); 

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
app.use('/api/saw', sawRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/transaksi', transactionRoutes);
app.use('/api/audit', auditRoutes); 

module.exports = app;