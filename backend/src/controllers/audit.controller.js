const db = require('../config/database');

const getAllLogs = async (req, res) => {
  try {
    // Kita gabungkan (JOIN) dengan tabel users agar nama pelakunya muncul
    const query = `
      SELECT 
        a.id, 
        a.action, 
        a.entity, 
        a.description, 
        a.created_at, 
        u.fullname, 
        r.name AS role_name
      FROM audit_logs a
      JOIN users u ON a.user_id = u.id
      JOIN roles r ON u.role_id = r.id
      ORDER BY a.created_at DESC
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

module.exports = { getAllLogs };