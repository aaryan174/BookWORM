import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    return next(new AppError('Validation failed', 400, formattedErrors));
  }
  next();
};
