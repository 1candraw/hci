import api from '../api/axios';

const getLogs = async () => {
  try {
    const response = await api.get('/audit');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Gagal mengambil log aktivitas';
  }
};

/**
 * Berlangganan stream realtime audit log melalui Server-Sent Events (SSE)
 * @param {Function} onNewLog - Callback ketika ada log baru masuk
 * @param {Function} onStatusChange - Callback status koneksi ('connected' | 'connecting' | 'error')
 * @returns {Function} cleanup function untuk menutup koneksi SSE
 */
const subscribeLogs = (onNewLog, onStatusChange) => {
  const token = localStorage.getItem('token');
  const streamUrl = `http://localhost:5000/api/audit/stream?token=${encodeURIComponent(token || '')}`;

  let eventSource = null;
  let isClosed = false;

  try {
    eventSource = new EventSource(streamUrl);
    if (onStatusChange) onStatusChange('connecting');

    eventSource.addEventListener('connected', () => {
      if (onStatusChange) onStatusChange('connected');
    });

    eventSource.addEventListener('new_log', (event) => {
      try {
        const logData = JSON.parse(event.data);
        if (onNewLog) onNewLog(logData);
      } catch (err) {
        console.error('Error parsing SSE audit log data:', err);
      }
    });

    eventSource.onerror = () => {
      if (!isClosed) {
        if (onStatusChange) onStatusChange('error');
      }
    };
  } catch (error) {
    console.error('Error creating EventSource for Audit Log:', error);
    if (onStatusChange) onStatusChange('error');
  }

  return () => {
    isClosed = true;
    if (eventSource) {
      eventSource.close();
    }
  };
};

export const auditService = {
  getLogs,
  subscribeLogs
};