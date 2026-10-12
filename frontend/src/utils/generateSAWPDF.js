import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Format mata uang ke Rupiah standar Indonesia
 */
export const formatCurrencyIDR = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const getLabelKepentingan = (v) => {
  switch (Number(v)) {
    case 1: return '1 (Tidak Penting)';
    case 2: return '2 (Cukup Penting)';
    case 3: return '3 (Penting)';
    case 4: return '4 (Sangat Penting)';
    default: return `${v}`;
  }
};

const getScenarioLabel = (presetId) => {
  if (presetId === 'pertambangan') return 'Pertambangan (Fokus Tenaga Mesin & Bucket)';
  if (presetId === 'konstruksi') return 'Konstruksi (Fokus Stabilitas Berat & Bucket)';
  if (presetId === 'perkebunan') return 'Perkebunan (Fokus Kedalaman Gali & Efisiensi)';
  return 'Kustom / Konfigurasi Preferensi Proyek';
};

const getTonaseLabel = (ton) => {
  if (String(ton) === '5') return 'Kelas Mini (5 Ton)';
  if (String(ton) === '20') return 'Kelas Medium (20 Ton)';
  if (String(ton) === '30') return 'Kelas Heavy (30 Ton+)';
  return `Kelas ${ton} Ton`;
};

/**
 * Menghasilkan Dokumen PDF Resmi Hasil Perangkingan SAW
 * @param {Object} options
 * @param {Array} options.ranking - Hasil array unit rekomendasi SAW
 * @param {string|number} options.filterTonase - Kelas kapasitas / tonase unit
 * @param {Object} options.bobot - Nilai bobot kriteria (harga_weight, dll.)
 * @param {string} options.activePreset - ID skenario aktif bila ada
 * @param {Object} options.userInfo - Informasi pengguna bila login
 */
export const generateSAWPDF = ({
  ranking = [],
  filterTonase = '20',
  bobot = {},
  activePreset = null,
  userInfo = null,
}) => {
  if (!ranking || ranking.length === 0) {
    alert('Tidak ada data hasil perangkingan SAW untuk diekspor!');
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
  // 1. KOP SURAT RESMI HEAVYCARE.ID
  // ═══════════════════════════════════════════════════════════════
  // Top Accent Bar (Industrial Dark Slate & Heavy Green)
  doc.setFillColor(13, 20, 30); // #0d141e
  doc.rect(0, 0, pageWidth, 5, 'F');
  doc.setFillColor(116, 192, 44); // #74c02c
  doc.rect(0, 5, pageWidth, 2, 'F');

  // Brand & Company Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(13, 20, 30);
  doc.text('HEAVYCARE.ID', marginX, 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(116, 192, 44);
  doc.text('PT HEAVY CARE INDONESIA', marginX, 23);

  // Address & Contacts (Right Aligned)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const contactLines = [
    'Industrial Heavy Equipment Distribution & SPK Analytics',
    'Hotline: +62 812-6892-0766  |  Email: analytics@heavycare.id',
    'Website: www.heavycare.id  |  Kawasan Industri Terpadu, Jakarta',
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
  // 2. JUDUL DOKUMEN & SUBTITLE
  // ═══════════════════════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(13, 20, 30);
  doc.text('LAPORAN HASIL REKOMENDASI PERANGKINGAN SAW', pageWidth / 2, 38, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'SISTEM PENDUKUNG KEPUTUSAN (SIMPLE ADDITIVE WEIGHTING) PEMILIHAN UNIT ALAT BERAT',
    pageWidth / 2,
    42.5,
    { align: 'center' }
  );

  // ═══════════════════════════════════════════════════════════════
  // 3. BOX METADATA ANALISIS
  // ═══════════════════════════════════════════════════════════════
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, 46, contentWidth, 23, 2, 2, 'FD');

  const now = new Date();
  const tanggalCetak = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const waktuCetak = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const tonaseText = getTonaseLabel(filterTonase);
  const skenarioText = getScenarioLabel(activePreset);
  const userName = userInfo?.nama || userInfo?.name || userInfo?.email || 'Customer / Tamu';

  // Kolom Kiri
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('KELAS KAPASITAS', marginX + 4, 52);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${tonaseText}`, marginX + 36, 52);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('SKENARIO SEKTOR', marginX + 4, 58);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${skenarioText}`, marginX + 36, 58);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL ALTERNATIF', marginX + 4, 64);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${ranking.length} Unit Excavator Teranalisis`, marginX + 36, 64);

  // Kolom Kanan
  const colRightX = marginX + 102;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TANGGAL CETAK', colRightX, 52);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${tanggalCetak}, ${waktuCetak} WIB`, colRightX + 30, 52);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('ANALIS / PEMOHON', colRightX, 58);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(13, 20, 30);
  doc.text(`: ${userName}`, colRightX + 30, 58);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('STATUS ANALISIS', colRightX, 64);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 128, 61); // Green
  doc.text(': VALID & TERVERIFIKASI SPK', colRightX + 30, 64);

  // ═══════════════════════════════════════════════════════════════
  // 4. BOBOT PRIORITAS KRITERIA (PARAMETER SAW)
  // ═══════════════════════════════════════════════════════════════
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(marginX, 72, contentWidth, 21, 2, 2, 'FD');

  const hw = Number(bobot?.harga_weight || 2);
  const tmw = Number(bobot?.tenaga_mesin_weight || 2);
  const kbw = Number(bobot?.kapasitas_bucket_weight || 2);
  const kgw = Number(bobot?.kedalaman_gali_weight || 2);
  const bow = Number(bobot?.berat_operasional_weight || 2);
  const totalB = hw + tmw + kbw + kgw + bow || 10;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(13, 20, 30);
  doc.text('BOBOT KRITERIA PREFERENSI (SKALA 1 - 4 & PERSENTASE NORMALISASI):', marginX + 4, 77.5);

  const criteriaData = [
    { code: 'C1', name: 'Harga Beli (Cost)', val: hw, pct: ((hw / totalB) * 100).toFixed(0) },
    { code: 'C2', name: 'Tenaga Mesin (Benefit)', val: tmw, pct: ((tmw / totalB) * 100).toFixed(0) },
    { code: 'C3', name: 'Kapasitas Bucket (Benefit)', val: kbw, pct: ((kbw / totalB) * 100).toFixed(0) },
    { code: 'C4', name: 'Kedalaman Gali (Benefit)', val: kgw, pct: ((kgw / totalB) * 100).toFixed(0) },
    { code: 'C5', name: 'Berat Ops (Cost)', val: bow, pct: ((bow / totalB) * 100).toFixed(0) },
  ];

  const colWidthCrit = contentWidth / 5;
  criteriaData.forEach((c, idx) => {
    const itemX = marginX + idx * colWidthCrit + 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(13, 20, 30);
    doc.text(`${c.code}: ${c.name}`, itemX, 83);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(`Bobot: ${c.val}/4 (${c.pct}%)`, itemX, 88);
  });

  // ═══════════════════════════════════════════════════════════════
  // 5. HIGHLIGHT REKOMENDASI TERBAIK (PERINGKAT #1)
  // ═══════════════════════════════════════════════════════════════
  const topUnit = ranking[0];
  if (topUnit) {
    doc.setFillColor(236, 252, 203); // #ecfccb (soft lime)
    doc.setDrawColor(132, 204, 22);  // #84cc16
    doc.roundedRect(marginX, 96, contentWidth, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(21, 128, 61);
    doc.text('★ REKOMENDASI TERBAIK (PERINGKAT #1):', marginX + 4, 102);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(13, 20, 30);
    const topUnitName = `${topUnit.name || topUnit.nama_unit || 'Excavator Unit'} (${topUnit.brand || 'Heavy Machinery'})`;
    doc.text(topUnitName, marginX + 4, 108);

    // Kanan: Skor Akhir & Harga
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(13, 20, 30);
    const skorText = `SKOR AKHIR SAW: ${Number(topUnit.skor_akhir || 0).toFixed(4)}`;
    doc.text(skorText, pageWidth - marginX - 4, 102, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(21, 128, 61);
    const hargaTop = `Estimasi: ${formatCurrencyIDR(topUnit.harga)}`;
    doc.text(hargaTop, pageWidth - marginX - 4, 108, { align: 'right' });
  }

  // ═══════════════════════════════════════════════════════════════
  // 6. TABEL HASIL PERANGKINGAN SAW
  // ═══════════════════════════════════════════════════════════════
  const tableColumns = [
    { header: 'Rank', dataKey: 'rank' },
    { header: 'Nama Unit & Model', dataKey: 'unit' },
    { header: 'Merek', dataKey: 'brand' },
    { header: 'Estimasi Harga', dataKey: 'harga' },
    { header: 'Tenaga', dataKey: 'tenaga' },
    { header: 'Bucket', dataKey: 'bucket' },
    { header: 'Kedalaman', dataKey: 'kedalaman' },
    { header: 'Berat Ops', dataKey: 'berat' },
    { header: 'Skor SAW', dataKey: 'skor' },
    { header: 'Status Rekomendasi', dataKey: 'status' },
  ];

  const tableRows = ranking.map((item, index) => ({
    rank: `#${index + 1}`,
    unit: `${item.name || item.nama_unit || '-'}${item.model ? ` (${item.model})` : ''}`,
    brand: item.brand || '-',
    harga: formatCurrencyIDR(item.harga),
    tenaga: item.tenaga_mesin ? `${item.tenaga_mesin} HP` : '-',
    bucket: item.kapasitas_bucket ? `${item.kapasitas_bucket} m³` : '-',
    kedalaman: item.kedalaman_gali ? `${item.kedalaman_gali} mm` : '-',
    berat: item.berat_operasional ? `${Number(item.berat_operasional).toLocaleString('id-ID')} kg` : '-',
    skor: Number(item.skor_akhir || 0).toFixed(4),
    status: index === 0 ? 'Paling Unggul ★' : `Alternatif #${index + 1}`,
  }));

  autoTable(doc, {
    columns: tableColumns,
    body: tableRows,
    startY: 116,
    margin: { left: marginX, right: marginX },
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59],
      font: 'helvetica',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [13, 20, 30],
      textColor: [116, 192, 44],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
      cellPadding: 2.8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      rank: { halign: 'center', cellWidth: 12, fontStyle: 'bold' },
      unit: { cellWidth: 34, fontStyle: 'bold' },
      brand: { cellWidth: 18 },
      harga: { halign: 'right', cellWidth: 26, fontStyle: 'bold' },
      tenaga: { halign: 'center', cellWidth: 15 },
      bucket: { halign: 'center', cellWidth: 14 },
      kedalaman: { halign: 'center', cellWidth: 16 },
      berat: { halign: 'center', cellWidth: 16 },
      skor: { halign: 'center', cellWidth: 15, fontStyle: 'bold', textColor: [13, 20, 30] },
      status: { halign: 'center', cellWidth: 16, fontSize: 7 },
    },
    didParseCell: (data) => {
      // Highlight baris pertama (Rank 1)
      if (data.section === 'body' && data.row.index === 0) {
        data.cell.styles.fillColor = [240, 253, 244]; // Light green
        if (data.column.dataKey === 'skor' || data.column.dataKey === 'rank') {
          data.cell.styles.textColor = [21, 128, 61];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // ═══════════════════════════════════════════════════════════════
  // 7. CATATAN METODOLOGI & DISCLAIMER SPK
  // ═══════════════════════════════════════════════════════════════
  let currentY = doc.lastAutoTable.finalY + 6;

  // Jika sisa ruang di halaman ini kurang dari 45mm, tambahkan halaman baru
  if (currentY + 45 > 280) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, currentY, contentWidth, 18, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(13, 20, 30);
  doc.text('CATATAN METODOLOGI PERHITUNGAN SIMPLE ADDITIVE WEIGHTING (SAW):', marginX + 3, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  const noteDesc =
    'Metode SAW (Simple Additive Weighting) menentukan penjumlahan terbobot dari rating kinerja tiap alternatif pada seluruh atribut. Nilai preferensi akhir (Vi) yang semakin tinggi menunjukkan kelayakan unit yang paling optimal terhadap preferensi bobot proyek Anda. Data harga dan spesifikasi teknis diselaraskan langsung dari database katalog resmi HeavyCare.id.';
  doc.text(doc.splitTextToSize(noteDesc, contentWidth - 6), marginX + 3, currentY + 9.5);

  currentY += 24;

  // ═══════════════════════════════════════════════════════════════
  // 8. TANDA TANGAN & PENGESAHAN DOKUMEN
  // ═══════════════════════════════════════════════════════════════
  if (currentY + 32 > 280) {
    doc.addPage();
    currentY = 20;
  }

  const signY = currentY;

  // Kolom Kiri: Sistem SPK Algoritma
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Dihitung & Divalidasi Oleh:', marginX + 6, signY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(13, 20, 30);
  doc.text('SMART SPK ALGORITHM ENGINE', marginX + 6, signY + 4);

  // Digital Badge SPK
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(marginX + 6, signY + 7, 52, 13, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(21, 128, 61);
  doc.text('✓ ALGORITHM VERIFIED', marginX + 9, signY + 11.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('SAW Normalized Matrix Engine', marginX + 9, signY + 16.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(13, 20, 30);
  doc.text('( Sistem Analisis Cerdas HeavyCare )', marginX + 6, signY + 25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('PT Heavy Care Indonesia', marginX + 6, signY + 29);

  // Kolom Kanan: Tim Konsultan Armada
  const rightSignX = pageWidth - marginX - 60;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Diterbitkan & Disetujui Oleh:', rightSignX, signY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(13, 20, 30);
  doc.text('FLEET & TECHNICAL CONSULTANT', rightSignX, signY + 4);

  // Digital Badge Consultant
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(rightSignX, signY + 7, 52, 13, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text('✓ OFFICIAL RECOMMENDATION', rightSignX + 3.5, signY + 11.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Heavy Equipment Fleet Advisory', rightSignX + 3.5, signY + 16.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(13, 20, 30);
  doc.text('( Konsultan Unit Alat Berat )', rightSignX, signY + 25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('PT Heavy Care Indonesia', rightSignX, signY + 29);

  // ═══════════════════════════════════════════════════════════════
  // 9. FOOTER DI SETIAP HALAMAN
  // ═══════════════════════════════════════════════════════════════
  const totalPages = doc.internal.getNumberOfPages();
  const dateSlug = now.toISOString().slice(0, 10);

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(marginX, 286, pageWidth - marginX, 286);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Dokumen Resmi Hasil Perangkingan SPK SAW — PT Heavy Care Indonesia | Ref: SAW-${filterTonase}T-${dateSlug} | Halaman ${i} dari ${totalPages}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 10. SIMPAN DOKUMEN PDF
  // ═══════════════════════════════════════════════════════════════
  const filename = `Laporan_Perangkingan_SAW_Kelas_${filterTonase}Ton_${dateSlug}.pdf`;
  doc.save(filename);
};
