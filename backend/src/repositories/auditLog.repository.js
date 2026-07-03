const db = require('../config/database');

const createLog = async (logData) => {
  const { user_id, action, entity, entity_id, description } = logData;
  
  // Menjalankan query untuk menyimpan riwayat ke tabel audit_logs
  const [result] = await db.query(
    `INSERT INTO audit_logs (user_id, action, entity, entity_id, description) 
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, action, entity, entity_id, description]
  );
  
  return result.insertId;
};

module.exports = { 
  createLog 
};