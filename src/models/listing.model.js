import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
    index: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  condition: {
    type: String,
    enum: ['NEW', 'LIKE_NEW', 'VERY_GOOD', 'GOOD', 'ACCEPTABLE'],
    required: true
  },
  format: {
    type: String,
    enum: ['HARDCOVER', 'PAPERBACK', 'AUDIOBOOK', 'EBOOK'],
    default: 'PAPERBACK'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative']
  },
  images: [{
    type: String
  }],
  descriptionNotes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'SOLD_OUT'],
    default: 'ACTIVE',
    index: true
  }
}, { timestamps: true });

listingSchema.index({ bookId: 1, status: 1, price: 1 });
listingSchema.index({ sellerId: 1, status: 1 });

export const Listing = mongoose.model('Listing', listingSchema);
