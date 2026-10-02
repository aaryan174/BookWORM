import { StorageService } from '../services/storage.service.js';
import { sendSuccess } from '../utils/response.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { AppError } from '../utils/AppError.js';

export class StorageController {
  static uploadBookCover = asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError('No image file uploaded. Please provide a book cover image.', 400);
    }

    // Validate MIME type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      throw new AppError('Invalid file type. Only JPEG, PNG, WEBP, and AVIF are permitted.', 400);
    }

    // Max file size 5MB
    if (req.file.size > 5 * 1024 * 1024) {
      throw new AppError('Cover image size must not exceed 5MB.', 400);
    }

    const uploadResult = await StorageService.uploadImage(
      req.file.buffer,
      req.file.originalname,
      '/bookworm/covers'
    );

    return sendSuccess(res, 'Book cover image uploaded to ImageKit successfully', uploadResult, 201);
  });

  static getAuthParameters = asyncHandler(async (req, res) => {
    const authParams = StorageService.getAuthParameters();
    return sendSuccess(res, 'ImageKit authentication parameters generated', authParams);
  });
}
