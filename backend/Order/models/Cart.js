const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  restaurantId: {
    type: String,
    required: true
  },
  items: [
    {
      id: String,
      name: String,
      price: Number,
      quantity: Number,
      imageUrl: String,
      note: String,
      isFavorite: {
        type: Boolean,
        default: false
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add a pre-save hook to update the updatedAt field
CartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Cart', CartSchema);