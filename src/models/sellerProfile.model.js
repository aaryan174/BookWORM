import mongoose from 'mongoose';

const sellerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  storeName: {
    type: String,
    required: [true, 'Store name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  gstin: {
    type: String,
    default: '',
    trim: true
  },
  panNumber: {
    type: String,
    default: '',
    trim: true
  },
  rating: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'SUSPENDED'],
    default: 'ACTIVE'
  }
}, { timestamps: true });

export const SellerProfile = mongoose.model('SellerProfile', sellerProfileSchema);
