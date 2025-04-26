const Delivery = require("../models/Delivery");

const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find();
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createDelivery = async (req, res) => {
  try {
    const delivery = new Delivery(req.body);
    const saved = await delivery.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateDeliveryStatus = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });

    delivery.driverStatus = req.body.driverStatus;
    const updated = await delivery.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllDeliveries,
  createDelivery,
  updateDeliveryStatus
};