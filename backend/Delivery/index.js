const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const driverRoutes = require("./routes/driverRoutes");

// Load env vars first
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to Database
(async () => {
    try {
        await connectDB();
        console.log('Database connection established');
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
})();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/drivers", driverRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Server Error',
        error: process.env.NODE_ENV === 'production' ? null : err.message
    });
});

app.listen(PORT, () => {
    console.log(`Driver service running on port ${PORT}`);
});

module.exports = app;