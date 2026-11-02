require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { initCronJobs } = require('./services/cronService');
const { ensureSystemCategories } = require('./controllers/categoryController');
const { ensureSeedBarcodes } = require('./controllers/barcodeController');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await ensureSystemCategories();
    await ensureSeedBarcodes();
    initCronJobs();

    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 Home Inventory Backend API running on port ${PORT}`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🩺 Health: http://localhost:${PORT}/health`);
      console.log(`=================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

