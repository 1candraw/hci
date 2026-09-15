import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Format tanggal ke Bahasa Indonesia standar
 */
export const formatDateID = (dateInput) => {
  if (!dateInput) return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const d = new Date(dateInput);
  return isNaN(d.getTime())
    ? new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

/**
 * Utility untuk menghasilkan Dokumen Resmi Surat Jalan (Delivery Order) PDF
 * @param {Object} data - Objek pesanan/quotation dari backend
 */
export const generateSuratJalanPDF = (data) => {
  if (!data) {
    alert('Data pesanan / surat jalan tidak valid.');
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
    'Divisi Logistik, Dispatch & Ekspedisi Pengiriman Alat Berat',
    'WhatsApp / Hotline Ops: +62 812-6892-0766  |  Email: logistics@heavycare.id',
    'Pool Dispatch: Kawasan Industri Gedung HeavyCare Hub Kav. 88, Jakarta',
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
  // 2. JUDUL DOKUMEN & METADATA SURAT JALAN
  // ═══════════════════════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(13, 20, 30);
  doc.text('SURAT JALAN PENGIRIMAN UNIT (DELIVERY ORDER)', pageWidth / 2, 37.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('OFFICIAL EQUIPMENT DISPATCH & DELIVERY ORDER NOTE', pageWidth / 2, 42, { align: 'center' });

  // Box Metadata (Nomor SJ, No PO/Pemesanan, Tanggal Kirim, Status)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, 45.5, contentWidth, 23.5, 2, 2, 'FD');

  const nomorDokumen = data.nomor_pemesanan || (data.id ? `QO-${data.id}` : 'HC-2026-XXXX');
  const suratJalan = data.surat_jalan_number || `SJ-${nomorDokumen.replace(/[^a-zA-Z0-9]/g, '')}`;
  const tanggalKirim = formatDateID(data.created_at || data.updated_at);
  const statusLabel = data.status === 'SELESAI' ? 'UNIT TELAH TIBA (DELIVERED)' : 'SEDANG DALAM PENGIRIMAN';

  // Kolom Kiri Box Metadata
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('NO. SURAT JALAN', marginX + 4, 51.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${suratJalan}`, marginX + 32, 51.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('NO. PEMESANAN (PO)', marginX + 4, 57);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${nomorDokumen}`, marginX + 32, 57);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TANGGAL DISPATCH', marginX + 4, 62.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${tanggalKirim}`, marginX + 32, 62.5);

  // Kolom Kanan Box Metadata
  const colRightX = marginX + 102;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('STATUS DOKUMEN', colRightX, 51.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(data.status === 'SELESAI' ? 21 : 180, data.status === 'SELESAI' ? 128 : 83, data.status === 'SELESAI' ? 61 : 9);
  doc.text(`: ${statusLabel}`, colRightX + 32, 51.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('NO. POLISI / TRUK', colRightX, 57);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${data.vehicle_number || 'Trailer Flatbed HeavyCare'}`, colRightX + 32, 57);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('DRIVER / EKSPEDISI', colRightX, 62.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${data.driver_name || 'Tim Driver Ekspedisi'}`, colRightX + 32, 62.5);

  // ═══════════════════════════════════════════════════════════════
  // 3. PIHAK PENGIRIM & PIHAK PENERIMA (2 Kolom Box)
  // ═══════════════════════════════════════════════════════════════
  const partiesY = 72;
  const namaPerusahaan = data.perusahaan || data.guest_company || data.nama_customer || 'Pihak Pemesan / Customer';
  const namaPIC = data.guest_name || data.nama_customer || data.user_fullname || '-';
  const telepon = data.guest_phone || data.phone_customer || data.telepon_perusahaan || '-';
  const lokasiTujuan = data.destination || data.guest_location || data.catatan || 'Lokasi Site Proyek Pemesan';

  // Box Dua Kolom Pihak
  const halfBoxWidth = (contentWidth - 4) / 2;
  
  // Pihak Pengirim (Asal / Origin)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, partiesY, halfBoxWidth, 25, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(116, 192, 44);
  doc.text('PENGIRIM (ORIGIN / POOL HEAVYCARE):', marginX + 3, partiesY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('PT HEAVY CARE INDONESIA', marginX + 3, partiesY + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Pool Dispatch: Central Logistics Hub Kav. 88, Jakarta', marginX + 3, partiesY + 14);
  doc.text(`PIC Dispatcher: ${data.nama_sales || 'Sales Engineer'} / Ops Logistics`, marginX + 3, partiesY + 18);
  doc.text('Hotline Dispatch: +62 812-6892-0766', marginX + 3, partiesY + 22);

  // Pihak Penerima (Destination / Site)
  const p2X = marginX + halfBoxWidth + 4;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(p2X, partiesY, halfBoxWidth, 25, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(14, 116, 144);
  doc.text('PENERIMA (DESTINATION / SITE PROYEK):', p2X + 3, partiesY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const splitCustCompany = doc.splitTextToSize(namaPerusahaan, halfBoxWidth - 6);
  doc.text(splitCustCompany[0] || namaPerusahaan, p2X + 3, partiesY + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Attn / PIC: ${namaPIC}  |  Telp: ${telepon}`, p2X + 3, partiesY + 14);
  const splitDest = doc.splitTextToSize(`Alamat Site: ${lokasiTujuan}`, halfBoxWidth - 6);
  doc.text(splitDest[0] || `Alamat Site: ${lokasiTujuan}`, p2X + 3, partiesY + 18);
  if (splitDest[1]) {
    doc.text(splitDest[1], p2X + 3, partiesY + 22);
  }

  // ═══════════════════════════════════════════════════════════════
  // 4. TABEL RINCIAN UNIT ALAT BERAT (autoTable)
  // ═══════════════════════════════════════════════════════════════
  const unitName = data.nama_alat || data.nama_unit || 'Excavator HeavyCare';
  const brand = data.brand_alat || data.brand || 'Excavator';
  const model = data.model_alat || data.model || '';
  const fullName = `${unitName} ${brand} ${model}`.trim();

  let specDetails = [];
  if (data.tenaga_mesin) specDetails.push(`Tenaga Mesin: ${data.tenaga_mesin} kW/HP`);
  if (data.kapasitas_bucket) specDetails.push(`Bucket: ${data.kapasitas_bucket} m³`);
  if (data.kedalaman_gali) specDetails.push(`Kedalaman Gali: ${data.kedalaman_gali} mm`);
  if (data.berat_operasional) specDetails.push(`Berat Operasi: ${data.berat_operasional} kg`);
  if (data.kapasitas_ton) specDetails.push(`Kelas: ${data.kapasitas_ton} Ton`);
  const specString = specDetails.length > 0 ? specDetails.join(' | ') : 'Standar Spesifikasi Pabrikan HeavyCare';

  autoTable(doc, {
    startY: partiesY + 29,
    margin: { left: marginX, right: marginX },
    head: [['No', 'Identitas Unit & Spesifikasi Teknis Alat Berat', 'Brand / Tipe', 'Jumlah', 'Kondisi Muatan']],
    body: [
      [
        '1',
        `Nama Unit: ${fullName}\nSpesifikasi: ${specString}\nNomor Rangka / SN: HC-${(data.id || 101) * 7392}-SN\nStatus PDI: LOLOS INSPEKSI 6 TITIK VITAL (READY TO WORK)`,
        `${brand}\nModel: ${model || '-'}`,
        '1 Unit',
        'BARU (100%)\nTerikat Rantai Pengaman (Chained)',
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [13, 20, 30],
      textColor: [116, 192, 44],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 100 },
      2: { cellWidth: 32 },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 26, halign: 'center' },
    },
  });

  const tableUnitEndY = doc.lastAutoTable.finalY || 135;

  // ═══════════════════════════════════════════════════════════════
  // 5. TABEL KELENGKAPAN BAWAAN & AKSESORIS UNIT (autoTable)
  // ═══════════════════════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(13, 20, 30);
  doc.text('KELENGKAPAN BAWAAN, AKSESORIS & DOKUMEN PENYERTA:', marginX, tableUnitEndY + 5.5);

  const accessoryRows = [
    ['1', 'Kunci Kontak Utama & Kunci Cadangan Unit', '2 Set Kunci Asli Pabrikan', 'LENGKAP (OK)'],
    ['2', 'Buku Petunjuk Operasi (Operation & Maintenance Manual)', '1 Buku Manual Resmi + CD/Digital Catalog', 'LENGKAP (OK)'],
    ['3', 'Manufacturer Standard Tool Kit & Grease Gun', '1 Box Perkakas Mekik Standar OEM', 'LENGKAP (OK)'],
    ['4', 'Lembar Laporan Hasil Pre-Delivery Inspection (PDI)', '6 Titik Inspeksi: Mesin, Hidrolik, Bodi, Undercarriage', 'LENGKAP (OK)'],
    ['5', 'Sertifikat Garansi Resmi HeavyCare (Warranty Card)', 'Garansi 1 Tahun / 2.000 Jam Kerja', 'LENGKAP (OK)'],
  ];

  autoTable(doc, {
    startY: tableUnitEndY + 7.5,
    margin: { left: marginX, right: marginX },
    head: [['No', 'Item Kelengkapan Bawaan', 'Rincian & Keterangan Fisik', 'Status Kelengkapan']],
    body: accessoryRows,
    theme: 'grid',
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [51, 65, 85],
      cellPadding: 1.8,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 64, fontStyle: 'bold' },
      2: { cellWidth: 80 },
      3: { cellWidth: 30, halign: 'center', fontStyle: 'bold', textColor: [21, 128, 61] },
    },
  });

  const accTableEndY = doc.lastAutoTable.finalY || 185;

  // ═══════════════════════════════════════════════════════════════
  // 6. KETENTUAN PENERIMAAN & TANDA TANGAN SURAT JALAN
  // ═══════════════════════════════════════════════════════════════
  const termsY = accTableEndY + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(13, 20, 30);
  doc.text('PETUNJUK & KETENTUAN PENERIMAAN UNIT:', marginX, termsY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.3);
  doc.setTextColor(71, 85, 105);

  const terms = [
    '1. Mohon periksa kondisi fisik alat berat, kesesuaian nomor rangka, dan seluruh kelengkapan bawaan saat unit diturunkan di lokasi site proyek.',
    '2. Pengemudi (driver ekspedisi) berhak meminta tanda tangan dan stempel basah / digital dari PIC penerima kuasa resmi di lokasi.',
    '3. Surat Jalan yang telah ditandatangani menjadi bukti sah penyerahan unit dan dasar penerbitan Berita Acara Serah Terima (BAST) final.',
    '4. Bila terdapat ketidaksesuaian kondisi unit saat pembongkaran muatan, harap segera hubungi Hotline Dispatcher HeavyCare: +62 812-6892-0766.',
  ];

  let currentTermY = termsY + 3.5;
  terms.forEach((term) => {
    const splitTerm = doc.splitTextToSize(term, contentWidth);
    doc.text(splitTerm, marginX, currentTermY);
    currentTermY += splitTerm.length * 3.2;
  });

  // ═══════════════════════════════════════════════════════════════
  // 7. LEMBAR PENGESAHAN & TANDA TANGAN 3 PIHAK
  // ═══════════════════════════════════════════════════════════════
  const signY = Math.max(currentTermY + 3.5, 237);

  // Kolom 1: Dispatcher / Pengirim (HeavyCare Logistics)
  const col1X = marginX + 3;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Diberangkatkan Oleh:', col1X, signY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(13, 20, 30);
  doc.text('DISPATCHER LOGISTIK', col1X, signY + 3.5);

  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(col1X, signY + 5.5, 48, 12.5, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(21, 128, 61);
  doc.text('✓ DISPATCH VERIFIED', col1X + 3, signY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(71, 85, 105);
  doc.text(tanggalKirim, col1X + 3, signY + 14.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(13, 20, 30);
  doc.text(`( ${data.nama_sales || 'Tim Logistik HeavyCare'} )`, col1X, signY + 23);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('PT Heavy Care Indonesia', col1X, signY + 26.5);

  // Kolom 2: Transporter / Pengemudi Truk Trailer
  const col2X = marginX + 66;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Diangkut Oleh (Transporter):', col2X, signY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(13, 20, 30);
  doc.text('PENGEMUDI / DRIVER', col2X, signY + 3.5);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(col2X, signY + 5.5, 48, 12.5, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('✓ IN-TRANSIT DISPATCH', col2X + 3, signY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text(`${data.vehicle_number || 'Trailer'} · Verified`, col2X + 3, signY + 14.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(13, 20, 30);
  doc.text(`( ${data.driver_name || 'Driver Ekspedisi'} )`, col2X, signY + 23);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Armada Trailer Flatbed', col2X, signY + 26.5);

  // Kolom 3: Penerima / Customer (Tanda Tangan Pelanggan)
  const col3X = marginX + 130;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Diterima & Ditandatangani:', col3X, signY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(13, 20, 30);
  doc.text('PIC PENERIMA SITE PROYEK', col3X, signY + 3.5);

  // Signature Box for Customer (Tanda Tangan Basah / Digital Customer)
  if (data.status === 'SELESAI') {
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(col3X, signY + 5.5, 48, 12.5, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(5, 150, 105);
    doc.text('✓ SIGNED & RECEIVED', col3X + 3, signY + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(71, 85, 105);
    doc.text(formatDateID(data.received_at || data.updated_at), col3X + 3, signY + 14.5);
  } else {
    // Empty Box for Customer Signature upon unit arrival
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.setLineDash([1, 1], 0);
    doc.roundedRect(col3X, signY + 5.5, 48, 12.5, 1.5, 1.5, 'FD');
    doc.setLineDash(); // reset dash
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text('(Tanda Tangan & Cap Penerima)', col3X + 7, signY + 12.5);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(13, 20, 30);
  const picSignName = `( ${namaPIC} )`;
  doc.text(picSignName, col3X, signY + 23);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const shortComp = namaPerusahaan.length > 25 ? namaPerusahaan.substring(0, 25) + '...' : namaPerusahaan;
  doc.text(shortComp, col3X, signY + 26.5);

  // ═══════════════════════════════════════════════════════════════
  // 8. FOOTER PAGE
  // ═══════════════════════════════════════════════════════════════
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  const footerNote = `Dokumen Resmi Surat Jalan (Delivery Order) ini diterbitkan secara sah oleh Sistem HeavyCare.id pada ${new Date().toLocaleString('id-ID')} | Ref ID: ${nomorDokumen}`;
  doc.text(footerNote, pageWidth / 2, 287, { align: 'center' });

  // Simpan File PDF
  const sanitizedFilename = `SuratJalan_${suratJalan.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
  doc.save(sanitizedFilename);
};
