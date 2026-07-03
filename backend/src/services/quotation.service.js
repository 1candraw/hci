const quotationRepository = require('../repositories/quotation.repository');
const auditLogService = require('./auditLog.service');

const ajukanPenawaran = async (customerId, data) => {
  const newId = await quotationRepository.create({ ...data, customer_id: customerId });
  
  // Catat ke log aktivitas
  await auditLogService.logActivity(customerId, 'INSERT', 'quotation', newId, 'Customer mengajukan penawaran baru');
  return newId;
};

const prosesSales = async (salesId, quotationId, data) => {
  await quotationRepository.updateBySales(quotationId, { ...data, sales_id: salesId });
  
  await auditLogService.logActivity(salesId, 'UPDATE', 'quotation', quotationId, 'Sales memperbarui harga dan meneruskan ke Manager');
};

const persetujuanManager = async (managerId, quotationId, status) => {
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw new Error('Status tidak valid. Harus APPROVED atau REJECTED.');
  }

  await quotationRepository.updateStatusByManager(quotationId, { manager_id: managerId, status });
  
  await auditLogService.logActivity(managerId, 'UPDATE', 'quotation', quotationId, `Manager memberikan status: ${status}`);
};

const prosesOperasional = async (operasionalId, quotationId, status) => {
  // Pastikan Operasional hanya bisa memasukkan status ini
  if (!['PROSES_PENGIRIMAN', 'SELESAI'].includes(status)) {
    throw new Error('Status tidak valid. Gunakan PROSES_PENGIRIMAN atau SELESAI.');
  }

  await quotationRepository.updateStatusByOperasional(quotationId, status);
  
  // Catat CCTV
  await auditLogService.logActivity(
    operasionalId, 
    'UPDATE', 
    'quotation', 
    quotationId, 
    `Tim Operasional memperbarui status logistik menjadi: ${status}`
  );
};

const getSemuaPenawaran = async () => {
  return await quotationRepository.findAll();
};

module.exports = { ajukanPenawaran, prosesSales, persetujuanManager, getSemuaPenawaran, prosesOperasional };