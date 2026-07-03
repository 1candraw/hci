const dashboardService = require('../services/dashboard.service');

const getDashboard = async (req, res) => {
  try {
    const dashboardData = await dashboardService.getDashboardSummary();
    
    res.status(200).json({
      success: true,
      message: 'Data ringkasan dashboard berhasil dimuat',
      data: dashboardData
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = { getDashboard };