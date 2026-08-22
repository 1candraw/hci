const EventEmitter = require('events');
const auditLogRepository = require('../repositories/auditLog.repository');

class AuditEventEmitter extends EventEmitter {}
const auditEvents = new AuditEventEmitter();

const logActivity = async (userId, action, entity, entityId, description) => {
  try {
    const fullLog = await auditLogRepository.createLog({
      user_id: userId,
      action,
      entity,
      entity_id: entityId,
      description
    });

    // Broadcast realtime event kepada seluruh client / Manager yang sedang terhubung
    if (fullLog) {
      auditEvents.emit('new_log', fullLog);
    }
    
    return fullLog;
  } catch (error) {
    // Kita gunakan console.error agar jika log gagal, aplikasi tidak crash
    console.error('❌ Gagal mencatat Audit Log:', error.message);
  }
};

module.exports = { logActivity, auditEvents };