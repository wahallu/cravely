const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalEarnings: { type: Number, default: 0 },
  completedOrders: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Driver", driverSchema);
