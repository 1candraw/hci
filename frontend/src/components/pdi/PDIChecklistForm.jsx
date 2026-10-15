import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ClipboardCheck, 
  FileSearch, 
  ChevronDown, 
  ChevronUp, 
  Wrench, 
  Activity, 
  Sparkles, 
  ShieldCheck,
  Droplets
} from 'lucide-react';
import { PDI_SECTIONS, TOTAL_PDI_ITEMS } from '../../constants/pdiConstants';

/**
 * Komponen Form Checklist PDI untuk Panel Aksi & Status Workflow Staff Operasional.
 * Fitur:
 * 1. Seluruh 27 item TIDAK terisi otomatis (semua mulai dari false).
 * 2. Wajib dicentang manual satu per satu.
 * 3. Berdasarkan lembar "New Machine Pre - Delivery Inspection".
 */
export const PDIChecklistForm = ({
  items,
  onToggleItem,
  headerData,
  onChangeHeader,
  defectNotes,
  onChangeDefectNotes,
  onSubmit,
  submitting,
  onOpenFullSheetModal
}) => {
  // State accordion section yang sedang terbuka
  const [openSections, setOpenSections] = useState({
    oil_fluid: true,
    maintenance: true,
    function_test: true,
    external: true,
    metadata: false
  });

  const toggleSection = (secId) => {
    setOpenSections(prev => ({ ...prev, [secId]: !prev[secId] }));
  };

  const checkedCount = Object.values(items).filter(Boolean).length;
  const isAllChecked = checkedCount === TOTAL_PDI_ITEMS;
  const progressPercent = Math.round((checkedCount / TOTAL_PDI_ITEMS) * 100);

  // Helper icons per section
  const getSectionIcon = (id) => {
    switch(id) {
      case 'oil_fluid': return <Droplets size={16} style={{ color: '#0284c7' }} />;
      case 'maintenance': return <Wrench size={16} style={{ color: '#d97706' }} />;
      case 'function_test': return <Activity size={16} style={{ color: '#16a34a' }} />;
      case 'external': return <Sparkles size={16} style={{ color: '#9333ea' }} />;
      default: return <ClipboardCheck size={16} style={{ color: '#15803d' }} />;
    }
  };

  return (
    <div style={formStyles.wrapper}>
      {/* Banner Notifikasi & Info */}
      <div style={formStyles.infoBanner}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
          <div style={formStyles.iconBadge}>🔧</div>
          <div style={{ flex: 1 }}>
            <h4 style={formStyles.bannerTitle}>Checklist Pre-Delivery Inspection (PDI)</h4>
            <p style={formStyles.bannerDesc}>
              Formulir inspeksi fisik unit baru (New Machine PDI). Wajib melakukan uji fisik di workshop dan mencentang setiap item inspeksi secara manual satu per satu.
            </p>
          </div>
        </div>

        {/* Action Button: Buka Modal Format Kertas Lembar PDI Lengkap */}
        <button 
          type="button" 
          onClick={onOpenFullSheetModal} 
          style={formStyles.btnFullSheet}
        >
          <FileSearch size={14} />
          <span>🔍 Buka Tampilan Lembar PDI Penuh</span>
        </button>
      </div>

      {/* Progress Bar Inspeksi Manual */}
      <div style={formStyles.progressCard}>
        <div style={formStyles.progressHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>
              Progres Pengecekan Fisik:
            </span>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: '800',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              backgroundColor: isAllChecked ? '#dcfce7' : '#fef3c7',
              color: isAllChecked ? '#166534' : '#92400e',
              border: `1px solid ${isAllChecked ? '#86efac' : '#fde68a'}`
            }}>
              {checkedCount} / {TOTAL_PDI_ITEMS} Item ({progressPercent}%)
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: isAllChecked ? '#166534' : '#64748b', fontWeight: '700' }}>
            {isAllChecked ? '✅ Semua Poin Terverifikasi' : 'Harus dicek manual satu per satu'}
          </span>
        </div>

        <div style={formStyles.progressBarTrack}>
          <div style={{
            ...formStyles.progressBarFill,
            width: `${progressPercent}%`,
            backgroundColor: isAllChecked ? '#16a34a' : progressPercent > 50 ? '#0284c7' : '#eab308'
          }} />
        </div>
      </div>

      {/* Form Submission */}
      <form onSubmit={onSubmit}>
        {/* Accordion Identitas Unit & Pelanggan */}
        <div style={formStyles.accordionBox}>
          <div 
            style={formStyles.accordionHeader} 
            onClick={() => toggleSection('metadata')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <ShieldCheck size={16} style={{ color: '#0e7490' }} />
              <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Data Unit, Mesin & No. Laporan PDI</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {headerData.reportNo || 'PDI'} • HM: {headerData.hm || '0.0'}
              </span>
              {openSections.metadata ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>

          {openSections.metadata && (
            <div style={formStyles.metadataBody}>
              <div style={formStyles.metaGrid}>
                <div style={formStyles.metaField}>
                  <label style={formStyles.metaLabel}>Report No.</label>
                  <input 
                    type="text" 
                    value={headerData.reportNo || ''} 
                    onChange={(e) => onChangeHeader('reportNo', e.target.value)}
                    placeholder="Contoh: PDI-202610-001"
                    style={formStyles.metaInput} 
                  />
                </div>
                <div style={formStyles.metaField}>
                  <label style={formStyles.metaLabel}>Machine Model</label>
                  <input 
                    type="text" 
                    value={headerData.machineModel || ''} 
                    onChange={(e) => onChangeHeader('machineModel', e.target.value)}
                    style={formStyles.metaInput} 
                  />
                </div>
                <div style={formStyles.metaField}>
                  <label style={formStyles.metaLabel}>Machine Serial No.</label>
                  <input 
                    type="text" 
                    value={headerData.machineSerial || ''} 
                    onChange={(e) => onChangeHeader('machineSerial', e.target.value)}
                    placeholder="Contoh: SN-2026-X88"
                    style={formStyles.metaInput} 
                  />
                </div>
                <div style={formStyles.metaField}>
                  <label style={formStyles.metaLabel}>Hour Meter (HM)</label>
                  <input 
                    type="text" 
                    value={headerData.hm || ''} 
                    onChange={(e) => onChangeHeader('hm', e.target.value)}
                    placeholder="0.0"
                    style={formStyles.metaInput} 
                  />
                </div>
                <div style={formStyles.metaField}>
                  <label style={formStyles.metaLabel}>Engine Model</label>
                  <input 
                    type="text" 
                    value={headerData.engineModel || ''} 
                    onChange={(e) => onChangeHeader('engineModel', e.target.value)}
                    placeholder="Contoh: B3.9 / Tier-3"
                    style={formStyles.metaInput} 
                  />
                </div>
                <div style={formStyles.metaField}>
                  <label style={formStyles.metaLabel}>Engine Serial No.</label>
                  <input 
                    type="text" 
                    value={headerData.engineSerial || ''} 
                    onChange={(e) => onChangeHeader('engineSerial', e.target.value)}
                    placeholder="Nomor seri mesin..."
                    style={formStyles.metaInput} 
                  />
                </div>
                <div style={formStyles.metaField}>
                  <label style={formStyles.metaLabel}>Customer Name</label>
                  <input 
                    type="text" 
                    value={headerData.customerName || ''} 
                    onChange={(e) => onChangeHeader('customerName', e.target.value)}
                    style={formStyles.metaInput} 
                  />
                </div>
                <div style={formStyles.metaField}>
                  <label style={formStyles.metaLabel}>Machine Location</label>
                  <input 
                    type="text" 
                    value={headerData.machineLocation || ''} 
                    onChange={(e) => onChangeHeader('machineLocation', e.target.value)}
                    placeholder="Lokasi Workshop..."
                    style={formStyles.metaInput} 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4 Bagian Checklist PDI Sesuai Lembar Asli */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          {PDI_SECTIONS.map((section) => {
            const secItems = section.items;
            const secCheckedCount = secItems.filter(it => !!items[it.id]).length;
            const isSecDone = secCheckedCount === secItems.length;
            const isOpen = openSections[section.id];

            return (
              <div 
                key={section.id} 
                style={{
                  ...formStyles.sectionCard,
                  borderColor: isSecDone ? '#86efac' : '#e2e8f0'
                }}
              >
                <div 
                  style={{
                    ...formStyles.sectionCardHeader,
                    backgroundColor: isSecDone ? '#f0fdf4' : '#f8fafc'
                  }}
                  onClick={() => toggleSection(section.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                    {getSectionIcon(section.id)}
                    <div>
                      <div style={formStyles.sectionHeaderTitle}>
                        {section.categoryName}
                      </div>
                      <div style={formStyles.sectionHeaderSub}>
                        {section.description}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: '800',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '999px',
                      backgroundColor: isSecDone ? '#dcfce7' : '#f1f5f9',
                      color: isSecDone ? '#15803d' : '#475569',
                      border: `1px solid ${isSecDone ? '#bbf7d0' : '#cbd5e1'}`
                    }}>
                      {secCheckedCount}/{secItems.length}
                    </span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {isOpen && (
                  <div style={formStyles.sectionItemsBody}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.45rem'
                    }}>
                      {secItems.map((item) => {
                        const isChecked = !!items[item.id];
                        return (
                          <label 
                            key={item.id} 
                            style={{
                              ...formStyles.itemRow,
                              backgroundColor: isChecked ? '#f0fdf4' : '#ffffff',
                              borderColor: isChecked ? '#bbf7d0' : '#f1f5f9',
                            }}
                          >
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => onToggleItem(item.id)}
                              style={formStyles.checkboxStyle}
                            />
                            <div style={{ flex: 1 }}>
                              <span style={{
                                fontSize: '0.82rem',
                                color: isChecked ? '#166534' : '#1e293b',
                                fontWeight: isChecked ? '700' : '500',
                                lineHeight: '1.35',
                                display: 'block'
                              }}>
                                {item.label}
                              </span>
                            </div>
                            {isChecked && (
                              <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#16a34a' }}>
                                PASSED (OK)
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bagian: Detail of Defect Found (Catatan Kerusakan Jika Ada) */}
        <div style={formStyles.defectBox}>
          <label style={formStyles.defectLabel}>
            <strong>Detail of defect found</strong>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '400', marginLeft: '0.35rem' }}>
              (Temuan cacat, perbaikan yang telah dilakukan, atau catatan khusus)
            </span>
          </label>
          <textarea 
            rows={2}
            value={defectNotes}
            onChange={(e) => onChangeDefectNotes(e.target.value)}
            placeholder="Kosongkan jika semua item normal & tidak ada defect..."
            style={formStyles.defectTextarea}
          />
        </div>

        {/* Penanggung Jawab: Inspected by & Acknowledge by */}
        <div style={formStyles.signRow}>
          <div style={formStyles.signCol}>
            <label style={formStyles.signLabel}>Inspected by (Mekanik / Petugas)</label>
            <input 
              type="text" 
              value={headerData.inspectorName || ''} 
              onChange={(e) => onChangeHeader('inspectorName', e.target.value)}
              placeholder="Nama staff pemeriksa..."
              style={formStyles.signInput}
            />
          </div>
          <div style={formStyles.signCol}>
            <label style={formStyles.signLabel}>Acknowledge by (Supervisor / Dept Head)</label>
            <input 
              type="text" 
              value={headerData.supervisorName || ''} 
              onChange={(e) => onChangeHeader('supervisorName', e.target.value)}
              placeholder="Nama atasan / supervisor..."
              style={formStyles.signInput}
            />
          </div>
        </div>

        {/* Warning / Validation Message */}
        {!isAllChecked && (
          <div style={formStyles.warningBanner}>
            <AlertTriangle size={16} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.79rem', color: '#92400e', lineHeight: '1.4' }}>
              <strong>Perhatian:</strong> Masih ada <strong>{TOTAL_PDI_ITEMS - checkedCount}</strong> titik inspeksi yang belum dicek. 
              Sesuai SOP, checklist tidak otomatis terisi dan harus dicentang manual satu per satu setelah inspeksi fisik selesai.
            </div>
          </div>
        )}

        {/* Tombol Submit PDI Selesai */}
        <button 
          type="submit" 
          disabled={submitting || !isAllChecked}
          style={{
            ...formStyles.submitBtn,
            backgroundColor: isAllChecked ? '#15803d' : '#94a3b8',
            cursor: isAllChecked && !submitting ? 'pointer' : 'not-allowed',
            opacity: isAllChecked ? 1 : 0.75,
            boxShadow: isAllChecked ? '0 4px 14px rgba(21, 128, 61, 0.3)' : 'none'
          }}
        >
          {submitting ? (
            'Menyimpan Data PDI...'
          ) : isAllChecked ? (
            '✅ Selesaikan PDI → Terbitkan Status Siap Kirim'
          ) : (
            `⚠️ Centang ${TOTAL_PDI_ITEMS - checkedCount} Item Lagi Untuk Menyelesaikan PDI`
          )}
        </button>
      </form>
    </div>
  );
};

const formStyles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  infoBanner: {
    backgroundColor: '#cffafe',
    border: '1.5px solid #a5f3fc',
    borderRadius: '10px',
    padding: '0.9rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  iconBadge: {
    fontSize: '1.3rem',
    backgroundColor: '#ffffff',
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  bannerTitle: {
    margin: '0 0 0.2rem 0',
    color: '#155e75',
    fontSize: '0.95rem',
    fontWeight: '800',
    fontFamily: "'Sora', sans-serif",
  },
  bannerDesc: {
    margin: 0,
    fontSize: '0.8rem',
    color: '#0e7490',
    lineHeight: '1.4',
  },
  btnFullSheet: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.85rem',
    backgroundColor: '#0891b2',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.78rem',
    fontWeight: '800',
    cursor: 'pointer',
    width: '100%',
    transition: 'background-color 0.15s ease',
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '0.65rem 0.85rem',
  },
  progressHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.4rem',
  },
  progressBarTrack: {
    height: '7px',
    width: '100%',
    backgroundColor: '#e2e8f0',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    transition: 'width 0.3s ease, background-color 0.3s ease',
  },
  accordionBox: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    marginBottom: '0.75rem',
  },
  accordionHeader: {
    padding: '0.65rem 0.85rem',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    userSelect: 'none',
  },
  metadataBody: {
    padding: '0.75rem 0.85rem',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
  },
  metaField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  metaLabel: {
    fontSize: '0.68rem',
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
  },
  metaInput: {
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    padding: '0.35rem 0.5rem',
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#0f172a',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1.5px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  sectionCardHeader: {
    padding: '0.65rem 0.85rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    userSelect: 'none',
    borderBottom: '1px solid #f1f5f9',
  },
  sectionHeaderTitle: {
    fontSize: '0.84rem',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '0.2px',
  },
  sectionHeaderSub: {
    fontSize: '0.72rem',
    color: '#64748b',
  },
  sectionItemsBody: {
    padding: '0.65rem 0.85rem',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
    padding: '0.45rem 0.6rem',
    borderRadius: '6px',
    border: '1px solid #f1f5f9',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  checkboxStyle: {
    width: '16px',
    height: '16px',
    accentColor: '#15803d',
    cursor: 'pointer',
    marginTop: '2px',
    flexShrink: 0,
  },
  defectBox: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    padding: '0.65rem 0.85rem',
    marginBottom: '0.75rem',
  },
  defectLabel: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#0f172a',
    marginBottom: '0.35rem',
  },
  defectTextarea: {
    width: '100%',
    borderRadius: '5px',
    border: '1px solid #cbd5e1',
    padding: '0.5rem',
    fontSize: '0.8rem',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    resize: 'vertical',
  },
  signRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  signCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  signLabel: {
    fontSize: '0.7rem',
    fontWeight: '800',
    color: '#475569',
  },
  signInput: {
    border: '1px solid #cbd5e1',
    borderRadius: '5px',
    padding: '0.4rem 0.5rem',
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#0f172a',
  },
  warningBanner: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '6px',
    padding: '0.6rem 0.75rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    marginBottom: '0.85rem',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.85rem 1rem',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.88rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    transition: 'all 0.2s ease',
  },
};
