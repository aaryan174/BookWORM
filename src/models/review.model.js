import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
    index: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true
  }
}, { timestamps: true });

// Prevent duplicate reviews for the same book from the same buyer order
reviewSchema.index({ bookId: 1, buyerId: 1, orderId: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
