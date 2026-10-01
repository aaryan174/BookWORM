import { BookService } from '../services/book.service.js';
import { sendSuccess } from '../utils/response.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';

export class BookController {
  static getBooks = asyncHandler(async (req, res) => {
    const result = await BookService.searchBooks(req.query);
    return sendSuccess(res, 'Books fetched successfully', result);
  });

  static getBookById = asyncHandler(async (req, res) => {
    const book = await BookService.getBookById(req.params.id);
    return sendSuccess(res, 'Book fetched successfully', { book });
  });

  static getBookByIsbn = asyncHandler(async (req, res) => {
    const book = await BookService.getBookByIsbn(req.params.isbn);
    return sendSuccess(res, 'Book fetched successfully', { book });
  });

  static getBookListings = asyncHandler(async (req, res) => {
    const listings = await BookService.getBookListings(req.params.id);
    return sendSuccess(res, 'Active seller listings fetched', { listings });
  });

  static createBook = asyncHandler(async (req, res) => {
    const book = await BookService.createBook(req.body);
    return sendSuccess(res, 'Canonical book created successfully', { book }, 201);
  });
}
