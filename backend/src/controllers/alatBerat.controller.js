const alatBeratService = require('../services/alatBerat.service');

const getAll = async (req, res) => {
  try {
    // Mengambil query parameter (misal: ?tipe_katalog=saw)
    const { tipe_katalog } = req.query; 
    
    const data = await alatBeratService.getAllAlatBerat(tipe_katalog);
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data alat berat',
      data: data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const userId = req.user.id;
    const newId = await alatBeratService.addAlatBerat(req.body, userId);
    
    res.status(201).json({
      success: true,
      message: 'Alat berat berhasil ditambahkan ke katalog',
      data: { id: newId }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAll,
  create
};