const pdfService = require('../services/pdf.service');

const downloadSAWReport = async (req, res) => {
  try {
    // Memberi tahu browser/aplikasi bahwa file ini adalah PDF yang bisa di-download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Laporan_Rekomendasi_SAW.pdf');
    
    // Panggil service pembuat PDF
    await pdfService.generateSAWReport(res);
    
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = { downloadSAWReport };