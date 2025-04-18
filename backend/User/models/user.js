const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // You'll need to install bcrypt: npm install bcrypt

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(value) {
                // Basic regex for email validation
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: 'Please provide a valid email address'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'Password should be at least 6 characters']
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'driver'],
        default: 'user',
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    address: {
        street: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        state: {
            type: String,
            trim: true
        },
        zipCode: {
            type: String,
            trim: true
        }
    },
    profileImage: {
        type: String,
        default: '/default-avatar.png'
    },
    preferences: {
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            sms: {
                type: Boolean,
                default: false
            },
            marketing: {
                type: Boolean,
                default: false
            }
        },
        favorites: [String]
    }
}, {
    timestamps: true // Automatically manage createdAt and updatedAt fields
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    // Only hash the password if it's modified (or new)
    if (!this.isModified('password')) return next();
    
    try {
        // Generate a salt with cost factor 12
        const salt = await bcrypt.genSalt(12);
        
        // Hash the password using the generated salt
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;