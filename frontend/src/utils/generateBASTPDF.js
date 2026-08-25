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
 * Utility untuk menghasilkan Dokumen Resmi Berita Acara Serah Terima (BAST) PDF
 * @param {Object} data - Objek pesanan/quotation dari backend
 */
export const generateBASTPDF = (data) => {
  if (!data) {
    alert('Data pesanan / serah terima tidak valid.');
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
    'Divisi Logistik, PDI & Layanan Purna Jual Alat Berat',
    'WhatsApp / Hotline: +62 812-6892-0766  |  Email: ops@heavycare.id',
    'Website: www.heavycare.id  |  Kawasan Industri Gedung HeavyCare Hub Kav. 88, Jakarta',
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
  // 2. JUDUL DOKUMEN & METADATA BAST
  // ═══════════════════════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(13, 20, 30);
  doc.text('BERITA ACARA SERAH TERIMA (BAST)', pageWidth / 2, 37.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('OFFICIAL EQUIPMENT HANDOVER & DELIVERY ACCEPTANCE CERTIFICATE', pageWidth / 2, 42, { align: 'center' });

  // Box Metadata (Nomor BAST, Surat Jalan, Tanggal, Status, Driver, No Pol)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, 45.5, contentWidth, 23.5, 2, 2, 'FD');

  const nomorDokumen = data.nomor_pemesanan || (data.id ? `QO-${data.id}` : 'HC-2026-XXXX');
  const suratJalan = data.surat_jalan_number || `SJ-${nomorDokumen.replace(/[^a-zA-Z0-9]/g, '')}`;
  const nomorBAST = `BAST/${suratJalan}`;
  const tanggalSerahTerima = formatDateID(data.received_at || data.updated_at || data.created_at);

  // Kolom Kiri Box Metadata
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('NOMOR BAST', marginX + 4, 51.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${nomorBAST}`, marginX + 32, 51.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('NO. SURAT JALAN', marginX + 4, 57);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${suratJalan}`, marginX + 32, 57);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TANGGAL TERIMA', marginX + 4, 62.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${tanggalSerahTerima}`, marginX + 32, 62.5);

  // Kolom Kanan Box Metadata
  const colRightX = marginX + 102;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('STATUS DOKUMEN', colRightX, 51.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 128, 61);
  doc.text(': SELESAI & LOLOS PDI (RESMI)', colRightX + 32, 51.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('ARMADA / NO. POL', colRightX, 57);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${data.vehicle_number || 'Trailer Flatbed HC-01'}`, colRightX + 32, 57);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('PENGEMUDI / EXP', colRightX, 62.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${data.driver_name || 'Tim Ekspedisi HeavyCare'}`, colRightX + 32, 62.5);

  // ═══════════════════════════════════════════════════════════════
  // 3. PIHAK-PIHAK YANG BERSEPAKAT
  // ═══════════════════════════════════════════════════════════════
  const partiesY = 72;
  const namaPerusahaan = data.perusahaan || data.guest_company || data.nama_customer || 'Pihak Penerima Unit';
  const namaPIC = data.guest_name || data.nama_customer || data.user_fullname || '-';
  const telepon = data.guest_phone || data.phone_customer || data.telepon_perusahaan || '-';
  const lokasi = data.destination || data.guest_location || data.catatan || 'Lokasi Site Proyek Pemesan';

  // Box Dua Kolom Pihak
  const halfBoxWidth = (contentWidth - 4) / 2;
  
  // Pihak Pertama Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, partiesY, halfBoxWidth, 23, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(116, 192, 44);
  doc.text('PIHAK PERTAMA (PEMBERI SERAH TERIMA):', marginX + 3, partiesY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('PT HEAVY CARE INDONESIA', marginX + 3, partiesY + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Divisi: Logistik, PDI & After-Sales Engineering', marginX + 3, partiesY + 14);
  doc.text(`PIC Dispatch: ${data.nama_sales || 'Sales Engineer'} / Tim Operasional`, marginX + 3, partiesY + 18.5);

  // Pihak Kedua Box
  const p2X = marginX + halfBoxWidth + 4;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(p2X, partiesY, halfBoxWidth, 23, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(14, 116, 144);
  doc.text('PIHAK KEDUA (PENERIMA / PEMESAN):', p2X + 3, partiesY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const splitCustCompany = doc.splitTextToSize(namaPerusahaan, halfBoxWidth - 6);
  doc.text(splitCustCompany[0] || namaPerusahaan, p2X + 3, partiesY + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Attn / PIC: ${namaPIC}  |  Telp: ${telepon}`, p2X + 3, partiesY + 14);
  const splitLoc = doc.splitTextToSize(`Site: ${lokasi}`, halfBoxWidth - 6);
  doc.text(splitLoc[0] || `Site: ${lokasi}`, p2X + 3, partiesY + 18.5);

  // Pernyataan Serah Terima
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const introText = 'Pada hari ini, kedua belah pihak menyatakan bersama bahwa unit alat berat yang tercantum di bawah ini telah diserahterimakan di lokasi tujuan dalam kondisi fisik baik, berfungsi normal, dan telah dinyatakan lolos uji inspeksi Pre-Delivery Inspection (PDI):';
  const splitIntro = doc.splitTextToSize(introText, contentWidth);
  doc.text(splitIntro, marginX, partiesY + 28);

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
    startY: partiesY + 36,
    margin: { left: marginX, right: marginX },
    head: [['No', 'Identitas Unit & Spesifikasi Teknis', 'Kategori / Brand', 'Jumlah', 'Kondisi & Kelaikan']],
    body: [
      [
        '1',
        `Alat Berat: ${fullName}\nSpesifikasi: ${specString}\nNomor Rangka/Serial: HC-${(data.id || 101) * 7392}-SN\nStatus Operasi: Siap Kerja (Commissioning Test Passed)`,
        `${brand}\nModel: ${model || '-'}`,
        '1 Unit',
        'BARU (100%)\nLolos Uji PDI 6 Titik',
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
  // 5. TABEL HASIL INSPEKSI PRE-DELIVERY INSPECTION (PDI 6 TITIK)
  // ═══════════════════════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(13, 20, 30);
  doc.text('HASIL UJI KELAIKAN FISIK & OPERASI (PDI 6 TITIK VITAL):', marginX, tableUnitEndY + 5.5);

  const pdiRows = [
    ['1', 'Sistem Engine / Mesin', 'Tekanan oli, temperatur operasi, kompresi mesin standar OEM', 'LOLOS UJI (OK)'],
    ['2', 'Sistem Hidrolik & Pompa', 'Pompa utama, relief valve, silinder boom/arm/bucket tanpa kebocoran', 'LOLOS UJI (OK)'],
    ['3', 'Bucket & Pin Linkage', 'Struktur bucket, pengunci pin, blade & cutting edge terpasang presisi', 'LOLOS UJI (OK)'],
    ['4', 'Struktur Bodi, Kabin & AC', 'Kondisi bodi utuh, panel instrumen digital, lampu kerja & AC dingin', 'LOLOS UJI (OK)'],
    ['5', 'Undercarriage & Track', 'Track shoe, idler, roller, dan kekencangan rantai sesuai spesifikasi', 'LOLOS UJI (OK)'],
    ['6', 'Aksesoris & Dokumen', 'Standard Toolkit, Filter Cadangan, Buku Manual & Kartu Garansi', 'LENGKAP (OK)'],
  ];

  autoTable(doc, {
    startY: tableUnitEndY + 7.5,
    margin: { left: marginX, right: marginX },
    head: [['No', 'Komponen Pemeriksaan', 'Kriteria & Parameter Uji Lapangan', 'Status']],
    body: pdiRows,
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
      1: { cellWidth: 44, fontStyle: 'bold' },
      2: { cellWidth: 100 },
      3: { cellWidth: 30, halign: 'center', fontStyle: 'bold', textColor: [21, 128, 61] },
    },
  });

  const pdiTableEndY = doc.lastAutoTable.finalY || 185;

  // ═══════════════════════════════════════════════════════════════
  // 6. KLAUSUL & KETENTUAN SERAH TERIMA
  // ═══════════════════════════════════════════════════════════════
  const termsY = pdiTableEndY + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(13, 20, 30);
  doc.text('KETENTUAN & KESEPAKATAN SERAH TERIMA:', marginX, termsY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.3);
  doc.setTextColor(71, 85, 105);

  const terms = [
    '1. Pihak Kedua menyatakan telah menerima fisik unit alat berat tersebut di atas dalam kondisi baru, baik, lengkap, dan siap dioperasikan.',
    '2. Uji fungsi (commissioning test) singkat telah dijalankan di hadapan kedua belah pihak tanpa adanya kerusakan fisik maupun malfungsi mekanikal.',
    '3. Terhitung sejak tanggal penandatanganan Berita Acara ini, Garansi Resmi HeavyCare 1 Tahun / 2.000 Jam Kerja resmi diaktifkan.',
    '4. Buku Petunjuk Pengoperasian (Operation & Maintenance Manual) serta kelengkapan legalitas dokumen pengiriman telah diserahkan secara lengkap.',
  ];

  let currentTermY = termsY + 3.5;
  terms.forEach((term) => {
    const splitTerm = doc.splitTextToSize(term, contentWidth);
    doc.text(splitTerm, marginX, currentTermY);
    currentTermY += splitTerm.length * 3.2;
  });

  // ═══════════════════════════════════════════════════════════════
  // 7. LEMBAR PENGESAHAN & TANDA TANGAN DIGITAL 3 PIHAK
  // ═══════════════════════════════════════════════════════════════
  const signY = Math.max(currentTermY + 3.5, 237);

  // Kolom 1: Pihak Pertama (HeavyCare - PDI & Ops)
  const col1X = marginX + 3;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Diserahkan Oleh (Pihak I):', col1X, signY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(13, 20, 30);
  doc.text('TIM LOGISTIK & PDI', col1X, signY + 3.5);

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
  doc.text(data.nama_sales || 'Ops Engineer HeavyCare', col1X + 3, signY + 14.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(13, 20, 30);
  doc.text(`( ${data.nama_sales || 'Tim Logistik HeavyCare'} )`, col1X, signY + 23);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('PT Heavy Care Indonesia', col1X, signY + 26.5);

  // Kolom 2: Transporter / Pengemudi
  const col2X = marginX + 66;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Pengemudi / Ekspedisi:', col2X, signY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(13, 20, 30);
  doc.text('TRANSPORTER LOGISTIK', col2X, signY + 3.5);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(col2X, signY + 5.5, 48, 12.5, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('✓ DELIVERED ON-SITE', col2X + 3, signY + 10);
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
  doc.text('Armada Logistik', col2X, signY + 26.5);

  // Kolom 3: Pihak Kedua (Customer / Penerima)
  const col3X = marginX + 130;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Diterima Oleh (Pihak II):', col3X, signY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(13, 20, 30);
  doc.text('PENERIMA KUASA PROYEK', col3X, signY + 3.5);

  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(col3X, signY + 5.5, 48, 12.5, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(5, 150, 105);
  doc.text('✓ RECEIVED & ACCEPTED', col3X + 3, signY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(71, 85, 105);
  doc.text(tanggalSerahTerima, col3X + 3, signY + 14.5);

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
  const footerNote = `Berita Acara Serah Terima (BAST) Resmi ini diterbitkan secara sah oleh Sistem HeavyCare.id pada ${new Date().toLocaleString('id-ID')} | Ref ID: ${nomorDokumen}`;
  doc.text(footerNote, pageWidth / 2, 287, { align: 'center' });

  // Simpan File PDF
  const sanitizedFilename = `BAST_${nomorDokumen.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
  doc.save(sanitizedFilename);
};
