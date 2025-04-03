const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5003;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint - This is required for Gateway service detection
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    service: 'Restaurant',
    timestamp: new Date().toISOString()
  });
});

// Default route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Restaurant service is running' });
});

// Import routes if available
// const deliveryRoutes = require('./routes/deliveryRoutes');
// app.use('/', deliveryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

// run the app
app.listen(PORT, () => {
  console.log(`Restaurant service is running on port ${PORT}`);
});

module.exports = app;