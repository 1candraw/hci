import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Format angka ke Rupiah standar Indonesia
 */
export const formatCurrencyIDR = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

/**
 * Utility untuk menghasilkan Dokumen Resmi Surat Penawaran Harga (SPH) PDF
 * @param {Object} data - Objek pesanan/quotation dari backend
 */
export const generateQuotationPDF = (data) => {
  if (!data) {
    alert('Data penawaran tidak valid.');
    return;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm

  // ═══════════════════════════════════════════════════════════════
  // 1. KOP SURAT RESMI HEAVYCARE.ID (Modern Industrial Header)
  // ═══════════════════════════════════════════════════════════════
  // Top Accent Bar (Heavy Green & Dark Slate)
  doc.setFillColor(13, 20, 30); // #0d141e
  doc.rect(0, 0, pageWidth, 5, 'F');
  doc.setFillColor(116, 192, 44); // #74c02c
  doc.rect(0, 5, pageWidth, 2, 'F');

  // Company Name & Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(13, 20, 30);
  doc.text('HEAVYCARE.ID', marginX, 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(116, 192, 44);
  doc.text('PT HEAVY CARE INDONESIA', marginX, 23);

  // Address & Contact Information (Right Aligned in Header)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const contactLines = [
    'Head Office: Kawasan Industri Terpadu, Gedung HeavyCare Hub Kav. 88, Jakarta',
    'WhatsApp / Hotline: +62 812-6892-0766  |  Email: sales@heavycare.id',
    'Website: www.heavycare.id  |  Layanan Purna Jual & Distribusi Nasional',
  ];
  let headerY = 16;
  contactLines.forEach((line) => {
    doc.text(line, pageWidth - marginX, headerY, { align: 'right' });
    headerY += 4;
  });

  // Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.6);
  doc.line(marginX, 30, pageWidth - marginX, 30);

  // ═══════════════════════════════════════════════════════════════
  // 2. JUDUL DOKUMEN & METADATA PENAWARAN
  // ═══════════════════════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(13, 20, 30);
  doc.text('SURAT PENAWARAN HARGA ALAT BERAT', pageWidth / 2, 38, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('OFFICIAL COMMERCIAL QUOTATION & FLEET PROPOSAL', pageWidth / 2, 42.5, { align: 'center' });

  // Box Metadata (Nomor SPH, Tanggal, Masa Berlaku, Status)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, 46, contentWidth, 24, 2, 2, 'FD');

  const nomorDokumen = data.nomor_pemesanan || (data.id ? `QO-${data.id}` : 'HC-2026-XXXX');
  const nomorSPH = `SPH/${nomorDokumen}`;
  
  const createdDate = data.created_at ? new Date(data.created_at) : new Date();
  const tanggalTerbit = createdDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const validUntil = new Date(createdDate.getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Kolom Kiri Box Metadata
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('NOMOR SURAT', marginX + 4, 52);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${nomorSPH}`, marginX + 32, 52);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TANGGAL TERBIT', marginX + 4, 58);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${tanggalTerbit}`, marginX + 32, 58);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('MASA BERLAKU', marginX + 4, 64);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(13, 20, 30);
  doc.text(`: 14 Hari Kalender (s/d ${validUntil})`, marginX + 32, 64);

  // Kolom Kanan Box Metadata
  const colRightX = marginX + 105;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('STATUS DOKUMEN', colRightX, 52);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 128, 61);
  doc.text(': DISETUJUI MANAJEMEN (VALID)', colRightX + 34, 52);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('METODE BAYAR', colRightX, 58);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${(data.metode_pembayaran || 'CASH').toUpperCase()}`, colRightX + 34, 58);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('VERIFIKASI MANAGER', colRightX, 64);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${data.nama_manager || 'Branch Manager'} (Verified)`, colRightX + 34, 64);

  // ═══════════════════════════════════════════════════════════════
  // 3. INFORMASI CUSTOMER / PERUSAHAAN PEMESAN
  // ═══════════════════════════════════════════════════════════════
  const custBoxY = 74;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(13, 20, 30);
  doc.text('KEPADA YTH.', marginX, custBoxY);

  const namaPerusahaan = data.perusahaan || data.guest_company || data.nama_customer || 'Bapak/Ibu Pimpinan Perusahaan';
  const namaPIC = data.guest_name || data.nama_customer || data.user_fullname || '-';
  const telepon = data.guest_phone || data.phone_customer || data.telepon_perusahaan || '-';
  const email = data.guest_email || data.email_customer || data.email_perusahaan || '-';
  const lokasi = data.guest_location || data.destination || data.catatan || 'Lokasi Site Proyek Pemesan';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(namaPerusahaan, marginX, custBoxY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Attn: ${namaPIC}  |  Telp/WhatsApp: ${telepon}  |  Email: ${email}`, marginX, custBoxY + 10.5);
  doc.text(`Lokasi Proyek / Pengiriman: ${lokasi}`, marginX, custBoxY + 15);

  // Kata Pengantar
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const introText = 'Dengan hormat, menindaklanjuti permintaan pengadaan alat berat Anda, bersama ini kami sampaikan rincian penawaran harga resmi (commercial quotation) untuk unit excavator dengan spesifikasi teknis dan paket layanan sebagai berikut:';
  const splitIntro = doc.splitTextToSize(introText, contentWidth);
  doc.text(splitIntro, marginX, custBoxY + 21);

  // ═══════════════════════════════════════════════════════════════
  // 4. TABEL RINCIAN UNIT & HARGA PENAWARAN (autoTable)
  // ═══════════════════════════════════════════════════════════════
  const unitName = data.nama_alat || data.nama_unit || 'Excavator HeavyCare';
  const brand = data.brand_alat || data.brand || 'Excavator';
  const model = data.model_alat || data.model || '';
  const fullName = `${unitName} ${brand} ${model}`.trim();

  const hargaUnit = Number(data.harga_penawaran || 0);
  const ongkir = Number(data.ongkos_kirim || 0);
  const diskon = Number(data.diskon || 0);
  const grandTotal = Math.max(0, hargaUnit + ongkir - diskon);
  const kewajibanDP = Math.round(grandTotal * 0.1);

  // Spesifikasi singkat unit jika ada
  let specDetails = [];
  if (data.tenaga_mesin) specDetails.push(`Engine: ${data.tenaga_mesin} kW/HP`);
  if (data.kapasitas_bucket) specDetails.push(`Bucket: ${data.kapasitas_bucket} m³`);
  if (data.berat_operasional) specDetails.push(`Operating Weight: ${data.berat_operasional} kg`);
  if (data.kapasitas_ton) specDetails.push(`Class: ${data.kapasitas_ton} Ton`);
  const specString = specDetails.length > 0 ? `\nSpesifikasi: ${specDetails.join(' | ')}` : '';

  const tableBody = [
    [
      '1',
      `Unit Alat Berat:\n${fullName}${specString}\nKondisi: Baru / Siap Kerja (Ready Stock PDI Standard)`,
      '1 Unit',
      formatCurrencyIDR(hargaUnit),
      formatCurrencyIDR(hargaUnit),
    ],
    [
      '',
      'Ongkos Kirim & Mobilisasi Armada Trailer ke Site Proyek\nTermasuk Asuransi Perjalanan Logistik',
      '1 Paket',
      formatCurrencyIDR(ongkir),
      formatCurrencyIDR(ongkir),
    ],
  ];

  if (diskon > 0) {
    tableBody.push([
      '',
      'Potongan Program Diskon Khusus Pengadaan (Special Project Discount)',
      '-',
      `- ${formatCurrencyIDR(diskon)}`,
      `- ${formatCurrencyIDR(diskon)}`,
    ]);
  }

  autoTable(doc, {
    startY: custBoxY + 30,
    margin: { left: marginX, right: marginX },
    head: [['No', 'Deskripsi Unit & Rincian Pengadaan', 'Qty', 'Harga Satuan', 'Subtotal']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [13, 20, 30],
      textColor: [116, 192, 44],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 86 },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 34, halign: 'right' },
      4: { cellWidth: 34, halign: 'right' },
    },
    foot: [
      [
        { content: 'TOTAL NILAI TRANSAKSI (GRAND TOTAL OTR)', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fontSize: 9 } },
        { content: formatCurrencyIDR(grandTotal), colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fontSize: 9.5, textColor: [21, 128, 61] } },
      ],
      [
        { content: 'Kewajiban Pembayaran Uang Muka / DP 10% (Tahap 1)', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fontSize: 8.5, textColor: [180, 83, 9] } },
        { content: formatCurrencyIDR(kewajibanDP), colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fontSize: 9, textColor: [180, 83, 9] } },
      ],
    ],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
    },
  });

  const finalTableY = doc.lastAutoTable.finalY || 155;

  // ═══════════════════════════════════════════════════════════════
  // 5. KETENTUAN PEMBAYARAN & SYARAT KONTRAK (Terms & Conditions)
  // ═══════════════════════════════════════════════════════════════
  const termsY = finalTableY + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(13, 20, 30);
  doc.text('SYARAT & KETENTUAN TRANSAKSI (TERMS & CONDITIONS):', marginX, termsY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(71, 85, 105);

  const terms = [
    `1. Pembayaran DP (10%) sebesar ${formatCurrencyIDR(kewajibanDP)} dilakukan ke Rekening Resmi: BCA 1234-5678-90 a/n PT Heavy Care Indonesia.`,
    '2. Bukti pembayaran DP wajib diunggah pada portal "Lacak Status Pesanan" untuk verifikasi otomatis oleh Tim Sales & Finance.',
    '3. Pre-Delivery Inspection (PDI) 6 titik uji (Mesin, Hidrolik, Bucket, Bodi, Undercarriage, Aksesoris) dilakukan segera setelah DP terverifikasi.',
    '4. Surat Jalan & Armada Trailer pengiriman unit diterbitkan maksimal 2-3 hari kerja setelah inspeksi PDI dinyatakan lolos.',
    '5. Serah terima unit di lokasi proyek ditandai dengan Berita Acara Serah Terima (BAST) resmi dan aktivasi garansi servis HeavyCare 1 Tahun / 2000 Jam Kerja.',
  ];

  let currentTermY = termsY + 4;
  terms.forEach((term) => {
    const splitTerm = doc.splitTextToSize(term, contentWidth);
    doc.text(splitTerm, marginX, currentTermY);
    currentTermY += splitTerm.length * 3.5;
  });

  // ═══════════════════════════════════════════════════════════════
  // 6. LEMBAR PENGESAHAN & TANDA TANGAN DIGITAL
  // ═══════════════════════════════════════════════════════════════
  const signY = Math.max(currentTermY + 4, 236);

  // Box Disiapkan Oleh (Sales)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Dibuat & Diajukan Oleh:', marginX + 10, signY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(13, 20, 30);
  doc.text('TIM SALES COMMERCIAL', marginX + 10, signY + 4);

  // Digital Signature badge Sales
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(marginX + 10, signY + 7, 50, 14, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(21, 128, 61);
  doc.text('✓ DIGITALLY SUBMITTED', marginX + 14, signY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text(data.nama_sales || 'Sales Engineer HeavyCare', marginX + 14, signY + 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(13, 20, 30);
  doc.text(`( ${data.nama_sales || 'Sales Commercial Specialist'} )`, marginX + 10, signY + 27);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('PT Heavy Care Indonesia', marginX + 10, signY + 31);

  // Box Disetujui Oleh (Manager)
  const mgrSignX = pageWidth - marginX - 65;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Disetujui & Disahkan Oleh:', mgrSignX, signY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(13, 20, 30);
  doc.text('BRANCH & COMMERCIAL MANAGER', mgrSignX, signY + 4);

  // Digital Signature badge Manager
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(mgrSignX, signY + 7, 52, 14, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text('✓ APPROVED & AUTHORIZED', mgrSignX + 4, signY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text(data.nama_manager || 'Dimas (Manager Sales)', mgrSignX + 4, signY + 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(13, 20, 30);
  doc.text(`( ${data.nama_manager || 'Dimas - Branch Manager'} )`, mgrSignX, signY + 27);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('PT Heavy Care Indonesia', mgrSignX, signY + 31);

  // ═══════════════════════════════════════════════════════════════
  // 7. FOOTER PAGE
  // ═══════════════════════════════════════════════════════════════
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  const footerNote = `Surat Penawaran Resmi ini dihasilkan secara otomatis oleh Sistem HeavyCare.id pada ${new Date().toLocaleString('id-ID')} | Ref ID: ${nomorDokumen}`;
  doc.text(footerNote, pageWidth / 2, 287, { align: 'center' });

  // Save Document
  const sanitizedFilename = `Surat_Penawaran_${nomorDokumen.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
  doc.save(sanitizedFilename);
};
