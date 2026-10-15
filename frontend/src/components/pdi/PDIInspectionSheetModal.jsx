import React from 'react';
import { X, CheckCircle2, AlertTriangle, FileText, Download, Printer } from 'lucide-react';
import { PDI_SECTIONS, TOTAL_PDI_ITEMS } from '../../constants/pdiConstants';

/**
 * Modal Tampilan Lembar Formulir PDI Sesuai Format Asli Lembar Inspeksi
 */
export const PDIInspectionSheetModal = ({
  isOpen,
  onClose,
  items = {},
  onToggleItem,
  headerData = {},
  onChangeHeader,
  defectNotes = '',
  onChangeDefectNotes,
  readOnly = false,
  onDownloadPDF,
}) => {
  if (!isOpen) return null;

  const checkedCount = Object.values(items).filter(Boolean).length;
  const progressPercent = Math.round((checkedCount / TOTAL_PDI_ITEMS) * 100);

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.container} onClick={(e) => e.stopPropagation()}>
        {/* Top Action Bar */}
        <div style={modalStyles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={20} style={{ color: '#15803d' }} />
            <h3 style={modalStyles.topTitle}>Lembar Resmi Pre - Delivery Inspection (PDI)</h3>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '800',
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              backgroundColor: checkedCount === TOTAL_PDI_ITEMS ? '#dcfce7' : '#fef9c3',
              color: checkedCount === TOTAL_PDI_ITEMS ? '#166534' : '#854d0e',
              border: `1px solid ${checkedCount === TOTAL_PDI_ITEMS ? '#86efac' : '#fde047'}`
            }}>
              {checkedCount} / {TOTAL_PDI_ITEMS} Poin Diperiksa ({progressPercent}%)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {onDownloadPDF && (
              <button 
                type="button" 
                onClick={onDownloadPDF} 
                style={modalStyles.btnAction}
                title="Unduh Lembar PDF"
              >
                <Download size={15} />
                <span>Unduh PDF</span>
              </button>
            )}
            <button 
              type="button" 
              onClick={() => window.print()} 
              style={{ ...modalStyles.btnAction, backgroundColor: '#f1f5f9', color: '#334155' }}
              title="Cetak Formulir"
            >
              <Printer size={15} />
              <span>Cetak</span>
            </button>
            <button type="button" onClick={onClose} style={modalStyles.closeBtn} title="Tutup">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Paper Sheet Preview Area */}
        <div style={modalStyles.sheetScrollArea}>
          <div style={modalStyles.paperSheet} className="printable-pdi-sheet">
            {/* Sheet Header */}
            <div style={modalStyles.sheetHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={modalStyles.badgeNewMachine}>
                  <div style={{ fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#64748b' }}>Technical Division</div>
                  <strong style={{ fontSize: '1.05rem', color: '#0f172a', letterSpacing: '-0.02em' }}>NEW MACHINE</strong>
                </div>
              </div>

              <div style={{ textAlign: 'center', flex: 1 }}>
                <h2 style={modalStyles.docTitle}>Pre - Delivery Inspection</h2>
                <div style={modalStyles.reportNoRow}>
                  <span>Report no : </span>
                  {readOnly ? (
                    <strong style={{ borderBottom: '1px dotted #334155', minWidth: '160px', display: 'inline-block' }}>
                      {headerData.reportNo || '-'}
                    </strong>
                  ) : (
                    <input 
                      type="text"
                      placeholder="Contoh: PDI-202610-001"
                      value={headerData.reportNo || ''}
                      onChange={(e) => onChangeHeader && onChangeHeader('reportNo', e.target.value)}
                      style={modalStyles.headerInput}
                    />
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'right', minWidth: '140px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#15803d' }}>HEAVY CARE INDONESIA</div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Operations & Quality Assurance</div>
              </div>
            </div>

            {/* Header Information Grid (2 Rows x 4 Cols) */}
            <div style={modalStyles.gridTable}>
              <div style={modalStyles.gridRow}>
                <div style={modalStyles.gridCell}>
                  <span style={modalStyles.cellLabel}>Machine Model</span>
                  {readOnly ? (
                    <span style={modalStyles.cellValue}>{headerData.machineModel || '-'}</span>
                  ) : (
                    <input 
                      style={modalStyles.cellInput} 
                      value={headerData.machineModel || ''} 
                      onChange={(e) => onChangeHeader && onChangeHeader('machineModel', e.target.value)}
                      placeholder="Model unit..."
                    />
                  )}
                </div>
                <div style={modalStyles.gridCell}>
                  <span style={modalStyles.cellLabel}>Machine Serial No.</span>
                  {readOnly ? (
                    <span style={modalStyles.cellValue}>{headerData.machineSerial || '-'}</span>
                  ) : (
                    <input 
                      style={modalStyles.cellInput} 
                      value={headerData.machineSerial || ''} 
                      onChange={(e) => onChangeHeader && onChangeHeader('machineSerial', e.target.value)}
                      placeholder="Nomor seri unit..."
                    />
                  )}
                </div>
                <div style={modalStyles.gridCell}>
                  <span style={modalStyles.cellLabel}>HM (Hour Meter)</span>
                  {readOnly ? (
                    <span style={modalStyles.cellValue}>{headerData.hm || '0.0'}</span>
                  ) : (
                    <input 
                      style={modalStyles.cellInput} 
                      value={headerData.hm || ''} 
                      onChange={(e) => onChangeHeader && onChangeHeader('hm', e.target.value)}
                      placeholder="Contoh: 0.5 Jam"
                    />
                  )}
                </div>
                <div style={modalStyles.gridCell}>
                  <span style={modalStyles.cellLabel}>Customer Name</span>
                  {readOnly ? (
                    <span style={modalStyles.cellValue}>{headerData.customerName || '-'}</span>
                  ) : (
                    <input 
                      style={modalStyles.cellInput} 
                      value={headerData.customerName || ''} 
                      onChange={(e) => onChangeHeader && onChangeHeader('customerName', e.target.value)}
                      placeholder="Nama pembeli..."
                    />
                  )}
                </div>
              </div>

              <div style={modalStyles.gridRow}>
                <div style={modalStyles.gridCell}>
                  <span style={modalStyles.cellLabel}>Engine Model</span>
                  {readOnly ? (
                    <span style={modalStyles.cellValue}>{headerData.engineModel || '-'}</span>
                  ) : (
                    <input 
                      style={modalStyles.cellInput} 
                      value={headerData.engineModel || ''} 
                      onChange={(e) => onChangeHeader && onChangeHeader('engineModel', e.target.value)}
                      placeholder="Tipe/Model mesin..."
                    />
                  )}
                </div>
                <div style={modalStyles.gridCell}>
                  <span style={modalStyles.cellLabel}>Engine Serial No.</span>
                  {readOnly ? (
                    <span style={modalStyles.cellValue}>{headerData.engineSerial || '-'}</span>
                  ) : (
                    <input 
                      style={modalStyles.cellInput} 
                      value={headerData.engineSerial || ''} 
                      onChange={(e) => onChangeHeader && onChangeHeader('engineSerial', e.target.value)}
                      placeholder="Nomor seri mesin..."
                    />
                  )}
                </div>
                <div style={modalStyles.gridCell}>
                  <span style={modalStyles.cellLabel}>Inspection Date</span>
                  {readOnly ? (
                    <span style={modalStyles.cellValue}>{headerData.inspectionDate || '-'}</span>
                  ) : (
                    <input 
                      type="date"
                      style={modalStyles.cellInput} 
                      value={headerData.inspectionDate || ''} 
                      onChange={(e) => onChangeHeader && onChangeHeader('inspectionDate', e.target.value)}
                    />
                  )}
                </div>
                <div style={modalStyles.gridCell}>
                  <span style={modalStyles.cellLabel}>Machine Location</span>
                  {readOnly ? (
                    <span style={modalStyles.cellValue}>{headerData.machineLocation || '-'}</span>
                  ) : (
                    <input 
                      style={modalStyles.cellInput} 
                      value={headerData.machineLocation || ''} 
                      onChange={(e) => onChangeHeader && onChangeHeader('machineLocation', e.target.value)}
                      placeholder="Lokasi workshop/site..."
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Instruction Banner */}
            <div style={modalStyles.legendBanner}>
              <strong>Check Inspection Items</strong> &nbsp;—&nbsp; 
              <span>1 : Good (OK), 2 : Bad, 3 : Repair Done, 4 : NA</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#166534', fontWeight: '700' }}>
                Centang setiap poin secara manual untuk menyatakan item lolos uji standar.
              </span>
            </div>

            {/* Checklist Body Content */}
            <div style={modalStyles.sectionsContainer}>
              {PDI_SECTIONS.map((section, sIdx) => {
                const isTwoColumn = section.id === 'oil_fluid';
                return (
                  <div key={section.id} style={modalStyles.sectionBlock}>
                    <div style={modalStyles.sectionHeaderRow}>
                      <span style={modalStyles.radioIndicator}>⚪</span>
                      <h4 style={modalStyles.sectionTitle}>{section.categoryName}</h4>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isTwoColumn ? 'repeat(2, 1fr)' : '1fr',
                      gap: '0.45rem 1rem',
                      paddingLeft: '1.25rem',
                      marginTop: '0.35rem'
                    }}>
                      {section.items.map((item) => {
                        const isChecked = !!items[item.id];
                        return (
                          <label 
                            key={item.id} 
                            style={{
                              ...modalStyles.itemRow,
                              backgroundColor: isChecked ? '#f0fdf4' : 'transparent',
                              borderColor: isChecked ? '#bbf7d0' : '#e2e8f0',
                              cursor: readOnly ? 'default' : 'pointer'
                            }}
                          >
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              disabled={readOnly}
                              onChange={() => onToggleItem && onToggleItem(item.id)}
                              style={modalStyles.checkboxStyle}
                            />
                            <span style={{
                              fontSize: '0.78rem',
                              color: isChecked ? '#166534' : '#1e293b',
                              fontWeight: isChecked ? '600' : '400',
                              lineHeight: '1.3'
                            }}>
                              {item.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail of Defect Found Section */}
            <div style={modalStyles.defectSection}>
              <div style={modalStyles.defectHeader}>
                <strong>Detail of defect found</strong>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  (Catatan temuan kerusakan, koreksi, atau pekerjaan perbaikan bila ada)
                </span>
              </div>
              {readOnly ? (
                <div style={modalStyles.defectBoxReadOnly}>
                  {defectNotes ? defectNotes : 'Tidak ada catatan kerusakan fisik / Semua sistem dinyatakan Good (Lolos uji standar).'}
                </div>
              ) : (
                <textarea 
                  rows={3}
                  value={defectNotes}
                  onChange={(e) => onChangeDefectNotes && onChangeDefectNotes(e.target.value)}
                  placeholder="Tuliskan detail temuan cacat / defect jika ada, atau biarkan kosong jika unit prima..."
                  style={modalStyles.defectTextarea}
                />
              )}
            </div>

            {/* Signatures & Footer Section */}
            <div style={modalStyles.signRow}>
              <div style={modalStyles.signBox}>
                <div style={modalStyles.signTitle}>Inspected by :</div>
                <div style={modalStyles.signLineArea}>
                  {readOnly ? (
                    <div style={{ textAlign: 'center', color: '#15803d', fontWeight: '700', fontSize: '0.85rem' }}>
                      ✔ {headerData.inspectorName || 'Staff Operasional / Mekanik'}
                    </div>
                  ) : (
                    <input 
                      type="text"
                      placeholder="Nama Mekanik / Inspektor"
                      value={headerData.inspectorName || ''}
                      onChange={(e) => onChangeHeader && onChangeHeader('inspectorName', e.target.value)}
                      style={modalStyles.signInput}
                    />
                  )}
                </div>
                <div style={modalStyles.signCaption}>Inspector name & sign</div>
              </div>

              <div style={modalStyles.signBox}>
                <div style={modalStyles.signTitle}>Acknowledge by :</div>
                <div style={modalStyles.signLineArea}>
                  {readOnly ? (
                    <div style={{ textAlign: 'center', color: '#15803d', fontWeight: '700', fontSize: '0.85rem' }}>
                      ✔ {headerData.supervisorName || 'Supervisor / Dept Head'}
                    </div>
                  ) : (
                    <input 
                      type="text"
                      placeholder="Nama Supervisor / Dept Head"
                      value={headerData.supervisorName || ''}
                      onChange={(e) => onChangeHeader && onChangeHeader('supervisorName', e.target.value)}
                      style={modalStyles.signInput}
                    />
                  )}
                </div>
                <div style={modalStyles.signCaption}>Supervisor/Dept Head name & sign</div>
              </div>
            </div>

            {/* Paper Footer Copy Distribution */}
            <div style={modalStyles.paperFooter}>
              <span>1. Service Division (putih)</span>
              <span>2. Branch (hijau)</span>
              <span>3. MSD (merah)</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div style={modalStyles.modalFooter}>
          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
            {checkedCount < TOTAL_PDI_ITEMS ? (
              <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertTriangle size={15} />
                <span>Masih ada <strong>{TOTAL_PDI_ITEMS - checkedCount}</strong> item yang belum dicentang secara manual.</span>
              </span>
            ) : (
              <span style={{ color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={16} />
                <span>Seluruh 27 poin inspeksi fisik telah lengkap diperiksa!</span>
              </span>
            )}
          </div>
          <button type="button" onClick={onClose} style={modalStyles.btnDone}>
            {readOnly ? 'Tutup' : 'Kembali ke Panel Aksi'}
          </button>
        </div>
      </div>
    </div>
  );
};

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(4px)',
    zIndex: 99999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    width: '100%',
    maxWidth: '920px',
    maxHeight: '94vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid #cbd5e1',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.85rem 1.25rem',
    borderBottom: '1.5px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  topTitle: {
    margin: 0,
    fontSize: '0.98rem',
    fontWeight: '800',
    fontFamily: "'Sora', sans-serif",
    color: '#0f172a',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    display: 'flex',
    padding: '4px',
    borderRadius: '6px',
    transition: 'background-color 0.15s ease',
  },
  btnAction: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.4rem 0.75rem',
    backgroundColor: '#15803d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  sheetScrollArea: {
    overflowY: 'auto',
    padding: '1.25rem',
    backgroundColor: '#f1f5f9',
    flex: 1,
  },
  paperSheet: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '1.5rem',
    border: '1.5px solid #cbd5e1',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    maxWidth: '850px',
    margin: '0 auto',
    fontFamily: "'Inter', sans-serif",
  },
  sheetHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '1rem',
    borderBottom: '2px solid #0f172a',
    marginBottom: '0.85rem',
  },
  badgeNewMachine: {
    borderLeft: '4px solid #15803d',
    paddingLeft: '0.6rem',
  },
  docTitle: {
    margin: '0 0 0.2rem 0',
    fontSize: '1.45rem',
    fontWeight: '900',
    letterSpacing: '-0.02em',
    color: '#0f172a',
    fontFamily: "'Sora', sans-serif",
  },
  reportNoRow: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#334155',
  },
  headerInput: {
    border: 'none',
    borderBottom: '1.5px dashed #64748b',
    padding: '0.15rem 0.35rem',
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#0f172a',
    outline: 'none',
    width: '170px',
  },
  gridTable: {
    border: '1.5px solid #334155',
    marginBottom: '0.85rem',
    fontSize: '0.78rem',
  },
  gridRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    borderBottom: '1px solid #cbd5e1',
  },
  gridCell: {
    padding: '0.45rem 0.6rem',
    borderRight: '1px solid #cbd5e1',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
    backgroundColor: '#fcfcfc',
  },
  cellLabel: {
    fontSize: '0.68rem',
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
  },
  cellValue: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#0f172a',
  },
  cellInput: {
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    padding: '0.2rem 0.4rem',
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  legendBanner: {
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    padding: '0.35rem 0.65rem',
    fontSize: '0.75rem',
    color: '#334155',
    marginBottom: '0.85rem',
    display: 'flex',
    alignItems: 'center',
  },
  sectionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    marginBottom: '1rem',
  },
  sectionBlock: {
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '0.65rem 0.75rem',
    backgroundColor: '#ffffff',
  },
  sectionHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.35rem',
  },
  radioIndicator: {
    fontSize: '0.7rem',
    color: '#15803d',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '0.88rem',
    fontWeight: '800',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    padding: '0.35rem 0.5rem',
    borderRadius: '5px',
    border: '1px solid #f1f5f9',
    transition: 'all 0.15s ease',
  },
  checkboxStyle: {
    width: '15px',
    height: '15px',
    accentColor: '#15803d',
    marginTop: '2px',
    cursor: 'pointer',
    flexShrink: 0,
  },
  defectSection: {
    border: '1.5px solid #334155',
    borderRadius: '6px',
    padding: '0.65rem',
    marginBottom: '1rem',
    backgroundColor: '#fcfcfc',
  },
  defectHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '0.4rem',
  },
  defectTextarea: {
    width: '100%',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    padding: '0.5rem',
    fontSize: '0.8rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  defectBoxReadOnly: {
    minHeight: '45px',
    padding: '0.5rem',
    fontSize: '0.8rem',
    color: '#334155',
    backgroundColor: '#ffffff',
    borderRadius: '4px',
    border: '1px dashed #cbd5e1',
  },
  signRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    padding: '0.85rem 1rem',
    borderTop: '1px solid #cbd5e1',
    marginBottom: '1rem',
  },
  signBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  signTitle: {
    fontSize: '0.84rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '0.8rem',
  },
  signLineArea: {
    width: '80%',
    minHeight: '35px',
    borderBottom: '1.5px dotted #334155',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.35rem',
  },
  signInput: {
    border: 'none',
    textAlign: 'center',
    fontSize: '0.82rem',
    fontWeight: '700',
    width: '100%',
    outline: 'none',
    backgroundColor: 'transparent',
  },
  signCaption: {
    fontSize: '0.72rem',
    color: '#64748b',
    textAlign: 'center',
  },
  paperFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.68rem',
    color: '#64748b',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '0.5rem',
  },
  modalFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.85rem 1.25rem',
    borderTop: '1.5px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  btnDone: {
    padding: '0.5rem 1.25rem',
    backgroundColor: '#15803d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.84rem',
    fontWeight: '800',
    cursor: 'pointer',
  },
};
