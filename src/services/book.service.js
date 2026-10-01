import { BookDAO } from '../dao/book.dao.js';
import { ListingDAO } from '../dao/listing.dao.js';
import { AppError } from '../utils/AppError.js';

export class BookService {
  static async searchBooks(query) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '12', 10);
    return await BookDAO.search({
      search: query.search,
      category: query.category,
      page,
      limit,
      sort: query.sort
    });
  }

  static async getBookById(id) {
    const book = await BookDAO.findById(id);
    if (!book) throw new AppError('Book not found', 404);
    return book;
  }

  static async getBookByIsbn(isbn) {
    const book = await BookDAO.findByIsbn13(isbn);
    if (!book) throw new AppError('Book with specified ISBN not found', 404);
    return book;
  }

  static async getBookListings(bookId) {
    await this.getBookById(bookId);
    return await ListingDAO.findActiveByBookId(bookId);
  }

  static async createBook(bookData) {
    const existing = await BookDAO.findByIsbn13(bookData.isbn13);
    if (existing) {
      throw new AppError('A book with this ISBN-13 already exists in the canonical catalog', 409);
    }
    return await BookDAO.create(bookData);
  }
}
