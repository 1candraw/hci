const sawService = require('../services/saw.service');

const calculate = async (req, res) => {
  try {
    // Mengambil custom bobot dari body request (opsional)
    const { weights } = req.body;
    
    const alignmentResult = await sawService.getRecommendations(weights);
    
    res.status(200).json({
      success: true,
      message: 'Perhitungan SAW berhasil diselesaikan',
      data: alignmentResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { calculate };