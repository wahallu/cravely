const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const driverRoutes = require("./routes/driverRoutes");
const { protect } = require('./middleware/auth');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint - This is required for Gateway service detection
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    service: 'Driver Service',
    timestamp: new Date().toISOString()
  });
});

// Default route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Delivery service is running' });
});

app.use("/api/drivers", driverRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server Error'
  });
});

// Run the app
app.listen(PORT, () => {
  console.log(`Driver service running on port ${PORT}`);
});

module.exports = app;