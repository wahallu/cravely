const mongoose = require('mongoose');

/**
 * Card schema for storing payment methods
 * This model stores card information linked to users without storing sensitive card data
 * Actual payment information is stored in Stripe
 */
const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  cardholderName: {
    type: String,
    required: true
  },
  last4: {
    type: String,
    required: true
  },
  paymentMethodId: {
    type: String,
    required: true,
    unique: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Set all previous cards as non-default when a new default is set
cardSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

module.exports = mongoose.model('Card', cardSchema);