import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  subtitle: {
    type: String,
    default: '',
    trim: true
  },
  authors: [{
    type: String,
    required: true,
    trim: true
  }],
  isbn10: {
    type: String,
    default: '',
    trim: true
  },
  isbn13: {
    type: String,
    required: [true, 'ISBN-13 is required'],
    unique: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Book description is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    index: true
  },
  genre: {
    type: String,
    default: '',
    trim: true
  },
  publisher: {
    type: String,
    required: [true, 'Publisher is required'],
    trim: true
  },
  publicationDate: {
    type: Date
  },
  edition: {
    type: String,
    default: '1st Edition',
    trim: true
  },
  language: {
    type: String,
    default: 'English',
    trim: true
  },
  coverImageUrl: {
    type: String,
    required: [true, 'Cover image URL is required']
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Full text search index
bookSchema.index({ title: 'text', authors: 'text', description: 'text', publisher: 'text' });
bookSchema.index({ category: 1, averageRating: -1 });

export const Book = mongoose.model('Book', bookSchema);
