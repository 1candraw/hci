import { Scale, X, ArrowRight, Trash2, Truck, Sparkles } from 'lucide-react';

const ComparisonDock = ({
  compareList = [],
  onRemove,
  onClear,
  onOpenCompare
}) => {
  if (!compareList || compareList.length === 0) return null;

  const unit1 = compareList[0];
  const unit2 = compareList[1] || null;
  const count = compareList.length;
  const isReady = count === 2;

  const getUnitName = (u) => {
    if (!u) return '';
    return u.name && u.name.trim() !== 'Excavator' ? u.name : `${u.brand || ''} ${u.model || ''}`;
  };

  return (
    <div style={s.dockContainer}>
      <div style={s.dockInner}>
        {/* Left Status & Header */}
        <div style={s.dockHeader}>
          <div style={s.dockIconWrap}>
            <Scale size={20} style={{ color: '#0d141e' }} />
          </div>
          <div>
            <div style={s.dockTitleRow}>
              <span style={s.dockTitle}>Bandingkan Unit</span>
              <span style={{
                ...s.dockCountBadge,
                backgroundColor: isReady ? '#74c02c' : '#f59e0b',
                color: isReady ? '#0d141e' : '#ffffff'
              }}>
                {count}/2 Unit
              </span>
            </div>
            <p style={s.dockSub}>
              {isReady
                ? '2 Unit siap dibandingkan secara komprehensif'
                : 'Pilih 1 unit lagi dari katalog untuk membandingkan'}
            </p>
          </div>
        </div>

        {/* Selected Units Slots */}
        <div style={s.slotsGrid}>
          {/* Slot 1 */}
          <div style={s.slotCard}>
            <div style={s.slotThumbWrap}>
              {unit1.image_url ? (
                <img src={unit1.image_url} alt={getUnitName(unit1)} style={s.slotThumb} />
              ) : (
                <Truck size={18} style={{ color: '#74c02c' }} />
              )}
            </div>
            <div style={s.slotInfo}>
              <span style={s.slotBrand}>{unit1.brand || 'Excavator'}</span>
              <span style={s.slotName}>{getUnitName(unit1)}</span>
            </div>
            <button
              onClick={() => onRemove(unit1.id)}
              style={s.slotRemoveBtn}
              title="Hapus unit 1"
            >
              <X size={14} />
            </button>
          </div>

          {/* Slot 2 */}
          {unit2 ? (
            <div style={s.slotCard}>
              <div style={s.slotThumbWrap}>
                {unit2.image_url ? (
                  <img src={unit2.image_url} alt={getUnitName(unit2)} style={s.slotThumb} />
                ) : (
                  <Truck size={18} style={{ color: '#3b82f6' }} />
                )}
              </div>
              <div style={s.slotInfo}>
                <span style={s.slotBrand}>{unit2.brand || 'Excavator'}</span>
                <span style={s.slotName}>{getUnitName(unit2)}</span>
              </div>
              <button
                onClick={() => onRemove(unit2.id)}
                style={s.slotRemoveBtn}
                title="Hapus unit 2"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div style={s.slotEmpty}>
              <span style={s.slotEmptyPlus}>+</span>
              <span style={s.slotEmptyText}>Pilih Unit ke-2 dari Katalog</span>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div style={s.dockActions}>
          <button
            onClick={onClear}
            style={s.btnClear}
            title="Kosongkan perbandingan"
          >
            <Trash2 size={15} />
            <span>Reset</span>
          </button>

          <button
            onClick={onOpenCompare}
            disabled={!isReady}
            style={{
              ...s.btnCompareNow,
              opacity: isReady ? 1 : 0.65,
              cursor: isReady ? 'pointer' : 'not-allowed',
            }}
          >
            <Sparkles size={16} />
            <span>Bandingkan Sekarang</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const s = {
  dockContainer: {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9990,
    width: 'calc(100% - 40px)',
    maxWidth: '980px',
    animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  dockInner: {
    backgroundColor: '#0d141e',
    borderRadius: '16px',
    border: '1.5px solid #1f2937',
    boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(116, 192, 44, 0.25)',
    padding: '0.85rem 1.4rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1.25rem',
    color: '#ffffff',
    flexWrap: 'wrap',
  },
  dockHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    minWidth: '200px',
  },
  dockIconWrap: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: '#74c02c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dockTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  dockTitle: {
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.95rem',
    color: '#f8fafc',
  },
  dockCountBadge: {
    fontSize: '0.68rem',
    fontWeight: '900',
    padding: '0.1rem 0.45rem',
    borderRadius: '999px',
  },
  dockSub: {
    fontSize: '0.72rem',
    color: '#94a3b8',
    margin: 0,
  },
  slotsGrid: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: 1,
    minWidth: '280px',
  },
  slotCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    backgroundColor: '#111827',
    border: '1px solid #1f2937',
    borderRadius: '10px',
    padding: '0.35rem 0.65rem 0.35rem 0.45rem',
    flex: 1,
    minWidth: '130px',
  },
  slotThumbWrap: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    backgroundColor: '#0d141e',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  slotThumb: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  slotInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flex: 1,
  },
  slotBrand: {
    fontSize: '0.62rem',
    fontWeight: '800',
    color: '#74c02c',
    textTransform: 'uppercase',
  },
  slotName: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#f8fafc',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  slotRemoveBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '2px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.15s',
  },
  slotEmpty: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
    border: '1.5px dashed #334155',
    borderRadius: '10px',
    padding: '0.5rem 0.85rem',
    flex: 1,
    justifyContent: 'center',
  },
  slotEmptyPlus: {
    color: '#74c02c',
    fontSize: '1rem',
    fontWeight: '900',
  },
  slotEmptyText: {
    fontSize: '0.72rem',
    color: '#94a3b8',
    fontWeight: '600',
  },
  dockActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  btnClear: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '0.6rem 0.85rem',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  btnCompareNow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    backgroundColor: '#74c02c',
    color: '#0d141e',
    border: 'none',
    borderRadius: '8px',
    padding: '0.65rem 1.25rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.88rem',
    boxShadow: '0 4px 14px rgba(116, 192, 44, 0.35)',
    transition: 'all 0.15s',
  },
};

export default ComparisonDock;
