import { useState, useEffect, useRef } from 'react';
import { auditService } from '../../services/audit.service';
import {
  Activity,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Clock,
  User,
  Layers,
  Zap,
  PlusCircle,
  Edit3,
  Trash2,
  Radio,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  // ── Realtime & Live Stream State ──
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connected' | 'connecting' | 'error'
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [newLogIds, setNewLogIds] = useState(new Set());

  // ── Filters & Search ──
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [filterEntity, setFilterEntity] = useState('ALL');

  useEffect(() => {
    fetchLogs(true);

    // Langganan stream SSE Realtime
    const unsubscribe = auditService.subscribeLogs(
      (newLog) => {
        // Handler ketika ada log baru masuk secara realtime
        setLogs((prevLogs) => {
          // Cegah duplikasi jika log sudah ada
          if (prevLogs.some((l) => l.id === newLog.id)) return prevLogs;
          return [newLog, ...prevLogs];
        });

        // Tandai ID log baru untuk efek visual highlight
        setNewLogIds((prev) => new Set(prev).add(newLog.id));
        setLastSyncTime(new Date());

        // Hapus penanda highlight setelah 5 detik
        setTimeout(() => {
          setNewLogIds((prev) => {
            const next = new Set(prev);
            next.delete(newLog.id);
            return next;
          });
        }, 5000);
      },
      (status) => {
        setConnectionStatus(status);
      }
    );

    // Fallback interval sinkronisasi setiap 12 detik untuk keandalan maksimal
    const pollInterval = setInterval(() => {
      fetchLogs(false);
    }, 12000);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, []);

  const fetchLogs = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setRefreshing(true);
    
    try {
      const result = await auditService.getLogs();
      if (result && result.success) {
        setLogs(result.data || []);
        setLastSyncTime(new Date());
        setError('');
      }
    } catch (err) {
      if (isInitial) {
        setError(typeof err === 'string' ? err : 'Gagal memuat riwayat log aktivitas.');
      }
    } finally {
      if (isInitial) setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchLogs(false);
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'INSERT':
        return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0', icon: <PlusCircle size={13} /> };
      case 'UPDATE':
        return { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe', icon: <Edit3 size={13} /> };
      case 'DELETE':
        return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5', icon: <Trash2 size={13} /> };
      default:
        return { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1', icon: <Activity size={13} /> };
    }
  };

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 10) return 'Baru saja';
    if (diffSec < 60) return `${diffSec} detik lalu`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} menit lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} jam lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  // ── Unique Entities for Filter ──
  const uniqueEntities = Array.from(new Set(logs.map((l) => l.entity).filter(Boolean)));

  // ── Filtered Logs Calculation ──
  const filteredLogs = logs.filter((log) => {
    // Action filter
    if (filterAction !== 'ALL' && log.action !== filterAction) return false;
    // Entity filter
    if (filterEntity !== 'ALL' && log.entity !== filterEntity) return false;
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const desc = (log.description || '').toLowerCase();
      const name = (log.fullname || '').toLowerCase();
      const role = (log.role_name || '').toLowerCase();
      const entity = (log.entity || '').toLowerCase();
      const action = (log.action || '').toLowerCase();
      return desc.includes(q) || name.includes(q) || role.includes(q) || entity.includes(q) || action.includes(q);
    }
    return true;
  });

  // ── Quick Summary Statistics ──
  const totalLogs = logs.length;
  const todayLogs = logs.filter((l) => {
    const d = new Date(l.created_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;
  const insertCount = logs.filter((l) => l.action === 'INSERT').length;
  const updateCount = logs.filter((l) => l.action === 'UPDATE').length;
  const deleteCount = logs.filter((l) => l.action === 'DELETE').length;

  return (
    <div style={s.page}>
      {/* ── Header & Realtime Status Bar ── */}
      <div style={s.headerCard}>
        <div style={s.headerLeft}>
          <div style={s.headerIconWrap}>
            <Activity size={24} style={{ color: '#b45309' }} />
          </div>
          <div>
            <div style={s.headerTagRow}>
              <span style={s.headerTag}>AUDIT TRAIL & SYSTEM LOGS</span>
              
              {/* Realtime Live Status Indicator */}
              <div style={{
                ...s.liveStatusBadge,
                backgroundColor: connectionStatus === 'connected' ? '#ecfdf5' : '#fffbeb',
                color: connectionStatus === 'connected' ? '#065f46' : '#92400e',
                borderColor: connectionStatus === 'connected' ? '#a7f3d0' : '#fde68a',
              }}>
                <span style={{
                  ...s.liveDot,
                  backgroundColor: connectionStatus === 'connected' ? '#10b981' : '#f59e0b',
                  animation: connectionStatus === 'connected' ? 'pulseGlow 1.5s infinite' : 'none',
                }} />
                <span>
                  {connectionStatus === 'connected' 
                    ? '● Live Realtime Stream Aktif' 
                    : connectionStatus === 'connecting' 
                    ? '○ Menyambungkan Realtime...' 
                    : '⚠ Mode Polling Aktif'}
                </span>
              </div>
            </div>

            <h1 style={s.title}>Log Aktivitas Sistem (Audit Trail)</h1>
            <p style={s.subtitle}>
              Pemantauan rekam jejak aktivitas operasional pengguna di seluruh modul sistem secara realtime.
            </p>
          </div>
        </div>

        {/* Refresh & Sync Controls */}
        <div style={s.headerActions}>
          <div style={s.lastSyncText}>
            <Clock size={13} style={{ color: '#94a3b8' }} />
            <span>Update: {lastSyncTime.toLocaleTimeString('id-ID')}</span>
          </div>

          <button 
            onClick={handleManualRefresh}
            disabled={refreshing}
            style={s.btnRefresh}
            title="Segarkan data log sekarang"
          >
            <RefreshCw size={15} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            <span>{refreshing ? 'Menyinkronkan...' : 'Segarkan'}</span>
          </button>
        </div>
      </div>

      {/* ── Summary Stats Cards ── */}
      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <div style={s.statIconWrap}><Activity size={20} style={{ color: '#0f172a' }} /></div>
          <div>
            <span style={s.statLabel}>Total Aktivitas</span>
            <div style={s.statVal}>{totalLogs} <span style={s.statUnit}>Entri</span></div>
          </div>
        </div>

        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, backgroundColor: '#ecfdf5' }}>
            <Zap size={20} style={{ color: '#059669' }} />
          </div>
          <div>
            <span style={s.statLabel}>Aktivitas Hari Ini</span>
            <div style={s.statVal}>{todayLogs} <span style={s.statUnit}>Hari Ini</span></div>
          </div>
        </div>

        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, backgroundColor: '#eff6ff' }}>
            <PlusCircle size={20} style={{ color: '#2563eb' }} />
          </div>
          <div>
            <span style={s.statLabel}>Operasi Tambah (INSERT)</span>
            <div style={s.statVal}>{insertCount} <span style={s.statUnit}>Entri</span></div>
          </div>
        </div>

        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, backgroundColor: '#fef2f2' }}>
            <Edit3 size={20} style={{ color: '#dc2626' }} />
          </div>
          <div>
            <span style={s.statLabel}>Operasi Ubah & Hapus</span>
            <div style={s.statVal}>{updateCount + deleteCount} <span style={s.statUnit}>Entri</span></div>
          </div>
        </div>
      </div>

      {/* ── Toolbar: Search & Action Filters ── */}
      <div style={s.toolbar}>
        {/* Search Box */}
        <div style={s.searchBox}>
          <Search size={16} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Cari nama pengguna, peran, deskripsi, atau modul..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={s.searchInput}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={s.clearSearchBtn}>✕</button>
          )}
        </div>

        {/* Action Filter Pills */}
        <div style={s.actionFilterGroup}>
          {[
            { key: 'ALL', label: 'Semua Aksi' },
            { key: 'INSERT', label: 'INSERT (+)' },
            { key: 'UPDATE', label: 'UPDATE (✎)' },
            { key: 'DELETE', label: 'DELETE (✕)' },
          ].map((act) => (
            <button
              key={act.key}
              onClick={() => setFilterAction(act.key)}
              style={{
                ...s.actionFilterBtn,
                backgroundColor: filterAction === act.key ? '#0f172a' : '#ffffff',
                color: filterAction === act.key ? '#fbbf24' : '#475569',
                borderColor: filterAction === act.key ? '#0f172a' : '#cbd5e1',
                fontWeight: filterAction === act.key ? '800' : '600',
              }}
            >
              {act.label}
            </button>
          ))}
        </div>

        {/* Entity Module Dropdown */}
        {uniqueEntities.length > 0 && (
          <div style={s.entitySelectWrap}>
            <SlidersHorizontal size={14} style={{ color: '#64748b' }} />
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              style={s.entitySelect}
            >
              <option value="ALL">Semua Modul</option>
              {uniqueEntities.map((ent) => (
                <option key={ent} value={ent}>Modul: {ent}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Table / Content ── */}
      {loading ? (
        <div style={s.loadingBox}>
          <div style={s.spinner} />
          <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: '600' }}>
            Memuat rekam jejak audit log sistem...
          </p>
        </div>
      ) : error ? (
        <div style={s.errorBox}>
          <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
          <span>{error}</span>
          <button onClick={() => fetchLogs(true)} style={s.btnRetry}>Coba Lagi</button>
        </div>
      ) : filteredLogs.length > 0 ? (
        <div style={s.tableContainer}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={{ ...s.th, width: '16%' }}>Waktu Aktivitas</th>
                <th style={{ ...s.th, width: '20%' }}>Pengguna & Peran</th>
                <th style={{ ...s.th, width: '12%', textAlign: 'center' }}>Jenis Aksi</th>
                <th style={{ ...s.th, width: '14%' }}>Modul Entitas</th>
                <th style={{ ...s.th, width: '38%' }}>Deskripsi Lengkap Aktivitas</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const actionColor = getActionColor(log.action);
                const isNew = newLogIds.has(log.id);

                return (
                  <tr 
                    key={log.id} 
                    style={{
                      ...s.tr,
                      backgroundColor: isNew ? '#f0fdf4' : '#ffffff',
                      transition: 'background-color 0.8s ease',
                    }}
                  >
                    {/* Waktu */}
                    <td style={s.td}>
                      <div style={s.timeMain}>
                        {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                      <div style={s.timeSub}>
                        {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <span style={s.timeRelative}>
                        {getRelativeTime(log.created_at)}
                      </span>
                    </td>

                    {/* Pengguna & Role */}
                    <td style={s.td}>
                      <div style={s.userRow}>
                        <div style={s.userAvatar}>
                          {(log.fullname || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={s.userName}>{log.fullname || 'Sistem / Anonim'}</div>
                          <span style={s.userRoleBadge}>
                            {log.role_name ? log.role_name.toUpperCase() : 'USER'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Aksi Badge */}
                    <td style={{ ...s.td, textAlign: 'center' }}>
                      <span style={{
                        ...s.actionBadge,
                        backgroundColor: actionColor.bg,
                        color: actionColor.text,
                        borderColor: actionColor.border,
                      }}>
                        {actionColor.icon}
                        <span>{log.action}</span>
                      </span>
                      {isNew && (
                        <span style={s.newFlashBadge}>BARU</span>
                      )}
                    </td>

                    {/* Modul Entitas */}
                    <td style={s.td}>
                      <span style={s.entityBadge}>
                        <Layers size={12} style={{ color: '#475569' }} />
                        <span>{log.entity || 'General'}</span>
                      </span>
                      {log.entity_id && (
                        <span style={s.entityIdText}>ID #{log.entity_id}</span>
                      )}
                    </td>

                    {/* Deskripsi Lengkap */}
                    <td style={s.td}>
                      <div style={s.descText}>
                        {log.description || '-'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={s.emptyBox}>
          <Activity size={48} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
          <h4 style={{ color: '#0f172a', margin: '0 0 0.35rem' }}>Tidak ada log yang cocok</h4>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            Coba ubah kata kunci pencarian atau bersihkan filter aksi/modul.
          </p>
        </div>
      )}
    </div>
  );
};

const s = {
  page: {
    padding: '1.75rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1.5px solid #e2e8f0',
    padding: '1.5rem 1.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.25rem',
    boxShadow: '0 4px 14px -2px rgba(15, 23, 42, 0.04)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  headerIconWrap: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: '#fef3c7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTagRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginBottom: '0.35rem',
    flexWrap: 'wrap',
  },
  headerTag: {
    fontSize: '0.72rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    letterSpacing: '1px',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    padding: '0.12rem 0.5rem',
    borderRadius: '4px',
  },
  liveStatusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.72rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '800',
    padding: '0.15rem 0.6rem',
    borderRadius: '999px',
    border: '1px solid',
  },
  liveDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  title: {
    fontSize: '1.45rem',
    fontFamily: "'Sora', sans-serif",
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 0.2rem',
    letterSpacing: '-0.025em',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: 0,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  lastSyncText: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '600',
  },
  btnRefresh: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.65rem 1.15rem',
    backgroundColor: '#0f172a',
    color: '#fbbf24',
    border: 'none',
    borderRadius: '9px',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.86rem',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.2)',
    transition: 'all 0.15s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
  },
  statCard: {
    backgroundColor: '#ffffff',
    border: '1.5px solid #e2e8f0',
    borderRadius: '14px',
    padding: '1.15rem 1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
  },
  statIconWrap: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statLabel: {
    display: 'block',
    fontSize: '0.72rem',
    color: '#64748b',
    fontWeight: '700',
  },
  statVal: {
    fontSize: '1.35rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    color: '#0f172a',
  },
  statUnit: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#94a3b8',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '0.85rem',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#ffffff',
    border: '1.5px solid #cbd5e1',
    borderRadius: '9px',
    padding: '0.55rem 0.85rem',
    flex: 1,
    minWidth: '280px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '0.85rem',
    width: '100%',
    fontFamily: 'inherit',
    color: '#0f172a',
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.8rem',
    padding: 0,
  },
  actionFilterGroup: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap',
  },
  actionFilterBtn: {
    padding: '0.55rem 0.95rem',
    borderRadius: '8px',
    border: '1.5px solid',
    fontSize: '0.78rem',
    fontFamily: "'Urbanist', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  entitySelectWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    backgroundColor: '#ffffff',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.45rem 0.75rem',
  },
  entitySelect: {
    border: 'none',
    outline: 'none',
    fontSize: '0.8rem',
    color: '#334155',
    fontWeight: '700',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1.5px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '0.9rem 1.15rem',
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontSize: '0.78rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    borderBottom: '1.5px solid #e2e8f0',
    letterSpacing: '0.3px',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '0.95rem 1.15rem',
    verticalAlign: 'middle',
    color: '#334155',
    fontSize: '0.84rem',
  },
  timeMain: {
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    fontSize: '0.9rem',
    color: '#0f172a',
  },
  timeSub: {
    fontSize: '0.72rem',
    color: '#64748b',
  },
  timeRelative: {
    display: 'inline-block',
    fontSize: '0.66rem',
    fontWeight: '700',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    padding: '0.05rem 0.35rem',
    borderRadius: '4px',
    marginTop: '0.2rem',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#0f172a',
    color: '#fbbf24',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '0.8rem',
    flexShrink: 0,
  },
  userName: {
    fontWeight: '800',
    color: '#0f172a',
    fontSize: '0.85rem',
  },
  userRoleBadge: {
    display: 'inline-block',
    fontSize: '0.64rem',
    fontWeight: '800',
    color: '#475569',
    backgroundColor: '#f1f5f9',
    padding: '0.05rem 0.35rem',
    borderRadius: '4px',
    marginTop: '0.1rem',
  },
  actionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.25rem 0.6rem',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '0.72rem',
    fontFamily: "'Urbanist', sans-serif",
    fontWeight: '900',
    letterSpacing: '0.5px',
  },
  newFlashBadge: {
    display: 'block',
    fontSize: '0.6rem',
    fontWeight: '900',
    color: '#15803d',
    marginTop: '0.25rem',
    letterSpacing: '0.8px',
  },
  entityBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '0.2rem 0.55rem',
    borderRadius: '5px',
    fontSize: '0.76rem',
    fontWeight: '700',
    color: '#334155',
  },
  entityIdText: {
    display: 'block',
    fontSize: '0.68rem',
    color: '#94a3b8',
    marginTop: '0.15rem',
  },
  descText: {
    fontSize: '0.85rem',
    lineHeight: '1.45',
    color: '#1e293b',
    fontWeight: '500',
  },
  loadingBox: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1.5px solid #e2e8f0',
    padding: '4rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #fef3c7',
    borderTop: '3px solid #f59e0b',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: '10px',
    padding: '1rem 1.25rem',
    color: '#991b1b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.88rem',
  },
  btnRetry: {
    marginLeft: 'auto',
    backgroundColor: '#991b1b',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.35rem 0.85rem',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  emptyBox: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1.5px solid #e2e8f0',
    padding: '4rem 2rem',
    textAlign: 'center',
  },
};

export default AuditLog;