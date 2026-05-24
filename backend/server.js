require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { startAnalyticsJob } = require('./src/jobs/analyticsJob');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 DevTrackr Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`💾 MongoDB: Connected\n`);

    // Start background analytics sync job
    startAnalyticsJob();
  });
}).catch((err) => {
  console.error('❌ Failed to connect to MongoDB:', err.message);
  process.exit(1);
});

// Handle unhandled rejections gracefully
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});
