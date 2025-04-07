const User = require('../models/user');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users from the database
        res.status(200).json(users); // Return the list of users
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params; // Extract user ID from request parameters
        
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};


exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params; // Extract user ID from request parameters
        const { firstName, lastName, email, password, role, phoneNumber, address } = req.body; // Extract user data from request body

        // Find user by ID and update their information
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { firstName, lastName, email, password, role, phoneNumber, address },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params; // Extract user ID from request parameters

        // Find user by ID and delete them
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};