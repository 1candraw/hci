const db = require('../config/database');
const { auditEvents } = require('../services/auditlog.service');

// 1. Ambil seluruh riwayat log aktivitas
const getAllLogs = async (req, res) => {
  try {
    const query = `
      SELECT 
        a.id, 
        a.action, 
        a.entity, 
        a.entity_id,
        a.description, 
        a.created_at, 
        u.fullname, 
        r.name AS role_name
      FROM audit_logs a
      JOIN users u ON a.user_id = u.id
      JOIN roles r ON u.role_id = r.id
      ORDER BY a.created_at DESC
      LIMIT 200
    `;
    
    const [rows] = await db.query(query);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error("Error get audit logs:", error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data log aktivitas' });
  }
};

// 2. Stream Realtime Log Aktivitas menggunakan Server-Sent Events (SSE)
const streamLogs = (req, res) => {
  // Set headers untuk SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Kirim sinyal inisialisasi koneksi
  const initialPayload = JSON.stringify({
    type: 'CONNECTED',
    message: 'Koneksi Audit Log Realtime Terhubung',
    timestamp: new Date()
  });
  res.write(`event: connected\ndata: ${initialPayload}\n\n`);

  // Listener ketika ada aktivitas baru yang tercatat
  const onNewLog = (logData) => {
    try {
      res.write(`event: new_log\ndata: ${JSON.stringify(logData)}\n\n`);
    } catch (err) {
      console.error('Error streaming log data:', err);
    }
  };

  auditEvents.on('new_log', onNewLog);

  // Heartbeat ping interval setiap 20 detik untuk mencegah koneksi terputus
  const pingInterval = setInterval(() => {
    try {
      res.write(`: ping\n\n`);
    } catch (e) {
      clearInterval(pingInterval);
    }
  }, 20000);

  // Bersihkan listener ketika client menutup halaman / koneksi
  req.on('close', () => {
    clearInterval(pingInterval);
    auditEvents.off('new_log', onNewLog);
    res.end();
  });
};

module.exports = { getAllLogs, streamLogs };