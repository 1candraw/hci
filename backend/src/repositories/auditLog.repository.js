const db = require('../config/database'); 

const createLog = async (logData) => {
  const { user_id, action, entity, entity_id, description } = logData;
  
  // Menjalankan query untuk menyimpan riwayat ke tabel audit_logs
  const [result] = await db.query(
    `INSERT INTO audit_logs (user_id, action, entity, entity_id, description) 
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, action, entity, entity_id, description]
  );
  
  const newId = result.insertId;

  // Query ulang data lengkap dengan relasi user & role agar siap di-broadcast secara realtime
  try {
    const [rows] = await db.query(
      `SELECT 
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
      WHERE a.id = ?`,
      [newId]
    );

    if (rows && rows.length > 0) {
      return rows[0];
    }
  } catch (err) {
    console.error('Error fetching newly created audit log row:', err);
  }

  return {
    id: newId,
    action,
    entity,
    entity_id,
    description,
    created_at: new Date(),
    fullname: 'User ID ' + user_id,
    role_name: 'Member'
  };
};

module.exports = { 
  createLog 
};