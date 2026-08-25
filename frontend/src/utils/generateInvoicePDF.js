import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Format angka ke format Rupiah standar Indonesia
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
 * Utility untuk menghasilkan Dokumen Resmi Invoice Pembayaran PDF (Cash & Credit 5 Tahun)
 * @param {Object} data - Objek pesanan/quotation dari backend
 */
export const generateInvoicePDF = (data) => {
  if (!data) {
    alert('Data transaksi tidak valid untuk menerbitkan invoice.');
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
    'Finance & Billing: +62 812-6892-0766  |  Email: finance@heavycare.id',
    'Website: www.heavycare.id  |  Faktur & Tanda Terima Pembayaran Resmi',
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
  // 2. JUDUL DOKUMEN & METADATA INVOICE
  // ═══════════════════════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(13, 20, 30);
  doc.text('INVOICE RESMI PEMBAYARAN UNIT', pageWidth / 2, 38, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('COMMERCIAL TAX INVOICE & OFFICIAL RECEIPT', pageWidth / 2, 42.5, { align: 'center' });

  // Box Metadata (Nomor Invoice, Tanggal, No SPH, Status Bayar)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, 46, contentWidth, 24, 2, 2, 'FD');

  const nomorDokumen = data.nomor_pemesanan || (data.id ? `PO-${data.id}` : 'HC-2026-XXXX');
  const nomorInvoice = `INV/${nomorDokumen}`;
  const nomorSPH = `SPH/${nomorDokumen}`;

  const isCredit = (data.metode_pembayaran === 'credit' || data.metode_pembayaran === 'kredit' || data.metode_pembayaran === 'leasing');
  const labelMetode = isCredit ? 'KREDIT (ANGSURAN 5 TAHUN / 60 BULAN)' : 'CASH / TUNAI (PELUNASAN 100%)';

  const payDate = data.dp_paid_at ? new Date(data.dp_paid_at) : (data.created_at ? new Date(data.created_at) : new Date());
  const tanggalInvoice = payDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Kolom Kiri Box Metadata
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('NOMOR INVOICE', marginX + 4, 52);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${nomorInvoice}`, marginX + 34, 52);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TANGGAL INVOICE', marginX + 4, 58);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${tanggalInvoice}`, marginX + 34, 58);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('NO. REFERENSI SPH', marginX + 4, 64);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${nomorSPH}`, marginX + 34, 64);

  // Kolom Kanan Box Metadata
  const colRightX = marginX + 102;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('STATUS PEMBAYARAN', colRightX, 52);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 128, 61);
  doc.text(`: ${isCredit ? 'UANG MUKA TERBAYAR (VALID)' : 'LUNAS 100% (PAID IN FULL)'}`, colRightX + 36, 52);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('SKEMA PEMBAYARAN', colRightX, 58);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${labelMetode}`, colRightX + 36, 58);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('VERIFIKASI FINANCE', colRightX, 64);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${data.nama_sales || 'Sales & Finance'} (Verified)`, colRightX + 36, 64);

  // ═══════════════════════════════════════════════════════════════
  // 3. INFORMASI CUSTOMER / PERUSAHAAN PEMESAN
  // ═══════════════════════════════════════════════════════════════
  const custBoxY = 74;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(13, 20, 30);
  doc.text('TAGIHAN DITUJUKAN KEPADA (BILLED TO):', marginX, custBoxY);

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
  doc.text(`Lokasi Site Proyek / Pengiriman Unit: ${lokasi}`, marginX, custBoxY + 15);

  // Kata Pengantar
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const introText = isCredit
    ? 'Faktur/Invoice ini diterbitkan sebagai bukti sah penerimaan Pembayaran Awal (Uang Muka 20%) pembiayaan kredit unit alat berat. Rincian kewajiban keuangan dan jadwal angsuran diuraikan sebagai berikut:'
    : 'Faktur/Invoice ini diterbitkan sebagai bukti sah penerimaan Pembayaran Lunas (Cash 100%) atas pengadaan unit alat berat baru dengan rincian pelunasan keuangan sebagai berikut:';
  const splitIntro = doc.splitTextToSize(introText, contentWidth);
  doc.text(splitIntro, marginX, custBoxY + 21);

  // ═══════════════════════════════════════════════════════════════
  // 4. TABEL RINCIAN UNIT & PEMBAYARAN (autoTable)
  // ═══════════════════════════════════════════════════════════════
  const unitName = data.nama_alat || data.nama_unit || 'Excavator HeavyCare';
  const brand = data.brand_alat || data.brand || 'Excavator';
  const model = data.model_alat || data.model || '';
  const fullName = `${unitName} ${brand} ${model}`.trim();

  const hargaUnit = Number(data.harga_penawaran || 0);
  const ongkir = Number(data.ongkos_kirim || 0);
  const diskon = Number(data.diskon || 0);
  const grandTotal = Math.max(0, hargaUnit + ongkir - diskon);

  const uangMuka = isCredit ? Math.round(grandTotal * 0.2) : 0;
  const sisaPokok = isCredit ? Math.max(0, grandTotal - uangMuka) : 0;
  const tenorBulan = 60; // 5 Tahun
  const cicilanPerBulan = isCredit ? Math.round(sisaPokok / tenorBulan) : 0;
  const nominalBayarMasuk = Number(data.dp_amount || (isCredit ? uangMuka : grandTotal));

  // Spesifikasi singkat unit
  let specDetails = [];
  if (data.tenaga_mesin) specDetails.push(`Engine: ${data.tenaga_mesin} kW/HP`);
  if (data.kapasitas_bucket) specDetails.push(`Bucket: ${data.kapasitas_bucket} m³`);
  if (data.berat_operasional) specDetails.push(`Operating Weight: ${data.berat_operasional} kg`);
  if (data.kapasitas_ton) specDetails.push(`Class: ${data.kapasitas_ton} Ton`);
  const specString = specDetails.length > 0 ? `\nSpesifikasi: ${specDetails.join(' | ')}` : '';

  const tableBody = [
    [
      '1',
      `Unit Alat Berat:\n${fullName}${specString}\nKondisi: Baru (Heavy Duty PDI Standard)`,
      '1 Unit',
      formatCurrencyIDR(hargaUnit),
      formatCurrencyIDR(hargaUnit),
    ],
    [
      '',
      'Ongkos Kirim & Mobilisasi Trailer Ekspedisi ke Lokasi Site\nTermasuk Asuransi Logistik Perjalanan',
      '1 Paket',
      formatCurrencyIDR(ongkir),
      formatCurrencyIDR(ongkir),
    ],
  ];

  if (diskon > 0) {
    tableBody.push([
      '',
      'Potongan Diskon Program Pengadaan Khusus',
      '-',
      `- ${formatCurrencyIDR(diskon)}`,
      `- ${formatCurrencyIDR(diskon)}`,
    ]);
  }

  // Footer tabel terpisah untuk skema kredit vs cash
  const tableFoot = isCredit
    ? [
        [
          { content: 'TOTAL NILAI TRANSAKSI (GRAND TOTAL OTR)', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fontSize: 8.5 } },
          { content: formatCurrencyIDR(grandTotal), colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fontSize: 9, textColor: [15, 23, 42] } },
        ],
        [
          { content: 'PEMBAYARAN AWAL / UANG MUKA (20%) - DITERIMA & LUNAS TAHAP 1', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fontSize: 8.5, textColor: [21, 128, 61] } },
          { content: formatCurrencyIDR(nominalBayarMasuk), colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fontSize: 9.5, textColor: [21, 128, 61] } },
        ],
        [
          { content: 'Sisa Pokok Pembiayaan Kredit (80%)', colSpan: 3, styles: { halign: 'right', fontStyle: 'normal', fontSize: 8 } },
          { content: formatCurrencyIDR(sisaPokok), colSpan: 2, styles: { halign: 'right', fontStyle: 'normal', fontSize: 8 } },
        ],
        [
          { content: 'Skema Angsuran Bulanan (Tenor 5 Tahun / 60 Bulan)', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fontSize: 8.5, textColor: [180, 83, 9] } },
          { content: `${formatCurrencyIDR(cicilanPerBulan)} / bulan`, colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fontSize: 9, textColor: [180, 83, 9] } },
        ],
      ]
    : [
        [
          { content: 'TOTAL NILAI TRANSAKSI (GRAND TOTAL OTR)', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fontSize: 8.5 } },
          { content: formatCurrencyIDR(grandTotal), colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fontSize: 9, textColor: [15, 23, 42] } },
        ],
        [
          { content: 'TOTAL NOMINAL PELUNASAN (CASH 100%) - DITERIMA LUNAS', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fontSize: 8.5, textColor: [21, 128, 61] } },
          { content: formatCurrencyIDR(nominalBayarMasuk), colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fontSize: 9.5, textColor: [21, 128, 61] } },
        ],
        [
          { content: 'Sisa Saldo Pembayaran Unit', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fontSize: 8.5, textColor: [21, 128, 61] } },
          { content: 'Rp 0 (LUNAS PENUH)', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fontSize: 8.5, textColor: [21, 128, 61] } },
        ],
      ];

  autoTable(doc, {
    startY: custBoxY + 30,
    margin: { left: marginX, right: marginX },
    head: [['No', 'Deskripsi Unit & Rincian Transaksi', 'Qty', 'Harga Satuan', 'Subtotal']],
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
      cellPadding: 2.8,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 86 },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 34, halign: 'right' },
      4: { cellWidth: 34, halign: 'right' },
    },
    foot: tableFoot,
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
    },
  });

  const finalTableY = doc.lastAutoTable.finalY || 155;

  // ═══════════════════════════════════════════════════════════════
  // 5. RINCIAN MUTASI PEMBAYARAN MASUK
  // ═══════════════════════════════════════════════════════════════
  const payInfoY = finalTableY + 4;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(marginX, payInfoY, contentWidth, 18, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(21, 128, 61);
  doc.text('RINCIAN VALIDASI MUTASI DANA DITERIMA (PAYMENT SETTLEMENT LOG):', marginX + 3, payInfoY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);

  const bankPengirim = data.dp_bank_name || 'Bank Transfer';
  const rekPengirim = data.dp_account_number || '-';
  const anPengirim = data.dp_account_name || namaPIC || '-';
  const waktuBayar = data.dp_paid_at ? new Date(data.dp_paid_at).toLocaleString('id-ID') : tanggalInvoice;

  doc.text(`• Rekening Pengirim : ${bankPengirim} (${rekPengirim}) a/n ${anPengirim}`, marginX + 3, payInfoY + 9);
  doc.text(`• Rekening Tujuan   : Bank Central Asia (BCA) 1234-5678-90 a/n PT Heavy Care Indonesia`, marginX + 3, payInfoY + 13);
  doc.text(`• Nominal & Waktu   : ${formatCurrencyIDR(nominalBayarMasuk)} | Tanggal Mutasi: ${waktuBayar}`, marginX + 3, payInfoY + 16.5);

  // ═══════════════════════════════════════════════════════════════
  // 6. SYARAT & KETENTUAN INVOICE (Terms of Settlement)
  // ═══════════════════════════════════════════════════════════════
  const termsY = payInfoY + 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(13, 20, 30);
  doc.text('CATATAN & KETENTUAN FAKTUR RESMI (SETTLEMENT POLICY):', marginX, termsY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  const invoiceTerms = isCredit
    ? [
        `1. Faktur ini merupakan bukti penerimaan sah Uang Muka (20%) sebesar ${formatCurrencyIDR(nominalBayarMasuk)} untuk pengadaan unit alat berat.`,
        `2. Sisa pokok pembiayaan sebesar ${formatCurrencyIDR(sisaPokok)} diangsur berkala Rp ${formatCurrencyIDR(cicilanPerBulan)} / bulan selama 60 bulan (5 tahun) setiap tanggal 10.`,
        '3. Unit memasuki tahapan inspeksi PDI 6 titik uji teknis dan penerbitan Surat Perintah Kerja Logistik Trailer.',
        '4. Serah terima unit di lokasi proyek ditandai dengan Berita Acara Serah Terima (BAST) resmi dan aktivasi garansi HeavyCare 1 Tahun / 2000 Jam Kerja.',
      ]
    : [
        `1. Faktur ini merupakan bukti sah Pelunasan Penuh (100% Cash Settlement) sebesar ${formatCurrencyIDR(nominalBayarMasuk)} tanpa beban cicilan/bunga.`,
        '2. Pihak pembeli telah menyelesaikan seluruh kewajiban pembayaran unit alat berat dan mobilisasi armada ekspedisi.',
        '3. Unit segera diproses inspeksi teknis PDI dan diberangkatkan dengan surat jalan resmi menuju lokasi proyek.',
        '4. Serah terima unit di lokasi proyek ditandai dengan Berita Acara Serah Terima (BAST) resmi dan aktivasi garansi HeavyCare 1 Tahun / 2000 Jam Kerja.',
      ];

  let currentTermY = termsY + 4;
  invoiceTerms.forEach((term) => {
    const splitTerm = doc.splitTextToSize(term, contentWidth);
    doc.text(splitTerm, marginX, currentTermY);
    currentTermY += splitTerm.length * 3.3;
  });

  // ═══════════════════════════════════════════════════════════════
  // 7. LEMBAR PENGESAHAN & TANDA TANGAN DIGITAL
  // ═══════════════════════════════════════════════════════════════
  const signY = Math.max(currentTermY + 3, 238);

  // Box Finance & Accounting
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Diverifikasi & Divalidasi Oleh:', marginX + 10, signY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(13, 20, 30);
  doc.text('FINANCE & BILLING DEPT', marginX + 10, signY + 4);

  // Digital Signature badge Finance
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(marginX + 10, signY + 7, 50, 14, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(21, 128, 61);
  doc.text('✓ PAYMENT VERIFIED', marginX + 14, signY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Finance & Treasury Officer', marginX + 14, signY + 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(13, 20, 30);
  doc.text(`( ${data.nama_sales || 'Finance Treasury Team'} )`, marginX + 10, signY + 27);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('PT Heavy Care Indonesia', marginX + 10, signY + 31);

  // Box Disahkan Oleh (Manager)
  const mgrSignX = pageWidth - marginX - 65;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Disetujui & Diterbitkan Oleh:', mgrSignX, signY);

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
  doc.text('✓ AUTHORIZED INVOICE', mgrSignX + 4, signY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text(data.nama_manager || 'Branch Commercial Manager', mgrSignX + 4, signY + 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(13, 20, 30);
  doc.text(`( ${data.nama_manager || 'Dimas - Branch Manager'} )`, mgrSignX, signY + 27);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('PT Heavy Care Indonesia', mgrSignX, signY + 31);

  // ═══════════════════════════════════════════════════════════════
  // 8. FOOTER PAGE
  // ═══════════════════════════════════════════════════════════════
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  const footerNote = `Dokumen Invoice & Bukti Pembayaran Resmi ini dihasilkan secara otomatis oleh Sistem HeavyCare.id pada ${new Date().toLocaleString('id-ID')} | Ref ID: ${nomorDokumen}`;
  doc.text(footerNote, pageWidth / 2, 287, { align: 'center' });

  // Save Document
  const sanitizedFilename = `Invoice_Resmi_${nomorDokumen.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
  doc.save(sanitizedFilename);
};
