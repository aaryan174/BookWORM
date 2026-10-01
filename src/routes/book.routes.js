import { Router } from 'express';
import { BookController } from '../controllers/book.controller.js';
import { createBookValidator } from '../validators/book.validator.js';
import { authenticate, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', BookController.getBooks);
router.get('/:id', BookController.getBookById);
router.get('/isbn/:isbn', BookController.getBookByIsbn);
router.get('/:id/listings', BookController.getBookListings);

router.post('/', authenticate, requireRoles('seller', 'admin'), createBookValidator, BookController.createBook);

export default router;
