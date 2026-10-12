const PDFDocument = require('pdfkit-table');
const sawService = require('./saw.service'); // Kita pinjam fungsi SAW yang sudah ada

const generateSAWReport = async (res, options = {}) => {
  const { filterKapasitas } = options;

  // 1. Inisialisasi Dokumen PDF (Ukuran A4)
  const doc = new PDFDocument({ margin: 30, size: 'A4' });

  // 2. Alirkan (pipe) output PDF langsung ke response HTTP (ke Postman/Browser)
  doc.pipe(res);

  // 3. Tambahkan Kop Surat / Judul
  doc.fontSize(15).font('Helvetica-Bold').text('LAPORAN HASIL REKOMENDASI PERANGKINGAN SAW', { align: 'center' });
  doc.fontSize(11).font('Helvetica').text('PT HEAVY CARE INDONESIA (heavycare.id)', { align: 'center' });
  doc.fontSize(9).font('Helvetica-Oblique').text(`Kelas Kapasitas: ${filterKapasitas ? `${filterKapasitas} Ton` : 'Semua Kelas'} | SPK Simple Additive Weighting`, { align: 'center' });
  doc.moveDown(1.5); // Spasi enter

  // 4. Ambil data hasil perhitungan SAW (gunakan bobot default atau filter yang dikirim)
  const sawData = await sawService.getRecommendations({ filterKapasitas });
  const { rekomendasi } = sawData;

  // 5. Siapkan struktur tabel
  const table = {
    title: "Hasil Perangkingan Metode SAW",
    headers: [
      { label: "Peringkat", property: "peringkat", width: 55, renderer: null },
      { label: "Nama Alat / Model", property: "nama", width: 170, renderer: null },
      { label: "Brand", property: "brand", width: 85, renderer: null },
      { label: "Harga (Rp)", property: "harga", width: 110, renderer: null },
      { label: "Skor Akhir", property: "skor", width: 80, renderer: null }
    ],
    // Mapping data dari array rekomendasi ke dalam baris tabel
    rows: (rekomendasi || []).map((item, index) => [
      `#${index + 1}`,
      `${item.name || item.nama_unit || '-'}${item.model ? ` (${item.model})` : ''}`,
      item.brand || '-',
      item.harga ? `Rp ${Number(item.harga).toLocaleString('id-ID')}` : '-',
      Number(item.skor_akhir || 0).toFixed(4)
    ]),
  };

  // 6. Gambar tabel ke dalam dokumen PDF
  await doc.table(table, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
    prepareRow: () => doc.font("Helvetica").fontSize(9)
  });

  // 7. Selesai dan tutup dokumen
  doc.end();
};

module.exports = { generateSAWReport };