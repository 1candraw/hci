const PDFDocument = require('pdfkit-table');
const sawService = require('./saw.service'); // Kita pinjam fungsi SAW yang sudah ada

const generateSAWReport = async (res) => {
  // 1. Inisialisasi Dokumen PDF (Ukuran A4)
  const doc = new PDFDocument({ margin: 30, size: 'A4' });

  // 2. Alirkan (pipe) output PDF langsung ke response HTTP (ke Postman/Browser)
  doc.pipe(res);

  // 3. Tambahkan Kop Surat / Judul
  doc.fontSize(16).font('Helvetica-Bold').text('LAPORAN REKOMENDASI ALAT BERAT', { align: 'center' });
  doc.fontSize(12).font('Helvetica').text('PT Transcon Indonesia (heavy care.id)', { align: 'center' });
  doc.moveDown(2); // Spasi enter 2 kali

  // 4. Ambil data hasil perhitungan SAW (gunakan bobot default)
  const sawData = await sawService.getRecommendations();
  const { rekomendasi } = sawData;

  // 5. Siapkan struktur tabel
  const table = {
    title: "Hasil Perangkingan Metode SAW",
    headers: [
      { label: "Peringkat", property: "peringkat", width: 60, renderer: null },
      { label: "Nama Alat / Model", property: "nama", width: 200, renderer: null },
      { label: "Brand", property: "brand", width: 100, renderer: null },
      { label: "Skor Akhir", property: "skor", width: 100, renderer: null }
    ],
    // Mapping data dari array rekomendasi ke dalam baris tabel
    rows: rekomendasi.map((item, index) => [
      (index + 1).toString(),
      item.name,
      item.brand,
      item.skor_akhir.toString()
    ]),
  };

  // 6. Gambar tabel ke dalam dokumen PDF
  await doc.table(table, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
    prepareRow: () => doc.font("Helvetica").fontSize(10)
  });

  // 7. Selesai dan tutup dokumen
  doc.end();
};

module.exports = { generateSAWReport };