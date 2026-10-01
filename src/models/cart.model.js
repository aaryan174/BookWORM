import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  addedAtPrice: {
    type: Number,
    required: true
  }
}, { timestamps: true });

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  items: [cartItemSchema]
}, { timestamps: true });

export const Cart = mongoose.model('Cart', cartSchema);
