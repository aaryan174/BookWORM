import { Router } from 'express';
import multer from 'multer';
import { StorageController } from '../controllers/storage.controller.js';
import { authenticate, requireRoles } from '../middlewares/auth.middleware.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const router = Router();

// Endpoint for client-side direct auth parameters
router.get('/auth', authenticate, StorageController.getAuthParameters);

// Endpoint for server-side ImageKit book cover upload (Authenticated users)
router.post(
  '/upload',
  authenticate,
  upload.single('coverImage'),
  StorageController.uploadBookCover
);

export default router;
