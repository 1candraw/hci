const auditLogRepository = require('../repositories/auditLog.repository');

const logActivity = async (userId, action, entity, entityId, description) => {
  try {
    await auditLogRepository.createLog({
      user_id: userId,
      action,
      entity,
      entity_id: entityId,
      description
    });
  } catch (error) {
    // Kita gunakan console.error agar jika log gagal, aplikasi tidak crash
    console.error('❌ Gagal mencatat Audit Log:', error.message);
  }
};

module.exports = { logActivity };