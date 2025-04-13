// controllers/shippingAddressController.js
const ShippingAddress = require('../models/ShippingAddress');

// Get all addresses for the current user
exports.getUserAddresses = async (req, res) => {
    try {
        const addresses = await ShippingAddress.find({ user: req.user._id })
            .sort({ isDefault: -1, createdAt: -1 });
        
        res.status(200).json({
            success: true,
            addresses
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error retrieving addresses', 
            error: error.message 
        });
    }
};

// Add a new address
exports.addAddress = async (req, res) => {
    try {
        const { fullName, phone, address, city, state, zipCode, isDefault } = req.body;
        
        // Validate required fields
        if (!fullName || !phone || !address || !city || !state || !zipCode) {
            return res.status(400).json({ 
                success: false,
                message: 'All address fields are required' 
            });
        }
        
        // If this will be the default address, unset any existing default
        if (isDefault) {
            await ShippingAddress.updateMany(
                { user: req.user._id },
                { $set: { isDefault: false } }
            );
        }
        
        // Check if this is the first address (should be default)
        const addressCount = await ShippingAddress.countDocuments({ user: req.user._id });
        const shouldBeDefault = addressCount === 0 || isDefault;
        
        // Create the new address
        const newAddress = await ShippingAddress.create({
            user: req.user._id,
            fullName,
            phone,
            address,
            city,
            state,
            zipCode,
            isDefault: shouldBeDefault
        });
        
        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            address: newAddress
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error adding address', 
            error: error.message 
        });
    }
};

// Update an existing address
exports.updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const { fullName, phone, address, city, state, zipCode, isDefault } = req.body;
        
        // Find the address and check ownership
        const existingAddress = await ShippingAddress.findOne({
            _id: addressId,
            user: req.user._id
        });
        
        if (!existingAddress) {
            return res.status(404).json({ 
                success: false,
                message: 'Address not found or not authorized' 
            });
        }
        
        // If setting as default, handle that logic
        if (isDefault && !existingAddress.isDefault) {
            await ShippingAddress.setDefault(addressId, req.user._id);
        }
        
        // Update the address fields
        const updatedAddress = await ShippingAddress.findByIdAndUpdate(
            addressId,
            {
                fullName: fullName || existingAddress.fullName,
                phone: phone || existingAddress.phone,
                address: address || existingAddress.address,
                city: city || existingAddress.city,
                state: state || existingAddress.state,
                zipCode: zipCode || existingAddress.zipCode,
            },
            { new: true }
        );
        
        res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            address: updatedAddress
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error updating address', 
            error: error.message 
        });
    }
};

// Delete an address
exports.deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        
        // Find the address to check if it's the default
        const addressToDelete = await ShippingAddress.findOne({
            _id: addressId,
            user: req.user._id
        });
        
        if (!addressToDelete) {
            return res.status(404).json({ 
                success: false,
                message: 'Address not found or not authorized' 
            });
        }
        
        // Delete the address
        await ShippingAddress.findByIdAndDelete(addressId);
        
        // If deleted address was default, set another as default if available
        if (addressToDelete.isDefault) {
            const anotherAddress = await ShippingAddress.findOne({ user: req.user._id });
            if (anotherAddress) {
                await ShippingAddress.findByIdAndUpdate(anotherAddress._id, { isDefault: true });
            }
        }
        
        res.status(200).json({
            success: true,
            message: 'Address deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error deleting address', 
            error: error.message 
        });
    }
};

// Set an address as default
exports.setDefaultAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        
        // Check if address exists and belongs to user
        const address = await ShippingAddress.findOne({
            _id: addressId,
            user: req.user._id
        });
        
        if (!address) {
            return res.status(404).json({ 
                success: false,
                message: 'Address not found or not authorized' 
            });
        }
        
        // Set as default
        await ShippingAddress.setDefault(addressId, req.user._id);
        
        res.status(200).json({
            success: true,
            message: 'Default address set successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error setting default address', 
            error: error.message 
        });
    }
};