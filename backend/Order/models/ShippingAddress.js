// models/shippingAddress.js
const mongoose = require('mongoose');

const shippingAddressSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
        index: true // Add index for better query performance
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    zipCode: {
        type: String,
        required: true,
        trim: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, { 
    timestamps: true 
});

// Static method to set an address as default
shippingAddressSchema.statics.setDefault = async function(addressId, userId) {
    // First, set all user's addresses to non-default
    await this.updateMany(
        { user: userId },
        { $set: { isDefault: false } }
    );
    
    // Then set the specified address as default
    await this.updateOne(
        { _id: addressId },
        { $set: { isDefault: true } }
    );
    
    return true;
};

const ShippingAddress = mongoose.model('ShippingAddress', shippingAddressSchema);
module.exports = ShippingAddress;