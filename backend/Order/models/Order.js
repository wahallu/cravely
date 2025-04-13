const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  quantity: Number
});

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  restaurantId: {
    type: String,
    required: true
  },
  items: {
    type: [ItemSchema],
    required: [true, 'Order must have at least one item'],
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'Order must contain at least one item'
    }
  },
  customer: {
    fullName: {
      type: String,
      required: true
    },
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  payment: {
    method: {
      type: String, 
      enum: ['creditCard', 'cash'],
      required: true
    },
    cardId: String,
    paymentIntentId: String,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    amount: Number
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'canceled'],
    default: 'pending'
  },
  subtotal: Number,
  tax: Number,
  deliveryFee: Number,
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative'],
    validate: {
      validator: function(total) {
        // Ensure total matches sum of item prices
        return Math.abs(total - this.items.reduce((sum, item) => 
          sum + (item.price * item.quantity), 0)) < 0.01;
      },
      message: 'Order total does not match item prices'
    }
  },
  estimatedDeliveryTime: Date,
  specialInstructions: String,
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

// Generate a unique order ID before saving
OrderSchema.pre('save', function(next) {
  if (!this.orderId) {
    this.orderId = 'ORD-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
