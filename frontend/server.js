const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// Health check endpoint - similar to your other services
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    service: 'Frontend',
    timestamp: new Date().toISOString()
  });
});

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all other requests by serving the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Frontend service running on port ${PORT}`);
});