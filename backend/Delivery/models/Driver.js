const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const driverSchema = new mongoose.Schema({
    driverId: { type: String, unique: true },
    name: { type: String, required: true },
    email: { 
        type: String, 
        required: true,
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    status: { 
        type: String, 
        enum: ["Available", "On Delivery", "Unavailable"], 
        default: "Available" 
    },
    phone: { type: String },
    licenseNumber: { type: String },
    vehicleType: { type: String },
    totalEarnings: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 }
}, { timestamps: true });

// Generate driver ID
driverSchema.pre('save', async function(next) {
    if (!this.driverId) {
        const count = await mongoose.model('Driver').countDocuments();
        this.driverId = `DRV${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

// Hash password before saving
driverSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
driverSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Driver", driverSchema);
