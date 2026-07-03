const quotationService = require('../services/quotation.service');

const getAll = async (req, res) => {
  try {
    const data = await quotationService.getSemuaPenawaran();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createRequest = async (req, res) => {
  try {
    const customerId = req.user.id;
    const newId = await quotationService.ajukanPenawaran(customerId, req.body);
    res.status(201).json({ success: true, message: 'Penawaran berhasil diajukan', data: { id: newId } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateBySales = async (req, res) => {
  try {
    const salesId = req.user.id;
    const quotationId = req.params.id;
    await quotationService.prosesSales(salesId, quotationId, req.body);
    res.status(200).json({ success: true, message: 'Penawaran berhasil diproses oleh Sales' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const approveByManager = async (req, res) => {
  try {
    const managerId = req.user.id;
    const quotationId = req.params.id;
    const { status } = req.body;
    await quotationService.persetujuanManager(managerId, quotationId, status);
    res.status(200).json({ success: true, message: `Penawaran berhasil di-${status}` });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateByOperasional = async (req, res) => {
  try {
    const operasionalId = req.user.id;
    const quotationId = req.params.id;
    const { status } = req.body;
    
    await quotationService.prosesOperasional(operasionalId, quotationId, status);
    
    res.status(200).json({ 
      success: true, 
      message: `Dokumen pengiriman telah di-update, status saat ini: ${status}` 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getAll, createRequest, updateBySales, approveByManager, updateByOperasional };