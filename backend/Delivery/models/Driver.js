const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
    vehicleType: { 
        type: String,
        enum: ["Motorcycle", "Car", "Bicycle"],
        default: "Motorcycle"
    },
    deliveryCities: {
        type: [String],
        default: [],
        validate: {
            validator: function(cities) {
                return cities.length > 0;
            },
            message: 'At least one delivery city must be selected'
        }
    },
    profileImage: {
        type: String,
        default: '/default-driver.png'
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    totalEarnings: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    availableHours: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "18:00" }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    activeDelivery: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Delivery',
        default: null
    }
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

// Generate JWT token
driverSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { id: this._id, role: 'driver' },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// Calculate average rating
driverSchema.methods.calculateRating = async function(newRating) {
    if (newRating) {
        this.totalRatings += 1;
        this.rating = ((this.rating * (this.totalRatings - 1)) + newRating) / this.totalRatings;
        await this.save();
    }
    return this.rating;
};

module.exports = mongoose.model("Driver", driverSchema);
