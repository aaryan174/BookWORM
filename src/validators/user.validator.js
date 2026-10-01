import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validator.middleware.js';

export const addressValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('streetAddress').trim().notEmpty().withMessage('Street address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('postalCode').trim().notEmpty().withMessage('Postal code is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  validateRequest
];

export const updateProfileValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
  body('avatarUrl').optional().trim().isURL().withMessage('Avatar URL must be a valid URL'),
  validateRequest
];
