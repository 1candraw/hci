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
  ArrowRight,
  TrendingUp,
  Tag,
  Trash2,
  Check,
  AlertCircle,
  Clock,
  Award,
  ChevronRight
} from 'lucide-react';

const CompareAlatBeratModal = ({ 
  isOpen, 
  onClose, 
  units = [], 
  onRFQ, 
  onRemoveUnit 
}) => {
  if (!isOpen || !units || units.length === 0) return null;

  const unitA = units[0];
  const unitB = units[1] || null;

  const getUnitName = (u) => {
    if (!u) return '';
    return u.name && u.name.trim() !== 'Excavator' ? u.name : `${u.brand || 'Excavator'} ${u.model || ''}`;
  };

  const nameA = getUnitName(unitA);
  const nameB = getUnitName(unitB);

  // Helper numeric values
  const hpA = Number(unitA?.tenaga_mesin || 0);
  const hpB = Number(unitB?.tenaga_mesin || 0);

  const bucketA = Number(unitA?.kapasitas_bucket || 0);
  const bucketB = Number(unitB?.kapasitas_bucket || 0);

  const depthA = Number(unitA?.kedalaman_gali || 0);
  const depthB = Number(unitB?.kedalaman_gali || 0);

  const weightA = Number(unitA?.berat_operasional || unitA?.kapasitas_ton || 0);
  const weightB = Number(unitB?.berat_operasional || unitB?.kapasitas_ton || 0);

  const priceA = Number(unitA?.harga || 0);
  const priceB = Number(unitB?.harga || 0);

  // Advantage counters
  let aScore = 0;
  let bScore = 0;
  if (hpA > hpB) aScore++; else if (hpB > hpA) bScore++;
  if (bucketA > bucketB) aScore++; else if (bucketB > bucketA) bScore++;
  if (depthA > depthB) aScore++; else if (depthB > depthA) bScore++;
  if (priceA && priceB && priceA < priceB) aScore++; else if (priceA && priceB && priceB < priceA) bScore++;

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <div style={s.headerBadge}>
              <Scale size={13} style={{ color: '#15803d' }} />
              <span>HEAD-TO-HEAD COMPARISON & SPESIFIKASI LENGKAP</span>
            </div>
            <h2 style={s.headerTitle}>Perbandingan Spesifikasi Teknis Alat Berat</h2>
            <p style={s.headerSub}>
              Komparasi mendalam parameter teknis, kapasitas kerja, efisiensi biaya, dan rekomendasi aplikasi proyek antara 2 unit excavator.
            </p>
          </div>
          <button onClick={onClose} style={s.closeBtn} aria-label="Tutup Perbandingan">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Comparison Content */}
        <div style={s.body}>
          {/* Unit Top Cards Comparison */}
          <div style={s.unitCardsRow}>
            {/* Unit A Card */}
            <div style={{
              ...s.unitHeaderCard,
              borderColor: '#74c02c',
              backgroundColor: '#fafdf5',
            }}>
              <div style={s.unitCardTop}>
                <span style={s.unitCardSlotBadge}>Unit 1</span>
                {units.length > 1 && (
                  <button 
                    onClick={() => onRemoveUnit(unitA.id)} 
                    style={s.btnRemoveCard}
                    title="Hapus unit dari perbandingan"
                  >
                    <Trash2 size={13} />
                    <span>Hapus</span>
                  </button>
                )}
              </div>

              <div style={s.unitCardMedia}>
                {unitA.image_url ? (
                  <img src={unitA.image_url} alt={nameA} style={s.unitCardImg} />
                ) : (
                  <div style={s.unitCardPlaceholder}>
                    <Truck size={36} style={{ color: '#74c02c', opacity: 0.8 }} />
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', marginTop: '0.3rem' }}>
                      {unitA.brand}
                    </span>
                  </div>
                )}
                <span style={s.unitTonTag}>{unitA.kapasitas_ton || 5} Ton</span>
              </div>

              <div style={s.unitCardInfo}>
                <span style={s.brandBadge}>{unitA.brand || 'Excavator'}</span>
                <h3 style={s.unitCardTitle}>{nameA}</h3>
                <p style={s.unitCardModel}>Model: <strong>{unitA.model || '-'}</strong></p>

                <div style={s.unitPriceBox}>
                  <span style={s.priceLabel}>Estimasi Harga Beli OTR</span>
                  <div style={s.priceVal}>
                    {unitA.harga ? `Rp ${(Number(unitA.harga) / 1e6).toLocaleString('id-ID')} Jt` : 'Hubungi Sales'}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    onClose();
                    onRFQ(unitA);
                  }}
                  style={s.btnRfqDirect}
                >
                  <FileText size={14} />
                  <span>Ajukan RFQ Unit 1</span>
                </button>
              </div>
            </div>

            {/* VS Badge Divider */}
            <div style={s.vsDividerWrap}>
              <div style={s.vsBadge}>VS</div>
            </div>

            {/* Unit B Card */}
            {unitB ? (
              <div style={{
                ...s.unitHeaderCard,
                borderColor: '#3b82f6',
                backgroundColor: '#f8faff',
              }}>
                <div style={s.unitCardTop}>
                  <span style={{ ...s.unitCardSlotBadge, backgroundColor: '#dbeafe', color: '#1e40af' }}>Unit 2</span>
                  <button 
                    onClick={() => onRemoveUnit(unitB.id)} 
                    style={s.btnRemoveCard}
                    title="Hapus unit dari perbandingan"
                  >
                    <Trash2 size={13} />
                    <span>Hapus</span>
                  </button>
                </div>

                <div style={s.unitCardMedia}>
                  {unitB.image_url ? (
                    <img src={unitB.image_url} alt={nameB} style={s.unitCardImg} />
                  ) : (
                    <div style={s.unitCardPlaceholder}>
                      <Truck size={36} style={{ color: '#3b82f6', opacity: 0.8 }} />
                      <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', marginTop: '0.3rem' }}>
                        {unitB.brand}
                      </span>
                    </div>
                  )}
                  <span style={{ ...s.unitTonTag, backgroundColor: '#1e3a8a', color: '#93c5fd' }}>
                    {unitB.kapasitas_ton || 5} Ton
                  </span>
                </div>

                <div style={s.unitCardInfo}>
                  <span style={{ ...s.brandBadge, backgroundColor: '#dbeafe', color: '#1e40af' }}>
                    {unitB.brand || 'Excavator'}
                  </span>
                  <h3 style={s.unitCardTitle}>{nameB}</h3>
                  <p style={s.unitCardModel}>Model: <strong>{unitB.model || '-'}</strong></p>

                  <div style={s.unitPriceBox}>
                    <span style={s.priceLabel}>Estimasi Harga Beli OTR</span>
                    <div style={s.priceVal}>
                      {unitB.harga ? `Rp ${(Number(unitB.harga) / 1e6).toLocaleString('id-ID')} Jt` : 'Hubungi Sales'}
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      onClose();
                      onRFQ(unitB);
                    }}
                    style={{
                      ...s.btnRfqDirect,
                      backgroundColor: '#1e3a8a',
                      color: '#93c5fd',
                    }}
                  >
                    <FileText size={14} />
                    <span>Ajukan RFQ Unit 2</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={s.emptySlotCard}>
                <Truck size={42} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} />
                <h4 style={{ color: '#0d141e', margin: '0 0 0.25rem' }}>Unit ke-2 Belum Dipilih</h4>
                <p style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', margin: '0 0 1rem' }}>
                  Tutup modal ini dan klik tombol <strong>+ Bandingkan</strong> pada unit lain di katalog.
                </p>
                <button onClick={onClose} style={s.btnSelectOther}>
                  Pilih Unit dari Katalog
                </button>
              </div>
            )}
          </div>

          {/* Smart Verdict Summary Card */}
          {unitB && (
            <div style={s.verdictCard}>
              <div style={s.verdictHead}>
                <Sparkles size={18} style={{ color: '#74c02c' }} />
                <span style={s.verdictTitle}>RANGKUMAN ANALISIS KOMPARASI TEKNIS</span>
              </div>
              
              <div style={s.verdictGrid}>
                {/* Unit A Highlights */}
                <div style={s.verdictCol}>
                  <div style={s.verdictUnitName}>Keunggulan Spesifik {nameA}:</div>
                  <ul style={s.verdictList}>
                    {hpA > hpB && (
                      <li><Check size={14} style={{ color: '#74c02c', marginRight: '4px' }} /> <strong>Tenaga Lebih Tinggi:</strong> Selisih +{hpA - hpB} HP untuk akselerasi kerja lebih bertenaga.</li>
                    )}
                    {bucketA > bucketB && (
                      <li><Check size={14} style={{ color: '#74c02c', marginRight: '4px' }} /> <strong>Kapasitas Bucket Lebih Besar:</strong> Selisih +{(bucketA - bucketB).toFixed(2)} m³ per siklus loading.</li>
                    )}
                    {depthA > depthB && (
                      <li><Check size={14} style={{ color: '#74c02c', marginRight: '4px' }} /> <strong>Jangkauan Gali Lebih Dalam:</strong> Selisih +{(depthA - depthB).toFixed(2)} m untuk parit/fondasi.</li>
                    )}
                    {priceA && priceB && priceA < priceB && (
                      <li><Check size={14} style={{ color: '#74c02c', marginRight: '4px' }} /> <strong>Investasi Lebih Ekonomis:</strong> Lebih hemat Rp {((priceB - priceA) / 1e6).toLocaleString('id-ID')} Juta.</li>
                    )}
                    {aScore === 0 && (
                      <li style={{ color: '#94a3b8' }}>Parameter teknis seimbang dengan unit pembanding.</li>
                    )}
                  </ul>
                </div>

                {/* Unit B Highlights */}
                <div style={s.verdictCol}>
                  <div style={s.verdictUnitName}>Keunggulan Spesifik {nameB}:</div>
                  <ul style={s.verdictList}>
                    {hpB > hpA && (
                      <li><Check size={14} style={{ color: '#38bdf8', marginRight: '4px' }} /> <strong>Tenaga Lebih Tinggi:</strong> Selisih +{hpB - hpA} HP untuk medan berat.</li>
                    )}
                    {bucketB > bucketA && (
                      <li><Check size={14} style={{ color: '#38bdf8', marginRight: '4px' }} /> <strong>Kapasitas Bucket Lebih Besar:</strong> Selisih +{(bucketB - bucketA).toFixed(2)} m³ volume muat.</li>
                    )}
                    {depthB > depthA && (
                      <li><Check size={14} style={{ color: '#38bdf8', marginRight: '4px' }} /> <strong>Jangkauan Gali Lebih Dalam:</strong> Selisih +{(depthB - depthA).toFixed(2)} m jangkauan fondasi.</li>
                    )}
                    {priceA && priceB && priceB < priceA && (
                      <li><Check size={14} style={{ color: '#38bdf8', marginRight: '4px' }} /> <strong>Investasi Lebih Ekonomis:</strong> Lebih hemat Rp {((priceA - priceB) / 1e6).toLocaleString('id-ID')} Juta.</li>
                    )}
                    {bScore === 0 && (
                      <li style={{ color: '#94a3b8' }}>Parameter teknis seimbang dengan unit pembanding.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Grouped Detailed Specification Comparison */}
          <div style={s.specsGroupWrap}>
            {/* 1. KINERJA MESIN & PRODUKTIVITAS */}
            <div style={s.specSectionCard}>
              <div style={s.specSectionHead}>
                <Zap size={16} style={{ color: '#74c02c' }} />
                <span style={s.specSectionTitle}>1. Kinerja Mesin & Produktivitas</span>
              </div>
              <table style={s.compareTable}>
                <thead>
                  <tr>
                    <th style={{ ...s.th, width: '34%' }}>Parameter Kinerja</th>
                    <th style={{ ...s.th, width: '33%', textAlign: 'center' }}>{nameA}</th>
                    <th style={{ ...s.th, width: '33%', textAlign: 'center' }}>{unitB ? nameB : '-'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={s.tr}>
                    <td style={s.tdParam}>
                      <div style={s.paramTitle}><Zap size={14} style={{ color: '#74c02c' }} /> Tenaga Mesin (Power)</div>
                      <div style={s.paramDesc}>Daya dorong mesin saat operasi kontinyu</div>
                    </td>
                    <td style={s.tdValue}>
                      <div style={s.valNumber}>{hpA || '-'} <span style={{ fontSize: '0.8rem' }}>HP</span></div>
                      {hpA && hpB && hpA > hpB && <span style={s.betterBadgeGreen}>✓ Tenaga Lebih Tinggi (+{hpA - hpB} HP)</span>}
                    </td>
                    <td style={s.tdValue}>
                      <div style={s.valNumber}>{hpB || '-'} <span style={{ fontSize: '0.8rem' }}>HP</span></div>
                      {hpA && hpB && hpB > hpA && <span style={s.betterBadgeBlue}>✓ Tenaga Lebih Tinggi (+{hpB - hpA} HP)</span>}
                    </td>
                  </tr>

                  <tr style={s.tr}>
                    <td style={s.tdParam}>
                      <div style={s.paramTitle}><Tag size={14} style={{ color: '#64748b' }} /> Seri Mesin / Model</div>
                      <div style={s.paramDesc}>Tipe pabrikan & konfigurasi silinder</div>
                    </td>
                    <td style={s.tdValue}>
                      <div style={s.valText}>{unitA?.model || '-'} ({unitA?.brand || 'Excavator'})</div>
                    </td>
                    <td style={s.tdValue}>
                      <div style={s.valText}>{unitB?.model || '-'} ({unitB?.brand || 'Excavator'})</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 2. KAPASITAS BUCKET & JANGKAUAN GALI */}
            <div style={s.specSectionCard}>
              <div style={s.specSectionHead}>
                <Layers size={16} style={{ color: '#3b82f6' }} />
                <span style={s.specSectionTitle}>2. Kapasitas Bucket & Jangkauan Penggalian</span>
              </div>
              <table style={s.compareTable}>
                <thead>
                  <tr>
                    <th style={{ ...s.th, width: '34%' }}>Parameter Kerja</th>
                    <th style={{ ...s.th, width: '33%', textAlign: 'center' }}>{nameA}</th>
                    <th style={{ ...s.th, width: '33%', textAlign: 'center' }}>{unitB ? nameB : '-'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={s.tr}>
                    <td style={s.tdParam}>
                      <div style={s.paramTitle}><Layers size={14} style={{ color: '#3b82f6' }} /> Kapasitas Bucket</div>
                      <div style={s.paramDesc}>Volume tampung material per siklus kerja</div>
                    </td>
                    <td style={s.tdValue}>
                      <div style={s.valNumber}>{bucketA || '-'} <span style={{ fontSize: '0.8rem' }}>m³</span></div>
                      {bucketA && bucketB && bucketA > bucketB && <span style={s.betterBadgeBlue}>✓ Kapasitas Lebih Besar (+{(bucketA - bucketB).toFixed(2)} m³)</span>}
                    </td>
                    <td style={s.tdValue}>
                      <div style={s.valNumber}>{bucketB || '-'} <span style={{ fontSize: '0.8rem' }}>m³</span></div>
                      {bucketA && bucketB && bucketB > bucketA && <span style={s.betterBadgeBlue}>✓ Kapasitas Lebih Besar (+{(bucketB - bucketA).toFixed(2)} m³)</span>}
                    </td>
                  </tr>

                  <tr style={s.tr}>
                    <td style={s.tdParam}>
                      <div style={s.paramTitle}><Maximize2 size={14} style={{ color: '#10b981' }} /> Kedalaman Gali Maksimal</div>
                      <div style={s.paramDesc}>Jangkauan penggalian vertikal ke bawah</div>
                    </td>
                    <td style={s.tdValue}>
                      <div style={s.valNumber}>{depthA || '-'} <span style={{ fontSize: '0.8rem' }}>Meter</span></div>
                      {depthA && depthB && depthA > depthB && <span style={s.betterBadgeGreen}>✓ Jangkauan Lebih Dalam (+{(depthA - depthB).toFixed(2)} m)</span>}
                    </td>
                    <td style={s.tdValue}>
                      <div style={s.valNumber}>{depthB || '-'} <span style={{ fontSize: '0.8rem' }}>Meter</span></div>
                      {depthA && depthB && depthB > depthA && <span style={s.betterBadgeGreen}>✓ Jangkauan Lebih Dalam (+{(depthB - depthA).toFixed(2)} m)</span>}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 3. BOBOT OPERASIONAL & KLASIFIKASI TONASE */}
            <div style={s.specSectionCard}>
              <div style={s.specSectionHead}>
                <Scale size={16} style={{ color: '#8b5cf6' }} />
                <span style={s.specSectionTitle}>3. Bobot Operasional & Klasifikasi Tonase</span>
              </div>
              <table style={s.compareTable}>
                <thead>
                  <tr>
                    <th style={{ ...s.th, width: '34%' }}>Parameter Fisik</th>
                    <th style={{ ...s.th, width: '33%', textAlign: 'center' }}>{nameA}</th>
                    <th style={{ ...s.th, width: '33%', textAlign: 'center' }}>{unitB ? nameB : '-'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={s.tr}>
                    <td style={s.tdParam}>
                      <div style={s.paramTitle}><Scale size={14} style={{ color: '#8b5cf6' }} /> Berat Operasional</div>
                      <div style={s.paramDesc}>Stabilitas traksi dan daya tekan di tanah</div>
                    </td>
                    <td style={s.tdValue}>
                      <div style={s.valNumber}>{weightA || '-'} <span style={{ fontSize: '0.8rem' }}>Ton</span></div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '2px' }}>Stabilitas Optimal</span>
                    </td>
                    <td style={s.tdValue}>
                      <div style={s.valNumber}>{weightB || '-'} <span style={{ fontSize: '0.8rem' }}>Ton</span></div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '2px' }}>Stabilitas Optimal</span>
                    </td>
                  </tr>

                  <tr style={s.tr}>
                    <td style={s.tdParam}>
                      <div style={s.paramTitle}><Award size={14} style={{ color: '#74c02c' }} /> Kelas Tonase Excavator</div>
                      <div style={s.paramDesc}>Klasifikasi armada pengadaan proyek</div>
                    </td>
                    <td style={s.tdValue}>
                      <div style={s.valText}>Kelas {unitA?.kapasitas_ton || 5} Ton ({unitA?.kapasitas_ton >= 30 ? 'Heavy Mining' : unitA?.kapasitas_ton >= 20 ? 'Medium Construction' : 'Mini Excavator'})</div>
                    </td>
                    <td style={s.tdValue}>
                      <div style={s.valText}>Kelas {unitB?.kapasitas_ton || 5} Ton ({unitB?.kapasitas_ton >= 30 ? 'Heavy Mining' : unitB?.kapasitas_ton >= 20 ? 'Medium Construction' : 'Mini Excavator'})</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. FINANSIAL, KESIAPAN STOK & LAYANAN PDI */}
            <div style={s.specSectionCard}>
              <div style={s.specSectionHead}>
                <Tag size={16} style={{ color: '#15803d' }} />
                <span style={s.specSectionTitle}>4. Estimasi Harga Beli, Kesiapan Stok & Layanan PDI</span>
              </div>
              <table style={s.compareTable}>
                <thead>
                  <tr>
                    <th style={{ ...s.th, width: '34%' }}>Parameter Finansial & Operasional</th>
                    <th style={{ ...s.th, width: '33%', textAlign: 'center' }}>{nameA}</th>
                    <th style={{ ...s.th, width: '33%', textAlign: 'center' }}>{unitB ? nameB : '-'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={s.tr}>
                    <td style={s.tdParam}>
                      <div style={s.paramTitle}><Tag size={14} style={{ color: '#15803d' }} /> Estimasi Harga Unit (OTR)</div>
                      <div style={s.paramDesc}>Estimasi harga resmi belum termasuk diskon volume</div>
                    </td>
                    <td style={s.tdValue}>
                      <div style={{ ...s.valNumber, color: '#15803d' }}>
                        {priceA ? `Rp ${(priceA / 1e6).toLocaleString('id-ID')} Jt` : 'Hubungi Sales'}
                      </div>
                      {priceA && priceB && priceA < priceB && (
                        <span style={s.betterBadgeGreen}>✓ Lebih Ekonomis (Hemat Rp {((priceB - priceA) / 1e6).toLocaleString('id-ID')} Jt)</span>
                      )}
                    </td>
                    <td style={s.tdValue}>
                      <div style={{ ...s.valNumber, color: '#15803d' }}>
                        {priceB ? `Rp ${(priceB / 1e6).toLocaleString('id-ID')} Jt` : 'Hubungi Sales'}
                      </div>
                      {priceA && priceB && priceB < priceA && (
                        <span style={s.betterBadgeGreen}>✓ Lebih Ekonomis (Hemat Rp {((priceA - priceB) / 1e6).toLocaleString('id-ID')} Jt)</span>
                      )}
                    </td>
                  </tr>

                  <tr style={s.tr}>
                    <td style={s.tdParam}>
                      <div style={s.paramTitle}><CheckCircle2 size={14} style={{ color: '#15803d' }} /> Ketersediaan Stok Ready</div>
                      <div style={s.paramDesc}>Status ketersediaan unit di pool pengiriman</div>
                    </td>
                    <td style={s.tdValue}>
                      <span style={{ color: '#15803d', fontWeight: '800' }}>Ready Stock ({unitA?.stock || 1} Unit)</span>
                    </td>
                    <td style={s.tdValue}>
                      <span style={{ color: '#15803d', fontWeight: '800' }}>Ready Stock ({unitB?.stock || 1} Unit)</span>
                    </td>
                  </tr>

                  <tr style={s.tr}>
                    <td style={s.tdParam}>
                      <div style={s.paramTitle}><ShieldCheck size={14} style={{ color: '#74c02c' }} /> Inspeksi PDI & Terbit BAST</div>
                      <div style={s.paramDesc}>Sertifikasi uji 6 titik vital & serah terima resmi</div>
                    </td>
                    <td style={s.tdValue}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155' }}>✓ Sertifikasi PDI & BAST Lengkap</span>
                    </td>
                    <td style={s.tdValue}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155' }}>✓ Sertifikasi PDI & BAST Lengkap</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={s.footer}>
          <button onClick={onClose} style={s.btnSecondary}>
            Tutup Perbandingan
          </button>
          <div style={s.footerRight}>
            <span style={s.footerHint}>
              *Gunakan tombol <strong>Ajukan RFQ</strong> pada salah satu unit di atas untuk mengajukan penawaran harga resmi.
            </span>
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
    backgroundColor: 'rgba(13, 20, 30, 0.78)',
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
    maxWidth: '1080px',
    maxHeight: '94vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 25px 60px -15px rgba(13, 20, 30, 0.45)',
    border: '1.5px solid #e2e8f0',
    animation: 'slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  header: {
    padding: '1.25rem 2rem',
    borderBottom: '1.5px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
  },
  headerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.72rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    color: '#15803d',
    backgroundColor: '#ecfccb',
    padding: '0.15rem 0.55rem',
    borderRadius: '5px',
    letterSpacing: '0.5px',
    marginBottom: '0.35rem',
  },
  headerTitle: {
    fontSize: '1.45rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#0d141e',
    margin: '0 0 0.15rem',
    letterSpacing: '-0.025em',
  },
  headerSub: {
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
    padding: '1.75rem 2rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.75rem',
  },
  unitCardsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 60px 1fr',
    gap: '1rem',
    alignItems: 'stretch',
  },
  unitHeaderCard: {
    backgroundColor: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: '14px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  unitCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  unitCardSlotBadge: {
    fontSize: '0.7rem',
    fontWeight: '800',
    color: '#15803d',
    backgroundColor: '#ecfccb',
    padding: '0.12rem 0.5rem',
    borderRadius: '4px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  btnRemoveCard: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    background: '#fee2e2',
    color: '#991b1b',
    border: 'none',
    borderRadius: '5px',
    padding: '0.2rem 0.5rem',
    fontSize: '0.7rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  unitCardMedia: {
    position: 'relative',
    height: '140px',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    marginBottom: '0.85rem',
  },
  unitCardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  unitCardPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  unitTonTag: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    backgroundColor: '#0d141e',
    color: '#74c02c',
    fontSize: '0.66rem',
    fontWeight: '800',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
  },
  unitCardInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  brandBadge: {
    display: 'inline-block',
    fontSize: '0.68rem',
    fontWeight: '800',
    color: '#15803d',
    backgroundColor: '#ecfccb',
    padding: '0.1rem 0.45rem',
    borderRadius: '4px',
    alignSelf: 'flex-start',
    marginBottom: '0.3rem',
    textTransform: 'uppercase',
  },
  unitCardTitle: {
    fontSize: '1.15rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '800',
    color: '#0d141e',
    margin: '0 0 0.15rem',
  },
  unitCardModel: {
    fontSize: '0.78rem',
    color: '#64748b',
    margin: '0 0 0.75rem',
  },
  unitPriceBox: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.5rem 0.75rem',
    marginBottom: '0.85rem',
    marginTop: 'auto',
  },
  priceLabel: {
    display: 'block',
    fontSize: '0.64rem',
    color: '#64748b',
    fontWeight: '600',
  },
  priceVal: {
    fontSize: '1.1rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    color: '#15803d',
  },
  btnRfqDirect: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    padding: '0.65rem 1rem',
    backgroundColor: '#0d141e',
    color: '#74c02c',
    border: 'none',
    borderRadius: '8px',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.85rem',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(13, 20, 30, 0.2)',
  },
  vsDividerWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsBadge: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    backgroundColor: '#0d141e',
    color: '#74c02c',
    fontSize: '0.92rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '900',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(13, 20, 30, 0.3)',
    border: '3px solid #ffffff',
  },
  emptySlotCard: {
    backgroundColor: '#f8fafc',
    border: '2px dashed #cbd5e1',
    borderRadius: '14px',
    padding: '2rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSelectOther: {
    padding: '0.6rem 1.15rem',
    backgroundColor: '#0d141e',
    color: '#74c02c',
    border: 'none',
    borderRadius: '7px',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    fontSize: '0.82rem',
    cursor: 'pointer',
  },
  verdictCard: {
    backgroundColor: '#0d141e',
    color: '#ffffff',
    borderRadius: '14px',
    padding: '1.25rem 1.5rem',
    border: '1.5px solid #1f2937',
    boxShadow: '0 4px 14px rgba(13, 20, 30, 0.2)',
  },
  verdictHead: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.85rem',
    paddingBottom: '0.65rem',
    borderBottom: '1px solid #1f2937',
  },
  verdictTitle: {
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.92rem',
    color: '#74c02c',
    letterSpacing: '0.5px',
  },
  verdictGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  verdictCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  verdictUnitName: {
    fontSize: '0.84rem',
    fontWeight: '800',
    color: '#f8fafc',
    fontFamily: "'Urbanist', sans-serif",
    marginBottom: '0.2rem',
  },
  verdictList: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem',
    fontSize: '0.78rem',
    color: '#cbd5e1',
  },
  specsGroupWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  specSectionCard: {
    backgroundColor: '#ffffff',
    border: '1.5px solid #e2e8f0',
    borderRadius: '14px',
    overflow: 'hidden',
  },
  specSectionHead: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.85rem 1.25rem',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '0.86rem',
    fontWeight: '900',
    color: '#0d141e',
    fontFamily: "'Urbanist', sans-serif",
  },
  specSectionTitle: {
    letterSpacing: '0.3px',
  },
  compareTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '0.75rem 1.25rem',
    backgroundColor: '#f1f5f9',
    fontSize: '0.8rem',
    fontWeight: '800',
    color: '#334155',
    borderBottom: '1.5px solid #e2e8f0',
    fontFamily: "'Urbanist', sans-serif",
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  tdParam: {
    padding: '0.85rem 1.25rem',
    backgroundColor: '#fafafa',
    borderRight: '1px solid #f1f5f9',
  },
  paramTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    fontSize: '0.84rem',
    fontWeight: '800',
    color: '#0d141e',
    marginBottom: '0.15rem',
  },
  paramDesc: {
    fontSize: '0.7rem',
    color: '#64748b',
  },
  tdValue: {
    padding: '0.85rem 1.25rem',
    textAlign: 'center',
    verticalAlign: 'middle',
    borderRight: '1px solid #f1f5f9',
  },
  valNumber: {
    fontSize: '1.05rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    color: '#0d141e',
  },
  valText: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#334155',
  },
  betterBadgeGreen: {
    display: 'inline-block',
    marginTop: '0.25rem',
    fontSize: '0.68rem',
    fontWeight: '800',
    color: '#15803d',
    backgroundColor: '#ecfccb',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
  },
  betterBadgeBlue: {
    display: 'inline-block',
    marginTop: '0.25rem',
    fontSize: '0.68rem',
    fontWeight: '800',
    color: '#1e40af',
    backgroundColor: '#dbeafe',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.15rem 2rem',
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
  footerRight: {
    fontSize: '0.78rem',
    color: '#64748b',
  },
  footerHint: {
    fontStyle: 'italic',
  },
};

export default CompareAlatBeratModal;
