const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  customer: { type: String, required: true },
  address: { type: String, required: true },
  items: [{ name: String, price: Number }],
  total: Number,
  paymentMethod: String,
  driver: { type: String },
  driverStatus: {
    type: String,
    enum: ["Pending", "In Transit", "Delivered"],
    default: "Pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("Delivery", deliverySchema);
