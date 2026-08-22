import {
  Truck,
  Zap,
  Layers,
  Maximize2,
  Scale,
  FileText,
  CheckCircle2,
  ShieldCheck,
  X,
  Sparkles,
  Check,
  Headphones,
  Award
} from 'lucide-react';

const AlatBeratDetailModal = ({
  isOpen,
  onClose,
  unit,
  onRFQ,
  onToggleCompare,
  isCompared = false
}) => {
  if (!isOpen || !unit) return null;

  const unitName = unit.name && unit.name.trim() !== 'Excavator'
    ? unit.name
    : `${unit.brand || 'Excavator'} ${unit.model || ''}`;

  const priceText = unit.harga
    ? `Rp ${(Number(unit.harga) / 1e6).toLocaleString('id-ID')} Juta`
    : 'Hubungi Sales';

  const fullPriceFormatted = unit.harga
    ? `Rp ${Number(unit.harga).toLocaleString('id-ID')}`
    : 'Hubungi Tim Sales';

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <div style={s.headerMetaRow}>
              <span style={s.brandBadge}>{unit.brand || 'Excavator'}</span>
              <span style={s.tonBadge}>Kelas {unit.kapasitas_ton || 5} Ton</span>
              <span style={s.stockBadge}>
                <CheckCircle2 size={13} style={{ color: '#15803d' }} />
                <span>Ready Stock ({unit.stock || 1} Unit)</span>
              </span>
            </div>
            <h2 style={s.unitTitle}>{unitName}</h2>
            <p style={s.unitSubtitle}>
              Model Pabrikan: <strong>{unit.model || '-'}</strong> · Kategori: {unit.tipe_katalog || 'Excavator Baru'}
            </p>
          </div>
          <button onClick={onClose} style={s.closeBtn} aria-label="Tutup Detail">
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={s.body}>
          {/* Top Banner / Image & Quick Overview */}
          <div style={s.topGrid}>
            {/* Image Preview */}
            <div style={s.mediaWrap}>
              {unit.image_url ? (
                <img src={unit.image_url} alt={unitName} style={s.mediaImg} />
              ) : (
                <div style={s.mediaPlaceholder}>
                  <Truck size={64} style={{ color: '#74c02c', opacity: 0.85 }} />
                  <span style={s.placeholderBrand}>{unit.brand || 'HEAVY MACHINERY'}</span>
                  <span style={s.placeholderSub}>Foto Resmi Unit Baru 100% Siap Kerja</span>
                </div>
              )}
              <div style={s.verifiedTag}>
                <ShieldCheck size={14} style={{ color: '#74c02c' }} />
                <span>HEAVY CARE ID · PDI Certified</span>
              </div>
            </div>

            {/* Price & Highlight Summary */}
            <div style={s.summaryCard}>
              <div style={s.priceBox}>
                <span style={s.priceLabel}>Estimasi Harga Beli Resmi (OTR Proyek)</span>
                <div style={s.priceMain}>{priceText}</div>
                <div style={s.priceExact}>{fullPriceFormatted}</div>
                <div style={s.priceNote}>*Harga estimasi belum termasuk opsi attachment tambahan & diskon volume.</div>
              </div>

              {/* Quick Actions in Summary */}
              <div style={s.quickActionWrap}>
                <button
                  onClick={() => {
                    onClose();
                    onRFQ(unit);
                  }}
                  style={s.btnPrimaryRFQ}
                >
                  <FileText size={16} />
                  <span>Ajukan Penawaran (RFQ)</span>
                </button>

                <button
                  onClick={() => onToggleCompare(unit)}
                  style={{
                    ...s.btnToggleCompare,
                    backgroundColor: isCompared ? '#ecfccb' : '#ffffff',
                    color: isCompared ? '#14532d' : '#334155',
                    borderColor: isCompared ? '#84cc16' : '#cbd5e1',
                  }}
                >
                  {isCompared ? (
                    <>
                      <Check size={16} style={{ color: '#15803d' }} />
                      <span>Dipilih untuk Dibandingkan</span>
                    </>
                  ) : (
                    <>
                      <Scale size={16} />
                      <span>+ Bandingkan Unit Ini</span>
                    </>
                  )}
                </button>
              </div>

              {/* Key Trust Badges */}
              <div style={s.trustBadgeList}>
                <div style={s.trustItem}>
                  <ShieldCheck size={16} style={{ color: '#74c02c' }} />
                  <div>
                    <strong>Garansi Resmi Pabrikan</strong>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>Dukungan purna jual HEAVY CARE ID & suku cadang 24/7</p>
                  </div>
                </div>
                <div style={s.trustItem}>
                  <Sparkles size={16} style={{ color: '#3b82f6' }} />
                  <div>
                    <strong>Lolos Inspeksi Fisik PDI 100%</strong>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>Uji 6 komponen vital sebelum serah terima unit & BAST</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specs 4-Box Highlight */}
          <div style={s.sectionDivider}>
            <span style={s.sectionBadge}>SPESIFIKASI TEKNIS UTAMA</span>
          </div>

          <div style={s.specCardsGrid}>
            <div style={s.specCard}>
              <div style={s.specIconWrap}><Zap size={22} style={{ color: '#74c02c' }} /></div>
              <div style={s.specValBig}>{unit.tenaga_mesin || '-'} <span style={s.specUnit}>HP</span></div>
              <div style={s.specTitle}>Tenaga Mesin (Power)</div>
              <div style={s.specSub}>Daya dorong & efisiensi bahan bakar maksimal di medan berat.</div>
            </div>

            <div style={s.specCard}>
              <div style={s.specIconWrap}><Layers size={22} style={{ color: '#3b82f6' }} /></div>
              <div style={s.specValBig}>{unit.kapasitas_bucket || '-'} <span style={s.specUnit}>m³</span></div>
              <div style={s.specTitle}>Kapasitas Bucket</div>
              <div style={s.specSub}>Volume tampung material per siklus kerja untuk kecepatan loading.</div>
            </div>

            <div style={s.specCard}>
              <div style={s.specIconWrap}><Maximize2 size={22} style={{ color: '#10b981' }} /></div>
              <div style={s.specValBig}>{unit.kedalaman_gali || '-'} <span style={s.specUnit}>Meter</span></div>
              <div style={s.specTitle}>Kedalaman Galian Maksimal</div>
              <div style={s.specSub}>Jangkauan penggalian fondasi dan parit dalam secara presisi.</div>
            </div>

            <div style={s.specCard}>
              <div style={s.specIconWrap}><Scale size={22} style={{ color: '#8b5cf6' }} /></div>
              <div style={s.specValBig}>{unit.berat_operasional || unit.kapasitas_ton || '-'} <span style={s.specUnit}>Ton</span></div>
              <div style={s.specTitle}>Berat Operasional</div>
              <div style={s.specSub}>Stabilitas traksi optimal pada kontur tanah labil dan berbatu.</div>
            </div>
          </div>

          {/* Detailed Specs Table */}
          <div style={s.specsTableWrap}>
            <table style={s.specsTable}>
              <tbody>
                <tr>
                  <td style={s.tableLabel}>Merk / Brand Alat</td>
                  <td style={s.tableValue}><strong>{unit.brand || '-'}</strong></td>
                  <td style={s.tableLabel}>Model Mesin / Tipe</td>
                  <td style={s.tableValue}><strong>{unit.model || '-'}</strong></td>
                </tr>
                <tr>
                  <td style={s.tableLabel}>Kelas Tonase</td>
                  <td style={s.tableValue}>{unit.kapasitas_ton ? `${unit.kapasitas_ton} Ton Class` : 'Standard'}</td>
                  <td style={s.tableLabel}>Ketersediaan Unit</td>
                  <td style={s.tableValue}><span style={{ color: '#15803d', fontWeight: '700' }}>Ready Stock ({unit.stock || 1} Unit)</span></td>
                </tr>
                <tr>
                  <td style={s.tableLabel}>Kategori Pengadaan</td>
                  <td style={s.tableValue}>{unit.tipe_katalog || 'Unit Baru (New Excavator)'}</td>
                  <td style={s.tableLabel}>Status Kelaikan PDI</td>
                  <td style={s.tableValue}><span style={{ color: '#15803d', fontWeight: '700' }}>100% Lulus Uji 6 Titik Vital</span></td>
                </tr>
                <tr>
                  <td style={s.tableLabel}>Jangkauan Servis</td>
                  <td style={s.tableValue}>24/7 Mobile Service Unit Nasional</td>
                  <td style={s.tableLabel}>Penerbitan Dokumen</td>
                  <td style={s.tableValue}>Faktur Resmi, Sertifikat PDI & BAST</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Description & Operational Capabilities */}
          <div style={s.sectionDivider}>
            <span style={s.sectionBadge}>DESKRIPSI & KEUNGGULAN OPERASIONAL</span>
          </div>

          <div style={s.descContent}>
            <p style={s.descText}>
              {unit.description || `Excavator ${unit.brand} ${unit.model || ''} kelas ${unit.kapasitas_ton || 5} ton dirancang khusus untuk memenuhi standar keandalan tinggi pada proyek konstruksi, cut & fill, perataan tanah, dan pertambangan di Indonesia. Mengusung teknologi hidrolik mutakhir dengan konsumsi bahan bakar yang efisien dan biaya perawatan yang ekonomis.`}
            </p>

            <div style={s.featureGrid}>
              <div style={s.featureItem}>
                <CheckCircle2 size={16} style={{ color: '#74c02c', flexShrink: 0 }} />
                <span><strong>Efisiensi Hidrolik Tinggi:</strong> Siklus perputaran boom & arm lebih gesit dengan tekanan hidrolik presisi.</span>
              </div>
              <div style={s.featureItem}>
                <CheckCircle2 size={16} style={{ color: '#74c02c', flexShrink: 0 }} />
                <span><strong>Kabin Ergonomis & ROPS/FOPS:</strong> Standar kenyamanan operator maksimal dengan visibilitas kerja 360 derajat.</span>
              </div>
              <div style={s.featureItem}>
                <CheckCircle2 size={16} style={{ color: '#74c02c', flexShrink: 0 }} />
                <span><strong>Struktur Rangka Heavy Duty:</strong> Undercarriage dan track link baja berkekuatan tinggi tahan aus.</span>
              </div>
              <div style={s.featureItem}>
                <CheckCircle2 size={16} style={{ color: '#74c02c', flexShrink: 0 }} />
                <span><strong>Kemudahan Akses Perawatan:</strong> Titik filter oli, udara, dan hidrolik mudah dijangkau dari permukaan tanah.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={s.footer}>
          <button onClick={onClose} style={s.btnSecondary}>
            Tutup
          </button>
          <div style={s.footerRightActions}>
            <button
              onClick={() => onToggleCompare(unit)}
              style={{
                ...s.btnCompareFooter,
                backgroundColor: isCompared ? '#ecfccb' : '#ffffff',
                color: isCompared ? '#14532d' : '#334155',
                borderColor: isCompared ? '#84cc16' : '#cbd5e1',
              }}
            >
              {isCompared ? (
                <>
                  <Check size={15} style={{ color: '#15803d' }} />
                  <span>Dalam Daftar Banding</span>
                </>
              ) : (
                <>
                  <Scale size={15} />
                  <span>+ Bandingkan</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                onClose();
                onRFQ(unit);
              }}
              style={s.btnPrimaryAction}
            >
              <FileText size={16} />
              <span>Ajukan RFQ Unit Ini</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const s = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13, 20, 30, 0.75)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1.5rem',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '920px',
    maxHeight: '92vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 25px 60px -15px rgba(13, 20, 30, 0.4)',
    border: '1.5px solid #e2e8f0',
    animation: 'slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  header: {
    padding: '1.25rem 1.75rem',
    borderBottom: '1.5px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
  },
  headerMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.4rem',
    flexWrap: 'wrap',
  },
  brandBadge: {
    backgroundColor: '#ecfccb',
    color: '#15803d',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.72rem',
    padding: '0.15rem 0.55rem',
    borderRadius: '5px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  tonBadge: {
    backgroundColor: '#0d141e',
    color: '#74c02c',
    fontSize: '0.72rem',
    fontWeight: '800',
    padding: '0.15rem 0.55rem',
    borderRadius: '5px',
  },
  stockBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#15803d',
    backgroundColor: '#f0fdf4',
    padding: '0.15rem 0.55rem',
    borderRadius: '5px',
    border: '1px solid #bbf7d0',
  },
  unitTitle: {
    fontSize: '1.45rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#0d141e',
    margin: '0 0 0.15rem',
    letterSpacing: '-0.025em',
  },
  unitSubtitle: {
    fontSize: '0.82rem',
    color: '#64748b',
    margin: 0,
  },
  closeBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  body: {
    padding: '1.5rem 1.75rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  topGrid: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 1fr',
    gap: '1.5rem',
  },
  mediaWrap: {
    position: 'relative',
    height: '240px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1.5px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  mediaPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '2rem 1.5rem',
  },
  placeholderBrand: {
    fontSize: '0.95rem',
    fontWeight: '900',
    color: '#0d141e',
    letterSpacing: '1px',
    marginTop: '0.75rem',
  },
  placeholderSub: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '0.2rem',
  },
  verifiedTag: {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    backgroundColor: 'rgba(13, 20, 30, 0.88)',
    color: '#f8fafc',
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.25rem 0.6rem',
    borderRadius: '6px',
    backdropFilter: 'blur(4px)',
  },
  summaryCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.4rem',
  },
  priceBox: {
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '1rem',
    marginBottom: '1rem',
  },
  priceLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.2rem',
  },
  priceMain: {
    fontSize: '1.75rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#15803d',
    letterSpacing: '-0.03em',
  },
  priceExact: {
    fontSize: '0.85rem',
    color: '#475569',
    fontWeight: '600',
    marginTop: '0.1rem',
  },
  priceNote: {
    fontSize: '0.72rem',
    color: '#94a3b8',
    marginTop: '0.4rem',
    fontStyle: 'italic',
  },
  quickActionWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    marginBottom: '1rem',
  },
  btnPrimaryRFQ: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.45rem',
    padding: '0.75rem 1.25rem',
    backgroundColor: '#0d141e',
    color: '#74c02c',
    border: 'none',
    borderRadius: '8px',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.92rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(13, 20, 30, 0.25)',
  },
  btnToggleCompare: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.45rem',
    padding: '0.7rem 1.25rem',
    border: '1.5px solid',
    borderRadius: '8px',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    fontSize: '0.88rem',
    cursor: 'pointer',
  },
  trustBadgeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '0.85rem',
  },
  trustItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.55rem',
    fontSize: '0.76rem',
    color: '#334155',
  },
  sectionDivider: {
    display: 'flex',
    alignItems: 'center',
    margin: '0.5rem 0',
  },
  sectionBadge: {
    fontSize: '0.74rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    letterSpacing: '1px',
    color: '#0d141e',
    backgroundColor: '#f1f5f9',
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  specCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
  },
  specCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1rem 0.9rem',
    textAlign: 'center',
  },
  specIconWrap: {
    marginBottom: '0.4rem',
    display: 'flex',
    justifyContent: 'center',
  },
  specValBig: {
    fontSize: '1.25rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    color: '#0d141e',
  },
  specUnit: {
    fontSize: '0.82rem',
    color: '#64748b',
    fontWeight: '700',
  },
  specTitle: {
    fontSize: '0.78rem',
    fontWeight: '800',
    color: '#1e293b',
    marginTop: '0.2rem',
    marginBottom: '0.2rem',
  },
  specSub: {
    fontSize: '0.68rem',
    color: '#64748b',
    lineHeight: '1.3',
  },
  specsTableWrap: {
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  specsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.84rem',
  },
  tableLabel: {
    padding: '0.75rem 1rem',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    fontWeight: '700',
    borderBottom: '1px solid #f1f5f9',
    width: '20%',
  },
  tableValue: {
    padding: '0.75rem 1rem',
    backgroundColor: '#ffffff',
    color: '#0d141e',
    borderBottom: '1px solid #f1f5f9',
    width: '30%',
  },
  descContent: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '0.5rem 0',
  },
  descText: {
    fontSize: '0.9rem',
    color: '#334155',
    lineHeight: '1.65',
    marginBottom: '1.2rem',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.85rem',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.55rem',
    fontSize: '0.82rem',
    color: '#334155',
    backgroundColor: '#f8fafc',
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid #f1f5f9',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.15rem 1.75rem',
    borderTop: '1.5px solid #f1f5f9',
    backgroundColor: '#ffffff',
  },
  btnSecondary: {
    padding: '0.7rem 1.4rem',
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.88rem',
  },
  footerRightActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  btnCompareFooter: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.7rem 1.15rem',
    border: '1.5px solid',
    borderRadius: '8px',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    fontSize: '0.86rem',
    cursor: 'pointer',
  },
  btnPrimaryAction: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#0d141e',
    color: '#74c02c',
    border: 'none',
    borderRadius: '8px',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.9rem',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(13, 20, 30, 0.25)',
  },
};

export default AlatBeratDetailModal;
