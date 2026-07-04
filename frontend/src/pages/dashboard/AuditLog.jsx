import { useState, useEffect } from 'react';
import { auditService } from '../../services/audit.service';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const result = await auditService.getLogs();
      if (result && result.success) {
        setLogs(result.data);
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'INSERT': return { bg: '#dcfce7', text: '#166534' };
      case 'UPDATE': return { bg: '#dbeafe', text: '#1e40af' };
      case 'DELETE': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Log Aktivitas Sistem (Audit Trail)</h2>
      <p style={styles.subtitle}>Rekam jejak seluruh aktivitas pengguna di dalam aplikasi</p>

      {loading && <p>Memuat data riwayat...</p>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {!loading && !error && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Waktu</th>
                <th style={styles.th}>Pengguna</th>
                <th style={styles.th}>Aksi</th>
                <th style={styles.th}>Modul</th>
                <th style={styles.th}>Deskripsi Lengkap</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const actionColor = getActionColor(log.action);
                return (
                  <tr key={log.id} style={styles.tr}>
                    <td style={styles.td}>
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </td>
                    <td style={styles.td}>
                      <strong>{log.fullname}</strong>
                      <br/>
                      <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{log.role_name}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, backgroundColor: actionColor.bg, color: actionColor.text }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={styles.td}>{log.entity}</td>
                    <td style={styles.td}>{log.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  title: { margin: '0 0 0.5rem 0', color: '#1f2937' },
  subtitle: { margin: '0 0 2rem 0', color: '#6b7280', fontSize: '0.9rem' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '1rem', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#4b5563', fontWeight: '600' },
  tr: { borderBottom: '1px solid #e5e7eb' },
  td: { padding: '1rem', color: '#374151', verticalAlign: 'middle' },
  badge: { padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }
};

export default AuditLog;