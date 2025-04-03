const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const proxy = require('express-http-proxy');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Service URLs
const serviceUrls = {
  delivery: 'http://localhost:5001',
  order: 'http://localhost:5002',
  restaurant: 'http://localhost:5003',
  user: 'http://localhost:5004'
};

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Service availability check
const checkServiceAvailability = async (serviceUrl) => {
  try {
    const response = await fetch(`${serviceUrl}/health`, { 
      method: 'GET',
      timeout: 2000 // 2 second timeout
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Check all services status
app.get('/status', async (req, res) => {
  const statuses = {};
  
  // Check each service
  for (const [serviceName, url] of Object.entries(serviceUrls)) {
    statuses[serviceName] = await checkServiceAvailability(url);
  }
  
  const runningServices = Object.keys(statuses).filter(service => statuses[service]);
  const notRunningServices = Object.keys(statuses).filter(service => !statuses[service]);
  
  res.status(200).json({
    gateway: 'running',
    services: statuses,
    running: runningServices,
    notRunning: notRunningServices
  });
});

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'Gateway service is running' });
});

// Proxy middleware with error handling
const proxyWithErrorHandling = (serviceUrl) => {
  return async (req, res, next) => {
    const isAvailable = await checkServiceAvailability(serviceUrl);
    if (isAvailable) {
      proxy(serviceUrl)(req, res, next);
    } else {
      res.status(503).json({ error: 'Service unavailable' });
    }
  };
};

// routes with error handling
app.use('/delivery', proxyWithErrorHandling(serviceUrls.delivery));
app.use('/order', proxyWithErrorHandling(serviceUrls.order));
app.use('/restaurant', proxyWithErrorHandling(serviceUrls.restaurant));
app.use('/user', proxyWithErrorHandling(serviceUrls.user));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// run the app
app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});

module.exports = app;