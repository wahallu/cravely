const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  driverId: { type: String, required: true, unique: true }, // D001, D002 etc.
    name: { type: String, required: true },
    status: { type: String, enum: ["Available", "On Delivery", "Unavailable"], default: "Available" },
    phone: { type: String },
    licenseNumber: { type: String },
    vehicleType: { type: String },
  totalEarnings: { type: Number, default: 0 },
  completedOrders: { type: Number, default: 0 }
}, 

{ timestamps: true });

module.exports = mongoose.model("Driver", driverSchema);
