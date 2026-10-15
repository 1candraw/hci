import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDI_SECTIONS } from '../constants/pdiConstants';

/**
 * Format tanggal ke Bahasa Indonesia standar
 */
const formatDateID = (dateInput) => {
  if (!dateInput) return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const d = new Date(dateInput);
  return isNaN(d.getTime())
    ? new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

/**
 * Utility untuk menghasilkan Dokumen Resmi Lembar Pre - Delivery Inspection (PDI) PDF
 * Berdasarkan formulir New Machine Pre-Delivery Inspection.
 */
export const generatePDIPDF = (data) => {
  if (!data) {
    alert('Data pesanan / inspeksi PDI tidak valid.');
    return;
  }

  // Parse pdi_checklist_data jika ada
  let checklistData = {};
  if (data.pdi_checklist_data) {
    try {
      checklistData = typeof data.pdi_checklist_data === 'string' 
        ? JSON.parse(data.pdi_checklist_data) 
        : data.pdi_checklist_data;
    } catch {
      checklistData = {};
    }
  }

  const items = checklistData.items || {};
  const header = checklistData.header || {};
  const defectNotes = checklistData.notes || data.pdi_notes || '';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;
  const contentWidth = pageWidth - (marginX * 2);

  // 1. HEADER SECTION
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('New Machine', marginX, 15);

  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('Pre - Delivery Inspection', pageWidth / 2, 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const reportNoStr = header.reportNo || `PDI-${data.nomor_pemesanan || data.id || '2026-001'}`;
  doc.text(`Report no : ${reportNoStr}`, pageWidth / 2, 22, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(21, 128, 61);
  doc.text('HEAVY CARE INDONESIA', pageWidth - marginX, 15, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Quality & PDI Division', pageWidth - marginX, 19, { align: 'right' });

  // 2. INFORMATION TABLE (2 rows x 4 columns)
  const machineModel = header.machineModel || `${data.brand_alat || data.brand || ''} ${data.model_alat || data.model || ''}`.trim() || 'Excavator Unit';
  const machineSerial = header.machineSerial || data.serial_number || `SN-${(data.id || 101) * 6382}`;
  const hmVal = header.hm || '0.0';
  const customerName = header.customerName || data.nama_customer || data.customer_fullname || 'Pelanggan HCI';

  const engineModel = header.engineModel || data.tenaga_mesin ? `Standard Engine (${data.tenaga_mesin} HP)` : 'Tier-3 Standard OEM';
  const engineSerial = header.engineSerial || `ENG-${(data.id || 101) * 8271}`;
  const inspectionDate = header.inspectionDate ? formatDateID(header.inspectionDate) : formatDateID(data.pdi_created_at || new Date());
  const machineLocation = header.machineLocation || data.destination || 'Workshop HCI - Technical Yard';

  const headerTableBody = [
    [
      { content: `Machine Model\n${machineModel}`, styles: { fontStyle: 'bold' } },
      { content: `Machine Serial No.\n${machineSerial}`, styles: { fontStyle: 'bold' } },
      { content: `HM\n${hmVal}`, styles: { fontStyle: 'bold' } },
      { content: `Customer Name\n${customerName}`, styles: { fontStyle: 'bold' } }
    ],
    [
      { content: `Engine Model\n${engineModel}` },
      { content: `Engine Serial No.\n${engineSerial}` },
      { content: `Inspection Date\n${inspectionDate}` },
      { content: `Machine Location\n${machineLocation}` }
    ]
  ];

  autoTable(doc, {
    startY: 26,
    margin: { left: marginX, right: marginX },
    body: headerTableBody,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      lineColor: [51, 65, 85],
      lineWidth: 0.25,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.28 },
      1: { cellWidth: contentWidth * 0.26 },
      2: { cellWidth: contentWidth * 0.14 },
      3: { cellWidth: contentWidth * 0.32 },
    }
  });

  let currentY = doc.lastAutoTable.finalY + 4;

  // 3. INSTRUCTION / LEGEND
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Check Inspection Items   1 : Good,  2 : Bad,  3 : Repair Done,  4 : NA', marginX, currentY);
  currentY += 3.5;

  // 4. CHECKLIST ITEMS TABLE
  const checklistRows = [];

  PDI_SECTIONS.forEach((section) => {
    // Header section row
    checklistRows.push([
      { 
        content: `⚪  ${section.categoryName.toUpperCase()}`, 
        colSpan: 3, 
        styles: { 
          fillColor: [241, 245, 249], 
          fontStyle: 'bold', 
          textColor: [15, 23, 42],
          fontSize: 7.5
        } 
      }
    ]);

    section.items.forEach((item, idx) => {
      const isChecked = items[item.id] !== undefined ? !!items[item.id] : true;
      const statusText = isChecked ? '[ ✔ ]  1 : Good (OK)' : '[    ]  Belum Dicek';
      
      checklistRows.push([
        (idx + 1).toString(),
        item.label,
        { 
          content: statusText, 
          styles: { 
            halign: 'center', 
            textColor: isChecked ? [21, 128, 61] : [180, 83, 9],
            fontStyle: 'bold'
          } 
        }
      ]);
    });
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    head: [['No', 'Inspection Points / Komponen Pemeriksaan', 'Status Uji Fisik']],
    body: checklistRows,
    theme: 'grid',
    headStyles: {
      fillColor: [226, 232, 240],
      textColor: [15, 23, 42],
      fontSize: 7.5,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 6.8,
      cellPadding: 1.3,
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: contentWidth - 48 },
      2: { cellWidth: 38 },
    }
  });

  currentY = doc.lastAutoTable.finalY + 4;

  // 5. DETAIL OF DEFECT FOUND
  if (currentY > 240) {
    doc.addPage();
    currentY = 15;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Detail of defect found', marginX, currentY);

  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.3);
  doc.rect(marginX, currentY + 2, contentWidth, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const defectText = defectNotes ? defectNotes : 'Semua komponen dalam kondisi baik (Good). Unit dinyatakan siap untuk diserahterimakan.';
  doc.text(defectText, marginX + 3, currentY + 7, { maxWidth: contentWidth - 6 });

  currentY += 25;

  // 6. SIGNATURE SECTION
  const colWidth = contentWidth / 2;
  const inspectorName = header.inspectorName || data.operator_name || 'Staff Operasional & Mekanik';
  const supervisorName = header.supervisorName || data.nama_manager || 'Supervisor / Dept Head';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Inspected by :', marginX + 25, currentY);
  doc.text('Acknowledge by :', marginX + colWidth + 25, currentY);

  currentY += 15;
  // Sign lines
  doc.setLineWidth(0.2);
  doc.line(marginX + 15, currentY, marginX + colWidth - 15, currentY);
  doc.line(marginX + colWidth + 15, currentY, marginX + contentWidth - 15, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(inspectorName, marginX + (colWidth / 2), currentY - 1.5, { align: 'center' });
  doc.text(supervisorName, marginX + colWidth + (colWidth / 2), currentY - 1.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('Inspector name & sign', marginX + (colWidth / 2), currentY + 3.5, { align: 'center' });
  doc.text('Supervisor/Dept Head name & sign', marginX + colWidth + (colWidth / 2), currentY + 3.5, { align: 'center' });

  currentY += 8;

  // 7. FOOTER COPY DISTRIBUTION
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('1. Service Division (putih)        2. Branch (hijau)        3. MSD (merah)', marginX, currentY);

  // SAVE FILE
  const filename = `PDI_${data.nomor_pemesanan || data.id || 'Unit'}.pdf`;
  doc.save(filename);
};
