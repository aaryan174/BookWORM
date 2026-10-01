import { Book } from '../models/book.model.js';

export class BookDAO {
  static async findById(id) {
    return await Book.findById(id);
  }

  static async findByIsbn13(isbn13) {
    return await Book.findOne({ isbn13: isbn13.trim() });
  }

  static async create(bookData) {
    return await Book.create(bookData);
  }

  static async updateRatingStats(bookId, averageRating, reviewCount) {
    return await Book.findByIdAndUpdate(bookId, { averageRating, reviewCount }, { new: true });
  }

  static async search({ search, category, page = 1, limit = 12, sort = 'newest' }) {
    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }

    if (category && category !== 'ALL') {
      filter.category = category;
    }

    const skip = (page - 1) * limit;

    let sortOption = { createdAt: -1 };
    if (sort === 'rating') sortOption = { averageRating: -1 };
    if (sort === 'title') sortOption = { title: 1 };

    const [books, total] = await Promise.all([
      Book.find(filter).sort(sortOption).skip(skip).limit(limit),
      Book.countDocuments(filter)
    ]);

    return { books, total, page, limit, pages: Math.ceil(total / limit) };
  }
}
