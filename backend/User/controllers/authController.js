const User = require('../models/user');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Signup
exports.signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role, phoneNumber, address } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const newUser = new User({ firstName, lastName, email, password, role, phoneNumber, address });
        await newUser.save();

        // Generate JWT token
        const token = jwt.sign({ 
            id: newUser._id,
            role: newUser.role
         }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({ token, user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token WITH ROLE included
        const token = jwt.sign({ 
            id: user._id,
            role: user.role 
        }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        res.status(200).json({ token, user });
        
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};